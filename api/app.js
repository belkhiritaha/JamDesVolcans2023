const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const clickTypes = {
    0: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}],
    1: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 1, y: 4}]
};

const deckCards = {
    0: {imageSrc: "http://jamdesvolcans:3000/cartes/construction/", title: "Construction 1 ", description: "", cost: "10" },
    1: {imageSrc: "http://jamdesvolcans:3000/cartes/construction/", title: "Construction 2 ", description: "", cost: "10" },
    2: {imageSrc: "http://jamdesvolcans:3000/cartes/construction/", title: "Construction 3 ", description: "", cost: "10" },
    3: {imageSrc: "http://jamdesvolcans:3000/cartes/construction/", title: "Construction 4 ", description: "", cost: "10" },
    4: {imageSrc: "http://jamdesvolcans:3000/cartes/construction/", title: "Construction 5 ", description: "", cost: "10" },
    5: {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/", title: "Destruction 1 ", description: "", cost: "10" },
    6: {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/", title: "Destruction 2 ", description: "", cost: "10" },
    7: {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/", title: "Destruction 3 ", description: "", cost: "10" },
    8: {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/", title: "Destruction 4 ", description: "", cost: "10" },
    9: {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/", title: "Destruction 5 ", description: "", cost: "10" }

};

const app = express();

const clients = new Map();
const playersHash = new Map();

function GenerateClientID() {
    return Math.floor(Math.random() * 1000000000);
}

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.log('Error connecting to MongoDB:', error.message);
});

// Define a schema for the Player model
const playerSchema = new mongoose.Schema({
    name: String
});

// Create a Player model based on the schema
const Player = mongoose.model('Player', playerSchema);


// Create a schema for the Game model
const gameSchema = new mongoose.Schema({
    player1: String,
    player2: String,
    gameCode: String,
    grid: Array,
    gameClock: Number
});

// Create a Game model based on the schema
const Game = mongoose.model('Game', gameSchema);


// Create a new WebSocket server secure

const wss = new WebSocket.Server({ port: 8080 });

// Set up event listeners for the WebSocket server
wss.on('connection', ws => {
    console.log('WebSocket connection opened');
    const clientId = GenerateClientID();
    clients.set(clientId, ws);

    ws.on('message', async message => {
        console.log(`Received WebSocket message: ${message}`);

        // Parse the message as JSON
        const data = JSON.parse(message);

        // Check if the message is a registration message
        if (data.type === 'register') {
            try {
                const player = new Player({
                    name: data.name,
                });
                await player.save();

                // update the client map
                clients.set(clientId, player);

                playersHash.set(player._id.toString(), ws);


                const id = player._id;
                console.log(`Registered player ${data.name} with ID ${id}`);

                let game = await Game.findOne({ gameCode: data.gameCode });
                if (!game) {
                    const size = 20;
                    const grid = [];

                    for (let i = 0; i < size; i++) {
                        const row = Array(size).fill(0);
                        grid.push(row);
                    }
                    // create a new game
                    const newGame = new Game({
                        player1: "",
                        player2: "",
                        gameCode: data.gameCode,
                        gameClock: 0,
                        grid: grid
                    });
                    await newGame.save();

                    // change the game variable to the new game
                    game = newGame;
                }
                if (game.player2) {
                    throw new Error('Game is full');
                }
                // Update the game with the new player
                if (!game.player1) {
                    game.player1 = id;
                    console.log("this is the player1: ", game.player1)
                } else {
                    game.player2 = id;
                }
                await game.save();

                // Send a confirmation message back to the client
                // clients.forEach(client => {
                //     if (client !== ws && client.readyState === WebSocket.OPEN) {
                //         client.send(JSON.stringify({ type: 'register', success: true, id, name: data.name, gameCode: data.gameCode }));
                //     }
                // });

                const playerIds = [game.player1, game.player2];

                console.log("this is the playerIds: ", playerIds)
                // get the keys values from playersHash where the value is in playerIds
                const clientSockets = [playersHash.get(game.player1), playersHash.get(game.player2)];                

                // Send a confirmation message back to the client
                // loop through clientSockets
                clientSockets.forEach(client => {
                    // if not undefined
                    if (client !== undefined) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'register', success: true, id, name: data.name, gameCode: data.gameCode, token: data.token }));
                        }
                    }
                });
            } catch (err) {
                console.error(err);

                // Send an error message back to the client
                clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'register', success: false, error: 'Failed to register player'}));
                    }
                });
            }
        }

        if (data.type === 'click') {
            console.log("this is the gamecode: ", data.gameCode)
            console.log("this is the id: ", data.playerId)
            try {
                // Find the game
                const game = await Game.findOne({ gameCode: data.gameCode });
                if (!game) {
                    throw new Error('Game not found');
                }

                // if (!game.player1 || !game.player2) {
                //     throw new Error('Game is not full');
                // }

                // Find the player
                const player = await Player.findOne({ _id: data.playerId });
                if (!player) {
                    throw new Error('Player not found');
                }

                // get the clickType and clickCard
                const clickType = data.clickType;
                const clickCard = data.clickCard;

                const area = clickTypes[clickType][clickCard];
                console.log("this is the area: ", area)

                console.log("this is the game: ", game.grid)

                // loop through the area
                for (let i = 0; i < area.x; i++) {
                    for (let j = 0; j < area.y; j++) {
                        // check if all the squares are in the grid
                        if (data.x + i < 0 || data.x + i > 19 || data.y + j < 0 || data.y + j > 19) {
                            throw new Error('Invalid click');
                        }
                        else {
                            // if player is player1
                            if (player._id.toString() === game.player1) {
                                game.grid[data.x + i][data.y + j] = 1;
                            }
                            if (player._id.toString() === game.player2) {
                                game.grid[data.x + i][data.y + j] = 0;
                            }
                        }
                    }
                }
                
                // Update the game
                game.markModified('grid');
                await game.save();

                console.log("this is the game: ", game.grid)

                // get ids of all players in game
                const playerIds = [game.player1, game.player2];

                console.log("this is the playerIds: ", playerIds)
                // get the keys values from playersHash where the value is in playerIds
                const clientSockets = [playersHash.get(game.player1), playersHash.get(game.player2)];                

                // Send a confirmation message back to the client
                // loop through clientSockets
                clientSockets.forEach(client => {
                    // if not undefined
                    if (client !== undefined) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'click', success: true, id: data.playerId, name: player.name, x: data.x, y: data.y , destinations: [clientId], gameCode: data.gameCode, grid: game.grid }));
                        }
                    }
                });

            } catch (err) {
                console.error(err);

                // Send an error message back to the client
                clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN && client._id === data.playerId) {
                        client.send(JSON.stringify({ type: 'click', success: false, error: 'Failed to click', destinations: [clientId] }));
                    }
                });
            }
        }

    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        clients.delete(clientId);
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


// ws.on('message', async message => {
//     console.log(`Received WebSocket message: ${message}`);
//     // Save the message to MongoDB
//     const newMessage = new Message({ content: message });
//     await newMessage.save();
//     // Broadcast the message to all connected clients
//     wss.clients.forEach(client => {
//         if (client !== ws && client.readyState === WebSocket.OPEN) {
//             client.send(message);
//         }
//     });
// });