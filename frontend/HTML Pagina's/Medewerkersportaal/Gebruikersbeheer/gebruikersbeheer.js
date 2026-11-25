import { showMessage } from '../voorbeeldgegevens.js';
import { controleerPersoon, laadPersonen } from './gebruikersgegevens.js';

const search = document.querySelector('#search');
const suggestions = document.querySelector('#suggestions');
const list = document.querySelector('#users');
const form = document.querySelector('#new-user');
const add = document.querySelector('#add-user');
let people = [];
let matches = [];
let active = -1;
let selectedId = null;
const dialog = document.querySelector('#person-dialog');
const frame = document.querySelector('#person-page');

dialog.addEventListener('close', () => {
    frame.removeAttribute('src');
    if (selectedId) {
        const selected = people.find(person => person.id === selectedId);
        selectedId = selected?.id ?? null;
        search.value = selected?.fullname ?? '';
    }
    render(false);
});

function closeSuggestions() {
    suggestions.hidden = true;
    search.setAttribute('aria-expanded', 'false');
    search.removeAttribute('aria-activedescendant');
    active = -1;
}

function choose(person) {
    search.value = person.fullname;
    selectedId = person.id;
    render(false);
    search.focus();
}

function render(showSuggestions) {
    const term = search.value.trim().toLocaleLowerCase('nl');
    matches = people.filter(person => selectedId ? person.id === selectedId :
        [person.fullname, person.username, person.role, person.email].join(' ').toLocaleLowerCase('nl').includes(term));
    list.replaceChildren();
    suggestions.replaceChildren();
    closeSuggestions();
    document.querySelector('#empty').hidden = matches.length > 0;
    for (const person of matches) {
        const row = document.createElement('article');
        row.className = 'card shadow user-row';
        const icon = document.createElement('span');
        icon.className = 'user-icon';
        icon.innerHTML = '<i class="fa-solid fa-user" aria-hidden="true"></i>';
        const name = document.createElement('span');
        name.className = 'user-name';
        name.textContent = person.fullname;
        const role = document.createElement('span');
        role.className = 'role';
        role.textContent = person.role;
        const link = document.createElement('a');
        link.className = 'button view';
        link.textContent = 'Bekijken';
        link.href = 'gebruikersbeheerViewPopup.html?user=' + encodeURIComponent(person.id);
        link.addEventListener('click', event => {
            event.preventDefault();
            frame.personen = people;
            frame.src = link.href;
            dialog.showModal();
        });
        row.append(icon, name, role, link);
        list.append(row);
        if (showSuggestions && term) {
            const option = document.createElement('li');
            option.id = 'suggestie-' + person.id;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.textContent = person.fullname + ' (' + person.username + ') · ' + person.role;
            option.addEventListener('click', () => choose(person));
            suggestions.append(option);
        }
    }
    suggestions.hidden = !suggestions.childElementCount;
    search.setAttribute('aria-expanded', String(!suggestions.hidden));
}

search.addEventListener('input', () => {
    selectedId = null;
    render(true);
});
search.addEventListener('keydown', event => {
    if (event.key === 'Escape') return closeSuggestions();
    if (event.key === 'Enter' && !suggestions.hidden) {
        event.preventDefault();
        return choose(matches[Math.max(0, active)]);
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !search.value.trim()) return;
    event.preventDefault();
    if (suggestions.hidden) render(true);
    if (!matches.length) return;
    active = event.key === 'ArrowDown' ? (active + 1) % matches.length : (active <= 0 ? matches.length : active) - 1;
    const option = suggestions.children[active];
    for (const child of suggestions.children) child.setAttribute('aria-selected', String(child === option));
    search.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({ block: 'nearest' });
});
document.addEventListener('click', event => {
    if (!event.target.closest('#search-area')) closeSuggestions();
});
search.addEventListener('keydown', event => { if (event.key === 'Tab') closeSuggestions(); });

function toggleForm(open) {
    form.hidden = !open;
    add.setAttribute('aria-expanded', String(open));
    if (open) form.elements.username.focus();
    else {
        form.reset();
        add.focus();
    }
}
add.addEventListener('click', () => toggleForm(form.hidden));
document.querySelector('#cancel-user').addEventListener('click', () => toggleForm(false));

form.addEventListener('submit', event => {
    event.preventDefault();
    try {
        const fields = form.elements;
        const person = {
            id: crypto.randomUUID(), username: fields.username.value.trim(), fullname: fields.fullname.value.trim(),
            email: fields.email.value.trim(), role: fields.role.value, birthdate: '', address: '', phone: '',
            photo: null, certificates: []
        };
        controleerPersoon(people, person);
        people.push(person);
        search.value = '';
        selectedId = null;
        toggleForm(false);
        render(false);
        showMessage(person.fullname + ' is tijdelijk toegevoegd.');
    } catch (error) {
        showMessage(error.message, true);
    }
});

async function load() {
    add.disabled = true;
    try {
        people = await laadPersonen();
        render(false);
        add.disabled = false;
        if (new URLSearchParams(location.search).has('nieuw')) toggleForm(true);
    } catch (error) {
        showMessage(error.message, true);
    }
}
load();
