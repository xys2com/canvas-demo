const random = function (n, r) {
  if ((arguments.length < 2 && ((r = n), (n = 0)), n > r)) {
    var a = r;
    (r = n), (n = a);
  }
  return Math.floor(Math.random() * (r - n + 1)) + n;
};
const $ = (e) => {
  const els = document.querySelectorAll(e);
  return els.length === 1 ? els[0] : els;
};

let stage = $("#stage");
stage.width = 800
stage.height = 600
let sctx = stage.getContext("2d");

let bottle = new Bottle(2)
bottle.createBottle()
sctx.drawImage(bottle.canvas, 0,0)