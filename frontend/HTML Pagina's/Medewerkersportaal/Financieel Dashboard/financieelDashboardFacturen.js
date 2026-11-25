/*
 * financieelDashboardFacturen.js
 * Facturen laden, voorvertonen, opslaan en verwijderen; betaalde facturen koppelen aan uitgaven.
 * Zelfstandig script voor financieelDashboardFacturen.html; geen andere .js-bestanden nodig.
 * Laden onderaan de bijbehorende HTML, vlak voor </body>.
 */

// Deze pagina gebruikt dezelfde financiële browseropslag als de andere financiële pagina.

// 1. Hulpfuncties: elementen vinden en bedragen, datums en unieke nummers maken.
const $ = selector => document.querySelector(selector);
const KEY = 'avond4daagse-finance-v2';
const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
const money = cents => new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
}).format(cents / 100);
const dateLabel = date => new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(new Date(date + 'T12:00:00'));
const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');

// Bedragen worden in hele centen opgeslagen om afrondingsfouten te beperken.
function cents(value, signed = false) {
    const text = String(value).trim().replace(',', '.');
    if (!(signed ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/).test(text)) throw Error('Gebruik een bedrag met maximaal twee decimalen.');
    const negative = text.startsWith('-');
    const [whole, fraction = ''] = text.replace('-', '').split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(result) || result > 100000000000) throw Error('Dit bedrag is te groot.');
    return negative ? -result : result;
}
function validDate(date) {
    return typeof date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !isNaN(Date.parse(date)) &&
        new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) === date;
}
function nonempty(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

// 2. Controleer de opgeslagen gegevens voordat ze worden gebruikt of bewaard.
function validate(store) {
    if (!store ||
        store.version !== 2 ||
        !Number.isSafeInteger(store.revision) ||
        store.revision < 0 ||
        !Array.isArray(store.transactions) ||
        !Array.isArray(store.invoices)) throw Error('Opgeslagen financiële gegevens zijn ongeldig. Er is niets overschreven.');
    if (store.opening !== null && (
        !store.opening ||
        !validDate(store.opening.date) ||
        store.opening.date > today() ||
        !Number.isSafeInteger(store.opening.cents) ||
        Math.abs(store.opening.cents) > 100000000000)) throw Error('Het beginsaldo is ongeldig.');
    const ids = new Set();
    for (const tx of store.transactions) {
        if (!nonempty(tx.id) ||
            ids.has(tx.id) ||
            !['income', 'expense'].includes(tx.type) ||
            !Number.isSafeInteger(tx.cents) ||
            tx.cents <= 0 ||
            tx.cents > 100000000000 ||
            !nonempty(tx.description) ||
            !nonempty(tx.category) ||
            !validDate(tx.date) ||
            tx.date > today() ||
            !store.opening ||
            tx.date < store.opening.date ||
            tx.invoiceId !== null &&
            !nonempty(tx.invoiceId)) throw Error('Een transactie is ongeldig. Controleer bedrag en datum.');
        ids.add(tx.id);
    }
    const invoiceIds = new Set(),
        invoiceNumbers = new Set();
    for (const invoice of store.invoices) {
        const numberKey = invoice.supplier?.trim().toLocaleLowerCase('nl') + '|' + invoice.number?.trim().toLocaleLowerCase('nl');
        if (!nonempty(invoice.id) ||
            invoiceIds.has(invoice.id) ||
            invoiceNumbers.has(numberKey) ||
            !nonempty(invoice.supplier) ||
            !nonempty(invoice.number) ||
            !nonempty(invoice.category) ||
            !validDate(invoice.date) ||
            !validDate(invoice.due) ||
            invoice.due < invoice.date ||
            !Number.isSafeInteger(invoice.cents) ||
            invoice.cents <= 0 ||
            invoice.cents > 100000000000 ||
            ![0, 9, 21].includes(invoice.vat) ||
            !['Betaald', 'Openstaand'].includes(invoice.status)) throw Error('Een factuur is ongeldig of bestaat al voor deze leverancier.');
        invoiceIds.add(invoice.id);
        invoiceNumbers.add(numberKey);
        const matches = store.transactions.filter(tx => tx.invoiceId === invoice.id);
        if (invoice.status === 'Betaald') {
            if (!validDate(invoice.paid) ||
                invoice.paid < invoice.date ||
                invoice.paid > today() ||
                matches.length !== 1 ||
                matches[0].type !== 'expense' ||
                matches[0].cents !== invoice.cents ||
                matches[0].date !== invoice.paid) throw Error('Een betaalde factuur moet precies één bijbehorende uitgave hebben.');
        } else if (matches.length) throw Error('Een openstaande factuur mag het saldo niet veranderen.');
    }
    if (store.transactions.some(tx => tx.invoiceId &&
        !invoiceIds.has(tx.invoiceId))) throw Error('Een gekoppelde factuur ontbreekt.');
    let balance = store.opening?.cents || 0;
    for (const tx of store.transactions) {
        balance += tx.type === 'income' ? tx.cents : -tx.cents;
        if (!Number.isSafeInteger(balance)) throw Error('Het totaal is te groot.');
    }
    return store;
}

// 3. Lees en bewaar de financiële gegevens in de lokale browseropslag.
function readStore() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {
        version: 2,
        revision: 0,
        opening: null,
        transactions: [],
        invoices: []
    };
    return validate(JSON.parse(raw));
}
function notify(text, error = false) {
    $('#message').textContent = text;
    $('#message').style.color = error ? '#a12828' : 'var(--green)';
    $('#message').setAttribute('role', error ? 'alert' : 'status');
}
let state,
    failure = null;
try {
    state = readStore();
} catch (error) {
    failure = error;
    notify('Opslag kon niet worden gelezen: ' + error.message, true);
}

// Pas een kopie aan, controleer die en sla hem daarna op.
async function commit(change) {
    if (failure) throw Error('Opslag is niet beschikbaar. Herstel de opgeslagen gegevens voordat je verdergaat.');
    const write = () => {
        const latest = readStore();
        if (latest.revision !== state.revision) {
            state = latest;
            render();
            throw Error('Gegevens zijn in een ander tabblad gewijzigd. Controleer je invoer en sla opnieuw op.');
        }
        const next = structuredClone(latest);
        change(next);
        next.revision++;
        validate(next);
        localStorage.setItem(KEY, JSON.stringify(next));
        state = next;
    };
    // Laat tabbladen om de beurt opslaan als de browser Web Locks ondersteunt.
    if (navigator.locks) await navigator.locks.request(KEY, write);else write();
    render();
}

// Vang fouten bij formulieracties op en toon een melding op de pagina.
function handle(action) {
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
function requireOpening() {
    if (!state.opening) throw Error('Stel eerst het beginsaldo in op de overzichtspagina.');
}
document.querySelectorAll('[data-unavailable]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    notify('Deze pagina is niet opgenomen in het prototype.');
}));

// 4. Werk het scherm bij wanneer een ander tabblad de opslag wijzigt.
window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    try {
        state = readStore();
        failure = null;
        render();
        notify('Financiële gegevens zijn bijgewerkt vanuit een ander tabblad. Controleer eventuele invoer voordat je opslaat.');
    } catch (error) {
        failure = error;
        notify('Opslag kon niet worden gelezen: ' + error.message, true);
    }
});
window.addEventListener('pageshow', () => {
    try {
        const latest = readStore();
        if (!state || latest.revision !== state.revision) {
            state = latest;
            render();
        }
    } catch (error) {
        failure = error;
        notify('Opslag kon niet worden gelezen: ' + error.message, true);
    }
});
if (location.protocol === 'file:') notify('Open beide pagina’s via dezelfde website (http/https). Losse lokale bestanden delen hun browseropslag niet betrouwbaar.', true);

// 5. Factuurformulier: toon het voorbeeld en laad een opgeslagen factuur.
const invoiceForm = $('#invoice-form');
let selectedId = null,
    loadedInvoice = null;
function preview() {
    const f = invoiceForm.elements;
    const paid = f.status.value === 'Betaald';
    f.paid.disabled = !paid;
    f.paid.required = paid;
    f.paid.max = today();
    f.paid.min = f.date.value;
    f.due.min = f.date.value;
    let amount = 0;
    try {
        amount = cents(f.amount.value);
    } catch {}
    const net = Math.round(amount * 100 / (100 + Number(f.vat.value))),
        vat = amount - net;
    $('#exclusive').textContent = 'Exclusief btw: ' + money(net);
    $('#vat-amount').textContent = 'Btw-bedrag: ' + money(vat);
    $('#preview-supplier').textContent = f.supplier.value || 'Leverancier';
    $('#preview-number').textContent = 'Factuurnummer: ' + (f.number.value || '—');
    $('#preview-dates').textContent = 'Datum: ' + (validDate(f.date.value) ? dateLabel(f.date.value) : '—') + ' · Vervalt: ' + (validDate(f.due.value) ? dateLabel(f.due.value) : '—');
    $('#preview-category').textContent = f.category.value || 'Omschrijving';
    $('#preview-net').textContent = money(net);
    $('#preview-rate').textContent = 'Btw ' + f.vat.value + '%';
    $('#preview-vat').textContent = money(vat);
    $('#preview-total').textContent = money(amount);
    $('#preview-payment').textContent = paid ? 'Betaald op ' + (validDate(f.paid.value) ? dateLabel(f.paid.value) : '—') : 'Openstaand · nog geen uitgave in het dashboard';
}
function loadInvoice(id) {
    const invoice = state?.invoices.find(item => item.id === id);
    selectedId = invoice?.id || null;
    loadedInvoice = invoice ? JSON.stringify(invoice) : null;
    invoiceForm.reset();
    if (invoice) {
        for (const key of ['supplier', 'number', 'category', 'date', 'due', 'vat', 'status', 'paid']) invoiceForm.elements[key].value = invoice[key] ||
            '';
        invoiceForm.elements.amount.value = (invoice.cents / 100).toFixed(2);
    } else {
        invoiceForm.elements.date.value = today();
        invoiceForm.elements.due.value = today();
        invoiceForm.elements.paid.value = today();
    }
    $('#invoice-select').value = selectedId || '';
    $('#invoice-status').textContent = invoice ? 'Opgeslagen · ' + invoice.status : 'Nieuwe factuur';
    $('#delete-invoice').hidden = !invoice;
    preview();
}

// Ververs de factuurkeuze en het totaal van de openstaande facturen.
function render() {
    if (!state) return;
    const selector = $('#invoice-select');
    selector.replaceChildren(new Option('Nieuwe factuur', ''));
    for (const invoice of state.invoices) selector.add(new Option(invoice.supplier + ' · ' + invoice.number + ' · ' + invoice.status, invoice.id));
    selector.value = selectedId || '';
    const outstanding = state.invoices.filter(i => i.status === 'Openstaand').reduce((sum, i) => sum + i.cents, 0);
    $('#invoice-totals').textContent = state.invoices.length + ' facturen · Openstaand ' + money(outstanding);
}

// 6. Koppel de invoer en knoppen aan opslaan, laden en verwijderen.
invoiceForm.addEventListener('input', preview);
invoiceForm.addEventListener('change', preview);
$('#invoice-select').addEventListener('change', event => loadInvoice(event.target.value));
$('#new-invoice').addEventListener('click', () => loadInvoice(null));
invoiceForm.addEventListener('submit', handle(async () => {
    const values = Object.fromEntries(new FormData(invoiceForm));
    const invoice = {
        id: selectedId || uid(),
        supplier: values.supplier.trim(),
        number: values.number.trim(),
        category: values.category.trim(),
        date: values.date,
        due: values.due,
        cents: cents(values.amount),
        vat: Number(values.vat),
        status: values.status,
        paid: values.status === 'Betaald' ? values.paid : null
    };
    await commit(next => {
        const existing = next.invoices.find(i => i.id === invoice.id);
        if (selectedId && (
            !existing ||
            JSON.stringify(existing) !== loadedInvoice)) throw Error('Deze factuur is elders gewijzigd of verwijderd. Selecteer de factuur opnieuw voordat je opslaat.');
        if (invoice.status === 'Betaald') requireOpening();
        const oldTransaction = next.transactions.find(tx => tx.invoiceId === invoice.id);
        next.transactions = next.transactions.filter(tx => tx.invoiceId !== invoice.id);
        if (invoice.status === 'Betaald') next.transactions.push({
            id: oldTransaction?.id || uid(),
            invoiceId: invoice.id,
            type: 'expense',
            cents: invoice.cents,
            date: invoice.paid,
            description: invoice.supplier + ' · ' + invoice.number,
            category: invoice.category
        });
        next.invoices = next.invoices.filter(i => i.id !== invoice.id);
        next.invoices.push(invoice);
    });
    loadInvoice(invoice.id);
    notify(invoice.status === 'Betaald' ? 'Factuur opgeslagen. De gekoppelde uitgave en het dashboard zijn bijgewerkt; er is geen betaling uitgevoerd.' : 'Factuur opgeslagen als openstaand. Het saldo is niet veranderd.');
}));
$('#delete-invoice').addEventListener('click', () => $('#delete-dialog').showModal());
$('#delete-dialog').addEventListener('close', async () => {
    if ($('#delete-dialog').returnValue !== 'delete') return;
    try {
        await commit(next => {
            const existing = next.invoices.find(i => i.id === selectedId);
            if (!existing ||
                JSON.stringify(existing) !== loadedInvoice) throw Error('Deze factuur is elders gewijzigd. Selecteer de factuur opnieuw.');
            next.invoices = next.invoices.filter(i => i.id !== selectedId);
            next.transactions = next.transactions.filter(tx => tx.invoiceId !== selectedId);
        });
        loadInvoice(null);
        notify('Factuur en eventuele gekoppelde uitgave verwijderd. Het dashboard is bijgewerkt.');
    } catch (error) {
        notify(error.message, true);
    }
});
if (state) {
    render();
    loadInvoice(new URLSearchParams(location.search).get('invoice'));
}
