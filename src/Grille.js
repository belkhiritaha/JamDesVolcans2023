import React, { useState, useEffect } from 'react';
import './Grille.css';

const TAILLE = 20;

function Grille() {
    const [grille, setGrille] = useState([]);

    useEffect(() => {
        const generateGrille = () => {
            let grille = [];
            for (let i = 0; i < TAILLE; i++) {
                let ligne = [];
                for (let j = 0; j < TAILLE; j++) {
                    let handleClick = () => {
                        console.log(`Clicked cell (${i}, ${j})`);
                    };
                    ligne.push(<td key={j} onClick={handleClick}></td>);
                }
                grille.push(<tr key={i}>{ligne}</tr>);
            }
            setGrille(grille);
        };

        generateGrille();
    }, []);

    return (
        <table>
            <thead>{grille}</thead>
        </table>
    );
}

export default Grille;
