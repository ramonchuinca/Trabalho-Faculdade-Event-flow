const KEY = "user_events";

export function getUserEvents() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveUserEvent(event) {
  const events = getUserEvents();
  events.push(event);
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function deleteUserEvent(index) {
  const events = getUserEvents();
  events.splice(index, 1);
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function updateUserEvent(index, updatedEvent) {
  const events = getUserEvents();
  events[index] = updatedEvent;
  localStorage.setItem("user_events", JSON.stringify(events));
}