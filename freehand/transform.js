// 矩阵乘法
function multiply( a, b, out = []) {
  let a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  let a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  let a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  let a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  let b0 = b[0],
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

// 点位与图形包含关系判断——射线法
function inPolygon(point, polygon) {
	if (!polygon || !point) return false;
	let N = polygon.length;
	let boundOrVertex = true; // 如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
	let intersectCount = 0; // 与边界的交点数
	let precision = 2e-10; // 浮点类型计算时候与0比较时候的容差
	let p1, p2; // 临近点
	let p = point; // 测试点

	p1 = polygon[0];
	for (let i = 1; i <= N; ++i) {
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
					let xinters = ((p.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
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
				let p3 = polygon[(i + 1) % N];
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
}