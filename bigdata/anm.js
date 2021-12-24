const { sin, cos, tan, sqrt, atan, random, PI, abs, floor, pow } = Math;
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
// 根据长度、斜率和一个点得到另一个点
const getOtherPoint = function (len, k, p1) {
  let p2 = { x: null, y: null };
  let { x: x1, y: y1 } = p1;
  let { x: x2, y: y2 } = p2;
  let deg = getTanDeg(k);
  y2 = y1 - len * sin(deg * (PI / 180));
  x2 = x1 - len * cos(deg * (PI / 180));
  if (y2 <= p1.y) {
    return { x: x2, y: y2 };
  } else {
    y2 = y1 + len * sin(deg * (PI / 180));
    x2 = x1 + len * cos(deg * (PI / 180));
    return { x: x2, y: y2 };
  }
};
// 通过正切值得到角度
function getTanDeg(tan) {
  var result = atan(tan) / (PI / 180);
  return result;
}
/*
  p1点1； p2点2；p3默认为空，自动使用p1 到p2 的直线长度1/3的垂直点位
*/
const Bezier = function (p1, p2, p3 = null) {
  let P1ToP2Len = getDis(p1, p2);
  this.P1ToP2Len = P1ToP2Len;
  this.p1 = p1;
  this.p2 = p3;
  this.p3 = p2;

  this.nx = p1.x;
  this.ny = p1.y;
  this.t = 0;
  this.vt = (randomFn(10, 15) / 10 / 120) * (1 / (P1ToP2Len / 100));
  this.trail = [];
  this.count = 20;
  this.step = 0;
  this.pre_time = Date.now();
  this.R = 50;
  this.r = 5;
  this.rate = 1 / 100;
  // this.ring = createRing(this.R);
  this.ringAlpha = 1;
  this.dot = createDot(this.r, this.count);
  this.rings = [];

  if (p3 === null) {
    const vmid = {
      x: abs(p2.x - p1.x) / 2,
      y: abs(p2.y - p1.y) / 2,
    };
    this.vmid = vmid;
    this.k = (p2.y - p1.y) / (p2.x - p1.x);
    this.midnormal_k = -1 / this.k;
    const mid = {
      x: p1.x > p2.x ? p2.x + vmid.x : p1.x + vmid.x,
      y: p1.y > p2.y ? p2.y + vmid.y : p1.y + vmid.y,
    };
    this.mid = mid;
    let point = getOtherPoint(P1ToP2Len / 3, this.midnormal_k, mid);
    this.point = point;
    this.p2 = point;
  }
  this.init = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(this.point.x, this.point.y, p2.x, p2.y);
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  };
  this.draw = (ctx) => {
    // 第一阶段
    // if (this.step === 0) {
    let { x: x1, y: y1 } = this.p1;
    let { x: x2, y: y2 } = this.p2;
    let { x: x3, y: y3 } = this.p3;
    this.nx =
      pow(1 - this.t, 2) * x1 +
      2 * this.t * (1 - this.t) * x2 +
      pow(this.t, 2) * x3;

    this.ny =
      pow(1 - this.t, 2) * y1 +
      2 * this.t * (1 - this.t) * y2 +
      pow(this.t, 2) * y3;
    this.t = this.t + this.vt;
    ctx.drawImage(
      this.dot,
      this.nx - this.r / 2,
      this.ny - this.r / 2,
      this.r,
      this.r
    );
    // 进入第二阶段
    if (this.t >= 1) {
      this.step = 1;
      this.t = 0;
    }
    // }
    // 拖尾
    let _now_time = Date.now();
    if (_now_time - this.pre_time > 80) {
      this.pre_time = _now_time;
      // if (this.step === 1) {
      //   this.trail.pop();
      // } else {
      if (this.trail.length < this.count) {
        this.trail.unshift({
          x: this.nx,
          y: this.ny,
        });
      } else {
        this.trail.pop();
        this.trail.unshift({
          x: this.nx,
          y: this.ny,
        });
      }
      // }
    }
    this.trail.forEach((e, i) => {
      let rate = 0.8 - i / this.count / 2;
      rate = rate < 0.2 ? 0.2 : rate;
      rate = rate > 0.8 ? 0.8 : rate;
      ctx.save();
      ctx.globalAlpha = rate;
      ctx.beginPath();
      ctx.arc(e.x, e.y, (this.r / 2) * rate, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
    });
  };
};

const Bezier2 = function (p1, p2, p3 = null) {
  let P1ToP2Len = getDis(p1, p2);
  this.P1ToP2Len = P1ToP2Len;
  this.p1 = p1;
  this.p2 = p3;
  this.p3 = p2;

  this.nx = p1.x;
  this.ny = p1.y;
  this.t = 0;
  // 越长越慢
  this.vt = (randomFn(10, 15) / 10 / 120) * (1 / (P1ToP2Len / 100));
  this.trail = [];
  this.count = 50;
  this.step = 0;
  this.pre_time = Date.now();
  this.R = 50;
  this.r = 5;
  this.rate = 1 / 100;
  // this.ring = createRing(this.R);
  this.ringAlpha = 1;
  this.dot = createDot(this.r, this.count);
  this.rings = [];

  if (p3 === null) {
    const vmid = {
      x: abs(p2.x - p1.x) / 2,
      y: abs(p2.y - p1.y) / 2,
    };
    this.vmid = vmid;
    this.k = (p2.y - p1.y) / (p2.x - p1.x);
    this.midnormal_k = -1 / this.k;
    const mid = {
      x: p1.x > p2.x ? p2.x + vmid.x : p1.x + vmid.x,
      y: p1.y > p2.y ? p2.y + vmid.y : p1.y + vmid.y,
    };
    this.mid = mid;
    let point = getOtherPoint(P1ToP2Len / 3, this.midnormal_k, mid);
    this.point = point;
    this.p2 = point;
  }
  this.init = (ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(this.point.x, this.point.y, p2.x, p2.y);
    ctx.strokeStyle = "#f0f";
    ctx.stroke();
    ctx.restore();
  };
  this.draw = (ctx, i) => {
    let { x: x1, y: y1 } = this.p1;
    let { x: x2, y: y2 } = this.p2;
    let { x: x3, y: y3 } = this.p3;
    this.nx =
      pow(1 - this.t, 2) * x1 +
      2 * this.t * (1 - this.t) * x2 +
      pow(this.t, 2) * x3;

    this.ny =
      pow(1 - this.t, 2) * y1 +
      2 * this.t * (1 - this.t) * y2 +
      pow(this.t, 2) * y3;
    this.t = this.t + this.vt;
    if (!i) {
      this.init(ctx);
    }
    ctx.drawImage(
      this.dot,
      this.nx - this.r / 2,
      this.ny - this.r / 2,
      this.r,
      this.r
    );
    if (this.t >= 1) {
      // this.step = 1;
      this.t = 0;
    }

    // 拖尾
    let _now_time = Date.now();
    if (_now_time - this.pre_time > 30) {
      this.pre_time = _now_time;
      if (this.trail.length < this.count) {
        this.trail.unshift({
          x: this.nx,
          y: this.ny,
        });
      } else {
        this.trail.pop();
        this.trail.unshift({
          x: this.nx,
          y: this.ny,
        });
      }
    }
    this.trail.forEach((e, i) => {
      let rate = 1 - i / this.count / 2;
      // rate = rate > 0.9 ? 0.9 : rate;
      ctx.save();
      ctx.globalAlpha = rate;
      ctx.beginPath();
      ctx.arc(e.x, e.y, (this.r / 2) * rate, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
    });
  };
};

// 创建拖尾小点
function createDot(r, rate = 10) {
  const R = r * (rate / 10);
  let c = document.createElement("canvas");
  c.width = R;
  c.height = R;
  let ctx = c.getContext("2d");
  let x = R / 2,
    y = R / 2;
  ctx.globalAlpha = rate / 10;
  ctx.arc(x, y, R / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  return c;
}
function drawRing(ctx, R, rate, p, alpha = 1) {
  let r = (R / 2) * rate;
  r = r === 0 ? 1 : r;
  ctx.save();
  let grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
  grd.addColorStop(0, "transparent");
  grd.addColorStop(1, "#fff");
  ctx.globalAlpha = alpha;
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}
function createRing(R) {
  // #8cd629 绿色；#fff62b 黄色
  let c = document.createElement("canvas");
  c.width = R;
  c.height = R;
  let ctx = c.getContext("2d");
  let x = R / 2,
    y = R / 2;
  let grd = ctx.createRadialGradient(R / 2, R / 2, 0, R / 2, R / 2, R / 2);
  grd.addColorStop(0, "transparent");
  grd.addColorStop(1, "#fff");
  ctx.arc(x, y, R / 2, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  return c;
}
// 工具
const Tool = {
  arc: function (ctx, p) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, PI * 2);
    ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.restore();
  },
  ring: function (p, r, ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, PI * 2);
    ctx.strokeStyle = "#f00";
    ctx.stroke();
    ctx.restore();
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
    ctx.fillStyle = "#ff0";
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
// 闪烁点位
const Ring = function () {
  this.r = 80;
  this.rate = 0;
  this.rateV = 1 / 120;
  this.x = null;
  this.y = null;
  this.alpha = 1;
  this.alphaV = 1 / 120;
  this.ring = createRing(this.r);
  this.step = 0;
  this.init = (x, y) => {
    this.x = x;
    this.y = y;
  };
  this.draw = (ctx) => {
    if (this.step === 0) {
      let offset = this.rate * this.r;
      ctx.drawImage(
        this.ring,
        this.x - offset / 2,
        this.y - offset / 2,
        offset,
        offset
      );
      this.rate += this.rateV;
      if (this.rate >= 1) {
        this.step = 1;
        this.rate = 0;
      }
    }
    if (this.step === 1) {
      let offset = this.r;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.drawImage(
        this.ring,
        this.x - offset / 2,
        this.y - offset / 2,
        offset,
        offset
      );
      this.alpha -= this.alphaV;
      ctx.restore();
      if (this.alpha <= 0) {
        this.alpha = 1;
        this.step = 0;
      }
    }
  };
};

// 移动小球
const Movedot = function (w, h, color, d3) {
  this.r = randomFn(40, 60);
  this.x = randomFn((w / 10) * 4, (w / 10) * 6);
  this.y = randomFn((h / 10) * 4, (h / 10) * 6);
  this.xd = randomFn(0, 1) === 1 ? 1 : -1;
  this.yd = randomFn(0, 1) === 1 ? 1 : -1;
  this.linked = false;
  this.color = color;
  this.dot = creatMoveDot(this.r, color, d3);
  this.dotRefresh = function (d3) {
    this.dot = creatMoveDot(this.r, this.color, d3);
  };
  this.vinit = () => {
    this.xv = (randomFn(7, 8) / 12) * (1 / (this.r / 60));
    this.yv = (randomFn(7, 8) / 12) * (1 / (this.r / 60));
  };
  this.vinit();
  this.draw = (ctx) => {
    if (getDis({ x: w / 2, y: h / 2 }, this) >= 150 - this.r / 2) {
      this.xd = this.xd * -1;
      this.yd = this.yd * -1;
      this.vinit();
    }
    let offset = this.r / 2;
    this.x = this.x + this.xv * this.xd;
    this.y = this.y + this.yv * this.yd;
    ctx.drawImage(this.dot, this.x - offset, this.y - offset, this.r, this.r);
  };
};
// 创建移动的小球
const creatMoveDot = function (R, color, d3 = false) {
  let c = document.createElement("canvas");
  c.width = R + 8;
  c.height = R + 8;
  let ctx = c.getContext("2d");
  let x = (R + 8) / 2,
    y = (R + 8) / 2;
  ctx.arc(x, y, R / 2, 0, PI * 2);
  let grd = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, R / 2 + 3);
  let midColor = x16Half(color);
  grd.addColorStop(0, "#fff");
  grd.addColorStop(0.5, color);
  grd.addColorStop(1, midColor);
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 6;
  ctx.fillStyle = d3 ? grd : color;
  // ctx.fillStyle = color;
  ctx.fill();
  return c;
};
// 色彩色值减半 -> 变暗
const x16Half = (color, rate = 0.5) => {
  let hexvs = "0123456789abcdef".split("");
  if (color.length !== 7 && color.length !== 4 && color.length !== 9) {
    console.log("请放入hex颜色值！");
    return;
  }
  if (
    color.split("").every((e) => {
      return hexvs.includes(e);
    })
  ) {
    console.log("请放入正确的hex颜色值！");
    return;
  }

  const fn = (hex) => {
    let hf =
      hexvs[parseInt(((hex * 16 + hex) * rate) / 16)] +
      hexvs[parseInt(((hex * 16 + hex) * rate) % 16)];
    return hf;
  };
  const fn2 = (hex1, hex2) => {
    let hf =
      hexvs[parseInt(((hex1 * 16 + hex2) * rate) / 16)] +
      hexvs[parseInt(((hex1 * 16 + hex2) * rate) % 16)];
    return hf;
  };
  let len = color.length;
  let halfstr;
  if (len === 4) {
    let vs = color
      .substring(1, len)
      .split("")
      .map((e) => {
        let index = hexvs.findIndex((es) => {
          return e === es;
        });
        return index;
      });
    halfstr = `#${fn(vs[0])}${fn(vs[1])}${fn(vs[2])}`;
  } else {
    let vs = color
      .substring(1, len)
      .split("")
      .map((e) => {
        let index = hexvs.findIndex((es) => {
          return e === es;
        });
        return index;
      });
    halfstr =
      len === 7
        ? `#${fn2(vs[0], vs[1])}${fn2(vs[2], vs[3])}${fn2(vs[4], vs[5])}`
        : `#${fn2(vs[0], vs[1])}${fn2(vs[2], vs[3])}${fn2(vs[4], vs[5])}${fn2(
            vs[6],
            vs[7]
          )}`;
  }
  return halfstr;
};
// 将移动小球连线
const link = function (balls, ctx) {
  balls.forEach((e) => {
    balls.forEach((e2) => {
      if (!e.linked && !e.linked) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e2.x, e2.y);
        ctx.globalCompositeOperation = "destination-over";
        let grd = ctx.createLinearGradient(e.x, e.y, e2.x, e2.y);
        grd.addColorStop(0, e.color);
        grd.addColorStop(1, e2.color);
        let dis = getDis(e, e2);
        let rate = dis / 100;
        rate = rate > 2 ? 2 : rate;
        rate = rate < 0.1 ? 0.1 : rate;
        ctx.lineWidth = 3 * (1 / rate);
        ctx.strokeStyle = grd;
        ctx.stroke();
        ctx.restore();
      }
    });
  });
};

// 旋转圆弧
const RotateArc = function (r = 50, R = 150, data) {
  this.innerR = r;
  this.outerR = R;
  this.data = data || [
    {
      color: "#d18f52",
      value: 10,
    },
    {
      color: "#c162de",
      value: 15,
    },
    {
      color: "#42b3c2",
      value: 20,
    },
    {
      color: "#98c379",
      value: 25,
    },
    {
      color: "#61afef",
      value: 30,
    },
  ];
  this.ringNum = this.data.length;
  this.vds = [];
  this.values = 0;
  this.gap = 5;
  this.init = () => {
    // 弧线的宽度， 每个弧线间隔为 gap
    this.lineWidth = (this.outerR - this.innerR) / this.ringNum - this.gap;
    this.data.map((e) => {
      this.values += e.value;
    });
    let createDegs = 0;
    this.vds = this.data.map((e, i) => {
      let deg = (e.value / this.values) * 360;
      let r = this.innerR + i * (this.lineWidth + this.gap);
      let raratev = randomFn(50, 100) / 100;
      let dir = randomFn(0, 1) ? 1 : -1;
      createDegs += deg;
      return {
        sdeg: createDegs - deg,
        deg: deg,
        r,
        color: e.color,
        raratev,
        dir,
      };
    });
  };
  this.draw = (ctx) => {
    this.vds.map((e) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        this.outerR,
        this.outerR,
        e.r,
        (e.sdeg / 360) * PI * 2,
        ((e.sdeg + e.deg) / 360) * PI * 2
      );
      e.sdeg += e.raratev * e.dir;
      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = e.color;
      ctx.stroke();
      ctx.restore();
    });
  };
};

// 旋转角度 ctx设置没有复原
const centerRotate = function (deg) {
  let w = this.canvas.width / 2;
  let h = this.canvas.height / 2;
  this.translate(w, h);
  this.rotate((deg * Math.PI) / 180);
  this.translate(-w, -h);
};
