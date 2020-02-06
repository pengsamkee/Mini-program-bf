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
        };
        this.mealType = 0;
        this.mealDate = 0;
        this.path = '';
        this.foodColorTipsArr = ['#0074d9', '#ffdc00', '#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
        this.mealIndex = 0;
    }
    FoodDiaryPage.prototype.onLoad = function () {
        wx.navigateTo({ url: './../../homeSub/pages/scorePrize/index' });
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    };
    FoodDiaryPage.prototype.onShow = function () {
        this.login();
        if (this.mealDate !== 0) {
            this.getDailyMealLogGroupFoodLogDetail(this.mealDate);
            this.getDailyMacronutrientSummary(this.mealDate);
        }
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
                wx.showToast({ title: '获取食物记录失败', icon: 'none' });
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
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
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
                console.log('获取体重数据失败', err);
                wx.showModal({
                    title: '',
                    content: '获取体重数据失败',
                    showCancel: false
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
                                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                                wx.reLaunch({ url: '/pages/onBoard/onBoard' });
                            }
                            break;
                        case 3:
                            if (resp.token) {
                                wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                                webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
                                that.authenticationRequest();
                                that.retrieveData();
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
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
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
        this.getDailyMacronutrientSummary(this.mealDate);
        this.getDailyMealLogGroupFoodLogDetail(this.mealDate);
    };
    FoodDiaryPage.prototype.onDailyReportClick = function () {
        var _this = this;
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
        wx.showLoading({ title: "加载中..." });
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
        this.setData({ showMask: true });
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
    FoodDiaryPage.prototype.handleClockBreakFast = function () {
        var hour = moment().format('HH');
        if (hour > 20 || hour < 4) {
            wx.showToast({
                title: '早餐打卡时间为4点-10点',
                icon: 'none'
            });
        }
        else {
            this.mealIndex = 0;
            this.mealType = 1;
            this.setData({ showMask: true });
        }
    };
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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SUFDTSwwQ0FBa0IsR0FBekI7UUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFDLHNDQUFzQyxFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBQ00sNENBQW9CLEdBQTNCO1FBQ0UsSUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xDLElBQUksSUFBSSxHQUFDLEVBQUUsSUFBSSxJQUFJLEdBQUMsQ0FBQyxFQUFFO1lBQ3JCLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ1gsS0FBSyxFQUFDLGVBQWU7Z0JBQ3JCLElBQUksRUFBQyxNQUFNO2FBQ1osQ0FBQyxDQUFBO1NBQ0g7YUFBSTtZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtTQUMxQztJQUNILENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUFuZ0JELElBbWdCQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcblxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQge1xuICBSZXRyaWV2ZUZvb2REaWFyeVJlcSwgUmV0cmlldmVGb29kRGlhcnlSZXNwLFxuICBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSxcbiAgUmV0cmlldmVNZWFsTG9nUmVxLCBNZWFsTG9nUmVzcCwgRm9vZExvZ0luZm8sIE1lYWxJbmZvXG59IGZyb20gXCIuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzXCI7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqaW5pdCBmMiBjaGFydCBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5sZXQgY2hhcnQgPSBudWxsO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHtcbiAgbGV0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuYXhpcygnd2VlaycsIHsgIC8v5a+5d2Vla+WvueW6lOeahOe6teaoquWdkOagh+i9tOi/m+ihjOmFjee9rlxuICAgIGdyaWQ6IG51bGwsICAvL+e9keagvOe6v1xuICAgIHRpY2tMaW5lOiBudWxsLFxuICAgIGxhYmVsOiBudWxsLFxuICAgIGxpbmU6IG51bGxcbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZXbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBpdGVtc1swXS5vcmlnaW4ud2VlaztcbiAgICAgIGl0ZW1zWzBdLnZhbHVlID0gaXRlbXNbMF0udmFsdWUgKyAna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsIFwidmFsdWVcIl0pXG4gICAgLnN0eWxlKHsgZmlsbDogJyNmZmZmZmYnLCByOiAxLjcsIGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnI2YzNDY1YScgfSk7XG4gIGNoYXJ0LmxpbmUoe1xuICAgIGNvbm5lY3ROdWxsczogdHJ1ZSAvLyDphY3nva7vvIzov57mjqXnqbrlgLzmlbDmja5cbiAgfSkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIikuc2hhcGUoJ3Ntb290aCcpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xuXG5cbn1cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKmVuZCBvZiBmMiBjaGFydCBpbml0KioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBuYW1lOiBcIueDremHj1wiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLljYPljaFcIiB9LFxuICAgICAgeyBuYW1lOiBcIuiEguiCqlwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIueis+awtFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIuibi+eZvei0qFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9XG4gICAgXSxcbiAgICBtZWFsTGlzdDogW3tcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLml6nppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMSxcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9LHtcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLljYjppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMixcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9LHtcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLmmZrppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMyxcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9XSxcbiAgICBzY29yZTogJy0tJyxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51VmlhbWFOaWFCaWJZS2liZ3lWaGljUHpTNVB6T3JWbjZtT2RXYUttTmR3Y1pLWDkzejlCSlR0d25KQ3FpYWF1Rmh1MFdvRDN0d2FGdmpqV0dMQS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6ICcnLC8v5a+86Iiq5qCP5aSE5pi+56S655qE5pe26Ze0XG4gICAgbGF0ZXN0X3dlaWdodDogJyAnLFxuICAgIHNob3dNYXNrOiBmYWxzZSxcbiAgICBzdGF0dXNIZWlnaHQ6IG51bGwsXG4gICAgbmF2SGVpZ2h0OiBudWxsLFxuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywgJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddO1xuICBwdWJsaWMgbWVhbEluZGV4ID0gMDtcblxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgd3gubmF2aWdhdGVUbyh7dXJsOicuLy4uLy4uL2hvbWVTdWIvcGFnZXMvc2NvcmVQcml6ZS9pbmRleCd9KVxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5sb2dpbigpO1xuICAgIC8vIGNvbWZpcm1NZWFs6aG16Z2i5re75Yqg5a6M6aOf54mp5ZCOIOS8muinpuWPkVxuICAgIGlmICh0aGlzLm1lYWxEYXRlICE9PSAwKSB7XG4gICAgICB0aGlzLmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh0aGlzLm1lYWxEYXRlKTtcbiAgICAgIHRoaXMuZ2V0RGFpbHlNYWNyb251dHJpZW50U3VtbWFyeSh0aGlzLm1lYWxEYXRlKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25SZWFkeSgpIHtcbiAgICBpZiAoYXBwLmdsb2JhbERhdGEuc3RhdHVzSGVpZ2h0ID09IG51bGwgfHwgYXBwLmdsb2JhbERhdGEubmF2SGVpZ2h0ID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHN5c3RlbUluZm8gPSB3eC5nZXRTeXN0ZW1JbmZvU3luYygpXG4gICAgICBjb25zdCBzdGF0dXNIZWlnaHQgPSBzeXN0ZW1JbmZvLnN0YXR1c0JhckhlaWdodFxuICAgICAgY29uc3QgaXNpT1MgPSBzeXN0ZW1JbmZvLnN5c3RlbS5pbmRleE9mKCdpT1MnKSA+IC0xXG4gICAgICB2YXIgbmF2SGVpZ2h0O1xuICAgICAgaWYgKCFpc2lPUykgeyAvLyDlronljZNcbiAgICAgICAgbmF2SGVpZ2h0ID0gNDg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZIZWlnaHQgPSA0NDtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHN0YXR1c0hlaWdodCxcbiAgICAgICAgbmF2SGVpZ2h0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgc3RhdHVzSGVpZ2h0OiBhcHAuZ2xvYmFsRGF0YS5zdGF0dXNIZWlnaHQsXG4gICAgICAgIG5hdkhlaWdodDogYXBwLmdsb2JhbERhdGEubmF2SGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOW+l+WIsOmmlumhtWNhbnZhc+aVsOaNrlxuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoZGF0ZSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoeyBkYXRlIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKDg4LCBlcnIpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKSB7XG4gICAgY29uc3QgZm9ybWF0ID0gKG51bSkgPT4gTWF0aC5yb3VuZChudW0pO1xuICAgIGxldCBzY29yZSA9IHJlcy5zY29yZTtcbiAgICBsZXQgbnV0cmllbnRTdW1tYXJ5ID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiBcIueDremHj1wiLFxuICAgICAgICBwZXJjZW50OiBmb3JtYXQocmVzLmVuZXJneUludGFrZSAvIHJlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSAqIDEwMCksXG4gICAgICAgIGludGFrZU51bTogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UpLFxuICAgICAgICB0b3RhbE51bTogZm9ybWF0KHJlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSksXG4gICAgICAgIHVuaXQ6IFwi5Y2D5Y2hXCJcbiAgICAgIH0sXG4gICAgXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMubWFjcm9udXRyaWVudEludGFrZSkge1xuICAgICAgY29uc3QgaXRlbSA9IHJlcy5tYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGl0ZW0ubmFtZSA9IGl0ZW0ubmFtZUNOO1xuICAgICAgaXRlbS5wZXJjZW50ID0gZm9ybWF0KGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKTtcbiAgICAgIGl0ZW0uaW50YWtlTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLmludGFrZSk7XG4gICAgICBpdGVtLnRvdGFsTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLnN1Z2dlc3RlZEludGFrZSk7XG4gICAgICBpdGVtLnVuaXQgPSBcIuWFi1wiO1xuICAgICAgbnV0cmllbnRTdW1tYXJ5LnB1c2goaXRlbSlcbiAgICB9XG4gICAgbnV0cmllbnRTdW1tYXJ5Lm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KGAjY2lyY2xlJHtpbmRleH1gKS5kcmF3Q2lyY2xlKGBjYW52YXNgLCA3NSwgNCwgaXRlbS5wZXJjZW50IC8gMTAwICogMilcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbnV0cmllbnRTdW1tYXJ5OiBudXRyaWVudFN1bW1hcnksXG4gICAgICBzY29yZTogc2NvcmVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bppa7po5/orrDlvZXnm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBnZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwoZGF0ZSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh7IGRhdGUgfSkudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGF0LnBhcnNlRGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHJlcyk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICB3eC5zaG93VG9hc3QoeyB0aXRsZTogJ+iOt+WPlumjn+eJqeiusOW9leWksei0pScsIGljb246ICdub25lJyB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDop6PmnpDppa7po5/orrDlvZXnm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChyZXMpIHtcbiAgICBsZXQgbWVhbExpc3QgPSBbXVxuICAgIGZvciAobGV0IGluZGV4IGluIHJlcykge1xuICAgICAgbGV0IG1lYWwgPSByZXNbaW5kZXhdO1xuICAgICAgbWVhbC5lbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwuZW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UpO1xuICAgICAgbWVhbC5tZWFsU3VtbWFyeSA9IFtdO1xuICAgICAgbWVhbC5tZWFsTG9nU3VtbWFyeVZPUyAmJiBtZWFsLm1lYWxMb2dTdW1tYXJ5Vk9TLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgaXRlbS5lbmVyZ3kgPSBNYXRoLnJvdW5kKGl0ZW0uZW5lcmd5KTtcbiAgICAgICAgaXRlbS5jb2xvclRpcCA9IHRoaXMuZm9vZENvbG9yVGlwc0FycltpbmRleF07XG4gICAgICAgIGl0ZW0uZm9vZExvZ1N1bW1hcnlMaXN0Lm1hcChpdCA9PiB7XG4gICAgICAgICAgaXQuY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICAgIGl0LmVuZXJneSA9IE1hdGgucm91bmQoaXQuZW5lcmd5KVxuICAgICAgICAgIG1lYWwubWVhbFN1bW1hcnkucHVzaChpdClcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgbWVhbExpc3QucHVzaChtZWFsKVxuICAgIH07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVhbExpc3QgfSwoKT0+e1xuICAgICAgY29uc29sZS5sb2coJ+mhtemdouWIneasoea4suafk+eahG1lYWxMaXN0Jyx0aGlzLmRhdGEubWVhbExpc3QpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkvZPph43nm7jlhbPkv6Hmga8sb25zaG935Lit6Kem5Y+RXG4gICAqL1xuICBwdWJsaWMgcmV0cmlldmVEYXRhKCk6IHZvaWQge1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICBjb25zdCB0b2RheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIGNvbnN0IGJlZm9yZTMwZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogYmVmb3JlMzBkYXlUaW1lLFxuICAgICAgICBkYXRlX3RvOiB0b2RheVRpbWVcbiAgICAgIH07XG5cbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVdlaWdodExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbGF0ZXN0X3dlaWdodDogcmVzcC5sYXRlc3Rfd2VpZ2h0LnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IG5lYXJEYXRhQXJyOiBhbnkgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsID0gMDsvLyDojrflj5bkuIDkvY3lsI/mlbDngrnnmoTlubPlnYflgLzvvIzlhYjmsYLmgLvlkoxcbiAgICAgICAgcmVzcC53ZWlnaHRfbG9ncy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIGl0ZW0udmFsdWVcbiAgICAgICAgICBjb25zdCBiZWZvcmVOdW1iZXJEYXkgPSAodG9kYXlUaW1lIC0gaXRlbS5kYXRlKSAvIDg2NDAwXG4gICAgICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IG1vbWVudChpdGVtLmRhdGUgKiAxMDAwKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgbmVhckRhdGFBcnJbMzAgLSBiZWZvcmVOdW1iZXJEYXldID0geyB3ZWVrOiBmb3JtYXREYXRlLCB2YWx1ZTogaXRlbS52YWx1ZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IE1hdGgucm91bmQodG90YWwgKiAxMCAvIHJlc3Aud2VpZ2h0X2xvZ3MubGVuZ3RoKSAvIDEwXG4gICAgICAgIC8vIOeogOeWj+aVsOe7hOmcgOimgeeUqGZvcu+8jOS4jeiDveeUqG1hcOOAglxuICAgICAgICAvLyAzMOWkqeWGheeUqOaIt+esrOS4gOS4quayoeacieabtOaWsOS9k+mHjeeahOaXpeacn+i1i+WAvOS4uuS9k+mHjeW5s+Wdh+WAvO+8jOWIq+eahOaXpeacn+mDvei1i+WAvOS4um51bGxcbiAgICAgICAgbGV0IGxlbiA9IG5lYXJEYXRhQXJyLmxlbmd0aDtcbiAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFuZWFyRGF0YUFycltpXSAmJiBmbGFnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBhdmVyYWdlLCBhdmc6IDIwMDAgfVxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIGlmICghbmVhckRhdGFBcnJbaV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMCAtIGksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6IG51bGwsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICAgICAgICBjaGFydC5jaGFuZ2VEYXRhKG5lYXJEYXRhQXJyKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bkvZPph43mlbDmja7lpLHotKUnLCBlcnIpXG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bkvZPph43mlbDmja7lpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHB1YmxpYyBnb1dlaWdodFJlY29yZCgpIHtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleCcgfSlcbiAgfVxuICBwdWJsaWMgbG9naW4oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICB2YXIgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbUxvZ2luKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgc3dpdGNoICh1c2VyU3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIDE6IC8vdmFsaWRhdGlvbiBwYWdlXG4gICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6IC8vb25Cb2FyZGluZyBwcm9jZXNzIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL29uQm9hcmQvb25Cb2FyZCcgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6IC8va2VlcCBpdCBhdCBob21lIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHRoYXQuYXV0aGVudGljYXRpb25SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5yZXRyaWV2ZURhdGEoKTsgLy8g6I635Y+W5L2T6YeN6K6w5b2VXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiAnLi4vbG9naW4vaW5kZXg/dXNlcl9zdGF0dXM9MydcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICB9XG5cbiAgcHVibGljIGdvTnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UoKSB7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDogJy9wYWdlcy9udXRyaXRpb25hbERhdGFiYXNlUGFnZS9pbmRleCcgfSlcbiAgfVxuXG4gIHB1YmxpYyBiaW5kTmF2aVRvT3RoZXJNaW5pQXBwKCkge1xuICAgIC8vdGVzdCBvbiBuYXZpZ2F0ZSBtaW5pUHJvZ3JhbVxuICAgIHd4Lm5hdmlnYXRlVG9NaW5pUHJvZ3JhbSh7XG4gICAgICBhcHBJZDogJ3d4NGI3NDIyOGJhYTE1NDg5YScsXG4gICAgICBwYXRoOiAnJyxcbiAgICAgIGVudlZlcnNpb246ICdkZXZlbG9wJyxcbiAgICAgIHN1Y2Nlc3MocmVzOiBhbnkpIHtcbiAgICAgICAgLy8g5omT5byA5oiQ5YqfXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Nlc3MgbmF2aWdhdGVcIik7XG4gICAgICB9LFxuICAgICAgZmFpbChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIHRyaWdnZXJCaW5kZ2V0ZGF0ZSgpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudCgnI2NhbGVuZGFyJykuZGF0ZVNlbGVjdGlvbigpXG4gIH1cblxuICAvL3doZW4gb3Blbm5pbmcgdGhlIGNhbGVuZGFyXG4gIHB1YmxpYyBiaW5kc2VsZWN0KGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gIH1cblxuICAvL+m7mOiupOS4u+WKqOS8muinpuWPkeS4gOasoVxuICBwdWJsaWMgYmluZGdldGRhdGUoZXZlbnQ6IGFueSkge1xuXG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgIGxldCB0aW1lID0gZXZlbnQuZGV0YWlsO1xuICAgIGxldCBuYXZUaXRsZVRpbWUgPSB0aW1lLnllYXIgKyAnLycgKyB0aW1lLm1vbnRoICsgJy8nICsgdGltZS5kYXRlO1xuICAgIGxldCBkYXRlID0gbW9tZW50KFt0aW1lLnllYXIsIHRpbWUubW9udGggLSAxLCB0aW1lLmRhdGVdKTsgLy8gTW9tZW50IG1vbnRoIGlzIHNoaWZ0ZWQgbGVmdCBieSAxXG5cbiAgICB0aGlzLm1lYWxEYXRlID0gZGF0ZS51bml4KCk7XG4gICAgaWYgKGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlKSB7XG4gICAgICB0aGlzLm1lYWxEYXRlID0gYXBwLmdsb2JhbERhdGEubWVhbERhdGU7XG4gICAgICBuYXZUaXRsZVRpbWUgPSBtb21lbnQodGhpcy5tZWFsRGF0ZSAqIDEwMDApLmZvcm1hdCgnWVlZWS9NTS9ERCcpXG4gICAgICBhcHAuZ2xvYmFsRGF0YS5tZWFsRGF0ZSA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHRvZGF5VGltZVN0YW1wID0gbW9tZW50KG5ldyBEYXRlKCkpO1xuICAgIGNvbnN0IGZvcm1hdE1lYWxEYXRhID0gbW9tZW50KHRoaXMubWVhbERhdGUgKiAxMDAwKTtcbiAgICBpZiAodG9kYXlUaW1lU3RhbXAuaXNTYW1lKGZvcm1hdE1lYWxEYXRhLCAnZCcpKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWU6ICfku4rlpKknIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5hdlRpdGxlVGltZSB9KVxuICAgIH1cbiAgICAvLyB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSkgLy8g6I635Y+WY2FudmFz5L+h5oGvXG4gICAgdGhpcy5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwodGhpcy5tZWFsRGF0ZSkgXG4gIH1cblxuICBwdWJsaWMgb25EYWlseVJlcG9ydENsaWNrKCkge1xuICAgIGlmICh0aGlzLmRhdGEuc2NvcmUgPT09IDApIHtcbiAgICAgIHd4LmFsZHN0YXQuc2VuZEV2ZW50KCAn54K55Ye75p+l55yL5pel5oqlJywge3BhZ2U6J2hvbWUnLHN0YXR1czowfSAgKVxuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwi5oKo5LuK5aSp6L+Y5rKh5pyJ5re75Yqg6aOf54mp5ZOmXCIsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICBjb25maXJtVGV4dDogJ+WOu+a3u+WKoCdcbiAgICAgIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgd3guYWxkc3RhdC5zZW5kRXZlbnQoICfngrnlh7vmn6XnnIvml6XmiqUnLCB7cGFnZTonaG9tZScsc3RhdHVzOjF9IClcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiIH0pO1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHJlcXVlc3QuZ2V0VXNlclByb2ZpbGVCeVRva2VuKHsgdG9rZW4gfSkudGhlbihyZXNwID0+IHtcbiAgICAgIGxldCB1c2VySWQ6IHN0cmluZyA9IHJlc3AudXNlcklkO1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogYC9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXNlcklkPSR7dXNlcklkfSZkYXRlPSR7dGhpcy5tZWFsRGF0ZX1gIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBhZGRGb29kSW1hZ2UoZXZlbnQ6IGFueSkge1xuICAgIHRoaXMubWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICB0aGlzLm1lYWxUeXBlID0gdGhpcy5tZWFsSW5kZXggKyAxO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHNob3dNYXNrOiB0cnVlIH0pXG4gICAgLy8gd3guc2hvd0FjdGlvblNoZWV0KHtcbiAgICAvLyAgIGl0ZW1MaXN0OiBbJ+aLjeeFp+iusOW9lScsICfnm7jlhownLCAn5paH5a2X5pCc57SiJ10sXG4gICAgLy8gICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgLy8gICAgIHN3aXRjaCAocmVzLnRhcEluZGV4KSB7XG4gICAgLy8gICAgICAgY2FzZSAwOlxuICAgIC8vICAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgLy8gICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAvLyAgICAgICAgICAgc291cmNldHlwZTogJ2NhbWVyYScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMTpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgLy8gICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAvLyAgICAgICAgICAgc291cmNldHlwZTogJ2FsYnVtJyxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgY2FzZSAyOlxuICAgIC8vICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgLy8gICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbE5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVDaG9vc2VVcGxvYWRUeXBlKGU6IGFueSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgaW5kZXggPSBwYXJzZUludChlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbmRleCk7XG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdjYW1lcmEnKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ2NhbWVyYScsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnYWxidW0nKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ2FsYnVtJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFt0aGlzLm1lYWxJbmRleF0ubWVhbFR5cGVOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgICAgIH0pO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgc2hvd01hc2s6IGZhbHNlIH0pXG4gIH1cblxuICBwdWJsaWMgY2hvb3NlSW1hZ2Uoc291cmNlVHlwZTogc3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgc2l6ZVR5cGU6IFsnb3JpZ2luYWwnLCAnY29tcHJlc3NlZCddLFxuICAgICAgc291cmNlVHlwZTogW3NvdXJjZVR5cGVdLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlczogYW55KSB7XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5LiK5Lyg5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgICAgIC8vIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IHRydWU7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXTtcbiAgICAgICAgdGhhdC5wYXRoID0gaW1hZ2VQYXRoO1xuICAgICAgICB1cGxvYWRGaWxlKGltYWdlUGF0aCwgdGhhdC5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhhdC5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGF0Lm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIDAsIDApO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRTdWNjZXNzKCkge1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUgKyBcIiZ0aXRsZT1cIiArIHRoaXMuZGF0YS5tZWFsTGlzdFt0aGlzLm1lYWxJbmRleF0ubWVhbFR5cGVOYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRGYWlsZWQoKSB7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRmYWlsZWRcIik7XG4gICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICB9XG5cbiAgcHVibGljIG9uVXBsb2FkUHJvZ3Jlc3NpbmcoZXZlbnQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3M6XCIpO1xuICB9XG5cbiAgcHVibGljIG5hdmlUb0Zvb2REZXRhaWwoZXZlbnQ6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRJbWFnZVVybCA9IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvZGVmYXVsdEltYWdlL3RleHRzZWFyY2gtZGVmYXVsdC1pbWFnZS5wbmdcIjtcbiAgICBsZXQgbWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICBsZXQgaW1hZ2VJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbWFnZUluZGV4O1xuICAgIGxldCBtZWFsSWQgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTG9nU3VtbWFyeVZPU1tpbWFnZUluZGV4XS5tZWFsTG9nSWQ7XG4gICAgbGV0IGltYWdlVXJsID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbExvZ1N1bW1hcnlWT1NbaW1hZ2VJbmRleF0uaW1hZ2VVcmw7XG4gICAgaW1hZ2VVcmwgPSBpbWFnZVVybCA9PSBcIlwiID8gZGVmYXVsdEltYWdlVXJsIDogaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtID0ge307XG4gICAgcGFyYW0ubWVhbEluZGV4ID0gbWVhbEluZGV4OyAvLyDkvKDliLBmb29kRGV0YWls6aG16Z2i77yM5YGa5pu05paw5Yqf6IO9XG4gICAgcGFyYW0uaW1hZ2VJbmRleCA9IGltYWdlSW5kZXg7IC8vIOS8oOWIsGZvb2REZXRhaWzpobXpnaLvvIzlgZrmm7TmlrDlip/og71cbiAgICBwYXJhbS5tZWFsSWQgPSBtZWFsSWQ7XG4gICAgcGFyYW0uaW1hZ2VVcmwgPSBpbWFnZVVybDtcbiAgICBsZXQgcGFyYW1Kc29uID0gSlNPTi5zdHJpbmdpZnkocGFyYW0pO1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiBcIi4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9mb29kRGV0YWlsL2luZGV4P3BhcmFtSnNvbj1cIiArIHBhcmFtSnNvblxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiDlhbPpl61zaG93TWFza1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUhpZGRlbk1hc2soKSB7XG4gICAgaWYgKHRoaXMuZGF0YS5zaG93TWFzaykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgc2hvd01hc2s6IGZhbHNlIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgcHVibGljIGhhbmRsZUdvU2NvcmVQcml6ZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6Jy4uLy4uL2hvbWVTdWIvcGFnZXMvc2NvcmVQcml6ZS9pbmRleCcgfSlcbiAgfVxuICBwdWJsaWMgaGFuZGxlQ2xvY2tCcmVha0Zhc3QoKXtcbiAgICBjb25zdCBob3VyID0gbW9tZW50KCkuZm9ybWF0KCdISCcpXG4gICAgaWYoIGhvdXI+MjAgfHwgaG91cjw0ICl7XG4gICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICB0aXRsZTon5pep6aSQ5omT5Y2h5pe26Ze05Li6NOeCuS0xMOeCuScsXG4gICAgICAgIGljb246J25vbmUnXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5tZWFsSW5kZXggPSAwO1xuICAgICAgdGhpcy5tZWFsVHlwZSA9IDE7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBzaG93TWFzazogdHJ1ZSB9KVxuICAgIH1cbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGlhcnlQYWdlKCkpXG4iXX0=