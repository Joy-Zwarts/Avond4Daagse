import { leesVoorbeeldgegevens, showMessage as notify } from '../voorbeeldgegevens.js';
import { validate } from './financieleValidatie.js';
export { today, validDate } from './financieleValidatie.js';
export { notify };

export const $ = selector => document.querySelector(selector);
export const money = cents => new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
}).format(cents / 100);
export const dateLabel = date => new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(new Date(date + 'T12:00:00'));
export const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');

// Bedragen worden in hele centen opgeslagen om afrondingsfouten te beperken.
export function cents(value, signed = false) {
    const text = String(value).trim().replace(',', '.');
    if (!(signed ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/).test(text)) throw Error('Gebruik een bedrag met maximaal twee decimalen.');
    const negative = text.startsWith('-');
    const [whole, fraction = ''] = text.replace('-', '').split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(result) || result > 100000000000) throw Error('Dit bedrag is te groot.');
    return negative ? -result : result;
}
export function handle(action) {
    let running = false;
    return async event => {
        event.preventDefault();
        if (running) return;
        running = true;
        try {
            await action(event);
        } catch (error) {
            notify(error.message, true);
        } finally {
            running = false;
        }
    };
}

export let state;
let renderPage;

export async function start(render, initialise) {
    renderPage = render;
    try {
        state = validate(await leesVoorbeeldgegevens('financien.json'));
        render();
        initialise();
    } catch (error) {
        notify(error.message, true);
    }
}

// Werk op een kopie zodat een afgekeurde invoer de huidige weergave intact laat.
export function commit(change) {
    if (!state) throw Error('Wacht tot de financiële gegevens geladen zijn.');
    const next = structuredClone(state);
    change(next);
    state = validate(next);
    renderPage();
}

export function requireOpening() {
    if (!state?.opening) throw Error('Stel eerst het beginsaldo in op de overzichtspagina.');
}
