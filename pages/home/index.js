"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var globalEnum = require("../../api/GlobalEnum");
var webAPI = require("../../api/app/AppService");
var loginAPI = require("../../api/login/LoginService");
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
        height: height,
        animate: true,
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
var HomePage = (function () {
    function HomePage() {
        this.userInfo = {};
        this.data = {
            average_energy: 1104,
            target_energy: 1205,
            cardList: [
                { card_title: "体重", card_weight_value: 0.0, card_desc: "公斤", card_bar_color: "#ff822d", card_redirect_path: "/pages/weightRecord/index" },
                { card_title: "营养推荐值", card_desc: "营养平衡", card_bar_color: "#ffb400", card_redirect_path: "/pages/rdiPage/rdiPage" },
                { card_title: "营养知识", card_desc: "知食营养师组", card_bar_color: "#ff5c47", card_redirect_path: "/pages/nutritionalDatabasePage/index" }
            ],
            activityCardList: [],
            opts: {
                onInit: initChart
            },
            quesTitle: "",
            currentSurveyId: 0,
            isAnswerPositive: true,
            showFeedbackDlg: false,
            questionText: "",
            showQuesDlg: false,
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
        };
    }
    HomePage.prototype.login = function () {
        var that = this;
        wx.login({
            success: function (_res) {
                console.log(_res);
                wx.showLoading({ title: '加载中...' });
                var req = { jscode: _res.code };
                loginAPI.MiniProgramLogin(req).then(function (resp) {
                    console.log(resp);
                    wx.hideLoading({});
                    var userStatus = resp.user_status;
                    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                    switch (userStatus) {
                        case 1:
                            wx.reLaunch({ url: '/pages/login/index' });
                            break;
                        case 2:
                            if (resp.token) {
                                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                                wx.reLaunch({ url: '/pages/onBoard/onBoard' });
                            }
                            break;
                        case 3:
                            if (resp.token) {
                                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                                that.authenticationRequest();
                                that.initHomePageInfo();
                                that.initHomePageCard();
                            }
                            break;
                    }
                }).catch(function (err) {
                    wx.hideLoading({});
                    console.log(err);
                    wx.showModal({
                        title: '',
                        content: '首页登陆失败',
                        showCancel: false
                    });
                });
            },
            fail: function (err) {
                wx.showModal({
                    title: '',
                    content: '首页登陆验证失败',
                    showCancel: false
                });
            }
        });
    };
    HomePage.prototype.authenticationRequest = function () {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            console.log('get getUserInfo' + res.userInfo);
                            app.globalData.userInfo = res.userInfo;
                            that.userInfo = res.userInfo;
                        },
                        fail: function (err) {
                            console.log(err);
                        }
                    });
                }
                else {
                    wx.navigateTo({
                        url: '../invitation/invitation?user_status=3'
                    });
                }
            }
        });
    };
    HomePage.prototype.loadReportBadge = function () {
        var _this = this;
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        if (token) {
            var currentDate = moment().startOf('day');
            console.log("home:" + currentDate.unix());
            var firstDayOfWeek = currentDate.week(currentDate.week()).day(1).unix();
            var lastDayOfWeek = currentDate.week(currentDate.week()).day(7).unix();
            var req = {
                date_from: firstDayOfWeek,
                date_to: lastDayOfWeek
            };
            console.log(req);
            webAPI.RetrieveUserReports(req).then(function (resp) {
                wx.hideLoading({});
                _this.countReportBadge(resp);
            }).catch(function (err) { return console.log(err); });
        }
    };
    HomePage.prototype.countReportBadge = function (resp) {
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
    HomePage.prototype.onShow = function () {
        this.login();
        var that = this;
        setTimeout(function () {
            that.getProfileData();
        }, 2000);
    };
    HomePage.prototype.getProfileData = function () {
        var _this = this;
        var req = {};
        var that = this;
        webAPI.RetrieveUserProfile(req).then(function (resp) {
            console.log("Retrieving user profile...");
            console.log(resp);
            var keys = Object.keys(resp);
            var errorChecking = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (resp[key] === -1 || resp[key] === '') {
                    errorChecking[i] = true;
                }
                else {
                    errorChecking[i] = false;
                }
                that.setData({
                    errorChecking: errorChecking
                });
            }
            console.log("get data", _this.data);
            var tempDate;
            if (resp.expected_birth_date == -1) {
                tempDate = moment();
            }
            else {
                tempDate = moment.unix(resp.expected_birth_date);
            }
            that.setData({
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
            that.updateProfile();
        }).catch(function (err) { });
    };
    HomePage.prototype.updateProfile = function () {
        webAPI.UpdateUserProfile(this.generateProfileReqBody()).then(function (resp) {
        }).catch(function (err) { });
    };
    HomePage.prototype.generateProfileReqBody = function () {
        var pregDateTimestamp = moment(this.data.pregnancyDate.date).unix();
        var reqBody = {
            gender: this.data.genderIndex,
            year_of_birth: this.data.birthday,
            height: this.data.height,
            weight: this.data.currentWeight,
            weight_before_pregnancy: this.data.weightBeforePreg,
            activity_level: this.data.activityLevelIndex + 1,
            pregnancy_stage: this.data.pregnancyStatusIndex,
            expected_birth_date: pregDateTimestamp,
            nickname: this.userInfo.nickName,
            avatar_url: this.userInfo.avatarUrl,
            external_id: this.data.externalId,
        };
        console.log("Request body generated.");
        console.log(reqBody);
        return reqBody;
    };
    HomePage.prototype.initHomePageInfo = function () {
        var _this = this;
        var currentFormattedDate = Date.parse(String(new Date())) / 1000;
        var req = { date: currentFormattedDate };
        webAPI.RetrieveHomePageInfo(req).then(function (resp) {
            _this.parseHomePageChartData(resp);
        }).catch(function (err) { return console.log(err); });
    };
    HomePage.prototype.initHomePageCard = function () {
        var _this = this;
        var req = {};
        webAPI.RetrieveCardList(req).then(function (resp) {
            _this.parseHomePageCardData(resp);
        }).catch(function (err) { return console.log(err); });
    };
    HomePage.prototype.parseHomePageChartData = function (resp) {
        var _a;
        console.log(resp);
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
    };
    HomePage.prototype.parseHomePageCardData = function (resp) {
        console.log(resp);
        var cardInfo = [];
        for (var index in resp.card_list) {
            var card = resp.card_list[index];
            var entity = {
                cardId: card.card_id,
                title: card.title,
                description: card.description,
                cardType: card.card_type,
                iconLink: card.icon_link,
                contentLink: card.content_link,
                isChecked: card.is_checked
            };
            cardInfo.push(entity);
        }
        this.setData({
            activityCardList: cardInfo
        });
    };
    HomePage.prototype.redirectToPage = function (event) {
        var redirectPath = event.currentTarget.dataset.redirectPath;
        if (redirectPath === "/pages/rdiPage/rdiPage") {
            webAPI.RetrieveUserRDA({}).then(function (resp) {
                var rdaUrl = resp.rda_url;
                wx.navigateTo({ url: '../../pages/rdiPage/rdiPage?url=' + rdaUrl });
            }).catch(function (err) {
                console.log(err);
                wx.showModal({
                    title: '',
                    content: '获取推荐值失败',
                    showCancel: false
                });
            });
        }
        else {
            wx.navigateTo({ url: redirectPath });
        }
    };
    HomePage.prototype.redirectFromFeed = function (event) {
        var _this = this;
        var myThis = this;
        var cardId = event.currentTarget.dataset.cardId;
        console.log(cardId);
        var cardLink = event.currentTarget.dataset.cardLink;
        var cardIndex = event.currentTarget.dataset.cardIndex;
        var cardDesc = event.currentTarget.dataset.cardDesc;
        var cardList = this.data.activityCardList;
        switch (cardId) {
            default:
                var req = { event_type: "click_card", event_value: cardId.toString() };
                webAPI.CreateUserEvent(req).then(function (resp) {
                    cardList[cardIndex].isChecked = true;
                    myThis.setData({
                        activityCardList: cardList
                    });
                    wx.switchTab({
                        url: "/pages/foodDiary/index"
                    });
                }).catch(function (err) { return console.log(err); });
                break;
            case 1:
                var req = { event_type: "click_card", event_value: cardId.toString() };
                webAPI.CreateUserEvent(req).then(function (resp) {
                    cardList[cardIndex].isChecked = true;
                    myThis.setData({
                        activityCardList: cardList
                    });
                    wx.navigateTo({
                        url: "/pages/nutritionalDatabasePage/articlePage?url=" + cardLink
                    });
                }).catch(function (err) { return console.log(err); });
                break;
            case 2:
                wx.showModal({
                    title: '',
                    content: '今日运动',
                    confirmText: "已完成",
                    cancelText: "未完成",
                    success: function (res) {
                        if (res.confirm) {
                            var req_1 = { event_type: "click_card", event_value: cardId.toString() };
                            webAPI.CreateUserEvent(req_1).then(function (resp) {
                                cardList[cardIndex].isChecked = true;
                                myThis.setData({
                                    activityCardList: cardList
                                });
                            }).catch(function (err) { return console.log(err); });
                        }
                    }
                });
                break;
            case 6:
                var req = { event_type: "click_card", event_value: cardId.toString() };
                webAPI.CreateUserEvent(req).then(function (resp) {
                    cardList[cardIndex].isChecked = true;
                    _this.setData({
                        activityCardList: cardList
                    });
                    wx.navigateTo({
                        url: "/pages/weightRecord/index"
                    });
                }).catch(function (err) { return console.log(err); });
                break;
        }
    };
    return HomePage;
}());
Page(new HomePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBRTVCLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFDbkQsdURBQXlEO0FBQ3pELCtCQUFpQztBQWFqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsU0FBUyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUMxQyxJQUFNLElBQUksR0FBRztRQUNYLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7S0FDdkMsQ0FBQztJQUNGLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDbkIsRUFBRSxFQUFFLE1BQU07UUFDVixLQUFLLE9BQUE7UUFDTCxNQUFNLFFBQUE7UUFDTixPQUFPLEVB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ZUFBQztBQUFELENBQUMsQUFoZUQsSUFnZUM7QUFFRCxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU15QXBwIH0gZnJvbSAnLi4vLi4vYXBwJ1xuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuLy8gaW1wb3J0ICogYXMgd3hDaGFydHMgZnJvbSAnL3V0aWxzL3d4Y2hhcnRzJztcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuLyoqXG4gKiDkuIvpnaLov5nkuIDooYznmoTlvJXlhaXmmK/kuLrkuobmm7TmlrDmlbDmja7lupPnmoTmmLXnp7DlpLTlg4/vvIzlj5HluIPlkI7kuIDmrrXml7bpl7Tlj6/liKDpmaRcbiAqL1xuaW1wb3J0IHsgVXBkYXRlVXNlclByb2ZpbGVSZXEgfSBmcm9tIFwiLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiO1xuaW1wb3J0IHsgUmV0cmlldmVIb21lUGFnZUluZm9SZXEsIFJldHJpZXZlQ2FyZExpc3RSZXNwLCBDYXJkSW5mbyB9IGZyb20gXCIvYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiO1xuLy8gdmFyIHdlYkFQSSA9IHJlcXVpcmUoJy4vYXBpL2xvZ2luL0xvZ2luU2VydmljZScpO1xuXG4vL2NhcmRUeXBlICAxOm1lYWwgMjphcnRpY2xlIDM6cmVwb3J0LWRhaWx5IDQ6cmVwb3J0LXdlZWtseSAgNTpmZWVkYmFjayAgNjpyZW1pbmRlciA3OmV2ZW50XG4gXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5sZXQgY2hhcnQgPSBudWxsOyAvLyDkvb/nlKjliY1jc3PkuK3opoHphY3nva7nu4Tku7bnmoTlrr3pq5hcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7XG4gIGNvbnN0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBhbmltYXRlOiB0cnVlLFxuICB9KTtcblxuICAvLyBjaGFydC5zb3VyY2UoZGF0YSwge1xuICAvLyAgIHZhbHVlOiB7XG4gIC8vICAgICBtaW46IDAsXG4gIC8vICAgICBtYXg6IDMwMDAsXG4gIC8vICAgICB0aWNrSW50ZXJ2YWw6IDEwLFxuICAvLyAgICAgbmljZTogZmFsc2VcbiAgLy8gICB9LFxuICAvLyAgIGF2Zzoge1xuICAvLyAgICAgbWluOiAwLFxuICAvLyAgICAgbWF4OiAzMDAwLFxuICAvLyAgICAgdGlja0ludGVydmFsOiAxMCxcbiAgLy8gICAgIG5pY2U6IGZhbHNlXG4gIC8vICAgfVxuICAvLyB9KTtcbiAgXG4gIGNoYXJ0LmF4aXMoJ3dlZWsnLCB7ICAvL+WvuXdlZWvlr7nlupTnmoTnurXmqKrlnZDmoIfovbTov5vooYzphY3nva5cbiAgICBncmlkOiBudWxsICAvL+e9keagvOe6v1xuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lIHbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBcIueDremHj1wiO1xuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQuaW50ZXJ2YWwoKS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKTsgLy8g5p+x54q25Zu+5a69KumrmO+8jOWhq+WFheeahOminOiJslxuICAvLyBjaGFydC5saW5lKCkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcignI2Y0ZjRmNCcpLnNoYXBlKCdzbW9vdGgnKTtcbiAgLy8gY2hhcnQucG9pbnQoKS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLnN0eWxlKHtcbiAgLy8gICBzdHJva2U6ICdyZWQnLFxuICAvLyAgIGZpbGw6ICcjMzY5JyxcbiAgLy8gICBsaW5lV2lkdGg6IDJcbiAgLy8gfSk7XG4gIGxldCB0YXJnZXRMaW5lID0gMDtcbiAgLy8g57uY5Yi26L6F5Yqp57q/XG4gIGNoYXJ0Lmd1aWRlKCkubGluZSh7XG4gICAgc3RhcnQ6IFsn5ZGo5pelJywgdGFyZ2V0TGluZV0sXG4gICAgZW5kOiBbJ+WRqOWFrScsIHRhcmdldExpbmVdLFxuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZDBkMGQwJywgLy8g57q/55qE6aKc6ImyXG4gICAgICBsaW5lRGFzaDogWzAsIDIsIDJdLCAvLyDomZrnur/nmoTorr7nva5cbiAgICAgIGxpbmVXaWR0aDogMSAvLyDnur/nmoTlrr3luqZcbiAgICB9IC8vIOWbvuW9ouagt+W8j+mFjee9rlxuICB9KTtcbiAgY2hhcnQuZ3VpZGUoKS50ZXh0KHtcbiAgICBwb3NpdGlvbjogWyflkajml6UnLCAnbWF4J10sXG4gICAgLy8gcG9zaXRpb24oeFNjYWxlLCB5U2NhbGVzKSB7XG4gICAgLy8gICBsZXQgc3VtID0gMDtcbiAgICAvLyAgIGNvbnN0IHlTY2FsZSA9IHlTY2FsZXNbMV07XG4gICAgLy8gICB5U2NhbGUudmFsdWVzLmZvckVhY2godiA9PiAoc3VtICs9IHYpKTtcbiAgICAvLyAgIHJldHVybiBbJ21heCcsIHN1bSAvIHlTY2FsZS52YWx1ZXMubGVuZ3RoXTsgXG4gICAgLy8gfSxcbiAgICBjb250ZW50OiAnJyxcbiAgICBzdHlsZToge1xuICAgICAgdGV4dEFsaWduOiAnc3RhcnQnLFxuICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgIGZpbGw6ICcjNWVkNDcwJ1xuICAgIH0sXG4gICAgb2Zmc2V0WDogLTI1LFxuICAgIG9mZnNldFk6IDE1XG4gIH0pO1xuXG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cbn1cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKmVuZCBvZiBmMiBjaGFydCBpbml0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuY2xhc3MgSG9tZVBhZ2Uge1xuICBwdWJsaWMgYmFydENoYXJ0OiBhbnk7XG4gIHB1YmxpYyB1c2VySW5mbzphbnkgPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBhdmVyYWdlX2VuZXJneTogMTEwNCxcbiAgICB0YXJnZXRfZW5lcmd5OiAxMjA1LFxuICAgIGNhcmRMaXN0OiBbXG4gICAgICB7IGNhcmRfdGl0bGU6IFwi5L2T6YeNXCIsIGNhcmRfd2VpZ2h0X3ZhbHVlOiAwLjAsIGNhcmRfZGVzYzogXCLlhazmlqRcIiwgY2FyZF9iYXJfY29sb3I6IFwiI2ZmODIyZFwiLCBjYXJkX3JlZGlyZWN0X3BhdGg6IFwiL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleFwiIH0sXG4gICAgICB7IGNhcmRfdGl0bGU6IFwi6JCl5YW75o6o6I2Q5YC8XCIsIGNhcmRfZGVzYzogXCLokKXlhbvlubPooaFcIiwgY2FyZF9iYXJfY29sb3I6IFwiI2ZmYjQwMFwiLCBjYXJkX3JlZGlyZWN0X3BhdGg6IFwiL3BhZ2VzL3JkaVBhZ2UvcmRpUGFnZVwiIH0sXG4gICAgICB7IGNhcmRfdGl0bGU6IFwi6JCl5YW755+l6K+GXCIsIGNhcmRfZGVzYzogXCLnn6Xpo5/okKXlhbvluIjnu4RcIiwgY2FyZF9iYXJfY29sb3I6IFwiI2ZmNWM0N1wiLCBjYXJkX3JlZGlyZWN0X3BhdGg6IFwiL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2luZGV4XCIgfVxuICAgIF0sXG4gICAgYWN0aXZpdHlDYXJkTGlzdDogW1xuICAgICAgLy8geyBpZDogMCwgbmFtZTogXCIxMOenjeeXh+eKtuW4puS9oOS6huino+S7gOS5iOaYr+eimOe8uuS5j++8gVwiLCBkZXNjcmlwdGlvbjogXCI1MTLljYPljaFcIiwgaW1hZ2U6IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvYXJ0aWNsZS9pb2RpbmUucG5nXCIsIGxpbms6IFwiaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvbUlpeWY5TjV1WC02RVpTdFdQcm81Z1wiLCB0aW1lOiBcIjE0OjExXCIsIGNhcmRUeXBlOiAyLCBjaGVja2VkOiBmYWxzZSB9LFxuICAgICAgLy8geyBpZDogMSwgbmFtZTogXCLov5DliqjmiZPljaFcIiwgZGVzY3JpcHRpb246IFwi5LuK5pelXCIsIGltYWdlOiBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2ZlZWQvZGFpbHlfcmVwb3J0LnBuZ1wiLCBsaW5rOiBcIlwiLCB0aW1lOiBcIjA5OjExXCIsIGNhcmRUeXBlOiAzLCBjaGVja2VkOiBmYWxzZSB9LFxuICAgICAgLy8geyBpZDogMiwgbmFtZTogXCLml6nppJDmiZPljaFcIiwgZGVzY3JpcHRpb246IFwi5LuK5pelXCIsIGltYWdlOiBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2ZlZWQvbWVhbF9icmVha2Zhc3QucG5nXCIsIGxpbms6IFwiXCIsIHRpbWU6IFwiMDk6MTFcIiwgY2FyZFR5cGU6IDEsIGNoZWNrZWQ6IGZhbHNlIH0sXG4gICAgICAvLyB7IGlkOiAzLCBuYW1lOiBcIuWNiOmkkOaJk+WNoVwiLCBkZXNjcmlwdGlvbjogXCLku4rml6VcIiwgaW1hZ2U6IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvZmVlZC9tZWFsX2x1bmNoLnBuZ1wiLCBsaW5rOiBcIlwiLCB0aW1lOiBcIjE0OjExXCIsIGNhcmRUeXBlOiAxLCBjaGVja2VkOiBmYWxzZSB9LFxuICAgICAgLy8geyBpZDogNCwgbmFtZTogXCLmmZrppJDmiZPljaFcIiwgZGVzY3JpcHRpb246IFwi5LuK5pelXCIsIGltYWdlOiBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2ZlZWQvbWVhbF9kaW5uZXIucG5nXCIsIGxpbms6IFwiXCIsIHRpbWU6IFwiMDk6MTFcIiwgY2FyZFR5cGU6IDEsIGNoZWNrZWQ6IGZhbHNlIH0sXG4gICAgICAvLyB7IGlkOiA1LCBuYW1lOiBcIuS9k+mHjeaJk+WNoVwiLCBkZXNjcmlwdGlvbjogXCLku4rml6VcIiwgaW1hZ2U6IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvZmVlZC93ZWlnaHQucG5nXCIsIGxpbms6IFwiXCIsIHRpbWU6IFwiMTk6MTFcIiwgY2FyZFR5cGU6IDYsIGNoZWNrZWQ6IGZhbHNlIH1cbiAgICBdLFxuICAgIG9wdHM6IHtcbiAgICAgIG9uSW5pdDogaW5pdENoYXJ0XG4gICAgfSxcbiAgICBxdWVzVGl0bGU6IFwiXCIsXG4gICAgY3VycmVudFN1cnZleUlkOiAwLFxuICAgIGlzQW5zd2VyUG9zaXRpdmU6IHRydWUsXG4gICAgc2hvd0ZlZWRiYWNrRGxnOiBmYWxzZSxcbiAgICBxdWVzdGlvblRleHQ6IFwiXCIsXG4gICAgc2hvd1F1ZXNEbGc6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIOS4i+mdouaYr+S4uuS6huiHquWKqOabtOaWsOaVsOaNruW6k+WktOWDj+aYteensOS4ouWkseeahOmXrumimO+8jOWPkeW4g+S4gOauteaXtumXtOWQjuWPr+WIoOmZpOS7o+eggVxuICAgICAqL1xuICAgIGJpcnRoZGF5OiAyMDAwLFxuICAgIGFnZUdyb3VwSW5kZXg6IDMsXG4gICAgYWdlR3JvdXA6IFsnNuS4quaciOS7peS4iycsICc25Liq5pyILTHlsoEnLCAnMS0z5bKBJywgJzMtNOWygScsICc0LTflsoEnLCAnNy0xMOWygScsICcxMC0xMeWygScsICcxMS0xNOWygScsICcxNC0xOOWygScsICcxOC0zMOWygScsICczMC01MOWygScsICc1MC02MOWygScsICc2MC02NeWygScsICc2NS04MOWygScsICc4MOWygeS7peS4iiddLFxuICAgIGdlbmRlckluZGV4OiAxLFxuICAgIGdlbmRlckFycmF5OiBbJycsICfnlLcnLCAn5aWzJ10sXG4gICAgaGVpZ2h0OiAxNzAsXG4gICAgY3VycmVudFdlaWdodDogNTAsXG4gICAgd2VpZ2h0QmVmb3JlUHJlZzogNjAsXG4gICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IDEsXG4gICAgcHJlZ25hbmN5U3RhdHVzQXJyYXk6IFsn6YO95LiN5pivJywgJ+Wkh+WtlScsICflt7LlrZUnLCAn5ZO65Lmz5pyfJ10sXG4gICAgYWN0aXZpdHlMZXZlbEluZGV4OiAxLFxuICAgIGFjdGl2aXR5TGV2ZWxBcnJheTogWyfljafluorkvJHmga8nLCAn6L275bqmLOmdmeWdkOWwkeWKqCcsICfkuK3luqYs5bi45bi456uZ56uL6LWw5YqoJywgJ+mHjeW6pizotJ/ph40nLCAn5Ymn54OI77yM6LaF6LSf6YeNJ10sXG4gICAgcHJlZ25hbmN5RGF0ZToge1xuICAgICAgZGF0ZTogbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbiAgICAgIHllYXI6IG1vbWVudCgpLmZvcm1hdChcIllZWVlcIiksXG4gICAgICBtb250aDogbW9tZW50KCkuZm9ybWF0KFwiTU1cIiksXG4gICAgICBkYXk6IG1vbWVudCgpLmZvcm1hdChcIkREXCIpXG4gICAgfSxcbiAgfVxuXG4gIHB1YmxpYyBsb2dpbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgLy8g55m75b2VXG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKF9yZXMpO1xuICAgICAgICAvLyDlj5HpgIEgX3Jlcy5jb2RlIOWIsOWQjuWPsOaNouWPliBvcGVuSWQsIHNlc3Npb25LZXksIHVuaW9uSWRcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogJ+WKoOi9veS4rS4uLicgfSk7XG4gICAgICAgIHZhciByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlIH07XG4gICAgICAgIGxvZ2luQVBJLk1pbmlQcm9ncmFtTG9naW4ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgIC8vIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICBzd2l0Y2ggKHVzZXJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgLy92YWxpZGF0aW9uIHBhZ2VcbiAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgLy9vbkJvYXJkaW5nIHByb2Nlc3MgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvb25Cb2FyZC9vbkJvYXJkJyB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgLy9rZWVwIGl0IGF0IGhvbWUgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmluaXRIb21lUGFnZUluZm8oKTtcbiAgICAgICAgICAgICAgICB0aGF0LmluaXRIb21lUGFnZUNhcmQoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyKSB7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYbpqozor4HlpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBhdXRoZW50aWNhdGlvblJlcXVlc3QoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXQgZ2V0VXNlckluZm8nICsgcmVzLnVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgLyoqXG4gICAgICog5LiL6Z2i5LiA6KGM5piv5Li65LqG6Ieq5Yqo5pu05paw5pWw5o2u5bqT5aS05YOP5pi156ew5Lii5aSx55qE6Zeu6aKY77yM5Y+R5biD5LiA5q615pe26Ze05ZCO5Y+v5Yig6Zmk5Luj56CBXG4gICAgICovIFxuICAgICAgICAgICAgICB0aGF0LnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6ICcuLi9pbnZpdGF0aW9uL2ludml0YXRpb24/dXNlcl9zdGF0dXM9MydcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICB9XG5cbiAgcHVibGljIGxvYWRSZXBvcnRCYWRnZSgpIHtcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICBsZXQgY3VycmVudERhdGUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiaG9tZTpcIiArIGN1cnJlbnREYXRlLnVuaXgoKSk7XG4gICAgICBsZXQgZmlyc3REYXlPZldlZWsgPSBjdXJyZW50RGF0ZS53ZWVrKGN1cnJlbnREYXRlLndlZWsoKSkuZGF5KDEpLnVuaXgoKTtcbiAgICAgIGxldCBsYXN0RGF5T2ZXZWVrID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSg3KS51bml4KCk7XG4gICAgICBsZXQgcmVxID0ge1xuICAgICAgICBkYXRlX2Zyb206IGZpcnN0RGF5T2ZXZWVrLFxuICAgICAgICBkYXRlX3RvOiBsYXN0RGF5T2ZXZWVrXG4gICAgICB9O1xuICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJSZXBvcnRzKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICB0aGlzLmNvdW50UmVwb3J0QmFkZ2UocmVzcCk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNvdW50UmVwb3J0QmFkZ2UocmVzcDogYW55KSB7XG4gICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgbGV0IHJlcG9ydE51bSA9IDA7XG4gICAgbGV0IHJlcG9ydHMgPSByZXNwLmRhaWx5X3JlcG9ydDtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXBvcnRzKSB7XG4gICAgICBsZXQgcmVwb3J0ID0gcmVwb3J0c1tpbmRleF07XG4gICAgICBpZiAoIXJlcG9ydC5pc19yZXBvcnRfZ2VuZXJhdGVkICYmICFyZXBvcnQuaXNfZm9vZF9sb2dfZW1wdHkpIHtcbiAgICAgICAgbGV0IHRvZGF5VGltZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLnVuaXgoKTtcbiAgICAgICAgY29uc29sZS5sb2codG9kYXlUaW1lKTtcbiAgICAgICAgaWYgKHJlcG9ydC5kYXRlIDwgdG9kYXlUaW1lIHx8IChyZXBvcnQuZGF0ZSA9PSB0b2RheVRpbWUgJiYgbW9tZW50KG5ldyBEYXRlKCkpLmhvdXJzID4gMjIpKSB7ICAgLy9jb3VudCB0b2RheSByZXBvcnRzIHN0YXR1cyBhZnRlciAxOVxuICAgICAgICAgIHJlcG9ydE51bSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvcnROdW0gIT0gMCkge1xuICAgICAgd3guc2V0VGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMixcbiAgICAgICAgdGV4dDogU3RyaW5nKHJlcG9ydE51bSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3eC5yZW1vdmVUYWJCYXJCYWRnZSh7XG4gICAgICAgIGluZGV4OiAyXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25TaG93KCkge1xuICAgIHRoaXMubG9naW4oKTtcbiAgICAvKipcbiAgICAgKiDkuIvpnaLmmK/kuLrkuoboh6rliqjmm7TmlrDmlbDmja7lupPlpLTlg4/mmLXnp7DkuKLlpLHnmoTpl67popjvvIzlj5HluIPkuIDmrrXml7bpl7TlkI7lj6/liKDpmaTku6PnoIFcbiAgICAgKi9cbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIHRoYXQuZ2V0UHJvZmlsZURhdGEoKTtcbiAgICB9LDIwMDApXG4gIH1cbiAgIC8qKlxuICAgKiDkuIvpnaLnmoTmlrnms5XmmK/kuLrkuoboh6rliqjmm7TmlrDmlbDmja7lupPlpLTlg4/mmLXnp7DkuKLlpLHnmoTpl67popjvvIzlj5HluIPkuIDmrrXml7bpl7TlkI7lj6/liKDpmaTku6PnoIFcbiAgICovXG4gIHB1YmxpYyBnZXRQcm9maWxlRGF0YSgpIHtcbiAgICB2YXIgcmVxID0ge307XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJQcm9maWxlKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUmV0cmlldmluZyB1c2VyIHByb2ZpbGUuLi5cIik7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMocmVzcCk7XG4gICAgICBsZXQgZXJyb3JDaGVja2luZyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlzW2ldXG4gICAgICAgIGlmIChyZXNwW2tleV0gPT09IC0xIHx8IHJlc3Bba2V5XSA9PT0gJycpIHtcbiAgICAgICAgICBlcnJvckNoZWNraW5nW2ldID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVycm9yQ2hlY2tpbmdbaV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGVycm9yQ2hlY2tpbmc6IGVycm9yQ2hlY2tpbmdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcImdldCBkYXRhXCIsIHRoaXMuZGF0YSk7XG5cbiAgICAgIC8vIHBhcnNlIHByZWduYW5jeURhdGUgdGltZXN0YW1wXG4gICAgICBsZXQgdGVtcERhdGU6IG1vbWVudDtcbiAgICAgIGlmIChyZXNwLmV4cGVjdGVkX2JpcnRoX2RhdGUgPT0gLTEpIHtcbiAgICAgICAgdGVtcERhdGUgPSBtb21lbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRlbXBEYXRlID0gbW9tZW50LnVuaXgocmVzcC5leHBlY3RlZF9iaXJ0aF9kYXRlKTtcbiAgICAgIH1cbiAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGdlbmRlckluZGV4OiByZXNwLmdlbmRlcixcbiAgICAgICAgYmlydGhkYXk6IHJlc3AueWVhcl9vZl9iaXJ0aCA9PSAtMSA/IDE5ODAgOiByZXNwLnllYXJfb2ZfYmlydGgsXG4gICAgICAgIGhlaWdodDogcmVzcC5oZWlnaHQgPT0gLTEgPyAwIDogcmVzcC5oZWlnaHQsXG4gICAgICAgIGN1cnJlbnRXZWlnaHQ6IHJlc3Aud2VpZ2h0ID09IC0xID8gMCA6IHJlc3Aud2VpZ2h0LFxuICAgICAgICB3ZWlnaHRCZWZvcmVQcmVnOiByZXNwLndlaWdodF9iZWZvcmVfcHJlZ25hbmN5ID09IC0xID8gMCA6IHJlc3Aud2VpZ2h0X2JlZm9yZV9wcmVnbmFuY3ksXG5cbiAgICAgICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IHJlc3AucHJlZ25hbmN5X3N0YWdlLFxuICAgICAgICBhY3Rpdml0eUxldmVsSW5kZXg6IHJlc3AuYWN0aXZpdHlfbGV2ZWwgLSAxLFxuICAgICAgICBleHRlcm5hbElkOiByZXNwLmV4dGVybmFsX2lkLFxuXG4gICAgICAgIHByZWduYW5jeURhdGU6IHtcbiAgICAgICAgICBkYXRlOiB0ZW1wRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSxcbiAgICAgICAgICB5ZWFyOiB0ZW1wRGF0ZS5mb3JtYXQoJ1lZWVknKSxcbiAgICAgICAgICBtb250aDogdGVtcERhdGUuZm9ybWF0KCdNTScpLFxuICAgICAgICAgIGRheTogdGVtcERhdGUuZm9ybWF0KCdERCcpXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHRoYXQudXBkYXRlUHJvZmlsZSgpXG4gICAgfSkuY2F0Y2goZXJyID0+IHt9KTtcbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVQcm9maWxlKCkge1xuICAgIHdlYkFQSS5VcGRhdGVVc2VyUHJvZmlsZSh0aGlzLmdlbmVyYXRlUHJvZmlsZVJlcUJvZHkoKSkudGhlbihyZXNwID0+IHtcbiAgICB9KS5jYXRjaChlcnIgPT4ge30pO1xuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlUHJvZmlsZVJlcUJvZHkoKTogVXBkYXRlVXNlclByb2ZpbGVSZXEge1xuICAgIC8vY2hlY2sgcHJvZmlsZSBzdGF0dXMgZWFjaCB0aW1lIHN1Ym1pdCBwcm9maWxlXG4gICAgbGV0IHByZWdEYXRlVGltZXN0YW1wOiBudW1iZXIgPSBtb21lbnQodGhpcy5kYXRhLnByZWduYW5jeURhdGUuZGF0ZSkudW5peCgpO1xuXG4gICAgdmFyIHJlcUJvZHkgPSB7XG4gICAgICBnZW5kZXI6IHRoaXMuZGF0YS5nZW5kZXJJbmRleCxcbiAgICAgIHllYXJfb2ZfYmlydGg6IHRoaXMuZGF0YS5iaXJ0aGRheSxcbiAgICAgIGhlaWdodDogdGhpcy5kYXRhLmhlaWdodCxcbiAgICAgIHdlaWdodDogdGhpcy5kYXRhLmN1cnJlbnRXZWlnaHQsXG4gICAgICB3ZWlnaHRfYmVmb3JlX3ByZWduYW5jeTogdGhpcy5kYXRhLndlaWdodEJlZm9yZVByZWcsXG5cbiAgICAgIGFjdGl2aXR5X2xldmVsOiB0aGlzLmRhdGEuYWN0aXZpdHlMZXZlbEluZGV4ICsgMSwgLy8gYmFja2VuZCBpbmRleCBzdGFydHMgZnJvbSAxLCBub3QgMTBcbiAgICAgIHByZWduYW5jeV9zdGFnZTogdGhpcy5kYXRhLnByZWduYW5jeVN0YXR1c0luZGV4LCAvLyBiYWNrZW5kIGluZGV4IHN0YXJ0cyBmcm9tIDEsIG5vdCAxMFxuXG4gICAgICBleHBlY3RlZF9iaXJ0aF9kYXRlOiBwcmVnRGF0ZVRpbWVzdGFtcCxcbiAgICAgIG5pY2tuYW1lOiB0aGlzLnVzZXJJbmZvLm5pY2tOYW1lLFxuICAgICAgYXZhdGFyX3VybDogdGhpcy51c2VySW5mby5hdmF0YXJVcmwsXG4gICAgICBleHRlcm5hbF9pZDogdGhpcy5kYXRhLmV4dGVybmFsSWQsXG5cbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJSZXF1ZXN0IGJvZHkgZ2VuZXJhdGVkLlwiKTtcbiAgICBjb25zb2xlLmxvZyhyZXFCb2R5KTtcbiAgICByZXR1cm4gcmVxQm9keTtcbiAgfVxuXG5cblxuXG4gIHB1YmxpYyBpbml0SG9tZVBhZ2VJbmZvKCkge1xuICAgIGxldCBjdXJyZW50Rm9ybWF0dGVkRGF0ZSA9IERhdGUucGFyc2UoU3RyaW5nKG5ldyBEYXRlKCkpKSAvIDEwMDA7XG4gICAgbGV0IHJlcSA9IHsgZGF0ZTogY3VycmVudEZvcm1hdHRlZERhdGUgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVIb21lUGFnZUluZm8ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgLy91cGRhdGUgY2hhcnQgcGFydFxuICAgICAgdGhpcy5wYXJzZUhvbWVQYWdlQ2hhcnREYXRhKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0SG9tZVBhZ2VDYXJkKCkge1xuICAgIGxldCByZXEgPSB7fVxuICAgIHdlYkFQSS5SZXRyaWV2ZUNhcmRMaXN0KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHRoaXMucGFyc2VIb21lUGFnZUNhcmREYXRhKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJzZUhvbWVQYWdlQ2hhcnREYXRhKHJlc3A6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgIGxldCBkYWlseUF2Z0ludGFrZSA9IE1hdGguZmxvb3IocmVzcC5kYWlseV9hdmdfaW50YWtlIC8gMTAwKTtcbiAgICBsZXQgZGFpbHlUYXJnZXRJbnRha2UgPSBNYXRoLmZsb29yKHJlc3AuZGFpbHlfdGFyZ2V0X2ludGFrZSAvIDEwMCk7XG4gICAgbGV0IGxhdGVzdFdlaWdodCA9IHJlc3AubGF0ZXN0X3dlaWdodDtcbiAgICAvL3VwZGF0ZSBkaXNwbGF5IGRhdGFcbiAgICBsZXQgd2VpZ2h0T3BlcmF0aW9uID0gXCJjYXJkTGlzdFswXS5jYXJkX3dlaWdodF92YWx1ZVwiO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBhdmVyYWdlX2VuZXJneTogZGFpbHlBdmdJbnRha2UsXG4gICAgICB0YXJnZXRfZW5lcmd5OiBkYWlseVRhcmdldEludGFrZSxcbiAgICAgIFt3ZWlnaHRPcGVyYXRpb25dOiBsYXRlc3RXZWlnaHRcbiAgICB9KTtcbiAgICAvL3VwZGF0ZSBjaGFydCBwYXJ0XG4gICAgbGV0IGRhaWx5SW50YWtlcyA9IHJlc3AuZGFpbHlfaW50YWtlcztcbiAgICBmb3IgKGxldCBpbmRleCBpbiBkYWlseUludGFrZXMpIHtcbiAgICAgIGRhaWx5SW50YWtlc1tpbmRleF0udmFsdWUgPSBNYXRoLmZsb29yKGRhaWx5SW50YWtlc1tpbmRleF0udmFsdWUgLyAxMDApO1xuICAgICAgZGFpbHlJbnRha2VzW2luZGV4XS5hdmcgPSBkYWlseUF2Z0ludGFrZVxuICAgIH1cbiAgICBsZXQgdGFyZ2V0SW50YWtlID0gcmVzcC5kYWlseV90YXJnZXRfaW50YWtlO1xuICAgIGNoYXJ0LmNoYW5nZURhdGEoZGFpbHlJbnRha2VzKTtcbiAgICAvLyBjaGFydC5saW5lKCkucG9zaXRpb24oJ3dlZWsqYXZnJykuY29sb3IoJyNmNGY0ZjQnKS5zaGFwZSgnZGFzaGVkJyk7XG4gICAgY2hhcnQuZ3VpZGUoKS5saW5lKHtcbiAgICAgIHN0YXJ0OiBbJ+WRqOWkqScsIHRhcmdldEludGFrZV0sXG4gICAgICBlbmQ6IFsn5ZGo5YWtJywgdGFyZ2V0SW50YWtlXSxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHN0cm9rZTogJyNkMGQwZDAnLCAvLyDnur/nmoTpopzoibJcbiAgICAgICAgbGluZURhc2g6IFswLCAyLCAyXSwgLy8g6Jma57q/55qE6K6+572uXG4gICAgICAgIGxpbmVXaWR0aDogMSAvLyDnur/nmoTlrr3luqZcbiAgICAgIH0gLy8g5Zu+5b2i5qC35byP6YWN572uXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcGFyc2VIb21lUGFnZUNhcmREYXRhKHJlc3A6IFJldHJpZXZlQ2FyZExpc3RSZXNwKSB7XG4gICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgbGV0IGNhcmRJbmZvOiBDYXJkSW5mb1tdID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5jYXJkX2xpc3QpIHtcbiAgICAgIGxldCBjYXJkID0gcmVzcC5jYXJkX2xpc3RbaW5kZXhdO1xuICAgICAgbGV0IGVudGl0eSA9IHtcbiAgICAgICAgY2FyZElkOiBjYXJkLmNhcmRfaWQsXG4gICAgICAgIHRpdGxlOiBjYXJkLnRpdGxlLFxuICAgICAgICBkZXNjcmlwdGlvbjogY2FyZC5kZXNjcmlwdGlvbixcbiAgICAgICAgY2FyZFR5cGU6IGNhcmQuY2FyZF90eXBlLFxuICAgICAgICBpY29uTGluazogY2FyZC5pY29uX2xpbmssXG4gICAgICAgIGNvbnRlbnRMaW5rOiBjYXJkLmNvbnRlbnRfbGluayxcbiAgICAgICAgaXNDaGVja2VkOiBjYXJkLmlzX2NoZWNrZWRcbiAgICAgIH1cbiAgICAgIGNhcmRJbmZvLnB1c2goZW50aXR5KTtcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGFjdGl2aXR5Q2FyZExpc3Q6IGNhcmRJbmZvXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcmVkaXJlY3RUb1BhZ2UoZXZlbnQ6IGFueSkge1xuICAgIGxldCByZWRpcmVjdFBhdGggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucmVkaXJlY3RQYXRoO1xuICAgIGlmIChyZWRpcmVjdFBhdGggPT09IFwiL3BhZ2VzL3JkaVBhZ2UvcmRpUGFnZVwiKSB7XG4gICAgICB3ZWJBUEkuUmV0cmlldmVVc2VyUkRBKHt9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICBsZXQgcmRhVXJsID0gcmVzcC5yZGFfdXJsO1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnLi4vLi4vcGFnZXMvcmRpUGFnZS9yZGlQYWdlP3VybD0nICsgcmRhVXJsIH0pO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluaOqOiNkOWAvOWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogcmVkaXJlY3RQYXRoIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWRpcmVjdEZyb21GZWVkKGV2ZW50OiBhbnkpIHtcbiAgICB2YXIgbXlUaGlzID0gdGhpcztcbiAgICBsZXQgY2FyZElkID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmNhcmRJZDtcbiAgICBjb25zb2xlLmxvZyhjYXJkSWQpO1xuICAgIGxldCBjYXJkTGluayA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jYXJkTGluaztcbiAgICBsZXQgY2FyZEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmNhcmRJbmRleDtcbiAgICBsZXQgY2FyZERlc2MgPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuY2FyZERlc2NcbiAgICBsZXQgY2FyZExpc3Q6IENhcmRJbmZvID0gdGhpcy5kYXRhLmFjdGl2aXR5Q2FyZExpc3Q7XG5cbiAgICBzd2l0Y2ggKGNhcmRJZCkge1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGV0IHJlcSA9IHsgZXZlbnRfdHlwZTogXCJjbGlja19jYXJkXCIsIGV2ZW50X3ZhbHVlOiBjYXJkSWQudG9TdHJpbmcoKSB9O1xuICAgICAgICB3ZWJBUEkuQ3JlYXRlVXNlckV2ZW50KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBjYXJkTGlzdFtjYXJkSW5kZXhdLmlzQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgKG15VGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgYWN0aXZpdHlDYXJkTGlzdDogY2FyZExpc3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB3eC5zd2l0Y2hUYWIoe1xuICAgICAgICAgICAgdXJsOiBcIi9wYWdlcy9mb29kRGlhcnkvaW5kZXhcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSlcbiAgICAgICAgYnJlYWs7Ly9tZWFsXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGxldCByZXEgPSB7IGV2ZW50X3R5cGU6IFwiY2xpY2tfY2FyZFwiLCBldmVudF92YWx1ZTogY2FyZElkLnRvU3RyaW5nKCkgfTtcbiAgICAgICAgd2ViQVBJLkNyZWF0ZVVzZXJFdmVudChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgY2FyZExpc3RbY2FyZEluZGV4XS5pc0NoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgIChteVRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGFjdGl2aXR5Q2FyZExpc3Q6IGNhcmRMaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6IFwiL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2FydGljbGVQYWdlP3VybD1cIiArIGNhcmRMaW5rXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKVxuXG4gICAgICAgIGJyZWFrOy8vYXJ0aWNsZVxuICAgICAgY2FzZSAyOlxuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn5LuK5pel6L+Q5YqoJyxcbiAgICAgICAgICBjb25maXJtVGV4dDogXCLlt7LlrozmiJBcIixcbiAgICAgICAgICBjYW5jZWxUZXh0OiBcIuacquWujOaIkFwiLFxuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgICBsZXQgcmVxID0geyBldmVudF90eXBlOiBcImNsaWNrX2NhcmRcIiwgZXZlbnRfdmFsdWU6IGNhcmRJZC50b1N0cmluZygpIH07XG4gICAgICAgICAgICAgIHdlYkFQSS5DcmVhdGVVc2VyRXZlbnQocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgICAgIGNhcmRMaXN0W2NhcmRJbmRleF0uaXNDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAobXlUaGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICAgICAgICBhY3Rpdml0eUNhcmRMaXN0OiBjYXJkTGlzdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhazsvL2V4ZWNpc2VcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy93ZWlnaHQtcmVtaW5kZXJcbiAgICAgICAgbGV0IHJlcSA9IHsgZXZlbnRfdHlwZTogXCJjbGlja19jYXJkXCIsIGV2ZW50X3ZhbHVlOiBjYXJkSWQudG9TdHJpbmcoKSB9O1xuICAgICAgICB3ZWJBUEkuQ3JlYXRlVXNlckV2ZW50KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBjYXJkTGlzdFtjYXJkSW5kZXhdLmlzQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGFjdGl2aXR5Q2FyZExpc3Q6IGNhcmRMaXN0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6IFwiL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleFwiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBwdWJsaWMgb25RdWVzRGxnQnRuUHJlc3MoZXZlbnQ6YW55KXtcbiAgLy8gICBsZXQgZmxhZyA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5zZWxlY3Rpb247XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIGlzQW5zd2VyUG9zaXRpdmU6IGZsYWdcbiAgLy8gICB9KVxuICAvLyB9XG5cblxuICAvLyBwdWJsaWMgb25RdWVzRGxnQnRuU3VibWl0KCl7XG4gIC8vICAgLy9zdWJtaXQgaXNBbnN3ZXJQb3NpdGl2ZSB0byBiYWNrZW5kXG4gIC8vICAgbGV0IHN1cnZleUlkID0gdGhpcy5kYXRhLmN1cnJlbnRTdXJ2ZXlJZDtcbiAgLy8gICBpZiAoc3VydmV5SWQgPT09IDApe1xuICAvLyAgICAgcmV0dXJuO1xuICAvLyAgIH1cbiAgLy8gICBsZXQgcmVxID0geyBzdXJ2ZXlfaWQ6IHN1cnZleUlkLCBpc19wb3NpdGl2ZTogdGhpcy5kYXRhLmlzQW5zd2VyUG9zaXRpdmV9O1xuICAvLyAgIHdlYkFQSS5DcmVhdGVTdXJ2ZXlBbnN3ZXIocmVxKS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgLy9kaXNtaXNzIHRoZSBkaWFsb2cgdGhlbiBzZXQgc3VydmV5IGlkIHRvIDBcbiAgLy8gICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgc2hvd1F1ZXNEbGc6IGZhbHNlLCBjdXJyZW50U3VydmV5SWQ6IDAgfSk7XG4gIC8vICAgfSkuY2F0Y2goZXJyID0+IHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBcIuS4iuS8oOeUqOaIt+WbnuetlOWksei0pVwiLCBzaG93Q2FuY2VsOiBmYWxzZSB9KSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgYmluZEZlZWRiYWNrUXVlc3Rpb25JbnB1dChldmVudDphbnkpe1xuICAvLyAgIGxldCBxdWVzVGV4dCA9IFN0cmluZyhldmVudC5kZXRhaWwudmFsdWUpO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBxdWVzdGlvblRleHQ6IHF1ZXNUZXh0XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25GZWVkYmFja0RsZ0J0blN1Ym1pdCgpe1xuICAvLyAgIC8vc3VibWl0IGlzRmVlZGJhY2sgdG8gYmFja2VuZFxuICAvLyAgIGxldCByZXEgPSB7IGRhdGU6IG1vbWVudCgpLnVuaXgoKSwgcXVlc3Rpb246IHRoaXMuZGF0YS5xdWVzdGlvblRleHR9O1xuICAvLyAgIGlmICghdGhpcy5kYXRhLnF1ZXN0aW9uVGV4dCB8fCB0aGlzLmRhdGEucXVlc3Rpb25UZXh0ID09PSBcIlwiKSB7XG4gIC8vICAgICByZXR1cm5cbiAgLy8gICB9XG4gIC8vICAgd2ViQVBJLkNyZWF0ZVF1ZXN0aW9uKHJlcSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBzaG93RmVlZGJhY2tEbGc6IGZhbHNlIH0pO1xuICAvLyAgIH0pLmNhdGNoKGVyciA9PiB7IHd4LnNob3dNb2RhbCh7dGl0bGU6IFwiXCIsY29udGVudDpcIuS4iuS8oOeVmeiogOWksei0pVwiLCBzaG93Q2FuY2VsOiBmYWxzZX0gKX0pO1xuICAvLyB9XG5cbn1cblxuUGFnZShuZXcgSG9tZVBhZ2UoKSkiXX0=