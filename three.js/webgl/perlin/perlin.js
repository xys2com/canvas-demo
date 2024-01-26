// 线性插值
function lerp(a, b, t) {
	return a + t * (b - a);
}
function mix(x, y, a) {
	return x * (1 - a) + y * a;
}
// 取得两点间平滑的过度值 t∈[0.0,1.0]
function smoothSpline1(t) {
	return (3 * t - 2 * t * t) * t;
}

// 取得两点间平滑的过度值 t∈[0.0,1.0]
function smoothSpline2(t) {
	return ((6 * t - 15) * t + 10) * Math.pow(t, 3);
}

// 随机数
function random(min, max) {
	if ((arguments.length < 2 && ((max = min), (min = 0)), min > max)) {
		var a = max;
		(max = min), (min = a);
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//  线性插值 vr 点位在 v1 v2 中的比例,  xr∈[0.0,1.0]
function lineinsert(v1, v2, vr) {
	return v1 + vr * (v2 - v1);
}

//  线性插值 vr 点位在 v1 v2 中的比例,  xr∈[0.0,1.0]
function lineinsertSmoothv1(v1, v2, vr) {
	return v1 + smoothSpline1(vr) * (v2 - v1);
}

//  线性插值 vr 点位在 v1 v2 中的比例,  xr∈[0.0,1.0]
function lineinsertSmoothv2(v1, v2, vr) {
	return v1 + smoothSpline2(vr) * (v2 - v1);
}
