import logo from './logo.svg';
import './App.css';

import Grille from './Grille.js';

import React from 'react';

class WebSocketComponent extends React.Component {
    constructor(props) {
        super(props);

        // Create a new WebSocket instance
        this.websocket = new WebSocket('ws://localhost:8080');

        // Set up event listeners for the WebSocket instance
        this.websocket.addEventListener('open', event => {
            console.log('WebSocket connection opened');
        });

        this.websocket.addEventListener('close', event => {
            console.log('WebSocket connection closed');
        });

        this.websocket.addEventListener('message', event => {
            console.log(`Received WebSocket message: ${event.data}`);
        });
    }

    // ...

    render() {
        return (
            <div>
                <h1>WebSocket Example</h1>
                <p>Check the console logs for WebSocket events</p>
            </div>
        );
    }

    // Clean up the WebSocket instance when the component is unmounted
    componentWillUnmount() {
        this.websocket.close();
    }
}


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <WebSocketComponent />
                <Grille />
            </header>
        </div>
    );
}

export default App;
