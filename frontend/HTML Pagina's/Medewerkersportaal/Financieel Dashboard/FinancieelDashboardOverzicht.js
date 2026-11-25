import { $, today, money, dateLabel, uid, cents, notify, handle, state, start, commit, requireOpening } from './financieleOpslag.js';

function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
}
function totals() {
    let income = 0,
        expense = 0;
    for (const tx of state.transactions) {
        if (tx.type === 'income') income += tx.cents;else expense += tx.cents;
    }
    return {
        income,
        expense,
        balance: (state.opening?.cents || 0) + income - expense
    };
}
// Houd bij welke transactie wordt bewerkt of verwijderd.
let editingId = null,
    editingSnapshot = null,
    deletingId = null;
const openingForm = $('#opening-form'),
    transactionForm = $('#transaction-form');
openingForm.elements.date.value = today();
transactionForm.elements.date.value = today();
function resetTransaction() {
    editingId = null;
    editingSnapshot = null;
    transactionForm.reset();
    transactionForm.elements.date.value = today();
    $('#entry-title').textContent = 'Transactie toevoegen';
    $('#cancel-edit').hidden = true;
}

// Teken de saldogeschiedenis met de opgeslagen dagtotalen.
function drawChart() {
    const svg = $('#balance-chart');
    svg.replaceChildren();
    const width = Math.max(280, svg.clientWidth || 1000),
        left = 110,
        right = width - 16;
    svg.setAttribute('viewBox', `0 0 ${width} 220`);
    const ns = 'http://www.w3.org/2000/svg';
    function add(tag, attributes, text) {
        const n = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(attributes)) n.setAttribute(key, value);
        if (text !== undefined) n.textContent = text;
        svg.append(n);
        return n;
    }
    if (!state.opening) {
        add('text', {
            x: width / 2,
            y: 110,
            'text-anchor': 'middle',
            fill: '#707988',
            'font-size': 13
        }, 'Stel eerst het beginsaldo in.');
        return;
    }
    const start = Date.parse(state.opening.date + 'T00:00:00Z'),
        end = Date.parse(today() + 'T00:00:00Z');
    const grouped = new Map();
    for (const tx of state.transactions) grouped.set(tx.date, (grouped.get(tx.date) ||
        0) + (tx.type === 'income' ? tx.cents : -tx.cents));
    const points = [{
            date: state.opening.date,
            value: state.opening.cents
        }],
        dates = [...grouped.keys()].sort();
    let balance = state.opening.cents;
    for (const date of dates) {
        balance += grouped.get(date);
        points.push({
            date,
            value: balance
        });
    }
    if (points.at(-1).date !== today()) points.push({
        date: today(),
        value: balance
    });
    let low = Math.min(...points.map(p => p.value)),
        high = Math.max(...points.map(p => p.value));
    const padding = Math.max(100, (high - low) * 0.12);
    low -= padding;
    high += padding;
    const x = date => end === start ? (left + right) / 2 : left + (Date.parse(date + 'T00:00:00Z') - start) / (end - start) * (right - left);
    const y = value => 175 - (value - low) / (high - low) * 150;
    for (let i = 0; i < 4; i++) {
        const value = low + (high - low) * i / 3,
            yy = y(value);
        add('line', {
            x1: left,
            y1: yy,
            x2: right,
            y2: yy,
            stroke: '#e3e5e9'
        });
        add('text', {
            x: left - 10,
            y: yy + 4,
            'text-anchor': 'end',
            fill: '#707988',
            'font-size': 12
        }, money(Math.round(value)));
    }
    let line = `M ${x(points[0].date)} ${y(points[0].value)}`;
    for (const point of points.slice(1)) line += ` H ${x(point.date)} V ${y(point.value)}`;
    add('path', {
        d: line,
        fill: 'none',
        stroke: '#536333',
        'stroke-width': 2
    });
    for (const point of points) {
        const dot = add('circle', {
            cx: x(point.date),
            cy: y(point.value),
            r: 3,
            fill: '#536333'
        });
        const title = document.createElementNS(ns, 'title');
        title.textContent = dateLabel(point.date) + ': ' + money(point.value);
        dot.append(title);
    }
    const tick = date => new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    }).format(new Date(date + 'T12:00:00'));
    if (start === end) add('text', {
        x: (left + right) / 2,
        y: 210,
        'text-anchor': 'middle',
        fill: '#707988',
        'font-size': 12
    }, tick(today()));else {
        add('text', {
            x: left,
            y: 210,
            fill: '#707988',
            'font-size': 12
        }, tick(state.opening.date));
        add('text', {
            x: right,
            y: 210,
            'text-anchor': 'end',
            fill: '#707988',
            'font-size': 12
        }, tick(today()));
    }
    svg.setAttribute('aria-label', `Beginsaldo ${money(state.opening.cents)} op ${dateLabel(state.opening.date)}; huidig saldo ${money(balance)} op ${dateLabel(today())}. Dagtotalen; exacte bedragen staan in de transactielijst.`);
}

// Ververs bedragen, formulieren, transactielijst en grafiek.
function render() {
    if (!state) return;
    const {
        income,
        expense,
        balance
    } = totals();
    const period = state.opening ? dateLabel(state.opening.date) + ' t/m ' + dateLabel(today()) : 'Stel eerst het beginsaldo in';
    $('#period').textContent = period;
    document.querySelectorAll('.period-label').forEach(n => n.textContent = period);
    for (const [id, value] of Object.entries({
        balance,
        income,
        expense
    })) $('#' + id).textContent = state.opening ? money(value) : '—';
    $('#as-of').textContent = state.opening ? 'Saldo op ' + dateLabel(today()) : period;
    $('#chart-period').textContent = period;
    $('#net').textContent = 'Netto verandering ' + money(income - expense);
    $('#opening-label').textContent = state.opening ? 'Beginsaldo ' + dateLabel(state.opening.date) + ': ' + money(state.opening.cents) : 'Geen beginsaldo ingesteld';
    $('#equation').textContent = state.opening ? `${money(state.opening.cents)} + ${money(income)} − ${money(expense)} = ${money(balance)}` : '';
    if (!openingForm.contains(document.activeElement)) {
        openingForm.elements.amount.value = state.opening ? (state.opening.cents / 100).toFixed(2) : '';
        openingForm.elements.date.value = state.opening?.date || today();
    }
    openingForm.elements.date.max = today();
    transactionForm.elements.date.max = today();
    transactionForm.elements.date.min = state.opening?.date || '';
    transactionForm.querySelectorAll('input,select,button').forEach(n => n.disabled = !state.opening);
    $('#transaction-count').textContent = state.transactions.length + ' transacties';
    const container = $('#transactions');
    container.replaceChildren();
    const sorted = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    if (!sorted.length) container.append(element('p', 'Nog geen transacties.', 'empty'));
    for (const tx of sorted) {
        const row = element('article', undefined, 'ledger-row');
        const text = element('div');
        text.append(element('b', tx.description), element('div', tx.category + ' · ' + dateLabel(tx.date), 'muted'));
        row.append(text, element('strong', (tx.type === 'income' ? '+ ' : '− ') + money(tx.cents)));
        const actions = element('div', undefined, 'entry-actions');
        if (tx.invoiceId) {
            const link = element('a', 'Factuur bewerken', 'button');
            link.href = 'financieelDashboardFacturen.html?invoice=' + encodeURIComponent(tx.invoiceId);
            actions.append(link);
        } else {
            const edit = element('button', 'Bewerken');
            edit.type = 'button';
            edit.addEventListener('click', () => {
                editingId = tx.id;
                editingSnapshot = JSON.stringify(tx);
                for (const name of ['type', 'description', 'category', 'date']) transactionForm.elements[name].value = tx[name];
                transactionForm.elements.amount.value = (tx.cents / 100).toFixed(2);
                $('#entry-title').textContent = 'Transactie bewerken';
                $('#cancel-edit').hidden = false;
                transactionForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });
            const remove = element('button', 'Verwijderen');
            remove.type = 'button';
            remove.addEventListener('click', () => {
                deletingId = tx.id;
                $('#delete-dialog').returnValue = '';
                $('#delete-dialog').showModal();
            });
            actions.append(edit, remove);
        }
        row.append(actions);
        container.append(row);
    }
    drawChart();
}

// Verwerk het beginsaldo, transacties en de verwijderbevestiging.
openingForm.addEventListener('submit', handle(async () => {
    const opening = {
        cents: cents(openingForm.elements.amount.value, true),
        date: openingForm.elements.date.value
    };
    await commit(next => {
        if (next.transactions.some(tx => tx.date < opening.date)) throw Error('De startdatum mag niet na een bestaande transactie liggen.');
        next.opening = opening;
    });
    $('#opening-panel').open = false;
    notify('Beginsaldo tijdelijk aangepast. Alle bedragen zijn opnieuw berekend.');
}));
transactionForm.addEventListener('submit', handle(async () => {
    requireOpening();
    const values = Object.fromEntries(new FormData(transactionForm));
    const tx = {
        id: editingId || uid(),
        type: values.type,
        cents: cents(values.amount),
        date: values.date,
        description: values.description.trim(),
        category: values.category.trim(),
        invoiceId: null
    };
    await commit(next => {
        const existing = next.transactions.find(t => t.id === tx.id);
        if (editingId && (
            !existing ||
            JSON.stringify(existing) !== editingSnapshot)) throw Error('Deze transactie is elders gewijzigd of verwijderd. Klik opnieuw op Bewerken.');
        if (existing?.invoiceId) throw Error('Bewerk deze uitgave via de factuurpagina.');
        next.transactions = next.transactions.filter(t => t.id !== tx.id);
        next.transactions.push(tx);
    });
    resetTransaction();
    notify('Transactie verwerkt in deze weergave. Het saldo en de grafiek zijn bijgewerkt.');
}));
$('#cancel-edit').addEventListener('click', resetTransaction);
$('#delete-dialog').addEventListener('close', async () => {
    if ($('#delete-dialog').returnValue !== 'delete') return;
    try {
        await commit(next => {
            const tx = next.transactions.find(t => t.id === deletingId);
            if (!tx || tx.invoiceId) throw Error('Deze transactie kan hier niet worden verwijderd.');
            next.transactions = next.transactions.filter(t => t.id !== deletingId);
        });
        if (editingId === deletingId) resetTransaction();
        notify('Transactie verwijderd. Totalen zijn bijgewerkt.');
    } catch (error) {
        notify(error.message, true);
    }
});
start(render, () => { $('#opening-panel').open = !state.opening; });
let previousChartWidth = 0;
new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (state && width !== previousChartWidth) {
        previousChartWidth = width;
        drawChart();
    }
}).observe($('#balance-chart'));
