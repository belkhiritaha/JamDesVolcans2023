import React, { useState, useEffect } from 'react';
import './Grille.css';

const TAILLE = 20;

function Cell(props) {
    const [clicked, setClicked] = useState(false);
    const handleClick = () => {
        // console.log(props);
        props.socket.sendMessage("Clicked on " + props.x + ", " + props.y);
        setClicked(!clicked);
    };

    return (
        <td
            className={clicked ? 'cell clicked' : 'cell'}
            onClick={handleClick}
        ></td>
    );
}

function Grille(props) {
    const [grille, setGrille] = useState([]);

    useEffect(() => {
        const generateGrille = () => {
            let grille = [];
            for (let i = 0; i < TAILLE; i++) {
                let ligne = [];
                for (let j = 0; j < TAILLE; j++) {
                    ligne.push(
                        <Cell socket={props.socket} key={j} x={i} y={j} />
                    );
                }
                grille.push(<tr key={i}>{ligne}</tr>);
            }
            setGrille(grille);
        };

        generateGrille();
    }, []);


    useEffect(() => {
        console.log("Grille updated");
        // colorer la cellule
        console.log(props.update);
        if (props.update.x >= 0 && props.update.y >= 0){
            console.log(props.update);
            const cell = document.getElementsByClassName("cell")[props.update.x * TAILLE + props.update.y];
            cell.classList.add("clicked");
        }

    }, [props.update]);

    



    return (
        <table>
            <thead>{grille}</thead>
        </table>
    );
}

export default Grille;
