function checkAuth() {
  const user = localStorage.getItem("user");

  if (!user) {
    window.location.href = "index.html";
  }
}

checkAuth();