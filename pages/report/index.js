"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var globalEnum = require("../../api/GlobalEnum");
var webAPI = require("../../api/app/AppService");
var moment = require("moment");
var chart = null;
function initChart(canvas, width, height, F2) {
    var data = [
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
        width: width,
        height: height
    });
    chart.axis('week', {
        grid: null
    });
    chart.tooltip({
        showCrosshairs: true,
        onShow: function (ev) {
            var items = ev.items;
            items[0].name = "热量";
        }
    });
    chart.interval().position('week*value').color("#ed2c48");
    var targetLine = 0;
    chart.guide().line({
        start: ['周日', targetLine],
        end: ['周六', targetLine],
        style: {
            stroke: '#d0d0d0',
            lineDash: [0, 2, 2],
            lineWidth: 1
        }
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
var ReportPage = (function () {
    function ReportPage() {
        this.data = {
            choose: 0,
            average_energy: 1104,
            target_energy: 1205,
            opts: {
                onInit: initChart,
            },
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
            dayReportArr: [],
            dayConuter: 0,
            showLoading: false,
        };
    }
    ReportPage.prototype.choose = function (e) {
        this.setData({
            choose: Number(e.target.dataset.num)
        });
    };
    ReportPage.prototype.onReady = function () {
        this.initHomePageInfo();
    };
    ReportPage.prototype.stop = function (e) {
        console.log(e);
        return false;
    };
    ReportPage.prototype.initHomePageInfo = function () {
        var _this = this;
        var currentFormattedDate = Date.parse(String(new Date())) / 1000;
        var req = { date: currentFormattedDate };
        webAPI.RetrieveHomePageInfo(req).then(function (resp) {
            _this.parseHomePageChartData(resp);
        }).catch(function (err) { return console.log(err); });
    };
    ReportPage.prototype.parseHomePageChartData = function (resp) {
        var _a;
        var dailyAvgIntake = Math.floor(resp.daily_avg_intake / 100);
        var dailyTargetIntake = Math.floor(resp.daily_target_intake / 100);
        var latestWeight = resp.latest_weight;
        var weightOperation = "cardList[0].card_weight_value";
        this.setData((_a = {
                average_energy: dailyAvgIntake,
                target_energy: dailyTargetIntake
            },
            _a[weightOperation] = latestWeight,
            _a));
        var dailyIntakes = resp.daily_intakes;
        for (var index in dailyIntakes) {
            dailyIntakes[index].value = Math.floor(dailyIntakes[index].value / 100);
            dailyIntakes[index].avg = dailyAvgIntake;
        }
        var targetIntake = resp.daily_target_intake;
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
        var chart1 = this.selectComponent('#nutrition_chart1');
        chart1.chart.changeData(dailyIntakes);
        var chart2 = this.selectComponent('#nutrition_chart2');
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
    };
    ReportPage.prototype.onPullDownRefresh = function () {
        this.pullDownRefresh();
    };
    ReportPage.prototype.pullDownRefresh = function () {
        var _this = this;
        if (this.data.choose == 0) {
            this.setData({
                dayReportArr: [],
                dayConuter: 0,
            }, function () {
                _this.getBefore10DayTimeStampArr();
            });
        }
    };
    ReportPage.prototype.onLoad = function () {
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
        this.getBefore10DayTimeStampArr();
    };
    ReportPage.prototype.onShow = function () {
        this.loadReportData();
    };
    ReportPage.prototype.getBefore10DayTimeStampArr = function () {
        wx.showLoading({ title: "加载中..." });
        var timeStampArr = [];
        for (var i = 0; i < 10; i++) {
            var item = moment().subtract(i + this.data.dayConuter, "days").startOf('day').unix();
            timeStampArr.push(item);
        }
        this.getDayReportArr(timeStampArr);
    };
    ReportPage.prototype.getDayReportArr = function (timeStampArr) {
        var that = this;
        Promise.all(timeStampArr.map(function (timeStamp) { return that.retrieveFoodDiaryData(timeStamp); }))
            .then(function (res) {
            wx.stopPullDownRefresh();
            var dayReportArr = that.data.dayReportArr.concat(res);
            wx.hideLoading({});
            that.setData({
                dayReportArr: dayReportArr,
                showLoading: false
            }, function () {
                console.log("=======dayReportArr", dayReportArr);
            });
        }).catch(function (err) { return console.log(123, err); });
    };
    ReportPage.prototype.retrieveFoodDiaryData = function (timeStamp) {
        var req = { date: timeStamp };
        return webAPI.RetrieveFoodDiary(req).then(function (resp) {
            var date = moment(timeStamp * 1000).format('MM月DD日');
            var res = __assign({}, resp, { date: date, dateTimeStamp: timeStamp });
            return res;
        }).catch(function (err) {
            wx.showModal({
                title: '',
                content: '获取日志失败',
                showCancel: false
            });
        });
    };
    ReportPage.prototype.scrollToLower = function () {
        var _this = this;
        this.setData({
            showLoading: true,
            dayConuter: this.data.dayConuter + 10
        }, function () {
            _this.getBefore10DayTimeStampArr();
        });
    };
    ReportPage.prototype.loadReportData = function () {
        var _this = this;
        var currentDate = moment();
        currentDate = currentDate.add(this.data.countMonth, 'month');
        if (currentDate.isAfter(moment(), 'month')) {
            this.setData({ isPrevMonthAllowed: true, isNextMonthAllowed: false });
        }
        else {
            if (currentDate.isSame(moment(), 'month')) {
                this.setData({ isPrevMonthAllowed: true, isNextMonthAllowed: false });
            }
            else {
                this.setData({ isPrevMonthAllowed: true, isNextMonthAllowed: true });
            }
        }
        var firstDayOfMonth = moment(currentDate).startOf('month').unix();
        var lastDayOfMonth = moment(currentDate).endOf('month').unix();
        var req = {
            date_from: firstDayOfMonth,
            date_to: lastDayOfMonth
        };
        console.log(firstDayOfMonth, lastDayOfMonth);
        webAPI.RetrieveUserReports(req).then(function (resp) {
            _this.parseReportData(currentDate, resp);
        }).catch(function (err) {
            console.log(err);
            wx.hideLoading({});
        });
        this.setData({
            year: currentDate.format('YYYY'),
            month: currentDate.format('MM'),
            date: currentDate.format('DD'),
            week: currentDate.week()
        });
    };
    ReportPage.prototype.goDayReport = function (e) {
        var timeStamp = e.currentTarget.dataset.timeStamp;
        this.retrieveDailyReport(timeStamp);
    };
    ReportPage.prototype.retrieveDailyReport = function (currentTimeStamp) {
        var req = { date: currentTimeStamp };
        webAPI.RetrieveOrCreateUserReport(req).then(function (resp) {
            var reportUrl = resp.report_url;
            if (reportUrl && reportUrl != "") {
                wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
            }
            else {
                wx.showModal({
                    title: "",
                    content: "请添加当天食物记录",
                    showCancel: false
                });
            }
        }).catch(function (err) { return console.log(err); });
    };
    ReportPage.prototype.parseReportData = function (currentDate, resp) {
        console.log(currentDate);
        console.log(resp);
        var reportResp = resp.weekly_report;
        var weeklyReport = [];
        for (var index in reportResp) {
            var report = reportResp[index];
            var firstDayOfWeek = moment.unix(report.date_from).format('DD');
            var lastDayOfWeek = moment.unix(report.date_to).format('DD');
            var weekly_report = {
                date: report.date,
                is_read: report.is_read,
                report_url: report.report_url,
                first_day: firstDayOfWeek,
                last_day: lastDayOfWeek,
                is_sample: false
            };
            weeklyReport.push(weekly_report);
        }
        if (currentDate.isSame(moment(), 'month') && reportResp.length == 0) {
            var firstDayOfWeek = currentDate.week(currentDate.week()).day(1).format('DD');
            var lastDayOfWeek = currentDate.week(currentDate.week()).day(7).format('DD');
            var weekly_report = {
                date: currentDate.unix(),
                first_day: firstDayOfWeek,
                last_day: lastDayOfWeek,
                report_url: "https://report.icmoto.cn/userweeklyreport/584",
                is_read: false,
                is_sample: true,
            };
            weeklyReport.push(weekly_report);
        }
        this.setData({
            weeklyReportArr: weeklyReport,
        });
        console.log(this.data.weeklyReportArr);
    };
    ReportPage.prototype.countReportBadge = function (resp) {
        console.log(resp);
        var reportNum = 0;
        var reports = resp.daily_report;
        for (var index in reports) {
            var report = reports[index];
            if (!report.is_report_generated && !report.is_food_log_empty) {
                var todayTime = moment().startOf('day').unix();
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
        }
        else {
            wx.removeTabBarBadge({
                index: 2
            });
        }
    };
    ReportPage.prototype.nextMonth = function (event) {
        this.setData({ countMonth: this.data.countMonth + 1 });
        this.loadReportData();
    };
    ReportPage.prototype.prevMonth = function () {
        this.setData({ countMonth: this.data.countMonth - 1 });
        this.loadReportData();
    };
    ReportPage.prototype.onWeeklyReportClick = function (event) {
        var reportIndex = event.currentTarget.dataset.reportIndex;
        var report = this.data.weeklyReportArr[reportIndex];
        var reportUrl = report.report_url;
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
                });
            }
            else {
                wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
            }
        }
    };
    return ReportPage;
}());
Page(new ReportPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBR0EsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFDNUIsaURBQW1EO0FBQ25ELGlEQUFtRDtBQUVuRCwrQkFBaUM7QUFPakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFBO0tBQ1AsQ0FBQyxDQUFD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LENBQUM7aUJBQ0YsQ0FBQyxDQUFBO2FBQ0g7aUJBQU07Z0JBQ0wsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxtQ0FBbUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2FBQ3pFO1NBQ0Y7SUFDSCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBcllELElBcVlDO0FBRUQsSUFBSSxDQUFDLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSU15QXBwIH0gZnJvbSAnLi4vLi4vYXBwJztcbmltcG9ydCB7IGVwb2NoIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbCc7XG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSc7XG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCB7IE1pbmlQcm9ncmFtTG9naW4gfSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcbmltcG9ydCB7IFJldHJpZXZlVXNlclJlcG9ydHNSZXEsIFdlZWtseVJlcG9ydENhcmQsIFJldHJpZXZlVXNlclJlcG9ydHNSZXNwLCBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSxSZXRyaWV2ZUZvb2REaWFyeVJlcX0gZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2JqcydcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG4vLyBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNudXRyaXRpb25fY2hhcnQxJyk7XG4vLyBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQuaW5pdChpbml0Q2hhcnQpXG5sZXQgY2hhcnQgPSBudWxsO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHtcbiAgY29uc3QgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCAgLy/nvZHmoLznur9cbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZSB25Lit5pyJeCx55Z2Q5qCH5ZKM6KKr54K55Ye76aG555qE5L+h5oGvXG4gICAgICBpdGVtc1swXS5uYW1lID0gXCLng63ph49cIjtcbiAgICB9XG4gIH0pO1xuXG4gIGNoYXJ0LmludGVydmFsKCkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIik7IC8vIOafseeKtuWbvuWuvSrpq5jvvIzloavlhYXnmoTpopzoibJcbiAgbGV0IHRhcmdldExpbmUgPSAwO1xuICAvLyDnu5jliLbovoXliqnnur9cbiAgY2hhcnQuZ3VpZGUoKS5saW5lKHtcbiAgICBzdGFydDogWyflkajml6UnLCB0YXJnZXRMaW5lXSxcbiAgICBlbmQ6IFsn5ZGo5YWtJywgdGFyZ2V0TGluZV0sXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNkMGQwZDAnLCAvLyDnur/nmoTpopzoibJcbiAgICAgIGxpbmVEYXNoOiBbMCwgMiwgMl0sIC8vIOiZmue6v+eahOiuvue9rlxuICAgICAgbGluZVdpZHRoOiAxIC8vIOe6v+eahOWuveW6plxuICAgIH0gLy8g5Zu+5b2i5qC35byP6YWN572uXG4gIH0pO1xuICBjaGFydC5ndWlkZSgpLnRleHQoe1xuICAgIHBvc2l0aW9uOiBbJ+WRqOaXpScsICdtYXgnXSxcbiAgICBjb250ZW50OiAnJyxcbiAgICBzdHlsZToge1xuICAgICAgdGV4dEFsaWduOiAnc3RhcnQnLFxuICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgIGZpbGw6ICcjNWVkNDcwJ1xuICAgIH0sXG4gICAgb2Zmc2V0WDogLTI1LFxuICAgIG9mZnNldFk6IDE1XG4gIH0pO1xuXG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5cblxuY2xhc3MgUmVwb3J0UGFnZSB7XG4gIHB1YmxpYyBiYXJ0Q2hhcnQ6IGFueTtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgY2hvb3NlOjAsXG4gICAgYXZlcmFnZV9lbmVyZ3k6IDExMDQsXG4gICAgdGFyZ2V0X2VuZXJneTogMTIwNSxcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuLy8g5LiL6Z2i5piv5Y6f5p2l55qE77yM5LiN6KaB6ZqP5oSP5pu05pS5XG4gICAgeWVhcjogXCJcIixcbiAgICBtb250aDogXCJcIixcbiAgICB3ZWVrOiBcIlwiLFxuICAgIGRhdGU6IFwiMzBcIixcbiAgICBjb3VudE1vbnRoOiAwLFxuICAgIGNoZWNrUmVwb3J0R2VuZXJhdGVkOiB0cnVlLFxuICAgIHJlcG9ydEJveENsYXNzOiBcImNoZWNrZWQtYm94XCIsXG4gICAgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLFxuICAgIGlzTmV4dE1vbnRoQWxsb3dlZDogZmFsc2UsXG5cbiAgICB3ZWVrbHlfaXNSZWFkQXJyOiBbXSxcbiAgICB3ZWVrbHlCYWRnZTogMCxcblxuICAgIHdlZWtseVJlcG9ydEFycjogW10sXG4gICAgY3VycmVudERhdGU6IDAsXG4gICAgLy8g5LiK6Z2i5piv5Y6f5p2l55qE77yM5LiN6KaB6ZqP5oSP5pu05pS5XG4gICAgZGF5UmVwb3J0QXJyOltdLFxuICAgIGRheUNvbnV0ZXI6MCxcbiAgICBzaG93TG9hZGluZzogZmFsc2UsXG4gIH1cbiBcbiAgcHVibGljIGNob29zZShlOmFueSl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNob29zZTpOdW1iZXIoZS50YXJnZXQuZGF0YXNldC5udW0pXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBvblJlYWR5KCl7XG4gICAgdGhpcy5pbml0SG9tZVBhZ2VJbmZvKCk7XG4gIH1cblxuICBwdWJsaWMgc3RvcChlKXtcbiAgICBjb25zb2xlLmxvZyhlKVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0SG9tZVBhZ2VJbmZvKCkge1xuICAgIGxldCBjdXJyZW50Rm9ybWF0dGVkRGF0ZSA9IERhdGUucGFyc2UoU3RyaW5nKG5ldyBEYXRlKCkpKSAvIDEwMDA7XG4gICAgbGV0IHJlcSA9IHsgZGF0ZTogY3VycmVudEZvcm1hdHRlZERhdGUgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVIb21lUGFnZUluZm8ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhpcy5wYXJzZUhvbWVQYWdlQ2hhcnREYXRhKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUhvbWVQYWdlQ2hhcnREYXRhKHJlc3A6IGFueSkge1xuICAgIGxldCBkYWlseUF2Z0ludGFrZSA9IE1hdGguZmxvb3IocmVzcC5kYWlseV9hdmdfaW50YWtlIC8gMTAwKTtcbiAgICBsZXQgZGFpbHlUYXJnZXRJbnRha2UgPSBNYXRoLmZsb29yKHJlc3AuZGFpbHlfdGFyZ2V0X2ludGFrZSAvIDEwMCk7XG4gICAgbGV0IGxhdGVzdFdlaWdodCA9IHJlc3AubGF0ZXN0X3dlaWdodDtcbiAgICAvL3VwZGF0ZSBkaXNwbGF5IGRhdGFcbiAgICBsZXQgd2VpZ2h0T3BlcmF0aW9uID0gXCJjYXJkTGlzdFswXS5jYXJkX3dlaWdodF92YWx1ZVwiO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBhdmVyYWdlX2VuZXJneTogZGFpbHlBdmdJbnRha2UsXG4gICAgICB0YXJnZXRfZW5lcmd5OiBkYWlseVRhcmdldEludGFrZSxcbiAgICAgIFt3ZWlnaHRPcGVyYXRpb25dOiBsYXRlc3RXZWlnaHRcbiAgICB9KTtcbiAgICAvL3VwZGF0ZSBjaGFydCBwYXJ0XG4gICAgbGV0IGRhaWx5SW50YWtlcyA9IHJlc3AuZGFpbHlfaW50YWtlcztcbiAgICBmb3IgKGxldCBpbmRleCBpbiBkYWlseUludGFrZXMpIHtcbiAgICAgIGRhaWx5SW50YWtlc1tpbmRleF0udmFsdWUgPSBNYXRoLmZsb29yKGRhaWx5SW50YWtlc1tpbmRleF0udmFsdWUgLyAxMDApO1xuICAgICAgZGFpbHlJbnRha2VzW2luZGV4XS5hdmcgPSBkYWlseUF2Z0ludGFrZVxuICAgIH1cbiAgICBsZXQgdGFyZ2V0SW50YWtlID0gcmVzcC5kYWlseV90YXJnZXRfaW50YWtlO1xuICAgIGNoYXJ0LmNoYW5nZURhdGEoZGFpbHlJbnRha2VzKTtcbiAgICBjaGFydC5ndWlkZSgpLmxpbmUoe1xuICAgICAgc3RhcnQ6IFsn5ZGo5aSpJywgdGFyZ2V0SW50YWtlXSxcbiAgICAgIGVuZDogWyflkajlha0nLCB0YXJnZXRJbnRha2VdLFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgc3Ryb2tlOiAnI2QwZDBkMCcsIFxuICAgICAgICBsaW5lRGFzaDogWzAsIDIsIDJdLCBcbiAgICAgICAgbGluZVdpZHRoOiAxIFxuICAgICAgfSBcbiAgICB9KTtcbiAgICBjb25zdCBjaGFydDEgPSB0aGlzLnNlbGVjdENvbXBvbmVudCgnI251dHJpdGlvbl9jaGFydDEnKTtcbiAgICBjaGFydDEuY2hhcnQuY2hhbmdlRGF0YShkYWlseUludGFrZXMpO1xuICAgIGNvbnN0IGNoYXJ0MiA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjbnV0cml0aW9uX2NoYXJ0MicpO1xuICAgIGNoYXJ0Mi5jaGFydC5jaGFuZ2VEYXRhKGRhaWx5SW50YWtlcyk7XG4gICAgXG4gICAgY2hhcnQyLmd1aWRlKCkubGluZSh7XG4gICAgICBzdGFydDogWyflkajlpKknLCB0YXJnZXRJbnRha2VdLFxuICAgICAgZW5kOiBbJ+WRqOWFrScsIHRhcmdldEludGFrZV0sXG4gICAgICBzdHlsZToge1xuICAgICAgICBzdHJva2U6ICcjZDBkMGQwJyxcbiAgICAgICAgbGluZURhc2g6IFswLCAyLCAyXSxcbiAgICAgICAgbGluZVdpZHRoOiAxIFxuICAgICAgfSBcbiAgICB9KTtcblxuXG4gIH1cbiAgcHVibGljIG9uUHVsbERvd25SZWZyZXNoKCkge1xuICAgIHRoaXMucHVsbERvd25SZWZyZXNoKClcbiAgfVxuICBwdWJsaWMgcHVsbERvd25SZWZyZXNoKCl7XG4gICAgaWYodGhpcy5kYXRhLmNob29zZT09MCl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBkYXlSZXBvcnRBcnI6IFtdLFxuICAgICAgICBkYXlDb251dGVyOiAwLFxuICAgICAgfSwoKT0+e1xuICAgICAgICB0aGlzLmdldEJlZm9yZTEwRGF5VGltZVN0YW1wQXJyKClcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbi8vIOS4i+mdouaYr+WOn+adpeeahOS7o+egge+8jOivt+S4jeimgemaj+S+v+azqOmHilxuXG4gIC8vIGVudW0gREFZIHtcbiAgLy8gICBNT05EQVkgPSBcIuaYn+acn+S4gFwiLFxuICAvLyAgIFRVRVNEQVkgPSBcIuaYn+acn+S6jFwiLFxuICAvLyAgIFdFRCA9IFwi5pif5pyf5LiJXCIsXG4gIC8vICAgVEhVUlMgPSBcIuaYn+acn+Wbm1wiLFxuICAvLyAgIEZSSSA9IFwi5pif5pyf5LqUXCIsXG4gIC8vICAgU0FUID0gXCLmmJ/mnJ/lha1cIixcbiAgLy8gICBTVU4gPSBcIuaYn+acn+aXpVwiXG4gIC8vIH1cblxuICAvLyBpbnRlcmZhY2UgUmVwb3J0IHtcbiAgLy8gICByZXBvcnRfdXJsOiBzdHJpbmc7XG4gIC8vICAgZGF0ZTogbnVtYmVyO1xuICAvLyAgIGlzX3JlYWQ6IGJvb2xlYW47XG4gIC8vICAgZmlyc3RfZGF5OiBzdHJpbmc7XG4gIC8vICAgbGFzdF9kYXk6IHN0cmluZztcbiAgLy8gICBpc19zYW1wbGU6IGJvb2xlYW5cbiAgLy8gfVxuXG4vLyBjbGFzcyByZXBvcnRQYWdlIHtcbiAgLy8gcHVibGljIGRhdGEgPSB7XG4gIC8vICAgeWVhcjogXCJcIixcbiAgLy8gICBtb250aDogXCJcIixcbiAgLy8gICB3ZWVrOiBcIlwiLFxuICAvLyAgIGRhdGU6IFwiMzBcIixcbiAgLy8gICBjb3VudE1vbnRoOiAwLFxuICAvLyAgIGNoZWNrUmVwb3J0R2VuZXJhdGVkOiB0cnVlLFxuICAvLyAgIHJlcG9ydEJveENsYXNzOiBcImNoZWNrZWQtYm94XCIsXG4gIC8vICAgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLFxuICAvLyAgIGlzTmV4dE1vbnRoQWxsb3dlZDogZmFsc2UsXG5cbiAgLy8gICB3ZWVrbHlfaXNSZWFkQXJyOiBbXSxcbiAgLy8gICB3ZWVrbHlCYWRnZTogMCxcblxuICAvLyAgIHdlZWtseVJlcG9ydEFycjogW10sXG4gIC8vICAgY3VycmVudERhdGU6IDBcbiAgLy8gfVxuXG4gIHB1YmxpYyBvbkxvYWQoKTogdm9pZCB7XG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIHRoaXMuZ2V0QmVmb3JlMTBEYXlUaW1lU3RhbXBBcnIoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5sb2FkUmVwb3J0RGF0YSgpO1xuICB9XG4gIC8qKlxuICAgKiDojrflj5bliY0xMOWkqeeahOaXtumXtOaIs+aVsOe7hFxuICAgKi9cbiAgcHVibGljIGdldEJlZm9yZTEwRGF5VGltZVN0YW1wQXJyKCl7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICBsZXQgdGltZVN0YW1wQXJyID0gW107XG4gICAgZm9yKGxldCBpPTA7aTwxMDtpKyspe1xuICAgICAgY29uc3QgaXRlbSA9IG1vbWVudCgpLnN1YnRyYWN0KGkrdGhpcy5kYXRhLmRheUNvbnV0ZXIsIFwiZGF5c1wiKS5zdGFydE9mKCdkYXknKS51bml4KCk7XG4gICAgICB0aW1lU3RhbXBBcnIucHVzaChpdGVtKTtcbiAgICB9XG4gICAgdGhpcy5nZXREYXlSZXBvcnRBcnIodGltZVN0YW1wQXJyKVxuICB9XG4vKipcbiAqIOiOt+WPluaXpeaKpeS/oeaBr1xuICovXG4gIHB1YmxpYyBnZXREYXlSZXBvcnRBcnIodGltZVN0YW1wQXJyKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIFByb21pc2UuYWxsKHRpbWVTdGFtcEFyci5tYXAodGltZVN0YW1wID0+IHRoYXQucmV0cmlldmVGb29kRGlhcnlEYXRhKHRpbWVTdGFtcCkpKVxuICAgIC50aGVuKHJlcz0+e1xuICAgICAgd3guc3RvcFB1bGxEb3duUmVmcmVzaCgpXG4gICAgICBjb25zdCBkYXlSZXBvcnRBcnIgPSB0aGF0LmRhdGEuZGF5UmVwb3J0QXJyLmNvbmNhdChyZXMpXG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBcbiAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGRheVJlcG9ydEFycjogZGF5UmVwb3J0QXJyLFxuICAgICAgICBzaG93TG9hZGluZzpmYWxzZVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCI9PT09PT09ZGF5UmVwb3J0QXJyXCIsIGRheVJlcG9ydEFycilcbiAgICAgIH0pXG4gICAgfSkuY2F0Y2goZXJyPT5jb25zb2xlLmxvZygxMjMsZXJyKSlcbiAgfVxuICAvKipcbiAqIGFwaeivt+axguS7iuaXpeaRhOWFpemHj+WSjOS7iuaXpemlrumjn+iusOW9lVxuICovXG4gIHB1YmxpYyByZXRyaWV2ZUZvb2REaWFyeURhdGEodGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZUZvb2REaWFyeVJlcSA9IHsgZGF0ZTogdGltZVN0YW1wIH07XG4gICAgcmV0dXJuIHdlYkFQSS5SZXRyaWV2ZUZvb2REaWFyeShyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICBjb25zdCBkYXRlID0gbW9tZW50KHRpbWVTdGFtcCoxMDAwKS5mb3JtYXQoJ01N5pyIRETml6UnKVxuICAgICAgY29uc3QgcmVzID0geyAuLi5yZXNwLCBkYXRlOiBkYXRlLCBkYXRlVGltZVN0YW1wOiB0aW1lU3RhbXB9XG4gICAgICByZXR1cm4gcmVzIFxuICAgIH0pLmNhdGNoKGVyciA9PntcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgY29udGVudDogJ+iOt+WPluaXpeW/l+Wksei0pScsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICB9KVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiDml6XmiqXmu5rliqjliLDlupXpg6hcbiAgICovXG4gIHB1YmxpYyBzY3JvbGxUb0xvd2VyKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHNob3dMb2FkaW5nOiB0cnVlLFxuICAgICAgZGF5Q29udXRlcjogdGhpcy5kYXRhLmRheUNvbnV0ZXIrMTBcbiAgICB9LCgpPT57XG4gICAgICB0aGlzLmdldEJlZm9yZTEwRGF5VGltZVN0YW1wQXJyKClcbiAgICB9KVxuICAgIFxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWRqOaKpeS/oeaBr1xuICAgKi9cbiAgcHVibGljIGxvYWRSZXBvcnREYXRhKCkge1xuICAgIGxldCBjdXJyZW50RGF0ZSA9IG1vbWVudCgpO1xuICAgIGN1cnJlbnREYXRlID0gY3VycmVudERhdGUuYWRkKHRoaXMuZGF0YS5jb3VudE1vbnRoLCAnbW9udGgnKTtcbiAgICBpZiAoY3VycmVudERhdGUuaXNBZnRlcihtb21lbnQoKSwgJ21vbnRoJykpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGlzUHJldk1vbnRoQWxsb3dlZDogdHJ1ZSwgaXNOZXh0TW9udGhBbGxvd2VkOiBmYWxzZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnREYXRlLmlzU2FtZShtb21lbnQoKSwgJ21vbnRoJykpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLCBpc05leHRNb250aEFsbG93ZWQ6IGZhbHNlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLCBpc05leHRNb250aEFsbG93ZWQ6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0RGF5T2ZNb250aCA9IG1vbWVudChjdXJyZW50RGF0ZSkuc3RhcnRPZignbW9udGgnKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZk1vbnRoID0gbW9tZW50KGN1cnJlbnREYXRlKS5lbmRPZignbW9udGgnKS51bml4KCk7XG4gICAgbGV0IHJlcSA9IHtcbiAgICAgIGRhdGVfZnJvbTogZmlyc3REYXlPZk1vbnRoLFxuICAgICAgZGF0ZV90bzogbGFzdERheU9mTW9udGhcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGZpcnN0RGF5T2ZNb250aCwgbGFzdERheU9mTW9udGgpO1xuICAgIC8vIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Yqg6L295LitLi4uXCIgfSk7XG4gICAgd2ViQVBJLlJldHJpZXZlVXNlclJlcG9ydHMocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgLy8gd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgdGhpcy5wYXJzZVJlcG9ydERhdGEoY3VycmVudERhdGUsIHJlc3ApO1xuXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgfSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHllYXI6IGN1cnJlbnREYXRlLmZvcm1hdCgnWVlZWScpLFxuICAgICAgbW9udGg6IGN1cnJlbnREYXRlLmZvcm1hdCgnTU0nKSxcbiAgICAgIGRhdGU6IGN1cnJlbnREYXRlLmZvcm1hdCgnREQnKSxcbiAgICAgIHdlZWs6IGN1cnJlbnREYXRlLndlZWsoKVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vlkI4s6L+b5YWl5pel5oqlSDXpobXpnaJcbiAgICovXG4gIHB1YmxpYyBnb0RheVJlcG9ydChlKXtcbiAgICBjb25zdCB0aW1lU3RhbXAgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50aW1lU3RhbXBcbiAgICB0aGlzLnJldHJpZXZlRGFpbHlSZXBvcnQodGltZVN0YW1wKVxuICB9XG5cbiAgcHVibGljIHJldHJpZXZlRGFpbHlSZXBvcnQoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gICAgbGV0IHJlcTogUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXEgPSB7IGRhdGU6IGN1cnJlbnRUaW1lU3RhbXAgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnQocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgbGV0IHJlcG9ydFVybDogc3RyaW5nID0gcmVzcC5yZXBvcnRfdXJsO1xuICAgICAgaWYgKHJlcG9ydFVybCAmJiByZXBvcnRVcmwgIT0gXCJcIikge1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiBcIi9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXJsPVwiICsgcmVwb3J0VXJsIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICBjb250ZW50OiBcIuivt+a3u+WKoOW9k+Wkqemjn+eJqeiusOW9lVwiLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpXG4gIH1cblxuICBwdWJsaWMgcGFyc2VSZXBvcnREYXRhKGN1cnJlbnREYXRlOiBtb21lbnQsIHJlc3A6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGN1cnJlbnREYXRlKTtcbiAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICBsZXQgcmVwb3J0UmVzcDogV2Vla2x5UmVwb3J0Q2FyZFtdID0gcmVzcC53ZWVrbHlfcmVwb3J0O1xuICAgIGxldCB3ZWVrbHlSZXBvcnQ6IFJlcG9ydFtdID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVwb3J0UmVzcCkge1xuICAgICAgbGV0IHJlcG9ydDogV2Vla2x5UmVwb3J0Q2FyZCA9IHJlcG9ydFJlc3BbaW5kZXhdO1xuICAgICAgbGV0IGZpcnN0RGF5T2ZXZWVrOiBzdHJpbmcgPSBtb21lbnQudW5peChyZXBvcnQuZGF0ZV9mcm9tKS5mb3JtYXQoJ0REJyk7XG4gICAgICBsZXQgbGFzdERheU9mV2Vlazogc3RyaW5nID0gbW9tZW50LnVuaXgocmVwb3J0LmRhdGVfdG8pLmZvcm1hdCgnREQnKTtcbiAgICAgIGxldCB3ZWVrbHlfcmVwb3J0OiBSZXBvcnQgPSB7XG4gICAgICAgIGRhdGU6IHJlcG9ydC5kYXRlLFxuICAgICAgICBpc19yZWFkOiByZXBvcnQuaXNfcmVhZCxcbiAgICAgICAgcmVwb3J0X3VybDogcmVwb3J0LnJlcG9ydF91cmwsXG4gICAgICAgIGZpcnN0X2RheTogZmlyc3REYXlPZldlZWssXG4gICAgICAgIGxhc3RfZGF5OiBsYXN0RGF5T2ZXZWVrLFxuICAgICAgICBpc19zYW1wbGU6IGZhbHNlXG4gICAgICB9XG4gICAgICB3ZWVrbHlSZXBvcnQucHVzaCh3ZWVrbHlfcmVwb3J0KVxuICAgIH1cblxuICAgIGlmIChjdXJyZW50RGF0ZS5pc1NhbWUobW9tZW50KCksICdtb250aCcpICYmIHJlcG9ydFJlc3AubGVuZ3RoID09IDApIHtcbiAgICAgIGxldCBmaXJzdERheU9mV2Vlazogc3RyaW5nID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSgxKS5mb3JtYXQoJ0REJyk7XG4gICAgICBsZXQgbGFzdERheU9mV2Vlazogc3RyaW5nID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSg3KS5mb3JtYXQoJ0REJyk7XG4gICAgICBsZXQgd2Vla2x5X3JlcG9ydDogUmVwb3J0ID0ge1xuICAgICAgICBkYXRlOiBjdXJyZW50RGF0ZS51bml4KCksXG4gICAgICAgIGZpcnN0X2RheTogZmlyc3REYXlPZldlZWssXG4gICAgICAgIGxhc3RfZGF5OiBsYXN0RGF5T2ZXZWVrLFxuICAgICAgICByZXBvcnRfdXJsOiBcImh0dHBzOi8vcmVwb3J0LmljbW90by5jbi91c2Vyd2Vla2x5cmVwb3J0LzU4NFwiLFxuICAgICAgICBpc19yZWFkOiBmYWxzZSxcbiAgICAgICAgaXNfc2FtcGxlOiB0cnVlLFxuICAgICAgfVxuICAgICAgd2Vla2x5UmVwb3J0LnB1c2god2Vla2x5X3JlcG9ydClcbiAgICB9XG5cblxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHdlZWtseVJlcG9ydEFycjogd2Vla2x5UmVwb3J0LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5kYXRhLndlZWtseVJlcG9ydEFycilcbiAgfVxuXG4gIHB1YmxpYyBjb3VudFJlcG9ydEJhZGdlKHJlc3A6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgIGxldCByZXBvcnROdW0gPSAwO1xuICAgIGxldCByZXBvcnRzID0gcmVzcC5kYWlseV9yZXBvcnQ7XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVwb3J0cykge1xuICAgICAgbGV0IHJlcG9ydCA9IHJlcG9ydHNbaW5kZXhdO1xuICAgICAgaWYgKCFyZXBvcnQuaXNfcmVwb3J0X2dlbmVyYXRlZCAmJiAhcmVwb3J0LmlzX2Zvb2RfbG9nX2VtcHR5KSB7XG4gICAgICAgIGxldCB0b2RheVRpbWUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKS51bml4KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRvZGF5VGltZSk7XG4gICAgICAgIGlmIChyZXBvcnQuZGF0ZSA8IHRvZGF5VGltZSB8fCAocmVwb3J0LmRhdGUgPT0gdG9kYXlUaW1lICYmIG1vbWVudChuZXcgRGF0ZSgpKS5ob3VycyA+IDIyKSkgeyBcbiAgICAgICAgICByZXBvcnROdW0rKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVwb3J0TnVtICE9IDApIHtcbiAgICAgIHd4LnNldFRhYkJhckJhZGdlKHtcbiAgICAgICAgaW5kZXg6IDIsXG4gICAgICAgIHRleHQ6IFN0cmluZyhyZXBvcnROdW0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd3gucmVtb3ZlVGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMlxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5leHRNb250aChldmVudDogYW55KTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgY291bnRNb250aDogdGhpcy5kYXRhLmNvdW50TW9udGggKyAxIH0pO1xuICAgIHRoaXMubG9hZFJlcG9ydERhdGEoKTtcbiAgfVxuXG4gIHB1YmxpYyBwcmV2TW9udGgoKTp2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudE1vbnRoOnRoaXMuZGF0YS5jb3VudE1vbnRoIC0gMSB9KTtcbiAgICB0aGlzLmxvYWRSZXBvcnREYXRhKCk7XG4gIH1cblxuICBwdWJsaWMgb25XZWVrbHlSZXBvcnRDbGljayhldmVudDogYW55KTogdm9pZCB7XG4gICAgbGV0IHJlcG9ydEluZGV4OiBudW1iZXIgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucmVwb3J0SW5kZXg7XG4gICAgbGV0IHJlcG9ydDogUmVwb3J0ID0gdGhpcy5kYXRhLndlZWtseVJlcG9ydEFycltyZXBvcnRJbmRleF07XG4gICAgbGV0IHJlcG9ydFVybDogc3RyaW5nID0gcmVwb3J0LnJlcG9ydF91cmw7XG4gICAgaWYgKHJlcG9ydFVybCkge1xuICAgICAgaWYgKHJlcG9ydC5pc19zYW1wbGUpIHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJ+aPkOekuicsXG4gICAgICAgICAgY29udGVudDogJ+i/meaYr+S4gOS4quagt+S+i+aKpeWRiicsXG4gICAgICAgICAgY2FuY2VsVGV4dDogJ+WPlua2iCcsXG4gICAgICAgICAgY29uZmlybVRleHQ6IFwi5p+l55yLXCIsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XG4gICAgICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IFwiL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91cmw9XCIgKyByZXBvcnRVcmwgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiBcIi9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXJsPVwiICsgcmVwb3J0VXJsIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5QYWdlKG5ldyBSZXBvcnRQYWdlKCkpO1xuIl19