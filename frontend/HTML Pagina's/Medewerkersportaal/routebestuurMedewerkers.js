(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: "AIzaSyAMvyVnmeVLrnbToSkyje2rToL5VMhIfAI",
    v: "weekly",
});


let map1;
let map2;

const BeginLocation1 =
    "Malieveld, Koningskade 64, 2596 AA Den Haag";
const EndLocation1 =
    "Buurtweg 135, 2244 BH Wassenaar";

const BeginLocation2 =
    "Bezuidenhoutseweg 89, 2594 AC Den Haag, Netherlands";
const EndLocation2 =
    "Bezuidenhoutseweg 452, 2594 BE Den Haag, Netherlands";


async function initMap( beginLocation, endLocation, mapDivId, buttonId) {
    const { Map, Polyline } = await google.maps.importLibrary("maps");

    const { Route } = await google.maps.importLibrary("routes");

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(document.getElementById(mapDivId), {
        center: { lat: 52.095, lng: 4.334 },
        zoom: 14,
        mapId: "DEMO_MAP_ID",
        mapTypeId: "satellite",
        renderingType: "VECTOR"
    });

    const routeButton = document.getElementById(buttonId);

    if (!routeButton) {
        console.error(`Knop met id "${buttonId}" niet gevonden.`);
        return;
    }

    routeButton.disabled = true;
    routeButton.textContent = "Route laden...";

    const request = {
        origin: beginLocation,
        destination: endLocation,
        travelMode: "WALKING",
        fields: [
            "path",
            "viewport",
            "legs",
            "distanceMeters",
            "durationMillis"
        ]
    };

    try {
        const { routes } =
            await Route.computeRoutes(request);

        if (!routes || routes.length === 0) {
            console.error("Geen wandelroute gevonden.");
            routeButton.textContent = "Geen route gevonden";
            return;
        }

        const route = routes[0];
        const firstLeg = route.legs[0];

        // Gestippelde route
        new Polyline({
            map,
            path: route.path,
            strokeOpacity: 0,
            icons: [
                {
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: "#EA4335",
                        fillOpacity: 1,
                        strokeColor: "#EA4335",
                        strokeOpacity: 1,
                        scale: 2
                    },
                    offset: "0",
                    repeat: "10px"
                }
            ]
        });

        // Startmarker
        new AdvancedMarkerElement({
            map,
            position: firstLeg.startLocation,
            title: "Startpunt"
        });

        // Eindmarker
        new AdvancedMarkerElement({
            map,
            position: firstLeg.endLocation,
            title: "Eindpunt"
        });

        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        // Link naar Google Maps
        const googleMapsUrl = new URL(
            "https://www.google.com/maps/dir/"
        );

        googleMapsUrl.search = new URLSearchParams({
            api: "1",
            origin: beginLocation,
            destination: endLocation,
            travelmode: "walking"
        }).toString();

        routeButton.textContent = "Bekijk route in Google Maps";
        routeButton.disabled = false;

        routeButton.addEventListener("click", () => {
            window.open(
                googleMapsUrl.href,
                "_blank",
                "noopener,noreferrer"
            );
        });

        return map;
    } catch (error) {
        console.error("Walking route error:", error);
        routeButton.textContent = "Route kon niet worden geladen";
    }
}

async function initAllMaps() {
    map1 = await initMap(
        BeginLocation1,
        EndLocation1,
        "map1Div",
        "routeButton1"
    );

    map2 = await initMap(
        BeginLocation2,
        EndLocation2,
        "map2Div",
        "routeButton2"
    );
}

void initAllMaps();