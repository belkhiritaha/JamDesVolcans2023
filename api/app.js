const express = require('express');
const WebSocket = require('ws');

const app = express();

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Set up event listeners for the WebSocket server
wss.on('connection', ws => {
    console.log('WebSocket connection opened');

    ws.on('message', message => {
        console.log(`Received WebSocket message: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Set up a route to serve the client-side WebSocket code
app.get('/client.js', (req, res) => {
    res.sendFile(__dirname + '/client.js');
});

// Start the server
app.listen(8001, () => {
    console.log('Server started on port 3000');
});
