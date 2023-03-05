import './Background.css'
import React, { useEffect, useState } from 'react';
import { set } from 'mongoose';

function Background(props) {

    const [squares, setSquares] = useState([]);
    const [lastCoin, setLastCoin] = useState(0);

    useEffect(() => {
        var canvas = document.getElementById("bg-canvas");
        var ctx = canvas.getContext("2d");

        // Set the canvas size to match the window
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 20;

        // Generate and animate multiple colored squares

        function Square(x, y, size, color, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.speed = speed;

            this.update = function () {
                this.y -= this.speed;
                this.draw();
            }

            this.draw = function () {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        function generateSquare() {
            var colors = ["#ff3b3f", "#06c8ff", "#f6c", "#7af", "#fc0"];
            var minSize = 10;
            var maxSize = 30;
            var minSpeed = 1;
            var maxSpeed = 5;

            //   for (var i = 0; i < 50; i++) {
            var x = Math.floor(Math.random() * canvas.width);
            var y = Math.floor(Math.random() * canvas.height);
            var size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            var color = colors[Math.floor(Math.random() * colors.length)];
            var speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;

            var square = new Square(x, y, size, color, speed);
            squares.push(square);
            //   }
        }

        function generateSquare2(x,y) {
            var colors = ["#ff3b3f", "#06c8ff", "#f6c", "#7af", "#fc0"];
            var minSize = 10;
            var maxSize = 30;
            var minSpeed = 1;
            var maxSpeed = 5;

            var size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            var color = colors[Math.floor(Math.random() * colors.length)];
            var speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;

            var square = new Square(x, y, size, color, speed);
            squares.push(square);
            //   }
        }

        function animate() {
            requestAnimationFrame(animate);

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw the squares
            for (var i = 0; i < squares.length; i++) {
                squares[i].update();
                if ((squares[i].y < 0) || (squares[i].y > canvas.height) || (squares[i].x < 0) || (squares[i].x > canvas.width)) {
                    squares.splice(i, 1);
                }


            }
        }
        var x = 0;
        var y = 0;
        var root = document.getElementById("root");
        root.addEventListener("mousemove", function (e) {
            x = e.clientX;
            y = e.clientY;
        });

        if (props.coins) {
            if (props.coins > lastCoin){
                // get cursor position
                generateSquare2(x,y)

            }
            setLastCoin(props.coins);
        }
            
        animate();

    }, [props.coins]);

    useEffect(() => {
        var canvas = document.getElementById("bg-canvas");
        var ctx = canvas.getContext("2d");

        // Set the canvas size to match the window
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 20;

        // Generate and animate multiple colored squares

        function Square(x, y, size, color, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.speed = speed;

            this.update = function () {
                this.y -= this.speed;
                this.draw();
            }

            this.draw = function () {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        function generateSquare() {
            var colors = ["#ff3b3f", "#06c8ff", "#f6c", "#7af", "#fc0"];
            var minSize = 10;
            var maxSize = 30;
            var minSpeed = 1;
            var maxSpeed = 5;

            //   for (var i = 0; i < 50; i++) {
            var x = Math.floor(Math.random() * canvas.width);
            var y = Math.floor(Math.random() * canvas.height);
            var size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            var color = colors[Math.floor(Math.random() * colors.length)];
            var speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;

            var square = new Square(x, y, size, color, speed);
            squares.push(square);
            //   }
        }

        function generateSquare2(x,y) {
            var colors = ["#ff3b3f", "#06c8ff", "#f6c", "#7af", "#fc0"];
            var minSize = 10;
            var maxSize = 30;
            var minSpeed = 1;
            var maxSpeed = 5;

            var size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            var color = colors[Math.floor(Math.random() * colors.length)];
            var speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;

            var square = new Square(x, y, size, color, speed);
            squares.push(square);
            //   }
        }

        function animate() {
            requestAnimationFrame(animate);

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw the squares
            for (var i = 0; i < squares.length; i++) {
                squares[i].update();
                if ((squares[i].y < 0) || (squares[i].y > canvas.height) || (squares[i].x < 0) || (squares[i].x > canvas.width)) {
                    squares.splice(i, 1);
                }


            }
        }

        setTimeout(function () {
            setInterval(generateSquare, 100);
        }, 1000);
            
        animate();

    }, []);


    return (
        <canvas id="bg-canvas" className="background"></canvas>
    );
}

export default Background;