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
var webAPI = require("../../../api/app/AppService");
var globalEnum = require("../../../api/GlobalEnum");
var interface_1 = require("../../../api/app/interface");
var ImageTagPage = (function () {
    function ImageTagPage() {
        this.mealId = -1;
        this.incrementalId = 0;
        this.textSearchFood = undefined;
        this.mealDate = 0;
        this.mealType = 0;
        this.divideproportion = 0;
        this.scrollTop = 0;
        this.createTag = null;
        this.imgH = null;
        this.imgW = null;
        this.imgKey = null;
        this.data = {
            currentTagIndex: 0,
            taggs: [],
            imageUrl: "",
            pixelRatio: 2,
            hideBanner: false,
            imageWidth: 0,
            imageHeight: 0,
            showPopup: false,
            keyword: '',
            resultList: [],
            resultError: false,
            tagIndex: null,
            scrollTop: 0,
            showPopupTitle: '',
        };
    }
    ImageTagPage.prototype.onLoad = function (option) {
        var that = this;
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        this.setData({ imageUrl: option.imageUrl });
        console.log('页面加载时的option.imageurl', option.imageUrl);
        wx.getImageInfo({
            src: option.imageUrl,
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
            }
        });
        this.mealType = parseInt(option.mealType);
        this.mealDate = parseInt(option.mealDate);
        wx.getSystemInfo({
            success: function (res) {
                that.screenWidth = res.windowWidth;
                that.setData({
                    screenWidth: res.windowWidth,
                    pixelRatio: res.pixelRatio
                });
            }
        });
        this.imgKey = option.imageUrl.split("/").pop();
        this.getRecognitionResult(this.imgKey);
    };
    ImageTagPage.prototype.onPageScroll = function (e) {
        this.scrollTop = e.scrollTop;
    };
    ImageTagPage.prototype.getRecognitionResult = function (imageKey) {
        var that = this;
        wx.showLoading({ title: "识别中...", mask: true });
        var req = { mealType: this.mealType, mealDate: this.mealDate, imageKey: imageKey };
        interface_1.default.recognizeFood(req).then(function (resp) {
            that.parseRecognitionData(resp);
        }).catch(function (err) {
            wx.hideLoading();
            wx.showModal({
                title: '获取识别结果失败',
                content: JSON.stringify(err),
                showCancel: false
            });
        });
    };
    ImageTagPage.prototype.parseRecognitionData = function (resp) {
        var taggs = [];
        console.log('分辨率 ', this.data.pixelRatio);
        for (var index in resp.predictionInfoList) {
            var predictionItem = resp.predictionInfoList[index];
            var resultList = resp.predictionInfoList[index].recognitionResultList;
            var item = {
                tagX: predictionItem.tagX / (this.divideproportion * 2),
                tagY: predictionItem.tagY / (this.divideproportion * 2),
                bboxX: predictionItem.bboxX,
                bboxY: predictionItem.bboxY,
                bboxW: predictionItem.bboxW,
                bboxH: predictionItem.bboxH,
                foodId: predictionItem.foodId,
                foodType: predictionItem.foodType,
                foodName: predictionItem.foodName,
                selectedPos: 0,
                resultList: resultList
            };
            taggs.push(item);
        }
        console.log(8787787878, taggs);
        this.mealId = resp.mealId;
        this.imgH = resp.imgH;
        this.imgW = resp.imgW;
        this.setData({ taggs: taggs });
        wx.hideLoading();
    };
    ImageTagPage.prototype.handleTapSimilarName = function (e) {
        var _this = this;
        var index = e.currentTarget.dataset.textIndex;
        var idx = e.currentTarget.dataset.textIdx;
        var taggs = this.data.taggs.slice();
        taggs[index].selectedPos = idx;
        taggs[index].foodName = taggs[index].resultList[idx].foodName;
        taggs[index].foodId = taggs[index].resultList[idx].foodId;
        taggs[index].foodType = taggs[index].resultList[idx].foodType;
        this.setData({ taggs: taggs }, function () {
            console.log(_this.data.taggs);
        });
    };
    ImageTagPage.prototype.handleDeleteTag = function (e) {
        var index = e.currentTarget.dataset.textIndex;
        var taggs = JSON.parse(JSON.stringify(this.data.taggs));
        taggs.splice(index, 1);
        this.setData({ taggs: taggs });
    };
    ImageTagPage.prototype.handleInputNameBySelf = function (e) {
        var tagIndex = e.currentTarget.dataset.textIndex;
        this.setData({
            showPopup: true,
            scrollTop: this.scrollTop,
            tagIndex: tagIndex,
            keyword: '',
            resultList: [],
            resultError: false,
            showPopupTitle: "\u8BF7\u66F4\u6539\u7B2C" + (tagIndex + 1) + "\u4E2A\u98DF\u7269\u7684\u540D\u79F0",
        });
    };
    ImageTagPage.prototype.handleClosePopup = function () {
        this.setData({ showPopup: false });
        wx.pageScrollTo({
            scrollTop: this.data.scrollTop,
            duration: 0
        });
    };
    ImageTagPage.prototype.handleInputSearchValue = function (e) {
        this.setData({ keyword: e.detail });
    };
    ImageTagPage.prototype.performSearch = function () {
        var keyword = this.data.keyword;
        var req = { query: keyword };
        var that = this;
        webAPI.RetrieveTextSearch(req).then(function (resp) {
            that.setResultList(resp);
        }).catch(function (err) { return console.log(err); });
    };
    ImageTagPage.prototype.setResultList = function (resp) {
        var _this = this;
        var results = [];
        if (resp.result_list.length == 0) {
            this.setData({
                resultList: [],
                resultError: true
            });
        }
        else {
            for (var index in resp.result_list) {
                var item = resp.result_list[index];
                var result = {
                    foodId: item.food_id,
                    foodName: item.food_name,
                    foodType: item.food_type,
                    amount: item.amount,
                    unit: item.unit_name,
                    energy: Math.floor(item.energy / 100)
                };
                results.push(result);
            }
            this.setData({
                resultList: results,
                resultError: false
            }, function () {
                console.log('resultList', _this.data.resultList);
            });
        }
    };
    ImageTagPage.prototype.handleTapResultItem = function (e) {
        var _this = this;
        var itemIndex = e.currentTarget.dataset.textIndex;
        var item = this.data.resultList[itemIndex];
        var taggs = this.data.taggs.slice();
        if (this.createTag) {
            this.createTag = __assign({}, this.createTag, { resultList: [{
                        foodId: item.foodId,
                        foodName: item.foodName,
                        foodType: item.foodType
                    }], foodId: item.foodId, foodName: item.foodName, foodType: item.foodType });
            taggs.push(this.createTag);
            this.createTag = null;
            var resp = {
                mealId: this.mealId,
                prediction: taggs.slice(),
            };
            this.setData({
                taggs: taggs,
                showPopup: false,
            }, function () {
                wx.pageScrollTo({
                    scrollTop: _this.data.scrollTop,
                    duration: 0
                });
            });
        }
        else {
            taggs[this.data.tagIndex].resultList[0] = {
                foodId: item.foodId,
                foodName: item.foodName,
                foodType: item.foodType
            };
            taggs[this.data.tagIndex].selectedPos = 0;
            taggs[this.data.tagIndex].foodId = item.foodId;
            taggs[this.data.tagIndex].foodName = item.foodName;
            taggs[this.data.tagIndex].foodType = item.foodType;
            this.setData({
                taggs: taggs,
                showPopup: false,
            }, function () {
                wx.pageScrollTo({
                    scrollTop: _this.data.scrollTop,
                    duration: 0
                });
            });
        }
    };
    ImageTagPage.prototype.goConfirmMeal = function () {
        var _this = this;
        var taggsTemp = this.data.taggs.slice();
        taggsTemp.map(function (item) {
            item.tagX = item.tagX * _this.divideproportion * 2;
            item.tagY = item.tagY * _this.divideproportion * 2;
        });
        var mealInfo = {
            mealDate: this.mealDate,
            mealType: 1,
            imgKey: this.imgKey,
            imgH: this.imgH,
            imgW: this.imgW,
            taggs: taggsTemp
        };
        var jsonMealInfo = JSON.stringify(mealInfo);
        wx.navigateTo({ url: "./../confirmMeal/index?jsonMealInfo=" + jsonMealInfo });
    };
    ImageTagPage.prototype.handleCreateTag = function (event) {
        var that = this;
        var clientX = event.changedTouches[0].clientX;
        var clientY = event.changedTouches[0].clientY;
        wx.getImageInfo({
            src: that.data.imageUrl,
            success: function (res) {
                if (res.height / res.width > 0.96) {
                    var query = wx.createSelectorQuery();
                    query.select('.fix-image').boundingClientRect();
                    query.exec(function (res) {
                        var leftX = res[0].left;
                        var tagX = clientX - leftX;
                        that.createTag = {
                            tagType: 3,
                            tagX: tagX,
                            tagY: clientY,
                            selectedPos: 0
                        };
                    });
                }
                else {
                    that.createTag = {
                        tagType: 3,
                        tagX: clientX,
                        tagY: clientY,
                        selectedPos: 0
                    };
                }
            }
        });
        this.setData({
            showPopup: true,
            keyword: '',
            resultList: [],
            resultError: false,
            showPopupTitle: "\u8BF7\u641C\u7D22\u6DFB\u52A0\u7B2C" + (this.data.taggs.length + 1) + "\u4E2A\u98DF\u7269"
        });
    };
    ImageTagPage.prototype.onTagMove = function (event) {
        var _a;
        var index = event.currentTarget.dataset.tagIndex;
        var xOperation = "taggs[" + index + "].tagX";
        var yOperation = "taggs[" + index + "].tagY";
        this.setData((_a = {},
            _a[xOperation] = event.detail.x,
            _a[yOperation] = event.detail.y,
            _a));
    };
    return ImageTagPage;
}());
Page(new ImageTagPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXNEO0FBRXRELG9EQUFzRDtBQUN0RCx3REFBZ0Q7QUF3QmhEO0lBQUE7UUFDUyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUNsQixtQkFBYyxHQUFHLFNBQVMsQ0FBQztRQUMzQixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLHFCQUFnQixHQUFDLENBQUMsQ0FBQztRQUNuQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsY0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQixTQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osU0FBSSxHQUFHLElBQUksQ0FBQztRQUNaLFdBQU0sR0FBRSxJQUFJLENBQUM7UUFDYixTQUFJLEdBQVM7WUFFbEIsZUFBZSxFQUFFLENBQUM7WUFDbEIsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxDQUFDO1lBQ2IsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFDLENBQUM7WUFDWixXQUFXLEVBQUMsQ0FBQztZQUViLFNBQVMsRUFBQyxLQUFLO1lBQ2YsT0FBTyxFQUFDLEVBQUU7WUFDVixVQUFVLEVBQUUsRUFBRTtZQUNkLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFFBQVEsRUFBQyxJQUFJO1lBQ2IsU0FBUyxFQUFDLENBQUM7WUFDWCxjQUFjLEVBQUMsRUFBRTtTQUNsQixDQUFBO0lBOGZILENBQUM7SUE1ZlEsNkJBQU0sR0FBYixVQUFjLE1BQVc7UUFDdkIsSUFBSSxJQUFJLEdBQU8sSUFBSSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztR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VUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsS0FBSztZQUNsQixjQUFjLEVBQUMsMENBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsd0JBQUs7U0FDdEQsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLGdDQUFTLEdBQWhCLFVBQWlCLEtBQVU7O1FBQ3pCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqRCxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUM3QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUM1QyxJQUFZLENBQUMsT0FBTztZQUNuQixHQUFDLFVBQVUsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsR0FBQyxVQUFVLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO0lBQ0wsQ0FBQztJQWdISCxtQkFBQztBQUFELENBQUMsQUE1aEJELElBNGhCQztBQUVELElBQUksQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IFJldHJpZXZlUmVjb2duaXRpb25SZXEsIFJldHJpZXZlUmVjb2duaXRpb25SZXNwIH0gZnJvbSBcIi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzXCI7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJ1xuXG5cbnR5cGUgRGF0YSA9IHtcbiAgY3VycmVudFRhZ0luZGV4OiBudW1iZXI7XG4gIHRhZ2dzOiBUYWdbXTtcbiAgaW1hZ2VVcmw6IHN0cmluZztcbiAgcGl4ZWxSYXRpbzogbnVtYmVyO1xuICBoaWRlQmFubmVyOiBib29sZWFuO1xuICBpbWFnZVdpZHRoOm51bWJlcjtcbn1cbnR5cGUgVGFnID0ge1xuICB0YWdYOiBudW1iZXI7XG4gIHRhZ1k6IG51bWJlcjtcbiAgYmJveFg6bnVtYmVyO1xuICBiYm94WTogbnVtYmVyO1xuICBiYm94VzogbnVtYmVyO1xuICBiYm94SDogbnVtYmVyO1xuICBmb29kVHlwZTogbnVtYmVyOyAgLy8xLnJlY2VpcGUgMi4gcmVjZWlwZVxuICB0YWdUeXBlOiBudW1iZXI7IC8vMSByZWNvZ25pdGlvbiwgMiB0ZXh0U2VhcmNoIDMuYWRkaXRpb25hbFNlYXJjaFxuICBzZWxlY3RlZFBvczogbnVtYmVyO1xuICByZXN1bHRMaXN0OiBSZXN1bHRbXTtcbn1cblxuY2xhc3MgSW1hZ2VUYWdQYWdlIHtcbiAgcHVibGljIG1lYWxJZCA9IC0xO1xuICBwdWJsaWMgaW5jcmVtZW50YWxJZCA9IDA7XG4gIHB1YmxpYyB0ZXh0U2VhcmNoRm9vZCA9IHVuZGVmaW5lZDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDsgLy8g6aaW6aG15Lyg6YCS6L+b5p2l55qEXG4gIHB1YmxpYyBtZWFsVHlwZSA9IDA7IC8vIOmmlumhteS8oOmAkui/m+adpeeahFxuICAvLyBwdWJsaWMgc2NyZWVuV2lkdGggPSAwO1xuICBwdWJsaWMgZGl2aWRlcHJvcG9ydGlvbj0wOy8v55yf5a6e5a695bqm6Zmk5LulNzIwcnB477ybXG4gIHB1YmxpYyBzY3JvbGxUb3AgPSAwOyAvLyDkuLrkuoboh6rliqjmu5rliqjliLDkuYvliY3nmoTkvY3nva5cbiAgcHVibGljIGNyZWF0ZVRhZyA9IG51bGw7IC8vIOeUqOaIt+mVv+aMieWbvueJh+aJgOWIm+W7uueahOS4tOaXtnRhZ1xuICBwdWJsaWMgaW1nSCA9IG51bGw7IC8vIOivhuWIq+WbvueJh+WQju+8jOWQjuWPsOi/lOWbnueahOWbvueJh+mrmOW6plxuICBwdWJsaWMgaW1nVyA9IG51bGw7IC8vIOivhuWIq+WbvueJh+WQju+8jOWQjuWPsOi/lOWbnueahOWbvueJh+WuveW6plxuICBwdWJsaWMgaW1nS2V5ID1udWxsOyAvLyDoo4HliarkuIrkuKrpobXpnaLkvKDmnaXnmoRpbWfot6/lvoTlvpfliLBcbiAgcHVibGljIGRhdGE6IERhdGEgPSB7XG4gICAgLy9tb2NrdXAgdGFnIGxpc3RcbiAgICBjdXJyZW50VGFnSW5kZXg6IDAsXG4gICAgdGFnZ3M6IFtdLFxuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBpeGVsUmF0aW86IDIsXG4gICAgaGlkZUJhbm5lcjogZmFsc2UsXG4gICAgaW1hZ2VXaWR0aDowLFxuICAgIGltYWdlSGVpZ2h0OjAsXG4gICAgLy8gc2NyZWVuV2lkdGg6MCxcbiAgICBzaG93UG9wdXA6ZmFsc2UsIC8vIOaYr+WQpuWxleekunBvcHVw77yM5Lul5L6b55So5oi36Ieq5bex6L6T5YWldGFn5ZCN5a2XXG4gICAga2V5d29yZDonJyxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgdGFnSW5kZXg6bnVsbCwgLy8g55So5oi354K55Ye756ys5Yeg5Liq6YCJ6aG55p2l6Ieq5bex6L6T5YWl6aOf54mp5ZCN56ewXG4gICAgc2Nyb2xsVG9wOjAsXG4gICAgc2hvd1BvcHVwVGl0bGU6JycsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbjogYW55KSB7XG4gICAgdmFyIHRoYXQ6YW55ID0gdGhpcztcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7IFxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGltYWdlVXJsOiBvcHRpb24uaW1hZ2VVcmwgfSk7XG4gICAgY29uc29sZS5sb2coJ+mhtemdouWKoOi9veaXtueahG9wdGlvbi5pbWFnZXVybCcsb3B0aW9uLmltYWdlVXJsKVxuICAgIHd4LmdldEltYWdlSW5mbyh7XG4gICAgICBzcmM6IG9wdGlvbi5pbWFnZVVybCxcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGlmKHJlcy5oZWlnaHQvcmVzLndpZHRoPjAuOTYpeyAvLyDpq5jlm75cbiAgICAgICAgICB0aGF0LmRpdmlkZXByb3BvcnRpb24gPSByZXMuaGVpZ2h0IC8gNzIwXG4gICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgIGltYWdlSGVpZ2h0OjcyMCxcbiAgICAgICAgICAgIGltYWdlV2lkdGg6IHJlcy53aWR0aCAqIDcyMCAvIHJlcy5oZWlnaHRcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXsgLy8g5a695Zu+XG4gICAgICAgICAgdGhhdC5kaXZpZGVwcm9wb3J0aW9uID0gcmVzLndpZHRoIC8gNzUwXG4gICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgIGltYWdlV2lkdGg6IDc1MCxcbiAgICAgICAgICAgIGltYWdlSGVpZ2h0OiByZXMuaGVpZ2h0ICogNzIwIC8gcmVzLndpZHRoXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5tZWFsVHlwZSA9IHBhcnNlSW50KG9wdGlvbi5tZWFsVHlwZSk7XG4gICAgdGhpcy5tZWFsRGF0ZSA9IHBhcnNlSW50KG9wdGlvbi5tZWFsRGF0ZSk7XG4gICAgd3guZ2V0U3lzdGVtSW5mbyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHRoYXQuc2NyZWVuV2lkdGggPSByZXMud2luZG93V2lkdGg7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgc2NyZWVuV2lkdGg6IHJlcy53aW5kb3dXaWR0aCxcbiAgICAgICAgICBwaXhlbFJhdGlvOiByZXMucGl4ZWxSYXRpb1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuaW1nS2V5ID0gb3B0aW9uLmltYWdlVXJsLnNwbGl0KFwiL1wiKS5wb3AoKTtcbiAgICB0aGlzLmdldFJlY29nbml0aW9uUmVzdWx0KHRoaXMuaW1nS2V5KTtcbiAgfVxuXG4gIC8vIHB1YmxpYyBvblNob3coKSB7XG4gICAgLy8gaWYgKHRoaXMudGV4dFNlYXJjaEZvb2QpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMudGV4dFNlYXJjaEZvb2QpO1xuICAgIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdXCI7XG4gICAgLy8gICBsZXQgZm9vZE5hbWUgPSB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZS5zcGxpdChcIltcIilbMF07XG4gICAgLy8gICBsZXQgcmVzdWx0ID0gW3sgZm9vZF9pZDogdGhpcy50ZXh0U2VhcmNoRm9vZC5mb29kX2lkLCBmb29kX25hbWU6IGZvb2ROYW1lLCBmb29kX3R5cGU6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF90eXBlIH1dO1xuICAgIC8vICAgbGV0IHRhZ1kgPSB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0udGFnX3k7XG4gICAgLy8gICBsZXQgdGFnWCA9IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS50YWdfeDtcbiAgICAvLyAgIGxldCB0YWcgPSB7IGZvb2RfaWQ6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF9pZCwgZm9vZF9uYW1lOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZSwgZm9vZF90eXBlOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfdHlwZSwgc2VsZWN0ZWRQb3M6IDAsIHNob3dEZWxldGVCdG46IGZhbHNlLCB0YWdfeDogdGFnWCwgdGFnX3k6IHRhZ1ksIHJlc3VsdF9saXN0OiByZXN1bHQgfTtcbiAgICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgLy8gICAgIFtvcGVyYXRpb25dOiB0YWcsXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRoaXMudGV4dFNlYXJjaEZvb2QgPSB1bmRlZmluZWQ7XG4gICAgLy8gfSBlbHNlIGlmICh0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0gJiYgdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0WzBdLmZvb2RfaWQgPT09IDApIHtcbiAgICAvLyAgIC8vcmVtb3ZlIHRleHQgc2VhcmNoIGl0ZW1cbiAgICAvLyAgIHRoaXMuZGF0YS50YWdncy5zcGxpY2UodGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleCwgMSk7XG4gICAgLy8gICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgIC8vICAgICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzLFxuICAgIC8vICAgICBjdXJyZW50VGFnSW5kZXg6IDBcbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgLy8gfVxuXG4gIHB1YmxpYyBvblBhZ2VTY3JvbGwoZTphbnkpe1xuICAgIHRoaXMuc2Nyb2xsVG9wID0gZS5zY3JvbGxUb3A7XG4gIH1cblxuLyoqXG4gKiDlj5Hlh7ror4bliKvlm77niYfkuK3po5/niannmoRhcGlcbiAqL1xuICBwdWJsaWMgZ2V0UmVjb2duaXRpb25SZXN1bHQoaW1hZ2VLZXk6IFN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuivhuWIq+S4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgIGxldCByZXE6IFJldHJpZXZlUmVjb2duaXRpb25SZXEgPSB7IG1lYWxUeXBlOiB0aGlzLm1lYWxUeXBlLG1lYWxEYXRlOnRoaXMubWVhbERhdGUsaW1hZ2VLZXl9O1xuICAgIHJlcXVlc3QucmVjb2duaXplRm9vZChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGF0LnBhcnNlUmVjb2duaXRpb25EYXRhKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZygpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICfojrflj5bor4bliKvnu5PmnpzlpLHotKUnLFxuICAgICAgICBjb250ZW50OiBKU09OLnN0cmluZ2lmeShlcnIpLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6L+U5Zue55qE5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VSZWNvZ25pdGlvbkRhdGEocmVzcDogUmV0cmlldmVSZWNvZ25pdGlvblJlc3ApIHtcbiAgICBsZXQgdGFnZ3MgPSBbXTtcbiAgICBjb25zb2xlLmxvZygn5YiG6L6o546HICcsdGhpcy5kYXRhLnBpeGVsUmF0aW8pXG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5wcmVkaWN0aW9uSW5mb0xpc3QpIHtcbiAgICAgIGxldCBwcmVkaWN0aW9uSXRlbSA9IHJlc3AucHJlZGljdGlvbkluZm9MaXN0W2luZGV4XTtcbiAgICAgIGxldCByZXN1bHRMaXN0ID0gcmVzcC5wcmVkaWN0aW9uSW5mb0xpc3RbaW5kZXhdLnJlY29nbml0aW9uUmVzdWx0TGlzdDtcbiAgICAgIGxldCBpdGVtID0ge1xuICAgICAgICB0YWdYOiBwcmVkaWN0aW9uSXRlbS50YWdYIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICB0YWdZOiBwcmVkaWN0aW9uSXRlbS50YWdZIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICBiYm94WDogcHJlZGljdGlvbkl0ZW0uYmJveFgsXG4gICAgICAgIGJib3hZOiBwcmVkaWN0aW9uSXRlbS5iYm94WSxcbiAgICAgICAgYmJveFc6IHByZWRpY3Rpb25JdGVtLmJib3hXLFxuICAgICAgICBiYm94SDogcHJlZGljdGlvbkl0ZW0uYmJveEgsXG4gICAgICAgIGZvb2RJZDogcHJlZGljdGlvbkl0ZW0uZm9vZElkLFxuICAgICAgICBmb29kVHlwZTogcHJlZGljdGlvbkl0ZW0uZm9vZFR5cGUsXG4gICAgICAgIGZvb2ROYW1lOiBwcmVkaWN0aW9uSXRlbS5mb29kTmFtZSxcbiAgICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gICAgICAgIHJlc3VsdExpc3Q6IHJlc3VsdExpc3RcbiAgICAgIH07XG4gICAgICB0YWdncy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyg4Nzg3Nzg3ODc4LHRhZ2dzKVxuICAgIHRoaXMubWVhbElkID0gcmVzcC5tZWFsSWQ7XG4gICAgdGhpcy5pbWdIID0gcmVzcC5pbWdIO1xuICAgIHRoaXMuaW1nVyA9IHJlc3AuaW1nVztcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB0YWdnczogdGFnZ3MgfSk7XG4gICAgd3guaGlkZUxvYWRpbmcoKVxuICB9XG4gIC8qKlxuICAgKiDngrnlh7twb3PvvIznlKjmiLfpgInkuK3mn5DkuKpwb3NcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVUYXBTaW1pbGFyTmFtZShlOmFueSl7XG4gICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgY29uc3QgaWR4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dElkeDtcbiAgICBsZXQgdGFnZ3MgPSBbLi4udGhpcy5kYXRhLnRhZ2dzXTtcbiAgICB0YWdnc1tpbmRleF0uc2VsZWN0ZWRQb3MgPSBpZHg7XG4gICAgdGFnZ3NbaW5kZXhdLmZvb2ROYW1lID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kTmFtZTtcbiAgICB0YWdnc1tpbmRleF0uZm9vZElkID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kSWQ7XG4gICAgdGFnZ3NbaW5kZXhdLmZvb2RUeXBlID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kVHlwZTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3RhZ2dzOnRhZ2dzfSwoKT0+e1xuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnRhZ2dzKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIOWIoOmZpOafkOS4quWvueW6lOeahHRhZ1xuICAgKi9cbiAgcHVibGljIGhhbmRsZURlbGV0ZVRhZyhlOmFueSl7XG4gICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgLy8gbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgbGV0IHRhZ2dzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEudGFnZ3MpKTtcbiAgICB0YWdncy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt0YWdnczp0YWdnc30pXG4gIH1cbiAgLyoqXG4gICAqIOeCueWHu+agoemqjOmAiemhue+8jOeUqOaIt+iHquW3sei+k+WFpXRhZ+WQjeWtl1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUlucHV0TmFtZUJ5U2VsZihlOmFueSl7XG4gICAgY29uc3QgdGFnSW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHNob3dQb3B1cDp0cnVlLFxuICAgICAgc2Nyb2xsVG9wOnRoaXMuc2Nyb2xsVG9wLFxuICAgICAgdGFnSW5kZXg6dGFnSW5kZXgsXG4gICAgICBrZXl3b3JkOicnLCAvLyDmlbDmja7liJ3lp4vljJZcbiAgICAgIHJlc3VsdExpc3Q6IFtdLCAvLyDmlbDmja7liJ3lp4vljJZcbiAgICAgIHJlc3VsdEVycm9yOiBmYWxzZSwgLy8g5pWw5o2u5Yid5aeL5YyWXG4gICAgICBzaG93UG9wdXBUaXRsZTpg6K+35pu05pS556ysJHt0YWdJbmRleCsxfeS4qumjn+eJqeeahOWQjeensGAsXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOeUqOaIt+eCueWHu+WFs+mXrXBvcHVwXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlQ2xvc2VQb3B1cCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BvcHVwOmZhbHNlfSk7XG4gICAgd3gucGFnZVNjcm9sbFRvKHtcbiAgICAgIHNjcm9sbFRvcDogdGhpcy5kYXRhLnNjcm9sbFRvcCxcbiAgICAgIGR1cmF0aW9uOiAwXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPlueUqOaIt+i+k+WFpeaWh+Wtl1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUlucHV0U2VhcmNoVmFsdWUoZTphbnkpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7a2V5d29yZDogZS5kZXRhaWx9KTtcbiAgfVxuICAvKipcbiAgICog55So5oi354K55Ye75pCc57SiXG4gICAqL1xuICBwdWJsaWMgcGVyZm9ybVNlYXJjaCgpIHtcbiAgICBsZXQga2V5d29yZCA9IHRoaXMuZGF0YS5rZXl3b3JkO1xuICAgIGxldCByZXEgPSB7IHF1ZXJ5OiBrZXl3b3JkIH07XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHdlYkFQSS5SZXRyaWV2ZVRleHRTZWFyY2gocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhhdC5zZXRSZXN1bHRMaXN0KHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuICAvKipcbiAgKiDop6PmnpDmjqXlj6PnmoTmlbDmja5cbiAgKi9cbiAgcHVibGljIHNldFJlc3VsdExpc3QocmVzcCkge1xuICAgIGxldCByZXN1bHRzID0gW107XG4gICAgaWYgKHJlc3AucmVzdWx0X2xpc3QubGVuZ3RoID09IDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlc3VsdExpc3Q6IFtdLFxuICAgICAgICByZXN1bHRFcnJvcjogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5yZXN1bHRfbGlzdCkge1xuICAgICAgICBsZXQgaXRlbSA9IHJlc3AucmVzdWx0X2xpc3RbaW5kZXhdO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgIGZvb2RJZDogaXRlbS5mb29kX2lkLFxuICAgICAgICAgIGZvb2ROYW1lOiBpdGVtLmZvb2RfbmFtZSxcbiAgICAgICAgICBmb29kVHlwZTogaXRlbS5mb29kX3R5cGUsXG4gICAgICAgICAgYW1vdW50OiBpdGVtLmFtb3VudCxcbiAgICAgICAgICB1bml0OiBpdGVtLnVuaXRfbmFtZSxcbiAgICAgICAgICBlbmVyZ3k6IE1hdGguZmxvb3IoaXRlbS5lbmVyZ3kgLyAxMDApXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICByZXN1bHRMaXN0OiByZXN1bHRzLFxuICAgICAgICByZXN1bHRFcnJvcjogZmFsc2VcbiAgICAgIH0sKCk9PntcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdExpc3QnLHRoaXMuZGF0YS5yZXN1bHRMaXN0KVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vmkJzntKLliJfooajkuK3nmoTmn5DpoblcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVUYXBSZXN1bHRJdGVtKGU6YW55KXtcbiAgICBjb25zdCBpdGVtSW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZGF0YS5yZXN1bHRMaXN0W2l0ZW1JbmRleF07XG4gICAgbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgaWYodGhpcy5jcmVhdGVUYWcpeyAvLyDnlKjmiLfplb/mjInlm77niYdcbiAgICAgIHRoaXMuY3JlYXRlVGFnPXtcbiAgICAgICAgLi4udGhpcy5jcmVhdGVUYWcsXG4gICAgICAgIHJlc3VsdExpc3Q6IFt7XG4gICAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgICBmb29kTmFtZTogaXRlbS5mb29kTmFtZSxcbiAgICAgICAgICBmb29kVHlwZTogaXRlbS5mb29kVHlwZVxuICAgICAgICB9XSxcbiAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZE5hbWUsXG4gICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RUeXBlXG4gICAgICB9XG4gICAgICB0YWdncy5wdXNoKHRoaXMuY3JlYXRlVGFnKTtcbiAgICAgIHRoaXMuY3JlYXRlVGFnID0gbnVsbDtcbiAgICAgIGxldCByZXNwID0ge1xuICAgICAgICBtZWFsSWQ6dGhpcy5tZWFsSWQsXG4gICAgICAgIHByZWRpY3Rpb246Wy4uLnRhZ2dzXSxcbiAgICAgIH07XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICB0YWdnczp0YWdncyxcbiAgICAgICAgc2hvd1BvcHVwOmZhbHNlLFxuICAgICAgfSwoKT0+e1xuICAgICAgICB3eC5wYWdlU2Nyb2xsVG8oe1xuICAgICAgICAgIHNjcm9sbFRvcDogdGhpcy5kYXRhLnNjcm9sbFRvcCxcbiAgICAgICAgICBkdXJhdGlvbjogMFxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfWVsc2V7IC8vIOeUqOaIt+eCueWHu+agoeWHhuaMiemSrlxuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5yZXN1bHRMaXN0WzBdPXtcbiAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZE5hbWUsXG4gICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RUeXBlXG4gICAgICB9O1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5zZWxlY3RlZFBvcyA9IDA7XG4gICAgICB0YWdnc1t0aGlzLmRhdGEudGFnSW5kZXhdLmZvb2RJZCA9IGl0ZW0uZm9vZElkO1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5mb29kTmFtZSA9IGl0ZW0uZm9vZE5hbWU7XG4gICAgICB0YWdnc1t0aGlzLmRhdGEudGFnSW5kZXhdLmZvb2RUeXBlID0gaXRlbS5mb29kVHlwZTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRhZ2dzOnRhZ2dzLFxuICAgICAgICBzaG93UG9wdXA6ZmFsc2UsXG4gICAgICB9LCgpPT57XG4gICAgICAgIHd4LnBhZ2VTY3JvbGxUbyh7XG4gICAgICAgICAgc2Nyb2xsVG9wOiB0aGlzLmRhdGEuc2Nyb2xsVG9wLFxuICAgICAgICAgIGR1cmF0aW9uOiAwXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDngrnlh7vkuIvkuIDmraXvvIzov5vlhaXnoa7orqTliIbph4/pobXpnaJcbiAgICovXG4gIHB1YmxpYyBnb0NvbmZpcm1NZWFsKCl7XG4gICAgbGV0IHRhZ2dzVGVtcCA9IFsuLi50aGlzLmRhdGEudGFnZ3NdO1xuICAgIHRhZ2dzVGVtcC5tYXAoaXRlbT0+e1xuICAgICAgaXRlbS50YWdYID0gaXRlbS50YWdYICogdGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMlxuICAgICAgaXRlbS50YWdZID0gaXRlbS50YWdZICogdGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMlxuICAgIH0pO1xuICAgIGNvbnN0IG1lYWxJbmZvID0ge1xuICAgICAgbWVhbERhdGU6dGhpcy5tZWFsRGF0ZSxcbiAgICAgIG1lYWxUeXBlOjEsXG4gICAgICBpbWdLZXk6dGhpcy5pbWdLZXksXG4gICAgICBpbWdIOnRoaXMuaW1nSCxcbiAgICAgIGltZ1c6dGhpcy5pbWdXLFxuICAgICAgdGFnZ3M6dGFnZ3NUZW1wXG4gICAgfVxuICAgIGNvbnN0IGpzb25NZWFsSW5mbyA9IEpTT04uc3RyaW5naWZ5KG1lYWxJbmZvKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHt1cmw6YC4vLi4vY29uZmlybU1lYWwvaW5kZXg/anNvbk1lYWxJbmZvPSR7anNvbk1lYWxJbmZvfWB9KVxuICB9XG5cblxuXG5cbiAgLy8gcHVibGljIGxvYWREdW1teURhdGEoKSB7XG4gIC8vICAgbGV0IHRhZ2dzID0gW1xuICAvLyAgICAge1xuICAvLyAgICAgICB0YWdUeXBlOiAxLFxuICAvLyAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgLy8gICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgLy8gICAgICAgICB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLopb/lhbDoirHngpLohYrogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmsLTnha7pnZLoj5xcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmnKjpobvogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLnlarojITngpLpuKHom4tcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLpurvlqYbosYbohZBcIiB9LFxuICAvLyAgICAgICBdLFxuICAvLyAgICAgICBmb29kX2lkOiAwLFxuICAvLyAgICAgICBmb29kX25hbWU6IFwi6KW/5YWw6Iqx54KS6IWK6IKJXCIsXG4gIC8vICAgICAgIHRhZ194OiA1MCxcbiAgLy8gICAgICAgdGFnX3k6IDUwXG4gIC8vICAgICB9LFxuICAvLyAgICAge1xuICAvLyAgICAgICB0YWdUeXBlOiAxLFxuICAvLyAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgLy8gICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgLy8gICAgICAgICB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLnsbPppa1cIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLoirHljbdcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLniZvlpbZcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLnmb3lt6flhYvliptcIiB9XG4gIC8vICAgICAgIF0sXG4gIC8vICAgICAgIGZvb2RfaWQ6IDAsXG4gIC8vICAgICAgIGZvb2RfbmFtZTogXCLnsbPppa1cIixcbiAgLy8gICAgICAgdGFnX3g6IDMwMCxcbiAgLy8gICAgICAgdGFnX3k6IDUwXG4gIC8vICAgICB9LFxuICAvLyAgICAge1xuICAvLyAgICAgICB0YWdUeXBlOiAxLFxuICAvLyAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgLy8gICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgLy8gICAgICAgICB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLngpLmsrnpuqboj5xcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLngpLlsI/nmb3oj5xcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLngpLlnLDnk5zlj7ZcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLngpLnqbrlv4Poj5xcIiB9XG4gIC8vICAgICAgIF0sXG4gIC8vICAgICAgIGZvb2RfaWQ6IDAsXG4gIC8vICAgICAgIGZvb2RfbmFtZTogXCLngpLmsrnpuqboj5xcIixcbiAgLy8gICAgICAgdGFnX3g6IDEwMCxcbiAgLy8gICAgICAgdGFnX3k6IDIwMFxuICAvLyAgICAgfVxuICAvLyAgIF07XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGFnZ3M6IHRhZ2dzIH0pO1xuICAvLyB9XG5cbiAgLy8gcHVibGljIG9uQ2hhbmdlVGFnUG9zaXRpb24oZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jYW5kaWRhdGVzSW5kZXg7XG4gIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLnNlbGVjdGVkUG9zXCI7XG4gIC8vICAgbGV0IGNoYW5nZUlkT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9pZFwiO1xuICAvLyAgIGxldCBjaGFuZ2VOYW1lT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9uYW1lXCI7XG4gIC8vICAgbGV0IGNoYW5nZUZvb2RUeXBlT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF90eXBlXCI7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiBpbmRleCxcbiAgLy8gICAgIFtjaGFuZ2VJZE9wZXJhdGlvbl06IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFtpbmRleF0uZm9vZF9pZCxcbiAgLy8gICAgIFtjaGFuZ2VOYW1lT3BlcmF0aW9uXTogdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0W2luZGV4XS5mb29kX25hbWUsXG4gIC8vICAgICBbY2hhbmdlRm9vZFR5cGVPcGVyYXRpb25dOiB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0ucmVzdWx0X2xpc3RbaW5kZXhdLmZvb2RfdHlwZVxuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIOmVv+aMieeUn+aIkOaWsOeahOagh+etvlxuICAgKi9cbiAgcHVibGljIGhhbmRsZUNyZWF0ZVRhZyhldmVudDogYW55KSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgY29uc3QgY2xpZW50WCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFg7IC8v55u45a+55LqO5bGP5bmVXG4gICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7IC8v55u45a+55LqO5bGP5bmVXG4gICAgd3guZ2V0SW1hZ2VJbmZvKHtcbiAgICAgIHNyYzogdGhhdC5kYXRhLmltYWdlVXJsLFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgaWYocmVzLmhlaWdodC9yZXMud2lkdGg+MC45Nil7IC8vIOmrmOWbvlxuICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gd3guY3JlYXRlU2VsZWN0b3JRdWVyeSgpXG4gICAgICAgICAgcXVlcnkuc2VsZWN0KCcuZml4LWltYWdlJykuYm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBxdWVyeS5leGVjKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICBsZXQgbGVmdFggPSByZXNbMF0ubGVmdFxuICAgICAgICAgICAgbGV0IHRhZ1ggPSBjbGllbnRYLWxlZnRYO1xuICAgICAgICAgICAgdGhhdC5jcmVhdGVUYWcgPSB7XG4gICAgICAgICAgICAgIHRhZ1R5cGU6IDMsXG4gICAgICAgICAgICAgIHRhZ1g6IHRhZ1gsXG4gICAgICAgICAgICAgIHRhZ1k6IGNsaWVudFksXG4gICAgICAgICAgICAgIHNlbGVjdGVkUG9zOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNleyAvLyDlrr3lm75cbiAgICAgICAgICB0aGF0LmNyZWF0ZVRhZyA9IHtcbiAgICAgICAgICAgIHRhZ1R5cGU6IDMsXG4gICAgICAgICAgICB0YWdYOiBjbGllbnRYLFxuICAgICAgICAgICAgdGFnWTogY2xpZW50WSxcbiAgICAgICAgICAgIHNlbGVjdGVkUG9zOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBzaG93UG9wdXA6dHJ1ZSxcbiAgICAgIGtleXdvcmQ6JycsXG4gICAgICByZXN1bHRMaXN0OiBbXSxcbiAgICAgIHJlc3VsdEVycm9yOiBmYWxzZSxcbiAgICAgIHNob3dQb3B1cFRpdGxlOmDor7fmkJzntKLmt7vliqDnrKwke3RoaXMuZGF0YS50YWdncy5sZW5ndGgrMX3kuKrpo5/nialgXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBvblRhZ01vdmUoZXZlbnQ6IGFueSkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgICBsZXQgeE9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyBpbmRleCArIFwiXS50YWdYXCI7XG4gICAgbGV0IHlPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnWVwiO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBbeE9wZXJhdGlvbl06IGV2ZW50LmRldGFpbC54LFxuICAgICAgW3lPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueVxuICAgIH0pO1xuICB9XG5cbiAgLy8gcHVibGljIG9uU3RhcnRUb3VjaFRhZyhldmVudDogYW55KSB7XG4gIC8vICAgY29uc29sZS5sb2coXCJvbiB0b3VjaCBzdGFydFwiKTtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGFnSW5kZXg7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIGN1cnJlbnRUYWdJbmRleDogaW5kZXgsXG4gIC8vICAgICB0YWdnczp0aGlzLmRhdGEudGFnZ3NcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG4gIC8vIHB1YmxpYyBvbkFkZENhbmRpZGF0ZXNUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jYW5kaWRhdGVzSW5kZXg7XG4gIC8vICAgbGV0IHRhZ05hbWUgPSB0aGlzLmRhdGEuY2FuZGlkYXRlc1RhZ0xpc3RbaW5kZXhdLnRhZ05hbWVcbiAgLy8gICAvL2dldCBpbWFnZSBjZW50ZXJcbiAgLy8gICBsZXQgdG91Y2hYID0gMTA7XG4gIC8vICAgbGV0IHRvdWNoWSA9IDEwO1xuICAvLyAgIGxldCB0YWc6IFRhZyA9IHtcbiAgLy8gICAgIHg6IHRvdWNoWCxcbiAgLy8gICAgIHk6IHRvdWNoWSxcbiAgLy8gICAgIGRvdENvbG9yOiAnI2UwMTVmYScsXG4gIC8vICAgICBkaXNwYWx5TWVzc2FnZTogdGFnTmFtZSxcbiAgLy8gICAgIHJlYWx0ZWRJbmZvOiB7fVxuICAvLyAgIH07XG4gIC8vICAgLy9hZGQgaW50byB0YWdncyBhbmQgcmVmcmVzaFxuICAvLyAgIHRoaXMuZGF0YS50YWdncy5wdXNoKHRhZyk7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIHRhZ2dzOiB0aGlzLmRhdGEudGFnZ3NcbiAgLy8gICB9KTtcbiAgLy8gICB0aGlzLmluY3JlbWVudGFsSWQrKztcbiAgLy8gfVxuXG4gIC8vIHB1YmxpYyBvblRvZ2dsZURlbGV0ZVRhZyhldmVudDogYW55KSB7XG4gIC8vICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAvLyAgIGxldCBvcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0uc2hvd0RlbGV0ZUJ0blwiO1xuICAvLyAgIGxldCBmbGFnID0gdGhpcy5kYXRhLnRhZ2dzW2luZGV4XS5zaG93RGVsZXRlQnRuO1xuICAvLyAgIGxldCBoZWlnaHQgPSBmbGFnID8gNjUgOiA5NTtcbiAgLy8gICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAvLyAgICAgW29wZXJhdGlvbl06ICFmbGFnLFxuICAvLyAgICAgW3RhZ0hlaWdodE9wZXJhdGlvbl06IGhlaWdodFxuICAvLyAgIH0pO1xuICAvLyB9XG5cblxuICAvLyBwdWJsaWMgZGVsZXRlVGFnKGV2ZW50OiBhbnkpIHtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGFnSW5kZXg7XG4gIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyBpbmRleCArIFwiXS5pc0RlbGV0ZWRcIjtcbiAgLy8gICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAvLyAgICAgW29wZXJhdGlvbl06IHRydWUsXG4gIC8vICAgICBjdXJyZW50VGFnSW5kZXg6IDBcbiAgLy8gICB9KTtcbiAgLy8gICB0aGlzLmluY3JlbWVudGFsSWQrKztcbiAgLy8gfVxuXG4gIC8vIHB1YmxpYyBvbkFkZFRleHRTZWFyY2hUYWcoKSB7XG4gIC8vICAgLy91c2UgbmF2aWdhdGUgYmFjayB0byBnZXQgc2VhcmNoIHJlc3VsdFxuICAvLyAgIHd4Lm5hdmlnYXRlVG8oe1xuICAvLyAgICAgdXJsOiBcIi9wYWdlcy90ZXh0U2VhcmNoL2luZGV4P3RpdGxlPeabtOWkmumjn+eJqVwiXG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgbmF2aVRvRm9vZERldGFpbFBhZ2UoKSB7XG4gIC8vICAgdmFyIHRoYXQgPSB0aGlzO1xuICAvLyAgIHd4LmdldEltYWdlSW5mbyh7XG4gIC8vICAgICBzcmM6IHRoaXMuZGF0YS5pbWFnZVVybCxcbiAgLy8gICAgIHN1Y2Nlc3MoaW1nOiBhbnkpIHtcbiAgLy8gICAgICAgbGV0IHBhcmFtID0geyBpbWFnZVVybDogdGhhdC5kYXRhLmltYWdlVXJsLCBtZWFsSWQ6IDAsIHNob3dTaGFyZUJ0bjogdHJ1ZSB9O1xuICAvLyAgICAgICBsZXQgcGljUmF0aW8gPSBpbWcud2lkdGggLyB0aGF0LmRhdGEuc2NyZWVuV2lkdGhcbiAgLy8gICAgICAgY29uc29sZS5sb2coaW1nKTtcbiAgLy8gICAgICAgY29uc29sZS5sb2coXCJwaWNSYXRpbzpcIitwaWNSYXRpbyk7XG4gIC8vICAgICAgIC8vZ2V0IGZvb2REZXRhaWwgZnJvbSBiYWNrZW5kXG4gIC8vICAgICAgIGxldCBmb29kX2xpc3QgPSBbXTtcbiAgLy8gICAgICAgZm9yIChsZXQgaW5kZXggaW4gdGhhdC5kYXRhLnRhZ2dzKSB7XG4gIC8vICAgICAgICAgbGV0IHRhZyA9IHRoYXQuZGF0YS50YWdnc1tpbmRleF07XG4gIC8vICAgICAgICAgaWYgKHRhZy5pc0RlbGV0ZWQpIHsgY29udGludWUgfTtcbiAgLy8gICAgICAgICBsZXQgdGFnWCA9IE1hdGguZmxvb3IodGFnLnRhZ194ICogdGhhdC5kYXRhLnBpeGVsUmF0aW8gKiBwaWNSYXRpbyk7XG4gIC8vICAgICAgICAgbGV0IHRhZ1kgPSBNYXRoLmZsb29yKHRhZy50YWdfeSAqIHRoYXQuZGF0YS5waXhlbFJhdGlvICogcGljUmF0aW8pO1xuICAvLyAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRhZ1ggK1wiLFwiK3RhZ1kpO1xuICAvLyAgICAgICAgIGxldCBiYm94X3ggPSB0YWcuYmJveF94O1xuICAvLyAgICAgICAgIGxldCBiYm94X3kgPSB0YWcuYmJveF95O1xuICAvLyAgICAgICAgIGxldCBiYm94X3cgPSB0YWcuYmJveF93O1xuICAvLyAgICAgICAgIGxldCBiYm94X2ggPSB0YWcuYmJveF9oO1xuICAvLyAgICAgICAgIGxldCBmb29kSWQgPSB0YWcucmVzdWx0X2xpc3RbdGFnLnNlbGVjdGVkUG9zXS5mb29kX2lkO1xuICAvLyAgICAgICAgIGxldCBmb29kVHlwZSA9IHRhZy5yZXN1bHRfbGlzdFt0YWcuc2VsZWN0ZWRQb3NdLmZvb2RfdHlwZTtcbiAgLy8gICAgICAgICBsZXQgcmVzdWx0cyA9IHRhZy5yZXN1bHRfbGlzdDtcbiAgLy8gICAgICAgICBsZXQgZm9vZCA9IHsgZm9vZF9pZDogZm9vZElkLCBpbnB1dF90eXBlOiAxLCBmb29kX3R5cGU6IGZvb2RUeXBlLCB0YWdfeDogdGFnWCwgdGFnX3k6IHRhZ1ksIGJib3hfeDogYmJveF94LCBiYm94X3k6IGJib3hfeSwgYmJveF93OiBiYm94X3csIGJib3hfaDogYmJveF9oLCByZWNvZ25pdGlvbl9yZXN1bHRzOiByZXN1bHRzIH07XG4gIC8vICAgICAgICAgZm9vZF9saXN0LnB1c2goZm9vZCk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgICAgbGV0IHJlcSA9IHsgbWVhbF9pZDogdGhhdC5tZWFsSWQsIG1lYWxfdHlwZTogdGhhdC5tZWFsVHlwZSwgbWVhbF9kYXRlOiB0aGF0Lm1lYWxEYXRlLCBmb29kX2xpc3Q6IGZvb2RfbGlzdCB9O1xuICAvLyAgICAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAvLyAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiIH0pO1xuICAvLyAgICAgICB3ZWJBUEkuQ3JlYXRlT3JVcGRhdGVNZWFsTG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIC8vICAgICAgICAgdGhhdC5tZWFsSWQgPSByZXNwLm1lYWxfaWQ7XG4gIC8vICAgICAgICAgcGFyYW0ubWVhbElkID0gdGhhdC5tZWFsSWRcbiAgLy8gICAgICAgICBwYXJhbS5pbWFnZVVybCA9IHRoYXQuZGF0YS5pbWFnZVVybFxuICAvLyAgICAgICAgIGxldCBwYXJhbUpzb24gPSBKU09OLnN0cmluZ2lmeShwYXJhbSk7XG4gIC8vICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gIC8vICAgICAgICAgICB1cmw6IFwiL3BhZ2VzL2Zvb2REZXRhaWwvaW5kZXg/cGFyYW1Kc29uPVwiICsgcGFyYW1Kc29uXG4gIC8vICAgICAgICAgfSk7XG4gIC8vICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gIC8vICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgLy8gICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAvLyAgICAgICAgICAgdGl0bGU6ICcnLFxuICAvLyAgICAgICAgICAgY29udGVudDogJ+iOt+WPlumjn+eJqeS/oeaBr+Wksei0pScsXG4gIC8vICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAvLyAgICAgICAgIH0pXG4gIC8vICAgICAgIH0pO1xuICAvLyAgICAgfSxcbiAgLy8gICAgIGZhaWwoZXJyKSB7IGNvbnNvbGUubG9nKGVycik7IH1cbiAgLy8gICB9KTtcbiAgLy8gfVxufVxuXG5QYWdlKG5ldyBJbWFnZVRhZ1BhZ2UoKSk7Il19