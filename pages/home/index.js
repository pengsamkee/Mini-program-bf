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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBQzVCLHVEQUF5RDtBQUV6RCxpREFBbUQ7QUFNbkQsaURBQWtEO0FBQ2xELCtCQUFpQztBQUNqQyxrREFBb0Q7QUFNcEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxJQUFJLEdBQUc7UUFDWCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ3RDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDdEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtRQUN0QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0tBQ3ZDLENBQUM7SUFDRixLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ25CLEVBQUUsRUFBRSxNQUFNO1FBQ1YsS0FBSyxPQUFBO1FBQ0wsTUFBTSxRQUFB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QUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDckUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2RSxJQUFJLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHNFQUFzRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDbkwsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsS0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsS0FBSyxDQUFDLFlBQVksR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxvQ0FBb0MsR0FBRyxTQUFTO1NBQ3RELENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF4bUJELElBd21CQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcblxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQge1xuICBSZXRyaWV2ZUZvb2REaWFyeVJlcSwgUmV0cmlldmVGb29kRGlhcnlSZXNwLFxuICBSZXRyaWV2ZU9yQ3JlYXRlVXNlclJlcG9ydFJlcSwgUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXNwLFxuICBSZXRyaWV2ZU1lYWxMb2dSZXEsIE1lYWxMb2dSZXNwLCBGb29kTG9nSW5mbywgTWVhbEluZm9cbn0gZnJvbSBcIi4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIlxuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqaW5pdCBmMiBjaGFydCBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xuLy8gbGV0IHNhbGVzVHJlbmRDaGFydENvbXBvbmVudCA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjbnV0cml0aW9uX2NoYXJ0MScpO1xuLy8gc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50LmluaXQoaW5pdENoYXJ0KVxubGV0IGNoYXJ0ID0gbnVsbDtcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7XG4gIGNvbnN0IGRhdGEgPSBbXG4gICAgeyB3ZWVrOiAn5ZGo5pelJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOS4gCcsIHZhbHVlOiAxMTUwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkuownLCB2YWx1ZTogMTMwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5LiJJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9LFxuICAgIHsgd2VlazogJ+WRqOWbmycsIHZhbHVlOiAxMjAwLCBhdmc6IDIwMDAgfSxcbiAgICB7IHdlZWs6ICflkajkupQnLCB2YWx1ZTogMTIwMCwgYXZnOiAyMDAwIH0sXG4gICAgeyB3ZWVrOiAn5ZGo5YWtJywgdmFsdWU6IDEyMDAsIGF2ZzogMjAwMCB9XG4gIF07XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuYXhpcygnd2VlaycsIHsgIC8v5a+5d2Vla+WvueW6lOeahOe6teaoquWdkOagh+i9tOi/m+ihjOmFjee9rlxuICAgIGdyaWQ6IG51bGwsICAvL+e9keagvOe6v1xuICAgIHRpY2tMaW5lOm51bGwsXG4gICAgbGFiZWw6bnVsbCxcbiAgICBsaW5lOm51bGxcbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoe1xuICAgIHNob3dDcm9zc2hhaXJzOiB0cnVlLCAvLyDmmK/lkKbmmL7npLrkuK3pl7TpgqPmoLnovoXliqnnur/vvIzngrnlm77jgIHot6/lvoTlm77jgIHnur/lm77jgIHpnaLnp6/lm77pu5jorqTlsZXnpLpcbiAgICBvblNob3coZXYpIHsgLy8g54K55Ye75p+Q6aG55ZCO77yM6aG26YOodGlw5pi+56S655qE6YWN572uIGl0ZW1zWzBdLm5hbWU6aXRlbVswXS52YWx1ZVxuICAgICAgY29uc3QgeyBpdGVtcyB9ID0gZXY7IC8vZXbkuK3mnIl4LHnlnZDmoIflkozooqvngrnlh7vpobnnmoTkv6Hmga9cbiAgICAgIGl0ZW1zWzBdLm5hbWUgPSBpdGVtc1swXS5vcmlnaW4ud2VlaztcbiAgICAgIGl0ZW1zWzBdLnZhbHVlID0gaXRlbXNbMF0udmFsdWUrJ2tnJztcbiAgICAgIGl0ZW1zLmxlbmd0aCA9IDFcbiAgICB9XG4gIH0pO1xuXG4gIGNoYXJ0LnBvaW50KClcbiAgICAucG9zaXRpb24oW1wid2Vla1wiLFwidmFsdWVcIl0pXG4gICAgLnN0eWxlKHsgZmlsbDogJyNmZmZmZmYnLCByOiAxLjcsIGxpbmVXaWR0aDogMSwgc3Ryb2tlOiAnI2YzNDY1YScgfSk7XG4gIGNoYXJ0LmxpbmUoe1xuICAgIGNvbm5lY3ROdWxsczogdHJ1ZSAvLyDphY3nva7vvIzov57mjqXnqbrlgLzmlbDmja5cbiAgfSkucG9zaXRpb24oJ3dlZWsqdmFsdWUnKS5jb2xvcihcIiNlZDJjNDhcIikuc2hhcGUoJ3Ntb290aCcpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xuXG4gIFxufVxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqZW5kIG9mIGYyIGNoYXJ0IGluaXQqKioqKioqKioqKioqKioqKioqKioqKioqLy9cblxuXG50eXBlIE51dHJpdGlvbkluZm8gPSB7XG4gIG51dHJpZW50X25hbWU6IHN0cmluZztcbiAgaW50YWtlbl9wZXJjZW50YWdlOiBudW1iZXI7XG4gIHByb2dyZXNzX2NvbG9yOiBzdHJpbmc7XG4gIGludGFrZW5fbnVtOiBudW1iZXI7XG4gIHRvdGFsX251bTogbnVtYmVyO1xuICB1bml0OiBzdHJpbmc7XG59XG5cbnR5cGUgTWVhbCA9IHtcbiAgbWVhbElkOiBudW1iZXI7XG4gIG1lYWxOYW1lOiBzdHJpbmc7XG4gIG1lYWxFbmdyeTogbnVtYmVyO1xuICBzdWdnZXN0ZWRJbnRha2U6IG51bWJlcjtcbiAgbWVhbFBlcmNlbnRhZ2U6IG51bWJlcjtcbiAgbWVhbHM6IE1lYWxJbmZvW107XG4gIG1lYWxTdW1tYXJ5OiBGb29kW11cbn1cbnR5cGUgRm9vZCA9IHtcbiAgZm9vZE5hbWU6IHN0cmluZztcbiAgZW5lcmd5OiBudW1iZXI7XG4gIHVuaXROYW1lOiBzdHJpbmc7XG4gIHdlaWdodDogbnVtYmVyXG59XG5cbmNsYXNzIEZvb2REaWFyeVBhZ2Uge1xuICBwdWJsaWMgdXNlckluZm8gPSB7fVxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBvcHRzOiB7XG4gICAgICBvbkluaXQ6IGluaXRDaGFydCxcbiAgICB9LFxuICAgIG51dHJpZW50U3VtbWFyeTogW1xuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIueDremHj1wiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5Y2D5Y2hXCIgfSxcbiAgICAgIHsgbnV0cmllbnRfbmFtZTogXCLohILogqpcIiwgaW50YWtlbl9wZXJjZW50YWdlOiAwLCBpbnRha2VuX251bTogMCwgdG90YWxfbnVtOiAwLCB1bml0OiBcIuWFi1wiIH0sXG4gICAgICB7IG51dHJpZW50X25hbWU6IFwi56Kz5rC0XCIsIGludGFrZW5fcGVyY2VudGFnZTogMCwgaW50YWtlbl9udW06IDAsIHRvdGFsX251bTogMCwgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuibi+eZvei0qFwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IDAsIGludGFrZW5fbnVtOiAwLCB0b3RhbF9udW06IDAsIHVuaXQ6IFwi5YWLXCIgfVxuICAgIF0sXG4gICAgbWVhbExpc3Q6IFtcbiAgICAgIHsgbWVhbF9pZDogMCwgbWVhbE5hbWU6ICfml6nppJAnLCBtZWFsRW5ncnk6IDAsIHN1Z2dlc3RlZEludGFrZTogMCwgbWVhbFBlcmNlbnRhZ2U6IFwiXCIsIG1lYWxzOiBbXSwgbWVhbFN1bW1hcnk6IFtdIH0sXG4gICAgICB7IG1lYWxfaWQ6IDEsIG1lYWxOYW1lOiAn5Y2I6aSQJywgbWVhbEVuZ3J5OiAwLCBzdWdnZXN0ZWRJbnRha2U6IDAsIG1lYWxQZXJjZW50YWdlOiBcIlwiLCBtZWFsczogW10sIG1lYWxTdW1tYXJ5OiBbXSB9LFxuICAgICAgeyBtZWFsX2lkOiAyLCBtZWFsTmFtZTogJ+aZmumkkCcsIG1lYWxFbmdyeTogMCwgc3VnZ2VzdGVkSW50YWtlOiAwLCBtZWFsUGVyY2VudGFnZTogXCJcIiwgbWVhbHM6IFtdLCBtZWFsU3VtbWFyeTogW10gfSxcbiAgICBdLFxuICAgIHNjb3JlOiAwLFxuICAgIG1lbnVJbmZvOiB7fSxcbiAgICBpbmZvTGlzdHM6IFtcbiAgICAgIHsgdXJsOiAnaHR0cHM6Ly9tcC53ZWl4aW4ucXEuY29tL3MvZmcxcWxpMERrMXg5eTBXWmNPSHY4dycsaW1hZ2U6J2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVZpYW1hTmlhQmliWUtpYmd5VmhpY1B6UzVQek9yVm42bU9kV2FLbU5kd2NaS1g5M3o5QkpUdHduSkNxaWFhdUZodTBXb0QzdHdhRnZqaldHTEEvNjQwP3d4X2ZtdD1qcGVnJyxcbiAgICAgICAgdGl0bGU6J+eni+Wto+mlrumjn+aUu+eVpSEnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB1cmw6ICdodHRwczovL21wLndlaXhpbi5xcS5jb20vcy8tUmJERjFVTFIwUEc3YjdSSXlVZk53JywgaW1hZ2U6ICdodHRwczovL21tYml6LnFwaWMuY24vbW1iaXpfanBnL2V0dmJ5SzJ5TnVWS1dpYVlnSEcwR0E5TWlhUndzcnRFYm9pYmpXUlFaaHo3OGpHSlpMekczQ0psVUlpY25nYVl3Z1lDZWtEeThDM05vS2pCeUJ4WTBpYmlhVkFnLzY0MD93eF9mbXQ9anBlZycsXG4gICAgICAgIHRpdGxlOiAn54K55aSW5Y2W5bCx5LiN5YGl5bq377yfIOaIkeWBj+S4jSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vbXAud2VpeGluLnFxLmNvbS9zLzhJY0o3SDZxNHZ0emRsV0wzV1hJeFEnLCBpbWFnZTogJ2h0dHBzOi8vbW1iaXoucXBpYy5jbi9tbWJpel9qcGcvZXR2YnlLMnlOdVdiTFJIUUVKb3ZCQ3c0WFV4VldLR1BKaWF2UHJBOU5LUEo0c2ljRjM2bzNaWktqMlN0bGhwVm9pYkJ2NmNzME5IVEppYzJXRkFFUmRlaWMzUS82NDA/d3hfZm10PWpwZWcnLFxuICAgICAgICB0aXRsZTogJ+iQpeWFu+W4iOWmguS9leWvueiAgeS4reWwkeiDluWPi+i/m+ihjOi/kOWKqOayu+eWl++8nyDnnIvnnIvok53nmq7kuabmgI7kuYjor7QnXG4gICAgICB9XG4gICAgXSxcbiAgICBuYXZUaXRsZVRpbWU6JycsLy/lr7zoiKrmoI/lpITmmL7npLrnmoTml7bpl7RcbiAgICBsYXRlc3Rfd2VpZ2h0OicgJyxcbiAgfTtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIHBhdGggPSAnJztcbiAgcHVibGljIHNob3dQZXJzb25DaGVja0xvYWRpbmcgPSBmYWxzZTtcbiAgcHVibGljIGZvb2RDb2xvclRpcHNBcnIgPSBbJyMwMDc0ZDknLCAnI2ZmZGMwMCcsJyM3ZmRiZmYnLCAnIzM5Y2NjYycsICcjM2Q5OTcwJywgJyMyZWNjNDAnLCAnIzAxZmY3MCcsICcjZmY4NTFiJywgJyMwMDFmM2YnLCAnI2ZmNDEzNicsICcjODUxNDRiJywgJyNmMDEyYmUnLCAnI2IxMGRjOScsICcjMTExMTExJywgJyNhYWFhYWEnLCAnI2RkZGRkZCddXG5cblxuICBwdWJsaWMgb25Mb2FkKCkge1xuICAgIC8vIHd4Lm5hdmlnYXRlVG8oe3VybDonLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2Zvb2REZXRhaWwvaW5kZXgnfSlcbiAgICAvKipcbiAgICAgKiDojrflj5blj7PkuIrop5Log7blm4rlsLrlr7jvvIzorqHnrpfoh6rlrprkuYnmoIfpopjmoI/kvY3nva5cbiAgICAgKi9cbiAgICBjb25zdCBtZW51SW5mbyA9IHd4LmdldE1lbnVCdXR0b25Cb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbWVudUluZm86IG1lbnVJbmZvXG4gICAgfSlcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgLy8gbGV0IGN1cnJlbnRUaW1lU3RhbXAgPSBEYXRlLnBhcnNlKFN0cmluZyhuZXcgRGF0ZSgpKSk7XG4gICAgLy8gdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEoY3VycmVudFRpbWVTdGFtcC8xMDAwKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5sb2dpbigpO1xuICAgIGlmICh0aGlzLm1lYWxEYXRlICE9PSAwKSB7XG4gICAgICB0aGlzLnJldHJpZXZlRm9vZERpYXJ5RGF0YSh0aGlzLm1lYWxEYXRlKTtcbiAgICB9XG4gICAgLy8gdGhpcy5sb2FkUmVwb3J0QmFkZ2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bkvZPph43nm7jlhbPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyByZXRyaWV2ZURhdGEoKTogdm9pZCB7XG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBjdXJyV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlaygpO1xuICAgIGxldCBmaXJzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDApLnVuaXgoKTtcbiAgICBsZXQgbGFzdERheU9mV2VlazogbnVtYmVyID0gbW9tZW50KCkud2VlayhjdXJyV2VlaykuZGF5KDYpLnVuaXgoKTtcblxuICAgIGNvbnN0IHRvZGF5VGltZSA9IE51bWJlcihtb21lbnQoKS5zdGFydE9mKCdkYXknKS5mb3JtYXQoJ1gnKSk7XG4gICAgY29uc3QgYmVmb3JlMzBkYXlUaW1lID0gTnVtYmVyKG1vbWVudCgpLnN1YnRyYWN0KDMwLCBcImRheXNcIikuc3RhcnRPZignZGF5JykuZm9ybWF0KCdYJykpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHJlcSA9IHtcbiAgICAgICAgZGF0ZV9mcm9tOiBiZWZvcmUzMGRheVRpbWUsXG4gICAgICAgIGRhdGVfdG86IHRvZGF5VGltZVxuICAgICAgfTtcblxuICAgICAgd2ViQVBJLlJldHJpZXZlV2VpZ2h0TG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JldHJpZXZlV2VpZ2h0TG9nJywgcmVzcCk7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgbGF0ZXN0X3dlaWdodDogcmVzcC5sYXRlc3Rfd2VpZ2h0LnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IG5lYXJEYXRhQXJyOmFueSA9IFtdO1xuICAgICAgICBsZXQgdG90YWwgPSAwOy8vIOiOt+WPluS4gOS9jeWwj+aVsOeCueeahOW5s+Wdh+WAvO+8jOWFiOaxguaAu+WSjFxuICAgICAgICByZXNwLndlaWdodF9sb2dzLm1hcChpdGVtPT57XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIGl0ZW0udmFsdWVcbiAgICAgICAgICBjb25zdCBiZWZvcmVOdW1iZXJEYXkgPSAodG9kYXlUaW1lIC0gaXRlbS5kYXRlKSAvIDg2NDAwXG4gICAgICAgICAgY29uc3QgZm9ybWF0RGF0ZSA9IG1vbWVudChpdGVtLmRhdGUqMTAwMCkuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgIG5lYXJEYXRhQXJyWzMwIC0gYmVmb3JlTnVtYmVyRGF5XSA9IHsgd2VlazogZm9ybWF0RGF0ZSwgdmFsdWU6IGl0ZW0udmFsdWUsIGF2ZzogMjAwMCB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2UgPSBNYXRoLnJvdW5kKHRvdGFsKjEwIC8gcmVzcC53ZWlnaHRfbG9ncy5sZW5ndGgpLzEwXG4gICAgICAgIC8vIOeogOeWj+aVsOe7hOmcgOimgeeUqGZvcu+8jOS4jeiDveeUqG1hcOOAglxuICAgICAgICAvLyAzMOWkqeWGheeUqOaIt+esrOS4gOS4quayoeacieabtOaWsOS9k+mHjeeahOaXpeacn+i1i+WAvOS4uuS9k+mHjeW5s+Wdh+WAvO+8jOWIq+eahOaXpeacn+mDvei1i+WAvOS4um51bGxcbiAgICAgICAgbGV0IGxlbiA9IG5lYXJEYXRhQXJyLmxlbmd0aDtcbiAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDtpPGxlbjtpKyspe1xuICAgICAgICAgIGlmICghbmVhckRhdGFBcnJbaV0gJiYgZmxhZykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1vbWVudCgpLnN1YnRyYWN0KDMwLWksIFwiZGF5c1wiKS5mb3JtYXQoJ01NL0REJyk7XG4gICAgICAgICAgICBuZWFyRGF0YUFycltpXSA9IHsgd2VlazogZGF0YSwgdmFsdWU6IGF2ZXJhZ2UsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgICBmbGFnID0gZmFsc2VcbiAgICAgICAgICB9IGVsc2UgaWYgKCFuZWFyRGF0YUFycltpXSl7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbW9tZW50KCkuc3VidHJhY3QoMzAgLSBpLCBcImRheXNcIikuZm9ybWF0KCdNTS9ERCcpO1xuICAgICAgICAgICAgbmVhckRhdGFBcnJbaV0gPSB7IHdlZWs6IGRhdGEsIHZhbHVlOm51bGwsIGF2ZzogMjAwMCB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICAgICAgICBjaGFydC5jaGFuZ2VEYXRhKG5lYXJEYXRhQXJyKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bkvZPph43mlbDmja7lpLHotKUnLGVycilcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+iOt+WPluS9k+mHjeaVsOaNruWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApO1xuICB9XG5cbiAgcHVibGljIGdvV2VpZ2h0UmVjb3JkKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6Jy9wYWdlcy93ZWlnaHRSZWNvcmQvaW5kZXgnXG4gICAgfSlcbiAgfVxuICBwdWJsaWMgbG9naW4oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIC8vIOeZu+W9lVxuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICAvLyDlj5HpgIEgX3Jlcy5jb2RlIOWIsOWQjuWPsOaNouWPliBvcGVuSWQsIHNlc3Npb25LZXksIHVuaW9uSWRcbiAgICAgICAgdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nP1wiXCI6d3guc2hvd0xvYWRpbmcoeyB0aXRsZTogJ+WKoOi9veS4rS4uLicgfSk7XG4gICAgICAgIHZhciByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlIH07XG4gICAgICAgIGxvZ2luQVBJLk1pbmlQcm9ncmFtTG9naW4ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5Z0b2tlbuaIkOWKnycscmVzcCk7XG4gICAgICAgICAgdGhhdC5zaG93UGVyc29uQ2hlY2tMb2FkaW5nID8gXCJcIiA6d3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIGxldCB1c2VyU3RhdHVzID0gcmVzcC51c2VyX3N0YXR1cztcbiAgICAgICAgICAvLyB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgICAgICAgLy8gd3gucmVMYXVuY2goeyB1cmw6ICcvcGFnZXMvbG9naW4vaW5kZXgnIH0pO1xuICAgICAgICAgIHN3aXRjaCAodXNlclN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAvL3ZhbGlkYXRpb24gcGFnZVxuICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9sb2dpbi9pbmRleCcgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAvL29uQm9hcmRpbmcgcHJvY2VzcyBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogJy9wYWdlcy9vbkJvYXJkL29uQm9hcmQnIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAvL2tlZXAgaXQgYXQgaG9tZSBwYWdlXG4gICAgICAgICAgICAgIGlmIChyZXNwLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4sIHJlc3AudG9rZW4pO1xuICAgICAgICAgICAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICAgICAgICAgICAgICB0aGF0LmF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHRoYXQucmV0cmlldmVEYXRhKCk7IC8vIOiOt+WPluS9k+mHjeiusOW9lVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfpppbpobXnmbvpmYblpLHotKUnLFxuICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmFpbChlcnIpIHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgY29udGVudDogJ+mmlumhteeZu+mZhumqjOivgeWksei0pScsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBwdWJsaWMgYXV0aGVudGljYXRpb25SZXF1ZXN0KCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICB3eC5nZXRVc2VySW5mbyh7XG4gICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyA9IHJlcy51c2VySW5mb1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhaWw6IGVyciA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiAnLi4vbG9naW4vaW5kZXg/dXNlcl9zdGF0dXM9MydcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICB9XG5cbiAgcHVibGljIGdvTnV0cml0aW9uYWxEYXRhYmFzZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDonL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2luZGV4J1xuICAgIH0pXG4gIH1cbiAgLy8gcHVibGljIGxvYWRSZXBvcnRCYWRnZSgpIHtcbiAgLy8gICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gIC8vICAgY29uc29sZS5sb2codG9rZW4pO1xuICAvLyAgIGlmICh0b2tlbikge1xuICAvLyAgICAgbGV0IGN1cnJlbnREYXRlID0gbW9tZW50KCkuc3RhcnRPZignZGF5Jyk7XG4gIC8vICAgICBsZXQgZmlyc3REYXlPZldlZWsgPSBjdXJyZW50RGF0ZS53ZWVrKGN1cnJlbnREYXRlLndlZWsoKSkuZGF5KDEpLnVuaXgoKTtcbiAgLy8gICAgIGxldCBsYXN0RGF5T2ZXZWVrID0gY3VycmVudERhdGUud2VlayhjdXJyZW50RGF0ZS53ZWVrKCkpLmRheSg3KS51bml4KCk7XG4gIC8vICAgICBsZXQgcmVxID0ge1xuICAvLyAgICAgICBkYXRlX2Zyb206IGZpcnN0RGF5T2ZXZWVrLFxuICAvLyAgICAgICBkYXRlX3RvOiBsYXN0RGF5T2ZXZWVrXG4gIC8vICAgICB9O1xuICAvLyAgICAgd2ViQVBJLlJldHJpZXZlVXNlclJlcG9ydHMocmVxKS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIC8vICAgICAgIHRoaXMuY291bnRSZXBvcnRCYWRnZShyZXNwKTtcbiAgLy8gICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9XG4gIC8vIH1cblxuICBwdWJsaWMgY291bnRSZXBvcnRCYWRnZShyZXNwOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICBsZXQgcmVwb3J0TnVtID0gMDtcbiAgICBsZXQgcmVwb3J0cyA9IHJlc3AuZGFpbHlfcmVwb3J0O1xuICAgIGZvciAobGV0IGluZGV4IGluIHJlcG9ydHMpIHtcbiAgICAgIGxldCByZXBvcnQgPSByZXBvcnRzW2luZGV4XTtcbiAgICAgIGlmICghcmVwb3J0LmlzX3JlcG9ydF9nZW5lcmF0ZWQgJiYgIXJlcG9ydC5pc19mb29kX2xvZ19lbXB0eSkge1xuICAgICAgICBsZXQgdG9kYXlUaW1lID0gbW9tZW50KCkuc3RhcnRPZignZGF5JykudW5peCgpO1xuICAgICAgICBjb25zb2xlLmxvZyh0b2RheVRpbWUpO1xuICAgICAgICBpZiAocmVwb3J0LmRhdGUgPCB0b2RheVRpbWUgfHwgKHJlcG9ydC5kYXRlID09IHRvZGF5VGltZSAmJiBtb21lbnQobmV3IERhdGUoKSkuaG91cnMgPiAyMikpIHsgICAvL2NvdW50IHRvZGF5IHJlcG9ydHMgc3RhdHVzIGFmdGVyIDE5XG4gICAgICAgICAgcmVwb3J0TnVtKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlcG9ydE51bSAhPSAwKSB7XG4gICAgICB3eC5zZXRUYWJCYXJCYWRnZSh7XG4gICAgICAgIGluZGV4OiAyLFxuICAgICAgICB0ZXh0OiBTdHJpbmcocmVwb3J0TnVtKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHd4LnJlbW92ZVRhYkJhckJhZGdlKHtcbiAgICAgICAgaW5kZXg6IDJcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuLyoqXG4gKiBhcGnor7fmsYLku4rml6XmkYTlhaXph4/lkozku4rml6Xppa7po5/orrDlvZVcbiAqL1xuICBwdWJsaWMgcmV0cmlldmVGb29kRGlhcnlEYXRhKGN1cnJlbnRUaW1lU3RhbXA6IG51bWJlcikge1xuICAgIGxldCByZXE6IFJldHJpZXZlRm9vZERpYXJ5UmVxID0geyBkYXRlOiBjdXJyZW50VGltZVN0YW1wIH07XG4gICAgd2ViQVBJLlJldHJpZXZlRm9vZERpYXJ5KHJlcSkudGhlbihyZXNwID0+IHRoaXMuZm9vZERpYXJ5RGF0YVBhcnNpbmcocmVzcCkpLmNhdGNoKGVyciA9PlxuICAgIGNvbnN0IHRva2VuMSA9IHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKS8v55So5oi35Y+v6IO95rKh5pyJ55m75b2V77yM5q2k5pe25LiN5bqU5by556qXXG4gICAgICBpZiAoIXdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKSl7XG4gICAgICAgIGNvbnNvbGUubG9nKDg4ODgsIHRva2VuMSlcbiAgICAgIH1lbHNle1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn6I635Y+W5pel5b+X5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgcmV0cmlldmVNZWFsTG9nKG1lYWxJZDogbnVtYmVyKSB7XG4gICAgbGV0IHJlcTogUmV0cmlldmVNZWFsTG9nUmVxID0geyBtZWFsX2lkOiBtZWFsSWQgfVxuICAgIHJldHVybiB3ZWJBUEkuUmV0cmlldmVNZWFsTG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlTWVhbExvZyhyZXNwKTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgY29udGVudDogJ+iOt+WPlumjn+eJqeaVsOaNruWksei0pScsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICB9KVxuICAgIH1cbiAgICApO1xuICB9XG4gIHB1YmxpYyBwYXJzZU1lYWxMb2cocmVzcDogTWVhbExvZ1Jlc3ApIHtcbiAgICBsZXQgZm9vZExpc3Q6IEZvb2RbXSA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4IGluIHJlc3AuZm9vZF9sb2cpIHtcbiAgICAgIGxldCBmb29kTG9nOiBGb29kTG9nSW5mbyA9IHJlc3AuZm9vZF9sb2dbaW5kZXhdO1xuICAgICAgbGV0IHVuaXRPYmogPSBmb29kTG9nLnVuaXRfb3B0aW9uLmZpbmQobyA9PiBvLnVuaXRfaWQgPT09IGZvb2RMb2cudW5pdF9pZCk7XG4gICAgICBsZXQgdW5pdE5hbWUgPSBcIuS7vVwiXG4gICAgICBpZiAodW5pdE9iaikge1xuICAgICAgICB1bml0TmFtZSA9IHVuaXRPYmoudW5pdF9uYW1lO1xuICAgICAgfVxuICAgICAgbGV0IGZvb2Q6IEZvb2QgPSB7XG4gICAgICAgIGZvb2ROYW1lOiBmb29kTG9nLmZvb2RfbmFtZSxcbiAgICAgICAgZW5lcmd5OiBNYXRoLmZsb29yKGZvb2RMb2cuZW5lcmd5IC8gMTAwKSxcbiAgICAgICAgdW5pdE5hbWU6IHVuaXROYW1lLFxuICAgICAgICB3ZWlnaHQ6IE1hdGgucm91bmQoZm9vZExvZy53ZWlnaHQgLyAxMDApXG4gICAgICB9XG4gICAgICBmb29kTGlzdC5wdXNoKGZvb2QpXG4gICAgfVxuICAgIHJldHVybiBmb29kTGlzdFxuICB9XG4gIHB1YmxpYyBsb2FkTWVhbFN1bW1hcnkocmVzcDogUmV0cmlldmVGb29kRGlhcnlSZXNwKSB7XG4gICAgbGV0IGJyZWFrZmFzdDogTWVhbDtcbiAgICBsZXQgYnJlYWtmYXN0U3VtbWFyeTogRm9vZFtdID0gW107XG4gICAgbGV0IGJyZWFrZmFzdElkczogbnVtYmVyW10gPSBbXSAvL+W+l+WIsOaXqemkkG1hZWxfaWTmlbDnu4RcbiAgICByZXNwLmJyZWFrZmFzdC5mb3JFYWNoKChpdGVtID0+YnJlYWtmYXN0SWRzLnB1c2goaXRlbS5tZWFsX2lkKSkpXG4gICAgY29uc3QgYnJlYWtmYXN0UHJvbXMgPSBQcm9taXNlLmFsbChicmVha2Zhc3RJZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKCBpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGJyZWFrZmFzdFN1bW1hcnkucHVzaCguLi5jaGFuZ2VkTGlzdCk7IC8vIGJyZWFrZmFzdFN1bW1hcnnkuK3ojrflvpfml6nppJDkuIDlhbHlkIPkuoblpJrlsJHpo5/nianvvIzkuI3liIblm77niYdcbiAgICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7Ly8g5q+P5Liqc3Vt5Luj6KGo5LiA5byg5Zu+5pyJ5aSa5bCR5Y2h6Lev6YeMXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5icmVha2Zhc3RbaW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3J9KVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ21lYWxzJyxyZXNwLmJyZWFrZmFzdClcbiAgICAgICAgcmV0dXJuIGJyZWFrZmFzdCA9IHtcbiAgICAgICAgICBtZWFsSWQ6IDAsXG4gICAgICAgICAgbWVhbE5hbWU6ICfml6nppJAnLFxuICAgICAgICAgIG1lYWxFbmdyeTogTWF0aC5mbG9vcihyZXNwLmJyZWFrZmFzdF9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmJyZWFrZmFzdF9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmJyZWFrZmFzdF9zdWdnZXN0aW9uLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgbWVhbHM6IHJlc3AuYnJlYWtmYXN0LFxuICAgICAgICAgIG1lYWxTdW1tYXJ5OiBicmVha2Zhc3RTdW1tYXJ5LFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgLy9sdW5jaFxuICAgIGxldCBsdW5jaDogTWVhbDtcbiAgICBsZXQgbHVuY2hTdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgICBsZXQgbHVuY2hJZHM6IG51bWJlcltdID0gW11cbiAgICByZXNwLmx1bmNoLmZvckVhY2goKGl0ZW0gPT5sdW5jaElkcy5wdXNoKGl0ZW0ubWVhbF9pZCkpKTtcbiAgICBjb25zdCBsdW5jaFByb21zID0gUHJvbWlzZS5hbGwobHVuY2hJZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gICAgICAgICAgbHVuY2hTdW1tYXJ5LnB1c2goLi4uY2hhbmdlZExpc3QpO1xuICAgICAgICAgIGxldCBzdW0gPSBsaXN0LnJlZHVjZSgocHJlLCBjdXIpID0+IHsvLyDmr4/kuKpzdW3ku6PooajkuIDlvKDlm77mnInlpJrlsJHljaHot6/ph4xcbiAgICAgICAgICAgIHJldHVybiBjdXIuZW5lcmd5ICsgcHJlXG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwLmx1bmNoW2luZGV4XSwgeyBpbWdfZW5ncnk6IHN1bSB9LCB7IHRpcF9jb2xvcjogdGlwX2NvbG9yIH0pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbHVuY2ggPSB7XG4gICAgICAgICAgbWVhbElkOiAxLFxuICAgICAgICAgIG1lYWxOYW1lOiAn5Y2I6aSQJyxcbiAgICAgICAgICBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5sdW5jaF9zdWdnZXN0aW9uLmVuZXJneV9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIHN1Z2dlc3RlZEludGFrZTogTWF0aC5mbG9vcihyZXNwLmx1bmNoX3N1Z2dlc3Rpb24uc3VnZ2VzdGVkX2ludGFrZSAvIDEwMCksXG4gICAgICAgICAgbWVhbFBlcmNlbnRhZ2U6IHJlc3AubHVuY2hfc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmx1bmNoLFxuICAgICAgICAgIG1lYWxTdW1tYXJ5OiBsdW5jaFN1bW1hcnlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIC8vZGlubmVyXG4gICAgbGV0IGRpbm5lcjogTWVhbDtcbiAgICBsZXQgZGlubmVyU3VtbWFyeTogRm9vZFtdID0gW107XG4gICAgbGV0IGRpbm5lcklkczogbnVtYmVyW10gPSBbXVxuICAgIHJlc3AuZGlubmVyLmZvckVhY2goKGl0ZW0gPT5kaW5uZXJJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gICAgY29uc3QgZGlubmVyUHJvbXMgPSBQcm9taXNlLmFsbChkaW5uZXJJZHMubWFwKGlkID0+IHRoaXMucmV0cmlldmVNZWFsTG9nKGlkKSkpLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICByZXN1bHQubWFwKChsaXN0LGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGlwX2NvbG9yID0gdGhhdC5mb29kQ29sb3JUaXBzQXJyO1xuICAgICAgICAgIGxldCBjaGFuZ2VkTGlzdCA9IGxpc3QubWFwKGl0ZW0gPT4gaXRlbSA9IE9iamVjdC5hc3NpZ24oaXRlbSwgeyB0aXBfY29sb3I6IHRpcF9jb2xvcltpbmRleF0gfSkpXG4gICAgICAgICAgZGlubmVyU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7Ly8g5q+P5Liqc3Vt5Luj6KGo5LiA5byg5Zu+5pyJ5aSa5bCR5Y2h6Lev6YeMXG4gICAgICAgICAgICByZXR1cm4gY3VyLmVuZXJneSArIHByZVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcC5kaW5uZXJbaW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3J9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRpbm5lciA9IHtcbiAgICAgICAgICBtZWFsSWQ6IDIsXG4gICAgICAgICAgbWVhbE5hbWU6ICfmmZrppJAnLCBtZWFsRW5ncnk6IE1hdGguZmxvb3IocmVzcC5kaW5uZXJfc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5kaW5uZXJfc3VnZ2VzdGlvbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBtZWFsUGVyY2VudGFnZTogcmVzcC5kaW5uZXJfc3VnZ2VzdGlvbi5wZXJjZW50YWdlLFxuICAgICAgICAgIG1lYWxzOiByZXNwLmRpbm5lcixcbiAgICAgICAgICBtZWFsU3VtbWFyeTogZGlubmVyU3VtbWFyeVxuICAgICAgICB9O1xuXG4gICAgICB9KTtcbiAgICAvL2FkZGl0aW9uYWxcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGxldCBhZGRpdGlvbjogTWVhbDtcbiAgICBsZXQgYWRkaXRpb25TdW1tYXJ5OiBGb29kW10gPSBbXTtcbiAgICBsZXQgYWRkaXRpb25JZHM6IG51bWJlcltdID0gW11cbiAgICByZXNwLmFkZGl0aW9uLmZvckVhY2goKGl0ZW0gPT5kaW5uZXJJZHMucHVzaChpdGVtLm1lYWxfaWQpKSk7XG4gICAgY29uc3QgYWRkaXRpb25Qcm9tcyA9IFByb21pc2UuYWxsKGFkZGl0aW9uSWRzLm1hcChpZCA9PiB0aGlzLnJldHJpZXZlTWVhbExvZyhpZCkpKS50aGVuKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0Lm1hcCgobGlzdCxpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpcF9jb2xvciA9IHRoYXQuZm9vZENvbG9yVGlwc0FycjtcbiAgICAgICAgICBsZXQgY2hhbmdlZExpc3QgPSBsaXN0Lm1hcChpdGVtID0+IGl0ZW0gPSBPYmplY3QuYXNzaWduKGl0ZW0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3JbaW5kZXhdIH0pKVxuICAgICAgICAgIGFkZGl0aW9uU3VtbWFyeS5wdXNoKC4uLmNoYW5nZWRMaXN0KTtcbiAgICAgICAgICBsZXQgc3VtID0gbGlzdC5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7ICAvL+iuoeeul+WHuuavj+W8oOWbvueahOiDvemHj++8jOW5tua3u+WKoOi/m+WvueixoVxuICAgICAgICAgICAgcmV0dXJuIGN1ci5lbmVyZ3kgKyBwcmVcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3AuYWRkaXRpb25baW5kZXhdLCB7IGltZ19lbmdyeTogc3VtIH0sIHsgdGlwX2NvbG9yOiB0aXBfY29sb3J9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFkZGl0aW9uID0ge1xuICAgICAgICAgIG1lYWxJZDogMyxcbiAgICAgICAgICBtZWFsTmFtZTogJ+WKoOmkkCcsXG4gICAgICAgICAgbWVhbEVuZ3J5OiBNYXRoLmZsb29yKHJlc3AuYWRkaXRpb25fc3VnZ2VzdGlvbi5lbmVyZ3lfaW50YWtlIC8gMTAwKSxcbiAgICAgICAgICBzdWdnZXN0ZWRJbnRha2U6IE1hdGguZmxvb3IocmVzcC5hZGRpdGlvbl9zdWdnZXN0aW9uLnN1Z2dlc3RlZF9pbnRha2UgLyAxMDApLFxuICAgICAgICAgIG1lYWxQZXJjZW50YWdlOiByZXNwLmFkZGl0aW9uX3N1Z2dlc3Rpb24ucGVyY2VudGFnZSxcbiAgICAgICAgICBtZWFsczogcmVzcC5hZGRpdGlvbixcbiAgICAgICAgICBtZWFsU3VtbWFyeTogYWRkaXRpb25TdW1tYXJ5XG4gICAgICAgIH07XG5cbiAgICAgIH0pO1xuICAgIGxldCBtZWFsTGlzdDogTWVhbFtdID0gW11cbiAgICBQcm9taXNlLmFsbChbYnJlYWtmYXN0UHJvbXMsIGx1bmNoUHJvbXMsIGRpbm5lclByb21zXSkudGhlbihcbiAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5tYXAobWVhbCA9PiBtZWFsTGlzdC5wdXNoKG1lYWwpKTtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICBtZWFsTGlzdDogbWVhbExpc3QsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgKTtcblxuICB9XG5cbi8qKlxuICog6Kej5p6Q6I635Y+W5LuK5pel5pGE5YWl6YeP5p2/5Z2X55qE5pWw5o2uXG4gKi9cbiAgcHVibGljIGZvb2REaWFyeURhdGFQYXJzaW5nKHJlc3A6IFJldHJpZXZlRm9vZERpYXJ5UmVzcCkge1xuICAgIGNvbnNvbGUubG9nKFwic3VtbWFyeVwiLCByZXNwKTtcbiAgICBsZXQgc2NvcmUgPSByZXNwLnNjb3JlO1xuICAgIGxldCBlbmVyZ3kgPSByZXNwLmRhaWx5X2ludGFrZS5lbmVyZ3k7XG4gICAgbGV0IHByb3RlaW4gPSByZXNwLmRhaWx5X2ludGFrZS5wcm90ZWluO1xuICAgIGxldCBjYXJib2h5ZHJhdGUgPSByZXNwLmRhaWx5X2ludGFrZS5jYXJib2h5ZHJhdGU7XG4gICAgbGV0IGZhdCA9IHJlc3AuZGFpbHlfaW50YWtlLmZhdDtcbiAgICBsZXQgbnV0cmllbnRTdW1tYXJ5ID0gW1xuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIueDremHj1wiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGVuZXJneS5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihlbmVyZ3kuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGVuZXJneS5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLljYPljaFcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuiEguiCqlwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGZhdC5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihmYXQuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGZhdC5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIueis+awtOWMluWQiOeJqVwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IGNhcmJvaHlkcmF0ZS5wZXJjZW50YWdlLCBpbnRha2VuX251bTogTWF0aC5mbG9vcihjYXJib2h5ZHJhdGUuaW50YWtlIC8gMTAwKSwgdG90YWxfbnVtOiBNYXRoLmZsb29yKGNhcmJvaHlkcmF0ZS5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9LFxuICAgICAgeyBudXRyaWVudF9uYW1lOiBcIuibi+eZvei0qFwiLCBpbnRha2VuX3BlcmNlbnRhZ2U6IHByb3RlaW4ucGVyY2VudGFnZSwgaW50YWtlbl9udW06IE1hdGguZmxvb3IocHJvdGVpbi5pbnRha2UgLyAxMDApLCB0b3RhbF9udW06IE1hdGguZmxvb3IocHJvdGVpbi5zdWdnZXN0ZWRfaW50YWtlIC8gMTAwKSwgdW5pdDogXCLlhYtcIiB9XG4gICAgXVxuXG4gICAgdGhpcy5sb2FkTWVhbFN1bW1hcnkocmVzcCk7XG4gICAgLy8gbGV0IG1lYWxMaXN0ID0gW2JyZWFrZmFzdCwgbHVuY2gsIGRpbm5lciwgYWRkaXRpb25hbF07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG51dHJpZW50U3VtbWFyeTogbnV0cmllbnRTdW1tYXJ5LFxuICAgICAgc2NvcmU6IHNjb3JlXG4gICAgfSwoKT0+e1xuICAgICAgbnV0cmllbnRTdW1tYXJ5Lm1hcCgoaXRlbSxpbmRleCk9PntcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZWxlY3RDb21wb25lbnQoYCNjaXJjbGUke2luZGV4fWApLmRyYXdDaXJjbGUoYGNhbnZhc2AsIDc1LCA0LCBpdGVtLmludGFrZW5fcGVyY2VudGFnZS8xMDAgKiAyKVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZE5hdmlUb090aGVyTWluaUFwcCgpIHtcbiAgICAvL3Rlc3Qgb24gbmF2aWdhdGUgbWluaVByb2dyYW1cbiAgICB3eC5uYXZpZ2F0ZVRvTWluaVByb2dyYW0oe1xuICAgICAgYXBwSWQ6ICd3eDRiNzQyMjhiYWExNTQ4OWEnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBlbnZWZXJzaW9uOiAnZGV2ZWxvcCcsXG4gICAgICBzdWNjZXNzKHJlczogYW55KSB7XG4gICAgICAgIC8vIOaJk+W8gOaIkOWKn1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Y2NjZXNzIG5hdmlnYXRlXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHB1YmxpYyB0cmlnZ2VyQmluZGdldGRhdGUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNlbGVjdENvbXBvbmVudCgnI2NhbGVuZGFyJykuZGF0ZVNlbGVjdGlvbigpXG4gIH1cblxuICAvL3doZW4gb3Blbm5pbmcgdGhlIGNhbGVuZGFyXG4gIHB1YmxpYyBiaW5kc2VsZWN0KGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gIH1cblxuICAvL3doZW4gdXNlciBzZWxlY3QgZGF0ZVxuICBwdWJsaWMgYmluZGdldGRhdGUoZXZlbnQ6IGFueSkge1xuICAgIFxuICAgIC8vQ29udmVydCBkYXRlIHRvIHVuaXggdGltZXN0YW1wXG4gICAgbGV0IHRpbWUgPSBldmVudC5kZXRhaWw7XG4gICAgY29uc3QgbmF2VGl0bGVUaW1lID0gdGltZS55ZWFyICsgJy8nICsgdGltZS5tb250aCArICcvJyArIHRpbWUuZGF0ZTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbmF2VGl0bGVUaW1lOiBuYXZUaXRsZVRpbWVcbiAgICB9KVxuICAgIGxldCBkYXRlID0gbW9tZW50KFt0aW1lLnllYXIsIHRpbWUubW9udGggLSAxLCB0aW1lLmRhdGVdKTsgLy8gTW9tZW50IG1vbnRoIGlzIHNoaWZ0ZWQgbGVmdCBieSAxXG4gICAgLy9nZXQgY3VycmVudCB0aW1lc3RhbXBcbiAgICB0aGlzLm1lYWxEYXRlID0gZGF0ZS51bml4KCk7XG4gICAgY29uc3QgdG9kYXlUaW1lU3RhbXAgPSBtb21lbnQobmV3IERhdGUoKSk7XG4gICAgaWYgKHRvZGF5VGltZVN0YW1wLmlzU2FtZShkYXRlLCdkJykpe1xuICAgICAgY29uc29sZS5sb2coJ+mAieaLqeeahOaXpeacn+aYr+S7iuWkqScpO1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBuYXZUaXRsZVRpbWU6ICfku4rml6UnXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAvL+S7luS7rOS4jeaYr+WcqOWQjOS4gOWkqVxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbmF2VGl0bGVUaW1lOiBuYXZUaXRsZVRpbWVcbiAgICAgIH0pXG4gICAgfSBcbiAgICAvL3JlcXVlc3QgQVBJXG4gICAgdGhpcy5yZXRyaWV2ZUZvb2REaWFyeURhdGEodGhpcy5tZWFsRGF0ZSk7XG4gICAgLy9sZXQgdGltZURhdGEgPSB0aW1lLnllYXIgKyBcIi1cIiArIHRpbWUubW9udGggKyBcIi1cIiArIHRpbWUuZGF0ZTtcbiAgfVxuICBwdWJsaWMgb25EYWlseVJlcG9ydENsaWNrKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnJldHJpZXZlRGFpbHlSZXBvcnQodGhpcy5tZWFsRGF0ZSk7XG4gIH1cbiAgcHVibGljIHJldHJpZXZlRGFpbHlSZXBvcnQoY3VycmVudFRpbWVTdGFtcDogbnVtYmVyKSB7XG4gICAgbGV0IHJlcTogUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnRSZXEgPSB7IGRhdGU6IGN1cnJlbnRUaW1lU3RhbXAgfTtcbiAgICB3ZWJBUEkuUmV0cmlldmVPckNyZWF0ZVVzZXJSZXBvcnQocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgbGV0IHJlcG9ydFVybDogc3RyaW5nID0gcmVzcC5yZXBvcnRfdXJsO1xuICAgICAgaWYgKHJlcG9ydFVybCAmJiByZXBvcnRVcmwgIT0gXCJcIikge1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiBcIi9wYWdlcy9yZXBvcnRQYWdlL3JlcG9ydFBhZ2U/dXJsPVwiICsgcmVwb3J0VXJsIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICBjb250ZW50OiBcIuivt+a3u+WKoOW9k+Wkqemjn+eJqeiusOW9lVwiLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpXG4gIH1cblxuXG5cbiAgcHVibGljIGFkZEZvb2RJbWFnZShldmVudDogYW55KSB7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoaXMubWVhbFR5cGUgPSBtZWFsSW5kZXggKyAxO1xuICAgIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgICBpdGVtTGlzdDogWyfmi43nhaforrDlvZUnLCAn55u45YaMJywgJ+aWh+Wtl+aQnOe0oiddLFxuICAgICAgc3VjY2VzcyhyZXM6IGFueSkge1xuICAgICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgICAgIHNvdXJjZXR5cGU6ICdjYW1lcmEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7XG4gICAgICAgICAgICAgIHNvdXJjZXR5cGU6ICdhbGJ1bScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLm1lYWxOYW1lICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0Jywge1xuICAgICAgICAgICAgICBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgY2hvb3NlSW1hZ2Uoc291cmNlVHlwZTogc3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgc2l6ZVR5cGU6IFsnb3JpZ2luYWwnLCAnY29tcHJlc3NlZCddLFxuICAgICAgc291cmNlVHlwZTogW3NvdXJjZVR5cGVdLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlczogYW55KSB7XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5LiK5Lyg5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgICAgIHRoYXQuc2hvd1BlcnNvbkNoZWNrTG9hZGluZyA9IHRydWU7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXTtcbiAgICAgICAgdGhhdC5wYXRoID0gaW1hZ2VQYXRoO1xuICAgICAgICB1cGxvYWRGaWxlKGltYWdlUGF0aCwgdGhhdC5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhhdC5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGF0Lm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIDAsIDApO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRTdWNjZXNzKCl7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRTdWNlc3NcIiArIHRoaXMubWVhbFR5cGUgKyBcIixcIiArIHRoaXMubWVhbERhdGUpO1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi8uLi8uLi9ob21lU3ViL3BhZ2VzL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KXtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxuXG4gIHB1YmxpYyBuYXZpVG9Gb29kRGV0YWlsKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zdCBkZWZhdWx0SW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW1hZ2VJbmRleDtcbiAgICBsZXQgbWVhbElkID0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0ubWVhbHNbaW1hZ2VJbmRleF0ubWVhbF9pZDtcbiAgICBsZXQgaW1hZ2VLZXkgPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsc1tpbWFnZUluZGV4XS5pbWdfa2V5O1xuICAgIGxldCBpbWFnZVVybCA9IGltYWdlS2V5ID09IFwiXCIgPyBkZWZhdWx0SW1hZ2VVcmwgOiBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvXCIgKyB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5tZWFsc1tpbWFnZUluZGV4XS5pbWdfa2V5O1xuICAgIGxldCBwYXJhbSA9IHt9O1xuICAgIHBhcmFtLm1lYWxJZCA9IG1lYWxJZDtcbiAgICBwYXJhbS5pbWFnZVVybCA9IGltYWdlVXJsO1xuICAgIHBhcmFtLnNob3dEZWxldGVCdG4gPSB0cnVlO1xuICAgIHBhcmFtLnNob3dTaGFyZUJ0biA9IGltYWdlS2V5ICE9IFwiXCI7XG4gICAgbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIvcGFnZXMvZm9vZERldGFpbC9pbmRleD9wYXJhbUpzb249XCIgKyBwYXJhbUpzb25cbiAgICB9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGlhcnlQYWdlKCkpXG4iXX0=