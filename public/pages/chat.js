const chatArea = document.querySelector(".chat-area");
const messageInput = document.getElementById("message");
const form = document.querySelector("form");

const ws = new WebSocket("ws://localhost:3000");

const urlParams = new URLSearchParams(window.location.search);
let username = urlParams.get("user");
let recipient = prompt("recipient name");

if (!recipient && !username) {
  alert("recipient is required! Redirecting...");
  window.location.href = "/"; // Redirect to home page if username is missing
}
document.querySelector("h1").innerText = recipient;

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "newUser", username }));
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "userConnected") {
    showNotification(`${data.username} joined the chat`, "green");
  } else if (data.type === "userDisconnected") {
    showNotification(`${data.username} left the chat`, "red");
  } else if (data.type === "privateMessage") {
    displayMessage(data.username, data.message, "receiver");
    showNotification(`Private message from ${data.username}`, "blue");
  } else if (data.type === "message") {
    // Handle both public and private messages correctly
    displayMessage(data.username, data.message, data.username === username ? "sender" : "receiver");
  }
};

// Send messages
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent page refresh

  const message = messageInput.value.trim();

  if (message) {
    const msgData = {
      type: "message",
      username, // Send sender's username
      message,
      recipient: recipient || null, // Send to all if no recipient
    };

    ws.send(JSON.stringify(msgData));
    displayMessage("You", message, "sender"); // Show sent message
    messageInput.value = ""; // Clear input
  }
});

// Function to display messages in chat area
function displayMessage(sender, message, role) {
  const msgContainer = document.createElement("section");
  msgContainer.classList.add(role);

  const msgDiv = document.createElement("div");
  msgDiv.classList.add(`${role}-msg`);
  msgDiv.innerHTML = `<span class="name">${sender}</span> ${message}`;

  msgContainer.appendChild(msgDiv);
  chatArea.appendChild(msgContainer);

  // Auto-scroll to the latest message
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Function to show notifications
function showNotification(text, color) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = text;
  notification.style.backgroundColor = color;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
