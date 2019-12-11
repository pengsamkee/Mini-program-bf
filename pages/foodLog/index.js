"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promiseAPI_1 = require("../../api/promiseAPI");
var webAPI = require("../../api/app/AppService");
var uploadFile = require("../../api/uploader");
var wxCharts = require("../../utils/wxcharts");
var globalEnum = require("../../api/GlobalEnum");
var Report = (function () {
    function Report() {
        this.data = {
            mealList: [
                {
                    foodDescId: 0,
                    mealTypeId: 1,
                    mealType: "早餐",
                    skipMealText: "没吃早餐",
                    hint: "例子:白煮鸡蛋，两只, 只吃了蛋白； 纯牛奶， 一盒，200ml。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: false
                },
                {
                    foodDescId: 0,
                    mealTypeId: 2,
                    mealType: "加餐",
                    skipMealText: "没有加餐",
                    hint: "例子:葡萄，巨峰, 10粒；苏打饼干，3片。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: true
                },
                {
                    foodDescId: 0,
                    mealTypeId: 3,
                    mealType: "午餐",
                    skipMealText: "没吃午餐",
                    hint: "例子:米饭，普通饭碗三两，只吃了一半； 银鲳鱼，半斤，鱼头鱼尾没有吃。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: false
                },
                {
                    foodDescId: 0,
                    mealTypeId: 4,
                    mealType: "加餐",
                    skipMealText: "没有加餐",
                    hint: "全麦土司面包，2片； 花生酱，一勺。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: true
                },
                {
                    foodDescId: 0,
                    mealTypeId: 5,
                    mealType: "晚餐",
                    skipMealText: "没吃晚餐",
                    hint: "拌黄瓜，一小盘，约一根黄瓜；红烧牛肉面，一大碗，口味偏咸。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: false
                },
                {
                    foodDescId: 0,
                    mealTypeId: 6,
                    mealType: "加餐",
                    skipMealText: "没有加餐",
                    hint: "燕麦片，无糖，3大勺；南瓜子，一小把，约20克。",
                    mealIcon: "",
                    imageList: [],
                    textDesc: "",
                    isShowTextArea: false,
                    isSkip: true
                }
            ],
            scrollHeight: 0,
            completedFlag: false,
            reportStatus: 0,
            showModal: false,
            textAreaTxt: "",
            currentInputMealIndex: -1,
            refreshing: false
        };
    }
    Report.prototype.onTabItemTap = function (item) {
        wx.reportAnalytics('switch_tab', {
            tab_index: item.index,
            tab_pagepath: item.pagePath,
            tab_text: item.text
        });
    };
    Report.prototype.onPullDownRefresh = function () {
        console.log("on pullDown refresh");
        this.getFoodDescData();
    };
    Report.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        this.getFoodDescData();
    };
    Report.prototype.getFoodDescData = function () {
        var _this = this;
        this.setData({
            refreshing: true,
        });
        var reportId = wx.getStorageSync(globalEnum.globalKey_reportId);
        var req = { report_id: reportId };
        var that = this;
        var mealList = [];
        wx.showLoading({ title: "加载中...", mask: true });
        webAPI.GetSelfFoodDesc(req).then(function (resp) {
            wx.hideLoading({});
            console.log(resp);
            console.log("report status:" + resp.status);
            for (var i in resp.food_desc_info) {
                var meal = _this.mealDataParsing(resp.food_desc_info[i]);
                mealList.push(meal);
            }
            that.setData({
                mealList: mealList,
                reportStatus: resp.status
            });
            if (resp.status >= 2) {
                _this.setUpScollerHeight(100);
            }
            else {
                _this.setUpScollerHeight(150);
            }
            for (var i = 0; i < 6; i++) {
                _this.updateChartStatus(i);
            }
            that.setData({
                refreshing: false,
            });
        }).catch(function (err) { return wx.hideLoading({}); });
    };
    Report.prototype.naviToReportPage = function () {
        wx.switchTab({ url: '/pages/report/index' });
    };
    Report.prototype.createNewReport = function () {
        var that = this;
        wx.showLoading({ title: "新建报告中..." });
        webAPI.CreateReport({}).then(function (resp) {
            wx.hideLoading({});
            var reportId = resp.report_id;
            console.log("reportId:" + reportId);
            wx.setStorageSync(globalEnum.globalKey_reportId, reportId);
            that.getFoodDescData();
        }).catch(function (err) { return wx.hideLoading({}); });
    };
    Report.prototype.onVoiceInputReminder = function () {
        wx.showModal({
            title: "",
            content: "使用键盘上的语音输入，更加便捷哦～～",
            showCancel: false
        });
    };
    Report.prototype.mealDataParsing = function (resp) {
        console.log(resp.meal_type);
        var meal = {};
        meal.mealTypeId = resp.meal_type;
        meal.hint = this.data.mealList[resp.meal_type - 1].hint;
        meal.skipMealText = this.data.mealList[resp.meal_type - 1].skipMealText;
        switch (resp.meal_type) {
            case 1:
                meal.mealType = "早餐";
                break;
            case 3:
                meal.mealType = "午餐";
                break;
            case 5:
                meal.mealType = "晚餐";
                break;
            default:
                meal.mealType = "加餐";
        }
        meal.foodDescId = resp.food_desc_id;
        meal.textDesc = resp.text_desc;
        meal.isShowTextArea = resp.text_desc !== "";
        meal.isSkip = resp.is_skipped;
        meal.imageList = [];
        for (var index in resp.image_key) {
            var imageEntity = {
                imageUrl: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/" + resp.image_key[index],
                isUploading: false,
                isUploadFailed: false,
                uploadPercentage: 0
            };
            meal.imageList.push(imageEntity);
        }
        return meal;
    };
    Report.prototype.getReportStatus = function () {
        var reportId = wx.getStorageSync(globalEnum.globalKey_reportId);
        var req = {
            report_id: reportId
        };
        webAPI.GetReportStatus(req).then(function (resp) {
            console.log("report status:" + resp.status);
        }).catch(function (err) { return console.log(err); });
    };
    Report.prototype.onSubmitBtnPressed = function () {
        var that = this;
        wx.showLoading({ title: "加载中...", mask: true });
        webAPI.GetSelfProfile({}).then(function (resp) {
            console.log(resp);
            wx.hideLoading({});
            if (!that.onCheckProfileValue(resp)) {
                return;
            }
            var genderArray = ['男', '女'];
            var pregnancyStatusArray = ['备孕', '已孕', '哺乳期'];
            var activityLevelArray = ['卧床休息', '轻度,静坐少动', '中度,常常站立走动', '重度,负重'];
            var currentWeightText = "CM";
            var pregnancyWeekText = "";
            if (resp.pregnancy_stage == 2) {
                currentWeightText = "CM\n体重:" + resp.weight_pregnancy + 'KG';
            }
            else if (resp.pregnancy_stage == 1) {
                currentWeightText = "CM\n体重:" + resp.weight_pregnancy + 'KG';
                pregnancyWeekText = "\n孕周:" + resp.pregnancy;
            }
            wx.showModal({
                title: "",
                content: "确认提交？提交之后将不能再修改饮食日记和个人信息。\n您的个人信息:\n性别:" + genderArray[resp.gender] + "\n出生年份:" + resp.birthday + "\n怀孕情况:" + pregnancyStatusArray[resp.pregnancy_stage] + pregnancyWeekText + "\n身高:" + resp.height + currentWeightText + "\n孕前体重:" + resp.weight + "KG\n日常运动量:" + activityLevelArray[resp.activity_level] + "\n本次报告将基于以上信息生成",
                showCancel: true,
                success: function (res) {
                    if (res.confirm) {
                        that.onSubmitConfirmation();
                        wx.reportAnalytics('submission_confirmation', {});
                    }
                    else if (res.cancel) {
                        console.log('用户取消提交');
                        wx.reportAnalytics('submission_cancel', {});
                    }
                }
            });
        }).catch(function (err) { return wx.hideLoading({}); });
        wx.reportAnalytics('on_submit_btn_click', {});
    };
    Report.prototype.onCheckProfileValue = function (resp) {
        if (resp.height < 106 || resp.height > 220 || resp.weigth < 30 || resp.weigth > 150 || resp.pregnancy_stage == -1 || resp.activity_level == -1) {
            wx.showModal({
                title: "",
                content: "请完善您的个人信息后再提交",
                showCancel: false,
                success: function () {
                    wx.switchTab({ url: '/pages/portfolio/index' });
                }
            });
            return false;
        }
        if (resp.pregnancy_stage == 2) {
            if (resp.weight_pregnancy < 30 || resp.weight_pregnancy > 150) {
                wx.showModal({
                    title: "",
                    content: "请完善您的个人信息后再提交",
                    showCancel: false,
                    success: function () {
                        wx.switchTab({ url: '/pages/portfolio/index' });
                    }
                });
                return false;
            }
        }
        else if (resp.pregnancy_stage == 1) {
            if (resp.pregnancy > 45) {
                wx.showModal({
                    title: "",
                    content: "请完善您的个人信息后再提交",
                    showCancel: false,
                    success: function () {
                        wx.switchTab({ url: '/pages/portfolio/index' });
                    }
                });
                return false;
            }
        }
        return true;
    };
    Report.prototype.onSubmitConfirmation = function () {
        var that = this;
        var reportId = wx.getStorageSync(globalEnum.globalKey_reportId);
        var req = {
            report_id: reportId
        };
        webAPI.SubmitReport(req).then(function (resp) {
            console.log("submit report successfully");
            console.log(resp);
            that.setData({
                reportStatus: resp.status
            });
            that.setUpScollerHeight(100);
        }).catch(function (err) {
            return wx.showModal({
                title: "",
                content: String(err.message),
                showCancel: false,
                success: function () {
                    wx.switchTab({ url: '/pages/portfolio/index' });
                    wx.reportAnalytics('submission_reminder', {
                        err_msg: err.message,
                    });
                }
            });
        });
    };
    Report.prototype.updateFoodLog = function (index) {
        var req = this.generateFoodReqReqBody(index);
        webAPI.UpdateSelfFoodDesc(req).then(function (resp) {
            console.log("update food desc successfully");
        }).catch(function (err) {
            return wx.showModal({
                title: '更新日记失败',
                content: String(err),
                showCancel: false
            });
        });
    };
    Report.prototype.generateFoodReqReqBody = function (index) {
        var foodEntity = this.data.mealList[index];
        var imageKeys = [];
        for (var index_1 in foodEntity.imageList) {
            var imageUrl = String(foodEntity.imageList[index_1].imageUrl);
            var isUploading = foodEntity.imageList[index_1].isUploading;
            var isUploadFailed = foodEntity.imageList[index_1].isUploadFailed;
            var imageKey = imageUrl.substring(imageUrl.lastIndexOf("/") + 1, imageUrl.length);
            console.log(imageKey);
            if (!isUploading && !isUploadFailed) {
                imageKeys.push(imageKey);
            }
        }
        var foodDescReqBody = {
            food_desc_id: foodEntity.foodDescId,
            meal_type: foodEntity.mealTypeId,
            text_desc: foodEntity.textDesc,
            is_skipped: foodEntity.isSkip,
            image_key: imageKeys
        };
        return foodDescReqBody;
    };
    Report.prototype.onShow = function () {
    };
    Report.prototype.onReady = function () {
        this.initRing('ringCanvas');
        for (var i = 0; i < 6; i++) {
            this.updateChartStatus(i);
        }
    };
    Report.prototype.setUpScollerHeight = function (topHeight) {
        var windowHeight = wx.getSystemInfoSync().windowHeight;
        var scrollHeight = windowHeight - topHeight;
        this.setData({
            scrollHeight: scrollHeight
        });
    };
    Report.prototype.initRing = function (canvasId) {
        var that = this;
        this.ringChart = new wxCharts({
            animation: true,
            canvasId: canvasId,
            type: 'ring',
            extra: {
                ringWidth: 25,
                pie: {
                    offsetAngle: -138.5,
                }
            },
            title: {
                name: '',
                color: '#7cb5ec',
                fontSize: 25
            },
            subtitle: {
                name: '完成度',
                color: '#666666',
                fontSize: 14
            },
            series: [{
                    name: '早餐',
                    fromat: '早餐',
                    data: 105,
                    color: '#ffffff',
                    stroke: true
                }, {
                    name: '加餐',
                    data: 15,
                    color: '#ffffff',
                    stroke: true
                }, {
                    name: '午餐',
                    data: 105,
                    color: '#ffffff',
                    stroke: true
                }, {
                    name: '加餐',
                    data: 15,
                    color: '#ffffff',
                    stroke: true
                }, {
                    name: '晚餐',
                    data: 105,
                    color: '#ffffff',
                    stroke: true
                }, {
                    name: '加餐',
                    data: 15,
                    color: '#ffffff',
                    stroke: true
                }],
            disablePieStroke: false,
            width: 160,
            height: 160,
            dataLabel: false,
            legend: false,
            background: '#f5f5f5',
            padding: 10
        });
        this.ringChart.addEventListener('renderComplete', function () {
        });
        setTimeout(function () {
            that.ringChart.stopAnimation();
        }, 500);
        for (var index in this.data.mealList) {
            this.updateChartStatus(index);
        }
    };
    Report.prototype.toogleMeal = function (event) {
        var _a;
        var that = this;
        var index = event.currentTarget.dataset.mealIndex;
        var skipOperation = 'mealList[' + index + '].isSkip';
        if (that.data.mealList[index].isSkip) {
            wx.reportAnalytics('on_meal_skip', {
                meal: index,
            });
        }
        else {
            wx.reportAnalytics('on_meal_open', {
                meal: index,
            });
        }
        that.setData((_a = {},
            _a[skipOperation] = !that.data.mealList[index].isSkip,
            _a));
        this.updateChartStatus(index);
        this.updateFoodLog(index);
    };
    Report.prototype.addFoodImage = function (event) {
        var _this = this;
        var that = this;
        var index = event.currentTarget.dataset.mealIndex;
        var countNum = 3 - that.data.mealList[index].imageList.length;
        promiseAPI_1.chooseImage({ count: countNum, sizeType: ['original', 'compressed'] })
            .then(function (res) {
            return Promise.resolve(res);
        }, function (err) {
            return Promise.reject(err);
        })
            .then(function (data) {
            var _a;
            console.log(data);
            var loopCounts = Math.min(data.tempFilePaths.length, (3 - _this.data.mealList[index].imageList.length));
            var currentLength = that.data.mealList[index].imageList.length;
            var imageList = that.data.mealList[index].imageList;
            for (var i = 0; i < loopCounts; i++) {
                uploadFile(data.tempFilePaths[i], _this.onImageUploadSuccess, _this.onImageUploadFailed, _this.onUploadProgressing, index, currentLength + i);
                console.log(index + "," + that.data);
                var imageEntity = {
                    imageUrl: data.tempFilePaths[i],
                    isUploading: true,
                    isUploadFailed: false,
                    uploadPercentage: 0
                };
                imageList.push(imageEntity);
            }
            var imageOperation = 'mealList[' + index + '].imageList';
            that.setData((_a = {},
                _a[imageOperation] = imageList,
                _a));
            _this.updateChartStatus(index);
            _this.updateFoodLog(index);
            wx.reportAnalytics('on_image_btn_click', {
                meal: index,
                upload_pics_num: loopCounts,
            });
        });
    };
    Report.prototype.reUploadImage = function (event) {
        var _a;
        var mealIndex = event.currentTarget.dataset.mealIndex;
        var imageIndex = this.data.mealList[mealIndex].imageList.length - 1;
        uploadFile(this.data.mealList[mealIndex].imageList[imageIndex].imageUrl, this.onImageUploadSuccess, this.onImageUploadFailed, this.onUploadProgressing, mealIndex, imageIndex);
        var imageEntity = {
            imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
            isUploading: true,
            isUploadFailed: false,
            uploadPercentage: 0
        };
        var imageOperation = 'mealList[' + mealIndex + '].imageList[' + imageIndex + ']';
        this.setData((_a = {},
            _a[imageOperation] = imageEntity,
            _a));
    };
    Report.prototype.onImageUploadSuccess = function (mealIndex, imageIndex) {
        var _a;
        console.log("uploadSucess" + mealIndex + "," + imageIndex);
        var percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex + "]";
        var imageEntity = {
            imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
            isUploading: false,
            isUploadFailed: false,
            uploadPercentage: 100
        };
        this.setData((_a = {},
            _a[percentageOperation] = imageEntity,
            _a));
    };
    Report.prototype.onImageUploadFailed = function (mealIndex, imageIndex) {
        var _a;
        console.log("uploadFailed" + mealIndex + "," + imageIndex);
        var percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex + "]";
        var imageEntity = {
            imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
            isUploading: false,
            isUploadFailed: true,
            uploadPercentage: 0
        };
        this.setData((_a = {},
            _a[percentageOperation] = imageEntity,
            _a));
    };
    Report.prototype.onUploadProgressing = function (progress, mealIndex, imageIndex) {
        var _a;
        console.log("progress:" + progress);
        var percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex + "].uploadPercentage";
        this.setData((_a = {},
            _a[percentageOperation] = progress,
            _a));
    };
    Report.prototype.previewImage = function (event) {
        var imageIndex = event.currentTarget.dataset.imageIndex;
        var mealIndex = event.currentTarget.dataset.mealIndex;
        var src = this.data.mealList[mealIndex].imageList[imageIndex].imageUrl;
        wx.navigateTo({
            url: "../../pages/imageTag/index?imageUrl=" + src
        });
    };
    Report.prototype.deleteFoodImage = function (event) {
        var _a;
        var imageIndex = event.currentTarget.dataset.imageIndex;
        var mealIndex = event.currentTarget.dataset.mealIndex;
        var imageList = this.data.mealList[mealIndex].imageList;
        imageList.splice(imageIndex, 1);
        var imageOperation = 'mealList[' + mealIndex + '].imageList';
        this.setData((_a = {},
            _a[imageOperation] = imageList,
            _a));
        this.updateChartStatus(mealIndex);
        this.updateFoodLog(mealIndex);
        wx.reportAnalytics('on_image_delete', {
            meal: mealIndex,
        });
    };
    Report.prototype.addTextDesc = function (event) {
        var _a;
        var index = event.currentTarget.dataset.mealIndex;
        var textOperation = 'mealList[' + index + '].isShowTextArea';
        this.setData((_a = {},
            _a[textOperation] = true,
            _a));
        wx.reportAnalytics('open_text_desc', {});
    };
    Report.prototype.onShowTextInput = function (event) {
        var currentInputMealIndex = event.currentTarget.dataset.mealIndex;
        var currentText = this.data.mealList[currentInputMealIndex].textDesc;
        this.setData({
            "showModal": true,
            "currentInputMealIndex": currentInputMealIndex,
            "textAreaTxt": currentText
        });
    };
    Report.prototype.modalUpdate = function () {
        this.setData({
            "showModal": false
        });
        this.updateFoodLog(this.data.currentInputMealIndex);
        this.updateChartStatus(this.data.currentInputMealIndex);
    };
    Report.prototype.confirmText = function (event) {
        var _a;
        var text = event.detail.value;
        var index = event.currentTarget.dataset.mealIndex;
        console.log("enter confirm text:" + text + "," + index);
        if (text === '') {
            var textOperation = 'mealList[' + index + '].isShowTextArea';
            this.setData((_a = {},
                _a[textOperation] = false,
                _a));
        }
        this.updateChartStatus(index);
        this.updateFoodLog(index);
        wx.reportAnalytics('text_upload', {});
    };
    Report.prototype.countText = function (event) {
        var _a;
        var text = event.detail.value;
        var index = this.data.currentInputMealIndex;
        var textOperation = 'mealList[' + index + '].textDesc';
        this.setData((_a = {},
            _a[textOperation] = text,
            _a['textAreaTxt'] = text,
            _a));
    };
    Report.prototype.updateChartStatus = function (index) {
        if (this.data.mealList[index].textDesc.length !== 0 || this.data.mealList[index].imageList.length !== 0 || this.data.mealList[index].isSkip) {
            this.ringChart.opts.series[index].color = '#ed2c48';
        }
        else {
            this.ringChart.opts.series[index].color = '#ffffff';
        }
        this.ringChart.updateData();
        var completedFlag = true;
        for (var index_2 in this.ringChart.opts.series) {
            if (this.ringChart.opts.series[index_2].color === '#ffffff') {
                completedFlag = false;
            }
        }
        if (completedFlag !== this.data.completedFlag) {
            this.setData({
                "completedFlag": completedFlag
            });
        }
    };
    return Report;
}());
Page(new Report());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUFrRDtBQUNsRCxpREFBbUQ7QUFFbkQsK0NBQWlEO0FBQ2pELCtDQUFpRDtBQUNqRCxpREFBa0Q7QUFpQ2xEO0lBQUE7UUFFUyxTQUFJLEdBQVM7WUFDbEIsUUFBUSxFQUFFO2dCQUNSO29CQUNFLFVBQVUsRUFBRSxDQUFDO29CQUNiLFVBQVUsRUFBRSxDQUFDO29CQUNiLFFBQVEsRUFBRSxJQUFJO29CQUNkLFlBQVksRUFBRSxNQUFNO29CQUNwQixJQUFJLEVBQUUsbUNBQW1DO29CQUN6QyxRQUFRLEVBQUUsRUFBRTtvQkFDWixTQUFTLEVBQUUsRUFBRTtvQkFDYixRQUFRLEVBQUUsRUFBRTtvQkFDWixjQUFjLEVBQUUsS0FBSztvQkFDckIsTUFBTSxFQUFFLEtBQUs7aUJBQ2Q7Z0JBQ0Q7b0JBQ0UsVUFBVSxFQUFFLENBQUM7b0JBQ2IsVUFBVSxFQUFFLENBQUM7b0JBQ2IsUUFBUSxFQUFFLElBQUk7b0JBQ2QsWUFBWSxFQUFFLE1BQU07b0JBQ3BCLElBQUksRUFBRSx3QkFBd0I7b0JBQzlCLFFBQVEsRUFBRSxFQUFFO29CQUNaLFNBQVMsRUFBRSxFQUFFO29CQUNiLFFBQVEsRUFBRSxFQUFFO29CQUNaLGNBQWMsRUFBRSxLQUFLO29CQUNyQixNQUFNLEVBQUUsSUFBSTtpQkFDYjtnQkFDRDtvQkFDRSxVQUFVLEVBQUUsQ0FBQztvQkFDYixVQUFVLEVBQUUsQ0FBQztvQkFDYixRQUFRLEVBQUUsSUFBSTtvQkFDZCxZQUFZLEVBQUUsTUFBTTtvQkFDcEIsSUFBSSxFQUFFLHFDQUFxQztvQkFDM0MsUUFBUSxFQUFFLEVBQUU7b0JBQ1osU0FBUyxFQUFFLEVBQUU7b0JBQ2IsUUFBUSxFQUFFLEVBQUU7b0JBQ1osY0FBYyxFQUFFLEtBQUs7b0JBQ3JCLE1BQU0sRUFBRSxLQUFLO2lCQUNkO2dCQUNEO29CQUNFLFVBQVUs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O0FBQ0QsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNob29zZUltYWdlIH0gZnJvbSAnLi4vLi4vYXBpL3Byb21pc2VBUEknXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IFVwZGF0ZVNlbGZGb29kRGVzY1JlcSwgRm9vZERlc2NJbmZvLCBTdWJtaXRSZXBvcnRSZXEsIENyZWF0ZVJlcG9ydFJlc3AgfSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzJ1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLi8uLi9hcGkvdXBsb2FkZXInO1xuaW1wb3J0ICogYXMgd3hDaGFydHMgZnJvbSAnLi4vLi4vdXRpbHMvd3hjaGFydHMnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcblxudHlwZSBEYXRhID0ge1xuICBtZWFsTGlzdDogTWVhbFtdO1xuICBzY3JvbGxIZWlnaHQ6IG51bWJlcjtcbiAgY29tcGxldGVkRmxhZzogYm9vbGVhbjtcbiAgcmVwb3J0U3RhdHVzOiBudW1iZXI7XG4gIHNob3dNb2RhbDogYm9vbGVhbjtcbiAgdGV4dEFyZWFUeHQ6IHN0cmluZztcbiAgY3VycmVudElucHV0TWVhbEluZGV4OiBudW1iZXI7XG4gIHJlZnJlc2hpbmc6IGJvb2xlYW47XG59XG5cbnR5cGUgTWVhbCA9IHtcbiAgZm9vZERlc2NJZDogbnVtYmVyO1xuICBtZWFsVHlwZUlkOiBudW1iZXI7XG4gIG1lYWxUeXBlOiBzdHJpbmc7XG4gIHNraXBNZWFsVGV4dDogc3RyaW5nO1xuICBoaW50OiBzdHJpbmc7XG4gIG1lYWxJY29uOiBzdHJpbmc7XG4gIGltYWdlTGlzdDogSW1hZ2VFbnRpdHlbXTtcbiAgdGV4dERlc2M6IHN0cmluZztcbiAgaXNTaG93VGV4dEFyZWE6IGJvb2xlYW47XG4gIGlzU2tpcDogYm9vbGVhbjtcbn1cblxudHlwZSBJbWFnZUVudGl0eSA9IHtcbiAgaW1hZ2VVcmw6IFN0cmluZztcbiAgaXNVcGxvYWRpbmc6IGJvb2xlYW47XG4gIGlzVXBsb2FkRmFpbGVkOiBib29sZWFuO1xuICB1cGxvYWRQZXJjZW50YWdlOiBudW1iZXI7XG59XG5cbmNsYXNzIFJlcG9ydCB7XG4gIHJpbmdDaGFydDogYW55O1xuICBwdWJsaWMgZGF0YTogRGF0YSA9IHtcbiAgICBtZWFsTGlzdDogW1xuICAgICAge1xuICAgICAgICBmb29kRGVzY0lkOiAwLFxuICAgICAgICBtZWFsVHlwZUlkOiAxLFxuICAgICAgICBtZWFsVHlwZTogXCLml6nppJBcIixcbiAgICAgICAgc2tpcE1lYWxUZXh0OiBcIuayoeWQg+aXqemkkFwiLFxuICAgICAgICBoaW50OiBcIuS+i+WtkDrnmb3nha7puKHom4vvvIzkuKTlj6osIOWPquWQg+S6huibi+eZve+8myDnuq/niZvlpbbvvIwg5LiA55uS77yMMjAwbWzjgIJcIixcbiAgICAgICAgbWVhbEljb246IFwiXCIsXG4gICAgICAgIGltYWdlTGlzdDogW10sXG4gICAgICAgIHRleHREZXNjOiBcIlwiLFxuICAgICAgICBpc1Nob3dUZXh0QXJlYTogZmFsc2UsXG4gICAgICAgIGlzU2tpcDogZmFsc2VcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZvb2REZXNjSWQ6IDAsXG4gICAgICAgIG1lYWxUeXBlSWQ6IDIsXG4gICAgICAgIG1lYWxUeXBlOiBcIuWKoOmkkFwiLFxuICAgICAgICBza2lwTWVhbFRleHQ6IFwi5rKh5pyJ5Yqg6aSQXCIsXG4gICAgICAgIGhpbnQ6IFwi5L6L5a2QOuiRoeiQhO+8jOW3qOWzsCwgMTDnspLvvJvoi4/miZPppbzlubLvvIwz54mH44CCXCIsXG4gICAgICAgIG1lYWxJY29uOiBcIlwiLFxuICAgICAgICBpbWFnZUxpc3Q6IFtdLFxuICAgICAgICB0ZXh0RGVzYzogXCJcIixcbiAgICAgICAgaXNTaG93VGV4dEFyZWE6IGZhbHNlLFxuICAgICAgICBpc1NraXA6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZvb2REZXNjSWQ6IDAsXG4gICAgICAgIG1lYWxUeXBlSWQ6IDMsXG4gICAgICAgIG1lYWxUeXBlOiBcIuWNiOmkkFwiLFxuICAgICAgICBza2lwTWVhbFRleHQ6IFwi5rKh5ZCD5Y2I6aSQXCIsXG4gICAgICAgIGhpbnQ6IFwi5L6L5a2QOuexs+mlre+8jOaZrumAmumlreeil+S4ieS4pO+8jOWPquWQg+S6huS4gOWNiu+8myDpk7bpsrPpsbzvvIzljYrmlqTvvIzpsbzlpLTpsbzlsL7msqHmnInlkIPjgIJcIixcbiAgICAgICAgbWVhbEljb246IFwiXCIsXG4gICAgICAgIGltYWdlTGlzdDogW10sXG4gICAgICAgIHRleHREZXNjOiBcIlwiLFxuICAgICAgICBpc1Nob3dUZXh0QXJlYTogZmFsc2UsXG4gICAgICAgIGlzU2tpcDogZmFsc2VcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZvb2REZXNjSWQ6IDAsXG4gICAgICAgIG1lYWxUeXBlSWQ6IDQsXG4gICAgICAgIG1lYWxUeXBlOiBcIuWKoOmkkFwiLFxuICAgICAgICBza2lwTWVhbFRleHQ6IFwi5rKh5pyJ5Yqg6aSQXCIsXG4gICAgICAgIGhpbnQ6IFwi5YWo6bqm5Zyf5Y+46Z2i5YyF77yMMueJh++8myDoirHnlJ/phbHvvIzkuIDli7rjgIJcIixcbiAgICAgICAgbWVhbEljb246IFwiXCIsXG4gICAgICAgIGltYWdlTGlzdDogW10sXG4gICAgICAgIHRleHREZXNjOiBcIlwiLFxuICAgICAgICBpc1Nob3dUZXh0QXJlYTogZmFsc2UsXG4gICAgICAgIGlzU2tpcDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZm9vZERlc2NJZDogMCxcbiAgICAgICAgbWVhbFR5cGVJZDogNSxcbiAgICAgICAgbWVhbFR5cGU6IFwi5pma6aSQXCIsXG4gICAgICAgIHNraXBNZWFsVGV4dDogXCLmsqHlkIPmmZrppJBcIixcbiAgICAgICAgaGludDogXCLmi4zpu4Tnk5zvvIzkuIDlsI/nm5jvvIznuqbkuIDmoLnpu4Tnk5zvvJvnuqLng6fniZvogonpnaLvvIzkuIDlpKfnopfvvIzlj6PlkbPlgY/lkrjjgIJcIixcbiAgICAgICAgbWVhbEljb246IFwiXCIsXG4gICAgICAgIGltYWdlTGlzdDogW10sXG4gICAgICAgIHRleHREZXNjOiBcIlwiLFxuICAgICAgICBpc1Nob3dUZXh0QXJlYTogZmFsc2UsXG4gICAgICAgIGlzU2tpcDogZmFsc2VcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZvb2REZXNjSWQ6IDAsXG4gICAgICAgIG1lYWxUeXBlSWQ6IDYsXG4gICAgICAgIG1lYWxUeXBlOiBcIuWKoOmkkFwiLFxuICAgICAgICBza2lwTWVhbFRleHQ6IFwi5rKh5pyJ5Yqg6aSQXCIsXG4gICAgICAgIGhpbnQ6IFwi54eV6bqm54mH77yM5peg57OW77yMM+Wkp+WLuu+8m+WNl+eTnOWtkO+8jOS4gOWwj+aKiu+8jOe6pjIw5YWL44CCXCIsXG4gICAgICAgIG1lYWxJY29uOiBcIlwiLFxuICAgICAgICBpbWFnZUxpc3Q6IFtdLFxuICAgICAgICB0ZXh0RGVzYzogXCJcIixcbiAgICAgICAgaXNTaG93VGV4dEFyZWE6IGZhbHNlLFxuICAgICAgICBpc1NraXA6IHRydWVcbiAgICAgIH1cbiAgICBdLFxuICAgIHNjcm9sbEhlaWdodDogMCxcbiAgICBjb21wbGV0ZWRGbGFnOiBmYWxzZSxcbiAgICByZXBvcnRTdGF0dXM6IDAsXG4gICAgc2hvd01vZGFsOiBmYWxzZSxcbiAgICB0ZXh0QXJlYVR4dDogXCJcIixcbiAgICBjdXJyZW50SW5wdXRNZWFsSW5kZXg6IC0xLFxuICAgIHJlZnJlc2hpbmc6IGZhbHNlXG4gIH1cblxuICBwdWJsaWMgb25UYWJJdGVtVGFwKGl0ZW06IGFueSkge1xuICAgIC8vd3ggcmVwb3J0IGFuYWx5dGljc1xuICAgIHd4LnJlcG9ydEFuYWx5dGljcygnc3dpdGNoX3RhYicsIHtcbiAgICAgIHRhYl9pbmRleDogaXRlbS5pbmRleCxcbiAgICAgIHRhYl9wYWdlcGF0aDogaXRlbS5wYWdlUGF0aCxcbiAgICAgIHRhYl90ZXh0OiBpdGVtLnRleHRcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblB1bGxEb3duUmVmcmVzaCgpIHtcbiAgICAvL2dldCByZXBvcnQgc3RhdHVzIGFnYWluXG4gICAgY29uc29sZS5sb2coXCJvbiBwdWxsRG93biByZWZyZXNoXCIpO1xuICAgIHRoaXMuZ2V0Rm9vZERlc2NEYXRhKCk7XG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCk6IHZvaWQge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKVxuICAgIHRoaXMuZ2V0Rm9vZERlc2NEYXRhKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Rm9vZERlc2NEYXRhKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHJlZnJlc2hpbmc6IHRydWUsXG4gICAgfSlcbiAgICB2YXIgcmVwb3J0SWQgPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV9yZXBvcnRJZClcbiAgICB2YXIgcmVxID0geyByZXBvcnRfaWQ6IHJlcG9ydElkIH07XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBtZWFsTGlzdDogYW55ID0gW11cbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pXG4gICAgd2ViQVBJLkdldFNlbGZGb29kRGVzYyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwKVxuICAgICAgLy9jaGVjayB0aGUgcmVwb3J0IHN0YXR1cyB0byBzZXQgdXAgdGhlIGZ1bmN0aW9uXG4gICAgICBjb25zb2xlLmxvZyhcInJlcG9ydCBzdGF0dXM6XCIgKyByZXNwLnN0YXR1cyk7XG4gICAgICBmb3IgKGxldCBpIGluIHJlc3AuZm9vZF9kZXNjX2luZm8pIHtcbiAgICAgICAgbGV0IG1lYWwgPSB0aGlzLm1lYWxEYXRhUGFyc2luZyhyZXNwLmZvb2RfZGVzY19pbmZvW2ldKTtcbiAgICAgICAgbWVhbExpc3QucHVzaChtZWFsKTtcbiAgICAgIH1cbiAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG1lYWxMaXN0OiBtZWFsTGlzdCxcbiAgICAgICAgcmVwb3J0U3RhdHVzOiByZXNwLnN0YXR1c1xuICAgICAgfSlcbiAgICAgIGlmIChyZXNwLnN0YXR1cyA+PSAyKSB7XG4gICAgICAgIHRoaXMuc2V0VXBTY29sbGVySGVpZ2h0KDEwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFVwU2NvbGxlckhlaWdodCgxNTApO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgdGhpcy51cGRhdGVDaGFydFN0YXR1cyhpKTtcbiAgICAgIH1cbiAgICAgIC8vZGlzbWlzcyB0aGUgcmVmcmVzaCBsb2FkaW5nIGJhclxuICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcmVmcmVzaGluZzogZmFsc2UsXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiB3eC5oaWRlTG9hZGluZyh7fSkpO1xuICB9XG5cbiAgcHVibGljIG5hdmlUb1JlcG9ydFBhZ2UoKSB7XG4gICAgd3guc3dpdGNoVGFiKHsgdXJsOiAnL3BhZ2VzL3JlcG9ydC9pbmRleCcgfSk7XG4gIH1cblxuICBwdWJsaWMgY3JlYXRlTmV3UmVwb3J0KCl7XG4gICAgLy9zZW5kIGNyZWF0ZSBuZXcgcmVwb3J0IHJlcXVlc3QgdGhlbiByZWZyZXNoIHJlcG9ydC5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoe3RpdGxlOlwi5paw5bu65oql5ZGK5LitLi4uXCJ9KTtcbiAgICB3ZWJBUEkuQ3JlYXRlUmVwb3J0KHt9KS50aGVuKHJlc3AgPT4geyBcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIC8vZ2V0IEZvb2QgZGVzYyBhZ2FpblxuICAgICAgbGV0IHJlcG9ydElkID0gcmVzcC5yZXBvcnRfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcInJlcG9ydElkOlwiK3JlcG9ydElkKTtcbiAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3JlcG9ydElkLCByZXBvcnRJZCk7XG4gICAgICB0aGF0LmdldEZvb2REZXNjRGF0YSgpO1xuICAgIH0pLmNhdGNoKGVyciA9PiB3eC5oaWRlTG9hZGluZyh7fSkpO1xuICB9XG5cbiAgcHVibGljIG9uVm9pY2VJbnB1dFJlbWluZGVyKCkge1xuICAgIC8vc2hvdyByZW1pbmRlciBmb3IgdXNlciB0aGF0IGNhbiB1c2Ugdm9pY2UgaW5wdXQ7XG4gICAgd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgY29udGVudDogXCLkvb/nlKjplK7nm5jkuIrnmoTor63pn7PovpPlhaXvvIzmm7TliqDkvr/mjbflk6bvvZ7vvZ5cIixcbiAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgbWVhbERhdGFQYXJzaW5nKHJlc3A6IEZvb2REZXNjSW5mbykge1xuICAgIGNvbnNvbGUubG9nKHJlc3AubWVhbF90eXBlKTtcbiAgICBsZXQgbWVhbDpNZWFsID0ge307XG4gICAgbWVhbC5tZWFsVHlwZUlkID0gcmVzcC5tZWFsX3R5cGU7XG4gICAgbWVhbC5oaW50ID0gdGhpcy5kYXRhLm1lYWxMaXN0W3Jlc3AubWVhbF90eXBlIC0gMV0uaGludFxuICAgIG1lYWwuc2tpcE1lYWxUZXh0ID0gdGhpcy5kYXRhLm1lYWxMaXN0W3Jlc3AubWVhbF90eXBlIC0gMV0uc2tpcE1lYWxUZXh0XG4gICAgc3dpdGNoIChyZXNwLm1lYWxfdHlwZSkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBtZWFsLm1lYWxUeXBlID0gXCLml6nppJBcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIG1lYWwubWVhbFR5cGUgPSBcIuWNiOmkkFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgbWVhbC5tZWFsVHlwZSA9IFwi5pma6aSQXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbWVhbC5tZWFsVHlwZSA9IFwi5Yqg6aSQXCI7XG4gICAgfVxuICAgIG1lYWwuZm9vZERlc2NJZCA9IHJlc3AuZm9vZF9kZXNjX2lkO1xuICAgIG1lYWwudGV4dERlc2MgPSByZXNwLnRleHRfZGVzYztcbiAgICBtZWFsLmlzU2hvd1RleHRBcmVhID0gcmVzcC50ZXh0X2Rlc2MgIT09IFwiXCI7XG4gICAgbWVhbC5pc1NraXAgPSByZXNwLmlzX3NraXBwZWQ7XG4gICAgbWVhbC5pbWFnZUxpc3QgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLmltYWdlX2tleSkge1xuICAgICAgbGV0IGltYWdlRW50aXR5OkltYWdlRW50aXR5ID0ge1xuICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL1wiICsgcmVzcC5pbWFnZV9rZXlbaW5kZXhdLFxuICAgICAgICBpc1VwbG9hZGluZzogZmFsc2UsXG4gICAgICAgIGlzVXBsb2FkRmFpbGVkOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkUGVyY2VudGFnZTogMFxuICAgICAgfTtcbiAgICAgIG1lYWwuaW1hZ2VMaXN0LnB1c2goaW1hZ2VFbnRpdHkpO1xuICAgIH1cbiAgICByZXR1cm4gbWVhbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRSZXBvcnRTdGF0dXMoKSB7XG4gICAgLy9jaGVjayByZXBvcnQgc3RhdHVzXG4gICAgbGV0IHJlcG9ydElkID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfcmVwb3J0SWQpO1xuICAgIGxldCByZXE6IFN1Ym1pdFJlcG9ydFJlcSA9IHtcbiAgICAgIHJlcG9ydF9pZDogcmVwb3J0SWRcbiAgICB9O1xuICAgIHdlYkFQSS5HZXRSZXBvcnRTdGF0dXMocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJyZXBvcnQgc3RhdHVzOlwiICsgcmVzcC5zdGF0dXMpO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBvblN1Ym1pdEJ0blByZXNzZWQoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIC8vZ2V0IHByb2ZpbGUgZGF0YSBvbmxpbmVcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pXG4gICAgd2ViQVBJLkdldFNlbGZQcm9maWxlKHt9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAvL2NoZWNrIHRoZSB2YWx1ZSBvZiB0aGUgcHJvZmlsZVxuICAgICAgaWYgKCF0aGF0Lm9uQ2hlY2tQcm9maWxlVmFsdWUocmVzcCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IGdlbmRlckFycmF5ID0gWyfnlLcnLCflpbMnXTtcbiAgICAgIGxldCBwcmVnbmFuY3lTdGF0dXNBcnJheSA9IFsn5aSH5a2VJywgJ+W3suWtlScsICflk7rkubPmnJ8nXTtcbiAgICAgIGxldCBhY3Rpdml0eUxldmVsQXJyYXkgPSBbJ+WNp+W6iuS8keaBrycsICfovbvluqYs6Z2Z5Z2Q5bCR5YqoJywgJ+S4reW6pizluLjluLjnq5nnq4votbDliqgnLCAn6YeN5bqmLOi0n+mHjSddO1xuICAgICAgLy9jaGVjayBwcmVnbmFuY3kgc3RhdHVzIGFuZCBjaGFuZ2UgdGhlIGRpc3BsYXlcbiAgICAgIGxldCBjdXJyZW50V2VpZ2h0VGV4dCA9IFwiQ01cIlxuICAgICAgbGV0IHByZWduYW5jeVdlZWtUZXh0ID0gXCJcIlxuICAgICAgaWYgKHJlc3AucHJlZ25hbmN5X3N0YWdlID09IDIpey8v5aSH5a2VXG4gICAgICAgIGN1cnJlbnRXZWlnaHRUZXh0ID0gXCJDTVxcbuS9k+mHjTpcIiArIHJlc3Aud2VpZ2h0X3ByZWduYW5jeSArICdLRydcbiAgICAgIH0gZWxzZSBpZiAocmVzcC5wcmVnbmFuY3lfc3RhZ2UgPT0gMSl7Ly/lt7LlrZVcbiAgICAgICAgY3VycmVudFdlaWdodFRleHQgPSBcIkNNXFxu5L2T6YeNOlwiICsgcmVzcC53ZWlnaHRfcHJlZ25hbmN5ICsgJ0tHJ1xuICAgICAgICBwcmVnbmFuY3lXZWVrVGV4dCA9IFwiXFxu5a2V5ZGoOlwiICsgcmVzcC5wcmVnbmFuY3lcbiAgICAgIH1cbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBcIuehruiupOaPkOS6pO+8n+aPkOS6pOS5i+WQjuWwhuS4jeiDveWGjeS/ruaUuemlrumjn+aXpeiusOWSjOS4quS6uuS/oeaBr+OAglxcbuaCqOeahOS4quS6uuS/oeaBrzpcXG7mgKfliKs6XCIgK2dlbmRlckFycmF5W3Jlc3AuZ2VuZGVyXStcIlxcbuWHuueUn+W5tOS7vTpcIiArIHJlc3AuYmlydGhkYXkgKyBcIlxcbuaAgOWtleaDheWGtTpcIiArIHByZWduYW5jeVN0YXR1c0FycmF5W3Jlc3AucHJlZ25hbmN5X3N0YWdlXSArIHByZWduYW5jeVdlZWtUZXh0ICsgXCJcXG7ouqvpq5g6XCIgKyByZXNwLmhlaWdodCArIGN1cnJlbnRXZWlnaHRUZXh0ICsgXCJcXG7lrZXliY3kvZPph406XCIgKyByZXNwLndlaWdodCArIFwiS0dcXG7ml6XluLjov5Dliqjph486XCIgKyBhY3Rpdml0eUxldmVsQXJyYXlbcmVzcC5hY3Rpdml0eV9sZXZlbF0gKyBcIlxcbuacrOasoeaKpeWRiuWwhuWfuuS6juS7peS4iuS/oeaBr+eUn+aIkFwiLFxuICAgICAgICBzaG93Q2FuY2VsOiB0cnVlLFxuICAgICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgdGhhdC5vblN1Ym1pdENvbmZpcm1hdGlvbigpO1xuICAgICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdzdWJtaXNzaW9uX2NvbmZpcm1hdGlvbicsIHt9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5jYW5jZWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLflj5bmtojmj5DkuqQnKTtcbiAgICAgICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygnc3VibWlzc2lvbl9jYW5jZWwnLCB7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiB3eC5oaWRlTG9hZGluZyh7fSkpO1xuICAgIC8vY2hhbmdlIHRoZSByZXBvcnQgc3RhdHVzIHRvIHN1Ym1pdHRlZFxuICAgIC8vcmVwb3J0IGFuYWx5dGljc1xuICAgIHd4LnJlcG9ydEFuYWx5dGljcygnb25fc3VibWl0X2J0bl9jbGljaycsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNoZWNrUHJvZmlsZVZhbHVlKHJlc3A6YW55KSB7XG4gICAgaWYgKHJlc3AuaGVpZ2h0IDwgMTA2IHx8IHJlc3AuaGVpZ2h0ID4gMjIwIHx8IHJlc3Aud2VpZ3RoIDwgMzAgfHwgcmVzcC53ZWlndGggPiAxNTAgfHwgcmVzcC5wcmVnbmFuY3lfc3RhZ2UgPT0gLTEgfHwgcmVzcC5hY3Rpdml0eV9sZXZlbCA9PSAtMSkge1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICAgIGNvbnRlbnQ6IFwi6K+35a6M5ZaE5oKo55qE5Liq5Lq65L+h5oGv5ZCO5YaN5o+Q5LqkXCIsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICBzdWNjZXNzKCkge1xuICAgICAgICAgIHd4LnN3aXRjaFRhYih7IHVybDogJy9wYWdlcy9wb3J0Zm9saW8vaW5kZXgnIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHJlc3AucHJlZ25hbmN5X3N0YWdlID09IDIpe1xuICAgICAgaWYgKHJlc3Aud2VpZ2h0X3ByZWduYW5jeSA8IDMwIHx8IHJlc3Aud2VpZ2h0X3ByZWduYW5jeSA+IDE1MCApe1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwi6K+35a6M5ZaE5oKo55qE5Liq5Lq65L+h5oGv5ZCO5YaN5o+Q5LqkXCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgICAgIHd4LnN3aXRjaFRhYih7IHVybDogJy9wYWdlcy9wb3J0Zm9saW8vaW5kZXgnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlc3AucHJlZ25hbmN5X3N0YWdlID09IDEpe1xuICAgICAgaWYgKHJlc3AucHJlZ25hbmN5ID4gNDUpe1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwi6K+35a6M5ZaE5oKo55qE5Liq5Lq65L+h5oGv5ZCO5YaN5o+Q5LqkXCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgICAgIHd4LnN3aXRjaFRhYih7IHVybDogJy9wYWdlcy9wb3J0Zm9saW8vaW5kZXgnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgb25TdWJtaXRDb25maXJtYXRpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIC8vc3VibWlzc2lvblxuICAgIHZhciByZXBvcnRJZCA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3JlcG9ydElkKTtcbiAgICBsZXQgcmVxOiBTdWJtaXRSZXBvcnRSZXEgPSB7XG4gICAgICByZXBvcnRfaWQ6IHJlcG9ydElkXG4gICAgfTtcbiAgICB3ZWJBUEkuU3VibWl0UmVwb3J0KHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwic3VibWl0IHJlcG9ydCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlcG9ydFN0YXR1czogcmVzcC5zdGF0dXNcbiAgICAgIH0pO1xuICAgICAgdGhhdC5zZXRVcFNjb2xsZXJIZWlnaHQoMTAwKTtcbiAgICB9KS5jYXRjaChlcnIgPT5cbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBTdHJpbmcoZXJyLm1lc3NhZ2UpLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgICB3eC5zd2l0Y2hUYWIoeyB1cmw6ICcvcGFnZXMvcG9ydGZvbGlvL2luZGV4JyB9KTtcbiAgICAgICAgICAvL3JlcG9ydCBhbmFseXRpY3NcbiAgICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3N1Ym1pc3Npb25fcmVtaW5kZXInLCB7XG4gICAgICAgICAgICBlcnJfbXNnOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZUZvb2RMb2coaW5kZXg6IG51bWJlcikge1xuICAgIHZhciByZXEgPSB0aGlzLmdlbmVyYXRlRm9vZFJlcVJlcUJvZHkoaW5kZXgpO1xuICAgIHdlYkFQSS5VcGRhdGVTZWxmRm9vZERlc2MocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGUgZm9vZCBkZXNjIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICB9KS5jYXRjaChlcnIgPT5cbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiAn5pu05paw5pel6K6w5aSx6LSlJyxcbiAgICAgICAgY29udGVudDogU3RyaW5nKGVyciksXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGVGb29kUmVxUmVxQm9keShpbmRleDogbnVtYmVyKTogVXBkYXRlU2VsZkZvb2REZXNjUmVxIHtcbiAgICAvL3VwZGF0ZSBvbmUgbWVhbCBvbmx5XG4gICAgbGV0IGZvb2RFbnRpdHkgPSB0aGlzLmRhdGEubWVhbExpc3RbaW5kZXhdO1xuICAgIGxldCBpbWFnZUtleXMgPSBbXVxuICAgIC8vZm9yIGxvb3AgaW1hZ2UgbGlzdFxuICAgIGZvciAobGV0IGluZGV4IGluIGZvb2RFbnRpdHkuaW1hZ2VMaXN0KSB7XG4gICAgICBsZXQgaW1hZ2VVcmwgPSBTdHJpbmcoZm9vZEVudGl0eS5pbWFnZUxpc3RbaW5kZXhdLmltYWdlVXJsKTtcbiAgICAgIGxldCBpc1VwbG9hZGluZyA9IGZvb2RFbnRpdHkuaW1hZ2VMaXN0W2luZGV4XS5pc1VwbG9hZGluZztcbiAgICAgIGxldCBpc1VwbG9hZEZhaWxlZCA9IGZvb2RFbnRpdHkuaW1hZ2VMaXN0W2luZGV4XS5pc1VwbG9hZEZhaWxlZDtcbiAgICAgIHZhciBpbWFnZUtleSA9IGltYWdlVXJsLnN1YnN0cmluZyhpbWFnZVVybC5sYXN0SW5kZXhPZihcIi9cIikgKyAxLCBpbWFnZVVybC5sZW5ndGgpO1xuICAgICAgY29uc29sZS5sb2coaW1hZ2VLZXkpO1xuICAgICAgaWYgKCFpc1VwbG9hZGluZyAmJiAhaXNVcGxvYWRGYWlsZWQpe1xuICAgICAgICBpbWFnZUtleXMucHVzaChpbWFnZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBmb29kRGVzY1JlcUJvZHk6IFVwZGF0ZVNlbGZGb29kRGVzY1JlcSA9IHtcbiAgICAgIGZvb2RfZGVzY19pZDogZm9vZEVudGl0eS5mb29kRGVzY0lkLFxuICAgICAgbWVhbF90eXBlOiBmb29kRW50aXR5Lm1lYWxUeXBlSWQsXG4gICAgICB0ZXh0X2Rlc2M6IGZvb2RFbnRpdHkudGV4dERlc2MsXG4gICAgICBpc19za2lwcGVkOiBmb29kRW50aXR5LmlzU2tpcCxcbiAgICAgIGltYWdlX2tleTogaW1hZ2VLZXlzXG4gICAgfTtcbiAgICByZXR1cm4gZm9vZERlc2NSZXFCb2R5O1xuICB9XG5cbiAgcHVibGljIG9uU2hvdygpOiB2b2lkIHtcbiAgfVxuXG4gIHB1YmxpYyBvblJlYWR5KCk6IHZvaWQge1xuICAgIHRoaXMuaW5pdFJpbmcoJ3JpbmdDYW52YXMnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgdGhpcy51cGRhdGVDaGFydFN0YXR1cyhpKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0VXBTY29sbGVySGVpZ2h0KHRvcEhlaWdodDogbnVtYmVyKSB7XG4gICAgLy9zZXQgdXAgc2Nyb2xsZXIgaGVpZ2h0XG4gICAgdmFyIHdpbmRvd0hlaWdodCA9IHd4LmdldFN5c3RlbUluZm9TeW5jKCkud2luZG93SGVpZ2h0O1xuICAgIHZhciBzY3JvbGxIZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3BIZWlnaHQ7IC8vd2luZG93IGhlaWdodCBtaW51cyBzdGF0aWMgdmlldyBoZWlnaHQgJiBtYXJnaW4tdG9wIFxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBzY3JvbGxIZWlnaHQ6IHNjcm9sbEhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGluaXRSaW5nKGNhbnZhc0lkOiBzdHJpbmcpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5yaW5nQ2hhcnQgPSBuZXcgd3hDaGFydHMoe1xuICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgY2FudmFzSWQ6IGNhbnZhc0lkLFxuICAgICAgdHlwZTogJ3JpbmcnLFxuICAgICAgZXh0cmE6IHtcbiAgICAgICAgcmluZ1dpZHRoOiAyNSxcbiAgICAgICAgcGllOiB7XG4gICAgICAgICAgb2Zmc2V0QW5nbGU6IC0xMzguNSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRpdGxlOiB7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBjb2xvcjogJyM3Y2I1ZWMnLFxuICAgICAgICBmb250U2l6ZTogMjVcbiAgICAgIH0sXG4gICAgICBzdWJ0aXRsZToge1xuICAgICAgICBuYW1lOiAn5a6M5oiQ5bqmJyxcbiAgICAgICAgY29sb3I6ICcjNjY2NjY2JyxcbiAgICAgICAgZm9udFNpemU6IDE0XG4gICAgICB9LFxuICAgICAgc2VyaWVzOiBbe1xuICAgICAgICBuYW1lOiAn5pep6aSQJyxcbiAgICAgICAgZnJvbWF0OiAn5pep6aSQJyxcbiAgICAgICAgZGF0YTogMTA1LFxuICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBzdHJva2U6IHRydWVcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ+WKoOmkkCcsXG4gICAgICAgIGRhdGE6IDE1LFxuICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBzdHJva2U6IHRydWVcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ+WNiOmkkCcsXG4gICAgICAgIGRhdGE6IDEwNSxcbiAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgc3Ryb2tlOiB0cnVlXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICfliqDppJAnLFxuICAgICAgICBkYXRhOiAxNSxcbiAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgc3Ryb2tlOiB0cnVlXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICfmmZrppJAnLFxuICAgICAgICBkYXRhOiAxMDUsXG4gICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHN0cm9rZTogdHJ1ZVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAn5Yqg6aSQJyxcbiAgICAgICAgZGF0YTogMTUsXG4gICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHN0cm9rZTogdHJ1ZVxuICAgICAgfV0sXG4gICAgICBkaXNhYmxlUGllU3Ryb2tlOiBmYWxzZSxcbiAgICAgIHdpZHRoOiAxNjAsXG4gICAgICBoZWlnaHQ6IDE2MCxcbiAgICAgIGRhdGFMYWJlbDogZmFsc2UsXG4gICAgICBsZWdlbmQ6IGZhbHNlLFxuICAgICAgYmFja2dyb3VuZDogJyNmNWY1ZjUnLFxuICAgICAgcGFkZGluZzogMTBcbiAgICB9KTtcbiAgICB0aGlzLnJpbmdDaGFydC5hZGRFdmVudExpc3RlbmVyKCdyZW5kZXJDb21wbGV0ZScsICgpID0+IHtcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoYXQucmluZ0NoYXJ0LnN0b3BBbmltYXRpb24oKTtcbiAgICB9LCA1MDApO1xuICAgIGZvciAobGV0IGluZGV4IGluIHRoaXMuZGF0YS5tZWFsTGlzdCkge1xuICAgICAgdGhpcy51cGRhdGVDaGFydFN0YXR1cyhpbmRleCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHRvb2dsZU1lYWwoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAvL2NoYWduZSBtZWFsIGlzU2tpcCBcbiAgICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIHZhciBza2lwT3BlcmF0aW9uID0gJ21lYWxMaXN0WycgKyBpbmRleCArICddLmlzU2tpcCc7XG4gICAgLy9yZXBvcnRBbmFseXRpY3NcbiAgICBpZiAodGhhdC5kYXRhLm1lYWxMaXN0W2luZGV4XS5pc1NraXApIHtcbiAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygnb25fbWVhbF9za2lwJywge1xuICAgICAgICBtZWFsOiBpbmRleCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ29uX21lYWxfb3BlbicsIHtcbiAgICAgICAgbWVhbDogaW5kZXgsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gdmFyIGFuaW1PcGVyYXRpb24gPSAnbWVhbExpc3RbJyArIGluZGV4ICsgJ10uYW5pbWF0aW9uRGF0YSc7XG4gICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFtza2lwT3BlcmF0aW9uXTogIXRoYXQuZGF0YS5tZWFsTGlzdFtpbmRleF0uaXNTa2lwLFxuICAgIH0pO1xuICAgIC8vIGFuaW1hdGlvbi5oZWlnaHQoMCkuc3RlcCh7IGR1cmF0aW9uOiAyMDAgfSk7XG4gICAgdGhpcy51cGRhdGVDaGFydFN0YXR1cyhpbmRleCk7XG4gICAgdGhpcy51cGRhdGVGb29kTG9nKGluZGV4KTtcblxuXG4gIH1cblxuICBwdWJsaWMgYWRkRm9vZEltYWdlKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICBsZXQgY291bnROdW0gPSAzIC0gdGhhdC5kYXRhLm1lYWxMaXN0W2luZGV4XS5pbWFnZUxpc3QubGVuZ3RoXG4gICAgY2hvb3NlSW1hZ2UoeyBjb3VudDogY291bnROdW0sIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSB9KVxuICAgICAgLnRoZW4oXG4gICAgICAgIChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzKVxuICAgICAgICB9LFxuICAgICAgICAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICApXG4gICAgICAudGhlbihcbiAgICAgICAgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgIC8vdXBsb2FkIGltYWdlXG4gICAgICAgICAgdmFyIGxvb3BDb3VudHMgPSBNYXRoLm1pbihkYXRhLnRlbXBGaWxlUGF0aHMubGVuZ3RoLCAoMyAtIHRoaXMuZGF0YS5tZWFsTGlzdFtpbmRleF0uaW1hZ2VMaXN0Lmxlbmd0aCkpO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRMZW5ndGggPSB0aGF0LmRhdGEubWVhbExpc3RbaW5kZXhdLmltYWdlTGlzdC5sZW5ndGgvL2V4aXNpdGluZyBpbWFnZWxpc3QgbGVuZ3RoXG4gICAgICAgICAgbGV0IGltYWdlTGlzdDogSW1hZ2VFbnRpdHlbXSA9IHRoYXQuZGF0YS5tZWFsTGlzdFtpbmRleF0uaW1hZ2VMaXN0O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcENvdW50czsgaSsrKSB7XG4gICAgICAgICAgICB1cGxvYWRGaWxlKGRhdGEudGVtcEZpbGVQYXRoc1tpXSwgdGhpcy5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhpcy5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGlzLm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIGluZGV4LCBjdXJyZW50TGVuZ3RoK2kpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coaW5kZXggKyBcIixcIiArIHRoYXQuZGF0YSk7XG4gICAgICAgICAgICBsZXQgaW1hZ2VFbnRpdHk6IEltYWdlRW50aXR5ID0ge1xuICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS50ZW1wRmlsZVBhdGhzW2ldLFxuICAgICAgICAgICAgICBpc1VwbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgaXNVcGxvYWRGYWlsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICB1cGxvYWRQZXJjZW50YWdlOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbWFnZUxpc3QucHVzaChpbWFnZUVudGl0eSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBpbWFnZU9wZXJhdGlvbiA9ICdtZWFsTGlzdFsnICsgaW5kZXggKyAnXS5pbWFnZUxpc3QnO1xuICAgICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBbaW1hZ2VPcGVyYXRpb25dOiBpbWFnZUxpc3RcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMudXBkYXRlQ2hhcnRTdGF0dXMoaW5kZXgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlRm9vZExvZyhpbmRleCk7XG4gICAgICAgICAgLy9yZXBvcnQgYW5hbHl0aWNzXG4gICAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdvbl9pbWFnZV9idG5fY2xpY2snLCB7XG4gICAgICAgICAgICBtZWFsOiBpbmRleCxcbiAgICAgICAgICAgIHVwbG9hZF9waWNzX251bTogbG9vcENvdW50cyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgKVxuICB9XG5cbiAgcHVibGljIHJlVXBsb2FkSW1hZ2UoZXZlbnQ6YW55KSB7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGltYWdlSW5kZXggPSB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5pbWFnZUxpc3QubGVuZ3RoIC0gMVxuICAgIHVwbG9hZEZpbGUodGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0uaW1hZ2VMaXN0W2ltYWdlSW5kZXhdLmltYWdlVXJsLCB0aGlzLm9uSW1hZ2VVcGxvYWRTdWNjZXNzLCB0aGlzLm9uSW1hZ2VVcGxvYWRGYWlsZWQsIHRoaXMub25VcGxvYWRQcm9ncmVzc2luZywgbWVhbEluZGV4LCBpbWFnZUluZGV4KTtcbiAgICAvL2NoYW5nZSB0aGUgc3RhdHVzIG9mIHRoZSBpbWFnZSB0byBzdGFydCB1cGxvYWRpbmdcbiAgICBsZXQgaW1hZ2VFbnRpdHk6IEltYWdlRW50aXR5ID0ge1xuICAgICAgaW1hZ2VVcmw6IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLmltYWdlTGlzdFtpbWFnZUluZGV4XS5pbWFnZVVybCxcbiAgICAgIGlzVXBsb2FkaW5nOiB0cnVlLFxuICAgICAgaXNVcGxvYWRGYWlsZWQ6IGZhbHNlLFxuICAgICAgdXBsb2FkUGVyY2VudGFnZTogMFxuICAgIH1cbiAgICAvL29wZXJhdGlvbiB0byByZWZyZXNoIHRoZSBVSVxuICAgIHZhciBpbWFnZU9wZXJhdGlvbiA9ICdtZWFsTGlzdFsnICsgbWVhbEluZGV4ICsgJ10uaW1hZ2VMaXN0WycraW1hZ2VJbmRleCsnXSc7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFtpbWFnZU9wZXJhdGlvbl06IGltYWdlRW50aXR5XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2VzcyhtZWFsSW5kZXg6IG51bWJlciwgaW1hZ2VJbmRleDogbnVtYmVyKXtcbiAgICBjb25zb2xlLmxvZyhcInVwbG9hZFN1Y2Vzc1wiICsgbWVhbEluZGV4ICsgXCIsXCIgKyBpbWFnZUluZGV4KTtcbiAgICBsZXQgcGVyY2VudGFnZU9wZXJhdGlvbiA9IFwibWVhbExpc3RbXCIgKyBtZWFsSW5kZXggKyBcIl0uaW1hZ2VMaXN0W1wiICsgaW1hZ2VJbmRleCArIFwiXVwiO1xuICAgIGxldCBpbWFnZUVudGl0eSA9IHtcbiAgICAgIGltYWdlVXJsOiB0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5pbWFnZUxpc3RbaW1hZ2VJbmRleF0uaW1hZ2VVcmwsXG4gICAgICBpc1VwbG9hZGluZzogZmFsc2UsXG4gICAgICBpc1VwbG9hZEZhaWxlZDogZmFsc2UsXG4gICAgICB1cGxvYWRQZXJjZW50YWdlOiAxMDBcbiAgICB9O1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbcGVyY2VudGFnZU9wZXJhdGlvbl06IGltYWdlRW50aXR5XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZChtZWFsSW5kZXg6bnVtYmVyLCBpbWFnZUluZGV4Om51bWJlcil7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRGYWlsZWRcIiArIG1lYWxJbmRleCArIFwiLFwiICsgaW1hZ2VJbmRleCk7XG4gICAgLy9zZXQgdXAgdGhlIGltYWdlIHVwbG9hZCB3YXJuaW5nXG4gICAgbGV0IHBlcmNlbnRhZ2VPcGVyYXRpb24gPSBcIm1lYWxMaXN0W1wiICsgbWVhbEluZGV4ICsgXCJdLmltYWdlTGlzdFtcIiArIGltYWdlSW5kZXggKyBcIl1cIjtcbiAgICBsZXQgaW1hZ2VFbnRpdHkgPSB7XG4gICAgICBpbWFnZVVybDogdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0uaW1hZ2VMaXN0W2ltYWdlSW5kZXhdLmltYWdlVXJsLFxuICAgICAgaXNVcGxvYWRpbmc6IGZhbHNlLFxuICAgICAgaXNVcGxvYWRGYWlsZWQ6IHRydWUsXG4gICAgICB1cGxvYWRQZXJjZW50YWdlOiAwXG4gICAgfTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW3BlcmNlbnRhZ2VPcGVyYXRpb25dOiBpbWFnZUVudGl0eVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uVXBsb2FkUHJvZ3Jlc3NpbmcocHJvZ3Jlc3M6IGFueSwgbWVhbEluZGV4OiBudW1iZXIsIGltYWdlSW5kZXg6IG51bWJlcil7XG4gICAgY29uc29sZS5sb2coXCJwcm9ncmVzczpcIitwcm9ncmVzcyk7XG4gICAgLy91cGRhdGUgdXBsb2FkIHBlcmNlbnRhZ2V0c2MgaW4gIFxuICAgIGxldCBwZXJjZW50YWdlT3BlcmF0aW9uID0gXCJtZWFsTGlzdFtcIiArIG1lYWxJbmRleCArIFwiXS5pbWFnZUxpc3RbXCIgKyBpbWFnZUluZGV4ICtcIl0udXBsb2FkUGVyY2VudGFnZVwiO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbcGVyY2VudGFnZU9wZXJhdGlvbl06IHByb2dyZXNzXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcHJldmlld0ltYWdlKGV2ZW50OmFueSkge1xuICAgIGxldCBpbWFnZUluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmltYWdlSW5kZXg7XG4gICAgbGV0IG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IHNyYz0gdGhpcy5kYXRhLm1lYWxMaXN0W21lYWxJbmRleF0uaW1hZ2VMaXN0W2ltYWdlSW5kZXhdLmltYWdlVXJsXG4gICAgLy8gbGV0IHJlc291cmNlcyA9IFtdO1xuICAgIC8vIGZvciAobGV0IGluZGV4IGluIHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLmltYWdlTGlzdCl7XG4gICAgLy8gICByZXNvdXJjZXMucHVzaCh0aGlzLmRhdGEubWVhbExpc3RbbWVhbEluZGV4XS5pbWFnZUxpc3RbaW5kZXhdLmltYWdlVXJsKTtcbiAgICAvLyB9XG4gICAgLy8gd3gucHJldmlld0ltYWdlKHtcbiAgICAvLyAgIGN1cnJlbnQ6IHNyYyxcbiAgICAvLyAgIHVybHM6IHJlc291cmNlc1xuICAgIC8vIH0pXG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9XCIgKyBzcmNcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVGb29kSW1hZ2UoZXZlbnQ6IGFueSkge1xuICAgIHZhciBpbWFnZUluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmltYWdlSW5kZXg7XG4gICAgdmFyIG1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgdmFyIGltYWdlTGlzdCA9IHRoaXMuZGF0YS5tZWFsTGlzdFttZWFsSW5kZXhdLmltYWdlTGlzdDtcbiAgICBpbWFnZUxpc3Quc3BsaWNlKGltYWdlSW5kZXgsIDEpXG4gICAgdmFyIGltYWdlT3BlcmF0aW9uID0gJ21lYWxMaXN0WycgKyBtZWFsSW5kZXggKyAnXS5pbWFnZUxpc3QnO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbaW1hZ2VPcGVyYXRpb25dOiBpbWFnZUxpc3RcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlQ2hhcnRTdGF0dXMobWVhbEluZGV4KTtcbiAgICB0aGlzLnVwZGF0ZUZvb2RMb2cobWVhbEluZGV4KTtcbiAgICAvL3JlcG9ydCBhbmFseXRpY3NcbiAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ29uX2ltYWdlX2RlbGV0ZScsIHtcbiAgICAgIG1lYWw6IG1lYWxJbmRleCxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRUZXh0RGVzYyhldmVudDogYW55KSB7XG4gICAgdmFyIGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0Lm1lYWxJbmRleDtcbiAgICB2YXIgdGV4dE9wZXJhdGlvbiA9ICdtZWFsTGlzdFsnICsgaW5kZXggKyAnXS5pc1Nob3dUZXh0QXJlYSc7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFt0ZXh0T3BlcmF0aW9uXTogdHJ1ZVxuICAgIH0pXG4gICAgLy9yZXBvcnQgYW5hbHl0aWNzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCdvcGVuX3RleHRfZGVzYycsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3dUZXh0SW5wdXQoZXZlbnQ6IGFueSl7XG4gICAgdmFyIGN1cnJlbnRJbnB1dE1lYWxJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5tZWFsSW5kZXg7XG4gICAgbGV0IGN1cnJlbnRUZXh0ID0gdGhpcy5kYXRhLm1lYWxMaXN0W2N1cnJlbnRJbnB1dE1lYWxJbmRleF0udGV4dERlc2M7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFwic2hvd01vZGFsXCI6IHRydWUsXG4gICAgICBcImN1cnJlbnRJbnB1dE1lYWxJbmRleFwiOiBjdXJyZW50SW5wdXRNZWFsSW5kZXgsXG4gICAgICBcInRleHRBcmVhVHh0XCI6IGN1cnJlbnRUZXh0XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBtb2RhbFVwZGF0ZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBcInNob3dNb2RhbFwiOiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMudXBkYXRlRm9vZExvZyh0aGlzLmRhdGEuY3VycmVudElucHV0TWVhbEluZGV4KTtcbiAgICB0aGlzLnVwZGF0ZUNoYXJ0U3RhdHVzKHRoaXMuZGF0YS5jdXJyZW50SW5wdXRNZWFsSW5kZXgpO1xuICB9XG5cbiAgcHVibGljIGNvbmZpcm1UZXh0KGV2ZW50OiBhbnkpIHtcbiAgICB2YXIgdGV4dCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcbiAgICB2YXIgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubWVhbEluZGV4O1xuICAgIGNvbnNvbGUubG9nKFwiZW50ZXIgY29uZmlybSB0ZXh0OlwiICsgdGV4dCArIFwiLFwiICsgaW5kZXgpXG4gICAgaWYgKHRleHQgPT09ICcnKSB7XG4gICAgICB2YXIgdGV4dE9wZXJhdGlvbiA9ICdtZWFsTGlzdFsnICsgaW5kZXggKyAnXS5pc1Nob3dUZXh0QXJlYSc7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBbdGV4dE9wZXJhdGlvbl06IGZhbHNlXG4gICAgICB9KVxuICAgIH1cbiAgICAvL3NhdmUgdGhlIG1lYWwgZGF0YVxuICAgIHRoaXMudXBkYXRlQ2hhcnRTdGF0dXMoaW5kZXgpO1xuICAgIHRoaXMudXBkYXRlRm9vZExvZyhpbmRleCk7XG4gICAgLy9yZXBvcnQgYW5hbHl0aWNzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCd0ZXh0X3VwbG9hZCcsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBjb3VudFRleHQoZXZlbnQ6IGFueSkge1xuICAgIHZhciB0ZXh0ID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuICAgIHZhciBpbmRleCA9IHRoaXMuZGF0YS5jdXJyZW50SW5wdXRNZWFsSW5kZXg7XG4gICAgdmFyIHRleHRPcGVyYXRpb24gPSAnbWVhbExpc3RbJyArIGluZGV4ICsgJ10udGV4dERlc2MnO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbdGV4dE9wZXJhdGlvbl06IHRleHQsXG4gICAgICAndGV4dEFyZWFUeHQnOiB0ZXh0XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVDaGFydFN0YXR1cyhpbmRleDogbnVtYmVyKSB7XG4gICAgLy9jaGFuZ2UgaGVhZCBwcm9ncmVzcyBmaWxsaW5nXG4gICAgaWYgKHRoaXMuZGF0YS5tZWFsTGlzdFtpbmRleF0udGV4dERlc2MubGVuZ3RoICE9PSAwIHx8IHRoaXMuZGF0YS5tZWFsTGlzdFtpbmRleF0uaW1hZ2VMaXN0Lmxlbmd0aCAhPT0gMCB8fCB0aGlzLmRhdGEubWVhbExpc3RbaW5kZXhdLmlzU2tpcCkge1xuICAgICAgdGhpcy5yaW5nQ2hhcnQub3B0cy5zZXJpZXNbaW5kZXhdLmNvbG9yID0gJyNlZDJjNDgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJpbmdDaGFydC5vcHRzLnNlcmllc1tpbmRleF0uY29sb3IgPSAnI2ZmZmZmZic7XG4gICAgfVxuICAgIHRoaXMucmluZ0NoYXJ0LnVwZGF0ZURhdGEoKTtcbiAgICAvL2NoZWNrIHdoZXRoZXIgc2hvdWxkIHNob3cgdGhlIHN1Ym1pdCBidXR0b25cbiAgICBsZXQgY29tcGxldGVkRmxhZyA9IHRydWU7XG4gICAgZm9yIChsZXQgaW5kZXggaW4gdGhpcy5yaW5nQ2hhcnQub3B0cy5zZXJpZXMpIHtcbiAgICAgIGlmICh0aGlzLnJpbmdDaGFydC5vcHRzLnNlcmllc1tpbmRleF0uY29sb3IgPT09ICcjZmZmZmZmJykge1xuICAgICAgICBjb21wbGV0ZWRGbGFnID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjb21wbGV0ZWRGbGFnICE9PSB0aGlzLmRhdGEuY29tcGxldGVkRmxhZyl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBcImNvbXBsZXRlZEZsYWdcIjogY29tcGxldGVkRmxhZ1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxufVxuUGFnZShuZXcgUmVwb3J0KCkpOyJdfQ==