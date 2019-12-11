// components/circle-progress/circle-progress.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    bg: {
      type: String,
      value: 'bg'
    },
    draw: {
      type: String,
      value: 'draw'
    },
    progressTxt: {
      type: String,
      value: '1 到 4'
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    drawCircleBg: function(id, x, w) {
      this.setData({
        size: 2 * x, // 更新属性和数据的方法与更新页面数据的方法类似
      });
      // 使用 wx.createContext 获取绘图上下文 ctx  绘制背景圆环
      var ctx = wx.createCanvasContext(id, this)
      ctx.setLineWidth(w / 2);
      ctx.setStrokeStyle('#ccc');
      ctx.setLineCap('round')
      ctx.beginPath(); //开始一个新的路径
      //设置一个原点(x,y)，半径为r的圆的路径到当前路径 此处x=y=r
      var rpx = x * wx.getSystemInfoSync().windowWidth/750
      console.log(rpx)
      ctx.arc(rpx, rpx, rpx - w, 0, 2 * Math.PI, false);
      ctx.stroke(); //对当前路径进行描边
      ctx.draw();
    },
    drawCircle(id,x,w,step) {
      this.setData({
        size: 2 * x, // 更新属性和数据的方法与更新页面数据的方法类似
      });
      var context = wx.createCanvasContext(id, this)
      let gradient =''
      if (step<1.2){
        gradient = '#fdcd01'
      } else if (step >= 1.2 && step <= 2.4 ){
        gradient = '#03d747'
      }else{
        gradient = '#ed2c48'
      }
      context.setLineWidth(w/2);
      context.setStrokeStyle(gradient);
      context.setLineCap('round')
      context.beginPath();
      // step从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角通过改变 step 的值确定
      var rpx = x * wx.getSystemInfoSync().windowWidth / 750
      context.arc(rpx, rpx, rpx - w, -Math.PI / 2, step * Math.PI - Math.PI / 2,  false);
      context.stroke();
      context.draw()
    },
    parentWidth:function(elem){
      return elem.parentElement.clientWidth;
    }
  },
  ready: function() {
    console.log("circle-progress componenet is ready")
    this.drawCircleBg('circle_bg', 75, 4);
    // this.drawCircle(`canvas${this.data.index}`, 75,4,this.data.percent*2);
  }
})