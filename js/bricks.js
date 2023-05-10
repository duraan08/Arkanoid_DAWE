//Variables de las dimensiones del ladrillo
var ANCHURA_LADRILLO = 16;
var ALTURA_LADRILLO = 8;
//Array de colores
coords = {
    "red" : [3*ANCHURA_LADRILLO, 0],
    "grey" : [4*ANCHURA_LADRILLO,0],
}

function Brick(x, y, color) {
// TU CÓDIGO AQUÍ
    this.x = x;
    this.y = y;
    this.color = color;
    this.sprite = new Sprite('img/sprites.png', coords[color], [ANCHURA_LADRILLO, ALTURA_LADRILLO]);
}

Brick.prototype = {
draw: function(ctx) {
    // TU CÓDIGO AQUÍ
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    //ctx.fillRect(this.x, this.y, ANCHURA_LADRILLO, ALTURA_LADRILLO);
    //ctx.fill();
    //ctx.stroke();
    this.sprite.render(ctx);
    ctx.restore();
}
};
