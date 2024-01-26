// v0.10 初始版本
// 有很多问题

class AnimationEventBus {
	constructor() {
		this.eventBus = [];
		this.run = false;
		this.anm = null;
	}
	// 开始事件循环
	eventBegin() {
		if (this.run) return;
		this.run = true;
		this.anm = window.requestAnimationFrame(this.loopevent.bind(this));
	}
	// 结束事件循环
	eventEnd() {
		if (!this.run) return;
		this.run = false;
		window.cancelAnimationFrame(this.anm);
		this.anm = null;
	}
	// 添加循环事件
	addEvent(options) {
		const { event, params, id } = options;
		this.eventBus.push({
			event,
			params,
			id
		});
		if (this.eventBus.length == 1) this.eventBegin();
	}
	// 移除某个事件
	removeEvent(id) {
		const index = this.eventBus.findIndex((e) => e.id == id);
		this.eventBus.splice(index, 1);
		if (!this.eventBus.length) this.eventEnd();
	}
	// 执行循环事件
	loopevent() {
		this.eventBus.map((evt) => {
			const event = evt.event;
			const params = evt.params;
			event(...params);
		});
		if (this.run) window.requestAnimationFrame(this.loopevent.bind(this));
	}
}

const EvtMng = new AnimationEventBus();

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

const isPointInPolygon = (point, polygon) => {
	//下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
	//基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
	//在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

	var N = polygon.length;
	var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
	var intersectCount = 0; //cross points count of x
	var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
	var p1, p2; //neighbour bound vertices
	var p = point; //测试点

	p1 = polygon[0]; //left vertex
	for (var i = 1; i <= N; ++i) {
		//check all rays
		if (p.x == p1.x && p.y == p1.y) {
			return boundOrVertex; //p is an vertex
		}

		p2 = polygon[i % N]; //right vertex
		if (p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)) {
			//ray is outside of our interests
			p1 = p2;
			continue; //next ray left point
		}

		if (p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)) {
			//ray is crossing over by the algorithm (common part of)
			if (p.x <= Math.max(p1.x, p2.x)) {
				//x is before of ray
				if (p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)) {
					//overlies on a horizontal ray
					return boundOrVertex;
				}

				if (p1.x == p2.x) {
					//ray is vertical
					if (p1.x == p.x) {
						//overlies on a vertical ray
						return boundOrVertex;
					} else {
						//before ray
						++intersectCount;
					}
				} else {
					//cross point on the left side
					var xinters = ((p.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x; //cross point of x
					if (Math.abs(p.x - xinters) < precision) {
						//overlies on a ray
						return boundOrVertex;
					}

					if (p.x < xinters) {
						//before ray
						++intersectCount;
					}
				}
			}
		} else {
			//special case when ray is crossing through the vertex
			if (p.y == p2.y && p.x <= p2.x) {
				//p crossing over p2
				var p3 = polygon[(i + 1) % N]; //next vertex
				if (p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)) {
					//p.y lies between p1.y & p3.y
					++intersectCount;
				} else {
					intersectCount += 2;
				}
			}
		}
		p1 = p2; //next ray left point
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

// 斜率
const slope = (x1, y1, x2, y2) =>
	x1 == x2 ? random(10, 100) / 1000 : (y2 - y1) / (x2 - x1);

// 取小数部分
const decimals = (n) => +n % 1;

// 大于零 取 0 - n , 小于零 取 n - 0
const disRd = (n) => (n > 0 ? random(n) : random(n, 0));

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

const $querys = (el) => {
	const querys = $isDOM(el) ? el : $(el);
	return querys.length ? Array.from(querys) : querys;
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
	},
	mouseThrottleMove(el, cb, delay = 50) {
		const dom = $isDOM(el) ? el : $(el);
		dom.addEventListener("mousemove", throttle(cb, delay));
	},
	mouseDown: (el, cb) => {
		const dom = $isDOM(el) ? el : $(el);
		dom.addEventListener("mousedown", cb);
	},
	mouseUp: (el, cb) => {
		const dom = $isDOM(el) ? el : $(el);
		dom.addEventListener("mouseup", cb);
	}
};
// 存在图形的种类
// 不规则图形 type = 'irregular' 注：不规则闭合图形 取x、y最大最小值，来判断点位是否在图形内
// 多边形 type = 'polygon' 注：射线法、环绕数法
// 圆形 type = 'circle' 注：点距离圆心距离是否大于圆半径
// 椭圆 type  = 'ellipse' 注：

class HandDraw {
	constructor(options) {
		document.body.style.height = "100vh";
		document.body.style.margin = "0";
		document.body.style.padding = "0";
		// 位置、大小
		const { x, y, width, height, el, zIndex, id, classname } = options;
		const _el = el ? $(el) : document.body;
		const canvas = document.createElement("canvas");
		this.randomId = Math.random().toString(32).slice(-8);
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
		this.onPitchGraph = null;
		this.canvasList = {
			[this.id]: this.canvas
		};

		this.ctxList = {
			[this.ctxid]: this.ctx
		};
		// 用来存放纯线段
		// {
		// 	path: [[], []],
		// 	color: color,
		// 	afficvs: this.id,
		// 	affictx: this.ctxid,
		// 	id: `line--id--${Math.random().toString(32).slice(-8)}`
		// }
		this.lines = {};
		// 用来存放各种图形
		this.graph = {
			irregular: {}, // 不规则闭合图形
			polygon: {}, // 多边形
			circle: {}, // 圆型
			ellipse: {} // 椭圆
		};
		DOMS.add(canvas, _el);
	}
	getCanvas(id) {
		if (!id) return this.canvas;
		else {
			return this.canvasList[id];
		}
	}
	getCtx(id) {
		if (!id) return this.ctx;
		else {
			return this.ctxList[id];
		}
	}
	getGraph(type, id) {
		const obj = this.graph[type];
		let g = obj[id];
		if (!g) {
			g = {};
			g.lines = [];
			g.points = [];
			obj[id] = g;
		}
		return obj[id];
	}

	getPath(type, id) {
		const obj = this.graph[type];
		return obj[id].path;
	}

	dotin(dot, c = "#f00") {
		const ctx = this.getCtx();
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
	}

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
	}
	calculateLine(x1, y1, x2, y2, offset, color = "#fff") {
		// 取得斜率
		const lineSlope = slope(x1, y1, x2, y2);

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
	}
	bezierLineStage2(_x1, _y1, _x2, _y2, _x3, _y3, color) {
		// 2阶贝塞尔曲线
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.quadraticCurveTo(_x2, _y2, _x3, _y3);
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.restore();
	}
	bezierLineStage3(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4, color) {
		// 3阶贝塞尔曲线
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(_x1, _y1);
		ctx.bezierCurveTo(_x2, _y2, _x3, _y3, _x4, _y4);
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.restore();
	}
	inputLinePath(
		path,
		offset = 2,
		color = "#fff",
		type = "line",
		double = true,
		id
	) {
		if (!path || path.length < 2) {
			console.warn(
				"'function inputLinePath' : 请输入正确的路径 => [{x,y}, {x,y}]"
			);
			return;
		} else {
			for (let i = 0; i < path.length; i++) {
				const p1 = path[i];
				const p2 = path[i + 1];
				if (p1 && p2) {
					const { x: x1, y: y1 } = p1;
					const { x: x2, y: y2 } = p2;
					let linepath = [];
					let line1 = this.calculateLine(x1, y1, x2, y2, offset, color);
					linepath.push(line1);
					if (double) {
						let line2 = this.calculateLine(x1, y1, x2, y2, offset, color);
						linepath.push(line2);
					}
					if (type == "line") {
						const id = `line_${Math.random().toString(32).slice(-8)}`;
						const lineobj = {
							path: linepath,
							color: color,
							afficvs: this.id, // 归属的画布的id
							affictx: this.ctxid, // 归属的画笔的id
							id
						};
						this.lines[id] = lineobj;
						return lineobj;
					} else {
						let graph = this.getGraph(type, id);
						graph.lines.push(...linepath);
					}
				}
			}
			return;
		}
	}
	rect(id, x, y, w, h, offset = 2, color = "#fff", double = true) {
		const dot1 = { x, y },
			dot2 = { x: x + w, y },
			dot3 = { x: x + w, y: y + h },
			dot4 = { x, y: y + h };
		let path = [dot1, dot2, dot3, dot4, dot1];
		id = `polygon_${id}`;
		let graph = this.getGraph("polygon", id);
		graph.points.push(dot1, dot2, dot3, dot4);
		graph.x = x;
		graph.y = y;
		graph.width = w;
		graph.height = h;
		graph.id = id;
		graph.zoom = 1;

		graph.onTransform = false; // 是否处于变形，可手动赋予
		graph.onEnter = false; // 鼠标进入
		graph.onPitch = false; //鼠标选中
		graph.onMove = false; // 选中并移动
		graph.onZoom = false; // 选中并缩放

		graph.ctx = this.ctx;
		this.inputLinePath(path, offset, color, "polygon", double, id);
		return graph;
	}
	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	refreshLine(line) {
		let paths = line.path;
		paths.map((p) => {
			this.bezierLineStage3(...p, line.color);
		});
	}
	refreshAllLine() {
		// 重绘线段
		for (let k in this.lines) {
			const line = this.lines[k];
			this.refreshLine(line);
		}
	}
	updateGraphMove(graph, ox, oy) {
		graph.lines.map((line, index) => {
			let [x1, y1, x2, y2, x3, y3, x4, y4] = line;
			x1 += ox;
			x2 += ox;
			x3 += ox;
			x4 += ox;
			y1 += oy;
			y2 += oy;
			y3 += oy;
			y4 += oy;
			let _line = [x1, y1, x2, y2, x3, y3, x4, y4];
			graph.lines[index] = _line;
		});
		graph.points.map((pot) => {
			pot.x += ox;
			pot.y += oy;
		});
	}
	refreshGraph(graph, color) {
		graph.lines.map((line) => {
			this.bezierLineStage3(...line, color || line.color);
		});
	}
	refreshAllGraph() {
		for (let gskey in this.graph) {
			const gs = this.graph[gskey];
			for (let gkey in gs) {
				const g = gs[gkey];
				const onTransform =
					g.onTransform || g.onMove || g.onZoom || g.onPitch || g.onEnter;
				if (!onTransform) this.refreshGraph(g);
			}
		}
	}

	refresh() {
		this.refreshAllLine();
		this.refreshAllGraph();
	}
	createCanvas(options, callback) {
		const { x, y, width, height, zIndex, id, classname } = options;
		const canvasid = id
			? id
			: `cvs-lv2-${Math.random().toString(32).slice(-8)}`;
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
	}
	// PInP
	testFunction(graph) {
		let dots = [];
		for (let i = 0; i < 10; i++) {
			let x = random(0, 200);
			let y = random(0, 200);
			dots.push({ x, y });
		}
		const ctx = this.getCtx();
		let gdots = graph.points;
		dots.map((dot, i) => {
			this.dotin(dot);
			let isin = isPointInPolygon(dot, gdots);
			if (isin) console.log(`第${i}点，在图形内`);
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = "#0f0";
			ctx.fillText(i, dot.x, dot.y);
			ctx.restore();
		});
	}

	// 放大缩小图形 倍率
	// 在timer秒内，将canvas中graph变为rate倍
	// 标记 该图形，在全部重绘方法中 不重绘标记的图形
	// sustain 是否定型
	scale(graph, rate = 2, timer = 0.5, sustain = false) {
		const ctx = graph.ctx;
		const stepNum = Math.ceil((timer * 1000) / 16.66);
		const rateStep = (rate - graph.zoom) / stepNum;
		// 放大:enlarge; 缩小:shrink
		const type = rate > graph.zoom ? "enlarge" : "shrink";
		// 目标倍率
		let targetRate = graph.zoom + rateStep;
		// 事件id
		let evtid = `evt-${Math.random().toString(32).slice(-8)}`;
		// 缩放
		const zoom = () => {
			// 当前矩阵
			let original = new Float32Array([
				1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
			]);
			// 输出矩阵
			const out = new Float32Array([
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
			]);

			// 得到图形位置
			const x = graph.x + graph.width / 2;
			const y = graph.y + graph.height / 2;

			// 目标位置
			const targetx = x * (1 - targetRate);
			const targety = y * (1 - targetRate);

			const dot1 = [targetRate, 0, 0, 0];
			const dot2 = [0, targetRate, 0, 0];
			const dot3 = [0, 0, 1, 0];
			const dot4 = [targetx, targety, 0, 1];

			const target = new Float32Array([...dot1, ...dot2, ...dot3, ...dot4]);
			targetRate = graph.zoom + rateStep;
			if (type == "enlarge" && targetRate >= rate) targetRate = rate;
			if (type == "shrink" && targetRate <= rate) targetRate = rate;
			const now = glMatrix.mat4.multiply(out, target, original);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.save();
			// transform(p1,p2,p3,p4,p5,p6)
			// p1水平拉伸，p2水平倾斜
			// p3垂直倾斜，p4垂直拉伸
			// p5水平位移，p6垂直位移
			ctx.transform(now[0], now[4], now[1], now[5], now[12], now[13]);
			this.refreshGraph(graph, "#f00");
			ctx.restore();

			this.refreshAllLine();

			graph.zoom = targetRate;
			if (
				(type == "enlarge" && targetRate >= rate) ||
				(type == "shrink" && targetRate <= rate)
			) {
				EvtMng.removeEvent(evtid);
				// 如果不维持当前大小，则回归 本来大小
				if (!sustain && graph.zoom != 1) {
					// this.scale(graph, 1, timer);
				} else if (sustain) {
					// 如果维持当前大小，则将新的图形数据填充
					// graph.zoom = rate
				}
			}
		};
		EvtMng.addEvent({
			event: zoom,
			params: [],
			id: evtid
		});
	}

	// 通用函数
	// tpoint 缩放目标点
	// targetRate 目标倍率
	// inzero 如果是针对某个点位缩放，就使用inzero 将参照点位归零处理
	// 其实就是将参照点位平移到坐标原点 0,0
	// zeroPoint 以哪个点位做参照缩放
	// 输出 left top right bottom width height
	scaleCommon(tPoint, targetRate, inzero = true, zeroPoint) {
		const { x: sx, y: sy } = zeroPoint;
		const { x: tx, y: ty } = tPoint;

		let _sx = inzero ? sx - sx : sx;
		let _sy = inzero ? sy - sy : sy;
		let _tx = inzero ? tx - sx : tx;
		let _ty = inzero ? ty - sx : ty;

		let top, left, right, bottom, outx, outy;
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
		const leftTop = [left, top, 0, 0];
		const rightTop = [right, top, 0, 0];
		const rightBtoom = [right, bottom, 1, 0];
		const leftBtoom = [left, bottom, 0, 1];
		let original = new Float32Array([
			...leftTop,
			...rightTop,
			...rightBtoom,
			...leftBtoom
		]);
		const transformArray = new Float32Array([
			targetRate,
			0,
			0,
			0,
			0,
			targetRate,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		]);
		const targetx = _sx * (1 - targetRate); // left
		const targety = _sy * (1 - targetRate); // top

		const moveArray = new Float32Array([
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			targetx,
			targety,
			0,
			1
		]);

		// 缩放
		let res1 = glMatrix.mat4.multiply(
			new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
			transformArray,
			original
		);

		// 平移
		const res2 = glMatrix.mat4.multiply(
			new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
			moveArray,
			res1
		);

		if (_sx > _tx) {
		} else {
		}
		if (_sy > _ty) {
		} else {
		}

		const output = {
			width: res2[4] - res2[0],
			height: res2[9] - res2[1],
			left: res2[0] + sx,
			right: res2[4] + sx,
			top: res2[1] + sy,
			bottom: res2[9] + sy
		};
		return output;
	}

	// 主要应用 某个点位之于某个点位的缩放
	// sx,sy 缩放位置，targetRate缩放比率，tx,ty缩放目标
	// zero scaling 归零缩放
	// 一个位于 20,20 宽五十的正方形，以左上角为缩放点缩放两倍
	// scalePoint(20,20, 70,70, 2)
	/**
	 * output = {
	 * 	width: 100,
	 *  height: 100,
	 *  left: 20,
	 *  top: 20,
	 *  right: 120,
	 *  bottom: 120
	 * }
	 */
	scalePoint(sx, sy, tx, ty, targetRate) {
		this.scaleCommon({ x: tx, y: ty }, targetRate, true, {
			x: sx,
			y: sy
		});
	}
	// 主要缩放矩形
	scaleRect(x, y, w, h, rate) {
		const sx = x + w / 2;
		const sy = y + h / 2;
		this.scaleCommon({ x: tx, y: ty }, rate, false, {
			x: sx,
			y: sy
		});
	}

	// 放大缩小图形 倍率
	// 在timer秒内，将canvas中graph变为rate倍
	// 标记 该图形，在全部重绘方法中 不重绘标记的图形
	// sustain 是否定型
	scale2() {
		const ctx = graph.ctx;
		const stepNum = Math.ceil((timer * 1000) / 16.66);
		const rateStep = (rate - graph.zoom) / stepNum;
		// 放大:enlarge; 缩小:shrink
		const type = rate > graph.zoom ? "enlarge" : "shrink";
		// 目标倍率
		let targetRate = graph.zoom + rateStep;
		// 事件id
		let evtid = `evt-${Math.random().toString(32).slice(-8)}`;
		// 缩放
		const zoom = () => {
			// 当前矩阵
			// 与 border-radius 四个点位属性位置相同
			//
			const left = graph.x;
			const top = graph.y;
			const right = graph.x + graph.width;
			const bottom = graph.y + graph.height;
			// 左上 => 右上 => 右下 => 左下
			const leftTop = [left, top, 0, 0];
			const rightTop = [right, top, 0, 0];
			const rightBtoom = [right, bottom, 1, 0];
			const leftBtoom = [left, bottom, 0, 1];
			let original = new Float32Array([
				...leftTop,
				...rightTop,
				...rightBtoom,
				...leftBtoom
			]);
			// 循环增加
			targetRate = graph.zoom + rateStep;
			const transformArray = new Float32Array([
				targetRate,
				0,
				0,
				0,
				0,
				targetRate,
				0,
				0,
				0,
				0,
				1,
				0,
				0,
				0,
				0,
				1
			]);

			// 得到图形中心位置
			const x = graph.x + graph.width / 2;
			const y = graph.y + graph.height / 2;
			// 目标位置
			const targetx = x * (1 - targetRate); // left
			const targety = y * (1 - targetRate); // top
			const moveArray = new Float32Array([
				1,
				0,
				0,
				0,
				0,
				1,
				0,
				0,
				0,
				0,
				1,
				0,
				targetx,
				targety,
				0,
				1
			]);
			// 缩放
			let res1 = glMatrix.mat4.multiply(
				new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
				transformArray,
				original
			);

			// 平移
			const res2 = glMatrix.mat4.multiply(
				new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
				moveArray,
				res1
			);

			// const now = glMatrix.mat4.multiply(out, target, original);
			// nl 缩放后的left, nr, nt, nb 同左;nw 缩放后的宽度，nh ---
			let nw = res2[4] - res2[0];
			let nh = res2[9] - res2[1];
			let nl = res2[0];
			let nt = res2[1];
			let nr = res2[4];
			let nb = res2[9];
			this.updateGraph(graph, {
				x: nl,
				y: nt,
				width: nw,
				height: nh
			});
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.save();
			// transform(p1,p2,p3,p4,p5,p6)
			// p1水平拉伸，p2水平倾斜
			// p3垂直倾斜，p4垂直拉伸
			// p5水平位移，p6垂直位移
			// ctx.transform(now[0], now[4], now[1], now[5], now[12], now[13]);
			this.refreshGraph(graph, "#f00");
			ctx.restore();

			this.refreshAllLine();

			if (type == "enlarge" && targetRate >= rate) targetRate = rate;
			if (type == "shrink" && targetRate <= rate) targetRate = rate;
			graph.zoom = targetRate;
			if (
				(type == "enlarge" && targetRate >= rate) ||
				(type == "shrink" && targetRate <= rate)
			) {
				EvtMng.removeEvent(evtid);
				// 如果不维持当前大小，则回归 本来大小
				if (!sustain && graph.zoom != 1) {
					// this.scale(graph, 1, timer);
				} else if (sustain) {
					// 如果维持当前大小，则将新的图形数据填充
					// graph.zoom = rate
				}
			}
		};
		EvtMng.addEvent({
			event: zoom,
			params: [],
			id: evtid
		});
	}
	restAllGraph() {
		this.onPitchGraph = null;
		for (let gskey in this.graph) {
			const gs = this.graph[gskey];
			for (let gkey in gs) {
				const g = gs[gkey];
				if (g.onEnter) {
					g.onEnter = false;
					g.onPitch = false;
				}
			}
		}
	}
	restGraph(graph) {
		graph.onTransform = false; // 是否处于变形，可手动赋予
		graph.onEnter = false; // 鼠标进入
		graph.onPitch = false; //鼠标选中
		graph.onMove = false; // 选中并移动
		graph.onZoom = false; // 选中并缩放
	}
	// 鼠标进入检测
	mouseEnterChecked(x, y) {
		const canvas = this.getCanvas();
		const left = canvas.offsetLeft;
		const top = canvas.offsetTop;
		const dot = { x: x - left, y: y - top };
		for (let gskey in this.graph) {
			const gs = this.graph[gskey];
			for (let gkey in gs) {
				const g = gs[gkey];
				let gdots = g.points;
				let isin = isPointInPolygon(dot, gdots);
				if (isin) return g;
			}
		}
	}
	move(movementX, movementY) {
		let graph = this.onPitchGraph;

		if (!graph.onPitch) return;
		const ctx = graph.ctx;

		let original = new Float32Array([
			1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
		]);
		// 输出矩阵
		const out = new Float32Array([
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]);
		const dot1 = [1, 0, 0, 0];
		const dot2 = [0, 1, 0, 0];
		const dot3 = [0, 0, 1, 0];
		const dot4 = [movementX, movementY, 0, 1];
		const target = new Float32Array([...dot1, ...dot2, ...dot3, ...dot4]);
		const now = glMatrix.mat4.multiply(out, target, original);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		graph.x += now[12];
		graph.y += now[13];
		this.updateGraphMove(graph, now[12], now[13]);
		// ctx.transform(now[0], now[4], now[1], now[5], now[12], now[13]);
		this.refreshGraph(graph, "#f00");
		ctx.restore();
		this.refreshAllLine();
	}
}
