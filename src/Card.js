import React, { useState, useEffect } from 'react';
import './Card.css';


function Card(props) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        const socketMessage = {
            type: "buy",
            playerId: props.playerId,
            gameCode: props.gameCode,
            cardIdBought: props.player.card,
            coinsleft: props.player.coins
        };
        props.socket.sendMessage(JSON.stringify(socketMessage));
        setIsOpen(!isOpen);
    };

    return (
        <div className="card-container">
            <div className={`card ${isOpen ? 'open' : ''}`} onClick={handleClick}>
                <img src={props.imageSrc} alt={props.imageAlt} />            
                <div className="card-content">
                    <h2>{props.title}</h2>
                    <p>{props.description}</p>
                    <p>COST: {props.cost} coins</p>
                </div>
            </div>
        </div>
    );
}

function Shop(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [cardsLeft, setCardsLeft] = useState(8);
    const [firstCard, setFirstCard] = usestate("");
    const [secondCard, setSecondCard] = usestate("");


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
                <h2 onClick={handleClick}>EXIT</h2>
                {isOpen ? (
                    <div className="shop-content">
                        <div className="cards-container" onClick={handleCardClick}>
                            <Card imageSrc="https://picsum.photos/200/300" imageAlt="Image description" title="DOUBLE TROUBLE" description="This card lets you build 2x2 blocks" cost="10" socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} />
                            <Card imageSrc="https://picsum.photos/200/300" imageAlt="Image description" title="TRIPLE RIPPLE" description="This card lets you build 3x3 blocks" cost="40" socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} />
                        </div>
                        <div className="deck" onClick={handleCardClick}>
                            <Card imageSrc="https://picsum.photos/200/300" imageAlt="Image description" title="DECK" description="This card lets you build 2x2 blocks" cost="10" socket={props.socket} playerId={props.playerId} gameCode={props.gameCode} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}


export default Shop;
