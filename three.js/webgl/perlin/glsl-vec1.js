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
const OCTAVES = 6;
let gradsVec1 = function (d) {
	return -1.0 + 2.0 * fract(sin(RANDOM_GRADS_VAR[0].x * d) * 43758.5453123);
};
function noise_perlin(ux, size) {
	let p = floor(ux);
	let isLastX = false;
	if (p == size - 1) {
		isLastX = true;
	}
	let p2 = isLastX ? 0 : p + 1;

	ux = ux % 1;
	let _ux = smooth2(ux);
	const v1 = gradsVec1(p) * ux;
	const v2 = gradsVec1(p2) * (ux - 1);

	return mix(v1, v2, _ux);
}
// 分形叠加 频率
function fbm(
	ux,
	size,
	options = {
		o: OCTAVES, // 分型次数
		c: 2 // 叠加系数
	}
) {
	const oct = options.o;
	const coe = options.c;
	let f = 0.0; // 频率
	let a = 1; // 振幅
	for (let i = 0; i < oct; i++) {
		f += a * noise_perlin(ux, size);
		ux *= coe;
		a /= coe;
		size *= coe;
	}
	return f;
}
