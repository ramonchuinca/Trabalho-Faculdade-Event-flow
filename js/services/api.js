const API = "https://back-end-eventflow.onrender.com/api/events";

export async function getEvents() {
  const res = await fetch(API);
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// ✏️ UPDATE
export async function updateEvent(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erro:", text);
    throw new Error("Erro ao atualizar evento");
  }

  return res.json();
}

// 🗑 DELETE
export async function deleteEventApi(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
}