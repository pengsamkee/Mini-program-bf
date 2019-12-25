
import request from '../../../api/app/interface'

let chart = null;
let data1 = [];
function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const map = {};
  data1.forEach(function(obj) {
    console.log(obj)
    if (obj.name==='蛋白质'){
      if(obj.percent>9){
        return map[obj.name] = `       `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `       `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }else if (obj.name === '脂肪') {
      if(obj.percent>9){
        return map[obj.name] = `          `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `          `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }else{
      if(obj.percent>9){
        return map[obj.name] = `   `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `   `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }
  });
  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });
  chart.source(data1, {
    percent: {
      formatter: function formatter(val) {
        return val + '%';
      }
    }
  });
  chart.tooltip(false);
  chart.legend({
    position: 'right',
    itemFormatter: function itemFormatter(val) {
      return val + ' ' + map[val];
    }
  });
  chart.coord('polar', {
    transposed: true,
    innerRadius: 0.7,
    radius: 1
  });
  chart.axis(false);
  chart.interval()
    .position('a*percent')
    .color('name', ['#FFB400', '#FF5C47', '#FF822D'])
    .adjust('stack');
  chart.render();
  return chart;
}

class FoodDetail {
  public mealLogId = -1; // 得到taggs信息接口中返回
  // public mealDate = 0; // 上个页面传递来的
  // public mealType = 0; // 上个页面传递来的
  public divideproportion=0;//真实宽度除以720rpx；
  // public imgKey = null;
  public data = {
    currentTagIndex: 0,
    taggs:[],
    imageUrl: "",
    pixelRatio: 2,
    imageWidth:0,
    imageHeight:0,
    energy:null,
  }

  public onLoad(option: any) {
    const parsedInfo = JSON.parse(option.paramJson);
    (this as any).setData({ imageUrl: parsedInfo.imageUrl });
    this.mealLogId = parsedInfo.mealId;
    // this.mealType = parseInt(parsedInfo.mealType);
    // this.mealDate = parseInt(option.mealDate);
    // this.imgKey = parsedInfo.imageUrl.split("/").pop();
  }
  onReady(){
    this.getRecognitionResult();
  }
  

/**
 * 发出识别图片中食物的api
 */
  public getRecognitionResult() {
    var that = this;
    wx.showLoading({ title: "识别中...", mask: true });
    if(this.data.imageHeight===0){
      wx.getImageInfo({
        src: that.data.imageUrl,
        success(res) {
          if(res.height/res.width>0.96){ // 高图
            that.divideproportion = res.height / 720
            that.setData({
              imageHeight:720,
              imageWidth: res.width * 720 / res.height
            })
          }else{ // 宽图
            that.divideproportion = res.width / 750
            that.setData({
              imageWidth: 750,
              imageHeight: res.height * 720 / res.width
            })
          }
          that.getMealLogSummary()
        }
      });
    }else{
      that.getMealLogSummary()
    }
  }
  /**
   * 发出请求，获得页面数据
   */
  public getMealLogSummary(){
    const that = this ;
    request.getMealLogSummary({
      mealLogId: that.mealLogId
    }).then(res => {
      that.parseGetRecognitionResult(res);
      wx.hideLoading({});
    }).catch(err => {
      wx.hideLoading();
      wx.showModal({
          title: '获取识别结果失败',
          content: JSON.stringify(err),
          showCancel: false
      });
    });
  }

  /**
   * 解析返回的数据
   */
  public parseGetRecognitionResult(resp) {
    //整理tag数据
    let taggs:any[] = [];
    resp.foodLogSummaryList.map(item=>{
      let it = {
        ...item,
        tagX: item.tagX / (this.divideproportion * 2),
        tagY: item.tagY / (this.divideproportion * 2),
      }
      taggs.push(it);
    });
    (this as any).setData({
      taggs: taggs,
      energy: Math.round(resp.energy)
    },()=>{
      console.log('整理得到初始taggs',this.data.taggs)
    });
    // 整理canvas数据
    for( let index in resp.simpleMacronutrientIntake){
      const item = resp.simpleMacronutrientIntake[index];
      const arrItem = {
        name:item.nameCN,
        percent:Math.round(item.intakeValue.percentage),
        content:Math.round(item.intakeValue.intake),
        unit:item.intakeValue.unit
      }
      data1.push(arrItem)
    }
    let salesTrendChartComponent = this.selectComponent('#canvasf2');
    salesTrendChartComponent.init(initChart);
  }
  
  /**
   * 删除某个对应的tag
   */
  public handleDeleteTag(e:any){
    const that = this;
    const index = e.currentTarget.dataset.textIndex;
    let taggs = [...this.data.taggs];
    if(this.data.taggs.length==1){
      request.deleteMealLog({
        mealLogId: this.mealLogId
      }).then(res=>{
        if(res===true){
          taggs.splice(index,1);
          (that as any).setData({taggs:taggs});
          wx.switchTab({url:'/pages/home/index'})
        }else{
          wx.showToast({title:'删除食物失败',icon:"none"})
        }
      }).catch(err=>{
        wx.showToast({title:'删除食物失败',icon:"none"})
      })
    }else{
      request.deleteFoodLog({
        foodLogId: taggs[index].foodLogId,
        foodType: taggs[index].foodType
      }).then(res=>{
        if(res===true){
          taggs.splice(index,1);
          (that as any).setData({taggs:taggs},()=>{
            //请求新的数据,做页面刷新
            that.getMealLogSummary()
          })
        }else{
          wx.showToast({title:'删除食物失败',icon:"none"})
        }
      }).catch(err=>{
        wx.showToast({title:'删除食物失败',icon:"none"})
      })
    }
  }
  
  public onTagMove(event: any) {
    let index = event.currentTarget.dataset.tagIndex;
    let xOperation = "taggs[" + index + "].tag_x";
    let yOperation = "taggs[" + index + "].tag_y";
    (this as any).setData({
      [xOperation]: event.detail.x,
      [yOperation]: event.detail.y
    });
  }

  /**
   * 点击分享按钮，去分享页面
   */
  public handleGoSharePage(){
    wx.navigateTo({url: `/pages/foodShare/index?mealId=${this.mealLogId}`});
      
  }
}

Page(new FoodDetail());