const GOOGLE_MAPS_API_KEY =
    "AIzaSyAMvyVnmeVLrnbToSkyje2rToL5VMhIfAI";

const evenings = [
    {
        number: 1,
        date: "2027-05-12",
        startTime: "18:30",
        endTime: "21:00",
        routes: {
            "5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Buurtweg 135, 2244 BH Wassenaar"
            },
            "2.5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag"
            }
        }
    },
    {
        number: 2,
        date: "2027-05-13",
        startTime: "18:30",
        endTime: "21:00",
        routes: {
            "5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag"
            },
            "2.5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag"
            }
        }
    },
    {
        number: 3,
        date: "2027-05-14",
        startTime: "18:30",
        endTime: "21:00",
        routes: {
            "5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag"
            },
            "2.5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag"
            }
        }
    },
    {
        number: 4,
        date: "2027-05-15",
        startTime: "18:30",
        endTime: "21:00",
        routes: {
            "5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag"
            },
            "2.5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag"
            }
        }
    }
];

let selectedEvening = 0;

function routeTemplate(evening, distance, route, mapId) {
    const label = distance === "2.5" ? "2,5 km" : "5 km";

    return `
        <section class="route-option" data-distance="${distance}">
            <div class="route-option-header">
                <h3>Route ${label}</h3>
                <span class="route-distance-badge">${label}</span>
            </div>

            <div class="route-option-fields">
                <label>
                    Startlocatie
                    <input
                        class="route-start"
                        value="${route.start}"
                        placeholder="Typ hier de startlocatie...">
                </label>

                <label>
                    Eindlocatie
                    <input
                        class="route-end"
                        value="${route.end}"
                        placeholder="Typ hier de eindlocatie...">
                </label>

                <label>
                    Korte beschrijving
                    <input
                        class="route-short-description"
                        type="text"
                        placeholder="Typ hier een korte beschrijving...">
                </label>

                <label>
                    Routebeschrijving
                    <textarea
                        class="route-description"
                        placeholder="Geef hier een uitgebreide beschrijving van de route..."></textarea>
                </label>
            </div>

            <div
                class="route-map"
                id="${mapId}"
                aria-label="Kaart route ${label}, avond ${evening.number}">
            </div>

            <button
                class="route-option-button"
                type="button">
                Route op kaart tonen
            </button>
        </section>
    `;
}

function eveningTemplate(evening) {
    const mapId5 = `map-evening-${evening.number}-5`;
    const mapId25 = `map-evening-${evening.number}-25`;

    return `
        <article class="card evening-card" data-evening="${evening.number}">
            <div class="route-header">
                <span class="day-number">${evening.number}</span>
                <div>
                    <h2>Avond ${evening.number}</h2>
                    <p>Stel beide afstanden voor deze avond in.</p>
                </div>
            </div>

            <div class="evening-settings">
                <label>
                    Datum
                    <input class="evening-date" type="date" value="${evening.date}">
                </label>

                <label>
                    Starttijd
                    <input class="evening-start-time" type="time" value="${evening.startTime}">
                </label>

                <label>
                    Eindtijd
                    <input class="evening-end-time" type="time" value="${evening.endTime}">
                </label>
            </div>

            <div class="route-options">
                ${routeTemplate(evening, "2.5", evening.routes["2.5"], mapId25)}
                ${routeTemplate(evening, "5", evening.routes["5"], mapId5)}
            </div>
        </article>
    `;
}

function renderEvenings() {
    const container = document.querySelector("#route-grid");

    if (!container) {
        return;
    }

    const evening = evenings[selectedEvening];

    container.innerHTML = `
        <div class="eveningSelector" aria-label="Avond selecteren">
            <button
                class="eveningArrow"
                id="previous-evening"
                type="button"
                aria-label="Vorige avond">
                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>

            <div class="eveningSelectorContent">
                <small>Routebeheer</small>
                <strong>Avond ${evening.number} van 4</strong>
                <span>${evening.date} · ${evening.startTime} - ${evening.endTime}</span>
            </div>

            <button
                class="eveningArrow"
                id="next-evening"
                type="button"
                aria-label="Volgende avond">
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
        </div>

        ${eveningTemplate(evening)}
    `;

    const previousButton = document.querySelector("#previous-evening");
    const nextButton = document.querySelector("#next-evening");

    previousButton.disabled = selectedEvening === 0;
    nextButton.disabled = selectedEvening === evenings.length - 1;

    previousButton.addEventListener("click", () => {
        if (selectedEvening > 0) {
            selectedEvening -= 1;
            renderEvenings();
        }
    });

    nextButton.addEventListener("click", () => {
        if (selectedEvening < evenings.length - 1) {
            selectedEvening += 1;
            renderEvenings();
        }
    });

    container.querySelectorAll(".route-option-button").forEach((button) => {
        button.addEventListener("click", () => {
            showRoute(button.closest(".route-option"));
        });
    });

    document
        .querySelectorAll(".route-option input, .route-option textarea")
        .forEach((field) => {
            field.addEventListener("input", () => {
                const button = field
                    .closest(".route-option")
                    .querySelector(".route-option-button");

                if (!button.disabled) {
                    button.textContent = "Route op kaart tonen";
                }
            });
        });
}

function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google?.maps?.importLibrary) {
            resolve();
            return;
        }

        window.__initGoogleMaps = resolve;

        const script = document.createElement("script");
        script.src =
            `https://maps.googleapis.com/maps/api/js` +
            `?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` +
            "&v=weekly&loading=async&callback=__initGoogleMaps";
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(
            new Error("Google Maps kon niet worden geladen.")
        );

        document.head.appendChild(script);
    });
}

const mapInstances = new Map();

async function showRoute(routeOption) {
    const button = routeOption.querySelector(".route-option-button");
    const mapElement = routeOption.querySelector(".route-map");
    const origin = routeOption.querySelector(".route-start").value.trim();
    const destination = routeOption.querySelector(".route-end").value.trim();

    if (!origin || !destination) {
        button.textContent = "Vul start en einde in";
        return;
    }

    button.disabled = true;
    button.textContent = "Route laden...";

    try {
        await loadGoogleMaps();

        const { Map, Polyline } = await google.maps.importLibrary("maps");
        const { Route } = await google.maps.importLibrary("routes");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        let map = mapInstances.get(mapElement.id);

        if (!map) {
            map = new Map(mapElement, {
                center: { lat: 52.095, lng: 4.334 },
                zoom: 13,
                mapId: "DEMO_MAP_ID",
                mapTypeId: "roadmap",
                renderingType: "VECTOR"
            });

            mapInstances.set(mapElement.id, map);
        }

        const result = await Route.computeRoutes({
            origin,
            destination,
            travelMode: "WALKING",
            fields: ["path", "viewport", "legs"]
        });

        if (!result.routes?.length) {
            throw new Error("Geen wandelroute gevonden.");
        }

        const route = result.routes[0];
        const firstLeg = route.legs[0];

        map.__routeOverlays?.forEach((overlay) => {
            overlay.map = null;
        });

        map.__routeOverlays = [
            new Polyline({
                map,
                path: route.path,
                strokeOpacity: 0,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: "#405624",
                        fillOpacity: 1,
                        strokeColor: "#405624",
                        strokeOpacity: 1,
                        scale: 2
                    },
                    offset: "0",
                    repeat: "10px"
                }]
            }),
            new AdvancedMarkerElement({
                map,
                position: firstLeg.startLocation,
                title: "Startpunt"
            }),
            new AdvancedMarkerElement({
                map,
                position: firstLeg.endLocation,
                title: "Eindpunt"
            })
        ];

        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        button.disabled = false;
        button.textContent = "Route openen in Google Maps";
        button.onclick = () => {
            const url = new URL("https://www.google.com/maps/dir/");
            url.search = new URLSearchParams({
                api: "1",
                origin,
                destination,
                travelmode: "walking"
            }).toString();
            window.open(url.href, "_blank", "noopener,noreferrer");
        };
    } catch (error) {
        console.error("Routefout:", error);
        button.disabled = false;
        button.textContent = "Route kon niet worden geladen";
    }
}

document.addEventListener("DOMContentLoaded", renderEvenings);