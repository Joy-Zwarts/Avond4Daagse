const dataUrl = './aanmeldingenScholen.json';

function createSchoolCard(school) {
  const rows = school.leerlingen
    .map(
      (student) => `
        <tr>
          <td>${student.naam}</td>
          <td>${school.naam}</td>
          <td>${student.klas}</td>
          <td>${student.groep}</td>
          <td><span class="badge">${student.afstand}</span></td>
          <td>${student.deelname}</td>
          <td>${student.opmerkingen}</td>
        </tr>
      `
    )
    .join('');

  return `
    <article class="school-card">
      <div class="school-heading">
        <span class="school-icon">♧</span>
        <h2>${school.naam}</h2>
      </div>

      <div class="details">
        <div>
          Naam aangewezen contactpersoon:
          <strong>${school.contactpersoon}</strong>
        </div>
        <div>
          Email:
          <strong>${school.email}</strong>
        </div>
        <div>
          Telefoonnummer:
          <strong>${school.telefoon}</strong>
        </div>
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
              <th>Iedere deelname</th>
              <th>Opmerkingen</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadSchools() {
  const container = document.getElementById('schools');

  try {
    const response = await fetch(dataUrl, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('JSON kon niet worden geladen');
    }

    const data = await response.json();

    document.getElementById('page-title').textContent = data.paginaTitel;
    document.getElementById('page-subtitle').textContent = data.subtitel;
    container.innerHTML = data.scholen.map(createSchoolCard).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="error">
        De aanmeldingen konden niet worden geladen.
        Open deze pagina via Live Server in VS Code.
      </div>
    `;

    console.error(error);
  }
}

loadSchools();
