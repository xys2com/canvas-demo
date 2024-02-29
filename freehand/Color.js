class Color {
	constructor(c) {
		this.COLOR = c;
		this.type = "";
		this.R = 255;
		this.G = 255;
		this.B = 255;
		this.A = 1;
		this.init();
	}
	init() {
		let c = this.COLOR;
		this.type = this.getColorType(c);
		let rgba = this.getRGBA();
		const { r, g, b, a } = rgba;
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = a || 1;
	}
	getColorType(color) {
		let _color = color || this.COLOR;
		_color = _color.toLocaleLowerCase();
		return _color.includes("#")
			? "HEX"
			: _color.includes("rgb")
			? "RGB"
			: _color.includes("hsl")
			? "HSL"
			: "";
	}
	getRGBA() {
		switch (this.type) {
			case "HEX":
				return this.hexToRgb(this.COLOR, "RGB");
			case "RGB":
				return this.rgbToHex(this.COLOR, "RGB");
			case "HSL":
				return this.hslToHex(this.COLOR, "RGB");
		}
	}
	getHex() {
		return this.type == "RGB"
			? this.rgbToHex()
			: this.type == "HSL"
			? this.hslToHex()
			: this.COLOR;
	}
	rgbToHex(p, type = "String") {
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
				i < 3 ? (+n).toString(16) : Math.ceil(+n * 256).toString(16);
			hex += _hex_item;
		});
		return hex;
	}
	hslToHex(p, type = "String") {
		let h, s, l;
		if (Array.isArray(p)) {
			[h, s, l] = p;
		} else {
			const str = p;
			const start = p.indexOf("(") + 1;
			const end = p.indexOf(")");
			const arr = str.substring(start, end).split(",");
			h = +arr[0].trim() / 360;
			[s, l] = arr
				.filter((e, i) => i)
				.map((s) => +s.trim().split("%")[0] / 100);
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

			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		if (type !== "String") {
			return {
				r,
				g,
				b,
				a: 1
			};
		}

		// 将RGB值转换为16进制
		r = Math.round(r * 255).toString(16);
		g = Math.round(g * 255).toString(16);
		b = Math.round(b * 255).toString(16);

		// 确保每个颜色都有两位十六进制数（如果需要的话，前面补0）
		r = r.length === 1 ? "0" + r : r;
		g = g.length === 1 ? "0" + g : g;
		b = b.length === 1 ? "0" + b : b;

		return "#" + r + g + b;
	}
	hexToHsl(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		let r = parseInt(result[1], 16);
		let g = parseInt(result[2], 16);
		let b = parseInt(result[3], 16);
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

		return "hsl(" + h + ", " + s + "%, " + l + "%)";
	}
	hexToRgb(hex, type = "String") {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		let r = parseInt(result[1], 16);
		let g = parseInt(result[2], 16);
		let b = parseInt(result[3], 16);
		let a = result[4] ? parseInt(result[4], 16) / 255 : "1";
		return type == "String"
			? `rgba(${r}, ${g}, ${b}, ${a})`
			: {
					r,
					g,
					b,
					a
			  };
	}
	// 当前色 颜色1 c1；c2 颜色2；v 颜色1 在混合中占的比重 0 - 1
	mixinHEX(c2, rate = 0.5) {
		let c1 = this.getHex();
		let c1s = c1.split("#")[1];
		let c2s = c2.split("#")[1];
		if (c1s.length == 3) {
			c1s = `${c1s[0]}${c1s[0]}${c1s[1]}${c1s[1]}${c1s[2]}${c1s[2]}`;
		}
		if (c2s.length == 3) {
			c2s = `${c2s[0]}${c2s[0]}${c2s[1]}${c2s[1]}${c2s[2]}${c2s[2]}`;
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

		r = r < 10 ? `0${r}` : r;
		g = g < 10 ? `0${g}` : g;
		b = b < 10 ? `0${b}` : b;
		a = a < 10 ? `0${a}` : a;
		return `#${r}${g}${b}${a}`;
	}
	mixinColors(c2, v = 0.5) {
		const t2 = this.getColorType(c2);
		let _c2 = c2;
		if (t2 == "RGB") _c2 = rgbToHex(c2);
		if (t2 == "HSL") _c2 = hslToHex(c2);
		return this.mixinHEX(_c2, v);
	}
}
