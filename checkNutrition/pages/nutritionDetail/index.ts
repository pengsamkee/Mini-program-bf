import { IMyApp } from '../../../app'
import * as webAPI from '../../../api/app/AppService';
import * as globalEnum from '../../../api/GlobalEnum'
import request from '../../../api/app/interface'


const app = getApp<IMyApp>();

let chart = null;
let data = [];
function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const map = {};
  data.forEach(function(obj) {
    console.log(obj)
    if (obj.name==='蛋白质'){
      return map[obj.name] = ' ' + ' ' + ' '+ ' ' + ' ' + obj.percent + '%';
    }else if (obj.name === '脂肪') {
      return map[obj.name] = ' ' + ' ' + ' '+ ' ' + ' ' + ' ' + ' ' + ' ' + obj.percent + '%';
    }else{
      map[obj.name] = ' '+obj.percent + '%';
    }
  });
  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });
  chart.source(data, {
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

class NutritionDetail {

  public data = {
    // opts: {
    //   onInit: initChart,
    // },
    foodInfo:{},
    micro:{},
    options:{},
  }

  public onLoad(options:any) {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    options.foodId = Number(options.foodId);
    options.foodType = Number(options.foodType);
    (this as any).setData({
      options:options
    })
  }
  public onReady(){
    this.getFoodNutritions(this.data.options)
  }
  /**
   * 请求获得食物的营养数据
   */
  public getFoodNutritions(options:any){
    const that:any = this
    wx.showLoading({ title: "加载中..."});
    request.FoodNutritions(options).then(res => {
      const { foodInfo, micro } = res
      foodInfo.contentEnergy = Math.round(foodInfo.contentEnergy)
      let total:Number = 0;
      foodInfo.mainNutrients.map(item=>{
        item.content = Number(item.content.toFixed(1))
        total += item.content
      });
      that.setData({
        foodInfo: foodInfo,
        micro:micro
      })
      let newData:any = []
      foodInfo.mainNutrients.map(item => {
        item.percent = Math.round(item.content*100/total)
        item.a = '1'
        newData.push(item)
      })
      data = newData;
      let salesTrendChartComponent = that.selectComponent('#canvasf2');
      salesTrendChartComponent.init(initChart)
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title:'获取数据失败',
        icon:'none'
      }) 
    })
  }
}

Page(new NutritionDetail())
