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
        this.data = {
            currentTagIndex: 0,
            taggs: [],
            imageUrl: "",
            pixelRatio: 2,
            hideBanner: false,
            imageWidth: 0,
            imageHeight: 0,
            screenWidth: 0,
            res: {
                img_key: "wx4714ce5383005530.o6zAJs0hy6nHM2owj6wIkyE1hfKg.leqHBlfKkOfW68a1a8e45f84ba38d33f958514ca4f55.jpg",
                meal_id: 20551,
                prediction: [
                    {
                        bbox_h: 100,
                        bbox_w: 91,
                        bbox_x: 0,
                        bbox_y: 193,
                        food_id: 469,
                        food_name: "柠檬",
                        food_type: 2,
                        result_list: [
                            { food_id: 469, food_type: 2, food_name: "柠檬", score: 95 },
                            { food_id: 456, food_type: 2, food_name: "橙", score: 1 },
                            { food_id: 492, food_type: 2, food_name: "哈密瓜", score: 1 },
                            { food_id: 1321, food_type: 2, food_name: "橙汁", score: 0 },
                            { food_id: 1322, food_type: 2, food_name: "柠檬汽水", score: 0 },
                            { food_id: 362, food_type: 2, food_name: "长把梨", score: 0 },
                            { food_id: 454, food_type: 2, food_name: "中华猕猴桃[毛叶猕猴桃,奇异果]", score: 0 },
                        ],
                        tag_x: 45,
                        tag_y: 243,
                    },
                    {
                        bbox_h: 80,
                        bbox_w: 97,
                        bbox_x: 306,
                        bbox_y: 0,
                        food_id: 469,
                        food_name: "柠檬",
                        food_type: 2,
                        result_list: [
                            { food_id: 469, food_type: 2, food_name: "柠檬", score: 36 },
                            { food_id: 353, food_type: 2, food_name: "青香蕉苹果", score: 29 },
                            { food_id: 362, food_type: 2, food_name: "长把梨", score: 8 },
                            { food_id: 492, food_type: 2, food_name: "哈密瓜", score: 4 },
                            { food_id: 456, food_type: 2, food_name: "橙", score: 3 },
                            { food_id: 1321, food_type: 2, food_name: "橙汁", score: 3 },
                            { food_id: 1322, food_type: 2, food_name: "柠檬汽水", score: 3 },
                        ],
                        tag_x: 354,
                        tag_y: 40,
                    },
                    {
                        bbox_h: 178,
                        bbox_w: 201,
                        bbox_x: 309,
                        bbox_y: 104,
                        food_id: 963,
                        food_name: "焦糖布丁",
                        food_type: 1,
                        result_list: [
                            { food_id: 963, food_type: 1, food_name: "焦糖布丁", score: 33 },
                            { food_id: 220, food_type: 1, food_name: "香油鸡蛋羹", score: 33 },
                            { food_id: 5, food_type: 1, food_name: "紫菜蛋汤", score: 26 },
                            { food_id: 300, food_type: 1, food_name: "豆腐海带汤", score: 26 },
                            { food_id: 162, food_type: 1, food_name: "大饼", score: 14 },
                            { food_id: 244, food_type: 1, food_name: "玉米面饼", score: 14 },
                            { food_id: 671, food_type: 1, food_name: "清炖鸡", score: 5 }
                        ],
                        tag_x: 409,
                        tag_y: 193,
                    },
                    {
                        bbox_h: 297,
                        bbox_w: 239,
                        bbox_x: 50,
                        bbox_y: 32,
                        food_id: 122,
                        food_name: "水煮鱼片",
                        food_type: 1,
                        result_list: [
                            { food_id: 122, food_type: 1, food_name: "水煮鱼片", score: 100 },
                            { food_id: 38, food_type: 1, food_name: "酸菜鱼", score: 100 },
                            { food_id: 733, food_type: 1, food_name: "虾天妇罗", score: 0 },
                            { food_id: 512, food_type: 1, food_name: "酥衣凤尾虾", score: 0 },
                            { food_id: 666, food_type: 1, food_name: "雀巢黑椒牛柳", score: 0 },
                            { food_id: 650, food_type: 1, food_name: "牛肉饭", score: 0 }
                        ],
                        tag_x: 169,
                        tag_y: 180,
                    }
                ]
            },
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
                that.setData({
                    screenWidth: res.windowWidth
                });
                console.log("convert rate:" + 750 / res.windowWidth);
                console.log("pixel ratio:" + res.pixelRatio);
                that.setData({
                    pixelRatio: res.pixelRatio
                });
            }
        });
        var imagePath = option.imageUrl.split("/").pop();
        console.log(imagePath);
        this.getRecognitionResult(imagePath);
    };
    ImageTagPage.prototype.onPageScroll = function (e) {
        this.scrollTop = e.scrollTop;
    };
    ImageTagPage.prototype.getRecognitionResult = function (imageKey) {
        var that = this;
        wx.showLoading({ title: "识别中...", mask: true });
        var req = { img_key: imageKey, meal_date: this.mealDate, meal_type: this.mealType };
        webAPI.RetrieveRecognition(req).then(function (resp) {
            that.parseRecognitionData(resp);
            wx.hideLoading({});
        }).catch(function (err) {
            wx.hideLoading({});
            wx.showModal({
                title: '获取识别结果失败',
                content: JSON.stringify(err),
                showCancel: false
            });
        });
    };
    ImageTagPage.prototype.parseRecognitionData = function (resp) {
        var _this = this;
        var taggs = [];
        for (var index in resp.prediction) {
            var predictionItem = resp.prediction[index];
            var resultList = resp.prediction[index].result_list;
            var item = {
                tag_x: predictionItem.tag_x / (this.divideproportion * 2),
                tag_y: predictionItem.tag_y / (this.divideproportion * 2),
                bbox_x: predictionItem.bbox_x,
                bbox_y: predictionItem.bbox_y,
                bbox_w: predictionItem.bbox_w,
                bbox_h: predictionItem.bbox_h,
                food_id: predictionItem.food_id,
                food_type: predictionItem.food_type,
                food_name: predictionItem.food_name,
                tag_height: index == 0 ? 95 : 65,
                selectedPos: 0,
                isDeleted: false,
                showDeleteBtn: false,
                result_list: resultList
            };
            taggs.push(item);
        }
        this.mealId = resp.meal_id;
        this.setData({
            taggs: taggs
        }, function () {
            console.log('整理得到初始taggs', _this.data.taggs);
        });
    };
    ImageTagPage.prototype.handleTapSimilarName = function (e) {
        var _this = this;
        var index = e.currentTarget.dataset.textIndex;
        var idx = e.currentTarget.dataset.textIdx;
        var taggs = this.data.taggs.slice();
        console.log(77777, taggs);
        taggs[index].selectedPos = idx;
        taggs[index].food_name = taggs[index].result_list[idx].food_name;
        taggs[index].food_id = taggs[index].result_list[idx].food_id;
        taggs[index].food_type = taggs[index].result_list[idx].food_type;
        this.setData({ taggs: taggs }, function () {
            console.log(_this.data.taggs);
        });
    };
    ImageTagPage.prototype.handleDeleteTag = function (e) {
        var index = e.currentTarget.dataset.textIndex;
        var taggs = this.data.taggs.slice();
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
            });
        }
    };
    ImageTagPage.prototype.handleTapResultItem = function (e) {
        var _this = this;
        var itemIndex = e.currentTarget.dataset.textIndex;
        var item = this.data.resultList[itemIndex];
        var taggs = this.data.taggs.slice();
        if (this.createTag) {
            this.createTag = __assign({}, this.createTag, { result_list: [{
                        food_id: item.foodId,
                        food_name: item.foodName,
                        food_type: item.foodType
                    }], food_id: item.foodId, food_name: item.foodName, food_type: item.foodType });
            taggs.push(this.createTag);
            this.createTag = null;
            var resp = {
                meal_id: this.mealId,
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
            taggs[this.data.tagIndex].result_list[0] = {
                food_id: item.foodId,
                food_name: item.foodName,
                food_type: item.foodType
            };
            taggs[this.data.tagIndex].selectedPos = 0;
            taggs[this.data.tagIndex].food_id = item.foodId;
            taggs[this.data.tagIndex].food_name = item.foodName;
            taggs[this.data.tagIndex].food_type = item.foodType;
            this.setData({
                taggs: taggs,
                showPopup: false,
            }, function () {
                wx.pageScrollTo({
                    scrollTop: _this.data.scrollTop,
                    duration: 0
                });
                console.log('=====4', _this.data.taggs);
            });
        }
    };
    ImageTagPage.prototype.goConfirmMeal = function () {
        var mealInfo = {
            mealId: this.mealId,
            taggs: this.data.taggs.slice()
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
                    that.createTag = {
                        tagType: 3,
                        tag_x: clientX,
                        tag_y: clientY,
                        selectedPos: 0
                    };
                }
                else {
                    var touchX = clientX * res.width / 375;
                    var touchY = touchX * res.height / res.width;
                    that.createTag = {
                        tagType: 3,
                        tag_x: clientX,
                        tag_y: clientY,
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
        var xOperation = "taggs[" + index + "].tag_x";
        var yOperation = "taggs[" + index + "].tag_y";
        this.setData((_a = {},
            _a[xOperation] = event.detail.x,
            _a[yOperation] = event.detail.y,
            _a));
    };
    return ImageTagPage;
}());
Page(new ImageTagPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXNEO0FBRXRELG9EQUFzRDtBQWlDdEQ7SUFBQTtRQUNTLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNaLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLG1CQUFjLEdBQVcsU0FBUyxDQUFDO1FBQ25DLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDYixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWIscUJBQWdCLEdBQUMsQ0FBQyxDQUFDO1FBQ25CLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxjQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLFNBQUksR0FBUztZQUVsQixlQUFlLEVBQUUsQ0FBQztZQUNsQixLQUFLLEVBQUUsRUFBRTtZQUNULFFBQVEsRUFBRSxFQUFFO1lBQ1osVUFBVSxFQUFFLENBQUM7WUFDYixVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUMsQ0FBQztZQUNaLFdBQVcsRUFBQyxDQUFDO1lBQ2IsV0FBVyxFQUFDLENBQUM7WUFDYixHQUFHLEVBQUM7Z0JBQ0YsT0FBTyxFQUFFLGtHQUFrRztnQkFDM0csT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsVUFBVSxFQUFFO29CQUNWO3dCQUNFLE1BQU0sRUFBRSxHQUFHO3dCQUNYLE1BQU0sRUFBRSxFQUFFO3dCQUNWLE1BQU0sRUFBRSxDQUFDO3dCQUNULE1BQU0sRUFBRSxHQUFHO3dCQUNYLE9BQU8sRUFBRSxHQUFHO3dCQUNaLFNBQVMsRUFBRSxJQUFJO3dCQUNmLFNBQVMsRUFBRSxDQUFDO3dCQUNaLFdBQVcsRUFBRTs0QkFDWCxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUM7NEJBQ3hELEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFB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QUFDLE1BQU0sR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO29CQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHO3dCQUNmLE9BQU8sRUFBRSxDQUFDO3dCQUNWLEtBQUssRUFBRSxPQUFPO3dCQUNkLEtBQUssRUFBRSxPQUFPO3dCQUNkLFdBQVcsRUFBRSxDQUFDO3FCQUNmLENBQUM7aUJBQ0g7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0YsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixTQUFTLEVBQUMsSUFBSTtZQUNkLE9BQU8sRUFBQyxFQUFFO1lBQ1YsVUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsS0FBSztZQUNsQixjQUFjLEVBQUMsMENBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsd0JBQUs7U0FDdEQsQ0FBQyxDQUFBO0lBY0osQ0FBQztJQUVNLGdDQUFTLEdBQWhCLFVBQWlCLEtBQVU7O1FBQ3pCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqRCxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUM5QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUM3QyxJQUFZLENBQUMsT0FBTztZQUNuQixHQUFDLFVBQVUsSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsR0FBQyxVQUFVLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixDQUFDO0lBQ0wsQ0FBQztJQW9ISCxtQkFBQztBQUFELENBQUMsQUEzcEJELElBMnBCQztBQUVELElBQUksQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IFJldHJpZXZlUmVjb2duaXRpb25SZXEsIFJldHJpZXZlUmVjb2duaXRpb25SZXNwIH0gZnJvbSBcIi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzXCI7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcblxuXG50eXBlIERhdGEgPSB7XG4gIGN1cnJlbnRUYWdJbmRleDogbnVtYmVyO1xuICB0YWdnczogVGFnW107XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHBpeGVsUmF0aW86IG51bWJlcjtcbiAgaGlkZUJhbm5lcjogYm9vbGVhbjtcbiAgaW1hZ2VXaWR0aDpudW1iZXI7XG59XG50eXBlIFRhZyA9IHtcbiAgaXNEZWxldGVkOiBib29sZWFuO1xuICB0YWdfeDogbnVtYmVyO1xuICB0YWdfeTogbnVtYmVyO1xuICBiYm94X3g6bnVtYmVyO1xuICBiYm94X3k6IG51bWJlcjtcbiAgYmJveF93OiBudW1iZXI7XG4gIGJib3hfaDogbnVtYmVyO1xuICB0YWdfaGVpZ2h0OiBudW1iZXI7XG4gIGZvb2RfdHlwZTogbnVtYmVyOyAgLy8xLnJlY2VpcGUgMi4gcmVjZWlwZVxuICB0YWdUeXBlOiBudW1iZXI7IC8vMSByZWNvZ25pdGlvbiwgMiB0ZXh0U2VhcmNoIDMuYWRkaXRpb25hbFNlYXJjaFxuICBzaG93RGVsZXRlQnRuOiBmYWxzZTtcbiAgc2VsZWN0ZWRQb3M6IG51bWJlcjtcbiAgcmVzdWx0X2xpc3Q6IFJlc3VsdFtdO1xufVxuXG50eXBlIFJlc3VsdCA9IHtcbiAgZm9vZF9pZDogbnVtYmVyO1xuICBmb29kX25hbWU6IHN0cmluZztcbiAgZm9vZF90eXBlOiBudW1iZXI7XG59XG5cbmNsYXNzIEltYWdlVGFnUGFnZSB7XG4gIHB1YmxpYyBtZWFsSWQgPSAtMTtcbiAgcHVibGljIGluY3JlbWVudGFsSWQgPSAwO1xuICBwdWJsaWMgdGV4dFNlYXJjaEZvb2Q6IFJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgcHVibGljIG1lYWxEYXRlID0gMDtcbiAgcHVibGljIG1lYWxUeXBlID0gMDtcbiAgLy8gcHVibGljIHNjcmVlbldpZHRoID0gMDtcbiAgcHVibGljIGRpdmlkZXByb3BvcnRpb249MDsvL+ecn+WunuWuveW6pumZpOS7pTcyMHJweO+8m1xuICBwdWJsaWMgc2Nyb2xsVG9wID0gMDsgLy8g5Li65LqG6Ieq5Yqo5rua5Yqo5Yiw5LmL5YmN55qE5L2N572uXG4gIHB1YmxpYyBjcmVhdGVUYWcgPSBudWxsOyAvLyDnlKjmiLfplb/mjInlm77niYfmiYDliJvlu7rnmoTkuLTml7Z0YWdcbiAgcHVibGljIGRhdGE6IERhdGEgPSB7XG4gICAgLy9tb2NrdXAgdGFnIGxpc3RcbiAgICBjdXJyZW50VGFnSW5kZXg6IDAsXG4gICAgdGFnZ3M6IFtdLFxuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBpeGVsUmF0aW86IDIsXG4gICAgaGlkZUJhbm5lcjogZmFsc2UsXG4gICAgaW1hZ2VXaWR0aDowLFxuICAgIGltYWdlSGVpZ2h0OjAsXG4gICAgc2NyZWVuV2lkdGg6MCxcbiAgICByZXM6e1xuICAgICAgaW1nX2tleTogXCJ3eDQ3MTRjZTUzODMwMDU1MzAubzZ6QUpzMGh5Nm5ITTJvd2o2d0lreUUxaGZLZy5sZXFIQmxmS2tPZlc2OGExYThlNDVmODRiYTM4ZDMzZjk1ODUxNGNhNGY1NS5qcGdcIixcbiAgICAgIG1lYWxfaWQ6IDIwNTUxLFxuICAgICAgcHJlZGljdGlvbjogW1xuICAgICAgICB7XG4gICAgICAgICAgYmJveF9oOiAxMDAsXG4gICAgICAgICAgYmJveF93OiA5MSxcbiAgICAgICAgICBiYm94X3g6IDAsXG4gICAgICAgICAgYmJveF95OiAxOTMsXG4gICAgICAgICAgZm9vZF9pZDogNDY5LFxuICAgICAgICAgIGZvb2RfbmFtZTogXCLmn6DmqqxcIixcbiAgICAgICAgICBmb29kX3R5cGU6IDIsXG4gICAgICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgICAgICAgICAgIHtmb29kX2lkOiA0NjksIGZvb2RfdHlwZTogMiwgZm9vZF9uYW1lOiBcIuafoOaqrFwiLCBzY29yZTogOTV9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDQ1NiwgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi5qmZXCIsIHNjb3JlOiAxfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA0OTIsIGZvb2RfdHlwZTogMiwgZm9vZF9uYW1lOiBcIuWTiOWvhueTnFwiLCBzY29yZTogMX0sXG4gICAgICAgICAgICB7Zm9vZF9pZDogMTMyMSwgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi5qmZ5rGBXCIsIHNjb3JlOiAwfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiAxMzIyLCBmb29kX3R5cGU6IDIsIGZvb2RfbmFtZTogXCLmn6Dmqqzmsb3msLRcIiwgc2NvcmU6IDB9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDM2MiwgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi6ZW/5oqK5qKoXCIsIHNjb3JlOiAwfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA0NTQsIGZvb2RfdHlwZTogMiwgZm9vZF9uYW1lOiBcIuS4reWNjueMleeMtOahg1vmr5vlj7bnjJXnjLTmoYMs5aWH5byC5p6cXVwiLCBzY29yZTogMH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICB0YWdfeDogNDUsXG4gICAgICAgICAgdGFnX3k6IDI0MyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGJib3hfaDogODAsXG4gICAgICAgICAgYmJveF93OiA5NyxcbiAgICAgICAgICBiYm94X3g6IDMwNixcbiAgICAgICAgICBiYm94X3k6IDAsXG4gICAgICAgICAgZm9vZF9pZDogNDY5LFxuICAgICAgICAgIGZvb2RfbmFtZTogXCLmn6DmqqxcIixcbiAgICAgICAgICBmb29kX3R5cGU6IDIsXG4gICAgICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgICAgICAgICAgIHtmb29kX2lkOiA0NjksIGZvb2RfdHlwZTogMiwgZm9vZF9uYW1lOiBcIuafoOaqrFwiLCBzY29yZTogMzZ9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDM1MywgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi6Z2S6aaZ6JWJ6Iu55p6cXCIsIHNjb3JlOiAyOX0sXG4gICAgICAgICAgICB7Zm9vZF9pZDogMzYyLCBmb29kX3R5cGU6IDIsIGZvb2RfbmFtZTogXCLplb/miormoqhcIiwgc2NvcmU6IDh9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDQ5MiwgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi5ZOI5a+G55OcXCIsIHNjb3JlOiA0fSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA0NTYsIGZvb2RfdHlwZTogMiwgZm9vZF9uYW1lOiBcIuapmVwiLCBzY29yZTogM30sXG4gICAgICAgICAgICB7Zm9vZF9pZDogMTMyMSwgZm9vZF90eXBlOiAyLCBmb29kX25hbWU6IFwi5qmZ5rGBXCIsIHNjb3JlOiAzfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiAxMzIyLCBmb29kX3R5cGU6IDIsIGZvb2RfbmFtZTogXCLmn6Dmqqzmsb3msLRcIiwgc2NvcmU6IDN9LFxuICAgICAgICAgIF0sXG4gICAgICAgICAgdGFnX3g6IDM1NCxcbiAgICAgICAgICB0YWdfeTogNDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiYm94X2g6IDE3OCxcbiAgICAgICAgICBiYm94X3c6IDIwMSxcbiAgICAgICAgICBiYm94X3g6IDMwOSxcbiAgICAgICAgICBiYm94X3k6IDEwNCxcbiAgICAgICAgICBmb29kX2lkOiA5NjMsXG4gICAgICAgICAgZm9vZF9uYW1lOiBcIueEpuezluW4g+S4gVwiLFxuICAgICAgICAgIGZvb2RfdHlwZTogMSxcbiAgICAgICAgICByZXN1bHRfbGlzdDogW1xuICAgICAgICAgICAge2Zvb2RfaWQ6IDk2MywgZm9vZF90eXBlOiAxLCBmb29kX25hbWU6IFwi54Sm57OW5biD5LiBXCIsIHNjb3JlOiAzM30sXG4gICAgICAgICAgICB7Zm9vZF9pZDogMjIwLCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLpppnmsrnpuKHom4vnvrlcIiwgc2NvcmU6IDMzfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA1LCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLntKvoj5zom4vmsaRcIiwgc2NvcmU6IDI2fSxcbiAgICAgICAgICAgIHtmb29kX2lkOiAzMDAsIGZvb2RfdHlwZTogMSwgZm9vZF9uYW1lOiBcIuixhuiFkOa1t+W4puaxpFwiLCBzY29yZTogMjZ9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDE2MiwgZm9vZF90eXBlOiAxLCBmb29kX25hbWU6IFwi5aSn6aW8XCIsIHNjb3JlOiAxNH0sXG4gICAgICAgICAgICB7Zm9vZF9pZDogMjQ0LCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLnjonnsbPpnaLppbxcIiwgc2NvcmU6IDE0fSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA2NzEsIGZvb2RfdHlwZTogMSwgZm9vZF9uYW1lOiBcIua4heeClum4oVwiLCBzY29yZTogNX1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHRhZ194OiA0MDksXG4gICAgICAgICAgdGFnX3k6IDE5MyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGJib3hfaDogMjk3LFxuICAgICAgICAgIGJib3hfdzogMjM5LFxuICAgICAgICAgIGJib3hfeDogNTAsXG4gICAgICAgICAgYmJveF95OiAzMixcbiAgICAgICAgICBmb29kX2lkOiAxMjIsXG4gICAgICAgICAgZm9vZF9uYW1lOiBcIuawtOeFrumxvOeJh1wiLFxuICAgICAgICAgIGZvb2RfdHlwZTogMSxcbiAgICAgICAgICByZXN1bHRfbGlzdDogW1xuICAgICAgICAgICAge2Zvb2RfaWQ6IDEyMiwgZm9vZF90eXBlOiAxLCBmb29kX25hbWU6IFwi5rC054Wu6bG854mHXCIsIHNjb3JlOiAxMDB9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDM4LCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLphbjoj5zpsbxcIiwgc2NvcmU6IDEwMH0sXG4gICAgICAgICAgICB7Zm9vZF9pZDogNzMzLCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLomb7lpKnlpofnvZdcIiwgc2NvcmU6IDB9LFxuICAgICAgICAgICAge2Zvb2RfaWQ6IDUxMiwgZm9vZF90eXBlOiAxLCBmb29kX25hbWU6IFwi6YWl6KGj5Yek5bC+6Jm+XCIsIHNjb3JlOiAwfSxcbiAgICAgICAgICAgIHtmb29kX2lkOiA2NjYsIGZvb2RfdHlwZTogMSwgZm9vZF9uYW1lOiBcIumbgOW3oum7keakkueJm+afs1wiLCBzY29yZTogMH0sXG4gICAgICAgICAgICB7Zm9vZF9pZDogNjUwLCBmb29kX3R5cGU6IDEsIGZvb2RfbmFtZTogXCLniZvogonppa1cIiwgc2NvcmU6IDB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICB0YWdfeDogMTY5LFxuICAgICAgICAgIHRhZ195OiAxODAsXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHNob3dQb3B1cDpmYWxzZSwgLy8g5piv5ZCm5bGV56S6cG9wdXDvvIzku6XkvpvnlKjmiLfoh6rlt7HovpPlhaV0YWflkI3lrZdcbiAgICBrZXl3b3JkOicnLFxuICAgIHJlc3VsdExpc3Q6IFtdLFxuICAgIHJlc3VsdEVycm9yOiBmYWxzZSxcbiAgICB0YWdJbmRleDpudWxsLCAvLyDnlKjmiLfngrnlh7vnrKzlh6DkuKrpgInpobnmnaXoh6rlt7HovpPlhaXpo5/nianlkI3np7BcbiAgICBzY3JvbGxUb3A6MCxcbiAgICBzaG93UG9wdXBUaXRsZTonJyxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uOiBhbnkpIHtcbiAgICAvLyB0aGlzLnBhcnNlUmVjb2duaXRpb25EYXRhKHRoaXMuZGF0YS5yZXMpOyAvLyA9PT14aW5qaWFkZT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHZhciB0aGF0OmFueSA9IHRoaXM7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpOyBcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBpbWFnZVVybDogb3B0aW9uLmltYWdlVXJsIH0pO1xuICAgIGNvbnNvbGUubG9nKCfpobXpnaLliqDovb3ml7bnmoRvcHRpb24uaW1hZ2V1cmwnLG9wdGlvbi5pbWFnZVVybClcbiAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgc3JjOiBvcHRpb24uaW1hZ2VVcmwsXG4gICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICBpZihyZXMuaGVpZ2h0L3Jlcy53aWR0aD4wLjk2KXsgLy8g6auY5Zu+XG4gICAgICAgICAgdGhhdC5kaXZpZGVwcm9wb3J0aW9uID0gcmVzLmhlaWdodCAvIDcyMFxuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWFnZUhlaWdodDo3MjAsXG4gICAgICAgICAgICBpbWFnZVdpZHRoOiByZXMud2lkdGggKiA3MjAgLyByZXMuaGVpZ2h0XG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7IC8vIOWuveWbvlxuICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy53aWR0aCAvIDc1MFxuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWFnZVdpZHRoOiA3NTAsXG4gICAgICAgICAgICBpbWFnZUhlaWdodDogcmVzLmhlaWdodCAqIDcyMCAvIHJlcy53aWR0aFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChvcHRpb24ubWVhbFR5cGUpO1xuICAgIHRoaXMubWVhbERhdGUgPSBwYXJzZUludChvcHRpb24ubWVhbERhdGUpO1xuICAgIHd4LmdldFN5c3RlbUluZm8oe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAvLyB0aGF0LnNjcmVlbldpZHRoID0gcmVzLndpbmRvd1dpZHRoO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIHNjcmVlbldpZHRoOiByZXMud2luZG93V2lkdGhcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coXCJjb252ZXJ0IHJhdGU6XCIgKyA3NTAgLyByZXMud2luZG93V2lkdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpeGVsIHJhdGlvOlwiICsgcmVzLnBpeGVsUmF0aW8pO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIHBpeGVsUmF0aW86IHJlcy5waXhlbFJhdGlvXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGltYWdlUGF0aCA9IG9wdGlvbi5pbWFnZVVybC5zcGxpdChcIi9cIikucG9wKCk7XG4gICAgY29uc29sZS5sb2coaW1hZ2VQYXRoKTtcbiAgICB0aGlzLmdldFJlY29nbml0aW9uUmVzdWx0KGltYWdlUGF0aCk7Ly89PT15aW5jYW5nZGU9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gdGhpcy5nZXRCYW5uZXJTdGF0dXMoKTtcbiAgfVxuXG4gIC8vIHB1YmxpYyBvblNob3coKSB7XG4gICAgLy8gaWYgKHRoaXMudGV4dFNlYXJjaEZvb2QpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMudGV4dFNlYXJjaEZvb2QpO1xuICAgIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdXCI7XG4gICAgLy8gICBsZXQgZm9vZE5hbWUgPSB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZS5zcGxpdChcIltcIilbMF07XG4gICAgLy8gICBsZXQgcmVzdWx0ID0gW3sgZm9vZF9pZDogdGhpcy50ZXh0U2VhcmNoRm9vZC5mb29kX2lkLCBmb29kX25hbWU6IGZvb2ROYW1lLCBmb29kX3R5cGU6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF90eXBlIH1dO1xuICAgIC8vICAgbGV0IHRhZ1kgPSB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0udGFnX3k7XG4gICAgLy8gICBsZXQgdGFnWCA9IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS50YWdfeDtcbiAgICAvLyAgIGxldCB0YWcgPSB7IGZvb2RfaWQ6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF9pZCwgZm9vZF9uYW1lOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZSwgZm9vZF90eXBlOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfdHlwZSwgaXNEZWxldGVkOiBmYWxzZSwgc2VsZWN0ZWRQb3M6IDAsIHNob3dEZWxldGVCdG46IGZhbHNlLCB0YWdfeDogdGFnWCwgdGFnX3k6IHRhZ1ksIHRhZ19oZWlnaHQ6IDk1LCByZXN1bHRfbGlzdDogcmVzdWx0IH07XG4gICAgLy8gICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgIC8vICAgICBbb3BlcmF0aW9uXTogdGFnLFxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0aGlzLnRleHRTZWFyY2hGb29kID0gdW5kZWZpbmVkO1xuICAgIC8vIH0gZWxzZSBpZiAodGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdICYmIHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFswXS5mb29kX2lkID09PSAwKSB7XG4gICAgLy8gICAvL3JlbW92ZSB0ZXh0IHNlYXJjaCBpdGVtXG4gICAgLy8gICB0aGlzLmRhdGEudGFnZ3Muc3BsaWNlKHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXgsIDEpO1xuICAgIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAvLyAgICAgdGFnZ3M6IHRoaXMuZGF0YS50YWdncyxcbiAgICAvLyAgICAgY3VycmVudFRhZ0luZGV4OiAwXG4gICAgLy8gICB9KTtcbiAgICAvLyB9XG4gIC8vIH1cblxuICBwdWJsaWMgb25QYWdlU2Nyb2xsKGU6YW55KXtcbiAgICB0aGlzLnNjcm9sbFRvcCA9IGUuc2Nyb2xsVG9wO1xuICB9XG5cbiAgLy8gcHVibGljIGdldEJhbm5lclN0YXR1cygpIHtcbiAgLy8gICBsZXQgaGlkZUJhbm5lciA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsa2V5X2hpZGVCYW5uZXIpO1xuICAvLyAgIGNvbnNvbGUubG9nKGhpZGVCYW5uZXIpO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBoaWRlQmFubmVyOiBoaWRlQmFubmVyXG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgZGlzbWlzc0Jhbm5lcigpe1xuICAvLyAgIHZhciB0aGF0PSB0aGlzO1xuICAvLyAgIHd4LnNob3dNb2RhbCh7XG4gIC8vICAgICB0aXRsZTpcIlwiLFxuICAvLyAgICAgY29udGVudDpcIuehruWumuS4jeWGjeWxleekuuatpOaPkOekuj9cIixcbiAgLy8gICAgIHN1Y2Nlc3MocmVzKSB7XG4gIC8vICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAvLyAgICAgICAgIC8vc2V0dGluZyBnbG9iYWwgdmlyYWJsZVxuICAvLyAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsa2V5X2hpZGVCYW5uZXIsdHJ1ZSk7XG4gIC8vICAgICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgICAgICAgIGhpZGVCYW5uZXI6IHRydWVcbiAgLy8gICAgICAgICB9KTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0pO1xuICAvLyB9XG4vKipcbiAqIOWPkeWHuuivhuWIq+WbvueJh+S4remjn+eJqeeahGFwaVxuICovXG4gIHB1YmxpYyBnZXRSZWNvZ25pdGlvblJlc3VsdChpbWFnZUtleTogU3RyaW5nKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi6K+G5Yir5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgbGV0IHJlcTogUmV0cmlldmVSZWNvZ25pdGlvblJlcSA9IHsgaW1nX2tleTogaW1hZ2VLZXksIG1lYWxfZGF0ZTogdGhpcy5tZWFsRGF0ZSwgbWVhbF90eXBlOiB0aGlzLm1lYWxUeXBlIH07XG4gICAgd2ViQVBJLlJldHJpZXZlUmVjb2duaXRpb24ocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhhdC5wYXJzZVJlY29nbml0aW9uRGF0YShyZXNwKTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogJ+iOt+WPluivhuWIq+e7k+aenOWksei0pScsXG4gICAgICAgICAgY29udGVudDogSlNPTi5zdHJpbmdpZnkoZXJyKSxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6Kej5p6Q6L+U5Zue55qE5pWw5o2uXG4gICAqL1xuICBwdWJsaWMgcGFyc2VSZWNvZ25pdGlvbkRhdGEocmVzcDogUmV0cmlldmVSZWNvZ25pdGlvblJlc3ApIHtcbiAgICBsZXQgdGFnZ3MgPSBbXTtcbiAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLnByZWRpY3Rpb24pIHtcbiAgICAgIGxldCBwcmVkaWN0aW9uSXRlbSA9IHJlc3AucHJlZGljdGlvbltpbmRleF07XG4gICAgICBsZXQgcmVzdWx0TGlzdCA9IHJlc3AucHJlZGljdGlvbltpbmRleF0ucmVzdWx0X2xpc3Q7XG4gICAgICBsZXQgaXRlbSA9IHtcbiAgICAgICAgdGFnX3g6IHByZWRpY3Rpb25JdGVtLnRhZ194IC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLFxuICAgICAgICB0YWdfeTogcHJlZGljdGlvbkl0ZW0udGFnX3kgLyAodGhpcy5kaXZpZGVwcm9wb3J0aW9uICogMiksXG4gICAgICAgIGJib3hfeDogcHJlZGljdGlvbkl0ZW0uYmJveF94LFxuICAgICAgICBiYm94X3k6IHByZWRpY3Rpb25JdGVtLmJib3hfeSxcbiAgICAgICAgYmJveF93OiBwcmVkaWN0aW9uSXRlbS5iYm94X3csXG4gICAgICAgIGJib3hfaDogcHJlZGljdGlvbkl0ZW0uYmJveF9oLFxuICAgICAgICBmb29kX2lkOiBwcmVkaWN0aW9uSXRlbS5mb29kX2lkLFxuICAgICAgICBmb29kX3R5cGU6IHByZWRpY3Rpb25JdGVtLmZvb2RfdHlwZSxcbiAgICAgICAgZm9vZF9uYW1lOiBwcmVkaWN0aW9uSXRlbS5mb29kX25hbWUsXG4gICAgICAgIHRhZ19oZWlnaHQ6IGluZGV4ID09IDAgPyA5NSA6IDY1ICxcbiAgICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gICAgICAgIGlzRGVsZXRlZDogZmFsc2UsXG4gICAgICAgIHNob3dEZWxldGVCdG46IGZhbHNlLFxuICAgICAgICByZXN1bHRfbGlzdDogcmVzdWx0TGlzdFxuICAgICAgfTtcbiAgICAgIHRhZ2dzLnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHRoaXMubWVhbElkID0gcmVzcC5tZWFsX2lkO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB0YWdnczogdGFnZ3NcbiAgICB9LCgpPT57XG4gICAgICBjb25zb2xlLmxvZygn5pW055CG5b6X5Yiw5Yid5aeLdGFnZ3MnLHRoaXMuZGF0YS50YWdncylcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog54K55Ye7cG9z77yM55So5oi36YCJ5Lit5p+Q5LiqcG9zXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlVGFwU2ltaWxhck5hbWUoZTphbnkpe1xuICAgIGNvbnN0IGluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dEluZGV4O1xuICAgIGNvbnN0IGlkeCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnRleHRJZHg7XG4gICAgbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgY29uc29sZS5sb2coNzc3NzcsdGFnZ3MpXG4gICAgdGFnZ3NbaW5kZXhdLnNlbGVjdGVkUG9zID0gaWR4O1xuICAgIHRhZ2dzW2luZGV4XS5mb29kX25hbWUgPSB0YWdnc1tpbmRleF0ucmVzdWx0X2xpc3RbaWR4XS5mb29kX25hbWU7XG4gICAgdGFnZ3NbaW5kZXhdLmZvb2RfaWQgPSB0YWdnc1tpbmRleF0ucmVzdWx0X2xpc3RbaWR4XS5mb29kX2lkO1xuICAgIHRhZ2dzW2luZGV4XS5mb29kX3R5cGUgPSB0YWdnc1tpbmRleF0ucmVzdWx0X2xpc3RbaWR4XS5mb29kX3R5cGU7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt0YWdnczp0YWdnc30sKCk9PntcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS50YWdncylcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDliKDpmaTmn5DkuKrlr7nlupTnmoR0YWdcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVEZWxldGVUYWcoZTphbnkpe1xuICAgIGNvbnN0IGluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dEluZGV4O1xuICAgIGxldCB0YWdncyA9IFsuLi50aGlzLmRhdGEudGFnZ3NdO1xuICAgIHRhZ2dzLnNwbGljZShpbmRleCwxKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3RhZ2dzOnRhZ2dzfSlcbiAgfVxuICAvKipcbiAgICog54K55Ye75qCh6aqM6YCJ6aG577yM55So5oi36Ieq5bex6L6T5YWldGFn5ZCN5a2XXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlSW5wdXROYW1lQnlTZWxmKGU6YW55KXtcbiAgICBjb25zdCB0YWdJbmRleCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnRleHRJbmRleDtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgc2hvd1BvcHVwOnRydWUsXG4gICAgICBzY3JvbGxUb3A6dGhpcy5zY3JvbGxUb3AsXG4gICAgICB0YWdJbmRleDp0YWdJbmRleCxcbiAgICAgIGtleXdvcmQ6JycsIC8vIOaVsOaNruWIneWni+WMllxuICAgICAgcmVzdWx0TGlzdDogW10sIC8vIOaVsOaNruWIneWni+WMllxuICAgICAgcmVzdWx0RXJyb3I6IGZhbHNlLCAvLyDmlbDmja7liJ3lp4vljJZcbiAgICAgIHNob3dQb3B1cFRpdGxlOmDor7fmm7TmlLnnrKwke3RhZ0luZGV4KzF95Liq6aOf54mp55qE5ZCN56ewYCxcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog55So5oi354K55Ye75YWz6ZetcG9wdXBcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVDbG9zZVBvcHVwKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93UG9wdXA6ZmFsc2V9KTtcbiAgfVxuICAvKipcbiAgICog6I635Y+W55So5oi36L6T5YWl5paH5a2XXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlSW5wdXRTZWFyY2hWYWx1ZShlOmFueSl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtrZXl3b3JkOiBlLmRldGFpbH0pO1xuICB9XG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vmkJzntKJcbiAgICovXG4gIHB1YmxpYyBwZXJmb3JtU2VhcmNoKCkge1xuICAgIGxldCBrZXl3b3JkID0gdGhpcy5kYXRhLmtleXdvcmQ7XG4gICAgbGV0IHJlcSA9IHsgcXVlcnk6IGtleXdvcmQgfTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd2ViQVBJLlJldHJpZXZlVGV4dFNlYXJjaChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGF0LnNldFJlc3VsdExpc3QocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG4gIC8qKlxuICAqIOino+aekOaOpeWPo+eahOaVsOaNrlxuICAqL1xuICBwdWJsaWMgc2V0UmVzdWx0TGlzdChyZXNwOiBSZXRyaWV2ZVRleHRTZWFyY2hSZXNwKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBbXTtcbiAgICBpZiAocmVzcC5yZXN1bHRfbGlzdC5sZW5ndGggPT0gMCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcmVzdWx0TGlzdDogW10sXG4gICAgICAgIHJlc3VsdEVycm9yOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLnJlc3VsdF9saXN0KSB7XG4gICAgICAgIGxldCBpdGVtID0gcmVzcC5yZXN1bHRfbGlzdFtpbmRleF07XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RfaWQsXG4gICAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZF9uYW1lLFxuICAgICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RfdHlwZSxcbiAgICAgICAgICBhbW91bnQ6IGl0ZW0uYW1vdW50LFxuICAgICAgICAgIHVuaXQ6IGl0ZW0udW5pdF9uYW1lLFxuICAgICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihpdGVtLmVuZXJneSAvIDEwMClcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlc3VsdExpc3Q6IHJlc3VsdHMsXG4gICAgICAgIHJlc3VsdEVycm9yOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vmkJzntKLliJfooajkuK3nmoTmn5DpoblcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVUYXBSZXN1bHRJdGVtKGU6YW55KXtcbiAgICBjb25zdCBpdGVtSW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZGF0YS5yZXN1bHRMaXN0W2l0ZW1JbmRleF07XG4gICAgbGV0IHRhZ2dzID0gWy4uLnRoaXMuZGF0YS50YWdnc107XG4gICAgaWYodGhpcy5jcmVhdGVUYWcpeyAvLyDnlKjmiLfplb/mjInlm77niYdcbiAgICAgIHRoaXMuY3JlYXRlVGFnPXtcbiAgICAgICAgLi4udGhpcy5jcmVhdGVUYWcsXG4gICAgICAgIHJlc3VsdF9saXN0OiBbe1xuICAgICAgICAgIGZvb2RfaWQ6IGl0ZW0uZm9vZElkLFxuICAgICAgICAgIGZvb2RfbmFtZTogaXRlbS5mb29kTmFtZSxcbiAgICAgICAgICBmb29kX3R5cGU6IGl0ZW0uZm9vZFR5cGVcbiAgICAgICAgfV0sXG4gICAgICAgIGZvb2RfaWQ6IGl0ZW0uZm9vZElkLFxuICAgICAgICBmb29kX25hbWU6IGl0ZW0uZm9vZE5hbWUsXG4gICAgICAgIGZvb2RfdHlwZTogaXRlbS5mb29kVHlwZVxuICAgICAgfVxuICAgICAgdGFnZ3MucHVzaCh0aGlzLmNyZWF0ZVRhZyk7XG4gICAgICB0aGlzLmNyZWF0ZVRhZyA9IG51bGw7XG4gICAgICBsZXQgcmVzcCA9IHtcbiAgICAgICAgbWVhbF9pZDp0aGlzLm1lYWxJZCxcbiAgICAgICAgcHJlZGljdGlvbjpbLi4udGFnZ3NdLFxuICAgICAgfTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRhZ2dzOnRhZ2dzLFxuICAgICAgICBzaG93UG9wdXA6ZmFsc2UsXG4gICAgICB9LCgpPT57XG4gICAgICAgIC8vIHRoaXMucGFyc2VSZWNvZ25pdGlvbkRhdGEocmVzcClcbiAgICAgICAgd3gucGFnZVNjcm9sbFRvKHtcbiAgICAgICAgICBzY3JvbGxUb3A6IHRoaXMuZGF0YS5zY3JvbGxUb3AsXG4gICAgICAgICAgZHVyYXRpb246IDBcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1lbHNleyAvLyDnlKjmiLfngrnlh7vmoKHlh4bmjInpkq5cbiAgICAgIHRhZ2dzW3RoaXMuZGF0YS50YWdJbmRleF0ucmVzdWx0X2xpc3RbMF09e1xuICAgICAgICBmb29kX2lkOiBpdGVtLmZvb2RJZCxcbiAgICAgICAgZm9vZF9uYW1lOiBpdGVtLmZvb2ROYW1lLFxuICAgICAgICBmb29kX3R5cGU6IGl0ZW0uZm9vZFR5cGVcbiAgICAgIH07XG4gICAgICB0YWdnc1t0aGlzLmRhdGEudGFnSW5kZXhdLnNlbGVjdGVkUG9zID0gMDtcbiAgICAgIHRhZ2dzW3RoaXMuZGF0YS50YWdJbmRleF0uZm9vZF9pZCA9IGl0ZW0uZm9vZElkO1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5mb29kX25hbWUgPSBpdGVtLmZvb2ROYW1lO1xuICAgICAgdGFnZ3NbdGhpcy5kYXRhLnRhZ0luZGV4XS5mb29kX3R5cGUgPSBpdGVtLmZvb2RUeXBlO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdGFnZ3M6dGFnZ3MsXG4gICAgICAgIHNob3dQb3B1cDpmYWxzZSxcbiAgICAgIH0sKCk9PntcbiAgICAgICAgd3gucGFnZVNjcm9sbFRvKHtcbiAgICAgICAgICBzY3JvbGxUb3A6IHRoaXMuZGF0YS5zY3JvbGxUb3AsXG4gICAgICAgICAgZHVyYXRpb246IDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCc9PT09PTQnLHRoaXMuZGF0YS50YWdncylcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOeCueWHu+S4i+S4gOatpe+8jOi/m+WFpeehruiupOWIhumHj+mhtemdolxuICAgKi9cbiAgcHVibGljIGdvQ29uZmlybU1lYWwoKXtcbiAgICBjb25zdCBtZWFsSW5mbyA9IHtcbiAgICAgIG1lYWxJZDp0aGlzLm1lYWxJZCxcbiAgICAgIHRhZ2dzOlsuLi50aGlzLmRhdGEudGFnZ3NdXG4gICAgfVxuICAgIGNvbnN0IGpzb25NZWFsSW5mbyA9IEpTT04uc3RyaW5naWZ5KG1lYWxJbmZvKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHt1cmw6YC4vLi4vY29uZmlybU1lYWwvaW5kZXg/anNvbk1lYWxJbmZvPSR7anNvbk1lYWxJbmZvfWB9KVxuICB9XG5cblxuXG5cbiAgLy8gcHVibGljIGxvYWREdW1teURhdGEoKSB7XG4gIC8vICAgbGV0IHRhZ2dzID0gW1xuICAvLyAgICAge1xuICAvLyAgICAgICB0YWdUeXBlOiAxLFxuICAvLyAgICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAvLyAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgLy8gICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgLy8gICAgICAgICB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLopb/lhbDoirHngpLohYrogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmsLTnha7pnZLoj5xcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmnKjpobvogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLnlarojITngpLpuKHom4tcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLpurvlqYbosYbohZBcIiB9LFxuICAvLyAgICAgICBdLFxuICAvLyAgICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZSxcbiAgLy8gICAgICAgZm9vZF9pZDogMCxcbiAgLy8gICAgICAgZm9vZF9uYW1lOiBcIuilv+WFsOiKseeCkuiFiuiCiVwiLFxuICAvLyAgICAgICB0YWdfeDogNTAsXG4gIC8vICAgICAgIHRhZ195OiA1MFxuICAvLyAgICAgfSxcbiAgLy8gICAgIHtcbiAgLy8gICAgICAgdGFnVHlwZTogMSxcbiAgLy8gICAgICAgaXNEZWxldGVkOiBmYWxzZSxcbiAgLy8gICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gIC8vICAgICAgIHJlc3VsdF9saXN0OiBbXG4gIC8vICAgICAgICAgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi57Gz6aWtXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi6Iqx5Y23XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54mb5aW2XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi55m95ben5YWL5YqbXCIgfVxuICAvLyAgICAgICBdLFxuICAvLyAgICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZSxcbiAgLy8gICAgICAgZm9vZF9pZDogMCxcbiAgLy8gICAgICAgZm9vZF9uYW1lOiBcIuexs+mlrVwiLFxuICAvLyAgICAgICB0YWdfeDogMzAwLFxuICAvLyAgICAgICB0YWdfeTogNTBcbiAgLy8gICAgIH0sXG4gIC8vICAgICB7XG4gIC8vICAgICAgIHRhZ1R5cGU6IDEsXG4gIC8vICAgICAgIGlzRGVsZXRlZDogZmFsc2UsXG4gIC8vICAgICAgIHNlbGVjdGVkUG9zOiAwLFxuICAvLyAgICAgICByZXN1bHRfbGlzdDogW1xuICAvLyAgICAgICAgIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuayuem6puiPnFwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuWwj+eZveiPnFwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuWcsOeTnOWPtlwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuepuuW/g+iPnFwiIH1cbiAgLy8gICAgICAgXSxcbiAgLy8gICAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gIC8vICAgICAgIGZvb2RfaWQ6IDAsXG4gIC8vICAgICAgIGZvb2RfbmFtZTogXCLngpLmsrnpuqboj5xcIixcbiAgLy8gICAgICAgdGFnX3g6IDEwMCxcbiAgLy8gICAgICAgdGFnX3k6IDIwMFxuICAvLyAgICAgfVxuICAvLyAgIF07XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGFnZ3M6IHRhZ2dzIH0pO1xuICAvLyB9XG5cbiAgLy8gcHVibGljIG9uQ2hhbmdlVGFnUG9zaXRpb24oZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jYW5kaWRhdGVzSW5kZXg7XG4gIC8vICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLnNlbGVjdGVkUG9zXCI7XG4gIC8vICAgbGV0IGNoYW5nZUlkT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9pZFwiO1xuICAvLyAgIGxldCBjaGFuZ2VOYW1lT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9uYW1lXCI7XG4gIC8vICAgbGV0IGNoYW5nZUZvb2RUeXBlT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF90eXBlXCI7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiBpbmRleCxcbiAgLy8gICAgIFtjaGFuZ2VJZE9wZXJhdGlvbl06IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFtpbmRleF0uZm9vZF9pZCxcbiAgLy8gICAgIFtjaGFuZ2VOYW1lT3BlcmF0aW9uXTogdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0W2luZGV4XS5mb29kX25hbWUsXG4gIC8vICAgICBbY2hhbmdlRm9vZFR5cGVPcGVyYXRpb25dOiB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0ucmVzdWx0X2xpc3RbaW5kZXhdLmZvb2RfdHlwZVxuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIOmVv+aMieeUn+aIkOaWsOeahOagh+etvlxuICAgKi9cbiAgcHVibGljIGhhbmRsZUNyZWF0ZVRhZyhldmVudDogYW55KSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgY29uc3QgY2xpZW50WCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFg7IC8v55u45a+55LqO5bGP5bmVXG4gICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7IC8v55u45a+55LqO5bGP5bmVXG4gICAgd3guZ2V0SW1hZ2VJbmZvKHtcbiAgICAgIHNyYzogdGhhdC5kYXRhLmltYWdlVXJsLFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgaWYocmVzLmhlaWdodC9yZXMud2lkdGg+MC45Nil7IC8vIOmrmOWbvlxuICAgICAgICAgIC8vIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy5oZWlnaHQgLyA3MjBcbiAgICAgICAgICAvLyB0aGF0LnNldERhdGEoe1xuICAgICAgICAgIC8vICAgaW1hZ2VIZWlnaHQ6NzIwLFxuICAgICAgICAgIC8vICAgaW1hZ2VXaWR0aDogcmVzLndpZHRoICogNzIwIC8gcmVzLmhlaWdodFxuICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgdGhhdC5jcmVhdGVUYWcgPSB7XG4gICAgICAgICAgICB0YWdUeXBlOiAzLFxuICAgICAgICAgICAgdGFnX3g6IGNsaWVudFgsXG4gICAgICAgICAgICB0YWdfeTogY2xpZW50WSxcbiAgICAgICAgICAgIHNlbGVjdGVkUG9zOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfWVsc2V7IC8vIOWuveWbvlxuICAgICAgICAgIGxldCB0b3VjaFggPSBjbGllbnRYKnJlcy53aWR0aC8zNzU7IC8vIOebuOWvueS6juWbvueJh+eahOS9jee9rlxuICAgICAgICAgIGxldCB0b3VjaFkgPSB0b3VjaFgqcmVzLmhlaWdodC9yZXMud2lkdGg7XG4gICAgICAgICAgdGhhdC5jcmVhdGVUYWcgPSB7XG4gICAgICAgICAgICB0YWdUeXBlOiAzLFxuICAgICAgICAgICAgdGFnX3g6IGNsaWVudFgsXG4gICAgICAgICAgICB0YWdfeTogY2xpZW50WSxcbiAgICAgICAgICAgIHNlbGVjdGVkUG9zOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBzaG93UG9wdXA6dHJ1ZSxcbiAgICAgIGtleXdvcmQ6JycsXG4gICAgICByZXN1bHRMaXN0OiBbXSxcbiAgICAgIHJlc3VsdEVycm9yOiBmYWxzZSxcbiAgICAgIHNob3dQb3B1cFRpdGxlOmDor7fmkJzntKLmt7vliqDnrKwke3RoaXMuZGF0YS50YWdncy5sZW5ndGgrMX3kuKrpo5/nialgXG4gICAgfSlcbiAgICBcbiAgICAvLyB0aGlzLmRhdGEudGFnZ3MucHVzaCh0YWcpO1xuICAgIC8vICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgLy8gICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzLFxuICAgIC8vICAgY3VycmVudFRhZ0luZGV4OiB0aGlzLmRhdGEudGFnZ3MubGVuZ3RoIC0gMVxuICAgIC8vIH0pO1xuICAgIC8vIHRoaXMuaW5jcmVtZW50YWxJZCsrO1xuICAgIFxuICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgd3gubmF2aWdhdGVUbyh7XG4gICAgLy8gICAgIHVybDogXCIvcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT3po5/nialcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gfSwgNTAwKVxuICB9XG5cbiAgcHVibGljIG9uVGFnTW92ZShldmVudDogYW55KSB7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAgIGxldCB4T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ194XCI7XG4gICAgbGV0IHlPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnX3lcIjtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW3hPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueCxcbiAgICAgIFt5T3BlcmF0aW9uXTogZXZlbnQuZGV0YWlsLnlcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHB1YmxpYyBvblN0YXJ0VG91Y2hUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGNvbnNvbGUubG9nKFwib24gdG91Y2ggc3RhcnRcIik7XG4gIC8vICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAvLyAgIHRoaXMuZGF0YS50YWdnc1tpbmRleF0udGFnX2hlaWdodCA9IDk1O1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICBjdXJyZW50VGFnSW5kZXg6IGluZGV4LFxuICAvLyAgICAgdGFnZ3M6dGhpcy5kYXRhLnRhZ2dzXG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25BZGRDYW5kaWRhdGVzVGFnKGV2ZW50OiBhbnkpIHtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuY2FuZGlkYXRlc0luZGV4O1xuICAvLyAgIGxldCB0YWdOYW1lID0gdGhpcy5kYXRhLmNhbmRpZGF0ZXNUYWdMaXN0W2luZGV4XS50YWdOYW1lXG4gIC8vICAgLy9nZXQgaW1hZ2UgY2VudGVyXG4gIC8vICAgbGV0IHRvdWNoWCA9IDEwO1xuICAvLyAgIGxldCB0b3VjaFkgPSAxMDtcbiAgLy8gICBsZXQgdGFnOiBUYWcgPSB7XG4gIC8vICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAvLyAgICAgeDogdG91Y2hYLFxuICAvLyAgICAgeTogdG91Y2hZLFxuICAvLyAgICAgZG90Q29sb3I6ICcjZTAxNWZhJyxcbiAgLy8gICAgIGRpc3BhbHlNZXNzYWdlOiB0YWdOYW1lLFxuICAvLyAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gIC8vICAgICByZWFsdGVkSW5mbzoge31cbiAgLy8gICB9O1xuICAvLyAgIC8vYWRkIGludG8gdGFnZ3MgYW5kIHJlZnJlc2hcbiAgLy8gICB0aGlzLmRhdGEudGFnZ3MucHVzaCh0YWcpO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzXG4gIC8vICAgfSk7XG4gIC8vICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25Ub2dnbGVEZWxldGVUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgLy8gICBsZXQgb3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnNob3dEZWxldGVCdG5cIjtcbiAgLy8gICBsZXQgdGFnSGVpZ2h0T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ19oZWlnaHRcIjtcbiAgLy8gICBsZXQgZmxhZyA9IHRoaXMuZGF0YS50YWdnc1tpbmRleF0uc2hvd0RlbGV0ZUJ0bjtcbiAgLy8gICBsZXQgaGVpZ2h0ID0gZmxhZyA/IDY1IDogOTU7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiAhZmxhZyxcbiAgLy8gICAgIFt0YWdIZWlnaHRPcGVyYXRpb25dOiBoZWlnaHRcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG5cbiAgLy8gcHVibGljIGRlbGV0ZVRhZyhldmVudDogYW55KSB7XG4gIC8vICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAvLyAgIGxldCBvcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0uaXNEZWxldGVkXCI7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiB0cnVlLFxuICAvLyAgICAgY3VycmVudFRhZ0luZGV4OiAwXG4gIC8vICAgfSk7XG4gIC8vICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25BZGRUZXh0U2VhcmNoVGFnKCkge1xuICAvLyAgIC8vdXNlIG5hdmlnYXRlIGJhY2sgdG8gZ2V0IHNlYXJjaCByZXN1bHRcbiAgLy8gICB3eC5uYXZpZ2F0ZVRvKHtcbiAgLy8gICAgIHVybDogXCIvcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT3mm7TlpJrpo5/nialcIlxuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgLy8gcHVibGljIG5hdmlUb0Zvb2REZXRhaWxQYWdlKCkge1xuICAvLyAgIHZhciB0aGF0ID0gdGhpcztcbiAgLy8gICB3eC5nZXRJbWFnZUluZm8oe1xuICAvLyAgICAgc3JjOiB0aGlzLmRhdGEuaW1hZ2VVcmwsXG4gIC8vICAgICBzdWNjZXNzKGltZzogYW55KSB7XG4gIC8vICAgICAgIGxldCBwYXJhbSA9IHsgaW1hZ2VVcmw6IHRoYXQuZGF0YS5pbWFnZVVybCwgbWVhbElkOiAwLCBzaG93U2hhcmVCdG46IHRydWUgfTtcbiAgLy8gICAgICAgbGV0IHBpY1JhdGlvID0gaW1nLndpZHRoIC8gdGhhdC5kYXRhLnNjcmVlbldpZHRoXG4gIC8vICAgICAgIGNvbnNvbGUubG9nKGltZyk7XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKFwicGljUmF0aW86XCIrcGljUmF0aW8pO1xuICAvLyAgICAgICAvL2dldCBmb29kRGV0YWlsIGZyb20gYmFja2VuZFxuICAvLyAgICAgICBsZXQgZm9vZF9saXN0ID0gW107XG4gIC8vICAgICAgIGZvciAobGV0IGluZGV4IGluIHRoYXQuZGF0YS50YWdncykge1xuICAvLyAgICAgICAgIGxldCB0YWcgPSB0aGF0LmRhdGEudGFnZ3NbaW5kZXhdO1xuICAvLyAgICAgICAgIGlmICh0YWcuaXNEZWxldGVkKSB7IGNvbnRpbnVlIH07XG4gIC8vICAgICAgICAgbGV0IHRhZ1ggPSBNYXRoLmZsb29yKHRhZy50YWdfeCAqIHRoYXQuZGF0YS5waXhlbFJhdGlvICogcGljUmF0aW8pO1xuICAvLyAgICAgICAgIGxldCB0YWdZID0gTWF0aC5mbG9vcih0YWcudGFnX3kgKiB0aGF0LmRhdGEucGl4ZWxSYXRpbyAqIHBpY1JhdGlvKTtcbiAgLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyh0YWdYICtcIixcIit0YWdZKTtcbiAgLy8gICAgICAgICBsZXQgYmJveF94ID0gdGFnLmJib3hfeDtcbiAgLy8gICAgICAgICBsZXQgYmJveF95ID0gdGFnLmJib3hfeTtcbiAgLy8gICAgICAgICBsZXQgYmJveF93ID0gdGFnLmJib3hfdztcbiAgLy8gICAgICAgICBsZXQgYmJveF9oID0gdGFnLmJib3hfaDtcbiAgLy8gICAgICAgICBsZXQgZm9vZElkID0gdGFnLnJlc3VsdF9saXN0W3RhZy5zZWxlY3RlZFBvc10uZm9vZF9pZDtcbiAgLy8gICAgICAgICBsZXQgZm9vZFR5cGUgPSB0YWcucmVzdWx0X2xpc3RbdGFnLnNlbGVjdGVkUG9zXS5mb29kX3R5cGU7XG4gIC8vICAgICAgICAgbGV0IHJlc3VsdHMgPSB0YWcucmVzdWx0X2xpc3Q7XG4gIC8vICAgICAgICAgbGV0IGZvb2QgPSB7IGZvb2RfaWQ6IGZvb2RJZCwgaW5wdXRfdHlwZTogMSwgZm9vZF90eXBlOiBmb29kVHlwZSwgdGFnX3g6IHRhZ1gsIHRhZ195OiB0YWdZLCBiYm94X3g6IGJib3hfeCwgYmJveF95OiBiYm94X3ksIGJib3hfdzogYmJveF93LCBiYm94X2g6IGJib3hfaCwgcmVjb2duaXRpb25fcmVzdWx0czogcmVzdWx0cyB9O1xuICAvLyAgICAgICAgIGZvb2RfbGlzdC5wdXNoKGZvb2QpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IHRoYXQubWVhbElkLCBtZWFsX3R5cGU6IHRoYXQubWVhbFR5cGUsIG1lYWxfZGF0ZTogdGhhdC5tZWFsRGF0ZSwgZm9vZF9saXN0OiBmb29kX2xpc3QgfTtcbiAgLy8gICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgLy8gICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgLy8gICAgICAgd2ViQVBJLkNyZWF0ZU9yVXBkYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgICAgIHRoYXQubWVhbElkID0gcmVzcC5tZWFsX2lkO1xuICAvLyAgICAgICAgIHBhcmFtLm1lYWxJZCA9IHRoYXQubWVhbElkXG4gIC8vICAgICAgICAgcGFyYW0uaW1hZ2VVcmwgPSB0aGF0LmRhdGEuaW1hZ2VVcmxcbiAgLy8gICAgICAgICBsZXQgcGFyYW1Kc29uID0gSlNPTi5zdHJpbmdpZnkocGFyYW0pO1xuICAvLyAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAvLyAgICAgICAgICAgdXJsOiBcIi9wYWdlcy9mb29kRGV0YWlsL2luZGV4P3BhcmFtSnNvbj1cIiArIHBhcmFtSnNvblxuICAvLyAgICAgICAgIH0pO1xuICAvLyAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gIC8vICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgLy8gICAgICAgICAgIHRpdGxlOiAnJyxcbiAgLy8gICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/niankv6Hmga/lpLHotKUnLFxuICAvLyAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICB9KTtcbiAgLy8gICAgIH0sXG4gIC8vICAgICBmYWlsKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gIC8vICAgfSk7XG4gIC8vIH1cbn1cblxuUGFnZShuZXcgSW1hZ2VUYWdQYWdlKCkpOyJdfQ==