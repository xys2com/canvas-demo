const flt = parseFloat;
const { sin, floor, sqrt } = Math;

function perlin(x, y) {
	let _x = flt(x * 127.1 + y * 311.7);
	let _y = flt(x * 269.5 + y * 183.3);
	let sinx = flt(sin(_x) * 13758.5453123);
	let siny = flt(sin(_y) * 13758.5453123);
	_x = (sinx - floor(sinx)) * 2.0 - 1.0;
	_y = (siny - floor(siny)) * 2.0 - 1.0;
	let len = sqrt(_x * _x + _y * _y);
	_x /= len;
	_y /= len;
	return {
		x: _x,
		y: _y
	};
}

console.log(perlin(0.5, 0.5));
