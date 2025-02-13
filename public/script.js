document.querySelector("form").addEventListener("submit", handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault(); 

  const username = document.querySelector("#username").value;

  if (!username.trim()) {
    showNotification("Username cannot be empty", "red");
    return;
  }
  window.location.href = `/pages/chat.html?user=${username}`;
}