const classesElement = document.querySelector('#classes');
const enrollmentStorageKey = 'avond4daagse-aangemelde-leerlingen';
const classesStorageKey = 'avond4daagse-klassen';

let classes = [];

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function prepareClasses() {
    classes.forEach((group) => {
        group.leerlingen = Array.isArray(group.leerlingen) ? group.leerlingen : [];
        group.leerlingen.forEach((student) => {
            student.id ??= createId('student');
            student.aangemeld = Boolean(student.aangemeld);
            student.afstand ??= 'n.v.t.';
            student.eerdereDeelname ??= 'n.v.t.';
            student.opmerkingen ??= 'n.v.t.';
        });
    });
}

function saveClasses() {
    localStorage.setItem(classesStorageKey, JSON.stringify({ klassen: classes }));
}

function saveEnrollmentState() {
    const state = {};
    classes.forEach((group) => group.leerlingen.forEach((student) => {
        state[student.id] = {
            aangemeld: Boolean(student.aangemeld),
            afstand: student.afstand || 'n.v.t.',
            eerdereDeelname: student.eerdereDeelname || 'n.v.t.',
            opmerkingen: student.opmerkingen || 'n.v.t.'
        };
    }));
    localStorage.setItem(enrollmentStorageKey, JSON.stringify(state));
}

function restoreEnrollmentState() {
    try {
        const state = JSON.parse(localStorage.getItem(enrollmentStorageKey) || '{}');
        classes.forEach((group) => group.leerlingen.forEach((student) => {
            const saved = state[student.id];
            if (!saved) return;
            if (typeof saved === 'boolean') {
                student.aangemeld = saved;
                return;
            }
            student.aangemeld = Boolean(saved.aangemeld);
            student.afstand = saved.afstand || 'n.v.t.';
            student.eerdereDeelname = saved.eerdereDeelname || 'n.v.t.';
            student.opmerkingen = saved.opmerkingen || 'n.v.t.';
        }));
    } catch (error) {
        console.warn('De opgeslagen aanmeldgegevens konden niet worden geladen.', error);
    }
}

function findGroup(card) {
    return classes.find((group) => String(group.nummer) === String(card.dataset.class));
}

function findStudent(card, studentCard) {
    const group = findGroup(card);
    const student = group?.leerlingen.find((item) => item.id === studentCard?.dataset.studentId);
    return { group, student };
}

function renderClasses() {
    classesElement.innerHTML = classes.map(renderGroup).join('') + renderGroupManagement();
    bindEvents();
}

function renderGroup(group) {
    return `
        <article class="class-card" data-class="${escapeHtml(group.nummer)}">
            <div class="class-header" role="button" tabindex="0" aria-expanded="true">
                <div class="class-title">
                    <span class="class-icon"><i class="fa-solid fa-school"></i></span>
                    <span>Groep ${escapeHtml(group.nummer)}</span>
                </div>
                <div class="class-header-actions">
                    <div class="class-actions">
                        <button class="delete-class-button" type="button" data-action="delete-class">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    <span class="chevron">⌄</span>
                </div>
            </div>
            <div class="class-body">
                ${group.leerlingen.length ? `<div class="student-grid">${group.leerlingen.map(renderStudent).join('')}</div>` : '<p class="empty-class">Nog geen leerlingen toegevoegd.</p>'}
                <div class="add-form-container"></div>
                <button class="add-student" type="button"><i class="fa-solid fa-plus"></i> Leerling toevoegen</button>
            </div>
        </article>
    `;
}

function renderStudent(student) {
    return `
        <article class="student-card" data-student-id="${escapeHtml(student.id)}">
            <div class="student-card-heading">
                <div class="student-identity">
                    <span class="student-avatar"><i class="fa-solid fa-child"></i></span>
                    <div>
                        <h3>${escapeHtml(student.naam)}</h3>
                        <p>Leerling uit klas ${escapeHtml(student.klas)}</p>
                    </div>
                </div>
                <div class="student-card-status-actions">
                    <span class="enrollment-status ${student.aangemeld ? 'is-enrolled' : ''}">
                        <i class="fa-solid ${student.aangemeld ? 'fa-check' : 'fa-clock'}"></i>
                        ${student.aangemeld ? 'Aangemeld' : 'Nog niet aangemeld'}
                    </span>
                    <button class="action-button ${student.aangemeld ? 'enrolled' : ''}" type="button" data-action="enroll">
                        <i class="fa-solid ${student.aangemeld ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                        ${student.aangemeld ? 'Uitschrijven' : 'Aanmelden'}
                    </button>
                </div>
            </div>
            <div class="student-details">
                <div class="student-detail"><span>Contactpersoon</span><strong>${escapeHtml(student.contactpersoon)}</strong></div>
                <div class="student-detail"><span>Afstand</span><strong>${student.afstand === 'n.v.t.' ? 'n.v.t.' : `<span class="distance">${escapeHtml(student.afstand)}</span>`}</strong></div>
                <div class="student-detail"><span>Eerdere deelname</span><strong>${escapeHtml(student.eerdereDeelname)}</strong></div>
                <div class="student-detail student-detail-wide"><span>Opmerkingen</span><strong>${escapeHtml(student.opmerkingen)}</strong></div>
            </div>
            <div class="row-actions">
                <button class="edit-button" type="button" data-action="edit"><i class="fa-solid fa-pen"></i> Bewerken</button>
                <button class="delete-button" type="button" data-action="delete"><i class="fa-solid fa-trash"></i> Verwijderen</button>
            </div>
        </article>
    `;
}

function renderEnrollmentForm() {
    const distances = ['2,5km', '5km'].map((value) => `<option value="${value}">${value}</option>`).join('');
    const participations = Array.from({ length: 10 }, (_, index) => {
        const value = `${index + 1}e keer`;
        return `<option value="${value}">${value}</option>`;
    }).join('');

    return `
        <div class="enrollment-panel">
            <div class="enrollment-form">
                <label>Gekozen afstand<select name="enrollment-distance" required><option value="">Kies afstand</option>${distances}</select></label>
                <label>Eerdere deelname<select name="enrollment-participation" required><option value="">Kies deelname</option>${participations}</select></label>
                <label class="enrollment-comments">Opmerkingen<input name="enrollment-comments" type="text" placeholder="Optionele opmerking"></label>
                <div class="enrollment-actions"><button class="save-button" type="button" data-action="save-enrollment">Opslaan</button><button class="cancel-button" type="button" data-action="cancel-enrollment">Annuleren</button></div>
            </div>
        </div>
    `;
}

function renderEditForm(student) {
    return `
        <div class="edit-card-form">
            <div class="edit-card-grid">
                <label>Naam kind<input name="edit-naam" value="${escapeHtml(student.naam)}" required></label>
                <label>Contactpersoon<input name="edit-contactpersoon" value="${escapeHtml(student.contactpersoon)}" required></label>
                <label>Klas<input name="edit-klas" value="${escapeHtml(student.klas)}" required></label>
            </div>
            <div class="row-actions"><button class="save-button" type="button" data-action="save-edit">Opslaan</button><button class="cancel-button" type="button" data-action="cancel-edit">Annuleren</button></div>
        </div>
    `;
}

function renderAddStudentForm() {
    return `
        <div class="add-student-form">
            <label>Naam kind<input name="new-naam" placeholder="Bijv. Tess" required></label>
            <label>Contactpersoon<input name="new-contactpersoon" placeholder="Naam contactpersoon" required></label>
            <label>Klas<input name="new-klas" placeholder="Bijv. 1a" required></label>
            <div class="row-actions"><button class="save-button" type="button" data-action="save-student">Opslaan</button><button class="cancel-button" type="button" data-action="cancel-student">Annuleren</button></div>
        </div>
    `;
}

function renderGroupManagement() {
    return `<section class="group-management"><button class="add-class-button" type="button" data-action="show-add-class"><i class="fa-solid fa-plus"></i> Groep toevoegen</button><div class="add-class-container"></div></section>`;
}

function renderAddClassForm() {
    return `<form class="add-class-form"><label>Naam van de groep<input name="class-number" placeholder="Bijv. 2a" required></label><button class="save-button" type="submit">Opslaan</button><button class="cancel-button" type="button" data-action="cancel-class">Annuleren</button></form>`;
}

function renderEditClassForm(group) {
    return `<form class="edit-class-form"><label>Naam van de groep<input name="class-number" value="${escapeHtml(group.nummer)}" required></label><button class="save-button" type="submit">Opslaan</button><button class="cancel-button" type="button" data-action="cancel-class-edit">Annuleren</button></form>`;
}

function uniqueGroupName(name, currentGroup = null) {
    return name && !classes.some((group) => group !== currentGroup && String(group.nummer).toLowerCase() === name.toLowerCase());
}

function bindEvents() {
    document.querySelectorAll('.class-header').forEach((header) => {
        header.addEventListener('click', () => {
            const card = header.closest('.class-card');
            const collapsed = card.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!collapsed));
        });
        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                header.click();
            }
        });
    });

    document.querySelectorAll('.class-header button').forEach((button) => button.addEventListener('click', (event) => event.stopPropagation()));

    document.querySelectorAll('[data-action="enroll"]').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const studentCard = button.closest('.student-card');
        const { student } = findStudent(card, studentCard);
        if (!student) return;

        if (student.aangemeld) {
            student.aangemeld = false;
            student.afstand = 'n.v.t.';
            student.eerdereDeelname = 'n.v.t.';
            student.opmerkingen = 'n.v.t.';
            saveEnrollmentState();
            renderClasses();
            return;
        }

        if (!studentCard.querySelector('.enrollment-panel')) {
            studentCard.insertAdjacentHTML('beforeend', renderEnrollmentForm());
            bindEnrollment(studentCard.querySelector('.enrollment-panel'));
        }
    }));

    document.querySelectorAll('[data-action="edit"]').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const studentCard = button.closest('.student-card');
        const { student } = findStudent(card, studentCard);
        if (!student) return;
        studentCard.innerHTML = renderEditForm(student);
        bindEdit(studentCard);
        studentCard.querySelector('input').focus();
    }));

    document.querySelectorAll('[data-action="delete"]').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const studentCard = button.closest('.student-card');
        const { group, student } = findStudent(card, studentCard);
        if (!group || !student || !confirm(`Weet je zeker dat je ${student.naam} wilt verwijderen?`)) return;
        group.leerlingen = group.leerlingen.filter((item) => item.id !== student.id);
        saveClasses();
        saveEnrollmentState();
        renderClasses();
    }));

    document.querySelectorAll('.add-student').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const container = card.querySelector('.add-form-container');
        if (container.innerHTML) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = renderAddStudentForm();
        bindAddStudent(container, findGroup(card));
        container.querySelector('input').focus();
    }));

    document.querySelectorAll('[data-action="show-add-class"]').forEach((button) => button.addEventListener('click', () => {
        const container = document.querySelector('.add-class-container');
        if (container.innerHTML) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = renderAddClassForm();
        bindAddClass(container);
        container.querySelector('input').focus();
    }));

    document.querySelectorAll('[data-action="edit-class"]').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const group = findGroup(card);
        const actions = card.querySelector('.class-actions');
        actions.innerHTML = renderEditClassForm(group);
        bindEditClass(actions, group);
        actions.querySelector('input').focus();
    }));

    document.querySelectorAll('[data-action="delete-class"]').forEach((button) => button.addEventListener('click', () => {
        const card = button.closest('.class-card');
        const group = findGroup(card);
        if (!group || !confirm(`Weet je zeker dat je groep ${group.nummer} en alle leerlingen wilt verwijderen?`)) return;
        classes = classes.filter((item) => item !== group);
        saveClasses();
        saveEnrollmentState();
        renderClasses();
    }));
}

function bindEnrollment(panel) {
    panel.querySelector('[data-action="save-enrollment"]').addEventListener('click', () => {
        const card = panel.closest('.class-card');
        const studentCard = panel.closest('.student-card');
        const { student } = findStudent(card, studentCard);
        const distance = panel.querySelector('[name="enrollment-distance"]').value;
        const participation = panel.querySelector('[name="enrollment-participation"]').value;
        if (!student || !distance || !participation) return;
        student.aangemeld = true;
        student.afstand = distance;
        student.eerdereDeelname = participation;
        student.opmerkingen = panel.querySelector('[name="enrollment-comments"]').value.trim() || 'n.v.t.';
        saveEnrollmentState();
        renderClasses();
    });
    panel.querySelector('[data-action="cancel-enrollment"]').addEventListener('click', () => panel.remove());
}

function bindEdit(studentCard) {
    studentCard.querySelector('[data-action="save-edit"]').addEventListener('click', () => {
        const { student } = findStudent(studentCard.closest('.class-card'), studentCard);
        const values = ['edit-naam', 'edit-contactpersoon', 'edit-klas'].map((name) => studentCard.querySelector(`[name="${name}"]`).value.trim());
        if (!student || values.some((value) => !value)) return;
        [student.naam, student.contactpersoon, student.klas] = values;
        saveClasses();
        renderClasses();
    });
    studentCard.querySelector('[data-action="cancel-edit"]').addEventListener('click', renderClasses);
}

function bindAddStudent(container, group) {
    container.querySelector('[data-action="save-student"]').addEventListener('click', () => {
        const values = ['new-naam', 'new-contactpersoon', 'new-klas'].map((name) => container.querySelector(`[name="${name}"]`).value.trim());
        if (values.some((value) => !value)) return;
        group.leerlingen.push({ id: createId('student'), naam: values[0], contactpersoon: values[1], klas: values[2], afstand: 'n.v.t.', eerdereDeelname: 'n.v.t.', opmerkingen: 'n.v.t.', aangemeld: false });
        saveClasses();
        renderClasses();
    });
    container.querySelector('[data-action="cancel-student"]').addEventListener('click', () => container.innerHTML = '');
}

function bindAddClass(container) {
    const form = container.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = form.querySelector('input').value.trim();
        if (!uniqueGroupName(name)) return;
        classes.push({ nummer: name, leerlingen: [] });
        saveClasses();
        renderClasses();
    });
    container.querySelector('[data-action="cancel-class"]').addEventListener('click', () => container.innerHTML = '');
}

function bindEditClass(actions, group) {
    const form = actions.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = form.querySelector('input').value.trim();
        if (!uniqueGroupName(name, group)) return;
        group.nummer = name;
        saveClasses();
        renderClasses();
    });
    actions.querySelector('[data-action="cancel-class-edit"]').addEventListener('click', renderClasses);
}

async function loadClasses() {
    try {
        const stored = JSON.parse(localStorage.getItem(classesStorageKey) || 'null');
        if (stored?.klassen && Array.isArray(stored.klassen)) {
            classes = stored.klassen;
        } else {
            const response = await fetch('klassenbeheerScholen.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP-fout ${response.status}`);
            const data = await response.json();
            classes = Array.isArray(data.klassen) ? data.klassen : [];
            saveClasses();
        }
        prepareClasses();
        restoreEnrollmentState();
        renderClasses();
    } catch (error) {
        classesElement.innerHTML = '<p class="status-message">De klassen konden niet worden geladen. Open deze pagina via Live Server in VS Code.</p>';
        console.error(error);
    }
}

loadClasses();
