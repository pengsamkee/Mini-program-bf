"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var interface_1 = require("../../../api/app/interface");
var chart = null;
var data1 = [];
function initChart(canvas, width, height, F2) {
    var map = {};
    data1.forEach(function (obj) {
        console.log(obj);
        if (obj.name === '蛋白质') {
            if (obj.percent > 9) {
                return map[obj.name] = "       " + obj.percent + '%' + "    " + obj.content + obj.unit;
            }
            else {
                return map[obj.name] = "       " + obj.percent + '%' + "      " + obj.content + obj.unit;
            }
        }
        else if (obj.name === '脂肪') {
            if (obj.percent > 9) {
                return map[obj.name] = "          " + obj.percent + '%' + "    " + obj.content + obj.unit;
            }
            else {
                return map[obj.name] = "          " + obj.percent + '%' + "      " + obj.content + obj.unit;
            }
        }
        else {
            if (obj.percent > 9) {
                return map[obj.name] = "   " + obj.percent + '%' + "    " + obj.content + obj.unit;
            }
            else {
                return map[obj.name] = "   " + obj.percent + '%' + "      " + obj.content + obj.unit;
            }
        }
    });
    chart = new F2.Chart({
        el: canvas,
        width: width,
        height: height
    });
    chart.source(data1, {
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
var FoodDetail = (function () {
    function FoodDetail() {
        this.mealLogId = -1;
        this.divideproportion = 0;
        this.data = {
            currentTagIndex: 0,
            taggs: [],
            imageUrl: "",
            pixelRatio: 2,
            imageWidth: 0,
            imageHeight: 0,
            energy: null,
        };
    }
    FoodDetail.prototype.onLoad = function (option) {
        var parsedInfo = JSON.parse(option.paramJson);
        this.setData({ imageUrl: parsedInfo.imageUrl });
        this.mealLogId = parsedInfo.mealId;
    };
    FoodDetail.prototype.onReady = function () {
        this.getRecognitionResult();
    };
    FoodDetail.prototype.getRecognitionResult = function () {
        var that = this;
        wx.showLoading({ title: "识别中...", mask: true });
        if (this.data.imageHeight === 0) {
            wx.getImageInfo({
                src: that.data.imageUrl,
                success: function (res) {
                    if (res.height / res.width > 0.96) {
                        that.divideproportion = res.height / 720;
                        that.setData({
                            imageHeight: 720,
                            imageWidth: res.width * 720 / res.height
                        });
                    }
                    else {
                        that.divideproportion = res.width / 750;
                        that.setData({
                            imageWidth: 750,
                            imageHeight: res.height * 720 / res.width
                        });
                    }
                    that.getMealLogSummary();
                }
            });
        }
        else {
            that.getMealLogSummary();
        }
    };
    FoodDetail.prototype.getMealLogSummary = function () {
        var that = this;
        interface_1.default.getMealLogSummary({
            mealLogId: that.mealLogId
        }).then(function (res) {
            that.parseGetRecognitionResult(res);
            wx.hideLoading({});
        }).catch(function (err) {
            wx.hideLoading();
            wx.showModal({
                title: '获取识别结果失败',
                content: JSON.stringify(err),
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.parseGetRecognitionResult = function (resp) {
        var _this = this;
        var taggs = [];
        resp.foodLogSummaryList.map(function (item) {
            var it = __assign({}, item, { tagX: item.tagX / (_this.divideproportion * 2), tagY: item.tagY / (_this.divideproportion * 2) });
            taggs.push(it);
        });
        this.setData({
            taggs: taggs,
            energy: Math.round(resp.energy)
        }, function () {
            console.log('整理得到初始taggs', _this.data.taggs);
        });
        for (var index in resp.simpleMacronutrientIntake) {
            var item = resp.simpleMacronutrientIntake[index];
            var arrItem = {
                name: item.nameCN,
                percent: Math.round(item.intakeValue.percentage),
                content: Math.round(item.intakeValue.intake),
                unit: item.intakeValue.unit
            };
            data1.push(arrItem);
        }
        var salesTrendChartComponent = this.selectComponent('#canvasf2');
        salesTrendChartComponent.init(initChart);
    };
    FoodDetail.prototype.handleDeleteTag = function (e) {
        var that = this;
        var index = e.currentTarget.dataset.textIndex;
        var taggs = this.data.taggs.slice();
        if (this.data.taggs.length == 1) {
            interface_1.default.deleteMealLog({
                mealLogId: this.mealLogId
            }).then(function (res) {
                if (res === true) {
                    taggs.splice(index, 1);
                    that.setData({ taggs: taggs });
                    wx.switchTab({ url: '/pages/home/index' });
                }
                else {
                    wx.showToast({ title: '删除食物失败', icon: "none" });
                }
            }).catch(function (err) {
                wx.showToast({ title: '删除食物失败', icon: "none" });
            });
        }
        else {
            interface_1.default.deleteFoodLog({
                foodLogId: taggs[index].foodLogId,
                foodType: taggs[index].foodType
            }).then(function (res) {
                if (res === true) {
                    taggs.splice(index, 1);
                    that.setData({ taggs: taggs }, function () {
                        that.getMealLogSummary();
                    });
                }
                else {
                    wx.showToast({ title: '删除食物失败', icon: "none" });
                }
            }).catch(function (err) {
                wx.showToast({ title: '删除食物失败', icon: "none" });
            });
        }
    };
    FoodDetail.prototype.onTagMove = function (event) {
        var _a;
        var index = event.currentTarget.dataset.tagIndex;
        var xOperation = "taggs[" + index + "].tag_x";
        var yOperation = "taggs[" + index + "].tag_y";
        this.setData((_a = {},
            _a[xOperation] = event.detail.x,
            _a[yOperation] = event.detail.y,
            _a));
    };
    FoodDetail.prototype.handleGoSharePage = function () {
        wx.navigateTo({ url: "/pages/foodShare/index?mealId=" + this.mealLogId });
    };
    return FoodDetail;
}());
Page(new FoodDetail());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQWdEO0FBRWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBUyxHQUFHO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFHLEtBQUssRUFBQztZQUNuQixJQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDO2dCQUNmLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLEdBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQzthQUN2RjtpQkFBSTtnQkFDSCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFFLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDeEY7U0FDRjthQUFLLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDM0IsSUFBRyxHQUFHLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQztnQkFDZixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFH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QUFDLENBQUE7aUJBQ0g7cUJBQUk7b0JBQ0gsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUE7aUJBQzNDO1lBQ0gsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRztnQkFDVixFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQTtZQUM1QyxDQUFDLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQztJQUVNLDhCQUFTLEdBQWhCLFVBQWlCLEtBQVU7O1FBQ3pCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqRCxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUM5QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUM3QyxJQUFZLENBQUMsT0FBTztZQUNuQixHQUFDLFVBQVUsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsR0FBQyxVQUFVLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO0lBQ0wsQ0FBQztJQUtNLHNDQUFpQixHQUF4QjtRQUNFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBQyxHQUFHLEVBQUUsbUNBQWlDLElBQUksQ0FBQyxTQUFXLEVBQUMsQ0FBQyxDQUFDO0lBRTFFLENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUE1S0QsSUE0S0M7QUFFRCxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSdcblxubGV0IGNoYXJ0ID0gbnVsbDtcbmxldCBkYXRhMSA9IFtdO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHsgLy8g5L2/55SoIEYyIOe7mOWItuWbvuihqFxuICBjb25zdCBtYXAgPSB7fTtcbiAgZGF0YTEuZm9yRWFjaChmdW5jdGlvbihvYmopIHtcbiAgICBjb25zb2xlLmxvZyhvYmopXG4gICAgaWYgKG9iai5uYW1lPT09J+ibi+eZvei0qCcpe1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfWVsc2UgaWYgKG9iai5uYW1lID09PSAn6ISC6IKqJykge1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScgKyBgICAgIGAgKyBvYmouY29udGVudCArIG9iai51bml0O1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5zb3VyY2UoZGF0YTEsIHtcbiAgICBwZXJjZW50OiB7XG4gICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uIGZvcm1hdHRlcih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbCArICclJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBjaGFydC50b29sdGlwKGZhbHNlKTtcbiAgY2hhcnQubGVnZW5kKHtcbiAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICBpdGVtRm9ybWF0dGVyOiBmdW5jdGlvbiBpdGVtRm9ybWF0dGVyKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCArICcgJyArIG1hcFt2YWxdO1xuICAgIH1cbiAgfSk7XG4gIGNoYXJ0LmNvb3JkKCdwb2xhcicsIHtcbiAgICB0cmFuc3Bvc2VkOiB0cnVlLFxuICAgIGlubmVyUmFkaXVzOiAwLjcsXG4gICAgcmFkaXVzOiAxXG4gIH0pO1xuICBjaGFydC5heGlzKGZhbHNlKTtcbiAgY2hhcnQuaW50ZXJ2YWwoKVxuICAgIC5wb3NpdGlvbignYSpwZXJjZW50JylcbiAgICAuY29sb3IoJ25hbWUnLCBbJyNGRkI0MDAnLCAnI0ZGNUM0NycsICcjRkY4MjJEJ10pXG4gICAgLmFkanVzdCgnc3RhY2snKTtcbiAgY2hhcnQucmVuZGVyKCk7XG4gIHJldHVybiBjaGFydDtcbn1cblxuY2xhc3MgRm9vZERldGFpbCB7XG4gIHB1YmxpYyBtZWFsTG9nSWQgPSAtMTsgLy8g5b6X5YiwdGFnZ3Pkv6Hmga/mjqXlj6PkuK3ov5Tlm55cbiAgLy8gcHVibGljIG1lYWxEYXRlID0gMDsgLy8g5LiK5Liq6aG16Z2i5Lyg6YCS5p2l55qEXG4gIC8vIHB1YmxpYyBtZWFsVHlwZSA9IDA7IC8vIOS4iuS4qumhtemdouS8oOmAkuadpeeahFxuICBwdWJsaWMgZGl2aWRlcHJvcG9ydGlvbj0wOy8v55yf5a6e5a695bqm6Zmk5LulNzIwcnB477ybXG4gIC8vIHB1YmxpYyBpbWdLZXkgPSBudWxsO1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBjdXJyZW50VGFnSW5kZXg6IDAsXG4gICAgdGFnZ3M6W10sXG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGl4ZWxSYXRpbzogMixcbiAgICBpbWFnZVdpZHRoOjAsXG4gICAgaW1hZ2VIZWlnaHQ6MCxcbiAgICBlbmVyZ3k6bnVsbCxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uOiBhbnkpIHtcbiAgICBjb25zdCBwYXJzZWRJbmZvID0gSlNPTi5wYXJzZShvcHRpb24ucGFyYW1Kc29uKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBpbWFnZVVybDogcGFyc2VkSW5mby5pbWFnZVVybCB9KTtcbiAgICB0aGlzLm1lYWxMb2dJZCA9IHBhcnNlZEluZm8ubWVhbElkO1xuICAgIC8vIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChwYXJzZWRJbmZvLm1lYWxUeXBlKTtcbiAgICAvLyB0aGlzLm1lYWxEYXRlID0gcGFyc2VJbnQob3B0aW9uLm1lYWxEYXRlKTtcbiAgICAvLyB0aGlzLmltZ0tleSA9IHBhcnNlZEluZm8uaW1hZ2VVcmwuc3BsaXQoXCIvXCIpLnBvcCgpO1xuICB9XG4gIG9uUmVhZHkoKXtcbiAgICB0aGlzLmdldFJlY29nbml0aW9uUmVzdWx0KCk7XG4gIH1cbiAgXG5cbi8qKlxuICog5Y+R5Ye66K+G5Yir5Zu+54mH5Lit6aOf54mp55qEYXBpXG4gKi9cbiAgcHVibGljIGdldFJlY29nbml0aW9uUmVzdWx0KCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuivhuWIq+S4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgIGlmKHRoaXMuZGF0YS5pbWFnZUhlaWdodD09PTApe1xuICAgICAgd3guZ2V0SW1hZ2VJbmZvKHtcbiAgICAgICAgc3JjOiB0aGF0LmRhdGEuaW1hZ2VVcmwsXG4gICAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgICAgaWYocmVzLmhlaWdodC9yZXMud2lkdGg+MC45Nil7IC8vIOmrmOWbvlxuICAgICAgICAgICAgdGhhdC5kaXZpZGVwcm9wb3J0aW9uID0gcmVzLmhlaWdodCAvIDcyMFxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgICAgaW1hZ2VIZWlnaHQ6NzIwLFxuICAgICAgICAgICAgICBpbWFnZVdpZHRoOiByZXMud2lkdGggKiA3MjAgLyByZXMuaGVpZ2h0XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1lbHNleyAvLyDlrr3lm75cbiAgICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy53aWR0aCAvIDc1MFxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgICAgaW1hZ2VXaWR0aDogNzUwLFxuICAgICAgICAgICAgICBpbWFnZUhlaWdodDogcmVzLmhlaWdodCAqIDcyMCAvIHJlcy53aWR0aFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhhdC5nZXRNZWFsTG9nU3VtbWFyeSgpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1lbHNle1xuICAgICAgdGhhdC5nZXRNZWFsTG9nU3VtbWFyeSgpXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDlj5Hlh7ror7fmsYLvvIzojrflvpfpobXpnaLmlbDmja5cbiAgICovXG4gIHB1YmxpYyBnZXRNZWFsTG9nU3VtbWFyeSgpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzIDtcbiAgICByZXF1ZXN0LmdldE1lYWxMb2dTdW1tYXJ5KHtcbiAgICAgIG1lYWxMb2dJZDogdGhhdC5tZWFsTG9nSWRcbiAgICB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB0aGF0LnBhcnNlR2V0UmVjb2duaXRpb25SZXN1bHQocmVzKTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoKTtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICfojrflj5bor4bliKvnu5PmnpzlpLHotKUnLFxuICAgICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGVyciksXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOino+aekOi/lOWbnueahOaVsOaNrlxuICAgKi9cbiAgcHVibGljIHBhcnNlR2V0UmVjb2duaXRpb25SZXN1bHQocmVzcCkge1xuICAgIC8v5pW055CGdGFn5pWw5o2uXG4gICAgbGV0IHRhZ2dzOmFueVtdID0gW107XG4gICAgcmVzcC5mb29kTG9nU3VtbWFyeUxpc3QubWFwKGl0ZW09PntcbiAgICAgIGxldCBpdCA9IHtcbiAgICAgICAgLi4uaXRlbSxcbiAgICAgICAgdGFnWDogaXRlbS50YWdYIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICB0YWdZOiBpdGVtLnRhZ1kgLyAodGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMiksXG4gICAgICB9XG4gICAgICB0YWdncy5wdXNoKGl0KTtcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgdGFnZ3M6IHRhZ2dzLFxuICAgICAgZW5lcmd5OiBNYXRoLnJvdW5kKHJlc3AuZW5lcmd5KVxuICAgIH0sKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKCfmlbTnkIblvpfliLDliJ3lp4t0YWdncycsdGhpcy5kYXRhLnRhZ2dzKVxuICAgIH0pO1xuICAgIC8vIOaVtOeQhmNhbnZhc+aVsOaNrlxuICAgIGZvciggbGV0IGluZGV4IGluIHJlc3Auc2ltcGxlTWFjcm9udXRyaWVudEludGFrZSl7XG4gICAgICBjb25zdCBpdGVtID0gcmVzcC5zaW1wbGVNYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGNvbnN0IGFyckl0ZW0gPSB7XG4gICAgICAgIG5hbWU6aXRlbS5uYW1lQ04sXG4gICAgICAgIHBlcmNlbnQ6TWF0aC5yb3VuZChpdGVtLmludGFrZVZhbHVlLnBlcmNlbnRhZ2UpLFxuICAgICAgICBjb250ZW50Ok1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5pbnRha2UpLFxuICAgICAgICB1bml0Oml0ZW0uaW50YWtlVmFsdWUudW5pdFxuICAgICAgfVxuICAgICAgZGF0YTEucHVzaChhcnJJdGVtKVxuICAgIH1cbiAgICBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNjYW52YXNmMicpO1xuICAgIHNhbGVzVHJlbmRDaGFydENvbXBvbmVudC5pbml0KGluaXRDaGFydCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiDliKDpmaTmn5DkuKrlr7nlupTnmoR0YWdcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVEZWxldGVUYWcoZTphbnkpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgIGNvbnN0IGluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dEluZGV4O1xuICAgIGxldCB0YWdncyA9IFsuLi50aGlzLmRhdGEudGFnZ3NdO1xuICAgIGlmKHRoaXMuZGF0YS50YWdncy5sZW5ndGg9PTEpe1xuICAgICAgcmVxdWVzdC5kZWxldGVNZWFsTG9nKHtcbiAgICAgICAgbWVhbExvZ0lkOiB0aGlzLm1lYWxMb2dJZFxuICAgICAgfSkudGhlbihyZXM9PntcbiAgICAgICAgaWYocmVzPT09dHJ1ZSl7XG4gICAgICAgICAgdGFnZ3Muc3BsaWNlKGluZGV4LDEpO1xuICAgICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7dGFnZ3M6dGFnZ3N9KTtcbiAgICAgICAgICB3eC5zd2l0Y2hUYWIoe3VybDonL3BhZ2VzL2hvbWUvaW5kZXgnfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon5Yig6Zmk6aOf54mp5aSx6LSlJyxpY29uOlwibm9uZVwifSlcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6J+WIoOmZpOmjn+eJqeWksei0pScsaWNvbjpcIm5vbmVcIn0pXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5kZWxldGVGb29kTG9nKHtcbiAgICAgICAgZm9vZExvZ0lkOiB0YWdnc1tpbmRleF0uZm9vZExvZ0lkLFxuICAgICAgICBmb29kVHlwZTogdGFnZ3NbaW5kZXhdLmZvb2RUeXBlXG4gICAgICB9KS50aGVuKHJlcz0+e1xuICAgICAgICBpZihyZXM9PT10cnVlKXtcbiAgICAgICAgICB0YWdncy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHt0YWdnczp0YWdnc30sKCk9PntcbiAgICAgICAgICAgIC8v6K+35rGC5paw55qE5pWw5o2uLOWBmumhtemdouWIt+aWsFxuICAgICAgICAgICAgdGhhdC5nZXRNZWFsTG9nU3VtbWFyeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon5Yig6Zmk6aOf54mp5aSx6LSlJyxpY29uOlwibm9uZVwifSlcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6J+WIoOmZpOmjn+eJqeWksei0pScsaWNvbjpcIm5vbmVcIn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIG9uVGFnTW92ZShldmVudDogYW55KSB7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAgIGxldCB4T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ194XCI7XG4gICAgbGV0IHlPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnX3lcIjtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW3hPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueCxcbiAgICAgIFt5T3BlcmF0aW9uXTogZXZlbnQuZGV0YWlsLnlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDngrnlh7vliIbkuqvmjInpkq7vvIzljrvliIbkuqvpobXpnaJcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVHb1NoYXJlUGFnZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe3VybDogYC9wYWdlcy9mb29kU2hhcmUvaW5kZXg/bWVhbElkPSR7dGhpcy5tZWFsTG9nSWR9YH0pO1xuICAgICAgXG4gIH1cbn1cblxuUGFnZShuZXcgRm9vZERldGFpbCgpKTsiXX0=