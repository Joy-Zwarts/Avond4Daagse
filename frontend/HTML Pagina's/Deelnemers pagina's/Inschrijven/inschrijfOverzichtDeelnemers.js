const pricePerChild = 8.5;
const storageKey = "avond4daagseInschrijving";

const participantsOverview = document.getElementById("participantsOverview");
const participantCount = document.getElementById("participantCount");
const totalPrice = document.getElementById("totalPrice");
const contactSummary = document.getElementById("contactSummary");
const continueButton = document.getElementById("continueButton");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    }[character]));
}

function displayValue(value, fallback = "Niet ingevuld") {
    return escapeHtml(value || fallback);
}

function formatDistance(value) {
    return value === "km5" ? "5 kilometer" : "2,5 kilometer";
}

function formatNewsletter(value) {
    return value ? "Ja" : "Nee";
}

function formatSchoolParticipation(value) {
    return value ? "Ja, via school" : "Nee, individuele deelname";
}

function renderEmptyState() {
    contactSummary.textContent = "Er is nog geen inschrijving ingevuld.";
    participantCount.textContent = "0 kinderen";
    totalPrice.textContent = "€ 0,00";
    participantsOverview.innerHTML = `
        <p class="emptyMessage">
            Ga terug naar de inschrijfpagina om de gegevens in te vullen.
        </p>
    `;
    continueButton.disabled = true;
}

function renderRegistration(data) {
    const participants = Array.isArray(data.participants)
        ? data.participants
        : [];

    const contactName = [data.contactName, data.contactLastName]
        .filter(Boolean)
        .join(" ");

    contactSummary.innerHTML = `
        <strong>Naam:</strong> ${displayValue(contactName)}<br>
        <strong>E-mailadres:</strong> ${displayValue(data.email)}<br>
        <strong>Telefoonnummer:</strong> ${displayValue(data.phone)}<br>
        <strong>Postcode:</strong> ${displayValue(data.postcode, "Niet opgegeven")}<br>
        <strong>Nieuwsbrief:</strong> ${formatNewsletter(data.newsletter)}
    `;

    participantCount.textContent = `${participants.length} ${
        participants.length === 1 ? "kind" : "kinderen"
    }`;

    totalPrice.textContent = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR"
    }).format(participants.length * pricePerChild);

    participantsOverview.innerHTML = participants.map((participant, index) => `
        <article class="participantSummary">
            <div>
                <h3>
                    Kind ${index + 1}: ${displayValue(
                        `${participant.firstName || ""} ${participant.lastName || ""}`.trim(),
                        "Naam niet ingevuld"
                    )}
                </h3>
                <p>${formatSchoolParticipation(participant.schoolParticipation)}</p>
            </div>

            <div class="participantDetail">
                <strong>Afstand</strong>
                <span>${displayValue(formatDistance(participant.distance))}</span>
            </div>

            <div class="participantDetail">
                <strong>Eerdere deelname</strong>
                <span>${displayValue(participant.previousParticipation)} keer</span>
            </div>

            <div class="participantDetail">
                <strong>Toegankelijkheid/ondersteuning</strong>
                <span>${displayValue(
                    participant.accessibility,
                    "Geen ondersteuning opgegeven"
                )}</span>
            </div>

            <div class="participantDetail">
                <strong>Meedoen via school</strong>
                <span>${formatSchoolParticipation(participant.schoolParticipation)}</span>
            </div>

            <div class="participantDetail">
                <strong>School</strong>
                <span>${displayValue(
                    participant.school,
                    "Niet van toepassing"
                )}</span>
            </div>

            <div class="participantDetail">
                <strong>Klas</strong>
                <span>${displayValue(
                    participant.className,
                    "Niet van toepassing"
                )}</span>
            </div>

            <div class="participantDetail">
                <strong>Leerjaar</strong>
                <span>${displayValue(
                    participant.schoolYear,
                    "Niet van toepassing"
                )}</span>
            </div>
        </article>
    `).join("");
}

const storedRegistration = sessionStorage.getItem(storageKey);
let registration = null;

try {
    registration = storedRegistration ? JSON.parse(storedRegistration) : null;
} catch (error) {
    console.error("De opgeslagen inschrijving kan niet worden gelezen.", error);
}

if (
    !registration ||
    !Array.isArray(registration.participants) ||
    registration.participants.length === 0
) {
    renderEmptyState();
} else {
    renderRegistration(registration);
}

continueButton.addEventListener("click", () => {
    if (!continueButton.disabled) {
        window.location.href = "inschrijvingBetalingDeelnemers.html";
    }
});
