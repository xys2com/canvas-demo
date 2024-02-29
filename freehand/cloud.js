class Cloud extends HandDraw {
	constructor(options) {
		super(options);
		this.Clouds = new Map();
		this.defaultColors = {
			start: ""
		};
	}
}
// 菱形点阵分布
function latticeRandom({ width, height, count = 500 }) {
	const offsetY = height / 6;
	const offsetX = width / 6;
	const CX = width / 2;
	const CY = height / 2;
	const CX9 = CX * 0.9;
	const CY9 = CY * 0.8;
	let lattice = [];
	for (let i = 0; i < count; i++) {
		// 越靠近x中部出现的概率越大
		// x .9 是绘制圆形的不超出画布
		const xRate = Math.pow(Math.random(), 2) * CX9;
		const x = CX + xRate * [-1, 1][random(0, 1)];
		// const x = random(-50, width + 50);
		const _xr = (x / width) * 180;

		// 越接近x轴 上下波总范围越小
		// 0.8 次方
		const yFluctuate = Math.pow(1 - Math.abs(x - CX) / CX, 0.8);

		// 取 0 - π  宽度 0 - WIDTH
		const ymax =
			Math.sin((_xr * Math.PI) / 180) * CY9 * yFluctuate +
			CY +
			random(-offsetY, offsetY);

		const ymin = height - ymax + random(-offsetY, offsetY) * 2;
		const y = random(ymin, ymax);
		const _x = x; //+ random(-offsetX, offsetX);
		const _y = y;
		lattice.push({ x: _x, y: _y });
	}
	lattice = lattice.sort((a, b) => b.y - a.y);
	return lattice;
}

function createCloud(options) {
	const { x, y, size, colors = {} } = options;
	const width = size;
	const height = width * (random(400, 700) / 1000);
	console.log(height);
	const { canvas: c, context: ctx } = this.createCanvas({
		x,
		y,
		width,
		height
	});
	// const cx = width / 2;
	const cy = height / 2;
	// const S_COLOR = new Color(colors.start);
	const E_COLOR = new Color(colors.end);
	console.log(E_COLOR);
	const lattice = latticeRandom({ width, height, count: 400 });
	const sizeOffset = width / 20;
	let rRate = 0.5;
	let rRateV = (1 - 0.5) / lattice.length;
	lattice.map(({ x, y }) => {
		const r = (width / 10 + random(-sizeOffset, sizeOffset)) / 2;
		let yrate = y / height;
		yrate = yrate < 0 ? 0 : yrate;
		console.log(yrate);
		const fillMixColors = E_COLOR.mixinColors(colors.start, yrate);
		const sideMixColors = E_COLOR.mixinColors("#ff0", yrate);
		console.log(sideMixColors);
		// 先绘制的圆r小 满足近大远小
		rRate += rRateV;
		const data = {
			x,
			y: (y - cy) * rRate + cy, //
			r: r * rRate, //
			double: false,
			operability: false,
			fillType: "fill",
			//sideMixColors
			colors: { side: sideMixColors, line: "transparent", fill: fillMixColors }
		};
		this.createCircle(data, ctx);
	});
	return c;
}
function moveCloud(cloud, x, y) {}
Cloud.prototype = {
	...HandDraw.prototype
};
Cloud.prototype.createCloud = createCloud;
Cloud.prototype.moveCloud = moveCloud;
