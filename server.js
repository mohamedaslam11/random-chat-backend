const express = require("express");
const app = express();

app.use(express.json());

// Root route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Random Chat Backend is Running Successfully");
});

// Test route
app.get("/test", (req, res) => {
  res.send("Test route working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});