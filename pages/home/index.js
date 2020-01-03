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
        this.setData({ mealList: mealList });
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
        var _this = this;
        if (this.data.score === 0) {
            wx.showModal({
                title: "",
                content: "您今天还没有添加食物哦",
                showCancel: false,
                confirmText: '去添加'
            });
            return;
        }
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
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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QVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3ZELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzVCLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxtREFBbUQsR0FBRyxTQUFTO1NBQ3JFLENBQUMsQ0FBQztJQUNMLENBQUM7SUFJTSx3Q0FBZ0IsR0FBdkI7UUFDRSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ25CLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBQyxRQUFRLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQTtZQUN2QyxPQUFPLEtBQUssQ0FBQTtTQUNiO0lBQ0gsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQWhyQkQsSUFnckJDO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIGxvZ2luQVBJIGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFJldHJpZXZlRm9vZERpYXJ5UmVxLCBSZXRyaWV2ZUZvb2REaWFyeVJlc3AsXG4gIFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB1cGxvYWRGaWxlIGZyb20gJy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmxldCBjaGFydCA9IG51bGw7XG5mdW5jdGlvbiBpbml0Q2hhcnQoY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBGMikge1xuICBsZXQgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCwgIC8v572R5qC857q/XG4gICAgdGlja0xpbmU6bnVsbCxcbiAgICBsYWJlbDpudWxsLFxuICAgIGxpbmU6bnVsbFxuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lduS4reaciXgseeWdkOagh+WSjOiiq+eCueWHu+mhueeahOS/oeaBr1xuICAgICAgaXRlbXNbMF0ubmFtZSA9IGl0ZW1zWzBdLm9yaWdpbi53ZWVrO1xuICAgICAgaXRlbXNbMF0udmFsdWUgPSBpdGVtc1swXS52YWx1ZSsna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsXCJ2YWx1ZVwiXSlcbiAgICAuc3R5bGUoeyBmaWxsOiAnI2ZmZmZmZicsIHI6IDEuNywgbGluZVdpZHRoOiAxLCBzdHJva2U6ICcjZjM0NjVhJyB9KTtcbiAgY2hhcnQubGluZSh7XG4gICAgY29ubmVjdE51bGxzOiB0cnVlIC8vIOmFjee9ru+8jOi/nuaOpeepuuWAvOaVsOaNrlxuICB9KS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKS5zaGFwZSgnc21vb3RoJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cbiAgXG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5jbGFzcyBGb29kRGlhcnlQYWdlIHtcbiAgcHVibGljIHVzZXJJbmZvID0ge31cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgb3B0czoge1xuICAgICAgb25Jbml0OiBpbml0Q2hhcnQsXG4gICAgfSxcbiAgICBudXRyaWVudFN1bW1hcnk6IFtcbiAgICAgIHsgbmFtZTogXCLng63ph49cIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbmFtZTogXCLohILogqpcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLnorPmsLRcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLom4vnmb3otKhcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtdLFxuICAgIHNjb3JlOiAnLS0nLFxuICAgIG1lbnVJbmZvOiB7fSxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHsgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsaW1hZ2U6J2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZpYW1hTmlhQmliWUtpYmd5VmhpY1B6UzVQek9yVm42bU9kV2FLbU5kd2NaS1g5M3o5QkpUdHduSkNxaWFhdUZodTBXb0QzdHdhRnZqaldHTEEvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6J+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6JycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OicgJyxcbiAgICBzaG93TWFzazpmYWxzZSxcbiAgfTtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIHBhdGggPSAnJztcbiAgLy8gcHVibGljIHNob3dQZXJzb25DaGVja0xvYWRpbmcgPSBmYWxzZTtcbiAgcHVibGljIGZvb2RDb2xvclRpcHNBcnIgPSBbJyMwMDc0ZDknLCAnI2ZmZGMwMCcsJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddO1xuICBwdWJsaWMgbWVhbEluZGV4ID0gMDtcblxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgLy8gd3gubmF2aWdhdGVUbyh7dXJsOicuLy4uLy4uL2hvbWVTdWIvcGFnZXMvbWVhbEFuYWx5c2lzL2luZGV4P21lYWxMb2dJZD0yMDg3NiZtZWFsRGF0ZT0xNTc3Mzc2MDAwJm1lYWxUeXBlPTEnfSlcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5sb2dpbigpO1xuICAgIC8vIGNvbWZpcm1NZWFs6aG16Z2i5re75Yqg5a6M6aOf54mp5ZCOIOS8muinpuWPkVxuICAgIGlmICh0aGlzLm1lYWxEYXRlICE9PSAwKSB7XG4gICAgICAvLyB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICAgIHRoaXMuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHRoaXMubWVhbERhdGUpO1xuICAgICAgdGhpcy5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHRoaXMubWVhbERhdGUpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIG9uUmVhZHkoKXtcbiAgICAvKipcbiAgICAgKiDojrflj5blj7PkuIrop5Log7blm4rlsLrlr7jvvIzorqHnrpfoh6rlrprkuYnmoIfpopjmoI/kvY3nva5cbiAgICAgKi9cbiAgICBpZihhcHAuZ2xvYmFsRGF0YS5tZW51SW5mbyl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZW51SW5mbzogYXBwLmdsb2JhbERhdGEubWVudUluZm8gfSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBtZW51SW5mbyA9IHd4LmdldE1lbnVCdXR0b25Cb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lbnVJbmZvOiBtZW51SW5mbyB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOW+l+WIsOmmlumhtWNhbnZhc+aVsOaNrlxuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoZGF0ZSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXMgXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYodG9rZW4pe1xuICAgICAgcmVxdWVzdC5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHtkYXRlfSkudGhlbihyZXM9PntcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKTtcbiAgICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgICBjb25zb2xlLmxvZyg4OCxlcnIpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkocmVzKXtcbiAgICBjb25zdCBmb3JtYXQgPSAobnVtKSA9PiBNYXRoLnJvdW5kKG51bSk7XG4gICAgbGV0IHNjb3JlID0gcmVzLnNjb3JlO1xuICAgIGxldCBudXRyaWVudFN1bW1hcnkgPSBbXG4gICAgICB7IFxuICAgICAgICBuYW1lOiBcIueDremHj1wiLCBcbiAgICAgICAgcGVyY2VudDogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UvcmVzLmVuZXJneVJlY29tbWVuZGVkSW50YWtlKjEwMCksIFxuICAgICAgICBpbnRha2VOdW06IGZvcm1hdChyZXMuZW5lcmd5SW50YWtlKSwgXG4gICAgICAgIHRvdGFsTnVtOiBmb3JtYXQocmVzLmVuZXJneVJlY29tbWVuZGVkSW50YWtlKSwgXG4gICAgICAgIHVuaXQ6IFwi5Y2D5Y2hXCIgXG4gICAgICB9LFxuICAgIF07XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzLm1hY3JvbnV0cmllbnRJbnRha2Upe1xuICAgICAgY29uc3QgaXRlbSA9IHJlcy5tYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGl0ZW0ubmFtZSA9IGl0ZW0ubmFtZUNOO1xuICAgICAgaXRlbS5wZXJjZW50ID0gZm9ybWF0KGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKTtcbiAgICAgIGl0ZW0uaW50YWtlTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLmludGFrZSk7XG4gICAgICBpdGVtLnRvdGFsTnVtID0gZm9ybWF0KGl0ZW0uaW50YWtlLnN1Z2dlc3RlZEludGFrZSk7XG4gICAgICBpdGVtLnVuaXQgPSBcIuWFi1wiIDtcbiAgICAgIG51dHJpZW50U3VtbWFyeS5wdXNoKGl0ZW0pXG4gICAgfVxuICAgIG51dHJpZW50U3VtbWFyeS5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudChgI2NpcmNsZSR7aW5kZXh9YCkuZHJhd0NpcmNsZShgY2FudmFzYCwgNzUsIDQsIGl0ZW0ucGVyY2VudC8xMDAgKiAyKVxuICAgIH0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBudXRyaWVudFN1bW1hcnk6IG51dHJpZW50U3VtbWFyeSxcbiAgICAgIHNjb3JlOiBzY29yZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPlumlrumjn+iusOW9leebuOWFs+S/oeaBr1xuICAgKi9cbiAgcHVibGljIGdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChkYXRlKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIGlmKHRva2VuKXtcbiAgICAgIHJlcXVlc3QuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHtkYXRlfSkudGhlbihyZXM9PntcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChyZXMpO1xuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiAn6I635Y+W6aOf54mp6K6w5b2V5aSx6LSlJywgaWNvbjogJ25vbmUnIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOino+aekOmlrumjn+iusOW9leebuOWFs+S/oeaBr1xuICAgKi9cbiAgcHVibGljIHBhcnNlRGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHJlcyl7XG4gICAgbGV0IG1lYWxMaXN0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMpe1xuICAgICAgbGV0IG1lYWwgPSByZXNbaW5kZXhdO1xuICAgICAgbWVhbC5lbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwuZW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UgPSBNYXRoLnJvdW5kKG1lYWwucmVjb21tZW5kZWRFbmVyZ3lJbnRha2UpO1xuICAgICAgbWVhbC5tZWFsU3VtbWFyeSA9IFtdO1xuICAgICAgbWVhbC5tZWFsTG9nU3VtbWFyeVZPUyYmbWVhbC5tZWFsTG9nU3VtbWFyeVZPUy5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAgIGl0ZW0uZW5lcmd5ID0gTWF0aC5yb3VuZChpdGVtLmVuZXJneSk7IFxuICAgICAgICBpdGVtLmNvbG9yVGlwID0gdGhpcy5mb29kQ29sb3JUaXBzQXJyW2luZGV4XTtcbiAgICAgICAgaXRlbS5mb29kTG9nU3VtbWFyeUxpc3QubWFwKGl0PT57XG4gICAgICAgICAgaXQuY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICAgIGl0LmVuZXJneSA9IE1hdGgucm91bmQoaXQuZW5lcmd5KVxuICAgICAgICAgIG1lYWwubWVhbFN1bW1hcnkucHVzaChpdClcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgbWVhbExpc3QucHVzaChtZWFsKVxuICAgIH07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHttZWFsTGlzdH0pXG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5L2T6YeN55u45YWz5L+h5oGvLG9uc2hvd+S4reinpuWPkVxuICAgKi9cbiAgcHVibGljIHJldHJpZXZlRGF0YSgpOiB2b2lkIHtcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih0b2tlbik7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IGN1cnJXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgbGV0IGZpcnN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoMCkudW5peCgpO1xuICAgIGxldCBsYXN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoNikudW5peCgpO1xuXG4gICAgY29uc3QgdG9kYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBjb25zdCBiZWZvcmUzMGRheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3VidHJhY3QoMzAsIFwiZGF5c1wiKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgcmVxID0ge1xuICAgICAgICBkYXRlX2Zyb206IGJlZm9yZTMwZGF5VGltZSxcbiAgICAgICAgZGF0ZV90bzogdG9kYXlUaW1lXG4gICAgICB9O1xuXG4gICAgICB3ZWJBUEkuUmV0cmlldmVXZWlnaHRMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnUmV0cmlldmVXZWlnaHRMb2cnLCByZXNwKTtcbiAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICBsYXRlc3Rfd2VpZ2h0OiByZXNwLmxhdGVzdF93ZWlnaHQudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgbmVhckRhdGFBcnI6YW55ID0gW107XG4gICAgICAgIGxldCB0b3RhbCA9IDA7Ly8g6I635Y+W5LiA5L2N5bCP5pWw54K555qE5bmz5Z2H5YC877yM5YWI5rGC5oC75ZKMXG4gICAgICAgIHJlc3Aud2VpZ2h0X2xvZ3MubWFwKGl0ZW09PntcbiAgICAgICAgICB0b3RhbCA9IHRvdGFsICsgaXRlbS52YWx1ZVxuICAgICAgICAgIGNvbnN0IGJlZm9yZU51bWJlckRheSA9ICh0b2RheVRpbWUgLSBpdGVtLmRhdGUpIC8gODY0MDBcbiAgICAgICAgICBjb25zdCBmb3JtYXREYXRlID0gbW9tZW50KGl0ZW0uZGF0ZSoxMDAwKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgbmVhckRhdGFBcnJbMzAgLSBiZWZvcmVOdW1iZXJEYXldID0geyB3ZWVrOiBmb3JtYXREYXRlLCB2YWx1ZTogaXRlbS52YWx1ZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IE1hdGgucm91bmQodG90YWwqMTAgLyByZXNwLndlaWdodF9sb2dzLmxlbmd0aCkvMTBcbiAgICAgICAgLy8g56iA55aP5pWw57uE6ZyA6KaB55SoZm9y77yM5LiN6IO955SobWFw44CCXG4gICAgICAgIC8vIDMw5aSp5YaF55So5oi356ys5LiA5Liq5rKh5pyJ5pu05paw5L2T6YeN55qE5pel5pyf6LWL5YC85Li65L2T6YeN5bmz5Z2H5YC877yM5Yir55qE5pel5pyf6YO96LWL5YC85Li6bnVsbFxuICAgICAgICBsZXQgbGVuID0gbmVhckRhdGFBcnIubGVuZ3RoO1xuICAgICAgICBsZXQgZmxhZyA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwO2k8bGVuO2krKyl7XG4gICAgICAgICAgaWYgKCFuZWFyRGF0YUFycltpXSAmJiBmbGFnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAtaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTogYXZlcmFnZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgICAgIGZsYWcgPSBmYWxzZVxuICAgICAgICAgIH0gZWxzZSBpZiAoIW5lYXJEYXRhQXJyW2ldKXtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMCAtIGksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6bnVsbCwgYXZnOiAyMDAwIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hhcnQuYXhpcyhmYWxzZSk7XG4gICAgICAgIGNoYXJ0LmNoYW5nZURhdGEobmVhckRhdGFBcnIpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsZXJyKVxuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCk7XG4gIH1cblxuICBwdWJsaWMgZ29XZWlnaHRSZWNvcmQoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOicvcGFnZXMvd2VpZ2h0UmVjb3JkL2luZGV4JyB9KVxuICB9XG4gIHB1YmxpYyBsb2dpbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIHZhciByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlIH07XG4gICAgICAgIGxvZ2luQVBJLk1pbmlQcm9ncmFtTG9naW4ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIGxldCB1c2VyU3RhdHVzID0gcmVzcC51c2VyX3N0YXR1cztcbiAgICAgICAgICBzd2l0Y2ggKHVzZXJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgMTogLy92YWxpZGF0aW9uIHBhZ2VcbiAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjogLy9vbkJvYXJkaW5nIHByb2Nlc3MgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvb25Cb2FyZC9vbkJvYXJkJyB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzogLy9rZWVwIGl0IGF0IGhvbWUgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnJldHJpZXZlRGF0YSgpOyAvLyDojrflj5bkvZPph43orrDlvZVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYblpLHotKUnLFxuICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgYXV0aGVudGljYXRpb25SZXF1ZXN0KCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICB3eC5nZXRVc2VySW5mbyh7XG4gICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyA9IHJlcy51c2VySW5mb1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6ICcuLi9sb2dpbi9pbmRleD91c2VyX3N0YXR1cz0zJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gIH1cblxuICBwdWJsaWMgZ29OdXRyaXRpb25hbERhdGFiYXNlUGFnZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6Jy9wYWdlcy9udXRyaXRpb25hbERhdGFiYXNlUGFnZS9pbmRleCcgfSlcbiAgfVxuXG4gIC8vIHB1YmxpYyBjb3VudFJlcG9ydEJhZGdlKHJlc3A6IGFueSkge1xuICAvLyAgIGxldCByZXBvcnROdW0gPSAwO1xuICAvLyAgIGxldCByZXBvcnRzID0gcmVzcC5kYWlseV9yZXBvcnQ7XG4gIC8vICAgZm9yIChsZXQgaW5kZXggaW4gcmVwb3J0cykge1xuICAvLyAgICAgbGV0IHJlcG9ydCA9IHJlcG9ydHNbaW5kZXhdO1xuICAvLyAgICAgaWYgKCFyZXBvcnQuaXNfcmVwb3J0X2dlbmVyYXRlZCAmJiAhcmVwb3J0LmlzX2Zvb2RfbG9nX2VtcHR5KSB7XG4gIC8vICAgICAgIGxldCB0b2RheVRpbWUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKS51bml4KCk7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKHRvZGF5VGltZSk7XG4gIC8vICAgICAgIGlmIChyZXBvcnQuZGF0ZSA8IHRvZGF5VGltZSB8fCAocmVwb3J0LmRhdGUgPT0gdG9kYXlUaW1lICYmIG1vbWVudChuZXcgRGF0ZSgpKS5ob3VycyA+IDIyKSkgeyAgIC8vY291bnQgdG9kYXkgcmVwb3J0cyBzdGF0dXMgYWZ0ZXIgMTlcbiAgLy8gICAgICAgICByZXBvcnROdW0rKztcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICBpZiAocmVwb3J0TnVtICE9IDApIHtcbiAgLy8gICAgIHd4LnNldFRhYkJhckJhZGdlKHtcbiAgLy8gICAgICAgaW5kZXg6IDIsXG4gIC8vICAgICAgIHRleHQ6IFN0cmluZyhyZXBvcnROdW0pXG4gIC8vICAgICB9KTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgd3gucmVtb3ZlVGFiQmFyQmFkZ2Uoe1xuICAvLyAgICAgICBpbmRleDogMlxuICAvLyAgICAgfSk7XG4gIC8vICAgfVxuICAvLyB9XG4vKipcbiAqIGFwaeivt+axguS7iuWkqeaRhOWFpemHj+WSjOS7iuWkqemlrumjn+iusOW9lVxuICovXG4gIC8vIHB1YmxpYyByZXRyaWV2ZUZvb2REaWFyeURhdGEoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gIC8vICAgbGV0IHJlcTogUmV0cmlldmVGb29kRGlhcnlSZXEgPSB7IGRhdGU6IGN1cnJlbnRUaW1lU3RhbXAgfTtcbiAgLy8gICB3ZWJBUEkuUmV0cmlldmVGb29kRGlhcnkocmVxKS50aGVuKHJlc3AgPT4gdGhpcy5mb29kRGlhcnlEYXRhUGFyc2luZyhyZXNwKSkuY2F0Y2goZXJyID0+XG4gIC8vICAgY29uc3QgdG9rZW4xID0gd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpLy/nlKjmiLflj6/og73msqHmnInnmbvlvZXvvIzmraTml7bkuI3lupTlvLnnqpdcbiAgLy8gICAgIGlmICghd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpKXtcbiAgLy8gICAgICAgY29uc29sZS5sb2coODg4OCwgdG9rZW4xKVxuICAvLyAgICAgfWVsc2V7XG4gIC8vICAgICAgIHd4LnNob3dNb2RhbCh7XG4gIC8vICAgICAgICAgdGl0bGU6ICcnLFxuICAvLyAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bml6Xlv5flpLHotKUnLFxuICAvLyAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gIC8vICAgICAgIH0pXG4gIC8vICAgICB9XG4gIC8vICAgKVxuICAvLyB9XG5cbiAgLy8gcHVibGljIHJldHJpZXZlTWVhbExvZyhtZWFsSWQ6IG51bWJlcikge1xuICAvLyAgIGxldCByZXE6IFJldHJpZXZlTWVhbExvZ1JlcSA9IHsgbWVhbF9pZDogbWVhbElkIH1cbiAgLy8gICByZXR1cm4gd2ViQVBJLlJldHJpZXZlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICByZXR1cm4gdGhpcy5wYXJzZU1lYWxMb2cocmVzcCk7XG4gIC8vICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgLy8gICAgIGNvbnNvbGUubG9nKGVycik7XG4gIC8vICAgICB3eC5zaG93TW9kYWwoe1xuICAvLyAgICAgICB0aXRsZTogJycsXG4gIC8vICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/nianmlbDmja7lpLHotKUnLFxuICAvLyAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAvLyAgICAgfSlcbiAgLy8gICB9XG4gIC8vICAgKTtcbiAgLy8gfVxuICAvLyBwdWJsaWMgcGFyc2VNZWFsTG9nKHJlc3A6IE1lYWxMb2dSZXNwKSB7XG4gIC8vICAgbGV0IGZvb2RMaXN0OiBGb29kW10gPSBbXTtcbiAgLy8gICBmb3IgKGxldCBpbmRleCBpbiByZXNwLmZvb2RfbG9nKSB7XG4gIC8vICAgICBsZXQgZm9vZExvZzogRm9vZExvZ0luZm8gPSByZXNwLmZvb2RfbG9nW2luZGV4XTtcbiAgLy8gICAgIGxldCB1bml0T2JqID0gZm9vZExvZy51bml0X29wdGlvbi5maW5kKG8gPT4gby51bml0X2lkID09PSBmb29kTG9nLnVuaXRfaWQpO1xuICAvLyAgICAgbGV0IHVuaXROYW1lID0gXCLku71cIlxuICAvLyAgICAgaWYgKHVuaXRPYmopIHtcbiAgLy8gICAgICAgdW5pdE5hbWUgPSB1bml0T2JqLnVuaXRfbmFtZTtcbiAgLy8gICAgIH1cbiAgLy8gICAgIGxldCBmb29kOiBGb29kID0ge1xuICAvLyAgICAgICBmb29kTmFtZTogZm9vZExvZy5mb29kX25hbWUsXG4gIC8vICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihmb29kTG9nLmVuZXJneSAvIDEwMCksXG4gIC8vICAgICAgIHVuaXROYW1lOiB1bml0TmFtZSxcbiAgLy8gICAgICAgd2VpZ2h0OiBNYXRoLnJvdW5kKGZvb2RMb2cud2VpZ2h0IC8gMTAwKVxuICAvLyAgICAgfVxuICAvLyAgICAgZm9vZExpc3QucHVzaChmb29kKVxuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gZm9vZExpc3RcbiAgLy8gfVxuICAvLyBwdWJsaWMgbG9hZE1lYWxTdW1tYXJ5KHJlc3A6IFJldHJpZXZlRm9vZERpYXJ5UmVzcCkge1xuICAvLyAgIGxldCBicmVha2Zhc3Q6IE1lYWw7XG4gIC8vICAgbGV0IGJyZWFrZmFzdFN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAvLyAgIGxldCBicmVha2Zhc3RJZHM6IG51bWJlcltdID0gW10gLy/lvpfliLDml6nppJBtYWVsX2lk5pWw57uEXG4gIC8vICAgcmVzcC5icmVha2Zhc3QuZm9yRWFjaCgoaXRlbSA9PmJyZWFrZmFzdElkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKVxuICAvLyAgIGNvbnN0IGJyZWFrZmFzdFByb21zID0gUHJvbWlzZS5hbGwoYnJlYWtmYXN0SWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAvLyAgICAgcmVzdWx0ID0+IHtcbiAgLy8gICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAvLyAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgLy8gICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcCggaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgLy8gICAgICAgICBicmVha2Zhc3RTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpOyAvLyBicmVha2Zhc3RTdW1tYXJ55Lit6I635b6X5pep6aSQ5LiA5YWx5ZCD5LqG5aSa5bCR6aOf54mp77yM5LiN5YiG5Zu+54mHXG4gIC8vICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAvLyAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgLy8gICAgICAgICB9LCAwKTtcbiAgLy8gICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuYnJlYWtmYXN0W2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKCdtZWFscycscmVzcC5icmVha2Zhc3QpXG4gIC8vICAgICAgIHJldHVybiBicmVha2Zhc3QgPSB7XG4gIC8vICAgICAgICAgbWVhbElkOiAwLFxuICAvLyAgICAgICAgIG1lYWxOYW1lOiAn5pep6aSQJyxcbiAgLy8gICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgLy8gICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgLy8gICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAvLyAgICAgICAgIG1lYWxzOiByZXNwLmJyZWFrZmFzdCxcbiAgLy8gICAgICAgICBtZWFsU3VtbWFyeTogYnJlYWtmYXN0U3VtbWFyeSxcbiAgLy8gICAgICAgfTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIC8vbHVuY2hcbiAgLy8gICBsZXQgbHVuY2g6IE1lYWw7XG4gIC8vICAgbGV0IGx1bmNoU3VtbWFyeTogRm9vZFtdID0gW107XG4gIC8vICAgbGV0IGx1bmNoSWRzOiBudW1iZXJbXSA9IFtdXG4gIC8vICAgcmVzcC5sdW5jaC5mb3JFYWNoKChpdGVtID0+bHVuY2hJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gIC8vICAgY29uc3QgbHVuY2hQcm9tcyA9IFByb21pc2UuYWxsKGx1bmNoSWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAvLyAgICAgcmVzdWx0ID0+IHtcbiAgLy8gICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAvLyAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgLy8gICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAvLyAgICAgICAgIGx1bmNoU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgLy8gICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7Ly8g5q+P5Liqc3Vt5Luj6KGo5LiA5byg5Zu+5pyJ5aSa5bCR5Y2h6Lev6YeMXG4gIC8vICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAvLyAgICAgICAgIH0sIDApO1xuICAvLyAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5sdW5jaFtpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvciB9KVxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgICAgcmV0dXJuIGx1bmNoID0ge1xuICAvLyAgICAgICAgIG1lYWxJZDogMSxcbiAgLy8gICAgICAgICBtZWFsTmFtZTogJ+WNiOmkkCcsXG4gIC8vICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgLy8gICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5sdW5jaF9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAvLyAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmx1bmNoX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgLy8gICAgICAgICBtZWFsczogcmVzcC5sdW5jaCxcbiAgLy8gICAgICAgICBtZWFsU3VtbWFyeTogbHVuY2hTdW1tYXJ5XG4gIC8vICAgICAgIH07XG4gIC8vICAgICB9KTtcbiAgLy8gICAvL2Rpbm5lclxuICAvLyAgIGxldCBkaW5uZXI6IE1lYWw7XG4gIC8vICAgbGV0IGRpbm5lclN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAvLyAgIGxldCBkaW5uZXJJZHM6IG51bWJlcltdID0gW11cbiAgLy8gICByZXNwLmRpbm5lci5mb3JFYWNoKChpdGVtID0+ZGlubmVySWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAvLyAgIGNvbnN0IGRpbm5lclByb21zID0gUHJvbWlzZS5hbGwoZGlubmVySWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAvLyAgICAgcmVzdWx0ID0+IHtcbiAgLy8gICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAvLyAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgLy8gICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAvLyAgICAgICAgIGRpbm5lclN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gIC8vICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAvLyAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgLy8gICAgICAgICB9LCAwKTtcbiAgLy8gICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuZGlubmVyW2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICAgIHJldHVybiBkaW5uZXIgPSB7XG4gIC8vICAgICAgICAgbWVhbElkOiAyLFxuICAvLyAgICAgICAgIG1lYWxOYW1lOiAn5pma6aSQJywgXG4gIC8vICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgLy8gICAgICAgICBtZWFsczogcmVzcC5kaW5uZXIsXG4gIC8vICAgICAgICAgbWVhbFN1bW1hcnk6IGRpbm5lclN1bW1hcnlcbiAgLy8gICAgICAgfTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIC8vYWRkaXRpb25hbFxuICAvLyAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gIC8vICAgbGV0IGFkZGl0aW9uOiBNZWFsO1xuICAvLyAgIGxldCBhZGRpdGlvblN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAvLyAgIGxldCBhZGRpdGlvbklkczogbnVtYmVyW10gPSBbXVxuICAvLyAgIHJlc3AuYWRkaXRpb24uZm9yRWFjaCgoaXRlbSA9PmRpbm5lcklkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgLy8gICBjb25zdCBhZGRpdGlvblByb21zID0gUHJvbWlzZS5hbGwoYWRkaXRpb25JZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gIC8vICAgICByZXN1bHQgPT4ge1xuICAvLyAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gIC8vICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAvLyAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gIC8vICAgICAgICAgYWRkaXRpb25TdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAvLyAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsgIC8v6K6h566X5Ye65q+P5byg5Zu+55qE6IO96YeP77yM5bm25re75Yqg6L+b5a+56LGhXG4gIC8vICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAvLyAgICAgICAgIH0sIDApO1xuICAvLyAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5hZGRpdGlvbltpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgICByZXR1cm4gYWRkaXRpb24gPSB7XG4gIC8vICAgICAgICAgbWVhbElkOiAzLFxuICAvLyAgICAgICAgIG1lYWxOYW1lOiAn5Yqg6aSQJyxcbiAgLy8gICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAvLyAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gIC8vICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAvLyAgICAgICAgIG1lYWxzOiByZXNwLmFkZGl0aW9uLFxuICAvLyAgICAgICAgIG1lYWxTdW1tYXJ5OiBhZGRpdGlvblN1bW1hcnlcbiAgLy8gICAgICAgfTtcblxuICAvLyAgICAgfSk7XG4gIC8vICAgbGV0IG1lYWxMaXN0OiBNZWFsW10gPSBbXVxuICAvLyAgIFByb21pc2UuYWxsKFticmVha2Zhc3RQcm9tcywgbHVuY2hQcm9tcywgZGlubmVyUHJvbXNdKS50aGVuKFxuICAvLyAgICAgcmVzdWx0ID0+IHtcbiAgLy8gICAgICAgcmVzdWx0Lm1hcChtZWFsID0+IG1lYWxMaXN0LnB1c2gobWVhbCkpO1xuICAvLyAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWFsTGlzdDogbWVhbExpc3QgfSlcbiAgLy8gICAgIH1cbiAgLy8gICApO1xuXG4gIC8vIH1cblxuICBcbi8qKlxuICog6Kej5p6Q6I635LuK5aSp5pGE5YWl6YeP5p2/5Z2X55qE5pWw5o2uXG4gKi9cbiAgLy8gcHVibGljIGZvb2REaWFyeURhdGFQYXJzaW5nKHJlc3A6IFJldHJpZXZlRm9vZERpYXJ5UmVzcCkge1xuICAvLyAgIGNvbnNvbGUubG9nKFwic3VtbWFyeVwiLCByZXNwKTtcbiAgLy8gICBsZXQgc2NvcmUgPSByZXNwLnNjb3JlO1xuICAvLyAgIGxldCBlbmVyZ3kgPSByZXNwLmRhaWx5X2ludGFrZS5lbmVyZ3k7XG4gIC8vICAgbGV0IHByb3RlaW4gPSByZXNwLmRhaWx5X2ludGFrZS5wcm90ZWluO1xuICAvLyAgIGxldCBjYXJib2h5ZHJhdGUgPSByZXNwLmRhaWx5X2ludGFrZS5jYXJib2h5ZHJhdGU7XG4gIC8vICAgbGV0IGZhdCA9IHJlc3AuZGFpbHlfaW50YWtlLmZhdDtcbiAgLy8gICBsZXQgbnV0cmllbnRTdW1tYXJ5ID0gW1xuICAvLyAgICAgeyBudXRyaWVudF9uYW1lOiBcIueDremHj1wiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGVuZXJneS5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihlbmVyZ3kuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGVuZXJneS5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLljYPljaFcIiB9LFxuICAvLyAgICAgeyBudXRyaWVudF9uYW1lOiBcIuiEguiCqlwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGZhdC5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihmYXQuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGZhdC5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9LFxuICAvLyAgICAgeyBudXRyaWVudF9uYW1lOiBcIueis+awtOWMluWQiOeJqVwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGNhcmJvaHlkcmF0ZS5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihjYXJib2h5ZHJhdGUuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGNhcmJvaHlkcmF0ZS5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9LFxuICAvLyAgICAgeyBudXRyaWVudF9uYW1lOiBcIuibi+eZvei0qFwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IHByb3RlaW4ucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IocHJvdGVpbi5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IocHJvdGVpbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9XG4gIC8vICAgXVxuXG4gIC8vICAgdGhpcy5sb2FkTWVhbFN1bW1hcnkocmVzcCk7XG4gIC8vICAgLy8gbGV0IG1lYWxMaXN0ID0gW2JyZWFrZmFzdCwgbHVuY2gsIGRpbm5lciwgYWRkaXRpb25hbF07XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIG51dHJpZW50U3VtbWFyeTogbnV0cmllbnRTdW1tYXJ5LFxuICAvLyAgICAgc2NvcmU6IHNjb3JlXG4gIC8vICAgfSwoKT0+e1xuICAvLyAgICAgbnV0cmllbnRTdW1tYXJ5Lm1hcCgoaXRlbSxpbmRleCk9PntcbiAgLy8gICAgICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoYCNjaXJjbGUke2luZGV4fWApLmRyYXdDaXJjbGUoYGNhbnZhc2AsIDc1LCA0LCBpdGVtLmludGFrZW5fcGVyY2VudGFnZS8xMDAgKiAyKVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICBwdWJsaWMgYmluZE5hdmlUb090aGVyTWluaUFwcCgpIHtcbiAgICAvL3Rlc3Qgb24gbmF2aWdhdGUgbWluaVByb2dyYW1cbiAgICB3eC5uYXZpZ2F0ZVRvTWluaVByb2dyYW0oe1xuICAgICAgYXBwSWQ6ICd3eDRiNzQyMjhiYWExNTQ4OWEnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBlbnZWZXJzaW9uOiAnZGV2ZWxvcCcsXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIC8vIOaJk+W8gOaIkOWKn1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2NjZXNzIG5hdmlnYXRlXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyB0cmlnZ2VyQmluZGdldGRhdGUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudCgnI2NhbGVuZGFyJykuZGF0ZVNlbGVjdGlvbigpXG4gIH1cblxuICAvL3doZW4gb3Blbm5pbmcgdGhlIGNhbGVuZGFyXG4gIHB1YmxpYyBiaW5kc2VsZWN0KGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gIH1cblxuICAvL+m7mOiupOS4u+WKqOS8muinpuWPkeS4gOasoVxuICBwdWJsaWMgYmluZGdldGRhdGUoZXZlbnQ6IGFueSkge1xuICAgIC8vQ29udmVydCBkYXRlIHRvIHVuaXggdGltZXN0YW1wXG4gICAgbGV0IHRpbWUgPSBldmVudC5kZXRhaWw7XG4gICAgY29uc3QgbmF2VGl0bGVUaW1lID0gdGltZS55ZWFyICsgJy8nICsgdGltZS5tb250aCArICcvJyArIHRpbWUuZGF0ZTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWU6IG5hdlRpdGxlVGltZSB9KVxuICAgIGxldCBkYXRlID0gbW9tZW50KFt0aW1lLnllYXIsIHRpbWUubW9udGggLSAxLCB0aW1lLmRhdGVdKTsgLy8gTW9tZW50IG1vbnRoIGlzIHNoaWZ0ZWQgbGVmdCBieSAxXG4gICAgLy9nZXQgY3VycmVudCB0aW1lc3RhbXBcbiAgICB0aGlzLm1lYWxEYXRlID0gZGF0ZS51bml4KCk7XG4gICAgY29uc3QgdG9kYXlUaW1lU3RhbXAgPSBtb21lbnQobmV3IERhdGUoKSk7XG4gICAgaWYgKHRvZGF5VGltZVN0YW1wLmlzU2FtZShkYXRlLCdkJykpe1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWU6ICfku4rlpKknIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8v5LuW5Lus5LiN5piv5Zyo5ZCM5LiA5aSpXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWU6IG5hdlRpdGxlVGltZSB9KVxuICAgIH0gXG4gICAgLy8gdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgdGhpcy5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHRoaXMubWVhbERhdGUpIC8vIOiOt+WPlmNhbnZhc+S/oeaBr1xuICAgIHRoaXMuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHRoaXMubWVhbERhdGUpIC8vIOiOt+WPlm1lYWxMaXN05L+h5oGvXG4gIH1cblxuICBwdWJsaWMgb25EYWlseVJlcG9ydENsaWNrKCkge1xuICAgIGlmKHRoaXMuZGF0YS5zY29yZT09PTApe1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwi5oKo5LuK5aSp6L+Y5rKh5pyJ5re75Yqg6aOf54mp5ZOmXCIsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICBjb25maXJtVGV4dDon5Y675re75YqgJ1xuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwifSk7XG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgcmVxdWVzdC5nZXRVc2VyUHJvZmlsZUJ5VG9rZW4oe3Rva2VufSkudGhlbihyZXNwID0+IHtcbiAgICAgIGxldCB1c2VySWQ6IHN0cmluZyA9IHJlc3AudXNlcklkO1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogYC9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXNlcklkPSR7dXNlcklkfSZkYXRlPSR7dGhpcy5tZWFsRGF0ZX1gfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9KVxuICB9XG4gIFxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLm1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHRoaXMubWVhbEluZGV4ICsgMTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOnRydWV9KVxuICAgIC8vIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgLy8gICBpdGVtTGlzdDogWyfmi43nhaforrDlvZUnLCAn55u45YaMJywgJ+aWh+Wtl+aQnOe0oiddLFxuICAgIC8vICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgIC8vICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgIC8vICAgICAgIGNhc2UgMDpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICBjYXNlIDE6XG4gICAgLy8gICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMjpcbiAgICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgIC8vICAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlQ2hvb3NlVXBsb2FkVHlwZShlOmFueSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgfSk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAoIHRoaXMgYXMgYW55ICkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICB9XG5cbiAgcHVibGljIGNob29zZUltYWdlKHNvdXJjZVR5cGU6IHN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5jaG9vc2VJbWFnZSh7XG4gICAgICBjb3VudDogMSxcbiAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSxcbiAgICAgIHNvdXJjZVR5cGU6IFtzb3VyY2VUeXBlXSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xuICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuS4iuS8oOS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgICAgICAvLyB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgaW1hZ2VQYXRoID0gcmVzLnRlbXBGaWxlUGF0aHNbMF07XG4gICAgICAgIHRoYXQucGF0aCA9IGltYWdlUGF0aDtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2Vzcygpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUrXCImdGl0bGU9XCIrdGhpcy5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsVHlwZU5hbWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblVwbG9hZFByb2dyZXNzaW5nKGV2ZW50OiBhbnkpe1xuICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3M6XCIpO1xuICB9XG5cbiAgcHVibGljIG5hdmlUb0Zvb2REZXRhaWwoZXZlbnQ6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRJbWFnZVVybCA9IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvZGVmYXVsdEltYWdlL3RleHRzZWFyY2gtZGVmYXVsdC1pbWFnZS5wbmdcIjtcbiAgICBsZXQgbWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICBsZXQgaW1hZ2VJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbWFnZUluZGV4O1xuICAgIGxldCBtZWFsSWQgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTG9nU3VtbWFyeVZPU1tpbWFnZUluZGV4XS5tZWFsTG9nSWQ7XG4gICAgbGV0IGltYWdlVXJsID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbExvZ1N1bW1hcnlWT1NbaW1hZ2VJbmRleF0uaW1hZ2VVcmw7XG4gICAgaW1hZ2VVcmwgPSBpbWFnZVVybCA9PSBcIlwiID8gZGVmYXVsdEltYWdlVXJsIDogaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtID0ge307XG4gICAgcGFyYW0ubWVhbEluZGV4ID0gbWVhbEluZGV4OyAvLyDkvKDliLBmb29kRGV0YWls6aG16Z2i77yM5YGa5pu05paw5Yqf6IO9XG4gICAgcGFyYW0uaW1hZ2VJbmRleCA9IGltYWdlSW5kZXg7IC8vIOS8oOWIsGZvb2REZXRhaWzpobXpnaLvvIzlgZrmm7TmlrDlip/og71cbiAgICBwYXJhbS5tZWFsSWQgPSBtZWFsSWQ7XG4gICAgcGFyYW0uaW1hZ2VVcmwgPSBpbWFnZVVybDtcbiAgICBsZXQgcGFyYW1Kc29uID0gSlNPTi5zdHJpbmdpZnkocGFyYW0pO1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiBcIi4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9mb29kRGV0YWlsL2luZGV4P3BhcmFtSnNvbj1cIiArIHBhcmFtSnNvblxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiDlhbPpl61zaG93TWFza1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUhpZGRlbk1hc2soKXtcbiAgICBpZih0aGlzLmRhdGEuc2hvd01hc2spe1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazpmYWxzZX0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuUGFnZShuZXcgRm9vZERpYXJ5UGFnZSgpKVxuIl19