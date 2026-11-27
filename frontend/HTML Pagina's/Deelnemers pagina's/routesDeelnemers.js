const GOOGLE_MAPS_API_KEY =
    "AIzaSyAMvyVnmeVLrnbToSkyje2rToL5VMhIfAI";

const routeData = [
    {
        evening: 1,
        date: "12 mei 2027",
        time: "18:30 - 21:00",
        distance: "5 km",
        start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
        end: "Buurtweg 135, 2244 BH Wassenaar",
        note: "Een langer parcours door parken en rustige woonwijken.",
        directions: [
            "Start bij het Malieveld en loop richting de Koningskade.",
            "Volg de routeborden richting de rustige woonwijken.",
            "Loop rechtdoor bij de aangegeven kruispunten.",
            "Volg de aanwijzingen van de verkeersregelaars.",
            "Ga verder richting de Buurtweg.",
            "Meld je bij de eindlocatie voor de eindstempel."
        ]
    },
    {
        evening: 1,
        date: "12 mei 2027",
        time: "18:30 - 21:00",
        distance: "2,5 km",
        start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
        end: "Korte Vijverberg 2, 2511 AB Den Haag",
        note: "Een compact parcours voor een fijne, korte wandeling.",
        directions: [
            "Start bij het Malieveld.",
            "Loop richting de Koningskade.",
            "Volg de groene routeborden voor 2,5 km.",
            "Steek alleen over op de aangewezen oversteekplaatsen.",
            "Volg de aanwijzingen van de verkeersregelaars.",
            "Loop door tot de eindlocatie bij de Korte Vijverberg."
        ]
    },
    {
        evening: 2,
        date: "13 mei 2027",
        time: "18:30 - 21:00",
        distance: "5 km",
        start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
        end: "Bezuidenhoutseweg 452, 2594 BE Den Haag",
        note: "Een route door de wijken rondom Bezuidenhout.",
        directions: [
            "Start bij de Bezuidenhoutseweg 89.",
            "Volg de routeborden richting het Haagse Bos.",
            "Loop rechtdoor tot aan de aangegeven kruising.",
            "Sla rechtsaf waar de verkeersregelaar dit aangeeft.",
            "Volg de route door de wijk.",
            "Eindig bij de Bezuidenhoutseweg 452."
        ]
    },
    {
        evening: 2,
        date: "13 mei 2027",
        time: "18:30 - 21:00",
        distance: "2,5 km",
        start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
        end: "Haagse Bos, Den Haag",
        note: "Een kortere route voor deelnemers die minder ver willen wandelen.",
        directions: [
            "Start bij de Bezuidenhoutseweg 89.",
            "Volg de routeborden voor 2,5 km.",
            "Loop richting het Haagse Bos.",
            "Steek over op de aangewezen oversteekplaats.",
            "Volg het pad tot aan de eindlocatie.",
            "Haal de eindstempel bij de organisatie."
        ]
    },
    {
        evening: 3,
        date: "14 mei 2027",
        time: "18:30 - 21:00",
        distance: "5 km",
        start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
        end: "Plein 29, 2511 CS Den Haag",
        note: "Een afwisselende route door het centrum van Den Haag.",
        directions: [
            "Start bij het Malieveld.",
            "Loop richting de Koningskade.",
            "Volg de route langs de aangegeven straten.",
            "Ga rechtdoor bij de kruispunten met verkeersregelaars.",
            "Sla rechtsaf richting het centrum.",
            "Volg de route tot aan het Plein."
        ]
    },
    {
        evening: 3,
        date: "14 mei 2027",
        time: "18:30 - 21:00",
        distance: "2,5 km",
        start: "Malieveld, Koningskade 64, 2596 AA Den Haag",
        end: "Lange Voorhout, Den Haag",
        note: "Een korte stadsroute met duidelijke herkenningspunten.",
        directions: [
            "Start bij het Malieveld.",
            "Loop richting de Koningskade.",
            "Volg de routeborden richting het Lange Voorhout.",
            "Steek over bij de aangewezen oversteekplaats.",
            "Volg het wandelpad langs de bomen.",
            "Eindig bij het Lange Voorhout."
        ]
    },
    {
        evening: 4,
        date: "15 mei 2027",
        time: "18:30 - 21:00",
        distance: "5 km",
        start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
        end: "Malieveld, Koningskade 64, 2596 AA Den Haag",
        note: "De feestelijke slotroute van de Avond4Daagse.",
        directions: [
            "Start bij de Bezuidenhoutseweg 89.",
            "Volg de routeborden richting het centrum.",
            "Loop rechtdoor bij de aangegeven kruispunten.",
            "Volg de aanwijzingen van de verkeersregelaars.",
            "Ga richting de Koningskade.",
            "Loop terug naar het Malieveld voor de finish."
        ]
    },
    {
        evening: 4,
        date: "15 mei 2027",
        time: "18:30 - 21:00",
        distance: "2,5 km",
        start: "Bezuidenhoutseweg 89, 2594 AC Den Haag",
        end: "Haagse Bos, Den Haag",
        note: "Een korte slotroute voor alle deelnemers.",
        directions: [
            "Start bij de Bezuidenhoutseweg 89.",
            "Volg de borden voor de route van 2,5 km.",
            "Loop richting het Haagse Bos.",
            "Steek over bij de aangewezen oversteekplaats.",
            "Volg het pad richting de finish.",
            "Haal de laatste eindstempel van de Avond4Daagse."
        ]
    }
];

let selectedEvening = 1;
const mapInstances = new Map();
let googleMapsPromise = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function createDirections(route) {
    return `
        <div class="routePreview">
            <h4>Routebeschrijving</h4>
            <ol>
                ${route.directions.map((direction) => `
                    <li>${escapeHtml(direction)}</li>
                `).join("")}
            </ol>
            <p class="routeLegend">
                <strong>RA</strong> = rechtsaf ·
                <strong>LA</strong> = linksaf ·
                <strong>RD</strong> = rechtdoor ·
                <strong>VR</strong> = verkeersregelaar
            </p>
        </div>
    `;
}

function createRouteCard(route, routeIndex) {
    const mapId = `route-map-${routeIndex}`;

    return `
        <div class="routeEntry">
            <article class="routeCard">
                <section class="cardTop">
                    <span class="iconTitle">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <h3>Avond ${route.evening} · ${escapeHtml(route.distance)}</h3>
                    </span>
                    <p>${escapeHtml(route.note)}</p>
                </section>

                <div class="cardMiddle">
                    <div class="informatieBlok">
                        <section>
                            <span class="iconTitle">
                                <i class="fa-regular fa-calendar"></i>
                                <h4>Datum &amp; tijd</h4>
                            </span>
                            <p>${escapeHtml(route.date)}<br>${escapeHtml(route.time)}</p>
                        </section>
                        <section>
                            <span class="iconTitle">
                                <i class="fa-solid fa-circle-info"></i>
                                <h4>Afstand</h4>
                            </span>
                            <p>${escapeHtml(route.distance)}</p>
                        </section>
                        <section>
                            <span class="iconTitle">
                                <i class="fa-solid fa-location-dot"></i>
                                <h4>Startlocatie</h4>
                            </span>
                            <p>${escapeHtml(route.start)}</p>
                        </section>
                        <section>
                            <span class="iconTitle">
                                <i class="fa-solid fa-location-dot"></i>
                                <h4>Eindlocatie</h4>
                            </span>
                            <p>${escapeHtml(route.end)}</p>
                        </section>
                    </div>

                    <div class="routeContent">
                        ${createDirections(route)}
                        <div class="routeMap" id="${mapId}" aria-label="Kaart van avond ${route.evening}, ${route.distance}" hidden></div>
                    </div>
                </div>
            </article>

            <button class="routeButton" type="button" data-route-index="${routeIndex}">
                Bekijk route op kaart
            </button>
        </div>
    `;
}

function renderRoutes() {
    const cards = document.querySelector("#cards");
    if (!cards) return;

    const routesForEvening = routeData
        .map((route, index) => ({ route, index }))
        .filter(({ route }) => route.evening === selectedEvening);

    cards.innerHTML = `
        <div class="eveningSelector" aria-label="Avond selecteren">
            <button
                class="eveningArrow"
                id="previousEvening"
                type="button"
                aria-label="Vorige avond"
                ${selectedEvening === 1 ? "disabled" : ""}>
                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>

            <div class="eveningSelectorContent" aria-live="polite">
                <span>Routes bekijken</span>
                <strong>Avond ${selectedEvening} van 4</strong>
                <small>${escapeHtml(routesForEvening[0].route.date)}</small>
            </div>

            <button
                class="eveningArrow"
                id="nextEvening"
                type="button"
                aria-label="Volgende avond"
                ${selectedEvening === 4 ? "disabled" : ""}>
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
        </div>

        <div class="eveningGroup">
            ${routesForEvening
                .map(({ route, index }) => createRouteCard(route, index))
                .join("")}
        </div>
    `;

    document.querySelector("#previousEvening")?.addEventListener("click", () => {
        if (selectedEvening > 1) {
            selectedEvening -= 1;
            renderRoutes();
            document.querySelector("#cards")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    document.querySelector("#nextEvening")?.addEventListener("click", () => {
        if (selectedEvening < 4) {
            selectedEvening += 1;
            renderRoutes();
            document.querySelector("#cards")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    cards.querySelectorAll(".routeButton").forEach((button) => {
        button.addEventListener("click", () => {
            const routeIndex = Number(button.dataset.routeIndex);
            showRoute(routeData[routeIndex], button, routeIndex);
        });
    });
}

function loadGoogleMaps() {
    if (window.google?.maps?.importLibrary) return Promise.resolve();
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        const callbackName = "__initRoutesGoogleMaps";

        window[callbackName] = () => {
            delete window[callbackName];
            resolve();
        };

        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js" +
            `?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}` +
            "&v=weekly&loading=async" +
            `&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Google Maps kon niet worden geladen."));
        document.head.appendChild(script);
    });

    return googleMapsPromise;
}

async function showRoute(route, button, routeIndex) {
    const routeEntry = button.closest(".routeEntry");
    const routePreview = routeEntry.querySelector(".routePreview");
    const mapElement = document.querySelector(`#route-map-${routeIndex}`);

    button.disabled = true;
    button.textContent = "Route laden...";

    try {
        await loadGoogleMaps();

        const { Map: GoogleMap, Polyline } =
            await google.maps.importLibrary("maps");
        const { Route } = await google.maps.importLibrary("routes");
        const { AdvancedMarkerElement } =
            await google.maps.importLibrary("marker");

        routePreview.hidden = true;
        mapElement.hidden = false;

        let map = mapInstances.get(mapElement.id);

        if (!map) {
            map = new GoogleMap(mapElement, {
                center: { lat: 52.095, lng: 4.334 },
                zoom: 13,
                mapId: "DEMO_MAP_ID",
                mapTypeId: "roadmap",
                renderingType: "VECTOR"
            });
            mapInstances.set(mapElement.id, map);
        }

        const response = await Route.computeRoutes({
            origin: route.start,
            destination: route.end,
            travelMode: "WALKING",
            fields: ["path", "viewport", "legs"]
        });

        if (!response.routes?.length) {
            throw new Error("Geen wandelroute gevonden.");
        }

        const calculatedRoute = response.routes[0];
        const firstLeg = calculatedRoute.legs[0];

        map.__routeOverlays?.forEach((overlay) => {
            overlay.map = null;
        });

        map.__routeOverlays = [
            new Polyline({
                map,
                path: calculatedRoute.path,
                strokeOpacity: 0,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: "#587719",
                        fillOpacity: 1,
                        strokeColor: "#587719",
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

        if (calculatedRoute.viewport) {
            map.fitBounds(calculatedRoute.viewport);
        }

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
        routePreview.hidden = false;
        mapElement.hidden = true;
        button.disabled = false;
        button.textContent = "Bekijk route op kaart";
    }
}

document.addEventListener("DOMContentLoaded", renderRoutes);
