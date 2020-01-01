"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interface_1 = require("../../../api/app/interface");
var uploadFile = require("./../../../api/uploader.js");
var chart = null;
var data = [];
function initChart(canvas, width, height, F2) {
    var map = {};
    data.forEach(function (obj) {
        console.log(obj);
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
        wx.switchTab({ url: '/pages/home/index' });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdEQUFpRDtBQUNqRCx1REFBeUQ7QUFHekQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDMUMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFTLEdBQUc7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUcsS0FBSyxFQUFDO1lBQ25CLElBQUcsR0FBRyxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQUM7Z0JBQ2YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFDLEdBQUcsQ0FBQzthQUN4STtpQkFBSTtnQkFDSCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFFLFFBQVEsR0FBRyxJQUFJLEdBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFDLElBQUksR0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUMsR0FBRyxDQUFDO2FBQ3pJO1NBQ0Y7YUFBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzNCLElBQUcsR0FBRyxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQUM7Z0JBQ2YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFD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Q0FBQztJQUNuQixDQUFDO0lBRU0sMENBQW1CLEdBQTFCLFVBQTJCLEtBQVU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBek1ELElBeU1DO0FBRUQsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcbmltcG9ydCAqIGFzIHVwbG9hZEZpbGUgZnJvbSAnLi8uLi8uLi8uLi9hcGkvdXBsb2FkZXIuanMnO1xuXG5cbmxldCBjaGFydCA9IG51bGw7XG5sZXQgZGF0YSA9IFtdO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHsgLy8g5L2/55SoIEYyIOe7mOWItuWbvuihqFxuICBjb25zdCBtYXAgPSB7fTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKG9iaikge1xuICAgIGNvbnNvbGUubG9nKG9iailcbiAgICBpZiAob2JqLm5hbWU9PT0n6JuL55m96LSoJyl7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnICsgYCAgICBgICsgJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICBgKyBvYmoucGVyY2VudCArICclJysgYCAgICAgIGAgKyAn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9XG4gICAgfWVsc2UgaWYgKG9iai5uYW1lID09PSAn6ISC6IKqJykge1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArJ+aOqOiNkCcrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VMb3dlcisnJS0nK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlVXBwZXIrJyUnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICAgICBgKyBvYmoucGVyY2VudCArICclJysgYCAgICAgIGAgKyAn5o6o6I2QJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyKyclLScrb2JqLnN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcisnJSc7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScgKyBgICAgIGAgKyfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICBgKyBvYmoucGVyY2VudCArICclJysgYCAgICAgIGAgKyfmjqjojZAnK29iai5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIrJyUtJytvYmouc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyKyclJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBjaGFydCA9IG5ldyBGMi5DaGFydCh7XG4gICAgZWw6IGNhbnZhcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSk7XG4gIGNoYXJ0LnNvdXJjZShkYXRhLCB7XG4gICAgcGVyY2VudDoge1xuICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbiBmb3JtYXR0ZXIodmFsKSB7XG4gICAgICAgIHJldHVybiB2YWwgKyAnJSc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgY2hhcnQudG9vbHRpcChmYWxzZSk7XG4gIGNoYXJ0LmxlZ2VuZCh7XG4gICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgaXRlbUZvcm1hdHRlcjogZnVuY3Rpb24gaXRlbUZvcm1hdHRlcih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgKyAnICcgKyBtYXBbdmFsXTtcbiAgICB9XG4gIH0pO1xuICBjaGFydC5jb29yZCgncG9sYXInLCB7XG4gICAgdHJhbnNwb3NlZDogdHJ1ZSxcbiAgICBpbm5lclJhZGl1czogMC43LFxuICAgIHJhZGl1czogMVxuICB9KTtcbiAgY2hhcnQuYXhpcyhmYWxzZSk7XG4gIGNoYXJ0LmludGVydmFsKClcbiAgICAucG9zaXRpb24oJ2EqcGVyY2VudCcpXG4gICAgLmNvbG9yKCduYW1lJywgWycjRkZCNDAwJywgJyNGRjVDNDcnLCAnI0ZGODIyRCddKVxuICAgIC5hZGp1c3QoJ3N0YWNrJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG59XG50eXBlIG9wdGlvbnMgPSB7XG4gIG1lYWxUeXBlOm51bWJlclxuICBtZWFsRHRhdGU6bnVtYmVyXG4gIHRpdGxlOnN0cmluZ1xufVxuY2xhc3MgTWVhbEFuYWx5c2lzIHtcbiAgcHVibGljIG1lYWxUeXBlID0gbnVsbDtcbiAgcHVibGljIG1lYWxEYXRlID0gbnVsbDtcbiAgcHVibGljIG1lYWxMb2dJZCA9IG51bGw7XG4gIHB1YmxpYyBwYXRoID0gbnVsbDtcbiAgcHVibGljIHRpdGxlID0gbnVsbDtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgZW5lcmd5U3RhdHVzQXJyOltcbiAgICAgICfng63ph4/mkYTlhaXovoPkvY7vvIzkvJrlvbHlk43mlrDpmYjku6PosKLvvIzlu7rorq7mgqjlpJrlkIPngrnvvIEnLFxuICAgICAgJ+eDremHj+aRhOWFpeWQiOeQhu+8jOivt+e7p+e7reS/neaMgSEnLFxuICAgICAgJ+eDremHj+aRhOWFpeeVpemrmO+8jOS8muWinuWKoOS9k+mHje+8jOW9seWTjei6q+S9k+WBpeW6t++8jOWPr+S7peWwkeWQg+eCuX4nXG4gICAgXSxcbiAgICBmb29kSW5mbzp7fSxcbiAgICBtaWNybzp7fSxcbiAgICBvcHRpb25zOnt9LFxuICAgIHRvdGFsRW5lcmd5OjAsXG4gICAgYToxMDAsXG4gICAgYjozMCxcbiAgICBpbmZvOm51bGwsXG4gICAgc3VnZ2VzdGVkTnVtT2ZEYWlseUZvb2RDYXRlZ29yeTpudWxsLFxuICAgIG51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6bnVsbCxcbiAgICBsZXNzVHlwZTonJywgLy8g55yL5ZOq5Liq56eN57G75pGE5YWl6L+H5bCRXG4gICAgZW5lcmd5VGlwOicnLFxuICAgIGludGFrZTpudWxsLFxuICAgIHN1Z2dlc3RlZEludGFrZTpudWxsLFxuICAgIGVuZXJneVN0YXR1czpudWxsLFxuICAgIHNob3dNYXNrOmZhbHNlLFxuICAgIG1lYWxOYW1lOm51bGxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uczpvcHRpb25zKSB7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHBhcnNlSW50KG9wdGlvbnMubWVhbFR5cGUpO1xuICAgIHN3aXRjaCAodGhpcy5tZWFsVHlwZSkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe21lYWxOYW1lOifml6nppJAnfSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7bWVhbE5hbWU6J+WNiOmkkCd9KVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHttZWFsTmFtZTon5pma6aSQJ30pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLm1lYWxEYXRlID0gcGFyc2VJbnQob3B0aW9ucy5tZWFsRGF0ZSk7XG4gICAgdGhpcy5tZWFsTG9nSWQgPSBwYXJzZUludChvcHRpb25zLm1lYWxMb2dJZCk7XG4gICAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGU7XG4gICAgdGhpcy5nZXRTaW1wbGVEYWlseUFuYWx5c2lzKClcbiAgfVxuICBwdWJsaWMgb25SZWFkeSgpe1xuICAgIHRoaXMuZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcygpXG4gIH1cbiAgLyoqXG4gICAqIOivt+axguiOt+WPluWQhOaWh+Wtl+aPkOekuuS/oeaBr1xuICAgKi9cbiAgcHVibGljIGdldFNpbXBsZURhaWx5QW5hbHlzaXMoKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICByZXF1ZXN0LmdldFNpbXBsZURhaWx5QW5hbHlzaXMoe1xuICAgICAgZGF0ZTp0aGlzLm1lYWxEYXRlLFxuICAgICAgbWVhbFR5cGU6dGhpcy5tZWFsVHlwZSxcbiAgICAgIG1lYWxMb2dJZDp0aGlzLm1lYWxMb2dJZFxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICB0aGF0LnBhcnNlU2ltcGxlRGFpbHlBbmFseXNpc0RhdGEocmVzKTtcbiAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiBlcnIubWVzc2FnZSwgaWNvbjogJ25vbmUnIH0pXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6aG16Z2i5Lit5paH5a2X5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VTaW1wbGVEYWlseUFuYWx5c2lzRGF0YShyZXMpe1xuICAgIHJlcy5sZXNzRm9vZEdyb3VwcyYmcmVzLmxlc3NGb29kR3JvdXBzLm1hcChpdGVtPT57XG4gICAgICBpdGVtLmludGFrZVZhbHVlLmludGFrZSA9IE1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5pbnRha2UpXG4gICAgICBpdGVtLmludGFrZVZhbHVlLnN1Z2dlc3RlZEludGFrZSA9IE1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5zdWdnZXN0ZWRJbnRha2UpXG4gICAgfSk7XG4gICAgbGV0IHtzdWdnZXN0ZWROdW1PZkRhaWx5Rm9vZENhdGVnb3J5LG51bU9mRGFpbHlGb29kQ2F0ZWdvcnl9ID0gcmVzO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpbmZvOnJlcyxcbiAgICAgIHN1Z2dlc3RlZE51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6c3VnZ2VzdGVkTnVtT2ZEYWlseUZvb2RDYXRlZ29yeSxcbiAgICAgIG51bU9mRGFpbHlGb29kQ2F0ZWdvcnk6bnVtT2ZEYWlseUZvb2RDYXRlZ29yeVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICog6K+35rGC6I635b6XY2FudmFz55qE5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcygpe1xuICAgIGNvbnN0IHRoYXQ6YW55ID0gdGhpc1xuICAgIHJlcXVlc3QuZ2V0TWVhbE1hY3JvbnV0cmllbnRBbmFseXNpcyh7IFxuICAgICAgZGF0ZTp0aGlzLm1lYWxEYXRlLFxuICAgICAgbWVhbFR5cGU6dGhpcy5tZWFsVHlwZSxcbiAgICAgIG1lYWxMb2dJZDp0aGlzLm1lYWxMb2dJZFxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICB0aGF0LnBhcnNlTWVhbExvZ1N1bW1hcnlEYXRlKHJlcylcbiAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7IHRpdGxlOiBlcnIubWVzc2FnZSwgaWNvbjogJ25vbmUnIH0pXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog6Kej5p6Q6I635Y+W5Yiw55qEY2FudmFz5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgcGFyc2VNZWFsTG9nU3VtbWFyeURhdGUocmVzOmFueSl7XG4gICAgbGV0IGxlc3NUeXBlID0gJyc7XG4gICAgZm9yKCBsZXQgaW5kZXggaW4gcmVzLm1hY3JvbnV0cmllbnRJbnRha2Upe1xuICAgICAgLy8g5pW055CGY2FudmFz5pWw5o2uXG4gICAgICBjb25zdCBpdGVtID0gcmVzLm1hY3JvbnV0cmllbnRJbnRha2VbaW5kZXhdO1xuICAgICAgY29uc3QgYXJySXRlbSA9IHtcbiAgICAgICAgbmFtZTppdGVtLm5hbWVDTixcbiAgICAgICAgcGVyY2VudDpNYXRoLnJvdW5kKGl0ZW0ucGVyY2VudGFnZS5wZXJjZW50YWdlKSxcbiAgICAgICAgc3VnZ2VzdGVkUGVyY2VudGFnZUxvd2VyOml0ZW0ucGVyY2VudGFnZS5zdWdnZXN0ZWRQZXJjZW50YWdlTG93ZXIsXG4gICAgICAgIHN1Z2dlc3RlZFBlcmNlbnRhZ2VVcHBlcjppdGVtLnBlcmNlbnRhZ2Uuc3VnZ2VzdGVkUGVyY2VudGFnZVVwcGVyLFxuICAgICAgfVxuICAgICAgZGF0YS5wdXNoKGFyckl0ZW0pO1xuICAgICAgLy/mlbTnkIbmoIfpopjmlbDmja7vvIznnIvlk6rkuKrnp43nsbvmkYTlhaXov4flsJFcbiAgICAgIGlmKGl0ZW0ucGVyY2VudGFnZS5zdGF0dXM9PT0tMSl7XG4gICAgICAgIGxlc3NUeXBlKz1pdGVtLm5hbWVDTisn44CBJ1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IHNhbGVzVHJlbmRDaGFydENvbXBvbmVudCA9IHRoaXMuc2VsZWN0Q29tcG9uZW50KCcjY2FudmFzZjInKTtcbiAgICBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQuaW5pdChpbml0Q2hhcnQpO1xuXG4gICAgbGVzc1R5cGUgPSBsZXNzVHlwZS5zbGljZSgwLGxlc3NUeXBlLmxlbmd0aC0xKTtcblxuICAgIGNvbnN0IGludGFrZSA9IE1hdGgucm91bmQocmVzLmVuZXJneUludGFrZS5pbnRha2VWYWx1ZS5pbnRha2UpOyBcbiAgICBjb25zdCBzdWdnZXN0ZWRJbnRha2UgPSBNYXRoLnJvdW5kKHJlcy5lbmVyZ3lJbnRha2UuaW50YWtlVmFsdWUuc3VnZ2VzdGVkSW50YWtlKTsgXG4gICAgY29uc3QgZW5lcmd5U3RhdHVzID0gcmVzLmVuZXJneUludGFrZS5pbnRha2VWYWx1ZS5zdGF0dXM7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGxlc3NUeXBlOmxlc3NUeXBlLFxuICAgICAgaW50YWtlLFxuICAgICAgc3VnZ2VzdGVkSW50YWtlLFxuICAgICAgZW5lcmd5U3RhdHVzXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog5Y675YiG5LqrXG4gICAqL1xuICBwdWJsaWMgZ29TaGFyZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnL3BhZ2VzL2Zvb2RTaGFyZS9pbmRleD9tZWFsSWQ9Jyt0aGlzLm1lYWxMb2dJZCB9KTtcbiAgfVxuICBwdWJsaWMgZ29Ib21lUGFnZSgpe1xuICAgIHd4LnN3aXRjaFRhYih7IHVybDogJy9wYWdlcy9ob21lL2luZGV4JyB9KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVDb250aW51ZUFkZCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd01hc2s6dHJ1ZX0pXG4gIH1cbiAgcHVibGljIGhhbmRsZUhpZGRlbk1hc2soKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOmZhbHNlfSlcbiAgfVxuICBwdWJsaWMgaGFuZGxlQ2hvb3NlVXBsb2FkVHlwZShlOmFueSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHRoYXQuY2hvb3NlSW1hZ2UoJ2NhbWVyYScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHsgc291cmNldHlwZTogJ2NhbWVyYScgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGF0LmNob29zZUltYWdlKCdhbGJ1bScpO1xuICAgICAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3JlY29yZF90eXBlX3NlbGVjdCcsIHsgc291cmNldHlwZTogJ2FsYnVtJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgIHVybDogXCIvcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT1cIiArIHRoYXQudGl0bGUgKyBcIiZtZWFsVHlwZT1cIiArIHRoYXQubWVhbFR5cGUgKyBcIiZuYXZpVHlwZT0wJmZpbHRlclR5cGU9MCZtZWFsRGF0ZT1cIiArIHRoYXQubWVhbERhdGVcbiAgICAgICAgfSk7XG4gICAgICAgIHd4LnJlcG9ydEFuYWx5dGljcygncmVjb3JkX3R5cGVfc2VsZWN0JywgeyBzb3VyY2V0eXBlOiAndGV4dFNlYXJjaCcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dNYXNrOmZhbHNlfSlcbiAgfVxuXG4gIHB1YmxpYyBjaG9vc2VJbWFnZShzb3VyY2VUeXBlOiBzdHJpbmcpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guY2hvb3NlSW1hZ2Uoe1xuICAgICAgY291bnQ6IDEsXG4gICAgICBzaXplVHlwZTogWydvcmlnaW5hbCcsICdjb21wcmVzc2VkJ10sXG4gICAgICBzb3VyY2VUeXBlOiBbc291cmNlVHlwZV0sXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzOiBhbnkpIHtcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLkuIrkvKDkuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICAgICAgbGV0IGltYWdlUGF0aCA9IHJlcy50ZW1wRmlsZVBhdGhzWzBdO1xuICAgICAgICB0aGF0LnBhdGggPSBpbWFnZVBhdGg7XG4gICAgICAgIHVwbG9hZEZpbGUoaW1hZ2VQYXRoLCB0aGF0Lm9uSW1hZ2VVcGxvYWRTdWNjZXNzLCB0aGF0Lm9uSW1hZ2VVcGxvYWRGYWlsZWQsIHRoYXQub25VcGxvYWRQcm9ncmVzc2luZywgMCwgMCk7XG4gICAgICB9LFxuICAgICAgZmFpbDogZnVuY3Rpb24gKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZFN1Y2Nlc3MoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogJy4vLi4vaW1hZ2VUYWcvaW5kZXg/aW1hZ2VVcmw9JyArIHRoaXMucGF0aCArIFwiJm1lYWxUeXBlPVwiICsgdGhpcy5tZWFsVHlwZSArIFwiJm1lYWxEYXRlPVwiICsgdGhpcy5tZWFsRGF0ZStcIiZ0aXRsZT1cIit0aGlzLnRpdGxlXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbWFnZVVwbG9hZEZhaWxlZCgpe1xuICAgIGNvbnNvbGUubG9nKFwidXBsb2FkZmFpbGVkXCIpO1xuICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgb25VcGxvYWRQcm9ncmVzc2luZyhldmVudDogYW55KXtcbiAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOlwiKTtcbiAgfVxufVxuXG5QYWdlKG5ldyBNZWFsQW5hbHlzaXMoKSlcbiJdfQ==