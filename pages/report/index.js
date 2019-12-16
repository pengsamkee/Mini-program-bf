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
    ReportPage.prototype.onReady = function () {
        this.initHomePageInfo();
    };
    ReportPage.prototype.choose = function (e) {
        this.setData({
            choose: Number(e.target.dataset.num)
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBR0EsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFDNUIsaURBQW1EO0FBQ25ELGlEQUFtRDtBQUVuRCwrQkFBaUM7QUFPakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFBO0tBQ1AsQ0FBQyxDQUFD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LENBQUM7aUJBQ0YsQ0FBQyxDQUFBO2FBQ0g7aUJBQU07Z0JBQ0wsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxtQ0FBbUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2FBQ3pFO1NBQ0Y7SUFDSCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBcllELElBcVlDO0FBRUQsSUFBSSxDQUFDLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSU15QXBwIH0gZnJvbSAnLi4vLi4vYXBwJztcbmltcG9ydCB7IGVwb2NoIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbCc7XG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSc7XG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCB7IE1pbmlQcm9ncmFtTG9naW4gfSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcbmltcG9ydCB7IFJldHJpZXZlVXNlclJlcG9ydHNSZXEsIFdlZWtseVJlcG9ydENhcmQsIFJldHJpZXZlVXNlclJlcG9ydHNSZXNwLCBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSxSZXRyaWV2ZUZvb2REaWFyeVJlcX0gZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2JqcydcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG4vLyBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNudXRyaXRpb25fY2hhcnQxJyk7XG4vLyBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQuaW5pdChpbml0Q2hhcnQpXG5sZXQgY2hhcnQgPSBudWxsO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHtcbiAgY29uc3QgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCAgLy/nvZHmoLznur9cbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZSB25Lit5pyJeCx55Z2Q5qCH5ZKM6KKr54K55Ye76aG555qE5L+h5oGvXG4gICAgICBpdGVtc1swXS5uYW1lID0gXCLng63ph49cIjtcbiAgICB9XG4gIH0pO1xuXG4gIGNoYXJ0LmludGVydmFsKCkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIik7IC8vIOafseeKtuWbvuWuvSrpq5jvvIzloavlhYXnmoTpopzoibJcbiAgbGV0IHRhcmdldExpbmUgPSAwO1xuICAvLyDnu5jliLbovoXliqnnur9cbiAgY2hhcnQuZ3VpZGUoKS5saW5lKHtcbiAgICBzdGFydDogWyflkajml6UnLCB0YXJnZXRMaW5lXSxcbiAgICBlbmQ6IFsn5ZGo5YWtJywgdGFyZ2V0TGluZV0sXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNkMGQwZDAnLCAvLyDnur/nmoTpopzoibJcbiAgICAgIGxpbmVEYXNoOiBbMCwgMiwgMl0sIC8vIOiZmue6v+eahOiuvue9rlxuICAgICAgbGluZVdpZHRoOiAxIC8vIOe6v+eahOWuveW6plxuICAgIH0gLy8g5Zu+5b2i5qC35byP6YWN572uXG4gIH0pO1xuICBjaGFydC5ndWlkZSgpLnRleHQoe1xuICAgIHBvc2l0aW9uOiBbJ+WRqOaXpScsICdtYXgnXSxcbiAgICBjb250ZW50OiAnJyxcbiAgICBzdHlsZToge1xuICAgICAgdGV4dEFsaWduOiAnc3RhcnQnLFxuICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgIGZpbGw6ICcjNWVkNDcwJ1xuICAgIH0sXG4gICAgb2Zmc2V0WDogLTI1LFxuICAgIG9mZnNldFk6IDE1XG4gIH0pO1xuXG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5cblxuY2xhc3MgUmVwb3J0UGFnZSB7XG4gIHB1YmxpYyBiYXJ0Q2hhcnQ6IGFueTtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgY2hvb3NlOjAsXG4gICAgYXZlcmFnZV9lbmVyZ3k6IDExMDQsXG4gICAgdGFyZ2V0X2VuZXJneTogMTIwNSxcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuLy8g5LiL6Z2i5piv5Y6f5p2l55qE77yM5LiN6KaB6ZqP5oSP5pu05pS5XG4gICAgeWVhcjogXCJcIixcbiAgICBtb250aDogXCJcIixcbiAgICB3ZWVrOiBcIlwiLFxuICAgIGRhdGU6IFwiMzBcIixcbiAgICBjb3VudE1vbnRoOiAwLFxuICAgIGNoZWNrUmVwb3J0R2VuZXJhdGVkOiB0cnVlLFxuICAgIHJlcG9ydEJveENsYXNzOiBcImNoZWNrZWQtYm94XCIsXG4gICAgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLFxuICAgIGlzTmV4dE1vbnRoQWxsb3dlZDogZmFsc2UsXG5cbiAgICB3ZWVrbHlfaXNSZWFkQXJyOiBbXSxcbiAgICB3ZWVrbHlCYWRnZTogMCxcblxuICAgIHdlZWtseVJlcG9ydEFycjogW10sXG4gICAgY3VycmVudERhdGU6IDAsXG4gICAgLy8g5LiK6Z2i5piv5Y6f5p2l55qE77yM5LiN6KaB6ZqP5oSP5pu05pS5XG4gICAgZGF5UmVwb3J0QXJyOltdLFxuICAgIGRheUNvbnV0ZXI6MCxcbiAgICBzaG93TG9hZGluZzogZmFsc2UsXG4gIH1cblxuICBwdWJsaWMgb25SZWFkeSgpe1xuICAgIHRoaXMuaW5pdEhvbWVQYWdlSW5mbygpO1xuICB9XG5cbiAgcHVibGljIGNob29zZShlOmFueSl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNob29zZTpOdW1iZXIoZS50YXJnZXQuZGF0YXNldC5udW0pXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wKGUpe1xuICAgIGNvbnNvbGUubG9nKGUpXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGluaXRIb21lUGFnZUluZm8oKSB7XG4gICAgbGV0IGN1cnJlbnRGb3JtYXR0ZWREYXRlID0gRGF0ZS5wYXJzZShTdHJpbmcobmV3IERhdGUoKSkpIC8gMTAwMDtcbiAgICBsZXQgcmVxID0geyBkYXRlOiBjdXJyZW50Rm9ybWF0dGVkRGF0ZSB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZUhvbWVQYWdlSW5mbyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGlzLnBhcnNlSG9tZVBhZ2VDaGFydERhdGEocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG5cbiAgcHVibGljIHBhcnNlSG9tZVBhZ2VDaGFydERhdGEocmVzcDogYW55KSB7XG4gICAgbGV0IGRhaWx5QXZnSW50YWtlID0gTWF0aC5mbG9vcihyZXNwLmRhaWx5X2F2Z19pbnRha2UgLyAxMDApO1xuICAgIGxldCBkYWlseVRhcmdldEludGFrZSA9IE1hdGguZmxvb3IocmVzcC5kYWlseV90YXJnZXRfaW50YWtlIC8gMTAwKTtcbiAgICBsZXQgbGF0ZXN0V2VpZ2h0ID0gcmVzcC5sYXRlc3Rfd2VpZ2h0O1xuICAgIC8vdXBkYXRlIGRpc3BsYXkgZGF0YVxuICAgIGxldCB3ZWlnaHRPcGVyYXRpb24gPSBcImNhcmRMaXN0WzBdLmNhcmRfd2VpZ2h0X3ZhbHVlXCI7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGF2ZXJhZ2VfZW5lcmd5OiBkYWlseUF2Z0ludGFrZSxcbiAgICAgIHRhcmdldF9lbmVyZ3k6IGRhaWx5VGFyZ2V0SW50YWtlLFxuICAgICAgW3dlaWdodE9wZXJhdGlvbl06IGxhdGVzdFdlaWdodFxuICAgIH0pO1xuICAgIC8vdXBkYXRlIGNoYXJ0IHBhcnRcbiAgICBsZXQgZGFpbHlJbnRha2VzID0gcmVzcC5kYWlseV9pbnRha2VzO1xuICAgIGZvciAobGV0IGluZGV4IGluIGRhaWx5SW50YWtlcykge1xuICAgICAgZGFpbHlJbnRha2VzW2luZGV4XS52YWx1ZSA9IE1hdGguZmxvb3IoZGFpbHlJbnRha2VzW2luZGV4XS52YWx1ZSAvIDEwMCk7XG4gICAgICBkYWlseUludGFrZXNbaW5kZXhdLmF2ZyA9IGRhaWx5QXZnSW50YWtlXG4gICAgfVxuICAgIGxldCB0YXJnZXRJbnRha2UgPSByZXNwLmRhaWx5X3RhcmdldF9pbnRha2U7XG4gICAgY2hhcnQuY2hhbmdlRGF0YShkYWlseUludGFrZXMpO1xuICAgIGNoYXJ0Lmd1aWRlKCkubGluZSh7XG4gICAgICBzdGFydDogWyflkajlpKknLCB0YXJnZXRJbnRha2VdLFxuICAgICAgZW5kOiBbJ+WRqOWFrScsIHRhcmdldEludGFrZV0sXG4gICAgICBzdHlsZToge1xuICAgICAgICBzdHJva2U6ICcjZDBkMGQwJywgXG4gICAgICAgIGxpbmVEYXNoOiBbMCwgMiwgMl0sIFxuICAgICAgICBsaW5lV2lkdGg6IDEgXG4gICAgICB9IFxuICAgIH0pO1xuICAgIGNvbnN0IGNoYXJ0MSA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjbnV0cml0aW9uX2NoYXJ0MScpO1xuICAgIGNoYXJ0MS5jaGFydC5jaGFuZ2VEYXRhKGRhaWx5SW50YWtlcyk7XG4gICAgY29uc3QgY2hhcnQyID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNudXRyaXRpb25fY2hhcnQyJyk7XG4gICAgY2hhcnQyLmNoYXJ0LmNoYW5nZURhdGEoZGFpbHlJbnRha2VzKTtcbiAgICBcbiAgICBjaGFydDIuZ3VpZGUoKS5saW5lKHtcbiAgICAgIHN0YXJ0OiBbJ+WRqOWkqScsIHRhcmdldEludGFrZV0sXG4gICAgICBlbmQ6IFsn5ZGo5YWtJywgdGFyZ2V0SW50YWtlXSxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHN0cm9rZTogJyNkMGQwZDAnLFxuICAgICAgICBsaW5lRGFzaDogWzAsIDIsIDJdLFxuICAgICAgICBsaW5lV2lkdGg6IDEgXG4gICAgICB9IFxuICAgIH0pO1xuXG5cbiAgfVxuICBwdWJsaWMgb25QdWxsRG93blJlZnJlc2goKSB7XG4gICAgdGhpcy5wdWxsRG93blJlZnJlc2goKVxuICB9XG4gIHB1YmxpYyBwdWxsRG93blJlZnJlc2goKXtcbiAgICBpZih0aGlzLmRhdGEuY2hvb3NlPT0wKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGRheVJlcG9ydEFycjogW10sXG4gICAgICAgIGRheUNvbnV0ZXI6IDAsXG4gICAgICB9LCgpPT57XG4gICAgICAgIHRoaXMuZ2V0QmVmb3JlMTBEYXlUaW1lU3RhbXBBcnIoKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuLy8g5LiL6Z2i5piv5Y6f5p2l55qE5Luj56CB77yM6K+35LiN6KaB6ZqP5L6/5rOo6YeKXG5cbiAgLy8gZW51bSBEQVkge1xuICAvLyAgIE1PTkRBWSA9IFwi5pif5pyf5LiAXCIsXG4gIC8vICAgVFVFU0RBWSA9IFwi5pif5pyf5LqMXCIsXG4gIC8vICAgV0VEID0gXCLmmJ/mnJ/kuIlcIixcbiAgLy8gICBUSFVSUyA9IFwi5pif5pyf5ZubXCIsXG4gIC8vICAgRlJJID0gXCLmmJ/mnJ/kupRcIixcbiAgLy8gICBTQVQgPSBcIuaYn+acn+WFrVwiLFxuICAvLyAgIFNVTiA9IFwi5pif5pyf5pelXCJcbiAgLy8gfVxuXG4gIC8vIGludGVyZmFjZSBSZXBvcnQge1xuICAvLyAgIHJlcG9ydF91cmw6IHN0cmluZztcbiAgLy8gICBkYXRlOiBudW1iZXI7XG4gIC8vICAgaXNfcmVhZDogYm9vbGVhbjtcbiAgLy8gICBmaXJzdF9kYXk6IHN0cmluZztcbiAgLy8gICBsYXN0X2RheTogc3RyaW5nO1xuICAvLyAgIGlzX3NhbXBsZTogYm9vbGVhblxuICAvLyB9XG5cbi8vIGNsYXNzIHJlcG9ydFBhZ2Uge1xuICAvLyBwdWJsaWMgZGF0YSA9IHtcbiAgLy8gICB5ZWFyOiBcIlwiLFxuICAvLyAgIG1vbnRoOiBcIlwiLFxuICAvLyAgIHdlZWs6IFwiXCIsXG4gIC8vICAgZGF0ZTogXCIzMFwiLFxuICAvLyAgIGNvdW50TW9udGg6IDAsXG4gIC8vICAgY2hlY2tSZXBvcnRHZW5lcmF0ZWQ6IHRydWUsXG4gIC8vICAgcmVwb3J0Qm94Q2xhc3M6IFwiY2hlY2tlZC1ib3hcIixcbiAgLy8gICBpc1ByZXZNb250aEFsbG93ZWQ6IHRydWUsXG4gIC8vICAgaXNOZXh0TW9udGhBbGxvd2VkOiBmYWxzZSxcblxuICAvLyAgIHdlZWtseV9pc1JlYWRBcnI6IFtdLFxuICAvLyAgIHdlZWtseUJhZGdlOiAwLFxuXG4gIC8vICAgd2Vla2x5UmVwb3J0QXJyOiBbXSxcbiAgLy8gICBjdXJyZW50RGF0ZTogMFxuICAvLyB9XG5cbiAgcHVibGljIG9uTG9hZCgpOiB2b2lkIHtcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih0b2tlbik7XG4gICAgdGhpcy5nZXRCZWZvcmUxMERheVRpbWVTdGFtcEFycigpO1xuICB9XG5cbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICB0aGlzLmxvYWRSZXBvcnREYXRhKCk7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPluWJjTEw5aSp55qE5pe26Ze05oiz5pWw57uEXG4gICAqL1xuICBwdWJsaWMgZ2V0QmVmb3JlMTBEYXlUaW1lU3RhbXBBcnIoKXtcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiIH0pO1xuICAgIGxldCB0aW1lU3RhbXBBcnIgPSBbXTtcbiAgICBmb3IobGV0IGk9MDtpPDEwO2krKyl7XG4gICAgICBjb25zdCBpdGVtID0gbW9tZW50KCkuc3VidHJhY3QoaSt0aGlzLmRhdGEuZGF5Q29udXRlciwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLnVuaXgoKTtcbiAgICAgIHRpbWVTdGFtcEFyci5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICB0aGlzLmdldERheVJlcG9ydEFycih0aW1lU3RhbXBBcnIpXG4gIH1cbi8qKlxuICog6I635Y+W5pel5oql5L+h5oGvXG4gKi9cbiAgcHVibGljIGdldERheVJlcG9ydEFycih0aW1lU3RhbXBBcnIpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgUHJvbWlzZS5hbGwodGltZVN0YW1wQXJyLm1hcCh0aW1lU3RhbXAgPT4gdGhhdC5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGltZVN0YW1wKSkpXG4gICAgLnRoZW4ocmVzPT57XG4gICAgICB3eC5zdG9wUHVsbERvd25SZWZyZXNoKClcbiAgICAgIGNvbnN0IGRheVJlcG9ydEFyciA9IHRoYXQuZGF0YS5kYXlSZXBvcnRBcnIuY29uY2F0KHJlcylcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIFxuICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgZGF5UmVwb3J0QXJyOiBkYXlSZXBvcnRBcnIsXG4gICAgICAgIHNob3dMb2FkaW5nOmZhbHNlXG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT1kYXlSZXBvcnRBcnJcIiwgZGF5UmVwb3J0QXJyKVxuICAgICAgfSlcbiAgICB9KS5jYXRjaChlcnI9PmNvbnNvbGUubG9nKDEyMyxlcnIpKVxuICB9XG4gIC8qKlxuICogYXBp6K+35rGC5LuK5pel5pGE5YWl6YeP5ZKM5LuK5pel6aWu6aOf6K6w5b2VXG4gKi9cbiAgcHVibGljIHJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aW1lU3RhbXA6IG51bWJlcikge1xuICAgIGxldCByZXE6IFJldHJpZXZlRm9vZERpYXJ5UmVxID0geyBkYXRlOiB0aW1lU3RhbXAgfTtcbiAgICByZXR1cm4gd2ViQVBJLlJldHJpZXZlRm9vZERpYXJ5KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnN0IGRhdGUgPSBtb21lbnQodGltZVN0YW1wKjEwMDApLmZvcm1hdCgnTU3mnIhEROaXpScpXG4gICAgICBjb25zdCByZXMgPSB7IC4uLnJlc3AsIGRhdGU6IGRhdGUsIGRhdGVUaW1lU3RhbXA6IHRpbWVTdGFtcH1cbiAgICAgIHJldHVybiByZXMgXG4gICAgfSkuY2F0Y2goZXJyID0+e1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBjb250ZW50OiAn6I635Y+W5pel5b+X5aSx6LSlJyxcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOaXpeaKpea7muWKqOWIsOW6lemDqFxuICAgKi9cbiAgcHVibGljIHNjcm9sbFRvTG93ZXIoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgc2hvd0xvYWRpbmc6IHRydWUsXG4gICAgICBkYXlDb251dGVyOiB0aGlzLmRhdGEuZGF5Q29udXRlcisxMFxuICAgIH0sKCk9PntcbiAgICAgIHRoaXMuZ2V0QmVmb3JlMTBEYXlUaW1lU3RhbXBBcnIoKVxuICAgIH0pXG4gICAgXG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5ZGo5oql5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgbG9hZFJlcG9ydERhdGEoKSB7XG4gICAgbGV0IGN1cnJlbnREYXRlID0gbW9tZW50KCk7XG4gICAgY3VycmVudERhdGUgPSBjdXJyZW50RGF0ZS5hZGQodGhpcy5kYXRhLmNvdW50TW9udGgsICdtb250aCcpO1xuICAgIGlmIChjdXJyZW50RGF0ZS5pc0FmdGVyKG1vbWVudCgpLCAnbW9udGgnKSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaXNQcmV2TW9udGhBbGxvd2VkOiB0cnVlLCBpc05leHRNb250aEFsbG93ZWQ6IGZhbHNlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VycmVudERhdGUuaXNTYW1lKG1vbWVudCgpLCAnbW9udGgnKSkge1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBpc1ByZXZNb250aEFsbG93ZWQ6IHRydWUsIGlzTmV4dE1vbnRoQWxsb3dlZDogZmFsc2UgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBpc1ByZXZNb250aEFsbG93ZWQ6IHRydWUsIGlzTmV4dE1vbnRoQWxsb3dlZDogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZmlyc3REYXlPZk1vbnRoID0gbW9tZW50KGN1cnJlbnREYXRlKS5zdGFydE9mKCdtb250aCcpLnVuaXgoKTtcbiAgICBsZXQgbGFzdERheU9mTW9udGggPSBtb21lbnQoY3VycmVudERhdGUpLmVuZE9mKCdtb250aCcpLnVuaXgoKTtcbiAgICBsZXQgcmVxID0ge1xuICAgICAgZGF0ZV9mcm9tOiBmaXJzdERheU9mTW9udGgsXG4gICAgICBkYXRlX3RvOiBsYXN0RGF5T2ZNb250aFxuICAgIH07XG4gICAgY29uc29sZS5sb2coZmlyc3REYXlPZk1vbnRoLCBsYXN0RGF5T2ZNb250aCk7XG4gICAgLy8gd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICB3ZWJBUEkuUmV0cmlldmVVc2VyUmVwb3J0cyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAvLyB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICB0aGlzLnBhcnNlUmVwb3J0RGF0YShjdXJyZW50RGF0ZSwgcmVzcCk7XG5cbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgeWVhcjogY3VycmVudERhdGUuZm9ybWF0KCdZWVlZJyksXG4gICAgICBtb250aDogY3VycmVudERhdGUuZm9ybWF0KCdNTScpLFxuICAgICAgZGF0ZTogY3VycmVudERhdGUuZm9ybWF0KCdERCcpLFxuICAgICAgd2VlazogY3VycmVudERhdGUud2VlaygpXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOeUqOaIt+eCueWHu+WQjizov5vlhaXml6XmiqVINemhtemdolxuICAgKi9cbiAgcHVibGljIGdvRGF5UmVwb3J0KGUpe1xuICAgIGNvbnN0IHRpbWVTdGFtcCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnRpbWVTdGFtcFxuICAgIHRoaXMucmV0cmlldmVEYWlseVJlcG9ydCh0aW1lU3RhbXApXG4gIH1cblxuICBwdWJsaWMgcmV0cmlldmVEYWlseVJlcG9ydChjdXJyZW50VGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSA9IHsgZGF0ZTogY3VycmVudFRpbWVTdGFtcCB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICBsZXQgcmVwb3J0VXJsOiBzdHJpbmcgPSByZXNwLnJlcG9ydF91cmw7XG4gICAgICBpZiAocmVwb3J0VXJsICYmIHJlcG9ydFVybCAhPSBcIlwiKSB7XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IFwiL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91cmw9XCIgKyByZXBvcnRVcmwgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwi6K+35re75Yqg5b2T5aSp6aOf54mp6K6w5b2VXCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSlcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZVJlcG9ydERhdGEoY3VycmVudERhdGU6IG1vbWVudCwgcmVzcDogYW55KSB7XG4gICAgY29uc29sZS5sb2coY3VycmVudERhdGUpO1xuICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgIGxldCByZXBvcnRSZXNwOiBXZWVrbHlSZXBvcnRDYXJkW10gPSByZXNwLndlZWtseV9yZXBvcnQ7XG4gICAgbGV0IHdlZWtseVJlcG9ydDogUmVwb3J0W10gPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXBvcnRSZXNwKSB7XG4gICAgICBsZXQgcmVwb3J0OiBXZWVrbHlSZXBvcnRDYXJkID0gcmVwb3J0UmVzcFtpbmRleF07XG4gICAgICBsZXQgZmlyc3REYXlPZldlZWs6IHN0cmluZyA9IG1vbWVudC51bml4KHJlcG9ydC5kYXRlX2Zyb20pLmZvcm1hdCgnREQnKTtcbiAgICAgIGxldCBsYXN0RGF5T2ZXZWVrOiBzdHJpbmcgPSBtb21lbnQudW5peChyZXBvcnQuZGF0ZV90bykuZm9ybWF0KCdERCcpO1xuICAgICAgbGV0IHdlZWtseV9yZXBvcnQ6IFJlcG9ydCA9IHtcbiAgICAgICAgZGF0ZTogcmVwb3J0LmRhdGUsXG4gICAgICAgIGlzX3JlYWQ6IHJlcG9ydC5pc19yZWFkLFxuICAgICAgICByZXBvcnRfdXJsOiByZXBvcnQucmVwb3J0X3VybCxcbiAgICAgICAgZmlyc3RfZGF5OiBmaXJzdERheU9mV2VlayxcbiAgICAgICAgbGFzdF9kYXk6IGxhc3REYXlPZldlZWssXG4gICAgICAgIGlzX3NhbXBsZTogZmFsc2VcbiAgICAgIH1cbiAgICAgIHdlZWtseVJlcG9ydC5wdXNoKHdlZWtseV9yZXBvcnQpXG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnREYXRlLmlzU2FtZShtb21lbnQoKSwgJ21vbnRoJykgJiYgcmVwb3J0UmVzcC5sZW5ndGggPT0gMCkge1xuICAgICAgbGV0IGZpcnN0RGF5T2ZXZWVrOiBzdHJpbmcgPSBjdXJyZW50RGF0ZS53ZWVrKGN1cnJlbnREYXRlLndlZWsoKSkuZGF5KDEpLmZvcm1hdCgnREQnKTtcbiAgICAgIGxldCBsYXN0RGF5T2ZXZWVrOiBzdHJpbmcgPSBjdXJyZW50RGF0ZS53ZWVrKGN1cnJlbnREYXRlLndlZWsoKSkuZGF5KDcpLmZvcm1hdCgnREQnKTtcbiAgICAgIGxldCB3ZWVrbHlfcmVwb3J0OiBSZXBvcnQgPSB7XG4gICAgICAgIGRhdGU6IGN1cnJlbnREYXRlLnVuaXgoKSxcbiAgICAgICAgZmlyc3RfZGF5OiBmaXJzdERheU9mV2VlayxcbiAgICAgICAgbGFzdF9kYXk6IGxhc3REYXlPZldlZWssXG4gICAgICAgIHJlcG9ydF91cmw6IFwiaHR0cHM6Ly9yZXBvcnQuaWNtb3RvLmNuL3VzZXJ3ZWVrbHlyZXBvcnQvNTg0XCIsXG4gICAgICAgIGlzX3JlYWQ6IGZhbHNlLFxuICAgICAgICBpc19zYW1wbGU6IHRydWUsXG4gICAgICB9XG4gICAgICB3ZWVrbHlSZXBvcnQucHVzaCh3ZWVrbHlfcmVwb3J0KVxuICAgIH1cblxuXG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgd2Vla2x5UmVwb3J0QXJyOiB3ZWVrbHlSZXBvcnQsXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEud2Vla2x5UmVwb3J0QXJyKVxuICB9XG5cbiAgcHVibGljIGNvdW50UmVwb3J0QmFkZ2UocmVzcDogYW55KSB7XG4gICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgbGV0IHJlcG9ydE51bSA9IDA7XG4gICAgbGV0IHJlcG9ydHMgPSByZXNwLmRhaWx5X3JlcG9ydDtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXBvcnRzKSB7XG4gICAgICBsZXQgcmVwb3J0ID0gcmVwb3J0c1tpbmRleF07XG4gICAgICBpZiAoIXJlcG9ydC5pc19yZXBvcnRfZ2VuZXJhdGVkICYmICFyZXBvcnQuaXNfZm9vZF9sb2dfZW1wdHkpIHtcbiAgICAgICAgbGV0IHRvZGF5VGltZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLnVuaXgoKTtcbiAgICAgICAgY29uc29sZS5sb2codG9kYXlUaW1lKTtcbiAgICAgICAgaWYgKHJlcG9ydC5kYXRlIDwgdG9kYXlUaW1lIHx8IChyZXBvcnQuZGF0ZSA9PSB0b2RheVRpbWUgJiYgbW9tZW50KG5ldyBEYXRlKCkpLmhvdXJzID4gMjIpKSB7IFxuICAgICAgICAgIHJlcG9ydE51bSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvcnROdW0gIT0gMCkge1xuICAgICAgd3guc2V0VGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMixcbiAgICAgICAgdGV4dDogU3RyaW5nKHJlcG9ydE51bSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3eC5yZW1vdmVUYWJCYXJCYWRnZSh7XG4gICAgICAgIGluZGV4OiAyXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbmV4dE1vbnRoKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudE1vbnRoOiB0aGlzLmRhdGEuY291bnRNb250aCArIDEgfSk7XG4gICAgdGhpcy5sb2FkUmVwb3J0RGF0YSgpO1xuICB9XG5cbiAgcHVibGljIHByZXZNb250aCgpOnZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGNvdW50TW9udGg6dGhpcy5kYXRhLmNvdW50TW9udGggLSAxIH0pO1xuICAgIHRoaXMubG9hZFJlcG9ydERhdGEoKTtcbiAgfVxuXG4gIHB1YmxpYyBvbldlZWtseVJlcG9ydENsaWNrKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgcmVwb3J0SW5kZXg6IG51bWJlciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5yZXBvcnRJbmRleDtcbiAgICBsZXQgcmVwb3J0OiBSZXBvcnQgPSB0aGlzLmRhdGEud2Vla2x5UmVwb3J0QXJyW3JlcG9ydEluZGV4XTtcbiAgICBsZXQgcmVwb3J0VXJsOiBzdHJpbmcgPSByZXBvcnQucmVwb3J0X3VybDtcbiAgICBpZiAocmVwb3J0VXJsKSB7XG4gICAgICBpZiAocmVwb3J0LmlzX3NhbXBsZSkge1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICBjb250ZW50OiAn6L+Z5piv5LiA5Liq5qC35L6L5oql5ZGKJyxcbiAgICAgICAgICBjYW5jZWxUZXh0OiAn5Y+W5raIJyxcbiAgICAgICAgICBjb25maXJtVGV4dDogXCLmn6XnnItcIixcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmNvbmZpcm0pIHtcbiAgICAgICAgICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogXCIvcGFnZXMvcmVwb3J0UGFnZS9yZXBvcnRQYWdlP3VybD1cIiArIHJlcG9ydFVybCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IFwiL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91cmw9XCIgKyByZXBvcnRVcmwgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblBhZ2UobmV3IFJlcG9ydFBhZ2UoKSk7XG4iXX0=