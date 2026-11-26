document.addEventListener("DOMContentLoaded", () => {
  const routeCards = document.querySelectorAll(".route");

  const mapUrl = (start, end) => {
    const query = encodeURIComponent(`${start || "Den Haag"}, ${end || "Den Haag"}`);
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  routeCards.forEach((card) => {
    const startInput = card.querySelector('input[id^="start-location"]');
    const endInput = card.querySelector('input[id^="end-location"]');
    const map = card.querySelector(".map");
    const mapsButton = card.querySelector(".button");
    const routeName = card.querySelector("h2").textContent;
    const storageKey = `routevoorzieningen-${routeName}`;

    const iframe = document.createElement("iframe");
    iframe.title = `Google Maps: ${routeName}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.style.cssText = "width:100%;height:100%;min-height:250px;border:0;border-radius:inherit;";
    map.append(iframe);

    const updateMap = () => {
      iframe.src = mapUrl(startInput.value.trim(), endInput.value.trim());
    };
    startInput.addEventListener("change", updateMap);
    endInput.addEventListener("change", updateMap);
    updateMap();

    mapsButton.addEventListener("click", () => {
      const origin = encodeURIComponent(startInput.value.trim() || "Den Haag");
      const destination = encodeURIComponent(endInput.value.trim() || "Den Haag");
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, "_blank", "noopener");
    });

    const section = document.createElement("section");
    section.className = "voorzieningen";
    section.innerHTML = `
      <h3>Voorzieningen</h3>
      <div class="voorzieningen-list"></div>
      <div>
        <input class="input voorziening-input" placeholder="Bijv. EHBO-post, toilet of waterpunt">
        <button class="button" type="button">Voorziening toevoegen</button>
      </div>`;
    card.append(section);

    const list = section.querySelector(".voorzieningen-list");
    const input = section.querySelector(".voorziening-input");
    const addButton = section.querySelector("button");

    const getItems = () => {
      try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
      catch { return []; }
    };
    const render = () => {
      const items = getItems();
      list.innerHTML = items.length
        ? items.map((item, index) => `<p>${item} <button type="button" data-remove="${index}" aria-label="Verwijder ${item}">×</button></p>`).join("")
        : "<p>Nog geen voorzieningen toegevoegd.</p>";
      list.querySelectorAll("[data-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const items = getItems();
          items.splice(Number(button.dataset.remove), 1);
          localStorage.setItem(storageKey, JSON.stringify(items));
          render();
        });
      });
    };

    addButton.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      const items = getItems();
      items.push(value);
      localStorage.setItem(storageKey, JSON.stringify(items));
      input.value = "";
      render();
    });
    render();
  });
});