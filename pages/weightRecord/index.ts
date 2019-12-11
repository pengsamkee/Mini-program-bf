import { IMyApp } from '../../app';
import { epoch } from '../../utils/util';
import * as moment from 'moment';
import * as F2 from '@antv/wx-f2';
import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';

const app = getApp<IMyApp>();
let chart = null;

function setWeightLineAndPoints(): void {
  chart.line().position(['date', 'weight']);
  chart.point()
    .position(['date', 'weight'])
    .style({ fill: '#ffffff', r: 3.2, lineWidth: 2, stroke: '#f3465a' });
}

function setTooltips(): void {
  chart.tooltip({
    alwaysShow: true,
    showCrosshairs: true,
    showItemMarker: false,
    showTitle: true,
    offsetY: 50,
    background: { fill: '#485465', padding: [7, 7] },
    nameStyle: { fill: '#ffffff' },
    valueStyle: { fill: '#ffffff' },
    titleStyle: { fill: '#e2e2e2' },
    onShow: function onShow(ev) {
      var items = ev.items;
      items[0].title = items[0].title.toString()
      items[0].name = "";
      items[0].value = items[0].value.toString() + "公斤";
    }
  });
}

function setTargetLine(targetWeight: number): void {
  chart.guide().line({
    start: ['min', targetWeight],
    end: ['max', targetWeight],
    style: { stroke: '#4caf50', lineWidth: 0.7, lineCap: 'round' }
  });

  chart.guide().text({
    position: ['max', targetWeight],
    content: '目标',
    style: { textAlign: 'start', textBaseline: 'top', fill: '#4caf50' },
    offsetX: 10
  });
}

function setInitLine(initWeight: number): void {
  chart.guide().line({
    start: ['min', initWeight],
    end: ['max', initWeight],
    style: { stroke: '#ff822d', lineWidth: 0.7, lineCap: 'round' }
  });

  chart.guide().text({
    position: ['max', initWeight],
    content: '初始',
    style: { textAlign: 'start', textBaseline: 'bottom', fill: '#ff822d' },
    offsetX: 10
  });
}

function setRectLegends(): void {
  chart.legend({
    position: 'top',
    align: 'center',
    custom: true,
    items: [
      { name: '体重过重', value: '', marker: { symbol: 'circle', radius: 5, fill: '#ff5c47' } },
      { name: '体重过轻', value: '', marker: { symbol: 'circle', radius: 5, fill: '#fcda76' } }
    ],
    nameStyle: { fill: '#888888' }
  });
}

// set pink rect
function setUpperBoundRect(startYCoord: number, endYCoord: number): void {
  chart.guide().rect({
    start: ['min', startYCoord],
    end: ['max', endYCoord],
    style: { fillOpacity: 0.4, fill: '#ff5c47', lineWidth: 0.5, stroke: '#ff5c47' }
  });
}

// set yellow rect
function setLowerBoundRect(startYCoord: number, endYCoord: number): void {
  chart.guide().rect({
    start: ['min', startYCoord],
    end: ['max', endYCoord],
    style: { fillOpacity: 0.4, fill: '#fcda76', lineWidth: 0.5, stroke: '#fcda76' }
  });
}

type minMax = { minWeight: number, maxWeight: number };

// Calculate max-y and min-y values, and account for targetWeight
function computeMinMaxWeightWithTarget(inputArr: any[], targetWeight: number): minMax {
  let maxWeight = -1;
  let minWeight = Number.MAX_SAFE_INTEGER;

  for (var index = 0; index < inputArr.length; index++) {

    if (inputArr[index].weight > maxWeight || targetWeight > maxWeight) {
      if (inputArr[index].weight > targetWeight) {
        maxWeight = inputArr[index].weight;
      } else {
        maxWeight = targetWeight;
      }
    }

    if (inputArr[index].weight < minWeight || targetWeight < minWeight) {
      if (inputArr[index].weight < targetWeight) {
        minWeight = inputArr[index].weight;
      } else {
        minWeight = targetWeight;
      }
    }
  }
  return { minWeight, maxWeight };
}

// Calculate max-y and min-y values, no need to account for targetWeight
function computeMinMaxWeightWithoutTarget(inputArr: any[]): minMax {
  let maxWeight = -1;
  let minWeight = Number.MAX_SAFE_INTEGER;

  for (var index = 0; index < inputArr.length; index++) {
    if (inputArr[index].weight > maxWeight) {
      maxWeight = inputArr[index].weight;
    }

    if (inputArr[index].weight < minWeight) {
      minWeight = inputArr[index].weight;
    }
  }
  return { minWeight, maxWeight };
}

// clears and reloads the chart with data from inputArr for currWeek (weekView) 
function renderChartWeekView(inputArr: any[], currWeek: number, initWeight: number, targetWeight: number, isPregnantLady: boolean, upperBound: number, lowerBound: number): void {
  let maxWeight = -1;
  let minWeight = Number.MAX_SAFE_INTEGER;

  // update chart data and relevant lines and components
  chart.clear();
  chart.source(inputArr);

  let weekArr = [];
  for (let i = 0; i < 7; i++) {
    let tempDay = moment().week(currWeek).day(i).format('YYYY-MM-DD');
    weekArr.push(tempDay);
  }

  chart.scale('date', {
    type: 'cat',
    values: weekArr,
    formatter: function (date: string): string {
      let dateTokenArr = date.split("-");
      return dateTokenArr[2];
    }
  });

  setWeightLineAndPoints();
  setTooltips();

  // target has been set
  if (targetWeight != 0 && !isPregnantLady) {
    setTargetLine(targetWeight);

    let temp: minMax = computeMinMaxWeightWithTarget(inputArr, targetWeight);
    minWeight = temp.minWeight;
    maxWeight = temp.maxWeight;
  } else {
    let temp: minMax = computeMinMaxWeightWithoutTarget(inputArr);
    minWeight = temp.minWeight;
    maxWeight = temp.maxWeight;
  }

  if (initWeight >= minWeight - 3 && initWeight <= maxWeight + 3 && !isPregnantLady) {
    setInitLine(initWeight);
  }

  let scaleMin: number = minWeight - 3 < 0 ? 0 : minWeight - 3;
  let scaleMax: number = maxWeight + 3 < 3 ? 3 : maxWeight + 3;

  if (isPregnantLady) {
    // pink rect
    if (upperBound < scaleMax && upperBound > scaleMin) {
      setUpperBoundRect(upperBound, scaleMax);
    } else if (upperBound < scaleMax && upperBound <= scaleMin) {
      setUpperBoundRect(scaleMin, scaleMax); 
    }

    // yellow rect
    if (lowerBound > scaleMin && lowerBound < scaleMax) {
      setLowerBoundRect(scaleMin, lowerBound);
    } else if (lowerBound > scaleMin && lowerBound >= scaleMax) {
      setLowerBoundRect(scaleMin, scaleMax);
    }
    setRectLegends();
  }

  chart.scale('weight', {
    min: scaleMin,
    max: scaleMax,
  });

  chart.render();
}

// clears and reloads the chart with data from inputArr for the currMonth (monthView) 
function renderChartMonthView(inputArr: any[], currMonth: number, initWeight: number, targetWeight: number, isPregnantLady: boolean, upperBound: number, lowerBound: number): void {
  let maxWeight = -1;
  let minWeight = Number.MAX_SAFE_INTEGER;

  // update chart data and relevant lines and components
  chart.clear();
  chart.source(inputArr);

  let monthArr = [];
  for (let i = 1; i <= moment().month(currMonth).daysInMonth(); i++) {
    let tempDay = moment().month(currMonth).date(i).format('YYYY-MM-DD');
    monthArr.push(tempDay);
  }

  let tickStart: string = monthArr[0];
  let tickEnd: string = monthArr[monthArr.length - 1];
  chart.scale('date', {
    type: 'cat',
    values: monthArr,
    ticks: [tickStart, tickEnd],
    formatter: function (date: string): string {
      let dateTokenArr = date.split("-");
      return dateTokenArr[2];
    }
  });

  setWeightLineAndPoints();
  setTooltips();

  // target has been set
  if (targetWeight != 0 && !isPregnantLady) {
    setTargetLine(targetWeight);

    let temp: minMax = computeMinMaxWeightWithTarget(inputArr, targetWeight);
    minWeight = temp.minWeight;
    maxWeight = temp.maxWeight;
  } else {
    let temp: minMax = computeMinMaxWeightWithoutTarget(inputArr);
    minWeight = temp.minWeight;
    maxWeight = temp.maxWeight;
  }

  if (initWeight >= minWeight - 3 && initWeight <= maxWeight + 3 && !isPregnantLady) {
    setInitLine(initWeight);
  }

  let scaleMin: number = minWeight - 3 < 0 ? 0 : minWeight - 3;
  let scaleMax: number = maxWeight + 3 < 3 ? 3 : maxWeight + 3;

  if (isPregnantLady) {
    // pink rect
    if (upperBound < scaleMax && upperBound > scaleMin) {
      setUpperBoundRect(upperBound, scaleMax);
    } else if (upperBound < scaleMax && upperBound < scaleMin) {
      setUpperBoundRect(scaleMin, scaleMax);
    }

    // yellow rect
    if (lowerBound > scaleMin && lowerBound < scaleMax) {
      setLowerBoundRect(scaleMin, lowerBound);
    } else if (lowerBound > scaleMin && lowerBound > scaleMax) {
      setLowerBoundRect(scaleMin, scaleMax);
    }
    setRectLegends();
  }

  chart.scale('weight', {
    min: scaleMin,
    max: scaleMax,
  });

  chart.render();
}

// called whenever tabTwo is displayed, loads default data (weight records from this week)
function initChart(canvas, width, height, F2): any {
  F2.Global.setTheme({
    colors: ['#F3465A', '#D66BCA', '#8543E0', '#8E77ED', '#3436C7', '#737EE6', '#223273', '#7EA2E6'],
    pixelRatio: 2,
    guide: {
      line: { stroke: '#F3465A', lineWidth: 2 }
    }
  });

  chart = new F2.Chart({ el: canvas, width, height, animate: true, padding: [50, 50, 50, 50] });

  // set default weekview interval
  let currWeek: number = moment().week();
  let weekArr = [];

  for(let i=0; i<7; i++) {
    let tempDay = moment().week(currWeek).day(i).format('YYYY-MM-DD');
    weekArr.push(tempDay);
  }

  let emptyInputArr = [{
    "date": "2019-06-01",
    "weight": 50
  }];

  // without this the chart won't render properly
  chart.source(emptyInputArr, {
    date: {
      type: 'cat',
      values: weekArr,
      formatter: function(date: string): string {
        let dateTokenArr = date.split("-");
        return dateTokenArr[2];
      }
    }
  });

  setWeightLineAndPoints();
  chart.render();

  // set weekview interval and week numxber
  let firstDayOfWeek: number = moment().week(currWeek).day(0).hour(0).minute(0).second(0).unix();
  let lastDayOfWeek: number = moment().week(currWeek).day(6).hour(0).minute(0).second(0).unix();
  console.log("First day of week unix " + firstDayOfWeek + " last day of week unix " + lastDayOfWeek);

  // getChartWeekViewData(currWeek, firstDayOfWeek, lastDayOfWeek);
  weightRecordPage.getWeekViewData(currWeek, firstDayOfWeek);

  return chart;
}

class weightRecordPage { 
  public data = {
    isPregnantLady: true,
    dateOfDelivery: { date: undefined, year: '', month: '', day: '' },
    numWeeksPreg: 0,
    dateRecord: {
      date: moment().format('YYYY-MM-DD'),
      year: moment().format('YYYY'),
      month: moment().format('MM'),
      day: moment().format('DD'),
    },
    weightRecord: '70',
    weights: [],
    datesWithRecords: undefined,
    dateOfConception: { date: '', year: '', month: '', day: '' },
    initWeight: '99.0',
    initDate: { date: '1970-01-01', year: '1970', month: '01', day: '01' },
    latestWeight: '99.0',
    latestDate: { date: '1970-01-01', year: '1970', month: '01', day: '01' },
    targetWeight: '99.0',
    targetDate: { date: '1970-01-01', year: '1970', month: '01', day: '01' },
    isTargetSet: false,
    pregUpperWeightLimit: 0,
    pregLowerWeightLimit: 0,
    weeklyWeightChangeLower: 0.3,
    weeklyWeightChangeUpper: 0.5,
    currMaxIdx: 6,
    opts: {
      onInit: initChart,
    },
    chartViewIdx: '0',
    chartView: ['周', '月'],
    chartWeekViewStart: { date: moment(), year: '2019', month: '01', day: '01' },
    chartWeekViewEnd: { date: moment(), year: '2019', month: '01', day: '07' },
    isPrevWeekAllowed: true,
    isNextWeekAllowed: false,
    chartMonthViewStart: { date: moment(), year: '2019', month: '01', day: '01' },
    chartMonthViewEnd: { date: moment(), year: '2019', month: '01', day: '31' },
    isPrevMonthAllowed: true,
    isNextMonthAllowed: false,
    isTabOneSelected: true,
    tabOneStyleClass: "weui-navbar__item weui-bar__item_on",
    tabTwoStyleClass: "weui-navbar__item",
    showContent:false,
  };

  public static initWeight: number;
  public static targetWeight: number;
  public static isPregnantLady: boolean;
  public static pregUpperBound: number;
  public static pregLowerBound: number;
  public static timestampWeightMap: Map<number, number>;

  public static getWeekViewData(currWeek: number, startTimeStamp: number) {
    var tempTimestamp: number;
    var inputArr = [];

    for (let i=0; i < 7; i++) {
      tempTimestamp = startTimeStamp + (i * 3600 * 24);
      let tempDate: string = moment.unix(tempTimestamp).format('YYYY-MM-DD');

      let tempWeight = weightRecordPage.timestampWeightMap.get(tempTimestamp);
      if (tempWeight != undefined) {
        var temp = {
          "date": tempDate,
          "weight": tempWeight
        }
        inputArr.push(temp);
      }
    }
    renderChartWeekView(inputArr, currWeek, weightRecordPage.initWeight, weightRecordPage.targetWeight, weightRecordPage.isPregnantLady, weightRecordPage.pregUpperBound, weightRecordPage.pregLowerBound);
  }

  public static getMonthViewData(currMonth: number, startTimeStamp: number) {
    var tempTimestamp: number;
    var inputArr = [];

    for (let i = 0; i < moment().month(currMonth).daysInMonth(); i++) {
      tempTimestamp = startTimeStamp + (i * 3600 * 24);
      let tempDate: string = moment.unix(tempTimestamp).format('YYYY-MM-DD');

      let tempWeight = weightRecordPage.timestampWeightMap.get(tempTimestamp);
      if (tempWeight != undefined) {
        var temp = {
          "date": tempDate,
          "weight": tempWeight
        }
        inputArr.push(temp);
      }
    }

    renderChartMonthView(inputArr, currMonth, weightRecordPage.initWeight, weightRecordPage.targetWeight, weightRecordPage.isPregnantLady, weightRecordPage.pregUpperBound, weightRecordPage.pregLowerBound);
  }

  public onNavbarSelect1(): void {
    (this as any).setData({
      isTabOneSelected: true,
      tabOneStyleClass: "weui-navbar__item weui-bar__item_on",
      tabTwoStyleClass: "weui-navbar__item"
    });
  }

  public onNavbarSelect2(): void {
    (this as any).setData({
      isTabOneSelected: false,
      tabOneStyleClass: "weui-navbar__item",
      tabTwoStyleClass: "weui-navbar__item weui-bar__item_on"
    });

    this.computeInitChartViewInterval();
  }

  public navigateToWeightInputPage(): void {
    wx.navigateTo({
      url: "/pages/weightRecord/weightInput"
    });
  }

  public navigateToTargetInputPage(): void {
    wx.navigateTo({
      url: "/pages/weightRecord/targetInput"
    });
  }

  // checks if weekInterval selected is the present week or a past week (future weeks are not allowed)
  public checkWeekInterval(newWeekStart: moment): boolean {
    let presentWeek: moment = moment();
    let newWeek: moment = newWeekStart;

    if (newWeek.isAfter(presentWeek, 'week')) {
      this.setWeekViewFlags(true, false);
      return false; // Not allowed to change interval

    } else {
      if (newWeek.isSame(presentWeek, 'week')) {
        this.setWeekViewFlags(true, false);

        // newWeek is before presentWeek
      } else {
        this.setWeekViewFlags(true, true);
      }
      return true;  // Allowed to change interval
    }
  }

  // checks if monthInterval selected is the present month or a past month (future months are not allowed)
  public checkMonthInterval(newMonthStart: moment): boolean {
    let presentMonth: moment = moment();
    let newMonth: moment = newMonthStart;

    if (newMonth.isAfter(presentMonth, 'month')) {
      this.setMonthViewFlags(true, false);
      return false; // Not allowed to change interval

    } else {
      if (newMonth.isSame(presentMonth, 'month')) {
        this.setMonthViewFlags(true, false);
        // newMonth is before presentMonth
      } else { 
        this.setMonthViewFlags(true, true);
      }
      return true;  // Allowed to change interval
    }
  }

  private setWeekViewFlags(prevWeekFlag: boolean, nextWeekFlag: boolean): void {
    (this as any).setData({
      isPrevWeekAllowed: prevWeekFlag,
      isNextWeekAllowed: nextWeekFlag
    });
  }

  private setMonthViewFlags(prevMonthFlag: boolean, nextMonthFlag: boolean): void {
    (this as any).setData({
      isPrevMonthAllowed: prevMonthFlag,
      isNextMonthAllowed: nextMonthFlag
    });
  }

  // shift interval 1 week into past
  public prevWeekInterval(): void {
    let newWeekStart = this.data.chartWeekViewStart.date.subtract(1, 'w');
    let newWeekEnd = this.data.chartWeekViewEnd.date.subtract(1, 'w');

    if(this.checkWeekInterval(newWeekStart)) {
      this.setWeekViewInterval(newWeekStart, newWeekEnd);

      console.log("Unix: " + newWeekStart.unix() + " till " + newWeekEnd.unix());
      let weekNum: number = newWeekStart.week();
      weightRecordPage.getWeekViewData(weekNum, newWeekStart.unix());
    }
  }

  // shift interval 1 month into past
  public prevMonthInterval(): void {
    let newMonthStart = this.data.chartMonthViewStart.date.subtract(1, 'M');
    let newMonthEnd = this.data.chartMonthViewEnd.date.subtract(1, 'M');

    if (this.checkMonthInterval(newMonthStart)) {
      this.setMonthViewInterval(newMonthStart, newMonthEnd);

      console.log("Unix: " + newMonthStart.unix() + " till " + newMonthEnd.unix());
      let monthNum: number = newMonthStart.month();
      weightRecordPage.getMonthViewData(monthNum, newMonthStart.unix());
    }
  }

  // shift interval 1 week into future
  public nextWeekInterval(): void {
    let newWeekStart = this.data.chartWeekViewStart.date.add(1, 'w');
    let newWeekEnd = this.data.chartWeekViewEnd.date.add(1, 'w');

    if (this.checkWeekInterval(newWeekStart)) {
      this.setWeekViewInterval(newWeekStart, newWeekEnd);

      console.log("Unix: " + newWeekStart.unix() + " till " + newWeekEnd.unix());
      let weekNum: number = newWeekStart.week();
      weightRecordPage.getWeekViewData(weekNum, newWeekStart.unix());
    }
  }

  // shift interval 1 month into future
  public nextMonthInterval(e): void {
    let newMonthStart = this.data.chartMonthViewStart.date.add(1, 'M');
    let newMonthEnd = this.data.chartMonthViewEnd.date.add(1, 'M');

    if (this.checkMonthInterval(newMonthStart)) {
      this.setMonthViewInterval(newMonthStart, newMonthEnd);

      console.log("Unix: " + newMonthStart.unix() + " till " + newMonthEnd.unix());
      let monthNum: number = newMonthStart.month();
      weightRecordPage.getMonthViewData(monthNum, newMonthStart.unix());
    }
  }

  private setWeekViewInterval(newWeekStart: moment, newWeekEnd: moment): void {
    (this as any).setData({
      chartWeekViewStart: {
        date: newWeekStart,
        year: newWeekStart.format("YYYY"),
        month: newWeekStart.format("MM"),
        day: newWeekStart.format("DD")
      },
      chartWeekViewEnd: {
        date: newWeekEnd,
        year: newWeekEnd.format("YYYY"),
        month: newWeekEnd.format("MM"),
        day: newWeekEnd.format("DD")
      }
    });
  }

  private setMonthViewInterval(newMonthStart: moment, newMonthEnd: moment): void {
    (this as any).setData({
      chartMonthViewStart: {
        date: newMonthStart,
        year: newMonthStart.format("YYYY"),
        month: newMonthStart.format("MM"),
        day: newMonthStart.format("DD")
      },
      chartMonthViewEnd: {
        date: newMonthEnd,
        year: newMonthEnd.format("YYYY"),
        month: newMonthEnd.format("MM"),
        day: newMonthEnd.format("DD")
      }
    });
  }

  public bindChartViewChange(e: any): void {
    // change to default monthview interval
    if (this.data.chartViewIdx === '0' && e.detail.value === '1') {
      let currMonth: number = moment().month();
      let firstDayOfMonth: moment = moment().month(currMonth).startOf("month");
      let lastDayOfMonth: moment = moment().month(currMonth).endOf("month"); // 23:59:59 NOT 00:00:00
      console.log("First day of month " + firstDayOfMonth.format("MM-DD-HH-MM-SS") + "last day of month" + lastDayOfMonth.format("MM-DD-HH-MM-SS"));

      this.setMonthViewInterval(firstDayOfMonth, lastDayOfMonth);

      (this as any).setData({
        chartViewIdx: e.detail.value,
      });

      console.log("Graphhhh first day of month unix " + firstDayOfMonth.unix() + " last day of month unix " + lastDayOfMonth.unix());
      weightRecordPage.getMonthViewData(currMonth, firstDayOfMonth.unix());
    }

    // change to default weekview interval
    if (this.data.chartViewIdx === '1' && e.detail.value === '0') {
      let currWeek: number = moment().week();
      let firstDayOfWeek: moment = moment().week(currWeek).day(0).hour(0).minute(0).second(0);
      let lastDayOfWeek: moment = moment().week(currWeek).day(6).hour(0).minute(0).second(0);

      this.setWeekViewInterval(firstDayOfWeek, lastDayOfWeek);

      (this as any).setData({
        chartViewIdx: e.detail.value,
      });
      console.log("Graphhhh first day of week unix " + firstDayOfWeek.unix() + " last day of week unix " + lastDayOfWeek.unix());
      weightRecordPage.getWeekViewData(currWeek, firstDayOfWeek.unix());
    }
  }

  public computePregInfo(dateOfDelivery: moment): void {
    // let nowMoment = moment();
    // let temp = dateOfDelivery.diff(nowMoment, 'weeks');

    let dateOfConceptionMoment = dateOfDelivery.subtract(40, 'w');
    let tempDate = {
      date: dateOfConceptionMoment.format("YYYY-MM-DD"),
      year: dateOfConceptionMoment.format("YYYY"),
      month: dateOfConceptionMoment.format("MM"),
      day: dateOfConceptionMoment.format("DD")
    };

    (this as any).setData({
      // numWeeksPreg: temp,
      dateOfConception: tempDate
    });
  }

  // sets chartWeekView and chartMonthView to the present week and month, the default chart view
  public computeInitChartViewInterval(): void {
    let currWeek: number = moment().week();
    let currMonth: number = moment().month();

    let firstDayOfWeek: moment = moment().week(currWeek).day(0).hour(0).minute(0).second(0);
    let lastDayOfWeek: moment = moment().week(currWeek).day(6).hour(0).minute(0).second(0);

    this.setWeekViewInterval(firstDayOfWeek, lastDayOfWeek);

    let firstDayOfMonth = moment().month(currMonth).startOf("month");
    let lastDayOfMonth = moment().month(currMonth).endOf("month");

    this.setMonthViewInterval(firstDayOfMonth, lastDayOfMonth);

    // return left, right arrows and viewPicker to default state (which is when present week is selected)
    (this as any).setData({
      isPrevWeekAllowed: true,
      isNextWeekAllowed: false,
      isPrevMonthAllowed: true,
      isNextMonthAllowed: false,
      chartViewIdx: '0'
    });
  }

  public retrieveData(): void {
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    webAPI.SetAuthToken(token);
    let that = this;

    let currWeek: number = moment().week();
    let firstDayOfWeek: number = moment().week(currWeek).day(0).unix();
    let lastDayOfWeek: number = moment().week(currWeek).day(6).unix();

    wx.showLoading({
      title: '正在加载',
    });

    setTimeout(function () {
      let req = {
        date_from: 0,
        date_to: lastDayOfWeek
      };

      webAPI.RetrieveWeightLog(req).then(resp => {
        console.log('RetrieveWeightLog',resp);

        // convert dates to moments then to date objects for flexibility
        let tempDateOfDelivery = that.createLocalDateObject(moment.unix(resp.expected_birth_date));
        let tempInitDate = that.createLocalDateObject(moment.unix(resp.initial_weight.date));
        let tempLatestDate = that.createLocalDateObject(moment.unix(resp.latest_weight.date));
        let tempTargetDate = that.createLocalDateObject(moment.unix(resp.target_weight.date));

        let tempDatesWithRecords = [];
        let tempWeights = [];
        let tempMap = new Map();
        for (let i = 0; i < resp.weight_logs.length; i++) {
          let tempMoment = moment.unix(resp.weight_logs[i].date);
          tempDatesWithRecords.push({
            date: tempMoment.format('YYYY-MM-DD'),
            year: tempMoment.format("YYYY"),
            month: tempMoment.format("MM"),
            day: tempMoment.format("DD")
          });

          tempMap.set(resp.weight_logs[i].date, resp.weight_logs[i].value); // create (timestamp -> weight) map
          tempWeights.push(resp.weight_logs[i].value);
        }

        (that as any).setData({
          showContent:true,
          initWeight: resp.initial_weight.value,
          latestWeight: resp.latest_weight.value,
          targetWeight: resp.target_weight.value,
          initDate: tempInitDate,
          latestDate: tempLatestDate,
          targetDate: tempTargetDate,
          isTargetSet: true,
          currMaxIdx: resp.weight_logs.length,
          pregUpperWeightLimit: resp.weight_upper_bound,
          pregLowerWeightLimit: resp.weight_lower_bound,
          isPregnantLady: resp.is_pregnant_lady,
          dateOfDelivery: tempDateOfDelivery,
          numWeeksPreg: resp.number_of_pregnant_weeks,
          weeklyWeightChangeLower: resp.weight_change_range.lower/100,
          weeklyWeightChangeUpper: resp.weight_change_range.upper/100
        });

        weightRecordPage.initWeight = resp.initial_weight.value;
        weightRecordPage.targetWeight = resp.target_weight.value;
        weightRecordPage.isPregnantLady = resp.is_pregnant_lady;
        weightRecordPage.pregUpperBound = resp.weight_upper_bound;
        weightRecordPage.pregLowerBound = resp.weight_lower_bound;
        weightRecordPage.timestampWeightMap = tempMap;

        // handle case where user has not set target
        if (resp.target_weight.value == 0) {
          (that as any).setData({
            isTargetSet: false
          });
        }

        (that as any).computePregInfo(moment.unix(resp.expected_birth_date));
      }).catch(err => {
        wx.showModal({
          title: '',
          content: '获取体重数据失败',
          showCancel: false
        });
      });
      wx.hideLoading({});
    }, 0);
  }

  private createLocalDateObject(dateMoment: moment): any {
    return {
      date: dateMoment,
      year: dateMoment.format('YYYY'),
      month: dateMoment.format('MM'),
      day: dateMoment.format('DD')
    };
  }

  public onShow(e) {
    this.retrieveData();
  }

  public onLoad(): void {
    this.retrieveData();
    this.computeInitChartViewInterval();

    wx.setNavigationBarTitle({
      title: "体重记录"
    });

    var windowWidth = 160;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    // this.generateWeightLogData();
  }

  // used to create dummy data
  // public generateWeightLogData() {
  //   let token = wx.getStorageSync(globalEnum.globalKey_token);
  //   webAPI.SetAuthToken(token);
  //   let weightFloat = 65;
  //   let weightInt = 65;
  //   let date = 1556640000;

  //   for(var i=0; i<64; i++) {
  //     let req = {
  //       "weight_value": weightInt,
  //       "date": date
  //     }

  //     console.log("Call " + i);
  //     console.log(weightInt);
  //     console.log(moment.unix(date).format('YYYY-MM-DD'));
  //     // call
  //     webAPI.CreateWeightLog(req).then(resp => {
        
  //     }).catch(err => wx.hideLoading());

  //     weightFloat += 0.1;
  //     weightInt = Math.floor(weightFloat);
  //     date += 86400;
  //   } 
  // }
}

Page(new weightRecordPage());