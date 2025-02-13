const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {}; // Store connected users

wss.on("connection", (ws) => {
  console.log("User connected");
  ws.on("message", (data) => {
    let messageData = JSON.parse(data);

    if (messageData.type === "newUser") {
      users[messageData.username] = ws; // Store username with WebSocket
      broadcast(
        JSON.stringify({
          type: "userConnected",
          username: messageData.username,
        })
      );
      console.log(Object.keys(users));
    } else if (messageData.type === "message") {
      const sender = Object.keys(users).find((key) => users[key] === ws);
      const recipient = messageData.recipient; // Get the recipient username
      console.log("Sender: ", sender);
      console.log("Recipient: ", recipient);
      console.log("Message: ", messageData.message);

      if (recipient && users[recipient]) {
        // Send message ONLY to the recipient
        users[recipient].send(
          JSON.stringify({
            type: "privateMessage",
            username: sender,
            message: messageData.message,
          })
        );
      } 
    }
  });

  ws.on("close", () => {
    const disconnectedUser = Object.keys(users).find(
      (key) => users[key] === ws
    );

    if (disconnectedUser) {
      broadcast(
        JSON.stringify({ type: "userDisconnected", username: disconnectedUser })
      );

      delete users[disconnectedUser]; // ✅ Correctly remove the user from the list
    }
    console.log("User Disconnected:", disconnectedUser);
    console.log(Object.keys(users)); // Check remaining connected users
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

app.use(express.static("public"));
server.listen(3000, () => console.log("Server running on port 3000"));
