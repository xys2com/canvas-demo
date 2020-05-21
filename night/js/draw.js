//计算最远点到中心的直线距离
function maxOrbit(x, y) {
    var max = Math.max(x, y),
        diameter = Math.round(Math.sqrt(max * max + max * max));
    return diameter / 2;
}
//静止类型的星星构造函数
function StaticStar(options) {
    var s_width = options["width"];
    var s_height = options["height"];
    this.x = random(3, s_width - 3);
    this.y = random(3, s_height - 3);
    this.r = random(8, 20);
    this.alpha = parseFloat(random(2, 10) / 10); //初始透明度
    this.star = createStar(this.r); //一个canvas 对象
}
//移动类型的星星构造函数
function MoveStar(options) {
    let s_width = options["width"]
    let s_height = options["height"]

    //路径相关属性
    this.orbitRadius = random(maxOrbit(s_width, s_height));
    this.radius = random(60, this.orbitRadius) / 10;
    this.orbitX = s_width / 2;
    this.orbitY = s_height / 10 * 8;
    this.timePassed = random(0, 300);
    this.speed = random(this.orbitRadius) / 6000000;
    //自身相关属性
    this.x = random(3, s_width - 3);
    this.y = random(3, s_height - 3);
    this.r = random(5, 10);
    this.cycle = random(100, 800); //闪烁周期
    this.alpha = parseFloat(random(2, 10) / 10); //初始透明度
    this.symbol = -1; //闪烁标识
    this.star = createStar(this.r); //一个canvas 对象
}
//绘制流星
/*
 * @angle 角度 从正x轴开始顺时针
 * @ratio 比例 流星的大小为ratio*100 ratio为1-10的整数
 */
//流星构造函数
function Meteor() {
    this.ratio = random(200, 400)
    this.angle = random(335, 340)
    this.x = random(1920 / 2 - this.ratio / 2, 1920 + this.ratio)
    this.y = random(-100, -this.ratio)
    this.star = createMeteor(this.angle, this.ratio)

    this.ex = Math.cos(Math.PI * 2 * this.angle / 360) * this.ratio / 25 //x 轴移动量
    this.ey = Math.sin(Math.PI * 2 * this.angle / 360) * this.ratio / 25 //y 轴移动量
}
//绘制移动类型单个星星的下一帧位置
MoveStar.prototype.draw = function (canvasCtx) {
    var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX,
        y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
    this.alpha += parseFloat(this.cycle / 30000 * this.symbol);
    if (this.alpha > 1) {
        this.alpha = 1
        this.symbol = -1
    }
    if (this.alpha < .4) {
        this.alpha = .4;
        this.symbol = 1;
    }
    canvasCtx.globalAlpha = this.alpha;
    canvasCtx.drawImage(this.star, x - this.radius, y - this.radius / 2, this.r, this.r);
    this.timePassed -= this.speed;
}
//绘制静态星星
StaticStar.prototype.draw = function (canvasCtx) {
    canvasCtx.drawImage(this.star, this.x, this.y, this.r, this.r);
}
//绘制流星下一帧
Meteor.prototype.draw = function (canvasCtx) {
    canvasCtx.globalAlpha = 1;
    canvasCtx.drawImage(this.star, this.x, this.y, this.ratio, this.ratio)
    this.x = this.x - this.ex * 5
    this.y = this.y - this.ey * 5
    this.star = createMeteor(this.angle, this.ratio)
}
// 绘制星星对象
function createStar(R) {
    let c = document.createElement("canvas");
    let ctx = c.getContext("2d")

    c.width = R * 3;
    c.height = R * 3;

    let r = R / 4
    let x = R,
        y = R;
    ctx.save();
    ctx.lineWidth = .5;
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.rotate(random(0, 360), x, y)
    for (var i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos(((1 / 4 + i) * 2 * Math.PI / 4)) * R, -Math.sin(((1 / 4 + i) * 2 * Math.PI / 4)) * R);
        ctx.lineTo(Math.cos(((3 / 4 + i) * 2 * Math.PI / 4)) * r, -Math.sin(((3 / 4 + i) * 2 * Math.PI / 4)) * r);
    }
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.fillStyle = "rgba(255,255,255,.4)"
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    //绘制星星主体

    var grd = ctx.createRadialGradient(R, R, 0, R, R, R);
    grd.addColorStop(0.025, '#fff');
    grd.addColorStop(0.1, '#fff');
    grd.addColorStop(0.15, 'rgba(255,255,255,.4)');
    grd.addColorStop(0.25, 'rgba(255,255,255,.3)');
    grd.addColorStop(0.4, 'rgba(255,255,255,.2)');
    grd.addColorStop(1, 'transparent');

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(R, R, R, 0, Math.PI * 2);
    ctx.fill();
    //绘制星星的光晕
    return c;
}
//绘制月亮及月亮光晕
function drawMoonShadow(options) {
    let canvas = options['canvas']
    let callback = options['callback']
    let canvasCtx = canvas.getContext("2d")

    let c = document.createElement("canvas");
    let ctx = c.getContext("2d")
    let img = new Image()
    img.src = getImgUrl()
    img.onload = function () {
        c.width = 400;
        c.height = 400;
        crc_x = c.width / 2
        crc_y = c.height / 2
        let R = c.height / 2

        ctx.drawImage(img, c.width / 4, c.height / 4, crc_x, crc_y);

        let grd = ctx.createRadialGradient(R, R, 0, R, R, c.width / 2);
        //月亮光晕
        grd.addColorStop(.5, 'rgba(255,239,180,.4)');
        grd.addColorStop(.6, 'rgba(255,239,180,.25)');
        grd.addColorStop(.7, 'rgba(255,239,180,.125)');
        grd.addColorStop(.8, 'rgba(255,239,180,.0625)');
        grd.addColorStop(.9, 'rgba(255,239,180,.03)');
        grd.addColorStop(1, 'transparent');

        ctx.fillStyle = grd
        ctx.beginPath();
        ctx.arc(R, R, R, 0, Math.PI * 2);
        ctx.fill();

        canvasCtx.globalCompositeOperation = 'destination-over';
        canvasCtx.globalAlpha = 1;
        canvasCtx.drawImage(c, canvas.width / 2 - c.width / 2, canvas.height - c.height * 2 / 3, c.width, c.height);
        if (typeof (callback) === 'function') {
            callback()
        }
    }
}

//绘制流星主体
function createMeteor(angle, ratio) {
    var c = document.createElement("canvas")
    var c_w, c_h;
    c_w = c_h = c.width = c.height = ratio;
    aCtr = c_w / 2
    var ctx2 = c.getContext('2d')
    var aClr = ctx2.createRadialGradient(aCtr, aCtr, 0, aCtr, aCtr, aCtr)
    aClr.addColorStop(0, "rgba(255,255,255,1)")
    aClr.addColorStop(.025, "rgba(255,255,255,1)")
    aClr.addColorStop(.2, "rgba(255,255,255,.6)")
    aClr.addColorStop(.6, "rgba(255,255,255,.4)")
    aClr.addColorStop(.8, "rgba(255,255,255,.15)")
    aClr.addColorStop(1, "transparent")
    // 绘制流星尾 
    for (let i = 0; i < random(3, 5); i++) {
        let randomV = random(.5, 1.5)
        let angleV = angle + random(-1, 1)
        let x1 = Math.cos(Math.PI * 2 * (angleV + randomV) / 360) * aCtr + c_w / 2
        let y1 = Math.sin(Math.PI * 2 * (angleV + randomV) / 360) * aCtr + c_w / 2
        let x_1 = Math.cos(Math.PI * 2 * (angleV - randomV) / 360) * aCtr + c_w / 2
        let y_1 = Math.sin(Math.PI * 2 * (angleV - randomV) / 360) * aCtr + c_w / 2
        ctx2.beginPath()
        ctx2.moveTo(aCtr, aCtr)
        ctx2.lineTo(x1, y1)
        ctx2.lineTo(x_1, y_1)
        ctx2.lineTo(aCtr, aCtr)
        ctx2.fillStyle = aClr
        ctx2.fill()
        ctx2.closePath()
    }
    return c

    // var besAng=15

    // besX1=Math.sqrt(x1*x1+y1*y1)*Math.cos(besAng)*Math.sin(90-besAng-Math.abs(angle-360))
    // besY1=Math.sqrt(x1*x1+y1*y1)*Math.cos(besAng)*Math.cos(90-besAng-Math.abs(angle-360))
    // besX2=Math.sqrt(x2*x2+y2*y2)*Math.cos(besAng)*Math.sin(90-besAng-Math.abs(angle-360))
    // besY2=Math.sqrt(x2*x2+y2*y2)*Math.cos(besAng)*Math.cos(90-besAng-Math.abs(angle-360))
    // ctx2.quadraticCurveTo(besX1,besY1,x1,y1)
    // ctx2.quadraticCurveTo(besX2,besY2,aCtr,aCtr)
}

//接受一张图片来改变图片高度的起始的水面波动效果
var undulate = function(options,img) {
    var settings={
        'speed':options['speed']||1,
        'scale':options['scale']||1,
        'waves':options['waves']||10,
        'image':options['image']||true,
        'height':options['height']||1/2
    }

    var waves = settings['waves'];
    var speed = settings['speed']/4;
    var scale = settings['scale'];
    var height= settings['height'];

    var ca = document.createElement('canvas');
    var c = ca.getContext('2d');
    var img = img
    var img_loaded = false;

    img.parentNode.insertBefore(ca, img);

    var w, h, dw, dh;

    var offset = 0;
    var frame = 0;
    var max_frames = 0;
    var frames = [];

    img.onload = function() {
        c.save();

        c.canvas.width  = img.width;
        c.canvas.height = img.height*2;
        c.canvas.style.zIndex="3"

        c.drawImage(img, 0,  0);

        c.scale(1, -1);
        c.drawImage(img, 0,  -img.height*2);

        img_loaded = true;

        c.restore();

        w = c.canvas.width;
        h = c.canvas.height;
        dw = w;
        dh = h*height;

        var id = c.getImageData(0, h*height, w, h).data;
        var end = false;
        c.save();
        while (!end) {
            var odd = c.getImageData(0, h*height, w, h);
            var od = odd.data;
            var pixel = 0;
            for (var y = 0; y < dh; y++) {
                for (var x = 0; x < dw; x++) {
                    var displacement = (scale * 10 * (Math.sin((dh/(y/waves)) + (-offset)))) | 0;
                    var j = ((displacement + y) * w + x + displacement)*4;
                    if (j < 0) {
                        pixel += 4;
                        continue;
                    }
                    var m = j % (w*4);
                    var n = scale * 10 * (y/waves);
                    if (m < n || m > (w*4)-n) {
                        var sign = y < w/2 ? 1 : -1;
                        od[pixel]   = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        od[++pixel] = od[pixel + 4 * sign];
                        ++pixel;
                        continue;
                    }

                    if (id[j+3] != 0) {
                        od[pixel]   = id[j];
                        od[++pixel] = id[++j];
                        od[++pixel] = id[++j];
                        od[++pixel] = id[++j];
                        ++pixel;
                    } else {
                        od[pixel]   = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        od[++pixel] = od[pixel - w*4];
                        ++pixel;
                    }
                }
            }

            if (offset > speed * (6/speed)) {
                offset = 0;
                max_frames = frame - 1;
                frame = 0;
                end = true;
            } else {
                offset += speed;
                frame++;
            }
            frames.push(odd);
        }
        c.restore();
        if (!settings.image) {
            c.height = c.height/2;
        }
    };
    setInterval(function() {
        if (img_loaded) {
            if (!settings.image) {
                c.putImageData(frames[frame], 0, 0);
            } else {
                c.putImageData(frames[frame], 0, h*height);
            }
            if (frame < max_frames) {
                frame++;
            } else {
                frame = 0;
            }
        }
    }, 33);
    return img;
}

//获得64位图片地址
function getBase64Url(cvs) {
    var imgUrl = cvs.toDataURL("image/png").replace("image/png", "image/octet-stream");
    return imgUrl
}
//月亮图片
function getImgUrl() {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAByCAMAAAC4A3VPAAAC/VBMVEUAAADHt5XowXrjvHXiuHLovHbkuHPlvXfpxH/mvnbaxpvnwHjmunTpv3foxoLlwn3nwn3qxX3py4buxoHmt3Dmwn/rxoPpvnnmwHrouHTry4bi1K3lxoTz2J/guXLl1arr0ZD78cHtx37nvHPjwHnrv3zctG3z6b/rxXjx0IjktG3gu3Xo1KvmwHf+9tTtzY3htGzft3HXs3Dt2ar16sb5+sXp15/wyoPtwnrqy4ft2af02JTsxn/eu3j15bP856vixIvnxYHkw4P98MD788nt1qfpuXL168Hrz5zmyJL988j64KTw1Zv247P0043x2ab88sjj0Zr//t7gz5787b/y37L++M//77fiyZb89tX/+tvt0pj79tjn2qns0ZrSu4f/7rj96bT767T/67b/7bT96K7/8Lv56LL746f856z+8b7yzIb/87765aztxoD88Lzqwnz53Jr/6az45Kn336HrxH7/9sTuyoP+9cf/67PwyIT+5Kb/88H87Lf73p3215bvyH/96rD57Lj0zoj/6bD636H30Yrxz4r425f+4Z7z1pXuxn397rr/6Kn74qPtwnzyxoL55qf/67D85rL44ab1yIT+5qj/46Hx2Jr335772ZLx05H688T50o314qj136T03Jv/66321Yztz4zvzobxy4L22pPvw3/rwHr/8MP25a/31JH88sHsvHf677j71Y7z0Y799cP+36HsyYf22Zrwz4//+s342p7+25b015D4zIj16rX615bt1Zbx1I3/+cj/7Lrz2pb00Yr/8bT346P73pj415D46K3/66jy3KD/3pjvv3v48Lz/8Lj67rH+2ZHwyovywn/t2Z394JzqyID/56X64p7/98D/7L//5K3936n235r10YXyyH//9bjr0JP10pL7873+7633363v3qX75qL77Lz/5p700pvxxXXtwW/v47P57Kb+4pb+66D465779Mz078D//NL38Mf/8Kf426bv35Pt14/25Zzy4Jvvy3j1y4L2ynr//t7/9qve06cSAAAAYHRSTlMABvvo5vvq6vrwDvbu/PXl9vDt8/Lv/fPw9/sY6/7hIvL9+vXe/NT+/vLr2S7r/vni28RoNv329vT1/fDmzufv49fPzHFI/FD97ePTysXgsJ7q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"
}