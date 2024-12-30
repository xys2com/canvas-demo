const graphSet = [
	{
		category: "line",
		path: [
			{
				x: 200,
				y: 150
			},
			{
				x: 400,
				y: 150
			},
			{
				x: 320,
				y: 345
			}
		],
		double: true
	},
	{
		category: "rect",
		position: [50, 50, 130, 60],
		fillType: "fill", // mix 包含图形填充和描线填充 mix = fill & line
		draggable: true,
		clickable: true,
		onclick: () => {
			alert("可拖动、点击的，扫描线填充双线矩形");
		},
		fillDeg: 68, // 描线填充和混合填充时 扫描线偏转角
		fillGap: 12 // 描线填充和混合填充时 扫描线间距
		// colors: { side: "#fff", line: "#f0f", fill: "#873329" }
	},
	{
		category: "rect",
		position: [50, 120, 130, 60],
		fillType: "line", // mix 包含图形填充和描线填充 mix = fill & line
		clickable: true,
		onclick: () => {
			alert("可点击的，扫描线填充双线矩形");
		},
		fillDeg: 68, // 描线填充和混合填充时 扫描线偏转角
		fillGap: 12 // 描线填充和混合填充时 扫描线间距
		// colors: { side: "#fff", line: "#f0f", fill: "#873329" }
	},
	{
		category: "polygon",
		dots: [
			{
				x: 120,
				y: 500
			},
			{
				x: 170,
				y: 590
			},
			{
				x: 70,
				y: 650
			}
		],
		clickable: true,
		onclick: () => {
			alert("可点击的，扫描线填充单线三角形");
		},
		double: false, // 边线单线
		fillType: "line", // mix 包含图形填充和描线填充 mix = fill & line
		fillDeg: 45, // 描线填充和混合填充时 扫描线偏转角
		fillGap: 10 // 描线填充和混合填充时 扫描线间距
		// colors: { side: "#fff", line: "#f0f", fill: "#873329" }
	},
	{
		category: "polygon",
		draggable: true,
		dots: [
			{
				x: 250,
				y: 50
			},
			{
				x: 290,
				y: 76
			},
			{
				x: 270,
				y: 113
			},
			{
				x: 220,
				y: 104
			},
			{
				x: 200,
				y: 68
			}
		]
	},
	{
		category: "circle",
		x: 120,
		y: 260,
		r: 50,
		clickable: true,
		onclick: () => {
			alert("可点击的，混合填充双线圆形");
		},
		double: true, // 边线单线
		fillType: "mix", // mix 包含图形填充和描线填充 mix = fill & line
		fillDeg: 76, // 描线填充和混合填充时 扫描线偏转角
		fillGap: 10 // 描线填充和混合填充时 扫描线间距
		// colors: { side: "#fff", line: "#a05", fill: "#0066fe33" }
	},
	{
		category: "circle",
		x: 120,
		y: 400,
		r: 50,
		double: false, // 边线单线
		operability: false, // 可操作（为false，点击与拖动都无效）
		fillType: "line", // mix 包含图形填充和描线填充 mix = fill & line
		// fillDeg: 0, // 描线填充和混合填充时 扫描线偏转角
		fillGap: 8, // 描线填充和混合填充时 扫描线间距
		colors: { side: "#ff0", line: "#a05", fill: "#873329" }
	}
];
