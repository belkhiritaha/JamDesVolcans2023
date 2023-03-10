const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');

/*
1: carte const
2: carte const
3: carte const
4: carte const
5: carte const
6: carte dest
7: carte dest
8: carte dest
9: carte dest
10: carte dest
*/


const clickTypes = [
    [{x: 1, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 0, y: 0}, {x: 1, y:1}],
    [{x: 1, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 10, y: 5}, {x: 1, y:1}]
];


const deckCards = [
    {imageSrc: "http://jamdesvolcans:3000/cartes/construction/0.png", title: "Construction 1 ", description: "", cost: "10", id: 0, type: 0 , area: {x: 1, y: 1}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/construction/1.png", title: "Construction 2 ", description: "", cost: "4", id: 1, type: 0 , area: {x: 2, y: 2}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/construction/2.png", title: "Construction 3 ", description: "", cost: "9", id: 2, type: 0 , area: {x: 3, y: 3}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/construction/3.png", title: "Construction 4 ", description: "", cost: "16", id: 3, type: 0 , area: {x: 4, y: 4}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/construction/4.png", title: "Construction 5 ", description: "", cost: "25", id: 4, type: 0 , area: {x: 5, y: 5}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/0.png",   title: "Destruction 1 ", description: "", cost: "10", id: 5, type: 1 , area: {x: 1, y: 1}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/1.png",   title: "Destruction 2 ", description: "", cost: "4", id: 6, type: 1 , area: {x: 2, y: 2}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/2.png",   title: "Destruction 3 ", description: "", cost: "9", id: 7, type: 1 , area: {x: 3, y: 3}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/3.png",   title: "Destruction 4 ", description: "", cost: "16", id: 8, type: 1 , area: {x: 4, y: 4}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/destruction/4.png",   title: "Destruction 5 ", description: "", cost: "25", id: 9, type: 1 , area: {x: 5, y: 5}},
    {imageSrc: "http://jamdesvolcans:3000/cartes/dos.png",   title: "DECK", description: "", cost: "10", id: 10, type: 1 , area: {x: 6, y: 6}},
]

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
    coins: Number,
    card: Number
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
                    coins: 0,
                    card: 5
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

                const playerIds = [game.player1, game.player2];

                console.log("this is the playerIds: ", playerIds)
                // get the keys values from playersHash where the value is in playerIds
                const clientSockets = [playersHash.get(game.player1), playersHash.get(game.player2)];                

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

        if(data.type === 'buy')
        {
            try {
                // Find the game
                const game = await Game.findOne({ gameCode: data.gameCode });
                if (!game) {
                    throw new Error('Game not found');
                }

                // Find the player
                const player = await Player.findOne({ _id: data.playerId });
                if (!player) {
                    throw new Error('Player not found');
                }
                
                console.log("received: ", data)
                // get the type of  the card
                const cardId = data.cardIdBought;

                const cardData = deckCards[cardId];

                // check if the player has enough coins
                if (player.coins < cardData.cost) {
                    throw new Error('Not enough coins');
                }

                // update the player's coins
                player.coins -= cardData.cost;

                // update the player's card
                player.card = cardId;

                // generate two ints between 1 and 5
                const x = Math.floor(Math.random() * 10) + 1;
                const y = Math.floor(Math.random() * 10) + 1;

                const deck = {card1: x, card2: y};
                
                await game.save();

                await player.save();

                // Send a confirmation message back to the client
                playersHash.get(player._id.toString()).send(JSON.stringify({ type: 'buy', success: true, coins: player.coins, card: player.card, deck: deck }));

                // clientId.send(JSON.stringify({ type: 'buy', success: true, coins: player.coins, card: player.card }));

            } catch (err) {
                console.error(err);
            }
        }

        if (data.type === 'click') {
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

                
                const area = deckCards[player.card].area;

                console.log("this is the area: ", area)

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

                player.card = 0;

                // Update the player
                await player.save();

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