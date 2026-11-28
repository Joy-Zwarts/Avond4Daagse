const locaties = [
    {
        naam: "Avond4Daagse Den Haag",
        zoektermen: "den haag zuid-holland",
        pagina: {
            deelnemer: "Deelnemers pagina's/homeDeelnemers.html",
            school: "Pagina's voor scholen/inlogpaginaScholen.html",
            organisator: "Medewerkersportaal/inlogpaginaMedewerkers.html"
        }
    },
    {
        naam: "Avond4Daagse Delft",
        zoektermen: "delft zuid-holland",
        pagina: {
            deelnemer: "https://www.delfshaven4daagse.nl/",
            school: "https://www.delfshaven4daagse.nl/",
            organisator: "https://www.delfshaven4daagse.nl/"
        }
    },
    {
        naam: "Avond4Daagse Amsterdam",
        zoektermen: "amsterdam noord-holland",  
        pagina: {
            deelnemer: "https://www.avond4daagse.nl/agenda/avondvierdaagse-amsterdam-oost/",
            school: "https://www.avond4daagse.nl/agenda/avondvierdaagse-amsterdam-oost/",
            organisator: "https://www.avond4daagse.nl/agenda/avondvierdaagse-amsterdam-oost/"
        }
    }
];

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");
const message = document.getElementById("message");
const deelnemerButton = document.getElementById("deelnemerButton");
const schoolButton = document.getElementById("schoolButton");
const organisatorButton = document.getElementById("organisatorButton");

let geselecteerdeLocatie = null;

function zoekLocaties() {
    const zoekterm = searchInput.value.trim().toLowerCase();
    results.innerHTML = "";
    message.textContent = "";
    geselecteerdeLocatie = null;

    if (!zoekterm) {
        results.style.display = "none";
        message.textContent = "Vul eerst een plaats of regio in.";
        return;
    }

    const gevondenLocaties = locaties.filter((locatie) =>
        `${locatie.naam} ${locatie.zoektermen}`
            .toLowerCase()
            .includes(zoekterm)
    );

    if (gevondenLocaties.length === 0) {
        results.style.display = "none";
        message.textContent = "Geen Avond4Daagse gevonden.";
        return;
    }

    gevondenLocaties.forEach((locatie) => {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.className = "location-button";
        button.textContent = locatie.naam;

        button.addEventListener("click", () => {
            document.querySelectorAll(".location-button").forEach((item) => {
                item.classList.remove("selected");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");

            geselecteerdeLocatie = locatie;
            searchInput.value = locatie.naam;
            message.textContent = "";
        });

        li.appendChild(button);
        results.appendChild(li);
    });

    results.style.display = "flex";
}

function gaNaarPagina(type) {
    if (!geselecteerdeLocatie) {
        message.textContent = "Selecteer eerst een regio.";
        return;
    }

    const pagina = geselecteerdeLocatie.pagina[type];
    window.location.href = pagina;
}

searchButton.addEventListener("click", zoekLocaties);
searchInput.addEventListener("input", zoekLocaties);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        zoekLocaties();
    }
});

deelnemerButton.addEventListener("click", () => gaNaarPagina("deelnemer"));
schoolButton.addEventListener("click", () => gaNaarPagina("school"));
organisatorButton.addEventListener("click", () => gaNaarPagina("organisator"));