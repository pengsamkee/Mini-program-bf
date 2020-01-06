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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQWdEO0FBRWhELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQzFDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBUyxHQUFHO1FBQ3hCLElBQUksR0FBRyxDQUFDLElBQUksS0FBRyxLQUFLLEVBQUM7WUFDbkIsSUFBRyxHQUFHLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQztnQkFDZixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDdkY7aUJBQUk7Z0JBQ0gsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQ3hGO1NBQ0Y7YUFBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzNCLElBQUcsR0FBRyxDQUFDLE9BQU8sR0FBQyxDQUFDLEVBQUM7Z0JBQ2YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksR0FBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQzFG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QyxTQUFXLEVBQUMsQ0FBQyxDQUFDO0lBRTFFLENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUFqTEQsSUFpTEM7QUFFRCxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSdcblxubGV0IGNoYXJ0ID0gbnVsbDtcbmxldCBkYXRhMSA9IFtdO1xuZnVuY3Rpb24gaW5pdENoYXJ0KGNhbnZhcywgd2lkdGgsIGhlaWdodCwgRjIpIHsgLy8g5L2/55SoIEYyIOe7mOWItuWbvuihqFxuICBjb25zdCBtYXAgPSB7fTtcbiAgZGF0YTEuZm9yRWFjaChmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqLm5hbWU9PT0n6JuL55m96LSoJyl7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnICsgYCAgICBgICsgb2JqLmNvbnRlbnQgKyBvYmoudW5pdDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsgb2JqLmNvbnRlbnQgKyBvYmoudW5pdDtcbiAgICAgIH1cbiAgICB9ZWxzZSBpZiAob2JqLm5hbWUgPT09ICfohILogqonKSB7XG4gICAgICBpZihvYmoucGVyY2VudD45KXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgICAgICAgIGArIG9iai5wZXJjZW50ICsgJyUnICsgYCAgICBgICsgb2JqLmNvbnRlbnQgKyBvYmoudW5pdDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICAgICAgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsgb2JqLmNvbnRlbnQgKyBvYmoudW5pdDtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGlmKG9iai5wZXJjZW50Pjkpe1xuICAgICAgICByZXR1cm4gbWFwW29iai5uYW1lXSA9IGAgICBgKyBvYmoucGVyY2VudCArICclJyArIGAgICAgYCArIG9iai5jb250ZW50ICsgb2JqLnVuaXQ7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIG1hcFtvYmoubmFtZV0gPSBgICAgYCsgb2JqLnBlcmNlbnQgKyAnJScrIGAgICAgICBgICsgb2JqLmNvbnRlbnQgKyBvYmoudW5pdDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBjaGFydCA9IG5ldyBGMi5DaGFydCh7XG4gICAgZWw6IGNhbnZhcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSk7XG4gIGNoYXJ0LnNvdXJjZShkYXRhMSwge1xuICAgIHBlcmNlbnQ6IHtcbiAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24gZm9ybWF0dGVyKHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsICsgJyUnO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNoYXJ0LnRvb2x0aXAoZmFsc2UpO1xuICBjaGFydC5sZWdlbmQoe1xuICAgIHZlcnRpY2FsQWxpZ246J2NlbnRlcicsXG4gICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgaXRlbUZvcm1hdHRlcjogZnVuY3Rpb24gaXRlbUZvcm1hdHRlcih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgKyAnICcgKyBtYXBbdmFsXTtcbiAgICB9LFxuICAgIG1hcmtlcjogJ3NxdWFyZScsXG4gICAgY2xpY2thYmxlOiBmYWxzZVxuICB9KTtcblxuICBjaGFydC5jb29yZCgncG9sYXInLCB7XG4gICAgdHJhbnNwb3NlZDogdHJ1ZSxcbiAgICBpbm5lclJhZGl1czogMC43LFxuICAgIHJhZGl1czogMVxuICB9KTtcbiAgY2hhcnQuYXhpcyhmYWxzZSk7XG4gIGNoYXJ0LmludGVydmFsKClcbiAgICAucG9zaXRpb24oJ2EqcGVyY2VudCcpXG4gICAgLmNvbG9yKCduYW1lJywgWycjRkZCNDAwJywgJyNGRjVDNDcnLCAnI0ZGODIyRCddKVxuICAgIC5hZGp1c3QoJ3N0YWNrJyk7XG4gIGNoYXJ0LnJlbmRlcigpO1xuICByZXR1cm4gY2hhcnQ7XG59XG5cbmNsYXNzIEZvb2REZXRhaWwge1xuICBwdWJsaWMgbWVhbExvZ0lkID0gLTE7IC8vIOW+l+WIsHRhZ2dz5L+h5oGv5o6l5Y+j5Lit6L+U5ZueXG4gIC8vIHB1YmxpYyBtZWFsRGF0ZSA9IDA7IC8vIOS4iuS4qumhtemdouS8oOmAkuadpeeahFxuICAvLyBwdWJsaWMgbWVhbFR5cGUgPSAwOyAvLyDkuIrkuKrpobXpnaLkvKDpgJLmnaXnmoRcbiAgcHVibGljIGRpdmlkZXByb3BvcnRpb249MDsvL+ecn+WunuWuveW6pumZpOS7pTcyMHJweO+8m1xuICAvLyBwdWJsaWMgaW1nS2V5ID0gbnVsbDtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgY3VycmVudFRhZ0luZGV4OiAwLFxuICAgIHRhZ2dzOltdLFxuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBpeGVsUmF0aW86IDIsXG4gICAgaW1hZ2VXaWR0aDowLFxuICAgIGltYWdlSGVpZ2h0OjAsXG4gICAgZW5lcmd5Om51bGwsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbjogYW55KSB7XG4gICAgY29uc3QgcGFyc2VkSW5mbyA9IEpTT04ucGFyc2Uob3B0aW9uLnBhcmFtSnNvbik7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaW1hZ2VVcmw6IHBhcnNlZEluZm8uaW1hZ2VVcmwgfSk7XG4gICAgdGhpcy5tZWFsTG9nSWQgPSBwYXJzZWRJbmZvLm1lYWxJZDtcbiAgICAvLyB0aGlzLm1lYWxUeXBlID0gcGFyc2VJbnQocGFyc2VkSW5mby5tZWFsVHlwZSk7XG4gICAgLy8gdGhpcy5tZWFsRGF0ZSA9IHBhcnNlSW50KG9wdGlvbi5tZWFsRGF0ZSk7XG4gICAgLy8gdGhpcy5pbWdLZXkgPSBwYXJzZWRJbmZvLmltYWdlVXJsLnNwbGl0KFwiL1wiKS5wb3AoKTtcbiAgfVxuICBvblJlYWR5KCl7XG4gICAgdGhpcy5nZXRSZWNvZ25pdGlvblJlc3VsdCgpO1xuICB9XG4gIFxuXG4vKipcbiAqIOWPkeWHuuivhuWIq+WbvueJh+S4remjn+eJqeeahGFwaVxuICovXG4gIHB1YmxpYyBnZXRSZWNvZ25pdGlvblJlc3VsdCgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLor4bliKvkuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICBpZih0aGlzLmRhdGEuaW1hZ2VIZWlnaHQ9PT0wKXtcbiAgICAgIHd4LmdldEltYWdlSW5mbyh7XG4gICAgICAgIHNyYzogdGhhdC5kYXRhLmltYWdlVXJsLFxuICAgICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICAgIGlmKHJlcy5oZWlnaHQvcmVzLndpZHRoPjAuOTYpeyAvLyDpq5jlm75cbiAgICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy5oZWlnaHQgLyA3MjBcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAgIGltYWdlSGVpZ2h0OjcyMCxcbiAgICAgICAgICAgICAgaW1hZ2VXaWR0aDogcmVzLndpZHRoICogNzIwIC8gcmVzLmhlaWdodFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9ZWxzZXsgLy8g5a695Zu+XG4gICAgICAgICAgICB0aGF0LmRpdmlkZXByb3BvcnRpb24gPSByZXMud2lkdGggLyA3NTBcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAgIGltYWdlV2lkdGg6IDc1MCxcbiAgICAgICAgICAgICAgaW1hZ2VIZWlnaHQ6IHJlcy5oZWlnaHQgKiA3MjAgLyByZXMud2lkdGhcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoYXQuZ2V0TWVhbExvZ1N1bW1hcnkoKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoYXQuZ2V0TWVhbExvZ1N1bW1hcnkoKVxuICAgIH1cbiAgfVxuICAvKipcbiAgICog5Y+R5Ye66K+35rGC77yM6I635b6X6aG16Z2i5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgZ2V0TWVhbExvZ1N1bW1hcnkoKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpcyA7XG4gICAgcmVxdWVzdC5nZXRNZWFsTG9nU3VtbWFyeSh7XG4gICAgICBtZWFsTG9nSWQ6IHRoYXQubWVhbExvZ0lkXG4gICAgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdGhhdC5wYXJzZUdldFJlY29nbml0aW9uUmVzdWx0KHJlcyk7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKCk7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAn6I635Y+W6K+G5Yir57uT5p6c5aSx6LSlJyxcbiAgICAgICAgICBjb250ZW50OiBKU09OLnN0cmluZ2lmeShlcnIpLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDop6PmnpDov5Tlm57nmoTmlbDmja5cbiAgICovXG4gIHB1YmxpYyBwYXJzZUdldFJlY29nbml0aW9uUmVzdWx0KHJlc3ApIHtcbiAgICAvL+aVtOeQhnRhZ+aVsOaNrlxuICAgIGxldCB0YWdnczphbnlbXSA9IFtdO1xuICAgIHJlc3AuZm9vZExvZ1N1bW1hcnlMaXN0Lm1hcChpdGVtPT57XG4gICAgICBsZXQgaXQgPSB7XG4gICAgICAgIC4uLml0ZW0sXG4gICAgICAgIHRhZ1g6IGl0ZW0udGFnWCAvICh0aGlzLmRpdmlkZXByb3BvcnRpb24gKiAyKSxcbiAgICAgICAgdGFnWTogaXRlbS50YWdZIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICBlbmVyZ3k6TWF0aC5yb3VuZChpdGVtLmVuZXJneSlcbiAgICAgIH1cbiAgICAgIHRhZ2dzLnB1c2goaXQpO1xuICAgIH0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB0YWdnczogdGFnZ3MsXG4gICAgICBlbmVyZ3k6IE1hdGgucm91bmQocmVzcC5lbmVyZ3kpXG4gICAgfSwoKT0+e1xuICAgICAgY29uc29sZS5sb2coJ+aVtOeQhuW+l+WIsOWIneWni3RhZ2dzJyx0aGlzLmRhdGEudGFnZ3MpXG4gICAgfSk7XG4gICAgLy8g5pW055CGY2FudmFz5pWw5o2uXG4gICAgZm9yKCBsZXQgaW5kZXggaW4gcmVzcC5zaW1wbGVNYWNyb251dHJpZW50SW50YWtlKXtcbiAgICAgIGNvbnN0IGl0ZW0gPSByZXNwLnNpbXBsZU1hY3JvbnV0cmllbnRJbnRha2VbaW5kZXhdO1xuICAgICAgY29uc3QgYXJySXRlbSA9IHtcbiAgICAgICAgbmFtZTppdGVtLm5hbWVDTixcbiAgICAgICAgcGVyY2VudDpNYXRoLnJvdW5kKGl0ZW0uaW50YWtlVmFsdWUucGVyY2VudGFnZSksXG4gICAgICAgIGNvbnRlbnQ6TWF0aC5yb3VuZChpdGVtLmludGFrZVZhbHVlLmludGFrZSksXG4gICAgICAgIHVuaXQ6aXRlbS5pbnRha2VWYWx1ZS51bml0XG4gICAgICB9XG4gICAgICBkYXRhMS5wdXNoKGFyckl0ZW0pXG4gICAgfVxuICAgIGxldCBzYWxlc1RyZW5kQ2hhcnRDb21wb25lbnQgPSB0aGlzLnNlbGVjdENvbXBvbmVudCgnI2NhbnZhc2YyJyk7XG4gICAgc2FsZXNUcmVuZENoYXJ0Q29tcG9uZW50LmluaXQoaW5pdENoYXJ0KTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIOWIoOmZpOafkOS4quWvueW6lOeahHRhZ1xuICAgKi9cbiAgcHVibGljIGhhbmRsZURlbGV0ZVRhZyhlOmFueSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgaWYodGhpcy5kYXRhLnRhZ2dzLmxlbmd0aD09MSl7XG4gICAgICByZXF1ZXN0LmRlbGV0ZU1lYWxMb2coe1xuICAgICAgICBtZWFsTG9nSWQ6IHRoaXMubWVhbExvZ0lkXG4gICAgICB9KS50aGVuKHJlcz0+e1xuICAgICAgICBpZihyZXM9PT10cnVlKXtcbiAgICAgICAgICB0YWdncy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHt0YWdnczp0YWdnc30pO1xuICAgICAgICAgIHd4LnN3aXRjaFRhYih7dXJsOicvcGFnZXMvaG9tZS9pbmRleCd9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOifliKDpmaTpo5/nianlpLHotKUnLGljb246XCJub25lXCJ9KVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon5Yig6Zmk6aOf54mp5aSx6LSlJyxpY29uOlwibm9uZVwifSlcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LmRlbGV0ZUZvb2RMb2coe1xuICAgICAgICBmb29kTG9nSWQ6IHRhZ2dzW2luZGV4XS5mb29kTG9nSWQsXG4gICAgICAgIGZvb2RUeXBlOiB0YWdnc1tpbmRleF0uZm9vZFR5cGVcbiAgICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICAgIGlmKHJlcz09PXRydWUpe1xuICAgICAgICAgIC8vIOWIoOmZpOS4iuS4qumhtemdoueahOacrHRhZ+S/oeaBr1xuICAgICAgICAgIGxldCBwYWdlcyA9IGdldEN1cnJlbnRQYWdlcygpOyAgICAvL+iOt+WPluW9k+WJjemhtemdouS/oeaBr+agiFxuICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHBhZ2VzW3BhZ2VzLmxlbmd0aC0yXSAgICAgLy/ojrflj5bkuIrkuIDkuKrpobXpnaLkv6Hmga/moIhcbiAgICAgICAgICBjb25zb2xlLmxvZygnPT09PT09PScscHJldlBhZ2UpXG4gICAgICAgICAgdGFnZ3Muc3BsaWNlKGluZGV4LDEpO1xuICAgICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7dGFnZ3M6dGFnZ3N9LCgpPT57XG4gICAgICAgICAgICAvL+ivt+axguaWsOeahOaVsOaNrizlgZrpobXpnaLliLfmlrBcbiAgICAgICAgICAgIHRoYXQuZ2V0TWVhbExvZ1N1bW1hcnkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6J+WIoOmZpOmjn+eJqeWksei0pScsaWNvbjpcIm5vbmVcIn0pXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOifliKDpmaTpo5/nianlpLHotKUnLGljb246XCJub25lXCJ9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBvblRhZ01vdmUoZXZlbnQ6IGFueSkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgICBsZXQgeE9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyBpbmRleCArIFwiXS50YWdfeFwiO1xuICAgIGxldCB5T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ195XCI7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFt4T3BlcmF0aW9uXTogZXZlbnQuZGV0YWlsLngsXG4gICAgICBbeU9wZXJhdGlvbl06IGV2ZW50LmRldGFpbC55XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog54K55Ye75YiG5Lqr5oyJ6ZKu77yM5Y675YiG5Lqr6aG16Z2iXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlR29TaGFyZVBhZ2UoKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHt1cmw6IGAvcGFnZXMvZm9vZFNoYXJlL2luZGV4P21lYWxJZD0ke3RoaXMubWVhbExvZ0lkfWB9KTtcbiAgICAgIFxuICB9XG59XG5cblBhZ2UobmV3IEZvb2REZXRhaWwoKSk7Il19