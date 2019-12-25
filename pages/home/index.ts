import { IMyApp } from '../../app'
const app = getApp<IMyApp>()
import * as loginAPI from '../../api/login/LoginService';

import * as webAPI from '../../api/app/AppService';
import {
  RetrieveFoodDiaryReq, RetrieveFoodDiaryResp,
  RetrieveOrCreateUserReportReq, RetrieveOrCreateUserReportResp,
  RetrieveMealLogReq, MealLogResp, FoodLogInfo, MealInfo
} from "../../api/app/AppServiceObjs"
import * as globalEnum from '../../api/GlobalEnum'
import * as moment from 'moment';
import * as uploadFile from '../../api/uploader.js';


//***************************init f2 chart part***********************************//
// let salesTrendChartComponent = this.selectComponent('#nutrition_chart1');
// salesTrendChartComponent.init(initChart)
let chart = null;
function initChart(canvas, width, height, F2) {
  const data = [
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


type NutritionInfo = {
  nutrient_name: string;
  intaken_percentage: number;
  progress_color: string;
  intaken_num: number;
  total_num: number;
  unit: string;
}

type Meal = {
  mealId: number;
  mealName: string;
  mealEngry: number;
  suggestedIntake: number;
  mealPercentage: number;
  meals: MealInfo[];
  mealSummary: Food[]
}
type Food = {
  foodName: string;
  energy: number;
  unitName: string;
  weight: number
}

class FoodDiaryPage {
  public userInfo = {}
  public data = {
    opts: {
      onInit: initChart,
    },
    nutrientSummary: [
      { nutrient_name: "热量", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "千卡" },
      { nutrient_name: "脂肪", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" },
      { nutrient_name: "碳水", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" },
      { nutrient_name: "蛋白质", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" }
    ],
    mealList: [
      { meal_id: 0, mealName: '早餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
      { meal_id: 1, mealName: '午餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
      { meal_id: 2, mealName: '晚餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
    ],
    score: 0,
    menuInfo: {},
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
  };
  public mealType = 0;
  public mealDate = 0;
  public path = '';
  public showPersonCheckLoading = false;
  public foodColorTipsArr = ['#0074d9', '#ffdc00','#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
  public mealIndex = 0;


  public onLoad() {
    // wx.navigateTo({url:'./../../homeSub/pages/foodDetail/index'})
    /**
     * 获取右上角胶囊尺寸，计算自定义标题栏位置
     */
    const menuInfo = wx.getMenuButtonBoundingClientRect();
    (this as any).setData({ menuInfo: menuInfo })
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    // let currentTimeStamp = Date.parse(String(new Date()));
    // this.retrieveFoodDiaryData(currentTimeStamp/1000);
  }

  public onShow() {
    this.login();
    // comfirmMeal页面添加完食物后 会触发
    if (this.mealDate !== 0) {
      this.retrieveFoodDiaryData(this.mealDate);
    }
    // this.loadReportBadge();
  }

  /**
   * 获取体重相关信息
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
    wx.navigateTo({
      url:'/pages/weightRecord/index'
    })
  }
  public login() {
    var that = this;
    // 登录
    wx.login({
      success(_res) {
        // 发送 _res.code 到后台换取 openId, sessionKey, unionId
        that.showPersonCheckLoading?"":wx.showLoading({ title: '加载中...' });
        var req = { jscode: _res.code };
        loginAPI.MiniProgramLogin(req).then(resp => {
          console.log('获取token成功',resp);
          that.showPersonCheckLoading ? "" :wx.hideLoading({});
          let userStatus = resp.user_status;
          // webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
          // wx.reLaunch({ url: '/pages/login/index' });
          switch (userStatus) {
            case 1:
              //validation page
              wx.reLaunch({ url: '/pages/login/index' });
              break;
            case 2:
              //onBoarding process page
              if (resp.token) {
                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                wx.reLaunch({ url: '/pages/onBoard/onBoard' });
              }
              break;
            case 3:
              //keep it at home page
              if (resp.token) {
                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                that.authenticationRequest();
                that.retrieveData(); // 获取体重记录
              }
              break;
          }
        }).catch(err => {
          wx.hideLoading({});
          wx.showModal({
            title: '',
            content: '首页登陆失败',
            showCancel: false
          });
        });
      },
      fail(err) {
        wx.showModal({
          title: '',
          content: '首页登陆验证失败',
          showCancel: false
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
            },
            fail: err => {
              console.log(err)
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
    wx.navigateTo({
      url:'/pages/nutritionalDatabasePage/index'
    })
  }
  // public loadReportBadge() {
  //   let token = wx.getStorageSync(globalEnum.globalKey_token);
  //   console.log(token);
  //   if (token) {
  //     let currentDate = moment().startOf('day');
  //     let firstDayOfWeek = currentDate.week(currentDate.week()).day(1).unix();
  //     let lastDayOfWeek = currentDate.week(currentDate.week()).day(7).unix();
  //     let req = {
  //       date_from: firstDayOfWeek,
  //       date_to: lastDayOfWeek
  //     };
  //     webAPI.RetrieveUserReports(req).then(resp => {
  //       wx.hideLoading({});
  //       this.countReportBadge(resp);
  //     }).catch(err => {
  //       console.log(err);
  //     });
  //   }
  // }

  public countReportBadge(resp: any) {
    console.log(resp);
    let reportNum = 0;
    let reports = resp.daily_report;
    for (let index in reports) {
      let report = reports[index];
      if (!report.is_report_generated && !report.is_food_log_empty) {
        let todayTime = moment().startOf('day').unix();
        console.log(todayTime);
        if (report.date < todayTime || (report.date == todayTime && moment(new Date()).hours > 22)) {   //count today reports status after 19
          reportNum++;
        }
      }
    }
    if (reportNum != 0) {
      wx.setTabBarBadge({
        index: 2,
        text: String(reportNum)
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  }
/**
 * api请求今日摄入量和今日饮食记录
 */
  public retrieveFoodDiaryData(currentTimeStamp: number) {
    let req: RetrieveFoodDiaryReq = { date: currentTimeStamp };
    webAPI.RetrieveFoodDiary(req).then(resp => this.foodDiaryDataParsing(resp)).catch(err =>
    const token1 = webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token))//用户可能没有登录，此时不应弹窗
      if (!webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token))){
        console.log(8888, token1)
      }else{
        wx.showModal({
          title: '',
          content: '获取日志失败',
          showCancel: false
        })
      }
    );
  }

  public retrieveMealLog(mealId: number) {
    let req: RetrieveMealLogReq = { meal_id: mealId }
    return webAPI.RetrieveMealLog(req).then(resp => {
      return this.parseMealLog(resp);
    }).catch(err => {
      console.log(err);
      wx.showModal({
        title: '',
        content: '获取食物数据失败',
        showCancel: false
      })
    }
    );
  }
  public parseMealLog(resp: MealLogResp) {
    let foodList: Food[] = [];
    for (let index in resp.food_log) {
      let foodLog: FoodLogInfo = resp.food_log[index];
      let unitObj = foodLog.unit_option.find(o => o.unit_id === foodLog.unit_id);
      let unitName = "份"
      if (unitObj) {
        unitName = unitObj.unit_name;
      }
      let food: Food = {
        foodName: foodLog.food_name,
        energy: Math.floor(foodLog.energy / 100),
        unitName: unitName,
        weight: Math.round(foodLog.weight / 100)
      }
      foodList.push(food)
    }
    return foodList
  }
  public loadMealSummary(resp: RetrieveFoodDiaryResp) {
    let breakfast: Meal;
    let breakfastSummary: Food[] = [];
    let breakfastIds: number[] = [] //得到早餐mael_id数组
    resp.breakfast.forEach((item =>breakfastIds.push(item.meal_id)))
    const breakfastProms = Promise.all(breakfastIds.map(id => this.retrieveMealLog(id))).then(
      result => {
        result.map((list,index) => {
          const tip_color = that.foodColorTipsArr;
          let changedList = list.map( item => item = Object.assign(item, { tip_color: tip_color[index] }))
          breakfastSummary.push(...changedList); // breakfastSummary中获得早餐一共吃了多少食物，不分图片
          let sum = list.reduce((pre, cur) => {// 每个sum代表一张图有多少卡路里
            return cur.energy + pre
          }, 0);
          Object.assign(resp.breakfast[index], { img_engry: sum }, { tip_color: tip_color})
        });
        console.log('meals',resp.breakfast)
        return breakfast = {
          mealId: 0,
          mealName: '早餐',
          mealEngry: Math.floor(resp.breakfast_suggestion.energy_intake / 100),
          suggestedIntake: Math.floor(resp.breakfast_suggestion.suggested_intake / 100),
          mealPercentage: resp.breakfast_suggestion.percentage,
          meals: resp.breakfast,
          mealSummary: breakfastSummary,
        };
      });
    //lunch
    let lunch: Meal;
    let lunchSummary: Food[] = [];
    let lunchIds: number[] = []
    resp.lunch.forEach((item =>lunchIds.push(item.meal_id)));
    const lunchProms = Promise.all(lunchIds.map(id => this.retrieveMealLog(id))).then(
      result => {
        result.map((list,index) => {
          const tip_color = that.foodColorTipsArr;
          let changedList = list.map(item => item = Object.assign(item, { tip_color: tip_color[index] }))
          lunchSummary.push(...changedList);
          let sum = list.reduce((pre, cur) => {// 每个sum代表一张图有多少卡路里
            return cur.energy + pre
          }, 0);
          Object.assign(resp.lunch[index], { img_engry: sum }, { tip_color: tip_color })
        });
        return lunch = {
          mealId: 1,
          mealName: '午餐',
          mealEngry: Math.floor(resp.lunch_suggestion.energy_intake / 100),
          suggestedIntake: Math.floor(resp.lunch_suggestion.suggested_intake / 100),
          mealPercentage: resp.lunch_suggestion.percentage,
          meals: resp.lunch,
          mealSummary: lunchSummary
        };
      });
    //dinner
    let dinner: Meal;
    let dinnerSummary: Food[] = [];
    let dinnerIds: number[] = []
    resp.dinner.forEach((item =>dinnerIds.push(item.meal_id)));
    const dinnerProms = Promise.all(dinnerIds.map(id => this.retrieveMealLog(id))).then(
      result => {
        result.map((list,index) => {
          const tip_color = that.foodColorTipsArr;
          let changedList = list.map(item => item = Object.assign(item, { tip_color: tip_color[index] }))
          dinnerSummary.push(...changedList);
          let sum = list.reduce((pre, cur) => {// 每个sum代表一张图有多少卡路里
            return cur.energy + pre
          }, 0);
          Object.assign(resp.dinner[index], { img_engry: sum }, { tip_color: tip_color})
        });
        return dinner = {
          mealId: 2,
          mealName: '晚餐', mealEngry: Math.floor(resp.dinner_suggestion.energy_intake / 100),
          suggestedIntake: Math.floor(resp.dinner_suggestion.suggested_intake / 100),
          mealPercentage: resp.dinner_suggestion.percentage,
          meals: resp.dinner,
          mealSummary: dinnerSummary
        };
      });
    //additional
    const that = this
    let addition: Meal;
    let additionSummary: Food[] = [];
    let additionIds: number[] = []
    resp.addition.forEach((item =>dinnerIds.push(item.meal_id)));
    const additionProms = Promise.all(additionIds.map(id => this.retrieveMealLog(id))).then(
      result => {
        result.map((list,index) => {
          const tip_color = that.foodColorTipsArr;
          let changedList = list.map(item => item = Object.assign(item, { tip_color: tip_color[index] }))
          additionSummary.push(...changedList);
          let sum = list.reduce((pre, cur) => {  //计算出每张图的能量，并添加进对象
            return cur.energy + pre
          }, 0);
          Object.assign(resp.addition[index], { img_engry: sum }, { tip_color: tip_color})
        });
        return addition = {
          mealId: 3,
          mealName: '加餐',
          mealEngry: Math.floor(resp.addition_suggestion.energy_intake / 100),
          suggestedIntake: Math.floor(resp.addition_suggestion.suggested_intake / 100),
          mealPercentage: resp.addition_suggestion.percentage,
          meals: resp.addition,
          mealSummary: additionSummary
        };

      });
    let mealList: Meal[] = []
    Promise.all([breakfastProms, lunchProms, dinnerProms]).then(
      result => {
        result.map(meal => mealList.push(meal));
        (this as any).setData({ mealList: mealList })
      }
    );

  }

/**
 * 解析获取今日摄入量板块的数据
 */
  public foodDiaryDataParsing(resp: RetrieveFoodDiaryResp) {
    console.log("summary", resp);
    let score = resp.score;
    let energy = resp.daily_intake.energy;
    let protein = resp.daily_intake.protein;
    let carbohydrate = resp.daily_intake.carbohydrate;
    let fat = resp.daily_intake.fat;
    let nutrientSummary = [
      { nutrient_name: "热量", intaken_percentage: energy.percentage, intaken_num: Math.floor(energy.intake / 100), total_num: Math.floor(energy.suggested_intake / 100), unit: "千卡" },
      { nutrient_name: "脂肪", intaken_percentage: fat.percentage, intaken_num: Math.floor(fat.intake / 100), total_num: Math.floor(fat.suggested_intake / 100), unit: "克" },
      { nutrient_name: "碳水化合物", intaken_percentage: carbohydrate.percentage, intaken_num: Math.floor(carbohydrate.intake / 100), total_num: Math.floor(carbohydrate.suggested_intake / 100), unit: "克" },
      { nutrient_name: "蛋白质", intaken_percentage: protein.percentage, intaken_num: Math.floor(protein.intake / 100), total_num: Math.floor(protein.suggested_intake / 100), unit: "克" }
    ]

    this.loadMealSummary(resp);
    // let mealList = [breakfast, lunch, dinner, additional];
    (this as any).setData({
      nutrientSummary: nutrientSummary,
      score: score
    },()=>{
      nutrientSummary.map((item,index)=>{
        (this as any).selectComponent(`#circle${index}`).drawCircle(`canvas`, 75, 4, item.intaken_percentage/100 * 2)
      });
    });
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
    //Convert date to unix timestamp
    let time = event.detail;
    const navTitleTime = time.year + '/' + time.month + '/' + time.date;
    (this as any).setData({ navTitleTime: navTitleTime })
    let date = moment([time.year, time.month - 1, time.date]); // Moment month is shifted left by 1
    //get current timestamp
    this.mealDate = date.unix();
    const todayTimeStamp = moment(new Date());
    if (todayTimeStamp.isSame(date,'d')){
      console.log('选择的日期是今天');
        (this as any).setData({ navTitleTime: '今日' })
    } else {
      //他们不是在同一天
      (this as any).setData({ navTitleTime: navTitleTime })
    } 
    //request API
    this.retrieveFoodDiaryData(this.mealDate);
    //let timeData = time.year + "-" + time.month + "-" + time.date;
  }
  public onDailyReportClick(event: any) {
    this.retrieveDailyReport(this.mealDate);
  }
  public retrieveDailyReport(currentTimeStamp: number) {
    let req: RetrieveOrCreateUserReportReq = { date: currentTimeStamp };
    webAPI.RetrieveOrCreateUserReport(req).then(resp => {
      let reportUrl: string = resp.report_url;
      if (reportUrl && reportUrl != "") {
        wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
      } else {
        wx.showModal({
          title: "",
          content: "请添加当天食物记录",
          showCancel: false
        })
      }
    }).catch(err => console.log(err))
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
          url: "../../pages/textSearch/index?title=" + that.data.mealList[this.mealIndex].mealName + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
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
        that.showPersonCheckLoading = true;
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
      url: './../../homeSub/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate,
    });
  }

  public onImageUploadFailed(){
    console.log("uploadfailed");
    wx.hideLoading();
  }

  public onUploadProgressing(event: any){
    console.log("progress:");
  }

  public naviToFoodDetail(event: any) {
    const defaultImageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    let mealIndex = event.currentTarget.dataset.mealIndex;
    let imageIndex = event.currentTarget.dataset.imageIndex;
    let mealId = this.data.mealList[mealIndex].meals[imageIndex].meal_id;
    let imageKey = this.data.mealList[mealIndex].meals[imageIndex].img_key;
    let imageUrl = imageKey == "" ? defaultImageUrl : "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/" + this.data.mealList[mealIndex].meals[imageIndex].img_key;
    let param = {};
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
