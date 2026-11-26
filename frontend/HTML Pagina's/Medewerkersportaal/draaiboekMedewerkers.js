document.addEventListener('DOMContentLoaded', () => {
  const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  const events = {
    '2027-05-12': [
      { time: '09:00', type: 'Actief', title: 'Startlocatie check 5 km route', note: 'Controle van startlocatie, routeborden en EHBO-post.' },
      { time: '16:00', type: 'Deadline', title: 'Deadline vrijwilligersrooster', note: 'Definitieve roosters vrijwilligers en EHBO-vrijwilligers.' }
    ],
    '2027-05-13': [
      { time: '10:00', type: 'Actief', title: 'Vergaderen over financiën', note: 'Bespreking van het budget en de openstaande kosten.' }
    ],
    '2027-05-20': [
      { time: '14:00', type: 'Actief', title: 'Routecontrole', note: 'Laatste controle van de bewegwijzering op alle routes.' }
    ]
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

  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const sameDay = (first, second) => dateKey(first) === dateKey(second);

  const getMonday = (date) => {
    const result = new Date(date);
    const day = result.getDay() || 7;
    result.setDate(result.getDate() - day + 1);
    return result;
  };

  const formatLongDate = (date) => `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  function renderDayDetails() {
    const key = dateKey(selectedDate);
    const items = events[key] || [];
    selectedDateTitle.textContent = formatLongDate(selectedDate);

    if (!items.length) {
      dayActivities.innerHTML = '<p>Er zijn geen activiteiten gepland voor deze dag.</p>';
      return;
    }

    dayActivities.innerHTML = items.map((event) => `
      <article class="activity">
        <div class="activity-time">
          <span>● &nbsp;${event.time}</span>
          <span class="badge">${event.type === 'Deadline' ? '◷ Deadline' : '◉ Actief'}</span>
        </div>
        <b>${event.title}</b>
        <p>${event.note}</p>
      </article>
    `).join('');
  }

  function renderEventSummary(days) {
    const visibleEvents = days.flatMap((date) => (events[dateKey(date)] || []).map((event) => ({ date, event })));

    if (!visibleEvents.length) {
      calendarEvents.innerHTML = '<p>Geen activiteiten in deze periode.</p>';
      return;
    }

    calendarEvents.innerHTML = visibleEvents.map(({ date, event }) => `
      <div class="upcoming-event">
        <span class="event-date">${date.getDate()}</span>
        <div><b>${formatLongDate(date)}</b><small>${event.title}</small></div>
      </div>
    `).join('');
  }

  function createDay(date, muted = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = date.getDate();
    button.setAttribute('aria-label', formatLongDate(date));
    button.className = muted ? 'muted-day' : '';

    if (events[dateKey(date)]) button.classList.add('has-event');
    if (sameDay(date, selectedDate)) button.classList.add('selected-day');

    button.addEventListener('click', () => {
      selectedDate = new Date(date);
      render();
    });
    return button;
  }

  function renderMonth() {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = getMonday(firstDay);
    const days = [];

    grid.innerHTML = '';
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      days.push(date);
      grid.append(createDay(date, date.getMonth() !== month));
    }

    periodName.textContent = `${months[month][0].toUpperCase()}${months[month].slice(1)} ${year}`;
    calendarTitle.textContent = `Agenda ${months[month][0].toUpperCase()}${months[month].slice(1)}`;
    renderEventSummary(days.filter((date) => date.getMonth() === month));
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

    const end = days[6];
    periodName.textContent = `${formatLongDate(start)} – ${formatLongDate(end)}`;
    calendarTitle.textContent = `Agenda week ${getWeekNumber(displayedDate)}`;
    renderEventSummary(days);
  }

  function getWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

  function render() {
    monthButton.classList.toggle('active', view === 'month');
    weekButton.classList.toggle('active', view === 'week');
    monthButton.setAttribute('aria-pressed', view === 'month');
    weekButton.setAttribute('aria-pressed', view === 'week');

    if (view === 'month') renderMonth();
    else renderWeek();
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

  monthButton.addEventListener('click', () => {
    view = 'month';
    render();
  });

  weekButton.addEventListener('click', () => {
    view = 'week';
    render();
  });

  render();
});