export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date());

export function validDate(date) {
    return typeof date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !isNaN(Date.parse(date)) &&
        new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) === date;
}
function nonempty(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

// Controleer de opgeslagen gegevens voordat ze worden gebruikt of bewaard.
export function validate(store) {
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
