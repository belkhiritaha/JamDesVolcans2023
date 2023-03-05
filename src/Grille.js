import React, { useState, useEffect } from 'react';
import './Grille.css';

const TAILLE = 20;

function Cell(props) {
    const [clicked, setClicked] = useState(false);
    const handleClick = () => {
        // console.log(props);

        // CLICK TYPE 0 = build , 1 = destroy
        // CLICK CARD 0 = nothing, BUILD: 1 = 2x2 , 3 = 4x2, DESTROY: 1 = 2x2, 2 = all adjacent
        const socketMessage = {
            type: "click",
            clickType: 0,
            clickCard: 1,
            x: props.x,
            y: props.y,
            playerId: props.playerId,
            gameCode: props.gameCode,
            token: props.token
        };
        props.socket.sendMessage(JSON.stringify(socketMessage));
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
    // console.log("Grille rendered");

    useEffect(() => {
        const generateGrille = () => {
            let grille = [];
            for (let i = 0; i < TAILLE; i++) {
                let ligne = [];
                for (let j = 0; j < TAILLE; j++) {
                    ligne.push(
                        <Cell socket={props.socket} key={j} x={i} y={j} playerId={props.playerId} gameCode={props.gameCode} token={props.token} />
                    );
                }
                grille.push(<tr key={i}>{ligne}</tr>);
            }
            setGrille(grille);
        };

        generateGrille();
    }, []);


    useEffect(() => {
        // console.log("Grille updated");
        // colorer la cellule
        // console.log(props.update);
        for (let i = 0; i < props.update.length; i++) {
            for (let j = 0; j < props.update[i].length; j++) {
                if (props.update[i][j] === 1) {
                    const cell = document.getElementsByClassName("cell")[i * TAILLE + j];
                    cell.classList.remove("clicked2")
                    cell.classList.add("clicked1");
                }
                if (props.update[i][j] === 2) {
                    const cell = document.getElementsByClassName("cell")[i * TAILLE + j];
                    cell.classList.add("clicked2");
                    cell.classList.remove("clicked1");
                }
                if (props.update[i][j] === 0) {
                    const cell = document.getElementsByClassName("cell")[i * TAILLE + j];
                    cell.classList.remove("clicked1");
                }
            }
        }

    }, [props.update]);

    



    return (
        <div id="grille">
            <table>
                <thead>{grille}</thead>
            </table>
        </div>
    );
}

export default Grille;
