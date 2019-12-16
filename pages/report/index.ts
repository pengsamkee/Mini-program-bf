
import { IMyApp } from '../../app';
import { epoch } from '../../utils/util';
const app = getApp<IMyApp>()
import * as globalEnum from '../../api/GlobalEnum';
import * as webAPI from '../../api/app/AppService';
import * as loginAPI from '../../api/login/LoginService';
import * as moment from 'moment';
import { MiniProgramLogin } from '../../api/login/LoginService';
import { RetrieveUserReportsReq, WeeklyReportCard, RetrieveUserReportsResp, RetrieveOrCreateUserReportReq,RetrieveFoodDiaryReq} from '../../api/app/AppServiceObjs'

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

//**************************end of f2 chart init*************************//



class ReportPage {
  public bartChart: any;
  public data = {
    choose:0,
    average_energy: 1104,
    target_energy: 1205,
    opts: {
      onInit: initChart,
    },
// 下面是原来的，不要随意更改
    year: "",
    month: "",
    week: "",
    date: "30",
    countMonth: 0,
    checkReportGenerated: true,
    reportBoxClass: "checked-box",
    isPrevMonthAllowed: true,
    isNextMonthAllowed: false,

    weekly_isReadArr: [],
    weeklyBadge: 0,

    weeklyReportArr: [],
    currentDate: 0,
    // 上面是原来的，不要随意更改
    dayReportArr:[],
    dayConuter:0,
    showLoading: false,
  }

  public onReady(){
    this.initHomePageInfo();
  }

  public choose(e:any){
    (this as any).setData({
      choose:Number(e.target.dataset.num)
    })
  }

  public stop(e){
    console.log(e)
    return false;
  }

  public initHomePageInfo() {
    let currentFormattedDate = Date.parse(String(new Date())) / 1000;
    let req = { date: currentFormattedDate };
    webAPI.RetrieveHomePageInfo(req).then(resp => {
      this.parseHomePageChartData(resp);
    }).catch(err => console.log(err));
  }

  public parseHomePageChartData(resp: any) {
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
    chart.guide().line({
      start: ['周天', targetIntake],
      end: ['周六', targetIntake],
      style: {
        stroke: '#d0d0d0', 
        lineDash: [0, 2, 2], 
        lineWidth: 1 
      } 
    });
    const chart1 = this.selectComponent('#nutrition_chart1');
    chart1.chart.changeData(dailyIntakes);
    const chart2 = this.selectComponent('#nutrition_chart2');
    chart2.chart.changeData(dailyIntakes);
    
    chart2.guide().line({
      start: ['周天', targetIntake],
      end: ['周六', targetIntake],
      style: {
        stroke: '#d0d0d0',
        lineDash: [0, 2, 2],
        lineWidth: 1 
      } 
    });


  }
  public onPullDownRefresh() {
    this.pullDownRefresh()
  }
  public pullDownRefresh(){
    if(this.data.choose==0){
      (this as any).setData({
        dayReportArr: [],
        dayConuter: 0,
      },()=>{
        this.getBefore10DayTimeStampArr()
      })
    }
  }

// 下面是原来的代码，请不要随便注释

  // enum DAY {
  //   MONDAY = "星期一",
  //   TUESDAY = "星期二",
  //   WED = "星期三",
  //   THURS = "星期四",
  //   FRI = "星期五",
  //   SAT = "星期六",
  //   SUN = "星期日"
  // }

  // interface Report {
  //   report_url: string;
  //   date: number;
  //   is_read: boolean;
  //   first_day: string;
  //   last_day: string;
  //   is_sample: boolean
  // }

// class reportPage {
  // public data = {
  //   year: "",
  //   month: "",
  //   week: "",
  //   date: "30",
  //   countMonth: 0,
  //   checkReportGenerated: true,
  //   reportBoxClass: "checked-box",
  //   isPrevMonthAllowed: true,
  //   isNextMonthAllowed: false,

  //   weekly_isReadArr: [],
  //   weeklyBadge: 0,

  //   weeklyReportArr: [],
  //   currentDate: 0
  // }

  public onLoad(): void {
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    webAPI.SetAuthToken(token);
    this.getBefore10DayTimeStampArr();
  }

  public onShow() {
    this.loadReportData();
  }
  /**
   * 获取前10天的时间戳数组
   */
  public getBefore10DayTimeStampArr(){
    wx.showLoading({ title: "加载中..." });
    let timeStampArr = [];
    for(let i=0;i<10;i++){
      const item = moment().subtract(i+this.data.dayConuter, "days").startOf('day').unix();
      timeStampArr.push(item);
    }
    this.getDayReportArr(timeStampArr)
  }
/**
 * 获取日报信息
 */
  public getDayReportArr(timeStampArr){
    const that = this
    Promise.all(timeStampArr.map(timeStamp => that.retrieveFoodDiaryData(timeStamp)))
    .then(res=>{
      wx.stopPullDownRefresh()
      const dayReportArr = that.data.dayReportArr.concat(res)
      wx.hideLoading({});
      
      (that as any).setData({
        dayReportArr: dayReportArr,
        showLoading:false
      }, () => {
        
        console.log("=======dayReportArr", dayReportArr)
      })
    }).catch(err=>console.log(123,err))
  }
  /**
 * api请求今日摄入量和今日饮食记录
 */
  public retrieveFoodDiaryData(timeStamp: number) {
    let req: RetrieveFoodDiaryReq = { date: timeStamp };
    return webAPI.RetrieveFoodDiary(req).then(resp => {
      const date = moment(timeStamp*1000).format('MM月DD日')
      const res = { ...resp, date: date, dateTimeStamp: timeStamp}
      return res 
    }).catch(err =>{
      wx.showModal({
        title: '',
        content: '获取日志失败',
        showCancel: false
      })
    });
  }
  /**
   * 日报滚动到底部
   */
  public scrollToLower(){
    (this as any).setData({
      showLoading: true,
      dayConuter: this.data.dayConuter+10
    },()=>{
      this.getBefore10DayTimeStampArr()
    })
    
  }

  /**
   * 获取周报信息
   */
  public loadReportData() {
    let currentDate = moment();
    currentDate = currentDate.add(this.data.countMonth, 'month');
    if (currentDate.isAfter(moment(), 'month')) {
      (this as any).setData({ isPrevMonthAllowed: true, isNextMonthAllowed: false });
    } else {
      if (currentDate.isSame(moment(), 'month')) {
        (this as any).setData({ isPrevMonthAllowed: true, isNextMonthAllowed: false });
      } else {
        (this as any).setData({ isPrevMonthAllowed: true, isNextMonthAllowed: true });
      }
    }

    let firstDayOfMonth = moment(currentDate).startOf('month').unix();
    let lastDayOfMonth = moment(currentDate).endOf('month').unix();
    let req = {
      date_from: firstDayOfMonth,
      date_to: lastDayOfMonth
    };
    console.log(firstDayOfMonth, lastDayOfMonth);
    // wx.showLoading({ title: "加载中..." });
    webAPI.RetrieveUserReports(req).then(resp => {
      // wx.hideLoading({});
      this.parseReportData(currentDate, resp);

    }).catch(err => {
      console.log(err);
      wx.hideLoading({});
    });
    (this as any).setData({
      year: currentDate.format('YYYY'),
      month: currentDate.format('MM'),
      date: currentDate.format('DD'),
      week: currentDate.week()
    });
  }
  /**
   * 用户点击后,进入日报H5页面
   */
  public goDayReport(e){
    const timeStamp = e.currentTarget.dataset.timeStamp
    this.retrieveDailyReport(timeStamp)
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

  public parseReportData(currentDate: moment, resp: any) {
    console.log(currentDate);
    console.log(resp);
    let reportResp: WeeklyReportCard[] = resp.weekly_report;
    let weeklyReport: Report[] = [];
    for (let index in reportResp) {
      let report: WeeklyReportCard = reportResp[index];
      let firstDayOfWeek: string = moment.unix(report.date_from).format('DD');
      let lastDayOfWeek: string = moment.unix(report.date_to).format('DD');
      let weekly_report: Report = {
        date: report.date,
        is_read: report.is_read,
        report_url: report.report_url,
        first_day: firstDayOfWeek,
        last_day: lastDayOfWeek,
        is_sample: false
      }
      weeklyReport.push(weekly_report)
    }

    if (currentDate.isSame(moment(), 'month') && reportResp.length == 0) {
      let firstDayOfWeek: string = currentDate.week(currentDate.week()).day(1).format('DD');
      let lastDayOfWeek: string = currentDate.week(currentDate.week()).day(7).format('DD');
      let weekly_report: Report = {
        date: currentDate.unix(),
        first_day: firstDayOfWeek,
        last_day: lastDayOfWeek,
        report_url: "https://report.icmoto.cn/userweeklyreport/584",
        is_read: false,
        is_sample: true,
      }
      weeklyReport.push(weekly_report)
    }



    (this as any).setData({
      weeklyReportArr: weeklyReport,
    });

    console.log(this.data.weeklyReportArr)
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
        if (report.date < todayTime || (report.date == todayTime && moment(new Date()).hours > 22)) { 
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

  public nextMonth(event: any): void {
    (this as any).setData({ countMonth: this.data.countMonth + 1 });
    this.loadReportData();
  }

  public prevMonth():void {
    (this as any).setData({ countMonth:this.data.countMonth - 1 });
    this.loadReportData();
  }

  public onWeeklyReportClick(event: any): void {
    let reportIndex: number = event.currentTarget.dataset.reportIndex;
    let report: Report = this.data.weeklyReportArr[reportIndex];
    let reportUrl: string = report.report_url;
    if (reportUrl) {
      if (report.is_sample) {
        wx.showModal({
          title: '提示',
          content: '这是一个样例报告',
          cancelText: '取消',
          confirmText: "查看",
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
            }

          }
        })
      } else {
        wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
      }
    }
  }
}

Page(new ReportPage());
