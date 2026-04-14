import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEventApi,
} from "../services/api.js";

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

let editingId = null;
let map;
let marker;

// ================== LOAD ==================
async function loadEvents(category = "all", search = "") {
  try {
    const apiEvents = await getEvents();

    const events = (apiEvents || []).map((e) => ({
      ...e,
      fromUser: true,
    }));

    let filtered = events;

    // FILTRO
    if (category !== "all") {
      filtered = filtered.filter(
        (e) => (e.category || "").toLowerCase() === category.toLowerCase()
      );
    }

    // BUSCA
    if (search) {
      filtered = filtered.filter((e) =>
        (e.title || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    renderEvents(filtered);
  } catch (err) {
    console.error("Erro ao carregar eventos:", err);
  }
}

// ================== RENDER ==================
function renderEvents(events) {
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `
      <p class="text-white text-center col-span-3">
        Nenhum evento encontrado 😢
      </p>`;
    return;
  }

  events.forEach((event) => {
    const id = event._id; // 🔥 Mongo correto

    const shareLink = `${
      window.location.origin
    }/home.html?event=${encodeURIComponent(JSON.stringify(event))}`;

    const card = document.createElement("div");
    card.className = "bg-white/90 text-black rounded-xl shadow p-5";

    card.innerHTML = `
      ${
        event.banner
          ? `<img src="${event.banner}" class="w-full h-40 object-cover rounded mb-3">`
          : ""
      }

      <h3 class="font-bold text-indigo-600 text-lg">${event.title || ""}</h3>
      <p>📅 ${event.date || ""}</p>
      <p>📍 ${event.location || ""}</p>

      <p class="text-sm mt-2">${event.description || ""}</p>

      <a href="https://www.google.com/maps?q=${encodeURIComponent(
        event.location || ""
      )}" target="_blank"
      class="text-indigo-600 underline text-sm mt-2 block">
        📍 Ver no mapa
      </a>

      <a href="${shareLink}" target="_blank"
        class="text-green-600 underline text-sm mt-2 block">
        🔗 Compartilhar
      </a>

      <button data-link="${shareLink}" class="copyBtn text-green-600 text-sm mt-2">
        📋 Copiar link
      </button>

      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${shareLink}"
           class="mt-3 rounded">

      <div class="flex gap-2 mt-3">
        <button data-id="${id}" class="editBtn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
          ✏️ Editar
        </button>

        <button data-id="${id}" class="deleteBtn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
          🗑️ Excluir
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // DELETE
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = e.target.dataset.id;

      await deleteEventApi(id);
      await loadEvents(filter.value, searchInput.value);
    };
  });

  // EDIT
  document.querySelectorAll(".editBtn").forEach((btn) => {
  btn.onclick = async (e) => {
  const id = e.target.dataset.id;

  const events = await getEvents();
  const event = (events || []).find((ev) => ev._id === id);

  if (!event) {
    console.log("Evento não encontrado ❌");
    return;
  }

  editingId = id;

  document.getElementById("title").value = event.title || "";
  document.getElementById("date").value = event.date || "";
  document.getElementById("location").value = event.location || "";
  document.getElementById("description").value = event.description || "";
  document.getElementById("category").value = event.category || "";
  document.getElementById("banner").value = event.banner || "";

  modal.classList.remove("hidden");

  // 🔥 INICIALIZA O MAPA
  setTimeout(() => {
    if (!map) {
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

    map.invalidateSize();

    // 🔥 AQUI ENTRA SEU CÓDIGO
    if (event.lat && event.lng) {
      map.setView([event.lat, event.lng], 15);

      if (marker) {
        marker.setLatLng([event.lat, event.lng]);
      } else {
        marker = L.marker([event.lat, event.lng]).addTo(map);
      }
    }
  }, 200);
};
  });

  // COPY
  document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.onclick = (e) => {
      navigator.clipboard.writeText(e.target.dataset.link);
    };
  });
}

// ================== SAVE ==================
saveBtn.onclick = async () => {
  const newEvent = {
    title: document.getElementById("title").value.trim(),
    date: document.getElementById("date").value,
    location: document.getElementById("location").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value,
    banner: document.getElementById("banner").value.trim(),
    lat: marker ? marker.getLatLng().lat : null,
    lng: marker ? marker.getLatLng().lng : null,
  };

  if (!newEvent.title || !newEvent.date || !newEvent.location) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  if (editingId) {
    await updateEvent(editingId, newEvent);
    editingId = null;
  } else {
    await createEvent(newEvent);
  }

  modal.classList.add("hidden");
  await loadEvents(filter.value, searchInput.value);
};

// ================== FILTER + SEARCH ==================
filter.addEventListener("change", () => {
  loadEvents(filter.value, searchInput.value);
});

searchInput.addEventListener("input", () => {
  loadEvents(filter.value, searchInput.value);
});

// ================== MODAL ==================
addEventBtn.onclick = () => {
  editingId = null;
  modal.classList.remove("hidden");

  setTimeout(() => {
    if (!map) {
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

    map.invalidateSize();
  }, 200);
};

closeBtn.onclick = () => modal.classList.add("hidden");

// ================== ABOUT ==================
aboutBtn.onclick = () => aboutModal.classList.remove("hidden");
closeAbout.onclick = () => aboutModal.classList.add("hidden");

// ================== LOGOUT ==================
logoutBtn.onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

// INIT
loadEvents(filter.value, searchInput.value);


const openGallery = document.getElementById("openGallery");
const imageModal = document.getElementById("imageModal");
const imageSearch = document.getElementById("imageSearch");
const imageResults = document.getElementById("imageResults");
const closeImageModal = document.getElementById("closeImageModal");

// 🔑 SUA API KEY (criar no Unsplash)
const ACCESS_KEY = "SUA_KEY_AQUI";

openGallery.onclick = () => {
  imageModal.classList.remove("hidden");
};

closeImageModal.onclick = () => {
  imageModal.classList.add("hidden");
};

// BUSCAR IMAGENS
imageSearch.addEventListener("input", async () => {
  const query = imageSearch.value;

  if (query.length < 3) return;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&client_id=${ACCESS_KEY}`
  );

  const data = await res.json();

  imageResults.innerHTML = "";

  data.results.forEach((img) => {
    const imageEl = document.createElement("img");

    imageEl.src = img.urls.small;
    imageEl.className = "cursor-pointer rounded hover:scale-105 transition";

    imageEl.onclick = () => {
      document.getElementById("banner").value = img.urls.regular;
      imageModal.classList.add("hidden");
    };

    imageResults.appendChild(imageEl);
  });
});
