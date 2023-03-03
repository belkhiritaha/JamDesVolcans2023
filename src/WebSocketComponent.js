import React from 'react';
import { useState, useEffect } from 'react';

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
            props.updateGrilleCallback(event.data);
        });
    }

    sendMessage(message) {
        // Check if the WebSocket is open before sending the message
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(message);
        } else {
            console.log('WebSocket is not open');
        }
    }

    render() {
        return <div></div>;
    }

    // Clean up the WebSocket instance when the component is unmounted
    componentWillUnmount() {
        this.websocket.close();
    }
}

export default WebSocketComponent;
