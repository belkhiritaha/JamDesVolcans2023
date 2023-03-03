import logo from './logo.svg';
import './App.css';

import Grille from './Grille.js';

import React from 'react';
import WebSocketComponent from './WebSocketComponent.js';
import { useState, useEffect } from 'react';
import Card from './Card';

function App() {

    const [socket, setSocket] = useState(null);
    const [update, setUpdate] = useState({x: -1, y: -1});

    function updateGrilleCallback(message) {
        console.log("App received message: " + message);
        const x = parseInt(message.split(" ")[2]);
        const y = parseInt(message.split(" ")[3]);
        // console.log("x: " + x + ", y: " + y);
        // console.log(message.split(" "));
        setUpdate({x: x, y: y});
    }
    useEffect(() => {
        setSocket(new WebSocketComponent( updateGrilleCallback={updateGrilleCallback} ));
    }, []);


    if (socket) {
        return (
            <div className="App">
                <header className="App-header">
                    <Grille socket={socket} update={update} />

                    <div className="cards-container">
                    <Card imageSrc="https://picsum.photos/200/300" imageAlt="Image description" />
                    <Card imageSrc="https://picsum.photos/200/300" imageAlt="Image description" />
                    </div>
                </header>
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
