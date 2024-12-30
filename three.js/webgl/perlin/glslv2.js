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
// 经验梯度值
const GRADS_VAR = [
	{ x: 127.1, y: 311.7 },
	{ x: 269.5, y: 183.3 }
];

// 随机的梯度值
const RANDOM_GRADS_VAR = [
	{
		x: random(GRADS_VAR[0].x / 2, GRADS_VAR[0].x * 1.5),
		y: random(GRADS_VAR[0].y / 2, GRADS_VAR[0].x * 1.5)
	},
	{
		x: random(GRADS_VAR[1].x / 2, GRADS_VAR[1].x * 1.5),
		y: random(GRADS_VAR[1].y / 2, GRADS_VAR[1].x * 1.5)
	}
];
// 二维向量
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
// 常用数学方法计算向量
const FUNS = ["sin", "floor", "sqrt", "cos", "abs"];
// 加减乘除计算向量 & 其他
const ufunc = {
	add: function (v) {
		return new Vec2({
			x: this.x + v,
			y: this.y + v
		});
	},
	sub: function (v) {
		return new Vec2({
			x: this.x - v,
			y: this.y - v
		});
	},
	mul: function (v) {
		return new Vec2({
			x: this.x * v,
			y: this.y * v
		});
	},
	div: function (v) {
		return new Vec2({
			x: this.x / v,
			y: this.y / v
		});
	},
	// 其他
	//
	fract: function () {
		return new Vec2({
			x: fract(this.x),
			y: fract(this.y)
		});
	},
	fract2: function () {
		return new Vec2({
			x: this.x % 1,
			y: this.y % 1
		});
	},
	smooth: function () {
		return new Vec2({
			x: smooth(this.x),
			y: smooth(this.y)
		});
	},
	smooth2: function () {
		return new Vec2({
			x: smooth2(this.x),
			y: smooth2(this.y)
		});
	}
};

// 获得点位梯度向量
Vec2.prototype.grads = function () {
	let gv = new Vec2(RANDOM_GRADS_VAR[0]);
	let gv2 = new Vec2(RANDOM_GRADS_VAR[1]);
	let _v = new Vec2({
		x: dot(this, gv),
		y: dot(this, gv2)
	});
	return new Vec2({
		x: -1.0 + 2.0 * fract(sin(_v.x) * 43758.5453123),
		y: -1.0 + 2.0 * fract(sin(_v.y) * 43758.5453123)
	});
};

// 向量
FUNS.map((f) => {
	Vec2.prototype[f] = function () {
		return new Vec2({
			x: Math[f](this.x),
			y: Math[f](this.y)
		});
	};
});
for (let k in ufunc) {
	Vec2.prototype[k] = ufunc[k];
}

const OCTAVES = 6;
function noise_perlin(uv, size) {
	uv = new Vec2(uv);
	let p = uv.floor();
	let isLastX = false;
	let isLastY = false;
	if (p.x == size - 1) {
		isLastX = true;
	}
	if (p.y == size - 1) {
		isLastY = true;
	}
	let p2 = new Vec2({
		x: isLastX ? 0 : p.x + 1,
		y: p.y
	});
	let p3 = new Vec2({
		x: isLastX ? 0 : p.x + 1.0,
		y: isLastY ? 0 : p.y + 1.0
	});
	let p4 = new Vec2({
		x: p.x,
		y: isLastY ? 0 : p.y + 1
	});

	uv = uv.fract2();
	let _uv = uv.smooth2();

	const v1 = dot(p.grads(), uv);
	const v2 = dot(p2.grads(), {
		x: uv.x - 1.0,
		y: uv.y
	});
	const v3 = dot(p3.grads(), {
		x: uv.x - 1.0,
		y: uv.y - 1.0
	});
	const v4 = dot(p4.grads(), {
		x: uv.x,
		y: uv.y - 1.0
	});

	return mix(mix(v1, v2, _uv.x), mix(v3, v4, 1 - _uv.x), _uv.y);
}
// 分形叠加
function fbm(uv, size) {
	uv = new Vec2(uv);
	let f = 0.0;
	let a = 1;
	for (let i = 0; i < OCTAVES; i++) {
		f += a * noise_perlin(uv, size, i);
		uv = uv.mul(2);
		a /= 2.0;
		size *= 2;
	}
	return f;
}
