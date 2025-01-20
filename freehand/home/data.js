const textSourceData = [
  // 我
  [
    {
      x: 24,
      y: 6,
    },
    {
      x: 4,
      y: 8,
    },
  ],
  [
    {
      x: 2,
      y: 18,
    },
    {
      x: 52,
      y: 18,
    },
  ],
  [
    {
      x: 15,
      y: 10,
    },
    {
      x: 13,
      y: 45,
    },
    {
      x: 5,
      y: 41,
    },
  ],
  [
    {
      x: 3,
      y: 33,
    },
    {
      x: 26,
      y: 30,
    },
  ],
  [
    {
      x: 31,
      y: 5,
    },
    {
      x: 44,
      y: 48,
    },
    {
      x: 49,
      y: 38,
    },
  ],
  [
    {
      x: 35,
      y: 8,
    },
    {
      x: 46,
      y: 13,
    },
  ],
  [
    {
      x: 46,
      y: 24,
    },
    {
      x: 25,
      y: 43,
    },
  ],

  // 是一
  [
    { x: 62, y: 6 },
    { x: 60, y: 23 },
  ],
  [
    { x: 62, y: 6 },
    { x: 91, y: 6 },
    { x: 89, y: 21 },
  ],
  [
    { x: 63, y: 13 },
    { x: 92, y: 13 },
  ],
  [
    { x: 62, y: 23 },
    { x: 91, y: 21 },
  ],
  [
    { x: 54, y: 28 },
    { x: 99, y: 28 },
  ],
  [
    { x: 77, y: 28 },
    { x: 75, y: 45 },
  ],
  [
    { x: 77, y: 36 },
    { x: 96, y: 36 },
  ],
  [
    { x: 64, y: 34 },
    { x: 55, y: 47 },
  ],
  [
    { x: 64, y: 40 },
    { x: 95, y: 47 },
  ],
  [
    { x: 103, y: 24 },
    { x: 150, y: 24 },
  ],

  // 只
  [
    { x: 161, y: 7 },
    { x: 159, y: 28 },
  ],
  [
    { x: 161, y: 7 },
    { x: 193, y: 7 },
    { x: 195, y: 28 },
  ],
  [
    { x: 161, y: 28 },
    { x: 193, y: 28 },
  ],
  [
    { x: 170, y: 34 },
    { x: 154, y: 48 },
  ],
  [
    { x: 182, y: 33 },
    { x: 198, y: 48 },
  ],

  // 猪
  [
    { x: 218, y: 6 },
    { x: 204, y: 20 },
  ],
  [
    { x: 205, y: 5 },
    { x: 213, y: 47 },
    { x: 207, y: 42 },
  ],
  [
    { x: 205, y: 34 },
    { x: 213, y: 26 },
  ],
  [
    { x: 223, y: 10 },
    { x: 241, y: 10 },
  ],
  [
    { x: 231, y: 1 },
    { x: 233, y: 19 },
  ],
  [
    { x: 220, y: 19 },
    { x: 250, y: 20 },
  ],
  [
    { x: 247, y: 8 },
    { x: 220, y: 33 },
  ],
  [
    { x: 226, y: 31 },
    { x: 228, y: 49 },
  ],
  [
    { x: 226, y: 31 },
    { x: 245, y: 31 },
    { x: 247, y: 48 },
  ],
  [
    { x: 227, y: 37 },
    { x: 245, y: 37 },
  ],
  [
    { x: 226, y: 49 },
    { x: 245, y: 48 },
  ],
  // 还
  [
    { x: 268, y: 8 },
    { x: 299, y: 8 },
  ],
  [
    { x: 284, y: 10 },
    { x: 266, y: 33 },
  ],
  [
    { x: 282, y: 19 },
    { x: 284, y: 42 },
  ],
  [
    { x: 282, y: 19 },
    { x: 299, y: 31 },
  ],
  [
    { x: 257, y: 5 },
    { x: 263, y: 13 },
  ],
  [
    { x: 258, y: 21 },
    { x: 256, y: 44 },
  ],
  [
    { x: 255, y: 37 },
    { x: 299, y: 47 },
  ],
  // 不
  [
    { x: 304, y: 8 },
    { x: 349, y: 8 },
  ],
  [
    { x: 326, y: 10 },
    { x: 303, y: 36 },
  ],
  [
    { x: 326, y: 20 },
    { x: 324, y: 50 },
  ],
  [
    { x: 333, y: 23 },
    { x: 349, y: 34 },
  ],
  // 太
  [
    { x: 352, y: 16 },
    { x: 400, y: 16 },
  ],
  [
    { x: 376, y: 4 },
    { x: 356, y: 47 },
  ],
  [
    { x: 375, y: 20 },
    { x: 398, y: 46 },
  ],
  [
    { x: 372, y: 39 },
    { x: 379, y: 46 },
  ],
  // 会
  [
    { x: 428, y: 4 },
    { x: 404, y: 23 },
  ],
  [
    { x: 426, y: 6 },
    { x: 449, y: 23 },
  ],
  [
    { x: 415, y: 22 },
    { x: 439, y: 22 },
  ],
  [
    { x: 405, y: 31 },
    { x: 450, y: 31 },
  ],
  [
    { x: 422, y: 33 },
    { x: 411, y: 46 },
  ],
  [
    { x: 411, y: 46 },
    { x: 438, y: 45 },
  ],
  [
    { x: 433, y: 38 },
    { x: 444, y: 49 },
  ],
  // 写
  [
    { x: 456, y: 7 },
    { x: 455, y: 14 },
  ],
  [
    { x: 456, y: 7 },
    { x: 497, y: 7 },
    { x: 498, y: 14 },
  ],
  [
    { x: 466, y: 12 },
    { x: 462, y: 27 },
    { x: 494, y: 27 },
    { x: 491, y: 46 },
    { x: 480, y: 44 },
  ],
  [
    { x: 466, y: 17 },
    { x: 494, y: 17 },
  ],
  [
    { x: 455, y: 37 },
    { x: 487, y: 37 },
  ],
  // 字
  [
    { x: 525, y: 4 },
    { x: 529, y: 8 },
  ],
  [
    { x: 506, y: 11 },
    { x: 506, y: 18 },
  ],
  [
    { x: 506, y: 11 },
    { x: 547, y: 11 },
    { x: 547, y: 20 },
  ],
  [
    { x: 512, y: 20 },
    { x: 538, y: 20 },
    { x: 528, y: 29 },
    { x: 527, y: 46 },
    { x: 518, y: 41 },
  ],
  [
    { x: 504, y: 33 },
    { x: 549, y: 33 },
  ],
];

// pig
const PIGDATA = [
  {
    category: "circle",
    x: 650,
    y: 55,
    r: 35,
    clickable: true,
    double: true,
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
    fillType: "fill",
    colors: {
      side: "#333",
      fill: "transparent",
      line: "#333",
    },
  },
  {
    category: "circle",
    x: 635,
    y: 45,
    r: 3,
    clickable: true,
    double: true,
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
    colors: {
      fill: "#333",
    },
  },
  {
    category: "circle",
    x: 665,
    y: 45,
    r: 3,
    clickable: true,
    double: true,
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
    colors: {
      fill: "#333",
    },
  },
  {
    category: "circle",
    x: 650,
    y: 60,
    r: 10,
    clickable: true,
    double: true,
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
  },
  {
    category: "circle",
    x: 645,
    y: 60,
    r: 2,
    clickable: true,
    double: true,
    colors: {
      fill: "#333",
    },
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
  },
  {
    category: "circle",
    x: 655,
    y: 60,
    r: 2,
    clickable: true,
    double: true,
    colors: {
      fill: "#333",
    },
    onclick: () => {
      window.open("https://github.com/xys2com/my-star");
    },
  },
  {
    category: "bzr3",
    path: [630, 27, 610, 7, 590, 47, 580, 40],
    double: true,
    color: "#333",
  },
  {
    category: "bzr3",
    path: [615, 47, 605, 53, 590, 55, 580, 40],
    double: true,
    color: "#333",
  },
  {
    category: "bzr3",
    path: [665, 27, 685, 7, 705, 47, 715, 40],
    double: true,
    color: "#333",
  },
  {
    category: "bzr3",
    path: [680, 47, 690, 53, 705, 55, 715, 40],
    double: true,
    color: "#333",
  },
  {
    category: "bzr3",
    path: [640, 75, 650, 79, 655, 79, 660, 75],
    double: true,
    color: "#333",
  },
];

// URLS
const URLS = [
  {
    title: "canvas:海上的夜晚~",
    url: "../../night author：other/night.html",
    remark: "",
  },
  {
    title: "噪声分形叠加",
    url: "../../three.js/webgl/perlin/perlin-cc.html",
    remark: "",
  },
  {
    title: "噪声生成俯瞰地图",
    url: "../../three.js/webgl/perlin/perlin-island.html",
    remark: "",
  },
  {
    title: "噪声生成山脊",
    url: "../../three.js/webgl/perlin/rddot.html",
    remark: "",
  },
  {
    title: "水球图练手？",
    url: "../水球图v240115.html",
    remark: "",
  },
  {
    title: "canvas:拖动放大旋转等",
    url: "../index.v0.13.html",
    remark: "",
  },
  {
    title: "canvas:拖动连线",
    url: "../link.html",
    remark: "",
  },
  {
    title: "canvas:没画完的天空",
    url: "../sky.html",
    remark: "",
  },
  {
    title: "canvas:路径动画",
    url: "../../4-static-path-anm-ball.html",
    remark: "",
  },
  {
    title: "canvas:随机路径动画",
    url: "../../3-random-path-anm-ball.html",
    remark: "",
  },
  {
    title: "canvas:锥形渐变",
    url: "../../ConicalGradient.html",
    remark: "",
  },
  {
    title: "canvas:贪吃蛇",
    url: "../../game-snk.html",
    remark: "",
  },
  {
    title: "canvas:浮点特效",
    url: "../../xuslight.html",
    remark: "",
  },
  {
    title: "webgl:半兰伯特光照",
    url: "../../three.js/exercise3.html",
    remark: "",
  },
  {
    title: "柏林噪声1v",
    url: "../../three.js/webgl/perlin/perlin-1.html",
    remark: "",
  },
  {
    title: "柏林噪声2v",
    url: "../../three.js/webgl/perlin/perlin-c.html",
    remark: "",
  },
  {
    title: "来朵云？",
    url: "../cloud.html",
    remark: "",
  },
];
