import { getEvents } from "../services/api.js";
import {
  getUserEvents,
  saveUserEvent,
  deleteUserEvent
} from "../models/eventModel.js";

const container = document.getElementById("eventsContainer");
const addEventBtn = document.getElementById("addEventBtn");
const logoutBtn = document.getElementById("logoutBtn");
const filter = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");

// MODAL
const modal = document.getElementById("eventModal");
const closeBtn = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveEvent");

// TOAST
const toast = document.getElementById("toast");
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

let map = null;
let marker = null;
let selectedLat = -23.5505;
let selectedLng = -46.6333;

let apiEventsLength = 0;
let editingIndex = null;

// ================== GEO ==================
async function getCoordinates(place) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error("Erro ao buscar localização", err);
  }
  return null;
}

// ================== TOAST ==================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// ================== RENDER ==================
function renderEvents(events) {
  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = `
      <p class="text-white col-span-3 text-center">
        Nenhum evento encontrado 😢
      </p>
    `;
    return;
  }

  const categoryColors = {
    Festa: "bg-pink-500",
    Show: "bg-purple-500",
    Esportivo: "bg-green-500",
    Tecnologia: "bg-blue-500"
  };

  events.forEach((event, index) => {
    const card = document.createElement("div");
    const color = categoryColors[event.category] || "bg-gray-500";

    card.className =
      "bg-white/90 text-black rounded-xl shadow p-5 hover:shadow-lg transition transform hover:scale-105";

    card.innerHTML = `
      ${event.banner ? `<img src="${event.banner}" class="w-full h-40 object-cover rounded mb-3">` : ""}

      <h3 class="font-bold text-indigo-600 text-lg">${event.title}</h3>

      <span class="text-xs ${color} text-white px-2 py-1 rounded block w-fit mt-2">
        ${event.category || "Sem categoria"}
      </span>

      <p class="mt-2">📅 ${event.date}</p>
      <p>📍 ${event.location}</p>

      <p class="text-sm mt-2">${event.description || ""}</p>

      ${event.doc ? `
        <a href="${event.doc}" target="_blank"
          class="text-blue-500 underline text-sm block mt-2">
          📄 Ver documento
        </a>
      ` : ""}

      ${event.fromUser ? `
        <div class="flex gap-2 mt-3">
          <button data-index="${index}" class="editBtn text-blue-500">Editar</button>
          <button data-index="${index}" class="deleteBtn text-red-500">Excluir</button>
        </div>
      ` : ""}
    `;

    container.appendChild(card);
  });

  // DELETE
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index - apiEventsLength;
      deleteUserEvent(index);
      showToast("Evento excluído 🗑️");
      loadEvents(filter.value, searchInput.value);
    };
  });

  // EDIT
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index - apiEventsLength;
      const userEvents = getUserEvents();
      const event = userEvents[index];

      editingIndex = index;

      document.getElementById("title").value = event.title;
      document.getElementById("date").value = event.date;
      document.getElementById("location").value = event.location;
      document.getElementById("description").value = event.description;
      document.getElementById("category").value = event.category;
      document.getElementById("banner").value = event.banner;
      document.getElementById("doc").value = event.doc;

      selectedLat = event.lat;
      selectedLng = event.lng;

      modal.classList.remove("hidden");

      setTimeout(() => {
        if (map) map.remove();

        map = L.map("map").setView([selectedLat, selectedLng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
          .addTo(map);

        marker = L.marker([selectedLat, selectedLng]).addTo(map);

        map.on("click", (e) => {
          selectedLat = e.latlng.lat;
          selectedLng = e.latlng.lng;
          marker.setLatLng(e.latlng);
        });
      }, 100);
    };
  });
}

// ================== LOAD ==================
async function loadEvents(category = "all", search = "") {
  loading?.classList.remove("hidden");
  container.innerHTML = "";

  const apiEvents = await getEvents();
  const userEvents = getUserEvents().map(e => ({ ...e, fromUser: true }));

  apiEventsLength = apiEvents.length;

  let all = [...apiEvents, ...userEvents];

  if (category !== "all") {
    all = all.filter(e => e.category === category);
  }

  if (search) {
    all = all.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  loading?.classList.add("hidden");
  renderEvents(all);
}

loadEvents();

// BUSCA
searchInput?.addEventListener("input", () => {
  loadEvents(filter.value, searchInput.value);
});

// FILTRO
filter?.addEventListener("change", () => {
  loadEvents(filter.value, searchInput.value);
});

// MODAL
addEventBtn.onclick = () => {
  modal.classList.remove("hidden");

  setTimeout(() => {
    if (map) {
      map.remove();
      map = null;
    }

    map = L.map("map").setView([selectedLat, selectedLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);

    marker = L.marker([selectedLat, selectedLng]).addTo(map);

    map.on("click", (e) => {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      marker.setLatLng(e.latlng);
    });
  }, 100);
};

// FECHAR
closeBtn.onclick = () => {
  modal.classList.add("hidden");

  if (map) {
    map.remove();
    map = null;
  }
};

// SAVE (🔥 AGORA PROFISSIONAL)
saveBtn.onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const banner = document.getElementById("banner").value.trim();
  const doc = document.getElementById("doc").value.trim();

  // 🔥 VALIDAÇÃO
  if (!title || !date || !location) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  let lat = null;
  let lng = null;

  // 🔥 BUSCAR COORDENADAS
  const coords = await getCoordinates(location);

  if (coords) {
    lat = coords.lat;
    lng = coords.lng;

    selectedLat = lat;
    selectedLng = lng;

    if (map && marker) {
      map.setView([lat, lng], 13);
      marker.setLatLng([lat, lng]);
    }
  } else {
    showToast("Local não encontrado 😢");

    // ❗ DECISÃO: permitir salvar mesmo sem mapa
    // se quiser obrigar localização, descomenta:
    // return;
  }

  const newEvent = {
    title,
    date,
    location,
    description,
    category,
    banner,
    doc,
    lat,
    lng
  };

  // 🔥 EDITAR OU CRIAR
  if (editingIndex !== null) {
    const events = getUserEvents();
    events[editingIndex] = newEvent;
    localStorage.setItem("userEvents", JSON.stringify(events));

    showToast("Evento atualizado ✏️");
    editingIndex = null;
  } else {
    saveUserEvent(newEvent);
    showToast("Evento criado 🚀");
  }

  // 🔥 LIMPAR CAMPOS (UX PROFISSIONAL)
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("location").value = "";
  document.getElementById("description").value = "";
  document.getElementById("category").value = "";
  document.getElementById("banner").value = "";
  document.getElementById("doc").value = "";

  // 🔥 LIMPAR PREVIEW (COM SEGURANÇA)
  if (typeof bannerPreview !== "undefined" && bannerPreview) {
    bannerPreview.classList.add("hidden");
    bannerPreview.src = "";
  }

  // 🔥 FECHAR MODAL
  modal.classList.add("hidden");

  // 🔥 LIMPAR MAPA
  if (map) {
    map.remove();
    map = null;
  }

  // 🔥 RECARREGAR LISTA
  loadEvents(filter.value, searchInput.value);
};

// LOGOUT
logoutBtn.onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

// ABOUT
aboutBtn.onclick = () => {
  aboutModal.classList.remove("hidden");
};

closeAbout.onclick = () => {
  aboutModal.classList.add("hidden");
};

bannerInput.addEventListener("input", () => {
  const url = bannerInput.value.trim();

  // limpa sempre primeiro
  bannerPreview.classList.add("hidden");
  bannerPreview.src = "";

  if (!url) return;

  bannerPreview.src = url;

  bannerPreview.onload = () => {
    bannerPreview.classList.remove("hidden");
  };

  bannerPreview.onerror = () => {
    bannerPreview.classList.add("hidden");
    console.log("Erro ao carregar imagem");
  };
});