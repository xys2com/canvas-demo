class Bottle {
	constructor(size) {
		this.size = size || 1;
		this.width = 100 * this.size;
		this.height = 100 * this.size;
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.ctx = this.canvas.getContext("2d");
		this.color = "#aaccfb";
		// 44 33 66
	}
	// 创建瓶子主体
	createBottle() {
		const ctx = this.ctx;
		// 顶部
		const top = () => {
			let x1 = ((100 - 44) / 2) * this.size;
			let x2 = (100 - (100 - 44) / 2) * this.size;
			let y1 = 0;
			let y2 = 3 * this.size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x1, y2);
			ctx.lineTo(x1, y1);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		};
		// 颈部
		const neck = () => {
			let x1 = ((100 - 32) / 2) * this.size;
			let x2 = (100 - (100 - 32) / 2) * this.size;
			let y1 = 4;
			let y2 = 38 * this.size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x1, y2);
			ctx.lineTo(x1, y1);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		};
		// 主体
		const subject = () => {
			let x = 50 * this.size;
			let y = (33 + 30) * this.size;
			let r = 30 * this.size;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		};
		top();
		neck();
		subject();
		this.highlight();
	}
	// 高光
	highlight() {
		const ctx = this.ctx;
		const { abs } = Math;
		let color = "#fff3";
		const h1 = () => {
			let x1 = 40 * this.size;
			let x2 = 45 * this.size;
			let y1 = 8 * this.size;
			let y2 = 30 * this.size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x1, y2);
			ctx.lineTo(x1, y1);
			ctx.fillStyle = color;
			ctx.closePath();
			ctx.beginPath();
			ctx.arc((x1 + x2) / 2, y1, (x2 - x1) / 2, 0, Math.PI, true);
			ctx.arc((x1 + x2) / 2, y2, (x2 - x1) / 2, Math.PI, Math.PI * 2, true);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		};
		const h2 = () => {
			let x1 = 40 * this.size;
			let y1 = 47 * this.size;
			let x2 = 33 * this.size;
			let y2 = 49 * this.size;
			let x3 = 40 * this.size;
			let y3 = 52 * this.size;
			let x4 = 32 * this.size;
			let y4 = 55 * this.size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(x1 + 2 * this.size, y1 + 2 * this.size, x3, y3);
			ctx.quadraticCurveTo(x3 - 3.5 * this.size, y4 + 2 * this.size, x4, y4);
			ctx.quadraticCurveTo(x2 - 4 * this.size, y4 - 2 * this.size, x2, y2);
			ctx.quadraticCurveTo(x2 + 3 * this.size, y2 - 3 * this.size, x1, y1);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		};
		const h3 = () => {
			let x1 = 70 * this.size;
			let y1 = 66 * this.size;
			let x2 = 57 * this.size;
			let y2 = 84 * this.size;
			let x3 = 73 * this.size;
			let y3 = 69 * this.size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(
				x2 + ((x1 - x2) / 3) * 2,
				y2 - (y2 - y1) / 3,
				x2,
				y2
			);
			ctx.quadraticCurveTo(
				x2 + ((x3 - x2) / 3) * 2,
				y2 - (y3 - y1) / 3,
				x3,
				y3
			);
			ctx.quadraticCurveTo(x1 + (x3 - x1), y1 - 2 * this.size, x1, y1);
			ctx.fillStyle = color;
			ctx.fill();
		};
		h1();
		h2();
		h3();
	}
}
