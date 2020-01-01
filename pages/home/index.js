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
            mealList: [],
            score: '--',
            menuInfo: {},
            infoLists: [
                { url: 'https://mp.weixin.qq.com/s/fg1qli0Dk1x9y0WZcOHv8w', image: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuViamaNiaBibYKibgyVhicPzS5PzOrVn6mOdWaKmNdwcZKX93z9BJTtwnJCqiaauFhu0WoD3twaFvjjWGLA/640?wx_fmt=jpeg',
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
        };
        this.mealType = 0;
        this.mealDate = 0;
        this.path = '';
        this.showPersonCheckLoading = false;
        this.foodColorTipsArr = ['#0074d9', '#ffdc00', '#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
        this.mealIndex = 0;
    }
    FoodDiaryPage.prototype.onLoad = function () {
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
        if (app.globalData.menuInfo) {
            this.setData({ menuInfo: app.globalData.menuInfo });
        }
        else {
            var menuInfo = wx.getMenuButtonBoundingClientRect();
            this.setData({ menuInfo: menuInfo });
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
        this.setData({ mealList: mealList }, function () { return console.log(888999000, _this.data.mealList); });
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
                console.log('RetrieveWeightLog', resp);
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
                that.showPersonCheckLoading ? "" : wx.showLoading({ title: '加载中...' });
                var req = { jscode: _res.code };
                loginAPI.MiniProgramLogin(req).then(function (resp) {
                    console.log('获取token成功', resp);
                    that.showPersonCheckLoading ? "" : wx.hideLoading({});
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
                    wx.hideLoading({});
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
        this.setData({ navTitleTime: navTitleTime });
        var date = moment([time.year, time.month - 1, time.date]);
        this.mealDate = date.unix();
        var todayTimeStamp = moment(new Date());
        if (todayTimeStamp.isSame(date, 'd')) {
            this.setData({ navTitleTime: '今天' });
        }
        else {
            this.setData({ navTitleTime: navTitleTime });
        }
        this.getDailyMacronutrientSummary(this.mealDate);
        this.getDailyMealLogGroupFoodLogDetail(this.mealDate);
    };
    FoodDiaryPage.prototype.onDailyReportClick = function () {
        this.retrieveDailyReport(this.mealDate);
    };
    FoodDiaryPage.prototype.retrieveDailyReport = function (currentTimeStamp) {
        wx.showLoading({ title: "加载中..." });
        var req = { date: currentTimeStamp };
        webAPI.RetrieveOrCreateUserReport(req).then(function (resp) {
            var reportUrl = resp.report_url;
            wx.hideLoading();
            if (reportUrl && reportUrl != "") {
                wx.navigateTo({ url: "/pages/reportPage/reportPage?url=" + reportUrl });
            }
            else {
                wx.showModal({
                    title: "",
                    content: "您今天还没有添加食物哦",
                    showCancel: false,
                    confirmText: '去添加'
                });
            }
        }).catch(function (err) { return console.log(err); });
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
                that.showPersonCheckLoading = true;
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
        wx.hideLoading();
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
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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bUQsR0FBRyxTQUFTO1NBQ3JFLENBQUMsQ0FBQztJQUNMLENBQUM7SUFJTSx3Q0FBZ0IsR0FBdkI7UUFDRSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ25CLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBQyxRQUFRLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQTtZQUN2QyxPQUFPLEtBQUssQ0FBQTtTQUNiO0lBQ0gsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQWhzQkQsSUFnc0JDO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIGxvZ2luQVBJIGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFJldHJpZXZlRm9vZERpYXJ5UmVxLCBSZXRyaWV2ZUZvb2REaWFyeVJlc3AsXG4gIFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB1cGxvYWRGaWxlIGZyb20gJy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmxldCBjaGFydCA9IG51bGw7XG5mdW5jdGlvbiBpbml0Q2hhcnQoY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBGMikge1xuICBsZXQgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCwgIC8v572R5qC857q/XG4gICAgdGlja0xpbmU6bnVsbCxcbiAgICBsYWJlbDpudWxsLFxuICAgIGxpbmU6bnVsbFxuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lduS4reaciXgseeWdkOagh+WSjOiiq+eCueWHu+mhueeahOS/oeaBr1xuICAgICAgaXRlbXNbMF0ubmFtZSA9IGl0ZW1zWzBdLm9yaWdpbi53ZWVrO1xuICAgICAgaXRlbXNbMF0udmFsdWUgPSBpdGVtc1swXS52YWx1ZSsna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsXCJ2YWx1ZVwiXSlcbiAgICAuc3R5bGUoeyBmaWxsOiAnI2ZmZmZmZicsIHI6IDEuNywgbGluZVdpZHRoOiAxLCBzdHJva2U6ICcjZjM0NjVhJyB9KTtcbiAgY2hhcnQubGluZSh7XG4gICAgY29ubmVjdE51bGxzOiB0cnVlIC8vIOmFjee9ru+8jOi/nuaOpeepuuWAvOaVsOaNrlxuICB9KS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKS5zaGFwZSgnc21vb3RoJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cbiAgXG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5jbGFzcyBGb29kRGlhcnlQYWdlIHtcbiAgcHVibGljIHVzZXJJbmZvID0ge31cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgb3B0czoge1xuICAgICAgb25Jbml0OiBpbml0Q2hhcnQsXG4gICAgfSxcbiAgICBudXRyaWVudFN1bW1hcnk6IFtcbiAgICAgIHsgbmFtZTogXCLng63ph49cIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbmFtZTogXCLohILogqpcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLnorPmsLRcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLom4vnmb3otKhcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtdLFxuICAgIHNjb3JlOiAnLS0nLFxuICAgIG1lbnVJbmZvOiB7fSxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHsgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsaW1hZ2U6J2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZpYW1hTmlhQmliWUtpYmd5VmhpY1B6UzVQek9yVm42bU9kV2FLbU5kd2NaS1g5M3o5QkpUdHduSkNxaWFhdUZodTBXb0QzdHdhRnZqaldHTEEvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6J+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6JycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OicgJyxcbiAgICBzaG93TWFzazpmYWxzZSxcbiAgfTtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIHBhdGggPSAnJztcbiAgcHVibGljIHNob3dQZXJzb25DaGVja0xvYWRpbmcgPSBmYWxzZTtcbiAgcHVibGljIGZvb2RDb2xvclRpcHNBcnIgPSBbJyMwMDc0ZDknLCAnI2ZmZGMwMCcsJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddO1xuICBwdWJsaWMgbWVhbEluZGV4ID0gMDtcblxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgLy8gd3gubmF2aWdhdGVUbyh7dXJsOicuLy4uLy4uL2hvbWVTdWIvcGFnZXMvbWVhbEFuYWx5c2lzL2luZGV4P21lYWxMb2dJZD0yMDg3NiZtZWFsRGF0ZT0xNTc3Mzc2MDAwJm1lYWxUeXBlPTEnfSlcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5sb2dpbigpO1xuICAgIC8vIGNvbWZpcm1NZWFs6aG16Z2i5re75Yqg5a6M6aOf54mp5ZCOIOS8muinpuWPkVxuICAgIGlmICh0aGlzLm1lYWxEYXRlICE9PSAwKSB7XG4gICAgICAvLyB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICAgIHRoaXMuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHRoaXMubWVhbERhdGUpO1xuICAgICAgdGhpcy5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHRoaXMubWVhbERhdGUpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIG9uUmVhZHkoKXtcbiAgICAvKipcbiAgICAgKiDojrflj5blj7PkuIrop5Log7blm4rlsLrlr7jvvIzorqHnrpfoh6rlrprkuYnmoIfpopjmoI/kvY3nva5cbiAgICAgKi9cbiAgICBpZihhcHAuZ2xvYmFsRGF0YS5tZW51SW5mbyl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZW51SW5mbzogYXBwLmdsb2JhbERhdGEubWVudUluZm8gfSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBtZW51SW5mbyA9IHd4LmdldE1lbnVCdXR0b25Cb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lbnVJbmZvOiBtZW51SW5mbyB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOW+l+WIsOmmlumhtWNhbnZhc+aVsOaNrlxuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoZGF0ZSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXMgXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYodG9rZW4pe1xuICAgICAgcmVxdWVzdC5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHtkYXRlfSkudGhlbihyZXM9PntcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKTtcbiAgICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgICBjb25zb2xlLmxvZyg4OCxlcnIpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKXtcbiAgICBjb25zdCBmb3JtYXQgPSAobnVtKSA9PiBNYXRoLnJvdW5kKG51bSk7XG4gICAgbGV0IHNjb3JlID0gcmVzLnNjb3JlO1xuICAgIGxldCBudXRyaWVudFN1bW1hcnkgPSBbXG4gICAgICB7IFxuICAgICAgICBuYW1lOiBcIueDremHj1wiLCBcbiAgICAgICAgcGVyY2VudDogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UvcmVzLmVuZXJneVJlY29tbWVuZGVkSW50YWtlKjEwMCksIFxuICAgICAgICBpbnRha2VOdW06IGZvcm1hdChyZXMuZW5lcmd5SW50YWtlKSwgXG4gICAgICAgIHRvdGFsTnVtOiBmb3JtYXQocmVzLmVuZXJneVJlY29tbWVuZGVkSW50YWtlKSwgXG4gICAgICAgIHVuaXQ6IFwi5Y2D5Y2hXCIgXG4gICAgICB9LFxuICAgIF07XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzLm1hY3JvbnV0cmllbnRJbnRha2Upe1xuICAgICAgY29uc3QgaXRlbSA9IHJlcy5tYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGl0ZW0ubmFtZSA9IGl0ZW0ubmFtZUNOO1xuICAgICAgaXRlbS5wZXJjZW50ID0gZm9ybWF0KGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKTtcbiAgICAgIGl0ZW0uaW50YWtlTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLmludGFrZSk7XG4gICAgICBpdGVtLnRvdGFsTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLnN1Z2dlc3RlZEludGFrZSk7XG4gICAgICBpdGVtLnVuaXQgPSBcIuWFi1wiIDtcbiAgICAgIG51dHJpZW50U3VtbWFyeS5wdXNoKGl0ZW0pXG4gICAgfVxuICAgIG51dHJpZW50U3VtbWFyeS5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudChgI2NpcmNsZSR7aW5kZXh9YCkuZHJhd0NpcmNsZShgY2FudmFzYCwgNzUsIDQsIGl0ZW0ucGVyY2VudC8xMDAgKiAyKVxuICAgIH0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBudXRyaWVudFN1bW1hcnk6IG51dHJpZW50U3VtbWFyeSxcbiAgICAgIHNjb3JlOiBzY29yZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPlumlrumjn+iusOW9leebuOWFs+S/oeaBr1xuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChkYXRlKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIGlmKHRva2VuKXtcbiAgICAgIHJlcXVlc3QuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHtkYXRlfSkudGhlbihyZXM9PntcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChyZXMpO1xuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiAn6I635Y+W6aOf54mp6K6w5b2V5aSx6LSlJywgaWNvbjogJ25vbmUnIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOino+aekOmlrumjn+iusOW9leebuOWFs+S/oeaBr1xuICAgKi9cbiAgcHVibGljIHBhcnNlRGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHJlcyl7XG4gICAgbGV0IG1lYWxMaXN0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMpe1xuICAgICAgbGV0IG1lYWwgPSByZXNbaW5kZXhdO1xuICAgICAgbWVhbC5lbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwuZW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UpO1xuICAgICAgbWVhbC5tZWFsU3VtbWFyeSA9IFtdO1xuICAgICAgbWVhbC5tZWFsTG9nU3VtbWFyeVZPUyYmbWVhbC5tZWFsTG9nU3VtbWFyeVZPUy5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAgIGl0ZW0uZW5lcmd5ID0gTWF0aC5yb3VuZChpdGVtLmVuZXJneSk7IFxuICAgICAgICBpdGVtLmNvbG9yVGlwID0gdGhpcy5mb29kQ29sb3JUaXBzQXJyW2luZGV4XTtcbiAgICAgICAgaXRlbS5mb29kTG9nU3VtbWFyeUxpc3QubWFwKGl0PT57XG4gICAgICAgICAgaXQuY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICAgIGl0LmVuZXJneSA9IE1hdGgucm91bmQoaXQuZW5lcmd5KVxuICAgICAgICAgIG1lYWwubWVhbFN1bW1hcnkucHVzaChpdClcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgbWVhbExpc3QucHVzaChtZWFsKVxuICAgIH07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHttZWFsTGlzdH0sKCk9PmNvbnNvbGUubG9nKDg4ODk5OTAwMCx0aGlzLmRhdGEubWVhbExpc3QpKVxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS9k+mHjeebuOWFs+S/oeaBryxvbnNob3fkuK3op6blj5FcbiAgICovXG4gIHB1YmxpYyByZXRyaWV2ZURhdGEoKTogdm9pZCB7XG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBjdXJyV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlaygpO1xuICAgIGxldCBmaXJzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDApLnVuaXgoKTtcbiAgICBsZXQgbGFzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLnVuaXgoKTtcblxuICAgIGNvbnN0IHRvZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgY29uc3QgYmVmb3JlMzBkYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN1YnRyYWN0KDMwLCBcImRheXNcIikuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHJlcSA9IHtcbiAgICAgICAgZGF0ZV9mcm9tOiBiZWZvcmUzMGRheVRpbWUsXG4gICAgICAgIGRhdGVfdG86IHRvZGF5VGltZVxuICAgICAgfTtcblxuICAgICAgd2ViQVBJLlJldHJpZXZlV2VpZ2h0TG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JldHJpZXZlV2VpZ2h0TG9nJywgcmVzcCk7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbGF0ZXN0X3dlaWdodDogcmVzcC5sYXRlc3Rfd2VpZ2h0LnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IG5lYXJEYXRhQXJyOmFueSA9IFtdO1xuICAgICAgICBsZXQgdG90YWwgPSAwOy8vIOiOt+WPluS4gOS9jeWwj+aVsOeCueeahOW5s+Wdh+WAvO+8jOWFiOaxguaAu+WSjFxuICAgICAgICByZXNwLndlaWdodF9sb2dzLm1hcChpdGVtPT57XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIGl0ZW0udmFsdWVcbiAgICAgICAgICBjb25zdCBiZWZvcmVOdW1iZXJEYXkgPSAodG9kYXlUaW1lIC0gaXRlbS5kYXRlKSAvIDg2NDAwXG4gICAgICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IG1vbWVudChpdGVtLmRhdGUqMTAwMCkuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgIG5lYXJEYXRhQXJyWzMwIC0gYmVmb3JlTnVtYmVyRGF5XSA9IHsgd2VlazogZm9ybWF0RGF0ZSwgdmFsdWU6IGl0ZW0udmFsdWUsIGF2ZzogMjAwMCB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2UgPSBNYXRoLnJvdW5kKHRvdGFsKjEwIC8gcmVzcC53ZWlnaHRfbG9ncy5sZW5ndGgpLzEwXG4gICAgICAgIC8vIOeogOeWj+aVsOe7hOmcgOimgeeUqGZvcu+8jOS4jeiDveeUqG1hcOOAglxuICAgICAgICAvLyAzMOWkqeWGheeUqOaIt+esrOS4gOS4quayoeacieabtOaWsOS9k+mHjeeahOaXpeacn+i1i+WAvOS4uuS9k+mHjeW5s+Wdh+WAvO+8jOWIq+eahOaXpeacn+mDvei1i+WAvOS4um51bGxcbiAgICAgICAgbGV0IGxlbiA9IG5lYXJEYXRhQXJyLmxlbmd0aDtcbiAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDtpPGxlbjtpKyspe1xuICAgICAgICAgIGlmICghbmVhckRhdGFBcnJbaV0gJiYgZmxhZykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwLWksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6IGF2ZXJhZ2UsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgICBmbGFnID0gZmFsc2VcbiAgICAgICAgICB9IGVsc2UgaWYgKCFuZWFyRGF0YUFycltpXSl7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOm51bGwsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICAgICAgICBjaGFydC5jaGFuZ2VEYXRhKG5lYXJEYXRhQXJyKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bkvZPph43mlbDmja7lpLHotKUnLGVycilcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApO1xuICB9XG5cbiAgcHVibGljIGdvV2VpZ2h0UmVjb3JkKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDonL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleCcgfSlcbiAgfVxuICBwdWJsaWMgbG9naW4oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICAvLyDlj5HpgIEgX3Jlcy5jb2RlIOWIsOWQjuWPsOaNouWPliBvcGVuSWQsIHNlc3Npb25LZXksIHVuaW9uSWRcbiAgICAgICAgdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nP1wiXCI6d3guc2hvd0xvYWRpbmcoeyB0aXRsZTogJ+WKoOi9veS4rS4uLicgfSk7XG4gICAgICAgIHZhciByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlIH07XG4gICAgICAgIGxvZ2luQVBJLk1pbmlQcm9ncmFtTG9naW4ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5Z0b2tlbuaIkOWKnycscmVzcCk7XG4gICAgICAgICAgdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nID8gXCJcIiA6d3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIGxldCB1c2VyU3RhdHVzID0gcmVzcC51c2VyX3N0YXR1cztcbiAgICAgICAgICBzd2l0Y2ggKHVzZXJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgLy92YWxpZGF0aW9uIHBhZ2VcbiAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgLy9vbkJvYXJkaW5nIHByb2Nlc3MgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvb25Cb2FyZC9vbkJvYXJkJyB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgLy9rZWVwIGl0IGF0IGhvbWUgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnJldHJpZXZlRGF0YSgpOyAvLyDojrflj5bkvZPph43orrDlvZVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyKSB7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYbpqozor4HlpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiAnLi4vbG9naW4vaW5kZXg/dXNlcl9zdGF0dXM9MydcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICB9XG5cbiAgcHVibGljIGdvTnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOicvcGFnZXMvbnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UvaW5kZXgnIH0pXG4gIH1cblxuICAvLyBwdWJsaWMgY291bnRSZXBvcnRCYWRnZShyZXNwOiBhbnkpIHtcbiAgLy8gICBsZXQgcmVwb3J0TnVtID0gMDtcbiAgLy8gICBsZXQgcmVwb3J0cyA9IHJlc3AuZGFpbHlfcmVwb3J0O1xuICAvLyAgIGZvciAobGV0IGluZGV4IGluIHJlcG9ydHMpIHtcbiAgLy8gICAgIGxldCByZXBvcnQgPSByZXBvcnRzW2luZGV4XTtcbiAgLy8gICAgIGlmICghcmVwb3J0LmlzX3JlcG9ydF9nZW5lcmF0ZWQgJiYgIXJlcG9ydC5pc19mb29kX2xvZ19lbXB0eSkge1xuICAvLyAgICAgICBsZXQgdG9kYXlUaW1lID0gbW9tZW50KCkuc3RhcnRPZignZGF5JykudW5peCgpO1xuICAvLyAgICAgICBjb25zb2xlLmxvZyh0b2RheVRpbWUpO1xuICAvLyAgICAgICBpZiAocmVwb3J0LmRhdGUgPCB0b2RheVRpbWUgfHwgKHJlcG9ydC5kYXRlID09IHRvZGF5VGltZSAmJiBtb21lbnQobmV3IERhdGUoKSkuaG91cnMgPiAyMikpIHsgICAvL2NvdW50IHRvZGF5IHJlcG9ydHMgc3RhdHVzIGFmdGVyIDE5XG4gIC8vICAgICAgICAgcmVwb3J0TnVtKys7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vICAgaWYgKHJlcG9ydE51bSAhPSAwKSB7XG4gIC8vICAgICB3eC5zZXRUYWJCYXJCYWRnZSh7XG4gIC8vICAgICAgIGluZGV4OiAyLFxuICAvLyAgICAgICB0ZXh0OiBTdHJpbmcocmVwb3J0TnVtKVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSBlbHNlIHtcbiAgLy8gICAgIHd4LnJlbW92ZVRhYkJhckJhZGdlKHtcbiAgLy8gICAgICAgaW5kZXg6IDJcbiAgLy8gICAgIH0pO1xuICAvLyAgIH1cbiAgLy8gfVxuLyoqXG4gKiBhcGnor7fmsYLku4rlpKnmkYTlhaXph4/lkozku4rlpKnppa7po5/orrDlvZVcbiAqL1xuICAvLyBwdWJsaWMgcmV0cmlldmVGb29kRGlhcnlEYXRhKGN1cnJlbnRUaW1lU3RhbXA6IG51bWJlcikge1xuICAvLyAgIGxldCByZXE6IFJldHJpZXZlRm9vZERpYXJ5UmVxID0geyBkYXRlOiBjdXJyZW50VGltZVN0YW1wIH07XG4gIC8vICAgd2ViQVBJLlJldHJpZXZlRm9vZERpYXJ5KHJlcSkudGhlbihyZXNwID0+IHRoaXMuZm9vZERpYXJ5RGF0YVBhcnNpbmcocmVzcCkpLmNhdGNoKGVyciA9PlxuICAvLyAgIGNvbnN0IHRva2VuMSA9IHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKS8v55So5oi35Y+v6IO95rKh5pyJ55m75b2V77yM5q2k5pe25LiN5bqU5by556qXXG4gIC8vICAgICBpZiAoIXdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKSl7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKDg4ODgsIHRva2VuMSlcbiAgLy8gICAgIH1lbHNle1xuICAvLyAgICAgICB3eC5zaG93TW9kYWwoe1xuICAvLyAgICAgICAgIHRpdGxlOiAnJyxcbiAgLy8gICAgICAgICBjb250ZW50OiAn6I635Y+W5pel5b+X5aSx6LSlJyxcbiAgLy8gICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAvLyAgICAgICB9KVxuICAvLyAgICAgfVxuICAvLyAgIClcbiAgLy8gfVxuXG4gIC8vIHB1YmxpYyByZXRyaWV2ZU1lYWxMb2cobWVhbElkOiBudW1iZXIpIHtcbiAgLy8gICBsZXQgcmVxOiBSZXRyaWV2ZU1lYWxMb2dSZXEgPSB7IG1lYWxfaWQ6IG1lYWxJZCB9XG4gIC8vICAgcmV0dXJuIHdlYkFQSS5SZXRyaWV2ZU1lYWxMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgcmV0dXJuIHRoaXMucGFyc2VNZWFsTG9nKHJlc3ApO1xuICAvLyAgIH0pLmNhdGNoKGVyciA9PiB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAvLyAgICAgd3guc2hvd01vZGFsKHtcbiAgLy8gICAgICAgdGl0bGU6ICcnLFxuICAvLyAgICAgICBjb250ZW50OiAn6I635Y+W6aOf54mp5pWw5o2u5aSx6LSlJyxcbiAgLy8gICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgLy8gICAgIH0pXG4gIC8vICAgfVxuICAvLyAgICk7XG4gIC8vIH1cbiAgLy8gcHVibGljIHBhcnNlTWVhbExvZyhyZXNwOiBNZWFsTG9nUmVzcCkge1xuICAvLyAgIGxldCBmb29kTGlzdDogRm9vZFtdID0gW107XG4gIC8vICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5mb29kX2xvZykge1xuICAvLyAgICAgbGV0IGZvb2RMb2c6IEZvb2RMb2dJbmZvID0gcmVzcC5mb29kX2xvZ1tpbmRleF07XG4gIC8vICAgICBsZXQgdW5pdE9iaiA9IGZvb2RMb2cudW5pdF9vcHRpb24uZmluZChvID0+IG8udW5pdF9pZCA9PT0gZm9vZExvZy51bml0X2lkKTtcbiAgLy8gICAgIGxldCB1bml0TmFtZSA9IFwi5Lu9XCJcbiAgLy8gICAgIGlmICh1bml0T2JqKSB7XG4gIC8vICAgICAgIHVuaXROYW1lID0gdW5pdE9iai51bml0X25hbWU7XG4gIC8vICAgICB9XG4gIC8vICAgICBsZXQgZm9vZDogRm9vZCA9IHtcbiAgLy8gICAgICAgZm9vZE5hbWU6IGZvb2RMb2cuZm9vZF9uYW1lLFxuICAvLyAgICAgICBlbmVyZ3k6IE1hdGguZmxvb3IoZm9vZExvZy5lbmVyZ3kgLyAxMDApLFxuICAvLyAgICAgICB1bml0TmFtZTogdW5pdE5hbWUsXG4gIC8vICAgICAgIHdlaWdodDogTWF0aC5yb3VuZChmb29kTG9nLndlaWdodCAvIDEwMClcbiAgLy8gICAgIH1cbiAgLy8gICAgIGZvb2RMaXN0LnB1c2goZm9vZClcbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIGZvb2RMaXN0XG4gIC8vIH1cbiAgLy8gcHVibGljIGxvYWRNZWFsU3VtbWFyeShyZXNwOiBSZXRyaWV2ZUZvb2REaWFyeVJlc3ApIHtcbiAgLy8gICBsZXQgYnJlYWtmYXN0OiBNZWFsO1xuICAvLyAgIGxldCBicmVha2Zhc3RTdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgLy8gICBsZXQgYnJlYWtmYXN0SWRzOiBudW1iZXJbXSA9IFtdIC8v5b6X5Yiw5pep6aSQbWFlbF9pZOaVsOe7hFxuICAvLyAgIHJlc3AuYnJlYWtmYXN0LmZvckVhY2goKGl0ZW0gPT5icmVha2Zhc3RJZHMucHVzaChpdGVtLm1lYWxfaWQpKSlcbiAgLy8gICBjb25zdCBicmVha2Zhc3RQcm9tcyA9IFByb21pc2UuYWxsKGJyZWFrZmFzdElkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgLy8gICAgIHJlc3VsdCA9PiB7XG4gIC8vICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgLy8gICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gIC8vICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoIGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gIC8vICAgICAgICAgYnJlYWtmYXN0U3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTsgLy8gYnJlYWtmYXN0U3VtbWFyeeS4reiOt+W+l+aXqemkkOS4gOWFseWQg+S6huWkmuWwkemjn+eJqe+8jOS4jeWIhuWbvueJh1xuICAvLyAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsvLyDmr4/kuKpzdW3ku6PooajkuIDlvKDlm77mnInlpJrlsJHljaHot6/ph4xcbiAgLy8gICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gIC8vICAgICAgICAgfSwgMCk7XG4gIC8vICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmJyZWFrZmFzdFtpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICBjb25zb2xlLmxvZygnbWVhbHMnLHJlc3AuYnJlYWtmYXN0KVxuICAvLyAgICAgICByZXR1cm4gYnJlYWtmYXN0ID0ge1xuICAvLyAgICAgICAgIG1lYWxJZDogMCxcbiAgLy8gICAgICAgICBtZWFsTmFtZTogJ+aXqemkkCcsXG4gIC8vICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgLy8gICAgICAgICBtZWFsczogcmVzcC5icmVha2Zhc3QsXG4gIC8vICAgICAgICAgbWVhbFN1bW1hcnk6IGJyZWFrZmFzdFN1bW1hcnksXG4gIC8vICAgICAgIH07XG4gIC8vICAgICB9KTtcbiAgLy8gICAvL2x1bmNoXG4gIC8vICAgbGV0IGx1bmNoOiBNZWFsO1xuICAvLyAgIGxldCBsdW5jaFN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAvLyAgIGxldCBsdW5jaElkczogbnVtYmVyW10gPSBbXVxuICAvLyAgIHJlc3AubHVuY2guZm9yRWFjaCgoaXRlbSA9Pmx1bmNoSWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAvLyAgIGNvbnN0IGx1bmNoUHJvbXMgPSBQcm9taXNlLmFsbChsdW5jaElkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgLy8gICAgIHJlc3VsdCA9PiB7XG4gIC8vICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgLy8gICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gIC8vICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgLy8gICAgICAgICBsdW5jaFN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gIC8vICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAvLyAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgLy8gICAgICAgICB9LCAwKTtcbiAgLy8gICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AubHVuY2hbaW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3IgfSlcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHJldHVybiBsdW5jaCA9IHtcbiAgLy8gICAgICAgICBtZWFsSWQ6IDEsXG4gIC8vICAgICAgICAgbWVhbE5hbWU6ICfljYjppJAnLFxuICAvLyAgICAgICAgIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmx1bmNoX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgLy8gICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5sdW5jaF9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gIC8vICAgICAgICAgbWVhbHM6IHJlc3AubHVuY2gsXG4gIC8vICAgICAgICAgbWVhbFN1bW1hcnk6IGx1bmNoU3VtbWFyeVxuICAvLyAgICAgICB9O1xuICAvLyAgICAgfSk7XG4gIC8vICAgLy9kaW5uZXJcbiAgLy8gICBsZXQgZGlubmVyOiBNZWFsO1xuICAvLyAgIGxldCBkaW5uZXJTdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgLy8gICBsZXQgZGlubmVySWRzOiBudW1iZXJbXSA9IFtdXG4gIC8vICAgcmVzcC5kaW5uZXIuZm9yRWFjaCgoaXRlbSA9PmRpbm5lcklkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgLy8gICBjb25zdCBkaW5uZXJQcm9tcyA9IFByb21pc2UuYWxsKGRpbm5lcklkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgLy8gICAgIHJlc3VsdCA9PiB7XG4gIC8vICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgLy8gICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gIC8vICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgLy8gICAgICAgICBkaW5uZXJTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAvLyAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsvLyDmr4/kuKpzdW3ku6PooajkuIDlvKDlm77mnInlpJrlsJHljaHot6/ph4xcbiAgLy8gICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gIC8vICAgICAgICAgfSwgMCk7XG4gIC8vICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmRpbm5lcltpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICByZXR1cm4gZGlubmVyID0ge1xuICAvLyAgICAgICAgIG1lYWxJZDogMixcbiAgLy8gICAgICAgICBtZWFsTmFtZTogJ+aZmumkkCcsIFxuICAvLyAgICAgICAgIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmRpbm5lcl9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAvLyAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmRpbm5lcl9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAvLyAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmRpbm5lcl9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gIC8vICAgICAgICAgbWVhbHM6IHJlc3AuZGlubmVyLFxuICAvLyAgICAgICAgIG1lYWxTdW1tYXJ5OiBkaW5uZXJTdW1tYXJ5XG4gIC8vICAgICAgIH07XG4gIC8vICAgICB9KTtcbiAgLy8gICAvL2FkZGl0aW9uYWxcbiAgLy8gICBjb25zdCB0aGF0ID0gdGhpc1xuICAvLyAgIGxldCBhZGRpdGlvbjogTWVhbDtcbiAgLy8gICBsZXQgYWRkaXRpb25TdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgLy8gICBsZXQgYWRkaXRpb25JZHM6IG51bWJlcltdID0gW11cbiAgLy8gICByZXNwLmFkZGl0aW9uLmZvckVhY2goKGl0ZW0gPT5kaW5uZXJJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gIC8vICAgY29uc3QgYWRkaXRpb25Qcm9tcyA9IFByb21pc2UuYWxsKGFkZGl0aW9uSWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAvLyAgICAgcmVzdWx0ID0+IHtcbiAgLy8gICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAvLyAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgLy8gICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAvLyAgICAgICAgIGFkZGl0aW9uU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgLy8gICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7ICAvL+iuoeeul+WHuuavj+W8oOWbvueahOiDvemHj++8jOW5tua3u+WKoOi/m+WvueixoVxuICAvLyAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgLy8gICAgICAgICB9LCAwKTtcbiAgLy8gICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuYWRkaXRpb25baW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3J9KVxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgcmV0dXJuIGFkZGl0aW9uID0ge1xuICAvLyAgICAgICAgIG1lYWxJZDogMyxcbiAgLy8gICAgICAgICBtZWFsTmFtZTogJ+WKoOmkkCcsXG4gIC8vICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgLy8gICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAvLyAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgLy8gICAgICAgICBtZWFsczogcmVzcC5hZGRpdGlvbixcbiAgLy8gICAgICAgICBtZWFsU3VtbWFyeTogYWRkaXRpb25TdW1tYXJ5XG4gIC8vICAgICAgIH07XG5cbiAgLy8gICAgIH0pO1xuICAvLyAgIGxldCBtZWFsTGlzdDogTWVhbFtdID0gW11cbiAgLy8gICBQcm9taXNlLmFsbChbYnJlYWtmYXN0UHJvbXMsIGx1bmNoUHJvbXMsIGRpbm5lclByb21zXSkudGhlbihcbiAgLy8gICAgIHJlc3VsdCA9PiB7XG4gIC8vICAgICAgIHJlc3VsdC5tYXAobWVhbCA9PiBtZWFsTGlzdC5wdXNoKG1lYWwpKTtcbiAgLy8gICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVhbExpc3Q6IG1lYWxMaXN0IH0pXG4gIC8vICAgICB9XG4gIC8vICAgKTtcblxuICAvLyB9XG5cbiAgXG4vKipcbiAqIOino+aekOiOt+S7iuWkqeaRhOWFpemHj+adv+Wdl+eahOaVsOaNrlxuICovXG4gIC8vIHB1YmxpYyBmb29kRGlhcnlEYXRhUGFyc2luZyhyZXNwOiBSZXRyaWV2ZUZvb2REaWFyeVJlc3ApIHtcbiAgLy8gICBjb25zb2xlLmxvZyhcInN1bW1hcnlcIiwgcmVzcCk7XG4gIC8vICAgbGV0IHNjb3JlID0gcmVzcC5zY29yZTtcbiAgLy8gICBsZXQgZW5lcmd5ID0gcmVzcC5kYWlseV9pbnRha2UuZW5lcmd5O1xuICAvLyAgIGxldCBwcm90ZWluID0gcmVzcC5kYWlseV9pbnRha2UucHJvdGVpbjtcbiAgLy8gICBsZXQgY2FyYm9oeWRyYXRlID0gcmVzcC5kYWlseV9pbnRha2UuY2FyYm9oeWRyYXRlO1xuICAvLyAgIGxldCBmYXQgPSByZXNwLmRhaWx5X2ludGFrZS5mYXQ7XG4gIC8vICAgbGV0IG51dHJpZW50U3VtbWFyeSA9IFtcbiAgLy8gICAgIHsgbnV0cmllbnRfbmFtZTogXCLng63ph49cIiwgaW50YWtlbl9wZXJjZW50YWdlOiBlbmVyZ3kucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoZW5lcmd5LmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihlbmVyZ3kuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgLy8gICAgIHsgbnV0cmllbnRfbmFtZTogXCLohILogqpcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBmYXQucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoZmF0LmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihmYXQuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfSxcbiAgLy8gICAgIHsgbnV0cmllbnRfbmFtZTogXCLnorPmsLTljJblkIjnialcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBjYXJib2h5ZHJhdGUucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoY2FyYm9oeWRyYXRlLmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihjYXJib2h5ZHJhdGUuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfSxcbiAgLy8gICAgIHsgbnV0cmllbnRfbmFtZTogXCLom4vnmb3otKhcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBwcm90ZWluLnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKHByb3RlaW4uaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKHByb3RlaW4uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfVxuICAvLyAgIF1cblxuICAvLyAgIHRoaXMubG9hZE1lYWxTdW1tYXJ5KHJlc3ApO1xuICAvLyAgIC8vIGxldCBtZWFsTGlzdCA9IFticmVha2Zhc3QsIGx1bmNoLCBkaW5uZXIsIGFkZGl0aW9uYWxdO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBudXRyaWVudFN1bW1hcnk6IG51dHJpZW50U3VtbWFyeSxcbiAgLy8gICAgIHNjb3JlOiBzY29yZVxuICAvLyAgIH0sKCk9PntcbiAgLy8gICAgIG51dHJpZW50U3VtbWFyeS5tYXAoKGl0ZW0saW5kZXgpPT57XG4gIC8vICAgICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KGAjY2lyY2xlJHtpbmRleH1gKS5kcmF3Q2lyY2xlKGBjYW52YXNgLCA3NSwgNCwgaXRlbS5pbnRha2VuX3BlcmNlbnRhZ2UvMTAwICogMilcbiAgLy8gICAgIH0pO1xuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgcHVibGljIGJpbmROYXZpVG9PdGhlck1pbmlBcHAoKSB7XG4gICAgLy90ZXN0IG9uIG5hdmlnYXRlIG1pbmlQcm9ncmFtXG4gICAgd3gubmF2aWdhdGVUb01pbmlQcm9ncmFtKHtcbiAgICAgIGFwcElkOiAnd3g0Yjc0MjI4YmFhMTU0ODlhJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgZW52VmVyc2lvbjogJ2RldmVsb3AnLFxuICAgICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgICAgICAvLyDmiZPlvIDmiJDlip9cbiAgICAgICAgY29uc29sZS5sb2coXCJzdWNjY2VzcyBuYXZpZ2F0ZVwiKTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgdHJpZ2dlckJpbmRnZXRkYXRlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoJyNjYWxlbmRhcicpLmRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLy93aGVuIG9wZW5uaW5nIHRoZSBjYWxlbmRhclxuICBwdWJsaWMgYmluZHNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICB9XG5cbiAgLy/pu5jorqTkuLvliqjkvJrop6blj5HkuIDmrKFcbiAgcHVibGljIGJpbmRnZXRkYXRlKGV2ZW50OiBhbnkpIHtcbiAgICAvL0NvbnZlcnQgZGF0ZSB0byB1bml4IHRpbWVzdGFtcFxuICAgIGxldCB0aW1lID0gZXZlbnQuZGV0YWlsO1xuICAgIGNvbnN0IG5hdlRpdGxlVGltZSA9IHRpbWUueWVhciArICcvJyArIHRpbWUubW9udGggKyAnLycgKyB0aW1lLmRhdGU7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiBuYXZUaXRsZVRpbWUgfSlcbiAgICBsZXQgZGF0ZSA9IG1vbWVudChbdGltZS55ZWFyLCB0aW1lLm1vbnRoIC0gMSwgdGltZS5kYXRlXSk7IC8vIE1vbWVudCBtb250aCBpcyBzaGlmdGVkIGxlZnQgYnkgMVxuICAgIC8vZ2V0IGN1cnJlbnQgdGltZXN0YW1wXG4gICAgdGhpcy5tZWFsRGF0ZSA9IGRhdGUudW5peCgpO1xuICAgIGNvbnN0IHRvZGF5VGltZVN0YW1wID0gbW9tZW50KG5ldyBEYXRlKCkpO1xuICAgIGlmICh0b2RheVRpbWVTdGFtcC5pc1NhbWUoZGF0ZSwnZCcpKXtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiAn5LuK5aSpJyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAvL+S7luS7rOS4jeaYr+WcqOWQjOS4gOWkqVxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiBuYXZUaXRsZVRpbWUgfSlcbiAgICB9IFxuICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgIHRoaXMuZ2V0RGFpbHlNYWNyb251dHJpZW50U3VtbWFyeSh0aGlzLm1lYWxEYXRlKSAvLyDojrflj5ZjYW52YXPkv6Hmga9cbiAgICB0aGlzLmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh0aGlzLm1lYWxEYXRlKSAvLyDojrflj5ZtZWFsTGlzdOS/oeaBr1xuICB9XG5cbiAgcHVibGljIG9uRGFpbHlSZXBvcnRDbGljaygpIHtcbiAgICB0aGlzLnJldHJpZXZlRGFpbHlSZXBvcnQodGhpcy5tZWFsRGF0ZSk7XG4gIH1cbiAgcHVibGljIHJldHJpZXZlRGFpbHlSZXBvcnQoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIn0pO1xuICAgIGxldCByZXE6IFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxID0geyBkYXRlOiBjdXJyZW50VGltZVN0YW1wIH07XG4gICAgd2ViQVBJLlJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGxldCByZXBvcnRVcmw6IHN0cmluZyA9IHJlc3AucmVwb3J0X3VybDtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gICAgICBpZiAocmVwb3J0VXJsICYmIHJlcG9ydFVybCAhPSBcIlwiKSB7XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IFwiL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91cmw9XCIgKyByZXBvcnRVcmwgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwi5oKo5LuK5aSp6L+Y5rKh5pyJ5re75Yqg6aOf54mp5ZOmXCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgY29uZmlybVRleHQ6J+WOu+a3u+WKoCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSlcbiAgfVxuXG4gIFxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLm1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHRoaXMubWVhbEluZGV4ICsgMTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOnRydWV9KVxuICAgIC8vIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgLy8gICBpdGVtTGlzdDogWyfmi43nhaforrDlvZUnLCAn55u45YaMJywgJ+aWh+Wtl+aQnOe0oiddLFxuICAgIC8vICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgIC8vICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgIC8vICAgICAgIGNhc2UgMDpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICBjYXNlIDE6XG4gICAgLy8gICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMjpcbiAgICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgIC8vICAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlQ2hvb3NlVXBsb2FkVHlwZShlOmFueSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgfSk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAoIHRoaXMgYXMgYW55ICkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICB9XG5cbiAgcHVibGljIGNob29zZUltYWdlKHNvdXJjZVR5cGU6IHN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5jaG9vc2VJbWFnZSh7XG4gICAgICBjb3VudDogMSxcbiAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSxcbiAgICAgIHNvdXJjZVR5cGU6IFtzb3VyY2VUeXBlXSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xuICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuS4iuS8oOS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgICAgICB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgaW1hZ2VQYXRoID0gcmVzLnRlbXBGaWxlUGF0aHNbMF07XG4gICAgICAgIHRoYXQucGF0aCA9IGltYWdlUGF0aDtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2Vzcygpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUrXCImdGl0bGU9XCIrdGhpcy5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KXtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpVG9Gb29kRGV0YWlsKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0SW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW1hZ2VJbmRleDtcbiAgICBsZXQgbWVhbElkID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbExvZ1N1bW1hcnlWT1NbaW1hZ2VJbmRleF0ubWVhbExvZ0lkO1xuICAgIGxldCBpbWFnZVVybCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxMb2dTdW1tYXJ5Vk9TW2ltYWdlSW5kZXhdLmltYWdlVXJsO1xuICAgIGltYWdlVXJsID0gaW1hZ2VVcmwgPT0gXCJcIiA/IGRlZmF1bHRJbWFnZVVybCA6IGltYWdlVXJsO1xuICAgIGxldCBwYXJhbSA9IHt9O1xuICAgIHBhcmFtLm1lYWxJbmRleCA9IG1lYWxJbmRleDsgLy8g5Lyg5YiwZm9vZERldGFpbOmhtemdou+8jOWBmuabtOaWsOWKn+iDvVxuICAgIHBhcmFtLmltYWdlSW5kZXggPSBpbWFnZUluZGV4OyAvLyDkvKDliLBmb29kRGV0YWls6aG16Z2i77yM5YGa5pu05paw5Yqf6IO9XG4gICAgcGFyYW0ubWVhbElkID0gbWVhbElkO1xuICAgIHBhcmFtLmltYWdlVXJsID0gaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIuLy4uLy4uL2hvbWVTdWIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog5YWz6Zetc2hvd01hc2tcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVIaWRkZW5NYXNrKCl7XG4gICAgaWYodGhpcy5kYXRhLnNob3dNYXNrKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cblBhZ2UobmV3IEZvb2REaWFyeVBhZ2UoKSlcbiJdfQ==