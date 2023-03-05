import logo from './logo.svg';
import './App.css';

import Grille from './Grille.js';

import React from 'react';
import WebSocketComponent from './WebSocketComponent.js';
import { useState, useEffect } from 'react';
import Shop from './Card';
import Background from './Background';

function App() {

    const [socket, setSocket] = useState(null);
    const [update, setUpdate] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [gameCode, setGameCode] = useState("");
    const [clientToken, setClientToken] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [counter, setCounter] = useState(1000);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameTimer, setGameTimer] = useState(120);
    const [frequency, setFrequency] = useState(0);
    const [coins, setCoins] = useState(0);

    function updateCoinsCallback(message) {
        setCoins(message.coins);
    }

    function updateTimerCallback(message) {
        if (message.success === true){
            setGameTimer(120 - message.gameClock);
        }
        else {
            const timerDiv = document.getElementById("time");
            timerDiv.innerHTML = "La partie est terminée";
        }
    }

    function updateGrilleCallback(message) {
        setUpdate(message.grid);
    }

    function updateStatusCallback(message) {
        setErrorMessage(message);
    }


    function startCounterCallback() {
        setCounter(3);
        setTimeout(() => {
            setCounter(2);
        }, 1000);

        setTimeout(() => {
            setCounter(1);
        }, 2000);

        setTimeout(() => {
            setCounter(0);
        }, 3000);


        setTimeout(() => {
            setCounter(0);
            console.log("Game started");
            setGameStarted(true);
        }, 4000);

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

        console.log("Client token: " + token);

        setSocket(new WebSocketComponent({ updateGrilleCallback, updatePlayerCallback , token, updateStatusCallback, startCounterCallback , updateTimerCallback, updateCoinsCallback}));
    }, []);

    useEffect(() => {
        if (gameStarted){
            setInterval(() => {
                const socketMessage = {
                    type: "timer",
                    gameCode: gameCode
                };
                socket.sendMessage(JSON.stringify(socketMessage));
            }, 1000);

        }
    }, [gameStarted]);


    if (playerId === "") {
        return (
            <>
                <div className="App">
                    <header className="App-header">
                        <p>Entrez votre nom:</p>
                        <input type="text" id="name" name="name" />
                        <p>Entrez le code de la partie:</p>
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

                        <p>{errorMessage}</p>
                    </header>
                </div>

                <Background  />
            </>

        );
    }

    if (socket) {
        if (gameStarted){
            return (
                <>
                    <div className='all-container'>
                        <div className="App">
                            {/* <div className="infos">
                                <p>Bienvenue {playerName}!</p>
                                <p>Code de la partie: {gameCode}</p>
                            </div> */}
                            <header className="App-header">
                                <p id="time">Temps restant: {gameTimer}</p>

                                <Grille socket={socket} update={update} gameCode={gameCode} playerId={playerId} token={clientToken} />
        
                                <Shop socket={socket} gameCode={gameCode} playerId={playerId} coins={coins} />
                            </header>
                        </div>
                    </div>

                    <Background  coins={coins} />
                </>
            );
        } else {
            if (counter === 1000){
                return (
                    <>
                        <div className="App">
                            <header className="App-header">
                                <p>Attente d'un autre joueur...</p>

                                <p>Code de la partie: {gameCode}</p>
                            </header>
                        </div>

                        <Background  />
                    </>
                )
            }
            else {
                return (
                    <>
                        <div className="App">
                            <header className="App-header">
                                <p>La partie commence dans {counter} secondes</p>
                            </header>
                        </div>

                        <Background  />
                    </>
                );
            }
        }
    } else {
        return (
            <>
                <div className="App">
                    <header className="App-header">
                        <p>Chargement...</p>
                    </header>
                </div>

                <Background  />
            </>
        );
    }
}

export default App;
