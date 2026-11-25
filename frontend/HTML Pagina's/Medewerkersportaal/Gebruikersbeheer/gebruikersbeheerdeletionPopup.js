import { showMessage } from '../voorbeeldgegevens.js';
import { laadPersonen, profielVenster, vindPersoon } from './gebruikersgegevens.js';

const id = new URLSearchParams(location.search).get('user');
const button = document.querySelector('#delete-user');
const keep = document.querySelector('[data-user-link]');
let people;
let person;
keep.href = 'gebruikersbeheer.html';

async function load() {
    try {
        if (!id) throw Error('Kies eerst een gebruiker in het overzicht.');
        people = await laadPersonen();
        person = vindPersoon(people, id);
        document.querySelector('[data-user-title]').textContent = person.username;
        document.querySelector('[data-fullname]').textContent = person.fullname;
        keep.href = 'gebruikersbeheerViewPopup.html?user=' + encodeURIComponent(id);
        button.disabled = false;
    } catch (error) {
        showMessage(error.message, true);
    }
}
button.addEventListener('click', () => {
    people.splice(people.indexOf(person), 1);
    if (profielVenster) {
        profielVenster.closest('dialog').close();
    } else {
        button.disabled = true;
        document.querySelector('.delete-person').hidden = true;
        keep.href = 'gebruikersbeheer.html';
        keep.textContent = 'Terug naar overzicht';
        showMessage('Gebruiker tijdelijk verwijderd. Vernieuw de pagina om het voorbeeld te herstellen.');
    }
});
load();
