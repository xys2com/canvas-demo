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
		this.eventBus = new Map();
		this.requestAnimationFrame = _requestAnimationFrame.bind(window);
		this.cancelAnimationFrame = _cancelAnimationFrame.bind(window);
		this.state = "waiting"; // running
		this.anm = null;
	}
	// 添加循环事件
	addEvent(options) {
		const { event, params, id } = options;
		const _id = id ? id : `evt_${Math.random().toString(32).slice(-8)}`;
		this.eventBus.set(_id, {
			event,
			params: params ? params : [],
			id: _id
		});
		if (this.state === "waiting" && !this.anm) {
			if (!window.EachMapExec) {
				console.log("addEvent", Date.now());
				window.EachMapExec = this.loopevent.bind(this);
				window.EachMapExec();
			}
			this.state = "running";
		}
		return _id;
	}
	// 移除某个事件
	removeEvent(id) {
		// this.eventBus.delete(id);
		return Promise.resolve(this.eventBus.delete(id));
	}
	// 执行循环事件
	loopevent() {
		if (this.eventBus.size == 0) {
			this.cancelAnimationFrame(this.anm);
			this.anm = null;
			this.state = "waiting";
		} else {
			this.eventBus.forEach((evt, id) => {
				const event = evt.event;
				const params = evt.params;
				params.eventid = id;
				event(params);
			});
			this.anm = this.requestAnimationFrame(window.EachMapExec);
		}
	}
}
