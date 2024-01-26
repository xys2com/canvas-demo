function derivative(fn, x, dx) {
	return (fn(x + dx) - fn(x - dx)) / (2 * dx);
}
const testFn = (x) => x * x * x;
let val = derivative(testFn, 3, Math.pow(10, -10));
console.log(val);
