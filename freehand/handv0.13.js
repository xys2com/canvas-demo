/* v0.13 */
/**
 * 将画布的操作事件内敛到类内部
 */
//
function delayLog(id) {
	if (!window.TIMESTAMP) {
		window.TIMESTAMP = {};
		window.TIMESTAMP[id] = Date.now();
	}
	const ms = Date.now() - window.TIMESTAMP[id];
	if (ms < 1000) return;
	console.log(...arguments);
	window.TIMESTAMP[id] = Date.now();
}
// min - max 的随机数
const random = function (min, max) {
	if ((arguments.length < 2 && ((max = min), (min = 0)), min > max)) {
		let a = max;
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
const randomId = (prefix = "", suffix = "") =>
	`${prefix}${Math.random().toString(32).slice(-8)}${suffix}`;

const isPointInPolygon = (point, polygon, log) => {
	//下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
	//基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
	//在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。
	if (!polygon || !point) return false;
	let N = polygon.length;
	let boundOrVertex = true; // 如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
	let intersectCount = 0; // 与图形边界的交点个数
	let precision = 2e-10; // 浮点类型计算时候与0比较时候的容差
	let p1, p2; // 两个临近点
	let p = point; //测试点

	p1 = polygon[0];
	for (let i = 1; i <= N; ++i) {
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
					let xinters = ((p.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
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
				let p3 = polygon[(i + 1) % N];
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
function multiply(out, a, b) {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3];
	let a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];
	let a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];
	let a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];

	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
}

// 点距
const distance = (d1, d2) =>
	Math.sqrt((d2.x - d1.x) * (d2.x - d1.x) + (d2.y - d1.y) * (d2.y - d1.y));

// 偏移斜率
const slopeOffset = (x1, y1, x2, y2) =>
	x1 == x2 ? random(5, 50) / 1000 : (y2 - y1) / (x2 - x1);

// 标准斜率
const slope = (x1, y1, x2, y2) => (y2 - y1) / (x2 - x1);

function calculateIntersection(a, b, c, d) {
	// 三角形abc 面积的2倍
	let area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

	// 三角形abd 面积的2倍
	let area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

	// 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
	if (area_abc * area_abd >= 0) {
		return false;
	}

	// 三角形cda 面积的2倍
	let area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	// 三角形cdb 面积的2倍
	// 不需要再用公式计算面积,而是通过已知的三个面积加减得出.
	let area_cdb = area_cda + area_abc - area_abd;
	if (area_cda * area_cdb >= 0) {
		return false;
	}

	//计算交点坐标
	let t = area_cda / (area_abd - area_abc);
	let dx = t * (b.x - a.x),
		dy = t * (b.y - a.y);
	return { x: a.x + dx, y: a.y + dy };
}

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
const throttle = (cb, gap) => {
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
};

function fnProxy(fn) {
	return function () {
		let _this = this;
		let args = arguments;
		fn.apply(_this, args);
	};
}
const deepClone = (obj) => {
	var objClone = Array.isArray(obj) ? [] : {};
	if (obj && typeof obj === "object") {
		for (let key in obj) {
			if (Object.hasOwnProperty.call(obj, key)) {
				if (obj[key] && typeof obj[key] === "object") {
					objClone[key] = deepClone(obj[key]);
				} else {
					objClone[key] = obj[key];
				}
			}
		}
	}
	return objClone;
};

class HandDraw {
	constructor(options) {
		const {
			x,
			y,
			width,
			height,
			el,
			zIndex,
			id,
			classname,
			colors = {},
			pitchColors = {}
		} = options;
		const canvas = document.createElement("canvas");

		const _id = id || randomId();
		const canvasId = `canvas_id_${_id}`;
		const contextId = `ctx_id_${_id}`;
		const ctx = canvas.getContext("2d");

		canvas.setAttribute("id", canvasId);

		canvas.style.position = "absolute";
		canvas.style.zIndex = zIndex;
		canvas.style.left = `${x}px`;
		canvas.style.top = `${y}px`;
		canvas.width = width;
		canvas.height = height;
		if (classname) canvas.classList.add(classname);

		this.canvas = canvas;
		this.ctx = ctx;
		this.canvasMap = new Map();
		this.contextMap = new Map();
		this.canvasMap.set(canvasId, canvas);
		this.contextMap.set(contextId, ctx);

		this.colors = {
			side: colors.side || "#fff",
			fill: colors.fill || "#fff3",
			line: colors.line || "#fff"
		};

		this.pitchColors = {
			side: pitchColors.side || "#f00",
			fill: pitchColors.fill || "#f003",
			line: pitchColors.line || "#f008"
		};

		this.TOTALINDEX = 0;
		this.TIMESTAMP = Date.now();

		this.createFnMap = {
			line: "initLinePath",
			rect: "createRect",
			polygon: "createPolygon",
			circle: "createCircle"
		};

		// 用来存放纯线段
		this.lines = [];
		this.onRefreshTime = 0;
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

		const _el = el ? $(el) : document.body;
		this.container = _el;
		_el.appendChild(canvas);
		// 操作属性
		this.handle = {
			// 缓存鼠标按下选中图形
			mousePitchGraph: null,
			// 缓存鼠标进入图形
			mouseEnterGraph: null,
			// 上一次记录的x位置
			moveStartx: 0,
			// 上一次记录的y位置
			moveStarty: 0
		};
		this.throttleCheckMouseInGraph = null;
		this.mousePitchGraphDragFn = null;
		this.handleInit();
	}
}

const HANDLE = {
	// 检测是否存在鼠标进入的图形
	checkMouseInGraph(e) {
		const { clientX, clientY } = e;
		let _mEG = this.mouseEnterChecked(clientX, clientY);
		if (
			this.handle.mouseEnterGraph &&
			_mEG &&
			_mEG.id == this.handle.mouseEnterGraph.id
		)
			return;
		if (_mEG) {
			// 如果之前不存在 缓存图形
			if (!this.handle.mouseEnterGraph) this.handle.mouseEnterGraph = _mEG;
			// 如果之前的缓存图形id与当前id不符合
			// 重置之前图形，并更新缓存图形
			if (
				this.handle.mouseEnterGraph &&
				_mEG.id != this.handle.mouseEnterGraph.id
			) {
				this.updateGraphZoom(this.handle.mouseEnterGraph, 1);
				this.initGraphStatus(this.handle.mouseEnterGraph);
				this.handle.mouseEnterGraph = _mEG;
			}
			if (this.handle.mouseEnterGraph.draggable) {
				this.updateGraphZoom(this.handle.mouseEnterGraph, 1.1);
				this.handle.mouseEnterGraph.context.canvas.style.cursor = "move";
			} else if (this.handle.mouseEnterGraph.clickable) {
				this.handle.mouseEnterGraph.context.canvas.style.cursor = "pointer";
			}

			this.refresh();
		} else if (this.handle.mouseEnterGraph) {
			// 离开某个图形，刷新canvas
			this.updateGraphZoom(this.handle.mouseEnterGraph, 1);
			this.initGraphStatus(this.handle.mouseEnterGraph);
			this.handle.mouseEnterGraph.context.canvas.style.cursor = "default";
			this.handle.mouseEnterGraph = null;
			this.refresh();
		}
	},
	// 图形拖动
	mousePitchGraphDrag(e) {
		// const { clientX, clientY, movementX, movementY } = e;
		// 草！movementX, movementY 不准确
		const { clientX, clientY } = e;
		// 手动计算移动的坐标
		const moveX = clientX - this.handle.moveStartx;
		const moveY = clientY - this.handle.moveStarty;

		let isInGraph = true;
		if (this.handle.mousePitchGraph.type == "polygon") {
			const { zoom, zoomPoints, points } = this.handle.mousePitchGraph;
			const checkedPoints = zoom == 1 ? points : zoomPoints || points;
			isInGraph = isPointInPolygon({ x: clientX, y: clientY }, checkedPoints);
		} else if (this.handle.mousePitchGraph.type == "circle") {
			const dis = distance(
				{ x: this.handle.mousePitchGraph.x, y: this.handle.mousePitchGraph.y },
				{ x: clientX, y: clientY }
			);
			isInGraph = dis <= this.handle.mousePitchGraph.r;
		}

		if (!isInGraph) {
			// 移动时鼠标超出图形区域
			this.moveCheck();
			this.initGraphStatus(this.handle.mousePitchGraph);
			this.handle.moveStartx = clientX;
			this.handle.moveStarty = clientY;
			this.refresh();
			this.handle.mousePitchGraph = null;
		} else {
			this.graphMove(this.handle.mousePitchGraph, moveX, moveY);
			this.handle.moveStartx = clientX;
			this.handle.moveStarty = clientY;
			this.refresh();
		}
	},
	// 切换鼠标移动事件
	moveCheck(type = 1) {
		if (type == 1) {
			this.container.removeEventListener(
				"mousemove",
				this.mousePitchGraphDragFn
			);
			this.container.addEventListener(
				"mousemove",
				this.throttleCheckMouseInGraph
			);
		} else {
			this.container.removeEventListener(
				"mousemove",
				this.throttleCheckMouseInGraph
			);
			this.container.addEventListener("mousemove", this.mousePitchGraphDragFn);
		}
	},
	// 操作初始化
	handleInit() {
		this.throttleCheckMouseInGraph = throttle((e) => {
			this.checkMouseInGraph(e);
		}, 50);

		this.mousePitchGraphDragFn = fnProxy((e) => {
			this.mousePitchGraphDrag(e);
		});

		this.moveCheck();
		// 点击时将选中的图形onpitch 设置为true
		this.container.addEventListener("mousedown", (e) => {
			const { clientX, clientY } = e;
			// 查询鼠标进入的图形
			let _mEG = this.mouseEnterChecked(clientX, clientY);
			if (_mEG && _mEG.draggable) {
				this.handle.moveStartx = clientX;
				this.handle.moveStarty = clientY;
				this.handle.mousePitchGraph = _mEG;
				this.handle.mousePitchGraph.onpitch = true;
				this.refresh();
				this.moveCheck(2);
			}
			if (_mEG && _mEG.clickable) {
				this.handle.moveStartx = clientX;
				this.handle.moveStarty = clientY;
				this.handle.mousePitchGraph = _mEG;
			}
		});

		this.container.addEventListener("mouseup", (e) => {
			if (!this.handle.mousePitchGraph) return;
			const { clientX, clientY } = e;
			let isInGraph = true;
			if (this.handle.mousePitchGraph.type == "polygon") {
				const { zoom, zoomPoints, points } = this.handle.mousePitchGraph;
				const checkedPoints = zoom == 1 ? points : zoomPoints || points;
				isInGraph = isPointInPolygon({ x: clientX, y: clientY }, checkedPoints);
			} else if (this.handle.mousePitchGraph.type == "circle") {
				const dis = distance(
					{
						x: this.handle.mousePitchGraph.x,
						y: this.handle.mousePitchGraph.y
					},
					{ x: clientX, y: clientY }
				);
				isInGraph = dis <= this.handle.mousePitchGraph.r;
			}
			let onActive = this.isOnActive(this.handle.mousePitchGraph.id);
			if (isInGraph && this.handle.mousePitchGraph.clickable && !onActive)
				this.handle.mousePitchGraph.onclick();
			if (
				this.handle.mousePitchGraph &&
				this.handle.mousePitchGraph.onpitch &&
				isInGraph
			) {
				this.initGraphStatus(this.handle.mousePitchGraph);
				this.handle.moveStartx = clientX;
				this.handle.moveStarty = clientY;
				this.refresh();
				this.moveCheck();
			}
		});
	}
};
// 通用
const COMMON = {
	// 获得canvas
	getContainer() {
		return this.container;
	},
	// 获得canvas
	getCanvas(id) {
		return id ? this.canvasMap.get(id) : this.canvas;
	},
	// 获得context
	getCtx(id) {
		return id ? this.contextMap.get(id) : this.ctx;
	},
	// 获得图形
	getGraph(type, id, obiter = "") {
		const obj = this.graph[type];
		let g = obj[id];
		if (obiter) console.warn(type, id, obiter);
		if (!g) {
			g = {};
			g.index = this.getIndex();
			g.id = id;
			g.zoom = 1;
			g.ontransform = false; // 是否处于变形，可手动赋予
			g.onenter = false; // 鼠标进入
			g.onpitch = false; //鼠标选中
			g.onmove = false; // 选中并移动
			g.onzoom = false; // 选中并缩放
			g.lines = [];
			if (type == "polygon") {
				g.points = [];
			}
			// if (type == "circle") {
			// 	g.crosslines = [];
			// }

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
	getCreatedFun(category) {
		const fnName = this.createFnMap[category];
		return this[fnName].bind(this);
	},
	batchCreate(data) {
		let _objects = [];
		for (let i = 0; i < data.length; i++) {
			let item = deepClone(data[i]);
			const category = item.category;
			const createFn = this.getCreatedFun(category);
			delete item.category;
			let obj = createFn(item);
			_objects.push(obj);
		}
		return _objects;
	},
	clear(context) {
		if (context)
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		else {
			this.contextMap.forEach((ctx) => {
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			});
		}
	},
	// onlyPoint 归零化 / 只用于点位
	// targetPoint 目标点位，如果onlyPoint = false，targetPoint 就视为图形 x y
	// referPoint 参照点位，如果onlyPoint = false，referPoint 就视为图形参照点
	scaleCommon(options) {
		let { targetPoint, referPoint, targetRate = 1 } = options;
		const { x: sx, y: sy } = referPoint;
		const { x: tx, y: ty } = targetPoint;
		let _sx, _sy, _tx, _ty, top, left, right, bottom, targetx, targety;
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
		const now = multiply(out, target, original);

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
	},

	// 根据目标点位，获取某个点位旋转后的坐标
	centerGetDegDot(options) {
		let { targetPoint, referPoint, deg = 0 } = options;
		const cy = referPoint.y;
		const cx = referPoint.x;
		const cir = {
			x: referPoint.x,
			y: referPoint.y,
			r: distance({ x: targetPoint.x, y: targetPoint.y }, referPoint)
		};
		let sdeg =
			Math.atan2(cy - targetPoint.y, cx - targetPoint.x) * (180 / Math.PI);

		sdeg = (sdeg < 0 ? 360 + sdeg : sdeg) + 180 + deg;
		const rotateDot = this.getPointOnCircle(sdeg, cir);
		return rotateDot;
	},

	// 此处id是不刷新的图形的id
	// 同一帧 只允许刷新一次 多个方法调用的时候
	async refresh(id, context) {
		const now = Date.now();
		const ms = now - this.onRefreshTime;
		if (ms < 16) return;
		const ctx = context || this.ctx;
		this.onRefreshTime = now;
		this.clear(ctx);
		this.refreshAllLine(id);
		this.refreshAllGraph(id);
		this.refreshAllCircles(id);
	},
	createCanvas(options, callback) {
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
				contextId
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
		// for (let gskey in this.graph) {
		const polygons = this.graph["polygon"];
		for (let key in polygons) {
			const g = polygons[key];
			if (!g.operability || g.staticstate) continue;
			let gdots = g.points;
			let isin = isPointInPolygon(dot, gdots);
			if (isin) arrs.push(g);
		}
		// }
		const circles = this.graph["circle"];

		for (let key in circles) {
			let cir = circles[key];
			if (!cir.operability || cir.staticstate) continue;
			const dis = distance({ x: cir.x, y: cir.y }, { x, y });
			if (dis <= cir.r) {
				arrs.push(cir);
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
	},
	// 设置整体线条颜色
	// 设置所有线条颜色（不包含图形中的线条）；
	setLinesColor(color) {
		this.colors.line = color;
		for (let k in this.lines) {
			let l = this.lines[k];
			l.color = color;
		}
	},
	// 设置单条线条颜色
	setLineColor(color, line) {
		line.color = color;
	},
	// 设置某个图形所有线条颜色
	setGraphLinesColor(color, graph) {
		if (!graph.colors) graph.colors = {};
		graph.colors.line = color;
		for (let k in graph.lines) {
			let l = graph.lines[k];
			if (l.lineType == "fill") l.color = color;
		}
	},
	// 设置整体边线颜色
	setSideColor(color) {
		this.colors.side = color;
	},
	// 设置某个图形边线颜色
	setGraphSideColor(color, graph) {
		if (!graph.colors) graph.colors = {};
		graph.colors.side = color;
		for (let k in graph.lines) {
			let l = graph.lines[k];
			if (l.lineType == "side") l.color = color;
		}
	},
	// 设置整体填充色
	setFillColor(color) {
		this.colors.fill = color;
	},
	// 设置某个图形填充色
	setGraphFillColor(color, graph) {
		if (!graph.colors) graph.colors = {};
		graph.colors.fill = color;
	},

	// 计算距离 点与直线一般式距离
	// xy 点位置，直线：Ax + By + C = 0
	distanceToLine(x, y, A, B, C) {
		let numerator = Math.abs(A * x + B * y + C);
		let denominator = Math.sqrt(A * A + B * B);
		let distance = numerator / denominator;
		return distance;
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
	bezierLineStage2(path, color, context) {
		const [_x1, _y1, _x2, _y2, _x3, _y3] = path;
		// 2阶贝塞尔曲线
		const ctx = context || this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.quadraticCurveTo(_x2, _y2, _x3, _y3);
		ctx.strokeStyle = color || this.colors.side;
		ctx.stroke();
		ctx.restore();
	},
	// 绘制一条三阶贝塞尔曲线
	bezierLineStage3(path, color, context) {
		const [_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4] = path;
		// 3阶贝塞尔曲线
		const ctx = context || this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.bezierCurveTo(_x2, _y2, _x3, _y3, _x4, _y4);
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	},
	// 计算并绘制偏移线
	calculateLine(x1, y1, x2, y2, offset, color, context) {
		// 取得斜率
		const lineSlope = slopeOffset(x1, y1, x2, y2);
		// 起点和终点
		const _x1 = x1 + random(-offset, offset);
		const _y1 = y1 + random(-offset, offset);

		const _x4 = x2 + random(-offset, offset);
		const _y4 = y2 + random(-offset, offset);

		const slopeOffsetVal = offset / 4;
		const slopeOffsetVal2 = offset / 3;

		// x轴中随机点位
		const _x2 = this.getDeltaX(_x1, _x4, slopeOffsetVal / 2, slopeOffsetVal); //_x1到_x4， 比率在 .125 - .25 之间的随机值
		const roff2 = random(100, 250) / 1000; // 斜率 的随机偏移值
		const offsetSlope2 = lineSlope + lineSlope * roff2 * random(-1, 1); // 偏移值正负随机 为零则不偏移
		const _y2 = _y1 + offsetSlope2 * (_x2 - _x1); // 得出_y2

		const _x3 = this.getDeltaX(_x2, _x4, slopeOffsetVal2 / 2, slopeOffsetVal2); //_x2到_x4，比率在 0.1666 - 0.333 之间的随机值
		const roff3 = random(100, 250) / 1000; // 斜率 随机偏移值
		const offsetSlope3 = lineSlope + lineSlope * roff3 * random(-1, 1); // 偏移值正负随机 为零则不偏移
		const _y3 = _y2 + offsetSlope3 * (_x3 - _x2); // 得出_y3

		this.bezierLineStage3(
			[_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4],
			color,
			context
		);
		return [_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4];
	},
	// 输入线条数据并绘制
	initLinePath(options, context) {
		if (!options) console.error(`function initLinePath: 入参错误`);
		let {
			path,
			offset = 2,
			color,
			type = "line",
			double = true,
			id,
			lineType = "side",
			staticstate = false
		} = options;
		if (!path || path.length < 2) {
			console.warn(
				`{function initLinePath} => ${JSON.stringify(
					path
				)}' : 请输入正确的路径 => [{x,y}, {x,y}]`
			);
			return;
		} else {
			let lines = [];
			offset = offset == 0 ? 1 : offset;
			for (let i = 0; i < path.length; i++) {
				const p1 = path[i];
				const p2 = path[i + 1];
				if (p1 && p2) {
					if (type == "line") {
						const line = this.createLine({
							p1,
							p2,
							offset,
							color:
								color ||
								(lineType == "side" ? this.colors.side : this.colors.line),
							double: options.hasOwnProperty("double") ? double : true,
							staticstate: options.hasOwnProperty("staticstate")
								? staticstate
								: false,
							context
						});
						// const key = line.id;
						// this.lines[key] = line;
						// lines[key] = line;
						this.lines.push(line);
						lines.push(line);
					} else {
						const line = this.createLine({
							p1,
							p2,
							offset,
							color:
								color ||
								(lineType == "side" ? this.colors.side : this.colors.line),
							double: options.hasOwnProperty("double") ? double : true,
							lineType,
							context
						});
						let graph = this.getGraph(type, id);
						if (!graph.lines) graph.lines = [];
						graph.lines.push(line);
					}
				}
				if (!p2 && type == "line") return lines;
			}
		}
	},

	// create line
	createLine(options) {
		const { p1, p2, offset, color, double = true, lineType, context } = options;
		const { x: x1, y: y1 } = p1;
		const { x: x2, y: y2 } = p2;
		let linepath = [];
		let line1 = this.calculateLine(x1, y1, x2, y2, offset, color, context);
		linepath.push(line1);

		if (double) {
			let line2 = this.calculateLine(x1, y1, x2, y2, offset, color, context);
			linepath.push(line2);
		}
		// lineType: ['side', 'fill']
		return {
			path: linepath,
			color: color,
			points: [p1, p2],
			lineType,
			id: `line_${randomId()}`
		};
	},

	// 重绘某线条
	refreshLine(line, color, context, log = false) {
		const { zoom, zoomPath, path } = line;
		const paths = zoom !== 1 && zoomPath && zoomPath.length ? zoomPath : path;

		if (log) {
			// 调试用
			console.warn(line, color);
		}
		paths.map((p) => {
			this.bezierLineStage3(p, color || line.color, line.context || context);
		});
	},
	// 重绘所有线条
	// id 不刷新的某个线条
	refreshAllLine(id) {
		// 重绘线段
		for (let k in this.lines) {
			const line = this.lines[k];
			if (line.id != id && !line.staticstate) this.refreshLine(line);
		}
	},
	getLinePoint(line) {
		const path = line.path;
		let points = [];
		let zoomPoints = [];
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

		if (line.zoomPath && line.zoomPath.length) {
			const zoomPath = line.zoomPath;
			zoomPath.map((p) => {
				const count = p.length / 2;
				let ps = [];
				for (let i = 0; i < count; i++) {
					ps.push({
						x: p[i * 2],
						y: p[i * 2 + 1]
					});
				}
				zoomPoints.push(ps);
			});
		}
		return [points, zoomPoints];
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
		if (line.zoomPath && line.zoomPath.length) {
			const zoomPath = this.updatePath(line.zoomPath, ox, oy);
			line.zoomPath = deepClone(zoomPath);
		}
	},
	// 更新线条数据 缩放
	// rp 参照点, 没有参照点就以线段中点为参照点
	updateLineInZoom(line, rate, rp) {
		const [linepoints] = this.getLinePoint(line);
		let paths = [];
		const [p1, p2] = line.points;
		const cx = rp ? rp.x : (p1.x + p2.x) / 2;
		const cy = rp ? rp.y : (p1.y + p2.y) / 2;
		linepoints.map((_linepoints) => {
			let _paths = [];
			_linepoints.map((pot) => {
				let { x, y } = this.scaleCommon({
					targetPoint: pot,
					referPoint: { x: cx, y: cy },
					targetRate: rate
				});
				_paths.push(x, y);
			});
			paths.push(_paths);
		});
		line.zoomPath = deepClone(paths);
	},
	// 更新线条数据 旋转
	// rp 参照点, 没有参照点就以线段中点为参照点
	updateLineInRotate(line, deg, rp) {
		deg = deg % 360;
		const [linepoints, zoomLinepoints] = this.getLinePoint(line);
		let paths = [];
		let zoomPath = [];
		const [p1, p2] = line.points;
		const cx = rp ? rp.x : (p1.x + p2.x) / 2;
		const cy = rp ? rp.y : (p1.y + p2.y) / 2;
		linepoints.map((_linepoints, i) => {
			let _paths = [];
			let _zoomPaths = [];
			_linepoints.map((pot, j) => {
				let { x, y } = this.centerGetDegDot({
					targetPoint: pot,
					referPoint: { x: cx, y: cy },
					deg: deg - line.rotateDeg || 0
				});
				_paths.push(x, y);
				if (zoomLinepoints && zoomLinepoints.length) {
					const _zoompot = zoomLinepoints[i][j];
					let { x: _x, y: _y } = this.centerGetDegDot({
						targetPoint: _zoompot,
						referPoint: { x: cx, y: cy },
						deg: deg - line.rotateDeg || 0
					});
					_zoomPaths.push(_x, _y);
				}
			});
			if (_paths.length) paths.push(_paths);
			if (_zoomPaths.length) zoomPath.push(_zoomPaths);
		});
		line.path = paths;
		line.zoomPath = deepClone(zoomPath);
		line.rotateDeg = deg;
	},
	setLineRealZoom(line, zoom, zoomPath) {
		line.zoom = zoom || line.zoom;
		line.path = zoomPath || line.zoomPath;
		line.zoomPath = null;
	}
};

// 图形-多边形相关
const GRAPH = {
	// 绘制一个多边形
	createPolygon(options, context) {
		let {
			dots,
			fillType = "fill",
			id,
			offset = 2,
			operability = true,
			staticstate = false,
			colors = {},
			draggable = false,
			clickable = false,
			onclick,
			pitchColors = {},
			double = true,
			fillDeg = 0,
			fillGap = 10
		} = options;
		let path = [...dots, dots[0]];
		const _id = id || `polygon_${Math.random().toString(32).slice(-8)}`;
		let graph = this.getGraph("polygon", _id);
		graph.points.push(...dots);
		const allxs = dots.map((e) => e.x);
		const allys = dots.map((e) => e.y);
		const { x, y } = this.getPointsCenter(dots);
		let w = Math.abs(Math.max(...allxs) - Math.min(...allxs));
		let h = Math.abs(Math.max(...allys) - Math.min(...allys));
		graph.type = "polygon";
		graph.operability = options.hasOwnProperty("operability")
			? operability
			: true;
		graph.staticstate = options.hasOwnProperty("staticstate")
			? staticstate
			: false;
		graph.draggable = options.hasOwnProperty("draggable") ? draggable : false;
		graph.clickable = options.hasOwnProperty("clickable") ? clickable : false;
		if (graph.clickable && onclick) graph.onclick = onclick;

		graph.x = x;
		graph.y = y;
		graph.offset = offset;
		graph.fillType = fillType;
		graph.fillDeg = ["line", "mix"].includes(fillType) ? fillDeg : 0;
		fillGap = fillGap <= 0 ? 1 : fillGap;
		graph.fillGap = ["line", "mix"].includes(fillType) ? fillGap : 0;
		graph.crossInit = false;
		graph.width = w;
		graph.height = h;
		graph.double = options.hasOwnProperty("double") ? double : true;
		graph.colors = {
			...this.colors,
			...colors
		};
		graph.pitchColors = {
			...this.pitchColors,
			...pitchColors
		};
		graph.context = context || this.ctx;

		this.fillPolygon(graph);
		this.initLinePath({
			path,
			offset,
			color: graph.colors.side,
			type: "polygon",
			double: graph.double,
			id: _id
		});
		return graph;
	},
	// 绘制一个矩形
	createRect(options, context) {
		const { position } = options;
		let _options = options;
		const [x, y, w, h] = position;
		const dot1 = { x, y },
			dot2 = { x: x + w, y },
			dot3 = { x: x + w, y: y + h },
			dot4 = { x, y: y + h };
		_options.dots = [dot1, dot2, dot3, dot4];
		delete _options.position;
		return this.createPolygon(_options, context);
	},
	// fillType: fill 图形填充，就是全部填充；line描线填充
	fillPolygon(graph) {
		let { fillType } = graph;
		if (fillType == "fill" || fillType == "mix") {
			const fillColor = graph.onpitch
				? graph.pitchColors.fill
				: graph.colors.fill;
			const ctx = graph.context;
			ctx.save();
			ctx.beginPath();
			if (graph.type === "polygon") {
				const { zoom, zoomPoints, points } = graph;
				const path = zoom == 1 ? points : zoomPoints || points;
				path.map((e, i) => {
					if (i == 0)
						ctx.moveTo(
							e.x + random(-graph.offset, -graph.offset),
							e.y + random(-graph.offset, -graph.offset)
						);
					else
						ctx.lineTo(
							e.x + random(-graph.offset, -graph.offset),
							e.y + random(-graph.offset, -graph.offset)
						);
				});
				ctx.lineTo(path[0].x, path[0].y);
			} else if (graph.type == "circle") {
				// const r = graph.r * graph.zoom;
				// ctx.arc(graph.x, graph.y, r, 0, Math.PI * 2);

				const { zoom, zoomPoints, points: _points } = graph;
				const points = zoom == 1 ? _points : zoomPoints || _points;
				const len = points.length;
				let _pts1 = deepClone(points);
				let d1, d2, d3, d4, d5, d6, d7, d8;
				if (len === 16) {
					let _pts2 = _pts1.splice(len / 2, len / 2);
					d1 = _pts1[0];
					d2 = _pts2[1];
					d3 = _pts1[2];
					d4 = _pts2[3];
					d5 = _pts1[4];
					d6 = _pts2[5];
					d7 = _pts1[6];
					d8 = _pts2[7];
				} else {
					d1 = _pts1[0];
					d2 = _pts1[1];
					d3 = _pts1[2];
					d4 = _pts1[3];
					d5 = _pts1[4];
					d6 = _pts1[5];
					d7 = _pts1[6];
					d8 = _pts1[7];
				}

				ctx.moveTo(d1.x, d1.y);
				ctx.quadraticCurveTo(d2.x, d2.y, d3.x, d3.y);
				ctx.quadraticCurveTo(d4.x, d4.y, d5.x, d5.y);
				ctx.quadraticCurveTo(d6.x, d6.y, d7.x, d7.y);
				ctx.quadraticCurveTo(d8.x, d8.y, d1.x, d1.y);
			}
			ctx.closePath();
			ctx.fillStyle = fillColor;
			ctx.fill();
			ctx.restore();
		}
		if (fillType == "line" || fillType == "mix") {
			const lineColor = graph.onpitch
				? graph.pitchColors.line
				: graph.colors.line;

			if (!graph.crossInit) this.initCrossLine(graph, lineColor);
			else if (graph.type == "circle") {
				// polygon类型的的图形会遍历 lines 属性所以不额外再遍历一次
				// 而 circle 类型的图形只有在fillTyp 等于line或者mix的时候才会遍历 lines
				graph.lines.map((line) => {
					this.refreshLine(line, lineColor, graph.context);
				});
			}
		}
	},
	// 获取多个点位的中心点
	getPointsCenter(points) {
		const allxs = points.map((e) => e.x);
		const allys = points.map((e) => e.y);
		let x = allxs.reduce((xs, x) => xs + x) / allxs.length;
		let y = allys.reduce((ys, y) => ys + y) / allys.length;
		return { x, y };
	},
	// 获得扫描线与多边形 & 圆形的交点
	getGraphCrossDots(graph) {
		let sides = [];
		let points = graph.points;
		let { fillDeg, fillGap, type } = graph;
		fillDeg = fillDeg % 180;
		// x合集，y合集，边的极值
		let xset = [],
			yset = [],
			xmin,
			xmax,
			ymin,
			ymax;
		if (type == "polygon") {
			points.map((e, i) => {
				const dot1 = e;
				const dot2 = i == points.length - 1 ? points[0] : points[i + 1];
				sides.push([dot1.x, dot1.y, dot2.x, dot2.y]);
			});
			sides.map((e) => {
				xset.push(e[0], e[2]);
				yset.push(e[1], e[3]);
			});
			// 极值 向外溢出 5px
			xmin = Math.min(...xset) - 5;
			xmax = Math.max(...xset) + 5;
			ymin = Math.min(...yset) - 5;
			ymax = Math.max(...yset) + 5;
		} else if (type == "circle") {
			const { x, y, r } = graph;
			xmin = x - r - 5;
			xmax = x + r + 5;
			ymin = y - r - 5;
			ymax = y + r + 5;
		}

		let lines = [];
		lines = this.getScanLines(xmax, ymin, xmin, ymax, fillDeg, fillGap);
		let allCross = [];

		// (() => {
		// 	// 绘制计算线条
		// 	const ctx = this.ctx;
		// 	lines.map((line) => {
		// 		const [x1, y1, x2, y2] = line;
		// 		ctx.save();
		// 		ctx.beginPath();
		// 		ctx.moveTo(x1, y1);
		// 		ctx.lineTo(x2, y2);
		// 		ctx.closePath();
		// 		ctx.strokeStyle = "#f00";
		// 		ctx.stroke();
		// 		ctx.restore();
		// 	});
		// 	ctx.save();
		// 	ctx.beginPath();
		// 	ctx.moveTo(xmin, ymin);
		// 	ctx.lineTo(xmax, ymin);
		// 	ctx.lineTo(xmax, ymax);
		// 	ctx.lineTo(xmin, ymax);
		// 	ctx.lineTo(xmin, ymin);
		// 	ctx.closePath();
		// 	ctx.strokeStyle = "#0ff";
		// 	ctx.stroke();
		// 	ctx.restore();
		// })();
		lines.map((line) => {
			let lineCross = [];
			if (type == "polygon") {
				for (let i = 0; i < sides.length; i++) {
					const side = sides[i];
					const [x1, y1, x2, y2] = line;
					const [x3, y3, x4, y4] = side;
					const cross = calculateIntersection(
						{ x: x1, y: y1 },
						{ x: x2, y: y2 },
						{ x: x3, y: y3 },
						{ x: x4, y: y4 }
					);
					if (cross) lineCross.push(cross);
				}
			} else if (type == "circle") {
				const [x1, y1, x2, y2] = line;
				const { x, y, r } = graph;
				const arc = {
					x,
					y,
					r
				};
				const cross = this.getArcLineCrossDots(
					arc,
					{ x: x1, y: y1 },
					{ x: x2, y: y2 }
				);
				if (cross) lineCross.push(...cross);
			}
			if (lineCross && lineCross.length) allCross.push(lineCross);
		});
		if (type == "circle") {
			let _allCross = [];
			for (let i = 0; i < allCross.length; i++) {
				const item = [allCross[i][0], allCross[allCross.length - 1 - i][1]];
				_allCross.push(item);
			}
			allCross = _allCross;
		}
		return allCross;
	},
	// 获得扫描线组
	getScanLines(xmax, ymin, xmin, ymax, deg, gap) {
		const rad = deg * (Math.PI / 180);
		let ly = gap / Math.cos(rad);
		let lx = gap / Math.sin(rad);
		let lines = [];
		if (deg == 0) {
			// 取顶部平行0°的线
			// 向下扫描
			const totalStep = Math.ceil((ymax - ymin) / gap);
			for (let i = 0; i < totalStep; i++) {
				let x1 = xmin;
				let y1 = ymin + i * gap;
				let x2 = xmax;
				let y2 = ymin + i * gap;
				lines.push([x1, y1, x2, y2]);
			}
		} else if (deg == 90) {
			// 取最左平行90°的线
			// 向右扫描
			const totalStep = Math.ceil((xmax - xmin) / gap);
			for (let i = 0; i < totalStep; i++) {
				let x1 = xmin + i * gap;
				let y1 = ymin;
				let x2 = xmin + i * gap;
				let y2 = ymax;
				lines.push([x1, y1, x2, y2]);
			}
		} else {
			if (deg < 90) {
				// 获得斜率
				const slope = Math.tan(rad);
				let intercept = ymin - slope * xmax;
				// 从右上角向左下角扫描
				const totalStep = Math.ceil(
					this.distanceToLine(xmin, ymax, slope, -1, intercept) / gap
				);
				for (let i = totalStep; i > 0; i--) {
					let x1 = xmin;
					let y1 = ymax - i * ly;
					let x2 = i * lx + xmin;
					let y2 = ymax;
					lines.push([x1, y1, x2, y2]);
				}
			} else {
				// 获得斜率
				const slope = Math.tan(rad);
				let intercept = ymin - slope * xmin;
				// 从左上角向右下角扫描
				const totalStep = Math.ceil(
					this.distanceToLine(xmax, ymax, slope, -1, intercept) / gap
				);
				for (let i = totalStep; i > 0; i--) {
					let x1 = xmax;
					let y1 = ymax + i * ly;
					let x2 = xmax - i * lx;
					let y2 = ymax;
					lines.push([x1, y1, x2, y2]);
				}
			}
		}
		return lines;
	},

	// 使用描线填充
	initCrossLine(graph, color) {
		const crossDots = this.getGraphCrossDots(graph);
		graph.crossDots = crossDots;
		if (graph.crossDots && graph.crossDots.length) {
			graph.crossInit = true;
			graph.crossDots.map((line) => {
				if (line.length == 2)
					this.initLinePath({
						path: line,
						offset: 2,
						color,
						type: graph.type,
						double: graph.hasOwnProperty("double") ? graph.double : true,
						id: graph.id,
						lineType: "fill"
					});
			});
		}
	},
	// 更新图形数据 缩放 targetPoint
	updateGraphZoom(graph, rate, rp) {
		let center = {};
		if (graph.type == "polygon") {
			center = this.getPointsCenter(graph.points);
		}
		if (graph.type == "circle") {
			center = { x: graph.x, y: graph.y };
		}
		const cx = rp ? rp.x : center.x;
		const cy = rp ? rp.y : center.y;
		let _rp = {
			x: cx,
			y: cy
		};
		this.zoomPointsFn(graph, rate);
		graph.lines.map((line) => {
			this.updateLineInZoom(line, rate, _rp);
		});
	},
	// 更新图形数据 旋转
	updateGraphRotate(graph, deg, rp) {
		let center = {};
		if (graph.type == "polygon") {
			center = this.getPointsCenter(graph.points);
		}
		if (graph.type == "circle") {
			center = { x: graph.x, y: graph.y };
		}
		const cx = rp ? rp.x : center.x;
		const cy = rp ? rp.y : center.y;
		let _rp = {
			x: cx,
			y: cy
		};
		this.rotatePointFn(graph, deg, _rp);
		graph.lines.map((line) => {
			this.updateLineInRotate(line, deg, _rp);
		});
	},
	// 缩放计算
	zoomPointsFn(graph, rate) {
		let center = {};
		if (graph.type == "polygon") {
			center = this.getPointsCenter(graph.points);
		}
		if (graph.type == "circle") {
			center = { x: graph.x, y: graph.y };
			const start = { x: graph.offset.startX, y: graph.offset.startY };
			const end = { x: graph.offset.endX, y: graph.offset.endY };
			const _start = this.scaleCommon({
				targetPoint: start,
				referPoint: center,
				targetRate: rate
			});
			const _end = this.scaleCommon({
				targetPoint: end,
				referPoint: center,
				targetRate: rate
			});
			graph.zoomOffset = {
				startX: _start.x,
				startY: _start.y,
				endX: _end.x,
				endY: _end.y
			};
		}
		let zoomPoints = [];
		graph.points.map((pot) => {
			let _pot = this.scaleCommon({
				targetPoint: pot,
				referPoint: center,
				targetRate: rate
			});
			zoomPoints.push(_pot);
		});
		graph.zoom = rate;
		graph.zoomPoints = zoomPoints;
	},
	// 旋转计算
	rotatePointFn(graph, deg, _rp) {
		let center = _rp;
		// if (graph.type == "polygon") {
		// 	center = this.getPointsCenter(graph.points);
		// }
		if (graph.type == "circle") {
			// center = { x: graph.x, y: graph.y };
			this.updateCircelOffsetRotate(graph, center, deg);
		}
		let points = [];
		graph.points.map((pot) => {
			let _pot = this.centerGetDegDot({
				targetPoint: pot,
				referPoint: center,
				deg: deg - graph.rotateDeg || 0
			});
			points.push(_pot);
		});

		graph.points = points;

		if (graph.zoom != 1 && graph.zoomPoints) {
			let zoomPoints = [];
			graph.zoomPoints.map((pot) => {
				let _pot = this.centerGetDegDot({
					targetPoint: pot,
					referPoint: center,
					deg: deg - graph.rotateDeg || 0
				});
				zoomPoints.push(_pot);
			});
			graph.zoomPoints = zoomPoints;
		}

		graph.rotateDeg = deg;
	},
	// 更新圆形起点终点偏移位置
	updateCircelOffsetRotate(cir, center, deg) {
		const start = { x: cir.offset.startX, y: cir.offset.startY };
		const end = { x: cir.offset.endX, y: cir.offset.endY };
		const _start = this.centerGetDegDot({
			targetPoint: start,
			referPoint: center,
			deg: deg - cir.rotateDeg || 0
		});
		const _end = this.centerGetDegDot({
			targetPoint: end,
			referPoint: center,
			deg: deg - cir.rotateDeg || 0
		});
		cir.offset = {
			startX: _start.x,
			startY: _start.y,
			endX: _end.x,
			endY: _end.y
		};
		if (cir.zoomOffset) {
			const start = { x: cir.zoomOffset.startX, y: cir.zoomOffset.startY };
			const end = { x: cir.zoomOffset.endX, y: cir.zoomOffset.endY };
			const _start = this.centerGetDegDot({
				targetPoint: start,
				referPoint: center,
				deg: deg - cir.rotateDeg || 0
			});
			const _end = this.centerGetDegDot({
				targetPoint: end,
				referPoint: center,
				deg: deg - cir.rotateDeg || 0
			});
			cir.zoomOffset = {
				startX: _start.x,
				startY: _start.y,
				endX: _end.x,
				endY: _end.y
			};
		}
		if (cir.x != center.x || cir.y != center.y) {
			const { x: _x, y: _y } = this.centerGetDegDot({
				targetPoint: { x: cir.x, y: cir.y },
				referPoint: center,
				deg: deg - cir.rotateDeg || 0
			});
			cir.x = _x;
			cir.y = _y;
		}
	},
	// 更新图形数据 移动
	updateGraphMove(graph, ox, oy) {
		// 更新位置
		graph.x += ox;
		graph.y += oy;
		// if (graph.type == "polygon") {
		// 更新线条
		graph.lines.map((line) => {
			this.updateLineInMove(line, ox, oy);
		});
		// }
		if (graph.type == "circle") {
			graph.offset.startX += ox;
			graph.offset.endX += ox;
			graph.offset.startY += oy;
			graph.offset.endY += oy;

			graph.zoomOffset.startX += ox;
			graph.zoomOffset.endX += ox;
			graph.zoomOffset.startY += oy;
			graph.zoomOffset.endY += oy;
		}
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
	refreshGraph(graph, colors = [], log = false) {
		if (log) {
			console.warn(graph, colors);
		}
		this.fillPolygon(graph);
		let strokeColor = "";
		graph.lines.map((line) => {
			if (line.lineType == "fill") {
				strokeColor = graph.onpitch
					? graph.pitchColors.line
					: graph.colors.line;
			} else {
				strokeColor = graph.onpitch
					? graph.pitchColors.side
					: graph.colors.side;
			}
			this.refreshLine(line, strokeColor, graph.context, log);
		});
	},
	// 重绘所有多边形
	// id 不刷新某个图形的id
	refreshAllGraph(id) {
		const gs = this.graph["polygon"];
		for (let gkey in gs) {
			const g = gs[gkey];
			if (id != g.id && !g.staticstate) this.refreshGraph(g);
		}
	},
	// 不重置某个状态 unhands
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
	// 判断当前图形是否处于活动中
	isOnActive(id) {
		for (let k in this.activeGraph) {
			if (this.activeGraph[k][id]) return true;
		}
		return false;
	},
	// 移动图形
	graphMove(graph, movementX, movementY) {
		if (!graph.onpitch) return;
		// 将图形添加至活动对象的移动中
		this.addActiveGraph("onmove", graph);
		// 更新图形移动后点位、方位、线条数据
		this.updateGraphMove(graph, movementX, movementY);
	}
};

// 图形-圆形相关
const CIRCLE = {
	// 根据角度 取圆上的一点
	getPointOnCircle(deg, circle) {
		let rad = deg * (Math.PI / 180);
		let x = circle.x + circle.r * Math.cos(rad);
		let y = circle.y + circle.r * Math.sin(rad);
		return { x, y };
	},
	createCircle(options, context, autodraw = true) {
		let {
			x,
			y,
			r,
			id,
			operability = true,
			staticstate = false,
			draggable = false,
			clickable = false,
			onclick,
			colors = {},
			pitchColors = {},
			fillType = "fill",
			double = true,
			fillDeg = 0,
			fillGap = 10
		} = options;

		let _id = `circle_${id || Math.random().toString(32).slice(-8)}`;
		let graph = this.getGraph("circle", _id);
		graph.x = x;
		graph.y = y;
		graph.r = r;
		graph.colors = {
			...this.colors,
			...colors
		};
		graph.pitchColors = {
			...this.pitchColors,
			...pitchColors
		};
		graph.type = "circle";
		graph.context = context || this.ctx;

		graph.fillType = fillType;
		graph.operability = options.hasOwnProperty("operability")
			? operability
			: true;
		graph.staticstate = options.hasOwnProperty("staticstate")
			? staticstate
			: false;
		graph.draggable = options.hasOwnProperty("draggable") ? draggable : false;
		graph.clickable = options.hasOwnProperty("clickable") ? clickable : false;
		if (graph.clickable && onclick) graph.onclick = onclick;
		graph.fillDeg = ["line", "mix"].includes(fillType) ? fillDeg : 0;
		fillGap = fillGap <= 0 ? 1 : fillGap;
		graph.fillGap = ["line", "mix"].includes(fillType) ? fillGap : 0;
		graph.crossInit = false;
		graph.double = options.hasOwnProperty("double") ? double : true;
		let _x = x + random(-2, 2);
		let _y = y + random(-2, 2);
		const points = this.calculateCirDots(_x, _y, r);
		graph.points = [];
		graph.points.push(...points);
		let len = 8;
		if (graph.double) {
			let __x = x + random(-2, 2);
			let __y = y + random(-2, 2);
			const points = this.calculateCirDots(__x, __y, r);
			graph.points.push(...points);
			len = 16;
		}
		graph.len = len;
		const offsetBase = graph.r / 50;
		const offset = {
			startX: graph.points[0].x + random(-5, 5) * offsetBase,
			startY: graph.points[0].y + random(-10, 10) * offsetBase,
			endX: graph.points[len - 1].x + random(-5, 5) * offsetBase,
			endY: graph.points[len - 1].y + random(-10, 10) * offsetBase
		};
		graph.offset = offset;
		if (autodraw) this.drawCir(graph);
		return graph;
	},
	drawCir(cir) {
		const { zoom, zoomPoints, points: _points, offset, zoomOffset } = cir;
		const points = zoom == 1 ? _points : zoomPoints || _points;
		const len = points.length;
		const ctx = cir.context;

		const _offset = zoom == 1 ? offset : zoomOffset || offset;
		const { startX, startY, endX, endY } = _offset;

		this.fillPolygon(cir);
		for (let i = 0; i < len; i += 2) {
			let d1 = points[i];
			let d2 = points[i + 1];
			let d3 = i == len - 2 ? points[0] : points[i + 2];
			ctx.save();
			ctx.beginPath();

			if (i == 0) {
				ctx.moveTo(startX, startY);
			} else ctx.moveTo(d1.x, d1.y);

			if (i == len - 1) ctx.quadraticCurveTo(d2.x, d2.y, endX, endY);
			else ctx.quadraticCurveTo(d2.x, d2.y, d3.x, d3.y);
			const strokeColor = cir.onpitch ? cir.pitchColors.side : cir.colors.side;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
			ctx.restore();
		}
	},
	refreshAllCircles(id) {
		const gs = this.graph["circle"];
		for (let gkey in gs) {
			const g = gs[gkey];
			if (id != g.id && !g.staticstate) this.drawCir(g);
		}
	},
	// 利用圆的方程与直线一般式计算x位置
	getLineCirCrossX(x0, y0, intercept, lineslope, r) {
		let val1 =
			(r * r - x0 * x0 - Math.pow(intercept - y0, 2)) *
				(1 + lineslope * lineslope) +
			Math.pow(intercept * lineslope - x0 - y0 * lineslope, 2);
		let x =
			(Math.sqrt(val1) - intercept * lineslope + x0 + y0 * lineslope) /
			(1 + lineslope * lineslope);
		return x;
	},
	// 获得圆与线的交点
	getArcLineCrossDots(arc, dot1, dot2) {
		let lineslope = slope(dot1.x, dot1.y, dot2.x, dot2.y);
		// 取截距
		let intercept = dot1.y - lineslope * dot1.x;
		// 如果是垂线
		const isVerticalLine = Math.abs(intercept) == Infinity;
		// 如果是垂线 distance 取dot1或者dot2的x - 圆心x  的绝对值
		const distance = isVerticalLine
			? Math.abs(dot1.x - arc.x)
			: this.distanceToLine(arc.x, arc.y, lineslope, -1, intercept);
		if (distance < arc.r) {
			// 如果是垂线 x 取dot1或者dot2的x，否则根据 斜率 截距
			let x = isVerticalLine
				? dot1.x
				: this.getLineCirCrossX(arc.x, arc.y, intercept, lineslope, arc.r);
			// 如果是垂线 y 通过圆公式计算，否则用直线公式计算
			let y = isVerticalLine
				? Math.sqrt(arc.r * arc.r - Math.pow(x - arc.x, 2)) + arc.y
				: lineslope * x + intercept;
			// 圆心与x,y的差值，必定是另一点的与圆心的差值
			// x0 - (x1 - x0) = x2
			// y0 - (y1 - y0) = y2
			let vx = x - arc.x;
			let vy = y - arc.y;

			return [
				{ x, y },
				{ x: arc.x - vx, y: arc.y - vy }
			];
		}
	},
	calculateCirDots(x, y, r) {
		let cir = { x, y, r };
		const len = 8;
		let dots = [];
		// 别问为什么是 .32 到 .38，二阶贝塞尔曲线比较圆
		const randomrate = random(0.32, 0.38) + 1;
		for (let i = 0; i < len; i++) {
			const deg = (i * 360) / len;
			const dcir = {
				...cir,
				r: cir.r * randomrate
			};
			const d =
				i % 2
					? this.getPointOnCircle(deg, dcir)
					: this.getPointOnCircle(deg, cir);
			let dx = random(-3, 3);
			let dy = random(-3, 3);
			let x = d.x + dx;
			let y = d.y + dy;
			dots.push({ x, y });
		}
		return dots;
	}
};

const FUNCTIONS = {
	...COMMON,
	...LINE,
	...GRAPH,
	...CIRCLE,
	...HANDLE
};
HandDraw.prototype.constructor = HandDraw;
for (let key in FUNCTIONS) {
	HandDraw.prototype[key] = FUNCTIONS[key];
}
