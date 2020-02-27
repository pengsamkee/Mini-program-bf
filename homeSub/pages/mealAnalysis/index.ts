let app =  getApp();

import request from '../../../api/app/interface';
import * as moment from 'moment';
import * as uploadFile from './../../../api/uploader.js';


let chart = null;
let data = [];
function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const map = {};
  data.forEach(function(obj) {
    if (obj.name==='蛋白质'){
      if(obj.percent>9){
        return map[obj.name] = `       `+ obj.percent + '%' + `    ` + '推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
      }else{
        return map[obj.name] = `       `+ obj.percent + '%'+ `      ` + '推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
      }
    }else if (obj.name === '脂肪') {
      if(obj.percent>9){
        return map[obj.name] = `          `+ obj.percent + '%' + `    ` +'推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
      }else{
        return map[obj.name] = `          `+ obj.percent + '%'+ `      ` + '推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
      }
    }else{
      if(obj.percent>9){
        return map[obj.name] = `   `+ obj.percent + '%' + `    ` +'推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
      }else{
        return map[obj.name] = `   `+ obj.percent + '%'+ `      ` +'推荐'+obj.suggestedPercentageLower+'%-'+obj.suggestedPercentageUpper+'%';
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
type options = {
  mealType:number
  mealDtate:number
  title:string
}
class MealAnalysis {
  public mealType = null;
  public mealDate = null;
  public mealLogId = null;
  public path = null;
  public title = null;
  public data = {
    energyStatusArr:[
      '热量摄入较低，会影响新陈代谢，建议您多吃点！',
      '热量摄入合理，请继续保持!',
      '热量摄入略高，会增加体重，影响身体健康，可以少吃点~'
    ],
    foodInfo:{},
    micro:{},
    options:{},
    totalEnergy:0,
    a:100,
    b:30,
    info:null,
    suggestedNumOfDailyFoodCategory:null,
    numOfDailyFoodCategory:null,
    lessType:'', // 看哪个种类摄入过少
    energyTip:'',
    intake:null,
    suggestedIntake:null,
    energyStatus:null,
    showMask:false,
    mealName:null,
    hour:null,
    needNumber:null,
  }

  public onLoad(options:options) {
    this.mealType = parseInt(options.mealType);
    switch (this.mealType) {
      case 1:
        (this as any).setData({mealName:'早餐'})
        break;
      case 2:
        (this as any).setData({mealName:'午餐'})
        break;
      case 3:
        (this as any).setData({mealName:'晚餐'})
        break;
    }
    this.mealDate = parseInt(options.mealDate);
    this.mealLogId = parseInt(options.mealLogId);
    app.globalData.mealDate = this.mealDate;
    this.title = options.title;
    this.getSimpleDailyAnalysis()
  }
  public onShow(){
    const hour = Number(moment().format('H'));
    let needNumber;
    if(hour<10){
      needNumber = 4
    }else if(hour>=10&&hour<16){
      needNumber = 8
    }else{
      needNumber = 12
    }
    this.setData({
      hour,
      needNumber
    })
  }
  public onReady(){
    this.getMealMacronutrientAnalysis()
  }
  /**
   * 请求获取各文字提示信息
   */
  public getSimpleDailyAnalysis(){
    const that = this;
    request.getSimpleDailyAnalysis({
      date:this.mealDate,
      mealType:this.mealType,
      mealLogId:this.mealLogId
    }).then(res=>{
      that.parseSimpleDailyAnalysisData(res);
    }).catch(err=>{
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
  /**
   * 解析页面中文字数据
   */
  public parseSimpleDailyAnalysisData(res){
    res.lessFoodGroups&&res.lessFoodGroups.map(item=>{
      item.intakeValue.intake = Math.round(item.intakeValue.intake)
      item.intakeValue.suggestedIntake = Math.round(item.intakeValue.suggestedIntake)
    });
    let {suggestedNumOfDailyFoodCategory,numOfDailyFoodCategory} = res;
    (this as any).setData({
      info:res,
      suggestedNumOfDailyFoodCategory:suggestedNumOfDailyFoodCategory,
      numOfDailyFoodCategory:numOfDailyFoodCategory
    })
  }

  /**
   * 请求获得canvas的信息
   */
  public getMealMacronutrientAnalysis(){
    const that:any = this
    request.getMealMacronutrientAnalysis({ 
      date:this.mealDate,
      mealType:this.mealType,
      mealLogId:this.mealLogId
    }).then(res=>{
      that.parseMealLogSummaryDate(res)
    }).catch(err=>{
      wx.showToast({ title: err.message, icon: 'none' })
    })
  }
  /**
   * 解析获取到的canvas信息
   */
  public parseMealLogSummaryDate(res:any){
    let lessType = '';
    for( let index in res.macronutrientIntake){
      // 整理canvas数据
      const item = res.macronutrientIntake[index];
      const arrItem = {
        name:item.nameCN,
        percent:Math.round(item.percentage.percentage),
        suggestedPercentageLower:item.percentage.suggestedPercentageLower,
        suggestedPercentageUpper:item.percentage.suggestedPercentageUpper,
      }
      data.push(arrItem);
      //整理标题数据，看哪个种类摄入过少
      if(item.percentage.status===-1){
        lessType+=item.nameCN+'、'
      }
    };
    let salesTrendChartComponent = this.selectComponent('#canvasf2');
    salesTrendChartComponent.init(initChart);

    lessType = lessType.slice(0,lessType.length-1);

    const intake = Math.round(res.energyIntake.intakeValue.intake); 
    const suggestedIntake = Math.round(res.energyIntake.intakeValue.suggestedIntake); 
    const energyStatus = res.energyIntake.intakeValue.status;
    (this as any).setData({
      lessType:lessType,
      intake,
      suggestedIntake,
      energyStatus
    })
  }
  /**
   * 去分享
   */
  public goSharePage(){
    wx.navigateTo({ url: '/pages/foodShare/index?mealId='+this.mealLogId });
  }
  public goHomePage(){
    wx.switchTab({ url: `/pages/home/index`})
  }
  public handleContinueAdd(){
    (this as any).setData({showMask:true})
  }
  public handleHiddenMask(){
    (this as any).setData({showMask:false})
  }
  public handleChooseUploadType(e:any){
    const that = this
    const index = parseInt(e.currentTarget.dataset.index);
    switch (index) {
      case 0:
        that.chooseImage('camera');
        wx.reportAnalytics('record_type_select', { sourcetype: 'camera' });
        break;
      case 1:
        that.chooseImage('album');
        wx.reportAnalytics('record_type_select', { sourcetype: 'album' });
        break;
      case 2:
        wx.navigateTo({
          url: "/pages/textSearch/index?title=" + that.title + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
        });
        wx.reportAnalytics('record_type_select', { sourcetype: 'textSearch' });
        break;
    }
    (this as any).setData({showMask:false})
  }

  public chooseImage(sourceType: string) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [sourceType],
      success: function (res: any) {
        wx.showLoading({ title: "上传中...", mask: true });
        let imagePath = res.tempFilePaths[0];
        that.path = imagePath;
        uploadFile(imagePath, that.onImageUploadSuccess, that.onImageUploadFailed, that.onUploadProgressing, 0, 0);
      },
      fail: function (err: any) {
        console.log(err);
      }
    });
  }

  public onImageUploadSuccess(){
    wx.navigateTo({
      url: './../imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate+"&title="+this.title
    });
  }

  public onImageUploadFailed(){
    console.log("uploadfailed");
    wx.hideLoading();
  }

  public onUploadProgressing(event: any){
    console.log("progress:");
  }
}

Page(new MealAnalysis())
