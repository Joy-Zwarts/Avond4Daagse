document.addEventListener("DOMContentLoaded", () => {
  const people = ["Jan de Vries", "Sarah Meijer", "Peter Klaassen", "Sophie de Boer", "Milan Jansen"];
  const activityForm = document.querySelector(".form-card form");
  const taskForm = document.querySelector(".task-form");
  const activityButton = document.querySelector(".draaiboek-toolbar .button");
  const personSelect = document.querySelector("#task-person");
  const dayDetails = document.querySelector(".day-details");

  people.forEach((person) => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    personSelect.append(option);
  });

  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  };

  const renderActivities = () => {
    const activities = load("draaiboekActivities", []);
    dayDetails.querySelectorAll(".activity.dynamic").forEach((item) => item.remove());

    activities.forEach((activity) => {
      const item = document.createElement("article");
      item.className = "activity dynamic";
      item.innerHTML = `
        <div class="activity-time">
          <span>●&nbsp; ${activity.time}</span>
          <span class="badge">◉ Actief</span>
        </div>
        <b>${activity.title}</b>
        <p>${activity.location}${activity.note ? " · " + activity.note : ""}</p>`;
      dayDetails.append(item);
    });
  };

  activityButton.addEventListener("click", () => {
    activityForm.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector("#activity-title").focus();
  });

  activityForm.addEventListener("submit", (event) => event.preventDefault());
  activityForm.querySelector("button").addEventListener("click", () => {
    const title = document.querySelector("#activity-title").value.trim();
    const time = document.querySelector("#activity-time").value.trim();
    const location = document.querySelector("#activity-location").value.trim();
    const note = document.querySelector("#activity-note").value.trim();

    if (!title || !time) {
      alert("Vul minimaal een titel en tijd in.");
      return;
    }

    const activities = load("draaiboekActivities", []);
    activities.push({ title, time, location, note });
    save("draaiboekActivities", activities);
    activityForm.reset();
    renderActivities();
  });

  taskForm.addEventListener("submit", (event) => event.preventDefault());
  taskForm.querySelector("button").addEventListener("click", () => {
    const title = document.querySelector("#task-title").value.trim();
    const person = personSelect.value;
    const description = document.querySelector("#task-description").value.trim();

    if (!title || !person) {
      alert("Kies een titel en een persoon.");
      return;
    }

    const tasks = load("draaiboekTasks", []);
    tasks.push({ title, person, description, createdAt: new Date().toISOString() });
    save("draaiboekTasks", tasks);
    taskForm.reset();
    alert(`Taak verstuurd naar ${person}.`);
  });

  renderActivities();
});