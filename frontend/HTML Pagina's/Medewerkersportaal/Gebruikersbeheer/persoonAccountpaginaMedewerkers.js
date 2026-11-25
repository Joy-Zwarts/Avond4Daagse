import { bestandsUrl, demoAccountId, readUpload, showMessage } from '../voorbeeldgegevens.js';
import { controleerPersoon, laadPersonen, vindPersoon } from './gebruikersgegevens.js';

const form = document.querySelector('#profile-form');
const mode = form.dataset.mode;
const own = mode === 'account';
const id = own ? demoAccountId : new URLSearchParams(location.search).get('user');
const certificateList = document.querySelector('#certificates');
const upload = document.querySelector('#certificate-upload');
const dialog = document.querySelector('#dialog');
let people;
let person;
let replaceId = null;

function button(label, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', action);
    return element;
}

function viewCertificate(cert) {
    document.querySelector('#dialog-title').textContent = cert.title;
    const content = document.querySelector('#dialog-text');
    content.replaceChildren();
    if (cert.file) {
        const link = document.createElement('a');
        link.download = cert.file.name;
        link.href = bestandsUrl(cert.file);
        link.textContent = 'Download ' + cert.file.name;
        content.append(link);
    } else {
        content.textContent = 'Er is nog geen document gekoppeld.';
    }
    dialog.showModal();
}

function renderFiles() {
    const avatar = form.querySelector('.avatar, .profile-avatar');
    if (person.photo) {
        const photo = document.createElement('img');
        photo.src = bestandsUrl(person.photo);
        photo.alt = 'Profielfoto van ' + person.fullname;
        photo.className = avatar.className;
        photo.style.objectFit = 'cover';
        avatar.replaceWith(photo);
    }
    certificateList.replaceChildren();
    if (!person.certificates.length) certificateList.textContent = 'Geen certificaten toegevoegd.';
    for (const cert of person.certificates) {
        const row = document.createElement('div');
        row.className = 'certificate';
        const title = document.createElement('span');
        title.textContent = cert.title;
        row.append(title);
        if (mode === 'edit') {
            const select = document.createElement('select');
            select.setAttribute('aria-label', 'Beoordeling ' + cert.title);
            for (const status of ['Geen oordeel', 'Goedgekeurd', 'Afgekeurd']) select.add(new Option(status, status));
            select.value = cert.status;
            select.addEventListener('change', () => { cert.status = select.value; });
            row.append(select);
        } else {
            const badge = document.createElement('span');
            badge.className = 'badge ' + ({ Goedgekeurd: 'approved', Afgekeurd: 'rejected' }[cert.status] ?? 'pending');
            badge.textContent = cert.status;
            row.append(badge);
        }
        if (own) row.append(button('Aanpassen', () => {
            replaceId = cert.id;
            upload.click();
        }));
        row.append(button('Bekijken', () => viewCertificate(cert)));
        certificateList.append(row);
    }
}

function fillForm() {
    form.querySelector('[data-user-title]').textContent = person.username;
    for (const key of ['username', 'fullname', 'email', 'role', 'address', 'birthdate', 'phone']) {
        form.elements[key].value = person[key];
    }
    renderFiles();
}

async function load() {
    form.hidden = true;
    try {
        if (!own && !id) throw Error('Kies eerst een gebruiker in het overzicht.');
        people = await laadPersonen();
        person = structuredClone(vindPersoon(people, id));
        for (const link of form.querySelectorAll('[data-user-link]')) {
            const url = new URL(link.href);
            url.searchParams.set('user', person.id);
            link.href = url.href;
        }
        fillForm();
        form.hidden = false;
    } catch (error) {
        showMessage(error.message, true);
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();
    if (!person || mode === 'view' || form.inert) return;
    form.inert = true;
    try {
        const updated = { ...person };
        for (const [key, value] of new FormData(form)) updated[key] = value.trim();
        controleerPersoon(people, updated);
        people[people.indexOf(vindPersoon(people, id))] = structuredClone(updated);
        person = updated;
        fillForm();
        showMessage('Gegevens tijdelijk bijgewerkt. Vernieuw het overzicht of de accountpagina om de voorbeelden te herstellen.');
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        form.inert = false;
    }
});

if (own) {
    document.querySelector('#add-certificate').addEventListener('click', () => {
        replaceId = null;
        upload.click();
    });
    upload.addEventListener('cancel', () => { replaceId = null; });
    for (const input of [document.querySelector('#photo'), upload]) {
        input.addEventListener('change', async () => {
            const file = input.files[0];
            if (!file) return;
            form.inert = true;
            try {
                const photo = input.id === 'photo';
                const attachment = await readUpload(file, photo);
                if (photo) person.photo = attachment;
                else {
                    const cert = person.certificates.find(item => item.id === replaceId);
                    if (cert) {
                        cert.file = attachment;
                        cert.status = 'Geen oordeel';
                    } else {
                        person.certificates.push({ id: crypto.randomUUID(), title: file.name, status: 'Geen oordeel', file: attachment });
                    }
                }
                renderFiles();
                showMessage('Bestand geselecteerd. Kies Account opslaan om het aan het voorbeeldprofiel toe te voegen.');
            } catch (error) {
                showMessage(error.message, true);
            } finally {
                input.value = '';
                replaceId = null;
                form.inert = false;
            }
        });
    }
    const confirmation = document.querySelector('#delete-dialog');
    document.querySelector('#delete-account').addEventListener('click', () => {
        confirmation.returnValue = '';
        confirmation.showModal();
    });
    confirmation.addEventListener('close', () => {
        if (confirmation.returnValue !== 'delete') return;
        people.splice(people.indexOf(vindPersoon(people, id)), 1);
        form.hidden = true;
        showMessage('Account tijdelijk verwijderd. Vernieuw deze pagina om het demoaccount te herstellen.');
    });
    document.querySelector('#logout').addEventListener('click', () => location.assign('inlogpaginaMedewerkers.html'));
}
load();
