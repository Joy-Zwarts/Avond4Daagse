document.addEventListener('DOMContentLoaded', () => {
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const volunteers = [
    { id: 'jan', name: 'Jan de Vries', certificate: 'EHBO', availability: 'Beschikbaar op 12 en 20 mei' },
    { id: 'sarah', name: 'Sarah Meijer', certificate: 'Verkeersregelaar', availability: 'Beschikbaar op 12 en 13 mei' },
    { id: 'peter', name: 'Peter Klaassen', certificate: 'Routebegeleider', availability: 'Beschikbaar op 13 en 20 mei' },
    { id: 'lisa', name: 'Lisa Bakker', certificate: 'EHBO', availability: 'Beschikbaar op 12 mei' }
  ];
  const tasks = {
    '2027-05-12': [
      { id: 'startlocatie', time: '09:00', type: 'Actief', title: 'Startlocatie check 5 km route', note: 'Controleer routeborden en de EHBO-post.', assigned: ['jan'] },
      { id: 'vrijwilligersrooster', time: '16:00', type: 'Deadline', title: 'Deadline vrijwilligersrooster', note: 'Definitieve roosters vrijwilligers en EHBO-vrijwilligers.', assigned: ['sarah'] }
    ],
    '2027-05-13': [{ id: 'financien', time: '10:00', type: 'Actief', title: 'Vergaderen over financiën', note: 'Overleg over het financiële overzicht.', assigned: ['peter'] }],
    '2027-05-20': [{ id: 'routecontrole', time: '14:00', type: 'Actief', title: 'Routecontrole', note: 'Laatste controle van de volledige route.', assigned: [] }]
  };

  let displayedDate = new Date(2027, 4, 12);
  let selectedDate = new Date(2027, 4, 12);
  let view = 'month';
  let draggedVolunteerId = null;

  const grid = document.querySelector('#calendar-grid');
  const periodName = document.querySelector('#period-name');
  const calendarTitle = document.querySelector('#calendar-title');
  const calendarEvents = document.querySelector('#calendar-events');
  const monthButton = document.querySelector('#month-view-button');
  const weekButton = document.querySelector('#week-view-button');

  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const sameDay = (first, second) => dateKey(first) === dateKey(second);
  const formatDate = (date) => `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const volunteerById = (id) => volunteers.find((volunteer) => volunteer.id === id);

  function getMonday(date) {
    const monday = new Date(date);
    monday.setDate(monday.getDate() - ((monday.getDay() || 7) - 1));
    return monday;
  }

  function getWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

  function getTask(taskId) {
    return Object.values(tasks).flat().find((task) => task.id === taskId);
  }

  function assignmentMarkup(task) {
    return `<div class="assignment-zone" data-task-id="${task.id}" aria-label="Medewerkers voor ${task.title}">${task.assigned.map((id) => {
      const volunteer = volunteerById(id);
      return `<span class="assigned-volunteer">${volunteer.name}<button class="remove-assignment" type="button" data-task-id="${task.id}" data-volunteer-id="${id}" aria-label="${volunteer.name} verwijderen">×</button></span>`;
    }).join('')}</div>`;
  }

  function setupDropZones(container) {
    container.querySelectorAll('.assignment-zone').forEach((zone) => {
      zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (event) => {
        event.preventDefault();
        const task = getTask(zone.dataset.taskId);
        if (task && draggedVolunteerId && !task.assigned.includes(draggedVolunteerId)) task.assigned.push(draggedVolunteerId);
        draggedVolunteerId = null;
        render();
      });
    });
    container.querySelectorAll('.remove-assignment').forEach((button) => {
      button.addEventListener('click', () => {
        const task = getTask(button.dataset.taskId);
        task.assigned = task.assigned.filter((id) => id !== button.dataset.volunteerId);
        render();
      });
    });
  }

  function renderVolunteers() {
    const list = document.querySelector('#volunteer-list');
    list.innerHTML = volunteers.map((volunteer) => `<article class="volunteer-card" draggable="true" data-volunteer-id="${volunteer.id}"><strong>♙ ${volunteer.name}</strong><b>Certificaat:</b><br>${volunteer.certificate}<br><b>Beschikbaarheid:</b><br>${volunteer.availability}</article>`).join('');
    list.querySelectorAll('.volunteer-card').forEach((card) => {
      card.addEventListener('dragstart', () => { draggedVolunteerId = card.dataset.volunteerId; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { draggedVolunteerId = null; card.classList.remove('dragging'); });
    });
  }

  function renderTaskSummary(days) {
    const visibleTasks = days.flatMap((date) => (tasks[dateKey(date)] || []).map((task) => ({ date, task })));
    calendarEvents.innerHTML = visibleTasks.length ? visibleTasks.map(({ date, task }) => `<div class="upcoming-event"><span class="event-date">${date.getDate()}</span><div><b>${formatDate(date)}</b><small>${task.title}</small>${assignmentMarkup(task)}</div></div>`).join('') : '<p>Geen gekoppelde taken in deze periode.</p>';
    setupDropZones(calendarEvents);
  }

  function createDay(date, muted = false) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = date.getDate(); button.className = muted ? 'muted-day' : '';
    button.setAttribute('aria-label', formatDate(date));
    if (tasks[dateKey(date)]) button.classList.add('has-event');
    if (sameDay(date, selectedDate)) button.classList.add('selected-day');
    button.addEventListener('click', () => { selectedDate = new Date(date); displayedDate = new Date(date); render(); });
    return button;
  }

  function renderMonth() {
    const year = displayedDate.getFullYear(); const month = displayedDate.getMonth(); const start = getMonday(new Date(year, month, 1));
    const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
    grid.innerHTML = ''; days.forEach((date) => grid.append(createDay(date, date.getMonth() !== month)));
    periodName.textContent = `${capitalize(months[month])} ${year}`; calendarTitle.textContent = `Rooster ${capitalize(months[month])}`;
    renderTaskSummary(days.filter((date) => date.getMonth() === month));
  }

  function renderWeek() {
    const start = getMonday(displayedDate); const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
    grid.innerHTML = ''; days.forEach((date) => grid.append(createDay(date)));
    periodName.textContent = `${formatDate(start)} – ${formatDate(days[6])}`; calendarTitle.textContent = `Rooster week ${getWeekNumber(displayedDate)}`;
    renderTaskSummary(days);
  }

  function render() {
    monthButton.classList.toggle('active', view === 'month'); weekButton.classList.toggle('active', view === 'week');
    monthButton.setAttribute('aria-pressed', view === 'month'); weekButton.setAttribute('aria-pressed', view === 'week');
    if (view === 'month') renderMonth(); else renderWeek();
    renderVolunteers();
  }

  document.querySelector('#previous-period').addEventListener('click', () => { if (view === 'month') displayedDate.setMonth(displayedDate.getMonth() - 1); else displayedDate.setDate(displayedDate.getDate() - 7); render(); });
  document.querySelector('#next-period').addEventListener('click', () => { if (view === 'month') displayedDate.setMonth(displayedDate.getMonth() + 1); else displayedDate.setDate(displayedDate.getDate() + 7); render(); });
  monthButton.addEventListener('click', () => { view = 'month'; render(); });
  weekButton.addEventListener('click', () => { view = 'week'; render(); });
  render();
});