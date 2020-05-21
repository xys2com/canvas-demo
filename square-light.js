;
(function () {
  const {
    pow,
    PI,
    SQRT2,
    sin,
    abs,
    cos,
    tan,
    sqrt
  } = Math

  function $(s) {
    let el = document.querySelectorAll(s)
    return el.length === 1 ? el[0] : el
  }

  function random(min, max) {
    if (arguments.length < 2 && (max = min, min = 0), min > max) {
      var a = max;
      max = min, min = a
    }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function GetDistance(x1, y1, x2, y2) {
    return sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2)
  }
  function curveInit(path) {
    if (path[0].length === 4 || path[0].length === 6) {
      let lastPath = path[path.length - 1]
      let newP = [lastPath[lastPath.length - 2], lastPath[lastPath.length - 1]]
      path.unshift(newP)
      path.unshift(newP)
    } else if ((path[1].length === 4 || path[1].length === 6) && path[0].length ===
      2) {
      let newP = path[0]
      path.unshift(newP)
    }
    return path
  }

  var Ctx, Ctx2

  function SquareLight({
    data,
    el
  }) {
    this.data = data
    this.SQS = []
    this.ANM = null
    this.init = () => {
      let Wrap = $(el)
      let _W = Wrap.clientWidth,
        _H = Wrap.clientHeight

      let c = document.createElement('canvas')
      let c2 = document.createElement('canvas')
      c.width = _W
      c.height = _H
      c2.width = _W
      c2.height = _H

      c.style.zIndex = 10
      c2.style.zIndex = 1

      Wrap.appendChild(c)
      Wrap.appendChild(c2)

      Ctx = c.getContext('2d')
      Ctx2 = c2.getContext('2d')
      Ctx.initCtx = function () {
        this.shadowOffsetX = 0
        this.shadowOffsetY = 0
        this.shadowColor = ''
        this.shadowBlur = 0
        this.globalAlpha = 1
        this.strokeStyle = ''
        this.fillStyle = ''
      }
      Ctx2.initCtx = function () {
        this.shadowOffsetX = 0
        this.shadowOffsetY = 0
        this.shadowColor = ''
        this.shadowBlur = 0
        this.globalAlpha = 1
        this.strokeStyle = ''
        this.fillStyle = ''
      }
      Ctx.clear = (sx = 0, sy = 0, ex = _W, ey = _H) => {
        Ctx.clearRect(sx, sy, ex, ey)
      }
      Ctx2.clear = (sx = 0, sy = 0, ex = _W, ey = _H) => {
        Ctx.clearRect(sx, sy, ex, ey)
      }
      this.data.forEach(e => {
        let sq = new Square(e.sq, e.shd, e.shd2, e.ellipse, e.across)
        sq.compute() // 计算方块灯影绘画路径，及色彩
        sq.flsCreate() // 创建浮动光点
        sq.floatAnyCreat() // 创建浮动物体
        this.SQS.push(sq)
      })
      this.run()
    }
    this.stop = () => {
      window.cancelAnimationFrame(this.ANM)
      this.ANM = null
    }
    this.run = () => { // 动态绘制所有元素
      Ctx.clear()
      this.SQS.forEach(e => {
        e.draw()
        e.floatAnys.forEach(f => {
          f.float()
        })
        e.fls.forEach(l => {
          l.init()
          l.move()
        })
      })
      this.ANM = requestAnimationFrame(this.run)
    }
  }

  // 方块灯类
  function Square(sq = {}, shd = {}, shd2 = {}, ellipse = false, across = false) {

    this.width = sq.width
    this.height = sq.height
    this.path = []
    this.hf = this.width / 2
    this.hfh = this.height / 2
    this.c = sq.c
    this.ga = sq.ga
    this.floatAnysData = sq.floatAnys
    this.floatAnys = []
    this.bottomDraw = false
    this.fls = []
    this.flsInit = false
    this.flsSizeRound = sq.flsSizeRound ? sq.flsNum : false
    this.flsNum = sq.flsNum ? sq.flsNum : 0
    this.flsRgb = sq.flsRgb ? sq.flsRgb : {
      r: random(0, 255),
      g: random(0, 255),
      b: random(0, 255)
    }
    this.flsTrailing = sq.flsTrailing ? sq.flsTrailing : false
    this.curve = sq.curve ? sq.curve : false
    this.p = across ? {
      x: this.c.x,
      y: this.c.y - this.hf
    } : {
      x: this.c.x - this.hf,
      y: this.c.y
    }

    this.rgb = sq.rgb ? sq.rgb : {
      r: random(0, 255),
      g: random(0, 255),
      b: random(0, 255)
    }

    this.shadow = {
      path: [],
      gradient: [],
      rgb: shd.rgb ? shd.rgb : this.rgb,
      shdHeight: shd.height ? shd.height : (this.height * 2),
      shdOffset: shd.offset | 0,
      twinkle: shd.twinkle ? shd.twinkle : false,
      grd: '',
      isDraw: false
    }

    this.shadow2 = {
      path: [],
      gradient: [],
      rgb: shd2.rgb ? shd2.rgb : this.rgb,
      shdHeight: shd2.height ? shd2.height : (this.height * 2),
      shdOffset: shd2.offset | 0,
      twinkle: shd2.twinkle ? shd2.twinkle : false,
      grd: '',
      isDraw: false
    }

    this.flsCreate = () => { // 创建浮光粒子
      if (!this.flsInit) {
        this.flsInit = true
        let randomName = `itv${String(random(0, 10000000) / random(0, 10000))}`
        window[randomName] = window.setInterval(() => {
          this.fls.push(new FloatLight({
            rgb: this.flsRgb,
            trailing: this.flsTrailing,
            trailingNum: this.flsNum | random(36, 48),
            flsSizeRound: this.flsSizeRound,
            pathData: {
              x: this.c.x,
              y: this.c.y,
              hfh: this.hfh,
              hf: this.hf,
              ox: this.width / 5,
              oy: this.height / 10,
              curve: this.curve,
              across,
              curveEy: this.shadow.shdHeight > this.shadow2.shdHeight ? this.shadow.shdHeight : this.shadow2
                .shdHeight,
              curveEx: this.width
            }
          }))
          this.flsNum--
          if (this.flsNum <= 0) {
            window.clearInterval(window[randomName])
          }
        }, 800)
      }
    }
    this.floatAnyCreat = () => { // 创建浮动物体
      if(this.floatAnysData){
        let floatAnyNum = this.floatAnysData.length
        this.floatAnysData.forEach((e, i) => {
          let f = new FloatAny({
            x: this.c.x - this.hf + this.hf * 2 / (floatAnyNum + 1) * (i + 1),
            y: this.c.y - this.shadow.shdHeight / 2 + random(5, 20),
            w: e.width,
            h: e.height,
            fh: e.fh
          }, Ctx)
          this.floatAnys.push(f)
        })
      }
    }
    this.compute = () => {
      //计算实体方块绘画路径
      if (!across) {
        this.path = [
          [this.p.x, this.p.y],
          [this.p.x + this.hf, this.p.y + this.hfh],
          [this.p.x + this.hf * 2, this.p.y],
          [this.p.x + this.hf, this.p.y - this.hfh]
        ]
        let blockGrd = Ctx2.createRadialGradient(this.p.x + this.hf, this.p.y + this.hfh, 0, this.p.x + this.hf, this
          .p.y + this.hfh, this.height)
        blockGrd.addColorStop(0, `rgba(255, 255, 255, .5)`)
        // blockGrd.addColorStop(.3, `rgba(${this.shadow.rgb.r}, ${this.shadow.rgb.g}, ${this.shadow.rgb.b}, 1)`)
        blockGrd.addColorStop(.1, `rgba(${(this.shadow.rgb.r + 80) > 255 ? 255 : this.shadow.rgb.r + 80}, ${(this.shadow.rgb.g + 80) > 255 ? 255 : this.shadow.rgb.g + 80}, ${(this.shadow.rgb.b + 80) > 255 ? 255 : this.shadow.rgb.b + 80}, 1)`)
        blockGrd.addColorStop(1, `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.ga})`)
        this.blockGrd = blockGrd

        //计算第一层光影路径 及属性
        this.shadow.path = [
          [this.p.x, this.p.y],
          // [this.p.x + this.hf, this.p.y + this.hfh],
          [this.p.x + this.hf, this.p.y - this.hfh],

          [this.p.x + this.hf * 2, this.p.y],
          [this.p.x + this.hf * 2 + this.shadow.shdOffset, this.p.y - this.shadow.shdHeight],
          [this.p.x - this.shadow.shdOffset, this.p.y - this.shadow.shdHeight]
        ]
        this.shadow.gradient = [this.p.x + this.hf, this.p.y + this.hfh, this.p.x + this.hf, this.p.y - this.shadow
          .shdHeight
        ]
        let grdP = this.shadow.gradient
        let grd = Ctx.createLinearGradient(grdP[0], grdP[1], grdP[2], grdP[3])
        for (let i = 0; i < 5; i++) {
          grd.addColorStop(i * .2,
            `rgba(${this.shadow.rgb.r}, ${this.shadow.rgb.g}, ${this.shadow.rgb.b}, ${1 - i*.2 - .2})`)
        }
        this.shadow.grd = grd

        //计算第二层光影路径 及属性
        this.shadow2.path = [
          [this.p.x, this.p.y],
          // [this.p.x + this.hf, this.p.y + this.hfh],
          [this.p.x + this.hf, this.p.y - this.hfh],

          [this.p.x + this.hf * 2, this.p.y],
          [this.p.x + this.hf * 2 + this.shadow2.shdOffset, this.p.y - this.shadow2.shdHeight],
          [this.p.x - this.shadow2.shdOffset, this.p.y - this.shadow2.shdHeight]
        ]
        this.shadow2.gradient = [this.p.x + this.hf, this.p.y + this.hfh, this.p.x + this.hf, this.p.y - this.shadow2
          .shdHeight
        ]
        let grdP2 = this.shadow2.gradient
        let grd2 = Ctx.createLinearGradient(grdP2[0], grdP2[1], grdP2[2], grdP2[3])
        for (let i = 0; i < 5; i++) {
          grd2.addColorStop(i * .2,
            `rgba(${this.shadow2.rgb.r}, ${this.shadow2.rgb.g}, ${this.shadow2.rgb.b}, ${1 - i*.2 - .2})`)
        }
        this.shadow2.grd = grd2
      } else {
        this.path = [
          [this.p.x, this.p.y],
          [this.p.x - this.hfh, this.p.y + this.hf],
          [this.p.x, this.p.y + this.hf * 2],
          [this.p.x + this.hfh, this.p.y + this.hf]
        ]
        let blockGrd = Ctx2.createRadialGradient(this.p.x - this.hfh, this.p.y + this.hf, 0, this.p.x - this.hfh, this
          .p.y + this.hf, this.height)
        // blockGrd.addColorStop(0, `rgba(${(this.shadow.rgb.r + 80) > 255 ? 255 : this.shadow.rgb.r + 80}, ${(this.shadow.rgb.g + 80) > 255 ? 255 : this.shadow.rgb.g + 80}, ${(this.shadow.rgb.b + 80) > 255 ? 255 : this.shadow.rgb.b + 80}, 1)`)
        blockGrd.addColorStop(0, `rgba(${this.shadow.rgb.r}, ${this.shadow.rgb.g}, ${this.shadow.rgb.b}, 1)`)
        blockGrd.addColorStop(1, `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.ga})`)

        this.blockGrd = blockGrd
        //计算第一层光影路径 及属性
        this.shadow.path = [
          [this.p.x, this.p.y],
          // [this.p.x - this.hfh, this.p.y + this.hf],
          [this.p.x + this.hfh, this.p.y + this.hf],

          [this.p.x, this.p.y + this.hf * 2],
          [this.p.x + this.shadow.shdHeight, this.p.y + this.hf * 2 + this.shadow.shdOffset],
          [this.p.x + this.shadow.shdHeight, this.p.y - this.shadow.shdOffset]
        ]
        this.shadow.gradient = [this.p.x, this.p.y + this.hf, this.p.x + this.shadow.shdHeight, this.p.y + this.hf]
        let grdP = this.shadow.gradient
        let grd = Ctx.createLinearGradient(grdP[0], grdP[1], grdP[2], grdP[3])
        for (let i = 0; i < 5; i++) {
          grd.addColorStop(i * .2,
            `rgba(${this.shadow.rgb.r}, ${this.shadow.rgb.g}, ${this.shadow.rgb.b}, ${1 - i*.2 - .4})`)
        }
        this.shadow.grd = grd

        //计算第二层光影路径 及属性
        this.shadow2.path = [
          [this.p.x, this.p.y],
          // [this.p.x - this.hfh, this.p.y + this.hf],
          [this.p.x + this.hfh, this.p.y + this.hf],

          [this.p.x, this.p.y + this.hf * 2],
          [this.p.x + this.shadow2.shdHeight, this.p.y + this.hf * 2 + this.shadow2.shdOffset],
          [this.p.x + this.shadow2.shdHeight, this.p.y - this.shadow2.shdOffset]
        ]
        this.shadow2.gradient = [this.p.x, this.p.y + this.hf, this.p.x + this.shadow2.shdHeight, this.p.y + this.hf]
        let grdP2 = this.shadow2.gradient
        let grd2 = Ctx.createLinearGradient(grdP2[0], grdP2[1], grdP2[2], grdP2[3])
        for (let i = 0; i < 5; i++) {
          grd2.addColorStop(i * .2,
            `rgba(${this.shadow2.rgb.r}, ${this.shadow2.rgb.g}, ${this.shadow2.rgb.b}, ${1 - i*.2 - .4})`)
        }
        this.shadow2.grd = grd2
      }
    }
    this.draw = () => {
      // 绘画最底层 （底层没有动画 所以绘制到静态层区 使用 Ctx2 ）
      if (!this.bottomDraw) {
        Ctx2.initCtx()
        Ctx2.beginPath()
        Ctx2.globalAlpha = 1
        Ctx2.lineWidth = .5
        if (ellipse) {
          across ? Ctx2.ellipse(this.c.x, this.c.y, this.hfh, this.hf, 0, 0, Math.PI * 2) : Ctx2.ellipse(this.c.x,
            this
            .c
            .y, this.hf, this.hfh, 0, 0, Math.PI * 2)
        } else {
          this.path.forEach((e, i) => {
            i === 0 ? Ctx2.moveTo(e[0], e[1]) : Ctx2.lineTo(e[0], e[1])
          })
          Ctx2.lineTo(this.path[0][0], this.path[0][1])
        }
        // Ctx2.strokeStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, .75)`
        // Ctx2.stroke()
        // Ctx2.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.ga})`
        Ctx2.fillStyle = this.blockGrd
        Ctx2.fill()
        this.bottomDraw = true
      }

      // 绘画第一层光影 （通过twinkle 判断）
      if (!this.shadow.isDraw) {
        this.shadow.twinkle ? this.shadow.isDraw = false : this.shadow.isDraw = true
        let fstCtx = this.shadow.twinkle ? Ctx : Ctx2
        fstCtx.initCtx()
        fstCtx.beginPath()
        if (this.shadow.twinkle && random(1, 20) === 1) {
          fstCtx.globalAlpha = random(7, 9) / 10
        } else {
          fstCtx.globalAlpha = 1
        }
        this.shadow.path.forEach((e, i) => {
          i === 0 ? fstCtx.moveTo(e[0], e[1]) : fstCtx.lineTo(e[0], e[1])
        })
        fstCtx.lineTo(this.shadow.path[0][0], this.shadow.path[0][1])
        fstCtx.fillStyle = this.shadow.grd
        fstCtx.fill()
      }

      // // 绘画第二层光影（通过twinkle 判断）
      if (!this.shadow2.isDraw) {
        this.shadow2.twinkle ? this.shadow2.isDraw = false : this.shadow2.isDraw = true
        let secCtx = this.shadow2.twinkle ? Ctx : Ctx2
        secCtx.initCtx()
        secCtx.beginPath()
        if (this.shadow2.twinkle && random(1, 20) === 1) {
          secCtx.globalAlpha = random(7, 9) / 10
        } else {
          secCtx.globalAlpha = 1
        }
        this.shadow2.path.forEach((e, i) => {
          i === 0 ? secCtx.moveTo(e[0], e[1]) : secCtx.lineTo(e[0], e[1])
        })
        secCtx.lineTo(this.shadow2.path[0][0], this.shadow2.path[0][1])
        secCtx.fillStyle = this.shadow2.grd
        secCtx.fill()
      }
    }
  }

  // 获得随机的 三次贝塞尔曲线 路径
  // x, y 浮光起始坐标;ox:x便宜量;oy:y偏移量;
  function InitPath({
    x,
    y,
    ox,
    hfh,
    hf,
    oy,
    curve,
    curveEy,
    curveEx,
    across
  }) {
    let path = [],
      p = {
        x: random(-ox, ox) + x,
        y: y + random(-hfh / 2, hfh / 2)
      }
    if (across) { // 横向的浮光
      path.push([p.x, p.y])
      path.push([p.x, p.y])
      // let dir = random(0, 1),
      //   nowY = p.y,
      //   initY = random(5, 10)
      let offsetX = curveEy / 10
      let offsetY = curveEx / 5
      path.push([p.x + curveEy * 3 / 4 + random(-offsetX, offsetX), p.y - random(0, 2 * offsetY), p.x + curveEy * 7 /
        8 + random(-offsetX, offsetX), p.y - curveEx / 2 - random(0, 2 * offsetY)
      ])

    } else {
      let dir = random(0, 1),
        nowY = y,
        initY = random(5, 10)
      let wav = random(4, 5)
      if (curve) {
        let offsetY = random(0, hfh)
        path.push([x, y + offsetY])
        path.push([x, y + offsetY])
        for (let i = 0; i < wav; i++) {
          let randomX = random(12, 16),
            x1 = dir === 0 ? randomX * i + p.x : p.x - randomX * i,
            y1 = nowY - initY / 4,
            x2 = dir === 0 ? p.x - randomX * i : p.x + randomX * i,
            y2 = nowY - initY / 4 * 3,
            x3 = p.x,
            y3 = nowY - initY

          nowY = nowY - initY
          path.push([x1, y1, x2, y2, x3, y3])
          initY = random(initY, (initY + curveEy / wav))
        }
      } else {
        let offsetX = random(-(hf - 10), hf - 10)
        let offsetY = random(-1, 1) * ( 1 - abs(offsetX) / hf) * (hfh - 10)
        path.push([x + offsetX , y + offsetY])
        path.push([x + offsetX , y + offsetY])
        path.push([x + offsetX , p.y - curveEy])
      }
    }
    // path.forEach((point, i) => {
    //   Ctx2.lineJoin = "round"
    //   if (i === 0) {
    //     Ctx2.lineWidth = 1
    //     Ctx2.moveTo(...point)
    //   } else if (i !== 0) {
    //     if (point.length === 2) {
    //       Ctx2.lineTo(...point)
    //     } else if (point.length === 4) { // 二次贝塞尔曲线
    //       Ctx2.quadraticCurveTo(...point)
    //     } else if (point.length === 6) { // 三次贝塞尔曲线
    //       Ctx2.bezierCurveTo(...point)
    //     }
    //   }
    // })
    // Ctx2.strokeStyle = '#fff'
    // Ctx2.stroke()
    // return curveInit(path)
    return path
  }

  // 浮光类
  function FloatLight({
    rgb,
    trailing,
    flsSizeRound,
    trailingNum,
    pathData
  }) {
    this.flsSizeRound = flsSizeRound
    this.pathData = pathData
    this.path = InitPath(pathData)
    this.nx = this.path[0][0]
    this.ny = this.path[0][1]
    this.frame = 0
    this.count = 0
    this.num = 1
    this.t = 0
    this.gco = random(1, 3) === 1 ? 'destination-over' : 'source-over'
    this.sizeRate = random(10, 20)
    this.ga = random(7, 10) / 10
    this.type = 0 // 0直线，1 二次bsr曲线，2 三次bsr曲线
    this.velocity = pathData.curve ? random(30, 75) / 150 : random(30, 75) / 100
    this.trailing = trailing ? trailing : false
    this.trailingNum = trailing ? trailingNum : 0
    this.rgb = rgb ? rgb : {
      r: random(0, 255),
      g: random(0, 255),
      b: random(0, 255)
    }
    this.clr = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, 1)`
    this.ballShadowArr = []

    this.init = () => { 
      this.count = GetDistance(this.path[this.num - 1][0], this.path[this.num - 1][1], this.path[this.num][0], this
        .path[this.num][1]) / this.velocity // 获得当前路径的帧数
      Ctx.arc(this.nx, this.ny, 2, 0, 2 * Math.PI)
    }

    this.move = () => {
      if ((this.frame >= this.count) && this.type === 0 || (this.t >= 1) && (this.type === 1 || this.type === 2)) {
        // 绘制一个点到另一个阶级判断 
        if (this.num < (this.path.length - 1)) {
          this.num++
        } else {
          this.num = 2
          this.path = InitPath(this.pathData)
        }
        if (this.path[this.num].length === 2) { // 直线路径
          this.type = 0
          this.count = GetDistance(this.path[this.num - 1][0], this.path[this.num - 1][1], this.path[this.num][0],
            this.path[this.num][
              1
            ]) / this.velocity // 获得帧数
          this.frame = 0
          this.t = 0
        } else if (this.path[this.num].length === 4) { // 二次贝塞尔曲线路径
          this.type = 1
          let d = GetDistance(this.path[this.num - 1][0], this.path[this.num - 1][1], this.path[this.num][0], this
              .path[this.num][1]) +
            GetDistance(this.path[this.num][0], this.path[this.num][1], this.path[this.num][2], this.path[this.num][
              3
            ])
          this.count = d / this.velocity
          this.frame = 1 / this.count
          this.t = 0
        } else if (this.path[this.num].length === 6) { // 三次贝塞尔曲线路径
          this.type = 2
          let d = GetDistance(this.path[this.num - 1][0], this.path[this.num - 1][1], this.path[this.num][0], this
              .path[this.num][1]) +
            GetDistance(this.path[this.num][2], this.path[this.num][3], this.path[this.num][0], this.path[this.num][
              1
            ]) +
            GetDistance(this.path[this.num][4], this.path[this.num][5], this.path[this.num][2], this.path[this.num][
              3
            ])
          this.count = d / this.velocity
          this.frame = 1 / this.count * random(10, 15) / 10
          this.t = 0
        }
      }
      let len = this.path[this.num - 1].length
      let pre_po = [this.path[this.num - 1][len - 2], this.path[this.num - 1][len - 1]] // 获得路径系统 最后一个 坐标
      let now_po = this.path[this.num]
      if (this.type === 0) {
        if (pre_po.length === 2) {
          this.nx = (now_po[0] - pre_po[0]) * (this.frame / this.count) + pre_po[0]
          this.ny = (now_po[1] - pre_po[1]) * (this.frame / this.count) + pre_po[1]
        } else if (pre_po.length === 4) {
          this.nx = (now_po[0] - pre_po[2]) * (this.frame / this.count) + pre_po[2]
          this.ny = (now_po[1] - pre_po[3]) * (this.frame / this.count) + pre_po[3]
        } else {
          this.nx = (now_po[0] - pre_po[4]) * (this.frame / this.count) + pre_po[4]
          this.ny = (now_po[1] - pre_po[5]) * (this.frame / this.count) + pre_po[5]
        }
        this.frame++
      } else if (this.type === 1) {
        let pow = Math.pow
        this.nx = pow((1 - this.t), 2) * pre_po[0] +
          2 * this.t * (1 - this.t) * now_po[0] +
          pow(this.t, 2) * now_po[2]

        this.ny = pow((1 - this.t), 2) * pre_po[1] +
          2 * this.t * (1 - this.t) * now_po[1] +
          pow(this.t, 2) * now_po[3]
        this.t = this.t + this.frame
      } else if (this.type === 2) {
        let pow = Math.pow

        this.nx = pre_po[0] * pow((1 - this.t), 3) +
          3 * now_po[0] * this.t * pow((1 - this.t), 2) +
          3 * now_po[2] * pow(this.t, 2) * (1 - this.t) +
          now_po[4] * pow(this.t, 3)

        this.ny = pre_po[1] * pow((1 - this.t), 3) +
          3 * now_po[1] * this.t * pow((1 - this.t), 2) +
          3 * now_po[3] * pow(this.t, 2) * (1 - this.t) +
          now_po[5] * pow(this.t, 3)

        this.t = this.t + this.frame
      }
      Ctx.initCtx()
      Ctx.shadowOffsetX = 0;
      Ctx.shadowOffsetY = 0;
      Ctx.shadowColor = this.clr;
      Ctx.shadowBlur = 10;
      Ctx.beginPath()
      let randomR = this.flsSizeRound ? random(15, 25) / this.sizeRate : .25
      if (this.trailing) {
        this.ga = 1 - (this.frame / this.count)
      }
      if (this.pathData.curve) {
        this.t > .5 ?
        this.ga = 1 - this.t :
          void 0
      }
      let rdg = Ctx.createRadialGradient(this.nx, this.ny, 0, this.nx, this.ny, randomR)
      rdg.addColorStop(0, '#fff')
      rdg.addColorStop(.1, '#fff')
      rdg.addColorStop(1, `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.ga})`)
      Ctx.globalCompositeOperation = this.gco
      Ctx.globalAlpha = this.ga
      Ctx.arc(this.nx, this.ny, randomR, 0, 2 * Math.PI)
      Ctx.fillStyle = rdg
      Ctx.fill()
      let trailingLength = parseInt(48 * this.velocity * random(10, 15) / 10)
      if (this.trailing) {
        if (this.ballShadowArr.length <= trailingLength) {
          this.ballShadowArr.push({
            x: this.nx,
            y: this.ny,
            ga: this.ga
          })
        } else {
          this.ballShadowArr.splice(0, 1)
          this.ballShadowArr.push({
            x: this.nx,
            y: this.ny,
            ga: this.ga
          })
        }
        shadowBall(this.ballShadowArr, this.rgb, trailingLength, randomR)
      }
    }
  }

  function shadowBall(ballShadowArr, rgb, trailingNum, r) { // 绘制拖尾
    ballShadowArr.forEach((e, i) => {
      Ctx.initCtx()
      let clr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${i / trailingNum * .8})`
      Ctx.globalAlpha = e.ga
      Ctx.beginPath()
      Ctx.arc(e.x, e.y, r, 0, 2 * Math.PI)
      Ctx.fillStyle = clr
      Ctx.fill()
    })
  }
  // 创建浮动物体
  function FloatAny({
    x,
    y,
    w,
    h,
    fh,
    obj
  }, ctx) { // s 接受一张图片 或者 canvas 对象
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.fh = fh
    this.sy = this.y
    
    this.v = fh
    / (random(20, 40) / 10 )/* 随机运动 2 - 4s*/
    / random(15, 30) /* 随机 15 - 30帧*/

    this.dir = 1
    this.obj = obj ? obj : getBall({ w, h })
    this.float = () => {
      ctx.initCtx()
      ctx.drawImage(this.obj, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)
      this.y += this.v * this.dir
      if(abs(this.y - this.sy) >= this.fh){
        this.dir *= - 1
      }
    }
  }
  // 创建一个canvas 对象并返回 canvas 对象
  function getBall({ w, h }) {
    let oc = document.createElement('canvas')
    let cx = w / 2,
    cy = h / 2,
    r = w > h ? h / 2 : w / 2
    oc.style.background = "#f00"
    oc.width = w
    oc.height = h

    let c = oc.getContext('2d')
    c.arc(cx, cy, r, 0, 2 * PI)
    c.fillStyle = '#fff'
    c.fill()
    return oc
  }
  window.__proto__.SquareLight = SquareLight
})(window, document)
// xus