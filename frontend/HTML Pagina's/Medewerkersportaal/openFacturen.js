import { leesVoorbeeldgegevens } from './voorbeeldgegevens.js';

const money = cents => (cents / 100).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });

async function loadInvoices() {
    const list = document.querySelector('#open-invoices');
    try {
        const { invoices } = await leesVoorbeeldgegevens('financien.json');
        const open = invoices.filter(invoice => invoice.status === 'Openstaand');
        document.querySelector('#open-total').textContent = money(open.reduce((sum, invoice) => sum + invoice.cents, 0));
        list.replaceChildren();
        for (const invoice of open) {
            const link = document.createElement('a');
            link.href = 'Financieel Dashboard/financieelDashboardFacturen.html?invoice=' + encodeURIComponent(invoice.id);
            link.textContent = 'Factuur ' + invoice.number + ' · ' + money(invoice.cents);
            list.append(link, document.createElement('br'));
        }
        if (!open.length) list.textContent = 'Geen openstaande facturen.';
    } catch (error) {
        list.textContent = error.message;
    }
}

loadInvoices();
