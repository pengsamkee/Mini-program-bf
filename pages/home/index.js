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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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QUM7UUFDMUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osR0FBRyxFQUFFLG1EQUFtRCxHQUFHLFNBQVM7U0FDckUsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUlNLHdDQUFnQixHQUF2QjtRQUNFLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUM7WUFDbkIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFBO1lBQ3ZDLE9BQU8sS0FBSyxDQUFBO1NBQ2I7SUFDSCxDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBbGVELElBa2VDO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIGxvZ2luQVBJIGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFJldHJpZXZlRm9vZERpYXJ5UmVxLCBSZXRyaWV2ZUZvb2REaWFyeVJlc3AsXG4gIFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB1cGxvYWRGaWxlIGZyb20gJy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmxldCBjaGFydCA9IG51bGw7XG5mdW5jdGlvbiBpbml0Q2hhcnQoY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBGMikge1xuICBsZXQgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCwgIC8v572R5qC857q/XG4gICAgdGlja0xpbmU6bnVsbCxcbiAgICBsYWJlbDpudWxsLFxuICAgIGxpbmU6bnVsbFxuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lduS4reaciXgseeWdkOagh+WSjOiiq+eCueWHu+mhueeahOS/oeaBr1xuICAgICAgaXRlbXNbMF0ubmFtZSA9IGl0ZW1zWzBdLm9yaWdpbi53ZWVrO1xuICAgICAgaXRlbXNbMF0udmFsdWUgPSBpdGVtc1swXS52YWx1ZSsna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsXCJ2YWx1ZVwiXSlcbiAgICAuc3R5bGUoeyBmaWxsOiAnI2ZmZmZmZicsIHI6IDEuNywgbGluZVdpZHRoOiAxLCBzdHJva2U6ICcjZjM0NjVhJyB9KTtcbiAgY2hhcnQubGluZSh7XG4gICAgY29ubmVjdE51bGxzOiB0cnVlIC8vIOmFjee9ru+8jOi/nuaOpeepuuWAvOaVsOaNrlxuICB9KS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKS5zaGFwZSgnc21vb3RoJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cbiAgXG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5jbGFzcyBGb29kRGlhcnlQYWdlIHtcbiAgcHVibGljIHVzZXJJbmZvID0ge31cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgb3B0czoge1xuICAgICAgb25Jbml0OiBpbml0Q2hhcnQsXG4gICAgfSxcbiAgICBudXRyaWVudFN1bW1hcnk6IFtcbiAgICAgIHsgbmFtZTogXCLng63ph49cIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbmFtZTogXCLohILogqpcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLnorPmsLRcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbmFtZTogXCLom4vnmb3otKhcIiwgcGVyY2VudDogMCwgaW50YWtlTnVtOiAnLScsIHRvdGFsTnVtOiAnLScsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtdLFxuICAgIHNjb3JlOiAnLS0nLFxuICAgIGluZm9MaXN0czogW1xuICAgICAgeyB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy9mZzFxbGkwRGsxeDl5MFdaY09Idjh3JyxpbWFnZTonaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51VmlhbWFOaWFCaWJZS2liZ3lWaGljUHpTNVB6T3JWbjZtT2RXYUttTmR3Y1pLWDkzejlCSlR0d25KQ3FpYWF1Rmh1MFdvRDN0d2FGdmpqV0dMQS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTon56eL5a2j6aWu6aOf5pS755WlISdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLy1SYkRGMVVMUjBQRzdiN1JJeVVmTncnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZLV2lhWWdIRzBHQTlNaWFSd3NydEVib2lialdSUVpoejc4akdKWkx6RzNDSmxVSWljbmdhWXdnWUNla0R5OEMzTm9LakJ5QnhZMGliaWFWQWcvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6ICfngrnlpJbljZblsLHkuI3lgaXlurfvvJ8g5oiR5YGP5LiNJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvOEljSjdINnE0dnR6ZGxXTDNXWEl4UScsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51V2JMUkhRRUpvdkJDdzRYVXhWV0tHUEppYXZQckE5TktQSjRzaWNGMzZvM1paS2oyU3RsaHBWb2liQnY2Y3MwTkhUSmljMldGQUVSZGVpYzNRLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn6JCl5YW75biI5aaC5L2V5a+56ICB5Lit5bCR6IOW5Y+L6L+b6KGM6L+Q5Yqo5rK755aX77yfIOeci+eci+iTneearuS5puaAjuS5iOivtCdcbiAgICAgIH1cbiAgICBdLFxuICAgIG5hdlRpdGxlVGltZTonJywvL+WvvOiIquagj+WkhOaYvuekuueahOaXtumXtFxuICAgIGxhdGVzdF93ZWlnaHQ6JyAnLFxuICAgIHNob3dNYXNrOmZhbHNlLFxuICAgIHN0YXR1c0hlaWdodDpudWxsLFxuICAgIG5hdkhlaWdodDpudWxsLFxuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICAvLyBwdWJsaWMgc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IGZhbHNlO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywnIzdmZGJmZicsICcjMzljY2NjJywgJyMzZDk5NzAnLCAnIzJlY2M0MCcsICcjMDFmZjcwJywgJyNmZjg1MWInLCAnIzAwMWYzZicsICcjZmY0MTM2JywgJyM4NTE0NGInLCAnI2YwMTJiZScsICcjYjEwZGM5JywgJyMxMTExMTEnLCAnI2FhYWFhYScsICcjZGRkZGRkJ107XG4gIHB1YmxpYyBtZWFsSW5kZXggPSAwO1xuXG5cbiAgcHVibGljIG9uTG9hZCgpIHtcbiAgICAvLyB3eC5uYXZpZ2F0ZVRvKHt1cmw6Jy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9tZWFsQW5hbHlzaXMvaW5kZXg/bWVhbExvZ0lkPTIwODc2Jm1lYWxEYXRlPTE1NzczNzYwMDAmbWVhbFR5cGU9MSd9KVxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgfVxuICBcbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICB0aGlzLmxvZ2luKCk7XG4gICAgLy8gY29tZmlybU1lYWzpobXpnaLmt7vliqDlrozpo5/nianlkI4g5Lya6Kem5Y+RXG4gICAgaWYgKHRoaXMubWVhbERhdGUgIT09IDApIHtcbiAgICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgICAgdGhpcy5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwodGhpcy5tZWFsRGF0ZSk7XG4gICAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgb25SZWFkeSgpe1xuICAgIGlmKGFwcC5nbG9iYWxEYXRhLnN0YXR1c0hlaWdodD09bnVsbCB8fCBhcHAuZ2xvYmFsRGF0YS5uYXZIZWlnaHQ9PW51bGwpe1xuICAgICAgY29uc3Qgc3lzdGVtSW5mbyA9IHd4LmdldFN5c3RlbUluZm9TeW5jKClcbiAgICAgIGNvbnN0IHN0YXR1c0hlaWdodCA9IHN5c3RlbUluZm8uc3RhdHVzQmFySGVpZ2h0XG4gICAgICBjb25zdCBpc2lPUyA9IHN5c3RlbUluZm8uc3lzdGVtLmluZGV4T2YoJ2lPUycpID4gLTEgIFxuICAgICAgdmFyIG5hdkhlaWdodDtcbiAgICAgIGlmICghaXNpT1MpIHsgLy8g5a6J5Y2TXG4gICAgICAgICAgbmF2SGVpZ2h0ID0gNDg7IFxuICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgICBuYXZIZWlnaHQgPSA0NDsgICAgICAgICAgICBcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IFxuICAgICAgICBzdGF0dXNIZWlnaHQsXG4gICAgICAgIG5hdkhlaWdodFxuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBcbiAgICAgICAgc3RhdHVzSGVpZ2h0OmFwcC5nbG9iYWxEYXRhLnN0YXR1c0hlaWdodCxcbiAgICAgICAgbmF2SGVpZ2h0OmFwcC5nbG9iYWxEYXRhLm5hdkhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDlvpfliLDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBnZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KGRhdGUpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzIFxuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIGlmKHRva2VuKXtcbiAgICAgIHJlcXVlc3QuZ2V0RGFpbHlNYWNyb251dHJpZW50U3VtbWFyeSh7ZGF0ZX0pLnRoZW4ocmVzPT57XG4gICAgICAgIHRoYXQucGFyc2VEYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHJlcyk7XG4gICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgY29uc29sZS5sb2coODgsZXJyKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6aaW6aG1Y2FudmFz5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VEYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHJlcyl7XG4gICAgY29uc3QgZm9ybWF0ID0gKG51bSkgPT4gTWF0aC5yb3VuZChudW0pO1xuICAgIGxldCBzY29yZSA9IHJlcy5zY29yZTtcbiAgICBsZXQgbnV0cmllbnRTdW1tYXJ5ID0gW1xuICAgICAgeyBcbiAgICAgICAgbmFtZTogXCLng63ph49cIiwgXG4gICAgICAgIHBlcmNlbnQ6IGZvcm1hdChyZXMuZW5lcmd5SW50YWtlL3Jlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSoxMDApLCBcbiAgICAgICAgaW50YWtlTnVtOiBmb3JtYXQocmVzLmVuZXJneUludGFrZSksIFxuICAgICAgICB0b3RhbE51bTogZm9ybWF0KHJlcy5lbmVyZ3lSZWNvbW1lbmRlZEludGFrZSksIFxuICAgICAgICB1bml0OiBcIuWNg+WNoVwiIFxuICAgICAgfSxcbiAgICBdO1xuICAgIGZvciAobGV0IGluZGV4IGluIHJlcy5tYWNyb251dHJpZW50SW50YWtlKXtcbiAgICAgIGNvbnN0IGl0ZW0gPSByZXMubWFjcm9udXRyaWVudEludGFrZVtpbmRleF07XG4gICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWVDTjtcbiAgICAgIGl0ZW0ucGVyY2VudCA9IGZvcm1hdChpdGVtLnBlcmNlbnRhZ2UucGVyY2VudGFnZSk7XG4gICAgICBpdGVtLmludGFrZU51bSA9IGZvcm1hdChpdGVtLmludGFrZS5pbnRha2UpO1xuICAgICAgaXRlbS50b3RhbE51bSA9IGZvcm1hdChpdGVtLmludGFrZS5zdWdnZXN0ZWRJbnRha2UpO1xuICAgICAgaXRlbS51bml0ID0gXCLlhYtcIiA7XG4gICAgICBudXRyaWVudFN1bW1hcnkucHVzaChpdGVtKVxuICAgIH1cbiAgICBudXRyaWVudFN1bW1hcnkubWFwKChpdGVtLGluZGV4KT0+e1xuICAgICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoYCNjaXJjbGUke2luZGV4fWApLmRyYXdDaXJjbGUoYGNhbnZhc2AsIDc1LCA0LCBpdGVtLnBlcmNlbnQvMTAwICogMilcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbnV0cmllbnRTdW1tYXJ5OiBudXRyaWVudFN1bW1hcnksXG4gICAgICBzY29yZTogc2NvcmVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bppa7po5/orrDlvZXnm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBnZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwoZGF0ZSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICBpZih0b2tlbil7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh7ZGF0ZX0pLnRoZW4ocmVzPT57XG4gICAgICAgIHRoYXQucGFyc2VEYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwocmVzKTtcbiAgICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgICB3eC5zaG93VG9hc3QoeyB0aXRsZTogJ+iOt+WPlumjn+eJqeiusOW9leWksei0pScsIGljb246ICdub25lJyB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDop6PmnpDppa7po5/orrDlvZXnm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBwYXJzZURhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChyZXMpe1xuICAgIGxldCBtZWFsTGlzdCA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzKXtcbiAgICAgIGxldCBtZWFsID0gcmVzW2luZGV4XTtcbiAgICAgIG1lYWwuZW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLmVuZXJneUludGFrZSk7XG4gICAgICBtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwubWVhbFN1bW1hcnkgPSBbXTtcbiAgICAgIG1lYWwubWVhbExvZ1N1bW1hcnlWT1MmJm1lYWwubWVhbExvZ1N1bW1hcnlWT1MubWFwKChpdGVtLGluZGV4KT0+e1xuICAgICAgICBpdGVtLmVuZXJneSA9IE1hdGgucm91bmQoaXRlbS5lbmVyZ3kpOyBcbiAgICAgICAgaXRlbS5jb2xvclRpcCA9IHRoaXMuZm9vZENvbG9yVGlwc0FycltpbmRleF07XG4gICAgICAgIGl0ZW0uZm9vZExvZ1N1bW1hcnlMaXN0Lm1hcChpdD0+e1xuICAgICAgICAgIGl0LmNvbG9yVGlwID0gdGhpcy5mb29kQ29sb3JUaXBzQXJyW2luZGV4XTtcbiAgICAgICAgICBpdC5lbmVyZ3kgPSBNYXRoLnJvdW5kKGl0LmVuZXJneSlcbiAgICAgICAgICBtZWFsLm1lYWxTdW1tYXJ5LnB1c2goaXQpXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIG1lYWxMaXN0LnB1c2gobWVhbClcbiAgICB9O1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7bWVhbExpc3R9KVxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS9k+mHjeebuOWFs+S/oeaBryxvbnNob3fkuK3op6blj5FcbiAgICovXG4gIHB1YmxpYyByZXRyaWV2ZURhdGEoKTogdm9pZCB7XG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBjdXJyV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlaygpO1xuICAgIGxldCBmaXJzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDApLnVuaXgoKTtcbiAgICBsZXQgbGFzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLnVuaXgoKTtcblxuICAgIGNvbnN0IHRvZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgY29uc3QgYmVmb3JlMzBkYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN1YnRyYWN0KDMwLCBcImRheXNcIikuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHJlcSA9IHtcbiAgICAgICAgZGF0ZV9mcm9tOiBiZWZvcmUzMGRheVRpbWUsXG4gICAgICAgIGRhdGVfdG86IHRvZGF5VGltZVxuICAgICAgfTtcblxuICAgICAgd2ViQVBJLlJldHJpZXZlV2VpZ2h0TG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JldHJpZXZlV2VpZ2h0TG9nJywgcmVzcCk7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbGF0ZXN0X3dlaWdodDogcmVzcC5sYXRlc3Rfd2VpZ2h0LnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IG5lYXJEYXRhQXJyOmFueSA9IFtdO1xuICAgICAgICBsZXQgdG90YWwgPSAwOy8vIOiOt+WPluS4gOS9jeWwj+aVsOeCueeahOW5s+Wdh+WAvO+8jOWFiOaxguaAu+WSjFxuICAgICAgICByZXNwLndlaWdodF9sb2dzLm1hcChpdGVtPT57XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIGl0ZW0udmFsdWVcbiAgICAgICAgICBjb25zdCBiZWZvcmVOdW1iZXJEYXkgPSAodG9kYXlUaW1lIC0gaXRlbS5kYXRlKSAvIDg2NDAwXG4gICAgICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IG1vbWVudChpdGVtLmRhdGUqMTAwMCkuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgIG5lYXJEYXRhQXJyWzMwIC0gYmVmb3JlTnVtYmVyRGF5XSA9IHsgd2VlazogZm9ybWF0RGF0ZSwgdmFsdWU6IGl0ZW0udmFsdWUsIGF2ZzogMjAwMCB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2UgPSBNYXRoLnJvdW5kKHRvdGFsKjEwIC8gcmVzcC53ZWlnaHRfbG9ncy5sZW5ndGgpLzEwXG4gICAgICAgIC8vIOeogOeWj+aVsOe7hOmcgOimgeeUqGZvcu+8jOS4jeiDveeUqG1hcOOAglxuICAgICAgICAvLyAzMOWkqeWGheeUqOaIt+esrOS4gOS4quayoeacieabtOaWsOS9k+mHjeeahOaXpeacn+i1i+WAvOS4uuS9k+mHjeW5s+Wdh+WAvO+8jOWIq+eahOaXpeacn+mDvei1i+WAvOS4um51bGxcbiAgICAgICAgbGV0IGxlbiA9IG5lYXJEYXRhQXJyLmxlbmd0aDtcbiAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDtpPGxlbjtpKyspe1xuICAgICAgICAgIGlmICghbmVhckRhdGFBcnJbaV0gJiYgZmxhZykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwLWksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6IGF2ZXJhZ2UsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgICBmbGFnID0gZmFsc2VcbiAgICAgICAgICB9IGVsc2UgaWYgKCFuZWFyRGF0YUFycltpXSl7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOm51bGwsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICAgICAgICBjaGFydC5jaGFuZ2VEYXRhKG5lYXJEYXRhQXJyKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bkvZPph43mlbDmja7lpLHotKUnLGVycilcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApO1xuICB9XG5cbiAgcHVibGljIGdvV2VpZ2h0UmVjb3JkKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDonL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleCcgfSlcbiAgfVxuICBwdWJsaWMgbG9naW4oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICB2YXIgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbUxvZ2luKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgc3dpdGNoICh1c2VyU3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIDE6IC8vdmFsaWRhdGlvbiBwYWdlXG4gICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6IC8vb25Cb2FyZGluZyBwcm9jZXNzIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL29uQm9hcmQvb25Cb2FyZCcgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6IC8va2VlcCBpdCBhdCBob21lIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHRoYXQuYXV0aGVudGljYXRpb25SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5yZXRyaWV2ZURhdGEoKTsgLy8g6I635Y+W5L2T6YeN6K6w5b2VXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiAnLi4vbG9naW4vaW5kZXg/dXNlcl9zdGF0dXM9MydcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICB9XG5cbiAgcHVibGljIGdvTnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOicvcGFnZXMvbnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UvaW5kZXgnIH0pXG4gIH1cblxuICBwdWJsaWMgYmluZE5hdmlUb090aGVyTWluaUFwcCgpIHtcbiAgICAvL3Rlc3Qgb24gbmF2aWdhdGUgbWluaVByb2dyYW1cbiAgICB3eC5uYXZpZ2F0ZVRvTWluaVByb2dyYW0oe1xuICAgICAgYXBwSWQ6ICd3eDRiNzQyMjhiYWExNTQ4OWEnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBlbnZWZXJzaW9uOiAnZGV2ZWxvcCcsXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIC8vIOaJk+W8gOaIkOWKn1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2NjZXNzIG5hdmlnYXRlXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyB0cmlnZ2VyQmluZGdldGRhdGUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudCgnI2NhbGVuZGFyJykuZGF0ZVNlbGVjdGlvbigpXG4gIH1cblxuICAvL3doZW4gb3Blbm5pbmcgdGhlIGNhbGVuZGFyXG4gIHB1YmxpYyBiaW5kc2VsZWN0KGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gIH1cblxuICAvL+m7mOiupOS4u+WKqOS8muinpuWPkeS4gOasoVxuICBwdWJsaWMgYmluZGdldGRhdGUoZXZlbnQ6IGFueSkge1xuICAgIFxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICBsZXQgdGltZSA9IGV2ZW50LmRldGFpbDtcbiAgICBsZXQgbmF2VGl0bGVUaW1lID0gdGltZS55ZWFyICsgJy8nICsgdGltZS5tb250aCArICcvJyArIHRpbWUuZGF0ZTtcbiAgICBsZXQgZGF0ZSA9IG1vbWVudChbdGltZS55ZWFyLCB0aW1lLm1vbnRoIC0gMSwgdGltZS5kYXRlXSk7IC8vIE1vbWVudCBtb250aCBpcyBzaGlmdGVkIGxlZnQgYnkgMVxuICAgIFxuICAgIHRoaXMubWVhbERhdGUgPSBkYXRlLnVuaXgoKTtcbiAgICBpZihhcHAuZ2xvYmFsRGF0YS5tZWFsRGF0ZSl7XG4gICAgICB0aGlzLm1lYWxEYXRlID0gYXBwLmdsb2JhbERhdGEubWVhbERhdGU7XG4gICAgICBuYXZUaXRsZVRpbWUgPSBtb21lbnQodGhpcy5tZWFsRGF0ZSoxMDAwKS5mb3JtYXQoJ1lZWVkvTU0vREQnKVxuICAgICAgYXBwLmdsb2JhbERhdGEubWVhbERhdGUgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0b2RheVRpbWVTdGFtcCA9IG1vbWVudChuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBmb3JtYXRNZWFsRGF0YSA9IG1vbWVudCh0aGlzLm1lYWxEYXRlKjEwMDApO1xuICAgIGlmICh0b2RheVRpbWVTdGFtcC5pc1NhbWUoZm9ybWF0TWVhbERhdGEsJ2QnKSl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWU6ICfku4rlpKknIH0pXG4gICAgfSBlbHNlIHsgXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWUgfSlcbiAgICB9IFxuICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgIHRoaXMuZ2V0RGFpbHlNYWNyb251dHJpZW50U3VtbWFyeSh0aGlzLm1lYWxEYXRlKSAvLyDojrflj5ZjYW52YXPkv6Hmga9cbiAgICB0aGlzLmdldERhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbCh0aGlzLm1lYWxEYXRlKSAvLyDojrflj5ZtZWFsTGlzdOS/oeaBr1xuICB9XG5cbiAgcHVibGljIG9uRGFpbHlSZXBvcnRDbGljaygpIHtcbiAgICBpZih0aGlzLmRhdGEuc2NvcmU9PT0wKXtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBcIuaCqOS7iuWkqei/mOayoeaciea3u+WKoOmjn+eJqeWTplwiLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgY29uZmlybVRleHQ6J+WOu+a3u+WKoCdcbiAgICAgIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIn0pO1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHJlcXVlc3QuZ2V0VXNlclByb2ZpbGVCeVRva2VuKHt0b2tlbn0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICBsZXQgdXNlcklkOiBzdHJpbmcgPSByZXNwLnVzZXJJZDtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IGAvcGFnZXMvcmVwb3J0UGFnZS9yZXBvcnRQYWdlP3VzZXJJZD0ke3VzZXJJZH0mZGF0ZT0ke3RoaXMubWVhbERhdGV9YH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfSlcbiAgfVxuICBcbiAgcHVibGljIGFkZEZvb2RJbWFnZShldmVudDogYW55KSB7XG4gICAgdGhpcy5tZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIHRoaXMubWVhbFR5cGUgPSB0aGlzLm1lYWxJbmRleCArIDE7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazp0cnVlfSlcbiAgICAvLyB3eC5zaG93QWN0aW9uU2hlZXQoe1xuICAgIC8vICAgaXRlbUxpc3Q6IFsn5ouN54Wn6K6w5b2VJywgJ+ebuOWGjCcsICfmloflrZfmkJzntKInXSxcbiAgICAvLyAgIHN1Y2Nlc3MocmVzOiBhbnkpIHtcbiAgICAvLyAgICAgc3dpdGNoIChyZXMudGFwSW5kZXgpIHtcbiAgICAvLyAgICAgICBjYXNlIDA6XG4gICAgLy8gICAgICAgICB0aGF0LmNob29zZUltYWdlKCdjYW1lcmEnKTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgY2FzZSAxOlxuICAgIC8vICAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnYWxidW0nKTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICBjYXNlIDI6XG4gICAgLy8gICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAvLyAgICAgICAgICAgdXJsOiBcIi4uLy4uL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU9XCIgKyB0aGF0LmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTmFtZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAvLyAgICAgICAgICAgc291cmNldHlwZTogJ3RleHRTZWFyY2gnLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG5cbiAgcHVibGljIGhhbmRsZUNob29zZVVwbG9hZFR5cGUoZTphbnkpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgaW5kZXggPSBwYXJzZUludChlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbmRleCk7XG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdjYW1lcmEnKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ2NhbWVyYScsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnYWxidW0nKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ2FsYnVtJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFt0aGlzLm1lYWxJbmRleF0ubWVhbFR5cGVOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgICAgIH0pO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgKCB0aGlzIGFzIGFueSApLnNldERhdGEoe3Nob3dNYXNrOmZhbHNlfSlcbiAgfVxuXG4gIHB1YmxpYyBjaG9vc2VJbWFnZShzb3VyY2VUeXBlOiBzdHJpbmcpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guY2hvb3NlSW1hZ2Uoe1xuICAgICAgY291bnQ6IDEsXG4gICAgICBzaXplVHlwZTogWydvcmlnaW5hbCcsICdjb21wcmVzc2VkJ10sXG4gICAgICBzb3VyY2VUeXBlOiBbc291cmNlVHlwZV0sXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzOiBhbnkpIHtcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLkuIrkvKDkuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICAgICAgLy8gdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgbGV0IGltYWdlUGF0aCA9IHJlcy50ZW1wRmlsZVBhdGhzWzBdO1xuICAgICAgICB0aGF0LnBhdGggPSBpbWFnZVBhdGg7XG4gICAgICAgIHVwbG9hZEZpbGUoaW1hZ2VQYXRoLCB0aGF0Lm9uSW1hZ2VVcGxvYWRTdWNjZXNzLCB0aGF0Lm9uSW1hZ2VVcGxvYWRGYWlsZWQsIHRoYXQub25VcGxvYWRQcm9ncmVzc2luZywgMCwgMCk7XG4gICAgICB9LFxuICAgICAgZmFpbDogZnVuY3Rpb24gKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZFN1Y2Nlc3MoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogJy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9pbWFnZVRhZy9pbmRleD9pbWFnZVVybD0nICsgdGhpcy5wYXRoICsgXCImbWVhbFR5cGU9XCIgKyB0aGlzLm1lYWxUeXBlICsgXCImbWVhbERhdGU9XCIgKyB0aGlzLm1lYWxEYXRlK1wiJnRpdGxlPVwiK3RoaXMuZGF0YS5tZWFsTGlzdFt0aGlzLm1lYWxJbmRleF0ubWVhbFR5cGVOYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRGYWlsZWQoKXtcbiAgICBjb25zb2xlLmxvZyhcInVwbG9hZGZhaWxlZFwiKTtcbiAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KXtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpVG9Gb29kRGV0YWlsKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0SW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW1hZ2VJbmRleDtcbiAgICBsZXQgbWVhbElkID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbExvZ1N1bW1hcnlWT1NbaW1hZ2VJbmRleF0ubWVhbExvZ0lkO1xuICAgIGxldCBpbWFnZVVybCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxMb2dTdW1tYXJ5Vk9TW2ltYWdlSW5kZXhdLmltYWdlVXJsO1xuICAgIGltYWdlVXJsID0gaW1hZ2VVcmwgPT0gXCJcIiA/IGRlZmF1bHRJbWFnZVVybCA6IGltYWdlVXJsO1xuICAgIGxldCBwYXJhbSA9IHt9O1xuICAgIHBhcmFtLm1lYWxJbmRleCA9IG1lYWxJbmRleDsgLy8g5Lyg5YiwZm9vZERldGFpbOmhtemdou+8jOWBmuabtOaWsOWKn+iDvVxuICAgIHBhcmFtLmltYWdlSW5kZXggPSBpbWFnZUluZGV4OyAvLyDkvKDliLBmb29kRGV0YWls6aG16Z2i77yM5YGa5pu05paw5Yqf6IO9XG4gICAgcGFyYW0ubWVhbElkID0gbWVhbElkO1xuICAgIHBhcmFtLmltYWdlVXJsID0gaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIuLy4uLy4uL2hvbWVTdWIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog5YWz6Zetc2hvd01hc2tcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVIaWRkZW5NYXNrKCl7XG4gICAgaWYodGhpcy5kYXRhLnNob3dNYXNrKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cblBhZ2UobmV3IEZvb2REaWFyeVBhZ2UoKSlcbiJdfQ==