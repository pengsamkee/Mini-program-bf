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
        this.title = null;
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
        this.title = option.title;
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
            mealType: this.mealType,
            imgKey: this.imgKey,
            imgH: this.imgH,
            imgW: this.imgW,
            title: this.title,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXNEO0FBRXRELG9EQUFzRDtBQUN0RCx3REFBZ0Q7QUF3QmhEO0lBQUE7UUFDUyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUNsQixtQkFBYyxHQUFHLFNBQVMsQ0FBQztRQUMzQixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLHFCQUFnQixHQUFDLENBQUMsQ0FBQztRQUNuQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsY0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQixTQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osU0FBSSxHQUFHLElBQUksQ0FBQztRQUNaLFdBQU0sR0FBRSxJQUFJLENBQUM7UUFDYixVQUFLLEdBQUUsSUFBSSxDQUFDO1FBQ1osU0FBSSxHQUFTO1lBRWxCLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLEtBQUssRUFBRSxFQUFFO1lBQ1QsUUFBUSxFQUFFLEVBQUU7WUFDWixVQUFVLEVBQUUsQ0FBQztZQUNiLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBQyxDQUFDO1lBQ1osV0FBVyxFQUFDLENBQUM7WUFFYixTQUFTLEVBQUMsS0FBSztZQUNmLE9BQU8sRUFBQyxFQUFFO1lBQ1YsVUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsS0FBSztZQUNsQixRQUFRLEVBQUMsSUFBSTtZQUNiLFNBQVMsRUFBQyxDQUFDO1lBQ1gsY0FBYyxFQUFDLEVBQUU7U0FDbEIsQ0FBQTtJQWdnQkgsQ0FBQztJQTlmUSw2QkFBTSxHQUFiLFVBQWMsTUFBVztRQUN2QixJQUFJLElBQUksR0FBTyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEQsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNkLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUNwQixPQUFPLFlBQUMsR0FBRztnQkFDVCxJQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUMsR0FBRyxDQUFDLEtBQUssR0FBQyxJQUFJLEVBQUM7b0JBQzNCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQTtvQkFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQzt3QkFDWCxXQUFXLEVBQUMsR0FBRzt3QkFDZixVQUFVLEVBQUUsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU07cUJBQ3pDLENBQUMsQ0FBQTtpQkFDSDtxQkFBSTtvQkFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUE7b0JBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUM7d0JBQ1gsVUFBVSxFQUFFLEdBQUc7d0JBQ2YsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLO3FCQUMxQyxDQUFDLENBQUE7aUJBQ0g7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDMUIsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNmLE9BQU8sRUFBRSxVQUFVLEdBQUc7Z0JBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDbEMsSUFBWSxDQUFDLE9BQU8sQ0FBQztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVU7aUJBQzNCLENBQUMsQ0FBQTtZQUNKLENBQUM7U0FDRixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQXlCTSxtQ0FBWSxHQUFuQixVQUFvQixDQUFLO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBS00sMkNBQW9CLEdBQTNCLFVBQTRCLFFBQWdCO1FBQzFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLEdBQUcsR0FBMkIsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxRQUFRLFVBQUEsRUFBQyxDQUFDO1FBQzdGLG1CQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDbEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUc7WUFDVixFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakIsRUFBRSxDQUFDLFNBQVMsQ0FBQztnQkFDWCxLQUFLLEVBQUUsVUFBVTtnQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO2dCQUM1QixVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLTSwyQ0FBb0IsR0FBM0IsVUFBNEIsSUFBNkI7UUFDdkQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN4QyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN6QyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1lBQ3RFLElBQUksSUFBSSxHQUFHO2dCQUNULElBQUksRUFBRSxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO2dCQUN2RCxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUs7Z0JBQzNCLEtBQUssRUFBRSxjQUFjLENBQUMsS0FBSztnQkFDM0IsS0FBSyxFQUFFLGNBQWMsQ0FBQyxLQUFLO2dCQUMzQixLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUs7Z0JBQzNCLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTTtnQkFDN0IsUUFBUSxFQUFFLGNBQWMsQ0FBQyxRQUFRO2dCQUNqQyxRQUFRLEVBQUUsY0FBYyxDQUFDLFFBQVE7Z0JBQ2pDLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFVBQVUsRUFBRSxVQUFVO2FBQ3ZCLENBQUM7WUFDRixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUMsS0FBSyxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNsQixDQUFDO0lBSU0sMkNBQW9CLEdBQTNCLFVBQTRCLENBQUs7UUFBakMsaUJBV0M7UUFWQyxJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDaEQsSUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzVDLElBQUksS0FBSyxHQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFDLENBQUM7UUFDakMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUM5RCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzFELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDN0QsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDOUIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBSU0sc0NBQWUsR0FBdEIsVUFBdUIsQ0FBSztRQUMxQixJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFFaEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN4RCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUlNLDRDQUFxQixHQUE1QixVQUE2QixDQUFLO1FBQ2hDLElBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNsRCxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBQyxJQUFJO1lBQ2QsU0FBUyxFQUFDLElBQUksQ0FBQyxTQUFTO1lBQ3hCLFFBQVEsRUFBQyxRQUFRO1lBQ2pCLE9BQU8sRUFBQyxFQUFFO1lBQ1YsVUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsS0FBSztZQUNsQixjQUFjLEVBQUMsOEJBQU8sUUFBUSxHQUFDLENBQUMsMENBQVE7U0FDekMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUlNLHVDQUFnQixHQUF2QjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ2QsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUM5QixRQUFRLEVBQUUsQ0FBQztTQUNaLENBQUMsQ0FBQztJQUNMLENBQUM7SUFJTSw2Q0FBc0IsR0FBN0IsVUFBOEIsQ0FBSztRQUNoQyxJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFJTSxvQ0FBYSxHQUFwQjtRQUNFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2hDLElBQUksR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQzdCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtZQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBSU0sb0NBQWEsR0FBcEIsVUFBcUIsSUFBSTtRQUF6QixpQkEyQkM7UUExQkMsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQy9CLElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFdBQVcsRUFBRSxJQUFJO2FBQ2xCLENBQUMsQ0FBQTtTQUNIO2FBQU07WUFDTCxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25DLElBQUksTUFBTSxHQUFHO29CQUNYLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDcEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUN4QixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUNwQixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztpQkFDdEMsQ0FBQTtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RCO1lBQ0EsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsVUFBVSxFQUFFLE9BQU87Z0JBQ25CLFdBQVcsRUFBRSxLQUFLO2FBQ25CLEVBQUM7Z0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUNoRCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUlNLDBDQUFtQixHQUExQixVQUEyQixDQUFLO1FBQWhDLGlCQW1EQztRQWxEQyxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDcEQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQUMsQ0FBQztRQUNqQyxJQUFHLElBQUksQ0FBQyxTQUFTLEVBQUM7WUFDaEIsSUFBSSxDQUFDLFNBQVMsZ0JBQ1QsSUFBSSxDQUFDLFNBQVMsSUFDakIsVUFBVSxFQUFFLENBQUM7d0JBQ1gsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO3dCQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7d0JBQ3ZCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtxQkFDeEIsQ0FBQyxFQUNGLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQ3hCLENBQUE7WUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLElBQUksR0FBRztnQkFDVCxNQUFNLEVBQUMsSUFBSSxDQUFDLE1BQU07Z0JBQ2xCLFVBQVUsRUFBSyxLQUFLLFFBQUM7YUFDdEIsQ0FBQztZQUNELElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLEtBQUssRUFBQyxLQUFLO2dCQUNYLFNBQVMsRUFBQyxLQUFLO2FBQ2hCLEVBQUM7Z0JBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFDZCxTQUFTLEVBQUUsS0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTO29CQUM5QixRQUFRLEVBQUUsQ0FBQztpQkFDWixDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQTtTQUNIO2FBQUk7WUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDeEIsQ0FBQztZQUNGLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDL0MsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbkQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbEQsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsS0FBSyxFQUFDLEtBQUs7Z0JBQ1gsU0FBUyxFQUFDLEtBQUs7YUFDaEIsRUFBQztnQkFDQSxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUNkLFNBQVMsRUFBRSxLQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7b0JBQzlCLFFBQVEsRUFBRSxDQUFDO2lCQUNaLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDO0lBS00sb0NBQWEsR0FBcEI7UUFBQSxpQkFpQkM7UUFoQkMsSUFBSSxTQUFTLEdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQUMsQ0FBQztRQUNyQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtZQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQTtZQUNqRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQTtRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNILElBQU0sUUFBUSxHQUFHO1lBQ2YsUUFBUSxFQUFDLElBQUksQ0FBQyxRQUFRO1lBQ3RCLFFBQVEsRUFBQyxJQUFJLENBQUMsUUFBUTtZQUN0QixNQUFNLEVBQUMsSUFBSSxDQUFDLE1BQU07WUFDbEIsSUFBSSxFQUFDLElBQUksQ0FBQyxJQUFJO1lBQ2QsSUFBSSxFQUFDLElBQUksQ0FBQyxJQUFJO1lBQ2QsS0FBSyxFQUFDLElBQUksQ0FBQyxLQUFLO1lBQ2hCLEtBQUssRUFBQyxTQUFTO1NBQ2hCLENBQUE7UUFDRCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBQyxHQUFHLEVBQUMseUNBQXVDLFlBQWMsRUFBQyxDQUFDLENBQUE7SUFDNUUsQ0FBQztJQTZETSxzQ0FBZSxHQUF0QixVQUF1QixLQUFVO1FBQy9CLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNoRCxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNoRCxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUN2QixPQUFPLFlBQUMsR0FBRztnQkFDVCxJQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUMsR0FBRyxDQUFDLEtBQUssR0FBQyxJQUFJLEVBQUM7b0JBQzNCLElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO29CQUN0QyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUE7b0JBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBUyxHQUFHO3dCQUNyQixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO3dCQUN2QixJQUFJLElBQUksR0FBRyxPQUFPLEdBQUMsS0FBSyxDQUFDO3dCQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHOzRCQUNmLE9BQU8sRUFBRSxDQUFDOzRCQUNWLElBQUksRUFBRSxJQUFJOzRCQUNWLElBQUksRUFBRSxPQUFPOzRCQUNiLFdBQVcsRUFBRSxDQUFDO3lCQUNmLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUE7aUJBQ0g7cUJBQUk7b0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRzt3QkFDZixPQUFPLEVBQUUsQ0FBQzt3QkFDVixJQUFJLEVBQUUsT0FBTzt3QkFDYixJQUFJLEVBQUUsT0FBTzt3QkFDYixXQUFXLEVBQUUsQ0FBQztxQkFDZixDQUFDO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQztRQUNGLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsU0FBUyxFQUFDLElBQUk7WUFDZCxPQUFPLEVBQUMsRUFBRTtZQUNWLFVBQVUsRUFBRSxFQUFFO1lBQ2QsV0FBVyxFQUFFLEtBQUs7WUFDbEIsY0FBYyxFQUFDLDBDQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxDQUFDLHdCQUFLO1NBQ3RELENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSxnQ0FBUyxHQUFoQixVQUFpQixLQUFVOztRQUN6QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDakQsSUFBSSxVQUFVLEdBQUcsUUFBUSxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDN0MsSUFBSSxVQUFVLEdBQUcsUUFBUSxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDNUMsSUFBWSxDQUFDLE9BQU87WUFDbkIsR0FBQyxVQUFVLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLEdBQUMsVUFBVSxJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztJQUNMLENBQUM7SUFnSEgsbUJBQUM7QUFBRCxDQUFDLEFBL2hCRCxJQStoQkM7QUFFRCxJQUFJLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQgeyBSZXRyaWV2ZVJlY29nbml0aW9uUmVxLCBSZXRyaWV2ZVJlY29nbml0aW9uUmVzcCB9IGZyb20gXCIvYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi8uLi9hcGkvR2xvYmFsRW51bSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSdcblxuXG50eXBlIERhdGEgPSB7XG4gIGN1cnJlbnRUYWdJbmRleDogbnVtYmVyO1xuICB0YWdnczogVGFnW107XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHBpeGVsUmF0aW86IG51bWJlcjtcbiAgaGlkZUJhbm5lcjogYm9vbGVhbjtcbiAgaW1hZ2VXaWR0aDpudW1iZXI7XG59XG50eXBlIFRhZyA9IHtcbiAgdGFnWDogbnVtYmVyO1xuICB0YWdZOiBudW1iZXI7XG4gIGJib3hYOm51bWJlcjtcbiAgYmJveFk6IG51bWJlcjtcbiAgYmJveFc6IG51bWJlcjtcbiAgYmJveEg6IG51bWJlcjtcbiAgZm9vZFR5cGU6IG51bWJlcjsgIC8vMS5yZWNlaXBlIDIuIHJlY2VpcGVcbiAgdGFnVHlwZTogbnVtYmVyOyAvLzEgcmVjb2duaXRpb24sIDIgdGV4dFNlYXJjaCAzLmFkZGl0aW9uYWxTZWFyY2hcbiAgc2VsZWN0ZWRQb3M6IG51bWJlcjtcbiAgcmVzdWx0TGlzdDogUmVzdWx0W107XG59XG5cbmNsYXNzIEltYWdlVGFnUGFnZSB7XG4gIHB1YmxpYyBtZWFsSWQgPSAtMTtcbiAgcHVibGljIGluY3JlbWVudGFsSWQgPSAwO1xuICBwdWJsaWMgdGV4dFNlYXJjaEZvb2QgPSB1bmRlZmluZWQ7XG4gIHB1YmxpYyBtZWFsRGF0ZSA9IDA7IC8vIOmmlumhteS8oOmAkui/m+adpeeahFxuICBwdWJsaWMgbWVhbFR5cGUgPSAwOyAvLyDpppbpobXkvKDpgJLov5vmnaXnmoRcbiAgLy8gcHVibGljIHNjcmVlbldpZHRoID0gMDtcbiAgcHVibGljIGRpdmlkZXByb3BvcnRpb249MDsvL+ecn+WunuWuveW6pumZpOS7pTcyMHJweO+8m1xuICBwdWJsaWMgc2Nyb2xsVG9wID0gMDsgLy8g5Li65LqG6Ieq5Yqo5rua5Yqo5Yiw5LmL5YmN55qE5L2N572uXG4gIHB1YmxpYyBjcmVhdGVUYWcgPSBudWxsOyAvLyDnlKjmiLfplb/mjInlm77niYfmiYDliJvlu7rnmoTkuLTml7Z0YWdcbiAgcHVibGljIGltZ0ggPSBudWxsOyAvLyDor4bliKvlm77niYflkI7vvIzlkI7lj7Dov5Tlm57nmoTlm77niYfpq5jluqZcbiAgcHVibGljIGltZ1cgPSBudWxsOyAvLyDor4bliKvlm77niYflkI7vvIzlkI7lj7Dov5Tlm57nmoTlm77niYflrr3luqZcbiAgcHVibGljIGltZ0tleSA9bnVsbDsgLy8g6KOB5Ymq5LiK5Liq6aG16Z2i5Lyg5p2l55qEaW1n6Lev5b6E5b6X5YiwXG4gIHB1YmxpYyB0aXRsZSA9bnVsbDsgLy8g6aaW6aG15Lyg5p2l77yM5L6b5YiG5p6Q6aG154K55Ye757un57ut5re75Yqg55SoXG4gIHB1YmxpYyBkYXRhOiBEYXRhID0ge1xuICAgIC8vbW9ja3VwIHRhZyBsaXN0XG4gICAgY3VycmVudFRhZ0luZGV4OiAwLFxuICAgIHRhZ2dzOiBbXSxcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwaXhlbFJhdGlvOiAyLFxuICAgIGhpZGVCYW5uZXI6IGZhbHNlLFxuICAgIGltYWdlV2lkdGg6MCxcbiAgICBpbWFnZUhlaWdodDowLFxuICAgIC8vIHNjcmVlbldpZHRoOjAsXG4gICAgc2hvd1BvcHVwOmZhbHNlLCAvLyDmmK/lkKblsZXnpLpwb3B1cO+8jOS7peS+m+eUqOaIt+iHquW3sei+k+WFpXRhZ+WQjeWtl1xuICAgIGtleXdvcmQ6JycsXG4gICAgcmVzdWx0TGlzdDogW10sXG4gICAgcmVzdWx0RXJyb3I6IGZhbHNlLFxuICAgIHRhZ0luZGV4Om51bGwsIC8vIOeUqOaIt+eCueWHu+esrOWHoOS4qumAiemhueadpeiHquW3sei+k+WFpemjn+eJqeWQjeensFxuICAgIHNjcm9sbFRvcDowLFxuICAgIHNob3dQb3B1cFRpdGxlOicnLFxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb246IGFueSkge1xuICAgIHZhciB0aGF0OmFueSA9IHRoaXM7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpOyBcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBpbWFnZVVybDogb3B0aW9uLmltYWdlVXJsIH0pO1xuICAgIGNvbnNvbGUubG9nKCfpobXpnaLliqDovb3ml7bnmoRvcHRpb24uaW1hZ2V1cmwnLG9wdGlvbi5pbWFnZVVybClcbiAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgc3JjOiBvcHRpb24uaW1hZ2VVcmwsXG4gICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICBpZihyZXMuaGVpZ2h0L3Jlcy53aWR0aD4wLjk2KXsgLy8g6auY5Zu+XG4gICAgICAgICAgdGhhdC5kaXZpZGVwcm9wb3J0aW9uID0gcmVzLmhlaWdodCAvIDcyMFxuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWFnZUhlaWdodDo3MjAsXG4gICAgICAgICAgICBpbWFnZVdpZHRoOiByZXMud2lkdGggKiA3MjAgLyByZXMuaGVpZ2h0XG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7IC8vIOWuveWbvlxuICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy53aWR0aCAvIDc1MFxuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWFnZVdpZHRoOiA3NTAsXG4gICAgICAgICAgICBpbWFnZUhlaWdodDogcmVzLmhlaWdodCAqIDcyMCAvIHJlcy53aWR0aFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChvcHRpb24ubWVhbFR5cGUpO1xuICAgIHRoaXMubWVhbERhdGUgPSBwYXJzZUludChvcHRpb24ubWVhbERhdGUpO1xuICAgIHRoaXMudGl0bGUgPSBvcHRpb24udGl0bGU7XG4gICAgd3guZ2V0U3lzdGVtSW5mbyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHRoYXQuc2NyZWVuV2lkdGggPSByZXMud2luZG93V2lkdGg7XG4gICAgICAgICh0aGF0IGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgc2NyZWVuV2lkdGg6IHJlcy53aW5kb3dXaWR0aCxcbiAgICAgICAgICBwaXhlbFJhdGlvOiByZXMucGl4ZWxSYXRpb1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuaW1nS2V5ID0gb3B0aW9uLmltYWdlVXJsLnNwbGl0KFwiL1wiKS5wb3AoKTtcbiAgICB0aGlzLmdldFJlY29nbml0aW9uUmVzdWx0KHRoaXMuaW1nS2V5KTtcbiAgfVxuXG4gIC8vIHB1YmxpYyBvblNob3coKSB7XG4gICAgLy8gaWYgKHRoaXMudGV4dFNlYXJjaEZvb2QpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMudGV4dFNlYXJjaEZvb2QpO1xuICAgIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdXCI7XG4gICAgLy8gICBsZXQgZm9vZE5hbWUgPSB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZS5zcGxpdChcIltcIilbMF07XG4gICAgLy8gICBsZXQgcmVzdWx0ID0gW3sgZm9vZF9pZDogdGhpcy50ZXh0U2VhcmNoRm9vZC5mb29kX2lkLCBmb29kX25hbWU6IGZvb2ROYW1lLCBmb29kX3R5cGU6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF90eXBlIH1dO1xuICAgIC8vICAgbGV0IHRhZ1kgPSB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0udGFnX3k7XG4gICAgLy8gICBsZXQgdGFnWCA9IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS50YWdfeDtcbiAgICAvLyAgIGxldCB0YWcgPSB7IGZvb2RfaWQ6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF9pZCwgZm9vZF9uYW1lOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZSwgZm9vZF90eXBlOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfdHlwZSwgc2VsZWN0ZWRQb3M6IDAsIHNob3dEZWxldGVCdG46IGZhbHNlLCB0YWdfeDogdGFnWCwgdGFnX3k6IHRhZ1ksIHJlc3VsdF9saXN0OiByZXN1bHQgfTtcbiAgICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgLy8gICAgIFtvcGVyYXRpb25dOiB0YWcsXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRoaXMudGV4dFNlYXJjaEZvb2QgPSB1bmRlZmluZWQ7XG4gICAgLy8gfSBlbHNlIGlmICh0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0gJiYgdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0WzBdLmZvb2RfaWQgPT09IDApIHtcbiAgICAvLyAgIC8vcmVtb3ZlIHRleHQgc2VhcmNoIGl0ZW1cbiAgICAvLyAgIHRoaXMuZGF0YS50YWdncy5zcGxpY2UodGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleCwgMSk7XG4gICAgLy8gICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgIC8vICAgICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzLFxuICAgIC8vICAgICBjdXJyZW50VGFnSW5kZXg6IDBcbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgLy8gfVxuXG4gIHB1YmxpYyBvblBhZ2VTY3JvbGwoZTphbnkpe1xuICAgIHRoaXMuc2Nyb2xsVG9wID0gZS5zY3JvbGxUb3A7XG4gIH1cblxuLyoqXG4gKiDlj5Hlh7ror4bliKvlm77niYfkuK3po5/niannmoRhcGlcbiAqL1xuICBwdWJsaWMgZ2V0UmVjb2duaXRpb25SZXN1bHQoaW1hZ2VLZXk6IFN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuivhuWIq+S4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgIGxldCByZXE6IFJldHJpZXZlUmVjb2duaXRpb25SZXEgPSB7IG1lYWxUeXBlOiB0aGlzLm1lYWxUeXBlLG1lYWxEYXRlOnRoaXMubWVhbERhdGUsaW1hZ2VLZXl9O1xuICAgIHJlcXVlc3QucmVjb2duaXplRm9vZChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGF0LnBhcnNlUmVjb2duaXRpb25EYXRhKHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZygpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICfojrflj5bor4bliKvnu5PmnpzlpLHotKUnLFxuICAgICAgICBjb250ZW50OiBKU09OLnN0cmluZ2lmeShlcnIpLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6L+U5Zue55qE5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VSZWNvZ25pdGlvbkRhdGEocmVzcDogUmV0cmlldmVSZWNvZ25pdGlvblJlc3ApIHtcbiAgICBsZXQgdGFnZ3MgPSBbXTtcbiAgICBjb25zb2xlLmxvZygn5YiG6L6o546HICcsdGhpcy5kYXRhLnBpeGVsUmF0aW8pXG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5wcmVkaWN0aW9uSW5mb0xpc3QpIHtcbiAgICAgIGxldCBwcmVkaWN0aW9uSXRlbSA9IHJlc3AucHJlZGljdGlvbkluZm9MaXN0W2luZGV4XTtcbiAgICAgIGxldCByZXN1bHRMaXN0ID0gcmVzcC5wcmVkaWN0aW9uSW5mb0xpc3RbaW5kZXhdLnJlY29nbml0aW9uUmVzdWx0TGlzdDtcbiAgICAgIGxldCBpdGVtID0ge1xuICAgICAgICB0YWdYOiBwcmVkaWN0aW9uSXRlbS50YWdYIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICB0YWdZOiBwcmVkaWN0aW9uSXRlbS50YWdZIC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICBiYm94WDogcHJlZGljdGlvbkl0ZW0uYmJveFgsXG4gICAgICAgIGJib3hZOiBwcmVkaWN0aW9uSXRlbS5iYm94WSxcbiAgICAgICAgYmJveFc6IHByZWRpY3Rpb25JdGVtLmJib3hXLFxuICAgICAgICBiYm94SDogcHJlZGljdGlvbkl0ZW0uYmJveEgsXG4gICAgICAgIGZvb2RJZDogcHJlZGljdGlvbkl0ZW0uZm9vZElkLFxuICAgICAgICBmb29kVHlwZTogcHJlZGljdGlvbkl0ZW0uZm9vZFR5cGUsXG4gICAgICAgIGZvb2ROYW1lOiBwcmVkaWN0aW9uSXRlbS5mb29kTmFtZSxcbiAgICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gICAgICAgIHJlc3VsdExpc3Q6IHJlc3VsdExpc3RcbiAgICAgIH07XG4gICAgICB0YWdncy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyg4Nzg3Nzg3ODc4LHRhZ2dzKVxuICAgIHRoaXMubWVhbElkID0gcmVzcC5tZWFsSWQ7XG4gICAgdGhpcy5pbWdIID0gcmVzcC5pbWdIO1xuICAgIHRoaXMuaW1nVyA9IHJlc3AuaW1nVztcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB0YWdnczogdGFnZ3MgfSk7XG4gICAgd3guaGlkZUxvYWRpbmcoKVxuICB9XG4gIC8qKlxuICAgKiDngrnlh7twb3PvvIznlKjmiLfpgInkuK3mn5DkuKpwb3NcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVUYXBTaW1pbGFyTmFtZShlOmFueSl7XG4gICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgY29uc3QgaWR4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dElkeDtcbiAgICBsZXQgdGFnZ3MgPSBbLi4udGhpcy5kYXRhLnRhZ2dzXTtcbiAgICB0YWdnc1tpbmRleF0uc2VsZWN0ZWRQb3MgPSBpZHg7XG4gICAgdGFnZ3NbaW5kZXhdLmZvb2ROYW1lID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kTmFtZTtcbiAgICB0YWdnc1tpbmRleF0uZm9vZElkID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kSWQ7XG4gICAgdGFnZ3NbaW5kZXhdLmZvb2RUeXBlID0gdGFnZ3NbaW5kZXhdLnJlc3VsdExpc3RbaWR4XS5mb29kVHlwZTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3RhZ2dzOnRhZ2dzfSwoKT0+e1xuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnRhZ2dzKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIOWIoOmZpOafkOS4quWvueW6lOeahHRhZ1xuICAgKi9cbiAgcHVibGljIGhhbmRsZURlbGV0ZVRhZyhlOmFueSl7XG4gICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgLy8gbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgbGV0IHRhZ2dzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEudGFnZ3MpKTtcbiAgICB0YWdncy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt0YWdnczp0YWdnc30pXG4gIH1cbiAgLyoqXG4gICAqIOeCueWHu+agoemqjOmAiemhue+8jOeUqOaIt+iHquW3sei+k+WFpXRhZ+WQjeWtl1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUlucHV0TmFtZUJ5U2VsZihlOmFueSl7XG4gICAgY29uc3QgdGFnSW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHNob3dQb3B1cDp0cnVlLFxuICAgICAgc2Nyb2xsVG9wOnRoaXMuc2Nyb2xsVG9wLFxuICAgICAgdGFnSW5kZXg6dGFnSW5kZXgsXG4gICAgICBrZXl3b3JkOicnLCAvLyDmlbDmja7liJ3lp4vljJZcbiAgICAgIHJlc3VsdExpc3Q6IFtdLCAvLyDmlbDmja7liJ3lp4vljJZcbiAgICAgIHJlc3VsdEVycm9yOiBmYWxzZSwgLy8g5pWw5o2u5Yid5aeL5YyWXG4gICAgICBzaG93UG9wdXBUaXRsZTpg6K+35pu05pS556ysJHt0YWdJbmRleCsxfeS4qumjn+eJqeeahOWQjeensGAsXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOeUqOaIt+eCueWHu+WFs+mXrXBvcHVwXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlQ2xvc2VQb3B1cCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BvcHVwOmZhbHNlfSk7XG4gICAgd3gucGFnZVNjcm9sbFRvKHtcbiAgICAgIHNjcm9sbFRvcDogdGhpcy5kYXRhLnNjcm9sbFRvcCxcbiAgICAgIGR1cmF0aW9uOiAwXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPlueUqOaIt+i+k+WFpeaWh+Wtl1xuICAgKi9cbiAgcHVibGljIGhhbmRsZUlucHV0U2VhcmNoVmFsdWUoZTphbnkpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7a2V5d29yZDogZS5kZXRhaWx9KTtcbiAgfVxuICAvKipcbiAgICog55So5oi354K55Ye75pCc57SiXG4gICAqL1xuICBwdWJsaWMgcGVyZm9ybVNlYXJjaCgpIHtcbiAgICBsZXQga2V5d29yZCA9IHRoaXMuZGF0YS5rZXl3b3JkO1xuICAgIGxldCByZXEgPSB7IHF1ZXJ5OiBrZXl3b3JkIH07XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHdlYkFQSS5SZXRyaWV2ZVRleHRTZWFyY2gocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhhdC5zZXRSZXN1bHRMaXN0KHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuICAvKipcbiAgKiDop6PmnpDmjqXlj6PnmoTmlbDmja5cbiAgKi9cbiAgcHVibGljIHNldFJlc3VsdExpc3QocmVzcCkge1xuICAgIGxldCByZXN1bHRzID0gW107XG4gICAgaWYgKHJlc3AucmVzdWx0X2xpc3QubGVuZ3RoID09IDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlc3VsdExpc3Q6IFtdLFxuICAgICAgICByZXN1bHRFcnJvcjogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5yZXN1bHRfbGlzdCkge1xuICAgICAgICBsZXQgaXRlbSA9IHJlc3AucmVzdWx0X2xpc3RbaW5kZXhdO1xuICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgIGZvb2RJZDogaXRlbS5mb29kX2lkLFxuICAgICAgICAgIGZvb2ROYW1lOiBpdGVtLmZvb2RfbmFtZSxcbiAgICAgICAgICBmb29kVHlwZTogaXRlbS5mb29kX3R5cGUsXG4gICAgICAgICAgYW1vdW50OiBpdGVtLmFtb3VudCxcbiAgICAgICAgICB1bml0OiBpdGVtLnVuaXRfbmFtZSxcbiAgICAgICAgICBlbmVyZ3k6IE1hdGguZmxvb3IoaXRlbS5lbmVyZ3kgLyAxMDApXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICByZXN1bHRMaXN0OiByZXN1bHRzLFxuICAgICAgICByZXN1bHRFcnJvcjogZmFsc2VcbiAgICAgIH0sKCk9PntcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdExpc3QnLHRoaXMuZGF0YS5yZXN1bHRMaXN0KVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vmkJzntKLliJfooajkuK3nmoTmn5DpoblcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVUYXBSZXN1bHRJdGVtKGU6YW55KXtcbiAgICBjb25zdCBpdGVtSW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZGF0YS5yZXN1bHRMaXN0W2l0ZW1JbmRleF07XG4gICAgbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgaWYodGhpcy5jcmVhdGVUYWcpeyAvLyDnlKjmiLfplb/mjInlm77niYdcbiAgICAgIHRoaXMuY3JlYXRlVGFnPXtcbiAgICAgICAgLi4udGhpcy5jcmVhdGVUYWcsXG4gICAgICAgIHJlc3VsdExpc3Q6IFt7XG4gICAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgICBmb29kTmFtZTogaXRlbS5mb29kTmFtZSxcbiAgICAgICAgICBmb29kVHlwZTogaXRlbS5mb29kVHlwZVxuICAgICAgICB9XSxcbiAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZE5hbWUsXG4gICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RUeXBlXG4gICAgICB9XG4gICAgICB0YWdncy5wdXNoKHRoaXMuY3JlYXRlVGFnKTtcbiAgICAgIHRoaXMuY3JlYXRlVGFnID0gbnVsbDtcbiAgICAgIGxldCByZXNwID0ge1xuICAgICAgICBtZWFsSWQ6dGhpcy5tZWFsSWQsXG4gICAgICAgIHByZWRpY3Rpb246Wy4uLnRhZ2dzXSxcbiAgICAgIH07XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICB0YWdnczp0YWdncyxcbiAgICAgICAgc2hvd1BvcHVwOmZhbHNlLFxuICAgICAgfSwoKT0+e1xuICAgICAgICB3eC5wYWdlU2Nyb2xsVG8oe1xuICAgICAgICAgIHNjcm9sbFRvcDogdGhpcy5kYXRhLnNjcm9sbFRvcCxcbiAgICAgICAgICBkdXJhdGlvbjogMFxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfWVsc2V7IC8vIOeUqOaIt+eCueWHu+agoeWHhuaMiemSrlxuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5yZXN1bHRMaXN0WzBdPXtcbiAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZE5hbWUsXG4gICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RUeXBlXG4gICAgICB9O1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5zZWxlY3RlZFBvcyA9IDA7XG4gICAgICB0YWdnc1t0aGlzLmRhdGEudGFnSW5kZXhdLmZvb2RJZCA9IGl0ZW0uZm9vZElkO1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5mb29kTmFtZSA9IGl0ZW0uZm9vZE5hbWU7XG4gICAgICB0YWdnc1t0aGlzLmRhdGEudGFnSW5kZXhdLmZvb2RUeXBlID0gaXRlbS5mb29kVHlwZTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRhZ2dzOnRhZ2dzLFxuICAgICAgICBzaG93UG9wdXA6ZmFsc2UsXG4gICAgICB9LCgpPT57XG4gICAgICAgIHd4LnBhZ2VTY3JvbGxUbyh7XG4gICAgICAgICAgc2Nyb2xsVG9wOiB0aGlzLmRhdGEuc2Nyb2xsVG9wLFxuICAgICAgICAgIGR1cmF0aW9uOiAwXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDngrnlh7vkuIvkuIDmraXvvIzov5vlhaXnoa7orqTliIbph4/pobXpnaJcbiAgICovXG4gIHB1YmxpYyBnb0NvbmZpcm1NZWFsKCl7XG4gICAgbGV0IHRhZ2dzVGVtcCA9IFsuLi50aGlzLmRhdGEudGFnZ3NdO1xuICAgIHRhZ2dzVGVtcC5tYXAoaXRlbT0+e1xuICAgICAgaXRlbS50YWdYID0gaXRlbS50YWdYICogdGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMlxuICAgICAgaXRlbS50YWdZID0gaXRlbS50YWdZICogdGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMlxuICAgIH0pO1xuICAgIGNvbnN0IG1lYWxJbmZvID0ge1xuICAgICAgbWVhbERhdGU6dGhpcy5tZWFsRGF0ZSxcbiAgICAgIG1lYWxUeXBlOnRoaXMubWVhbFR5cGUsXG4gICAgICBpbWdLZXk6dGhpcy5pbWdLZXksXG4gICAgICBpbWdIOnRoaXMuaW1nSCxcbiAgICAgIGltZ1c6dGhpcy5pbWdXLFxuICAgICAgdGl0bGU6dGhpcy50aXRsZSxcbiAgICAgIHRhZ2dzOnRhZ2dzVGVtcFxuICAgIH1cbiAgICBjb25zdCBqc29uTWVhbEluZm8gPSBKU09OLnN0cmluZ2lmeShtZWFsSW5mbyk7XG4gICAgd3gubmF2aWdhdGVUbyh7dXJsOmAuLy4uL2NvbmZpcm1NZWFsL2luZGV4P2pzb25NZWFsSW5mbz0ke2pzb25NZWFsSW5mb31gfSlcbiAgfVxuXG5cblxuXG4gIC8vIHB1YmxpYyBsb2FkRHVtbXlEYXRhKCkge1xuICAvLyAgIGxldCB0YWdncyA9IFtcbiAgLy8gICAgIHtcbiAgLy8gICAgICAgdGFnVHlwZTogMSxcbiAgLy8gICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gIC8vICAgICAgIHJlc3VsdF9saXN0OiBbXG4gIC8vICAgICAgICAgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi6KW/5YWw6Iqx54KS6IWK6IKJXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi5rC054Wu6Z2S6I+cXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi5pyo6aG76IKJXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi55Wq6IyE54KS6bih6JuLXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi6bq75amG6LGG6IWQXCIgfSxcbiAgLy8gICAgICAgXSxcbiAgLy8gICAgICAgZm9vZF9pZDogMCxcbiAgLy8gICAgICAgZm9vZF9uYW1lOiBcIuilv+WFsOiKseeCkuiFiuiCiVwiLFxuICAvLyAgICAgICB0YWdfeDogNTAsXG4gIC8vICAgICAgIHRhZ195OiA1MFxuICAvLyAgICAgfSxcbiAgLy8gICAgIHtcbiAgLy8gICAgICAgdGFnVHlwZTogMSxcbiAgLy8gICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gIC8vICAgICAgIHJlc3VsdF9saXN0OiBbXG4gIC8vICAgICAgICAgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi57Gz6aWtXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi6Iqx5Y23XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54mb5aW2XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi55m95ben5YWL5YqbXCIgfVxuICAvLyAgICAgICBdLFxuICAvLyAgICAgICBmb29kX2lkOiAwLFxuICAvLyAgICAgICBmb29kX25hbWU6IFwi57Gz6aWtXCIsXG4gIC8vICAgICAgIHRhZ194OiAzMDAsXG4gIC8vICAgICAgIHRhZ195OiA1MFxuICAvLyAgICAgfSxcbiAgLy8gICAgIHtcbiAgLy8gICAgICAgdGFnVHlwZTogMSxcbiAgLy8gICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gIC8vICAgICAgIHJlc3VsdF9saXN0OiBbXG4gIC8vICAgICAgICAgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54KS5rK56bqm6I+cXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54KS5bCP55m96I+cXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54KS5Zyw55Oc5Y+2XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54KS56m65b+D6I+cXCIgfVxuICAvLyAgICAgICBdLFxuICAvLyAgICAgICBmb29kX2lkOiAwLFxuICAvLyAgICAgICBmb29kX25hbWU6IFwi54KS5rK56bqm6I+cXCIsXG4gIC8vICAgICAgIHRhZ194OiAxMDAsXG4gIC8vICAgICAgIHRhZ195OiAyMDBcbiAgLy8gICAgIH1cbiAgLy8gICBdO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHRhZ2dzOiB0YWdncyB9KTtcbiAgLy8gfVxuXG4gIC8vIHB1YmxpYyBvbkNoYW5nZVRhZ1Bvc2l0aW9uKGV2ZW50OiBhbnkpIHtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuY2FuZGlkYXRlc0luZGV4O1xuICAvLyAgIGxldCBvcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleCArIFwiXS5zZWxlY3RlZFBvc1wiO1xuICAvLyAgIGxldCBjaGFuZ2VJZE9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLmZvb2RfaWRcIjtcbiAgLy8gICBsZXQgY2hhbmdlTmFtZU9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLmZvb2RfbmFtZVwiO1xuICAvLyAgIGxldCBjaGFuZ2VGb29kVHlwZU9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLmZvb2RfdHlwZVwiO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBbb3BlcmF0aW9uXTogaW5kZXgsXG4gIC8vICAgICBbY2hhbmdlSWRPcGVyYXRpb25dOiB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0ucmVzdWx0X2xpc3RbaW5kZXhdLmZvb2RfaWQsXG4gIC8vICAgICBbY2hhbmdlTmFtZU9wZXJhdGlvbl06IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFtpbmRleF0uZm9vZF9uYW1lLFxuICAvLyAgICAgW2NoYW5nZUZvb2RUeXBlT3BlcmF0aW9uXTogdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0W2luZGV4XS5mb29kX3R5cGVcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiDplb/mjInnlJ/miJDmlrDnmoTmoIfnrb5cbiAgICovXG4gIHB1YmxpYyBoYW5kbGVDcmVhdGVUYWcoZXZlbnQ6IGFueSkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgIGNvbnN0IGNsaWVudFggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYOyAvL+ebuOWvueS6juWxj+W5lVxuICAgIGNvbnN0IGNsaWVudFkgPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZOyAvL+ebuOWvueS6juWxj+W5lVxuICAgIHd4LmdldEltYWdlSW5mbyh7XG4gICAgICBzcmM6IHRoYXQuZGF0YS5pbWFnZVVybCxcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGlmKHJlcy5oZWlnaHQvcmVzLndpZHRoPjAuOTYpeyAvLyDpq5jlm75cbiAgICAgICAgICBjb25zdCBxdWVyeSA9IHd4LmNyZWF0ZVNlbGVjdG9yUXVlcnkoKVxuICAgICAgICAgIHF1ZXJ5LnNlbGVjdCgnLmZpeC1pbWFnZScpLmJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgcXVlcnkuZXhlYyhmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgbGV0IGxlZnRYID0gcmVzWzBdLmxlZnRcbiAgICAgICAgICAgIGxldCB0YWdYID0gY2xpZW50WC1sZWZ0WDtcbiAgICAgICAgICAgIHRoYXQuY3JlYXRlVGFnID0ge1xuICAgICAgICAgICAgICB0YWdUeXBlOiAzLFxuICAgICAgICAgICAgICB0YWdYOiB0YWdYLFxuICAgICAgICAgICAgICB0YWdZOiBjbGllbnRZLFxuICAgICAgICAgICAgICBzZWxlY3RlZFBvczogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXsgLy8g5a695Zu+XG4gICAgICAgICAgdGhhdC5jcmVhdGVUYWcgPSB7XG4gICAgICAgICAgICB0YWdUeXBlOiAzLFxuICAgICAgICAgICAgdGFnWDogY2xpZW50WCxcbiAgICAgICAgICAgIHRhZ1k6IGNsaWVudFksXG4gICAgICAgICAgICBzZWxlY3RlZFBvczogMFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgc2hvd1BvcHVwOnRydWUsXG4gICAgICBrZXl3b3JkOicnLFxuICAgICAgcmVzdWx0TGlzdDogW10sXG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICBzaG93UG9wdXBUaXRsZTpg6K+35pCc57Si5re75Yqg56ysJHt0aGlzLmRhdGEudGFnZ3MubGVuZ3RoKzF95Liq6aOf54mpYFxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgb25UYWdNb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGFnSW5kZXg7XG4gICAgbGV0IHhPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnWFwiO1xuICAgIGxldCB5T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ1lcIjtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW3hPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueCxcbiAgICAgIFt5T3BlcmF0aW9uXTogZXZlbnQuZGV0YWlsLnlcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHB1YmxpYyBvblN0YXJ0VG91Y2hUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGNvbnNvbGUubG9nKFwib24gdG91Y2ggc3RhcnRcIik7XG4gIC8vICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBjdXJyZW50VGFnSW5kZXg6IGluZGV4LFxuICAvLyAgICAgdGFnZ3M6dGhpcy5kYXRhLnRhZ2dzXG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25BZGRDYW5kaWRhdGVzVGFnKGV2ZW50OiBhbnkpIHtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuY2FuZGlkYXRlc0luZGV4O1xuICAvLyAgIGxldCB0YWdOYW1lID0gdGhpcy5kYXRhLmNhbmRpZGF0ZXNUYWdMaXN0W2luZGV4XS50YWdOYW1lXG4gIC8vICAgLy9nZXQgaW1hZ2UgY2VudGVyXG4gIC8vICAgbGV0IHRvdWNoWCA9IDEwO1xuICAvLyAgIGxldCB0b3VjaFkgPSAxMDtcbiAgLy8gICBsZXQgdGFnOiBUYWcgPSB7XG4gIC8vICAgICB4OiB0b3VjaFgsXG4gIC8vICAgICB5OiB0b3VjaFksXG4gIC8vICAgICBkb3RDb2xvcjogJyNlMDE1ZmEnLFxuICAvLyAgICAgZGlzcGFseU1lc3NhZ2U6IHRhZ05hbWUsXG4gIC8vICAgICByZWFsdGVkSW5mbzoge31cbiAgLy8gICB9O1xuICAvLyAgIC8vYWRkIGludG8gdGFnZ3MgYW5kIHJlZnJlc2hcbiAgLy8gICB0aGlzLmRhdGEudGFnZ3MucHVzaCh0YWcpO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzXG4gIC8vICAgfSk7XG4gIC8vICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25Ub2dnbGVEZWxldGVUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgLy8gICBsZXQgb3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnNob3dEZWxldGVCdG5cIjtcbiAgLy8gICBsZXQgZmxhZyA9IHRoaXMuZGF0YS50YWdnc1tpbmRleF0uc2hvd0RlbGV0ZUJ0bjtcbiAgLy8gICBsZXQgaGVpZ2h0ID0gZmxhZyA/IDY1IDogOTU7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiAhZmxhZyxcbiAgLy8gICAgIFt0YWdIZWlnaHRPcGVyYXRpb25dOiBoZWlnaHRcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG5cbiAgLy8gcHVibGljIGRlbGV0ZVRhZyhldmVudDogYW55KSB7XG4gIC8vICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAvLyAgIGxldCBvcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0uaXNEZWxldGVkXCI7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiB0cnVlLFxuICAvLyAgICAgY3VycmVudFRhZ0luZGV4OiAwXG4gIC8vICAgfSk7XG4gIC8vICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25BZGRUZXh0U2VhcmNoVGFnKCkge1xuICAvLyAgIC8vdXNlIG5hdmlnYXRlIGJhY2sgdG8gZ2V0IHNlYXJjaCByZXN1bHRcbiAgLy8gICB3eC5uYXZpZ2F0ZVRvKHtcbiAgLy8gICAgIHVybDogXCIvcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT3mm7TlpJrpo5/nialcIlxuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgLy8gcHVibGljIG5hdmlUb0Zvb2REZXRhaWxQYWdlKCkge1xuICAvLyAgIHZhciB0aGF0ID0gdGhpcztcbiAgLy8gICB3eC5nZXRJbWFnZUluZm8oe1xuICAvLyAgICAgc3JjOiB0aGlzLmRhdGEuaW1hZ2VVcmwsXG4gIC8vICAgICBzdWNjZXNzKGltZzogYW55KSB7XG4gIC8vICAgICAgIGxldCBwYXJhbSA9IHsgaW1hZ2VVcmw6IHRoYXQuZGF0YS5pbWFnZVVybCwgbWVhbElkOiAwLCBzaG93U2hhcmVCdG46IHRydWUgfTtcbiAgLy8gICAgICAgbGV0IHBpY1JhdGlvID0gaW1nLndpZHRoIC8gdGhhdC5kYXRhLnNjcmVlbldpZHRoXG4gIC8vICAgICAgIGNvbnNvbGUubG9nKGltZyk7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKFwicGljUmF0aW86XCIrcGljUmF0aW8pO1xuICAvLyAgICAgICAvL2dldCBmb29kRGV0YWlsIGZyb20gYmFja2VuZFxuICAvLyAgICAgICBsZXQgZm9vZF9saXN0ID0gW107XG4gIC8vICAgICAgIGZvciAobGV0IGluZGV4IGluIHRoYXQuZGF0YS50YWdncykge1xuICAvLyAgICAgICAgIGxldCB0YWcgPSB0aGF0LmRhdGEudGFnZ3NbaW5kZXhdO1xuICAvLyAgICAgICAgIGlmICh0YWcuaXNEZWxldGVkKSB7IGNvbnRpbnVlIH07XG4gIC8vICAgICAgICAgbGV0IHRhZ1ggPSBNYXRoLmZsb29yKHRhZy50YWdfeCAqIHRoYXQuZGF0YS5waXhlbFJhdGlvICogcGljUmF0aW8pO1xuICAvLyAgICAgICAgIGxldCB0YWdZID0gTWF0aC5mbG9vcih0YWcudGFnX3kgKiB0aGF0LmRhdGEucGl4ZWxSYXRpbyAqIHBpY1JhdGlvKTtcbiAgLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyh0YWdYICtcIixcIit0YWdZKTtcbiAgLy8gICAgICAgICBsZXQgYmJveF94ID0gdGFnLmJib3hfeDtcbiAgLy8gICAgICAgICBsZXQgYmJveF95ID0gdGFnLmJib3hfeTtcbiAgLy8gICAgICAgICBsZXQgYmJveF93ID0gdGFnLmJib3hfdztcbiAgLy8gICAgICAgICBsZXQgYmJveF9oID0gdGFnLmJib3hfaDtcbiAgLy8gICAgICAgICBsZXQgZm9vZElkID0gdGFnLnJlc3VsdF9saXN0W3RhZy5zZWxlY3RlZFBvc10uZm9vZF9pZDtcbiAgLy8gICAgICAgICBsZXQgZm9vZFR5cGUgPSB0YWcucmVzdWx0X2xpc3RbdGFnLnNlbGVjdGVkUG9zXS5mb29kX3R5cGU7XG4gIC8vICAgICAgICAgbGV0IHJlc3VsdHMgPSB0YWcucmVzdWx0X2xpc3Q7XG4gIC8vICAgICAgICAgbGV0IGZvb2QgPSB7IGZvb2RfaWQ6IGZvb2RJZCwgaW5wdXRfdHlwZTogMSwgZm9vZF90eXBlOiBmb29kVHlwZSwgdGFnX3g6IHRhZ1gsIHRhZ195OiB0YWdZLCBiYm94X3g6IGJib3hfeCwgYmJveF95OiBiYm94X3ksIGJib3hfdzogYmJveF93LCBiYm94X2g6IGJib3hfaCwgcmVjb2duaXRpb25fcmVzdWx0czogcmVzdWx0cyB9O1xuICAvLyAgICAgICAgIGZvb2RfbGlzdC5wdXNoKGZvb2QpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IHRoYXQubWVhbElkLCBtZWFsX3R5cGU6IHRoYXQubWVhbFR5cGUsIG1lYWxfZGF0ZTogdGhhdC5tZWFsRGF0ZSwgZm9vZF9saXN0OiBmb29kX2xpc3QgfTtcbiAgLy8gICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgLy8gICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgLy8gICAgICAgd2ViQVBJLkNyZWF0ZU9yVXBkYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgICAgIHRoYXQubWVhbElkID0gcmVzcC5tZWFsX2lkO1xuICAvLyAgICAgICAgIHBhcmFtLm1lYWxJZCA9IHRoYXQubWVhbElkXG4gIC8vICAgICAgICAgcGFyYW0uaW1hZ2VVcmwgPSB0aGF0LmRhdGEuaW1hZ2VVcmxcbiAgLy8gICAgICAgICBsZXQgcGFyYW1Kc29uID0gSlNPTi5zdHJpbmdpZnkocGFyYW0pO1xuICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAvLyAgICAgICAgICAgdXJsOiBcIi9wYWdlcy9mb29kRGV0YWlsL2luZGV4P3BhcmFtSnNvbj1cIiArIHBhcmFtSnNvblxuICAvLyAgICAgICAgIH0pO1xuICAvLyAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gIC8vICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgLy8gICAgICAgICAgIHRpdGxlOiAnJyxcbiAgLy8gICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/niankv6Hmga/lpLHotKUnLFxuICAvLyAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgIH0sXG4gIC8vICAgICBmYWlsKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gIC8vICAgfSk7XG4gIC8vIH1cbn1cblxuUGFnZShuZXcgSW1hZ2VUYWdQYWdlKCkpOyJdfQ==