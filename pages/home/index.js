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
        };
        this.mealType = 0;
        this.mealDate = 0;
        this.path = '';
        this.showPersonCheckLoading = false;
        this.foodColorTipsArr = ['#0074d9', '#ffdc00', '#7fdbff', '#39cccc', '#3d9970', '#2ecc40', '#01ff70', '#ff851b', '#001f3f', '#ff4136', '#85144b', '#f012be', '#b10dc9', '#111111', '#aaaaaa', '#dddddd'];
    }
    FoodDiaryPage.prototype.onLoad = function () {
        wx.navigateTo({ url: './../../homeSub/pages/confirmMeal/index' });
        var menuInfo = wx.getMenuButtonBoundingClientRect();
        this.setData({
            menuInfo: menuInfo
        });
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
            _this.setData({
                mealList: mealList,
            });
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
        this.setData({
            navTitleTime: navTitleTime
        });
        var date = moment([time.year, time.month - 1, time.date]);
        this.mealDate = date.unix();
        var todayTimeStamp = moment(new Date());
        if (todayTimeStamp.isSame(date, 'd')) {
            console.log('选择的日期是今天');
            this.setData({
                navTitleTime: '今日'
            });
        }
        else {
            this.setData({
                navTitleTime: navTitleTime
            });
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
        var mealIndex = event.currentTarget.dataset.mealIndex;
        var that = this;
        this.mealType = mealIndex + 1;
        wx.showActionSheet({
            itemList: ['拍照记录', '相册', '文字搜索'],
            success: function (res) {
                switch (res.tapIndex) {
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
                            url: "../../pages/textSearch/index?title=" + that.data.mealList[mealIndex].mealName + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
                        });
                        wx.reportAnalytics('record_type_select', {
                            sourcetype: 'textSearch',
                        });
                        break;
                }
            }
        });
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
        console.log("uploadSucess" + this.mealType + "," + this.mealDate);
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
        param.showDeleteBtn = true;
        param.showShareBtn = imageKey != "";
        var paramJson = JSON.stringify(param);
        wx.navigateTo({
            url: "/pages/foodDetail/index?paramJson=" + paramJson
        });
    };
    return FoodDiaryPage;
}());
Page(new FoodDiaryPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQWtEO0FBQ2xELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFNcEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFB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LGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3hELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDckUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2RSxJQUFJLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHNFQUFzRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDbkwsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsS0FBSyxDQUFDLFlBQVksR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxvQ0FBb0MsR0FBRyxTQUFTO1NBQ3RELENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF4bUJELElBd21CQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcblxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQge1xuICBSZXRyaWV2ZUZvb2REaWFyeVJlcSwgUmV0cmlldmVGb29kRGlhcnlSZXNwLFxuICBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSwgUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXNwLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIlxuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqaW5pdCBmMiBjaGFydCBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuLy8gbGV0IHNhbGVzVHJlbmRDaGFydENvbXBvbmVudCA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjbnV0cml0aW9uX2NoYXJ0MScpO1xuLy8gc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50LmluaXQoaW5pdENoYXJ0KVxubGV0IGNoYXJ0ID0gbnVsbDtcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7XG4gIGNvbnN0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuYXhpcygnd2VlaycsIHsgIC8v5a+5d2Vla+WvueW6lOeahOe6teaoquWdkOagh+i9tOi/m+ihjOmFjee9rlxuICAgIGdyaWQ6IG51bGwsICAvL+e9keagvOe6v1xuICAgIHRpY2tMaW5lOm51bGwsXG4gICAgbGFiZWw6bnVsbCxcbiAgICBsaW5lOm51bGxcbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZXbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBpdGVtc1swXS5vcmlnaW4ud2VlaztcbiAgICAgIGl0ZW1zWzBdLnZhbHVlID0gaXRlbXNbMF0udmFsdWUrJ2tnJztcbiAgICAgIGl0ZW1zLmxlbmd0aCA9IDFcbiAgICB9XG4gIH0pO1xuXG4gIGNoYXJ0LnBvaW50KClcbiAgICAucG9zaXRpb24oW1wid2Vla1wiLFwidmFsdWVcIl0pXG4gICAgLnN0eWxlKHsgZmlsbDogJyNmZmZmZmYnLCByOiAxLjcsIGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnI2YzNDY1YScgfSk7XG4gIGNoYXJ0LmxpbmUoe1xuICAgIGNvbm5lY3ROdWxsczogdHJ1ZSAvLyDphY3nva7vvIzov57mjqXnqbrlgLzmlbDmja5cbiAgfSkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIikuc2hhcGUoJ3Ntb290aCcpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xuXG4gIFxufVxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqZW5kIG9mIGYyIGNoYXJ0IGluaXQqKioqKioqKioqKioqKioqKioqKioqKioqLy9cblxuXG50eXBlIE51dHJpdGlvbkluZm8gPSB7XG4gIG51dHJpZW50X25hbWU6IHN0cmluZztcbiAgaW50YWtlbl9wZXJjZW50YWdlOiBudW1iZXI7XG4gIHByb2dyZXNzX2NvbG9yOiBzdHJpbmc7XG4gIGludGFrZW5fbnVtOiBudW1iZXI7XG4gIHRvdGFsX251bTogbnVtYmVyO1xuICB1bml0OiBzdHJpbmc7XG59XG5cbnR5cGUgTWVhbCA9IHtcbiAgbWVhbElkOiBudW1iZXI7XG4gIG1lYWxOYW1lOiBzdHJpbmc7XG4gIG1lYWxFbmdyeTogbnVtYmVyO1xuICBzdWdnZXN0ZWRJbnRha2U6IG51bWJlcjtcbiAgbWVhbFBlcmNlbnRhZ2U6IG51bWJlcjtcbiAgbWVhbHM6IE1lYWxJbmZvW107XG4gIG1lYWxTdW1tYXJ5OiBGb29kW11cbn1cbnR5cGUgRm9vZCA9IHtcbiAgZm9vZE5hbWU6IHN0cmluZztcbiAgZW5lcmd5OiBudW1iZXI7XG4gIHVuaXROYW1lOiBzdHJpbmc7XG4gIHdlaWdodDogbnVtYmVyXG59XG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIueDremHj1wiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLohILogqpcIiwgaW50YWtlbl9wZXJjZW50YWdlOiAwLCBpbnRha2VuX251bTogMCwgdG90YWxfbnVtOiAwLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi56Kz5rC0XCIsIGludGFrZW5fcGVyY2VudGFnZTogMCwgaW50YWtlbl9udW06IDAsIHRvdGFsX251bTogMCwgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuibi+eZvei0qFwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtcbiAgICAgIHsgbWVhbF9pZDogMCwgbWVhbE5hbWU6ICfml6nppJAnLCBtZWFsRW5ncnk6IDAsIHN1Z2dlc3RlZEludGFrZTogMCwgbWVhbFBlcmNlbnRhZ2U6IFwiXCIsIG1lYWxzOiBbXSwgbWVhbFN1bW1hcnk6IFtdIH0sXG4gICAgICB7IG1lYWxfaWQ6IDEsIG1lYWxOYW1lOiAn5Y2I6aSQJywgbWVhbEVuZ3J5OiAwLCBzdWdnZXN0ZWRJbnRha2U6IDAsIG1lYWxQZXJjZW50YWdlOiBcIlwiLCBtZWFsczogW10sIG1lYWxTdW1tYXJ5OiBbXSB9LFxuICAgICAgeyBtZWFsX2lkOiAyLCBtZWFsTmFtZTogJ+aZmumkkCcsIG1lYWxFbmdyeTogMCwgc3VnZ2VzdGVkSW50YWtlOiAwLCBtZWFsUGVyY2VudGFnZTogXCJcIiwgbWVhbHM6IFtdLCBtZWFsU3VtbWFyeTogW10gfSxcbiAgICBdLFxuICAgIHNjb3JlOiAwLFxuICAgIG1lbnVJbmZvOiB7fSxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHsgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsaW1hZ2U6J2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZpYW1hTmlhQmliWUtpYmd5VmhpY1B6UzVQek9yVm42bU9kV2FLbU5kd2NaS1g5M3o5QkpUdHduSkNxaWFhdUZodTBXb0QzdHdhRnZqaldHTEEvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6J+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6JycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OicgJyxcbiAgfTtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIHBhdGggPSAnJztcbiAgcHVibGljIHNob3dQZXJzb25DaGVja0xvYWRpbmcgPSBmYWxzZTtcbiAgcHVibGljIGZvb2RDb2xvclRpcHNBcnIgPSBbJyMwMDc0ZDknLCAnI2ZmZGMwMCcsJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddXG5cblxuICBwdWJsaWMgb25Mb2FkKCkge1xuICAgIHd4Lm5hdmlnYXRlVG8oe3VybDonLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2NvbmZpcm1NZWFsL2luZGV4J30pXG4gICAgLyoqXG4gICAgICog6I635Y+W5Y+z5LiK6KeS6IO25ZuK5bC65a+477yM6K6h566X6Ieq5a6a5LmJ5qCH6aKY5qCP5L2N572uXG4gICAgICovXG4gICAgY29uc3QgbWVudUluZm8gPSB3eC5nZXRNZW51QnV0dG9uQm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG1lbnVJbmZvOiBtZW51SW5mb1xuICAgIH0pXG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgIC8vIGxldCBjdXJyZW50VGltZVN0YW1wID0gRGF0ZS5wYXJzZShTdHJpbmcobmV3IERhdGUoKSkpO1xuICAgIC8vIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKGN1cnJlbnRUaW1lU3RhbXAvMTAwMCk7XG4gIH1cblxuICBwdWJsaWMgb25TaG93KCkge1xuICAgIHRoaXMubG9naW4oKTtcbiAgICBpZiAodGhpcy5tZWFsRGF0ZSAhPT0gMCkge1xuICAgICAgdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgfVxuICAgIC8vIHRoaXMubG9hZFJlcG9ydEJhZGdlKCk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5L2T6YeN55u45YWz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcmV0cmlldmVEYXRhKCk6IHZvaWQge1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICBsZXQgY3VycldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoKTtcbiAgICBsZXQgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSgwKS51bml4KCk7XG4gICAgbGV0IGxhc3REYXlPZldlZWs6IG51bWJlciA9IG1vbWVudCgpLndlZWsoY3VycldlZWspLmRheSg2KS51bml4KCk7XG5cbiAgICBjb25zdCB0b2RheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIGNvbnN0IGJlZm9yZTMwZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdWJ0cmFjdCgzMCwgXCJkYXlzXCIpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCByZXEgPSB7XG4gICAgICAgIGRhdGVfZnJvbTogYmVmb3JlMzBkYXlUaW1lLFxuICAgICAgICBkYXRlX3RvOiB0b2RheVRpbWVcbiAgICAgIH07XG5cbiAgICAgIHdlYkFQSS5SZXRyaWV2ZVdlaWdodExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZXRyaWV2ZVdlaWdodExvZycsIHJlc3ApO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGxhdGVzdF93ZWlnaHQ6IHJlc3AubGF0ZXN0X3dlaWdodC52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBuZWFyRGF0YUFycjphbnkgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsID0gMDsvLyDojrflj5bkuIDkvY3lsI/mlbDngrnnmoTlubPlnYflgLzvvIzlhYjmsYLmgLvlkoxcbiAgICAgICAgcmVzcC53ZWlnaHRfbG9ncy5tYXAoaXRlbT0+e1xuICAgICAgICAgIHRvdGFsID0gdG90YWwgKyBpdGVtLnZhbHVlXG4gICAgICAgICAgY29uc3QgYmVmb3JlTnVtYmVyRGF5ID0gKHRvZGF5VGltZSAtIGl0ZW0uZGF0ZSkgLyA4NjQwMFxuICAgICAgICAgIGNvbnN0IGZvcm1hdERhdGUgPSBtb21lbnQoaXRlbS5kYXRlKjEwMDApLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICBuZWFyRGF0YUFyclszMCAtIGJlZm9yZU51bWJlckRheV0gPSB7IHdlZWs6IGZvcm1hdERhdGUsIHZhbHVlOiBpdGVtLnZhbHVlLCBhdmc6IDIwMDAgfVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBhdmVyYWdlID0gTWF0aC5yb3VuZCh0b3RhbCoxMCAvIHJlc3Aud2VpZ2h0X2xvZ3MubGVuZ3RoKS8xMFxuICAgICAgICAvLyDnqIDnlo/mlbDnu4TpnIDopoHnlKhmb3LvvIzkuI3og73nlKhtYXDjgIJcbiAgICAgICAgLy8gMzDlpKnlhoXnlKjmiLfnrKzkuIDkuKrmsqHmnInmm7TmlrDkvZPph43nmoTml6XmnJ/otYvlgLzkuLrkvZPph43lubPlnYflgLzvvIzliKvnmoTml6XmnJ/pg73otYvlgLzkuLpudWxsXG4gICAgICAgIGxldCBsZW4gPSBuZWFyRGF0YUFyci5sZW5ndGg7XG4gICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7aTxsZW47aSsrKXtcbiAgICAgICAgICBpZiAoIW5lYXJEYXRhQXJyW2ldICYmIGZsYWcpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMC1pLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOiBhdmVyYWdlLCBhdmc6IDIwMDAgfVxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIGlmICghbmVhckRhdGFBcnJbaV0pe1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwIC0gaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTpudWxsLCBhdmc6IDIwMDAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGFydC5heGlzKGZhbHNlKTtcbiAgICAgICAgY2hhcnQuY2hhbmdlRGF0YShuZWFyRGF0YUFycik7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxlcnIpXG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bkvZPph43mlbDmja7lpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHB1YmxpYyBnb1dlaWdodFJlY29yZCgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOicvcGFnZXMvd2VpZ2h0UmVjb3JkL2luZGV4J1xuICAgIH0pXG4gIH1cbiAgcHVibGljIGxvZ2luKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAvLyDnmbvlvZVcbiAgICB3eC5sb2dpbih7XG4gICAgICBzdWNjZXNzKF9yZXMpIHtcbiAgICAgICAgLy8g5Y+R6YCBIF9yZXMuY29kZSDliLDlkI7lj7DmjaLlj5Ygb3BlbklkLCBzZXNzaW9uS2V5LCB1bmlvbklkXG4gICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZz9cIlwiOnd4LnNob3dMb2FkaW5nKHsgdGl0bGU6ICfliqDovb3kuK0uLi4nIH0pO1xuICAgICAgICB2YXIgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbUxvZ2luKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn6I635Y+WdG9rZW7miJDlip8nLHJlc3ApO1xuICAgICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA/IFwiXCIgOnd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICBsZXQgdXNlclN0YXR1cyA9IHJlc3AudXNlcl9zdGF0dXM7XG4gICAgICAgICAgLy8gd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgIC8vIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICBzd2l0Y2ggKHVzZXJTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgLy92YWxpZGF0aW9uIHBhZ2VcbiAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgLy9vbkJvYXJkaW5nIHByb2Nlc3MgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvb25Cb2FyZC9vbkJvYXJkJyB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgLy9rZWVwIGl0IGF0IGhvbWUgcGFnZVxuICAgICAgICAgICAgICBpZiAocmVzcC50b2tlbikge1xuICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgICAgICAgdGhhdC5hdXRoZW50aWNhdGlvblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnJldHJpZXZlRGF0YSgpOyAvLyDojrflj5bkvZPph43orrDlvZVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG5aSx6LSlJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyKSB7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYbpqozor4HlpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiBlcnIgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTMnXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHB1YmxpYyBnb051dHJpdGlvbmFsRGF0YWJhc2VQYWdlKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6Jy9wYWdlcy9udXRyaXRpb25hbERhdGFiYXNlUGFnZS9pbmRleCdcbiAgICB9KVxuICB9XG4gIC8vIHB1YmxpYyBsb2FkUmVwb3J0QmFkZ2UoKSB7XG4gIC8vICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAvLyAgIGNvbnNvbGUubG9nKHRva2VuKTtcbiAgLy8gICBpZiAodG9rZW4pIHtcbiAgLy8gICAgIGxldCBjdXJyZW50RGF0ZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpO1xuICAvLyAgICAgbGV0IGZpcnN0RGF5T2ZXZWVrID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSgxKS51bml4KCk7XG4gIC8vICAgICBsZXQgbGFzdERheU9mV2VlayA9IGN1cnJlbnREYXRlLndlZWsoY3VycmVudERhdGUud2VlaygpKS5kYXkoNykudW5peCgpO1xuICAvLyAgICAgbGV0IHJlcSA9IHtcbiAgLy8gICAgICAgZGF0ZV9mcm9tOiBmaXJzdERheU9mV2VlayxcbiAgLy8gICAgICAgZGF0ZV90bzogbGFzdERheU9mV2Vla1xuICAvLyAgICAgfTtcbiAgLy8gICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJSZXBvcnRzKHJlcSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgICB0aGlzLmNvdW50UmVwb3J0QmFkZ2UocmVzcCk7XG4gIC8vICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAvLyAgICAgfSk7XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgcHVibGljIGNvdW50UmVwb3J0QmFkZ2UocmVzcDogYW55KSB7XG4gICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgbGV0IHJlcG9ydE51bSA9IDA7XG4gICAgbGV0IHJlcG9ydHMgPSByZXNwLmRhaWx5X3JlcG9ydDtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXBvcnRzKSB7XG4gICAgICBsZXQgcmVwb3J0ID0gcmVwb3J0c1tpbmRleF07XG4gICAgICBpZiAoIXJlcG9ydC5pc19yZXBvcnRfZ2VuZXJhdGVkICYmICFyZXBvcnQuaXNfZm9vZF9sb2dfZW1wdHkpIHtcbiAgICAgICAgbGV0IHRvZGF5VGltZSA9IG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLnVuaXgoKTtcbiAgICAgICAgY29uc29sZS5sb2codG9kYXlUaW1lKTtcbiAgICAgICAgaWYgKHJlcG9ydC5kYXRlIDwgdG9kYXlUaW1lIHx8IChyZXBvcnQuZGF0ZSA9PSB0b2RheVRpbWUgJiYgbW9tZW50KG5ldyBEYXRlKCkpLmhvdXJzID4gMjIpKSB7ICAgLy9jb3VudCB0b2RheSByZXBvcnRzIHN0YXR1cyBhZnRlciAxOVxuICAgICAgICAgIHJlcG9ydE51bSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXBvcnROdW0gIT0gMCkge1xuICAgICAgd3guc2V0VGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMixcbiAgICAgICAgdGV4dDogU3RyaW5nKHJlcG9ydE51bSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3eC5yZW1vdmVUYWJCYXJCYWRnZSh7XG4gICAgICAgIGluZGV4OiAyXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbi8qKlxuICogYXBp6K+35rGC5LuK5pel5pGE5YWl6YeP5ZKM5LuK5pel6aWu6aOf6K6w5b2VXG4gKi9cbiAgcHVibGljIHJldHJpZXZlRm9vZERpYXJ5RGF0YShjdXJyZW50VGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZUZvb2REaWFyeVJlcSA9IHsgZGF0ZTogY3VycmVudFRpbWVTdGFtcCB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZUZvb2REaWFyeShyZXEpLnRoZW4ocmVzcCA9PiB0aGlzLmZvb2REaWFyeURhdGFQYXJzaW5nKHJlc3ApKS5jYXRjaChlcnIgPT5cbiAgICBjb25zdCB0b2tlbjEgPSB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSkvL+eUqOaIt+WPr+iDveayoeacieeZu+W9le+8jOatpOaXtuS4jeW6lOW8ueeql1xuICAgICAgaWYgKCF3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSkpe1xuICAgICAgICBjb25zb2xlLmxvZyg4ODg4LCB0b2tlbjEpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluaXpeW/l+Wksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcHVibGljIHJldHJpZXZlTWVhbExvZyhtZWFsSWQ6IG51bWJlcikge1xuICAgIGxldCByZXE6IFJldHJpZXZlTWVhbExvZ1JlcSA9IHsgbWVhbF9pZDogbWVhbElkIH1cbiAgICByZXR1cm4gd2ViQVBJLlJldHJpZXZlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZU1lYWxMb2cocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/nianmlbDmja7lpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSlcbiAgICB9XG4gICAgKTtcbiAgfVxuICBwdWJsaWMgcGFyc2VNZWFsTG9nKHJlc3A6IE1lYWxMb2dSZXNwKSB7XG4gICAgbGV0IGZvb2RMaXN0OiBGb29kW10gPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLmZvb2RfbG9nKSB7XG4gICAgICBsZXQgZm9vZExvZzogRm9vZExvZ0luZm8gPSByZXNwLmZvb2RfbG9nW2luZGV4XTtcbiAgICAgIGxldCB1bml0T2JqID0gZm9vZExvZy51bml0X29wdGlvbi5maW5kKG8gPT4gby51bml0X2lkID09PSBmb29kTG9nLnVuaXRfaWQpO1xuICAgICAgbGV0IHVuaXROYW1lID0gXCLku71cIlxuICAgICAgaWYgKHVuaXRPYmopIHtcbiAgICAgICAgdW5pdE5hbWUgPSB1bml0T2JqLnVuaXRfbmFtZTtcbiAgICAgIH1cbiAgICAgIGxldCBmb29kOiBGb29kID0ge1xuICAgICAgICBmb29kTmFtZTogZm9vZExvZy5mb29kX25hbWUsXG4gICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihmb29kTG9nLmVuZXJneSAvIDEwMCksXG4gICAgICAgIHVuaXROYW1lOiB1bml0TmFtZSxcbiAgICAgICAgd2VpZ2h0OiBNYXRoLnJvdW5kKGZvb2RMb2cud2VpZ2h0IC8gMTAwKVxuICAgICAgfVxuICAgICAgZm9vZExpc3QucHVzaChmb29kKVxuICAgIH1cbiAgICByZXR1cm4gZm9vZExpc3RcbiAgfVxuICBwdWJsaWMgbG9hZE1lYWxTdW1tYXJ5KHJlc3A6IFJldHJpZXZlRm9vZERpYXJ5UmVzcCkge1xuICAgIGxldCBicmVha2Zhc3Q6IE1lYWw7XG4gICAgbGV0IGJyZWFrZmFzdFN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBicmVha2Zhc3RJZHM6IG51bWJlcltdID0gW10gLy/lvpfliLDml6nppJBtYWVsX2lk5pWw57uEXG4gICAgcmVzcC5icmVha2Zhc3QuZm9yRWFjaCgoaXRlbSA9PmJyZWFrZmFzdElkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKVxuICAgIGNvbnN0IGJyZWFrZmFzdFByb21zID0gUHJvbWlzZS5hbGwoYnJlYWtmYXN0SWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcCggaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgICAgICAgICBicmVha2Zhc3RTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpOyAvLyBicmVha2Zhc3RTdW1tYXJ55Lit6I635b6X5pep6aSQ5LiA5YWx5ZCD5LqG5aSa5bCR6aOf54mp77yM5LiN5YiG5Zu+54mHXG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuYnJlYWtmYXN0W2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtZWFscycscmVzcC5icmVha2Zhc3QpXG4gICAgICAgIHJldHVybiBicmVha2Zhc3QgPSB7XG4gICAgICAgICAgbWVhbElkOiAwLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5pep6aSQJyxcbiAgICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5icmVha2Zhc3Rfc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmJyZWFrZmFzdCxcbiAgICAgICAgICBtZWFsU3VtbWFyeTogYnJlYWtmYXN0U3VtbWFyeSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIC8vbHVuY2hcbiAgICBsZXQgbHVuY2g6IE1lYWw7XG4gICAgbGV0IGx1bmNoU3VtbWFyeTogRm9vZFtdID0gW107XG4gICAgbGV0IGx1bmNoSWRzOiBudW1iZXJbXSA9IFtdXG4gICAgcmVzcC5sdW5jaC5mb3JFYWNoKChpdGVtID0+bHVuY2hJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gICAgY29uc3QgbHVuY2hQcm9tcyA9IFByb21pc2UuYWxsKGx1bmNoSWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGx1bmNoU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7Ly8g5q+P5Liqc3Vt5Luj6KGo5LiA5byg5Zu+5pyJ5aSa5bCR5Y2h6Lev6YeMXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5sdW5jaFtpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvciB9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGx1bmNoID0ge1xuICAgICAgICAgIG1lYWxJZDogMSxcbiAgICAgICAgICBtZWFsTmFtZTogJ+WNiOmkkCcsXG4gICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5sdW5jaF9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmx1bmNoX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5sdW5jaCxcbiAgICAgICAgICBtZWFsU3VtbWFyeTogbHVuY2hTdW1tYXJ5XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAvL2Rpbm5lclxuICAgIGxldCBkaW5uZXI6IE1lYWw7XG4gICAgbGV0IGRpbm5lclN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBkaW5uZXJJZHM6IG51bWJlcltdID0gW11cbiAgICByZXNwLmRpbm5lci5mb3JFYWNoKChpdGVtID0+ZGlubmVySWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAgIGNvbnN0IGRpbm5lclByb21zID0gUHJvbWlzZS5hbGwoZGlubmVySWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGRpbm5lclN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuZGlubmVyW2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkaW5uZXIgPSB7XG4gICAgICAgICAgbWVhbElkOiAyLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5pma6aSQJywgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuZGlubmVyX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5kaW5uZXIsXG4gICAgICAgICAgbWVhbFN1bW1hcnk6IGRpbm5lclN1bW1hcnlcbiAgICAgICAgfTtcblxuICAgICAgfSk7XG4gICAgLy9hZGRpdGlvbmFsXG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBsZXQgYWRkaXRpb246IE1lYWw7XG4gICAgbGV0IGFkZGl0aW9uU3VtbWFyeTogRm9vZFtdID0gW107XG4gICAgbGV0IGFkZGl0aW9uSWRzOiBudW1iZXJbXSA9IFtdXG4gICAgcmVzcC5hZGRpdGlvbi5mb3JFYWNoKChpdGVtID0+ZGlubmVySWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAgIGNvbnN0IGFkZGl0aW9uUHJvbXMgPSBQcm9taXNlLmFsbChhZGRpdGlvbklkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgICAgICAgICBhZGRpdGlvblN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4geyAgLy/orqHnrpflh7rmr4/lvKDlm77nmoTog73ph4/vvIzlubbmt7vliqDov5vlr7nosaFcbiAgICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmFkZGl0aW9uW2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhZGRpdGlvbiA9IHtcbiAgICAgICAgICBtZWFsSWQ6IDMsXG4gICAgICAgICAgbWVhbE5hbWU6ICfliqDppJAnLFxuICAgICAgICAgIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgbWVhbHM6IHJlc3AuYWRkaXRpb24sXG4gICAgICAgICAgbWVhbFN1bW1hcnk6IGFkZGl0aW9uU3VtbWFyeVxuICAgICAgICB9O1xuXG4gICAgICB9KTtcbiAgICBsZXQgbWVhbExpc3Q6IE1lYWxbXSA9IFtdXG4gICAgUHJvbWlzZS5hbGwoW2JyZWFrZmFzdFByb21zLCBsdW5jaFByb21zLCBkaW5uZXJQcm9tc10pLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKG1lYWwgPT4gbWVhbExpc3QucHVzaChtZWFsKSk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbWVhbExpc3Q6IG1lYWxMaXN0LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgICk7XG5cbiAgfVxuXG4vKipcbiAqIOino+aekOiOt+WPluS7iuaXpeaRhOWFpemHj+adv+Wdl+eahOaVsOaNrlxuICovXG4gIHB1YmxpYyBmb29kRGlhcnlEYXRhUGFyc2luZyhyZXNwOiBSZXRyaWV2ZUZvb2REaWFyeVJlc3ApIHtcbiAgICBjb25zb2xlLmxvZyhcInN1bW1hcnlcIiwgcmVzcCk7XG4gICAgbGV0IHNjb3JlID0gcmVzcC5zY29yZTtcbiAgICBsZXQgZW5lcmd5ID0gcmVzcC5kYWlseV9pbnRha2UuZW5lcmd5O1xuICAgIGxldCBwcm90ZWluID0gcmVzcC5kYWlseV9pbnRha2UucHJvdGVpbjtcbiAgICBsZXQgY2FyYm9oeWRyYXRlID0gcmVzcC5kYWlseV9pbnRha2UuY2FyYm9oeWRyYXRlO1xuICAgIGxldCBmYXQgPSByZXNwLmRhaWx5X2ludGFrZS5mYXQ7XG4gICAgbGV0IG51dHJpZW50U3VtbWFyeSA9IFtcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLng63ph49cIiwgaW50YWtlbl9wZXJjZW50YWdlOiBlbmVyZ3kucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoZW5lcmd5LmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihlbmVyZ3kuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLohILogqpcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBmYXQucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoZmF0LmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihmYXQuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLnorPmsLTljJblkIjnialcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBjYXJib2h5ZHJhdGUucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IoY2FyYm9oeWRyYXRlLmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihjYXJib2h5ZHJhdGUuc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLom4vnmb3otKhcIiwgaW50YWtlbl9wZXJjZW50YWdlOiBwcm90ZWluLnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKHByb3RlaW4uaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKHByb3RlaW4uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF1cblxuICAgIHRoaXMubG9hZE1lYWxTdW1tYXJ5KHJlc3ApO1xuICAgIC8vIGxldCBtZWFsTGlzdCA9IFticmVha2Zhc3QsIGx1bmNoLCBkaW5uZXIsIGFkZGl0aW9uYWxdO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBudXRyaWVudFN1bW1hcnk6IG51dHJpZW50U3VtbWFyeSxcbiAgICAgIHNjb3JlOiBzY29yZVxuICAgIH0sKCk9PntcbiAgICAgIG51dHJpZW50U3VtbWFyeS5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KGAjY2lyY2xlJHtpbmRleH1gKS5kcmF3Q2lyY2xlKGBjYW52YXNgLCA3NSwgNCwgaXRlbS5pbnRha2VuX3BlcmNlbnRhZ2UvMTAwICogMilcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmROYXZpVG9PdGhlck1pbmlBcHAoKSB7XG4gICAgLy90ZXN0IG9uIG5hdmlnYXRlIG1pbmlQcm9ncmFtXG4gICAgd3gubmF2aWdhdGVUb01pbmlQcm9ncmFtKHtcbiAgICAgIGFwcElkOiAnd3g0Yjc0MjI4YmFhMTU0ODlhJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgZW52VmVyc2lvbjogJ2RldmVsb3AnLFxuICAgICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgICAgICAvLyDmiZPlvIDmiJDlip9cbiAgICAgICAgY29uc29sZS5sb2coXCJzdWNjY2VzcyBuYXZpZ2F0ZVwiKTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgdHJpZ2dlckJpbmRnZXRkYXRlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoJyNjYWxlbmRhcicpLmRhdGVTZWxlY3Rpb24oKVxuICB9XG5cbiAgLy93aGVuIG9wZW5uaW5nIHRoZSBjYWxlbmRhclxuICBwdWJsaWMgYmluZHNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICB9XG5cbiAgLy93aGVuIHVzZXIgc2VsZWN0IGRhdGVcbiAgcHVibGljIGJpbmRnZXRkYXRlKGV2ZW50OiBhbnkpIHtcbiAgICBcbiAgICAvL0NvbnZlcnQgZGF0ZSB0byB1bml4IHRpbWVzdGFtcFxuICAgIGxldCB0aW1lID0gZXZlbnQuZGV0YWlsO1xuICAgIGNvbnN0IG5hdlRpdGxlVGltZSA9IHRpbWUueWVhciArICcvJyArIHRpbWUubW9udGggKyAnLycgKyB0aW1lLmRhdGU7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG5hdlRpdGxlVGltZTogbmF2VGl0bGVUaW1lXG4gICAgfSlcbiAgICBsZXQgZGF0ZSA9IG1vbWVudChbdGltZS55ZWFyLCB0aW1lLm1vbnRoIC0gMSwgdGltZS5kYXRlXSk7IC8vIE1vbWVudCBtb250aCBpcyBzaGlmdGVkIGxlZnQgYnkgMVxuICAgIC8vZ2V0IGN1cnJlbnQgdGltZXN0YW1wXG4gICAgdGhpcy5tZWFsRGF0ZSA9IGRhdGUudW5peCgpO1xuICAgIGNvbnN0IHRvZGF5VGltZVN0YW1wID0gbW9tZW50KG5ldyBEYXRlKCkpO1xuICAgIGlmICh0b2RheVRpbWVTdGFtcC5pc1NhbWUoZGF0ZSwnZCcpKXtcbiAgICAgIGNvbnNvbGUubG9nKCfpgInmi6nnmoTml6XmnJ/mmK/ku4rlpKknKTtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbmF2VGl0bGVUaW1lOiAn5LuK5pelJ1xuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy/ku5bku6zkuI3mmK/lnKjlkIzkuIDlpKlcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG5hdlRpdGxlVGltZTogbmF2VGl0bGVUaW1lXG4gICAgICB9KVxuICAgIH0gXG4gICAgLy9yZXF1ZXN0IEFQSVxuICAgIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgIC8vbGV0IHRpbWVEYXRhID0gdGltZS55ZWFyICsgXCItXCIgKyB0aW1lLm1vbnRoICsgXCItXCIgKyB0aW1lLmRhdGU7XG4gIH1cbiAgcHVibGljIG9uRGFpbHlSZXBvcnRDbGljayhldmVudDogYW55KSB7XG4gICAgdGhpcy5yZXRyaWV2ZURhaWx5UmVwb3J0KHRoaXMubWVhbERhdGUpO1xuICB9XG4gIHB1YmxpYyByZXRyaWV2ZURhaWx5UmVwb3J0KGN1cnJlbnRUaW1lU3RhbXA6IG51bWJlcikge1xuICAgIGxldCByZXE6IFJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0UmVxID0geyBkYXRlOiBjdXJyZW50VGltZVN0YW1wIH07XG4gICAgd2ViQVBJLlJldHJpZXZlT3JDcmVhdGVVc2VyUmVwb3J0KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGxldCByZXBvcnRVcmw6IHN0cmluZyA9IHJlc3AucmVwb3J0X3VybDtcbiAgICAgIGlmIChyZXBvcnRVcmwgJiYgcmVwb3J0VXJsICE9IFwiXCIpIHtcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogXCIvcGFnZXMvcmVwb3J0UGFnZS9yZXBvcnRQYWdlP3VybD1cIiArIHJlcG9ydFVybCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICAgICAgY29udGVudDogXCLor7fmt7vliqDlvZPlpKnpo5/nianorrDlvZVcIixcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKVxuICB9XG5cblxuXG4gIHB1YmxpYyBhZGRGb29kSW1hZ2UoZXZlbnQ6IGFueSkge1xuICAgIGxldCBtZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB0aGlzLm1lYWxUeXBlID0gbWVhbEluZGV4ICsgMTtcbiAgICB3eC5zaG93QWN0aW9uU2hlZXQoe1xuICAgICAgaXRlbUxpc3Q6IFsn5ouN54Wn6K6w5b2VJywgJ+ebuOWGjCcsICfmloflrZfmkJzntKInXSxcbiAgICAgIHN1Y2Nlc3MocmVzOiBhbnkpIHtcbiAgICAgICAgc3dpdGNoIChyZXMudGFwSW5kZXgpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICB0aGF0LmNob29zZUltYWdlKCdjYW1lcmEnKTtcbiAgICAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgICAgICBzb3VyY2V0eXBlOiAnY2FtZXJhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnYWxidW0nKTtcbiAgICAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgICAgICBzb3VyY2V0eXBlOiAnYWxidW0nLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgICAgdXJsOiBcIi4uLy4uL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU9XCIgKyB0aGF0LmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsTmFtZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICAgICAgc291cmNldHlwZTogJ3RleHRTZWFyY2gnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGNob29zZUltYWdlKHNvdXJjZVR5cGU6IHN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5jaG9vc2VJbWFnZSh7XG4gICAgICBjb3VudDogMSxcbiAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSxcbiAgICAgIHNvdXJjZVR5cGU6IFtzb3VyY2VUeXBlXSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xuICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuS4iuS8oOS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgICAgICB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgaW1hZ2VQYXRoID0gcmVzLnRlbXBGaWxlUGF0aHNbMF07XG4gICAgICAgIHRoYXQucGF0aCA9IGltYWdlUGF0aDtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2Vzcygpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkU3VjZXNzXCIgKyB0aGlzLm1lYWxUeXBlICsgXCIsXCIgKyB0aGlzLm1lYWxEYXRlKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogJy4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9pbWFnZVRhZy9pbmRleD9pbWFnZVVybD0nICsgdGhpcy5wYXRoICsgXCImbWVhbFR5cGU9XCIgKyB0aGlzLm1lYWxUeXBlICsgXCImbWVhbERhdGU9XCIgKyB0aGlzLm1lYWxEYXRlLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRGYWlsZWQoKXtcbiAgICBjb25zb2xlLmxvZyhcInVwbG9hZGZhaWxlZFwiKTtcbiAgICB3eC5oaWRlTG9hZGluZygpO1xuICB9XG5cbiAgcHVibGljIG9uVXBsb2FkUHJvZ3Jlc3NpbmcoZXZlbnQ6IGFueSl7XG4gICAgY29uc29sZS5sb2coXCJwcm9ncmVzczpcIik7XG4gIH1cblxuICBwdWJsaWMgbmF2aVRvRm9vZERldGFpbChldmVudDogYW55KSB7XG4gICAgY29uc3QgZGVmYXVsdEltYWdlVXJsID0gXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9taW5pLWFwcC1pbWFnZS9kZWZhdWx0SW1hZ2UvdGV4dHNlYXJjaC1kZWZhdWx0LWltYWdlLnBuZ1wiO1xuICAgIGxldCBtZWFsSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIGxldCBpbWFnZUluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmltYWdlSW5kZXg7XG4gICAgbGV0IG1lYWxJZCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxzW2ltYWdlSW5kZXhdLm1lYWxfaWQ7XG4gICAgbGV0IGltYWdlS2V5ID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbHNbaW1hZ2VJbmRleF0uaW1nX2tleTtcbiAgICBsZXQgaW1hZ2VVcmwgPSBpbWFnZUtleSA9PSBcIlwiID8gZGVmYXVsdEltYWdlVXJsIDogXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL1wiICsgdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbHNbaW1hZ2VJbmRleF0uaW1nX2tleTtcbiAgICBsZXQgcGFyYW0gPSB7fTtcbiAgICBwYXJhbS5tZWFsSWQgPSBtZWFsSWQ7XG4gICAgcGFyYW0uaW1hZ2VVcmwgPSBpbWFnZVVybDtcbiAgICBwYXJhbS5zaG93RGVsZXRlQnRuID0gdHJ1ZTtcbiAgICBwYXJhbS5zaG93U2hhcmVCdG4gPSBpbWFnZUtleSAhPSBcIlwiO1xuICAgIGxldCBwYXJhbUpzb24gPSBKU09OLnN0cmluZ2lmeShwYXJhbSk7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6IFwiL3BhZ2VzL2Zvb2REZXRhaWwvaW5kZXg/cGFyYW1Kc29uPVwiICsgcGFyYW1Kc29uXG4gICAgfSk7XG4gIH1cbn1cblxuUGFnZShuZXcgRm9vZERpYXJ5UGFnZSgpKVxuIl19