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
        verticalAlign: 'center',
        position: 'right',
        itemFormatter: function itemFormatter(val) {
            return val + ' ' + map[val];
        },
        marker: 'square',
        clickable: false
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
            var it = __assign({}, item, { tagX: item.tagX / (_this.divideproportion * 2), tagY: item.tagY / (_this.divideproportion * 2), energy: Math.round(item.energy) });
            taggs.push(it);
        });
        this.setData({
            taggs: taggs,
            energy: Math.round(resp.energy)
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
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2];
                    console.log('=======', prevPage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQWdEO0FBRWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBUyxHQUFHO1FBQ3hCLElBQUksR0FBRyxDQUFDLElBQUksS0FBRyxLQUFLLEVBQUM7WUFDbkIsSUFBRyxHQUFHLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQztnQkFDZixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDdkY7aUJBQUk7Z0JBQ0gsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQ3hGO1NBQ0Y7YUFBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzNCLElBQUcsR0FBRyxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQUM7Z0JBQ2YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQzFG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VUFBVSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi4vLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnXG5cbmxldCBjaGFydCA9IG51bGw7XG5sZXQgZGF0YTEgPSBbXTtcbmZ1bmN0aW9uIGluaXRDaGFydChjYW52YXMsIHdpZHRoLCBoZWlnaHQsIEYyKSB7IC8vIOS9v+eUqCBGMiDnu5jliLblm77ooahcbiAgY29uc3QgbWFwID0ge307XG4gIGRhdGExLmZvckVhY2goZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iai5uYW1lPT09J+ibi+eZvei0qCcpe1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfWVsc2UgaWYgKG9iai5uYW1lID09PSAn6ISC6IKqJykge1xuICAgICAgaWYob2JqLnBlcmNlbnQ+OSl7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgICAgICAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScgKyBgICAgIGAgKyBvYmouY29udGVudCArIG9iai51bml0O1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBtYXBbb2JqLm5hbWVdID0gYCAgIGArIG9iai5wZXJjZW50ICsgJyUnKyBgICAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgY2hhcnQgPSBuZXcgRjIuQ2hhcnQoe1xuICAgIGVsOiBjYW52YXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjaGFydC5zb3VyY2UoZGF0YTEsIHtcbiAgICBwZXJjZW50OiB7XG4gICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uIGZvcm1hdHRlcih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbCArICclJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBjaGFydC50b29sdGlwKGZhbHNlKTtcbiAgY2hhcnQubGVnZW5kKHtcbiAgICB2ZXJ0aWNhbEFsaWduOidjZW50ZXInLFxuICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgIGl0ZW1Gb3JtYXR0ZXI6IGZ1bmN0aW9uIGl0ZW1Gb3JtYXR0ZXIodmFsKSB7XG4gICAgICByZXR1cm4gdmFsICsgJyAnICsgbWFwW3ZhbF07XG4gICAgfSxcbiAgICBtYXJrZXI6ICdzcXVhcmUnLFxuICAgIGNsaWNrYWJsZTogZmFsc2VcbiAgfSk7XG5cbiAgY2hhcnQuY29vcmQoJ3BvbGFyJywge1xuICAgIHRyYW5zcG9zZWQ6IHRydWUsXG4gICAgaW5uZXJSYWRpdXM6IDAuNyxcbiAgICByYWRpdXM6IDFcbiAgfSk7XG4gIGNoYXJ0LmF4aXMoZmFsc2UpO1xuICBjaGFydC5pbnRlcnZhbCgpXG4gICAgLnBvc2l0aW9uKCdhKnBlcmNlbnQnKVxuICAgIC5jb2xvcignbmFtZScsIFsnI0ZGQjQwMCcsICcjRkY1QzQ3JywgJyNGRjgyMkQnXSlcbiAgICAuYWRqdXN0KCdzdGFjaycpO1xuICBjaGFydC5yZW5kZXIoKTtcbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5jbGFzcyBGb29kRGV0YWlsIHtcbiAgcHVibGljIG1lYWxMb2dJZCA9IC0xOyAvLyDlvpfliLB0YWdnc+S/oeaBr+aOpeWPo+S4rei/lOWbnlxuICAvLyBwdWJsaWMgbWVhbERhdGUgPSAwOyAvLyDkuIrkuKrpobXpnaLkvKDpgJLmnaXnmoRcbiAgLy8gcHVibGljIG1lYWxUeXBlID0gMDsgLy8g5LiK5Liq6aG16Z2i5Lyg6YCS5p2l55qEXG4gIHB1YmxpYyBkaXZpZGVwcm9wb3J0aW9uPTA7Ly/nnJ/lrp7lrr3luqbpmaTku6U3MjBycHjvvJtcbiAgLy8gcHVibGljIGltZ0tleSA9IG51bGw7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIGN1cnJlbnRUYWdJbmRleDogMCxcbiAgICB0YWdnczpbXSxcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwaXhlbFJhdGlvOiAyLFxuICAgIGltYWdlV2lkdGg6MCxcbiAgICBpbWFnZUhlaWdodDowLFxuICAgIGVuZXJneTpudWxsLFxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb246IGFueSkge1xuICAgIGNvbnN0IHBhcnNlZEluZm8gPSBKU09OLnBhcnNlKG9wdGlvbi5wYXJhbUpzb24pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGltYWdlVXJsOiBwYXJzZWRJbmZvLmltYWdlVXJsIH0pO1xuICAgIHRoaXMubWVhbExvZ0lkID0gcGFyc2VkSW5mby5tZWFsSWQ7XG4gICAgLy8gdGhpcy5tZWFsVHlwZSA9IHBhcnNlSW50KHBhcnNlZEluZm8ubWVhbFR5cGUpO1xuICAgIC8vIHRoaXMubWVhbERhdGUgPSBwYXJzZUludChvcHRpb24ubWVhbERhdGUpO1xuICAgIC8vIHRoaXMuaW1nS2V5ID0gcGFyc2VkSW5mby5pbWFnZVVybC5zcGxpdChcIi9cIikucG9wKCk7XG4gIH1cbiAgb25SZWFkeSgpe1xuICAgIHRoaXMuZ2V0UmVjb2duaXRpb25SZXN1bHQoKTtcbiAgfVxuICBcblxuLyoqXG4gKiDlj5Hlh7ror4bliKvlm77niYfkuK3po5/niannmoRhcGlcbiAqL1xuICBwdWJsaWMgZ2V0UmVjb2duaXRpb25SZXN1bHQoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi6K+G5Yir5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgaWYodGhpcy5kYXRhLmltYWdlSGVpZ2h0PT09MCl7XG4gICAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgICBzcmM6IHRoYXQuZGF0YS5pbWFnZVVybCxcbiAgICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgICBpZihyZXMuaGVpZ2h0L3Jlcy53aWR0aD4wLjk2KXsgLy8g6auY5Zu+XG4gICAgICAgICAgICB0aGF0LmRpdmlkZXByb3BvcnRpb24gPSByZXMuaGVpZ2h0IC8gNzIwXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICBpbWFnZUhlaWdodDo3MjAsXG4gICAgICAgICAgICAgIGltYWdlV2lkdGg6IHJlcy53aWR0aCAqIDcyMCAvIHJlcy5oZWlnaHRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfWVsc2V7IC8vIOWuveWbvlxuICAgICAgICAgICAgdGhhdC5kaXZpZGVwcm9wb3J0aW9uID0gcmVzLndpZHRoIC8gNzUwXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICBpbWFnZVdpZHRoOiA3NTAsXG4gICAgICAgICAgICAgIGltYWdlSGVpZ2h0OiByZXMuaGVpZ2h0ICogNzIwIC8gcmVzLndpZHRoXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGF0LmdldE1lYWxMb2dTdW1tYXJ5KClcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICB0aGF0LmdldE1lYWxMb2dTdW1tYXJ5KClcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIOWPkeWHuuivt+axgu+8jOiOt+W+l+mhtemdouaVsOaNrlxuICAgKi9cbiAgcHVibGljIGdldE1lYWxMb2dTdW1tYXJ5KCl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXMgO1xuICAgIHJlcXVlc3QuZ2V0TWVhbExvZ1N1bW1hcnkoe1xuICAgICAgbWVhbExvZ0lkOiB0aGF0Lm1lYWxMb2dJZFxuICAgIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHRoYXQucGFyc2VHZXRSZWNvZ25pdGlvblJlc3VsdChyZXMpO1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZygpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJ+iOt+WPluivhuWIq+e7k+aenOWksei0pScsXG4gICAgICAgICAgY29udGVudDogSlNPTi5zdHJpbmdpZnkoZXJyKSxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6L+U5Zue55qE5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VHZXRSZWNvZ25pdGlvblJlc3VsdChyZXNwKSB7XG4gICAgLy/mlbTnkIZ0YWfmlbDmja5cbiAgICBsZXQgdGFnZ3M6YW55W10gPSBbXTtcbiAgICByZXNwLmZvb2RMb2dTdW1tYXJ5TGlzdC5tYXAoaXRlbT0+e1xuICAgICAgbGV0IGl0ID0ge1xuICAgICAgICAuLi5pdGVtLFxuICAgICAgICB0YWdYOiBpdGVtLnRhZ1ggLyAodGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMiksXG4gICAgICAgIHRhZ1k6IGl0ZW0udGFnWSAvICh0aGlzLmRpdmlkZXByb3BvcnRpb24gKiAyKSxcbiAgICAgICAgZW5lcmd5Ok1hdGgucm91bmQoaXRlbS5lbmVyZ3kpXG4gICAgICB9XG4gICAgICB0YWdncy5wdXNoKGl0KTtcbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgdGFnZ3M6IHRhZ2dzLFxuICAgICAgZW5lcmd5OiBNYXRoLnJvdW5kKHJlc3AuZW5lcmd5KVxuICAgIH0pO1xuICAgIC8vIOaVtOeQhmNhbnZhc+aVsOaNrlxuICAgIGZvciggbGV0IGluZGV4IGluIHJlc3Auc2ltcGxlTWFjcm9udXRyaWVudEludGFrZSl7XG4gICAgICBjb25zdCBpdGVtID0gcmVzcC5zaW1wbGVNYWNyb251dHJpZW50SW50YWtlW2luZGV4XTtcbiAgICAgIGNvbnN0IGFyckl0ZW0gPSB7XG4gICAgICAgIG5hbWU6aXRlbS5uYW1lQ04sXG4gICAgICAgIHBlcmNlbnQ6TWF0aC5yb3VuZChpdGVtLmludGFrZVZhbHVlLnBlcmNlbnRhZ2UpLFxuICAgICAgICBjb250ZW50Ok1hdGgucm91bmQoaXRlbS5pbnRha2VWYWx1ZS5pbnRha2UpLFxuICAgICAgICB1bml0Oml0ZW0uaW50YWtlVmFsdWUudW5pdFxuICAgICAgfVxuICAgICAgZGF0YTEucHVzaChhcnJJdGVtKVxuICAgIH1cbiAgICBsZXQgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50ID0gdGhpcy5zZWxlY3RDb21wb25lbnQoJyNjYW52YXNmMicpO1xuICAgIHNhbGVzVHJlbmRDaGFydENvbXBvbmVudC5pbml0KGluaXRDaGFydCk7XG4gIH1cbiAgXG4gIC8qKlxuICAgKiDliKDpmaTmn5DkuKrlr7nlupTnmoR0YWdcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVEZWxldGVUYWcoZTphbnkpe1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgIGNvbnN0IGluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dEluZGV4O1xuICAgIGxldCB0YWdncyA9IFsuLi50aGlzLmRhdGEudGFnZ3NdO1xuICAgIGlmKHRoaXMuZGF0YS50YWdncy5sZW5ndGg9PTEpe1xuICAgICAgcmVxdWVzdC5kZWxldGVNZWFsTG9nKHtcbiAgICAgICAgbWVhbExvZ0lkOiB0aGlzLm1lYWxMb2dJZFxuICAgICAgfSkudGhlbihyZXM9PntcbiAgICAgICAgaWYocmVzPT09dHJ1ZSl7XG4gICAgICAgICAgdGFnZ3Muc3BsaWNlKGluZGV4LDEpO1xuICAgICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7dGFnZ3M6dGFnZ3N9KTtcbiAgICAgICAgICB3eC5zd2l0Y2hUYWIoe3VybDonL3BhZ2VzL2hvbWUvaW5kZXgnfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon5Yig6Zmk6aOf54mp5aSx6LSlJyxpY29uOlwibm9uZVwifSlcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6J+WIoOmZpOmjn+eJqeWksei0pScsaWNvbjpcIm5vbmVcIn0pXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5kZWxldGVGb29kTG9nKHtcbiAgICAgICAgZm9vZExvZ0lkOiB0YWdnc1tpbmRleF0uZm9vZExvZ0lkLFxuICAgICAgICBmb29kVHlwZTogdGFnZ3NbaW5kZXhdLmZvb2RUeXBlXG4gICAgICB9KS50aGVuKHJlcz0+e1xuICAgICAgICBpZihyZXM9PT10cnVlKXtcbiAgICAgICAgICAvLyDliKDpmaTkuIrkuKrpobXpnaLnmoTmnKx0YWfkv6Hmga9cbiAgICAgICAgICBsZXQgcGFnZXMgPSBnZXRDdXJyZW50UGFnZXMoKTsgICAgLy/ojrflj5blvZPliY3pobXpnaLkv6Hmga/moIhcbiAgICAgICAgICBsZXQgcHJldlBhZ2UgPSBwYWdlc1twYWdlcy5sZW5ndGgtMl0gICAgIC8v6I635Y+W5LiK5LiA5Liq6aG16Z2i5L+h5oGv5qCIXG4gICAgICAgICAgY29uc29sZS5sb2coJz09PT09PT0nLHByZXZQYWdlKVxuICAgICAgICAgIHRhZ2dzLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe3RhZ2dzOnRhZ2dzfSwoKT0+e1xuICAgICAgICAgICAgLy/or7fmsYLmlrDnmoTmlbDmja4s5YGa6aG16Z2i5Yi35pawXG4gICAgICAgICAgICB0aGF0LmdldE1lYWxMb2dTdW1tYXJ5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOifliKDpmaTpo5/nianlpLHotKUnLGljb246XCJub25lXCJ9KVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon5Yig6Zmk6aOf54mp5aSx6LSlJyxpY29uOlwibm9uZVwifSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgb25UYWdNb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGFnSW5kZXg7XG4gICAgbGV0IHhPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnX3hcIjtcbiAgICBsZXQgeU9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyBpbmRleCArIFwiXS50YWdfeVwiO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbeE9wZXJhdGlvbl06IGV2ZW50LmRldGFpbC54LFxuICAgICAgW3lPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOeCueWHu+WIhuS6q+aMiemSru+8jOWOu+WIhuS6q+mhtemdolxuICAgKi9cbiAgcHVibGljIGhhbmRsZUdvU2hhcmVQYWdlKCl7XG4gICAgd3gubmF2aWdhdGVUbyh7dXJsOiBgL3BhZ2VzL2Zvb2RTaGFyZS9pbmRleD9tZWFsSWQ9JHt0aGlzLm1lYWxMb2dJZH1gfSk7XG4gICAgICBcbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kRGV0YWlsKCkpOyJdfQ==