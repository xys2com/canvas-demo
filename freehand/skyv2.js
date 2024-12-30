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
// 随机id
const randomId = (prefix = "", suffix = "") =>
	`${prefix}${Math.random().toString(32).slice(-8)}${suffix}`;
// 点距
const distance = (d1, d2) =>
	Math.sqrt((d2.x - d1.x) * (d2.x - d1.x) + (d2.y - d1.y) * (d2.y - d1.y));
// 夹角
const getAngle = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => {
	const dot = x1 * x2 + y1 * y2;
	const det = x1 * y2 - y1 * x2;
	const angle = (Math.atan2(det, dot) / Math.PI) * 180;
	return Math.round(angle + 360) % 360;
};
// 获得3次贝塞尔曲线 t时刻的坐标
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
		y: ny
	};
}
// 获得2次贝塞尔曲线 t时刻的坐标
function getBezierCurveLoc2(path, t) {
	// 二次贝塞尔曲线
	let [x1, y1, x2, y2, x3, y3] = path;
	let pow = Math.pow;
	let nx = pow(1 - t, 2) * x1 + 2 * t * (1 - t) * x2 + pow(t, 2) * x3;

	let ny = pow(1 - t, 2) * y1 + 2 * t * (1 - t) * y2 + pow(t, 2) * y3;
	return {
		x: nx,
		y: ny
	};
}
// 获得两条3次贝塞尔曲线；且首尾以2次贝塞尔曲线连接
function getTwoBL(minX, maxX, minY, maxY, ofw, ofh) {
	let d1, d2, d3, d4, d5;
	let d11, d22, d33, d44, d55;
	d1 = {
		x: random(minX, maxX),
		y: random(minY, maxY)
	};
	d4 = {
		x: random(minX, maxX),
		y: random(minY, maxY)
	};
	d2 = {
		x: random(minX, maxX),
		y: random(minY, maxY)
	};
	d3 = {
		x: random(minX, maxX),
		y: random(minY, maxY)
	};
	d5 = {
		x: (d1.x + d4.x) / 2 + random(-ofw, ofw),
		y: (d1.y + d4.y) / 2 + random(-ofh, ofh)
	};
	d11 = {
		x: d1.x + random(-ofw, ofw),
		y: d1.y + random(-ofh, ofh)
	};
	d22 = {
		x: d2.x + random(-ofw, ofw),
		y: d2.y + random(-ofh, ofh)
	};
	d33 = {
		x: d3.x + random(-ofw, ofw),
		y: d3.y + random(-ofh, ofh)
	};
	d44 = {
		x: d4.x + random(-ofw, ofw),
		y: d4.y + random(-ofh, ofh)
	};
	d55 = {
		x: (d11.x + d44.x) / 2 + random(-ofw, ofw),
		y: (d11.y + d44.y) / 2 + random(-ofh, ofh)
	};
	return [
		[d1, d2, d3, d4, d5],
		[d11, d22, d33, d44, d55]
	];
}
// 常量
const MTF_MN = [5, 6]; // 早晨
const MTF_DT = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // 白天
const MTF_DK = [17, 18];
const MTF_NT = [0, 1, 2, 3, 4, 19, 20, 21, 22, 23]; // 夜晚
// 云的原色
const CLOUD_COLOR = "#fff";
// 晚上云的颜色
const CLOUD_NIGTH_COLOR = {
	start: "#575447",
	end: "#616372",
	side: "transparent"
};
// 天空不同时段颜色
const COLOR_GROUP = {
	morning: {
		outer: "#e95226",
		inner: "#f2e07e"
	},
	// 霞
	morning_rosy: {
		outer: "#e45c90",
		inner: "#f2e07e"
	},
	daytime: {
		// outer: "#0b2070",
		outer: "#39b9e0",
		inner: "#eaf8f8"
	},
	dusk: {
		outer: "#fdbe7d",
		inner: "#fddebd"
	},
	// 霞
	dusk_rosy: {
		outer: "#3e1274",
		inner: "#e88a68"
	},
	night: {
		outer: "#00062a",
		inner: "#004999"
	}
};
class Sky {
	constructor(options) {
		const {
			x,
			y,
			width,
			height,
			el,
			zIndex,
			id,
			hours,
			classname,
			colors = COLOR_GROUP.daytime
		} = options;
		const canvas = document.createElement("canvas");

		const _id = id || randomId();
		const canvasId = `canvas_id_${_id}`;
		const contextId = `ctx_id_${_id}`;
		const ctx = canvas.getContext("2d");
		this.WIDTH = width;
		this.HEIGHT = height;
		this.HOURS = hours || 0;
		this.canvas = canvas;
		this.ctx = ctx;
		this.canvasMap = new Map();
		this.contextMap = new Map();
		this.canvasMap.set(canvasId, canvas);
		this.contextMap.set(contextId, ctx);
		this.clouds = new Map();
		this.colors = colors;

		canvas.setAttribute("id", canvasId);

		canvas.style.position = "absolute";
		canvas.style.zIndex = zIndex;
		canvas.style.left = `${x}px`;
		canvas.style.top = `${y}px`;
		canvas.width = width;
		canvas.height = height;
		if (classname) canvas.classList.add(classname);
		const _el = el ? $(el) : document.body;
		this.container = _el;
		_el.appendChild(canvas);
	}
}
const FUNCTIONS = {
	/**
	 * 天空相关方法
	 */

	// 获得当前时间的天空色 v1 必定霞光
	getTimeFrameColorsv1(hours) {
		hours = hours % 23;
		const _hours = hours || hours == 0 ? hours : new Date().getHours();
		if (MTF_MN.includes(_hours)) return COLOR_GROUP["morning_rosy"];
		if (MTF_DT.includes(_hours)) return COLOR_GROUP["daytime"];
		if (MTF_DK.includes(_hours)) return COLOR_GROUP["dusk_rosy"];
		if (MTF_NT.includes(_hours)) return COLOR_GROUP["night"];
	},
	getTimeFrameColors(hours, rosy) {
		hours = hours % 23;
		const _hours = hours || hours == 0 ? hours : new Date().getHours();
		const is_rosy = rosy || random(1, 2) == 1; // 50% 出现霞光
		if (MTF_MN.includes(_hours))
			return is_rosy ? COLOR_GROUP["morning_rosy"] : COLOR_GROUP["morning"];
		if (MTF_DT.includes(_hours)) return COLOR_GROUP["daytime"];
		if (MTF_DK.includes(_hours))
			return is_rosy ? COLOR_GROUP["dusk_rosy"] : COLOR_GROUP["dusk"];
		if (MTF_NT.includes(_hours)) return COLOR_GROUP["night"];
	},
	// 根据当前帧返回下一时刻与当前时刻的混合色
	// type:1 =>  径向渐变
	// type:2 => 线性渐变
	getSkyFarmeColors({ hours, count = 1, farme = 1 } = {}) {
		let gradient;
		const _hours = hours || this.HOURS;
		let type;
		if (MTF_DT.includes(_hours) || MTF_NT.includes(_hours)) type = 2;
		else type = 1;
		const ctx = this.ctx;
		const { outer: preout, inner: preinner } = this.colors;
		const { outer, inner } = this.getTimeFrameColorsv1(_hours);

		const innerMixin = mixinColors(inner, preinner, count / farme);
		const outerMixin = mixinColors(outer, preout, count / farme);
		const CX = this.WIDTH / 2;
		const CY = this.HEIGHT / 2;
		const maxDis = distance({ x: 0, y: 0 }, { x: CX, y: CY }) * 1.5;
		// 最大半径是，左上角到中心的距离乘以 1.5
		if (type == 1) {
			gradient = ctx.createRadialGradient(
				CX,
				this.HEIGHT,
				0,
				this.HEIGHT,
				CY,
				maxDis
			);
			gradient.addColorStop(0, "#fff");
			gradient.addColorStop(0.2, innerMixin);
			gradient.addColorStop(0.5, mixinColors(innerMixin, outerMixin));
			gradient.addColorStop(1, outerMixin);
		} else if (type == 2) {
			gradient = ctx.createLinearGradient(0, 0, 1, this.HEIGHT);
			gradient.addColorStop(0, outerMixin);
			gradient.addColorStop(0.5, mixinColors(innerMixin, outerMixin));
			gradient.addColorStop(1, innerMixin);
			// gradient.addColorStop(1, "#fff");
		}
		return gradient;
	},
	renderSky() {
		const ctx = this.ctx;
		let c = this.getSkyFarmeColors();
		ctx.save();
		ctx.fillStyle = c;
		ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
		ctx.restore(); //
		return Promise.resolve("sky render end");
	},

	/**
	 * 云朵相关方法
	 *
	 */
	// 获得当前时刻的云彩色
	getTimeFrameCloudsColors({ hours, rosy } = {}) {
		hours = !hours ? this.HOURS : hours;
		// const { outer, inner } = getTimeFrameColors(hours, rosy);
		const { outer, inner } = this.getTimeFrameColorsv1(hours);

		let baseRate = random(0.25, 0.75);
		if (MTF_MN.includes(hours) || MTF_DK.includes(hours)) {
			const start = outer;
			const end = inner;

			let side = mixinColors(CLOUD_COLOR, inner);
			side = setColorAlpha(side, Math.pow(baseRate, 2));
			return {
				start: start,
				end: end,
				side: "transparent"
			};
		}

		if (MTF_DT.includes(hours)) {
			const start = CLOUD_COLOR;
			const end = ["#fff", "#eee", "#ddd"][random(0, 2)];

			let side = mixinColors(CLOUD_COLOR, inner);
			side = setColorAlpha(side, Math.pow(baseRate, 2));
			return {
				start: setColorAlpha(start, 0.25),
				end: setColorAlpha(end, 0.25),
				side
			};
		}
		// 晚上
		// 使用 CLOUD_NIGTH_COLOR
		if (MTF_NT.includes(hours)) {
			return {
				start: setColorAlpha("#000", 0.5),
				end: setColorAlpha("#333", 0.5),
				side: CLOUD_NIGTH_COLOR.side
			};
		}
	},
	// 画一个小圆点
	dotin(dot, c = "#f00", context) {
		const ctx = this.ctx;
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
	// 创建多个云朵
	async createClouds(count) {
		for (let i = 0; i < count; i++) {
			await this.createSingleCloud({
				total: count,
				now: i
			});
		}
		this.renderClouds();
	},
	// 创建单个云朵
	createSingleCloud({ now, total }) {
		total = total < 10 ? 10 : 10; // 将屏幕分为10份
		const limit = this.WIDTH / total;
		const $x = limit * now + random(-limit, limit); // 云朵画布左边距
		let height = random(300, 800); // 随机云朵画布高度
		let width = random(400, 1900); // 随机云朵画布宽度

		let x = $x - width / 2; // 云朵画布中心位置
		let $y = random(0, this.HEIGHT); // 云朵画布上边距
		let y = $y - height / 4; // 云朵中心位置
		let baseRate = 1 - $y / this.HEIGHT; // 越接近底部越小
		baseRate = baseRate < 0.25 ? 0.25 : baseRate; // 最小.25

		height = height * baseRate; // 重设云朵画布大小
		width = width * baseRate; // 重设云朵画布大小
		x = x * baseRate; // 重设云朵画布左边距；上边距不变

		const cloud = this.createRdCloud({
			x,
			y,
			width,
			height
		});
		return Promise.resolve(cloud);
	},
	// 随机点阵分布
	randomDistribution({ width, height, count = 500 }) {
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
				tp: "face"
			});
			face.push({
				x: x1 + random(-ofw, ofw) + ofw,
				y: y1 + random(-ofh, 0) + ofh,
				tp: "face"
			});

			back.push({
				x: x2 + random(-ofw, ofw) + ofw,
				y: y2 + random(0, ofh * 2) + ofh,
				tp: "back"
			});
			back.push({
				x: x3 + random(-ofw, ofw) + ofw,
				y: y3 + random(0, ofh * 2) + ofh,
				tp: "back"
			});
		}
		face.sort((a, b) => b.y - a.y);
		back.sort((a, b) => b.y - a.y);
		return { dots: [...back, ...face], cx, cy };
	},
	// 获得云朵多个点位分布
	createRdCloud(options) {
		const { x, y, width, height } = options;
		const _id = randomId(`cloud_`);

		const { canvas: c, context: cloudCtx } = this.createCanvas({
			x,
			y,
			width: width + (width / 5) * 2,
			height: height + height / 5
		});
		c.style.filter = "blur(5px)";
		const {
			dots: allDots,
			cx: cloudCX,
			cy: cloudCY
		} = this.randomDistribution({
			width,
			height,
			count: Math.ceil((width + height) / 2)
		});
		let cloudSands = [];

		const cy = height / 2;
		const widthOffset = width / 20;
		let rRate = 0.5;
		let rRateV = (1 - rRate) / allDots.length;
		let cloudYRate = 1 - (cloudCY + y) / this.HEIGHT;
		cloudYRate = cloudYRate > 1 ? 1 : cloudYRate < 0 ? 0 : cloudYRate;
		let colors = this.getTimeFrameCloudsColors();

		// 获得云朵中心与，屏幕中心的夹角
		let deg = getAngle(
			{ x: x + width / 2, y: y + height / 2 },
			{ x: WIDTH / 2, y: HEIGHT / 2 }
		);
		// 1 径向 2 横轴
		let moveType = 1;
		if (deg > 90) {
			// （只会在 一二象限）如果大于90度，则肯定在二象限，取负角度
			deg = deg - 360;
		}
		// deg = deg / random(5, 10); // 制造云朵围绕地球中心的偏转感觉
		deg = deg / 7; // 制造云朵围绕地球中心的偏转
		// const rotate = deg * (Math.PI / 180);
		if (MTF_DT.includes(this.HOURS) || MTF_NT.includes(this.HOURS)) {
			deg = 0;
			moveType = 2;
		}
		// console.log(this.HOURS);
		// console.log(MTF_NT.includes(this.HOURS));
		// console.log(deg);
		for (let i = 0; i < allDots.length; i++) {
			const { x, y, tp } = allDots[i];

			let _rRate = rRate + rRateV * i;
			let r = ((width / 10 + random(-widthOffset, widthOffset)) / 2) * _rRate;
			r = r < 20 ? 20 : r;
			let _y = (y - cy) * _rRate + cy;
			let _x = x;
			const f_colors = {
				start: colors.start,
				end: colors.end,
				side: "transparent"
			};
			let cloud = this.calcCloud(
				{ x, _x, y, _y, r, colors: f_colors, height, cloudYRate },
				cloudCtx
			);
			cloudSands.push(cloud);
		}

		const cloudItem = {
			content: c,
			x,
			y,
			colors,
			height,
			moveType,
			cloudYRate,
			ctx: cloudCtx,
			width,
			cloudSands,
			height,
			deg,
			id: _id,
			widthOffset
		};
		this.clouds.set(_id, cloudItem);
		return cloudItem;
	},
	// 计算云朵点位颜色
	calcCloud({ x, _x, y, _y, r, colors, height, cloudYRate }, ctx) {
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

		const data = {
			x: _x,
			y: _y,
			r,
			colors: { side: sideMixColors, fill: fillMixColors },
			ctx
		};
		this.drawCloud(data);
		return data;
	},
	// 绘制云朵
	drawCloud({ x, y, r, colors, ctx }) {
		// ctx.beginPath();
		// ctx.save();
		// ctx.arc(x, y, r, 0, Math.PI * 2);
		// ctx.fillStyle = colors.fill;
		// ctx.fill();
		// ctx.strokeStyle = colors.side;
		// ctx.stroke();
		// ctx.restore();
		let deg = random(0, 360) * (Math.PI / 180);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(deg);
		ctx.translate(-x, -y);
		ctx.drawImage(IMAGE, x - r, y - r, 2 * r, 2 * r);
		ctx.restore();
	},
	// 渲染云朵
	renderClouds() {
		const skyCtx = this.ctx;
		let itema = 0.1 / this.clouds.length;
		this.clouds.forEach((cloud, i) => {
			const { x: _x, y: _y, deg, content } = cloud;

			skyCtx.save();
			const cx = cloud.x + cloud.content.width / 2;
			const cy = cloud.y + cloud.content.height / 2;
			const rotate = (deg * Math.PI) / 180;
			skyCtx.translate(cx, cy);
			skyCtx.rotate(rotate);
			skyCtx.translate(-cx, -cy);
			skyCtx.drawImage(content, _x, _y, content.width, content.height);
			skyCtx.restore();
			skyCtx.save();

			// skyCtx.globalAlpha = itema;
			// skyCtx.fillRect(0, 0, skyCtx.canvas.width, skyCtx.canvas.height);
			skyCtx.restore();
		});
	},
	moveCloud() {},
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
	setHOURS(hours) {}
};

Sky.prototype.constructor = Sky;
for (let key in FUNCTIONS) {
	Sky.prototype[key] = FUNCTIONS[key];
}
