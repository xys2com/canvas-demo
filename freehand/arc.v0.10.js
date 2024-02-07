// 计算距离 点与直线一般式距离
// xy 点位置，直线：Ax + By + C = 0
const distanceToLine = (x, y, A, B, C) => {
	var numerator = Math.abs(A * x + B * y + C);
	var denominator = Math.sqrt(A * A + B * B);
	var distance = numerator / denominator;
	return distance;
};
// 计算交点（该方法只返回两个交点的；使用前确保直线与圆存在两个交点）
const getArcLineCrossDots = (dot1, dot2, arc) => {
	let lineslope = slope(dot1.x, dot1.y, dot2.x, dot2.y);
	// 取截距
	let intercept = dot1.y - lineslope * dot1.x;
	// 如果是垂线
	const isVerticalLine = Math.abs(intercept) == Infinity;
	// 如果是垂线 distance 取dot1或者dot2的x - 圆心x  的绝对值
	const distance = isVerticalLine
		? Math.abs(dot1.x - arc.x)
		: distanceToLine(arc.x, arc.y, lineslope, -1, intercept);
	if (distance < arc.r) {
		// 如果是垂线 x 取dot1或者dot2的x，否则根据 斜率 截距
		let x = isVerticalLine
			? dot1.x
			: getX(arc.x, arc.y, intercept, lineslope, arc.r);
		// 如果是垂线 y 通过圆公式计算，否则用直线公式计算
		let y = isVerticalLine
			? Math.sqrt(arc.r * arc.r - Math.pow(x - arc.x, 2)) + arc.y
			: lineslope * x + intercept;
		// 圆心与x,y的差值，必定是另一点的与圆心的差值
		// x0 - (x1 - x0) = x2
		// y0 - (y1 - y0) = y2
		let vx = x - arc.x;
		let vy = y - arc.y;

		return [
			{ x, y },
			{ x: arc.x - vx, y: arc.y - vy }
		];
	}
};
// 根据角度 取圆的切点
const getPointOnCircle = (deg, arc) => {
	var rad = deg * (Math.PI / 180);
	var x = arc.x + arc.r * Math.cos(rad);
	var y = arc.y + arc.r * Math.sin(rad);
	return { x, y };
};
// 获取圆的边界
const getSides = (arc) => {
	const x = arc.x - arc.r;
	const y = arc.y - arc.r;
	const w = arc.x + arc.r - x;
	const h = arc.y + arc.r - y;
	return [
		{
			p1: { x, y },
			p2: { x: x + w, y }
		},
		{
			p1: { x: x + w, y },
			p2: { x: x + w, y: y + h }
		},
		{
			p1: { x: x + w, y: y + h },
			p2: { x, y: y + h }
		},
		{
			p1: { x, y: y + h },
			p2: { x, y }
		}
	];
};

// 获取切线
const getTangentXY = (deg, arc) => {
	// 切点
	const p = getPointOnCircle(deg, arc);
	const { max, min } = Math;
	// 圆心到切点线段的垂线就是切线
	let lineslope = -1 / slope(p.x, p.y, arc.x, arc.y);

	// 取截距
	let intercept = p.y - lineslope * p.x;
	let dots = [];

	// 是否是垂直线
	const isVerticalLine = Math.abs(lineslope) == Infinity;
	// 是否平行线
	// const isParallelLine = lineslope == 0;

	const Sides = getSides(arc);
	// 判断当前deg 切线 与那几条边相交
	Sides.map((line) => {
		const { x: x1, y: y1 } = line.p1;
		const { x: x2, y: y2 } = line.p2;
		const ymax = max(y1, y2);
		const ymin = min(y1, y2);
		const xmax = max(x1, x2);
		const xmin = min(x1, x2);
		let linedir = "";
		if (x1 == x2) {
			linedir = y2 > y1 ? "right" : "left";
		}
		if (y1 == y2) {
			linedir = x2 > x1 ? "top" : "bottom";
		}

		if (linedir == "top") {
			const y = ymin;
			const x = isVerticalLine ? p.x : (y - intercept) / lineslope;
			if (x >= xmin && x <= xmax) {
				const point = { x, y };
				dots.push({
					point,
					intercept,
					lineslope,
					tangency: p
				});
			}
		}

		if (linedir == "bottom") {
			const y = ymax;
			const x = isVerticalLine ? p.x : (y - intercept) / lineslope;
			if (x >= xmin && x <= xmax) {
				const point = { x, y };
				dots.push({
					point,
					intercept,
					lineslope,
					tangency: p
				});
			}
		}

		if (linedir == "left") {
			const x = xmin;
			const y = lineslope * x + intercept;

			if (y >= ymin && y <= ymax) {
				const point = { x, y };
				dots.push({
					point,
					intercept,
					lineslope,
					tangency: p
				});
			}
		}

		if (linedir == "right") {
			const x = xmax;
			const y = lineslope * x + intercept;
			if (y >= ymin && y <= ymax) {
				const point = { x, y };
				dots.push({
					point,
					intercept,
					lineslope,
					tangency: p
				});
			}
		}
	});
	return dots;
};
// 计算某个角度的切点 切线 并做切线到圆心的平行线
function getTangentLine(deg, arc) {
	let [{ point: dot1 }, { point: dot2 }] = getTangentXY(deg, arc);
	const stepcount = (arc.r * 2) / stepDep;

	for (let i = 0; i < stepcount; i++) {
		let dx = (stepDep / 2 + stepDep * i) * Math.cos((deg * Math.PI) / 180);
		let dy = (stepDep / 2 + stepDep * i) * Math.sin((deg * Math.PI) / 180);
		const x1 = dot1.x - dx,
			y1 = dot1.y - dy,
			x2 = dot2.x - dx,
			y2 = dot2.y - dy;
		linein({ x: x1, y: y1 }, { x: x2, y: y2 }, "#f0f");
		let cross = getArcLineCrossDots({ x: x1, y: y1 }, { x: x2, y: y2 }, arc);
	}
}
class HandArc {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.crosslines = [];
		this.fillStepDep = 5;
		this.fillDeg = 60;
	}
}
HandArc.prototype.init = function () {};
