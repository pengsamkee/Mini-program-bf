import { IMyApp } from '../../app'
const app = getApp<IMyApp>()
import * as loginAPI from '../../api/login/LoginService';

import * as webAPI from '../../api/app/AppService';
import {
  RetrieveFoodDiaryReq, RetrieveFoodDiaryResp,
  RetrieveOrCreateUserReportReq,
  RetrieveMealLogReq, MealLogResp, FoodLogInfo, MealInfo
} from "../../api/app/AppServiceObjs";
import * as globalEnum from '../../api/GlobalEnum';
import * as moment from 'moment';
import * as uploadFile from '../../api/uploader.js';
import request from './../../api/app/interface';

//***************************init f2 chart part***********************************//

let chart = null;
function initChart(canvas, width, height, F2) {
  let data = [
    { week: '周日', value: 1200, avg: 2000 },
    { week: '周一', value: 1150, avg: 2000 },
    { week: '周二', value: 1300, avg: 2000 },
    { week: '周三', value: 1200, avg: 2000 },
    { week: '周四', value: 1200, avg: 2000 },
    { week: '周五', value: 1200, avg: 2000 },
    { week: '周六', value: 1200, avg: 2000 }
  ];
  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });
  chart.axis('week', {  //对week对应的纵横坐标轴进行配置
    grid: null,  //网格线
    tickLine:null,
    label:null,
    line:null
  });
  chart.tooltip({
    showCrosshairs: true, // 是否显示中间那根辅助线，点图、路径图、线图、面积图默认展示
    onShow(ev) { // 点击某项后，顶部tip显示的配置 items[0].name:item[0].value
      const { items } = ev; //ev中有x,y坐标和被点击项的信息
      items[0].name = items[0].origin.week;
      items[0].value = items[0].value+'kg';
      items.length = 1
    }
  });

  chart.point()
    .position(["week","value"])
    .style({ fill: '#ffffff', r: 1.7, lineWidth: 1, stroke: '#f3465a' });
  chart.line({
    connectNulls: true // 配置，连接空值数据
  }).position('week*value').color("#ed2c48").shape('smooth');
  chart.render();
  return chart;

  
}

//**************************end of f2 chart init*************************//

class FoodDiaryPage {
  public userInfo = {}
  public data = {
    opts: {
      onInit: initChart,
    },
    nutrientSummary: [
      { name: "热量", percent: 0, intakeNum: '-', totalNum: '-', unit: "千卡" },
      { name: "脂肪", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" },
      { name: "碳水", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" },
      { name: "蛋白质", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" }
    ],
    mealList: [],
    score: '--',
    infoLists: [
      { url: 'https://mp.weixin.qq.com/s/fg1qli0Dk1x9y0WZcOHv8w',image:'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuViamaNiaBibYKibgyVhicPzS5PzOrVn6mOdWaKmNdwcZKX93z9BJTtwnJCqiaauFhu0WoD3twaFvjjWGLA/640?wx_fmt=jpeg',
        title:'秋季饮食攻略!'
      },
      {
        url: 'https://mp.weixin.qq.com/s/-RbDF1ULR0PG7b7RIyUfNw', image: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuVKWiaYgHG0GA9MiaRwsrtEboibjWRQZhz78jGJZLzG3CJlUIicngaYwgYCekDy8C3NoKjByBxY0ibiaVAg/640?wx_fmt=jpeg',
        title: '点外卖就不健康？ 我偏不'
      },
      {
        url: 'https://mp.weixin.qq.com/s/8IcJ7H6q4vtzdlWL3WXIxQ', image: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuWbLRHQEJovBCw4XUxVWKGPJiavPrA9NKPJ4sicF36o3ZZKj2StlhpVoibBv6cs0NHTJic2WFAERdeic3Q/640?wx_fmt=jpeg',
        title: '营养师如何对老中少胖友进行运动治疗？ 看看蓝皮书怎么说'
      }
    ],
    navTitleTime:'',//导航栏处显示的时间
    latest_weight:' ',
    showMask:false,
    statusHeight:null,
    navHeight:null,
  };
  public mealType = 0;
  public mealDate = 0;
  public path = '';
  // public showPersonCheckLoading = false;
  public foodColorTipsArr = ['#0074d9', '#ffdc00','#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
  public mealIndex = 0;


  public onLoad() {
    // wx.navigateTo({url:'./../../homeSub/pages/mealAnalysis/index?mealLogId=20876&mealDate=1577376000&mealType=1'})
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
  }
  
  public onShow() {
    this.login();
    // comfirmMeal页面添加完食物后 会触发
    if (this.mealDate !== 0) {
      // this.retrieveFoodDiaryData(this.mealDate);
      this.getDailyMealLogGroupFoodLogDetail(this.mealDate);
      this.getDailyMacronutrientSummary(this.mealDate);
    }
  }
  
  public onReady(){
    if(app.globalData.statusHeight==null || app.globalData.navHeight==null){
      const systemInfo = wx.getSystemInfoSync()
      const statusHeight = systemInfo.statusBarHeight
      const isiOS = systemInfo.system.indexOf('iOS') > -1  
      var navHeight;
      if (!isiOS) { // 安卓
          navHeight = 48; 
        } else {                
          navHeight = 44;            
      }
      (this as any).setData({ 
        statusHeight,
        navHeight
      });
    }else{
      (this as any).setData({ 
        statusHeight:app.globalData.statusHeight,
        navHeight:app.globalData.navHeight
      });
    }
  }
  /**
   * 得到首页canvas数据
   */
  public getDailyMacronutrientSummary(date){
    const that = this 
    const token = wx.getStorageSync(globalEnum.globalKey_token);
    if(token){
      request.getDailyMacronutrientSummary({date}).then(res=>{
        that.parseDailyMacronutrientSummary(res);
      }).catch(err=>{
        console.log(88,err)
      })
    }
  }

  /**
   * 解析首页canvas数据
   */
  public parseDailyMacronutrientSummary(res){
    const format = (num) => Math.round(num);
    let score = res.score;
    let nutrientSummary = [
      { 
        name: "热量", 
        percent: format(res.energyIntake/res.energyRecommendedIntake*100), 
        intakeNum: format(res.energyIntake), 
        totalNum: format(res.energyRecommendedIntake), 
        unit: "千卡" 
      },
    ];
    for (let index in res.macronutrientIntake){
      const item = res.macronutrientIntake[index];
      item.name = item.nameCN;
      item.percent = format(item.percentage.percentage);
      item.intakeNum = format(item.intake.intake);
      item.totalNum = format(item.intake.suggestedIntake);
      item.unit = "克" ;
      nutrientSummary.push(item)
    }
    nutrientSummary.map((item,index)=>{
      (this as any).selectComponent(`#circle${index}`).drawCircle(`canvas`, 75, 4, item.percent/100 * 2)
    });
    (this as any).setData({
      nutrientSummary: nutrientSummary,
      score: score
    });
  }

  /**
   * 获取饮食记录相关信息
   */
  public getDailyMealLogGroupFoodLogDetail(date){
    const that = this
    const token = wx.getStorageSync(globalEnum.globalKey_token);
    if(token){
      request.getDailyMealLogGroupFoodLogDetail({date}).then(res=>{
        that.parseDailyMealLogGroupFoodLogDetail(res);
      }).catch(err=>{
        wx.showToast({ title: '获取食物记录失败', icon: 'none' });
      })
    }
  }
  /**
   * 解析饮食记录相关信息
   */
  public parseDailyMealLogGroupFoodLogDetail(res){
    let mealList = []
    for (let index in res){
      let meal = res[index];
      meal.energyIntake = Math.round(meal.energyIntake);
      meal.recommendedEnergyIntake = Math.round(meal.recommendedEnergyIntake);
      meal.mealSummary = [];
      meal.mealLogSummaryVOS&&meal.mealLogSummaryVOS.map((item,index)=>{
        item.energy = Math.round(item.energy); 
        item.colorTip = this.foodColorTipsArr[index];
        item.foodLogSummaryList.map(it=>{
          it.colorTip = this.foodColorTipsArr[index];
          it.energy = Math.round(it.energy)
          meal.mealSummary.push(it)
        })
      });
      mealList.push(meal)
    };
    (this as any).setData({mealList})
  }

  /**
   * 获取体重相关信息,onshow中触发
   */
  public retrieveData(): void {
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    webAPI.SetAuthToken(token);
    let that = this;

    let currWeek: number = moment().week();
    let firstDayOfWeek: number = moment().week(currWeek).day(0).unix();
    let lastDayOfWeek: number = moment().week(currWeek).day(6).unix();

    const todayTime = Number(moment().startOf('day').format('X'));
    const before30dayTime = Number(moment().subtract(30, "days").startOf('day').format('X'));
    setTimeout(function () {
      let req = {
        date_from: before30dayTime,
        date_to: todayTime
      };

      webAPI.RetrieveWeightLog(req).then(resp => {
        console.log('RetrieveWeightLog', resp);
        (that as any).setData({
          latest_weight: resp.latest_weight.value
        })
        const nearDataArr:any = [];
        let total = 0;// 获取一位小数点的平均值，先求总和
        resp.weight_logs.map(item=>{
          total = total + item.value
          const beforeNumberDay = (todayTime - item.date) / 86400
          const formatDate = moment(item.date*1000).format('MM/DD');
          nearDataArr[30 - beforeNumberDay] = { week: formatDate, value: item.value, avg: 2000 }
        })
        const average = Math.round(total*10 / resp.weight_logs.length)/10
        // 稀疏数组需要用for，不能用map。
        // 30天内用户第一个没有更新体重的日期赋值为体重平均值，别的日期都赋值为null
        let len = nearDataArr.length;
        let flag = true;
        for (let i = 0;i<len;i++){
          if (!nearDataArr[i] && flag) {
            const data = moment().subtract(30-i, "days").format('MM/DD');
            nearDataArr[i] = { week: data, value: average, avg: 2000 }
            flag = false
          } else if (!nearDataArr[i]){
            const data = moment().subtract(30 - i, "days").format('MM/DD');
            nearDataArr[i] = { week: data, value:null, avg: 2000 }
          }
        }
        chart.axis(false);
        chart.changeData(nearDataArr);
      }).catch(err => {
        console.log('获取体重数据失败',err)
        wx.showModal({
          title: '',
          content: '获取体重数据失败',
          showCancel: false
        });
      });
    }, 200);
  }

  public goWeightRecord(){
    wx.navigateTo({ url:'/pages/weightRecord/index' })
  }
  public login() {
    var that = this;
    wx.login({
      success(_res) {
        var req = { jscode: _res.code };
        loginAPI.MiniProgramLogin(req).then(resp => {
          let userStatus = resp.user_status;
          switch (userStatus) {
            case 1: //validation page
              wx.reLaunch({ url: '/pages/login/index' });
              break;
            case 2: //onBoarding process page
              if (resp.token) {
                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                wx.reLaunch({ url: '/pages/onBoard/onBoard' });
              }
              break;
            case 3: //keep it at home page
              if (resp.token) {
                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                that.authenticationRequest();
                that.retrieveData(); // 获取体重记录
              }
              break;
          }
        }).catch(err => {
          wx.showModal({
            title: '',
            content: '首页登陆失败',
            showCancel: false
          });
        });
      }
    })
  }
  public authenticationRequest() {
    const that = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
            }
          })
        } else {
          wx.navigateTo({
            url: '../login/index?user_status=3'
          })
        }
      }
    })

  }

  public goNutritionalDatabasePage(){
    wx.navigateTo({ url:'/pages/nutritionalDatabasePage/index' })
  }

  public bindNaviToOtherMiniApp() {
    //test on navigate miniProgram
    wx.navigateToMiniProgram({
      appId: 'wx4b74228baa15489a',
      path: '',
      envVersion: 'develop',
      success(res: any) {
        // 打开成功
        console.log("succcess navigate");
      },
      fail(err: any) {
        console.log(err);
      }
    })
  }
  public triggerBindgetdate(){
    (this as any).selectComponent('#calendar').dateSelection()
  }

  //when openning the calendar
  public bindselect(event: any) {
    console.log(event);
  }

  //默认主动会触发一次
  public bindgetdate(event: any) {
    
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    let time = event.detail;
    let navTitleTime = time.year + '/' + time.month + '/' + time.date;
    let date = moment([time.year, time.month - 1, time.date]); // Moment month is shifted left by 1
    
    this.mealDate = date.unix();
    if(app.globalData.mealDate){
      this.mealDate = app.globalData.mealDate;
      navTitleTime = moment(this.mealDate*1000).format('YYYY/MM/DD')
      app.globalData.mealDate = null;
    }
    const todayTimeStamp = moment(new Date());
    const formatMealData = moment(this.mealDate*1000);
    if (todayTimeStamp.isSame(formatMealData,'d')){
      (this as any).setData({ navTitleTime: '今天' })
    } else { 
      (this as any).setData({ navTitleTime })
    } 
    // this.retrieveFoodDiaryData(this.mealDate);
    this.getDailyMacronutrientSummary(this.mealDate) // 获取canvas信息
    this.getDailyMealLogGroupFoodLogDetail(this.mealDate) // 获取mealList信息
  }

  public onDailyReportClick() {
    if(this.data.score===0){
      wx.showModal({
        title: "",
        content: "您今天还没有添加食物哦",
        showCancel: false,
        confirmText:'去添加'
      })
      return
    }
    wx.showLoading({ title: "加载中..."});
    const token = wx.getStorageSync(globalEnum.globalKey_token);
    request.getUserProfileByToken({token}).then(resp => {
      let userId: string = resp.userId;
      wx.hideLoading({});
      wx.navigateTo({ url: `/pages/reportPage/reportPage?userId=${userId}&date=${this.mealDate}`});
    }).catch(err => {
      wx.hideLoading({});
      console.log(err)
    })
  }
  
  public addFoodImage(event: any) {
    this.mealIndex = event.currentTarget.dataset.mealIndex;
    this.mealType = this.mealIndex + 1;
    (this as any).setData({showMask:true})
    // wx.showActionSheet({
    //   itemList: ['拍照记录', '相册', '文字搜索'],
    //   success(res: any) {
    //     switch (res.tapIndex) {
    //       case 0:
    //         that.chooseImage('camera');
    //         wx.reportAnalytics('record_type_select', {
    //           sourcetype: 'camera',
    //         });
    //         break;
    //       case 1:
    //         that.chooseImage('album');
    //         wx.reportAnalytics('record_type_select', {
    //           sourcetype: 'album',
    //         });
    //         break;
    //       case 2:
    //         wx.navigateTo({
    //           url: "../../pages/textSearch/index?title=" + that.data.mealList[mealIndex].mealName + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
    //         });
    //         wx.reportAnalytics('record_type_select', {
    //           sourcetype: 'textSearch',
    //         });
    //         break;
    //     }
    //   }
    // });
  }

  public handleChooseUploadType(e:any){
    const that = this
    const index = parseInt(e.currentTarget.dataset.index);
    switch (index) {
      case 0:
        that.chooseImage('camera');
        wx.reportAnalytics('record_type_select', {
          sourcetype: 'camera',
        });
        break;
      case 1:
        that.chooseImage('album');
        wx.reportAnalytics('record_type_select', {
          sourcetype: 'album',
        });
        break;
      case 2:
        wx.navigateTo({
          url: "../../pages/textSearch/index?title=" + that.data.mealList[this.mealIndex].mealTypeName + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
        });
        wx.reportAnalytics('record_type_select', {
          sourcetype: 'textSearch',
        });
        break;
    }
    ( this as any ).setData({showMask:false})
  }

  public chooseImage(sourceType: string) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [sourceType],
      success: function (res: any) {
        wx.showLoading({ title: "上传中...", mask: true });
        // that.showPersonCheckLoading = true;
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
      url: './../../homeSub/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate+"&title="+this.data.mealList[this.mealIndex].mealTypeName,
    });
  }

  public onImageUploadFailed(){
    console.log("uploadfailed");
    wx.hideLoading({});
  }

  public onUploadProgressing(event: any){
    console.log("progress:");
  }

  public naviToFoodDetail(event: any) {
    const defaultImageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    let mealIndex = event.currentTarget.dataset.mealIndex;
    let imageIndex = event.currentTarget.dataset.imageIndex;
    let mealId = this.data.mealList[mealIndex].mealLogSummaryVOS[imageIndex].mealLogId;
    let imageUrl = this.data.mealList[mealIndex].mealLogSummaryVOS[imageIndex].imageUrl;
    imageUrl = imageUrl == "" ? defaultImageUrl : imageUrl;
    let param = {};
    param.mealIndex = mealIndex; // 传到foodDetail页面，做更新功能
    param.imageIndex = imageIndex; // 传到foodDetail页面，做更新功能
    param.mealId = mealId;
    param.imageUrl = imageUrl;
    let paramJson = JSON.stringify(param);
    wx.navigateTo({
      url: "./../../homeSub/pages/foodDetail/index?paramJson=" + paramJson
    });
  }
  /**
   * 关闭showMask
   */
  public handleHiddenMask(){
    if(this.data.showMask){
      (this as any).setData({showMask:false})
      return false
    }
  }
}

Page(new FoodDiaryPage())
