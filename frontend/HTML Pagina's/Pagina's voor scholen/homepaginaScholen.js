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
                end: "Buurtweg 135, 2244 BH Wassenaar",
                shortDescription: "Wandelroute van het Malieveld naar Wassenaar.",
                description: "De route start op het Malieveld en loopt via verschillende wandelpaden richting de eindlocatie in Wassenaar.",
                steps: [
                    "Start bij het Malieveld.",
                    "Loop richting de Koningskade.",
                    "Volg de routeborden voor 5 km.",
                    "Steek alleen over op de aangewezen oversteekplaatsen.",
                    "Volg de aanwijzingen van de verkeersregelaars.",
                    "Loop door tot de eindlocatie in Wassenaar."
                ]
            },
            "2.5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                shortDescription: "Korte ronde rondom het Malieveld.",
                description: "Deze route begint en eindigt op het Malieveld en is geschikt voor deelnemers die de korte afstand lopen.",
                steps: [
                    "Start bij het Malieveld.",
                    "Loop richting de Koningskade.",
                    "Volg de groene routeborden voor 2,5 km.",
                    "Steek alleen over op de aangewezen oversteekplaatsen.",
                    "Volg de aanwijzingen van de verkeersregelaars.",
                    "Loop door tot de eindlocatie bij het Malieveld."
                ]
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
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag",
                shortDescription: "Route door Bezuidenhout.",
                description: "De route voert vanaf de Bezuidenhoutseweg door de omgeving van Bezuidenhout naar de eindlocatie."
            },
            "2.5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag",
                shortDescription: "Korte route door Bezuidenhout.",
                description: "Een kortere wandelroute door Bezuidenhout met dezelfde start- en eindlocatie als de lange route."
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
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                shortDescription: "Grote ronde vanaf het Malieveld.",
                description: "De route maakt een langere ronde door Den Haag en eindigt opnieuw op het Malieveld."
            },
            "2.5": {
                start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                end: "Malieveld, Koningskade 64, 2596 AA Den Haag",
                shortDescription: "Korte ronde vanaf het Malieveld.",
                description: "De route blijft dichter bij het Malieveld en is bedoeld voor de korte afstand."
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
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag",
                shortDescription: "Feestelijke slotroute door Bezuidenhout.",
                description: "De laatste route van de Avond4daagse loopt door Bezuidenhout en eindigt bij de gezamenlijke finish."
            },
            "2.5": {
                start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
                end: "Bezuidenhoutseweg 452, 2594 BE Den Haag",
                shortDescription: "Korte feestelijke slotroute.",
                description: "Een korte slotroute door Bezuidenhout naar de gezamenlijke finishlocatie."
            }
        }
    }
];

let selectedEvening = 0;
const mapInstances = new Map();

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(date) {
    return new Intl.DateTimeFormat("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(`${date}T12:00:00`));
}

function routeTemplate(evening, distance, route) {
    const label = distance === "2.5" ? "2,5 km" : "5 km";
    const mapId = `school-map-${evening.number}-${distance.replace(".", "-")}`;

    const steps = route.steps || [route.description];

    return `
        <section class="route-card school-route-card">
            <div class="school-route-title">
                <span class="route-title-icon"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></span>
                <h2>Avond ${evening.number} · ${label}</h2>
            </div>

            <p class="school-route-summary">${escapeHtml(route.shortDescription)}</p>

            <div class="school-route-body">
                <aside class="school-route-details">
                    <div class="route-detail-box">
                        <strong><i class="fa-regular fa-calendar" aria-hidden="true"></i> Datum &amp; tijd</strong>
                        <small>${formatDate(evening.date)}<br>${evening.startTime} - ${evening.endTime}</small>
                    </div>
                    <div class="route-detail-box">
                        <strong><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Afstand</strong>
                        <small>${label}</small>
                    </div>
                    <div class="route-detail-box">
                        <strong><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Startlocatie</strong>
                        <small>${escapeHtml(route.start)}</small>
                    </div>
                    <div class="route-detail-box">
                        <strong><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Eindlocatie</strong>
                        <small>${escapeHtml(route.end)}</small>
                    </div>
                </aside>

                <div class="route-content">
                    <div class="route-preview" id="preview-${mapId}">
                        <h3>Routebeschrijving</h3>
                        <ol class="route-steps">
                            ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                        </ol>
                        <p class="route-legend"><strong>Let op:</strong> volg altijd de routeborden en aanwijzingen van de verkeersregelaars.</p>
                    </div>
                    <div id="${mapId}" class="school-route-map" hidden aria-label="Kaart van route ${label}, avond ${evening.number}"></div>
                </div>
            </div>

            <button class="route-map-button" type="button" data-map-id="${mapId}">
                Bekijk route op kaart
            </button>
        </section>
    `;
}

function eveningTemplate(evening) {
    return `
        <section class="school-evening" aria-labelledby="evening-title-${evening.number}">
            <div class="school-evening-header">
                <div>
                    <h2 id="evening-title-${evening.number}">Avond ${evening.number}</h2>
                    <p>${formatDate(evening.date)} · ${evening.startTime} - ${evening.endTime}</p>
                </div>
                <span class="evening-badge">Avond ${evening.number} van 4</span>
            </div>
            <div class="school-route-grid">
                ${routeTemplate(evening, "5", evening.routes["5"])}
                ${routeTemplate(evening, "2.5", evening.routes["2.5"])}
            </div>
        </section>
    `;
}

function render() {
    const container = document.querySelector("#route-grid");
    if (!container) return;

    const evening = evenings[selectedEvening];
    container.innerHTML = `
        <div class="evening-selector" aria-label="Avond selecteren">
            <button class="evening-arrow" id="previous-evening" type="button" aria-label="Vorige avond">←</button>
            <div class="evening-selector-content">
                <span>Avond selecteren</span>
                <strong>Avond ${evening.number} van 4</strong>
            </div>
            <button class="evening-arrow" id="next-evening" type="button" aria-label="Volgende avond">→</button>
        </div>
        ${eveningTemplate(evening)}
    `;

    document.querySelector("#previous-evening").disabled = selectedEvening === 0;
    document.querySelector("#next-evening").disabled = selectedEvening === evenings.length - 1;

    document.querySelector("#previous-evening").addEventListener("click", () => {
        selectedEvening -= 1;
        render();
    });

    document.querySelector("#next-evening").addEventListener("click", () => {
        selectedEvening += 1;
        render();
    });

    document.querySelectorAll(".route-map-button").forEach((button) => {
        button.addEventListener("click", () => showRoute(button));
    });
}

function loadGoogleMaps() {
    if (window.google?.maps?.importLibrary) return Promise.resolve();
    if (window.__googleMapsPromise) return window.__googleMapsPromise;

    window.__googleMapsPromise = new Promise((resolve, reject) => {
        window.__initGoogleMaps = resolve;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&callback=__initGoogleMaps`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Google Maps kon niet worden geladen."));
        document.head.appendChild(script);
    });

    return window.__googleMapsPromise;
}

async function showRoute(button) {
    const routeCard = button.closest(".school-route-card");
    const routeMap = routeCard.querySelector(".school-route-map");
    const routePreview = routeCard.querySelector(".route-preview");
    const routeTitle = routeCard.querySelector("h2").textContent;
    const distance = routeTitle.includes("2,5") ? "2.5" : "5";
    const evening = evenings[selectedEvening];
    const route = evening.routes[distance];

    button.disabled = true;
    button.textContent = "Route laden...";

    try {
        await loadGoogleMaps();
        const { Map, Polyline } = await google.maps.importLibrary("maps");
        const { Route } = await google.maps.importLibrary("routes");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        let map = mapInstances.get(routeMap.id);
        if (!map) {
            map = new Map(routeMap, {
                center: { lat: 52.095, lng: 4.334 },
                zoom: 13,
                mapId: "DEMO_MAP_ID",
                mapTypeId: "roadmap",
                renderingType: "VECTOR"
            });
            mapInstances.set(routeMap.id, map);
        }

        const result = await Route.computeRoutes({
            origin: route.start,
            destination: route.end,
            travelMode: "WALKING",
            fields: ["path", "viewport", "legs"]
        });

        if (!result.routes?.length) throw new Error("Geen wandelroute gevonden.");

        const computedRoute = result.routes[0];
        const firstLeg = computedRoute.legs[0];
        map.__routeOverlays?.forEach((overlay) => overlay.map = null);

        map.__routeOverlays = [
            new Polyline({
                map,
                path: computedRoute.path,
                strokeOpacity: 0,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: "#5e751c",
                        fillOpacity: 1,
                        strokeColor: "#5e751c",
                        strokeOpacity: 1,
                        scale: 2
                    },
                    offset: "0",
                    repeat: "10px"
                }]
            }),
            new AdvancedMarkerElement({ map, position: firstLeg.startLocation, title: "Startpunt" }),
            new AdvancedMarkerElement({ map, position: firstLeg.endLocation, title: "Eindpunt" })
        ];

        if (computedRoute.viewport) map.fitBounds(computedRoute.viewport);

        routePreview.hidden = true;
        routeMap.hidden = false;
        button.disabled = false;
        button.textContent = "Open route in Google Maps";
        button.onclick = () => {
            const url = new URL("https://www.google.com/maps/dir/");
            url.search = new URLSearchParams({
                api: "1",
                origin: route.start,
                destination: route.end,
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

document.addEventListener("DOMContentLoaded", render);
