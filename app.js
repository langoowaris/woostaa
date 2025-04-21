const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { clear } = require('console');

// Use JSON middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

// Chat endpoint that properly returns JSON
app.post("/chat", async (req, res) => {
    const message = req.body.message;
    console.log("Received message:", message);
    const response = await fetch("https://woosta-bot.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: message })
      });

      const data = await response.json();
      console.log(data.answer)

    
    // Send JSON response
    res.json({ response: data.answer });
});

app.listen(80, () => {
    console.log("Application started at port 80");
});