function getColorType(c) {
	if (!c) return "transparent";
	c = c.toLocaleLowerCase();
	return c.includes("#")
		? "HEX"
		: c.includes("rgb")
		? "RGB"
		: c.includes("hsl")
		? "HSL"
		: "";
}

function getRGBA(c) {
	if (!c) return "transparent";
	const type = getColorType(c);
	switch (type) {
		case "HEX":
			return hexGetRGBA(c, "RGB");
		case "RGB":
			return rgbToHex(c, "RGB");
		case "HSL":
			return hslToHex(c, "RGB");
	}
}

function getHex(c) {
	if (!c) return "#000";
	const type = getColorType(c);
	return type == "RGB" ? rgbToHex(c) : type == "HSL" ? hslToHex(c) : c;
}
// 设置颜色透明度，
// 如果原先颜色 已经有透明度，则将之前透明度 * a
function setColorAlpha(c, _a = 1) {
	if (!c) return "#000";
	let { r, g, b, a } = getRGBA(c);
	a = +a < 0 ? 0 : +a > 255 ? 255 : a;
	let A = Math.ceil(_a * a);
	A = +A < 0 ? 0 : +A > 255 ? 255 : A;

	const type = getColorType(c);
	switch (type) {
		case "HEX":
			return getHex(`rgba(${r},${g},${b},${A})`);
		case "RGB":
			return `rgba(${r},${g},${b},${A})`;
		case "HSL":
			return hexToHsl(getHex(`rgba(${r},${g},${b},${A})`));
	}
}

function formatToHex(v) {
	if (!v) return "#000";
	let type = getColorType(v);
	if (type == "RGB") v = rgbToHex(v);
	if (type == "HSL") v = hslToHex(v);
	let hexv = v.split("#")[1];
	if (hexv.length == 3) {
		hexv = `${hexv[0]}${hexv[0]}${hexv[1]}${hexv[1]}${hexv[2]}${hexv[2]}`;
	}
	if (hexv.length == 4) {
		hexv = `${hexv[0]}${hexv[0]}${hexv[1]}${hexv[1]}${hexv[2]}${hexv[2]}${hexv[3]}${hexv[3]}`;
	}
	return `#${hexv}`;
}

function rgbToHex(p, type = "String") {
	if (!p) return "#000";
	const str = p;
	const start = p.indexOf("(") + 1;
	const end = p.indexOf(")");
	let arr = str.substring(start, end).split(",");
	if (type !== "String") {
		return {
			r: arr[0],
			g: arr[1],
			b: arr[2],
			a: arr[3] || 1
		};
	}
	let hex = "#";
	arr.map((n, i) => {
		let _hex_item =
			i < 4 ? (+n).toString(16) : Math.ceil(+n * 256).toString(16);
		_hex_item = prefixHex(_hex_item);
		hex += _hex_item;
	});
	return hex;
}

function hslToHex(p, type = "String") {
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
		r = Math.round(r * 255);
		g = Math.round(g * 255);
		b = Math.round(b * 255);
	}
	if (a && a < 1) a = Math.round(a * 255);
	if (type !== "String") {
		return {
			r,
			g,
			b,
			a
		};
	}
	// 将RGB值转换为16进制
	r = prefixHex(r.toString(16));
	g = prefixHex(g.toString(16));
	b = prefixHex(b.toString(16));
	a = prefixHex(a.toString(16));

	return "#" + r + g + b + a;
}
// 16 to hsl
function hexToHsl(v) {
	if (!v)
		return {
			value: "hsl(" + 0 + ", " + 0 + "%, " + 0 + "%)",
			h: 0,
			s: 0,
			l: 0
		};
	let hex = formatToHex(v);
	const reg =
		hex.length == "7"
			? /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
			: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
	let result = reg.exec(hex);

	let r = parseInt(result[1], 16);
	let g = parseInt(result[2], 16);
	let b = parseInt(result[3], 16);
	let a = result[4] ? parseInt(result[4], 16) / 256 : 1;
	(r /= 255), (g /= 255), (b /= 255);
	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	s = s * 100;
	s = Math.round(s);
	l = l * 100;
	l = Math.round(l);
	h = Math.round(360 * h);
	return {
		value: "hsl(" + h + ", " + s + "%, " + l + "%, " + a + ")",
		h,
		s,
		l,
		a
	};
}
function hexGetRGBA(hex) {
	if (!hex)
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	hex = formatToHex(hex);
	const reg =
		hex.length == "7"
			? /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
			: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
	let result = reg.exec(hex);
	const ap = result[4] || "ff";
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
		a: parseInt(ap, 16)
	};
}

// 当前色 颜色1 c1；c2 颜色2；v 颜色1 在混合中占的比重 0 - 1
function mixinHEX(c1, c2, rate = 0.5) {
	let c1s = c1.split("#")[1];
	let c2s = c2.split("#")[1];
	if (c1s.length == 3) {
		c1s = `${c1s[0]}${c1s[0]}${c1s[1]}${c1s[1]}${c1s[2]}${c1s[2]}`;
	}
	if (c1s.length == 4) {
		c1s = `${c1s[0]}${c1s[0]}${c1s[1]}${c1s[1]}${c1s[2]}${c1s[2]}${c1s[3]}${c1s[3]}`;
	}
	if (c2s.length == 3) {
		c2s = `${c2s[0]}${c2s[0]}${c2s[1]}${c2s[1]}${c2s[2]}${c2s[2]}`;
	}
	if (c2s.length == 4) {
		c2s = `${c2s[0]}${c2s[0]}${c2s[1]}${c2s[1]}${c2s[2]}${c2s[2]}${c2s[3]}${c2s[3]}`;
	}
	let _c1 = {
		r: parseInt(c1s.substring(0, 2), 16),
		g: parseInt(c1s.substring(2, 4), 16),
		b: parseInt(c1s.substring(4, 6), 16)
	};
	if (c1s.length == "6") {
		_c1.a = 255;
	} else if (c1s.length == "8") {
		_c1.a = parseInt(c1s.substring(6, 8), 16);
	}
	let _c2 = {
		r: parseInt(c2s.substring(0, 2), 16),
		g: parseInt(c2s.substring(2, 4), 16),
		b: parseInt(c2s.substring(4, 6), 16)
	};
	if (c2s.length == "6") {
		_c2.a = 255;
	} else if (c2s.length == "8") {
		_c2.a = parseInt(c2s.substring(6, 8), 16);
	}
	let r, g, b, a;
	let rate2 = 1 - rate;

	r = (Math.floor(_c1.r * rate) + Math.floor(_c2.r * rate2)).toString(16);
	g = (Math.floor(_c1.g * rate) + Math.floor(_c2.g * rate2)).toString(16);
	b = (Math.floor(_c1.b * rate) + Math.floor(_c2.b * rate2)).toString(16);
	a = (Math.floor(_c1.a * rate) + Math.floor(_c2.a * rate2)).toString(16);
	r = prefixHex(r);
	g = prefixHex(g);
	b = prefixHex(b);
	a = prefixHex(a);
	return `#${r}${g}${b}${a}`;
}

function prefixHex(item) {
	return +item < 10 || `${item}`.length == 1 ? `0${item}` : item;
}
// v 混合比例
function mixinColors(c1, c2, v = 0.5) {
	if (c1 == "transparent") return getHex(c1);

	const t1 = getColorType(c1);
	let _c1 = c1;
	if (t1 == "RGB") _c1 = rgbToHex(c1);
	if (t1 == "HSL") _c1 = hslToHex(c1);

	const t2 = getColorType(c2);
	let _c2 = c2;
	if (t2 == "RGB") _c2 = rgbToHex(c2);
	if (t2 == "HSL") _c2 = hslToHex(c2);

	return mixinHEX(_c1, _c2, v);
}
