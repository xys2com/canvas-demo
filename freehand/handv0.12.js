// v0.12
// 将 HandDraw 类各个方法分化。并使用 prototype 修改原型对象
// TODO: 补充圆形、椭圆的相关内容

// min - max 的随机数
const random = function (min, max) {
	if ((arguments.length < 2 && ((max = min), (min = 0)), min > max)) {
		var a = max;
		(max = min), (min = a);
	}
	// 有一个为小数
	// 输出小数
	const r = +min % 1 != 0 || +max % 1 != 0;
	if (r) {
		min *= 100000000;
		max *= 100000000;
	}
	return (
		(Math.floor(Math.random() * (max - min + 1)) + min) / (r ? 100000000 : 1)
	);
};

const getRandomId = () => Math.random().toString(32).slice(-8);

const isPointInPolygon = (point, polygon, log) => {
	//下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
	//基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
	//在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

	var N = polygon.length;
	var boundOrVertex = true; // 如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
	var intersectCount = 0; // 与图形边界的交点个数
	var precision = 2e-10; // 浮点类型计算时候与0比较时候的容差
	var p1, p2; // 两个临近点
	var p = point; //测试点

	p1 = polygon[0];
	for (var i = 1; i <= N; ++i) {
		if (p.x == p1.x && p.y == p1.y) {
			return boundOrVertex;
		}

		p2 = polygon[i % N];
		if (p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)) {
			p1 = p2;
			continue;
		}

		if (p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)) {
			if (p.x <= Math.max(p1.x, p2.x)) {
				if (p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)) {
					return boundOrVertex;
				}

				if (p1.x == p2.x) {
					if (p1.x == p.x) {
						return boundOrVertex;
					} else {
						++intersectCount;
					}
				} else {
					var xinters = ((p.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
					if (Math.abs(p.x - xinters) < precision) {
						return boundOrVertex;
					}

					if (p.x < xinters) {
						++intersectCount;
					}
				}
			}
		} else {
			if (p.y == p2.y && p.x <= p2.x) {
				var p3 = polygon[(i + 1) % N];
				if (p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)) {
					++intersectCount;
				} else {
					intersectCount += 2;
				}
			}
		}
		p1 = p2;
	}

	if (intersectCount % 2 == 0) {
		//偶数在多边形外
		return false;
	} else {
		//奇数在多边形内
		return true;
	}
};

// 点距
const distance = (d1, d2) =>
	Math.sqrt((d2.x - d1.x) * (d2.x - d1.x) + (d2.y - d1.y) * (d2.y - d1.y));

// 偏移斜率
const slopeOffset = (x1, y1, x2, y2) =>
	x1 == x2 ? random(10, 100) / 1000 : (y2 - y1) / (x2 - x1);
// 标准斜率
const slope = (x1, y1, x2, y2) => (y2 - y1) / (x2 - x1);

// 根据两条线斜率计算交点
const calculateIntersection = ([
	{ x: x1, y: y1 },
	{ x: x2, y: y2 },
	{ x: x3, y: y3 },
	{ x: x4, y: y4 }
]) => {
	const s1 = slope(x1, y1, x2, y2);
	const s2 = slope(x3, y3, x4, y4);
	const d1 = y1 - s1 * x1;
	const d2 = y3 - s2 * x3;

	if (s1 === s2) {
		return [];
	}
	var x = (d2 - d1) / (s1 - s2);
	var y = s1 * x + d1;
	return [x, y];
};

// 取小数部分
const decimals = (n) => +n % 1;

const $isDOM = (item) => {
	return typeof HTMLElement === "function"
		? item instanceof HTMLElement
		: item &&
				typeof item === "object" &&
				item.nodeType === 1 &&
				typeof item.nodeName === "string";
};

const $ = (el) => {
	const els = document.querySelectorAll(el);
	return els.length === 1 ? els[0] : Array.from(els);
};

// 节流
function throttle(cb, gap) {
	let timer;
	return function () {
		let _this = this;
		let args = arguments;
		if (!timer)
			timer = setTimeout(function () {
				timer = null;
				cb.apply(_this, args);
			}, gap);
	};
}

const DOMS = {
	add: (el, p) => {
		p = p ? p : document.body;
		const doms = $isDOM(el) ? el : $(el);
		if (doms && doms.length) {
			doms.map((dom) => {
				p.appendChild(dom);
			});
		} else if (doms) {
			p.appendChild(doms);
		}
	},
	del: (el) => {
		const doms = $isDOM(el) ? el : $(el);
		if (doms && doms.length) {
			doms.map((dom) => {
				const p = dom.parentNode ? dom.parentNode : document.body;
				p.removeChild(dom);
			});
		} else if (doms) {
			const p = doms.parentNode ? doms.parentNode : document.body;
			p.removeChild(doms);
		}
	},
	insertText: (el, text) => {
		const doms = $isDOM(el) ? el : $(el);
		if (doms && doms.length) {
			doms.map((dom) => {
				dom.innerHTML = text;
			});
		} else if (doms) doms.innerHTML = text;
	}
};

class HandDraw {
	constructor(options) {
		document.body.style.height = "100vh";
		document.body.style.margin = "0";
		document.body.style.padding = "0";
		const {
			x,
			y,
			width,
			height,
			el,
			zIndex,
			id,
			classname,
			lineColor,
			fillColor
		} = options;
		const _el = el ? $(el) : document.body;
		const canvas = document.createElement("canvas");
		this.randomId = getRandomId();
		this.id = id ? id : `canvas-lv1-${this.randomId}`;
		this.ctxid = `ctx-${this.randomId}`;
		canvas.setAttribute("id", this.id);
		if (classname) canvas.classList.add(classname);
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		canvas.style.position = "absolute";
		canvas.style.zIndex = zIndex;
		canvas.style.left = `${x}px`;
		canvas.style.top = `${y}px`;
		canvas.width = width;
		canvas.height = height;
		this.defLineColor = lineColor || "#0008";
		this.defFillColor = fillColor || "#fff3";
		this.TOTALINDEX = 0;
		this.canvasList = {
			[this.id]: this.canvas
		};
		this.ctxList = {
			[this.ctxid]: this.ctx
		};
		// 用来存放纯线段
		this.lines = [];
		// 用来存放各种图形
		this.graph = {
			// irregular: {}, // 不规则闭合图形
			polygon: {}, // 多边形
			circle: {}, // 圆型
			ellipse: {} // 椭圆
		};
		this.activeGraph = {
			onmove: {}, // 处于移动中的图形
			ontransform: {} // 包含拉伸及缩放
			// onenter: [] // 鼠标进入的图形
		};
		this.graphStatus = [
			"ontransform",
			"onenter",
			"onpitch",
			"onmove",
			"onzoom"
		];
		this.activeStatus = ["onmove", "ontransform"];
		_el.appendChild(canvas);
	}
}

// 通用
const COMMON = {
	// 获得canvas
	getCanvas(id) {
		if (!id) return this.canvas;
		else {
			return this.canvasList[id];
		}
	},
	// 获得context
	getCtx(id) {
		if (!id) return this.ctx;
		else {
			return this.ctxList[id];
		}
	},
	// 获得图形
	getGraph(type, id) {
		const obj = this.graph[type];
		let g = obj[id];
		if (!g) {
			g = {};
			g.index = this.getIndex();
			g.lines = [];
			g.points = [];

			g.id = id;
			g.zoom = 1;
			g.ontransform = false; // 是否处于变形，可手动赋予
			g.onenter = false; // 鼠标进入
			g.onpitch = false; //鼠标选中
			g.onmove = false; // 选中并移动
			g.onzoom = false; // 选中并缩放

			obj[id] = g;
		}
		return obj[id];
	},
	// 获得图形路径
	getPath(type, id) {
		const obj = this.graph[type];
		return obj[id].path;
	},
	// 画一个小圆点
	dotin(dot, c = "#f00", context) {
		const ctx = context || this.getCtx();
		ctx.save();
		const { x, y } = dot;
		ctx.beginPath();
		ctx.strokeStyle = c;
		ctx.fillStyle = c;
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	},
	//
	rectin(x, y, w, h, c = "#00ff00", context) {
		const ctx = context || this.getCtx();
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + w, y);
		ctx.lineTo(x + w, y + h);
		ctx.lineTo(x, y + h);
		ctx.lineTo(x, y);
		ctx.strokeStyle = c;
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	},
	getIndex() {
		this.TOTALINDEX++;
		return this.TOTALINDEX;
	},

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	// onlyPoint 归零化 / 只用于点位
	// targetPoint 目标点位，如果onlyPoint = false，targetPoint 就视为图形 x y
	// referPoint 参照点位，如果onlyPoint = false，referPoint 就视为图形参照点
	scaleCommon(
		onlyPoint = true,
		targetPoint,
		referPoint,
		targetRate,
		width,
		height
	) {
		const { x: sx, y: sy } = referPoint;
		const { x: tx, y: ty } = targetPoint;
		if (!width || !height) onlyPoint = true;
		let _sx, _sy, _tx, _ty, top, left, right, bottom, targetx, targety;
		if (onlyPoint) {
			_sx = sx - sx;
			_sy = sy - sy;
			_tx = tx - sx;
			_ty = ty - sy;

			if (_sx > _tx) {
				(left = _tx), (right = _sx);
			} else {
				(left = _sx), (right = _tx);
			}
			if (_sy > _ty) {
				(bottom = _sy), (top = _ty);
			} else {
				(bottom = _ty), (top = _sy);
			}
			targetx = _sx * (1 - targetRate);
			targety = _sy * (1 - targetRate);
		} else {
			left = tx;
			right = tx + width;
			top = ty;
			bottom = ty + height;
			targetx = sx * (1 - targetRate);
			targety = sy * (1 - targetRate);
		}
		const leftTop = [left, top, 1, 1];
		const rightTop = [right, top, 1, 1];
		const rightBtoom = [right, bottom, 1, 1];
		const leftBtoom = [left, bottom, 1, 1];
		let original = new Float32Array([
			...leftTop,
			...rightTop,
			...rightBtoom,
			...leftBtoom
		]);
		const out = new Float32Array([
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]);
		const dot1 = [targetRate, 0, 0, 0];
		const dot2 = [0, targetRate, 0, 0];
		const dot3 = [0, 0, 1, 0];
		const dot4 = [targetx, targety, 0, 1];
		const target = new Float32Array([...dot1, ...dot2, ...dot3, ...dot4]);
		const now = glMatrix.mat4.multiply(out, target, original);

		if (onlyPoint) {
			let gx, gy;
			if (_sx > _tx) {
				gx = now[0] + sx;
			} else {
				gx = now[4] + sx;
			}
			if (_sy > _ty) {
				gy = now[1] + sy;
			} else {
				gy = now[9] + sy;
			}
			return {
				x: gx,
				y: gy
			};
		} else {
			return {
				width: now[4] - now[0],
				height: now[9] - now[1],
				left: now[0],
				right: now[4],
				top: now[1],
				bottom: now[9]
			};
		}
	},

	// 此处id是不刷新的图形的id
	refresh(id) {
		this.clear();
		this.refreshAllLine(id);
		this.refreshAllGraph(id);
	},
	createCanvas(options, callback) {
		const { x, y, width, height, zIndex, id, classname } = options;
		const canvasid = id ? id : `cvs-lv2-${getRandomId()}`;
		const contextid = id ? `ctx-${id}` : `ctx-${id}`;
		try {
			const canvas = document.createElement("canvas");

			canvas.style.position = "absolute";
			canvas.style.zIndex = zIndex;
			canvas.style.left = `${x}px`;
			canvas.style.top = `${y}px`;
			canvas.width = width;
			canvas.height = height;
			if (classname) canvas.classList.add(classname);

			const context = canvas.getContext("2d");
			if (typeof callback === "function")
				callback(canvas, context, contextid, canvasid);
			this.canvasList[canvasid] = canvas;
			this.ctxList[contextid] = context;
			return {
				canvas,
				context,
				contextid,
				canvasid
			};
		} catch (error) {
			throw error;
		}
	},
	// 鼠标进入检测
	mouseEnterChecked(x, y) {
		const canvas = this.getCanvas();
		const left = canvas.offsetLeft;
		const top = canvas.offsetTop;
		const dot = { x: x - left, y: y - top };
		let arrs = [];
		for (let gskey in this.graph) {
			const gs = this.graph[gskey];
			for (let gkey in gs) {
				const g = gs[gkey];
				let gdots = g.points;
				let isin = isPointInPolygon(dot, gdots);
				if (isin) arrs.push(g);
			}
		}
		const len = arrs.length;
		switch (len) {
			case 0:
				return null;
			case 1:
				return arrs[0];
			default:
				return arrs.sort((a, b) => b.index - a.index)[0];
		}
	}
};

// 线条相关
const LINE = {
	// 向外部返回 符合min-max 增值比率的，x（x1+dx） 在 x1 到x2 之间
	// min 最小比率 max 最大比率
	// dx x1 的增值
	// 增值比 rat = dx/(x2 - x1)
	// rat > min  && rat < max
	getDeltaX(x1, x2, min, max) {
		x1 += random(0.25, 0.75) * random(-1, 1);
		x2 += random(0.25, 0.75) * random(-1, 1);
		const dx = random(x1, x2) - x1;
		const dis = x2 - x1;
		const rat = Math.abs(dx / dis);
		if (rat < min || rat > max) {
			return this.getDeltaX(x1, x2, min, max);
		}
		return x1 + dx;
	},
	// 绘制一条二阶贝塞尔曲线
	bezierLineStage2(_x1, _y1, _x2, _y2, _x3, _y3, color) {
		// 2阶贝塞尔曲线
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.quadraticCurveTo(_x2, _y2, _x3, _y3);
		ctx.strokeStyle = color || this.defLineColor;
		ctx.stroke();
		ctx.restore();
	},
	// 绘制一条三阶贝塞尔曲线
	bezierLineStage3(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4, color) {
		// 3阶贝塞尔曲线
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.bezierCurveTo(_x2, _y2, _x3, _y3, _x4, _y4);
		ctx.strokeStyle = color || this.defLineColor;
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	},
	// 计算并绘制偏移线
	calculateLine(x1, y1, x2, y2, offset, color) {
		// 取得斜率
		const lineSlope = slopeOffset(x1, y1, x2, y2);
		// 起点和终点
		const _x1 = x1 + random(-offset, offset);
		const _y1 = y1 + random(-offset, offset);

		const _x4 = x2 + random(-offset, offset);
		const _y4 = y2 + random(-offset, offset);

		// x轴中随机点位
		const _x2 = this.getDeltaX(_x1, _x4, 0.25, 0.5); //_x1到_x4， 比率在 0.2 - 0.5 之间的随机值
		const roff2 = random(100, 250) / 1000; // 斜率 的随机偏移值
		const offsetSlope2 = lineSlope + lineSlope * roff2 * random(-1, 1); // 偏移值正负随机 为零则不偏移
		const _y2 = _y1 + offsetSlope2 * (_x2 - _x1); // 得出_y2

		const _x3 = this.getDeltaX(_x2, _x4, 0.33, 0.66); //_x2到_x4，比率在 0.33 - 0.66 之间的随机值
		const roff3 = random(100, 250) / 1000; // 斜率 随机偏移值
		const offsetSlope3 = lineSlope + lineSlope * roff3 * random(-1, 1); // 偏移值正负随机 为零则不偏移
		const _y3 = _y2 + offsetSlope3 * (_x3 - _x2); // 得出_y3

		this.bezierLineStage3(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4, color);
		return [_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4];
	},
	// 输入线条数据并绘制
	initLinePath(path, offset = 2, color, type = "line", double = true, id) {
		if (!path || path.length < 2) {
			console.warn(
				"'function initLinePath' : 请输入正确的路径 => [{x,y}, {x,y}]"
			);
			return;
		} else {
			let lines = [];
			for (let i = 0; i < path.length; i++) {
				const p1 = path[i];
				const p2 = path[i + 1];
				if (p1 && p2) {
					if (type == "line") {
						const line = this.createLine(p1, p2, offset, color, double);
						this.lines.push(line);
						lines.push(line);
					} else {
						const line = this.createLine(p1, p2, offset, color, double);
						let graph = this.getGraph(type, id);
						graph.lines.push(line);
					}
				}
				if (!p2) {
					if (type == "line" && path.length == 2) return lines[0];
					else if (type == "line" && path.length > 2) return lines;
				}
			}
		}
	},

	// create line
	createLine(p1, p2, offset, color, double = true) {
		const { x: x1, y: y1 } = p1;
		const { x: x2, y: y2 } = p2;
		let linepath = [];
		let line1 = this.calculateLine(x1, y1, x2, y2, offset, color);
		linepath.push(line1);

		if (double) {
			let line2 = this.calculateLine(x1, y1, x2, y2, offset, color);
			linepath.push(line2);
		}
		return {
			path: linepath,
			color: color,
			points: [p1, p2],
			afficvs: this.id, // 归属的画布的id
			affictx: this.ctxid, // 归属的画笔的id
			id: `line--id--${getRandomId()}`
		};
	},

	// 重绘某线条
	refreshLine(line, color, log = false) {
		let paths = line.zoomPath || line.path;
		if (log) {
			// 调试用
			console.log(line, color);
		}
		paths.map((p) => {
			this.bezierLineStage3(...p, color || line.color);
		});
	},
	// 重绘所有线条
	// id 不刷新的某个线条
	refreshAllLine(id) {
		// 重绘线段
		for (let k in this.lines) {
			const line = this.lines[k];
			if (line.id != id) this.refreshLine(line);
		}
	},
	getLinePoint(line) {
		const path = line.path;
		let points = [];
		path.map((p) => {
			const count = p.length / 2;
			let ps = [];
			for (let i = 0; i < count; i++) {
				ps.push({
					x: p[i * 2],
					y: p[i * 2 + 1]
				});
			}
			points.push(ps);
		});
		return points;
	},
	updatePath(paths, ox, oy) {
		let _paths = [];
		paths.map((p) => {
			let path = [];
			p.map((e, i) => {
				let num = e;
				if (i % 2 == 0) num += ox;
				else num += oy;
				path.push(num);
			});
			_paths.push(path);
		});
		return _paths;
	},
	// 更新线条数据 移动
	updateLineInMove(line, ox, oy) {
		const paths = this.updatePath(line.path, ox, oy);
		line.path = paths;
		const zoomPath = this.updatePath(line.zoomPath, ox, oy);
		line.path = paths;
		line.zoomPath = zoomPath;
	},
	// 更新线条数据 缩放
	// rp 参照点, 没有参照点就以线段大致中点为参照点
	updateLineInZoom(line, rate, rp) {
		const linepoints = this.getLinePoint(line);
		let paths = [];
		const [p1, p2] = line.points;
		const cx = rp ? rp.x : (p1.x + p2.x) / 2;
		const cy = rp ? rp.y : (p1.y + p2.y) / 2;
		linepoints.map((_linepoints) => {
			let _paths = [];
			_linepoints.map((pot) => {
				let { x, y } = this.scaleCommon(true, pot, { x: cx, y: cy }, rate);
				_paths.push(x, y);
			});
			paths.push(_paths);
		});
		line.zoomPath = paths;
	},
	// setLineRealPath(line, path) {
	// 	line.path = path || line.zoomPath;
	// 	line.zoomPath = null
	// }
	setLineRealZoom(line, zoom, zoomPath) {
		line.zoom = zoom || line.zoom;
		line.path = zoomPath || line.zoomPath;
		line.zoomPath = null;
	}
};

// 图形相关
const GRAPH = {
	// 绘制一个矩形
	createRect(
		position,
		fillType = "polygon",
		id,
		offset = 2,
		color = [],
		double = true
	) {
		const [x, y, w, h] = position;
		const dot1 = { x, y },
			dot2 = { x: x + w, y },
			dot3 = { x: x + w, y: y + h },
			dot4 = { x, y: y + h };
		let path = [dot1, dot2, dot3, dot4, dot1];
		id = `polygon_${id || Math.random().toString(32).slice(-8)}`;
		let graph = this.getGraph("polygon", id);
		graph.points.push(dot1, dot2, dot3, dot4);
		graph.x = x;
		graph.y = y;
		graph.width = w;
		graph.height = h;
		graph.color = color;
		graph.ctx = this.ctx;
		graph.fillType = fillType;
		this.fillPolygon(graph);
		this.initLinePath(path, offset, color[0], "polygon", double, id);
		return graph;
	},
	// fillType: polygon图形填充，就是全部填充；line描线填充
	fillPolygon(graph, color) {
		let { fillType, color: gcolor } = graph;

		const ctx = graph.ctx;
		ctx.save();
		const path = graph.zoomPoints || graph.points;
		ctx.beginPath();
		path.map((e, i) => {
			if (i == 0) ctx.moveTo(e.x, e.y);
			else ctx.lineTo(e.x, e.y);
		});
		ctx.lineTo(path[0].x, path[0].y);
		ctx.closePath();
		ctx.fillStyle = color || gcolor[1] || this.defFillColor || "#fff3";
		ctx.fill();
		ctx.restore();
	},
	// 获取多个点位的中心点
	getPointsCenter(points) {
		const allxs = points.map((e) => e.x);
		const allys = points.map((e) => e.y);
		let x = allxs.reduce((xs, x) => xs + x) / allxs.length;
		let y = allys.reduce((ys, y) => ys + y) / allys.length;
		return { x, y };
	},
	// 绘制一个多边形
	createPolygon(
		dots,
		fillType = "polygon",
		id,
		offset = 2,
		color = [],
		double = true
	) {
		let path = [...dots, dots[0]];
		id = `polygon_${id || Math.random().toString(32).slice(-8)}`;
		let graph = this.getGraph("polygon", id);
		graph.points.push(...dots);
		const allxs = dots.map((e) => e.x);
		const allys = dots.map((e) => e.y);
		const { x, y } = this.getPointsCenter(dots);
		let w = Math.abs(Math.max(...allxs) - Math.min(...allxs));
		let h = Math.abs(Math.max(...allys) - Math.min(...allys));
		graph.x = x;
		graph.y = y;
		graph.width = w;
		graph.height = h;
		graph.color = color;
		graph.ctx = this.ctx;

		this.fillPolygon(graph);
		this.initLinePath(path, offset, color[0], "polygon", double, id);
		return graph;
	},
	// 更新图形数据 targetPoint
	updateGraphZoom(graph, rate, rp) {
		const center = this.getPointsCenter(graph.points);
		const cx = rp ? rp.x : center.x;
		const cy = rp ? rp.y : center.y;
		let _rp = {
			x: cx,
			y: cy
		};
		const zoomPoints = this.getZoomPoints(graph, rate);
		graph.zoomPoints = zoomPoints;
		this.fillPolygon(graph);
		graph.lines.map((line) => {
			this.updateLineInZoom(line, rate, _rp);
		});
	},
	getZoomPoints(graph, rate) {
		const center = this.getPointsCenter(graph.points);
		let zoomPoints = [];
		graph.points.map((pot) => {
			let _pot = this.scaleCommon(
				true,
				pot,
				{ x: center.x, y: center.y },
				rate
			);
			zoomPoints.push(_pot);
		});
		return zoomPoints;
	},
	// 更新图形数据 移动
	updateGraphMove(graph, ox, oy) {
		// 更新位置
		graph.x += ox;
		graph.y += oy;
		// 更新线条
		graph.lines.map((line) => {
			this.updateLineInMove(line, ox, oy);
		});
		// 更新点位
		graph.points.map((pot) => {
			pot.x += ox;
			pot.y += oy;
		});
		// 更新缩放点位
		if (graph.zoomPoints) {
			graph.zoomPoints.map((pot) => {
				pot.x += ox;
				pot.y += oy;
			});
		}
	},
	// 重绘图形
	refreshGraph(graph, color = [], log = false) {
		if (log) {
			console.log(graph, color);
		}
		this.fillPolygon(graph, color[1] || this.defFillColor);
		graph.lines.map((line) => {
			this.refreshLine(line, color[0] || this.defLineColor, log);
		});
	},
	// 重绘所有图形
	// id 不刷新某个图形的id
	refreshAllGraph(id) {
		for (let type in this.graph) {
			const gs = this.graph[type];
			for (let gkey in gs) {
				const g = gs[gkey];
				const ontransform =
					g.ontransform || g.onmove || g.onzoom || g.onpitch || g.onenter;
				if (!ontransform && id != g.id) this.refreshGraph(g);
			}
		}
	},
	// 不重置某个状态
	initGraphStatus(graph, unhands = []) {
		const keys = this.graphStatus.filter((key) => !unhands.includes(key));
		keys.map((key) => {
			graph[key] = false;
			if (this.activeStatus.includes(key) && this.activeGraph[key][graph.id])
				this.removeActiveGraph(key, graph.id);
		});
	},
	// 重置所有活动中图形
	initAllGraphStatus() {
		for (let k in this.activeGraph) {
			let item = this.activeGraph[k];
			item.map((e) => {
				this.initGraphStatus(e);
			});
		}
	},
	// 添加活动图形
	addActiveGraph(type, graph) {
		if (this.activeGraph[type][graph.id]) return;
		this.activeGraph[type][graph.id] = graph;
	},
	// 移除活动图形
	removeActiveGraph(type, id) {
		if (!this.activeGraph[type][id]) return;
		delete this.activeGraph[type][id];
	},
	// 移动图形
	move(graph, movementX, movementY) {
		if (!graph.onpitch) return;
		// 将图形添加至活动对象的移动中
		this.addActiveGraph("onmove", graph);
		// 更新图形移动后点位、方位、线条数据
		this.updateGraphMove(graph, movementX, movementY);
	}
};

const FUNCTIONS = {
	...COMMON,
	...LINE,
	...GRAPH
};

for (let key in FUNCTIONS) {
	HandDraw.prototype[key] = FUNCTIONS[key];
}
