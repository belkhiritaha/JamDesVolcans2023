import React, { useState, useEffect } from 'react';
import './Card.css';


function Shop(props) {
    const [isOpen, setIsOpen] = useState(false);
    
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

    return (
        <div className="shop-container">
            <div className={`exit ${isOpen ? 'open' : ''}`}>
                <h2 onClick={handleClick}>Close</h2>
                {isOpen ? (
                    <div className="Message">
                        <p>
                            Vous ne pouvez pas cliquer sur les cases de votre adversaire.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}