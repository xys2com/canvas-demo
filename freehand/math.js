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
