document.addEventListener('DOMContentLoaded', () => {
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const tasks = {
    '2027-05-12': [
      { time: '09:00', type: 'Actief', title: 'Startlocatie check 5 km route', note: 'Toegewezen aan Jan de Vries.' },
      { time: '16:00', type: 'Deadline', title: 'Deadline vrijwilligersrooster', note: 'Toegewezen aan Sarah Meijer.' }
    ],
    '2027-05-13': [{ time: '10:00', type: 'Actief', title: 'Vergaderen over financiën', note: 'Toegewezen aan Peter Klaassen.' }],
    '2027-05-20': [{ time: '14:00', type: 'Actief', title: 'Routecontrole', note: 'Toegewezen aan Jan de Vries.' }]
  };

  let displayedDate = new Date(2027, 4, 12);
  let selectedDate = new Date(2027, 4, 12);
  let view = 'month';

  const grid = document.querySelector('#calendar-grid');
  const periodName = document.querySelector('#period-name');
  const calendarTitle = document.querySelector('#calendar-title');
  const calendarEvents = document.querySelector('#calendar-events');
  const selectedDateTitle = document.querySelector('#selected-date-title');
  const dayActivities = document.querySelector('#day-activities');
  const monthButton = document.querySelector('#month-view-button');
  const weekButton = document.querySelector('#week-view-button');

  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const sameDay = (first, second) => dateKey(first) === dateKey(second);
  const formatDate = (date) => `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  function getMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    return monday;
  }

  function getWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

  function renderDayDetails() {
    const dayTasks = tasks[dateKey(selectedDate)] || [];
    selectedDateTitle.textContent = formatDate(selectedDate);
    dayActivities.innerHTML = dayTasks.length ? dayTasks.map((task) => `
      <article class="activity">
        <div class="activity-time"><span>● &nbsp;${task.time}</span><span class="badge">${task.type === 'Deadline' ? '◷ Deadline' : '◉ Actief'}</span></div>
        <b>${task.title}</b><p>${task.note}</p>
      </article>
    `).join('') : '<p>Er zijn geen gekoppelde taken voor deze dag.</p>';
  }

  function renderTaskSummary(days) {
    const visibleTasks = days.flatMap((date) => (tasks[dateKey(date)] || []).map((task) => ({ date, task })));
    calendarEvents.innerHTML = visibleTasks.length ? visibleTasks.map(({ date, task }) => `
      <div class="upcoming-event"><span class="event-date">${date.getDate()}</span><div><b>${formatDate(date)}</b><small>${task.title}</small></div></div>
    `).join('') : '<p>Geen gekoppelde taken in deze periode.</p>';
  }

  function createDay(date, muted = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = date.getDate();
    button.className = muted ? 'muted-day' : '';
    button.setAttribute('aria-label', formatDate(date));
    if (tasks[dateKey(date)]) button.classList.add('has-event');
    if (sameDay(date, selectedDate)) button.classList.add('selected-day');
    button.addEventListener('click', () => {
      selectedDate = new Date(date);
      displayedDate = new Date(date);
      render();
    });
    return button;
  }

  function renderMonth() {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const start = getMonday(new Date(year, month, 1));
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
    grid.innerHTML = '';
    days.forEach((date) => grid.append(createDay(date, date.getMonth() !== month)));
    periodName.textContent = `${capitalize(months[month])} ${year}`;
    calendarTitle.textContent = `Rooster ${capitalize(months[month])}`;
    renderTaskSummary(days.filter((date) => date.getMonth() === month));
  }

  function renderWeek() {
    const start = getMonday(displayedDate);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
    grid.innerHTML = '';
    days.forEach((date) => grid.append(createDay(date)));
    periodName.textContent = `${formatDate(start)} – ${formatDate(days[6])}`;
    calendarTitle.textContent = `Rooster week ${getWeekNumber(displayedDate)}`;
    renderTaskSummary(days);
  }

  function render() {
    monthButton.classList.toggle('active', view === 'month');
    weekButton.classList.toggle('active', view === 'week');
    monthButton.setAttribute('aria-pressed', view === 'month');
    weekButton.setAttribute('aria-pressed', view === 'week');
    if (view === 'month') renderMonth(); else renderWeek();
    renderDayDetails();
  }

  document.querySelector('#previous-period').addEventListener('click', () => {
    if (view === 'month') displayedDate.setMonth(displayedDate.getMonth() - 1);
    else displayedDate.setDate(displayedDate.getDate() - 7);
    render();
  });
  document.querySelector('#next-period').addEventListener('click', () => {
    if (view === 'month') displayedDate.setMonth(displayedDate.getMonth() + 1);
    else displayedDate.setDate(displayedDate.getDate() + 7);
    render();
  });
  monthButton.addEventListener('click', () => { view = 'month'; render(); });
  weekButton.addEventListener('click', () => { view = 'week'; render(); });

  render();
});