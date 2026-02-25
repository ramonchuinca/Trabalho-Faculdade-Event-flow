import { saveUser, getUsers } from "../models/userModel.js";

// =====================
// CADASTRO
// =====================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    const users = getUsers();
    const userExists = users.some(user => user.email === email);

    if (userExists) {
      alert("Email já cadastrado");
      return;
    }

    saveUser({ name, email, password });
    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  });
}

// =====================
// LOGIN
// =====================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = getUsers();
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      alert("Email ou senha inválidos");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "home.html";
  });
}