const { sin, cos, tan, sqrt, atan, random, PI, abs, floor } = Math;
const randomFn = function (n, r) {
  if ((arguments.length < 2 && ((r = n), (n = 0)), n > r)) {
    var a = r;
    (r = n), (n = a);
  }
  return floor(random() * (r - n + 1)) + n;
};
const getDis = function (p1, p2) {
  var a = p2.x - p1.x;
  var b = p2.y - p1.y;
  return sqrt(a * a + b * b);
};
// 通过正切值得到角度
function getTanDeg(tan) {
  var result = atan(tan) / (PI / 180);
  return result;
}
/*
  p1点1； p2点2；p3默认为空，自动使用p1 到p2 的直线长度1/3的垂直点位
*/
const Bezier = function (ctx, p1, p2, p3 = null) {
  let point = {};
  let P1ToP2Len = getDis(p1, p2);
  this.P1ToP2Len = P1ToP2Len;
  if (p3 === null) {
    const vmid = { x: abs(p2.x - p1.x) / 2, y: abs(p2.y - p1.y) / 2 };
    this.vmid = vmid;
    let deg = getTanDeg(vmid.x / vmid.y);
    let rad = (deg * PI) / 180;
    this.rad = rad;
    let extendLineLen = vmid.y / sin(rad);

    let allExtendLineLen = extendLineLen + P1ToP2Len / 2;
    let C_ShadowToE_LineLen = cos(rad) * allExtendLineLen;

    let p1ToExtendPLen = extendLineLen / cos(rad);
    let xy = getRealyPosition(p1, p2);
    point.x = p1ToExtendPLen - C_ShadowToE_LineLen + xy.x;

    point.y = xy.y - sin(rad) * allExtendLineLen;
    console.log(point);

    this.point = point;
  }
  this.draw = (ctx) => {
    let xy = getRealyPosition(p1, p2);
    const vmid = this.vmid;
    const mid = {
      x: vmid.x + xy.x,
      y: xy.y - vmid.y,
    };
    let exLenP = {
      x: vmid.y / tan(this.rad) - vmid.x + xy.x,
      y: xy.y,
    };
    let midS_p = {
      x: mid.x,
      y: xy.y,
    };
    let pointS_p = {
      x: this.point.x,
      y: xy.y,
    };
    // 辅助线
    Tool.arc(ctx, p1);
    Tool.text(ctx, p1, "p1");
    Tool.arc(ctx, point);
    Tool.text(ctx, point, "point");
    Tool.arc(ctx, p2);
    Tool.text(ctx, p2, "p2");
    Tool.arc(ctx, mid);
    Tool.text(ctx, mid, "mid");
    Tool.line(ctx, p1, p2);
    Tool.line(ctx, point, mid);
    Tool.line(ctx, mid, exLenP);
    Tool.text(ctx, exLenP, "exLenP");
    Tool.line(ctx, mid, midS_p, true);
    Tool.line(ctx, point, pointS_p, true);
    //
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(point.x, point.y, p2.x, p2.y);
    ctx.strokeStyle = "#000";
    ctx.stroke();
  };
};

function getRealyPosition(p1, p2) {
  let x, y;
  if (p2.x < p1.x) {
    x = p2.x;
  } else {
    x = p1.x;
  }
  if (p2.y < p1.y) {
    y = p1.y;
  } else {
    y = p2.y;
  }
  return { x, y };
}

const Tool = {
  arc: function (ctx, p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, PI * 2);
    ctx.fillStyle = "#f00";
    ctx.fill();
  },
  line: function (ctx, p1, p2, dotted = false) {
    if (dotted) {
      ctx.save();
      ctx.setLineDash([5]);
    }
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = "#f00";
    ctx.stroke();
    if (dotted) ctx.restore();
  },
  text: function (ctx, p, txt) {
    ctx.font = `12px bold 黑体`;
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    let x = p.x,
      y = p.y;
    if (p.x + (txt.length / 2) * 12 >= ctx.canvas.width) {
      x = ctx.canvas.width - (txt.length / 2) * 12;
    }
    if (p.x + (txt.length / 2) * 12 <= 0) {
      x = (txt.length / 2) * 12;
    }
    if (p.y + 6 > ctx.canvas.height) {
      y = ctx.canvas.height - 6;
    }
    if (p.y < 6) {
      y = 6;
    }
    ctx.fillText(txt, x, y);
  },
};
