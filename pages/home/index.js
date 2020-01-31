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
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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Q3hELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNuRixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDcEYsUUFBUSxHQUFHLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3ZELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzVCLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxtREFBbUQsR0FBRyxTQUFTO1NBQ3JFLENBQUMsQ0FBQztJQUNMLENBQUM7SUFJTSx3Q0FBZ0IsR0FBdkI7UUFDRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3JCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtZQUMxQyxPQUFPLEtBQUssQ0FBQTtTQUNiO0lBQ0gsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQWpmRCxJQWlmQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcblxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQge1xuICBSZXRyaWV2ZUZvb2REaWFyeVJlcSwgUmV0cmlldmVGb29kRGlhcnlSZXNwLFxuICBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSxcbiAgUmV0cmlldmVNZWFsTG9nUmVxLCBNZWFsTG9nUmVzcCwgRm9vZExvZ0luZm8sIE1lYWxJbmZvXG59IGZyb20gXCIuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzXCI7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqaW5pdCBmMiBjaGFydCBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5sZXQgY2hhcnQgPSBudWxsO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHtcbiAgbGV0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuYXhpcygnd2VlaycsIHsgIC8v5a+5d2Vla+WvueW6lOeahOe6teaoquWdkOagh+i9tOi/m+ihjOmFjee9rlxuICAgIGdyaWQ6IG51bGwsICAvL+e9keagvOe6v1xuICAgIHRpY2tMaW5lOiBudWxsLFxuICAgIGxhYmVsOiBudWxsLFxuICAgIGxpbmU6IG51bGxcbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZXbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBpdGVtc1swXS5vcmlnaW4ud2VlaztcbiAgICAgIGl0ZW1zWzBdLnZhbHVlID0gaXRlbXNbMF0udmFsdWUgKyAna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsIFwidmFsdWVcIl0pXG4gICAgLnN0eWxlKHsgZmlsbDogJyNmZmZmZmYnLCByOiAxLjcsIGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnI2YzNDY1YScgfSk7XG4gIGNoYXJ0LmxpbmUoe1xuICAgIGNvbm5lY3ROdWxsczogdHJ1ZSAvLyDphY3nva7vvIzov57mjqXnqbrlgLzmlbDmja5cbiAgfSkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIikuc2hhcGUoJ3Ntb290aCcpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xuXG5cbn1cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKmVuZCBvZiBmMiBjaGFydCBpbml0KioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBuYW1lOiBcIueDremHj1wiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLljYPljaFcIiB9LFxuICAgICAgeyBuYW1lOiBcIuiEguiCqlwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIueis+awtFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIuibi+eZvei0qFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9XG4gICAgXSxcbiAgICBtZWFsTGlzdDogW3tcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLml6nppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMSxcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9LHtcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLljYjppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMixcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9LHtcbiAgICAgIFwiZW5lcmd5SW50YWtlXCI6ICctLy0nLFxuICAgICAgXCJtZWFsVHlwZU5hbWVcIjogXCLmmZrppJBcIixcbiAgICAgIFwibWVhbFR5cGVcIjogMyxcbiAgICAgIFwicmVjb21tZW5kZWRFbmVyZ3lJbnRha2VcIjogJy0vLSdcbiAgICB9XSxcbiAgICBzY29yZTogJy0tJyxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51VmlhbWFOaWFCaWJZS2liZ3lWaGljUHpTNVB6T3JWbjZtT2RXYUttTmR3Y1pLWDkzejlCSlR0d25KQ3FpYWF1Rmh1MFdvRDN0d2FGdmpqV0dMQS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6ICcnLC8v5a+86Iiq5qCP5aSE5pi+56S655qE5pe26Ze0XG4gICAgbGF0ZXN0X3dlaWdodDogJyAnLFxuICAgIHNob3dNYXNrOiBmYWxzZSxcbiAgICBzdGF0dXNIZWlnaHQ6IG51bGwsXG4gICAgbmF2SGVpZ2h0OiBudWxsLFxuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywgJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddO1xuICBwdWJsaWMgbWVhbEluZGV4ID0gMDtcblxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgLy8gd3gubmF2aWdhdGVUbyh7dXJsOicuLy4uLy4uL2NoZWNrTnV0cml0aW9uL3BhZ2VzL2NoYXRCb3gvaW5kZXgnfSlcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIH1cblxuICBwdWJsaWMgb25TaG93KCkge1xuICAgIHRoaXMubG9naW4oKTtcbiAgICAvLyBjb21maXJtTWVhbOmhtemdoua3u+WKoOWujOmjn+eJqeWQjiDkvJrop6blj5FcbiAgICBpZiAodGhpcy5tZWFsRGF0ZSAhPT0gMCkge1xuICAgICAgdGhpcy5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwodGhpcy5tZWFsRGF0ZSk7XG4gICAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uUmVhZHkoKSB7XG4gICAgaWYgKGFwcC5nbG9iYWxEYXRhLnN0YXR1c0hlaWdodCA9PSBudWxsIHx8IGFwcC5nbG9iYWxEYXRhLm5hdkhlaWdodCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBzeXN0ZW1JbmZvID0gd3guZ2V0U3lzdGVtSW5mb1N5bmMoKVxuICAgICAgY29uc3Qgc3RhdHVzSGVpZ2h0ID0gc3lzdGVtSW5mby5zdGF0dXNCYXJIZWlnaHRcbiAgICAgIGNvbnN0IGlzaU9TID0gc3lzdGVtSW5mby5zeXN0ZW0uaW5kZXhPZignaU9TJykgPiAtMVxuICAgICAgdmFyIG5hdkhlaWdodDtcbiAgICAgIGlmICghaXNpT1MpIHsgLy8g5a6J5Y2TXG4gICAgICAgIG5hdkhlaWdodCA9IDQ4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF2SGVpZ2h0ID0gNDQ7XG4gICAgICB9XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBzdGF0dXNIZWlnaHQsXG4gICAgICAgIG5hdkhlaWdodFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHN0YXR1c0hlaWdodDogYXBwLmdsb2JhbERhdGEuc3RhdHVzSGVpZ2h0LFxuICAgICAgICBuYXZIZWlnaHQ6IGFwcC5nbG9iYWxEYXRhLm5hdkhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDlvpfliLDpppbpobVjYW52YXPmlbDmja5cbiAgICovXG4gIHB1YmxpYyBnZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KGRhdGUpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgcmVxdWVzdC5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHsgZGF0ZSB9KS50aGVuKHJlcyA9PiB7XG4gICAgICAgIHRoYXQucGFyc2VEYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHJlcyk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyg4OCwgZXJyKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6aaW6aG1Y2FudmFz5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VEYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHJlcykge1xuICAgIGNvbnN0IGZvcm1hdCA9IChudW0pID0+IE1hdGgucm91bmQobnVtKTtcbiAgICBsZXQgc2NvcmUgPSByZXMuc2NvcmU7XG4gICAgbGV0IG51dHJpZW50U3VtbWFyeSA9IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCLng63ph49cIixcbiAgICAgICAgcGVyY2VudDogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UgLyByZXMuZW5lcmd5UmVjb21tZW5kZWRJbnRha2UgKiAxMDApLFxuICAgICAgICBpbnRha2VOdW06IGZvcm1hdChyZXMuZW5lcmd5SW50YWtlKSxcbiAgICAgICAgdG90YWxOdW06IGZvcm1hdChyZXMuZW5lcmd5UmVjb21tZW5kZWRJbnRha2UpLFxuICAgICAgICB1bml0OiBcIuWNg+WNoVwiXG4gICAgICB9LFxuICAgIF07XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzLm1hY3JvbnV0cmllbnRJbnRha2UpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSByZXMubWFjcm9udXRyaWVudEludGFrZVtpbmRleF07XG4gICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWVDTjtcbiAgICAgIGl0ZW0ucGVyY2VudCA9IGZvcm1hdChpdGVtLnBlcmNlbnRhZ2UucGVyY2VudGFnZSk7XG4gICAgICBpdGVtLmludGFrZU51bSA9IGZvcm1hdChpdGVtLmludGFrZS5pbnRha2UpO1xuICAgICAgaXRlbS50b3RhbE51bSA9IGZvcm1hdChpdGVtLmludGFrZS5zdWdnZXN0ZWRJbnRha2UpO1xuICAgICAgaXRlbS51bml0ID0gXCLlhYtcIjtcbiAgICAgIG51dHJpZW50U3VtbWFyeS5wdXNoKGl0ZW0pXG4gICAgfVxuICAgIG51dHJpZW50U3VtbWFyeS5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudChgI2NpcmNsZSR7aW5kZXh9YCkuZHJhd0NpcmNsZShgY2FudmFzYCwgNzUsIDQsIGl0ZW0ucGVyY2VudCAvIDEwMCAqIDIpXG4gICAgfSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG51dHJpZW50U3VtbWFyeTogbnV0cmllbnRTdW1tYXJ5LFxuICAgICAgc2NvcmU6IHNjb3JlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6aWu6aOf6K6w5b2V55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKGRhdGUpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgcmVxdWVzdC5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwoeyBkYXRlIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdGhhdC5wYXJzZURhaWx5TWVhbExvZ0dyb3VwRm9vZExvZ0RldGFpbChyZXMpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgd3guc2hvd1RvYXN0KHsgdGl0bGU6ICfojrflj5bpo5/nianorrDlvZXlpLHotKUnLCBpY29uOiAnbm9uZScgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6aWu6aOf6K6w5b2V55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcGFyc2VEYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwocmVzKSB7XG4gICAgbGV0IG1lYWxMaXN0ID0gW11cbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMpIHtcbiAgICAgIGxldCBtZWFsID0gcmVzW2luZGV4XTtcbiAgICAgIG1lYWwuZW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLmVuZXJneUludGFrZSk7XG4gICAgICBtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlID0gTWF0aC5yb3VuZChtZWFsLnJlY29tbWVuZGVkRW5lcmd5SW50YWtlKTtcbiAgICAgIG1lYWwubWVhbFN1bW1hcnkgPSBbXTtcbiAgICAgIG1lYWwubWVhbExvZ1N1bW1hcnlWT1MgJiYgbWVhbC5tZWFsTG9nU3VtbWFyeVZPUy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGl0ZW0uZW5lcmd5ID0gTWF0aC5yb3VuZChpdGVtLmVuZXJneSk7XG4gICAgICAgIGl0ZW0uY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICBpdGVtLmZvb2RMb2dTdW1tYXJ5TGlzdC5tYXAoaXQgPT4ge1xuICAgICAgICAgIGl0LmNvbG9yVGlwID0gdGhpcy5mb29kQ29sb3JUaXBzQXJyW2luZGV4XTtcbiAgICAgICAgICBpdC5lbmVyZ3kgPSBNYXRoLnJvdW5kKGl0LmVuZXJneSlcbiAgICAgICAgICBtZWFsLm1lYWxTdW1tYXJ5LnB1c2goaXQpXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIG1lYWxMaXN0LnB1c2gobWVhbClcbiAgICB9O1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lYWxMaXN0IH0pXG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5L2T6YeN55u45YWz5L+h5oGvLG9uc2hvd+S4reinpuWPkVxuICAgKi9cbiAgcHVibGljIHJldHJpZXZlRGF0YSgpOiB2b2lkIHtcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih0b2tlbik7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IGN1cnJXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgbGV0IGZpcnN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoMCkudW5peCgpO1xuICAgIGxldCBsYXN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoNikudW5peCgpO1xuXG4gICAgY29uc3QgdG9kYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBjb25zdCBiZWZvcmUzMGRheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3VidHJhY3QoMzAsIFwiZGF5c1wiKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgcmVxID0ge1xuICAgICAgICBkYXRlX2Zyb206IGJlZm9yZTMwZGF5VGltZSxcbiAgICAgICAgZGF0ZV90bzogdG9kYXlUaW1lXG4gICAgICB9O1xuXG4gICAgICB3ZWJBUEkuUmV0cmlldmVXZWlnaHRMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGxhdGVzdF93ZWlnaHQ6IHJlc3AubGF0ZXN0X3dlaWdodC52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBuZWFyRGF0YUFycjogYW55ID0gW107XG4gICAgICAgIGxldCB0b3RhbCA9IDA7Ly8g6I635Y+W5LiA5L2N5bCP5pWw54K555qE5bmz5Z2H5YC877yM5YWI5rGC5oC75ZKMXG4gICAgICAgIHJlc3Aud2VpZ2h0X2xvZ3MubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIHRvdGFsID0gdG90YWwgKyBpdGVtLnZhbHVlXG4gICAgICAgICAgY29uc3QgYmVmb3JlTnVtYmVyRGF5ID0gKHRvZGF5VGltZSAtIGl0ZW0uZGF0ZSkgLyA4NjQwMFxuICAgICAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSBtb21lbnQoaXRlbS5kYXRlICogMTAwMCkuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgIG5lYXJEYXRhQXJyWzMwIC0gYmVmb3JlTnVtYmVyRGF5XSA9IHsgd2VlazogZm9ybWF0RGF0ZSwgdmFsdWU6IGl0ZW0udmFsdWUsIGF2ZzogMjAwMCB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2UgPSBNYXRoLnJvdW5kKHRvdGFsICogMTAgLyByZXNwLndlaWdodF9sb2dzLmxlbmd0aCkgLyAxMFxuICAgICAgICAvLyDnqIDnlo/mlbDnu4TpnIDopoHnlKhmb3LvvIzkuI3og73nlKhtYXDjgIJcbiAgICAgICAgLy8gMzDlpKnlhoXnlKjmiLfnrKzkuIDkuKrmsqHmnInmm7TmlrDkvZPph43nmoTml6XmnJ/otYvlgLzkuLrkvZPph43lubPlnYflgLzvvIzliKvnmoTml6XmnJ/pg73otYvlgLzkuLpudWxsXG4gICAgICAgIGxldCBsZW4gPSBuZWFyRGF0YUFyci5sZW5ndGg7XG4gICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmICghbmVhckRhdGFBcnJbaV0gJiYgZmxhZykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwIC0gaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTogYXZlcmFnZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgICAgIGZsYWcgPSBmYWxzZVxuICAgICAgICAgIH0gZWxzZSBpZiAoIW5lYXJEYXRhQXJyW2ldKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBudWxsLCBhdmc6IDIwMDAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGFydC5heGlzKGZhbHNlKTtcbiAgICAgICAgY2hhcnQuY2hhbmdlRGF0YShuZWFyRGF0YUFycik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJywgZXJyKVxuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCk7XG4gIH1cblxuICBwdWJsaWMgZ29XZWlnaHRSZWNvcmQoKSB7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDogJy9wYWdlcy93ZWlnaHRSZWNvcmQvaW5kZXgnIH0pXG4gIH1cbiAgcHVibGljIGxvZ2luKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5sb2dpbih7XG4gICAgICBzdWNjZXNzKF9yZXMpIHtcbiAgICAgICAgdmFyIHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUgfTtcbiAgICAgICAgbG9naW5BUEkuTWluaVByb2dyYW1Mb2dpbihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgbGV0IHVzZXJTdGF0dXMgPSByZXNwLnVzZXJfc3RhdHVzO1xuICAgICAgICAgIHN3aXRjaCAodXNlclN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSAxOiAvL3ZhbGlkYXRpb24gcGFnZVxuICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9sb2dpbi9pbmRleCcgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiAvL29uQm9hcmRpbmcgcHJvY2VzcyBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9vbkJvYXJkL29uQm9hcmQnIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOiAvL2tlZXAgaXQgYXQgaG9tZSBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB0aGF0LmF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHRoYXQucmV0cmlldmVEYXRhKCk7IC8vIOiOt+WPluS9k+mHjeiusOW9lVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgY29udGVudDogJ+mmlumhteeZu+mZhuWksei0pScsXG4gICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyBhdXRoZW50aWNhdGlvblJlcXVlc3QoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTMnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHB1YmxpYyBnb051dHJpdGlvbmFsRGF0YWJhc2VQYWdlKCkge1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6ICcvcGFnZXMvbnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UvaW5kZXgnIH0pXG4gIH1cblxuICBwdWJsaWMgYmluZE5hdmlUb090aGVyTWluaUFwcCgpIHtcbiAgICAvL3Rlc3Qgb24gbmF2aWdhdGUgbWluaVByb2dyYW1cbiAgICB3eC5uYXZpZ2F0ZVRvTWluaVByb2dyYW0oe1xuICAgICAgYXBwSWQ6ICd3eDRiNzQyMjhiYWExNTQ4OWEnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBlbnZWZXJzaW9uOiAnZGV2ZWxvcCcsXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIC8vIOaJk+W8gOaIkOWKn1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2NjZXNzIG5hdmlnYXRlXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyB0cmlnZ2VyQmluZGdldGRhdGUoKSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoJyNjYWxlbmRhcicpLmRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLy93aGVuIG9wZW5uaW5nIHRoZSBjYWxlbmRhclxuICBwdWJsaWMgYmluZHNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICB9XG5cbiAgLy/pu5jorqTkuLvliqjkvJrop6blj5HkuIDmrKFcbiAgcHVibGljIGJpbmRnZXRkYXRlKGV2ZW50OiBhbnkpIHtcblxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICBsZXQgdGltZSA9IGV2ZW50LmRldGFpbDtcbiAgICBsZXQgbmF2VGl0bGVUaW1lID0gdGltZS55ZWFyICsgJy8nICsgdGltZS5tb250aCArICcvJyArIHRpbWUuZGF0ZTtcbiAgICBsZXQgZGF0ZSA9IG1vbWVudChbdGltZS55ZWFyLCB0aW1lLm1vbnRoIC0gMSwgdGltZS5kYXRlXSk7IC8vIE1vbWVudCBtb250aCBpcyBzaGlmdGVkIGxlZnQgYnkgMVxuXG4gICAgdGhpcy5tZWFsRGF0ZSA9IGRhdGUudW5peCgpO1xuICAgIGlmIChhcHAuZ2xvYmFsRGF0YS5tZWFsRGF0ZSkge1xuICAgICAgdGhpcy5tZWFsRGF0ZSA9IGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlO1xuICAgICAgbmF2VGl0bGVUaW1lID0gbW9tZW50KHRoaXMubWVhbERhdGUgKiAxMDAwKS5mb3JtYXQoJ1lZWVkvTU0vREQnKVxuICAgICAgYXBwLmdsb2JhbERhdGEubWVhbERhdGUgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0b2RheVRpbWVTdGFtcCA9IG1vbWVudChuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBmb3JtYXRNZWFsRGF0YSA9IG1vbWVudCh0aGlzLm1lYWxEYXRlICogMTAwMCk7XG4gICAgaWYgKHRvZGF5VGltZVN0YW1wLmlzU2FtZShmb3JtYXRNZWFsRGF0YSwgJ2QnKSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiAn5LuK5aSpJyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuYXZUaXRsZVRpbWUgfSlcbiAgICB9XG4gICAgLy8gdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgdGhpcy5nZXREYWlseU1hY3JvbnV0cmllbnRTdW1tYXJ5KHRoaXMubWVhbERhdGUpIC8vIOiOt+WPlmNhbnZhc+S/oeaBr1xuICAgIHRoaXMuZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHRoaXMubWVhbERhdGUpIFxuICB9XG5cbiAgcHVibGljIG9uRGFpbHlSZXBvcnRDbGljaygpIHtcbiAgICBpZiAodGhpcy5kYXRhLnNjb3JlID09PSAwKSB7XG4gICAgICB3eC5hbGRzdGF0LnNlbmRFdmVudCggJ+eCueWHu+afpeeci+aXpeaKpScsIHtwYWdlOidob21lJyxzdGF0dXM6MH0gIClcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBcIuaCqOS7iuWkqei/mOayoeaciea3u+WKoOmjn+eJqeWTplwiLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgY29uZmlybVRleHQ6ICfljrvmt7vliqAnXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHd4LmFsZHN0YXQuc2VuZEV2ZW50KCAn54K55Ye75p+l55yL5pel5oqlJywge3BhZ2U6J2hvbWUnLHN0YXR1czoxfSApXG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICByZXF1ZXN0LmdldFVzZXJQcm9maWxlQnlUb2tlbih7IHRva2VuIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICBsZXQgdXNlcklkOiBzdHJpbmcgPSByZXNwLnVzZXJJZDtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IGAvcGFnZXMvcmVwb3J0UGFnZS9yZXBvcnRQYWdlP3VzZXJJZD0ke3VzZXJJZH0mZGF0ZT0ke3RoaXMubWVhbERhdGV9YCB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLm1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHRoaXMubWVhbEluZGV4ICsgMTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBzaG93TWFzazogdHJ1ZSB9KVxuICAgIC8vIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgLy8gICBpdGVtTGlzdDogWyfmi43nhaforrDlvZUnLCAn55u45YaMJywgJ+aWh+Wtl+aQnOe0oiddLFxuICAgIC8vICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgIC8vICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgIC8vICAgICAgIGNhc2UgMDpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICBjYXNlIDE6XG4gICAgLy8gICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMjpcbiAgICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgIC8vICAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlQ2hvb3NlVXBsb2FkVHlwZShlOiBhbnkpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5kZXgpO1xuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgdXJsOiBcIi4uLy4uL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU9XCIgKyB0aGF0LmRhdGEubWVhbExpc3RbdGhpcy5tZWFsSW5kZXhdLm1lYWxUeXBlTmFtZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgICAgICB9KTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ3RleHRTZWFyY2gnLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHNob3dNYXNrOiBmYWxzZSB9KVxuICB9XG5cbiAgcHVibGljIGNob29zZUltYWdlKHNvdXJjZVR5cGU6IHN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5jaG9vc2VJbWFnZSh7XG4gICAgICBjb3VudDogMSxcbiAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSxcbiAgICAgIHNvdXJjZVR5cGU6IFtzb3VyY2VUeXBlXSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xuICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuS4iuS8oOS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgICAgICAvLyB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgaW1hZ2VQYXRoID0gcmVzLnRlbXBGaWxlUGF0aHNbMF07XG4gICAgICAgIHRoYXQucGF0aCA9IGltYWdlUGF0aDtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2VzcygpIHtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogJy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9pbWFnZVRhZy9pbmRleD9pbWFnZVVybD0nICsgdGhpcy5wYXRoICsgXCImbWVhbFR5cGU9XCIgKyB0aGlzLm1lYWxUeXBlICsgXCImbWVhbERhdGU9XCIgKyB0aGlzLm1lYWxEYXRlICsgXCImdGl0bGU9XCIgKyB0aGlzLmRhdGEubWVhbExpc3RbdGhpcy5tZWFsSW5kZXhdLm1lYWxUeXBlTmFtZSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkRmFpbGVkKCkge1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblVwbG9hZFByb2dyZXNzaW5nKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpVG9Gb29kRGV0YWlsKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0SW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW1hZ2VJbmRleDtcbiAgICBsZXQgbWVhbElkID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbExvZ1N1bW1hcnlWT1NbaW1hZ2VJbmRleF0ubWVhbExvZ0lkO1xuICAgIGxldCBpbWFnZVVybCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxMb2dTdW1tYXJ5Vk9TW2ltYWdlSW5kZXhdLmltYWdlVXJsO1xuICAgIGltYWdlVXJsID0gaW1hZ2VVcmwgPT0gXCJcIiA/IGRlZmF1bHRJbWFnZVVybCA6IGltYWdlVXJsO1xuICAgIGxldCBwYXJhbSA9IHt9O1xuICAgIHBhcmFtLm1lYWxJbmRleCA9IG1lYWxJbmRleDsgLy8g5Lyg5YiwZm9vZERldGFpbOmhtemdou+8jOWBmuabtOaWsOWKn+iDvVxuICAgIHBhcmFtLmltYWdlSW5kZXggPSBpbWFnZUluZGV4OyAvLyDkvKDliLBmb29kRGV0YWls6aG16Z2i77yM5YGa5pu05paw5Yqf6IO9XG4gICAgcGFyYW0ubWVhbElkID0gbWVhbElkO1xuICAgIHBhcmFtLmltYWdlVXJsID0gaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIuLy4uLy4uL2hvbWVTdWIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog5YWz6Zetc2hvd01hc2tcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVIaWRkZW5NYXNrKCkge1xuICAgIGlmICh0aGlzLmRhdGEuc2hvd01hc2spIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHNob3dNYXNrOiBmYWxzZSB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cblBhZ2UobmV3IEZvb2REaWFyeVBhZ2UoKSlcbiJdfQ==