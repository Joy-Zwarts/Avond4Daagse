import { demoAccountId, leesVoorbeeldgegevens } from './voorbeeldgegevens.js';

const form = document.querySelector('#loginForm');
const message = document.querySelector('#login-message');
const button = document.querySelector('#loginButton');

async function laadDemoaccount() {
    try {
        const personen = await leesVoorbeeldgegevens('gebruikers.json');
        const account = personen.find(persoon => persoon.id === demoAccountId);
        if (!account) throw Error('Het demoaccount ontbreekt in gebruikers.json.');
        document.querySelector('.loginCardTop strong').textContent = account.email;
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (form.email.value.trim().toLowerCase() === account.email.toLowerCase() &&
                form.password.value === 'Avond4daagse!') {
                location.assign('bestuurdersdashboard.html');
            } else {
                message.textContent = 'Gebruik het e-mailadres en wachtwoord van het demoaccount.';
            }
        });
        button.disabled = false;
    } catch (error) {
        message.textContent = error.message;
    }
}
laadDemoaccount();
