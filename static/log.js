const login = document.getElementById("login");
const signup = document.getElementById("signup");

signup.style.display = "none";

const loginlink = document.getElementById("loginlink");
const signuplink = document.getElementById("signuplink");

loginlink.addEventListener("click", () => {
  signup.style.display = "none";
  login.style.display = "flex";
});

signuplink.addEventListener("click", () => {
  login.style.display = "none";
  signup.style.display = "flex";
});
