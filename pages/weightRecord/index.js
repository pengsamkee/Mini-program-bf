"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var app = getApp();
var chart = null;
function setWeightLineAndPoints() {
    chart.line().position(['date', 'weight']);
    chart.point()
        .position(['date', 'weight'])
        .style({ fill: '#ffffff', r: 3.2, lineWidth: 2, stroke: '#f3465a' });
}
function setTooltips() {
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
            items[0].title = items[0].title.toString();
            items[0].name = "";
            items[0].value = items[0].value.toString() + "公斤";
        }
    });
}
function setTargetLine(targetWeight) {
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
function setInitLine(initWeight) {
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
function setRectLegends() {
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
function setUpperBoundRect(startYCoord, endYCoord) {
    chart.guide().rect({
        start: ['min', startYCoord],
        end: ['max', endYCoord],
        style: { fillOpacity: 0.4, fill: '#ff5c47', lineWidth: 0.5, stroke: '#ff5c47' }
    });
}
function setLowerBoundRect(startYCoord, endYCoord) {
    chart.guide().rect({
        start: ['min', startYCoord],
        end: ['max', endYCoord],
        style: { fillOpacity: 0.4, fill: '#fcda76', lineWidth: 0.5, stroke: '#fcda76' }
    });
}
function computeMinMaxWeightWithTarget(inputArr, targetWeight) {
    var maxWeight = -1;
    var minWeight = Number.MAX_SAFE_INTEGER;
    for (var index = 0; index < inputArr.length; index++) {
        if (inputArr[index].weight > maxWeight || targetWeight > maxWeight) {
            if (inputArr[index].weight > targetWeight) {
                maxWeight = inputArr[index].weight;
            }
            else {
                maxWeight = targetWeight;
            }
        }
        if (inputArr[index].weight < minWeight || targetWeight < minWeight) {
            if (inputArr[index].weight < targetWeight) {
                minWeight = inputArr[index].weight;
            }
            else {
                minWeight = targetWeight;
            }
        }
    }
    return { minWeight: minWeight, maxWeight: maxWeight };
}
function computeMinMaxWeightWithoutTarget(inputArr) {
    var maxWeight = -1;
    var minWeight = Number.MAX_SAFE_INTEGER;
    for (var index = 0; index < inputArr.length; index++) {
        if (inputArr[index].weight > maxWeight) {
            maxWeight = inputArr[index].weight;
        }
        if (inputArr[index].weight < minWeight) {
            minWeight = inputArr[index].weight;
        }
    }
    return { minWeight: minWeight, maxWeight: maxWeight };
}
function renderChartWeekView(inputArr, currWeek, initWeight, targetWeight, isPregnantLady, upperBound, lowerBound) {
    var maxWeight = -1;
    var minWeight = Number.MAX_SAFE_INTEGER;
    chart.clear();
    chart.source(inputArr);
    var weekArr = [];
    for (var i = 0; i < 7; i++) {
        var tempDay = moment().week(currWeek).day(i).format('YYYY-MM-DD');
        weekArr.push(tempDay);
    }
    chart.scale('date', {
        type: 'cat',
        values: weekArr,
        formatter: function (date) {
            var dateTokenArr = date.split("-");
            return dateTokenArr[2];
        }
    });
    setWeightLineAndPoints();
    setTooltips();
    if (targetWeight != 0 && !isPregnantLady) {
        setTargetLine(targetWeight);
        var temp = computeMinMaxWeightWithTarget(inputArr, targetWeight);
        minWeight = temp.minWeight;
        maxWeight = temp.maxWeight;
    }
    else {
        var temp = computeMinMaxWeightWithoutTarget(inputArr);
        minWeight = temp.minWeight;
        maxWeight = temp.maxWeight;
    }
    if (initWeight >= minWeight - 3 && initWeight <= maxWeight + 3 && !isPregnantLady) {
        setInitLine(initWeight);
    }
    var scaleMin = minWeight - 3 < 0 ? 0 : minWeight - 3;
    var scaleMax = maxWeight + 3 < 3 ? 3 : maxWeight + 3;
    if (isPregnantLady) {
        if (upperBound < scaleMax && upperBound > scaleMin) {
            setUpperBoundRect(upperBound, scaleMax);
        }
        else if (upperBound < scaleMax && upperBound <= scaleMin) {
            setUpperBoundRect(scaleMin, scaleMax);
        }
        if (lowerBound > scaleMin && lowerBound < scaleMax) {
            setLowerBoundRect(scaleMin, lowerBound);
        }
        else if (lowerBound > scaleMin && lowerBound >= scaleMax) {
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
function renderChartMonthView(inputArr, currMonth, initWeight, targetWeight, isPregnantLady, upperBound, lowerBound) {
    var maxWeight = -1;
    var minWeight = Number.MAX_SAFE_INTEGER;
    chart.clear();
    chart.source(inputArr);
    var monthArr = [];
    for (var i = 1; i <= moment().month(currMonth).daysInMonth(); i++) {
        var tempDay = moment().month(currMonth).date(i).format('YYYY-MM-DD');
        monthArr.push(tempDay);
    }
    var tickStart = monthArr[0];
    var tickEnd = monthArr[monthArr.length - 1];
    chart.scale('date', {
        type: 'cat',
        values: monthArr,
        ticks: [tickStart, tickEnd],
        formatter: function (date) {
            var dateTokenArr = date.split("-");
            return dateTokenArr[2];
        }
    });
    setWeightLineAndPoints();
    setTooltips();
    if (targetWeight != 0 && !isPregnantLady) {
        setTargetLine(targetWeight);
        var temp = computeMinMaxWeightWithTarget(inputArr, targetWeight);
        minWeight = temp.minWeight;
        maxWeight = temp.maxWeight;
    }
    else {
        var temp = computeMinMaxWeightWithoutTarget(inputArr);
        minWeight = temp.minWeight;
        maxWeight = temp.maxWeight;
    }
    if (initWeight >= minWeight - 3 && initWeight <= maxWeight + 3 && !isPregnantLady) {
        setInitLine(initWeight);
    }
    var scaleMin = minWeight - 3 < 0 ? 0 : minWeight - 3;
    var scaleMax = maxWeight + 3 < 3 ? 3 : maxWeight + 3;
    if (isPregnantLady) {
        if (upperBound < scaleMax && upperBound > scaleMin) {
            setUpperBoundRect(upperBound, scaleMax);
        }
        else if (upperBound < scaleMax && upperBound < scaleMin) {
            setUpperBoundRect(scaleMin, scaleMax);
        }
        if (lowerBound > scaleMin && lowerBound < scaleMax) {
            setLowerBoundRect(scaleMin, lowerBound);
        }
        else if (lowerBound > scaleMin && lowerBound > scaleMax) {
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
function initChart(canvas, width, height, F2) {
    F2.Global.setTheme({
        colors: ['#F3465A', '#D66BCA', '#8543E0', '#8E77ED', '#3436C7', '#737EE6', '#223273', '#7EA2E6'],
        pixelRatio: 2,
        guide: {
            line: { stroke: '#F3465A', lineWidth: 2 }
        }
    });
    chart = new F2.Chart({ el: canvas, width: width, height: height, animate: true, padding: [50, 50, 50, 50] });
    var currWeek = moment().week();
    var weekArr = [];
    for (var i = 0; i < 7; i++) {
        var tempDay = moment().week(currWeek).day(i).format('YYYY-MM-DD');
        weekArr.push(tempDay);
    }
    var emptyInputArr = [{
            "date": "2019-06-01",
            "weight": 50
        }];
    chart.source(emptyInputArr, {
        date: {
            type: 'cat',
            values: weekArr,
            formatter: function (date) {
                var dateTokenArr = date.split("-");
                return dateTokenArr[2];
            }
        }
    });
    setWeightLineAndPoints();
    chart.render();
    var firstDayOfWeek = moment().week(currWeek).day(0).hour(0).minute(0).second(0).unix();
    var lastDayOfWeek = moment().week(currWeek).day(6).hour(0).minute(0).second(0).unix();
    console.log("First day of week unix " + firstDayOfWeek + " last day of week unix " + lastDayOfWeek);
    weightRecordPage.getWeekViewData(currWeek, firstDayOfWeek);
    return chart;
}
var weightRecordPage = (function () {
    function weightRecordPage() {
        this.data = {
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
            showContent: false,
        };
    }
    weightRecordPage.getWeekViewData = function (currWeek, startTimeStamp) {
        var tempTimestamp;
        var inputArr = [];
        for (var i = 0; i < 7; i++) {
            tempTimestamp = startTimeStamp + (i * 3600 * 24);
            var tempDate = moment.unix(tempTimestamp).format('YYYY-MM-DD');
            var tempWeight = weightRecordPage.timestampWeightMap.get(tempTimestamp);
            if (tempWeight != undefined) {
                var temp = {
                    "date": tempDate,
                    "weight": tempWeight
                };
                inputArr.push(temp);
            }
        }
        renderChartWeekView(inputArr, currWeek, weightRecordPage.initWeight, weightRecordPage.targetWeight, weightRecordPage.isPregnantLady, weightRecordPage.pregUpperBound, weightRecordPage.pregLowerBound);
    };
    weightRecordPage.getMonthViewData = function (currMonth, startTimeStamp) {
        var tempTimestamp;
        var inputArr = [];
        for (var i = 0; i < moment().month(currMonth).daysInMonth(); i++) {
            tempTimestamp = startTimeStamp + (i * 3600 * 24);
            var tempDate = moment.unix(tempTimestamp).format('YYYY-MM-DD');
            var tempWeight = weightRecordPage.timestampWeightMap.get(tempTimestamp);
            if (tempWeight != undefined) {
                var temp = {
                    "date": tempDate,
                    "weight": tempWeight
                };
                inputArr.push(temp);
            }
        }
        renderChartMonthView(inputArr, currMonth, weightRecordPage.initWeight, weightRecordPage.targetWeight, weightRecordPage.isPregnantLady, weightRecordPage.pregUpperBound, weightRecordPage.pregLowerBound);
    };
    weightRecordPage.prototype.onNavbarSelect1 = function () {
        this.setData({
            isTabOneSelected: true,
            tabOneStyleClass: "weui-navbar__item weui-bar__item_on",
            tabTwoStyleClass: "weui-navbar__item"
        });
    };
    weightRecordPage.prototype.onNavbarSelect2 = function () {
        this.setData({
            isTabOneSelected: false,
            tabOneStyleClass: "weui-navbar__item",
            tabTwoStyleClass: "weui-navbar__item weui-bar__item_on"
        });
        this.computeInitChartViewInterval();
    };
    weightRecordPage.prototype.navigateToWeightInputPage = function () {
        wx.navigateTo({
            url: "/pages/weightRecord/weightInput"
        });
    };
    weightRecordPage.prototype.navigateToTargetInputPage = function () {
        wx.navigateTo({
            url: "/pages/weightRecord/targetInput"
        });
    };
    weightRecordPage.prototype.checkWeekInterval = function (newWeekStart) {
        var presentWeek = moment();
        var newWeek = newWeekStart;
        if (newWeek.isAfter(presentWeek, 'week')) {
            this.setWeekViewFlags(true, false);
            return false;
        }
        else {
            if (newWeek.isSame(presentWeek, 'week')) {
                this.setWeekViewFlags(true, false);
            }
            else {
                this.setWeekViewFlags(true, true);
            }
            return true;
        }
    };
    weightRecordPage.prototype.checkMonthInterval = function (newMonthStart) {
        var presentMonth = moment();
        var newMonth = newMonthStart;
        if (newMonth.isAfter(presentMonth, 'month')) {
            this.setMonthViewFlags(true, false);
            return false;
        }
        else {
            if (newMonth.isSame(presentMonth, 'month')) {
                this.setMonthViewFlags(true, false);
            }
            else {
                this.setMonthViewFlags(true, true);
            }
            return true;
        }
    };
    weightRecordPage.prototype.setWeekViewFlags = function (prevWeekFlag, nextWeekFlag) {
        this.setData({
            isPrevWeekAllowed: prevWeekFlag,
            isNextWeekAllowed: nextWeekFlag
        });
    };
    weightRecordPage.prototype.setMonthViewFlags = function (prevMonthFlag, nextMonthFlag) {
        this.setData({
            isPrevMonthAllowed: prevMonthFlag,
            isNextMonthAllowed: nextMonthFlag
        });
    };
    weightRecordPage.prototype.prevWeekInterval = function () {
        var newWeekStart = this.data.chartWeekViewStart.date.subtract(1, 'w');
        var newWeekEnd = this.data.chartWeekViewEnd.date.subtract(1, 'w');
        if (this.checkWeekInterval(newWeekStart)) {
            this.setWeekViewInterval(newWeekStart, newWeekEnd);
            console.log("Unix: " + newWeekStart.unix() + " till " + newWeekEnd.unix());
            var weekNum = newWeekStart.week();
            weightRecordPage.getWeekViewData(weekNum, newWeekStart.unix());
        }
    };
    weightRecordPage.prototype.prevMonthInterval = function () {
        var newMonthStart = this.data.chartMonthViewStart.date.subtract(1, 'M');
        var newMonthEnd = this.data.chartMonthViewEnd.date.subtract(1, 'M');
        if (this.checkMonthInterval(newMonthStart)) {
            this.setMonthViewInterval(newMonthStart, newMonthEnd);
            console.log("Unix: " + newMonthStart.unix() + " till " + newMonthEnd.unix());
            var monthNum = newMonthStart.month();
            weightRecordPage.getMonthViewData(monthNum, newMonthStart.unix());
        }
    };
    weightRecordPage.prototype.nextWeekInterval = function () {
        var newWeekStart = this.data.chartWeekViewStart.date.add(1, 'w');
        var newWeekEnd = this.data.chartWeekViewEnd.date.add(1, 'w');
        if (this.checkWeekInterval(newWeekStart)) {
            this.setWeekViewInterval(newWeekStart, newWeekEnd);
            console.log("Unix: " + newWeekStart.unix() + " till " + newWeekEnd.unix());
            var weekNum = newWeekStart.week();
            weightRecordPage.getWeekViewData(weekNum, newWeekStart.unix());
        }
    };
    weightRecordPage.prototype.nextMonthInterval = function (e) {
        var newMonthStart = this.data.chartMonthViewStart.date.add(1, 'M');
        var newMonthEnd = this.data.chartMonthViewEnd.date.add(1, 'M');
        if (this.checkMonthInterval(newMonthStart)) {
            this.setMonthViewInterval(newMonthStart, newMonthEnd);
            console.log("Unix: " + newMonthStart.unix() + " till " + newMonthEnd.unix());
            var monthNum = newMonthStart.month();
            weightRecordPage.getMonthViewData(monthNum, newMonthStart.unix());
        }
    };
    weightRecordPage.prototype.setWeekViewInterval = function (newWeekStart, newWeekEnd) {
        this.setData({
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
    };
    weightRecordPage.prototype.setMonthViewInterval = function (newMonthStart, newMonthEnd) {
        this.setData({
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
    };
    weightRecordPage.prototype.bindChartViewChange = function (e) {
        if (this.data.chartViewIdx === '0' && e.detail.value === '1') {
            var currMonth = moment().month();
            var firstDayOfMonth = moment().month(currMonth).startOf("month");
            var lastDayOfMonth = moment().month(currMonth).endOf("month");
            console.log("First day of month " + firstDayOfMonth.format("MM-DD-HH-MM-SS") + "last day of month" + lastDayOfMonth.format("MM-DD-HH-MM-SS"));
            this.setMonthViewInterval(firstDayOfMonth, lastDayOfMonth);
            this.setData({
                chartViewIdx: e.detail.value,
            });
            console.log("Graphhhh first day of month unix " + firstDayOfMonth.unix() + " last day of month unix " + lastDayOfMonth.unix());
            weightRecordPage.getMonthViewData(currMonth, firstDayOfMonth.unix());
        }
        if (this.data.chartViewIdx === '1' && e.detail.value === '0') {
            var currWeek = moment().week();
            var firstDayOfWeek = moment().week(currWeek).day(0).hour(0).minute(0).second(0);
            var lastDayOfWeek = moment().week(currWeek).day(6).hour(0).minute(0).second(0);
            this.setWeekViewInterval(firstDayOfWeek, lastDayOfWeek);
            this.setData({
                chartViewIdx: e.detail.value,
            });
            console.log("Graphhhh first day of week unix " + firstDayOfWeek.unix() + " last day of week unix " + lastDayOfWeek.unix());
            weightRecordPage.getWeekViewData(currWeek, firstDayOfWeek.unix());
        }
    };
    weightRecordPage.prototype.computePregInfo = function (dateOfDelivery) {
        var dateOfConceptionMoment = dateOfDelivery.subtract(40, 'w');
        var tempDate = {
            date: dateOfConceptionMoment.format("YYYY-MM-DD"),
            year: dateOfConceptionMoment.format("YYYY"),
            month: dateOfConceptionMoment.format("MM"),
            day: dateOfConceptionMoment.format("DD")
        };
        this.setData({
            dateOfConception: tempDate
        });
    };
    weightRecordPage.prototype.computeInitChartViewInterval = function () {
        var currWeek = moment().week();
        var currMonth = moment().month();
        var firstDayOfWeek = moment().week(currWeek).day(0).hour(0).minute(0).second(0);
        var lastDayOfWeek = moment().week(currWeek).day(6).hour(0).minute(0).second(0);
        this.setWeekViewInterval(firstDayOfWeek, lastDayOfWeek);
        var firstDayOfMonth = moment().month(currMonth).startOf("month");
        var lastDayOfMonth = moment().month(currMonth).endOf("month");
        this.setMonthViewInterval(firstDayOfMonth, lastDayOfMonth);
        this.setData({
            isPrevWeekAllowed: true,
            isNextWeekAllowed: false,
            isPrevMonthAllowed: true,
            isNextMonthAllowed: false,
            chartViewIdx: '0'
        });
    };
    weightRecordPage.prototype.retrieveData = function () {
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
        var that = this;
        var currWeek = moment().week();
        var firstDayOfWeek = moment().week(currWeek).day(0).unix();
        var lastDayOfWeek = moment().week(currWeek).day(6).unix();
        wx.showLoading({
            title: '正在加载',
        });
        setTimeout(function () {
            var req = {
                date_from: 0,
                date_to: lastDayOfWeek
            };
            webAPI.RetrieveWeightLog(req).then(function (resp) {
                console.log('RetrieveWeightLog', resp);
                var tempDateOfDelivery = that.createLocalDateObject(moment.unix(resp.expected_birth_date));
                var tempInitDate = that.createLocalDateObject(moment.unix(resp.initial_weight.date));
                var tempLatestDate = that.createLocalDateObject(moment.unix(resp.latest_weight.date));
                var tempTargetDate = that.createLocalDateObject(moment.unix(resp.target_weight.date));
                var tempDatesWithRecords = [];
                var tempWeights = [];
                var tempMap = new Map();
                for (var i = 0; i < resp.weight_logs.length; i++) {
                    var tempMoment = moment.unix(resp.weight_logs[i].date);
                    tempDatesWithRecords.push({
                        date: tempMoment.format('YYYY-MM-DD'),
                        year: tempMoment.format("YYYY"),
                        month: tempMoment.format("MM"),
                        day: tempMoment.format("DD")
                    });
                    tempMap.set(resp.weight_logs[i].date, resp.weight_logs[i].value);
                    tempWeights.push(resp.weight_logs[i].value);
                }
                that.setData({
                    showContent: true,
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
                    weeklyWeightChangeLower: resp.weight_change_range.lower / 100,
                    weeklyWeightChangeUpper: resp.weight_change_range.upper / 100
                });
                weightRecordPage.initWeight = resp.initial_weight.value;
                weightRecordPage.targetWeight = resp.target_weight.value;
                weightRecordPage.isPregnantLady = resp.is_pregnant_lady;
                weightRecordPage.pregUpperBound = resp.weight_upper_bound;
                weightRecordPage.pregLowerBound = resp.weight_lower_bound;
                weightRecordPage.timestampWeightMap = tempMap;
                if (resp.target_weight.value == 0) {
                    that.setData({
                        isTargetSet: false
                    });
                }
                that.computePregInfo(moment.unix(resp.expected_birth_date));
            }).catch(function (err) {
                wx.showModal({
                    title: '',
                    content: '获取体重数据失败',
                    showCancel: false
                });
            });
            wx.hideLoading({});
        }, 0);
    };
    weightRecordPage.prototype.createLocalDateObject = function (dateMoment) {
        return {
            date: dateMoment,
            year: dateMoment.format('YYYY'),
            month: dateMoment.format('MM'),
            day: dateMoment.format('DD')
        };
    };
    weightRecordPage.prototype.onShow = function (e) {
        this.retrieveData();
    };
    weightRecordPage.prototype.onLoad = function () {
        this.retrieveData();
        this.computeInitChartViewInterval();
        wx.setNavigationBarTitle({
            title: "体重记录"
        });
        var windowWidth = 160;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        }
        catch (e) {
            console.error('getSystemInfoSync failed!');
        }
    };
    return weightRecordPage;
}());
Page(new weightRecordPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLCtCQUFpQztBQUVqQyxpREFBbUQ7QUFDbkQsaURBQW1EO0FBRW5ELElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFDO0FBQzdCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUVqQixTQUFTLHNCQUFzQjtJQUM3QixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDMUMsS0FBSyxDQUFDLEtBQUssRUFBRTtTQUNWLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM1QixLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRUQsU0FBUyxXQUFXO0lBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDWixVQUFVLEVBQUUsSUFBSTtRQUNoQixjQUFjLEVBQUUsSUFBSTtRQUNwQixjQUFjLEVBQUUsS0FBSztRQUNyQixTQUFTLEVBQUUsSUFBSTtRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDaEQsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtRQUM5QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1FBQy9CLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7UUFDL0IsTUFBTSxFQUFFLFNBQVMsTUFBTSxDQUFDLEVBQUU7WUFDeEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNyQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDMUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNwRCxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLFlBQW9CO0lBQ3pDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQztRQUM1QixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDO1FBQzFCLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0tBQy9ELENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakIsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQztRQUMvQixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1FBQ25FLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLFVBQWtCO0lBQ3JDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztRQUMxQixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO1FBQ3hCLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0tBQy9ELENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakIsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztRQUM3QixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1FBQ3RFLE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsY0FBYztJQUNyQixLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ1gsUUFBUSxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsUUFBUTtRQUNmLE1BQU0sRUFBRSxJQUFJO1FBQ1osS0FBSyxFQUFFO1lBQ0wsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRTtZQUNyRixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFO1NBQ3RGO1FBQ0QsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtLQUMvQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBR0QsU0FBUyxpQkFBaUIsQ0FBQyxXQUFtQixFQUFFLFNBQWlCO0lBQy9ELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQztRQUMzQixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7S0FDaEYsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUdELFNBQVMsaUJBQWlCLENBQUMsV0FBbUIsRUFBRSxTQUFpQjtJQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUM7UUFDM0IsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztRQUN2QixLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0tBQ2hGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFLRCxTQUFTLDZCQUE2QixDQUFDLFFBQWUsRUFBRSxZQUFvQjtJQUMxRSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuQixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7SUFFeEMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFFcEQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLFNBQVMsSUFBSSxZQUFZLEdBQUcsU0FBUyxFQUFFO1lBQ2xFLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxZQUFZLEVBQUU7Z0JBQ3pDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO2FBQ3BDO2lCQUFNO2dCQUNMLFNBQVMsR0FBRyxZQUFZLENBQUM7YUFDMUI7U0FDRjtRQUVELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxTQUFTLElBQUksWUFBWSxHQUFHLFNBQVMsRUFBRTtZQUNsRSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxFQUFFO2dCQUN6QyxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUNwQztpQkFBTTtnQkFDTCxTQUFTLEdBQUcsWUFBWSxDQUFDO2FBQzFCO1NBQ0Y7S0FDRjtJQUNELE9BQU8sRUFBRSxTQUFTLFdBQUEsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDO0FBQ2xDLENBQUM7QUFHRCxTQUFTLGdDQUFnQyxDQUFDLFFBQWU7SUFDdkQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0lBRXhDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3BELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxTQUFTLEVBQUU7WUFDdEMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDcEM7UUFFRCxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxFQUFFO1lBQ3RDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ3BDO0tBQ0Y7SUFDRCxPQUFPLEVBQUUsU0FBUyxXQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBR0QsU0FBUyxtQkFBbUIsQ0FBQyxRQUFlLEVBQUUsUUFBZ0IsRUFBRSxVQUFrQixFQUFFLFlBQW9CLEVBQUUsY0FBdUIsRUFBRSxVQUFrQixFQUFFLFVBQWtCO0lBQ3ZLLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25CLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUd4QyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXZCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLElBQUksT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdkI7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNsQixJQUFJLEVBQUUsS0FBSztRQUNYLE1BQU0sRUFBRSxPQUFPO1FBQ2YsU0FBUyxFQUFFLFVBQVUsSUFBWTtZQUMvQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pCLFdBQVcsRUFBRSxDQUFDO0lBR2QsSUFBSSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ3hDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUU1QixJQUFJLElBQUksR0FBVyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDekUsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDM0IsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDNUI7U0FBTTtRQUNMLElBQUksSUFBSSxHQUFXLGdDQUFnQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlELFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzNCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0tBQzVCO0lBRUQsSUFBSSxVQUFVLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxVQUFVLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNqRixXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekI7SUFFRCxJQUFJLFFBQVEsR0FBVyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzdELElBQUksUUFBUSxHQUFXLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFFN0QsSUFBSSxjQUFjLEVBQUU7UUFFbEIsSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDbEQsaUJBQWlCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsSUFBSSxRQUFRLEVBQUU7WUFDMUQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO1FBR0QsSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDbEQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsSUFBSSxRQUFRLEVBQUU7WUFDMUQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsY0FBYyxFQUFFLENBQUM7S0FDbEI7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtRQUNwQixHQUFHLEVBQUUsUUFBUTtRQUNiLEdBQUcsRUFBRSxRQUFRO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFHRCxTQUFTLG9CQUFvQixDQUFDLFFBQWUsRUFBRSxTQUFpQixFQUFFLFVBQWtCLEVBQUUsWUFBb0IsRUFBRSxjQUF1QixFQUFFLFVBQWtCLEVBQUUsVUFBa0I7SUFDekssSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0lBR3hDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFdkIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDakUsSUFBSSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckUsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN4QjtJQUVELElBQUksU0FBUyxHQUFXLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxJQUFJLE9BQU8sR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwRCxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNsQixJQUFJLEVBQUUsS0FBSztRQUNYLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDM0IsU0FBUyxFQUFFLFVBQVUsSUFBWTtZQUMvQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pCLFdBQVcsRUFBRSxDQUFDO0lBR2QsSUFBSSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ3hDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUU1QixJQUFJLElBQUksR0FBVyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDekUsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDM0IsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDNUI7U0FBTTtRQUNMLElBQUksSUFBSSxHQUFXLGdDQUFnQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlELFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzNCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0tBQzVCO0lBRUQsSUFBSSxVQUFVLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxVQUFVLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNqRixXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekI7SUFFRCxJQUFJLFFBQVEsR0FBVyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzdELElBQUksUUFBUSxHQUFXLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFFN0QsSUFBSSxjQUFjLEVBQUU7UUFFbEIsSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDbEQsaUJBQWlCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDekQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO1FBR0QsSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDbEQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSxVQUFVLEdBQUcsUUFBUSxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUU7WUFDekQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsY0FBYyxFQUFFLENBQUM7S0FDbEI7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtRQUNwQixHQUFHLEVBQUUsUUFBUTtRQUNiLEdBQUcsRUFBRSxRQUFRO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFHRCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2pCLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDaEcsVUFBVSxFQUFFLENBQUM7UUFDYixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7U0FDMUM7S0FDRixDQUFDLENBQUM7SUFFSCxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLE9BQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUc5RixJQUFJLFFBQVEsR0FBVyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFFakIsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNyQixJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZCO0lBRUQsSUFBSSxhQUFhLEdBQUcsQ0FBQztZQUNuQixNQUFNLEVBQUUsWUFBWTtZQUNwQixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUMsQ0FBQztJQUdILEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFO1FBQzFCLElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxLQUFLO1lBQ1gsTUFBTSxFQUFFLE9BQU87WUFDZixTQUFTLEVBQUUsVUFBUyxJQUFZO2dCQUM5QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUdmLElBQUksY0FBYyxHQUFXLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0YsSUFBSSxhQUFhLEdBQVcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5RixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixHQUFHLGNBQWMsR0FBRyx5QkFBeUIsR0FBRyxhQUFhLENBQUMsQ0FBQztJQUdwRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRTNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFDWixjQUFjLEVBQUUsSUFBSTtZQUNwQixjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQ2pFLFlBQVksRUFBRSxDQUFDO1lBQ2YsVUFBVSxFQUFFO2dCQUNWLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUNuQyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDN0IsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQzNCO1lBQ0QsWUFBWSxFQUFFLElBQUk7WUFDbEIsT0FBTyxFQUFFLEVBQUU7WUFDWCxnQkFBZ0IsRUFBRSxTQUFTO1lBQzNCLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtZQUM1RCxVQUFVLEVBQUUsTUFBTTtZQUNsQixRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1lBQ3RFLFlBQVksRUFBRSxNQUFNO1lBQ3BCLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7WUFDeEUsWUFBWSxFQUFFLE1BQU07WUFDcEIsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtZQUN4RSxXQUFXLEVBQUUsS0FBSztZQUNsQixvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLG9CQUFvQixFQUFFLENBQUM7WUFDdkIsdUJBQXVCLEVBQUUsR0FBRztZQUM1Qix1QkFBdUIsRUFBRSxHQUFHO1lBQzVCLFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxTQUFTO2FBQ2xCO1lBQ0QsWUFBWSxFQUFFLEdBQUc7WUFDakIsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNyQixrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtZQUM1RSxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtZQUMxRSxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsbUJBQW1CLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7WUFDN0UsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7WUFDM0Usa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsZ0JBQWdCLEVBQUUscUNBQXFDO1lBQ3ZELGdCQUFnQixFQUFFLG1CQUFtQjtZQUNyQyxXQUFXLEVBQUMsS0FBSztTQUNsQixDQUFDO0lBaWNKLENBQUM7SUF4YmUsZ0NBQWUsR0FBN0IsVUFBOEIsUUFBZ0IsRUFBRSxjQUFzQjtRQUNwRSxJQUFJLGFBQXFCLENBQUM7UUFDMUIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsYUFBYSxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxRQUFRLEdBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdkUsSUFBSSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hFLElBQUksVUFBVSxJQUFJLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxJQUFJLEdBQUc7b0JBQ1QsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLFFBQVEsRUFBRSxVQUFVO2lCQUNyQixDQUFBO2dCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckI7U0FDRjtRQUNELG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pNLENBQUM7SUFFYSxpQ0FBZ0IsR0FBOUIsVUFBK0IsU0FBaUIsRUFBRSxjQUFzQjtRQUN0RSxJQUFJLGFBQXFCLENBQUM7UUFDMUIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEUsYUFBYSxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxRQUFRLEdBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdkUsSUFBSSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hFLElBQUksVUFBVSxJQUFJLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxJQUFJLEdBQUc7b0JBQ1QsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLFFBQVEsRUFBRSxVQUFVO2lCQUNyQixDQUFBO2dCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckI7U0FDRjtRQUVELG9CQUFvQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNNLENBQUM7SUFFTSwwQ0FBZSxHQUF0QjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixnQkFBZ0IsRUFBRSxxQ0FBcUM7WUFDdkQsZ0JBQWdCLEVBQUUsbUJBQW1CO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSwwQ0FBZSxHQUF0QjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixnQkFBZ0IsRUFBRSxtQkFBbUI7WUFDckMsZ0JBQWdCLEVBQUUscUNBQXFDO1NBQ3hELENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFTSxvREFBeUIsR0FBaEM7UUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osR0FBRyxFQUFFLGlDQUFpQztTQUN2QyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sb0RBQXlCLEdBQWhDO1FBQ0UsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxpQ0FBaUM7U0FDdkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdNLDRDQUFpQixHQUF4QixVQUF5QixZQUFvQjtRQUMzQyxJQUFJLFdBQVcsR0FBVyxNQUFNLEVBQUUsQ0FBQztRQUNuQyxJQUFJLE9BQU8sR0FBVyxZQUFZLENBQUM7UUFFbkMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1NBRWQ7YUFBTTtZQUNMLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFHcEM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNuQztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBR00sNkNBQWtCLEdBQXpCLFVBQTBCLGFBQXFCO1FBQzdDLElBQUksWUFBWSxHQUFXLE1BQU0sRUFBRSxDQUFDO1FBQ3BDLElBQUksUUFBUSxHQUFXLGFBQWEsQ0FBQztRQUVyQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEMsT0FBTyxLQUFLLENBQUM7U0FFZDthQUFNO1lBQ0wsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUVyQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFFTywyQ0FBZ0IsR0FBeEIsVUFBeUIsWUFBcUIsRUFBRSxZQUFxQjtRQUNsRSxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLGlCQUFpQixFQUFFLFlBQVk7WUFDL0IsaUJBQWlCLEVBQUUsWUFBWTtTQUNoQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sNENBQWlCLEdBQXpCLFVBQTBCLGFBQXNCLEVBQUUsYUFBc0I7UUFDckUsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixrQkFBa0IsRUFBRSxhQUFhO1lBQ2pDLGtCQUFrQixFQUFFLGFBQWE7U0FDbEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdNLDJDQUFnQixHQUF2QjtRQUNFLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsRSxJQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRW5ELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDM0UsSUFBSSxPQUFPLEdBQVcsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDaEU7SUFDSCxDQUFDO0lBR00sNENBQWlCLEdBQXhCO1FBQ0UsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBFLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM3RSxJQUFJLFFBQVEsR0FBVyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0MsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ25FO0lBQ0gsQ0FBQztJQUdNLDJDQUFnQixHQUF2QjtRQUNFLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakUsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRW5ELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDM0UsSUFBSSxPQUFPLEdBQVcsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDaEU7SUFDSCxDQUFDO0lBR00sNENBQWlCLEdBQXhCLFVBQXlCLENBQUM7UUFDeEIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRS9ELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM3RSxJQUFJLFFBQVEsR0FBVyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0MsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ25FO0lBQ0gsQ0FBQztJQUVPLDhDQUFtQixHQUEzQixVQUE0QixZQUFvQixFQUFFLFVBQWtCO1FBQ2pFLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsa0JBQWtCLEVBQUU7Z0JBQ2xCLElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEMsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQy9CO1lBQ0QsZ0JBQWdCLEVBQUU7Z0JBQ2hCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDOUIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLCtDQUFvQixHQUE1QixVQUE2QixhQUFxQixFQUFFLFdBQW1CO1FBQ3BFLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsbUJBQW1CLEVBQUU7Z0JBQ25CLElBQUksRUFBRSxhQUFhO2dCQUNuQixJQUFJLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLEtBQUssRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDakMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQ2hDO1lBQ0QsaUJBQWlCLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDL0IsR0FBRyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQzlCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhDQUFtQixHQUExQixVQUEyQixDQUFNO1FBRS9CLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUM1RCxJQUFJLFNBQVMsR0FBVyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QyxJQUFJLGVBQWUsR0FBVyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLElBQUksY0FBYyxHQUFXLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsbUJBQW1CLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFOUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUUxRCxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixZQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO2FBQzdCLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLDBCQUEwQixHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9ILGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN0RTtRQUdELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUM1RCxJQUFJLFFBQVEsR0FBVyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QyxJQUFJLGNBQWMsR0FBVyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksYUFBYSxHQUFXLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV2RCxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixZQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO2FBQzdCLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEdBQUcsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLHlCQUF5QixHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNILGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDbkU7SUFDSCxDQUFDO0lBRU0sMENBQWUsR0FBdEIsVUFBdUIsY0FBc0I7UUFJM0MsSUFBSSxzQkFBc0IsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5RCxJQUFJLFFBQVEsR0FBRztZQUNiLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ2pELElBQUksRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzNDLEtBQUssRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQ3pDLENBQUM7UUFFRCxJQUFZLENBQUMsT0FBTyxDQUFDO1lBRXBCLGdCQUFnQixFQUFFLFFBQVE7U0FDM0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdNLHVEQUE0QixHQUFuQztRQUNFLElBQUksUUFBUSxHQUFXLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZDLElBQUksU0FBUyxHQUFXLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXpDLElBQUksY0FBYyxHQUFXLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsSUFBSSxhQUFhLEdBQVcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXhELElBQUksZUFBZSxHQUFHLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsSUFBSSxjQUFjLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRzFELElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLGtCQUFrQixFQUFFLElBQUk7WUFDeEIsa0JBQWtCLEVBQUUsS0FBSztZQUN6QixZQUFZLEVBQUUsR0FBRztTQUNsQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sdUNBQVksR0FBbkI7UUFDRSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLFFBQVEsR0FBVyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QyxJQUFJLGNBQWMsR0FBVyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25FLElBQUksYUFBYSxHQUFXLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbEUsRUFBRSxDQUFDLFdBQVcsQ0FBQztZQUNiLEtBQUssRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDO1lBQ1QsSUFBSSxHQUFHLEdBQUc7Z0JBQ1IsU0FBUyxFQUFFLENBQUM7Z0JBQ1osT0FBTyxFQUFFLGFBQWE7YUFDdkIsQ0FBQztZQUVGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO2dCQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFDLElBQUksQ0FBQyxDQUFDO2dCQUd0QyxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzNGLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckYsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO2dCQUM5QixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDaEQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7d0JBQ3hCLElBQUksRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzt3QkFDckMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO3dCQUMvQixLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQzlCLEdBQUcsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztxQkFDN0IsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDakUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM3QztnQkFFQSxJQUFZLENBQUMsT0FBTyxDQUFDO29CQUNwQixXQUFXLEVBQUMsSUFBSTtvQkFDaEIsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSztvQkFDckMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSztvQkFDdEMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSztvQkFDdEMsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLFVBQVUsRUFBRSxjQUFjO29CQUMxQixVQUFVLEVBQUUsY0FBYztvQkFDMUIsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07b0JBQ25DLG9CQUFvQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7b0JBQzdDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7b0JBQzdDLGNBQWMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO29CQUNyQyxjQUFjLEVBQUUsa0JBQWtCO29CQUNsQyxZQUFZLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjtvQkFDM0MsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBQyxHQUFHO29CQUMzRCx1QkFBdUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxHQUFDLEdBQUc7aUJBQzVELENBQUMsQ0FBQztnQkFFSCxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hELGdCQUFnQixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztnQkFDekQsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDeEQsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztnQkFDMUQsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztnQkFDMUQsZ0JBQWdCLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDO2dCQUc5QyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFDaEMsSUFBWSxDQUFDLE9BQU8sQ0FBQzt3QkFDcEIsV0FBVyxFQUFFLEtBQUs7cUJBQ25CLENBQUMsQ0FBQztpQkFDSjtnQkFFQSxJQUFZLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUN2RSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHO2dCQUNWLEVBQUUsQ0FBQyxTQUFTLENBQUM7b0JBQ1gsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLFVBQVUsRUFBRSxLQUFLO2lCQUNsQixDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVPLGdEQUFxQixHQUE3QixVQUE4QixVQUFrQjtRQUM5QyxPQUFPO1lBQ0wsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQy9CLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUM5QixHQUFHLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDN0IsQ0FBQztJQUNKLENBQUM7SUFFTSxpQ0FBTSxHQUFiLFVBQWMsQ0FBQztRQUNiLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU0saUNBQU0sR0FBYjtRQUNFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztRQUVwQyxFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDdkIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFDLENBQUM7UUFFSCxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFDdEIsSUFBSTtZQUNGLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2pDLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1NBQy9CO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDNUM7SUFFSCxDQUFDO0lBNkJILHVCQUFDO0FBQUQsQ0FBQyxBQTdlRCxJQTZlQztBQUVELElBQUksQ0FBQyxJQUFJLGdCQUFnQixFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCc7XG5pbXBvcnQgeyBlcG9jaCB9IGZyb20gJy4uLy4uL3V0aWxzL3V0aWwnO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyBGMiBmcm9tICdAYW50di93eC1mMic7XG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpO1xubGV0IGNoYXJ0ID0gbnVsbDtcblxuZnVuY3Rpb24gc2V0V2VpZ2h0TGluZUFuZFBvaW50cygpOiB2b2lkIHtcbiAgY2hhcnQubGluZSgpLnBvc2l0aW9uKFsnZGF0ZScsICd3ZWlnaHQnXSk7XG4gIGNoYXJ0LnBvaW50KClcbiAgICAucG9zaXRpb24oWydkYXRlJywgJ3dlaWdodCddKVxuICAgIC5zdHlsZSh7IGZpbGw6ICcjZmZmZmZmJywgcjogMy4yLCBsaW5lV2lkdGg6IDIsIHN0cm9rZTogJyNmMzQ2NWEnIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRUb29sdGlwcygpOiB2b2lkIHtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgYWx3YXlzU2hvdzogdHJ1ZSxcbiAgICBzaG93Q3Jvc3NoYWlyczogdHJ1ZSxcbiAgICBzaG93SXRlbU1hcmtlcjogZmFsc2UsXG4gICAgc2hvd1RpdGxlOiB0cnVlLFxuICAgIG9mZnNldFk6IDUwLFxuICAgIGJhY2tncm91bmQ6IHsgZmlsbDogJyM0ODU0NjUnLCBwYWRkaW5nOiBbNywgN10gfSxcbiAgICBuYW1lU3R5bGU6IHsgZmlsbDogJyNmZmZmZmYnIH0sXG4gICAgdmFsdWVTdHlsZTogeyBmaWxsOiAnI2ZmZmZmZicgfSxcbiAgICB0aXRsZVN0eWxlOiB7IGZpbGw6ICcjZTJlMmUyJyB9LFxuICAgIG9uU2hvdzogZnVuY3Rpb24gb25TaG93KGV2KSB7XG4gICAgICB2YXIgaXRlbXMgPSBldi5pdGVtcztcbiAgICAgIGl0ZW1zWzBdLnRpdGxlID0gaXRlbXNbMF0udGl0bGUudG9TdHJpbmcoKVxuICAgICAgaXRlbXNbMF0ubmFtZSA9IFwiXCI7XG4gICAgICBpdGVtc1swXS52YWx1ZSA9IGl0ZW1zWzBdLnZhbHVlLnRvU3RyaW5nKCkgKyBcIuWFrOaWpFwiO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFRhcmdldExpbmUodGFyZ2V0V2VpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgY2hhcnQuZ3VpZGUoKS5saW5lKHtcbiAgICBzdGFydDogWydtaW4nLCB0YXJnZXRXZWlnaHRdLFxuICAgIGVuZDogWydtYXgnLCB0YXJnZXRXZWlnaHRdLFxuICAgIHN0eWxlOiB7IHN0cm9rZTogJyM0Y2FmNTAnLCBsaW5lV2lkdGg6IDAuNywgbGluZUNhcDogJ3JvdW5kJyB9XG4gIH0pO1xuXG4gIGNoYXJ0Lmd1aWRlKCkudGV4dCh7XG4gICAgcG9zaXRpb246IFsnbWF4JywgdGFyZ2V0V2VpZ2h0XSxcbiAgICBjb250ZW50OiAn55uu5qCHJyxcbiAgICBzdHlsZTogeyB0ZXh0QWxpZ246ICdzdGFydCcsIHRleHRCYXNlbGluZTogJ3RvcCcsIGZpbGw6ICcjNGNhZjUwJyB9LFxuICAgIG9mZnNldFg6IDEwXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRJbml0TGluZShpbml0V2VpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgY2hhcnQuZ3VpZGUoKS5saW5lKHtcbiAgICBzdGFydDogWydtaW4nLCBpbml0V2VpZ2h0XSxcbiAgICBlbmQ6IFsnbWF4JywgaW5pdFdlaWdodF0sXG4gICAgc3R5bGU6IHsgc3Ryb2tlOiAnI2ZmODIyZCcsIGxpbmVXaWR0aDogMC43LCBsaW5lQ2FwOiAncm91bmQnIH1cbiAgfSk7XG5cbiAgY2hhcnQuZ3VpZGUoKS50ZXh0KHtcbiAgICBwb3NpdGlvbjogWydtYXgnLCBpbml0V2VpZ2h0XSxcbiAgICBjb250ZW50OiAn5Yid5aeLJyxcbiAgICBzdHlsZTogeyB0ZXh0QWxpZ246ICdzdGFydCcsIHRleHRCYXNlbGluZTogJ2JvdHRvbScsIGZpbGw6ICcjZmY4MjJkJyB9LFxuICAgIG9mZnNldFg6IDEwXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRSZWN0TGVnZW5kcygpOiB2b2lkIHtcbiAgY2hhcnQubGVnZW5kKHtcbiAgICBwb3NpdGlvbjogJ3RvcCcsXG4gICAgYWxpZ246ICdjZW50ZXInLFxuICAgIGN1c3RvbTogdHJ1ZSxcbiAgICBpdGVtczogW1xuICAgICAgeyBuYW1lOiAn5L2T6YeN6L+H6YeNJywgdmFsdWU6ICcnLCBtYXJrZXI6IHsgc3ltYm9sOiAnY2lyY2xlJywgcmFkaXVzOiA1LCBmaWxsOiAnI2ZmNWM0NycgfSB9LFxuICAgICAgeyBuYW1lOiAn5L2T6YeN6L+H6L27JywgdmFsdWU6ICcnLCBtYXJrZXI6IHsgc3ltYm9sOiAnY2lyY2xlJywgcmFkaXVzOiA1LCBmaWxsOiAnI2ZjZGE3NicgfSB9XG4gICAgXSxcbiAgICBuYW1lU3R5bGU6IHsgZmlsbDogJyM4ODg4ODgnIH1cbiAgfSk7XG59XG5cbi8vIHNldCBwaW5rIHJlY3RcbmZ1bmN0aW9uIHNldFVwcGVyQm91bmRSZWN0KHN0YXJ0WUNvb3JkOiBudW1iZXIsIGVuZFlDb29yZDogbnVtYmVyKTogdm9pZCB7XG4gIGNoYXJ0Lmd1aWRlKCkucmVjdCh7XG4gICAgc3RhcnQ6IFsnbWluJywgc3RhcnRZQ29vcmRdLFxuICAgIGVuZDogWydtYXgnLCBlbmRZQ29vcmRdLFxuICAgIHN0eWxlOiB7IGZpbGxPcGFjaXR5OiAwLjQsIGZpbGw6ICcjZmY1YzQ3JywgbGluZVdpZHRoOiAwLjUsIHN0cm9rZTogJyNmZjVjNDcnIH1cbiAgfSk7XG59XG5cbi8vIHNldCB5ZWxsb3cgcmVjdFxuZnVuY3Rpb24gc2V0TG93ZXJCb3VuZFJlY3Qoc3RhcnRZQ29vcmQ6IG51bWJlciwgZW5kWUNvb3JkOiBudW1iZXIpOiB2b2lkIHtcbiAgY2hhcnQuZ3VpZGUoKS5yZWN0KHtcbiAgICBzdGFydDogWydtaW4nLCBzdGFydFlDb29yZF0sXG4gICAgZW5kOiBbJ21heCcsIGVuZFlDb29yZF0sXG4gICAgc3R5bGU6IHsgZmlsbE9wYWNpdHk6IDAuNCwgZmlsbDogJyNmY2RhNzYnLCBsaW5lV2lkdGg6IDAuNSwgc3Ryb2tlOiAnI2ZjZGE3NicgfVxuICB9KTtcbn1cblxudHlwZSBtaW5NYXggPSB7IG1pbldlaWdodDogbnVtYmVyLCBtYXhXZWlnaHQ6IG51bWJlciB9O1xuXG4vLyBDYWxjdWxhdGUgbWF4LXkgYW5kIG1pbi15IHZhbHVlcywgYW5kIGFjY291bnQgZm9yIHRhcmdldFdlaWdodFxuZnVuY3Rpb24gY29tcHV0ZU1pbk1heFdlaWdodFdpdGhUYXJnZXQoaW5wdXRBcnI6IGFueVtdLCB0YXJnZXRXZWlnaHQ6IG51bWJlcik6IG1pbk1heCB7XG4gIGxldCBtYXhXZWlnaHQgPSAtMTtcbiAgbGV0IG1pbldlaWdodCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBpbnB1dEFyci5sZW5ndGg7IGluZGV4KyspIHtcblxuICAgIGlmIChpbnB1dEFycltpbmRleF0ud2VpZ2h0ID4gbWF4V2VpZ2h0IHx8IHRhcmdldFdlaWdodCA+IG1heFdlaWdodCkge1xuICAgICAgaWYgKGlucHV0QXJyW2luZGV4XS53ZWlnaHQgPiB0YXJnZXRXZWlnaHQpIHtcbiAgICAgICAgbWF4V2VpZ2h0ID0gaW5wdXRBcnJbaW5kZXhdLndlaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heFdlaWdodCA9IHRhcmdldFdlaWdodDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5wdXRBcnJbaW5kZXhdLndlaWdodCA8IG1pbldlaWdodCB8fCB0YXJnZXRXZWlnaHQgPCBtaW5XZWlnaHQpIHtcbiAgICAgIGlmIChpbnB1dEFycltpbmRleF0ud2VpZ2h0IDwgdGFyZ2V0V2VpZ2h0KSB7XG4gICAgICAgIG1pbldlaWdodCA9IGlucHV0QXJyW2luZGV4XS53ZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtaW5XZWlnaHQgPSB0YXJnZXRXZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7IG1pbldlaWdodCwgbWF4V2VpZ2h0IH07XG59XG5cbi8vIENhbGN1bGF0ZSBtYXgteSBhbmQgbWluLXkgdmFsdWVzLCBubyBuZWVkIHRvIGFjY291bnQgZm9yIHRhcmdldFdlaWdodFxuZnVuY3Rpb24gY29tcHV0ZU1pbk1heFdlaWdodFdpdGhvdXRUYXJnZXQoaW5wdXRBcnI6IGFueVtdKTogbWluTWF4IHtcbiAgbGV0IG1heFdlaWdodCA9IC0xO1xuICBsZXQgbWluV2VpZ2h0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGlucHV0QXJyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGlmIChpbnB1dEFycltpbmRleF0ud2VpZ2h0ID4gbWF4V2VpZ2h0KSB7XG4gICAgICBtYXhXZWlnaHQgPSBpbnB1dEFycltpbmRleF0ud2VpZ2h0O1xuICAgIH1cblxuICAgIGlmIChpbnB1dEFycltpbmRleF0ud2VpZ2h0IDwgbWluV2VpZ2h0KSB7XG4gICAgICBtaW5XZWlnaHQgPSBpbnB1dEFycltpbmRleF0ud2VpZ2h0O1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBtaW5XZWlnaHQsIG1heFdlaWdodCB9O1xufVxuXG4vLyBjbGVhcnMgYW5kIHJlbG9hZHMgdGhlIGNoYXJ0IHdpdGggZGF0YSBmcm9tIGlucHV0QXJyIGZvciBjdXJyV2VlayAod2Vla1ZpZXcpIFxuZnVuY3Rpb24gcmVuZGVyQ2hhcnRXZWVrVmlldyhpbnB1dEFycjogYW55W10sIGN1cnJXZWVrOiBudW1iZXIsIGluaXRXZWlnaHQ6IG51bWJlciwgdGFyZ2V0V2VpZ2h0OiBudW1iZXIsIGlzUHJlZ25hbnRMYWR5OiBib29sZWFuLCB1cHBlckJvdW5kOiBudW1iZXIsIGxvd2VyQm91bmQ6IG51bWJlcik6IHZvaWQge1xuICBsZXQgbWF4V2VpZ2h0ID0gLTE7XG4gIGxldCBtaW5XZWlnaHQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICAvLyB1cGRhdGUgY2hhcnQgZGF0YSBhbmQgcmVsZXZhbnQgbGluZXMgYW5kIGNvbXBvbmVudHNcbiAgY2hhcnQuY2xlYXIoKTtcbiAgY2hhcnQuc291cmNlKGlucHV0QXJyKTtcblxuICBsZXQgd2Vla0FyciA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgIGxldCB0ZW1wRGF5ID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KGkpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xuICAgIHdlZWtBcnIucHVzaCh0ZW1wRGF5KTtcbiAgfVxuXG4gIGNoYXJ0LnNjYWxlKCdkYXRlJywge1xuICAgIHR5cGU6ICdjYXQnLFxuICAgIHZhbHVlczogd2Vla0FycixcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uIChkYXRlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgbGV0IGRhdGVUb2tlbkFyciA9IGRhdGUuc3BsaXQoXCItXCIpO1xuICAgICAgcmV0dXJuIGRhdGVUb2tlbkFyclsyXTtcbiAgICB9XG4gIH0pO1xuXG4gIHNldFdlaWdodExpbmVBbmRQb2ludHMoKTtcbiAgc2V0VG9vbHRpcHMoKTtcblxuICAvLyB0YXJnZXQgaGFzIGJlZW4gc2V0XG4gIGlmICh0YXJnZXRXZWlnaHQgIT0gMCAmJiAhaXNQcmVnbmFudExhZHkpIHtcbiAgICBzZXRUYXJnZXRMaW5lKHRhcmdldFdlaWdodCk7XG5cbiAgICBsZXQgdGVtcDogbWluTWF4ID0gY29tcHV0ZU1pbk1heFdlaWdodFdpdGhUYXJnZXQoaW5wdXRBcnIsIHRhcmdldFdlaWdodCk7XG4gICAgbWluV2VpZ2h0ID0gdGVtcC5taW5XZWlnaHQ7XG4gICAgbWF4V2VpZ2h0ID0gdGVtcC5tYXhXZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHRlbXA6IG1pbk1heCA9IGNvbXB1dGVNaW5NYXhXZWlnaHRXaXRob3V0VGFyZ2V0KGlucHV0QXJyKTtcbiAgICBtaW5XZWlnaHQgPSB0ZW1wLm1pbldlaWdodDtcbiAgICBtYXhXZWlnaHQgPSB0ZW1wLm1heFdlaWdodDtcbiAgfVxuXG4gIGlmIChpbml0V2VpZ2h0ID49IG1pbldlaWdodCAtIDMgJiYgaW5pdFdlaWdodCA8PSBtYXhXZWlnaHQgKyAzICYmICFpc1ByZWduYW50TGFkeSkge1xuICAgIHNldEluaXRMaW5lKGluaXRXZWlnaHQpO1xuICB9XG5cbiAgbGV0IHNjYWxlTWluOiBudW1iZXIgPSBtaW5XZWlnaHQgLSAzIDwgMCA/IDAgOiBtaW5XZWlnaHQgLSAzO1xuICBsZXQgc2NhbGVNYXg6IG51bWJlciA9IG1heFdlaWdodCArIDMgPCAzID8gMyA6IG1heFdlaWdodCArIDM7XG5cbiAgaWYgKGlzUHJlZ25hbnRMYWR5KSB7XG4gICAgLy8gcGluayByZWN0XG4gICAgaWYgKHVwcGVyQm91bmQgPCBzY2FsZU1heCAmJiB1cHBlckJvdW5kID4gc2NhbGVNaW4pIHtcbiAgICAgIHNldFVwcGVyQm91bmRSZWN0KHVwcGVyQm91bmQsIHNjYWxlTWF4KTtcbiAgICB9IGVsc2UgaWYgKHVwcGVyQm91bmQgPCBzY2FsZU1heCAmJiB1cHBlckJvdW5kIDw9IHNjYWxlTWluKSB7XG4gICAgICBzZXRVcHBlckJvdW5kUmVjdChzY2FsZU1pbiwgc2NhbGVNYXgpOyBcbiAgICB9XG5cbiAgICAvLyB5ZWxsb3cgcmVjdFxuICAgIGlmIChsb3dlckJvdW5kID4gc2NhbGVNaW4gJiYgbG93ZXJCb3VuZCA8IHNjYWxlTWF4KSB7XG4gICAgICBzZXRMb3dlckJvdW5kUmVjdChzY2FsZU1pbiwgbG93ZXJCb3VuZCk7XG4gICAgfSBlbHNlIGlmIChsb3dlckJvdW5kID4gc2NhbGVNaW4gJiYgbG93ZXJCb3VuZCA+PSBzY2FsZU1heCkge1xuICAgICAgc2V0TG93ZXJCb3VuZFJlY3Qoc2NhbGVNaW4sIHNjYWxlTWF4KTtcbiAgICB9XG4gICAgc2V0UmVjdExlZ2VuZHMoKTtcbiAgfVxuXG4gIGNoYXJ0LnNjYWxlKCd3ZWlnaHQnLCB7XG4gICAgbWluOiBzY2FsZU1pbixcbiAgICBtYXg6IHNjYWxlTWF4LFxuICB9KTtcblxuICBjaGFydC5yZW5kZXIoKTtcbn1cblxuLy8gY2xlYXJzIGFuZCByZWxvYWRzIHRoZSBjaGFydCB3aXRoIGRhdGEgZnJvbSBpbnB1dEFyciBmb3IgdGhlIGN1cnJNb250aCAobW9udGhWaWV3KSBcbmZ1bmN0aW9uIHJlbmRlckNoYXJ0TW9udGhWaWV3KGlucHV0QXJyOiBhbnlbXSwgY3Vyck1vbnRoOiBudW1iZXIsIGluaXRXZWlnaHQ6IG51bWJlciwgdGFyZ2V0V2VpZ2h0OiBudW1iZXIsIGlzUHJlZ25hbnRMYWR5OiBib29sZWFuLCB1cHBlckJvdW5kOiBudW1iZXIsIGxvd2VyQm91bmQ6IG51bWJlcik6IHZvaWQge1xuICBsZXQgbWF4V2VpZ2h0ID0gLTE7XG4gIGxldCBtaW5XZWlnaHQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICAvLyB1cGRhdGUgY2hhcnQgZGF0YSBhbmQgcmVsZXZhbnQgbGluZXMgYW5kIGNvbXBvbmVudHNcbiAgY2hhcnQuY2xlYXIoKTtcbiAgY2hhcnQuc291cmNlKGlucHV0QXJyKTtcblxuICBsZXQgbW9udGhBcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbW9tZW50KCkubW9udGgoY3Vyck1vbnRoKS5kYXlzSW5Nb250aCgpOyBpKyspIHtcbiAgICBsZXQgdGVtcERheSA9IG1vbWVudCgpLm1vbnRoKGN1cnJNb250aCkuZGF0ZShpKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcbiAgICBtb250aEFyci5wdXNoKHRlbXBEYXkpO1xuICB9XG5cbiAgbGV0IHRpY2tTdGFydDogc3RyaW5nID0gbW9udGhBcnJbMF07XG4gIGxldCB0aWNrRW5kOiBzdHJpbmcgPSBtb250aEFyclttb250aEFyci5sZW5ndGggLSAxXTtcbiAgY2hhcnQuc2NhbGUoJ2RhdGUnLCB7XG4gICAgdHlwZTogJ2NhdCcsXG4gICAgdmFsdWVzOiBtb250aEFycixcbiAgICB0aWNrczogW3RpY2tTdGFydCwgdGlja0VuZF0sXG4gICAgZm9ybWF0dGVyOiBmdW5jdGlvbiAoZGF0ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgIGxldCBkYXRlVG9rZW5BcnIgPSBkYXRlLnNwbGl0KFwiLVwiKTtcbiAgICAgIHJldHVybiBkYXRlVG9rZW5BcnJbMl07XG4gICAgfVxuICB9KTtcblxuICBzZXRXZWlnaHRMaW5lQW5kUG9pbnRzKCk7XG4gIHNldFRvb2x0aXBzKCk7XG5cbiAgLy8gdGFyZ2V0IGhhcyBiZWVuIHNldFxuICBpZiAodGFyZ2V0V2VpZ2h0ICE9IDAgJiYgIWlzUHJlZ25hbnRMYWR5KSB7XG4gICAgc2V0VGFyZ2V0TGluZSh0YXJnZXRXZWlnaHQpO1xuXG4gICAgbGV0IHRlbXA6IG1pbk1heCA9IGNvbXB1dGVNaW5NYXhXZWlnaHRXaXRoVGFyZ2V0KGlucHV0QXJyLCB0YXJnZXRXZWlnaHQpO1xuICAgIG1pbldlaWdodCA9IHRlbXAubWluV2VpZ2h0O1xuICAgIG1heFdlaWdodCA9IHRlbXAubWF4V2VpZ2h0O1xuICB9IGVsc2Uge1xuICAgIGxldCB0ZW1wOiBtaW5NYXggPSBjb21wdXRlTWluTWF4V2VpZ2h0V2l0aG91dFRhcmdldChpbnB1dEFycik7XG4gICAgbWluV2VpZ2h0ID0gdGVtcC5taW5XZWlnaHQ7XG4gICAgbWF4V2VpZ2h0ID0gdGVtcC5tYXhXZWlnaHQ7XG4gIH1cblxuICBpZiAoaW5pdFdlaWdodCA+PSBtaW5XZWlnaHQgLSAzICYmIGluaXRXZWlnaHQgPD0gbWF4V2VpZ2h0ICsgMyAmJiAhaXNQcmVnbmFudExhZHkpIHtcbiAgICBzZXRJbml0TGluZShpbml0V2VpZ2h0KTtcbiAgfVxuXG4gIGxldCBzY2FsZU1pbjogbnVtYmVyID0gbWluV2VpZ2h0IC0gMyA8IDAgPyAwIDogbWluV2VpZ2h0IC0gMztcbiAgbGV0IHNjYWxlTWF4OiBudW1iZXIgPSBtYXhXZWlnaHQgKyAzIDwgMyA/IDMgOiBtYXhXZWlnaHQgKyAzO1xuXG4gIGlmIChpc1ByZWduYW50TGFkeSkge1xuICAgIC8vIHBpbmsgcmVjdFxuICAgIGlmICh1cHBlckJvdW5kIDwgc2NhbGVNYXggJiYgdXBwZXJCb3VuZCA+IHNjYWxlTWluKSB7XG4gICAgICBzZXRVcHBlckJvdW5kUmVjdCh1cHBlckJvdW5kLCBzY2FsZU1heCk7XG4gICAgfSBlbHNlIGlmICh1cHBlckJvdW5kIDwgc2NhbGVNYXggJiYgdXBwZXJCb3VuZCA8IHNjYWxlTWluKSB7XG4gICAgICBzZXRVcHBlckJvdW5kUmVjdChzY2FsZU1pbiwgc2NhbGVNYXgpO1xuICAgIH1cblxuICAgIC8vIHllbGxvdyByZWN0XG4gICAgaWYgKGxvd2VyQm91bmQgPiBzY2FsZU1pbiAmJiBsb3dlckJvdW5kIDwgc2NhbGVNYXgpIHtcbiAgICAgIHNldExvd2VyQm91bmRSZWN0KHNjYWxlTWluLCBsb3dlckJvdW5kKTtcbiAgICB9IGVsc2UgaWYgKGxvd2VyQm91bmQgPiBzY2FsZU1pbiAmJiBsb3dlckJvdW5kID4gc2NhbGVNYXgpIHtcbiAgICAgIHNldExvd2VyQm91bmRSZWN0KHNjYWxlTWluLCBzY2FsZU1heCk7XG4gICAgfVxuICAgIHNldFJlY3RMZWdlbmRzKCk7XG4gIH1cblxuICBjaGFydC5zY2FsZSgnd2VpZ2h0Jywge1xuICAgIG1pbjogc2NhbGVNaW4sXG4gICAgbWF4OiBzY2FsZU1heCxcbiAgfSk7XG5cbiAgY2hhcnQucmVuZGVyKCk7XG59XG5cbi8vIGNhbGxlZCB3aGVuZXZlciB0YWJUd28gaXMgZGlzcGxheWVkLCBsb2FkcyBkZWZhdWx0IGRhdGEgKHdlaWdodCByZWNvcmRzIGZyb20gdGhpcyB3ZWVrKVxuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpOiBhbnkge1xuICBGMi5HbG9iYWwuc2V0VGhlbWUoe1xuICAgIGNvbG9yczogWycjRjM0NjVBJywgJyNENjZCQ0EnLCAnIzg1NDNFMCcsICcjOEU3N0VEJywgJyMzNDM2QzcnLCAnIzczN0VFNicsICcjMjIzMjczJywgJyM3RUEyRTYnXSxcbiAgICBwaXhlbFJhdGlvOiAyLFxuICAgIGd1aWRlOiB7XG4gICAgICBsaW5lOiB7IHN0cm9rZTogJyNGMzQ2NUEnLCBsaW5lV2lkdGg6IDIgfVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoeyBlbDogY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBhbmltYXRlOiB0cnVlLCBwYWRkaW5nOiBbNTAsIDUwLCA1MCwgNTBdIH0pO1xuXG4gIC8vIHNldCBkZWZhdWx0IHdlZWt2aWV3IGludGVydmFsXG4gIGxldCBjdXJyV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlaygpO1xuICBsZXQgd2Vla0FyciA9IFtdO1xuXG4gIGZvcihsZXQgaT0wOyBpPDc7IGkrKykge1xuICAgIGxldCB0ZW1wRGF5ID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KGkpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xuICAgIHdlZWtBcnIucHVzaCh0ZW1wRGF5KTtcbiAgfVxuXG4gIGxldCBlbXB0eUlucHV0QXJyID0gW3tcbiAgICBcImRhdGVcIjogXCIyMDE5LTA2LTAxXCIsXG4gICAgXCJ3ZWlnaHRcIjogNTBcbiAgfV07XG5cbiAgLy8gd2l0aG91dCB0aGlzIHRoZSBjaGFydCB3b24ndCByZW5kZXIgcHJvcGVybHlcbiAgY2hhcnQuc291cmNlKGVtcHR5SW5wdXRBcnIsIHtcbiAgICBkYXRlOiB7XG4gICAgICB0eXBlOiAnY2F0JyxcbiAgICAgIHZhbHVlczogd2Vla0FycixcbiAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRhdGVUb2tlbkFyciA9IGRhdGUuc3BsaXQoXCItXCIpO1xuICAgICAgICByZXR1cm4gZGF0ZVRva2VuQXJyWzJdO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgc2V0V2VpZ2h0TGluZUFuZFBvaW50cygpO1xuICBjaGFydC5yZW5kZXIoKTtcblxuICAvLyBzZXQgd2Vla3ZpZXcgaW50ZXJ2YWwgYW5kIHdlZWsgbnVteGJlclxuICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS5ob3VyKDApLm1pbnV0ZSgwKS5zZWNvbmQoMCkudW5peCgpO1xuICBsZXQgbGFzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLmhvdXIoMCkubWludXRlKDApLnNlY29uZCgwKS51bml4KCk7XG4gIGNvbnNvbGUubG9nKFwiRmlyc3QgZGF5IG9mIHdlZWsgdW5peCBcIiArIGZpcnN0RGF5T2ZXZWVrICsgXCIgbGFzdCBkYXkgb2Ygd2VlayB1bml4IFwiICsgbGFzdERheU9mV2Vlayk7XG5cbiAgLy8gZ2V0Q2hhcnRXZWVrVmlld0RhdGEoY3VycldlZWssIGZpcnN0RGF5T2ZXZWVrLCBsYXN0RGF5T2ZXZWVrKTtcbiAgd2VpZ2h0UmVjb3JkUGFnZS5nZXRXZWVrVmlld0RhdGEoY3VycldlZWssIGZpcnN0RGF5T2ZXZWVrKTtcblxuICByZXR1cm4gY2hhcnQ7XG59XG5cbmNsYXNzIHdlaWdodFJlY29yZFBhZ2UgeyBcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgaXNQcmVnbmFudExhZHk6IHRydWUsXG4gICAgZGF0ZU9mRGVsaXZlcnk6IHsgZGF0ZTogdW5kZWZpbmVkLCB5ZWFyOiAnJywgbW9udGg6ICcnLCBkYXk6ICcnIH0sXG4gICAgbnVtV2Vla3NQcmVnOiAwLFxuICAgIGRhdGVSZWNvcmQ6IHtcbiAgICAgIGRhdGU6IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpLFxuICAgICAgeWVhcjogbW9tZW50KCkuZm9ybWF0KCdZWVlZJyksXG4gICAgICBtb250aDogbW9tZW50KCkuZm9ybWF0KCdNTScpLFxuICAgICAgZGF5OiBtb21lbnQoKS5mb3JtYXQoJ0REJyksXG4gICAgfSxcbiAgICB3ZWlnaHRSZWNvcmQ6ICc3MCcsXG4gICAgd2VpZ2h0czogW10sXG4gICAgZGF0ZXNXaXRoUmVjb3JkczogdW5kZWZpbmVkLFxuICAgIGRhdGVPZkNvbmNlcHRpb246IHsgZGF0ZTogJycsIHllYXI6ICcnLCBtb250aDogJycsIGRheTogJycgfSxcbiAgICBpbml0V2VpZ2h0OiAnOTkuMCcsXG4gICAgaW5pdERhdGU6IHsgZGF0ZTogJzE5NzAtMDEtMDEnLCB5ZWFyOiAnMTk3MCcsIG1vbnRoOiAnMDEnLCBkYXk6ICcwMScgfSxcbiAgICBsYXRlc3RXZWlnaHQ6ICc5OS4wJyxcbiAgICBsYXRlc3REYXRlOiB7IGRhdGU6ICcxOTcwLTAxLTAxJywgeWVhcjogJzE5NzAnLCBtb250aDogJzAxJywgZGF5OiAnMDEnIH0sXG4gICAgdGFyZ2V0V2VpZ2h0OiAnOTkuMCcsXG4gICAgdGFyZ2V0RGF0ZTogeyBkYXRlOiAnMTk3MC0wMS0wMScsIHllYXI6ICcxOTcwJywgbW9udGg6ICcwMScsIGRheTogJzAxJyB9LFxuICAgIGlzVGFyZ2V0U2V0OiBmYWxzZSxcbiAgICBwcmVnVXBwZXJXZWlnaHRMaW1pdDogMCxcbiAgICBwcmVnTG93ZXJXZWlnaHRMaW1pdDogMCxcbiAgICB3ZWVrbHlXZWlnaHRDaGFuZ2VMb3dlcjogMC4zLFxuICAgIHdlZWtseVdlaWdodENoYW5nZVVwcGVyOiAwLjUsXG4gICAgY3Vyck1heElkeDogNixcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIGNoYXJ0Vmlld0lkeDogJzAnLFxuICAgIGNoYXJ0VmlldzogWyflkagnLCAn5pyIJ10sXG4gICAgY2hhcnRXZWVrVmlld1N0YXJ0OiB7IGRhdGU6IG1vbWVudCgpLCB5ZWFyOiAnMjAxOScsIG1vbnRoOiAnMDEnLCBkYXk6ICcwMScgfSxcbiAgICBjaGFydFdlZWtWaWV3RW5kOiB7IGRhdGU6IG1vbWVudCgpLCB5ZWFyOiAnMjAxOScsIG1vbnRoOiAnMDEnLCBkYXk6ICcwNycgfSxcbiAgICBpc1ByZXZXZWVrQWxsb3dlZDogdHJ1ZSxcbiAgICBpc05leHRXZWVrQWxsb3dlZDogZmFsc2UsXG4gICAgY2hhcnRNb250aFZpZXdTdGFydDogeyBkYXRlOiBtb21lbnQoKSwgeWVhcjogJzIwMTknLCBtb250aDogJzAxJywgZGF5OiAnMDEnIH0sXG4gICAgY2hhcnRNb250aFZpZXdFbmQ6IHsgZGF0ZTogbW9tZW50KCksIHllYXI6ICcyMDE5JywgbW9udGg6ICcwMScsIGRheTogJzMxJyB9LFxuICAgIGlzUHJldk1vbnRoQWxsb3dlZDogdHJ1ZSxcbiAgICBpc05leHRNb250aEFsbG93ZWQ6IGZhbHNlLFxuICAgIGlzVGFiT25lU2VsZWN0ZWQ6IHRydWUsXG4gICAgdGFiT25lU3R5bGVDbGFzczogXCJ3ZXVpLW5hdmJhcl9faXRlbSB3ZXVpLWJhcl9faXRlbV9vblwiLFxuICAgIHRhYlR3b1N0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW1cIixcbiAgICBzaG93Q29udGVudDpmYWxzZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIGluaXRXZWlnaHQ6IG51bWJlcjtcbiAgcHVibGljIHN0YXRpYyB0YXJnZXRXZWlnaHQ6IG51bWJlcjtcbiAgcHVibGljIHN0YXRpYyBpc1ByZWduYW50TGFkeTogYm9vbGVhbjtcbiAgcHVibGljIHN0YXRpYyBwcmVnVXBwZXJCb3VuZDogbnVtYmVyO1xuICBwdWJsaWMgc3RhdGljIHByZWdMb3dlckJvdW5kOiBudW1iZXI7XG4gIHB1YmxpYyBzdGF0aWMgdGltZXN0YW1wV2VpZ2h0TWFwOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0V2Vla1ZpZXdEYXRhKGN1cnJXZWVrOiBudW1iZXIsIHN0YXJ0VGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICB2YXIgdGVtcFRpbWVzdGFtcDogbnVtYmVyO1xuICAgIHZhciBpbnB1dEFyciA9IFtdO1xuXG4gICAgZm9yIChsZXQgaT0wOyBpIDwgNzsgaSsrKSB7XG4gICAgICB0ZW1wVGltZXN0YW1wID0gc3RhcnRUaW1lU3RhbXAgKyAoaSAqIDM2MDAgKiAyNCk7XG4gICAgICBsZXQgdGVtcERhdGU6IHN0cmluZyA9IG1vbWVudC51bml4KHRlbXBUaW1lc3RhbXApLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xuXG4gICAgICBsZXQgdGVtcFdlaWdodCA9IHdlaWdodFJlY29yZFBhZ2UudGltZXN0YW1wV2VpZ2h0TWFwLmdldCh0ZW1wVGltZXN0YW1wKTtcbiAgICAgIGlmICh0ZW1wV2VpZ2h0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgdGVtcCA9IHtcbiAgICAgICAgICBcImRhdGVcIjogdGVtcERhdGUsXG4gICAgICAgICAgXCJ3ZWlnaHRcIjogdGVtcFdlaWdodFxuICAgICAgICB9XG4gICAgICAgIGlucHV0QXJyLnB1c2godGVtcCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlbmRlckNoYXJ0V2Vla1ZpZXcoaW5wdXRBcnIsIGN1cnJXZWVrLCB3ZWlnaHRSZWNvcmRQYWdlLmluaXRXZWlnaHQsIHdlaWdodFJlY29yZFBhZ2UudGFyZ2V0V2VpZ2h0LCB3ZWlnaHRSZWNvcmRQYWdlLmlzUHJlZ25hbnRMYWR5LCB3ZWlnaHRSZWNvcmRQYWdlLnByZWdVcHBlckJvdW5kLCB3ZWlnaHRSZWNvcmRQYWdlLnByZWdMb3dlckJvdW5kKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TW9udGhWaWV3RGF0YShjdXJyTW9udGg6IG51bWJlciwgc3RhcnRUaW1lU3RhbXA6IG51bWJlcikge1xuICAgIHZhciB0ZW1wVGltZXN0YW1wOiBudW1iZXI7XG4gICAgdmFyIGlucHV0QXJyID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vbWVudCgpLm1vbnRoKGN1cnJNb250aCkuZGF5c0luTW9udGgoKTsgaSsrKSB7XG4gICAgICB0ZW1wVGltZXN0YW1wID0gc3RhcnRUaW1lU3RhbXAgKyAoaSAqIDM2MDAgKiAyNCk7XG4gICAgICBsZXQgdGVtcERhdGU6IHN0cmluZyA9IG1vbWVudC51bml4KHRlbXBUaW1lc3RhbXApLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xuXG4gICAgICBsZXQgdGVtcFdlaWdodCA9IHdlaWdodFJlY29yZFBhZ2UudGltZXN0YW1wV2VpZ2h0TWFwLmdldCh0ZW1wVGltZXN0YW1wKTtcbiAgICAgIGlmICh0ZW1wV2VpZ2h0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgdGVtcCA9IHtcbiAgICAgICAgICBcImRhdGVcIjogdGVtcERhdGUsXG4gICAgICAgICAgXCJ3ZWlnaHRcIjogdGVtcFdlaWdodFxuICAgICAgICB9XG4gICAgICAgIGlucHV0QXJyLnB1c2godGVtcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyQ2hhcnRNb250aFZpZXcoaW5wdXRBcnIsIGN1cnJNb250aCwgd2VpZ2h0UmVjb3JkUGFnZS5pbml0V2VpZ2h0LCB3ZWlnaHRSZWNvcmRQYWdlLnRhcmdldFdlaWdodCwgd2VpZ2h0UmVjb3JkUGFnZS5pc1ByZWduYW50TGFkeSwgd2VpZ2h0UmVjb3JkUGFnZS5wcmVnVXBwZXJCb3VuZCwgd2VpZ2h0UmVjb3JkUGFnZS5wcmVnTG93ZXJCb3VuZCk7XG4gIH1cblxuICBwdWJsaWMgb25OYXZiYXJTZWxlY3QxKCk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpc1RhYk9uZVNlbGVjdGVkOiB0cnVlLFxuICAgICAgdGFiT25lU3R5bGVDbGFzczogXCJ3ZXVpLW5hdmJhcl9faXRlbSB3ZXVpLWJhcl9faXRlbV9vblwiLFxuICAgICAgdGFiVHdvU3R5bGVDbGFzczogXCJ3ZXVpLW5hdmJhcl9faXRlbVwiXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25OYXZiYXJTZWxlY3QyKCk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpc1RhYk9uZVNlbGVjdGVkOiBmYWxzZSxcbiAgICAgIHRhYk9uZVN0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW1cIixcbiAgICAgIHRhYlR3b1N0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW0gd2V1aS1iYXJfX2l0ZW1fb25cIlxuICAgIH0pO1xuXG4gICAgdGhpcy5jb21wdXRlSW5pdENoYXJ0Vmlld0ludGVydmFsKCk7XG4gIH1cblxuICBwdWJsaWMgbmF2aWdhdGVUb1dlaWdodElucHV0UGFnZSgpOiB2b2lkIHtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIvcGFnZXMvd2VpZ2h0UmVjb3JkL3dlaWdodElucHV0XCJcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpZ2F0ZVRvVGFyZ2V0SW5wdXRQYWdlKCk6IHZvaWQge1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiBcIi9wYWdlcy93ZWlnaHRSZWNvcmQvdGFyZ2V0SW5wdXRcIlxuICAgIH0pO1xuICB9XG5cbiAgLy8gY2hlY2tzIGlmIHdlZWtJbnRlcnZhbCBzZWxlY3RlZCBpcyB0aGUgcHJlc2VudCB3ZWVrIG9yIGEgcGFzdCB3ZWVrIChmdXR1cmUgd2Vla3MgYXJlIG5vdCBhbGxvd2VkKVxuICBwdWJsaWMgY2hlY2tXZWVrSW50ZXJ2YWwobmV3V2Vla1N0YXJ0OiBtb21lbnQpOiBib29sZWFuIHtcbiAgICBsZXQgcHJlc2VudFdlZWs6IG1vbWVudCA9IG1vbWVudCgpO1xuICAgIGxldCBuZXdXZWVrOiBtb21lbnQgPSBuZXdXZWVrU3RhcnQ7XG5cbiAgICBpZiAobmV3V2Vlay5pc0FmdGVyKHByZXNlbnRXZWVrLCAnd2VlaycpKSB7XG4gICAgICB0aGlzLnNldFdlZWtWaWV3RmxhZ3ModHJ1ZSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBOb3QgYWxsb3dlZCB0byBjaGFuZ2UgaW50ZXJ2YWxcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmV3V2Vlay5pc1NhbWUocHJlc2VudFdlZWssICd3ZWVrJykpIHtcbiAgICAgICAgdGhpcy5zZXRXZWVrVmlld0ZsYWdzKHRydWUsIGZhbHNlKTtcblxuICAgICAgICAvLyBuZXdXZWVrIGlzIGJlZm9yZSBwcmVzZW50V2Vla1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRXZWVrVmlld0ZsYWdzKHRydWUsIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7ICAvLyBBbGxvd2VkIHRvIGNoYW5nZSBpbnRlcnZhbFxuICAgIH1cbiAgfVxuXG4gIC8vIGNoZWNrcyBpZiBtb250aEludGVydmFsIHNlbGVjdGVkIGlzIHRoZSBwcmVzZW50IG1vbnRoIG9yIGEgcGFzdCBtb250aCAoZnV0dXJlIG1vbnRocyBhcmUgbm90IGFsbG93ZWQpXG4gIHB1YmxpYyBjaGVja01vbnRoSW50ZXJ2YWwobmV3TW9udGhTdGFydDogbW9tZW50KTogYm9vbGVhbiB7XG4gICAgbGV0IHByZXNlbnRNb250aDogbW9tZW50ID0gbW9tZW50KCk7XG4gICAgbGV0IG5ld01vbnRoOiBtb21lbnQgPSBuZXdNb250aFN0YXJ0O1xuXG4gICAgaWYgKG5ld01vbnRoLmlzQWZ0ZXIocHJlc2VudE1vbnRoLCAnbW9udGgnKSkge1xuICAgICAgdGhpcy5zZXRNb250aFZpZXdGbGFncyh0cnVlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIE5vdCBhbGxvd2VkIHRvIGNoYW5nZSBpbnRlcnZhbFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChuZXdNb250aC5pc1NhbWUocHJlc2VudE1vbnRoLCAnbW9udGgnKSkge1xuICAgICAgICB0aGlzLnNldE1vbnRoVmlld0ZsYWdzKHRydWUsIGZhbHNlKTtcbiAgICAgICAgLy8gbmV3TW9udGggaXMgYmVmb3JlIHByZXNlbnRNb250aFxuICAgICAgfSBlbHNlIHsgXG4gICAgICAgIHRoaXMuc2V0TW9udGhWaWV3RmxhZ3ModHJ1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTsgIC8vIEFsbG93ZWQgdG8gY2hhbmdlIGludGVydmFsXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRXZWVrVmlld0ZsYWdzKHByZXZXZWVrRmxhZzogYm9vbGVhbiwgbmV4dFdlZWtGbGFnOiBib29sZWFuKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGlzUHJldldlZWtBbGxvd2VkOiBwcmV2V2Vla0ZsYWcsXG4gICAgICBpc05leHRXZWVrQWxsb3dlZDogbmV4dFdlZWtGbGFnXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNldE1vbnRoVmlld0ZsYWdzKHByZXZNb250aEZsYWc6IGJvb2xlYW4sIG5leHRNb250aEZsYWc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgaXNQcmV2TW9udGhBbGxvd2VkOiBwcmV2TW9udGhGbGFnLFxuICAgICAgaXNOZXh0TW9udGhBbGxvd2VkOiBuZXh0TW9udGhGbGFnXG4gICAgfSk7XG4gIH1cblxuICAvLyBzaGlmdCBpbnRlcnZhbCAxIHdlZWsgaW50byBwYXN0XG4gIHB1YmxpYyBwcmV2V2Vla0ludGVydmFsKCk6IHZvaWQge1xuICAgIGxldCBuZXdXZWVrU3RhcnQgPSB0aGlzLmRhdGEuY2hhcnRXZWVrVmlld1N0YXJ0LmRhdGUuc3VidHJhY3QoMSwgJ3cnKTtcbiAgICBsZXQgbmV3V2Vla0VuZCA9IHRoaXMuZGF0YS5jaGFydFdlZWtWaWV3RW5kLmRhdGUuc3VidHJhY3QoMSwgJ3cnKTtcblxuICAgIGlmKHRoaXMuY2hlY2tXZWVrSW50ZXJ2YWwobmV3V2Vla1N0YXJ0KSkge1xuICAgICAgdGhpcy5zZXRXZWVrVmlld0ludGVydmFsKG5ld1dlZWtTdGFydCwgbmV3V2Vla0VuZCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiVW5peDogXCIgKyBuZXdXZWVrU3RhcnQudW5peCgpICsgXCIgdGlsbCBcIiArIG5ld1dlZWtFbmQudW5peCgpKTtcbiAgICAgIGxldCB3ZWVrTnVtOiBudW1iZXIgPSBuZXdXZWVrU3RhcnQud2VlaygpO1xuICAgICAgd2VpZ2h0UmVjb3JkUGFnZS5nZXRXZWVrVmlld0RhdGEod2Vla051bSwgbmV3V2Vla1N0YXJ0LnVuaXgoKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gc2hpZnQgaW50ZXJ2YWwgMSBtb250aCBpbnRvIHBhc3RcbiAgcHVibGljIHByZXZNb250aEludGVydmFsKCk6IHZvaWQge1xuICAgIGxldCBuZXdNb250aFN0YXJ0ID0gdGhpcy5kYXRhLmNoYXJ0TW9udGhWaWV3U3RhcnQuZGF0ZS5zdWJ0cmFjdCgxLCAnTScpO1xuICAgIGxldCBuZXdNb250aEVuZCA9IHRoaXMuZGF0YS5jaGFydE1vbnRoVmlld0VuZC5kYXRlLnN1YnRyYWN0KDEsICdNJyk7XG5cbiAgICBpZiAodGhpcy5jaGVja01vbnRoSW50ZXJ2YWwobmV3TW9udGhTdGFydCkpIHtcbiAgICAgIHRoaXMuc2V0TW9udGhWaWV3SW50ZXJ2YWwobmV3TW9udGhTdGFydCwgbmV3TW9udGhFbmQpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcIlVuaXg6IFwiICsgbmV3TW9udGhTdGFydC51bml4KCkgKyBcIiB0aWxsIFwiICsgbmV3TW9udGhFbmQudW5peCgpKTtcbiAgICAgIGxldCBtb250aE51bTogbnVtYmVyID0gbmV3TW9udGhTdGFydC5tb250aCgpO1xuICAgICAgd2VpZ2h0UmVjb3JkUGFnZS5nZXRNb250aFZpZXdEYXRhKG1vbnRoTnVtLCBuZXdNb250aFN0YXJ0LnVuaXgoKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gc2hpZnQgaW50ZXJ2YWwgMSB3ZWVrIGludG8gZnV0dXJlXG4gIHB1YmxpYyBuZXh0V2Vla0ludGVydmFsKCk6IHZvaWQge1xuICAgIGxldCBuZXdXZWVrU3RhcnQgPSB0aGlzLmRhdGEuY2hhcnRXZWVrVmlld1N0YXJ0LmRhdGUuYWRkKDEsICd3Jyk7XG4gICAgbGV0IG5ld1dlZWtFbmQgPSB0aGlzLmRhdGEuY2hhcnRXZWVrVmlld0VuZC5kYXRlLmFkZCgxLCAndycpO1xuXG4gICAgaWYgKHRoaXMuY2hlY2tXZWVrSW50ZXJ2YWwobmV3V2Vla1N0YXJ0KSkge1xuICAgICAgdGhpcy5zZXRXZWVrVmlld0ludGVydmFsKG5ld1dlZWtTdGFydCwgbmV3V2Vla0VuZCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiVW5peDogXCIgKyBuZXdXZWVrU3RhcnQudW5peCgpICsgXCIgdGlsbCBcIiArIG5ld1dlZWtFbmQudW5peCgpKTtcbiAgICAgIGxldCB3ZWVrTnVtOiBudW1iZXIgPSBuZXdXZWVrU3RhcnQud2VlaygpO1xuICAgICAgd2VpZ2h0UmVjb3JkUGFnZS5nZXRXZWVrVmlld0RhdGEod2Vla051bSwgbmV3V2Vla1N0YXJ0LnVuaXgoKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gc2hpZnQgaW50ZXJ2YWwgMSBtb250aCBpbnRvIGZ1dHVyZVxuICBwdWJsaWMgbmV4dE1vbnRoSW50ZXJ2YWwoZSk6IHZvaWQge1xuICAgIGxldCBuZXdNb250aFN0YXJ0ID0gdGhpcy5kYXRhLmNoYXJ0TW9udGhWaWV3U3RhcnQuZGF0ZS5hZGQoMSwgJ00nKTtcbiAgICBsZXQgbmV3TW9udGhFbmQgPSB0aGlzLmRhdGEuY2hhcnRNb250aFZpZXdFbmQuZGF0ZS5hZGQoMSwgJ00nKTtcblxuICAgIGlmICh0aGlzLmNoZWNrTW9udGhJbnRlcnZhbChuZXdNb250aFN0YXJ0KSkge1xuICAgICAgdGhpcy5zZXRNb250aFZpZXdJbnRlcnZhbChuZXdNb250aFN0YXJ0LCBuZXdNb250aEVuZCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiVW5peDogXCIgKyBuZXdNb250aFN0YXJ0LnVuaXgoKSArIFwiIHRpbGwgXCIgKyBuZXdNb250aEVuZC51bml4KCkpO1xuICAgICAgbGV0IG1vbnRoTnVtOiBudW1iZXIgPSBuZXdNb250aFN0YXJ0Lm1vbnRoKCk7XG4gICAgICB3ZWlnaHRSZWNvcmRQYWdlLmdldE1vbnRoVmlld0RhdGEobW9udGhOdW0sIG5ld01vbnRoU3RhcnQudW5peCgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldFdlZWtWaWV3SW50ZXJ2YWwobmV3V2Vla1N0YXJ0OiBtb21lbnQsIG5ld1dlZWtFbmQ6IG1vbWVudCk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjaGFydFdlZWtWaWV3U3RhcnQ6IHtcbiAgICAgICAgZGF0ZTogbmV3V2Vla1N0YXJ0LFxuICAgICAgICB5ZWFyOiBuZXdXZWVrU3RhcnQuZm9ybWF0KFwiWVlZWVwiKSxcbiAgICAgICAgbW9udGg6IG5ld1dlZWtTdGFydC5mb3JtYXQoXCJNTVwiKSxcbiAgICAgICAgZGF5OiBuZXdXZWVrU3RhcnQuZm9ybWF0KFwiRERcIilcbiAgICAgIH0sXG4gICAgICBjaGFydFdlZWtWaWV3RW5kOiB7XG4gICAgICAgIGRhdGU6IG5ld1dlZWtFbmQsXG4gICAgICAgIHllYXI6IG5ld1dlZWtFbmQuZm9ybWF0KFwiWVlZWVwiKSxcbiAgICAgICAgbW9udGg6IG5ld1dlZWtFbmQuZm9ybWF0KFwiTU1cIiksXG4gICAgICAgIGRheTogbmV3V2Vla0VuZC5mb3JtYXQoXCJERFwiKVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRNb250aFZpZXdJbnRlcnZhbChuZXdNb250aFN0YXJ0OiBtb21lbnQsIG5ld01vbnRoRW5kOiBtb21lbnQpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY2hhcnRNb250aFZpZXdTdGFydDoge1xuICAgICAgICBkYXRlOiBuZXdNb250aFN0YXJ0LFxuICAgICAgICB5ZWFyOiBuZXdNb250aFN0YXJ0LmZvcm1hdChcIllZWVlcIiksXG4gICAgICAgIG1vbnRoOiBuZXdNb250aFN0YXJ0LmZvcm1hdChcIk1NXCIpLFxuICAgICAgICBkYXk6IG5ld01vbnRoU3RhcnQuZm9ybWF0KFwiRERcIilcbiAgICAgIH0sXG4gICAgICBjaGFydE1vbnRoVmlld0VuZDoge1xuICAgICAgICBkYXRlOiBuZXdNb250aEVuZCxcbiAgICAgICAgeWVhcjogbmV3TW9udGhFbmQuZm9ybWF0KFwiWVlZWVwiKSxcbiAgICAgICAgbW9udGg6IG5ld01vbnRoRW5kLmZvcm1hdChcIk1NXCIpLFxuICAgICAgICBkYXk6IG5ld01vbnRoRW5kLmZvcm1hdChcIkREXCIpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZENoYXJ0Vmlld0NoYW5nZShlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBjaGFuZ2UgdG8gZGVmYXVsdCBtb250aHZpZXcgaW50ZXJ2YWxcbiAgICBpZiAodGhpcy5kYXRhLmNoYXJ0Vmlld0lkeCA9PT0gJzAnICYmIGUuZGV0YWlsLnZhbHVlID09PSAnMScpIHtcbiAgICAgIGxldCBjdXJyTW9udGg6IG51bWJlciA9IG1vbWVudCgpLm1vbnRoKCk7XG4gICAgICBsZXQgZmlyc3REYXlPZk1vbnRoOiBtb21lbnQgPSBtb21lbnQoKS5tb250aChjdXJyTW9udGgpLnN0YXJ0T2YoXCJtb250aFwiKTtcbiAgICAgIGxldCBsYXN0RGF5T2ZNb250aDogbW9tZW50ID0gbW9tZW50KCkubW9udGgoY3Vyck1vbnRoKS5lbmRPZihcIm1vbnRoXCIpOyAvLyAyMzo1OTo1OSBOT1QgMDA6MDA6MDBcbiAgICAgIGNvbnNvbGUubG9nKFwiRmlyc3QgZGF5IG9mIG1vbnRoIFwiICsgZmlyc3REYXlPZk1vbnRoLmZvcm1hdChcIk1NLURELUhILU1NLVNTXCIpICsgXCJsYXN0IGRheSBvZiBtb250aFwiICsgbGFzdERheU9mTW9udGguZm9ybWF0KFwiTU0tREQtSEgtTU0tU1NcIikpO1xuXG4gICAgICB0aGlzLnNldE1vbnRoVmlld0ludGVydmFsKGZpcnN0RGF5T2ZNb250aCwgbGFzdERheU9mTW9udGgpO1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjaGFydFZpZXdJZHg6IGUuZGV0YWlsLnZhbHVlLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiR3JhcGhoaGggZmlyc3QgZGF5IG9mIG1vbnRoIHVuaXggXCIgKyBmaXJzdERheU9mTW9udGgudW5peCgpICsgXCIgbGFzdCBkYXkgb2YgbW9udGggdW5peCBcIiArIGxhc3REYXlPZk1vbnRoLnVuaXgoKSk7XG4gICAgICB3ZWlnaHRSZWNvcmRQYWdlLmdldE1vbnRoVmlld0RhdGEoY3Vyck1vbnRoLCBmaXJzdERheU9mTW9udGgudW5peCgpKTtcbiAgICB9XG5cbiAgICAvLyBjaGFuZ2UgdG8gZGVmYXVsdCB3ZWVrdmlldyBpbnRlcnZhbFxuICAgIGlmICh0aGlzLmRhdGEuY2hhcnRWaWV3SWR4ID09PSAnMScgJiYgZS5kZXRhaWwudmFsdWUgPT09ICcwJykge1xuICAgICAgbGV0IGN1cnJXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgICBsZXQgZmlyc3REYXlPZldlZWs6IG1vbWVudCA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS5ob3VyKDApLm1pbnV0ZSgwKS5zZWNvbmQoMCk7XG4gICAgICBsZXQgbGFzdERheU9mV2VlazogbW9tZW50ID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLmhvdXIoMCkubWludXRlKDApLnNlY29uZCgwKTtcblxuICAgICAgdGhpcy5zZXRXZWVrVmlld0ludGVydmFsKGZpcnN0RGF5T2ZXZWVrLCBsYXN0RGF5T2ZXZWVrKTtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY2hhcnRWaWV3SWR4OiBlLmRldGFpbC52YWx1ZSxcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coXCJHcmFwaGhoaCBmaXJzdCBkYXkgb2Ygd2VlayB1bml4IFwiICsgZmlyc3REYXlPZldlZWsudW5peCgpICsgXCIgbGFzdCBkYXkgb2Ygd2VlayB1bml4IFwiICsgbGFzdERheU9mV2Vlay51bml4KCkpO1xuICAgICAgd2VpZ2h0UmVjb3JkUGFnZS5nZXRXZWVrVmlld0RhdGEoY3VycldlZWssIGZpcnN0RGF5T2ZXZWVrLnVuaXgoKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNvbXB1dGVQcmVnSW5mbyhkYXRlT2ZEZWxpdmVyeTogbW9tZW50KTogdm9pZCB7XG4gICAgLy8gbGV0IG5vd01vbWVudCA9IG1vbWVudCgpO1xuICAgIC8vIGxldCB0ZW1wID0gZGF0ZU9mRGVsaXZlcnkuZGlmZihub3dNb21lbnQsICd3ZWVrcycpO1xuXG4gICAgbGV0IGRhdGVPZkNvbmNlcHRpb25Nb21lbnQgPSBkYXRlT2ZEZWxpdmVyeS5zdWJ0cmFjdCg0MCwgJ3cnKTtcbiAgICBsZXQgdGVtcERhdGUgPSB7XG4gICAgICBkYXRlOiBkYXRlT2ZDb25jZXB0aW9uTW9tZW50LmZvcm1hdChcIllZWVktTU0tRERcIiksXG4gICAgICB5ZWFyOiBkYXRlT2ZDb25jZXB0aW9uTW9tZW50LmZvcm1hdChcIllZWVlcIiksXG4gICAgICBtb250aDogZGF0ZU9mQ29uY2VwdGlvbk1vbWVudC5mb3JtYXQoXCJNTVwiKSxcbiAgICAgIGRheTogZGF0ZU9mQ29uY2VwdGlvbk1vbWVudC5mb3JtYXQoXCJERFwiKVxuICAgIH07XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgLy8gbnVtV2Vla3NQcmVnOiB0ZW1wLFxuICAgICAgZGF0ZU9mQ29uY2VwdGlvbjogdGVtcERhdGVcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHNldHMgY2hhcnRXZWVrVmlldyBhbmQgY2hhcnRNb250aFZpZXcgdG8gdGhlIHByZXNlbnQgd2VlayBhbmQgbW9udGgsIHRoZSBkZWZhdWx0IGNoYXJ0IHZpZXdcbiAgcHVibGljIGNvbXB1dGVJbml0Q2hhcnRWaWV3SW50ZXJ2YWwoKTogdm9pZCB7XG4gICAgbGV0IGN1cnJXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgbGV0IGN1cnJNb250aDogbnVtYmVyID0gbW9tZW50KCkubW9udGgoKTtcblxuICAgIGxldCBmaXJzdERheU9mV2VlazogbW9tZW50ID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDApLmhvdXIoMCkubWludXRlKDApLnNlY29uZCgwKTtcbiAgICBsZXQgbGFzdERheU9mV2VlazogbW9tZW50ID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLmhvdXIoMCkubWludXRlKDApLnNlY29uZCgwKTtcblxuICAgIHRoaXMuc2V0V2Vla1ZpZXdJbnRlcnZhbChmaXJzdERheU9mV2VlaywgbGFzdERheU9mV2Vlayk7XG5cbiAgICBsZXQgZmlyc3REYXlPZk1vbnRoID0gbW9tZW50KCkubW9udGgoY3Vyck1vbnRoKS5zdGFydE9mKFwibW9udGhcIik7XG4gICAgbGV0IGxhc3REYXlPZk1vbnRoID0gbW9tZW50KCkubW9udGgoY3Vyck1vbnRoKS5lbmRPZihcIm1vbnRoXCIpO1xuXG4gICAgdGhpcy5zZXRNb250aFZpZXdJbnRlcnZhbChmaXJzdERheU9mTW9udGgsIGxhc3REYXlPZk1vbnRoKTtcblxuICAgIC8vIHJldHVybiBsZWZ0LCByaWdodCBhcnJvd3MgYW5kIHZpZXdQaWNrZXIgdG8gZGVmYXVsdCBzdGF0ZSAod2hpY2ggaXMgd2hlbiBwcmVzZW50IHdlZWsgaXMgc2VsZWN0ZWQpXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGlzUHJldldlZWtBbGxvd2VkOiB0cnVlLFxuICAgICAgaXNOZXh0V2Vla0FsbG93ZWQ6IGZhbHNlLFxuICAgICAgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLFxuICAgICAgaXNOZXh0TW9udGhBbGxvd2VkOiBmYWxzZSxcbiAgICAgIGNoYXJ0Vmlld0lkeDogJzAnXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcmV0cmlldmVEYXRhKCk6IHZvaWQge1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICB3eC5zaG93TG9hZGluZyh7XG4gICAgICB0aXRsZTogJ+ato+WcqOWKoOi9vScsXG4gICAgfSk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogMCxcbiAgICAgICAgZGF0ZV90bzogbGFzdERheU9mV2Vla1xuICAgICAgfTtcblxuICAgICAgd2ViQVBJLlJldHJpZXZlV2VpZ2h0TG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JldHJpZXZlV2VpZ2h0TG9nJyxyZXNwKTtcblxuICAgICAgICAvLyBjb252ZXJ0IGRhdGVzIHRvIG1vbWVudHMgdGhlbiB0byBkYXRlIG9iamVjdHMgZm9yIGZsZXhpYmlsaXR5XG4gICAgICAgIGxldCB0ZW1wRGF0ZU9mRGVsaXZlcnkgPSB0aGF0LmNyZWF0ZUxvY2FsRGF0ZU9iamVjdChtb21lbnQudW5peChyZXNwLmV4cGVjdGVkX2JpcnRoX2RhdGUpKTtcbiAgICAgICAgbGV0IHRlbXBJbml0RGF0ZSA9IHRoYXQuY3JlYXRlTG9jYWxEYXRlT2JqZWN0KG1vbWVudC51bml4KHJlc3AuaW5pdGlhbF93ZWlnaHQuZGF0ZSkpO1xuICAgICAgICBsZXQgdGVtcExhdGVzdERhdGUgPSB0aGF0LmNyZWF0ZUxvY2FsRGF0ZU9iamVjdChtb21lbnQudW5peChyZXNwLmxhdGVzdF93ZWlnaHQuZGF0ZSkpO1xuICAgICAgICBsZXQgdGVtcFRhcmdldERhdGUgPSB0aGF0LmNyZWF0ZUxvY2FsRGF0ZU9iamVjdChtb21lbnQudW5peChyZXNwLnRhcmdldF93ZWlnaHQuZGF0ZSkpO1xuXG4gICAgICAgIGxldCB0ZW1wRGF0ZXNXaXRoUmVjb3JkcyA9IFtdO1xuICAgICAgICBsZXQgdGVtcFdlaWdodHMgPSBbXTtcbiAgICAgICAgbGV0IHRlbXBNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzcC53ZWlnaHRfbG9ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCB0ZW1wTW9tZW50ID0gbW9tZW50LnVuaXgocmVzcC53ZWlnaHRfbG9nc1tpXS5kYXRlKTtcbiAgICAgICAgICB0ZW1wRGF0ZXNXaXRoUmVjb3Jkcy5wdXNoKHtcbiAgICAgICAgICAgIGRhdGU6IHRlbXBNb21lbnQuZm9ybWF0KCdZWVlZLU1NLUREJyksXG4gICAgICAgICAgICB5ZWFyOiB0ZW1wTW9tZW50LmZvcm1hdChcIllZWVlcIiksXG4gICAgICAgICAgICBtb250aDogdGVtcE1vbWVudC5mb3JtYXQoXCJNTVwiKSxcbiAgICAgICAgICAgIGRheTogdGVtcE1vbWVudC5mb3JtYXQoXCJERFwiKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGVtcE1hcC5zZXQocmVzcC53ZWlnaHRfbG9nc1tpXS5kYXRlLCByZXNwLndlaWdodF9sb2dzW2ldLnZhbHVlKTsgLy8gY3JlYXRlICh0aW1lc3RhbXAgLT4gd2VpZ2h0KSBtYXBcbiAgICAgICAgICB0ZW1wV2VpZ2h0cy5wdXNoKHJlc3Aud2VpZ2h0X2xvZ3NbaV0udmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICBzaG93Q29udGVudDp0cnVlLFxuICAgICAgICAgIGluaXRXZWlnaHQ6IHJlc3AuaW5pdGlhbF93ZWlnaHQudmFsdWUsXG4gICAgICAgICAgbGF0ZXN0V2VpZ2h0OiByZXNwLmxhdGVzdF93ZWlnaHQudmFsdWUsXG4gICAgICAgICAgdGFyZ2V0V2VpZ2h0OiByZXNwLnRhcmdldF93ZWlnaHQudmFsdWUsXG4gICAgICAgICAgaW5pdERhdGU6IHRlbXBJbml0RGF0ZSxcbiAgICAgICAgICBsYXRlc3REYXRlOiB0ZW1wTGF0ZXN0RGF0ZSxcbiAgICAgICAgICB0YXJnZXREYXRlOiB0ZW1wVGFyZ2V0RGF0ZSxcbiAgICAgICAgICBpc1RhcmdldFNldDogdHJ1ZSxcbiAgICAgICAgICBjdXJyTWF4SWR4OiByZXNwLndlaWdodF9sb2dzLmxlbmd0aCxcbiAgICAgICAgICBwcmVnVXBwZXJXZWlnaHRMaW1pdDogcmVzcC53ZWlnaHRfdXBwZXJfYm91bmQsXG4gICAgICAgICAgcHJlZ0xvd2VyV2VpZ2h0TGltaXQ6IHJlc3Aud2VpZ2h0X2xvd2VyX2JvdW5kLFxuICAgICAgICAgIGlzUHJlZ25hbnRMYWR5OiByZXNwLmlzX3ByZWduYW50X2xhZHksXG4gICAgICAgICAgZGF0ZU9mRGVsaXZlcnk6IHRlbXBEYXRlT2ZEZWxpdmVyeSxcbiAgICAgICAgICBudW1XZWVrc1ByZWc6IHJlc3AubnVtYmVyX29mX3ByZWduYW50X3dlZWtzLFxuICAgICAgICAgIHdlZWtseVdlaWdodENoYW5nZUxvd2VyOiByZXNwLndlaWdodF9jaGFuZ2VfcmFuZ2UubG93ZXIvMTAwLFxuICAgICAgICAgIHdlZWtseVdlaWdodENoYW5nZVVwcGVyOiByZXNwLndlaWdodF9jaGFuZ2VfcmFuZ2UudXBwZXIvMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdlaWdodFJlY29yZFBhZ2UuaW5pdFdlaWdodCA9IHJlc3AuaW5pdGlhbF93ZWlnaHQudmFsdWU7XG4gICAgICAgIHdlaWdodFJlY29yZFBhZ2UudGFyZ2V0V2VpZ2h0ID0gcmVzcC50YXJnZXRfd2VpZ2h0LnZhbHVlO1xuICAgICAgICB3ZWlnaHRSZWNvcmRQYWdlLmlzUHJlZ25hbnRMYWR5ID0gcmVzcC5pc19wcmVnbmFudF9sYWR5O1xuICAgICAgICB3ZWlnaHRSZWNvcmRQYWdlLnByZWdVcHBlckJvdW5kID0gcmVzcC53ZWlnaHRfdXBwZXJfYm91bmQ7XG4gICAgICAgIHdlaWdodFJlY29yZFBhZ2UucHJlZ0xvd2VyQm91bmQgPSByZXNwLndlaWdodF9sb3dlcl9ib3VuZDtcbiAgICAgICAgd2VpZ2h0UmVjb3JkUGFnZS50aW1lc3RhbXBXZWlnaHRNYXAgPSB0ZW1wTWFwO1xuXG4gICAgICAgIC8vIGhhbmRsZSBjYXNlIHdoZXJlIHVzZXIgaGFzIG5vdCBzZXQgdGFyZ2V0XG4gICAgICAgIGlmIChyZXNwLnRhcmdldF93ZWlnaHQudmFsdWUgPT0gMCkge1xuICAgICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBpc1RhcmdldFNldDogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICh0aGF0IGFzIGFueSkuY29tcHV0ZVByZWdJbmZvKG1vbWVudC51bml4KHJlc3AuZXhwZWN0ZWRfYmlydGhfZGF0ZSkpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9LCAwKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTG9jYWxEYXRlT2JqZWN0KGRhdGVNb21lbnQ6IG1vbWVudCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGU6IGRhdGVNb21lbnQsXG4gICAgICB5ZWFyOiBkYXRlTW9tZW50LmZvcm1hdCgnWVlZWScpLFxuICAgICAgbW9udGg6IGRhdGVNb21lbnQuZm9ybWF0KCdNTScpLFxuICAgICAgZGF5OiBkYXRlTW9tZW50LmZvcm1hdCgnREQnKVxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb25TaG93KGUpIHtcbiAgICB0aGlzLnJldHJpZXZlRGF0YSgpO1xuICB9XG5cbiAgcHVibGljIG9uTG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLnJldHJpZXZlRGF0YSgpO1xuICAgIHRoaXMuY29tcHV0ZUluaXRDaGFydFZpZXdJbnRlcnZhbCgpO1xuXG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuS9k+mHjeiusOW9lVwiXG4gICAgfSk7XG5cbiAgICB2YXIgd2luZG93V2lkdGggPSAxNjA7XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXMgPSB3eC5nZXRTeXN0ZW1JbmZvU3luYygpO1xuICAgICAgd2luZG93V2lkdGggPSByZXMud2luZG93V2lkdGg7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignZ2V0U3lzdGVtSW5mb1N5bmMgZmFpbGVkIScpO1xuICAgIH1cbiAgICAvLyB0aGlzLmdlbmVyYXRlV2VpZ2h0TG9nRGF0YSgpO1xuICB9XG5cbiAgLy8gdXNlZCB0byBjcmVhdGUgZHVtbXkgZGF0YVxuICAvLyBwdWJsaWMgZ2VuZXJhdGVXZWlnaHRMb2dEYXRhKCkge1xuICAvLyAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgLy8gICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgLy8gICBsZXQgd2VpZ2h0RmxvYXQgPSA2NTtcbiAgLy8gICBsZXQgd2VpZ2h0SW50ID0gNjU7XG4gIC8vICAgbGV0IGRhdGUgPSAxNTU2NjQwMDAwO1xuXG4gIC8vICAgZm9yKHZhciBpPTA7IGk8NjQ7IGkrKykge1xuICAvLyAgICAgbGV0IHJlcSA9IHtcbiAgLy8gICAgICAgXCJ3ZWlnaHRfdmFsdWVcIjogd2VpZ2h0SW50LFxuICAvLyAgICAgICBcImRhdGVcIjogZGF0ZVxuICAvLyAgICAgfVxuXG4gIC8vICAgICBjb25zb2xlLmxvZyhcIkNhbGwgXCIgKyBpKTtcbiAgLy8gICAgIGNvbnNvbGUubG9nKHdlaWdodEludCk7XG4gIC8vICAgICBjb25zb2xlLmxvZyhtb21lbnQudW5peChkYXRlKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gIC8vICAgICAvLyBjYWxsXG4gIC8vICAgICB3ZWJBUEkuQ3JlYXRlV2VpZ2h0TG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgXG4gIC8vICAgICB9KS5jYXRjaChlcnIgPT4gd3guaGlkZUxvYWRpbmcoKSk7XG5cbiAgLy8gICAgIHdlaWdodEZsb2F0ICs9IDAuMTtcbiAgLy8gICAgIHdlaWdodEludCA9IE1hdGguZmxvb3Iod2VpZ2h0RmxvYXQpO1xuICAvLyAgICAgZGF0ZSArPSA4NjQwMDtcbiAgLy8gICB9IFxuICAvLyB9XG59XG5cblBhZ2UobmV3IHdlaWdodFJlY29yZFBhZ2UoKSk7Il19