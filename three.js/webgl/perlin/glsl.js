const { sin, floor, sqrt, cos, abs } = Math;

window.$ = (e) => {
	const els = document.querySelectorAll(e);
	return els.length === 1 ? els[0] : els;
};
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
// 点积
const dot = (d1, d2) => d1.x * d2.x + d1.y * d2.y;

// 混合
const mix = (a, b, c = 0.5) => a * (1 - c) + b * c;

const prefixHex = (n) => (+n < 10 || `${n}`.length == 1 ? `0${n}` : n);
// 取小数
const fract = (a) => a - floor(a);

function smooth(t) {
	return (3 * t - 2 * t * t) * t;
}
function smooth2(t) {
	return ((6 * t - 15) * t + 10) * Math.pow(t, 3);
}

function lerp(a, b, t) {
	t = smooth(t);
	return a + t * (b - a);
}

const GRADS_VAR = [
	{ x: random(63.5, 192.5), y: random(155.5, 467.5) },
	{ x: random(135.5, 405.5), y: random(92.5, 276) }
];

class Vec2 {
	constructor() {
		const args = arguments;
		if (args.length && args.length == 2) {
			this.x = args[0];
			this.y = args[1];
		}
		if (args.length && args.length == 1 && typeof args[0] == "number") {
			this.x = args[0];
			this.y = args[0];
		}
		if (args.length && args.length == 1 && typeof args[0] == "object") {
			this.x = args[0].x;
			this.y = args[0].y;
		}
	}
}
const funs = ["sin", "floor", "sqrt", "cos", "abs"];
// 向量
funs.map((f) => {
	Vec2.prototype[f] = function () {
		return {
			x: Math[f](this.x),
			y: Math[f](this.y)
		};
	};
});
Vec2.prototype.grads = function () {
	let gv = new Vec2(GRADS_VAR[0]);
	let gv2 = new Vec2(GRADS_VAR[1]);
	let _v = new Vec2({
		x: dot(this, gv),
		y: dot(this, gv2)
	});
	return {
		x: -1.0 + 2.0 * fract(sin(_v.x) * 43758.5453123),
		y: -1.0 + 2.0 * fract(sin(_v.y) * 43758.5453123)
	};
};

// 基于点位获得梯度向量
function grads(x, y) {
	let d = {
		x,
		y
	};
	let _d = {
		x: dot(d, { x: 127.1, y: 311.7 }),
		y: dot(d, { x: 269.5, y: 183.3 })
	};
	return {
		x: -1.0 + 2.0 * fract(sin(_d.x) * 43758.5453123),
		y: -1.0 + 2.0 * fract(sin(_d.y) * 43758.5453123)
	};
}
// grads2
function grads2(x, y) {
	let d = {
		x,
		y
	};
	let _d = {
		x: dot(d, GRADS_VAR[0]),
		y: dot(d, GRADS_VAR[1])
	};
	return {
		x: -1.0 + 2.0 * fract(sin(_d.x) * 43758.5453123),
		y: -1.0 + 2.0 * fract(sin(_d.y) * 43758.5453123)
	};
}
// R行 * C列 的晶格
function latticeInit(R, C) {
	let VECTOR = [];
	for (let rowi = 0; rowi < R; rowi++) {
		let ROW_VECTOR = [];
		for (let coli = 0; coli < C; coli++) {
			let lastX = coli + 1;
			let lastY = rowi + 1;
			if (coli == SIZE - 1) {
				lastX = 0;
			}
			if (rowi == SIZE - 1) {
				lastY = 0;
			}
			ROW_VECTOR.push([
				{
					x: coli,
					y: rowi,
					grads: [GRADS_VAR[0], GRADS_VAR[1]]
				},
				{
					x: lastX,
					y: rowi,
					grads: [GRADS_VAR[0], GRADS_VAR[1]]
				},
				{
					x: lastX,
					y: lastY,
					grads: [GRADS_VAR[0], GRADS_VAR[1]]
				},
				{
					x: coli,
					y: lastY,
					grads: [GRADS_VAR[0], GRADS_VAR[1]]
				}
			]);
		}
		VECTOR.push(ROW_VECTOR);
	}
	return VECTOR;
}

const OCTAVES = 3;

let count = 0;
function noise(pos, uv) {
	// const [p1, p2, p3, p4] = pos.map(
	// 	({ x, y, grads }) => grads2(x, y, grads[0], grads[1]) // 梯度计算
	// );
	const [p1, p2, p3, p4] = pos;
	uv = {
		x: uv.x % 1,
		y: uv.y % 1
	};
	count++;
	let _uv = {
		x: smooth2(uv.x), // 线性插值
		y: smooth2(uv.y) // 线性插值
	};
	const v1 = dot(p1, uv);
	const v2 = dot(p2, {
		x: uv.x - 1.0,
		y: uv.y
	});
	const v3 = dot(p3, {
		x: uv.x - 1.0,
		y: uv.y - 1.0
	});
	const v4 = dot(p4, {
		x: uv.x,
		y: uv.y - 1.0
	});

	return mix(mix(v1, v2, _uv.x), mix(v3, v4, 1 - _uv.x), _uv.y);
}
function noise2(uv) {
	const p = {
		x: floor(uv.x),
		y: floor(uv.y)
	};
	uv = {
		x: uv.x % 1,
		y: uv.y % 1
	};
	count++;
	let _uv = {
		x: smooth2(uv.x), // 线性插值
		y: smooth2(uv.y) // 线性插值
	};
	const v1 = dot(grads2(p), uv);
	const v2 = dot(
		grads2({
			x: p.x + 1,
			y: p.y
		}),
		{
			x: uv.x - 1.0,
			y: uv.y
		}
	);
	const v3 = dot(
		grads2({
			x: p.x + 1.0,
			y: p.y + 1.0
		}),
		{
			x: uv.x - 1.0,
			y: uv.y - 1.0
		}
	);
	const v4 = dot(
		grads2({
			x: p.x,
			y: p.y + 1
		}),
		{
			x: uv.x,
			y: uv.y - 1.0
		}
	);

	return mix(mix(v1, v2, _uv.x), mix(v3, v4, 1 - _uv.x), _uv.y);
}
// 分形叠加
function fbm(pos, uv) {
	let f = 0.0;
	let _pos = [...pos];
	let a = 1;
	for (let i = 0; i < OCTAVES; i++) {
		f += a * noise(_pos, uv);
		uv.x = uv.x * 2.0;
		uv.y = uv.y * 2.0;
		_pos = _pos.map(({ x, y, grads }) => ({ x: x * 2.0, y: y * 2.0, grads }));
		a /= 2.0;
	}
	return f;
}
