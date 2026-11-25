import { leesVoorbeeldgegevens } from '../voorbeeldgegevens.js';

// Een profiel in het overzicht werkt op de lijst van dat venster.
// Een rechtstreeks geopende profielpagina begint met een eigen kopie uit JSON.
export const profielVenster = window.frameElement?.id === 'person-page' ? window.frameElement : null;

export function laadPersonen() {
    return profielVenster?.personen ?? leesVoorbeeldgegevens('gebruikers.json');
}

export function vindPersoon(personen, id) {
    const persoon = personen.find(item => item.id === id);
    if (!persoon) throw Error('Deze gebruiker is niet gevonden.');
    return persoon;
}

export function controleerPersoon(personen, persoon) {
    if (!persoon.username || !persoon.fullname) throw Error('Vul een gebruikersnaam en volledige naam in.');
    if (personen.some(item => item.id !== persoon.id &&
        (item.username.toLowerCase() === persoon.username.toLowerCase() || item.email.toLowerCase() === persoon.email.toLowerCase()))) {
        throw Error('Deze gebruikersnaam of dit e-mailadres is al in gebruik.');
    }
}

if (profielVenster) {
    document.querySelector('header').hidden = true;
    document.querySelector('.back-button')?.addEventListener('click', event => {
        event.preventDefault();
        profielVenster.closest('dialog').close();
    });
}
