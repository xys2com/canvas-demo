// 点距
const distance = (d1, d2) =>
	Math.sqrt((d2.x - d1.x) * (d2.x - d1.x) + (d2.y - d1.y) * (d2.y - d1.y));

// 斜率
const slope = (x1, y1, x2, y2) => (y2 - y1) / (x2 - x1);

// min - max 的随机数
const random = function (min, max) {
	if ((arguments.length < 2 && ((max = min), (min = 0)), min > max)) {
		var a = max;
		(max = min), (min = a);
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 计算距离 点与直线一般式距离
// xy 点位置，直线：Ax + By + C = 0
function distanceToLine(x, y, A, B, C) {
	var numerator = Math.abs(A * x + B * y + C);
	var denominator = Math.sqrt(A * A + B * B);
	var distance = numerator / denominator;
	return distance;
}
// 根据角度 取圆的切点
function getPointOnCircle(deg, circle) {
	var rad = deg * (Math.PI / 180);
	var x = circle.x + circle.r * Math.cos(rad);
	var y = circle.y + circle.r * Math.sin(rad);
	return { x, y };
}

// 三种计算线段交点的方法 - 1
function calculateIntersection1(a, b, c, d) {
	/** 1 解线性方程组, 求线段交点. **/
	// 如果分母为0 则平行或共线, 不相交
	var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
	if (denominator == 0) {
		return false;
	}

	// 线段所在直线的交点坐标 (x , y)
	var x =
		((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
			(b.y - a.y) * (d.x - c.x) * a.x -
			(d.y - c.y) * (b.x - a.x) * c.x) /
		denominator;
	var y =
		-(
			(b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
			(b.x - a.x) * (d.y - c.y) * a.y -
			(d.x - c.x) * (b.y - a.y) * c.y
		) / denominator;

	/** 2 判断交点是否在两条线段上 **/
	if (
		// 交点在线段1上
		(x - a.x) * (x - b.x) <= 0 &&
		(y - a.y) * (y - b.y) <= 0 &&
		// 且交点也在线段2上
		(x - c.x) * (x - d.x) <= 0 &&
		(y - c.y) * (y - d.y) <= 0
	) {
		// 返回交点p
		return {
			x: x,
			y: y
		};
	}
	//否则不相交
	return false;
}
// 三种计算线段交点的方法 - 2
function calculateIntersection2(a, b, c, d) {
	//线段ab的法线N1
	var nx1 = b.y - a.y,
		ny1 = a.x - b.x;

	//线段cd的法线N2
	var nx2 = d.y - c.y,
		ny2 = c.x - d.x;

	//两条法线做叉乘, 如果结果为0, 说明线段ab和线段cd平行或共线,不相交
	var denominator = nx1 * ny2 - ny1 * nx2;
	if (denominator == 0) {
		return false;
	}

	//在法线N2上的投影
	var distC_N2 = nx2 * c.x + ny2 * c.y;
	var distA_N2 = nx2 * a.x + ny2 * a.y - distC_N2;
	var distB_N2 = nx2 * b.x + ny2 * b.y - distC_N2;

	// 点a投影和点b投影在点c投影同侧 (对点在线段上的情况,本例当作不相交处理);
	if (distA_N2 * distB_N2 >= 0) {
		return false;
	}

	//
	//判断点c点d 和线段ab的关系, 原理同上
	//
	//在法线N1上的投影
	var distA_N1 = nx1 * a.x + ny1 * a.y;
	var distC_N1 = nx1 * c.x + ny1 * c.y - distA_N1;
	var distD_N1 = nx1 * d.x + ny1 * d.y - distA_N1;
	if (distC_N1 * distD_N1 >= 0) {
		return false;
	}

	//计算交点坐标
	var fraction = distA_N2 / denominator;
	var dx = fraction * ny1,
		dy = -fraction * nx1;
	return { x: a.x + dx, y: a.y + dy };
}
// 三种计算线段交点的方法 - 3
function calculateIntersection3(a, b, c, d) {
	// 三角形abc 面积的2倍
	var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

	// 三角形abd 面积的2倍
	var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

	// 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
	if (area_abc * area_abd >= 0) {
		return false;
	}

	// 三角形cda 面积的2倍
	var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	// 三角形cdb 面积的2倍
	// 不需要再用公式计算面积,而是通过已知的三个面积加减得出.
	var area_cdb = area_cda + area_abc - area_abd;
	if (area_cda * area_cdb >= 0) {
		return false;
	}

	//计算交点坐标
	var t = area_cda / (area_abd - area_abc);
	var dx = t * (b.x - a.x),
		dy = t * (b.y - a.y);
	return { x: a.x + dx, y: a.y + dy };
}
// 检测某个点位是否在图形内部 只适用于多边形
const isPointInPolygon = (point, polygon, log) => {
	//下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
	//基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
	//在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

	var N = polygon.length;
	var boundOrVertex = true; // 如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
	var intersectCount = 0; // 与图形边界的交点个数
	var precision = 2e-10; // 浮点类型计算时候与0比较时候的容差
	var p1, p2; // 两个临近点
	var p = point; //测试点

	p1 = polygon[0];
	for (var i = 1; i <= N; ++i) {
		if (p.x == p1.x && p.y == p1.y) {
			return boundOrVertex;
		}

		p2 = polygon[i % N];
		if (p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)) {
			p1 = p2;
			continue;
		}

		if (p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)) {
			if (p.x <= Math.max(p1.x, p2.x)) {
				if (p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)) {
					return boundOrVertex;
				}

				if (p1.x == p2.x) {
					if (p1.x == p.x) {
						return boundOrVertex;
					} else {
						++intersectCount;
					}
				} else {
					var xinters = ((p.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
					if (Math.abs(p.x - xinters) < precision) {
						return boundOrVertex;
					}

					if (p.x < xinters) {
						++intersectCount;
					}
				}
			}
		} else {
			if (p.y == p2.y && p.x <= p2.x) {
				var p3 = polygon[(i + 1) % N];
				if (p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)) {
					++intersectCount;
				} else {
					intersectCount += 2;
				}
			}
		}
		p1 = p2;
	}

	if (intersectCount % 2 == 0) {
		//偶数在多边形外
		return false;
	} else {
		//奇数在多边形内
		return true;
	}
};
// 矩阵转换
function multiply(out, a, b) {
	var a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3];
	var a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];
	var a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];
	var a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];

	var b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
}
