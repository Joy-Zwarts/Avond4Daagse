const dataUrl = './aanmeldingenIndividueel.json';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createRows(signup) {
  return signup.kinderen.map((child) => `
    <tr>
      <td>${escapeHtml(child.naam)}</td>
      <td>${escapeHtml(child.school)}</td>
      <td>${escapeHtml(child.klas)}</td>
      <td>${escapeHtml(child.schooljaar)}</td>
      <td><span class="badge">${escapeHtml(child.afstand)}</span></td>
      <td>${escapeHtml(child.deelname)}</td>
      <td>${escapeHtml(child.opmerkingen || 'n.v.t.')}</td>
    </tr>
  `).join('');
}

function createSignupCard(signup) {
  return `
    <article class="signup-card">
      <div class="contact-details">
        <div>Naam contactpersoon: <strong>${escapeHtml(signup.contactpersoon)}</strong></div>
        <div>Telefoonnummer: <strong>${escapeHtml(signup.telefoonnummer)}</strong></div>
        <div>Email: <strong>${escapeHtml(signup.email)}</strong></div>
        <div>Postcode: <strong>${escapeHtml(signup.postcode)}</strong></div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Naam kind</th>
              <th>School</th>
              <th>Klas</th>
              <th>Schooljaar</th>
              <th>Gekozen afstand</th>
              <th>Eerdere deelname</th>
              <th>Opmerkingen</th>
            </tr>
          </thead>
          <tbody>${createRows(signup)}</tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadIndividualSignups() {
  const container = document.getElementById('individual-signups');

  try {
    const response = await fetch(dataUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('JSON kon niet worden geladen');
    }

    const data = await response.json();
    document.getElementById('page-title').textContent = data.paginaTitel || 'Aanmeldingen overzicht';
    document.getElementById('page-subtitle').textContent = data.subtitel || '';
    container.innerHTML = data.aanmeldingen.map(createSignupCard).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="error">
        De individuele aanmeldingen konden niet worden geladen.<br>
        Controleer of <strong>aanmeldingen-individueel.json</strong> bestaat en open de pagina via Live Server.
      </div>
    `;
    console.error(error);
  }
}

loadIndividualSignups();