const totalEnrolledElement = document.querySelector('#total-enrolled');
const totalClassesElement = document.querySelector('#total-classes');
const breakdownElement = document.querySelector('#class-breakdown');
const stampCountInput = document.querySelector('#stamp-count');
const termsInput = document.querySelector('#terms');
const submitButton = document.querySelector('#submit-request');
const formMessage = document.querySelector('#form-message');

const enrollmentStorageKey = 'avond4daagse-aangemelde-leerlingen';

function getStoredEnrollmentState() {
  try {
    return JSON.parse(localStorage.getItem(enrollmentStorageKey) || '{}');
  } catch {
    return {};
  }
}

function applyStoredEnrollmentState(classes) {
  const storedState = getStoredEnrollmentState();

  classes.forEach((group) => {
    group.leerlingen.forEach((student, index) => {
      const key = `${group.nummer}-${index}`;

      if (Object.prototype.hasOwnProperty.call(storedState, key)) {
        student.aangemeld = storedState[key];
      }
    });
  });
}

function getEnrolledStudents(group) {
  return group.leerlingen.filter((student) => student.aangemeld);
}

function renderOverview(classes) {
  const totalEnrolled = classes.reduce(
    (total, group) => total + getEnrolledStudents(group).length,
    0
  );

  totalEnrolledElement.textContent = `${totalEnrolled} leerlingen`;
  totalClassesElement.textContent = classes.length;
  stampCountInput.value = totalEnrolled;

  breakdownElement.innerHTML = classes.map((group) => `
    <div class="class-row">
      <span>Groep ${group.nummer}</span>
      <strong>${getEnrolledStudents(group).length}</strong>
    </div>
  `).join('');
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? '#a53e3e' : '';
}

async function loadStampCardOverview() {
  try {
    const response = await fetch('klassenbeheerScholen.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP-fout ${response.status}`);
    }

    const data = await response.json();
    const classes = Array.isArray(data.klassen) ? data.klassen : [];

    applyStoredEnrollmentState(classes);
    renderOverview(classes);
  } catch (error) {
    breakdownElement.innerHTML = '<p>De klassen konden niet worden geladen.</p>';
    showMessage('Open deze pagina via Live Server in VS Code.', true);
    console.error(error);
  }
}

submitButton.addEventListener('click', () => {
  const amount = Number(stampCountInput.value);

  if (!termsInput.checked) {
    showMessage('Ga akkoord met de voorwaarden om verder te gaan.', true);
    return;
  }

  if (!Number.isInteger(amount) || amount < 0) {
    showMessage('Vul een geldig aantal stempelkaarten in.', true);
    return;
  }

  showMessage(`${amount} stempelkaarten zijn klaar om aangevraagd te worden.`);
});

loadStampCardOverview();