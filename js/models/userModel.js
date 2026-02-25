export function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

export function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}