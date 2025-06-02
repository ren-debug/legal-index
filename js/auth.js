const password = prompt("Enter site password:");

fetch("/.netlify/functions/check-password", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ password })
})
.then(response => {
  if (!response.ok) {
    document.body.innerHTML = "<h1>Access Denied</h1>";
  }
})
.catch(() => {
  document.body.innerHTML = "<h1>Error validating password</h1>";
});
