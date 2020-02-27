"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var loginAPI = require("../../api/login/LoginService");
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var moment = require("moment");
var uploadFile = require("../../api/uploader.js");
var interface_1 = require("./../../api/app/interface");
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
        grid: null,
        tickLine: null,
        label: null,
        line: null
    });
    chart.tooltip({
        showCrosshairs: true,
        onShow: function (ev) {
            var items = ev.items;
            items[0].name = items[0].origin.week;
            items[0].value = items[0].value + 'kg';
            items.length = 1;
        }
    });
    chart.point()
        .position(["week", "value"])
        .style({ fill: '#ffffff', r: 1.7, lineWidth: 1, stroke: '#f3465a' });
    chart.line({
        connectNulls: true
    }).position('week*value').color("#ed2c48").shape('smooth');
    chart.render();
    return chart;
}
var FoodDiaryPage = (function () {
    function FoodDiaryPage() {
        this.userInfo = {};
        this.data = {
            opts: {
                onInit: initChart,
            },
            nutrientSummary: [
                { name: "热量", percent: 0, intakeNum: '-', totalNum: '-', unit: "千卡" },
                { name: "脂肪", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" },
                { name: "碳水", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" },
                { name: "蛋白质", percent: 0, intakeNum: '-', totalNum: '-', unit: "克" }
            ],
            mealList: [{
                    "energyIntake": '-/-',
                    "mealTypeName": "早餐",
                    "mealType": 1,
                    "recommendedEnergyIntake": '-/-'
                }, {
                    "energyIntake": '-/-',
                    "mealTypeName": "午餐",
                    "mealType": 2,
                    "recommendedEnergyIntake": '-/-'
                }, {
                    "energyIntake": '-/-',
                    "mealTypeName": "晚餐",
                    "mealType": 3,
                    "recommendedEnergyIntake": '-/-'
                }],
            score: '--',
            infoLists: [
                {
                    url: 'https://mp.weixin.qq.com/s/fg1qli0Dk1x9y0WZcOHv8w', image: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuViamaNiaBibYKibgyVhicPzS5PzOrVn6mOdWaKmNdwcZKX93z9BJTtwnJCqiaauFhu0WoD3twaFvjjWGLA/640?wx_fmt=jpeg',
                    title: '秋季饮食攻略!'
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
            navTitleTime: '',
            latest_weight: ' ',
            showMask: false,
            statusHeight: null,
            navHeight: null,
            mealType: 0,
            showAddScorePopup: false,
            wxRunStepArr: [],
            step: '-/-'
        };
        this.mealType = 0;
        this.mealDate = 0;
        this.path = '';
        this.foodColorTipsArr = ['#0074d9', '#ffdc00', '#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
        this.mealIndex = 0;
    }
    FoodDiaryPage.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    };
    FoodDiaryPage.prototype.onShow = function () {
        this.login();
    };
    FoodDiaryPage.prototype.onReady = function () {
        if (app.globalData.statusHeight == null || app.globalData.navHeight == null) {
            var systemInfo = wx.getSystemInfoSync();
            var statusHeight = systemInfo.statusBarHeight;
            var isiOS = systemInfo.system.indexOf('iOS') > -1;
            var navHeight;
            if (!isiOS) {
                navHeight = 48;
            }
            else {
                navHeight = 44;
            }
            this.setData({
                statusHeight: statusHeight,
                navHeight: navHeight
            });
        }
        else {
            this.setData({
                statusHeight: app.globalData.statusHeight,
                navHeight: app.globalData.navHeight
            });
        }
    };
    FoodDiaryPage.prototype.getDailyMacronutrientSummary = function (date) {
        var that = this;
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        if (token) {
            interface_1.default.getDailyMacronutrientSummary({ date: date }).then(function (res) {
                that.parseDailyMacronutrientSummary(res);
            }).catch(function (err) {
                console.log(88, err);
            });
        }
    };
    FoodDiaryPage.prototype.parseDailyMacronutrientSummary = function (res) {
        var _this = this;
        var format = function (num) { return Math.round(num); };
        var score = res.score;
        var nutrientSummary = [
            {
                name: "热量",
                percent: format(res.energyIntake / res.energyRecommendedIntake * 100),
                intakeNum: format(res.energyIntake),
                totalNum: format(res.energyRecommendedIntake),
                unit: "千卡"
            },
        ];
        for (var index in res.macronutrientIntake) {
            var item = res.macronutrientIntake[index];
            item.name = item.nameCN;
            item.percent = format(item.percentage.percentage);
            item.intakeNum = format(item.intake.intake);
            item.totalNum = format(item.intake.suggestedIntake);
            item.unit = "克";
            nutrientSummary.push(item);
        }
        nutrientSummary.map(function (item, index) {
            _this.selectComponent("#circle" + index).drawCircle("canvas", 75, 4, item.percent / 100 * 2);
        });
        this.setData({
            nutrientSummary: nutrientSummary,
            score: score
        });
    };
    FoodDiaryPage.prototype.getDailyMealLogGroupFoodLogDetail = function (date) {
        var that = this;
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        if (token) {
            interface_1.default.getDailyMealLogGroupFoodLogDetail({ date: date }).then(function (res) {
                that.parseDailyMealLogGroupFoodLogDetail(res);
            }).catch(function (err) {
                var token = wx.getStorageSync(globalEnum.globalKey_token);
                wx.showModal({
                    content: '获取饮食记录失败，时间戳：' + date + '；token:' + token + '；报错' + JSON.stringify(err)
                });
            });
        }
    };
    FoodDiaryPage.prototype.parseDailyMealLogGroupFoodLogDetail = function (res) {
        var _this = this;
        var mealList = [];
        var _loop_1 = function (index) {
            var meal = res[index];
            meal.energyIntake = Math.round(meal.energyIntake);
            meal.recommendedEnergyIntake = Math.round(meal.recommendedEnergyIntake);
            meal.mealSummary = [];
            meal.mealLogSummaryVOS && meal.mealLogSummaryVOS.map(function (item, index) {
                item.energy = Math.round(item.energy);
                item.colorTip = _this.foodColorTipsArr[index];
                item.foodLogSummaryList.map(function (it) {
                    it.colorTip = _this.foodColorTipsArr[index];
                    it.energy = Math.round(it.energy);
                    meal.mealSummary.push(it);
                });
            });
            mealList.push(meal);
        };
        for (var index in res) {
            _loop_1(index);
        }
        ;
        this.setData({ mealList: mealList }, function () {
            console.log('页面初次渲染的mealList', _this.data.mealList);
        });
    };
    FoodDiaryPage.prototype.retrieveData = function () {
        var that = this;
        var currWeek = moment().week();
        var firstDayOfWeek = moment().week(currWeek).day(0).unix();
        var lastDayOfWeek = moment().week(currWeek).day(6).unix();
        var todayTime = Number(moment().startOf('day').format('X'));
        var before30dayTime = Number(moment().subtract(30, "days").startOf('day').format('X'));
        setTimeout(function () {
            var req = {
                date_from: before30dayTime,
                date_to: todayTime
            };
            webAPI.RetrieveWeightLog(req).then(function (resp) {
                that.setData({
                    latest_weight: resp.latest_weight.value
                });
                var nearDataArr = [];
                var total = 0;
                resp.weight_logs.map(function (item) {
                    total = total + item.value;
                    var beforeNumberDay = (todayTime - item.date) / 86400;
                    var formatDate = moment(item.date * 1000).format('MM/DD');
                    nearDataArr[30 - beforeNumberDay] = { week: formatDate, value: item.value, avg: 2000 };
                });
                var average = Math.round(total * 10 / resp.weight_logs.length) / 10;
                var len = nearDataArr.length;
                var flag = true;
                for (var i = 0; i < len; i++) {
                    if (!nearDataArr[i] && flag) {
                        var data = moment().subtract(30 - i, "days").format('MM/DD');
                        nearDataArr[i] = { week: data, value: average, avg: 2000 };
                        flag = false;
                    }
                    else if (!nearDataArr[i]) {
                        var data = moment().subtract(30 - i, "days").format('MM/DD');
                        nearDataArr[i] = { week: data, value: null, avg: 2000 };
                    }
                }
                chart.axis(false);
                chart.changeData(nearDataArr);
            }).catch(function (err) {
                var token = wx.getStorageSync(globalEnum.globalKey_token);
                wx.showModal({
                    content: '获取体重数据失败,token:' + token + ',报错' + JSON.stringify(err)
                });
            });
        }, 200);
    };
    FoodDiaryPage.prototype.goWeightRecord = function () {
        wx.navigateTo({ url: '/pages/weightRecord/index' });
    };
    FoodDiaryPage.prototype.login = function () {
        var that = this;
        wx.login({
            success: function (_res) {
                var req = { jscode: _res.code };
                loginAPI.MiniProgramLogin(req).then(function (resp) {
                    var userStatus = resp.user_status;
                    switch (userStatus) {
                        case 1:
                            wx.reLaunch({ url: '/pages/login/index' });
                            break;
                        case 2:
                            if (resp.token) {
                                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                                webAPI.SetAuthToken(resp.token);
                                wx.reLaunch({ url: '/pages/onBoard/onBoard' });
                            }
                            break;
                        case 3:
                            if (resp.token) {
                                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                                webAPI.SetAuthToken(resp.token);
                                that.authenticationRequest();
                                that.retrieveData();
                                that.getDailyMealLogGroupFoodLogDetail(that.mealDate);
                                that.getDailyMacronutrientSummary(that.mealDate);
                            }
                            break;
                    }
                }).catch(function (err) {
                    wx.showModal({
                        title: '',
                        content: '首页登陆失败',
                        showCancel: false
                    });
                });
            }
        });
    };
    FoodDiaryPage.prototype.getWeRunData = function (sessionKey) {
        var that = this;
        wx.getWeRunData({
            success: function (res) {
                that.runStepInfo(sessionKey, res);
            },
            fail: function (res) {
                wx.getSetting({
                    success: function (res) {
                        if (!res.authSetting['scope.werun']) {
                            wx.showModal({
                                title: '提示',
                                content: '获取微信运动步数，需要开启计步权限',
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success: function (res) {
                                                that.login();
                                            }
                                        });
                                    }
                                    else {
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    };
    FoodDiaryPage.prototype.runStepInfo = function (sessionKey, r) {
        var that = this;
        interface_1.default.runStepInfo({
            sessionKey: sessionKey,
            encryptedData: r.encryptedData,
            ivStr: r.iv
        }).then(function (res) {
            that.formatStep(res, that.mealDate);
        }).catch(function (err) {
            wx.showToast({ title: '获取微信步数失败', icon: 'none' });
            console.log('获取微信步数失败');
        });
    };
    FoodDiaryPage.prototype.formatStep = function (stepArr, mealDate) {
        var _this = this;
        var that = this;
        var step;
        stepArr.map(function (item) {
            item.time = moment(item.timestamp * 1000).format('YYYY-MM-DD');
            var todayTime = moment(mealDate * 1000).format('YYYY-MM-DD');
            if (item.time === todayTime) {
                step = item.step;
            }
        });
        this.setData({
            wxRunStepArr: stepArr,
            step: step
        }, function () {
            console.log('微信运动步数=>', _this.data.wxRunStepArr);
        });
    };
    FoodDiaryPage.prototype.authenticationRequest = function () {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            app.globalData.userInfo = res.userInfo;
                        }
                    });
                }
                else {
                    wx.navigateTo({
                        url: '../login/index?user_status=3'
                    });
                }
            }
        });
    };
    FoodDiaryPage.prototype.goNutritionalDatabasePage = function () {
        wx.navigateTo({ url: '/pages/nutritionalDatabasePage/index' });
    };
    FoodDiaryPage.prototype.bindNaviToOtherMiniApp = function () {
        wx.navigateToMiniProgram({
            appId: 'wx4b74228baa15489a',
            path: '',
            envVersion: 'develop',
            success: function (res) {
                console.log("succcess navigate");
            },
            fail: function (err) {
                console.log(err);
            }
        });
    };
    FoodDiaryPage.prototype.triggerBindgetdate = function () {
        this.selectComponent('#calendar').dateSelection();
    };
    FoodDiaryPage.prototype.bindselect = function (event) {
        console.log(event);
    };
    FoodDiaryPage.prototype.bindgetdate = function (event) {
        var time = event.detail;
        var navTitleTime = time.year + '/' + time.month + '/' + time.date;
        var date = moment([time.year, time.month - 1, time.date]);
        this.mealDate = date.unix();
        if (app.globalData.mealDate) {
            this.mealDate = app.globalData.mealDate;
            navTitleTime = moment(this.mealDate * 1000).format('YYYY/MM/DD');
            app.globalData.mealDate = null;
        }
        var todayTimeStamp = moment(new Date());
        var formatMealData = moment(this.mealDate * 1000);
        if (todayTimeStamp.isSame(formatMealData, 'd')) {
            this.setData({ navTitleTime: '今天' });
        }
        else {
            this.setData({ navTitleTime: navTitleTime });
        }
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
        if (token && token.length >= 20) {
            this.getDailyMacronutrientSummary(this.mealDate);
            this.getDailyMealLogGroupFoodLogDetail(this.mealDate);
        }
        console.log('this.data.step', this.data.step);
        if (this.data.step && this.data.step !== '-/-') {
            this.formatStep(this.data.wxRunStepArr, this.mealDate);
        }
    };
    FoodDiaryPage.prototype.onDailyReportClick = function () {
        if (this.data.score === 0) {
            wx.aldstat.sendEvent('点击查看日报', { page: 'home', status: 0 });
            wx.showModal({
                title: "",
                content: "您今天还没有添加食物哦",
                showCancel: false,
                confirmText: '去添加'
            });
            return;
        }
        wx.aldstat.sendEvent('点击查看日报', { page: 'home', status: 1 });
        this.userLevel();
    };
    FoodDiaryPage.prototype.userLevel = function () {
        var that = this;
        wx.showLoading({ title: "加载中..." });
        interface_1.default.userLevel().then(function (res) {
            if (res.level === 1) {
                that.getUserProfileByToken();
            }
            else {
                wx.navigateTo({ url: './../../homeSub/pages/dailyPage/index' });
            }
        });
    };
    FoodDiaryPage.prototype.getUserProfileByToken = function () {
        var _this = this;
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        interface_1.default.getUserProfileByToken({ token: token }).then(function (resp) {
            var userId = resp.userId;
            wx.hideLoading({});
            wx.navigateTo({ url: "/pages/reportPage/reportPage?userId=" + userId + "&date=" + _this.mealDate });
        }).catch(function (err) {
            wx.hideLoading({});
            console.log(err);
        });
    };
    FoodDiaryPage.prototype.addFoodImage = function (event) {
        this.mealIndex = event.currentTarget.dataset.mealIndex;
        this.mealType = this.mealIndex + 1;
        this.setData({
            showMask: true,
            mealType: this.mealType
        });
    };
    FoodDiaryPage.prototype.handleChooseUploadType = function (e) {
        var that = this;
        var index = parseInt(e.currentTarget.dataset.index);
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
        this.setData({ showMask: false });
    };
    FoodDiaryPage.prototype.chooseImage = function (sourceType) {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: [sourceType],
            success: function (res) {
                wx.showLoading({ title: "上传中...", mask: true });
                var imagePath = res.tempFilePaths[0];
                that.path = imagePath;
                uploadFile(imagePath, that.onImageUploadSuccess, that.onImageUploadFailed, that.onUploadProgressing, 0, 0);
            },
            fail: function (err) {
                console.log(err);
            }
        });
    };
    FoodDiaryPage.prototype.onImageUploadSuccess = function () {
        wx.navigateTo({
            url: './../../homeSub/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate + "&title=" + this.data.mealList[this.mealIndex].mealTypeName,
        });
    };
    FoodDiaryPage.prototype.onImageUploadFailed = function () {
        console.log("uploadfailed");
        wx.hideLoading({});
    };
    FoodDiaryPage.prototype.onUploadProgressing = function (event) {
        console.log("progress:");
    };
    FoodDiaryPage.prototype.naviToFoodDetail = function (event) {
        var defaultImageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
        var mealIndex = event.currentTarget.dataset.mealIndex;
        var imageIndex = event.currentTarget.dataset.imageIndex;
        var mealId = this.data.mealList[mealIndex].mealLogSummaryVOS[imageIndex].mealLogId;
        var imageUrl = this.data.mealList[mealIndex].mealLogSummaryVOS[imageIndex].imageUrl;
        imageUrl = imageUrl == "" ? defaultImageUrl : imageUrl;
        var param = {};
        param.mealIndex = mealIndex;
        param.imageIndex = imageIndex;
        param.mealId = mealId;
        param.imageUrl = imageUrl;
        var paramJson = JSON.stringify(param);
        wx.navigateTo({
            url: "./../../homeSub/pages/foodDetail/index?paramJson=" + paramJson
        });
    };
    FoodDiaryPage.prototype.handleHiddenMask = function () {
        if (this.data.showMask) {
            this.setData({ showMask: false });
            return false;
        }
    };
    FoodDiaryPage.prototype.handleGoScorePrize = function () {
        wx.navigateTo({ url: '../../homeSub/pages/scorePrize/index' });
    };
    FoodDiaryPage.prototype.handleGoMotionStep = function () {
        wx.navigateTo({ url: "../../homeSub/pages/motionStep/index?step=" + this.data.step });
    };
    FoodDiaryPage.prototype.handleClockBreakFast = function () {
        var hour = moment().format('HH');
        if (hour > 10 || hour < 4) {
            wx.showToast({
                title: '早餐打卡时间为4点-10点',
                icon: 'none'
            });
        }
        else {
            this.mealIndex = 0;
            this.mealType = 1;
            this.setData({
                showMask: true,
                mealType: 1
            });
        }
    };
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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QUFDLENBQUMsRUFBRTtZQUNyQixFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNYLEtBQUssRUFBQyxlQUFlO2dCQUNyQixJQUFJLEVBQUMsTUFBTTthQUNaLENBQUMsQ0FBQTtTQUNIO2FBQUk7WUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixRQUFRLEVBQUUsSUFBSTtnQkFDZCxRQUFRLEVBQUUsQ0FBQzthQUNaLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQXBrQkQsSUFva0JDO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIGxvZ2luQVBJIGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFJldHJpZXZlRm9vZERpYXJ5UmVxLCBSZXRyaWV2ZUZvb2REaWFyeVJlc3AsXG4gIFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB1cGxvYWRGaWxlIGZyb20gJy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmxldCBjaGFydCA9IG51bGw7XG5mdW5jdGlvbiBpbml0Q2hhcnQoY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBGMikge1xuICBsZXQgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCwgIC8v572R5qC857q/XG4gICAgdGlja0xpbmU6IG51bGwsXG4gICAgbGFiZWw6IG51bGwsXG4gICAgbGluZTogbnVsbFxuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lduS4reaciXgseeWdkOagh+WSjOiiq+eCueWHu+mhueeahOS/oeaBr1xuICAgICAgaXRlbXNbMF0ubmFtZSA9IGl0ZW1zWzBdLm9yaWdpbi53ZWVrO1xuICAgICAgaXRlbXNbMF0udmFsdWUgPSBpdGVtc1swXS52YWx1ZSArICdrZyc7XG4gICAgICBpdGVtcy5sZW5ndGggPSAxXG4gICAgfVxuICB9KTtcblxuICBjaGFydC5wb2ludCgpXG4gICAgLnBvc2l0aW9uKFtcIndlZWtcIiwgXCJ2YWx1ZVwiXSlcbiAgICAuc3R5bGUoeyBmaWxsOiAnI2ZmZmZmZicsIHI6IDEuNywgbGluZVdpZHRoOiAxLCBzdHJva2U6ICcjZjM0NjVhJyB9KTtcbiAgY2hhcnQubGluZSh7XG4gICAgY29ubmVjdE51bGxzOiB0cnVlIC8vIOmFjee9ru+8jOi/nuaOpeepuuWAvOaVsOaNrlxuICB9KS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKS5zaGFwZSgnc21vb3RoJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cblxufVxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqZW5kIG9mIGYyIGNoYXJ0IGluaXQqKioqKioqKioqKioqKioqKioqKioqKioqLy9cblxuY2xhc3MgRm9vZERpYXJ5UGFnZSB7XG4gIHB1YmxpYyB1c2VySW5mbyA9IHt9XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIG9wdHM6IHtcbiAgICAgIG9uSW5pdDogaW5pdENoYXJ0LFxuICAgIH0sXG4gICAgbnV0cmllbnRTdW1tYXJ5OiBbXG4gICAgICB7IG5hbWU6IFwi54Ot6YePXCIsIHBlcmNlbnQ6IDAsIGludGFrZU51bTogJy0nLCB0b3RhbE51bTogJy0nLCB1bml0OiBcIuWNg+WNoVwiIH0sXG4gICAgICB7IG5hbWU6IFwi6ISC6IKqXCIsIHBlcmNlbnQ6IDAsIGludGFrZU51bTogJy0nLCB0b3RhbE51bTogJy0nLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG5hbWU6IFwi56Kz5rC0XCIsIHBlcmNlbnQ6IDAsIGludGFrZU51bTogJy0nLCB0b3RhbE51bTogJy0nLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG5hbWU6IFwi6JuL55m96LSoXCIsIHBlcmNlbnQ6IDAsIGludGFrZU51bTogJy0nLCB0b3RhbE51bTogJy0nLCB1bml0OiBcIuWFi1wiIH1cbiAgICBdLFxuICAgIG1lYWxMaXN0OiBbe1xuICAgICAgXCJlbmVyZ3lJbnRha2VcIjogJy0vLScsXG4gICAgICBcIm1lYWxUeXBlTmFtZVwiOiBcIuaXqemkkFwiLFxuICAgICAgXCJtZWFsVHlwZVwiOiAxLFxuICAgICAgXCJyZWNvbW1lbmRlZEVuZXJneUludGFrZVwiOiAnLS8tJ1xuICAgIH0se1xuICAgICAgXCJlbmVyZ3lJbnRha2VcIjogJy0vLScsXG4gICAgICBcIm1lYWxUeXBlTmFtZVwiOiBcIuWNiOmkkFwiLFxuICAgICAgXCJtZWFsVHlwZVwiOiAyLFxuICAgICAgXCJyZWNvbW1lbmRlZEVuZXJneUludGFrZVwiOiAnLS8tJ1xuICAgIH0se1xuICAgICAgXCJlbmVyZ3lJbnRha2VcIjogJy0vLScsXG4gICAgICBcIm1lYWxUeXBlTmFtZVwiOiBcIuaZmumkkFwiLFxuICAgICAgXCJtZWFsVHlwZVwiOiAzLFxuICAgICAgXCJyZWNvbW1lbmRlZEVuZXJneUludGFrZVwiOiAnLS8tJ1xuICAgIH1dLFxuICAgIHNjb3JlOiAnLS0nLFxuICAgIGluZm9MaXN0czogW1xuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy9mZzFxbGkwRGsxeDl5MFdaY09Idjh3JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWaWFtYU5pYUJpYllLaWJneVZoaWNQelM1UHpPclZuNm1PZFdhS21OZHdjWktYOTN6OUJKVHR3bkpDcWlhYXVGaHUwV29EM3R3YUZ2ampXR0xBLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn56eL5a2j6aWu6aOf5pS755WlISdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLy1SYkRGMVVMUjBQRzdiN1JJeVVmTncnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZLV2lhWWdIRzBHQTlNaWFSd3NydEVib2lialdSUVpoejc4akdKWkx6RzNDSmxVSWljbmdhWXdnWUNla0R5OEMzTm9LakJ5QnhZMGliaWFWQWcvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6ICfngrnlpJbljZblsLHkuI3lgaXlurfvvJ8g5oiR5YGP5LiNJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvOEljSjdINnE0dnR6ZGxXTDNXWEl4UScsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51V2JMUkhRRUpvdkJDdzRYVXhWV0tHUEppYXZQckE5TktQSjRzaWNGMzZvM1paS2oyU3RsaHBWb2liQnY2Y3MwTkhUSmljMldGQUVSZGVpYzNRLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn6JCl5YW75biI5aaC5L2V5a+56ICB5Lit5bCR6IOW5Y+L6L+b6KGM6L+Q5Yqo5rK755aX77yfIOeci+eci+iTneearuS5puaAjuS5iOivtCdcbiAgICAgIH1cbiAgICBdLFxuICAgIG5hdlRpdGxlVGltZTogJycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OiAnICcsXG4gICAgc2hvd01hc2s6IGZhbHNlLFxuICAgIHN0YXR1c0hlaWdodDogbnVsbCxcbiAgICBuYXZIZWlnaHQ6IG51bGwsXG4gICAgbWVhbFR5cGU6MCxcbiAgICBzaG93QWRkU2NvcmVQb3B1cDpmYWxzZSxcbiAgICB3eFJ1blN0ZXBBcnI6W10sXG4gICAgc3RlcDonLS8tJ1xuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywgJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddO1xuICBwdWJsaWMgbWVhbEluZGV4ID0gMDtcblxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgLy8gd3gubmF2aWdhdGVUbyh7dXJsOicuLy4uLy4uL2hvbWVTdWIvcGFnZXMvbWVhbEFuYWx5c2lzL2luZGV4J30pXG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICB9XG5cbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICB0aGlzLmxvZ2luKCk7XG4gIH1cblxuICBwdWJsaWMgb25SZWFkeSgpIHtcbiAgICBpZiAoYXBwLmdsb2JhbERhdGEuc3RhdHVzSGVpZ2h0ID09IG51bGwgfHwgYXBwLmdsb2JhbERhdGEubmF2SGVpZ2h0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHN5c3RlbUluZm8gPSB3eC5nZXRTeXN0ZW1JbmZvU3luYygpXG4gICAgICBjb25zdCBzdGF0dXNIZWlnaHQgPSBzeXN0ZW1JbmZvLnN0YXR1c0JhckhlaWdodFxuICAgICAgY29uc3QgaXNpT1MgPSBzeXN0ZW1JbmZvLnN5c3RlbS5pbmRleE9mKCdpT1MnKSA+IC0xXG4gICAgICB2YXIgbmF2SGVpZ2h0O1xuICAgICAgaWYgKCFpc2lPUykgeyAvLyDlronljZNcbiAgICAgICAgbmF2SGVpZ2h0ID0gNDg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZIZWlnaHQgPSA0NDtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHN0YXR1c0hlaWdodCxcbiAgICAgICAgbmF2SGVpZ2h0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgc3RhdHVzSGVpZ2h0OiBhcHAuZ2xvYmFsRGF0YS5zdGF0dXNIZWlnaHQsXG4gICAgICAgIG5hdkhlaWdodDogYXBwLmdsb2JhbERhdGEubmF2SGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOW+l+WIsOmmlumhtWNhbnZhc+aVsOaNrlxuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoZGF0ZSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoeyBkYXRlIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKDg4LCBlcnIpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKSB7XG4gICAgY29uc3QgZm9ybWF0ID0gKG51bSkgPT4gTWF0aC5yb3VuZChudW0pO1xuICAgIGxldCBzY29yZSA9IHJlcy5zY29yZTtcbiAgICBsZXQgbnV0cmllbnRTdW1tYXJ5ID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiBcIueDremHj1wiLFxuICAgICAgICBwZXJjZW50OiBmb3JtYXQocmVzLmVuZXJneUludGFrZSAvIHJlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSAqIDEwMCksXG4gICAgICAgIGludGFrZU51bTogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UpLFxuICAgICAgICB0b3RhbE51bTogZm9ybWF0KHJlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSksXG4gICAgICAgIHVuaXQ6IFwi5Y2D5Y2hXCJcbiAgICAgIH0sXG4gICAgXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMubWFjcm9udXRyaWVudEludGFrZSkge1xuICAgICAgY29uc3QgaXRlbSA9IHJlcy5tYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGl0ZW0ubmFtZSA9IGl0ZW0ubmFtZUNOO1xuICAgICAgaXRlbS5wZXJjZW50ID0gZm9ybWF0KGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKTtcbiAgICAgIGl0ZW0uaW50YWtlTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLmludGFrZSk7XG4gICAgICBpdGVtLnRvdGFsTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLnN1Z2dlc3RlZEludGFrZSk7XG4gICAgICBpdGVtLnVuaXQgPSBcIuWFi1wiO1xuICAgICAgbnV0cmllbnRTdW1tYXJ5LnB1c2goaXRlbSlcbiAgICB9XG4gICAgbnV0cmllbnRTdW1tYXJ5Lm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KGAjY2lyY2xlJHtpbmRleH1gKS5kcmF3Q2lyY2xlKGBjYW52YXNgLCA3NSwgNCwgaXRlbS5wZXJjZW50IC8gMTAwICogMilcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbnV0cmllbnRTdW1tYXJ5OiBudXRyaWVudFN1bW1hcnksXG4gICAgICBzY29yZTogc2NvcmVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bppa7po5/orrDlvZXnm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBnZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwoZGF0ZSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh7IGRhdGUgfSkudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGF0LnBhcnNlRGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHJlcyk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKVxuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIGNvbnRlbnQ6J+iOt+WPlumlrumjn+iusOW9leWksei0pe+8jOaXtumXtOaIs++8micrZGF0ZSsn77ybdG9rZW46Jyt0b2tlbisn77yb5oql6ZSZJytKU09OLnN0cmluZ2lmeShlcnIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6aWu6aOf6K6w5b2V55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcGFyc2VEYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwocmVzKSB7XG4gICAgbGV0IG1lYWxMaXN0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMpIHtcbiAgICAgIGxldCBtZWFsID0gcmVzW2luZGV4XTtcbiAgICAgIG1lYWwuZW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLmVuZXJneUludGFrZSk7XG4gICAgICBtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwubWVhbFN1bW1hcnkgPSBbXTtcbiAgICAgIG1lYWwubWVhbExvZ1N1bW1hcnlWT1MgJiYgbWVhbC5tZWFsTG9nU3VtbWFyeVZPUy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGl0ZW0uZW5lcmd5ID0gTWF0aC5yb3VuZChpdGVtLmVuZXJneSk7XG4gICAgICAgIGl0ZW0uY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICBpdGVtLmZvb2RMb2dTdW1tYXJ5TGlzdC5tYXAoaXQgPT4ge1xuICAgICAgICAgIGl0LmNvbG9yVGlwID0gdGhpcy5mb29kQ29sb3JUaXBzQXJyW2luZGV4XTtcbiAgICAgICAgICBpdC5lbmVyZ3kgPSBNYXRoLnJvdW5kKGl0LmVuZXJneSlcbiAgICAgICAgICBtZWFsLm1lYWxTdW1tYXJ5LnB1c2goaXQpXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIG1lYWxMaXN0LnB1c2gobWVhbClcbiAgICB9O1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lYWxMaXN0IH0sKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCfpobXpnaLliJ3mrKHmuLLmn5PnmoRtZWFsTGlzdCcsdGhpcy5kYXRhLm1lYWxMaXN0KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5L2T6YeN55u45YWz5L+h5oGvLG9uc2hvd+S4reinpuWPkVxuICAgKi9cbiAgcHVibGljIHJldHJpZXZlRGF0YSgpOiB2b2lkIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICBjb25zdCB0b2RheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIGNvbnN0IGJlZm9yZTMwZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogYmVmb3JlMzBkYXlUaW1lLFxuICAgICAgICBkYXRlX3RvOiB0b2RheVRpbWVcbiAgICAgIH07XG5cbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVdlaWdodExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbGF0ZXN0X3dlaWdodDogcmVzcC5sYXRlc3Rfd2VpZ2h0LnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IG5lYXJEYXRhQXJyOiBhbnkgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsID0gMDsvLyDojrflj5bkuIDkvY3lsI/mlbDngrnnmoTlubPlnYflgLzvvIzlhYjmsYLmgLvlkoxcbiAgICAgICAgcmVzcC53ZWlnaHRfbG9ncy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIGl0ZW0udmFsdWVcbiAgICAgICAgICBjb25zdCBiZWZvcmVOdW1iZXJEYXkgPSAodG9kYXlUaW1lIC0gaXRlbS5kYXRlKSAvIDg2NDAwXG4gICAgICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IG1vbWVudChpdGVtLmRhdGUgKiAxMDAwKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgbmVhckRhdGFBcnJbMzAgLSBiZWZvcmVOdW1iZXJEYXldID0geyB3ZWVrOiBmb3JtYXREYXRlLCB2YWx1ZTogaXRlbS52YWx1ZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IE1hdGgucm91bmQodG90YWwgKiAxMCAvIHJlc3Aud2VpZ2h0X2xvZ3MubGVuZ3RoKSAvIDEwXG4gICAgICAgIC8vIOeogOeWj+aVsOe7hOmcgOimgeeUqGZvcu+8jOS4jeiDveeUqG1hcOOAglxuICAgICAgICAvLyAzMOWkqeWGheeUqOaIt+esrOS4gOS4quayoeacieabtOaWsOS9k+mHjeeahOaXpeacn+i1i+WAvOS4uuS9k+mHjeW5s+Wdh+WAvO+8jOWIq+eahOaXpeacn+mDvei1i+WAvOS4um51bGxcbiAgICAgICAgbGV0IGxlbiA9IG5lYXJEYXRhQXJyLmxlbmd0aDtcbiAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFuZWFyRGF0YUFycltpXSAmJiBmbGFnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBhdmVyYWdlLCBhdmc6IDIwMDAgfVxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIGlmICghbmVhckRhdGFBcnJbaV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMCAtIGksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6IG51bGwsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICAgICAgICBjaGFydC5jaGFuZ2VEYXRhKG5lYXJEYXRhQXJyKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pXG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pSx0b2tlbjonK3Rva2VuKycs5oql6ZSZJytKU09OLnN0cmluZ2lmeShlcnIpXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHB1YmxpYyBnb1dlaWdodFJlY29yZCgpIHtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleCcgfSlcbiAgfVxuICBwdWJsaWMgbG9naW4oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICB2YXIgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbUxvZ2luKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgc3dpdGNoICh1c2VyU3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIDE6IC8vdmFsaWRhdGlvbiBwYWdlXG4gICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6IC8vb25Cb2FyZGluZyBwcm9jZXNzIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbihyZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9vbkJvYXJkL29uQm9hcmQnIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOiAvL2tlZXAgaXQgYXQgaG9tZSBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4ocmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnJldHJpZXZlRGF0YSgpOyAvLyDojrflj5bkvZPph43orrDlvZVcbiAgICAgICAgICAgICAgICB0aGF0LmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh0aGF0Lm1lYWxEYXRlKTtcbiAgICAgICAgICAgICAgICB0aGF0LmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhhdC5tZWFsRGF0ZSk7XG4gICAgICAgICAgICAgICAgLy8gdGhhdC5nZXRXZVJ1bkRhdGEocmVzcC5zZXNzaW9uS2V5KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgY29udGVudDogJ+mmlumhteeZu+mZhuWksei0pScsXG4gICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyBnZXRXZVJ1bkRhdGEoc2Vzc2lvbktleSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRXZVJ1bkRhdGEoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICB0aGF0LnJ1blN0ZXBJbmZvKHNlc3Npb25LZXkscmVzKVxuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKCFyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLndlcnVuJ10pIHtcbiAgICAgICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ+aPkOekuicsXG4gICAgICAgICAgICAgICAgY29udGVudDogJ+iOt+WPluW+ruS/oei/kOWKqOatpeaVsO+8jOmcgOimgeW8gOWQr+iuoeatpeadg+mZkCcsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v6Lez6L2s5Y676K6+572uXG4gICAgICAgICAgICAgICAgICAgIHd4Lm9wZW5TZXR0aW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmxvZ2luKClcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL+S4jeiuvue9rlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgcnVuU3RlcEluZm8oc2Vzc2lvbktleSxyKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHJlcXVlc3QucnVuU3RlcEluZm8oe1xuICAgICAgc2Vzc2lvbktleSxcbiAgICAgIGVuY3J5cHRlZERhdGE6ci5lbmNyeXB0ZWREYXRhLFxuICAgICAgaXZTdHI6ci5pdlxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICB0aGF0LmZvcm1hdFN0ZXAocmVzLHRoYXQubWVhbERhdGUpXG4gICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOifojrflj5blvq7kv6HmraXmlbDlpLHotKUnLGljb246J25vbmUnfSlcbiAgICAgIGNvbnNvbGUubG9nKCfojrflj5blvq7kv6HmraXmlbDlpLHotKUnKVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGZvcm1hdFN0ZXAoc3RlcEFycixtZWFsRGF0ZSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBsZXQgc3RlcDtcbiAgICBzdGVwQXJyLm1hcChpdGVtPT57XG4gICAgICBpdGVtLnRpbWUgPSBtb21lbnQoaXRlbS50aW1lc3RhbXAqMTAwMCkuZm9ybWF0KCdZWVlZLU1NLUREJylcbiAgICAgIGNvbnN0IHRvZGF5VGltZSA9IG1vbWVudChtZWFsRGF0ZSoxMDAwKS5mb3JtYXQoJ1lZWVktTU0tREQnKVxuICAgICAgaWYoaXRlbS50aW1lPT09dG9kYXlUaW1lKXtcbiAgICAgICAgc3RlcCA9IGl0ZW0uc3RlcFxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIHd4UnVuU3RlcEFycjpzdGVwQXJyLFxuICAgICAgc3RlcFxuICAgIH0sKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCflvq7kv6Hov5DliqjmraXmlbA9PicsdGhpcy5kYXRhLnd4UnVuU3RlcEFycilcbiAgICB9KVxuICB9XG4gIHB1YmxpYyBhdXRoZW50aWNhdGlvblJlcXVlc3QoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTMnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHB1YmxpYyBnb051dHJpdGlvbmFsRGF0YWJhc2VQYWdlKCkge1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6ICcvcGFnZXMvbnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UvaW5kZXgnIH0pXG4gIH1cblxuICBwdWJsaWMgYmluZE5hdmlUb090aGVyTWluaUFwcCgpIHtcbiAgICAvL3Rlc3Qgb24gbmF2aWdhdGUgbWluaVByb2dyYW1cbiAgICB3eC5uYXZpZ2F0ZVRvTWluaVByb2dyYW0oe1xuICAgICAgYXBwSWQ6ICd3eDRiNzQyMjhiYWExNTQ4OWEnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBlbnZWZXJzaW9uOiAnZGV2ZWxvcCcsXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIC8vIOaJk+W8gOaIkOWKn1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2NjZXNzIG5hdmlnYXRlXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyB0cmlnZ2VyQmluZGdldGRhdGUoKSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoJyNjYWxlbmRhcicpLmRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLy93aGVuIG9wZW5uaW5nIHRoZSBjYWxlbmRhclxuICBwdWJsaWMgYmluZHNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICB9XG5cbiAgLy/pu5jorqTkuLvliqjkvJrop6blj5HkuIDmrKFcbiAgcHVibGljIGJpbmRnZXRkYXRlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgdGltZSA9IGV2ZW50LmRldGFpbDtcbiAgICBsZXQgbmF2VGl0bGVUaW1lID0gdGltZS55ZWFyICsgJy8nICsgdGltZS5tb250aCArICcvJyArIHRpbWUuZGF0ZTtcbiAgICBsZXQgZGF0ZSA9IG1vbWVudChbdGltZS55ZWFyLCB0aW1lLm1vbnRoIC0gMSwgdGltZS5kYXRlXSk7IC8vIE1vbWVudCBtb250aCBpcyBzaGlmdGVkIGxlZnQgYnkgMVxuXG4gICAgdGhpcy5tZWFsRGF0ZSA9IGRhdGUudW5peCgpO1xuICAgIGlmIChhcHAuZ2xvYmFsRGF0YS5tZWFsRGF0ZSkge1xuICAgICAgdGhpcy5tZWFsRGF0ZSA9IGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlO1xuICAgICAgbmF2VGl0bGVUaW1lID0gbW9tZW50KHRoaXMubWVhbERhdGUgKiAxMDAwKS5mb3JtYXQoJ1lZWVkvTU0vREQnKVxuICAgICAgYXBwLmdsb2JhbERhdGEubWVhbERhdGUgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0b2RheVRpbWVTdGFtcCA9IG1vbWVudChuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBmb3JtYXRNZWFsRGF0YSA9IG1vbWVudCh0aGlzLm1lYWxEYXRlICogMTAwMCk7XG4gICAgaWYgKHRvZGF5VGltZVN0YW1wLmlzU2FtZShmb3JtYXRNZWFsRGF0YSwgJ2QnKSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiAn5LuK5aSpJyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWUgfSlcbiAgICB9XG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbilcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBpZih0b2tlbiYmdG9rZW4ubGVuZ3RoPj0yMCl7XG4gICAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSkgLy8g6I635Y+WY2FudmFz5L+h5oGvXG4gICAgICB0aGlzLmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh0aGlzLm1lYWxEYXRlKSBcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ3RoaXMuZGF0YS5zdGVwJyx0aGlzLmRhdGEuc3RlcClcbiAgICBpZih0aGlzLmRhdGEuc3RlcCYmdGhpcy5kYXRhLnN0ZXAhPT0nLS8tJyl7XG4gICAgICB0aGlzLmZvcm1hdFN0ZXAodGhpcy5kYXRhLnd4UnVuU3RlcEFycix0aGlzLm1lYWxEYXRlKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbkRhaWx5UmVwb3J0Q2xpY2soKSB7XG4gICAgaWYgKHRoaXMuZGF0YS5zY29yZSA9PT0gMCkge1xuICAgICAgd3guYWxkc3RhdC5zZW5kRXZlbnQoICfngrnlh7vmn6XnnIvml6XmiqUnLCB7cGFnZTonaG9tZScsc3RhdHVzOjB9ICApXG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgY29udGVudDogXCLmgqjku4rlpKnov5jmsqHmnInmt7vliqDpo5/nianlk6ZcIixcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgIGNvbmZpcm1UZXh0OiAn5Y675re75YqgJ1xuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB3eC5hbGRzdGF0LnNlbmRFdmVudCggJ+eCueWHu+afpeeci+aXpeaKpScsIHtwYWdlOidob21lJyxzdGF0dXM6MX0gKVxuICAgIHRoaXMudXNlckxldmVsKClcbiAgfVxuICAvLyDmn6XnnIvnlKjmiLfmnInmsqHmnInovpPlhaXpgoDor7fnoIHms6jlhoxcbiAgcHVibGljIHVzZXJMZXZlbCgpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICByZXF1ZXN0LnVzZXJMZXZlbCgpLnRoZW4ocmVzPT57XG4gICAgICBpZihyZXMubGV2ZWw9PT0xKXsgLy8g6L6T5YWl6L+H6YKA6K+356CBXG4gICAgICAgIHRoYXQuZ2V0VXNlclByb2ZpbGVCeVRva2VuKClcbiAgICAgIH1lbHNle1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHt1cmw6Jy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9kYWlseVBhZ2UvaW5kZXgnfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8vIOiOt+WPlui3s+i9rOaXpeaKpUg16ZO+5o6l5L+h5oGvXG4gIHB1YmxpYyBnZXRVc2VyUHJvZmlsZUJ5VG9rZW4oKXtcbiAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICByZXF1ZXN0LmdldFVzZXJQcm9maWxlQnlUb2tlbih7IHRva2VuIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICBsZXQgdXNlcklkOiBzdHJpbmcgPSByZXNwLnVzZXJJZDtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IGAvcGFnZXMvcmVwb3J0UGFnZS9yZXBvcnRQYWdlP3VzZXJJZD0ke3VzZXJJZH0mZGF0ZT0ke3RoaXMubWVhbERhdGV9YCB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLm1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHRoaXMubWVhbEluZGV4ICsgMTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBcbiAgICAgIHNob3dNYXNrOiB0cnVlLFxuICAgICAgbWVhbFR5cGU6IHRoaXMubWVhbFR5cGVcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGhhbmRsZUNob29zZVVwbG9hZFR5cGUoZTogYW55KSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgfSk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBzaG93TWFzazogZmFsc2UgfSlcbiAgfVxuXG4gIHB1YmxpYyBjaG9vc2VJbWFnZShzb3VyY2VUeXBlOiBzdHJpbmcpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guY2hvb3NlSW1hZ2Uoe1xuICAgICAgY291bnQ6IDEsXG4gICAgICBzaXplVHlwZTogWydvcmlnaW5hbCcsICdjb21wcmVzc2VkJ10sXG4gICAgICBzb3VyY2VUeXBlOiBbc291cmNlVHlwZV0sXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzOiBhbnkpIHtcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLkuIrkvKDkuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICAgICAgLy8gdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgbGV0IGltYWdlUGF0aCA9IHJlcy50ZW1wRmlsZVBhdGhzWzBdO1xuICAgICAgICB0aGF0LnBhdGggPSBpbWFnZVBhdGg7XG4gICAgICAgIHVwbG9hZEZpbGUoaW1hZ2VQYXRoLCB0aGF0Lm9uSW1hZ2VVcGxvYWRTdWNjZXNzLCB0aGF0Lm9uSW1hZ2VVcGxvYWRGYWlsZWQsIHRoYXQub25VcGxvYWRQcm9ncmVzc2luZywgMCwgMCk7XG4gICAgICB9LFxuICAgICAgZmFpbDogZnVuY3Rpb24gKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZFN1Y2Nlc3MoKSB7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICcuLy4uLy4uL2hvbWVTdWIvcGFnZXMvaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9JyArIHRoaXMucGF0aCArIFwiJm1lYWxUeXBlPVwiICsgdGhpcy5tZWFsVHlwZSArIFwiJm1lYWxEYXRlPVwiICsgdGhpcy5tZWFsRGF0ZSArIFwiJnRpdGxlPVwiICsgdGhpcy5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpIHtcbiAgICBjb25zb2xlLmxvZyhcInVwbG9hZGZhaWxlZFwiKTtcbiAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJwcm9ncmVzczpcIik7XG4gIH1cblxuICBwdWJsaWMgbmF2aVRvRm9vZERldGFpbChldmVudDogYW55KSB7XG4gICAgY29uc3QgZGVmYXVsdEltYWdlVXJsID0gXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9taW5pLWFwcC1pbWFnZS9kZWZhdWx0SW1hZ2UvdGV4dHNlYXJjaC1kZWZhdWx0LWltYWdlLnBuZ1wiO1xuICAgIGxldCBtZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIGxldCBpbWFnZUluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmltYWdlSW5kZXg7XG4gICAgbGV0IG1lYWxJZCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxMb2dTdW1tYXJ5Vk9TW2ltYWdlSW5kZXhdLm1lYWxMb2dJZDtcbiAgICBsZXQgaW1hZ2VVcmwgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTG9nU3VtbWFyeVZPU1tpbWFnZUluZGV4XS5pbWFnZVVybDtcbiAgICBpbWFnZVVybCA9IGltYWdlVXJsID09IFwiXCIgPyBkZWZhdWx0SW1hZ2VVcmwgOiBpbWFnZVVybDtcbiAgICBsZXQgcGFyYW0gPSB7fTtcbiAgICBwYXJhbS5tZWFsSW5kZXggPSBtZWFsSW5kZXg7IC8vIOS8oOWIsGZvb2REZXRhaWzpobXpnaLvvIzlgZrmm7TmlrDlip/og71cbiAgICBwYXJhbS5pbWFnZUluZGV4ID0gaW1hZ2VJbmRleDsgLy8g5Lyg5YiwZm9vZERldGFpbOmhtemdou+8jOWBmuabtOaWsOWKn+iDvVxuICAgIHBhcmFtLm1lYWxJZCA9IG1lYWxJZDtcbiAgICBwYXJhbS5pbWFnZVVybCA9IGltYWdlVXJsO1xuICAgIGxldCBwYXJhbUpzb24gPSBKU09OLnN0cmluZ2lmeShwYXJhbSk7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6IFwiLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2Zvb2REZXRhaWwvaW5kZXg/cGFyYW1Kc29uPVwiICsgcGFyYW1Kc29uXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOWFs+mXrXNob3dNYXNrXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlSGlkZGVuTWFzaygpIHtcbiAgICBpZiAodGhpcy5kYXRhLnNob3dNYXNrKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBzaG93TWFzazogZmFsc2UgfSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICBwdWJsaWMgaGFuZGxlR29TY29yZVByaXplKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDonLi4vLi4vaG9tZVN1Yi9wYWdlcy9zY29yZVByaXplL2luZGV4JyB9KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVHb01vdGlvblN0ZXAoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOmAuLi8uLi9ob21lU3ViL3BhZ2VzL21vdGlvblN0ZXAvaW5kZXg/c3RlcD0ke3RoaXMuZGF0YS5zdGVwfWAgfSlcbiAgfVxuICBwdWJsaWMgaGFuZGxlQ2xvY2tCcmVha0Zhc3QoKXtcbiAgICBjb25zdCBob3VyID0gbW9tZW50KCkuZm9ybWF0KCdISCcpXG4gICAgaWYoIGhvdXI+MTAgfHwgaG91cjw0ICl7XG4gICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICB0aXRsZTon5pep6aSQ5omT5Y2h5pe26Ze05Li6NOeCuS0xMOeCuScsXG4gICAgICAgIGljb246J25vbmUnXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5tZWFsSW5kZXggPSAwO1xuICAgICAgdGhpcy5tZWFsVHlwZSA9IDE7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBcbiAgICAgICAgc2hvd01hc2s6IHRydWUsXG4gICAgICAgIG1lYWxUeXBlOiAxXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGlhcnlQYWdlKCkpXG4iXX0=