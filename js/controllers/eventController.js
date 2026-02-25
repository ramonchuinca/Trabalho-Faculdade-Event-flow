import { getEvents } from "../services/api.js";
import {
  getUserEvents,
  saveUserEvent,
  deleteUserEvent,
  updateUserEvent
} from "../models/eventModel.js";

const container = document.getElementById("eventsContainer");
const addEventBtn = document.getElementById("addEventBtn");
const logoutBtn = document.getElementById("logoutBtn");

let apiEventsLength = 0;

// ================== RENDER ==================
function renderEvents(events) {
  container.innerHTML = "";

  events.forEach((event, index) => {
    const card = document.createElement("div");

    card.className =
      "bg-white rounded-xl shadow p-5 hover:shadow-lg transition";

    card.innerHTML = `
      <h3 class="text-lg font-bold text-indigo-600 mb-2">${event.title}</h3>
      <p class="text-sm text-gray-600 mb-1">📅 ${event.date}</p>
      <p class="text-sm text-gray-600 mb-1">📍 ${event.location}</p>
      <p class="text-gray-700 text-sm mb-3">${event.description}</p>

      ${
        event.fromUser
          ? `
          <div class="flex gap-4 mt-3">
            <button
              data-index="${index}"
              class="editBtn text-sm text-blue-500 hover:underline">
              Editar
            </button>
            <button
              data-index="${index}"
              class="deleteBtn text-sm text-red-500 hover:underline">
              Excluir
            </button>
          </div>
          `
          : ""
      }
    `;

    container.appendChild(card);
  });

  // ========= EXCLUIR =========
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index - apiEventsLength;
      deleteUserEvent(index);
      loadEvents();
    });
  });

  // ========= EDITAR =========
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index - apiEventsLength;
      const events = getUserEvents();
      const event = events[index];

      const title = prompt("Título:", event.title);
      const date = prompt("Data:", event.date);
      const location = prompt("Local:", event.location);
      const description = prompt("Descrição:", event.description);

      if (!title || !date || !location || !description) {
        alert("Todos os campos são obrigatórios");
        return;
      }

      updateUserEvent(index, { title, date, location, description });
      loadEvents();
    });
  });
}

// ================== LOAD ==================
async function loadEvents() {
  const apiEvents = await getEvents();
  const userEvents = getUserEvents().map(e => ({
    ...e,
    fromUser: true
  }));

  apiEventsLength = apiEvents.length;
  renderEvents([...apiEvents, ...userEvents]);
}

loadEvents();

// ================== CREATE ==================
if (addEventBtn) {
  addEventBtn.addEventListener("click", () => {
    const title = prompt("Título do evento:");
    const date = prompt("Data do evento:");
    const location = prompt("Local do evento:");
    const description = prompt("Descrição:");

    if (!title || !date || !location || !description) {
      alert("Preencha todos os campos!");
      return;
    }

    saveUserEvent({ title, date, location, description });
    loadEvents();
  });
}

// ================== LOGOUT ==================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});