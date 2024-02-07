const _requestAnimationFrame = (() => {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (t) {
			window.setTimeout(t, 1e3 / 60);
		}
	);
})();
const _cancelAnimationFrame = (() => {
	return (
		window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		function (cb) {
			window.clearTimeout(cb);
		}
	);
})();
class AnimationEventBus {
	constructor() {
		this.eventBus = [];
		this.run = false;
		this.anm = null;
		this.requestAnimationFrame = _requestAnimationFrame.bind(window);
		this.cancelAnimationFrame = _cancelAnimationFrame.bind(window);
	}
	// 开始事件循环
	eventBegin() {
		if (this.run) return;
		this.run = true;
		this.anm = this.requestAnimationFrame(this.loopevent.bind(this));
	}
	// 结束事件循环
	eventEnd() {
		if (!this.run) return;
		this.run = false;
		this.cancelAnimationFrame(this.anm);
		this.anm = null;
	}
	// 添加循环事件
	addEvent(options) {
		const { event, params, id } = options;
		const _id = id ? id : `evt-${Math.random().toString(32).slice(-8)}`;
		this.eventBus.push({
			event,
			params: params ? params : [],
			id: _id
		});
		if (this.eventBus.length == 1) this.eventBegin();
		return _id;
	}
	// 移除某个事件
	removeEvent(id) {
		const index = this.eventBus.findIndex((e) => e.id == id);
		this.eventBus.splice(index, 1);
		if (!this.eventBus.length) this.eventEnd();
	}
	// 执行循环事件
	loopevent() {
		this.eventBus.map((evt) => {
			const event = evt.event;
			const params = evt.params;
			event(...params);
		});
		if (this.run) this.requestAnimationFrame(this.loopevent.bind(this));
	}
}
