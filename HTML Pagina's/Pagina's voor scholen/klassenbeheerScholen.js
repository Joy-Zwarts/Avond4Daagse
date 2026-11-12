const classesElement = document.querySelector('#classes');

const headers = [
  'Naam kind',
  'Contactpersoon',
  'Klas',
  'Gekozen afstand',
  'Eerdere deelname',
  'Opmerkingen',
  ''
];

let classes = [];
const enrollmentStorageKey = 'avond4daagse-aangemelde-leerlingen';

function saveEnrollmentState() {
  const state = {};

  classes.forEach((group) => {
    group.leerlingen.forEach((student, index) => {
      state[`${group.nummer}-${index}`] = Boolean(student.aangemeld);
    });
  });

  localStorage.setItem(enrollmentStorageKey, JSON.stringify(state));
}

function restoreEnrollmentState() {
  try {
    const state = JSON.parse(localStorage.getItem(enrollmentStorageKey) || '{}');

    classes.forEach((group) => {
      group.leerlingen.forEach((student, index) => {
        const key = `${group.nummer}-${index}`;

        if (Object.prototype.hasOwnProperty.call(state, key)) {
          student.aangemeld = Boolean(state[key]);
        }
      });
    });
  } catch (error) {
    console.warn('De opgeslagen aanmeldstatus kon niet worden geladen.', error);
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderClasses() {
  classesElement.innerHTML = classes.map((group) => `
    <article class="class-card" data-class="${group.nummer}">
      <div class="class-header" role="button" tabindex="0" aria-expanded="true">
        <div class="class-title">
          <span class="class-icon">▱</span>
          <span>Groep ${escapeHtml(group.nummer)}</span>
        </div>
        <span class="chevron">⌄</span>
      </div>

      <div class="class-body">
        ${group.leerlingen.length ? renderTable(group.leerlingen) : ''}
        <div class="add-form-container"></div>
        <button class="add-student" type="button">
          <span>♙</span>
          Voeg een leerling toe
        </button>
      </div>
    </article>
  `).join('');

  bindEvents();
}

function renderTable(students) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${students.map((student, index) => `
            <tr>
              <td>${escapeHtml(student.naam)}</td>
              <td>${escapeHtml(student.contactpersoon)}</td>
              <td>${escapeHtml(student.klas)}</td>
              <td>${student.afstand === 'n.v.t.' ? 'n.v.t.' : `<span class="distance">${escapeHtml(student.afstand)}</span>`}</td>
              <td>${escapeHtml(student.eerdereDeelname)}</td>
              <td>${escapeHtml(student.opmerkingen)}</td>
              <td>
                <button class="action-button ${student.aangemeld ? 'enrolled' : ''}" type="button" data-student-index="${index}">
                  ${student.aangemeld ? 'Aangemeld' : 'Aanmelden'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderForm(groupNumber) {
  return `
    <div class="table-wrap">
      <table class="add-row">
        <tbody>
          <tr>
            <td>
              <strong>Voornaam</strong>
              <input name="naam" type="text" placeholder="Bijv. Tess">
            </td>
            <td>
              <strong>Contactpersoon</strong>
              <input name="contactpersoon" type="text" placeholder="James McGill">
            </td>
            <td>
              <strong>Klas</strong>
              <input name="klas" type="text" value="${escapeHtml(groupNumber)}" readonly>
            </td>
            <td>
              <strong>Afstand</strong>
              <select name="afstand">
                <option value="">Kies afstand</option>
                <option value="2,5km">2,5km</option>
                <option value="5km">5km</option>
              </select>
            </td>
            <td>
              <strong>Eerdere deelname</strong>
              <select name="eerdereDeelname">
                <option value="n.v.t.">n.v.t.</option>
                <option value="1e keer">1e keer</option>
                <option value="2e keer">2e keer</option>
                <option value="3e keer">3e keer</option>
              </select>
            </td>
            <td>
              <strong>Opmerkingen</strong>
              <input name="opmerkingen" type="text" placeholder="Opmerking">
            </td>
            <td>
              <button class="save-button" type="button">Opslaan</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
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

  document.querySelectorAll('.action-button').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.class-card');
      const group = classes.find((item) => item.nummer === Number(card.dataset.class));
      const student = group.leerlingen[Number(button.dataset.studentIndex)];

      student.aangemeld = !student.aangemeld;
      saveEnrollmentState();
      button.classList.toggle('enrolled', student.aangemeld);
      button.textContent = student.aangemeld ? 'Aangemeld' : 'Aanmelden';
    });
  });

  document.querySelectorAll('.add-student').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.class-card');
      const groupNumber = Number(card.dataset.class);
      const formContainer = card.querySelector('.add-form-container');

      if (formContainer.innerHTML) {
        formContainer.innerHTML = '';
        return;
      }

      formContainer.innerHTML = renderForm(groupNumber);
      formContainer.querySelector('input[name="naam"]').focus();
      bindSaveEvent(formContainer, groupNumber);
    });
  });
}

function bindSaveEvent(formContainer, groupNumber) {
  formContainer.querySelector('.save-button').addEventListener('click', () => {
    const getValue = (name) => formContainer.querySelector(`[name="${name}"]`).value.trim();
    const name = getValue('naam');

    if (!name) {
      formContainer.querySelector('[name="naam"]').focus();
      return;
    }

    const group = classes.find((item) => item.nummer === groupNumber);

    group.leerlingen.push({
      naam: name,
      contactpersoon: getValue('contactpersoon') || 'James McGill',
      klas: getValue('klas'),
      afstand: getValue('afstand') || 'n.v.t.',
      eerdereDeelname: getValue('eerdereDeelname') || 'n.v.t.',
      opmerkingen: getValue('opmerkingen') || 'n.v.t.',
      aangemeld: false
    });

    renderClasses();
  });
}

async function loadClasses() {
  try {
    const response = await fetch('klassenbeheerScholen.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP-fout ${response.status}`);
    }

    const data = await response.json();
    classes = Array.isArray(data.klassen) ? data.klassen : [];
    restoreEnrollmentState();
    renderClasses();
  } catch (error) {
    classesElement.innerHTML = `
      <p class="status-message">
        De klassen konden niet worden geladen. Open deze pagina via Live Server in VS Code.
      </p>
    `;
    console.error(error);
  }
}

loadClasses();