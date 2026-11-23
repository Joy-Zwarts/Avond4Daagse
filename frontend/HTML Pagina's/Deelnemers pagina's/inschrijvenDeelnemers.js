const participantsContainer = document.getElementById("participantsContainer");
const addParticipantButton = document.getElementById("kindToevoegen");
const removeParticipantButton = document.getElementById("kindVerwijderen");

function updateSchoolSection(participant) {
    const schoolToggle = participant.querySelector(".schooldeelname-toggle");
    const schoolSection = participant.querySelector(".schooldeelname");

    if (!schoolToggle || !schoolSection) {
        return;
    }

    const enabled = schoolToggle.checked;

    schoolSection.hidden = !enabled;

    schoolSection.querySelectorAll("input").forEach((input) => {
        input.disabled = !enabled;
        input.required = enabled;
    });
}

function updateParticipantNumbers() {
    const participants =
        participantsContainer.querySelectorAll(".participantForm");

    participants.forEach((participant, index) => {
        const number =
            participant.querySelector(".participantNumber");

        if (number) {
            number.textContent = `Kind ${index + 1}`;
        }
    });

    removeParticipantButton.hidden = participants.length <= 1;
}

function createParticipant(number) {
    const participant = document.createElement("section");
    participant.className = "participantForm";

    participant.innerHTML = `
        <section class="contactCardTop">
            <div>
                <h2>Deelnemers</h2>
                <small class="participantNumber">Kind ${number}</small>
            </div>
        </section>

        <section class="formTop">
            <div>
                <label for="deelnemerNaam${number}">Naam</label>
                <input
                    id="deelnemerNaam${number}"
                    name="deelnemerNaam[]"
                    type="text"
                    required
                    minlength="2"
                    placeholder="Naam deelnemer"
                >
            </div>

            <div>
                <label for="deelnemerAchternaam${number}">Achternaam</label>
                <input
                    id="deelnemerAchternaam${number}"
                    name="deelnemerAchternaam[]"
                    type="text"
                    required
                    minlength="2"
                    placeholder="Achternaam deelnemer"
                >
            </div>
        </section>

        <label for="afstand${number}">Afstand</label>
        <select id="afstand${number}" name="afstand[]">
            <option value="km2_5">2,5 Kilometer</option>
            <option value="km5">5 Kilometer</option>
        </select>

        <label for="deelname${number}">Eerdere deelname</label>
        <div class="eerdereDeelname">
            <p>Dit is mijn</p>
            <select id="deelname${number}" name="eerdereDeelname[]">
                <option value="1">Eerste</option>
                <option value="2">Tweede</option>
                <option value="3">Derde</option>
                <option value="4">Vierde</option>
                <option value="5">Vijfde</option>
                <option value="6">Zesde</option>
                <option value="7">Zevende</option>
                <option value="8">Achtste</option>
                <option value="9">Negende</option>
                <option value="10">Tiende</option>
            </select>
            <p>keer deelnemen</p>
        </div>

        <label for="accessability${number}">
            Toegankelijkheid/ondersteuning
        </label>
        <textarea
            id="accessability${number}"
            name="accessability[]"
            class="accessability"
            minlength="20"
            placeholder="Vertel ons optionele ondersteuningseisen zodat uw kind deel kan nemen"
        ></textarea>

        <label for="schooldeelname${number}">Meedoen via school</label>
        <small>Schuif de slider naar “aan” als uw kind meedoet via school.</small>
        <label class="switch">
            <input
                type="checkbox"
                id="schooldeelname${number}"
                class="schooldeelname-toggle"
                name="schooldeelname[]"
                value="viaschool"
            >
            <span class="slider round"></span>
        </label>

        <section class="schooldeelname" hidden>
            <label for="school${number}">School</label>
            <input
                id="school${number}"
                name="school[]"
                placeholder="Naam school"
            >

            <label for="klas${number}">Klas</label>
            <input
                id="klas${number}"
                name="klas[]"
                placeholder="Bijv. 1a"
            >

            <label for="leerjaar${number}">Leerjaar</label>
            <input
                id="leerjaar${number}"
                name="leerjaar[]"
                placeholder="Bijv. groep 2"
            >
        </section>
    `;

    return participant;
}

addParticipantButton.addEventListener("click", () => {
    const count = participantsContainer.querySelectorAll(".participantForm").length;
    const participant = createParticipant(count + 1);

    participantsContainer.appendChild(participant);
    updateSchoolSection(participant);
    updateParticipantNumbers();
});

removeParticipantButton.addEventListener("click", () => {
    const participants =
        participantsContainer.querySelectorAll(".participantForm");

    if (participants.length <= 1) {
        return;
    }

    participants[participants.length - 1].remove();
    updateParticipantNumbers();
});

participantsContainer.addEventListener("change", (event) => {
    if (!event.target.classList.contains("schooldeelname-toggle")) {
        return;
    }

    updateSchoolSection(event.target.closest(".participantForm"));
});

participantsContainer
    .querySelectorAll(".participantForm")
    .forEach(updateSchoolSection);

updateParticipantNumbers();