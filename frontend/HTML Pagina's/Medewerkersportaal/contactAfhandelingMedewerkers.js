import "@talkjs/web-components";
import { getTalkSession } from "@talkjs/core";

const appId = "t8qqea2Z";
const medewerkerId = "medewerker-joy";
const standaardGesprekId = "aanmelding-4-daagse";

const gesprekken = [
    {
        id: "aanmelding-avond4daagse",
        onderwerp: "Aanmelding 4-daagse",
        deelnemerId: "jan-de-vries",
        deelnemerNaam: "Jan de Vries",
        deelnemerEmail: "jan@example.com",
        vraag: "Kan ik mij nog aanmelden voor de Avond4daagse?",
        antwoord: "Ja, aanmelden kan nog tot en met vrijdag via het aanmeldformulier."
    },
    {
        id: "starttijd-avond4daagse",
        onderwerp: "Starttijd Avond4daagse",
        deelnemerId: "sanne-jansen",
        deelnemerNaam: "Sanne Jansen",
        deelnemerEmail: "sanne@example.com",
        vraag: "Hoe laat begint de Avond4daagse iedere avond?"
    },
    {
        id: "route-avond4daagse",
        onderwerp: "Route Avond4daagse",
        deelnemerId: "peter-van-dijk",
        deelnemerNaam: "Peter van Dijk",
        deelnemerEmail: "peter@example.com",
        vraag: "Waar kan ik de routes van de Avond4daagse bekijken?"
    }
];

async function maakGebruikerAan(session, gebruiker) {
    await session.currentUser.createIfNotExists({
        name: gebruiker.naam,
        email: gebruiker.email,
        role: "default"
    });
}

async function maakGesprekAan(session, gesprek) {
    const gesprekObject = session.conversation(gesprek.id);

    await gesprekObject.createIfNotExists({
        subject: gesprek.onderwerp
    });

    await gesprekObject
        .participant(gesprek.deelnemerId)
        .createIfNotExists();

    return gesprekObject;
}

async function voegVraagToe(gesprek) {
    const deelnemerSession = getTalkSession({
        appId,
        userId: gesprek.deelnemerId
    });

    await maakGebruikerAan(deelnemerSession, {
        naam: gesprek.deelnemerNaam,
        email: gesprek.deelnemerEmail
    });

    const deelnemerGesprek = deelnemerSession.conversation(gesprek.id);
    const gegevens = await deelnemerGesprek.get();

    if (!gegevens.lastMessage) {
        await deelnemerGesprek.send(gesprek.vraag);
    }
}

async function voegAntwoordToe(session, gesprek) {
    if (!gesprek.antwoord) {
        return;
    }

    const antwoordKey = `antwoord-${gesprek.id}`;

    if (localStorage.getItem(antwoordKey) === "ja") {
        return;
    }

    const medewerkerGesprek = session.conversation(gesprek.id);
    await medewerkerGesprek.send(gesprek.antwoord);

    localStorage.setItem(antwoordKey, "ja");
}

function haalGesprekIdUitEvent(event) {
    return (
        event?.detail?.conversation?.id ||
        event?.detail?.id ||
        event?.detail?.conversationId ||
        event?.conversation?.id
    );
}

function selecteerGesprek(lijst, chatbox, gesprekId) {
    if (!gesprekId) {
        return;
    }

    console.log("Gesprek wisselen naar:", gesprekId);

    // Houd de selectie in de lijst en de chatbox gelijk.
    lijst.selectedConversationId = gesprekId;
    lijst.setAttribute("selected-conversation-id", gesprekId);

    chatbox.conversationId = gesprekId;
    chatbox.setAttribute("conversation-id", gesprekId);
}

async function initialiseerTalkJS() {
    try {
        await customElements.whenDefined("t-conversation-list");
        await customElements.whenDefined("t-chatbox");

        const medewerkerSession = getTalkSession({
            appId,
            userId: medewerkerId
        });

        await medewerkerSession.currentUser.createIfNotExists({
            name: "Joy Zwarts",
            email: "J.Zwarts@student.hhs.nl",
            role: "default"
        });

        for (const gesprek of gesprekken) {
            await medewerkerSession.user(gesprek.deelnemerId)
                .createIfNotExists({
                    name: gesprek.deelnemerNaam,
                    email: gesprek.deelnemerEmail,
                    role: "default"
                });

            await maakGesprekAan(medewerkerSession, gesprek);
            await voegVraagToe(gesprek);
        }

        // Alleen het eerste gesprek krijgt een antwoord van de medewerker.
        await voegAntwoordToe(medewerkerSession, gesprekken[0]);

        const lijst = document.querySelector("#conversationList");
        const chatbox = document.querySelector("#conversationChatbox");

        if (!lijst || !chatbox) {
            throw new Error("TalkJS-lijst of chatbox niet gevonden.");
        }

        lijst.addEventListener("select-conversation", (event) => {
            console.log("select-conversation event:", event.detail);

            const geselecteerdId = haalGesprekIdUitEvent(event);

            if (!geselecteerdId) {
                console.warn("Geen conversation-ID gevonden.");
                return;
            }

            selecteerGesprek(lijst, chatbox, geselecteerdId);
        });

        selecteerGesprek(lijst, chatbox, standaardGesprekId);

        console.log("Drie TalkJS-gesprekken zijn geladen.");
    } catch (error) {
        console.error("TalkJS-fout:", error);
    }
}

initialiseerTalkJS();
