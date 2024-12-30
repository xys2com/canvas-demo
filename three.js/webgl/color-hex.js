const { ceil, round } = Math;
function preHex(item) {
	return +item < 10 || `${item}`.length == 1 ? `0${item}` : item;
}
function rgbToHex(p) {
	if (!p) return "#000";
	const str = p;
	const start = p.indexOf("(") + 1;
	const end = p.indexOf(")");
	let arr = str.substring(start, end).split(",");
	let hex = "#";
	arr.map((n, i) => {
		let _hex_item = i < 4 ? (+n).toString(16) : ceil(+n * 256).toString(16);
		_hex_item = preHex(_hex_item);
		hex += _hex_item;
	});
	return hex;
}

function hslToHex(p) {
	if (!p) return "#000";
	let h,
		s,
		l,
		a = 1;
	if (Array.isArray(p)) {
		[h, s, l, a] = p;
	} else {
		const str = p;
		const start = p.indexOf("(") + 1;
		const end = p.indexOf(")");
		const arr = str.substring(start, end).split(",");
		h = +arr[0].trim() / 360;
		[s, l, a] = arr
			.filter((e, i) => i)
			.map((s) => +s.trim().split("%")[0] / 100);
		if (a) a *= 100;
		else a = 1;
	}
	let r, g, b;

	if (s === 0) {
		r = g = b = l * 255; // HSL中的L就是RGB中的灰度值
	} else {
		let hue2rgb = function (p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;

		r = +hue2rgb(p, q, h + 1 / 3).toFixed(4);
		g = +hue2rgb(p, q, h).toFixed(4);
		b = +hue2rgb(p, q, h - 1 / 3).toFixed(4);
	}
	// 三个都小于1 则是百分比 hsl
	if (r <= 1 && g <= 1 && b <= 1) {
		r = round(r * 255);
		g = round(g * 255);
		b = round(b * 255);
	}
	if (a && a < 1) a = round(a * 255);
	// 将RGB值转换为16进制
	r = preHex(r.toString(16));
	g = preHex(g.toString(16));
	b = preHex(b.toString(16));
	a = preHex(a.toString(16));

	return "#" + r + g + b + a;
}

// 格式化16进制色值
function formatHex(v) {
	let c = v.split("#")[1];
	if (c.length == 3) {
		c = `${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
	}
	if (c.length == 4) {
		c = `${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
	}

	let _c = {
		r: parseInt(c.substring(0, 2), 16),
		g: parseInt(c.substring(2, 4), 16),
		b: parseInt(c.substring(4, 6), 16)
	};
	if (c.length == "6") {
		_c.a = 255;
	} else if (c.length == "8") {
		_c.a = parseInt(c.substring(6, 8), 16);
	}
	return _c;
}
// 整型数字混合输出16进制
function mixinFormatHex(v1, v2, r) {
	let _v1 = v1 * r;
	let _v2 = v2 * (1 - r);
	return round(_v1 + _v2).toString(16);
}
// 当前色 颜色1 c1；c2 颜色2；v 颜色1 在混合中占的比重 0 - 1
function HEXMixin(c1, c2, rate = 0.5) {
	let _c1 = formatHex(c1);
	let _c2 = formatHex(c2);

	let r, g, b, a;

	r = preHex(mixinFormatHex(_c1.r, _c2.r, rate));
	g = preHex(mixinFormatHex(_c1.g, _c2.g, rate));
	b = preHex(mixinFormatHex(_c1.b, _c2.b, rate));
	a = preHex(mixinFormatHex(_c1.a, _c2.a, rate));
	return `#${r}${g}${b}${a}`;
}
function setHEXAlpha(c, alpha) {
	if (!c) return "#000";
	let { r, g, b, a } = formatHex(c);
	a = +a < 0 ? 0 : +a > 255 ? 255 : a;

	let A = Math.ceil(alpha * a);
	A = +A < 0 ? 0 : +A > 255 ? 255 : A;
	return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${A.toString(
		16
	)}`;
}
let c = HEXMixin("#888", "#111");
