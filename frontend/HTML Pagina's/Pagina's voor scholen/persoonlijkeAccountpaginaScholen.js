document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".account-form");
    const editButton = document.querySelector("#edit-account");

    if (!form || !editButton) {
        return;
    }

    const fields = form.querySelectorAll("input");
    let editing = false;

    const setFieldsDisabled = (disabled) => {
        fields.forEach((field) => {
            field.disabled = disabled;
        });
    };

    const updateButton = () => {
        editButton.innerHTML = editing
            ? '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Opslaan'
            : '<i class="fa-solid fa-pen" aria-hidden="true"></i> Bewerken';

        editButton.setAttribute(
            "aria-label",
            editing ? "Accountgegevens opslaan" : "Accountgegevens bewerken"
        );
    };

    setFieldsDisabled(true);
    updateButton();

    editButton.addEventListener("click", () => {
        editing = !editing;
        setFieldsDisabled(!editing);
        updateButton();

        if (editing) {
            fields[0]?.focus();
            return;
        }

        // Hier kun je later een fetch naar je backend toevoegen.
        console.log("Accountgegevens opgeslagen.");
    });
});
