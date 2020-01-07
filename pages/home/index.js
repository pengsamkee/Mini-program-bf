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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQW1EO0FBQ25ELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFDcEQsdURBQWdEO0FBSWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQUksSUFBSSxHQUFHO1FBQ1QsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtLQUN2QyxDQUFDO0lBQ0YsS0FBSyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNuQixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssT0FBQTtR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QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU15QXBwIH0gZnJvbSAnLi4vLi4vYXBwJ1xuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSc7XG5cbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgUmV0cmlldmVGb29kRGlhcnlSZXEsIFJldHJpZXZlRm9vZERpYXJ5UmVzcCxcbiAgUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXEsXG4gIFJldHJpZXZlTWVhbExvZ1JlcSwgTWVhbExvZ1Jlc3AsIEZvb2RMb2dJbmZvLCBNZWFsSW5mb1xufSBmcm9tIFwiLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSc7XG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCAqIGFzIHVwbG9hZEZpbGUgZnJvbSAnLi4vLi4vYXBpL3VwbG9hZGVyLmpzJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4vLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnO1xuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKmluaXQgZjIgY2hhcnQgcGFydCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cblxubGV0IGNoYXJ0ID0gbnVsbDtcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7XG4gIGxldCBkYXRhID0gW1xuICAgIHsgd2VlazogJ+WRqOaXpScsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIAnLCB2YWx1ZTogMTE1MCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LqMJywgdmFsdWU6IDEzMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4iScsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlm5snLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LqUJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWFrScsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfVxuICBdO1xuICBjaGFydCA9IG5ldyBGMi5DaGFydCh7XG4gICAgZWw6IGNhbnZhcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSk7XG4gIGNoYXJ0LmF4aXMoJ3dlZWsnLCB7ICAvL+WvuXdlZWvlr7nlupTnmoTnurXmqKrlnZDmoIfovbTov5vooYzphY3nva5cbiAgICBncmlkOiBudWxsLCAgLy/nvZHmoLznur9cbiAgICB0aWNrTGluZTpudWxsLFxuICAgIGxhYmVsOm51bGwsXG4gICAgbGluZTpudWxsXG4gIH0pO1xuICBjaGFydC50b29sdGlwKHtcbiAgICBzaG93Q3Jvc3NoYWlyczogdHJ1ZSwgLy8g5piv5ZCm5pi+56S65Lit6Ze06YKj5qC56L6F5Yqp57q/77yM54K55Zu+44CB6Lev5b6E5Zu+44CB57q/5Zu+44CB6Z2i56ev5Zu+6buY6K6k5bGV56S6XG4gICAgb25TaG93KGV2KSB7IC8vIOeCueWHu+afkOmhueWQju+8jOmhtumDqHRpcOaYvuekuueahOmFjee9riBpdGVtc1swXS5uYW1lOml0ZW1bMF0udmFsdWVcbiAgICAgIGNvbnN0IHsgaXRlbXMgfSA9IGV2OyAvL2V25Lit5pyJeCx55Z2Q5qCH5ZKM6KKr54K55Ye76aG555qE5L+h5oGvXG4gICAgICBpdGVtc1swXS5uYW1lID0gaXRlbXNbMF0ub3JpZ2luLndlZWs7XG4gICAgICBpdGVtc1swXS52YWx1ZSA9IGl0ZW1zWzBdLnZhbHVlKydrZyc7XG4gICAgICBpdGVtcy5sZW5ndGggPSAxXG4gICAgfVxuICB9KTtcblxuICBjaGFydC5wb2ludCgpXG4gICAgLnBvc2l0aW9uKFtcIndlZWtcIixcInZhbHVlXCJdKVxuICAgIC5zdHlsZSh7IGZpbGw6ICcjZmZmZmZmJywgcjogMS43LCBsaW5lV2lkdGg6IDEsIHN0cm9rZTogJyNmMzQ2NWEnIH0pO1xuICBjaGFydC5saW5lKHtcbiAgICBjb25uZWN0TnVsbHM6IHRydWUgLy8g6YWN572u77yM6L+e5o6l56m65YC85pWw5o2uXG4gIH0pLnBvc2l0aW9uKCd3ZWVrKnZhbHVlJykuY29sb3IoXCIjZWQyYzQ4XCIpLnNoYXBlKCdzbW9vdGgnKTtcbiAgY2hhcnQucmVuZGVyKCk7XG4gIHJldHVybiBjaGFydDtcblxuICBcbn1cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKmVuZCBvZiBmMiBjaGFydCBpbml0KioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBuYW1lOiBcIueDremHj1wiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLljYPljaFcIiB9LFxuICAgICAgeyBuYW1lOiBcIuiEguiCqlwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIueis+awtFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBuYW1lOiBcIuibi+eZvei0qFwiLCBwZXJjZW50OiAwLCBpbnRha2VOdW06ICctJywgdG90YWxOdW06ICctJywgdW5pdDogXCLlhYtcIiB9XG4gICAgXSxcbiAgICBtZWFsTGlzdDogW10sXG4gICAgc2NvcmU6ICctLScsXG4gICAgbWVudUluZm86IHt9LFxuICAgIGluZm9MaXN0czogW1xuICAgICAgeyB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy9mZzFxbGkwRGsxeDl5MFdaY09Idjh3JyxpbWFnZTonaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51VmlhbWFOaWFCaWJZS2liZ3lWaGljUHpTNVB6T3JWbjZtT2RXYUttTmR3Y1pLWDkzejlCSlR0d25KQ3FpYWF1Rmh1MFdvRDN0d2FGdmpqV0dMQS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTon56eL5a2j6aWu6aOf5pS755WlISdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLy1SYkRGMVVMUjBQRzdiN1JJeVVmTncnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZLV2lhWWdIRzBHQTlNaWFSd3NydEVib2lialdSUVpoejc4akdKWkx6RzNDSmxVSWljbmdhWXdnWUNla0R5OEMzTm9LakJ5QnhZMGliaWFWQWcvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6ICfngrnlpJbljZblsLHkuI3lgaXlurfvvJ8g5oiR5YGP5LiNJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvOEljSjdINnE0dnR6ZGxXTDNXWEl4UScsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51V2JMUkhRRUpvdkJDdzRYVXhWV0tHUEppYXZQckE5TktQSjRzaWNGMzZvM1paS2oyU3RsaHBWb2liQnY2Y3MwTkhUSmljMldGQUVSZGVpYzNRLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn6JCl5YW75biI5aaC5L2V5a+56ICB5Lit5bCR6IOW5Y+L6L+b6KGM6L+Q5Yqo5rK755aX77yfIOeci+eci+iTneearuS5puaAjuS5iOivtCdcbiAgICAgIH1cbiAgICBdLFxuICAgIG5hdlRpdGxlVGltZTonJywvL+WvvOiIquagj+WkhOaYvuekuueahOaXtumXtFxuICAgIGxhdGVzdF93ZWlnaHQ6JyAnLFxuICAgIHNob3dNYXNrOmZhbHNlLFxuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICAvLyBwdWJsaWMgc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IGZhbHNlO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywnIzdmZGJmZicsICcjMzljY2NjJywgJyMzZDk5NzAnLCAnIzJlY2M0MCcsICcjMDFmZjcwJywgJyNmZjg1MWInLCAnIzAwMWYzZicsICcjZmY0MTM2JywgJyM4NTE0NGInLCAnI2YwMTJiZScsICcjYjEwZGM5JywgJyMxMTExMTEnLCAnI2FhYWFhYScsICcjZGRkZGRkJ107XG4gIHB1YmxpYyBtZWFsSW5kZXggPSAwO1xuXG5cbiAgcHVibGljIG9uTG9hZCgpIHtcbiAgICAvLyB3eC5uYXZpZ2F0ZVRvKHt1cmw6Jy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9tZWFsQW5hbHlzaXMvaW5kZXg/bWVhbExvZ0lkPTIwODc2Jm1lYWxEYXRlPTE1NzczNzYwMDAmbWVhbFR5cGU9MSd9KVxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgfVxuICBcbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICB0aGlzLmxvZ2luKCk7XG4gICAgLy8gY29tZmlybU1lYWzpobXpnaLmt7vliqDlrozpo5/nianlkI4g5Lya6Kem5Y+RXG4gICAgaWYgKHRoaXMubWVhbERhdGUgIT09IDApIHtcbiAgICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgICAgdGhpcy5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwodGhpcy5tZWFsRGF0ZSk7XG4gICAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgb25SZWFkeSgpe1xuICAgIC8qKlxuICAgICAqIOiOt+WPluWPs+S4iuinkuiDtuWbiuWwuuWvuO+8jOiuoeeul+iHquWumuS5ieagh+mimOagj+S9jee9rlxuICAgICAqL1xuICAgIGlmKGFwcC5nbG9iYWxEYXRhLm1lbnVJbmZvKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lbnVJbmZvOiBhcHAuZ2xvYmFsRGF0YS5tZW51SW5mbyB9KTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnN0IG1lbnVJbmZvID0gd3guZ2V0TWVudUJ1dHRvbkJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVudUluZm86IG1lbnVJbmZvIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICog5b6X5Yiw6aaW6aG1Y2FudmFz5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgZ2V0RGFpbHlNYWNyb251dHJpZW50U3VtbWFyeShkYXRlKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpcyBcbiAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICBpZih0b2tlbil7XG4gICAgICByZXF1ZXN0LmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkoe2RhdGV9KS50aGVuKHJlcz0+e1xuICAgICAgICB0aGF0LnBhcnNlRGFpbHlNYWNyb251dHJpZW50U3VtbWFyeShyZXMpO1xuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIGNvbnNvbGUubG9nKDg4LGVycilcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOino+aekOmmlumhtWNhbnZhc+aVsOaNrlxuICAgKi9cbiAgcHVibGljIHBhcnNlRGFpbHlNYWNyb251dHJpZW50U3VtbWFyeShyZXMpe1xuICAgIGNvbnN0IGZvcm1hdCA9IChudW0pID0+IE1hdGgucm91bmQobnVtKTtcbiAgICBsZXQgc2NvcmUgPSByZXMuc2NvcmU7XG4gICAgbGV0IG51dHJpZW50U3VtbWFyeSA9IFtcbiAgICAgIHsgXG4gICAgICAgIG5hbWU6IFwi54Ot6YePXCIsIFxuICAgICAgICBwZXJjZW50OiBmb3JtYXQocmVzLmVuZXJneUludGFrZS9yZXMuZW5lcmd5UmVjb21tZW5kZWRJbnRha2UqMTAwKSwgXG4gICAgICAgIGludGFrZU51bTogZm9ybWF0KHJlcy5lbmVyZ3lJbnRha2UpLCBcbiAgICAgICAgdG90YWxOdW06IGZvcm1hdChyZXMuZW5lcmd5UmVjb21tZW5kZWRJbnRha2UpLCBcbiAgICAgICAgdW5pdDogXCLljYPljaFcIiBcbiAgICAgIH0sXG4gICAgXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXMubWFjcm9udXRyaWVudEludGFrZSl7XG4gICAgICBjb25zdCBpdGVtID0gcmVzLm1hY3JvbnV0cmllbnRJbnRha2VbaW5kZXhdO1xuICAgICAgaXRlbS5uYW1lID0gaXRlbS5uYW1lQ047XG4gICAgICBpdGVtLnBlcmNlbnQgPSBmb3JtYXQoaXRlbS5wZXJjZW50YWdlLnBlcmNlbnRhZ2UpO1xuICAgICAgaXRlbS5pbnRha2VOdW0gPSBmb3JtYXQoaXRlbS5pbnRha2UuaW50YWtlKTtcbiAgICAgIGl0ZW0udG90YWxOdW0gPSBmb3JtYXQoaXRlbS5pbnRha2Uuc3VnZ2VzdGVkSW50YWtlKTtcbiAgICAgIGl0ZW0udW5pdCA9IFwi5YWLXCIgO1xuICAgICAgbnV0cmllbnRTdW1tYXJ5LnB1c2goaXRlbSlcbiAgICB9XG4gICAgbnV0cmllbnRTdW1tYXJ5Lm1hcCgoaXRlbSxpbmRleCk9PntcbiAgICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KGAjY2lyY2xlJHtpbmRleH1gKS5kcmF3Q2lyY2xlKGBjYW52YXNgLCA3NSwgNCwgaXRlbS5wZXJjZW50LzEwMCAqIDIpXG4gICAgfSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG51dHJpZW50U3VtbWFyeTogbnV0cmllbnRTdW1tYXJ5LFxuICAgICAgc2NvcmU6IHNjb3JlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6aWu6aOf6K6w5b2V55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0RGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKGRhdGUpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgaWYodG9rZW4pe1xuICAgICAgcmVxdWVzdC5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwoe2RhdGV9KS50aGVuKHJlcz0+e1xuICAgICAgICB0aGF0LnBhcnNlRGFpbHlNZWFsTG9nR3JvdXBGb29kTG9nRGV0YWlsKHJlcyk7XG4gICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgd3guc2hvd1RvYXN0KHsgdGl0bGU6ICfojrflj5bpo5/nianorrDlvZXlpLHotKUnLCBpY29uOiAnbm9uZScgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6aWu6aOf6K6w5b2V55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcGFyc2VEYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwocmVzKXtcbiAgICBsZXQgbWVhbExpc3QgPSBbXVxuICAgIGZvciAobGV0IGluZGV4IGluIHJlcyl7XG4gICAgICBsZXQgbWVhbCA9IHJlc1tpbmRleF07XG4gICAgICBtZWFsLmVuZXJneUludGFrZSA9IE1hdGgucm91bmQobWVhbC5lbmVyZ3lJbnRha2UpO1xuICAgICAgbWVhbC5yZWNvbW1lbmRlZEVuZXJneUludGFrZSA9IE1hdGgucm91bmQobWVhbC5yZWNvbW1lbmRlZEVuZXJneUludGFrZSk7XG4gICAgICBtZWFsLm1lYWxTdW1tYXJ5ID0gW107XG4gICAgICBtZWFsLm1lYWxMb2dTdW1tYXJ5Vk9TJiZtZWFsLm1lYWxMb2dTdW1tYXJ5Vk9TLm1hcCgoaXRlbSxpbmRleCk9PntcbiAgICAgICAgaXRlbS5lbmVyZ3kgPSBNYXRoLnJvdW5kKGl0ZW0uZW5lcmd5KTsgXG4gICAgICAgIGl0ZW0uY29sb3JUaXAgPSB0aGlzLmZvb2RDb2xvclRpcHNBcnJbaW5kZXhdO1xuICAgICAgICBpdGVtLmZvb2RMb2dTdW1tYXJ5TGlzdC5tYXAoaXQ9PntcbiAgICAgICAgICBpdC5jb2xvclRpcCA9IHRoaXMuZm9vZENvbG9yVGlwc0FycltpbmRleF07XG4gICAgICAgICAgaXQuZW5lcmd5ID0gTWF0aC5yb3VuZChpdC5lbmVyZ3kpXG4gICAgICAgICAgbWVhbC5tZWFsU3VtbWFyeS5wdXNoKGl0KVxuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgICBtZWFsTGlzdC5wdXNoKG1lYWwpXG4gICAgfTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe21lYWxMaXN0fSlcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkvZPph43nm7jlhbPkv6Hmga8sb25zaG935Lit6Kem5Y+RXG4gICAqL1xuICBwdWJsaWMgcmV0cmlldmVEYXRhKCk6IHZvaWQge1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICBjb25zdCB0b2RheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIGNvbnN0IGJlZm9yZTMwZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogYmVmb3JlMzBkYXlUaW1lLFxuICAgICAgICBkYXRlX3RvOiB0b2RheVRpbWVcbiAgICAgIH07XG5cbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVdlaWdodExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXRyaWV2ZVdlaWdodExvZycsIHJlc3ApO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGxhdGVzdF93ZWlnaHQ6IHJlc3AubGF0ZXN0X3dlaWdodC52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBuZWFyRGF0YUFycjphbnkgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsID0gMDsvLyDojrflj5bkuIDkvY3lsI/mlbDngrnnmoTlubPlnYflgLzvvIzlhYjmsYLmgLvlkoxcbiAgICAgICAgcmVzcC53ZWlnaHRfbG9ncy5tYXAoaXRlbT0+e1xuICAgICAgICAgIHRvdGFsID0gdG90YWwgKyBpdGVtLnZhbHVlXG4gICAgICAgICAgY29uc3QgYmVmb3JlTnVtYmVyRGF5ID0gKHRvZGF5VGltZSAtIGl0ZW0uZGF0ZSkgLyA4NjQwMFxuICAgICAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSBtb21lbnQoaXRlbS5kYXRlKjEwMDApLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICBuZWFyRGF0YUFyclszMCAtIGJlZm9yZU51bWJlckRheV0gPSB7IHdlZWs6IGZvcm1hdERhdGUsIHZhbHVlOiBpdGVtLnZhbHVlLCBhdmc6IDIwMDAgfVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBhdmVyYWdlID0gTWF0aC5yb3VuZCh0b3RhbCoxMCAvIHJlc3Aud2VpZ2h0X2xvZ3MubGVuZ3RoKS8xMFxuICAgICAgICAvLyDnqIDnlo/mlbDnu4TpnIDopoHnlKhmb3LvvIzkuI3og73nlKhtYXDjgIJcbiAgICAgICAgLy8gMzDlpKnlhoXnlKjmiLfnrKzkuIDkuKrmsqHmnInmm7TmlrDkvZPph43nmoTml6XmnJ/otYvlgLzkuLrkvZPph43lubPlnYflgLzvvIzliKvnmoTml6XmnJ/pg73otYvlgLzkuLpudWxsXG4gICAgICAgIGxldCBsZW4gPSBuZWFyRGF0YUFyci5sZW5ndGg7XG4gICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7aTxsZW47aSsrKXtcbiAgICAgICAgICBpZiAoIW5lYXJEYXRhQXJyW2ldICYmIGZsYWcpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMC1pLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBhdmVyYWdlLCBhdmc6IDIwMDAgfVxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIGlmICghbmVhckRhdGFBcnJbaV0pe1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwIC0gaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTpudWxsLCBhdmc6IDIwMDAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGFydC5heGlzKGZhbHNlKTtcbiAgICAgICAgY2hhcnQuY2hhbmdlRGF0YShuZWFyRGF0YUFycik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxlcnIpXG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bkvZPph43mlbDmja7lpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHB1YmxpYyBnb1dlaWdodFJlY29yZCgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6Jy9wYWdlcy93ZWlnaHRSZWNvcmQvaW5kZXgnIH0pXG4gIH1cbiAgcHVibGljIGxvZ2luKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5sb2dpbih7XG4gICAgICBzdWNjZXNzKF9yZXMpIHtcbiAgICAgICAgdmFyIHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUgfTtcbiAgICAgICAgbG9naW5BUEkuTWluaVByb2dyYW1Mb2dpbihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgbGV0IHVzZXJTdGF0dXMgPSByZXNwLnVzZXJfc3RhdHVzO1xuICAgICAgICAgIHN3aXRjaCAodXNlclN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSAxOiAvL3ZhbGlkYXRpb24gcGFnZVxuICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9sb2dpbi9pbmRleCcgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiAvL29uQm9hcmRpbmcgcHJvY2VzcyBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9vbkJvYXJkL29uQm9hcmQnIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOiAvL2tlZXAgaXQgYXQgaG9tZSBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB0aGF0LmF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHRoYXQucmV0cmlldmVEYXRhKCk7IC8vIOiOt+WPluS9k+mHjeiusOW9lVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgY29udGVudDogJ+mmlumhteeZu+mZhuWksei0pScsXG4gICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyBhdXRoZW50aWNhdGlvblJlcXVlc3QoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTMnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHB1YmxpYyBnb051dHJpdGlvbmFsRGF0YWJhc2VQYWdlKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7IHVybDonL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2luZGV4JyB9KVxuICB9XG5cbiAgcHVibGljIGJpbmROYXZpVG9PdGhlck1pbmlBcHAoKSB7XG4gICAgLy90ZXN0IG9uIG5hdmlnYXRlIG1pbmlQcm9ncmFtXG4gICAgd3gubmF2aWdhdGVUb01pbmlQcm9ncmFtKHtcbiAgICAgIGFwcElkOiAnd3g0Yjc0MjI4YmFhMTU0ODlhJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgZW52VmVyc2lvbjogJ2RldmVsb3AnLFxuICAgICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgICAgICAvLyDmiZPlvIDmiJDlip9cbiAgICAgICAgY29uc29sZS5sb2coXCJzdWNjY2VzcyBuYXZpZ2F0ZVwiKTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgdHJpZ2dlckJpbmRnZXRkYXRlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoJyNjYWxlbmRhcicpLmRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLy93aGVuIG9wZW5uaW5nIHRoZSBjYWxlbmRhclxuICBwdWJsaWMgYmluZHNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICB9XG5cbiAgLy/pu5jorqTkuLvliqjkvJrop6blj5HkuIDmrKFcbiAgcHVibGljIGJpbmRnZXRkYXRlKGV2ZW50OiBhbnkpIHtcbiAgICBcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgbGV0IHRpbWUgPSBldmVudC5kZXRhaWw7XG4gICAgbGV0IG5hdlRpdGxlVGltZSA9IHRpbWUueWVhciArICcvJyArIHRpbWUubW9udGggKyAnLycgKyB0aW1lLmRhdGU7XG4gICAgbGV0IGRhdGUgPSBtb21lbnQoW3RpbWUueWVhciwgdGltZS5tb250aCAtIDEsIHRpbWUuZGF0ZV0pOyAvLyBNb21lbnQgbW9udGggaXMgc2hpZnRlZCBsZWZ0IGJ5IDFcbiAgICBcbiAgICB0aGlzLm1lYWxEYXRlID0gZGF0ZS51bml4KCk7XG4gICAgaWYoYXBwLmdsb2JhbERhdGEubWVhbERhdGUpe1xuICAgICAgdGhpcy5tZWFsRGF0ZSA9IGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlO1xuICAgICAgbmF2VGl0bGVUaW1lID0gbW9tZW50KHRoaXMubWVhbERhdGUqMTAwMCkuZm9ybWF0KCdZWVlZL01NL0REJylcbiAgICAgIGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdG9kYXlUaW1lU3RhbXAgPSBtb21lbnQobmV3IERhdGUoKSk7XG4gICAgY29uc3QgZm9ybWF0TWVhbERhdGEgPSBtb21lbnQodGhpcy5tZWFsRGF0ZSoxMDAwKTtcbiAgICBpZiAodG9kYXlUaW1lU3RhbXAuaXNTYW1lKGZvcm1hdE1lYWxEYXRhLCdkJykpe1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lOiAn5LuK5aSpJyB9KVxuICAgIH0gZWxzZSB7IFxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmF2VGl0bGVUaW1lIH0pXG4gICAgfSBcbiAgICAvLyB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICB0aGlzLmdldERhaWx5TWFjcm9udXRyaWVudFN1bW1hcnkodGhpcy5tZWFsRGF0ZSkgLy8g6I635Y+WY2FudmFz5L+h5oGvXG4gICAgdGhpcy5nZXREYWlseU1lYWxMb2dHcm91cEZvb2RMb2dEZXRhaWwodGhpcy5tZWFsRGF0ZSkgLy8g6I635Y+WbWVhbExpc3Tkv6Hmga9cbiAgfVxuXG4gIHB1YmxpYyBvbkRhaWx5UmVwb3J0Q2xpY2soKSB7XG4gICAgaWYodGhpcy5kYXRhLnNjb3JlPT09MCl7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgY29udGVudDogXCLmgqjku4rlpKnov5jmsqHmnInmt7vliqDpo5/nianlk6ZcIixcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgIGNvbmZpcm1UZXh0Oifljrvmt7vliqAnXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Yqg6L295LitLi4uXCJ9KTtcbiAgICBjb25zdCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICByZXF1ZXN0LmdldFVzZXJQcm9maWxlQnlUb2tlbih7dG9rZW59KS50aGVuKHJlc3AgPT4ge1xuICAgICAgbGV0IHVzZXJJZDogc3RyaW5nID0gcmVzcC51c2VySWQ7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiBgL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91c2VySWQ9JHt1c2VySWR9JmRhdGU9JHt0aGlzLm1lYWxEYXRlfWB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgIH0pXG4gIH1cbiAgXG4gIHB1YmxpYyBhZGRGb29kSW1hZ2UoZXZlbnQ6IGFueSkge1xuICAgIHRoaXMubWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICB0aGlzLm1lYWxUeXBlID0gdGhpcy5tZWFsSW5kZXggKyAxO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6dHJ1ZX0pXG4gICAgLy8gd3guc2hvd0FjdGlvblNoZWV0KHtcbiAgICAvLyAgIGl0ZW1MaXN0OiBbJ+aLjeeFp+iusOW9lScsICfnm7jlhownLCAn5paH5a2X5pCc57SiJ10sXG4gICAgLy8gICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgLy8gICAgIHN3aXRjaCAocmVzLnRhcEluZGV4KSB7XG4gICAgLy8gICAgICAgY2FzZSAwOlxuICAgIC8vICAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgLy8gICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAvLyAgICAgICAgICAgc291cmNldHlwZTogJ2NhbWVyYScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMTpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgLy8gICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAvLyAgICAgICAgICAgc291cmNldHlwZTogJ2FsYnVtJyxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgY2FzZSAyOlxuICAgIC8vICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgLy8gICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbE5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVDaG9vc2VVcGxvYWRUeXBlKGU6YW55KXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5kZXgpO1xuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgdXJsOiBcIi4uLy4uL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU9XCIgKyB0aGF0LmRhdGEubWVhbExpc3RbdGhpcy5tZWFsSW5kZXhdLm1lYWxUeXBlTmFtZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgICAgICB9KTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ3RleHRTZWFyY2gnLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgICggdGhpcyBhcyBhbnkgKS5zZXREYXRhKHtzaG93TWFzazpmYWxzZX0pXG4gIH1cblxuICBwdWJsaWMgY2hvb3NlSW1hZ2Uoc291cmNlVHlwZTogc3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgc2l6ZVR5cGU6IFsnb3JpZ2luYWwnLCAnY29tcHJlc3NlZCddLFxuICAgICAgc291cmNlVHlwZTogW3NvdXJjZVR5cGVdLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlczogYW55KSB7XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5LiK5Lyg5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgICAgIC8vIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IHRydWU7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXTtcbiAgICAgICAgdGhhdC5wYXRoID0gaW1hZ2VQYXRoO1xuICAgICAgICB1cGxvYWRGaWxlKGltYWdlUGF0aCwgdGhhdC5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhhdC5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGF0Lm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIDAsIDApO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRTdWNjZXNzKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICcuLy4uLy4uL2hvbWVTdWIvcGFnZXMvaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9JyArIHRoaXMucGF0aCArIFwiJm1lYWxUeXBlPVwiICsgdGhpcy5tZWFsVHlwZSArIFwiJm1lYWxEYXRlPVwiICsgdGhpcy5tZWFsRGF0ZStcIiZ0aXRsZT1cIit0aGlzLmRhdGEubWVhbExpc3RbdGhpcy5tZWFsSW5kZXhdLm1lYWxUeXBlTmFtZSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkRmFpbGVkKCl7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRmYWlsZWRcIik7XG4gICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICB9XG5cbiAgcHVibGljIG9uVXBsb2FkUHJvZ3Jlc3NpbmcoZXZlbnQ6IGFueSl7XG4gICAgY29uc29sZS5sb2coXCJwcm9ncmVzczpcIik7XG4gIH1cblxuICBwdWJsaWMgbmF2aVRvRm9vZERldGFpbChldmVudDogYW55KSB7XG4gICAgY29uc3QgZGVmYXVsdEltYWdlVXJsID0gXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9taW5pLWFwcC1pbWFnZS9kZWZhdWx0SW1hZ2UvdGV4dHNlYXJjaC1kZWZhdWx0LWltYWdlLnBuZ1wiO1xuICAgIGxldCBtZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIGxldCBpbWFnZUluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmltYWdlSW5kZXg7XG4gICAgbGV0IG1lYWxJZCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxMb2dTdW1tYXJ5Vk9TW2ltYWdlSW5kZXhdLm1lYWxMb2dJZDtcbiAgICBsZXQgaW1hZ2VVcmwgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTG9nU3VtbWFyeVZPU1tpbWFnZUluZGV4XS5pbWFnZVVybDtcbiAgICBpbWFnZVVybCA9IGltYWdlVXJsID09IFwiXCIgPyBkZWZhdWx0SW1hZ2VVcmwgOiBpbWFnZVVybDtcbiAgICBsZXQgcGFyYW0gPSB7fTtcbiAgICBwYXJhbS5tZWFsSW5kZXggPSBtZWFsSW5kZXg7IC8vIOS8oOWIsGZvb2REZXRhaWzpobXpnaLvvIzlgZrmm7TmlrDlip/og71cbiAgICBwYXJhbS5pbWFnZUluZGV4ID0gaW1hZ2VJbmRleDsgLy8g5Lyg5YiwZm9vZERldGFpbOmhtemdou+8jOWBmuabtOaWsOWKn+iDvVxuICAgIHBhcmFtLm1lYWxJZCA9IG1lYWxJZDtcbiAgICBwYXJhbS5pbWFnZVVybCA9IGltYWdlVXJsO1xuICAgIGxldCBwYXJhbUpzb24gPSBKU09OLnN0cmluZ2lmeShwYXJhbSk7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6IFwiLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2Zvb2REZXRhaWwvaW5kZXg/cGFyYW1Kc29uPVwiICsgcGFyYW1Kc29uXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOWFs+mXrXNob3dNYXNrXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlSGlkZGVuTWFzaygpe1xuICAgIGlmKHRoaXMuZGF0YS5zaG93TWFzayl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOmZhbHNlfSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGlhcnlQYWdlKCkpXG4iXX0=