import { IMyApp } from '../../app'
const app = getApp<IMyApp>()
// import * as wxCharts from '/utils/wxcharts';
import * as globalEnum from '../../api/GlobalEnum';
import * as webAPI from '../../api/app/AppService';
import * as loginAPI from '../../api/login/LoginService';
import * as moment from 'moment';
/**
 * 下面这一行的引入是为了更新数据库的昵称头像，发布后一段时间可删除
 */
import { UpdateUserProfileReq } from "../../api/app/AppServiceObjs";
import { RetrieveHomePageInfoReq, RetrieveCardListResp, CardInfo } from "/api/app/AppServiceObjs";
// var webAPI = require('./api/login/LoginService');

//cardType  1:meal 2:article 3:report-daily 4:report-weekly  5:feedback  6:reminder 7:event
 

//**************************************************init f2 chart part**************************************************

let chart = null; // 使用前css中要配置组件的宽高
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
    height,
    animate: true,
  });

  // chart.source(data, {
  //   value: {
  //     min: 0,
  //     max: 3000,
  //     tickInterval: 10,
  //     nice: false
  //   },
  //   avg: {
  //     min: 0,
  //     max: 3000,
  //     tickInterval: 10,
  //     nice: false
  //   }
  // });
  
  chart.axis('week', {  //对week对应的纵横坐标轴进行配置
    grid: null  //网格线
  });
  chart.tooltip({
    showCrosshairs: true, // 是否显示中间那根辅助线，点图、路径图、线图、面积图默认展示
    onShow(ev) { // 点击某项后，顶部tip显示的配置 items[0].name:item[0].value
      const { items } = ev; //e v中有x,y坐标和被点击项的信息
      items[0].name = "热量";
    }
  });

  chart.interval().position('week*value').color("#ed2c48"); // 柱状图宽*高，填充的颜色
  // chart.line().position('week*value').color('#f4f4f4').shape('smooth');
  // chart.point().position('week*value').style({
  //   stroke: 'red',
  //   fill: '#369',
  //   lineWidth: 2
  // });
  let targetLine = 0;
  // 绘制辅助线
  chart.guide().line({
    start: ['周日', targetLine],
    end: ['周六', targetLine],
    style: {
      stroke: '#d0d0d0', // 线的颜色
      lineDash: [0, 2, 2], // 虚线的设置
      lineWidth: 1 // 线的宽度
    } // 图形样式配置
  });
  chart.guide().text({
    position: ['周日', 'max'],
    // position(xScale, yScales) {
    //   let sum = 0;
    //   const yScale = yScales[1];
    //   yScale.values.forEach(v => (sum += v));
    //   return ['max', sum / yScale.values.length]; 
    // },
    content: '',
    style: {
      textAlign: 'start',
      textBaseline: 'top',
      fill: '#5ed470'
    },
    offsetX: -25,
    offsetY: 15
  });

  chart.render();
  return chart;

}

//**************************************************end of f2 chart init**************************************************

class HomePage {
  public bartChart: any;
  public userInfo:any = {}
  public data = {
    average_energy: 1104,
    target_energy: 1205,
    cardList: [
      { card_title: "体重", card_weight_value: 0.0, card_desc: "公斤", card_bar_color: "#ff822d", card_redirect_path: "/pages/weightRecord/index" },
      { card_title: "营养推荐值", card_desc: "营养平衡", card_bar_color: "#ffb400", card_redirect_path: "/pages/rdiPage/rdiPage" },
      { card_title: "营养知识", card_desc: "知食营养师组", card_bar_color: "#ff5c47", card_redirect_path: "/pages/nutritionalDatabasePage/index" }
    ],
    activityCardList: [
      // { id: 0, name: "10种症状带你了解什么是碘缺乏！", description: "512千卡", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/article/iodine.png", link: "https://mp.weixin.qq.com/s/mIiyf9N5uX-6EZStWPro5g", time: "14:11", cardType: 2, checked: false },
      // { id: 1, name: "运动打卡", description: "今日", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/feed/daily_report.png", link: "", time: "09:11", cardType: 3, checked: false },
      // { id: 2, name: "早餐打卡", description: "今日", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/feed/meal_breakfast.png", link: "", time: "09:11", cardType: 1, checked: false },
      // { id: 3, name: "午餐打卡", description: "今日", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/feed/meal_lunch.png", link: "", time: "14:11", cardType: 1, checked: false },
      // { id: 4, name: "晚餐打卡", description: "今日", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/feed/meal_dinner.png", link: "", time: "09:11", cardType: 1, checked: false },
      // { id: 5, name: "体重打卡", description: "今日", image: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/feed/weight.png", link: "", time: "19:11", cardType: 6, checked: false }
    ],
    opts: {
      onInit: initChart
    },
    quesTitle: "",
    currentSurveyId: 0,
    isAnswerPositive: true,
    showFeedbackDlg: false,
    questionText: "",
    showQuesDlg: false,
    /**
     * 下面是为了自动更新数据库头像昵称丢失的问题，发布一段时间后可删除代码
     */
    birthday: 2000,
    ageGroupIndex: 3,
    ageGroup: ['6个月以下', '6个月-1岁', '1-3岁', '3-4岁', '4-7岁', '7-10岁', '10-11岁', '11-14岁', '14-18岁', '18-30岁', '30-50岁', '50-60岁', '60-65岁', '65-80岁', '80岁以上'],
    genderIndex: 1,
    genderArray: ['', '男', '女'],
    height: 170,
    currentWeight: 50,
    weightBeforePreg: 60,
    pregnancyStatusIndex: 1,
    pregnancyStatusArray: ['都不是', '备孕', '已孕', '哺乳期'],
    activityLevelIndex: 1,
    activityLevelArray: ['卧床休息', '轻度,静坐少动', '中度,常常站立走动', '重度,负重', '剧烈，超负重'],
    pregnancyDate: {
      date: moment().format("YYYY-MM-DD"),
      year: moment().format("YYYY"),
      month: moment().format("MM"),
      day: moment().format("DD")
    },
  }

  public login() {
    var that = this;
    // 登录
    wx.login({
      success(_res) {
        console.log(_res);
        // 发送 _res.code 到后台换取 openId, sessionKey, unionId
        wx.showLoading({ title: '加载中...' });
        var req = { jscode: _res.code };
        loginAPI.MiniProgramLogin(req).then(resp => {
          console.log(resp);
          wx.hideLoading({});
          let userStatus = resp.user_status;
          webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
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
                that.initHomePageInfo();
                that.initHomePageCard()
              }
              break;
          }

        }).catch(err => {
          wx.hideLoading({});
          console.log(err);
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
              console.log('get getUserInfo' + res.userInfo);
              app.globalData.userInfo = res.userInfo
     /**
     * 下面一行是为了自动更新数据库头像昵称丢失的问题，发布一段时间后可删除代码
     */ 
              that.userInfo = res.userInfo
            },
            fail: err => {
              console.log(err)
            }
          })
        } else {
          wx.navigateTo({
            url: '../invitation/invitation?user_status=3'
          })
        }
      }
    })

  }

  public loadReportBadge() {
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    if (token) {
      let currentDate = moment().startOf('day');
      console.log("home:" + currentDate.unix());
      let firstDayOfWeek = currentDate.week(currentDate.week()).day(1).unix();
      let lastDayOfWeek = currentDate.week(currentDate.week()).day(7).unix();
      let req = {
        date_from: firstDayOfWeek,
        date_to: lastDayOfWeek
      };
      console.log(req);
      webAPI.RetrieveUserReports(req).then(resp => {
        wx.hideLoading({});
        this.countReportBadge(resp);
      }).catch(err => console.log(err));
    }
  }

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

  public onShow() {
    this.login();
    /**
     * 下面是为了自动更新数据库头像昵称丢失的问题，发布一段时间后可删除代码
     */
    const that = this
    setTimeout(()=>{
      that.getProfileData();
    },2000)
  }
   /**
   * 下面的方法是为了自动更新数据库头像昵称丢失的问题，发布一段时间后可删除代码
   */
  public getProfileData() {
    var req = {};
    var that = this;
    webAPI.RetrieveUserProfile(req).then(resp => {
      console.log("Retrieving user profile...");
      console.log(resp);
      let keys = Object.keys(resp);
      let errorChecking = [];
      for (var i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (resp[key] === -1 || resp[key] === '') {
          errorChecking[i] = true;

        } else {
          errorChecking[i] = false;
        }
        (that as any).setData({
          errorChecking: errorChecking
        });
      }
      console.log("get data", this.data);

      // parse pregnancyDate timestamp
      let tempDate: moment;
      if (resp.expected_birth_date == -1) {
        tempDate = moment();
      } else {
        tempDate = moment.unix(resp.expected_birth_date);
      }
      (that as any).setData({
        genderIndex: resp.gender,
        birthday: resp.year_of_birth == -1 ? 1980 : resp.year_of_birth,
        height: resp.height == -1 ? 0 : resp.height,
        currentWeight: resp.weight == -1 ? 0 : resp.weight,
        weightBeforePreg: resp.weight_before_pregnancy == -1 ? 0 : resp.weight_before_pregnancy,

        pregnancyStatusIndex: resp.pregnancy_stage,
        activityLevelIndex: resp.activity_level - 1,
        externalId: resp.external_id,

        pregnancyDate: {
          date: tempDate.format('YYYY-MM-DD'),
          year: tempDate.format('YYYY'),
          month: tempDate.format('MM'),
          day: tempDate.format('DD')
        },
      });
      that.updateProfile()
    }).catch(err => {});
  }

  public updateProfile() {
    webAPI.UpdateUserProfile(this.generateProfileReqBody()).then(resp => {
    }).catch(err => {});
  }

  public generateProfileReqBody(): UpdateUserProfileReq {
    //check profile status each time submit profile
    let pregDateTimestamp: number = moment(this.data.pregnancyDate.date).unix();

    var reqBody = {
      gender: this.data.genderIndex,
      year_of_birth: this.data.birthday,
      height: this.data.height,
      weight: this.data.currentWeight,
      weight_before_pregnancy: this.data.weightBeforePreg,

      activity_level: this.data.activityLevelIndex + 1, // backend index starts from 1, not 10
      pregnancy_stage: this.data.pregnancyStatusIndex, // backend index starts from 1, not 10

      expected_birth_date: pregDateTimestamp,
      nickname: this.userInfo.nickName,
      avatar_url: this.userInfo.avatarUrl,
      external_id: this.data.externalId,

    }
    console.log("Request body generated.");
    console.log(reqBody);
    return reqBody;
  }




  public initHomePageInfo() {
    let currentFormattedDate = Date.parse(String(new Date())) / 1000;
    let req = { date: currentFormattedDate };
    webAPI.RetrieveHomePageInfo(req).then(resp => {
      //update chart part
      this.parseHomePageChartData(resp);
    }).catch(err => console.log(err));
  }

  public initHomePageCard() {
    let req = {}
    webAPI.RetrieveCardList(req).then(resp => {
      this.parseHomePageCardData(resp);
    }).catch(err => console.log(err));
  }

  public parseHomePageChartData(resp: any) {
    console.log(resp);
    let dailyAvgIntake = Math.floor(resp.daily_avg_intake / 100);
    let dailyTargetIntake = Math.floor(resp.daily_target_intake / 100);
    let latestWeight = resp.latest_weight;
    //update display data
    let weightOperation = "cardList[0].card_weight_value";
    (this as any).setData({
      average_energy: dailyAvgIntake,
      target_energy: dailyTargetIntake,
      [weightOperation]: latestWeight
    });
    //update chart part
    let dailyIntakes = resp.daily_intakes;
    for (let index in dailyIntakes) {
      dailyIntakes[index].value = Math.floor(dailyIntakes[index].value / 100);
      dailyIntakes[index].avg = dailyAvgIntake
    }
    let targetIntake = resp.daily_target_intake;
    chart.changeData(dailyIntakes);
    // chart.line().position('week*avg').color('#f4f4f4').shape('dashed');
    chart.guide().line({
      start: ['周天', targetIntake],
      end: ['周六', targetIntake],
      style: {
        stroke: '#d0d0d0', // 线的颜色
        lineDash: [0, 2, 2], // 虚线的设置
        lineWidth: 1 // 线的宽度
      } // 图形样式配置
    });
  }

  public parseHomePageCardData(resp: RetrieveCardListResp) {
    console.log(resp);
    let cardInfo: CardInfo[] = [];
    for (let index in resp.card_list) {
      let card = resp.card_list[index];
      let entity = {
        cardId: card.card_id,
        title: card.title,
        description: card.description,
        cardType: card.card_type,
        iconLink: card.icon_link,
        contentLink: card.content_link,
        isChecked: card.is_checked
      }
      cardInfo.push(entity);
    }
    (this as any).setData({
      activityCardList: cardInfo
    });
  }

  public redirectToPage(event: any) {
    let redirectPath = event.currentTarget.dataset.redirectPath;
    if (redirectPath === "/pages/rdiPage/rdiPage") {
      webAPI.RetrieveUserRDA({}).then(resp => {
        let rdaUrl = resp.rda_url;
        wx.navigateTo({ url: '../../pages/rdiPage/rdiPage?url=' + rdaUrl });
      }).catch(err => {
        console.log(err);
        wx.showModal({
          title: '',
          content: '获取推荐值失败',
          showCancel: false
        });
      });
    } else {
      wx.navigateTo({ url: redirectPath });
    }
  }

  public redirectFromFeed(event: any) {
    var myThis = this;
    let cardId = event.currentTarget.dataset.cardId;
    console.log(cardId);
    let cardLink = event.currentTarget.dataset.cardLink;
    let cardIndex = event.currentTarget.dataset.cardIndex;
    let cardDesc = event.currentTarget.dataset.cardDesc
    let cardList: CardInfo = this.data.activityCardList;

    switch (cardId) {
      default:
        let req = { event_type: "click_card", event_value: cardId.toString() };
        webAPI.CreateUserEvent(req).then(resp => {
          cardList[cardIndex].isChecked = true;
          (myThis as any).setData({
            activityCardList: cardList
          });
          wx.switchTab({
            url: "/pages/foodDiary/index"
          });
        }).catch(err => console.log(err))
        break;//meal
      case 1:
        let req = { event_type: "click_card", event_value: cardId.toString() };
        webAPI.CreateUserEvent(req).then(resp => {
          cardList[cardIndex].isChecked = true;
          (myThis as any).setData({
            activityCardList: cardList
          });
          wx.navigateTo({
            url: "/pages/nutritionalDatabasePage/articlePage?url=" + cardLink
          });
        }).catch(err => console.log(err))

        break;//article
      case 2:
        wx.showModal({
          title: '',
          content: '今日运动',
          confirmText: "已完成",
          cancelText: "未完成",
          success: function (res) {
            if (res.confirm) {
              let req = { event_type: "click_card", event_value: cardId.toString() };
              webAPI.CreateUserEvent(req).then(resp => {
                cardList[cardIndex].isChecked = true;
                (myThis as any).setData({
                  activityCardList: cardList
                });
              }).catch(err => console.log(err))
            }
          }
        });
        break;//execise
      case 6:
        //weight-reminder
        let req = { event_type: "click_card", event_value: cardId.toString() };
        webAPI.CreateUserEvent(req).then(resp => {
          cardList[cardIndex].isChecked = true;
          (this as any).setData({
            activityCardList: cardList
          });
          wx.navigateTo({
            url: "/pages/weightRecord/index"
          });
        }).catch(err => console.log(err))
        break;
    }
  }

  // public onQuesDlgBtnPress(event:any){
  //   let flag = event.currentTarget.dataset.selection;
  //   (this as any).setData({
  //     isAnswerPositive: flag
  //   })
  // }


  // public onQuesDlgBtnSubmit(){
  //   //submit isAnswerPositive to backend
  //   let surveyId = this.data.currentSurveyId;
  //   if (surveyId === 0){
  //     return;
  //   }
  //   let req = { survey_id: surveyId, is_positive: this.data.isAnswerPositive};
  //   webAPI.CreateSurveyAnswer(req).then(resp => {
  //     //dismiss the dialog then set survey id to 0
  //     console.log(resp);
  //     (this as any).setData({ showQuesDlg: false, currentSurveyId: 0 });
  //   }).catch(err => wx.showModal({ title: "", content: "上传用户回答失败", showCancel: false }));
  // }

  // public bindFeedbackQuestionInput(event:any){
  //   let quesText = String(event.detail.value);
  //   (this as any).setData({
  //     questionText: quesText
  //   });
  // }

  // public onFeedbackDlgBtnSubmit(){
  //   //submit isFeedback to backend
  //   let req = { date: moment().unix(), question: this.data.questionText};
  //   if (!this.data.questionText || this.data.questionText === "") {
  //     return
  //   }
  //   webAPI.CreateQuestion(req).then(resp => {
  //      (this as any).setData({ showFeedbackDlg: false });
  //   }).catch(err => { wx.showModal({title: "",content:"上传留言失败", showCancel: false} )});
  // }

}

Page(new HomePage())