import { getEvents } from "../services/api.js";
import {
  getUserEvents,
  saveUserEvent,
  deleteUserEvent,
} from "../models/eventModel.js";

const container = document.getElementById("eventsContainer");
const addEventBtn = document.getElementById("addEventBtn");
const logoutBtn = document.getElementById("logoutBtn");

const filter = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("eventModal");
const closeBtn = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveEvent");

const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

const params = new URLSearchParams(window.location.search);
const eventParam = params.get("event");

if (eventParam) {
  const event = JSON.parse(decodeURIComponent(eventParam));

  renderEvents([event]); // mostra só o evento compartilhado
}

let apiEventsLength = 0;
let editingId = null;

let map;
let marker;

// ================== UUID ==================
function generateUUID() {
  return crypto.randomUUID();
}

// ================== CEP ==================
async function getAddressByCEP(cep) {
  try {
    const cleanCep = cep.replace(/\D/g, "");
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return `${data.logradouro}, ${data.bairro}, ${data.localidade}`;
  } catch {
    return null;
  }
}

// ================== GEO ==================
async function getCoordinates(place) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      place
    )}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch {}
  return null;
}

// ================== MAP ==================
function initMap() {
  if (map) return;

  map = L.map("map").setView([-8.76, -63.9], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  map.on("click", (e) => {
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }
  });
}

// ================== RENDER ==================
function renderEvents(events) {
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `<p class="text-white text-center col-span-3">Nenhum evento encontrado 😢</p>`;
    return;
  }

  events.forEach((event) => {
    const shareLink = `${window.location.origin}/home.html?event=${encodeURIComponent(JSON.stringify(event))}`;
    const isUserEvent = !!event.fromUser;

    const card = document.createElement("div");
    card.className = "bg-white/90 text-black rounded-xl shadow p-5";

    card.innerHTML = `
      ${
        event.banner
          ? `<img src="${event.banner}" class="w-full h-40 object-cover rounded mb-3">`
          : ""
      }
      

      <h3 class="font-bold text-indigo-600 text-lg">${event.title}</h3>
      <p>📅 ${event.date}</p>
      <p>📍 ${event.location}</p>

      <p class="text-sm mt-2">${event.description || ""}</p>

      ${
        event.lat
          ? `<a href="https://www.google.com/maps?q=${event.lat},${event.lng}" target="_blank"
              class="text-indigo-600 underline text-sm mt-2 block">
              📍 Ver no mapa
            </a>`
          : ""
      }

      <a href="${shareLink}" target="_blank"
        class="text-green-600 underline text-sm mt-2 block">
        🔗 Compartilhar
      </a>

      <button data-link="${shareLink}" class="copyBtn text-green-600 text-sm mt-2">
        📋 Copiar link
      </button>

      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${shareLink}"
           class="mt-3 rounded">

      ${
        isUserEvent
          ? `
       <div class="flex gap-2 mt-3">
  <button data-id="${event.id}" 
    class="editBtn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition">
    ✏️ Editar
  </button>

  <button data-id="${event.id}" 
    class="deleteBtn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition">
    🗑️ Excluir
  </button>
</div>
      `
          : ""
      }
    `;

    container.appendChild(card);
  });

  // ================= DELETE =================
 document.querySelectorAll(".deleteBtn").forEach((btn) => {
  btn.onclick = (e) => {
    const id = e.target.dataset.id;

    let events = JSON.parse(localStorage.getItem("userEvents")) || [];

    events = events.filter((event) => event.id !== id);

    localStorage.setItem("userEvents", JSON.stringify(events));

    loadEvents(filter.value, searchInput.value);
    showToast("Evento excluído 🗑️");
  };
});

  // ================= EDIT =================
document.querySelectorAll(".editBtn").forEach((btn) => {
  btn.onclick = (e) => {
    const id = e.target.dataset.id;

    const events = JSON.parse(localStorage.getItem("userEvents")) || [];
    const event = events.find((ev) => ev.id === id);

    if (!event) {
      console.log("Evento não encontrado ❌");
      return;
    }

    editingId = id;
    console.log("EDITANDO ID:", editingId);

    document.getElementById("title").value = event.title;
    document.getElementById("date").value = event.date;
    document.getElementById("location").value = event.location;
    document.getElementById("description").value = event.description;
    document.getElementById("category").value = event.category;
    document.getElementById("banner").value = event.banner;
    document.getElementById("doc").value = event.doc;

    modal.classList.remove("hidden");
  };
});

  // ================= COPY =================
  document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.onclick = (e) => {
      navigator.clipboard.writeText(e.target.dataset.link);
      showToast("Link copiado 🚀");
    };
  });
}

// ================== LOAD ==================
async function loadEvents(category = "all", search = "") {
  const apiEvents = await getEvents();

  // 🔥 PEGA DIRETO DO LOCALSTORAGE
  const userEvents = JSON.parse(localStorage.getItem("userEvents")) || [];

  const userEventsFormatted = userEvents.map(e => ({
    ...e,
    fromUser: true
  }));

  console.log("API:", apiEvents);
  console.log("USER:", userEventsFormatted);

  // let all = [...apiEvents, ...userEventsFormatted];
  const apiEventsFormatted = apiEvents.map(e => ({
  ...e,
  category: e.category || "Outros", // 🔥 adiciona categoria padrão
}));

let all = [...apiEventsFormatted, ...userEventsFormatted];

  // FILTRO
  // if (category !== "all") {
  //   all = all.filter((e) => e.category === category);
  // }
if (category !== "all") {
  all = all.filter((e) =>
    (e.category || "").toLowerCase() === category.toLowerCase()
  );
}
  // BUSCA
  if (search) {
    all = all.filter((e) =>
      e.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  renderEvents(all);
}

// INICIAL
loadEvents(filter.value, searchInput.value);

// FILTRO
filter.addEventListener("change", () => {
  loadEvents(filter.value, searchInput.value);
});

// BUSCA
searchInput.addEventListener("input", () => {
  loadEvents(filter.value, searchInput.value);
});

// ================== MODAL ==================
addEventBtn.onclick = () => {
  editingId = null;
  modal.classList.remove("hidden");

  setTimeout(() => {
    initMap();
    map.invalidateSize();
  }, 200);
};

closeBtn.onclick = () => modal.classList.add("hidden");

// ================== SAVE ==================
saveBtn.onclick = async () => {
  let location = document.getElementById("location").value.trim();
  const number = document.getElementById("number").value.trim();
  const cep = document.getElementById("cep").value.trim();

  if (number) location += `, ${number}`;

  if (cep) {
    const address = await getAddressByCEP(cep);
    if (address) location = `${address}, ${number}`;
  }

  const coords = await getCoordinates(location);

  let events = JSON.parse(localStorage.getItem("userEvents")) || [];

  // 🔥 pega evento antigo (para não perder dados)
  const oldEvent = events.find((ev) => ev.id === editingId) || {};

  const newEvent = {
    ...oldEvent, // 🔥 mantém dados antigos

    id: editingId || crypto.randomUUID(),
    title: document.getElementById("title").value.trim() || oldEvent.title,
    date: document.getElementById("date").value || oldEvent.date,
    location: location || oldEvent.location,
    description:
      document.getElementById("description").value.trim() || oldEvent.description,
    category:
      document.getElementById("category").value || oldEvent.category,
    banner:
      document.getElementById("banner").value.trim() || oldEvent.banner,
    doc: document.getElementById("doc").value.trim() || oldEvent.doc,
    lat: coords?.lat || oldEvent.lat || null,
    lng: coords?.lng || oldEvent.lng || null,
  };

  if (!newEvent.title || !newEvent.date || !newEvent.location) {
    showToast("Preencha os campos obrigatórios ⚠️");
    return;
  }

  if (editingId) {
    events = events.map((ev) =>
      ev.id === editingId ? newEvent : ev
    );

    console.log("EDITADO:", newEvent);
    editingId = null;
  } else {
    events.push(newEvent);
    console.log("CRIADO:", newEvent);
  }

  // 🔥 SALVA APENAS UMA VEZ (CORRETO)
  localStorage.setItem("userEvents", JSON.stringify(events));

  modal.classList.add("hidden");

  await loadEvents(filter.value, searchInput.value);

  showToast("Evento salvo 🚀");
};
// ================== ABOUT ==================
aboutBtn.addEventListener("click", () => {
  aboutModal.classList.remove("hidden");
});

closeAbout.addEventListener("click", () => {
  aboutModal.classList.add("hidden");
});

aboutModal.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.classList.add("hidden");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    aboutModal.classList.add("hidden");
  }
});

// ================== TOAST ==================
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// ================== LOGOUT ==================
logoutBtn.onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

function getCategoryColor(category) {
  switch (category) {
    case "Festa":
      return "bg-pink-500";
    case "Show":
      return "bg-purple-500";
    case "Esportivo":
      return "bg-green-500";
    case "Tecnologia":
      return "bg-indigo-500";
    default:
      return "bg-gray-500";
  }
}
