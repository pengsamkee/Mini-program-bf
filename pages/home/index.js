"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var loginAPI = require("../../api/login/LoginService");
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var moment = require("moment");
var uploadFile = require("../../api/uploader.js");
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
                { nutrient_name: "热量", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "千卡" },
                { nutrient_name: "脂肪", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" },
                { nutrient_name: "碳水", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" },
                { nutrient_name: "蛋白质", intaken_percentage: 0, intaken_num: 0, total_num: 0, unit: "克" }
            ],
            mealList: [
                { meal_id: 0, mealName: '早餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
                { meal_id: 1, mealName: '午餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
                { meal_id: 2, mealName: '晚餐', mealEngry: 0, suggestedIntake: 0, mealPercentage: "", meals: [], mealSummary: [] },
            ],
            score: 0,
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
        var menuInfo = wx.getMenuButtonBoundingClientRect();
        this.setData({ menuInfo: menuInfo });
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    };
    FoodDiaryPage.prototype.onShow = function () {
        this.login();
        if (this.mealDate !== 0) {
            this.retrieveFoodDiaryData(this.mealDate);
        }
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
        wx.navigateTo({
            url: '/pages/weightRecord/index'
        });
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
                        },
                        fail: function (err) {
                            console.log(err);
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
        wx.navigateTo({
            url: '/pages/nutritionalDatabasePage/index'
        });
    };
    FoodDiaryPage.prototype.countReportBadge = function (resp) {
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
    FoodDiaryPage.prototype.retrieveFoodDiaryData = function (currentTimeStamp) {
        var _this = this;
        var req = { date: currentTimeStamp };
        webAPI.RetrieveFoodDiary(req).then(function (resp) { return _this.foodDiaryDataParsing(resp); }).catch(function (err) {
            var token1 = webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
            if (!webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token))) {
                console.log(8888, token1);
            }
            else {
                wx.showModal({
                    title: '',
                    content: '获取日志失败',
                    showCancel: false
                });
            }
        });
    };
    FoodDiaryPage.prototype.retrieveMealLog = function (mealId) {
        var _this = this;
        var req = { meal_id: mealId };
        return webAPI.RetrieveMealLog(req).then(function (resp) {
            return _this.parseMealLog(resp);
        }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '',
                content: '获取食物数据失败',
                showCancel: false
            });
        });
    };
    FoodDiaryPage.prototype.parseMealLog = function (resp) {
        var foodList = [];
        var _loop_1 = function (index) {
            var foodLog = resp.food_log[index];
            var unitObj = foodLog.unit_option.find(function (o) { return o.unit_id === foodLog.unit_id; });
            var unitName = "份";
            if (unitObj) {
                unitName = unitObj.unit_name;
            }
            var food = {
                foodName: foodLog.food_name,
                energy: Math.floor(foodLog.energy / 100),
                unitName: unitName,
                weight: Math.round(foodLog.weight / 100)
            };
            foodList.push(food);
        };
        for (var index in resp.food_log) {
            _loop_1(index);
        }
        return foodList;
    };
    FoodDiaryPage.prototype.loadMealSummary = function (resp) {
        var _this = this;
        var breakfast;
        var breakfastSummary = [];
        var breakfastIds = [];
        resp.breakfast.forEach((function (item) { return breakfastIds.push(item.meal_id); }));
        var breakfastProms = Promise.all(breakfastIds.map(function (id) { return _this.retrieveMealLog(id); })).then(function (result) {
            result.map(function (list, index) {
                var tip_color = that.foodColorTipsArr;
                var changedList = list.map(function (item) { return item = Object.assign(item, { tip_color: tip_color[index] }); });
                breakfastSummary.push.apply(breakfastSummary, changedList);
                var sum = list.reduce(function (pre, cur) {
                    return cur.energy + pre;
                }, 0);
                Object.assign(resp.breakfast[index], { img_engry: sum }, { tip_color: tip_color });
            });
            console.log('meals', resp.breakfast);
            return breakfast = {
                mealId: 0,
                mealName: '早餐',
                mealEngry: Math.floor(resp.breakfast_suggestion.energy_intake / 100),
                suggestedIntake: Math.floor(resp.breakfast_suggestion.suggested_intake / 100),
                mealPercentage: resp.breakfast_suggestion.percentage,
                meals: resp.breakfast,
                mealSummary: breakfastSummary,
            };
        });
        var lunch;
        var lunchSummary = [];
        var lunchIds = [];
        resp.lunch.forEach((function (item) { return lunchIds.push(item.meal_id); }));
        var lunchProms = Promise.all(lunchIds.map(function (id) { return _this.retrieveMealLog(id); })).then(function (result) {
            result.map(function (list, index) {
                var tip_color = that.foodColorTipsArr;
                var changedList = list.map(function (item) { return item = Object.assign(item, { tip_color: tip_color[index] }); });
                lunchSummary.push.apply(lunchSummary, changedList);
                var sum = list.reduce(function (pre, cur) {
                    return cur.energy + pre;
                }, 0);
                Object.assign(resp.lunch[index], { img_engry: sum }, { tip_color: tip_color });
            });
            return lunch = {
                mealId: 1,
                mealName: '午餐',
                mealEngry: Math.floor(resp.lunch_suggestion.energy_intake / 100),
                suggestedIntake: Math.floor(resp.lunch_suggestion.suggested_intake / 100),
                mealPercentage: resp.lunch_suggestion.percentage,
                meals: resp.lunch,
                mealSummary: lunchSummary
            };
        });
        var dinner;
        var dinnerSummary = [];
        var dinnerIds = [];
        resp.dinner.forEach((function (item) { return dinnerIds.push(item.meal_id); }));
        var dinnerProms = Promise.all(dinnerIds.map(function (id) { return _this.retrieveMealLog(id); })).then(function (result) {
            result.map(function (list, index) {
                var tip_color = that.foodColorTipsArr;
                var changedList = list.map(function (item) { return item = Object.assign(item, { tip_color: tip_color[index] }); });
                dinnerSummary.push.apply(dinnerSummary, changedList);
                var sum = list.reduce(function (pre, cur) {
                    return cur.energy + pre;
                }, 0);
                Object.assign(resp.dinner[index], { img_engry: sum }, { tip_color: tip_color });
            });
            return dinner = {
                mealId: 2,
                mealName: '晚餐', mealEngry: Math.floor(resp.dinner_suggestion.energy_intake / 100),
                suggestedIntake: Math.floor(resp.dinner_suggestion.suggested_intake / 100),
                mealPercentage: resp.dinner_suggestion.percentage,
                meals: resp.dinner,
                mealSummary: dinnerSummary
            };
        });
        var that = this;
        var addition;
        var additionSummary = [];
        var additionIds = [];
        resp.addition.forEach((function (item) { return dinnerIds.push(item.meal_id); }));
        var additionProms = Promise.all(additionIds.map(function (id) { return _this.retrieveMealLog(id); })).then(function (result) {
            result.map(function (list, index) {
                var tip_color = that.foodColorTipsArr;
                var changedList = list.map(function (item) { return item = Object.assign(item, { tip_color: tip_color[index] }); });
                additionSummary.push.apply(additionSummary, changedList);
                var sum = list.reduce(function (pre, cur) {
                    return cur.energy + pre;
                }, 0);
                Object.assign(resp.addition[index], { img_engry: sum }, { tip_color: tip_color });
            });
            return addition = {
                mealId: 3,
                mealName: '加餐',
                mealEngry: Math.floor(resp.addition_suggestion.energy_intake / 100),
                suggestedIntake: Math.floor(resp.addition_suggestion.suggested_intake / 100),
                mealPercentage: resp.addition_suggestion.percentage,
                meals: resp.addition,
                mealSummary: additionSummary
            };
        });
        var mealList = [];
        Promise.all([breakfastProms, lunchProms, dinnerProms]).then(function (result) {
            result.map(function (meal) { return mealList.push(meal); });
            _this.setData({ mealList: mealList });
        });
    };
    FoodDiaryPage.prototype.foodDiaryDataParsing = function (resp) {
        var _this = this;
        console.log("summary", resp);
        var score = resp.score;
        var energy = resp.daily_intake.energy;
        var protein = resp.daily_intake.protein;
        var carbohydrate = resp.daily_intake.carbohydrate;
        var fat = resp.daily_intake.fat;
        var nutrientSummary = [
            { nutrient_name: "热量", intaken_percentage: energy.percentage, intaken_num: Math.floor(energy.intake / 100), total_num: Math.floor(energy.suggested_intake / 100), unit: "千卡" },
            { nutrient_name: "脂肪", intaken_percentage: fat.percentage, intaken_num: Math.floor(fat.intake / 100), total_num: Math.floor(fat.suggested_intake / 100), unit: "克" },
            { nutrient_name: "碳水化合物", intaken_percentage: carbohydrate.percentage, intaken_num: Math.floor(carbohydrate.intake / 100), total_num: Math.floor(carbohydrate.suggested_intake / 100), unit: "克" },
            { nutrient_name: "蛋白质", intaken_percentage: protein.percentage, intaken_num: Math.floor(protein.intake / 100), total_num: Math.floor(protein.suggested_intake / 100), unit: "克" }
        ];
        this.loadMealSummary(resp);
        this.setData({
            nutrientSummary: nutrientSummary,
            score: score
        }, function () {
            nutrientSummary.map(function (item, index) {
                _this.selectComponent("#circle" + index).drawCircle("canvas", 75, 4, item.intaken_percentage / 100 * 2);
            });
        });
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
            console.log('选择的日期是今天');
            this.setData({ navTitleTime: '今日' });
        }
        else {
            this.setData({ navTitleTime: navTitleTime });
        }
        this.retrieveFoodDiaryData(this.mealDate);
    };
    FoodDiaryPage.prototype.onDailyReportClick = function (event) {
        this.retrieveDailyReport(this.mealDate);
    };
    FoodDiaryPage.prototype.retrieveDailyReport = function (currentTimeStamp) {
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
                    url: "../../pages/textSearch/index?title=" + that.data.mealList[this.mealIndex].mealName + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
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
            url: './../../homeSub/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate,
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
        var mealId = this.data.mealList[mealIndex].meals[imageIndex].meal_id;
        var imageKey = this.data.mealList[mealIndex].meals[imageIndex].img_key;
        var imageUrl = imageKey == "" ? defaultImageUrl : "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/" + this.data.mealList[mealIndex].meals[imageIndex].img_key;
        var param = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQWtEO0FBQ2xELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFNcEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFB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cG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIGxvZ2luQVBJIGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7XG4gIFJldHJpZXZlRm9vZERpYXJ5UmVxLCBSZXRyaWV2ZUZvb2REaWFyeVJlc3AsXG4gIFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxLCBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlc3AsXG4gIFJldHJpZXZlTWVhbExvZ1JlcSwgTWVhbExvZ1Jlc3AsIEZvb2RMb2dJbmZvLCBNZWFsSW5mb1xufSBmcm9tIFwiLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB1cGxvYWRGaWxlIGZyb20gJy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKippbml0IGYyIGNoYXJ0IHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG4vLyBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNudXRyaXRpb25fY2hhcnQxJyk7XG4vLyBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQuaW5pdChpbml0Q2hhcnQpXG5sZXQgY2hhcnQgPSBudWxsO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHtcbiAgY29uc3QgZGF0YSA9IFtcbiAgICB7IHdlZWs6ICflkajml6UnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiAJywgdmFsdWU6IDExNTAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6jCcsIHZhbHVlOiAxMzAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuIknLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5ZubJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS6lCcsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajlha0nLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH1cbiAgXTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5heGlzKCd3ZWVrJywgeyAgLy/lr7l3ZWVr5a+55bqU55qE57q15qiq5Z2Q5qCH6L206L+b6KGM6YWN572uXG4gICAgZ3JpZDogbnVsbCwgIC8v572R5qC857q/XG4gICAgdGlja0xpbmU6bnVsbCxcbiAgICBsYWJlbDpudWxsLFxuICAgIGxpbmU6bnVsbFxuICB9KTtcbiAgY2hhcnQudG9vbHRpcCh7XG4gICAgc2hvd0Nyb3NzaGFpcnM6IHRydWUsIC8vIOaYr+WQpuaYvuekuuS4remXtOmCo+aguei+heWKqee6v++8jOeCueWbvuOAgei3r+W+hOWbvuOAgee6v+WbvuOAgemdouenr+Wbvum7mOiupOWxleekulxuICAgIG9uU2hvdyhldikgeyAvLyDngrnlh7vmn5DpobnlkI7vvIzpobbpg6h0aXDmmL7npLrnmoTphY3nva4gaXRlbXNbMF0ubmFtZTppdGVtWzBdLnZhbHVlXG4gICAgICBjb25zdCB7IGl0ZW1zIH0gPSBldjsgLy9lduS4reaciXgseeWdkOagh+WSjOiiq+eCueWHu+mhueeahOS/oeaBr1xuICAgICAgaXRlbXNbMF0ubmFtZSA9IGl0ZW1zWzBdLm9yaWdpbi53ZWVrO1xuICAgICAgaXRlbXNbMF0udmFsdWUgPSBpdGVtc1swXS52YWx1ZSsna2cnO1xuICAgICAgaXRlbXMubGVuZ3RoID0gMVxuICAgIH1cbiAgfSk7XG5cbiAgY2hhcnQucG9pbnQoKVxuICAgIC5wb3NpdGlvbihbXCJ3ZWVrXCIsXCJ2YWx1ZVwiXSlcbiAgICAuc3R5bGUoeyBmaWxsOiAnI2ZmZmZmZicsIHI6IDEuNywgbGluZVdpZHRoOiAxLCBzdHJva2U6ICcjZjM0NjVhJyB9KTtcbiAgY2hhcnQubGluZSh7XG4gICAgY29ubmVjdE51bGxzOiB0cnVlIC8vIOmFjee9ru+8jOi/nuaOpeepuuWAvOaVsOaNrlxuICB9KS5wb3NpdGlvbignd2Vlayp2YWx1ZScpLmNvbG9yKFwiI2VkMmM0OFwiKS5zaGFwZSgnc21vb3RoJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG5cbiAgXG59XG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKiplbmQgb2YgZjIgY2hhcnQgaW5pdCoqKioqKioqKioqKioqKioqKioqKioqKiovL1xuXG5cbnR5cGUgTnV0cml0aW9uSW5mbyA9IHtcbiAgbnV0cmllbnRfbmFtZTogc3RyaW5nO1xuICBpbnRha2VuX3BlcmNlbnRhZ2U6IG51bWJlcjtcbiAgcHJvZ3Jlc3NfY29sb3I6IHN0cmluZztcbiAgaW50YWtlbl9udW06IG51bWJlcjtcbiAgdG90YWxfbnVtOiBudW1iZXI7XG4gIHVuaXQ6IHN0cmluZztcbn1cblxudHlwZSBNZWFsID0ge1xuICBtZWFsSWQ6IG51bWJlcjtcbiAgbWVhbE5hbWU6IHN0cmluZztcbiAgbWVhbEVuZ3J5OiBudW1iZXI7XG4gIHN1Z2dlc3RlZEludGFrZTogbnVtYmVyO1xuICBtZWFsUGVyY2VudGFnZTogbnVtYmVyO1xuICBtZWFsczogTWVhbEluZm9bXTtcbiAgbWVhbFN1bW1hcnk6IEZvb2RbXVxufVxudHlwZSBGb29kID0ge1xuICBmb29kTmFtZTogc3RyaW5nO1xuICBlbmVyZ3k6IG51bWJlcjtcbiAgdW5pdE5hbWU6IHN0cmluZztcbiAgd2VpZ2h0OiBudW1iZXJcbn1cblxuY2xhc3MgRm9vZERpYXJ5UGFnZSB7XG4gIHB1YmxpYyB1c2VySW5mbyA9IHt9XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIG9wdHM6IHtcbiAgICAgIG9uSW5pdDogaW5pdENoYXJ0LFxuICAgIH0sXG4gICAgbnV0cmllbnRTdW1tYXJ5OiBbXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi54Ot6YePXCIsIGludGFrZW5fcGVyY2VudGFnZTogMCwgaW50YWtlbl9udW06IDAsIHRvdGFsX251bTogMCwgdW5pdDogXCLljYPljaFcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuiEguiCqlwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLnorPmsLRcIiwgaW50YWtlbl9wZXJjZW50YWdlOiAwLCBpbnRha2VuX251bTogMCwgdG90YWxfbnVtOiAwLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi6JuL55m96LSoXCIsIGludGFrZW5fcGVyY2VudGFnZTogMCwgaW50YWtlbl9udW06IDAsIHRvdGFsX251bTogMCwgdW5pdDogXCLlhYtcIiB9XG4gICAgXSxcbiAgICBtZWFsTGlzdDogW1xuICAgICAgeyBtZWFsX2lkOiAwLCBtZWFsTmFtZTogJ+aXqemkkCcsIG1lYWxFbmdyeTogMCwgc3VnZ2VzdGVkSW50YWtlOiAwLCBtZWFsUGVyY2VudGFnZTogXCJcIiwgbWVhbHM6IFtdLCBtZWFsU3VtbWFyeTogW10gfSxcbiAgICAgIHsgbWVhbF9pZDogMSwgbWVhbE5hbWU6ICfljYjppJAnLCBtZWFsRW5ncnk6IDAsIHN1Z2dlc3RlZEludGFrZTogMCwgbWVhbFBlcmNlbnRhZ2U6IFwiXCIsIG1lYWxzOiBbXSwgbWVhbFN1bW1hcnk6IFtdIH0sXG4gICAgICB7IG1lYWxfaWQ6IDIsIG1lYWxOYW1lOiAn5pma6aSQJywgbWVhbEVuZ3J5OiAwLCBzdWdnZXN0ZWRJbnRha2U6IDAsIG1lYWxQZXJjZW50YWdlOiBcIlwiLCBtZWFsczogW10sIG1lYWxTdW1tYXJ5OiBbXSB9LFxuICAgIF0sXG4gICAgc2NvcmU6IDAsXG4gICAgbWVudUluZm86IHt9LFxuICAgIGluZm9MaXN0czogW1xuICAgICAgeyB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy9mZzFxbGkwRGsxeDl5MFdaY09Idjh3JyxpbWFnZTonaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51VmlhbWFOaWFCaWJZS2liZ3lWaGljUHpTNVB6T3JWbjZtT2RXYUttTmR3Y1pLWDkzejlCSlR0d25KQ3FpYWF1Rmh1MFdvRDN0d2FGdmpqV0dMQS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTon56eL5a2j6aWu6aOf5pS755WlISdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLy1SYkRGMVVMUjBQRzdiN1JJeVVmTncnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZLV2lhWWdIRzBHQTlNaWFSd3NydEVib2lialdSUVpoejc4akdKWkx6RzNDSmxVSWljbmdhWXdnWUNla0R5OEMzTm9LakJ5QnhZMGliaWFWQWcvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6ICfngrnlpJbljZblsLHkuI3lgaXlurfvvJ8g5oiR5YGP5LiNJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvOEljSjdINnE0dnR6ZGxXTDNXWEl4UScsIGltYWdlOiAnaHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2pwZy9ldHZieUsyeU51V2JMUkhRRUpvdkJDdzRYVXhWV0tHUEppYXZQckE5TktQSjRzaWNGMzZvM1paS2oyU3RsaHBWb2liQnY2Y3MwTkhUSmljMldGQUVSZGVpYzNRLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn6JCl5YW75biI5aaC5L2V5a+56ICB5Lit5bCR6IOW5Y+L6L+b6KGM6L+Q5Yqo5rK755aX77yfIOeci+eci+iTneearuS5puaAjuS5iOivtCdcbiAgICAgIH1cbiAgICBdLFxuICAgIG5hdlRpdGxlVGltZTonJywvL+WvvOiIquagj+WkhOaYvuekuueahOaXtumXtFxuICAgIGxhdGVzdF93ZWlnaHQ6JyAnLFxuICAgIHNob3dNYXNrOmZhbHNlLFxuICB9O1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgcGF0aCA9ICcnO1xuICBwdWJsaWMgc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IGZhbHNlO1xuICBwdWJsaWMgZm9vZENvbG9yVGlwc0FyciA9IFsnIzAwNzRkOScsICcjZmZkYzAwJywnIzdmZGJmZicsICcjMzljY2NjJywgJyMzZDk5NzAnLCAnIzJlY2M0MCcsICcjMDFmZjcwJywgJyNmZjg1MWInLCAnIzAwMWYzZicsICcjZmY0MTM2JywgJyM4NTE0NGInLCAnI2YwMTJiZScsICcjYjEwZGM5JywgJyMxMTExMTEnLCAnI2FhYWFhYScsICcjZGRkZGRkJ107XG4gIHB1YmxpYyBtZWFsSW5kZXggPSAwO1xuXG5cbiAgcHVibGljIG9uTG9hZCgpIHtcbiAgICAvLyB3eC5uYXZpZ2F0ZVRvKHt1cmw6Jy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9mb29kRGV0YWlsL2luZGV4J30pXG4gICAgLyoqXG4gICAgICog6I635Y+W5Y+z5LiK6KeS6IO25ZuK5bC65a+477yM6K6h566X6Ieq5a6a5LmJ5qCH6aKY5qCP5L2N572uXG4gICAgICovXG4gICAgY29uc3QgbWVudUluZm8gPSB3eC5nZXRNZW51QnV0dG9uQm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVudUluZm86IG1lbnVJbmZvIH0pXG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgIC8vIGxldCBjdXJyZW50VGltZVN0YW1wID0gRGF0ZS5wYXJzZShTdHJpbmcobmV3IERhdGUoKSkpO1xuICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKGN1cnJlbnRUaW1lU3RhbXAvMTAwMCk7XG4gIH1cblxuICBwdWJsaWMgb25TaG93KCkge1xuICAgIHRoaXMubG9naW4oKTtcbiAgICAvLyBjb21maXJtTWVhbOmhtemdoua3u+WKoOWujOmjn+eJqeWQjiDkvJrop6blj5FcbiAgICBpZiAodGhpcy5tZWFsRGF0ZSAhPT0gMCkge1xuICAgICAgdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgfVxuICAgIC8vIHRoaXMubG9hZFJlcG9ydEJhZGdlKCk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5L2T6YeN55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcmV0cmlldmVEYXRhKCk6IHZvaWQge1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICBjb25zdCB0b2RheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIGNvbnN0IGJlZm9yZTMwZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogYmVmb3JlMzBkYXlUaW1lLFxuICAgICAgICBkYXRlX3RvOiB0b2RheVRpbWVcbiAgICAgIH07XG5cbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVdlaWdodExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXRyaWV2ZVdlaWdodExvZycsIHJlc3ApO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGxhdGVzdF93ZWlnaHQ6IHJlc3AubGF0ZXN0X3dlaWdodC52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBuZWFyRGF0YUFycjphbnkgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsID0gMDsvLyDojrflj5bkuIDkvY3lsI/mlbDngrnnmoTlubPlnYflgLzvvIzlhYjmsYLmgLvlkoxcbiAgICAgICAgcmVzcC53ZWlnaHRfbG9ncy5tYXAoaXRlbT0+e1xuICAgICAgICAgIHRvdGFsID0gdG90YWwgKyBpdGVtLnZhbHVlXG4gICAgICAgICAgY29uc3QgYmVmb3JlTnVtYmVyRGF5ID0gKHRvZGF5VGltZSAtIGl0ZW0uZGF0ZSkgLyA4NjQwMFxuICAgICAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSBtb21lbnQoaXRlbS5kYXRlKjEwMDApLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICBuZWFyRGF0YUFyclszMCAtIGJlZm9yZU51bWJlckRheV0gPSB7IHdlZWs6IGZvcm1hdERhdGUsIHZhbHVlOiBpdGVtLnZhbHVlLCBhdmc6IDIwMDAgfVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBhdmVyYWdlID0gTWF0aC5yb3VuZCh0b3RhbCoxMCAvIHJlc3Aud2VpZ2h0X2xvZ3MubGVuZ3RoKS8xMFxuICAgICAgICAvLyDnqIDnlo/mlbDnu4TpnIDopoHnlKhmb3LvvIzkuI3og73nlKhtYXDjgIJcbiAgICAgICAgLy8gMzDlpKnlhoXnlKjmiLfnrKzkuIDkuKrmsqHmnInmm7TmlrDkvZPph43nmoTml6XmnJ/otYvlgLzkuLrkvZPph43lubPlnYflgLzvvIzliKvnmoTml6XmnJ/pg73otYvlgLzkuLpudWxsXG4gICAgICAgIGxldCBsZW4gPSBuZWFyRGF0YUFyci5sZW5ndGg7XG4gICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7aTxsZW47aSsrKXtcbiAgICAgICAgICBpZiAoIW5lYXJEYXRhQXJyW2ldICYmIGZsYWcpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMC1pLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBhdmVyYWdlLCBhdmc6IDIwMDAgfVxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIGlmICghbmVhckRhdGFBcnJbaV0pe1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwIC0gaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTpudWxsLCBhdmc6IDIwMDAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGFydC5heGlzKGZhbHNlKTtcbiAgICAgICAgY2hhcnQuY2hhbmdlRGF0YShuZWFyRGF0YUFycik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxlcnIpXG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bkvZPph43mlbDmja7lpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHB1YmxpYyBnb1dlaWdodFJlY29yZCgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOicvcGFnZXMvd2VpZ2h0UmVjb3JkL2luZGV4J1xuICAgIH0pXG4gIH1cbiAgcHVibGljIGxvZ2luKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAvLyDnmbvlvZVcbiAgICB3eC5sb2dpbih7XG4gICAgICBzdWNjZXNzKF9yZXMpIHtcbiAgICAgICAgLy8g5Y+R6YCBIF9yZXMuY29kZSDliLDlkI7lj7DmjaLlj5Ygb3BlbklkLCBzZXNzaW9uS2V5LCB1bmlvbklkXG4gICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZz9cIlwiOnd4LnNob3dMb2FkaW5nKHsgdGl0bGU6ICfliqDovb3kuK0uLi4nIH0pO1xuICAgICAgICB2YXIgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbUxvZ2luKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn6I635Y+WdG9rZW7miJDlip8nLHJlc3ApO1xuICAgICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA/IFwiXCIgOnd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgLy8gd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgIC8vIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICBzd2l0Y2ggKHVzZXJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgLy92YWxpZGF0aW9uIHBhZ2VcbiAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgLy9vbkJvYXJkaW5nIHByb2Nlc3MgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvb25Cb2FyZC9vbkJvYXJkJyB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgLy9rZWVwIGl0IGF0IGhvbWUgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnJldHJpZXZlRGF0YSgpOyAvLyDojrflj5bkvZPph43orrDlvZVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyKSB7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYbpqozor4HlpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiBlcnIgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTMnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHB1YmxpYyBnb051dHJpdGlvbmFsRGF0YWJhc2VQYWdlKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6Jy9wYWdlcy9udXRyaXRpb25hbERhdGFiYXNlUGFnZS9pbmRleCdcbiAgICB9KVxuICB9XG4gIC8vIHB1YmxpYyBsb2FkUmVwb3J0QmFkZ2UoKSB7XG4gIC8vICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAvLyAgIGNvbnNvbGUubG9nKHRva2VuKTtcbiAgLy8gICBpZiAodG9rZW4pIHtcbiAgLy8gICAgIGxldCBjdXJyZW50RGF0ZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpO1xuICAvLyAgICAgbGV0IGZpcnN0RGF5T2ZXZWVrID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSgxKS51bml4KCk7XG4gIC8vICAgICBsZXQgbGFzdERheU9mV2VlayA9IGN1cnJlbnREYXRlLndlZWsoY3VycmVudERhdGUud2VlaygpKS5kYXkoNykudW5peCgpO1xuICAvLyAgICAgbGV0IHJlcSA9IHtcbiAgLy8gICAgICAgZGF0ZV9mcm9tOiBmaXJzdERheU9mV2VlayxcbiAgLy8gICAgICAgZGF0ZV90bzogbGFzdERheU9mV2Vla1xuICAvLyAgICAgfTtcbiAgLy8gICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJSZXBvcnRzKHJlcSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgICB0aGlzLmNvdW50UmVwb3J0QmFkZ2UocmVzcCk7XG4gIC8vICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAvLyAgICAgfSk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgcHVibGljIGNvdW50UmVwb3J0QmFkZ2UocmVzcDogYW55KSB7XG4gICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgbGV0IHJlcG9ydE51bSA9IDA7XG4gICAgbGV0IHJlcG9ydHMgPSByZXNwLmRhaWx5X3JlcG9ydDtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXBvcnRzKSB7XG4gICAgICBsZXQgcmVwb3J0ID0gcmVwb3J0c1tpbmRleF07XG4gICAgICBpZiAoIXJlcG9ydC5pc19yZXBvcnRfZ2VuZXJhdGVkICYmICFyZXBvcnQuaXNfZm9vZF9sb2dfZW1wdHkpIHtcbiAgICAgICAgbGV0IHRvZGF5VGltZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLnVuaXgoKTtcbiAgICAgICAgY29uc29sZS5sb2codG9kYXlUaW1lKTtcbiAgICAgICAgaWYgKHJlcG9ydC5kYXRlIDwgdG9kYXlUaW1lIHx8IChyZXBvcnQuZGF0ZSA9PSB0b2RheVRpbWUgJiYgbW9tZW50KG5ldyBEYXRlKCkpLmhvdXJzID4gMjIpKSB7ICAgLy9jb3VudCB0b2RheSByZXBvcnRzIHN0YXR1cyBhZnRlciAxOVxuICAgICAgICAgIHJlcG9ydE51bSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvcnROdW0gIT0gMCkge1xuICAgICAgd3guc2V0VGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMixcbiAgICAgICAgdGV4dDogU3RyaW5nKHJlcG9ydE51bSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3eC5yZW1vdmVUYWJCYXJCYWRnZSh7XG4gICAgICAgIGluZGV4OiAyXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbi8qKlxuICogYXBp6K+35rGC5LuK5pel5pGE5YWl6YeP5ZKM5LuK5pel6aWu6aOf6K6w5b2VXG4gKi9cbiAgcHVibGljIHJldHJpZXZlRm9vZERpYXJ5RGF0YShjdXJyZW50VGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZUZvb2REaWFyeVJlcSA9IHsgZGF0ZTogY3VycmVudFRpbWVTdGFtcCB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZUZvb2REaWFyeShyZXEpLnRoZW4ocmVzcCA9PiB0aGlzLmZvb2REaWFyeURhdGFQYXJzaW5nKHJlc3ApKS5jYXRjaChlcnIgPT5cbiAgICBjb25zdCB0b2tlbjEgPSB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSkvL+eUqOaIt+WPr+iDveayoeacieeZu+W9le+8jOatpOaXtuS4jeW6lOW8ueeql1xuICAgICAgaWYgKCF3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSkpe1xuICAgICAgICBjb25zb2xlLmxvZyg4ODg4LCB0b2tlbjEpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluaXpeW/l+Wksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcHVibGljIHJldHJpZXZlTWVhbExvZyhtZWFsSWQ6IG51bWJlcikge1xuICAgIGxldCByZXE6IFJldHJpZXZlTWVhbExvZ1JlcSA9IHsgbWVhbF9pZDogbWVhbElkIH1cbiAgICByZXR1cm4gd2ViQVBJLlJldHJpZXZlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZU1lYWxMb2cocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/nianmlbDmja7lpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSlcbiAgICB9XG4gICAgKTtcbiAgfVxuICBwdWJsaWMgcGFyc2VNZWFsTG9nKHJlc3A6IE1lYWxMb2dSZXNwKSB7XG4gICAgbGV0IGZvb2RMaXN0OiBGb29kW10gPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLmZvb2RfbG9nKSB7XG4gICAgICBsZXQgZm9vZExvZzogRm9vZExvZ0luZm8gPSByZXNwLmZvb2RfbG9nW2luZGV4XTtcbiAgICAgIGxldCB1bml0T2JqID0gZm9vZExvZy51bml0X29wdGlvbi5maW5kKG8gPT4gby51bml0X2lkID09PSBmb29kTG9nLnVuaXRfaWQpO1xuICAgICAgbGV0IHVuaXROYW1lID0gXCLku71cIlxuICAgICAgaWYgKHVuaXRPYmopIHtcbiAgICAgICAgdW5pdE5hbWUgPSB1bml0T2JqLnVuaXRfbmFtZTtcbiAgICAgIH1cbiAgICAgIGxldCBmb29kOiBGb29kID0ge1xuICAgICAgICBmb29kTmFtZTogZm9vZExvZy5mb29kX25hbWUsXG4gICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihmb29kTG9nLmVuZXJneSAvIDEwMCksXG4gICAgICAgIHVuaXROYW1lOiB1bml0TmFtZSxcbiAgICAgICAgd2VpZ2h0OiBNYXRoLnJvdW5kKGZvb2RMb2cud2VpZ2h0IC8gMTAwKVxuICAgICAgfVxuICAgICAgZm9vZExpc3QucHVzaChmb29kKVxuICAgIH1cbiAgICByZXR1cm4gZm9vZExpc3RcbiAgfVxuICBwdWJsaWMgbG9hZE1lYWxTdW1tYXJ5KHJlc3A6IFJldHJpZXZlRm9vZERpYXJ5UmVzcCkge1xuICAgIGxldCBicmVha2Zhc3Q6IE1lYWw7XG4gICAgbGV0IGJyZWFrZmFzdFN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBicmVha2Zhc3RJZHM6IG51bWJlcltdID0gW10gLy/lvpfliLDml6nppJBtYWVsX2lk5pWw57uEXG4gICAgcmVzcC5icmVha2Zhc3QuZm9yRWFjaCgoaXRlbSA9PmJyZWFrZmFzdElkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKVxuICAgIGNvbnN0IGJyZWFrZmFzdFByb21zID0gUHJvbWlzZS5hbGwoYnJlYWtmYXN0SWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcCggaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgICAgICAgICBicmVha2Zhc3RTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpOyAvLyBicmVha2Zhc3RTdW1tYXJ55Lit6I635b6X5pep6aSQ5LiA5YWx5ZCD5LqG5aSa5bCR6aOf54mp77yM5LiN5YiG5Zu+54mHXG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuYnJlYWtmYXN0W2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtZWFscycscmVzcC5icmVha2Zhc3QpXG4gICAgICAgIHJldHVybiBicmVha2Zhc3QgPSB7XG4gICAgICAgICAgbWVhbElkOiAwLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5pep6aSQJyxcbiAgICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmJyZWFrZmFzdCxcbiAgICAgICAgICBtZWFsU3VtbWFyeTogYnJlYWtmYXN0U3VtbWFyeSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIC8vbHVuY2hcbiAgICBsZXQgbHVuY2g6IE1lYWw7XG4gICAgbGV0IGx1bmNoU3VtbWFyeTogRm9vZFtdID0gW107XG4gICAgbGV0IGx1bmNoSWRzOiBudW1iZXJbXSA9IFtdXG4gICAgcmVzcC5sdW5jaC5mb3JFYWNoKChpdGVtID0+bHVuY2hJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gICAgY29uc3QgbHVuY2hQcm9tcyA9IFByb21pc2UuYWxsKGx1bmNoSWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGx1bmNoU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7Ly8g5q+P5Liqc3Vt5Luj6KGo5LiA5byg5Zu+5pyJ5aSa5bCR5Y2h6Lev6YeMXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5sdW5jaFtpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvciB9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGx1bmNoID0ge1xuICAgICAgICAgIG1lYWxJZDogMSxcbiAgICAgICAgICBtZWFsTmFtZTogJ+WNiOmkkCcsXG4gICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5sdW5jaF9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmx1bmNoX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5sdW5jaCxcbiAgICAgICAgICBtZWFsU3VtbWFyeTogbHVuY2hTdW1tYXJ5XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAvL2Rpbm5lclxuICAgIGxldCBkaW5uZXI6IE1lYWw7XG4gICAgbGV0IGRpbm5lclN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBkaW5uZXJJZHM6IG51bWJlcltdID0gW11cbiAgICByZXNwLmRpbm5lci5mb3JFYWNoKChpdGVtID0+ZGlubmVySWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAgIGNvbnN0IGRpbm5lclByb21zID0gUHJvbWlzZS5hbGwoZGlubmVySWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGRpbm5lclN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuZGlubmVyW2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkaW5uZXIgPSB7XG4gICAgICAgICAgbWVhbElkOiAyLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5pma6aSQJywgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5kaW5uZXIsXG4gICAgICAgICAgbWVhbFN1bW1hcnk6IGRpbm5lclN1bW1hcnlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIC8vYWRkaXRpb25hbFxuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgbGV0IGFkZGl0aW9uOiBNZWFsO1xuICAgIGxldCBhZGRpdGlvblN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBhZGRpdGlvbklkczogbnVtYmVyW10gPSBbXVxuICAgIHJlc3AuYWRkaXRpb24uZm9yRWFjaCgoaXRlbSA9PmRpbm5lcklkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgICBjb25zdCBhZGRpdGlvblByb21zID0gUHJvbWlzZS5hbGwoYWRkaXRpb25JZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gICAgICAgICAgYWRkaXRpb25TdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsgIC8v6K6h566X5Ye65q+P5byg5Zu+55qE6IO96YeP77yM5bm25re75Yqg6L+b5a+56LGhXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5hZGRpdGlvbltpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYWRkaXRpb24gPSB7XG4gICAgICAgICAgbWVhbElkOiAzLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5Yqg6aSQJyxcbiAgICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmFkZGl0aW9uLFxuICAgICAgICAgIG1lYWxTdW1tYXJ5OiBhZGRpdGlvblN1bW1hcnlcbiAgICAgICAgfTtcblxuICAgICAgfSk7XG4gICAgbGV0IG1lYWxMaXN0OiBNZWFsW10gPSBbXVxuICAgIFByb21pc2UuYWxsKFticmVha2Zhc3RQcm9tcywgbHVuY2hQcm9tcywgZGlubmVyUHJvbXNdKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcChtZWFsID0+IG1lYWxMaXN0LnB1c2gobWVhbCkpO1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWFsTGlzdDogbWVhbExpc3QgfSlcbiAgICAgIH1cbiAgICApO1xuXG4gIH1cblxuLyoqXG4gKiDop6PmnpDojrflj5bku4rml6XmkYTlhaXph4/mnb/lnZfnmoTmlbDmja5cbiAqL1xuICBwdWJsaWMgZm9vZERpYXJ5RGF0YVBhcnNpbmcocmVzcDogUmV0cmlldmVGb29kRGlhcnlSZXNwKSB7XG4gICAgY29uc29sZS5sb2coXCJzdW1tYXJ5XCIsIHJlc3ApO1xuICAgIGxldCBzY29yZSA9IHJlc3Auc2NvcmU7XG4gICAgbGV0IGVuZXJneSA9IHJlc3AuZGFpbHlfaW50YWtlLmVuZXJneTtcbiAgICBsZXQgcHJvdGVpbiA9IHJlc3AuZGFpbHlfaW50YWtlLnByb3RlaW47XG4gICAgbGV0IGNhcmJvaHlkcmF0ZSA9IHJlc3AuZGFpbHlfaW50YWtlLmNhcmJvaHlkcmF0ZTtcbiAgICBsZXQgZmF0ID0gcmVzcC5kYWlseV9pbnRha2UuZmF0O1xuICAgIGxldCBudXRyaWVudFN1bW1hcnkgPSBbXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi54Ot6YePXCIsIGludGFrZW5fcGVyY2VudGFnZTogZW5lcmd5LnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGVuZXJneS5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoZW5lcmd5LnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWNg+WNoVwiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi6ISC6IKqXCIsIGludGFrZW5fcGVyY2VudGFnZTogZmF0LnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGZhdC5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoZmF0LnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi56Kz5rC05YyW5ZCI54mpXCIsIGludGFrZW5fcGVyY2VudGFnZTogY2FyYm9oeWRyYXRlLnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGNhcmJvaHlkcmF0ZS5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoY2FyYm9oeWRyYXRlLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi6JuL55m96LSoXCIsIGludGFrZW5fcGVyY2VudGFnZTogcHJvdGVpbi5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihwcm90ZWluLmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihwcm90ZWluLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH1cbiAgICBdXG5cbiAgICB0aGlzLmxvYWRNZWFsU3VtbWFyeShyZXNwKTtcbiAgICAvLyBsZXQgbWVhbExpc3QgPSBbYnJlYWtmYXN0LCBsdW5jaCwgZGlubmVyLCBhZGRpdGlvbmFsXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbnV0cmllbnRTdW1tYXJ5OiBudXRyaWVudFN1bW1hcnksXG4gICAgICBzY29yZTogc2NvcmVcbiAgICB9LCgpPT57XG4gICAgICBudXRyaWVudFN1bW1hcnkubWFwKChpdGVtLGluZGV4KT0+e1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudChgI2NpcmNsZSR7aW5kZXh9YCkuZHJhd0NpcmNsZShgY2FudmFzYCwgNzUsIDQsIGl0ZW0uaW50YWtlbl9wZXJjZW50YWdlLzEwMCAqIDIpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kTmF2aVRvT3RoZXJNaW5pQXBwKCkge1xuICAgIC8vdGVzdCBvbiBuYXZpZ2F0ZSBtaW5pUHJvZ3JhbVxuICAgIHd4Lm5hdmlnYXRlVG9NaW5pUHJvZ3JhbSh7XG4gICAgICBhcHBJZDogJ3d4NGI3NDIyOGJhYTE1NDg5YScsXG4gICAgICBwYXRoOiAnJyxcbiAgICAgIGVudlZlcnNpb246ICdkZXZlbG9wJyxcbiAgICAgIHN1Y2Nlc3MocmVzOiBhbnkpIHtcbiAgICAgICAgLy8g5omT5byA5oiQ5YqfXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Nlc3MgbmF2aWdhdGVcIik7XG4gICAgICB9LFxuICAgICAgZmFpbChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIHRyaWdnZXJCaW5kZ2V0ZGF0ZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KCcjY2FsZW5kYXInKS5kYXRlU2VsZWN0aW9uKClcbiAgfVxuXG4gIC8vd2hlbiBvcGVubmluZyB0aGUgY2FsZW5kYXJcbiAgcHVibGljIGJpbmRzZWxlY3QoZXZlbnQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgfVxuXG4gIC8v6buY6K6k5Li75Yqo5Lya6Kem5Y+R5LiA5qyhXG4gIHB1YmxpYyBiaW5kZ2V0ZGF0ZShldmVudDogYW55KSB7XG4gICAgLy9Db252ZXJ0IGRhdGUgdG8gdW5peCB0aW1lc3RhbXBcbiAgICBsZXQgdGltZSA9IGV2ZW50LmRldGFpbDtcbiAgICBjb25zdCBuYXZUaXRsZVRpbWUgPSB0aW1lLnllYXIgKyAnLycgKyB0aW1lLm1vbnRoICsgJy8nICsgdGltZS5kYXRlO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5hdlRpdGxlVGltZTogbmF2VGl0bGVUaW1lIH0pXG4gICAgbGV0IGRhdGUgPSBtb21lbnQoW3RpbWUueWVhciwgdGltZS5tb250aCAtIDEsIHRpbWUuZGF0ZV0pOyAvLyBNb21lbnQgbW9udGggaXMgc2hpZnRlZCBsZWZ0IGJ5IDFcbiAgICAvL2dldCBjdXJyZW50IHRpbWVzdGFtcFxuICAgIHRoaXMubWVhbERhdGUgPSBkYXRlLnVuaXgoKTtcbiAgICBjb25zdCB0b2RheVRpbWVTdGFtcCA9IG1vbWVudChuZXcgRGF0ZSgpKTtcbiAgICBpZiAodG9kYXlUaW1lU3RhbXAuaXNTYW1lKGRhdGUsJ2QnKSl7XG4gICAgICBjb25zb2xlLmxvZygn6YCJ5oup55qE5pel5pyf5piv5LuK5aSpJyk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5hdlRpdGxlVGltZTogJ+S7iuaXpScgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy/ku5bku6zkuI3mmK/lnKjlkIzkuIDlpKlcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5hdlRpdGxlVGltZTogbmF2VGl0bGVUaW1lIH0pXG4gICAgfSBcbiAgICAvL3JlcXVlc3QgQVBJXG4gICAgdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgLy9sZXQgdGltZURhdGEgPSB0aW1lLnllYXIgKyBcIi1cIiArIHRpbWUubW9udGggKyBcIi1cIiArIHRpbWUuZGF0ZTtcbiAgfVxuICBwdWJsaWMgb25EYWlseVJlcG9ydENsaWNrKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnJldHJpZXZlRGFpbHlSZXBvcnQodGhpcy5tZWFsRGF0ZSk7XG4gIH1cbiAgcHVibGljIHJldHJpZXZlRGFpbHlSZXBvcnQoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gICAgbGV0IHJlcTogUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXEgPSB7IGRhdGU6IGN1cnJlbnRUaW1lU3RhbXAgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnQocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgbGV0IHJlcG9ydFVybDogc3RyaW5nID0gcmVzcC5yZXBvcnRfdXJsO1xuICAgICAgaWYgKHJlcG9ydFVybCAmJiByZXBvcnRVcmwgIT0gXCJcIikge1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiBcIi9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXJsPVwiICsgcmVwb3J0VXJsIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICBjb250ZW50OiBcIuivt+a3u+WKoOW9k+Wkqemjn+eJqeiusOW9lVwiLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpXG4gIH1cblxuICBcbiAgcHVibGljIGFkZEZvb2RJbWFnZShldmVudDogYW55KSB7XG4gICAgdGhpcy5tZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIHRoaXMubWVhbFR5cGUgPSB0aGlzLm1lYWxJbmRleCArIDE7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazp0cnVlfSlcblxuICAgIC8vIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgLy8gICBpdGVtTGlzdDogWyfmi43nhaforrDlvZUnLCAn55u45YaMJywgJ+aWh+Wtl+aQnOe0oiddLFxuICAgIC8vICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgIC8vICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgIC8vICAgICAgIGNhc2UgMDpcbiAgICAvLyAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICBjYXNlIDE6XG4gICAgLy8gICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgIC8vICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgLy8gICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIGNhc2UgMjpcbiAgICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgIC8vICAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgIC8vICAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlQ2hvb3NlVXBsb2FkVHlwZShlOmFueSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W3RoaXMubWVhbEluZGV4XS5tZWFsTmFtZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgICAgICB9KTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgc291cmNldHlwZTogJ3RleHRTZWFyY2gnLFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgICggdGhpcyBhcyBhbnkgKS5zZXREYXRhKHtzaG93TWFzazpmYWxzZX0pXG4gIH1cblxuICBwdWJsaWMgY2hvb3NlSW1hZ2Uoc291cmNlVHlwZTogc3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgc2l6ZVR5cGU6IFsnb3JpZ2luYWwnLCAnY29tcHJlc3NlZCddLFxuICAgICAgc291cmNlVHlwZTogW3NvdXJjZVR5cGVdLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlczogYW55KSB7XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5LiK5Lyg5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IHRydWU7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXTtcbiAgICAgICAgdGhhdC5wYXRoID0gaW1hZ2VQYXRoO1xuICAgICAgICB1cGxvYWRGaWxlKGltYWdlUGF0aCwgdGhhdC5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhhdC5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGF0Lm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIDAsIDApO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRTdWNjZXNzKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICcuLy4uLy4uL2hvbWVTdWIvcGFnZXMvaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9JyArIHRoaXMucGF0aCArIFwiJm1lYWxUeXBlPVwiICsgdGhpcy5tZWFsVHlwZSArIFwiJm1lYWxEYXRlPVwiICsgdGhpcy5tZWFsRGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkRmFpbGVkKCl7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRmYWlsZWRcIik7XG4gICAgd3guaGlkZUxvYWRpbmcoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblVwbG9hZFByb2dyZXNzaW5nKGV2ZW50OiBhbnkpe1xuICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3M6XCIpO1xuICB9XG5cbiAgcHVibGljIG5hdmlUb0Zvb2REZXRhaWwoZXZlbnQ6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRJbWFnZVVybCA9IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vbWluaS1hcHAtaW1hZ2UvZGVmYXVsdEltYWdlL3RleHRzZWFyY2gtZGVmYXVsdC1pbWFnZS5wbmdcIjtcbiAgICBsZXQgbWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICBsZXQgaW1hZ2VJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbWFnZUluZGV4O1xuICAgIGxldCBtZWFsSWQgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsc1tpbWFnZUluZGV4XS5tZWFsX2lkO1xuICAgIGxldCBpbWFnZUtleSA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxzW2ltYWdlSW5kZXhdLmltZ19rZXk7XG4gICAgbGV0IGltYWdlVXJsID0gaW1hZ2VLZXkgPT0gXCJcIiA/IGRlZmF1bHRJbWFnZVVybCA6IFwiaHR0cHM6Ly9kaWV0bGVucy0xMjU4NjY1NTQ3LmNvcy5hcC1zaGFuZ2hhaS5teXFjbG91ZC5jb20vZm9vZC1pbWFnZS9cIiArIHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxzW2ltYWdlSW5kZXhdLmltZ19rZXk7XG4gICAgbGV0IHBhcmFtID0ge307XG4gICAgcGFyYW0ubWVhbElkID0gbWVhbElkO1xuICAgIHBhcmFtLmltYWdlVXJsID0gaW1hZ2VVcmw7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICAvLyB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAvLyAgIHVybDogXCIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICAvLyB9KTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIuLy4uLy4uL2hvbWVTdWIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog5YWz6Zetc2hvd01hc2tcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVIaWRkZW5NYXNrKCl7XG4gICAgaWYodGhpcy5kYXRhLnNob3dNYXNrKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cblBhZ2UobmV3IEZvb2REaWFyeVBhZ2UoKSlcbiJdfQ==