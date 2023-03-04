import logo from './logo.svg';
import './App.css';

import Grille from './Grille.js';

import React from 'react';
import WebSocketComponent from './WebSocketComponent.js';
import { useState, useEffect } from 'react';
import Shop from './Card';

function App() {

    const [socket, setSocket] = useState(null);
    const [update, setUpdate] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [gameCode, setGameCode] = useState("");
    const [clientToken, setClientToken] = useState("");

    function updateGrilleCallback(message) {
        setUpdate(message.grid);
    }

    function updatePlayerCallback(message) {
        console.log("App received message: " + message);
        if (playerId === ""){
            setPlayerId(message.id);
            setPlayerName(message.name);
        }
        console.log("Player name: " + playerName);
        console.log("Player id: " + playerId);
    }

    useEffect(() => {
        // generate a random client token
        const token = Math.random().toString(36).substring(2);
        setClientToken(token);

        setSocket(new WebSocketComponent({ updateGrilleCallback, updatePlayerCallback , token}));

    }, []);


    if (playerId === "") {
        return (
            <div className="App">
                <header className="App-header">
                    <p>Entrez votre nom:</p>
                    <input type="text" id="name" name="name" />
                    <input type="text" id="gameCode" name="gameCode" />
                    <button onClick={() => {
                        const name = document.getElementById("name").value;
                        const gameCode = document.getElementById("gameCode").value;
                        setGameCode(gameCode);
                        const socketMessage = {
                            type: "register",
                            name: name,
                            gameCode: gameCode,
                            token: clientToken
                        };
                        socket.sendMessage(JSON.stringify(socketMessage));

                    }}>Valider</button>
                </header>
            </div>
        );
    }

    if (socket) {
        return (
            <div className='all-container'>
                <div className="App">
                    <div className="infos">
                        <p>Bienvenue {playerName}!</p>
                        <p>Code de la partie: {gameCode}</p>
                        <p>Id du joueur: {playerId}</p>
                    </div>
                    <header className="App-header">

                        <Grille socket={socket} update={update} gameCode={gameCode} playerId={playerId} />

                        <Shop socket={socket} gameCode={gameCode} playerId={playerId} />
                    </header>
                </div>
            </div>
        );
    } else {
        return (
            <div className="App">
                <header className="App-header">
                    <p>Chargement...</p>
                </header>
            </div>
        );
    }
}

export default App;
