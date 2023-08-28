function Sound() {
	this.AC =
		new window.AudioContext() ||
		new window.webkitAudioContext() ||
		new AudioContext();
	this.volume = null; // 音量
	this.gainNode = null; // 播放节点
	this.source = null; // 音源
	this.count = 0; // 防止意外的播放
	this.analyser = null; // 分析器
	this.size = 256; // 一组音频数据共 256 个
	this.ultimately = null; // 转码的后数组数据 (最终需要的数据)
	this.duration = null; // 总时长
	// this.arraybuffer = null; //
	// this.playEndCallback = null;
	this.callback = null; //
	this.init = () => {
		// 初始化
		this.analyser && this.analyser.disconnect(this.gainNode);
		this.gainNode && this.gainNode.disconnect(this.AC.destination);
		this.gainNode =
			this.AC[this.AC.createGain ? "createGain" : "creatGainNode"]();
		this.gainNode.connect(this.AC.destination);
		this.analyser = this.AC.createAnalyser();
		this.analyser.fftSize = this.size * 2;
		this.analyser.connect(this.gainNode);
		this.ultimately = new Uint8Array(this.analyser.frequencyBinCount); // 获得用于可视化的数据流
	};
	this.frequencyAnalysis = null;
	// 设置音量 0 - 1
	this.setVolume = (v = null) => {
		let vl = v !== null ? v : this.volume;
		this.gainNode.gain.value = vl;
		this.volume = vl;
	};
	// 播放暂停
	this.playAndPause = (isPlay) => {
		isPlay ? this.AC.resume() : this.AC.suspend();
	};
	// 解析音频数据并播放
	this.analysisBufferPlay = (
		arraybuffer,
		allReadyCallback,
		callback,
		isIOS,
		IOSCallback
	) => {
		var n = ++this.count;
		this.source && this.source[this.source.stop ? "stop" : "noteOff"]();
		if (n !== this.count) return;
		this.AC.decodeAudioData(
			arraybuffer,
			(buffer) => {
				if (n != this.count) return;
				var bufferSource = this.AC.createBufferSource();
				bufferSource.buffer = buffer;
				bufferSource.connect(this.analyser);
				bufferSource[bufferSource.start ? "start" : "noteOn"](0);
				this.source = bufferSource;
				this.duration = bufferSource.buffer.duration; // s
				this.callback = callback;
				this.AC.resume();

				if (isIOS && typeof IOSCallback === "function") {
					IOSCallback();
				}
				this.AC.onstatechange = () => {
					if (
						typeof allReadyCallback === "function" &&
						this.AC.state === "running"
					)
						allReadyCallback();
				};
				bufferSource.onended = () => {
					if (typeof callback === "function" && this.AC.state === "running") {
						callback();
						this.pause();
					}
				};
				this.buffer = buffer;
			},
			function (err) {
				console.log(err);
			}
		);
	};

	// 调到某个时间点播放
	this.dragAnalysisBufferPlay = (time) => {
		this.gainNode = null;
		this.analyser && this.analyser.disconnect(this.gainNode);
		this.gainNode && this.gainNode.disconnect(this.AC.destination);
		let bufferSource = this.AC.createBufferSource();
		bufferSource.buffer = this.buffer;

		this.gainNode = this.AC.createGain();

		this.setVolume();

		this.analyser = this.AC.createAnalyser();
		this.analyser.fftSize = this.size * 2;

		bufferSource.connect(this.analyser);
		this.analyser.connect(this.gainNode);
		this.gainNode.connect(this.AC.destination);
		const callback = this.callback;
		bufferSource.onended = () => {
			if (typeof callback === "function" && this.AC.state === "running") {
				callback();
			}
		};
		bufferSource.start(0, time);
	};

	// 返回实时数据
	this.visualizer = () => {
		this.analyser.getByteFrequencyData(this.ultimately);

		return this.ultimately;
	};

	// 主动停止
	this.stop = () => {
		this.source && this.source[this.source.stop ? "stop" : "noteOff"]();
	};
	this.play = () => {
		this.AC.resume();
	};
	this.pause = () => {
		this.AC.suspend();
	};
}
window.Sound = Sound;
// export {
//   Sound
// };
