import React, { useState, useEffect } from 'react';
import './Card.css';

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


function Card(props) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        const socketMessage = {
            type: "buy",
            playerId: props.playerId,
            gameCode: props.gameCode,
            cardIdBought: props.id
        };
        console.log(socketMessage);
        props.socket.sendMessage(JSON.stringify(socketMessage));
        setIsOpen(!isOpen);
    };

    console.log(props.id);

    return (
        <div className="card-container">
            <div className={`card ${isOpen ? 'open' : ''}`} onClick={handleClick}>
                <img src={deckCards[props.id].imageSrc} alt="card" />           
                <div className="card-content">
                    <h2>{deckCards[props.id].title}</h2>
                    {
                        props.title === "DECK" ? (
                            <p>PIOCHER UNE CARTE</p>
                        ) : (
                            <p>COST: {deckCards[props.id].cost}</p>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

function Shop(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [cardsLeft, setCardsLeft] = useState(8);

    useEffect(() => {
        if (isOpen) {
            const grilleDiv = document.getElementById('grille');
            // hide the grille when the card is open
            grilleDiv.style.display = 'none';
            //   grilleDiv.classList.add('blur');
        } else {
            const grilleDiv = document.getElementById('grille');
            // show the grille when the card is closed
            grilleDiv.style.display = 'block';
            //   grilleDiv.classList.remove('blur');
        }
    }, [isOpen]);

    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const handleCardClick = () => {
        setIsOpen(!isOpen);
        setCardsLeft(cardsLeft-1);
    }

    return (
        <div className="shop-container">
            <div className={`exit ${isOpen ? 'open' : ''}`}>
                <h2 onClick={handleClick}>{isOpen ? 'CLOSE SHOP' : 'SHOP'}</h2>
                {isOpen ? (
                    <div className="shop-content">
                        <div className="cards-container" onClick={handleCardClick}>
                            <Card socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} id={props.deckCard1} />
                            <Card socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} id={props.deckCard2} />
                            <Card socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} id={10} />
                        </div>

                        <div className="coins-container">
                            <h2>COINS: {props.coins}</h2>
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
}


export default Shop;
