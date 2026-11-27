const storageKey = "avond4daagseInschrijving";
const pricePerChild = 8.5;

const contactSummary = document.getElementById("contactSummary");
const participantCount = document.getElementById("participantCount");
const totalPrice = document.getElementById("totalPrice");
const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");

const storedRegistration = sessionStorage.getItem(storageKey);
const registration = storedRegistration ? JSON.parse(storedRegistration) : null;
const participants = Array.isArray(registration?.participants) ? registration.participants : [];

if (!registration || participants.length === 0) {
    contactSummary.textContent = "Geen inschrijving gevonden";
    participantCount.textContent = "0";
    totalPrice.textContent = "€ 0,00";
    paymentForm.querySelector("button").disabled = true;
    paymentMessage.textContent = "Ga eerst terug naar de inschrijfpagina.";
} else {
    const contactName = [registration.contactName, registration.contactLastName]
        .filter(Boolean)
        .join(" ");

    contactSummary.textContent = contactName || registration.email || "Niet ingevuld";
    participantCount.textContent = String(participants.length);
    totalPrice.textContent = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR"
    }).format(participants.length * pricePerChild);
}

paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!registration || participants.length === 0) {
        return;
    }

    const selectedMethod = paymentForm.querySelector(
        'input[name="paymentMethod"]:checked'
    )?.value;

    sessionStorage.setItem(
        "avond4daagseBetaalmethode",
        selectedMethod || "onbekend"
    );

    paymentMessage.textContent = "Je betaling wordt voorbereid...";

    // Dit is voorlopig een demo; een echte betaalprovider kan hier later worden gekoppeld.
    setTimeout(() => {
        window.location.href = "inschrijvingVoltooidDeelnemers.html";
    }, 700);
});