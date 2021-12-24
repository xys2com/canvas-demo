var cvsHouse = $x("#canvas-house");
var h_width = 0;
var h_height = 0;
h_width = cvsHouse.width = document.body.offsetWidth;
h_height = cvsHouse.height = document.body.offsetHeight/10*4;
// cvsHouse.style.top=document.body.offsetHeight/10*6
var houseCtx = cvsHouse.getContext("2d");

function drawScenery() {
    var fromX = 0;
    var fromY = 0;
    var toX = h_width;
    var toY = 0;

    var cpX = h_width / 2;
    var cpY = -200;

    houseCtx.beginPath();
    houseCtx.moveTo(fromX, fromY);
    houseCtx.quadraticCurveTo(cpX, cpY, toX, toY);
    // houseCtx.strokeStyle = "#fff";
    houseCtx.lineTo(h_width,h_height)
    houseCtx.lineTo(0,h_height)
    houseCtx.lineTo(fromX, fromY)
    houseCtx.fillStyle="#040426"
    houseCtx.fill();
    // houseCtx.stroke();
    houseCtx.closePath();
}

window.onload=function(){
    drawMoonShadow()
}
