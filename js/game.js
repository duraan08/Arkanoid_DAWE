window.onload = function () {
    // Variables globales de utilidad
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    console.log(w);
    var h = canvas.height;
    var delta;
	
    //Función para saber si hay intersección entre el ladrillo y la bola
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
    //Devuelve el lado del ladrillo en el que ha colisionado
    return result = { c : ( dx * dx + dy * dy ) <= radius * radius, d : side  };
    }

    //Función para saber si hay contacto entre la raqueta y la bola
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
	
    //Función que comprueba si la bola está en contacto con algún borde de la pantalla
    function testCollisionWithWalls(ball, w, h) {
        // derecha
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


    //Función para calcular el número de píxeles que hay que moverse para alcanzar la velocidad indicada (speed)
    var calcDistanceToMove = function(delta, speed) {
        return (speed * delta) / 1000.0;
    };

    //Función para crear la pelota
    function Ball(x, y, angle, v, diameter, sticky) {
    //Se declaran las variables
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.v = v;
    this.diameter = diameter;
    this.sticky = sticky;
    //Se dibuja en el canvas
    this.draw = function(ctx) {
        ctx.beginPath();
        ctx.save();
		//Se dibuja el contorno
        ctx.arc(this.x, this.y, this.diameter / 2, 0, 2 * Math.PI);
		//Se pinta rellena de color rojo
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    //Mueve la bola a la posición x e y 
    this.move = function(x, y) {
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

    //Llama a comenzar el juego
    window.onload = function init() {
        var game = new GF();
        game.start();
    };

    //Instancia de juego
    var GF = function() {
	    
		//Se declaran las variables
		var frameCount = 0;
		var lastTime;
		var fpsContainer;
		var fps, oldTime = 0;
		var music;
		var sonidos;

		var balls = [];
		var bricks = [];
		var bricksLeft;

		var terrainPattern;

		var lifes = 3;

		var bonuses = [];

		var inputStates = {};

		//Estados del juego
		var gameStates = {
			0: "running",
			1: "gameOver"
		};

		var currentGameState = "running" ;

		//Se declara la raqueta 
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
			
		//Se declaran los ladrillos
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
	   
		//Función para crear los ladrillos
		var createBricks = function() {
			for(let brick of ladrillos) {
				bricks.push(new Brick(brick.x, brick.y, brick.c));
				bricksLeft = bricks.length;
			}
		}

		//Función para pintar los ladrillos en el canvas
		var drawBricks = function() {
			for(let brick of bricks) {
				brick.draw(ctx);
			}
		};

		//Función para calcular los FPS a los que va el juego
		var measureFPS = function(newTime) {
			//La primera ejecución tiene una condición especial
			if (lastTime === undefined) {
				lastTime = newTime;
				return;
			}
			//Calcular el delta entre el frame actual y el anterior
			var diffTime = newTime - lastTime;
			if (diffTime >= 1000) {
				fps = frameCount;
				frameCount = 0;
				lastTime = newTime;
			}
			//Mostrar los FPS en una capa del document que hemos construído en la función start()
			fpsContainer.innerHTML = 'FPS: ' + fps;
			frameCount++;
		};

		//Función para limpiar el contenido del canvas
		function clearCanvas() {
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = terrainPattern;
			ctx.fillRect(0, 0, w, h);    
		}

		//Función para calcular si hay colisión entre la pelota y los ladrillos
		function testBrickCollision(ball) {
		//Comprueba si hay intersección con todos los ladrillos
			for(let i = 0; i < bricks.length; i++)  {
			b = bricks[i];
		//Llama a la función intersec que devuelve si hay o no intersección y el lado del ladrillo con el que hay intersección
			let res = intersects(b.x, b.y, b.x+ANCHURA_LADRILLO, b.y+ALTURA_LADRILLO, ball.x, ball.y, ball.diameter/2 );
		 //Si hay colisión
			if(res.c) {
				//Insertamos sonido
				sonidos.play("point");
			//Lado del choque
				switch(res.d) {
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
			//Eliminamos el ladrillo
				bricks.splice(i, 1);
			//Aumentamos velocidad de la bola
				paddle.speed += 20;
			}
			}
			//Devuelve el número de ladrillos que quedan
			return bricks.length;
		}

		// Función para pintar la raqueta "Vaus" en el canvas
		function drawVaus(x, y) {
			ctx.save();
			ctx.translate(x,y);
			paddle.sprite.render(ctx);
			ctx.restore();
		}
			
		//Función para pintar las vidas en el canvas
		function displayLifes() {
			ctx.save();
			ctx.fillStyle = "yellow";
			ctx.fillText(`Vidas: ${lifes}`, w-40, 8);
			ctx.restore();
		}

		//Función para actualizar la posición de la raquete con las flechas
		var updatePaddlePosition = function() {
			paddle.sprite.update(delta);
			var incX = Math.ceil(calcDistanceToMove(delta, paddle.speed));
		//Si pulsa la flecha de la izquierda
			if (inputStates.left == 1) {
			//Se mueve la raqueta a la izquierda
				paddle.x = paddle.x - incX;
			}
		//Si pulsa la flecha de la derecha
			if (inputStates.right == 1) {
			//Se mueve la raqueta a la derecha
				paddle.x = paddle.x + incX;
			}
		//Si llega al límite de la izquierda no se modifica más
			if (paddle.x < 0) {
				paddle.x = 0;
			}
		//Si llega al límite de la derecha no se modifica más
			if (paddle.x + paddle.width > w) {
				paddle.x = w - paddle.width;
			}
		}

		//Función para actualizar las bolas restantes
		function updateBalls() {
			for (var i = balls.length - 1; i >= 0; i--) {
				var ball = balls[i];
				ball.move();
				//Comprueba si ha golpeado con la pared de abajo
				var die = testCollisionWithWalls(ball, w, h);
				//Si ha golpeado con la pared de abajo (ha perdido)
				if (die) {
					balls.splice(i, 1);
					if (balls.length == 0) {
						//Se elimina una vida
						lifes -= 1;
						paddle.dead = true;
					}
					if(lifes > 0){
						new_ball = new Ball( paddle.x + (paddle.width/2), paddle.y, Math.PI / 3, 100, 6, false);
						balls.push(new_ball);
					}
				}
				//Comprueba si la bola ha dado con algún ladrillo
				bricksLeft = testBrickCollision(ball);
				//Comprueba si hay colisión entre la raqueta y la bola y gestiona su rebote
				if (circRectsOverlap(paddle.x, paddle.y, paddle.width, paddle.height, ball.x, ball.y, ball.diameter/2)) {
					ball.y = paddle.y - ball.diameter/2;
					ball.angle = -ball.angle;
					if (inputStates.right){
						ball.angle = ball.angle * (ball.angle < 0 ? 0.5 : 1.5);
					}
					else if (inputStates.left){
						ball.angle = ball.angle * (ball.angle > 0 ? 0.5 : 1.5);
					}
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

		//Función para crear los bonus
		function Bonus(){
			this.type = 'C';
			this.x = 50;
			this.y = 50;
			this.width= 16;
			this.height= 8;
			this.speed= 80;
			this.sprite= new Sprite('img/sprites.png', [224,0], [16,8], 0.5, [0,1,2,3]);
		};

		Bonus.prototype = {
			//Pinta el bonus en su posición
			draw : function(ctx){
				ctx.save();
				ctx.translate(this.x, this.y);
				this.sprite.render(ctx);

				ctx.restore();
			},
			//Mueve el bonus hacia abajo
			move : function(){
				this.sprite().update(delta);
				this.y += calcDistanceToMove(delta, this.speed);
			}
		};


		var mainLoop = function(time) {
			//Calcula los frames
			measureFPS(time);

			//Number of ms since last frame draw
			delta = timer(time);

			//Limpia el canvas
			clearCanvas();

			// Si se ha perdido una vida, comprobar si quedan más 
			// si no --> Game Over
			// si quedan más --> sacar una nueva bola (y actualizar el atributo paddle.dead)
			if (lifes == 0) {
				currentGameState = gameStates[1];
			}

			// SI currentGameState = en ejecución
			// todo sigue como antes: 
			if(currentGameState == gameStates[0]){
				// Mover Vaus de izquierda a derecha
				updatePaddlePosition();
				
				//Modificar la bola
				updateBalls();

				// draw Vaus
				drawVaus(paddle.x, paddle.y);

				// dibujar ladrillos
				drawBricks();
				
				//Mostrar las vidas
				displayLifes();

				//Modificar el bonus
				//updateBonus();

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
			terrain = new Sprite('img/sprites.png', [49, 80], [31, 31]);
			//Creamos el wallpaper repitiendo la imagen escogida
			terrainPattern = ctx.createPattern(terrain.image(), 'repeat');
		}

		//Función para controlar las teclas pulsadas para mover la raqueta
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
			//Cargar sonido asíncronamente usando howler.js
			music = new Howl({
				urls: ['music/Game_Start.ogg'],
				volume: 1,
				onload: function() {
					callback();
				}
			});

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
		}
		
		//Crea un nuevo juego
		function startNewGame(){
			initTerrain();
			balls.push(new Ball(10, 70, Math.PI / 3, 100, 6, false));
			createBricks();
			music.play();
			bonuses.push(new Bonus());
			requestAnimationFrame(mainLoop);
		}
		
		var start = function() {
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
