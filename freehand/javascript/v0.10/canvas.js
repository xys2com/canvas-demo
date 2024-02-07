(() => {
	class Canvas {
		constructor(options) {
			const { x, y, width, height, el, zIndex, id, classname } = options;
			const canvas = document.createElement("canvas");

			const _id = id || randomId();
			const canvasId = `canvas_id_${_id}`;
			const contextId = `ctx_id_${_id}`;
			const ctx = canvas.getContext("2d");

			canvas.setAttribute("id", canvasId);
			if (classname) canvas.classList.add(classname);

			this.canvas = canvas;
			this.ctx = ctx;
			this.canvasSet = new Map();
			this.contextSet = new Map();
			this.canvasSet.set(canvasId, canvas);
			this.contextSet.set(contextId, ctx);

			canvas.style.position = "absolute";
			canvas.style.zIndex = zIndex;
			canvas.style.left = `${x}px`;
			canvas.style.top = `${y}px`;
			canvas.width = width;
			canvas.height = height;
			const _el = el ? $(el) : document.body;
			_el.appendChild(canvas);
		}
	}
	function createCanvas(options, callback) {
		const { x, y, width, height, zIndex, id, classname } = options;
		try {
			const canvas = document.createElement("canvas");
			const _id = id || randomId();
			const canvasId = `canvas_id_${_id}`;
			const contextId = `ctx_id_${_id}`;
			const ctx = canvas.getContext("2d");
			this.canvasSet.set(canvasId, canvas);
			this.contextSet.set(contextId, ctx);
			canvas.style.position = "absolute";
			canvas.style.zIndex = zIndex;
			canvas.style.left = `${x}px`;
			canvas.style.top = `${y}px`;
			canvas.width = width;
			canvas.height = height;
			if (classname) canvas.classList.add(classname);

			const context = canvas.getContext("2d");
			if (typeof callback === "function")
				callback(canvas, context, canvasId, contextId);
			return {
				canvas,
				context,
				canvasId,
				contextId
			};
		} catch (error) {
			throw error;
		}
	}
	function getCanvas(id) {
		return id ? this.canvasSet.get(id) : this.canvas;
	}
	function getContext(id) {
		return id ? this.contextSet.get(id) : this.ctx;
	}
	Canvas.prototype.createCanvas = createCanvas;
	Canvas.prototype.getCanvas = getCanvas;
	Canvas.prototype.getContext = getContext;

	let Hand = window.Hand || {};
	Hand.Canvas = Canvas;
	Hand.Canvas.prototype.constructor = Hand.Canvas;
})();
