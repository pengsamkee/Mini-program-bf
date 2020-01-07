"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var interface_1 = require("../../../api/app/interface");
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
            mealName: null
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBRXBCLHdEQUFpRDtBQUNqRCx1REFBeUQ7QUFHekQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFTLEdBQUc7UUFDdkIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFHLEtBQUssRUFBQztZQUNuQixJQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDO2dCQUNmLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLEdBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksR0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBQyxHQUFHLENBQUM7YUFDeEk7aUJBQUk7Z0JBQ0gsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRSxRQUFRLEdBQUcsSUFBSSxHQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFDLEdBQUcsQ0FBQzthQUN6STtTQUNGO2FBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtZQUMzQixJQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDO2dCQUNmLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJ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R0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRU0sMENBQW1CLEdBQTFCLFVBQTJCLEtBQVU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBMU1ELElBME1DO0FBRUQsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImxldCBhcHAgPSAgZ2V0QXBwKCk7XG5cbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcbmltcG9ydCAqIGFzIHVwbG9hZEZpbGUgZnJvbSAnLi8uLi8uLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuXG5cbmxldCBjaGFydCA9IG51bGw7XG5sZXQgZGF0YSA9IFtdO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHsgLy8g5L2/55SoIEYyIOe7mOWItuWbvuihqFxuICBjb25zdCBtYXAgPSB7fTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmoubmFtZT09PSfom4vnmb3otKgnKXtcbiAgICAgIGlmKG9iai5wZXJjZW50Pjkpe1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScgKyBgICAgIGAgKyAn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArICfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1cbiAgICB9ZWxzZSBpZiAob2JqLm5hbWUgPT09ICfohILogqonKSB7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnICsgYCAgICBgICsn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArICfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGlmKG9iai5wZXJjZW50Pjkpe1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNoYXJ0ID0gbmV3IEYyLkNoYXJ0KHtcbiAgICBlbDogY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgY2hhcnQuc291cmNlKGRhdGEsIHtcbiAgICBwZXJjZW50OiB7XG4gICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uIGZvcm1hdHRlcih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbCArICclJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBjaGFydC50b29sdGlwKGZhbHNlKTtcbiAgY2hhcnQubGVnZW5kKHtcbiAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICBpdGVtRm9ybWF0dGVyOiBmdW5jdGlvbiBpdGVtRm9ybWF0dGVyKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCArICcgJyArIG1hcFt2YWxdO1xuICAgIH1cbiAgfSk7XG4gIGNoYXJ0LmNvb3JkKCdwb2xhcicsIHtcbiAgICB0cmFuc3Bvc2VkOiB0cnVlLFxuICAgIGlubmVyUmFkaXVzOiAwLjcsXG4gICAgcmFkaXVzOiAxXG4gIH0pO1xuICBjaGFydC5heGlzKGZhbHNlKTtcbiAgY2hhcnQuaW50ZXJ2YWwoKVxuICAgIC5wb3NpdGlvbignYSpwZXJjZW50JylcbiAgICAuY29sb3IoJ25hbWUnLCBbJyNGRkI0MDAnLCAnI0ZGNUM0NycsICcjRkY4MjJEJ10pXG4gICAgLmFkanVzdCgnc3RhY2snKTtcbiAgY2hhcnQucmVuZGVyKCk7XG4gIHJldHVybiBjaGFydDtcbn1cbnR5cGUgb3B0aW9ucyA9IHtcbiAgbWVhbFR5cGU6bnVtYmVyXG4gIG1lYWxEdGF0ZTpudW1iZXJcbiAgdGl0bGU6c3RyaW5nXG59XG5jbGFzcyBNZWFsQW5hbHlzaXMge1xuICBwdWJsaWMgbWVhbFR5cGUgPSBudWxsO1xuICBwdWJsaWMgbWVhbERhdGUgPSBudWxsO1xuICBwdWJsaWMgbWVhbExvZ0lkID0gbnVsbDtcbiAgcHVibGljIHBhdGggPSBudWxsO1xuICBwdWJsaWMgdGl0bGUgPSBudWxsO1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBlbmVyZ3lTdGF0dXNBcnI6W1xuICAgICAgJ+eDremHj+aRhOWFpei+g+S9ju+8jOS8muW9seWTjeaWsOmZiOS7o+iwou+8jOW7uuiuruaCqOWkmuWQg+eCue+8gScsXG4gICAgICAn54Ot6YeP5pGE5YWl5ZCI55CG77yM6K+357un57ut5L+d5oyBIScsXG4gICAgICAn54Ot6YeP5pGE5YWl55Wl6auY77yM5Lya5aKe5Yqg5L2T6YeN77yM5b2x5ZON6Lqr5L2T5YGl5bq377yM5Y+v5Lul5bCR5ZCD54K5fidcbiAgICBdLFxuICAgIGZvb2RJbmZvOnt9LFxuICAgIG1pY3JvOnt9LFxuICAgIG9wdGlvbnM6e30sXG4gICAgdG90YWxFbmVyZ3k6MCxcbiAgICBhOjEwMCxcbiAgICBiOjMwLFxuICAgIGluZm86bnVsbCxcbiAgICBzdWdnZXN0ZWROdW1PZkRhaWx5Rm9vZENhdGVnb3J5Om51bGwsXG4gICAgbnVtT2ZEYWlseUZvb2RDYXRlZ29yeTpudWxsLFxuICAgIGxlc3NUeXBlOicnLCAvLyDnnIvlk6rkuKrnp43nsbvmkYTlhaXov4flsJFcbiAgICBlbmVyZ3lUaXA6JycsXG4gICAgaW50YWtlOm51bGwsXG4gICAgc3VnZ2VzdGVkSW50YWtlOm51bGwsXG4gICAgZW5lcmd5U3RhdHVzOm51bGwsXG4gICAgc2hvd01hc2s6ZmFsc2UsXG4gICAgbWVhbE5hbWU6bnVsbFxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb25zOm9wdGlvbnMpIHtcbiAgICB0aGlzLm1lYWxUeXBlID0gcGFyc2VJbnQob3B0aW9ucy5tZWFsVHlwZSk7XG4gICAgc3dpdGNoICh0aGlzLm1lYWxUeXBlKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7bWVhbE5hbWU6J+aXqemkkCd9KVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHttZWFsTmFtZTon5Y2I6aSQJ30pXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe21lYWxOYW1lOifmmZrppJAnfSlcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMubWVhbERhdGUgPSBwYXJzZUludChvcHRpb25zLm1lYWxEYXRlKTtcbiAgICB0aGlzLm1lYWxMb2dJZCA9IHBhcnNlSW50KG9wdGlvbnMubWVhbExvZ0lkKTtcbiAgICBhcHAuZ2xvYmFsRGF0YS5tZWFsRGF0ZSA9IHRoaXMubWVhbERhdGU7XG4gICAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGU7XG4gICAgdGhpcy5nZXRTaW1wbGVEYWlseUFuYWx5c2lzKClcbiAgfVxuICBwdWJsaWMgb25SZWFkeSgpe1xuICAgIHRoaXMuZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcygpXG4gIH1cbiAgLyoqXG4gICAqIOivt+axguiOt+WPluWQhOaWh+Wtl+aPkOekuuS/oeaBr1xuICAgKi9cbiAgcHVibGljIGdldFNpbXBsZURhaWx5QW5hbHlzaXMoKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICByZXF1ZXN0LmdldFNpbXBsZURhaWx5QW5hbHlzaXMoe1xuICAgICAgZGF0ZTp0aGlzLm1lYWxEYXRlLFxuICAgICAgbWVhbFR5cGU6dGhpcy5tZWFsVHlwZSxcbiAgICAgIG1lYWxMb2dJZDp0aGlzLm1lYWxMb2dJZFxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICB0aGF0LnBhcnNlU2ltcGxlRGFpbHlBbmFseXNpc0RhdGEocmVzKTtcbiAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiBlcnIubWVzc2FnZSwgaWNvbjogJ25vbmUnIH0pXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6aG16Z2i5Lit5paH5a2X5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VTaW1wbGVEYWlseUFuYWx5c2lzRGF0YShyZXMpe1xuICAgIHJlcy5sZXNzRm9vZEdyb3VwcyYmcmVzLmxlc3NGb29kR3JvdXBzLm1hcChpdGVtPT57XG4gICAgICBpdGVtLmludGFrZVZhbHVlLmludGFrZSA9IE1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5pbnRha2UpXG4gICAgICBpdGVtLmludGFrZVZhbHVlLnN1Z2dlc3RlZEludGFrZSA9IE1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5zdWdnZXN0ZWRJbnRha2UpXG4gICAgfSk7XG4gICAgbGV0IHtzdWdnZXN0ZWROdW1PZkRhaWx5Rm9vZENhdGVnb3J5LG51bU9mRGFpbHlGb29kQ2F0ZWdvcnl9ID0gcmVzO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpbmZvOnJlcyxcbiAgICAgIHN1Z2dlc3RlZE51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6c3VnZ2VzdGVkTnVtT2ZEYWlseUZvb2RDYXRlZ29yeSxcbiAgICAgIG51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6bnVtT2ZEYWlseUZvb2RDYXRlZ29yeVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICog6K+35rGC6I635b6XY2FudmFz55qE5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcygpe1xuICAgIGNvbnN0IHRoYXQ6YW55ID0gdGhpc1xuICAgIHJlcXVlc3QuZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcyh7IFxuICAgICAgZGF0ZTp0aGlzLm1lYWxEYXRlLFxuICAgICAgbWVhbFR5cGU6dGhpcy5tZWFsVHlwZSxcbiAgICAgIG1lYWxMb2dJZDp0aGlzLm1lYWxMb2dJZFxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICB0aGF0LnBhcnNlTWVhbExvZ1N1bW1hcnlEYXRlKHJlcylcbiAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiBlcnIubWVzc2FnZSwgaWNvbjogJ25vbmUnIH0pXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6I635Y+W5Yiw55qEY2FudmFz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcGFyc2VNZWFsTG9nU3VtbWFyeURhdGUocmVzOmFueSl7XG4gICAgbGV0IGxlc3NUeXBlID0gJyc7XG4gICAgZm9yKCBsZXQgaW5kZXggaW4gcmVzLm1hY3JvbnV0cmllbnRJbnRha2Upe1xuICAgICAgLy8g5pW055CGY2FudmFz5pWw5o2uXG4gICAgICBjb25zdCBpdGVtID0gcmVzLm1hY3JvbnV0cmllbnRJbnRha2VbaW5kZXhdO1xuICAgICAgY29uc3QgYXJySXRlbSA9IHtcbiAgICAgICAgbmFtZTppdGVtLm5hbWVDTixcbiAgICAgICAgcGVyY2VudDpNYXRoLnJvdW5kKGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKSxcbiAgICAgICAgc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyOml0ZW0ucGVyY2VudGFnZS5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIsXG4gICAgICAgIHN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcjppdGVtLnBlcmNlbnRhZ2Uuc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyLFxuICAgICAgfVxuICAgICAgZGF0YS5wdXNoKGFyckl0ZW0pO1xuICAgICAgLy/mlbTnkIbmoIfpopjmlbDmja7vvIznnIvlk6rkuKrnp43nsbvmkYTlhaXov4flsJFcbiAgICAgIGlmKGl0ZW0ucGVyY2VudGFnZS5zdGF0dXM9PT0tMSl7XG4gICAgICAgIGxlc3NUeXBlKz1pdGVtLm5hbWVDTisn44CBJ1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IHNhbGVzVHJlbmRDaGFydENvbXBvbmVudCA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjY2FudmFzZjInKTtcbiAgICBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQuaW5pdChpbml0Q2hhcnQpO1xuXG4gICAgbGVzc1R5cGUgPSBsZXNzVHlwZS5zbGljZSgwLGxlc3NUeXBlLmxlbmd0aC0xKTtcblxuICAgIGNvbnN0IGludGFrZSA9IE1hdGgucm91bmQocmVzLmVuZXJneUludGFrZS5pbnRha2VWYWx1ZS5pbnRha2UpOyBcbiAgICBjb25zdCBzdWdnZXN0ZWRJbnRha2UgPSBNYXRoLnJvdW5kKHJlcy5lbmVyZ3lJbnRha2UuaW50YWtlVmFsdWUuc3VnZ2VzdGVkSW50YWtlKTsgXG4gICAgY29uc3QgZW5lcmd5U3RhdHVzID0gcmVzLmVuZXJneUludGFrZS5pbnRha2VWYWx1ZS5zdGF0dXM7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGxlc3NUeXBlOmxlc3NUeXBlLFxuICAgICAgaW50YWtlLFxuICAgICAgc3VnZ2VzdGVkSW50YWtlLFxuICAgICAgZW5lcmd5U3RhdHVzXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog5Y675YiG5LqrXG4gICAqL1xuICBwdWJsaWMgZ29TaGFyZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnL3BhZ2VzL2Zvb2RTaGFyZS9pbmRleD9tZWFsSWQ9Jyt0aGlzLm1lYWxMb2dJZCB9KTtcbiAgfVxuICBwdWJsaWMgZ29Ib21lUGFnZSgpe1xuICAgIHd4LnN3aXRjaFRhYih7IHVybDogYC9wYWdlcy9ob21lL2luZGV4YH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZUNvbnRpbnVlQWRkKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93TWFzazp0cnVlfSlcbiAgfVxuICBwdWJsaWMgaGFuZGxlSGlkZGVuTWFzaygpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVDaG9vc2VVcGxvYWRUeXBlKGU6YW55KXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5kZXgpO1xuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhhdC5jaG9vc2VJbWFnZSgnY2FtZXJhJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0JywgeyBzb3VyY2V0eXBlOiAnY2FtZXJhJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2FsYnVtJyk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0JywgeyBzb3VyY2V0eXBlOiAnYWxidW0nIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgdXJsOiBcIi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPVwiICsgdGhhdC50aXRsZSArIFwiJm1lYWxUeXBlPVwiICsgdGhhdC5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTAmZmlsdGVyVHlwZT0wJm1lYWxEYXRlPVwiICsgdGhhdC5tZWFsRGF0ZVxuICAgICAgICB9KTtcbiAgICAgICAgd3gucmVwb3J0QW5hbHl0aWNzKCdyZWNvcmRfdHlwZV9zZWxlY3QnLCB7IHNvdXJjZXR5cGU6ICd0ZXh0U2VhcmNoJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6ZmFsc2V9KVxuICB9XG5cbiAgcHVibGljIGNob29zZUltYWdlKHNvdXJjZVR5cGU6IHN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5jaG9vc2VJbWFnZSh7XG4gICAgICBjb3VudDogMSxcbiAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJywgJ2NvbXByZXNzZWQnXSxcbiAgICAgIHNvdXJjZVR5cGU6IFtzb3VyY2VUeXBlXSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xuICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuS4iuS8oOS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgICAgICBsZXQgaW1hZ2VQYXRoID0gcmVzLnRlbXBGaWxlUGF0aHNbMF07XG4gICAgICAgIHRoYXQucGF0aCA9IGltYWdlUGF0aDtcbiAgICAgICAgdXBsb2FkRmlsZShpbWFnZVBhdGgsIHRoYXQub25JbWFnZVVwbG9hZFN1Y2Nlc3MsIHRoYXQub25JbWFnZVVwbG9hZEZhaWxlZCwgdGhhdC5vblVwbG9hZFByb2dyZXNzaW5nLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkU3VjY2Vzcygpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi8uLi9pbWFnZVRhZy9pbmRleD9pbWFnZVVybD0nICsgdGhpcy5wYXRoICsgXCImbWVhbFR5cGU9XCIgKyB0aGlzLm1lYWxUeXBlICsgXCImbWVhbERhdGU9XCIgKyB0aGlzLm1lYWxEYXRlK1wiJnRpdGxlPVwiK3RoaXMudGl0bGVcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkltYWdlVXBsb2FkRmFpbGVkKCl7XG4gICAgY29uc29sZS5sb2coXCJ1cGxvYWRmYWlsZWRcIik7XG4gICAgd3guaGlkZUxvYWRpbmcoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblVwbG9hZFByb2dyZXNzaW5nKGV2ZW50OiBhbnkpe1xuICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3M6XCIpO1xuICB9XG59XG5cblBhZ2UobmV3IE1lYWxBbmFseXNpcygpKVxuIl19