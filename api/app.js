const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const clickTypes = {
    0: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}],
    1: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 1, y: 4}]
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
    name: String,
    score: Number,
    coins: Number
});

// Create a Player model based on the schema
const Player = mongoose.model('Player', playerSchema);


// Create a schema for the Game model
const gameSchema = new mongoose.Schema({
    player1: String,
    player2: String,
    gameCode: String,
    grid: Array,
    gameClock: Number,
    isFull : Boolean,
    startDate : Date
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
                    score: 0,
                    coins: 0
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
                        grid: grid,
                        isFull: false
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
                    game.isFull = true;
                    game.startDate = new Date();
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
                            client.send(JSON.stringify({ type: 'register', success: true, id, name: data.name, gameCode: data.gameCode, token: data.token, isFull: game.isFull }));
                        }
                    }
                });
            } catch (err) {
                console.error(err);

                // Send an error message back to the client
                clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'register', success: false, error: err.message}));
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
                                if (game.grid[data.x + i][data.y + j] === 1) {
                                    player.coins--;
                                }
                                else {
                                    game.grid[data.x + i][data.y + j] = 1;
                                    player.coins++;
                                }
                            }
                            if (player._id.toString() === game.player2) {
                                if (game.grid[data.x + i][data.y + j] === 2) {
                                    player.coins--;
                                }
                                else {
                                    game.grid[data.x + i][data.y + j] = 2;
                                    player.coins++;
                                }
                            }
                        }
                    }
                }


                // Check if the game has reached 2 minute
                const now = new Date();
                const timeDiff = now - game.startDate;
                const timeDiffSeconds = timeDiff / 1000;
                if (timeDiffSeconds > 120) {
                    throw new Error('Game has ended');
                }

                game.gameClock = timeDiffSeconds;

                // if updater is player1 if player is player1
                const updater = player._id.toString() === game.player1 ? "player1" : "player2";

                
                // Update the game
                game.markModified('grid');
                await game.save();

                // Update the player
                await player.save();

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
                            client.send(JSON.stringify({ type: 'click', success: true, id: data.playerId, name: player.name, x: data.x, y: data.y , destinations: [clientId], gameCode: data.gameCode, grid: game.grid , gameClock: game.gameClock, token: data.token, coins: player.coins , updater: updater}));
                        }
                    }
                });

            } catch (err) {
                console.error(err);
            }
        }

        if (data.type === 'timer') {
            try {
                const game = await Game.findOne({ gameCode: data.gameCode });
                if (!game) {
                    throw new Error('Game not found');
                }

                const nowTime = new Date();
                const timeDiff = nowTime - game.startDate;
                const timeDiffSeconds = timeDiff / 1000;
                // To int
                const timeDiffSecondsInt = Math.floor(timeDiffSeconds);

                
                // get ids of all players in game
                const playerIds = [game.player1, game.player2];
                
                // get the keys values from playersHash where the value is in playerIds
                const clientSockets = [playersHash.get(game.player1), playersHash.get(game.player2)];
                
                // Send a confirmation message back to the client
                clientSockets.forEach(client => {
                    if (client !== undefined) {
                        if (client.readyState === WebSocket.OPEN) {
                            // Check if the game has reached 2 minute
                            if (timeDiffSeconds > 120) {
                                client.send(JSON.stringify({ type: 'timer', success: false, error: 'Game has ended', destinations: [clientId] }));
                            }
                            client.send(JSON.stringify({ type: 'timer', success: true, gameClock: timeDiffSecondsInt, destinations: [clientId] }));
                        }
                    }
                });
            }
            catch (err) {
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