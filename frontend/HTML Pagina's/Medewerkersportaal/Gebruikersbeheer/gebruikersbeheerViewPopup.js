/*
 * gebruikersbeheerViewPopup.js
 * De gekozen gebruiker en diens certificaten bekijken.
 * Zelfstandig script voor gebruikersbeheerViewPopup.html; geen andere .js-bestanden nodig.
 * Laden onderaan de bijbehorende HTML, vlak voor </body>.
 */

// 1. Startgegevens: huidige gebruiker en lokale browseropslag.
const $ = s => document.querySelector(s);
const userId = new URLSearchParams(location.search).get('user') || '1';
const storageKey = 'avond4daagse-project-demo-v1';
let data = {
    users: {},
    deleted: [],
    certificates: {}
};
try {
    data = Object.assign(data, JSON.parse(localStorage.getItem(storageKey) || '{}'));
} catch (e) {}

// 2. Hulpfuncties voor meldingen, opslaan en dialoogvensters.
function message(t) {
    if ($('#message')) $('#message').textContent = t;
}
function save() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (e) {
        message('Opslaan is niet beschikbaar in deze browser.');
        return false;
    }
}
function show(title, text) {
    $('#dialog-title').textContent = title;
    $('#dialog-text').textContent = text;
    $('#dialog').showModal();
}

// 3. Navigatie en gebruikersgegevens in het scherm zetten.
document.querySelectorAll('[data-unavailable]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    show('Pagina niet beschikbaar', 'Deze pagina valt buiten de acht uitgewerkte pagina’s.');
}));
document.querySelectorAll('[data-user-link]').forEach(a => {
    a.href += '?user=' + encodeURIComponent(userId);
});
const current = data.users[userId] || {};
document.querySelectorAll('[data-user-title]').forEach(e => e.textContent = current.username || 'User ' + userId);

// 4. Profiel laden en wijzigingen opslaan. Het wachtwoord wordt niet bewaard.
const form = $('#profile-form');
if (form) {
    for (const [key, value] of Object.entries(current)) {
        const el = form.elements.namedItem(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = !!value;else el.value = value;
        }
    }
    if (!current.role &&
        form.elements.role) form.elements.role.value = ['Vrijwilliger', 'Roostermaker', 'Penningmeester', 'Vrijwilliger', 'Secretaris', 'Routebeheerder'][Number(userId) - 1] ||
        'Vrijwilliger';
    form.addEventListener('submit', e => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        delete values.password;
        form.querySelectorAll('input[type=checkbox]').forEach(el => values[el.name] = el.checked);
        data.users[userId] = Object.assign(current, values);
        if (save()) message('Aanpassingen lokaal opgeslagen. Wachtwoorden vereisen een backend en worden niet opgeslagen.');
    });
}

// 5. Certificaten bekijken, selecteren en vervangen.
document.querySelectorAll('[data-certificate]').forEach(b => b.addEventListener('click', () => {
    const key = userId + '-' + b.dataset.certificate;
    const file = data.certificates[key];
    if (!file) {
        show('Certificaat ' + (Number(b.dataset.certificate) + 1), 'Er is nog geen document gekoppeld. De getoonde beoordelingen zijn voorbeeldgegevens.');
        return;
    }
    show('Certificaat', 'Gekoppeld bestand: ' + file + ' . De bestandsinhoud wordt alleen tijdens deze sessie beschikbaar gehouden.');
    if (window.sessionFiles?.[key]) {
        const link = document.createElement('a');
        link.className = 'button primary';
        link.href = URL.createObjectURL(window.sessionFiles[key]);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open document';
        $('#dialog-text').append(document.createElement('br'), link);
        link.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(link.href), 60000));
    }
}));
