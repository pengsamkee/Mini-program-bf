
import * as webAPI from '../../../api/app/AppService';
import * as globalEnum from '../../../api/GlobalEnum';
import request from '../../../api/app/interface';


let chart = null;
let data = [];
function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const map = {};
  data.forEach(function(obj) {
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

class MealAnalysis {

  public data = {
    foodInfo:{},
    micro:{},
    options:{},
    totalEnergy:0,
  }

  public onLoad(options:any) {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    // options.foodId = Number(options.foodId);
    // options.foodType = Number(options.foodType);
    // (this as any).setData({ options:options })
  }
  public onReady(){
    this.getFoodNutritions(this.data.options)
  }
  /**
   * 请求获得食物的营养数据
   */
  public getFoodNutritions(options:any){
    const that:any = this
    const mainNutrients = [{
        a: "1",
        content: 25,
        name: "蛋白质",
        unit: "克"
    },{
        a: "1",
        content: 41.5,
        name: "碳水化物",
        unit: "克"
    },{
        a: "1",
        content: 1.7,
        name: "脂肪",
        unit: "克"
    }];
      let total:Number = 0;
      mainNutrients.map(item=>{
        item.content = Number(item.content.toFixed(1));
        total += item.content
      });
      (this as any).setData({ totalEnergy:total })
      let newData:any = []
      mainNutrients.map(item => {
        item.percent = Math.round(item.content*100/total)
        item.a = '1'
        newData.push(item)
      })
      data = newData;
    let salesTrendChartComponent = that.selectComponent('#canvasf2');
    salesTrendChartComponent.init(initChart)
  }
}

Page(new MealAnalysis())
