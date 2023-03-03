import React, { useState, useEffect } from 'react';
import './Card.css';

function Card(props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const grilleDiv = document.getElementById('grille');
        grilleDiv.classList.add('blur');
    } else {
        const grilleDiv = document.getElementById('grille');
        grilleDiv.classList.remove('blur');
    }
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
      <div className="card-container">
      <div className={`card ${isOpen ? 'open' : ''}`} onClick={handleClick}>
        <img src={props.imageSrc} alt={props.imageAlt} />
      </div>
    </div>
  );
}

export default Card;
