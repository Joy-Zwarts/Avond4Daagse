document.addEventListener("DOMContentLoaded", () => {
  const scheduleData = {
    "2027-04-26": [
      null, null, null,
      { title: "Verken regelaar Avond4daagse", detail: "Tesselsestraat 84 kruispunt · 18:30 - 18:45" },
      null, null, null
    ],
    "2027-05-03": [
      { title: "Materiaal ophalen", detail: "Opslag AVD · 09:00 - 10:00" },
      null,
      { title: "Routecontrole 5 km", detail: "Startlocatie · 18:30 - 19:30" },
      null, null, null, null
    ],
    "2027-05-10": [
      null,
      { title: "Instructie vrijwilligers", detail: "Wijkcentrum · 19:00 - 20:30" },
      null, null,
      { title: "Avond4daagse – dag 1", detail: "Malieveld · 17:00 - 21:00" },
      { title: "Avond4daagse – dag 2", detail: "Malieveld · 17:00 - 21:00" },
      null
    ]
  };

  const todoData = [
    { id: "certificate", title: "Certificaat", detail: "Voeg je certificaat toe op de Mijn Account-pagina.", done: true },
    { id: "photo", title: "Profielfoto", detail: "Voeg een profielfoto toe op de Mijn Account-pagina.", done: false },
    { id: "password", title: "Wachtwoord", detail: "Verander je OTP met je eigen wachtwoord.", done: true }
  ];

  const agenda = document.querySelector(".agenda");
  const todo = document.querySelector(".todo");
  const names = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  let weekStart = new Date(2027, 3, 26);

  const monday = (date) => {
    const value = new Date(date);
    const day = value.getDay() || 7;
    value.setDate(value.getDate() - day + 1);
    value.setHours(0, 0, 0, 0);
    return value;
  };

  const keyFor = (date) => date.toISOString().slice(0, 10);
  const formatRange = (start) => {
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const formatter = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long" });
    return `${formatter.format(start)} - ${formatter.format(end)} ${end.getFullYear()}`;
  };

  function renderAgenda() {
    const events = scheduleData[keyFor(weekStart)] || [];
    agenda.innerHTML = `
      <div class="schedule-navigation">
        <button class="button" type="button" data-week="-1">‹ Vorige week</button>
        <h2>Agenda ${formatRange(weekStart)}</h2>
        <button class="button" type="button" data-week="1">Volgende week ›</button>
      </div>`;

    names.forEach((name, index) => {
      const date = new Date(weekStart); date.setDate(date.getDate() + index);
      const event = events[index];
      const item = document.createElement("div");
      item.innerHTML = `
        <div class="daybar">${name}</div>
        <div class="agenda-day">
          <b>${date.getDate()}</b>
          ${event
            ? `<span>${event.title}</span><span class="muted">${event.detail}</span>`
            : '<span class="muted">Geen activiteiten</span>'}
        </div>`;
      agenda.append(item);
    });

    agenda.querySelectorAll("[data-week]").forEach((button) => {
      button.addEventListener("click", () => {
        weekStart.setDate(weekStart.getDate() + Number(button.dataset.week) * 7);
        renderAgenda();
      });
    });
  }

  function getTodos() {
    try { return JSON.parse(localStorage.getItem("mijnSchemaTodos")) || todoData; }
    catch { return todoData; }
  }

  function renderTodos() {
    const todos = getTodos();
    todo.innerHTML = "<h2>To-do list</h2>";
    todos.forEach((item) => {
      const row = document.createElement("label");
      row.className = "todo-item";
      row.innerHTML = `
        <input type="checkbox" data-id="${item.id}" ${item.done ? "checked" : ""} aria-label="${item.title}">
        <div><b>${item.title}</b><span class="muted">${item.detail}</span></div>`;
      todo.append(row);
    });

    todo.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const updated = getTodos().map((item) =>
          item.id === checkbox.dataset.id ? { ...item, done: checkbox.checked } : item
        );
        localStorage.setItem("mijnSchemaTodos", JSON.stringify(updated));
      });
    });
  }

  weekStart = monday(weekStart);
  renderAgenda();
  renderTodos();
});