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
            // console.log(`Received WebSocket message: ${event.data}`);

            // Parse the message as JSON
            const data = JSON.parse(event.data);

            // Check if message is destined to this player


            // Check if the message is a registration message
            if (data.type === 'register') {
                if (data.success === true) {
                    // console.log(data)
                    console.log(`Registered with ID ${data.id}`);
                    if (props.token === data.token) {
                        props.updatePlayerCallback({name: data.name, id: data.id});
                        // console.log("nice")
                    }

                    if (data.isFull === true) {
                        // console.log("ifFull")
                        props.startCounterCallback();
                    }
                    console.log(props)
                } else {
                    // console.error(`Failed to register player: ${data.error}`);
                    props.updateStatusCallback(data.error);
                }
            }

            if (data.type === 'click') {
                props.updateGrilleCallback(data);
                // console.log(data.token)
                // console.log(props.token)
                if (props.token === data.token) {
                    props.updateCoinsCallback(data);
                    // console.log(data.coins)
                }
            }
            
            if (data.type === 'timer') {
                props.updateTimerCallback(data);
            }

            if (data.type === 'buy') {
                props.updateCoinsCallback(data);
                if (data.success === true) {
                    props.updateDeckCallback(data);
                    console.log(data)
                }
            }

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
