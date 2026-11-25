import { $, today, money, dateLabel, uid, cents, notify, handle, state, start, commit, requireOpening, validDate } from './financieleOpslag.js';
import { bestandsUrl, readUpload } from '../voorbeeldgegevens.js';

// Factuurformulier: toon het voorbeeld en laad een opgeslagen factuur.
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
        for (const key of ['supplier', 'number', 'category', 'date', 'due', 'vat', 'status', 'paid']) invoiceForm.elements[key].value = invoice[key] ?? '';
        invoiceForm.elements.amount.value = (invoice.cents / 100).toFixed(2);
    } else {
        invoiceForm.elements.date.value = today();
        invoiceForm.elements.due.value = today();
        invoiceForm.elements.paid.value = today();
    }
    $('#invoice-select').value = selectedId || '';
    $('#invoice-status').textContent = invoice ? invoice.status : 'Nieuwe factuur';
    $('#delete-invoice').hidden = !invoice;
    const fileLink = $('#invoice-download');
    fileLink.hidden = !invoice?.attachment;
    fileLink.removeAttribute('href');
    if (invoice?.attachment) {
        fileLink.href = bestandsUrl(invoice.attachment);
        fileLink.download = invoice.attachment.name;
        fileLink.textContent = 'Download ' + invoice.attachment.name;
    }
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

// Koppel de invoer en knoppen aan opslaan, laden en verwijderen.
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
    const file = invoiceForm.elements.attachment.files[0];
    const snapshot = loadedInvoice;
    const editing = Boolean(selectedId);
    const attachment = file ? await readUpload(file) : null;
    await commit(next => {
        const existing = next.invoices.find(i => i.id === invoice.id);
        invoice.attachment = attachment ?? existing?.attachment ?? null;
        if (editing && (
            !existing ||
            JSON.stringify(existing) !== snapshot)) throw Error('Deze factuur is elders gewijzigd of verwijderd. Selecteer de factuur opnieuw voordat je opslaat.');
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
    notify('Factuur tijdelijk bijgewerkt als ' + invoice.status.toLowerCase() + '.');
}));
$('#delete-invoice').addEventListener('click', () => {
    $('#delete-dialog').returnValue = '';
    $('#delete-dialog').showModal();
});
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
        notify('Factuur en eventuele gekoppelde uitgave uit deze weergave verwijderd.');
    } catch (error) {
        notify(error.message, true);
    }
});
start(render, () => loadInvoice(new URLSearchParams(location.search).get('invoice')));
