window.onload = function () {
    // Variables globales de utilidad
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    console.log(w);
    var h = canvas.height;
    // var x = 130,
    //  y = 135; // posición inicial de Vaus
    var delta;
    //var ANCHURA_LADRILLO = 16,
        //ALTURA_LADRILLO = 8;

    // var frames = 30;

    function intersects(left, up, right, bottom, cx, cy, radius )
    {
    var closestX = (cx < left ? left : (cx > right ? right : cx));
    var closestY = (cy < up ? up : (cy > bottom ? bottom : cy));
    var dx = closestX - cx;
    var dy = closestY - cy;
    var side;

    var dt = Math.abs(up - cy);
    var db = Math.abs(bottom - cy);
    var dr = Math.abs(right - cx); 
    var dl = Math.abs(left - cx);
    var dm = Math.min(dt, db, dr, dl);
    switch (dm) {
        case dt: 
        side = "top";
        break;
        case db:
        side = "bottom";
        break;
        case dr:
        side = "right";
        break;
        case dl:
        side = "left";
        break;
    }

    return result = { c : ( dx * dx + dy * dy ) <= radius * radius, d : side  };
    }

    // Collisions between rectangle and circle
    function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
    var testX = cx;
    var testY = cy;

    if (testX < x0)
        testX = x0;
    if (testX > (x0 + w0))
        testX = (x0 + w0);
    if (testY < y0)
        testY = y0;
    if (testY > (y0 + h0))
        testY = (y0 + h0);

    return (((cx - testX) * (cx - testX) + (cy - testY) * (cy - testY)) < r * r);
    }

    function testCollisionWithWalls(ball, w, h) {
        // TU CÓDIGO AQUÍ
        if (ball.x > w - ball.diameter / 2) {
            ball.angle = -ball.angle + Math.PI;
            ball.x = w - ball.diameter / 2;
            return false;
        }
        // abajo
        if (ball.y > h - ball.diameter / 2) {
            ball.angle = -ball.angle;
            ball.y = h - ball.diameter / 2;
            return true;
        }
        // izquierda
        if (ball.x < ball.diameter / 2) {
            ball.angle = -ball.angle + Math.PI;
            ball.x = ball.diameter / 2;
            return false;
        }
        // arriba
        if (ball.y < ball.diameter / 2) {
            ball.angle = -ball.angle;
            ball.y = ball.diameter / 2;
            return false;
        }

    }


    // función auxiliar
    var calcDistanceToMove = function(delta, speed) {
    // TU CÓDIGO AQUÍ
        return (speed * delta) / 1000.0;
    };


    function Ball(x, y, angle, v, diameter, sticky) {
    // TU CÓDIGO AQUÍ
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.v = v;
    this.diameter = diameter;
    this.sticky = sticky;
    this.draw = function(ctx) {
        // TU CÓDIGO AQUÍ
            ctx.beginPath();
        ctx.save();
        ctx.arc(this.x, this.y, this.diameter / 2, 0, 2 * Math.PI);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    this.move = function(x, y) {
        // TU CÓDIGO AQUÍ
        if (x != undefined && y != undefined) {
            this.x = x;
            this.y = y;
        }
        else {
            var incX = this.v * Math.cos(this.angle);
            var incY = this.v * Math.sin(this.angle);
            this.x += calcDistanceToMove(delta, incX);
            this.y -= calcDistanceToMove(delta, incY);
        }
    };

    }

    // Inits
    window.onload = function init() {
        var game = new GF();
        game.start();
    };


    // GAME FRAMEWORK STARTS HERE
    var GF = function() {

    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps, oldTime = 0;
    var music;
    var sonidos;

    //  var speed = 300; // px/s 
    //  var vausWidth = 30,   vausHeight = 10;

    var balls = [];
    var bricks = [];
    var bricksLeft;

    var terrainPattern;

    var lifes = 3;

    // vars for handling inputs
    var inputStates = {};

    // game states
    var gameStates = {
        // TU CÓDIGO AQUÍ
        0: "running",
        1: "gameOver"
    };

    var currentGameState = "running" ;    // TU CÓDIGO AQUÍ


    // VAUS en objeto literal 
    var paddle = {
        dead: false,
        x: 10,
        y: 130,
        width: 32,
        height: 8,
        speed: 300, // pixels/s 
        sticky: false,
        sprite: new Sprite('img/sprites.png', [224,40], [32,8], 16, [0,1])
    };



    var ladrillos = [
        // grey
        {
        x: 20,
        y: 20,
        c: 'grey'
        }, {
        x: (20 * 2 + ANCHURA_LADRILLO),
        y: 20,
        c: 'grey'
        }, {
        x: 20 * 3 + ANCHURA_LADRILLO * 2,
        y: 20,
        c: 'grey'
        }, {
        x: 20 * 4 + ANCHURA_LADRILLO * 3,
        y: 20,
        c: 'grey'
        }, {
        x: 20 * 5 + ANCHURA_LADRILLO * 4,
        y: 20,
        c: 'grey'
        },
        // red
        {
        x: 20,
        y: 42,
        c: 'red'
        }, {
        x: 20 * 2 + ANCHURA_LADRILLO,
        y: 42,
        c: 'red'
        }, {
        x: 20 * 3 + ANCHURA_LADRILLO * 2,
        y: 42,
        c: 'red'
        }, {
        x: 20 * 4 + ANCHURA_LADRILLO * 3,
        y: 42,
        c: 'red'
        }, {
        x: 20 * 5 + ANCHURA_LADRILLO * 4,
        y: 42,
        c: 'red'
        }
    ];



    var createBricks = function() {
        // TU CÓDIGO AQUÍ
        for(let brick of ladrillos) {
        bricks.push(new Brick(brick.x, brick.y, brick.c));
        bricksLeft = bricks.length;
        }
    }

    var drawBricks = function() {
        // TU CÓDIGO AQUÍ
        for(let brick of bricks) {
        brick.draw(ctx);
        }
    };

    var measureFPS = function(newTime) {

        // test for the very first invocation
        if (lastTime === undefined) {
        lastTime = newTime;
        return;
        }

        //calculate the difference between last & current frame
        var diffTime = newTime - lastTime;

        if (diffTime >= 1000) {

        fps = frameCount;
        frameCount = 0;
        lastTime = newTime;
        }

        //and display it in an element we appended to the 
        // document in the start() function
        fpsContainer.innerHTML = 'FPS: ' + fps;
        frameCount++;
    };

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = terrainPattern;
        ctx.fillRect(0, 0, w, h);    
    }


    function testBrickCollision(ball) {
        // TU CÓDIGO AQUÍ
        for(let i = 0; i < bricks.length; i++)  {
        b = bricks[i];
        let res = intersects(b.x, b.y, b.x+ANCHURA_LADRILLO, b.y+ALTURA_LADRILLO, ball.x, ball.y, ball.diameter/2 );

        if(res.c) { // si hay colision
            //Insertamos sonido
            sonidos.play("point");
            switch(res.d) { // lado del choque
            case "bottom":
                ball.angle = -ball.angle;
                ball.y = b.y + ALTURA_LADRILLO + ball.diameter / 2;
                break;
            case "top":
                ball.angle = -ball.angle;
                ball.y = b.y - ball.diameter / 2;
                break;
            case "right":
                ball.angle = -ball.angle + Math.PI;
                ball.x = b.x + ANCHURA_LADRILLO + ball.diameter / 2;
                break;
            case "left":
                ball.angle = -ball.angle + Math.PI;
                ball.x = b.x - ball.diameter / 2;
                break;
            }
            bricks.splice(i, 1); // eliminamos el ladrillo
            paddle.speed += 20; // aumentamos velocidad de la bola
        }
        }

        // devuelve el número de ladrillos que quedan
        return bricks.length;
    }

    // Función para pintar la raqueta Vaus
    function drawVaus(x, y) {
        // TU CÓDIGO AQUÍ
        //ctx.beginPath();
        ctx.save();
        ctx.translate(x,y);
        paddle.sprite.render(ctx);
        //ctx.fillStyle = "black";
        //ctx.fillRect(x, y, 30, 10);
        //ctx.fill();
        //ctx.stroke();
        ctx.restore();
    }

    function displayLifes() {
        // TU CÓDIGO AQUÍ
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillText(`Vidas: ${lifes}`, w-40, 8);
        ctx.restore();
    }

    var updatePaddlePosition = function() {
        paddle.sprite.update(delta);
        var incX = Math.ceil(calcDistanceToMove(delta, paddle.speed));
        // TU CÓDIGO AQUÍ
        if (inputStates.left == 1) {
        paddle.x = paddle.x - incX;
        }
        if (inputStates.right == 1) {
        paddle.x = paddle.x + incX;
        }
        if (paddle.x < 0) {
        paddle.x = 0;
        }
        if (paddle.x + paddle.width > w) {
        paddle.x = w - paddle.width;
        }
    }


    function updateBalls() {
        for (var i = balls.length - 1; i >= 0; i--) {
        var ball = balls[i];
        ball.move();

        var die = testCollisionWithWalls(ball, w, h);

        // TU CÓDIGO AQUÍ
        // Nuevo: gestiona la pérdida de una bola usando los atributos de paddle
                if (die) {
            balls.splice(i, 1);
            if (balls.length == 0) {
            lifes -= 1;
            paddle.dead = true;
            }
            if(lifes > 0){
            new_ball = new Ball( paddle.x + (paddle.width/2), paddle.y, Math.PI / 3, 100, 6, false);
            balls.push(new_ball);
            }
        }
        // NUEVO
        // test if ball collides with any brick
        bricksLeft = testBrickCollision(ball);

        // TU CÓDIGO AQUÍ
        // Test if the paddle collides
        // NUEVO: Gestiona el rebote de la bola con Vaus usando los atributos de paddle
                if (circRectsOverlap(paddle.x, paddle.y, paddle.width, paddle.height, ball.x, ball.y, ball.diameter/2)) {
            ball.y = paddle.y - ball.diameter/2;
            ball.angle = -ball.angle;
            sonidos.play("paddle");
        }
        ball.draw(ctx);
        }
    }

    function timer(currentTime) {
        var aux = currentTime - oldTime;
        oldTime = currentTime;
        return aux;

    }
    var mainLoop = function(time) {
        //main function, called each frame 
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        // TU CÓDIGO AQUÍ
        // NUEVO
        // Si se ha perdido una vida, comprobar si quedan más 
        // si no --> Game Over
        // si quedan más --> sacar una nueva bola (y actualizar el atributo paddle.dead)
            if (lifes == 0) {
            currentGameState = gameStates[1];
        }

        // TU CÓDIGO AQUÍ
        // SI currentGameState = en ejecución
        // todo sigue como antes: 
            if(currentGameState == gameStates[0]){
        // Mover Vaus de izquierda a derecha
        updatePaddlePosition();

        updateBalls();

        // draw Vaus
        drawVaus(paddle.x, paddle.y);

        // dibujar ladrillos
        drawBricks();

        displayLifes();

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
        }
        // PERO Si currentGameState = GAME OVER
        // PINTAR la pantalla de negro y escribir GAME OVER
            else{
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "white";
        ctx.fillText("GAME OVER", w/2 - 35, h/2 + 5); 
        }       
    };

    function initTerrain(){
        //Se obtiene la imagen que queremos para el fondo de pantalla
        terrain = new Sprite('img/sprites.png', [97, 80], [31, 32]);
        //Creamos el wallpaper repitiendo la imagen escogida
        terrainPattern = ctx.createPattern(terrain.image(), 'repeat');
    }

    function inicializarGestorTeclado() {
        document.addEventListener('keydown', (e) => {
        if (e.code === "ArrowLeft") {
            inputStates.left = 1;
        } else if (e.code === "ArrowRight") {
            inputStates.right = 1;
        }
        });
        document.addEventListener('keyup', (e) => {
        if (e.code === "ArrowLeft") {
            inputStates.left = 0;
        } else if (e.code === "ArrowRight") {
            inputStates.right = 0;
        } else if (e.code === "Space") {
        }
        });
    }

    function loadAssets(callback){
        // Cargar sonido asíncronamente usando howler.js
	    music = new Howl({
		    urls: ['music/Game_Start.ogg'],
		  volume: 1,
		  onload: function() {
          	callback();
          }
         }); // new Howl

         sonidos = new Howl({
            urls : ['music/sounds.mp3'],
            volume : 1,
            sprite : {
                point: [0,700],
                salir: [1000,1700],
                empezar: [3000,2700],
                paddle : [11200, 700],
            },
            oload : function(){
                callback();
            }
        });
    }

    function init(){
        loadAssets(startNewGame);
        //startNewGame();
    }

    function startNewGame(){
        initTerrain();
        balls.push(new Ball(10, 70, Math.PI / 3, 100, 6, false));
        createBricks();
        music.play();
        requestAnimationFrame(mainLoop);
    }
    
    var start = function() {
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);

        inicializarGestorTeclado();

        resources.load(['img/sprites.png']);
        resources.onReady(init);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
    };


    var game = new GF();
    game.start();
}