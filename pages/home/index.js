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
            url: '/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQWtEO0FBQ2xELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFNcEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFB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QUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDckUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2RSxJQUFJLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHNFQUFzRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDbkwsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsS0FBSyxDQUFDLFlBQVksR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxvQ0FBb0MsR0FBRyxTQUFTO1NBQ3RELENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUEvbUJELElBK21CQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcblxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQge1xuICBSZXRyaWV2ZUZvb2REaWFyeVJlcSwgUmV0cmlldmVGb29kRGlhcnlSZXNwLFxuICBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSwgUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXNwLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIlxuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqaW5pdCBmMiBjaGFydCBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuLy8gbGV0IHNhbGVzVHJlbmRDaGFydENvbXBvbmVudCA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjbnV0cml0aW9uX2NoYXJ0MScpO1xuLy8gc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50LmluaXQoaW5pdENoYXJ0KVxubGV0IGNoYXJ0ID0gbnVsbDtcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7XG4gIGNvbnN0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuYXhpcygnd2VlaycsIHsgIC8v5a+5d2Vla+WvueW6lOeahOe6teaoquWdkOagh+i9tOi/m+ihjOmFjee9rlxuICAgIGdyaWQ6IG51bGwsICAvL+e9keagvOe6v1xuICAgIHRpY2tMaW5lOm51bGwsXG4gICAgbGFiZWw6bnVsbCxcbiAgICBsaW5lOm51bGxcbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZXbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBpdGVtc1swXS5vcmlnaW4ud2VlaztcbiAgICAgIGl0ZW1zWzBdLnZhbHVlID0gaXRlbXNbMF0udmFsdWUrJ2tnJztcbiAgICAgIGl0ZW1zLmxlbmd0aCA9IDFcbiAgICB9XG4gIH0pO1xuXG4gIGNoYXJ0LnBvaW50KClcbiAgICAucG9zaXRpb24oW1wid2Vla1wiLFwidmFsdWVcIl0pXG4gICAgLnN0eWxlKHsgZmlsbDogJyNmZmZmZmYnLCByOiAxLjcsIGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnI2YzNDY1YScgfSk7XG4gIGNoYXJ0LmxpbmUoe1xuICAgIGNvbm5lY3ROdWxsczogdHJ1ZSAvLyDphY3nva7vvIzov57mjqXnqbrlgLzmlbDmja5cbiAgfSkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIikuc2hhcGUoJ3Ntb290aCcpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xuXG4gIFxufVxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqZW5kIG9mIGYyIGNoYXJ0IGluaXQqKioqKioqKioqKioqKioqKioqKioqKioqLy9cblxuXG50eXBlIE51dHJpdGlvbkluZm8gPSB7XG4gIG51dHJpZW50X25hbWU6IHN0cmluZztcbiAgaW50YWtlbl9wZXJjZW50YWdlOiBudW1iZXI7XG4gIHByb2dyZXNzX2NvbG9yOiBzdHJpbmc7XG4gIGludGFrZW5fbnVtOiBudW1iZXI7XG4gIHRvdGFsX251bTogbnVtYmVyO1xuICB1bml0OiBzdHJpbmc7XG59XG5cbnR5cGUgTWVhbCA9IHtcbiAgbWVhbElkOiBudW1iZXI7XG4gIG1lYWxOYW1lOiBzdHJpbmc7XG4gIG1lYWxFbmdyeTogbnVtYmVyO1xuICBzdWdnZXN0ZWRJbnRha2U6IG51bWJlcjtcbiAgbWVhbFBlcmNlbnRhZ2U6IG51bWJlcjtcbiAgbWVhbHM6IE1lYWxJbmZvW107XG4gIG1lYWxTdW1tYXJ5OiBGb29kW11cbn1cbnR5cGUgRm9vZCA9IHtcbiAgZm9vZE5hbWU6IHN0cmluZztcbiAgZW5lcmd5OiBudW1iZXI7XG4gIHVuaXROYW1lOiBzdHJpbmc7XG4gIHdlaWdodDogbnVtYmVyXG59XG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIueDremHj1wiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLohILogqpcIiwgaW50YWtlbl9wZXJjZW50YWdlOiAwLCBpbnRha2VuX251bTogMCwgdG90YWxfbnVtOiAwLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi56Kz5rC0XCIsIGludGFrZW5fcGVyY2VudGFnZTogMCwgaW50YWtlbl9udW06IDAsIHRvdGFsX251bTogMCwgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuibi+eZvei0qFwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtcbiAgICAgIHsgbWVhbF9pZDogMCwgbWVhbE5hbWU6ICfml6nppJAnLCBtZWFsRW5ncnk6IDAsIHN1Z2dlc3RlZEludGFrZTogMCwgbWVhbFBlcmNlbnRhZ2U6IFwiXCIsIG1lYWxzOiBbXSwgbWVhbFN1bW1hcnk6IFtdIH0sXG4gICAgICB7IG1lYWxfaWQ6IDEsIG1lYWxOYW1lOiAn5Y2I6aSQJywgbWVhbEVuZ3J5OiAwLCBzdWdnZXN0ZWRJbnRha2U6IDAsIG1lYWxQZXJjZW50YWdlOiBcIlwiLCBtZWFsczogW10sIG1lYWxTdW1tYXJ5OiBbXSB9LFxuICAgICAgeyBtZWFsX2lkOiAyLCBtZWFsTmFtZTogJ+aZmumkkCcsIG1lYWxFbmdyeTogMCwgc3VnZ2VzdGVkSW50YWtlOiAwLCBtZWFsUGVyY2VudGFnZTogXCJcIiwgbWVhbHM6IFtdLCBtZWFsU3VtbWFyeTogW10gfSxcbiAgICBdLFxuICAgIHNjb3JlOiAwLFxuICAgIG1lbnVJbmZvOiB7fSxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHsgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsaW1hZ2U6J2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZpYW1hTmlhQmliWUtpYmd5VmhpY1B6UzVQek9yVm42bU9kV2FLbU5kd2NaS1g5M3o5QkpUdHduSkNxaWFhdUZodTBXb0QzdHdhRnZqaldHTEEvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6J+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6JycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OicgJyxcbiAgfTtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIHBhdGggPSAnJztcbiAgcHVibGljIHNob3dQZXJzb25DaGVja0xvYWRpbmcgPSBmYWxzZTtcbiAgcHVibGljIGZvb2RDb2xvclRpcHNBcnIgPSBbJyMwMDc0ZDknLCAnI2ZmZGMwMCcsJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddXG5cblxuICBwdWJsaWMgb25Mb2FkKCkge1xuICAgIC8qKlxuICAgICAqIOiOt+WPluWPs+S4iuinkuiDtuWbiuWwuuWvuO+8jOiuoeeul+iHquWumuS5ieagh+mimOagj+S9jee9rlxuICAgICAqL1xuICAgIGNvbnN0IG1lbnVJbmZvID0gd3guZ2V0TWVudUJ1dHRvbkJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBtZW51SW5mbzogbWVudUluZm9cbiAgICB9KVxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAvLyBsZXQgY3VycmVudFRpbWVTdGFtcCA9IERhdGUucGFyc2UoU3RyaW5nKG5ldyBEYXRlKCkpKTtcbiAgICAvLyB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YShjdXJyZW50VGltZVN0YW1wLzEwMDApO1xuICB9XG5cbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICB0aGlzLmxvZ2luKCk7XG4gICAgaWYgKHRoaXMubWVhbERhdGUgIT09IDApIHtcbiAgICAgIHRoaXMucmV0cmlldmVGb29kRGlhcnlEYXRhKHRoaXMubWVhbERhdGUpO1xuICAgIH1cbiAgICAvLyB0aGlzLmxvYWRSZXBvcnRCYWRnZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS9k+mHjeebuOWFs+S/oeaBr1xuICAgKi9cbiAgcHVibGljIHJldHJpZXZlRGF0YSgpOiB2b2lkIHtcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih0b2tlbik7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IGN1cnJXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgbGV0IGZpcnN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoMCkudW5peCgpO1xuICAgIGxldCBsYXN0RGF5T2ZXZWVrOiBudW1iZXIgPSBtb21lbnQoKS53ZWVrKGN1cnJXZWVrKS5kYXkoNikudW5peCgpO1xuXG4gICAgY29uc3QgdG9kYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN0YXJ0T2YoJ2RheScpLmZvcm1hdCgnWCcpKTtcbiAgICBjb25zdCBiZWZvcmUzMGRheVRpbWUgPSBOdW1iZXIobW9tZW50KCkuc3VidHJhY3QoMzAsIFwiZGF5c1wiKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgcmVxID0ge1xuICAgICAgICBkYXRlX2Zyb206IGJlZm9yZTMwZGF5VGltZSxcbiAgICAgICAgZGF0ZV90bzogdG9kYXlUaW1lXG4gICAgICB9O1xuXG4gICAgICB3ZWJBUEkuUmV0cmlldmVXZWlnaHRMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnUmV0cmlldmVXZWlnaHRMb2cnLCByZXNwKTtcbiAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICBsYXRlc3Rfd2VpZ2h0OiByZXNwLmxhdGVzdF93ZWlnaHQudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgbmVhckRhdGFBcnI6YW55ID0gW107XG4gICAgICAgIGxldCB0b3RhbCA9IDA7Ly8g6I635Y+W5LiA5L2N5bCP5pWw54K555qE5bmz5Z2H5YC877yM5YWI5rGC5oC75ZKMXG4gICAgICAgIHJlc3Aud2VpZ2h0X2xvZ3MubWFwKGl0ZW09PntcbiAgICAgICAgICB0b3RhbCA9IHRvdGFsICsgaXRlbS52YWx1ZVxuICAgICAgICAgIGNvbnN0IGJlZm9yZU51bWJlckRheSA9ICh0b2RheVRpbWUgLSBpdGVtLmRhdGUpIC8gODY0MDBcbiAgICAgICAgICBjb25zdCBmb3JtYXREYXRlID0gbW9tZW50KGl0ZW0uZGF0ZSoxMDAwKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgbmVhckRhdGFBcnJbMzAgLSBiZWZvcmVOdW1iZXJEYXldID0geyB3ZWVrOiBmb3JtYXREYXRlLCB2YWx1ZTogaXRlbS52YWx1ZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IE1hdGgucm91bmQodG90YWwqMTAgLyByZXNwLndlaWdodF9sb2dzLmxlbmd0aCkvMTBcbiAgICAgICAgLy8g56iA55aP5pWw57uE6ZyA6KaB55SoZm9y77yM5LiN6IO955SobWFw44CCXG4gICAgICAgIC8vIDMw5aSp5YaF55So5oi356ys5LiA5Liq5rKh5pyJ5pu05paw5L2T6YeN55qE5pel5pyf6LWL5YC85Li65L2T6YeN5bmz5Z2H5YC877yM5Yir55qE5pel5pyf6YO96LWL5YC85Li6bnVsbFxuICAgICAgICBsZXQgbGVuID0gbmVhckRhdGFBcnIubGVuZ3RoO1xuICAgICAgICBsZXQgZmxhZyA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwO2k8bGVuO2krKyl7XG4gICAgICAgICAgaWYgKCFuZWFyRGF0YUFycltpXSAmJiBmbGFnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAtaSwgXCJkYXlzXCIpLmZvcm1hdCgnTU0vREQnKTtcbiAgICAgICAgICAgIG5lYXJEYXRhQXJyW2ldID0geyB3ZWVrOiBkYXRhLCB2YWx1ZTogYXZlcmFnZSwgYXZnOiAyMDAwIH1cbiAgICAgICAgICAgIGZsYWcgPSBmYWxzZVxuICAgICAgICAgIH0gZWxzZSBpZiAoIW5lYXJEYXRhQXJyW2ldKXtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBtb21lbnQoKS5zdWJ0cmFjdCgzMCAtIGksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6bnVsbCwgYXZnOiAyMDAwIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hhcnQuYXhpcyhmYWxzZSk7XG4gICAgICAgIGNoYXJ0LmNoYW5nZURhdGEobmVhckRhdGFBcnIpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsZXJyKVxuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn6I635Y+W5L2T6YeN5pWw5o2u5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCk7XG4gIH1cblxuICBwdWJsaWMgZ29XZWlnaHRSZWNvcmQoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDonL3BhZ2VzL3dlaWdodFJlY29yZC9pbmRleCdcbiAgICB9KVxuICB9XG4gIHB1YmxpYyBsb2dpbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgLy8g55m75b2VXG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIC8vIOWPkemAgSBfcmVzLmNvZGUg5Yiw5ZCO5Y+w5o2i5Y+WIG9wZW5JZCwgc2Vzc2lvbktleSwgdW5pb25JZFxuICAgICAgICB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmc/XCJcIjp3eC5zaG93TG9hZGluZyh7IHRpdGxlOiAn5Yqg6L295LitLi4uJyB9KTtcbiAgICAgICAgdmFyIHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUgfTtcbiAgICAgICAgbG9naW5BUEkuTWluaVByb2dyYW1Mb2dpbihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPlnRva2Vu5oiQ5YqfJyxyZXNwKTtcbiAgICAgICAgICB0aGF0LnNob3dQZXJzb25DaGVja0xvYWRpbmcgPyBcIlwiIDp3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgICAgbGV0IHVzZXJTdGF0dXMgPSByZXNwLnVzZXJfc3RhdHVzO1xuICAgICAgICAgIC8vIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAvLyB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9sb2dpbi9pbmRleCcgfSk7XG4gICAgICAgICAgc3dpdGNoICh1c2VyU3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIC8vdmFsaWRhdGlvbiBwYWdlXG4gICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL2xvZ2luL2luZGV4JyB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIC8vb25Cb2FyZGluZyBwcm9jZXNzIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiAnL3BhZ2VzL29uQm9hcmQvb25Cb2FyZCcgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIC8va2VlcCBpdCBhdCBob21lIHBhZ2VcbiAgICAgICAgICAgICAgaWYgKHJlc3AudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgICAgICAgICAgICAgIHRoYXQuYXV0aGVudGljYXRpb25SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5yZXRyaWV2ZURhdGEoKTsgLy8g6I635Y+W5L2T6YeN6K6w5b2VXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgY29udGVudDogJ+mmlumhteeZu+mZhuWksei0pScsXG4gICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycikge1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn6aaW6aG155m76ZmG6aqM6K+B5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyBhdXRoZW50aWNhdGlvblJlcXVlc3QoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6ICcuLi9sb2dpbi9pbmRleD91c2VyX3N0YXR1cz0zJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gIH1cblxuICBwdWJsaWMgZ29OdXRyaXRpb25hbERhdGFiYXNlUGFnZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOicvcGFnZXMvbnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UvaW5kZXgnXG4gICAgfSlcbiAgfVxuICAvLyBwdWJsaWMgbG9hZFJlcG9ydEJhZGdlKCkge1xuICAvLyAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgLy8gICBjb25zb2xlLmxvZyh0b2tlbik7XG4gIC8vICAgaWYgKHRva2VuKSB7XG4gIC8vICAgICBsZXQgY3VycmVudERhdGUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKTtcbiAgLy8gICAgIGxldCBmaXJzdERheU9mV2VlayA9IGN1cnJlbnREYXRlLndlZWsoY3VycmVudERhdGUud2VlaygpKS5kYXkoMSkudW5peCgpO1xuICAvLyAgICAgbGV0IGxhc3REYXlPZldlZWsgPSBjdXJyZW50RGF0ZS53ZWVrKGN1cnJlbnREYXRlLndlZWsoKSkuZGF5KDcpLnVuaXgoKTtcbiAgLy8gICAgIGxldCByZXEgPSB7XG4gIC8vICAgICAgIGRhdGVfZnJvbTogZmlyc3REYXlPZldlZWssXG4gIC8vICAgICAgIGRhdGVfdG86IGxhc3REYXlPZldlZWtcbiAgLy8gICAgIH07XG4gIC8vICAgICB3ZWJBUEkuUmV0cmlldmVVc2VyUmVwb3J0cyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgLy8gICAgICAgdGhpcy5jb3VudFJlcG9ydEJhZGdlKHJlc3ApO1xuICAvLyAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgLy8gICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIH1cbiAgLy8gfVxuXG4gIHB1YmxpYyBjb3VudFJlcG9ydEJhZGdlKHJlc3A6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgIGxldCByZXBvcnROdW0gPSAwO1xuICAgIGxldCByZXBvcnRzID0gcmVzcC5kYWlseV9yZXBvcnQ7XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVwb3J0cykge1xuICAgICAgbGV0IHJlcG9ydCA9IHJlcG9ydHNbaW5kZXhdO1xuICAgICAgaWYgKCFyZXBvcnQuaXNfcmVwb3J0X2dlbmVyYXRlZCAmJiAhcmVwb3J0LmlzX2Zvb2RfbG9nX2VtcHR5KSB7XG4gICAgICAgIGxldCB0b2RheVRpbWUgPSBtb21lbnQoKS5zdGFydE9mKCdkYXknKS51bml4KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRvZGF5VGltZSk7XG4gICAgICAgIGlmIChyZXBvcnQuZGF0ZSA8IHRvZGF5VGltZSB8fCAocmVwb3J0LmRhdGUgPT0gdG9kYXlUaW1lICYmIG1vbWVudChuZXcgRGF0ZSgpKS5ob3VycyA+IDIyKSkgeyAgIC8vY291bnQgdG9kYXkgcmVwb3J0cyBzdGF0dXMgYWZ0ZXIgMTlcbiAgICAgICAgICByZXBvcnROdW0rKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVwb3J0TnVtICE9IDApIHtcbiAgICAgIHd4LnNldFRhYkJhckJhZGdlKHtcbiAgICAgICAgaW5kZXg6IDIsXG4gICAgICAgIHRleHQ6IFN0cmluZyhyZXBvcnROdW0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd3gucmVtb3ZlVGFiQmFyQmFkZ2Uoe1xuICAgICAgICBpbmRleDogMlxuICAgICAgfSk7XG4gICAgfVxuICB9XG4vKipcbiAqIGFwaeivt+axguS7iuaXpeaRhOWFpemHj+WSjOS7iuaXpemlrumjn+iusOW9lVxuICovXG4gIHB1YmxpYyByZXRyaWV2ZUZvb2REaWFyeURhdGEoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gICAgbGV0IHJlcTogUmV0cmlldmVGb29kRGlhcnlSZXEgPSB7IGRhdGU6IGN1cnJlbnRUaW1lU3RhbXAgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVGb29kRGlhcnkocmVxKS50aGVuKHJlc3AgPT4gdGhpcy5mb29kRGlhcnlEYXRhUGFyc2luZyhyZXNwKSkuY2F0Y2goZXJyID0+XG4gICAgY29uc3QgdG9rZW4xID0gd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpLy/nlKjmiLflj6/og73msqHmnInnmbvlvZXvvIzmraTml7bkuI3lupTlvLnnqpdcbiAgICAgIGlmICghd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpKXtcbiAgICAgICAgY29uc29sZS5sb2coODg4OCwgdG9rZW4xKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bml6Xlv5flpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyByZXRyaWV2ZU1lYWxMb2cobWVhbElkOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZU1lYWxMb2dSZXEgPSB7IG1lYWxfaWQ6IG1lYWxJZCB9XG4gICAgcmV0dXJuIHdlYkFQSS5SZXRyaWV2ZU1lYWxMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VNZWFsTG9nKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBjb250ZW50OiAn6I635Y+W6aOf54mp5pWw5o2u5aSx6LSlJyxcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pXG4gICAgfVxuICAgICk7XG4gIH1cbiAgcHVibGljIHBhcnNlTWVhbExvZyhyZXNwOiBNZWFsTG9nUmVzcCkge1xuICAgIGxldCBmb29kTGlzdDogRm9vZFtdID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5mb29kX2xvZykge1xuICAgICAgbGV0IGZvb2RMb2c6IEZvb2RMb2dJbmZvID0gcmVzcC5mb29kX2xvZ1tpbmRleF07XG4gICAgICBsZXQgdW5pdE9iaiA9IGZvb2RMb2cudW5pdF9vcHRpb24uZmluZChvID0+IG8udW5pdF9pZCA9PT0gZm9vZExvZy51bml0X2lkKTtcbiAgICAgIGxldCB1bml0TmFtZSA9IFwi5Lu9XCJcbiAgICAgIGlmICh1bml0T2JqKSB7XG4gICAgICAgIHVuaXROYW1lID0gdW5pdE9iai51bml0X25hbWU7XG4gICAgICB9XG4gICAgICBsZXQgZm9vZDogRm9vZCA9IHtcbiAgICAgICAgZm9vZE5hbWU6IGZvb2RMb2cuZm9vZF9uYW1lLFxuICAgICAgICBlbmVyZ3k6IE1hdGguZmxvb3IoZm9vZExvZy5lbmVyZ3kgLyAxMDApLFxuICAgICAgICB1bml0TmFtZTogdW5pdE5hbWUsXG4gICAgICAgIHdlaWdodDogTWF0aC5yb3VuZChmb29kTG9nLndlaWdodCAvIDEwMClcbiAgICAgIH1cbiAgICAgIGZvb2RMaXN0LnB1c2goZm9vZClcbiAgICB9XG4gICAgcmV0dXJuIGZvb2RMaXN0XG4gIH1cbiAgcHVibGljIGxvYWRNZWFsU3VtbWFyeShyZXNwOiBSZXRyaWV2ZUZvb2REaWFyeVJlc3ApIHtcbiAgICBsZXQgYnJlYWtmYXN0OiBNZWFsO1xuICAgIGxldCBicmVha2Zhc3RTdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgICBsZXQgYnJlYWtmYXN0SWRzOiBudW1iZXJbXSA9IFtdIC8v5b6X5Yiw5pep6aSQbWFlbF9pZOaVsOe7hFxuICAgIHJlc3AuYnJlYWtmYXN0LmZvckVhY2goKGl0ZW0gPT5icmVha2Zhc3RJZHMucHVzaChpdGVtLm1lYWxfaWQpKSlcbiAgICBjb25zdCBicmVha2Zhc3RQcm9tcyA9IFByb21pc2UuYWxsKGJyZWFrZmFzdElkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoIGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gICAgICAgICAgYnJlYWtmYXN0U3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTsgLy8gYnJlYWtmYXN0U3VtbWFyeeS4reiOt+W+l+aXqemkkOS4gOWFseWQg+S6huWkmuWwkemjn+eJqe+8jOS4jeWIhuWbvueJh1xuICAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsvLyDmr4/kuKpzdW3ku6PooajkuIDlvKDlm77mnInlpJrlsJHljaHot6/ph4xcbiAgICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmJyZWFrZmFzdFtpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnbWVhbHMnLHJlc3AuYnJlYWtmYXN0KVxuICAgICAgICByZXR1cm4gYnJlYWtmYXN0ID0ge1xuICAgICAgICAgIG1lYWxJZDogMCxcbiAgICAgICAgICBtZWFsTmFtZTogJ+aXqemkkCcsXG4gICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuYnJlYWtmYXN0X3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5icmVha2Zhc3QsXG4gICAgICAgICAgbWVhbFN1bW1hcnk6IGJyZWFrZmFzdFN1bW1hcnksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAvL2x1bmNoXG4gICAgbGV0IGx1bmNoOiBNZWFsO1xuICAgIGxldCBsdW5jaFN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBsdW5jaElkczogbnVtYmVyW10gPSBbXVxuICAgIHJlc3AubHVuY2guZm9yRWFjaCgoaXRlbSA9Pmx1bmNoSWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpO1xuICAgIGNvbnN0IGx1bmNoUHJvbXMgPSBQcm9taXNlLmFsbChsdW5jaElkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgICAgICAgICBsdW5jaFN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7XG4gICAgICAgICAgbGV0IHN1bSA9IGxpc3QucmVkdWNlKChwcmUsIGN1cikgPT4gey8vIOavj+S4qnN1beS7o+ihqOS4gOW8oOWbvuacieWkmuWwkeWNoei3r+mHjFxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AubHVuY2hbaW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3IgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsdW5jaCA9IHtcbiAgICAgICAgICBtZWFsSWQ6IDEsXG4gICAgICAgICAgbWVhbE5hbWU6ICfljYjppJAnLFxuICAgICAgICAgIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmx1bmNoX3N1Z2dlc3Rpb24uZW5lcmd5X2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgc3VnZ2VzdGVkSW50YWtlOiBNYXRoLmZsb29yKHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5sdW5jaF9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgbWVhbHM6IHJlc3AubHVuY2gsXG4gICAgICAgICAgbWVhbFN1bW1hcnk6IGx1bmNoU3VtbWFyeVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgLy9kaW5uZXJcbiAgICBsZXQgZGlubmVyOiBNZWFsO1xuICAgIGxldCBkaW5uZXJTdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgICBsZXQgZGlubmVySWRzOiBudW1iZXJbXSA9IFtdXG4gICAgcmVzcC5kaW5uZXIuZm9yRWFjaCgoaXRlbSA9PmRpbm5lcklkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgICBjb25zdCBkaW5uZXJQcm9tcyA9IFByb21pc2UuYWxsKGRpbm5lcklkcy5tYXAoaWQgPT4gdGhpcy5yZXRyaWV2ZU1lYWxMb2coaWQpKSkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5tYXAoKGxpc3QsaW5kZXgpID0+IHtcbiAgICAgICAgICBjb25zdCB0aXBfY29sb3IgPSB0aGF0LmZvb2RDb2xvclRpcHNBcnI7XG4gICAgICAgICAgbGV0IGNoYW5nZWRMaXN0ID0gbGlzdC5tYXAoaXRlbSA9PiBpdGVtID0gT2JqZWN0LmFzc2lnbihpdGVtLCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yW2luZGV4XSB9KSlcbiAgICAgICAgICBkaW5uZXJTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsvLyDmr4/kuKpzdW3ku6PooajkuIDlvKDlm77mnInlpJrlsJHljaHot6/ph4xcbiAgICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmRpbm5lcltpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGlubmVyID0ge1xuICAgICAgICAgIG1lYWxJZDogMixcbiAgICAgICAgICBtZWFsTmFtZTogJ+aZmumkkCcsIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmRpbm5lcl9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmRpbm5lcl9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmRpbm5lcl9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgbWVhbHM6IHJlc3AuZGlubmVyLFxuICAgICAgICAgIG1lYWxTdW1tYXJ5OiBkaW5uZXJTdW1tYXJ5XG4gICAgICAgIH07XG5cbiAgICAgIH0pO1xuICAgIC8vYWRkaXRpb25hbFxuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgbGV0IGFkZGl0aW9uOiBNZWFsO1xuICAgIGxldCBhZGRpdGlvblN1bW1hcnk6IEZvb2RbXSA9IFtdO1xuICAgIGxldCBhZGRpdGlvbklkczogbnVtYmVyW10gPSBbXVxuICAgIHJlc3AuYWRkaXRpb24uZm9yRWFjaCgoaXRlbSA9PmRpbm5lcklkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgICBjb25zdCBhZGRpdGlvblByb21zID0gUHJvbWlzZS5hbGwoYWRkaXRpb25JZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gICAgICAgICAgYWRkaXRpb25TdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsgIC8v6K6h566X5Ye65q+P5byg5Zu+55qE6IO96YeP77yM5bm25re75Yqg6L+b5a+56LGhXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5hZGRpdGlvbltpbmRleF0sIHsgaW1nX2VuZ3J5OiBzdW0gfSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcn0pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYWRkaXRpb24gPSB7XG4gICAgICAgICAgbWVhbElkOiAzLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5Yqg6aSQJyxcbiAgICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmFkZGl0aW9uLFxuICAgICAgICAgIG1lYWxTdW1tYXJ5OiBhZGRpdGlvblN1bW1hcnlcbiAgICAgICAgfTtcblxuICAgICAgfSk7XG4gICAgbGV0IG1lYWxMaXN0OiBNZWFsW10gPSBbXVxuICAgIFByb21pc2UuYWxsKFticmVha2Zhc3RQcm9tcywgbHVuY2hQcm9tcywgZGlubmVyUHJvbXNdKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcChtZWFsID0+IG1lYWxMaXN0LnB1c2gobWVhbCkpO1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIG1lYWxMaXN0OiBtZWFsTGlzdCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApO1xuXG4gIH1cblxuLyoqXG4gKiDop6PmnpDojrflj5bku4rml6XmkYTlhaXph4/mnb/lnZfnmoTmlbDmja5cbiAqL1xuICBwdWJsaWMgZm9vZERpYXJ5RGF0YVBhcnNpbmcocmVzcDogUmV0cmlldmVGb29kRGlhcnlSZXNwKSB7XG4gICAgY29uc29sZS5sb2coXCJzdW1tYXJ5XCIsIHJlc3ApO1xuICAgIGxldCBzY29yZSA9IHJlc3Auc2NvcmU7XG4gICAgbGV0IGVuZXJneSA9IHJlc3AuZGFpbHlfaW50YWtlLmVuZXJneTtcbiAgICBsZXQgcHJvdGVpbiA9IHJlc3AuZGFpbHlfaW50YWtlLnByb3RlaW47XG4gICAgbGV0IGNhcmJvaHlkcmF0ZSA9IHJlc3AuZGFpbHlfaW50YWtlLmNhcmJvaHlkcmF0ZTtcbiAgICBsZXQgZmF0ID0gcmVzcC5kYWlseV9pbnRha2UuZmF0O1xuICAgIGxldCBudXRyaWVudFN1bW1hcnkgPSBbXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi54Ot6YePXCIsIGludGFrZW5fcGVyY2VudGFnZTogZW5lcmd5LnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGVuZXJneS5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoZW5lcmd5LnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWNg+WNoVwiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi6ISC6IKqXCIsIGludGFrZW5fcGVyY2VudGFnZTogZmF0LnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGZhdC5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoZmF0LnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi56Kz5rC05YyW5ZCI54mpXCIsIGludGFrZW5fcGVyY2VudGFnZTogY2FyYm9oeWRyYXRlLnBlcmNlbnRhZ2UsIGludGFrZW5fbnVtOiBNYXRoLmZsb29yKGNhcmJvaHlkcmF0ZS5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IoY2FyYm9oeWRyYXRlLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi6JuL55m96LSoXCIsIGludGFrZW5fcGVyY2VudGFnZTogcHJvdGVpbi5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihwcm90ZWluLmludGFrZSAvIDEwMCksIHRvdGFsX251bTogTWF0aC5mbG9vcihwcm90ZWluLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLCB1bml0OiBcIuWFi1wiIH1cbiAgICBdXG5cbiAgICB0aGlzLmxvYWRNZWFsU3VtbWFyeShyZXNwKTtcbiAgICAvLyBsZXQgbWVhbExpc3QgPSBbYnJlYWtmYXN0LCBsdW5jaCwgZGlubmVyLCBhZGRpdGlvbmFsXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbnV0cmllbnRTdW1tYXJ5OiBudXRyaWVudFN1bW1hcnksXG4gICAgICBzY29yZTogc2NvcmVcbiAgICB9LCgpPT57XG4gICAgICBudXRyaWVudFN1bW1hcnkubWFwKChpdGVtLGluZGV4KT0+e1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudChgI2NpcmNsZSR7aW5kZXh9YCkuZHJhd0NpcmNsZShgY2FudmFzYCwgNzUsIDQsIGl0ZW0uaW50YWtlbl9wZXJjZW50YWdlLzEwMCAqIDIpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kTmF2aVRvT3RoZXJNaW5pQXBwKCkge1xuICAgIC8vdGVzdCBvbiBuYXZpZ2F0ZSBtaW5pUHJvZ3JhbVxuICAgIHd4Lm5hdmlnYXRlVG9NaW5pUHJvZ3JhbSh7XG4gICAgICBhcHBJZDogJ3d4NGI3NDIyOGJhYTE1NDg5YScsXG4gICAgICBwYXRoOiAnJyxcbiAgICAgIGVudlZlcnNpb246ICdkZXZlbG9wJyxcbiAgICAgIHN1Y2Nlc3MocmVzOiBhbnkpIHtcbiAgICAgICAgLy8g5omT5byA5oiQ5YqfXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Nlc3MgbmF2aWdhdGVcIik7XG4gICAgICB9LFxuICAgICAgZmFpbChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcHVibGljIHRyaWdnZXJCaW5kZ2V0ZGF0ZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2VsZWN0Q29tcG9uZW50KCcjY2FsZW5kYXInKS5kYXRlU2VsZWN0aW9uKClcbiAgfVxuXG4gIC8vd2hlbiBvcGVubmluZyB0aGUgY2FsZW5kYXJcbiAgcHVibGljIGJpbmRzZWxlY3QoZXZlbnQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgfVxuXG4gIC8vd2hlbiB1c2VyIHNlbGVjdCBkYXRlXG4gIHB1YmxpYyBiaW5kZ2V0ZGF0ZShldmVudDogYW55KSB7XG4gICAgXG4gICAgLy9Db252ZXJ0IGRhdGUgdG8gdW5peCB0aW1lc3RhbXBcbiAgICBsZXQgdGltZSA9IGV2ZW50LmRldGFpbDtcbiAgICBjb25zdCBuYXZUaXRsZVRpbWUgPSB0aW1lLnllYXIgKyAnLycgKyB0aW1lLm1vbnRoICsgJy8nICsgdGltZS5kYXRlO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBuYXZUaXRsZVRpbWU6IG5hdlRpdGxlVGltZVxuICAgIH0pXG4gICAgbGV0IGRhdGUgPSBtb21lbnQoW3RpbWUueWVhciwgdGltZS5tb250aCAtIDEsIHRpbWUuZGF0ZV0pOyAvLyBNb21lbnQgbW9udGggaXMgc2hpZnRlZCBsZWZ0IGJ5IDFcbiAgICAvL2dldCBjdXJyZW50IHRpbWVzdGFtcFxuICAgIHRoaXMubWVhbERhdGUgPSBkYXRlLnVuaXgoKTtcbiAgICBjb25zdCB0b2RheVRpbWVTdGFtcCA9IG1vbWVudChuZXcgRGF0ZSgpKTtcbiAgICBpZiAodG9kYXlUaW1lU3RhbXAuaXNTYW1lKGRhdGUsJ2QnKSl7XG4gICAgICBjb25zb2xlLmxvZygn6YCJ5oup55qE5pel5pyf5piv5LuK5aSpJyk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG5hdlRpdGxlVGltZTogJ+S7iuaXpSdcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8v5LuW5Lus5LiN5piv5Zyo5ZCM5LiA5aSpXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBuYXZUaXRsZVRpbWU6IG5hdlRpdGxlVGltZVxuICAgICAgfSlcbiAgICB9IFxuICAgIC8vcmVxdWVzdCBBUElcbiAgICB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICAvL2xldCB0aW1lRGF0YSA9IHRpbWUueWVhciArIFwiLVwiICsgdGltZS5tb250aCArIFwiLVwiICsgdGltZS5kYXRlO1xuICB9XG4gIHB1YmxpYyBvbkRhaWx5UmVwb3J0Q2xpY2soZXZlbnQ6IGFueSkge1xuICAgIHRoaXMucmV0cmlldmVEYWlseVJlcG9ydCh0aGlzLm1lYWxEYXRlKTtcbiAgfVxuICBwdWJsaWMgcmV0cmlldmVEYWlseVJlcG9ydChjdXJyZW50VGltZVN0YW1wOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSA9IHsgZGF0ZTogY3VycmVudFRpbWVTdGFtcCB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICBsZXQgcmVwb3J0VXJsOiBzdHJpbmcgPSByZXNwLnJlcG9ydF91cmw7XG4gICAgICBpZiAocmVwb3J0VXJsICYmIHJlcG9ydFVybCAhPSBcIlwiKSB7XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IFwiL3BhZ2VzL3JlcG9ydFBhZ2UvcmVwb3J0UGFnZT91cmw9XCIgKyByZXBvcnRVcmwgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwi6K+35re75Yqg5b2T5aSp6aOf54mp6K6w5b2VXCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSlcbiAgfVxuXG5cblxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgbWVhbEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5tZWFsVHlwZSA9IG1lYWxJbmRleCArIDE7XG4gICAgd3guc2hvd0FjdGlvblNoZWV0KHtcbiAgICAgIGl0ZW1MaXN0OiBbJ+aLjeeFp+iusOW9lScsICfnm7jlhownLCAn5paH5a2X5pCc57SiJ10sXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIHN3aXRjaCAocmVzLnRhcEluZGV4KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICAgICAgc291cmNldHlwZTogJ2NhbWVyYScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHtcbiAgICAgICAgICAgICAgc291cmNldHlwZTogJ2FsYnVtJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICAgIHVybDogXCIuLi8uLi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbE5hbWUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgICAgIHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjaG9vc2VJbWFnZShzb3VyY2VUeXBlOiBzdHJpbmcpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guY2hvb3NlSW1hZ2Uoe1xuICAgICAgY291bnQ6IDEsXG4gICAgICBzaXplVHlwZTogWydvcmlnaW5hbCcsICdjb21wcmVzc2VkJ10sXG4gICAgICBzb3VyY2VUeXBlOiBbc291cmNlVHlwZV0sXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzOiBhbnkpIHtcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLkuIrkvKDkuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICAgICAgdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgbGV0IGltYWdlUGF0aCA9IHJlcy50ZW1wRmlsZVBhdGhzWzBdO1xuICAgICAgICB0aGF0LnBhdGggPSBpbWFnZVBhdGhcbiAgICAgICAgLy9jcm9wIGltYWdlIHRoZW4gdXBsb2FkLCBmb2xsb3cgYnkgdGFnZ2luZyBwcm9jZXNzXG4gICAgICAgIC8vIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAvLyAgIHVybDogXCIvcGFnZXMvd2VDcm9wcGVyUGFnZS91cGxvYWQ/aW1hZ2VVcmw9XCIgKyBpbWFnZVBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcblxuICAgICAgICAgIC8vIHVybDogXCIvcGFnZXMvaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9XCIgKyBpbWFnZVBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9KTtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2Vzcygpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkU3VjZXNzXCIgKyB0aGlzLm1lYWxUeXBlICsgXCIsXCIgKyB0aGlzLm1lYWxEYXRlKTtcbiAgICAvLyB3eC5oaWRlTG9hZGluZygpO1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnL3BhZ2VzL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KXtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpVG9Gb29kRGV0YWlsKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0SW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW1hZ2VJbmRleDtcbiAgICBsZXQgbWVhbElkID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbHNbaW1hZ2VJbmRleF0ubWVhbF9pZDtcbiAgICBsZXQgaW1hZ2VLZXkgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsc1tpbWFnZUluZGV4XS5pbWdfa2V5O1xuICAgIGxldCBpbWFnZVVybCA9IGltYWdlS2V5ID09IFwiXCIgPyBkZWZhdWx0SW1hZ2VVcmwgOiBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvXCIgKyB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsc1tpbWFnZUluZGV4XS5pbWdfa2V5O1xuICAgIGxldCBwYXJhbSA9IHt9O1xuICAgIHBhcmFtLm1lYWxJZCA9IG1lYWxJZDtcbiAgICBwYXJhbS5pbWFnZVVybCA9IGltYWdlVXJsO1xuICAgIHBhcmFtLnNob3dEZWxldGVCdG4gPSB0cnVlO1xuICAgIHBhcmFtLnNob3dTaGFyZUJ0biA9IGltYWdlS2V5ICE9IFwiXCI7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGlhcnlQYWdlKCkpXG4iXX0=