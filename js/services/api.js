export async function getEvents() {
  const response = await fetch("data/events.json");
  return await response.json();
}