/*
 * gebruikersbeheerDeletionPopup.js
 * De gekozen gebruiker tonen en verwijderen na bevestiging.
 * Zelfstandig script voor gebruikersbeheerDeletionPopup.html; geen andere .js-bestanden nodig.
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
document.querySelectorAll('[data-fullname]').forEach(e => e.textContent = current.fullname || 'Jane Doe');
$('#delete-user')?.addEventListener('click', () => {
    if (!data.deleted.includes(userId)) data.deleted.push(userId);
    if (save()) location.href = 'gebruikersbeheer.html';
});
