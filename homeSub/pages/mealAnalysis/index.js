"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var interface_1 = require("../../../api/app/interface");
var moment = require("moment");
var uploadFile = require("./../../../api/uploader.js");
var chart = null;
var data = [];
function initChart(canvas, width, height, F2) {
    var map = {};
    data.forEach(function (obj) {
        if (obj.name === '蛋白质') {
            if (obj.percent > 9) {
                return map[obj.name] = "       " + obj.percent + '%' + "    " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
            else {
                return map[obj.name] = "       " + obj.percent + '%' + "      " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
        }
        else if (obj.name === '脂肪') {
            if (obj.percent > 9) {
                return map[obj.name] = "          " + obj.percent + '%' + "    " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
            else {
                return map[obj.name] = "          " + obj.percent + '%' + "      " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
        }
        else {
            if (obj.percent > 9) {
                return map[obj.name] = "   " + obj.percent + '%' + "    " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
            else {
                return map[obj.name] = "   " + obj.percent + '%' + "      " + '推荐' + obj.suggestedPercentageLower + '%-' + obj.suggestedPercentageUpper + '%';
            }
        }
    });
    chart = new F2.Chart({
        el: canvas,
        width: width,
        height: height
    });
    chart.source(data, {
        percent: {
            formatter: function formatter(val) {
                return val + '%';
            }
        }
    });
    chart.tooltip(false);
    chart.legend({
        position: 'right',
        itemFormatter: function itemFormatter(val) {
            return val + ' ' + map[val];
        }
    });
    chart.coord('polar', {
        transposed: true,
        innerRadius: 0.7,
        radius: 1
    });
    chart.axis(false);
    chart.interval()
        .position('a*percent')
        .color('name', ['#FFB400', '#FF5C47', '#FF822D'])
        .adjust('stack');
    chart.render();
    return chart;
}
var MealAnalysis = (function () {
    function MealAnalysis() {
        this.mealType = null;
        this.mealDate = null;
        this.mealLogId = null;
        this.path = null;
        this.title = null;
        this.data = {
            energyStatusArr: [
                '热量摄入较低，会影响新陈代谢，建议您多吃点！',
                '热量摄入合理，请继续保持!',
                '热量摄入略高，会增加体重，影响身体健康，可以少吃点~'
            ],
            foodInfo: {},
            micro: {},
            options: {},
            totalEnergy: 0,
            a: 100,
            b: 30,
            info: null,
            suggestedNumOfDailyFoodCategory: null,
            numOfDailyFoodCategory: null,
            lessType: '',
            energyTip: '',
            intake: null,
            suggestedIntake: null,
            energyStatus: null,
            showMask: false,
            mealName: null,
            hour: null,
            needNumber: null,
        };
    }
    MealAnalysis.prototype.onLoad = function (options) {
        this.mealType = parseInt(options.mealType);
        switch (this.mealType) {
            case 1:
                this.setData({ mealName: '早餐' });
                break;
            case 2:
                this.setData({ mealName: '午餐' });
                break;
            case 3:
                this.setData({ mealName: '晚餐' });
                break;
        }
        this.mealDate = parseInt(options.mealDate);
        this.mealLogId = parseInt(options.mealLogId);
        app.globalData.mealDate = this.mealDate;
        this.title = options.title;
        this.getSimpleDailyAnalysis();
    };
    MealAnalysis.prototype.onShow = function () {
        var hour = Number(moment().format('H'));
        var needNumber;
        if (hour < 10) {
            needNumber = 4;
        }
        else if (hour >= 10 && hour < 16) {
            needNumber = 8;
        }
        else {
            needNumber = 12;
        }
        this.setData({
            hour: hour,
            needNumber: needNumber
        });
    };
    MealAnalysis.prototype.onReady = function () {
        this.getMealMacronutrientAnalysis();
    };
    MealAnalysis.prototype.getSimpleDailyAnalysis = function () {
        var that = this;
        interface_1.default.getSimpleDailyAnalysis({
            date: this.mealDate,
            mealType: this.mealType,
            mealLogId: this.mealLogId
        }).then(function (res) {
            that.parseSimpleDailyAnalysisData(res);
        }).catch(function (err) {
            wx.showToast({ title: err.message, icon: 'none' });
        });
    };
    MealAnalysis.prototype.parseSimpleDailyAnalysisData = function (res) {
        res.lessFoodGroups && res.lessFoodGroups.map(function (item) {
            item.intakeValue.intake = Math.round(item.intakeValue.intake);
            item.intakeValue.suggestedIntake = Math.round(item.intakeValue.suggestedIntake);
        });
        var suggestedNumOfDailyFoodCategory = res.suggestedNumOfDailyFoodCategory, numOfDailyFoodCategory = res.numOfDailyFoodCategory;
        this.setData({
            info: res,
            suggestedNumOfDailyFoodCategory: suggestedNumOfDailyFoodCategory,
            numOfDailyFoodCategory: numOfDailyFoodCategory
        });
    };
    MealAnalysis.prototype.getMealMacronutrientAnalysis = function () {
        var that = this;
        interface_1.default.getMealMacronutrientAnalysis({
            date: this.mealDate,
            mealType: this.mealType,
            mealLogId: this.mealLogId
        }).then(function (res) {
            that.parseMealLogSummaryDate(res);
        }).catch(function (err) {
            wx.showToast({ title: err.message, icon: 'none' });
        });
    };
    MealAnalysis.prototype.parseMealLogSummaryDate = function (res) {
        var lessType = '';
        for (var index in res.macronutrientIntake) {
            var item = res.macronutrientIntake[index];
            var arrItem = {
                name: item.nameCN,
                percent: Math.round(item.percentage.percentage),
                suggestedPercentageLower: item.percentage.suggestedPercentageLower,
                suggestedPercentageUpper: item.percentage.suggestedPercentageUpper,
            };
            data.push(arrItem);
            if (item.percentage.status === -1) {
                lessType += item.nameCN + '、';
            }
        }
        ;
        var salesTrendChartComponent = this.selectComponent('#canvasf2');
        salesTrendChartComponent.init(initChart);
        lessType = lessType.slice(0, lessType.length - 1);
        var intake = Math.round(res.energyIntake.intakeValue.intake);
        var suggestedIntake = Math.round(res.energyIntake.intakeValue.suggestedIntake);
        var energyStatus = res.energyIntake.intakeValue.status;
        this.setData({
            lessType: lessType,
            intake: intake,
            suggestedIntake: suggestedIntake,
            energyStatus: energyStatus
        });
    };
    MealAnalysis.prototype.goSharePage = function () {
        wx.navigateTo({ url: '/pages/foodShare/index?mealId=' + this.mealLogId });
    };
    MealAnalysis.prototype.goHomePage = function () {
        wx.switchTab({ url: "/pages/home/index" });
    };
    MealAnalysis.prototype.handleContinueAdd = function () {
        this.setData({ showMask: true });
    };
    MealAnalysis.prototype.handleHiddenMask = function () {
        this.setData({ showMask: false });
    };
    MealAnalysis.prototype.handleChooseUploadType = function (e) {
        var that = this;
        var index = parseInt(e.currentTarget.dataset.index);
        switch (index) {
            case 0:
                that.chooseImage('camera');
                wx.reportAnalytics('record_type_select', { sourcetype: 'camera' });
                break;
            case 1:
                that.chooseImage('album');
                wx.reportAnalytics('record_type_select', { sourcetype: 'album' });
                break;
            case 2:
                wx.navigateTo({
                    url: "/pages/textSearch/index?title=" + that.title + "&mealType=" + that.mealType + "&naviType=0&filterType=0&mealDate=" + that.mealDate
                });
                wx.reportAnalytics('record_type_select', { sourcetype: 'textSearch' });
                break;
        }
        this.setData({ showMask: false });
    };
    MealAnalysis.prototype.chooseImage = function (sourceType) {
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
    MealAnalysis.prototype.onImageUploadSuccess = function () {
        wx.navigateTo({
            url: './../imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate + "&title=" + this.title
        });
    };
    MealAnalysis.prototype.onImageUploadFailed = function () {
        console.log("uploadfailed");
        wx.hideLoading();
    };
    MealAnalysis.prototype.onUploadProgressing = function (event) {
        console.log("progress:");
    };
    return MealAnalysis;
}());
Page(new MealAnalysis());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBRXBCLHdEQUFpRDtBQUNqRCwrQkFBaUM7QUFDakMsdURBQXlEO0FBR3pELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBUyxHQUFHO1FBQ3ZCLElBQUksR0FBRyxDQUFDLElBQUksS0FBRyxLQUFLLEVBQUM7WUFDbkIsSUFBRyxHQUFHLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQztnQkFDZixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFDLElBQUksR0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUMsR0FBRyxDQUFDO2FBQ3hJO2lCQUFJO2dCQUNILE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLEdBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUUsUUFBUSxHQUFHLElBQUksR0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBQyxHQUFHLENBQUM7YUFDekk7U0FDRjthQUFLLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDM0IsSUFBRyxHQUFHLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQztnQkFDZixPQUFPLEdBQUcsQ0FBQyxH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LEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0csQ0FBQztZQUNELElBQUksRUFBRSxVQUFVLEdBQVE7Z0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSwyQ0FBb0IsR0FBM0I7UUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osR0FBRyxFQUFFLCtCQUErQixHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUMsU0FBUyxHQUFDLElBQUksQ0FBQyxLQUFLO1NBQ3BJLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSwwQ0FBbUIsR0FBMUI7UUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRU0sMENBQW1CLEdBQTFCLFVBQTJCLEtBQVU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBM05ELElBMk5DO0FBRUQsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImxldCBhcHAgPSAgZ2V0QXBwKCk7XG5cbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgdXBsb2FkRmlsZSBmcm9tICcuLy4uLy4uLy4uL2FwaS91cGxvYWRlci5qcyc7XG5cblxubGV0IGNoYXJ0ID0gbnVsbDtcbmxldCBkYXRhID0gW107XG5mdW5jdGlvbiBpbml0Q2hhcnQoY2FudmFzLCB3aWR0aCwgaGVpZ2h0LCBGMikgeyAvLyDkvb/nlKggRjIg57uY5Yi25Zu+6KGoXG4gIGNvbnN0IG1hcCA9IHt9O1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iai5uYW1lPT09J+ibi+eZvei0qCcpe1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArICfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsgJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfVxuICAgIH1lbHNlIGlmIChvYmoubmFtZSA9PT0gJ+iEguiCqicpIHtcbiAgICAgIGlmKG9iai5wZXJjZW50Pjkpe1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScgKyBgICAgIGAgKyfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsgJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgIGArIG9iai5wZXJjZW50ICsgJyUnICsgYCAgICBgICsn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5zb3VyY2UoZGF0YSwge1xuICAgIHBlcmNlbnQ6IHtcbiAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24gZm9ybWF0dGVyKHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsICsgJyUnO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoZmFsc2UpO1xuICBjaGFydC5sZWdlbmQoe1xuICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgIGl0ZW1Gb3JtYXR0ZXI6IGZ1bmN0aW9uIGl0ZW1Gb3JtYXR0ZXIodmFsKSB7XG4gICAgICByZXR1cm4gdmFsICsgJyAnICsgbWFwW3ZhbF07XG4gICAgfVxuICB9KTtcbiAgY2hhcnQuY29vcmQoJ3BvbGFyJywge1xuICAgIHRyYW5zcG9zZWQ6IHRydWUsXG4gICAgaW5uZXJSYWRpdXM6IDAuNyxcbiAgICByYWRpdXM6IDFcbiAgfSk7XG4gIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICBjaGFydC5pbnRlcnZhbCgpXG4gICAgLnBvc2l0aW9uKCdhKnBlcmNlbnQnKVxuICAgIC5jb2xvcignbmFtZScsIFsnI0ZGQjQwMCcsICcjRkY1QzQ3JywgJyNGRjgyMkQnXSlcbiAgICAuYWRqdXN0KCdzdGFjaycpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xufVxudHlwZSBvcHRpb25zID0ge1xuICBtZWFsVHlwZTpudW1iZXJcbiAgbWVhbER0YXRlOm51bWJlclxuICB0aXRsZTpzdHJpbmdcbn1cbmNsYXNzIE1lYWxBbmFseXNpcyB7XG4gIHB1YmxpYyBtZWFsVHlwZSA9IG51bGw7XG4gIHB1YmxpYyBtZWFsRGF0ZSA9IG51bGw7XG4gIHB1YmxpYyBtZWFsTG9nSWQgPSBudWxsO1xuICBwdWJsaWMgcGF0aCA9IG51bGw7XG4gIHB1YmxpYyB0aXRsZSA9IG51bGw7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIGVuZXJneVN0YXR1c0FycjpbXG4gICAgICAn54Ot6YeP5pGE5YWl6L6D5L2O77yM5Lya5b2x5ZON5paw6ZmI5Luj6LCi77yM5bu66K6u5oKo5aSa5ZCD54K577yBJyxcbiAgICAgICfng63ph4/mkYTlhaXlkIjnkIbvvIzor7fnu6fnu63kv53mjIEhJyxcbiAgICAgICfng63ph4/mkYTlhaXnlaXpq5jvvIzkvJrlop7liqDkvZPph43vvIzlvbHlk43ouqvkvZPlgaXlurfvvIzlj6/ku6XlsJHlkIPngrl+J1xuICAgIF0sXG4gICAgZm9vZEluZm86e30sXG4gICAgbWljcm86e30sXG4gICAgb3B0aW9uczp7fSxcbiAgICB0b3RhbEVuZXJneTowLFxuICAgIGE6MTAwLFxuICAgIGI6MzAsXG4gICAgaW5mbzpudWxsLFxuICAgIHN1Z2dlc3RlZE51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6bnVsbCxcbiAgICBudW1PZkRhaWx5Rm9vZENhdGVnb3J5Om51bGwsXG4gICAgbGVzc1R5cGU6JycsIC8vIOeci+WTquS4quenjeexu+aRhOWFpei/h+WwkVxuICAgIGVuZXJneVRpcDonJyxcbiAgICBpbnRha2U6bnVsbCxcbiAgICBzdWdnZXN0ZWRJbnRha2U6bnVsbCxcbiAgICBlbmVyZ3lTdGF0dXM6bnVsbCxcbiAgICBzaG93TWFzazpmYWxzZSxcbiAgICBtZWFsTmFtZTpudWxsLFxuICAgIGhvdXI6bnVsbCxcbiAgICBuZWVkTnVtYmVyOm51bGwsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnM6b3B0aW9ucykge1xuICAgIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChvcHRpb25zLm1lYWxUeXBlKTtcbiAgICBzd2l0Y2ggKHRoaXMubWVhbFR5cGUpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHttZWFsTmFtZTon5pep6aSQJ30pXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe21lYWxOYW1lOifljYjppJAnfSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7bWVhbE5hbWU6J+aZmumkkCd9KVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhpcy5tZWFsRGF0ZSA9IHBhcnNlSW50KG9wdGlvbnMubWVhbERhdGUpO1xuICAgIHRoaXMubWVhbExvZ0lkID0gcGFyc2VJbnQob3B0aW9ucy5tZWFsTG9nSWQpO1xuICAgIGFwcC5nbG9iYWxEYXRhLm1lYWxEYXRlID0gdGhpcy5tZWFsRGF0ZTtcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgICB0aGlzLmdldFNpbXBsZURhaWx5QW5hbHlzaXMoKVxuICB9XG4gIHB1YmxpYyBvblNob3coKXtcbiAgICBjb25zdCBob3VyID0gTnVtYmVyKG1vbWVudCgpLmZvcm1hdCgnSCcpKTtcbiAgICBsZXQgbmVlZE51bWJlcjtcbiAgICBpZihob3VyPDEwKXtcbiAgICAgIG5lZWROdW1iZXIgPSA0XG4gICAgfWVsc2UgaWYoaG91cj49MTAmJmhvdXI8MTYpe1xuICAgICAgbmVlZE51bWJlciA9IDhcbiAgICB9ZWxzZXtcbiAgICAgIG5lZWROdW1iZXIgPSAxMlxuICAgIH1cbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgaG91cixcbiAgICAgIG5lZWROdW1iZXJcbiAgICB9KVxuICB9XG4gIHB1YmxpYyBvblJlYWR5KCl7XG4gICAgdGhpcy5nZXRNZWFsTWFjcm9udXRyaWVudEFuYWx5c2lzKClcbiAgfVxuICAvKipcbiAgICog6K+35rGC6I635Y+W5ZCE5paH5a2X5o+Q56S65L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0U2ltcGxlRGFpbHlBbmFseXNpcygpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgIHJlcXVlc3QuZ2V0U2ltcGxlRGFpbHlBbmFseXNpcyh7XG4gICAgICBkYXRlOnRoaXMubWVhbERhdGUsXG4gICAgICBtZWFsVHlwZTp0aGlzLm1lYWxUeXBlLFxuICAgICAgbWVhbExvZ0lkOnRoaXMubWVhbExvZ0lkXG4gICAgfSkudGhlbihyZXM9PntcbiAgICAgIHRoYXQucGFyc2VTaW1wbGVEYWlseUFuYWx5c2lzRGF0YShyZXMpO1xuICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgd3guc2hvd1RvYXN0KHsgdGl0bGU6IGVyci5tZXNzYWdlLCBpY29uOiAnbm9uZScgfSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDop6PmnpDpobXpnaLkuK3mloflrZfmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZVNpbXBsZURhaWx5QW5hbHlzaXNEYXRhKHJlcyl7XG4gICAgcmVzLmxlc3NGb29kR3JvdXBzJiZyZXMubGVzc0Zvb2RHcm91cHMubWFwKGl0ZW09PntcbiAgICAgIGl0ZW0uaW50YWtlVmFsdWUuaW50YWtlID0gTWF0aC5yb3VuZChpdGVtLmludGFrZVZhbHVlLmludGFrZSlcbiAgICAgIGl0ZW0uaW50YWtlVmFsdWUuc3VnZ2VzdGVkSW50YWtlID0gTWF0aC5yb3VuZChpdGVtLmludGFrZVZhbHVlLnN1Z2dlc3RlZEludGFrZSlcbiAgICB9KTtcbiAgICBsZXQge3N1Z2dlc3RlZE51bU9mRGFpbHlGb29kQ2F0ZWdvcnksbnVtT2ZEYWlseUZvb2RDYXRlZ29yeX0gPSByZXM7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGluZm86cmVzLFxuICAgICAgc3VnZ2VzdGVkTnVtT2ZEYWlseUZvb2RDYXRlZ29yeTpzdWdnZXN0ZWROdW1PZkRhaWx5Rm9vZENhdGVnb3J5LFxuICAgICAgbnVtT2ZEYWlseUZvb2RDYXRlZ29yeTpudW1PZkRhaWx5Rm9vZENhdGVnb3J5XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiDor7fmsYLojrflvpdjYW52YXPnmoTkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBnZXRNZWFsTWFjcm9udXRyaWVudEFuYWx5c2lzKCl7XG4gICAgY29uc3QgdGhhdDphbnkgPSB0aGlzXG4gICAgcmVxdWVzdC5nZXRNZWFsTWFjcm9udXRyaWVudEFuYWx5c2lzKHsgXG4gICAgICBkYXRlOnRoaXMubWVhbERhdGUsXG4gICAgICBtZWFsVHlwZTp0aGlzLm1lYWxUeXBlLFxuICAgICAgbWVhbExvZ0lkOnRoaXMubWVhbExvZ0lkXG4gICAgfSkudGhlbihyZXM9PntcbiAgICAgIHRoYXQucGFyc2VNZWFsTG9nU3VtbWFyeURhdGUocmVzKVxuICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgd3guc2hvd1RvYXN0KHsgdGl0bGU6IGVyci5tZXNzYWdlLCBpY29uOiAnbm9uZScgfSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDop6PmnpDojrflj5bliLDnmoRjYW52YXPkv6Hmga9cbiAgICovXG4gIHB1YmxpYyBwYXJzZU1lYWxMb2dTdW1tYXJ5RGF0ZShyZXM6YW55KXtcbiAgICBsZXQgbGVzc1R5cGUgPSAnJztcbiAgICBmb3IoIGxldCBpbmRleCBpbiByZXMubWFjcm9udXRyaWVudEludGFrZSl7XG4gICAgICAvLyDmlbTnkIZjYW52YXPmlbDmja5cbiAgICAgIGNvbnN0IGl0ZW0gPSByZXMubWFjcm9udXRyaWVudEludGFrZVtpbmRleF07XG4gICAgICBjb25zdCBhcnJJdGVtID0ge1xuICAgICAgICBuYW1lOml0ZW0ubmFtZUNOLFxuICAgICAgICBwZXJjZW50Ok1hdGgucm91bmQoaXRlbS5wZXJjZW50YWdlLnBlcmNlbnRhZ2UpLFxuICAgICAgICBzdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXI6aXRlbS5wZXJjZW50YWdlLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcixcbiAgICAgICAgc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyOml0ZW0ucGVyY2VudGFnZS5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIsXG4gICAgICB9XG4gICAgICBkYXRhLnB1c2goYXJySXRlbSk7XG4gICAgICAvL+aVtOeQhuagh+mimOaVsOaNru+8jOeci+WTquS4quenjeexu+aRhOWFpei/h+WwkVxuICAgICAgaWYoaXRlbS5wZXJjZW50YWdlLnN0YXR1cz09PS0xKXtcbiAgICAgICAgbGVzc1R5cGUrPWl0ZW0ubmFtZUNOKyfjgIEnXG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNjYW52YXNmMicpO1xuICAgIHNhbGVzVHJlbmRDaGFydENvbXBvbmVudC5pbml0KGluaXRDaGFydCk7XG5cbiAgICBsZXNzVHlwZSA9IGxlc3NUeXBlLnNsaWNlKDAsbGVzc1R5cGUubGVuZ3RoLTEpO1xuXG4gICAgY29uc3QgaW50YWtlID0gTWF0aC5yb3VuZChyZXMuZW5lcmd5SW50YWtlLmludGFrZVZhbHVlLmludGFrZSk7IFxuICAgIGNvbnN0IHN1Z2dlc3RlZEludGFrZSA9IE1hdGgucm91bmQocmVzLmVuZXJneUludGFrZS5pbnRha2VWYWx1ZS5zdWdnZXN0ZWRJbnRha2UpOyBcbiAgICBjb25zdCBlbmVyZ3lTdGF0dXMgPSByZXMuZW5lcmd5SW50YWtlLmludGFrZVZhbHVlLnN0YXR1cztcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbGVzc1R5cGU6bGVzc1R5cGUsXG4gICAgICBpbnRha2UsXG4gICAgICBzdWdnZXN0ZWRJbnRha2UsXG4gICAgICBlbmVyZ3lTdGF0dXNcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDljrvliIbkuqtcbiAgICovXG4gIHB1YmxpYyBnb1NoYXJlUGFnZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6ICcvcGFnZXMvZm9vZFNoYXJlL2luZGV4P21lYWxJZD0nK3RoaXMubWVhbExvZ0lkIH0pO1xuICB9XG4gIHB1YmxpYyBnb0hvbWVQYWdlKCl7XG4gICAgd3guc3dpdGNoVGFiKHsgdXJsOiBgL3BhZ2VzL2hvbWUvaW5kZXhgfSlcbiAgfVxuICBwdWJsaWMgaGFuZGxlQ29udGludWVBZGQoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOnRydWV9KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVIaWRkZW5NYXNrKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazpmYWxzZX0pXG4gIH1cbiAgcHVibGljIGhhbmRsZUNob29zZVVwbG9hZFR5cGUoZTphbnkpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzXG4gICAgY29uc3QgaW5kZXggPSBwYXJzZUludChlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbmRleCk7XG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdjYW1lcmEnKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7IHNvdXJjZXR5cGU6ICdjYW1lcmEnIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnYWxidW0nKTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7IHNvdXJjZXR5cGU6ICdhbGJ1bScgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICB1cmw6IFwiL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU9XCIgKyB0aGF0LnRpdGxlICsgXCImbWVhbFR5cGU9XCIgKyB0aGF0Lm1lYWxUeXBlICsgXCImbmF2aVR5cGU9MCZmaWx0ZXJUeXBlPTAmbWVhbERhdGU9XCIgKyB0aGF0Lm1lYWxEYXRlXG4gICAgICAgIH0pO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHsgc291cmNldHlwZTogJ3RleHRTZWFyY2gnIH0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazpmYWxzZX0pXG4gIH1cblxuICBwdWJsaWMgY2hvb3NlSW1hZ2Uoc291cmNlVHlwZTogc3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgc2l6ZVR5cGU6IFsnb3JpZ2luYWwnLCAnY29tcHJlc3NlZCddLFxuICAgICAgc291cmNlVHlwZTogW3NvdXJjZVR5cGVdLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlczogYW55KSB7XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5LiK5Lyg5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXTtcbiAgICAgICAgdGhhdC5wYXRoID0gaW1hZ2VQYXRoO1xuICAgICAgICB1cGxvYWRGaWxlKGltYWdlUGF0aCwgdGhhdC5vbkltYWdlVXBsb2FkU3VjY2VzcywgdGhhdC5vbkltYWdlVXBsb2FkRmFpbGVkLCB0aGF0Lm9uVXBsb2FkUHJvZ3Jlc3NpbmcsIDAsIDApO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRTdWNjZXNzKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICcuLy4uL2ltYWdlVGFnL2luZGV4P2ltYWdlVXJsPScgKyB0aGlzLnBhdGggKyBcIiZtZWFsVHlwZT1cIiArIHRoaXMubWVhbFR5cGUgKyBcIiZtZWFsRGF0ZT1cIiArIHRoaXMubWVhbERhdGUrXCImdGl0bGU9XCIrdGhpcy50aXRsZVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW1hZ2VVcGxvYWRGYWlsZWQoKXtcbiAgICBjb25zb2xlLmxvZyhcInVwbG9hZGZhaWxlZFwiKTtcbiAgICB3eC5oaWRlTG9hZGluZygpO1xuICB9XG5cbiAgcHVibGljIG9uVXBsb2FkUHJvZ3Jlc3NpbmcoZXZlbnQ6IGFueSl7XG4gICAgY29uc29sZS5sb2coXCJwcm9ncmVzczpcIik7XG4gIH1cbn1cblxuUGFnZShuZXcgTWVhbEFuYWx5c2lzKCkpXG4iXX0=