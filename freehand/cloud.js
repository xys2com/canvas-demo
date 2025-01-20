class Clouds extends HandDraw {
  constructor(options) {
    super(options);
    this.Clouds = new Map();
  }
}
// 菱形点阵分布
function latticeRandom({ width, height, count = 500 }) {
  const offsetY = height / 6;
  const offsetX = width / 6;
  const CX = width / 2;
  const CY = height / 2;
  const CX9 = CX * 0.9;
  const CY9 = CY * 0.8;
  let lattice = [];
  for (let i = 0; i < count; i++) {
    // 越靠近x中部出现的概率越大
    // x .9 是绘制圆形的不超出画布
    const xRate = Math.pow(Math.random(), 2) * CX9;
    const x = CX + xRate * [-1, 1][random(0, 1)];
    // const x = random(-50, width + 50);
    const _xr = (x / width) * 180;

    // 越接近x轴 上下波总范围越小
    // 0.8 次方
    const yFluctuate = Math.pow(1 - Math.abs(x - CX) / CX, 0.8);

    // 取 0 - π  宽度 0 - WIDTH
    const ymax =
      Math.sin((_xr * Math.PI) / 180) * CY9 * yFluctuate +
      CY +
      random(-offsetY, offsetY);

    const ymin = height - ymax + random(-offsetY, offsetY) * 2;
    const y = random(ymin, ymax);
    const _x = x + random(-offsetX, offsetX);
    const _y = y;
    lattice.push({ x: _x, y: _y });
  }
  // let type = random(1, 2);
  // lattice =
  // type == 1
  lattice = lattice.sort((a, b) => b.y - a.y);
  // : lattice.sort((a, b) => a.y - b.y);
  return lattice;
}

function getBezierCurveLoc3(path, t) {
  let [x1, y1, x2, y2, x3, y3, x4, y4] = path;
  const { pow } = Math;
  let nx =
    x1 * pow(1 - t, 3) +
    3 * x2 * t * pow(1 - t, 2) +
    3 * x3 * pow(t, 2) * (1 - t) +
    x4 * pow(t, 3);

  let ny =
    y1 * pow(1 - t, 3) +
    3 * y2 * t * pow(1 - t, 2) +
    3 * y3 * pow(t, 2) * (1 - t) +
    y4 * pow(t, 3);
  return {
    x: nx,
    y: ny,
  };
}
function getBezierCurveLoc2(path, t) {
  // 二次贝塞尔曲线
  let [x1, y1, x2, y2, x3, y3] = path;
  let pow = Math.pow;
  let nx = pow(1 - t, 2) * x1 + 2 * t * (1 - t) * x2 + pow(t, 2) * x3;

  let ny = pow(1 - t, 2) * y1 + 2 * t * (1 - t) * y2 + pow(t, 2) * y3;
  return {
    x: nx,
    y: ny,
  };
}
function getTwoBL(minX, maxX, minY, maxY, ofw, ofh) {
  let d1, d2, d3, d4, d5;
  let d11, d22, d33, d44, d55;
  d1 = {
    x: random(minX, maxX),
    y: random(minY, maxY),
  };
  d4 = {
    x: random(minX, maxX),
    y: random(minY, maxY),
  };
  d2 = {
    x: random(minX, maxX),
    y: random(minY, maxY),
  };
  d3 = {
    x: random(minX, maxX),
    y: random(minY, maxY),
  };
  d5 = {
    x: (d1.x + d4.x) / 2 + random(-ofw, ofw),
    y: (d1.y + d4.y) / 2 + random(-ofh, ofh),
  };
  d11 = {
    x: d1.x + random(-ofw, ofw),
    y: d1.y + random(-ofh, ofh),
  };
  d22 = {
    x: d2.x + random(-ofw, ofw),
    y: d2.y + random(-ofh, ofh),
  };
  d33 = {
    x: d3.x + random(-ofw, ofw),
    y: d3.y + random(-ofh, ofh),
  };
  d44 = {
    x: d4.x + random(-ofw, ofw),
    y: d4.y + random(-ofh, ofh),
  };
  d55 = {
    x: (d11.x + d44.x) / 2 + random(-ofw, ofw),
    y: (d11.y + d44.y) / 2 + random(-ofh, ofh),
  };
  return [
    [d1, d2, d3, d4, d5],
    [d11, d22, d33, d44, d55],
  ];
}

// 随机点阵分布
function randomDistribution({ width, height, count = 500 }) {
  const ofw = width / 5;
  const ofh = height / 5;

  const minX = ofw;
  const maxX = width - ofw;
  const minY = ofh;
  const maxY = height - ofh;
  const [line1, line2] = getTwoBL(minX, maxX, minY, maxY, ofw, ofh);

  let face = [];
  let back = [];
  const [d1, d2, d3, d4, d5] = line1;
  const [d11, d22, d33, d44, d55] = line2;

  let cx, cy;
  let l1xs = line1.map((e) => e.x);
  let l1ys = line1.map((e) => e.y);
  let l2xs = line2.map((e) => e.x);
  let l2ys = line2.map((e) => e.y);
  let allxs = [...l1xs, ...l2xs];
  let allys = [...l1ys, ...l2ys];
  cx = allxs.reduce((xs, x) => xs + x) / allxs.length;
  cy = allys.reduce((ys, y) => ys + y) / allys.length;

  const _count = count / 4;
  for (let i = 0; i < _count; i++) {
    const { x, y } = getBezierCurveLoc3(
      [d1.x, d1.y, d2.x, d2.y, d3.x, d3.y, d4.x, d4.y],
      i / _count
    );
    const { x: x1, y: y1 } = getBezierCurveLoc2(
      [d4.x, d4.y, d5.x, d5.y, d1.x, d1.y],
      i / _count
    );
    const { x: x2, y: y2 } = getBezierCurveLoc3(
      [d11.x, d11.y, d22.x, d22.y, d33.x, d33.y, d44.x, d44.y],
      i / _count
    );
    const { x: x3, y: y3 } = getBezierCurveLoc2(
      [d44.x, d44.y, d55.x, d55.y, d11.x, d11.y],
      i / _count
    );

    face.push({
      x: x + random(-ofw, ofw) + ofw,
      y: y + random(-ofh, 0) + ofh,
      tp: "face",
    });
    face.push({
      x: x1 + random(-ofw, ofw) + ofw,
      y: y1 + random(-ofh, 0) + ofh,
      tp: "face",
    });

    back.push({
      x: x2 + random(-ofw, ofw) + ofw,
      y: y2 + random(0, ofh * 2) + ofh,
      tp: "back",
    });
    back.push({
      x: x3 + random(-ofw, ofw) + ofw,
      y: y3 + random(0, ofh * 2) + ofh,
      tp: "back",
    });
  }
  face.sort((a, b) => b.y - a.y);
  back.sort((a, b) => b.y - a.y);
  return { dots: [...back, ...face], cx, cy };
}

function createCloud(options) {
  const { x, y, width, height, colors = {}, id } = options;
  const _id = id || randomId(`cloud_`);
  // 随机高宽比 0.2 - 0.8
  const w_10 = width / 20; // 宽度padding
  const h_10 = height / 20; // 高度padding
  const { canvas: c, context: ctx } = this.createCanvas({
    x: x - w_10 / 2,
    y: y - h_10 / 2,
    width: width + w_10,
    height: height + h_10,
  });
  let count = Math.ceil(width * 1.5);
  count = count < 500 ? 500 : count > 1000 ? 1000 : count;
  // const cx = width / 2;
  const cy = height / 2;

  const lattice = latticeRandom({ width, height, count });
  const widthOffset = width / 20;
  const offsetY = height / 5;
  let cloudSands = [];
  let rRate = 0.5;
  let rRateV = (1 - rRate) / lattice.length;
  for (let i = 0; i < lattice.length; i++) {
    const { x, y } = lattice[i];
    // 远端云朵 按比率缩小
    let _rRate = rRate + rRateV * i;
    // 半径满足，宽度的 .1 + 随机偏移 0.05宽度值
    const r = ((width / 10 + random(-widthOffset, widthOffset)) / 2) * _rRate;
    // 压缩远端云朵；整体下移.2高度 + 高度padding
    let _y = (y - cy) * _rRate + cy + offsetY + h_10 / 2;
    let _r = r * _rRate;
    let _x = x + w_10 / 2;

    if (_y - _r < 0 || _y + _r > height || _x - _r < 0 || _x + _r > width)
      continue;

    let yrate = y / height; // 混合比例根据实际y值来计算
    yrate = yrate < 0.1 ? 0.1 : yrate > 0.9 ? 0.9 : yrate;

    // let itemYrate = _y / height;

    // fillMixColors 使用底部色值y轴位置混合顶部色值
    const fillMixColors = mixinColors(colors.end, colors.start, yrate);
    // sideMixColors 设置太阳颜色除开灰度值的色值极值
    // const sideMixColors = mixinColors(colors.end, "#ff09", 1 - yrate);
    const sideMixColors =
      colors.side == "transparent"
        ? "#fff1" //colors.side
        : mixinColors(colors.end, colors.side, yrate);
    let lg = ctx.createLinearGradient(_x, _y - r - 2, _x, _y + r + 2);
    // const _s = mixinColors(colors.start, colors.end, 1 - yrate);
    // const _e = mixinColors(colors.start, colors.end, yrate);
    // let t = 0.8 * (1 - itemYrate);
    // t = t < 0.6 ? 0.6 : t;;
    let t = 1; //0.8;
    // const lg_start = setColorAlpha(colors.start, t);
    // const lg_mix = setColorAlpha(mixinColors(colors.start, colors.end), t);
    // const lg_end = setColorAlpha(colors.end, t);
    lg.addColorStop(0, colors.start);
    // lg.addColorStop(t, lg_mix);
    lg.addColorStop(1, colors.end);
    const data = {
      x: _x,
      y: _y, // 压缩远端云朵；整体下移
      // 先绘制的圆r小 满足近大远小
      r,
      operability: false,
      double: false,
      fillType: "fill",
      //sideMixColors "transparent"
      colors: { side: sideMixColors, line: "transparent", fill: fillMixColors },
    };
    let sand = this.createCircle(data, ctx);
    cloudSands.push(sand);
  }
  const cloudItem = {
    content: c,
    x,
    y,
    ctx,
    width,
    cloudSands,
    height,
    colors,
    id: _id,
    count,
    lattice,
    widthOffset,
    offsetY,
  };
  this.Clouds.set(_id, cloudItem);
  return { canvas: c, id: _id, cloud: cloudItem };
}
function drawCloud({ x, _x, y, _y, r, colors, height, cloudYRate }, ctx) {
  let yrate = y / height; // 混合比例根据实际y值来计算
  yrate = yrate < 0.1 ? 0.1 : yrate > 0.9 ? 0.9 : yrate;
  const sf = mixinColors(colors.start, "#fff8");
  const ef = mixinColors(colors.end, "#fff8");
  const cs = mixinColors(colors.start, sf, cloudYRate);
  const ce = mixinColors(colors.end, ef, 1 - cloudYRate);
  const fillMixColors = mixinColors(ce, cs, yrate);

  const sideMixColors =
    colors.side == "transparent"
      ? "transparent" //colors.side
      : mixinColors(colors.end, colors.side, yrate);
  let lg = ctx.createLinearGradient(x, _y - r - 2, _x, _y + r + 2);
  lg.addColorStop(0, colors.start);
  lg.addColorStop(1, colors.end);
  const data = {
    x: _x,
    y: _y,
    r,
    operability: false,
    double: false,
    fillType: "fill",
    //sideMixColors "transparent"
    colors: { side: sideMixColors, line: "transparent", fill: fillMixColors },
  };
  return this.createCircle(data, ctx);
}
function createRdCloud(options) {
  const {
    x,
    y,
    width,
    height,
    colors = {},
    id,
    skyHeight,
    skyWidth,
    rotate,
  } = options;
  const _id = id || randomId(`cloud_`);

  const { canvas: c, context: ctx } = this.createCanvas({
    x,
    y,
    width: width + (width / 5) * 2,
    height: height + height / 5,
  });

  // const { face, back } = randomDistribution({
  // 	width,
  // 	height,
  // 	count: width
  // });
  const {
    dots: allDots,
    cx: cloudCX,
    cy: cloudCY,
  } = randomDistribution({
    width,
    height,
    count: Math.ceil((width + height) / 2),
  });
  let cloudSands = [];

  const cy = height / 2;
  const widthOffset = width / 20;
  let rRate = 0.5;
  let rRateV = (1 - rRate) / allDots.length;
  let cloudYRate = 1 - (cloudCY + y) / skyHeight;
  cloudYRate = cloudYRate > 1 ? 1 : cloudYRate < 0 ? 0 : cloudYRate;
  for (let i = 0; i < allDots.length; i++) {
    const { x, y, tp } = allDots[i];

    let _rRate = rRate + rRateV * i;
    const r = ((width / 10 + random(-widthOffset, widthOffset)) / 2) * _rRate;
    let _y = (y - cy) * _rRate + cy;
    // let mixStart = mixinColors(colors.start, colors.end, cloudYRate);
    // let mixEnd = mixinColors(mixStart, colors.end, 1 - _y / height);
    let _r = r * _rRate;
    let _x = x;

    const f_colors = {
      start: colors.start,
      end: colors.end,
      side: "transparent",
    };
    let fsand = this.drawCloud(
      { x, _x, y, _y, r, colors: f_colors, height, cloudYRate },
      ctx
    );
    cloudSands.push(fsand);
  }

  const cloudItem = {
    content: c,
    x,
    y,
    colors,
    height,
    cloudYRate,
    ctx,
    width,
    cloudSands,
    height,
    rotate,
    id: _id,
    widthOffset,
  };
  this.Clouds.set(_id, cloudItem);
  return { canvas: c, id: _id, cloud: cloudItem };
}
function moveCloud(id, x, y) {
  const cloud = this.Clouds.get(id);
  cloud.x = x;
  cloud.y = y;
  cloud.content.style.left = `${x}px`;
  cloud.content.style.top = `${y}px`;
}
function setCloudColors(colors) {
  if (!colors || JSON.stringify(colors) == "{}") return;

  const start = colors.start;
  const end = colors.end;
  const side = colors.side;
  this.Clouds.forEach((cloud) => {
    const { cloudSands, height, cloudYRate, ctx } = cloud;
    try {
      for (let i = 0; i < cloudSands.length; i++) {
        const graph = cloudSands[i];
        const { y } = graph;
        let yrate = y / height; // 混合比例根据实际y值来计算
        yrate = yrate < 0.1 ? 0.1 : yrate > 0.9 ? 0.9 : yrate;
        const sf = mixinColors(colors.start, "#fff8");
        const ef = mixinColors(colors.end, "#fff8");
        const cs = mixinColors(colors.start, sf, cloudYRate);
        const ce = mixinColors(colors.end, ef, 1 - cloudYRate);
        const fillMixColors = mixinColors(ce, cs, yrate);
        const sideMixColors =
          colors.side == "transparent"
            ? "transparent" //colors.side
            : mixinColors(colors.end, colors.side, yrate);
        if (fillMixColors !== graph.colors.fill)
          this.setGraphFillColor(fillMixColors, graph);
        if (sideMixColors !== graph.colors.side)
          this.setGraphSideColor(sideMixColors, graph);
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } catch (error) {
      console.log(error);
    }
    cloud.colors = {
      start,
      end,
      side,
    };
  });
  this.refreshAllCircles();
  return Promise.resolve(true);
}
function createCanvas(options, callback) {
  // 主要创建静态的canvas图层（动态，改起来太麻烦）
  const { x, y, width, height, zIndex, id, classname } = options;
  try {
    const canvas = document.createElement("canvas");
    const _id = id || randomId();
    const canvasId = `canvas_id_${_id}`;
    const contextId = `ctx_id_${_id}`;
    const ctx = canvas.getContext("2d");
    canvas.setAttribute("id", canvasId);
    this.canvasMap.set(canvasId, canvas);
    this.contextMap.set(contextId, ctx);
    canvas.style.position = "absolute";
    canvas.style.zIndex = zIndex || 0;
    canvas.style.left = `${x || 0}px`;
    canvas.style.top = `${y || 0}px`;
    canvas.width = width;
    canvas.height = height;
    if (classname) canvas.classList.add(classname);

    const context = canvas.getContext("2d");
    if (typeof callback === "function")
      callback(canvas, context, canvasId, contextId);
    return {
      canvas,
      context,
      canvasId,
      contextId,
    };
  } catch (error) {
    throw error;
  }
}
Clouds.prototype = {
  ...HandDraw.prototype,
};
Clouds.prototype.createCloud = createCloud;
Clouds.prototype.drawCloud = drawCloud;
Clouds.prototype.createRdCloud = createRdCloud;
Clouds.prototype.moveCloud = moveCloud;
Clouds.prototype.createCanvas = createCanvas;
Clouds.prototype.setCloudColors = setCloudColors;
