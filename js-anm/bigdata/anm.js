const random = function (n, r) {
  if ((arguments.length < 2 && ((r = n), (n = 0)), n > r)) {
    var a = r;
    (r = n), (n = a);
  }
  return Math.floor(Math.random() * (r - n + 1)) + n;
};
const getDis = function(p1, p2) {
  var a = p2.x-p1.x;
  var b = p2.y-p1.y;
  return Math.sqrt(a*a+b*b);
}
// 通过正切值得到角度
function getTanDeg(tan) {
  var result = Math.atan(tan) / (Math.PI / 180);
  result = Math.round(result);
  return result;
}
/*
  p1点1； p2点2；p3默认为空，自动使用p1 到p2 的直线长度1/3的垂直点位
*/
const Bezier = function (p1, p2, p3 = null) {
  let point = {}
  let P1ToP2Len = getDis(p1, p2)
  if(p3 === null) {
    const mid = { x: p1.x + (p2.x-p1.x)/2,y: p1.y + (p2.y-p1.y)/2 }
    console.log("中点")
    let deg = getTanDeg(mid.x/mid.y)
    let extendLineLen = mid.y/Math.sin(deg)
    let p1ToExtendPLen = extendLineLen / Math.cos(deg)

    point.y = Math.sin(deg) * (extendLineLen+P1ToP2Len/2)
    point.x = p1ToExtendPLen-Math.cos(deg)*(extendLineLen+P1ToP2Len/2)
    console.log(point)
  }
  this.draw = (ctx) => {
    ctx.beginPath()
    ctx.moveTo(...p1)
  }
};
