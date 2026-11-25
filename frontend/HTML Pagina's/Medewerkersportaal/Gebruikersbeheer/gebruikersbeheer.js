/*
 * gebruikersbeheer.js
 * De gebruikerslijst opbouwen en doorzoeken.
 * Zelfstandig script voor gebruikersbeheer.html; geen andere .js-bestanden nodig.
 * Laden onderaan de bijbehorende HTML, vlak voor </body>.
 */

// 1. Startgegevens: huidige gebruiker en lokale browseropslag.
const $ = s => document.querySelector(s);
const storageKey = 'avond4daagse-project-demo-v1';
let data = {
    users: {},
    deleted: [],
    certificates: {}
};
try {
    data = Object.assign(data, JSON.parse(localStorage.getItem(storageKey) || '{}'));
} catch (e) {}
function show(title, text) {
    $('#dialog-title').textContent = title;
    $('#dialog-text').textContent = text;
    $('#dialog').showModal();
}

// 2. Navigatie en gebruikersgegevens in het scherm zetten.
document.querySelectorAll('[data-unavailable]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    show('Pagina niet beschikbaar', 'Deze pagina valt buiten de acht uitgewerkte pagina’s.');
}));

// 3. Gebruikersoverzicht opbouwen en filteren op de zoektekst.
function renderUsers() {
    if (!$('#users')) return;
    $('#users').replaceChildren();
    const roles = ['Vrijwilliger', 'Roostermaker', 'Penningmeester', 'Vrijwilliger', 'Secretaris', 'Routebeheerder'];
    const ids = [...new Set(['1', '2', '3', '4', '5', '6', ...Object.keys(data.users)])];
    ids.filter(id => !data.deleted.includes(id)).forEach(id => {
        const u = data.users[id] || {};
        const row = document.createElement('article');
        row.className = 'card shadow user-row';
        row.dataset.userRow = '';
        row.dataset.name = (u.username ||
            'User ' + id) + ' ' + (u.fullname ||
            '') + ' ' + (u.role ||
            roles[Number(id) - 1] ||
            'Vrijwilliger');
        row.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#person"/></svg><span class="user-name"></span><span class="role"></span><a class="button view">View</a>';
        row.querySelector('.user-name').textContent = u.username || 'User ' + id;
        row.querySelector('.role').textContent = u.role || roles[Number(id) - 1] || 'Vrijwilliger';
        row.querySelector('a').href = 'gebruikersbeheerViewPopup.html?user=' + encodeURIComponent(id);
        $('#users').append(row);
    });
    filterUsers();
}
function filterUsers() {
    const q = ($('#search')?.value || '').toLocaleLowerCase('nl');
    let visible = 0;
    document.querySelectorAll('[data-user-row]').forEach(row => {
        row.hidden = !row.dataset.name.toLocaleLowerCase('nl').includes(q);
        if (!row.hidden) visible++;
    });
    if ($('#empty')) $('#empty').hidden = visible > 0;
}
renderUsers();
$('#search')?.addEventListener('input', filterUsers);
