"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var ImageTagPage = (function () {
    function ImageTagPage() {
        this.mealId = -1;
        this.incrementalId = 0;
        this.textSearchFood = undefined;
        this.mealDate = 0;
        this.mealType = 0;
        this.divideproportion = 0;
        this.data = {
            currentTagIndex: 0,
            taggs: [],
            imageUrl: "",
            pixelRatio: 2,
            hideBanner: false,
            imageWidth: 0,
            imageHeight: 0,
            screenWidth: 0,
        };
    }
    ImageTagPage.prototype.onLoad = function (option) {
        var that = this;
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        this.setData({
            imageUrl: option.imageUrl
        });
        console.log(option.mealType + "," + option.mealDate);
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
        this.getBannerStatus();
    };
    ImageTagPage.prototype.onShow = function () {
        var _a;
        if (this.textSearchFood) {
            console.log(this.textSearchFood);
            var operation = "taggs[" + this.data.currentTagIndex + "]";
            var foodName = this.textSearchFood.food_name.split("[")[0];
            var result = [{ food_id: this.textSearchFood.food_id, food_name: foodName, food_type: this.textSearchFood.food_type }];
            var tagY = this.data.taggs[this.data.currentTagIndex].tag_y;
            var tagX = this.data.taggs[this.data.currentTagIndex].tag_x;
            var tag = { food_id: this.textSearchFood.food_id, food_name: this.textSearchFood.food_name, food_type: this.textSearchFood.food_type, isDeleted: false, selectedPos: 0, showDeleteBtn: false, tag_x: tagX, tag_y: tagY, tag_height: 95, result_list: result };
            this.setData((_a = {},
                _a[operation] = tag,
                _a));
            this.textSearchFood = undefined;
        }
        else if (this.data.taggs[this.data.currentTagIndex] && this.data.taggs[this.data.currentTagIndex].result_list[0].food_id === 0) {
            this.data.taggs.splice(this.data.currentTagIndex, 1);
            this.setData({
                taggs: this.data.taggs,
                currentTagIndex: 0
            });
        }
    };
    ImageTagPage.prototype.getBannerStatus = function () {
        var hideBanner = wx.getStorageSync(globalEnum.globalkey_hideBanner);
        console.log(hideBanner);
        this.setData({
            hideBanner: hideBanner
        });
    };
    ImageTagPage.prototype.dismissBanner = function () {
        var that = this;
        wx.showModal({
            title: "",
            content: "确定不再展示此提示?",
            success: function (res) {
                if (res.confirm) {
                    wx.setStorageSync(globalEnum.globalkey_hideBanner, true);
                    that.setData({
                        hideBanner: true
                    });
                }
            }
        });
    };
    ImageTagPage.prototype.getRecognitionResult = function (imageKey) {
        var that = this;
        wx.showLoading({ title: "识别中...", mask: true });
        var req = { img_key: imageKey, meal_date: this.mealDate, meal_type: this.mealType };
        webAPI.RetrieveRecognition(req).then(function (resp) {
            console.log(resp);
            that.parseRecognitionData(resp);
            wx.hideLoading({});
        }).catch(function (err) {
            wx.hideLoading({});
            console.log(err);
            wx.showModal({
                title: '获取识别结果失败',
                content: JSON.stringify(err),
                showCancel: false
            });
        });
    };
    ImageTagPage.prototype.parseRecognitionData = function (resp) {
        var taggs = [];
        for (var index in resp.prediction) {
            var predictionItem = resp.prediction[index];
            var resultList = resp.prediction[index].result_list;
            var item = {
                tag_x: predictionItem.tag_x / (this.divideproportion * 2),
                tag_y: predictionItem.tag_y / (this.divideproportion * 2) - 10,
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
        });
    };
    ImageTagPage.prototype.loadDummyData = function () {
        var taggs = [
            {
                tagType: 1,
                isDeleted: false,
                selectedPos: 0,
                result_list: [
                    { food_id: 0, food_name: "西兰花炒腊肉" }, { food_id: 0, food_name: "水煮青菜" }, { food_id: 0, food_name: "木须肉" }, { food_id: 0, food_name: "番茄炒鸡蛋" }, { food_id: 0, food_name: "麻婆豆腐" },
                ],
                showDeleteBtn: false,
                food_id: 0,
                food_name: "西兰花炒腊肉",
                tag_x: 50,
                tag_y: 50
            },
            {
                tagType: 1,
                isDeleted: false,
                selectedPos: 0,
                result_list: [
                    { food_id: 0, food_name: "米饭" }, { food_id: 0, food_name: "花卷" }, { food_id: 0, food_name: "牛奶" }, { food_id: 0, food_name: "白巧克力" }
                ],
                showDeleteBtn: false,
                food_id: 0,
                food_name: "米饭",
                tag_x: 300,
                tag_y: 50
            },
            {
                tagType: 1,
                isDeleted: false,
                selectedPos: 0,
                result_list: [
                    { food_id: 0, food_name: "炒油麦菜" }, { food_id: 0, food_name: "炒小白菜" }, { food_id: 0, food_name: "炒地瓜叶" }, { food_id: 0, food_name: "炒空心菜" }
                ],
                showDeleteBtn: false,
                food_id: 0,
                food_name: "炒油麦菜",
                tag_x: 100,
                tag_y: 200
            }
        ];
        this.setData({ taggs: taggs });
    };
    ImageTagPage.prototype.onChangeTagPosition = function (event) {
        var _a;
        var index = event.currentTarget.dataset.candidatesIndex;
        var operation = "taggs[" + this.data.currentTagIndex + "].selectedPos";
        var changeIdOperation = "taggs[" + this.data.currentTagIndex + "].food_id";
        var changeNameOperation = "taggs[" + this.data.currentTagIndex + "].food_name";
        var changeFoodTypeOperation = "taggs[" + this.data.currentTagIndex + "].food_type";
        this.setData((_a = {},
            _a[operation] = index,
            _a[changeIdOperation] = this.data.taggs[this.data.currentTagIndex].result_list[index].food_id,
            _a[changeNameOperation] = this.data.taggs[this.data.currentTagIndex].result_list[index].food_name,
            _a[changeFoodTypeOperation] = this.data.taggs[this.data.currentTagIndex].result_list[index].food_type,
            _a));
    };
    ImageTagPage.prototype.createTag = function (event) {
        console.log(event);
        var touchX = event.changedTouches[0].clientX - 40;
        var touchY = event.changedTouches[0].clientY - 18;
        console.log("x:" + touchX + ",y:" + touchY);
        var tag = {
            tagType: 3,
            isDeleted: false,
            tag_x: touchX,
            tag_y: touchY,
            tag_height: 95,
            selectedPos: 0,
            result_list: [{ food_id: 0, food_name: "这是什么?" }],
            showDeleteBtn: false
        };
        this.data.taggs.push(tag);
        this.setData({
            taggs: this.data.taggs,
            currentTagIndex: this.data.taggs.length - 1
        });
        this.incrementalId++;
        setTimeout(function () {
            wx.navigateTo({
                url: "/pages/textSearch/index?title=食物"
            });
        }, 500);
    };
    ImageTagPage.prototype.onTagMove = function (event) {
        var _a;
        var index = event.currentTarget.dataset.tagIndex;
        console.log(event.detail.x);
        console.log(event.detail.y);
        var xOperation = "taggs[" + index + "].tag_x";
        var yOperation = "taggs[" + index + "].tag_y";
        this.setData((_a = {},
            _a[xOperation] = event.detail.x,
            _a[yOperation] = event.detail.y,
            _a));
    };
    ImageTagPage.prototype.onStartTouchTag = function (event) {
        console.log("on touch start");
        var index = event.currentTarget.dataset.tagIndex;
        this.data.taggs[index].tag_height = 95;
        this.setData({
            currentTagIndex: index,
            taggs: this.data.taggs
        });
    };
    ImageTagPage.prototype.deleteTag = function (event) {
        var _a;
        var index = event.currentTarget.dataset.tagIndex;
        console.log("enter on delete " + index);
        var operation = "taggs[" + index + "].isDeleted";
        this.setData((_a = {},
            _a[operation] = true,
            _a.currentTagIndex = 0,
            _a));
        this.incrementalId++;
    };
    ImageTagPage.prototype.onAddTextSearchTag = function () {
        wx.navigateTo({
            url: "/pages/textSearch/index?title=更多食物"
        });
    };
    ImageTagPage.prototype.naviToFoodDetailPage = function () {
        var that = this;
        wx.getImageInfo({
            src: this.data.imageUrl,
            success: function (img) {
                var param = { imageUrl: that.data.imageUrl, mealId: 0, showShareBtn: true };
                var picRatio = img.width / that.data.screenWidth;
                console.log(img);
                console.log("picRatio:" + picRatio);
                var food_list = [];
                for (var index in that.data.taggs) {
                    var tag = that.data.taggs[index];
                    if (tag.isDeleted) {
                        continue;
                    }
                    ;
                    var tagX = Math.floor(tag.tag_x * that.data.pixelRatio * picRatio);
                    var tagY = Math.floor(tag.tag_y * that.data.pixelRatio * picRatio);
                    var bbox_x = tag.bbox_x;
                    var bbox_y = tag.bbox_y;
                    var bbox_w = tag.bbox_w;
                    var bbox_h = tag.bbox_h;
                    var foodId = tag.result_list[tag.selectedPos].food_id;
                    var foodType = tag.result_list[tag.selectedPos].food_type;
                    var results = tag.result_list;
                    var food = { food_id: foodId, input_type: 1, food_type: foodType, tag_x: tagX, tag_y: tagY, bbox_x: bbox_x, bbox_y: bbox_y, bbox_w: bbox_w, bbox_h: bbox_h, recognition_results: results };
                    food_list.push(food);
                }
                var req = { meal_id: that.mealId, meal_type: that.mealType, meal_date: that.mealDate, food_list: food_list };
                console.log(req);
                wx.showLoading({ title: "加载中..." });
                webAPI.CreateOrUpdateMealLog(req).then(function (resp) {
                    wx.hideLoading({});
                    that.mealId = resp.meal_id;
                    param.mealId = that.mealId;
                    param.imageUrl = that.data.imageUrl;
                    var paramJson = JSON.stringify(param);
                    wx.navigateTo({
                        url: "/pages/foodDetail/index?paramJson=" + paramJson
                    });
                }).catch(function (err) {
                    console.log(err);
                    wx.showModal({
                        title: '',
                        content: '获取食物信息失败',
                        showCancel: false
                    });
                });
            },
            fail: function (err) { console.log(err); }
        });
    };
    return ImageTagPage;
}());
Page(new ImageTagPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUVuRCxpREFBbUQ7QUFpQ25EO0lBQUE7UUFDUyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUNsQixtQkFBYyxHQUFXLFNBQVMsQ0FBQztRQUNuQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLHFCQUFnQixHQUFDLENBQUMsQ0FBQztRQUNuQixTQUFJLEdBQVM7WUFFbEIsZUFBZSxFQUFFLENBQUM7WUFDbEIsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxDQUFDO1lBQ2IsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFDLENBQUM7WUFDWixXQUFXLEVBQUMsQ0FBQztZQUNiLFdBQVcsRUFBQyxDQUFDO1NBQ2QsQ0FBQTtJQXFYSCxDQUFDO0lBblhRLDZCQUFNLEdBQWIsVUFBYyxNQUFXO1FBQ3ZCLElBQUksSUFBSSxHQUFPLElBQUksQ0FBQztRQUVwQixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFFbEUsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNkLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUNwQixPQUFPLFlBQUMsR0FBRztnQkFDVCxJQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUMsR0FBRyxDQUFDLEtB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LENBQUMsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO29CQUMzQixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7b0JBQzFCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7b0JBQ25DLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RDLEVBQUUsQ0FBQyxVQUFVLENBQUM7d0JBQ1osR0FBRyxFQUFFLG9DQUFvQyxHQUFHLFNBQVM7cUJBQ3RELENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHO29CQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLEVBQUUsQ0FBQyxTQUFTLENBQUM7d0JBQ1gsS0FBSyxFQUFFLEVBQUU7d0JBQ1QsT0FBTyxFQUFFLFVBQVU7d0JBQ25CLFVBQVUsRUFBRSxLQUFLO3FCQUNsQixDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsSUFBSSxZQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQyxDQUFDLENBQUM7SUFFTCxDQUFDO0lBR0gsbUJBQUM7QUFBRCxDQUFDLEFBdllELElBdVlDO0FBRUQsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0IHsgUmV0cmlldmVSZWNvZ25pdGlvblJlcSwgUmV0cmlldmVSZWNvZ25pdGlvblJlc3AgfSBmcm9tIFwiL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuXG5cbnR5cGUgRGF0YSA9IHtcbiAgY3VycmVudFRhZ0luZGV4OiBudW1iZXI7XG4gIHRhZ2dzOiBUYWdbXTtcbiAgaW1hZ2VVcmw6IHN0cmluZztcbiAgcGl4ZWxSYXRpbzogbnVtYmVyO1xuICBoaWRlQmFubmVyOiBib29sZWFuO1xuICBpbWFnZVdpZHRoOm51bWJlcjtcbn1cbnR5cGUgVGFnID0ge1xuICBpc0RlbGV0ZWQ6IGJvb2xlYW47XG4gIHRhZ194OiBudW1iZXI7XG4gIHRhZ195OiBudW1iZXI7XG4gIGJib3hfeDpudW1iZXI7XG4gIGJib3hfeTogbnVtYmVyO1xuICBiYm94X3c6IG51bWJlcjtcbiAgYmJveF9oOiBudW1iZXI7XG4gIHRhZ19oZWlnaHQ6IG51bWJlcjtcbiAgZm9vZF90eXBlOiBudW1iZXI7ICAvLzEucmVjZWlwZSAyLiByZWNlaXBlXG4gIHRhZ1R5cGU6IG51bWJlcjsgLy8xIHJlY29nbml0aW9uLCAyIHRleHRTZWFyY2ggMy5hZGRpdGlvbmFsU2VhcmNoXG4gIHNob3dEZWxldGVCdG46IGZhbHNlO1xuICBzZWxlY3RlZFBvczogbnVtYmVyO1xuICByZXN1bHRfbGlzdDogUmVzdWx0W107XG59XG5cbnR5cGUgUmVzdWx0ID0ge1xuICBmb29kX2lkOiBudW1iZXI7XG4gIGZvb2RfbmFtZTogc3RyaW5nO1xuICBmb29kX3R5cGU6IG51bWJlcjtcbn1cblxuY2xhc3MgSW1hZ2VUYWdQYWdlIHtcbiAgcHVibGljIG1lYWxJZCA9IC0xO1xuICBwdWJsaWMgaW5jcmVtZW50YWxJZCA9IDA7XG4gIHB1YmxpYyB0ZXh0U2VhcmNoRm9vZDogUmVzdWx0ID0gdW5kZWZpbmVkO1xuICBwdWJsaWMgbWVhbERhdGUgPSAwO1xuICBwdWJsaWMgbWVhbFR5cGUgPSAwO1xuICAvLyBwdWJsaWMgc2NyZWVuV2lkdGggPSAwO1xuICBwdWJsaWMgZGl2aWRlcHJvcG9ydGlvbj0wOy8v55yf5a6e5a695bqm6Zmk5LulNzIwcnB477ybXG4gIHB1YmxpYyBkYXRhOiBEYXRhID0ge1xuICAgIC8vbW9ja3VwIHRhZyBsaXN0XG4gICAgY3VycmVudFRhZ0luZGV4OiAwLFxuICAgIHRhZ2dzOiBbXSxcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwaXhlbFJhdGlvOiAyLFxuICAgIGhpZGVCYW5uZXI6IGZhbHNlLFxuICAgIGltYWdlV2lkdGg6MCxcbiAgICBpbWFnZUhlaWdodDowLFxuICAgIHNjcmVlbldpZHRoOjAsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbjogYW55KSB7XG4gICAgdmFyIHRoYXQ6YW55ID0gdGhpcztcbiAgICAvL3NldCB0b2tlbiBpbnRvIHdlYkFQSVxuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTsgXG4gICAgLy9sb2FkIG5lY2Vzc2FyeSBkYXRhIGludG8gcGFnZVxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpbWFnZVVybDogb3B0aW9uLmltYWdlVXJsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2cob3B0aW9uLm1lYWxUeXBlICsgXCIsXCIgKyBvcHRpb24ubWVhbERhdGUpO1xuICAgIHd4LmdldEltYWdlSW5mbyh7XG4gICAgICBzcmM6IG9wdGlvbi5pbWFnZVVybCxcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGlmKHJlcy5oZWlnaHQvcmVzLndpZHRoPjAuOTYpe1xuICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy5oZWlnaHQgLyA3MjBcbiAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgaW1hZ2VIZWlnaHQ6NzIwLFxuICAgICAgICAgICAgaW1hZ2VXaWR0aDogcmVzLndpZHRoICogNzIwIC8gcmVzLmhlaWdodFxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoYXQuZGl2aWRlcHJvcG9ydGlvbiA9IHJlcy53aWR0aCAvIDc1MFxuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWFnZVdpZHRoOiA3NTAsXG4gICAgICAgICAgICBpbWFnZUhlaWdodDogcmVzLmhlaWdodCAqIDcyMCAvIHJlcy53aWR0aFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChvcHRpb24ubWVhbFR5cGUpO1xuICAgIHRoaXMubWVhbERhdGUgPSBwYXJzZUludChvcHRpb24ubWVhbERhdGUpO1xuICAgIHd4LmdldFN5c3RlbUluZm8oe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAvLyB0aGF0LnNjcmVlbldpZHRoID0gcmVzLndpbmRvd1dpZHRoO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIHNjcmVlbldpZHRoOiByZXMud2luZG93V2lkdGhcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coXCJjb252ZXJ0IHJhdGU6XCIgKyA3NTAgLyByZXMud2luZG93V2lkdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpeGVsIHJhdGlvOlwiICsgcmVzLnBpeGVsUmF0aW8pO1xuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIHBpeGVsUmF0aW86IHJlcy5waXhlbFJhdGlvXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gdGhpcy5sb2FkRHVtbXlEYXRhKCk7XG4gICAgdmFyIGltYWdlUGF0aCA9IG9wdGlvbi5pbWFnZVVybC5zcGxpdChcIi9cIikucG9wKCk7XG4gICAgY29uc29sZS5sb2coaW1hZ2VQYXRoKTtcbiAgICB0aGlzLmdldFJlY29nbml0aW9uUmVzdWx0KGltYWdlUGF0aCk7XG4gICAgdGhpcy5nZXRCYW5uZXJTdGF0dXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgaWYgKHRoaXMudGV4dFNlYXJjaEZvb2QpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMudGV4dFNlYXJjaEZvb2QpO1xuICAgICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdXCI7XG4gICAgICBsZXQgZm9vZE5hbWUgPSB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZS5zcGxpdChcIltcIilbMF07XG4gICAgICBsZXQgcmVzdWx0ID0gW3sgZm9vZF9pZDogdGhpcy50ZXh0U2VhcmNoRm9vZC5mb29kX2lkLCBmb29kX25hbWU6IGZvb2ROYW1lLCBmb29kX3R5cGU6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF90eXBlIH1dO1xuICAgICAgbGV0IHRhZ1kgPSB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0udGFnX3k7XG4gICAgICBsZXQgdGFnWCA9IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS50YWdfeDtcbiAgICAgIGxldCB0YWcgPSB7IGZvb2RfaWQ6IHRoaXMudGV4dFNlYXJjaEZvb2QuZm9vZF9pZCwgZm9vZF9uYW1lOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfbmFtZSwgZm9vZF90eXBlOiB0aGlzLnRleHRTZWFyY2hGb29kLmZvb2RfdHlwZSwgaXNEZWxldGVkOiBmYWxzZSwgc2VsZWN0ZWRQb3M6IDAsIHNob3dEZWxldGVCdG46IGZhbHNlLCB0YWdfeDogdGFnWCwgdGFnX3k6IHRhZ1ksIHRhZ19oZWlnaHQ6IDk1LCByZXN1bHRfbGlzdDogcmVzdWx0IH07XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBbb3BlcmF0aW9uXTogdGFnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnRleHRTZWFyY2hGb29kID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdICYmIHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFswXS5mb29kX2lkID09PSAwKSB7XG4gICAgICAvL3JlbW92ZSB0ZXh0IHNlYXJjaCBpdGVtXG4gICAgICB0aGlzLmRhdGEudGFnZ3Muc3BsaWNlKHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXgsIDEpO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdGFnZ3M6IHRoaXMuZGF0YS50YWdncyxcbiAgICAgICAgY3VycmVudFRhZ0luZGV4OiAwXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0QmFubmVyU3RhdHVzKCkge1xuICAgIGxldCBoaWRlQmFubmVyID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxrZXlfaGlkZUJhbm5lcik7XG4gICAgY29uc29sZS5sb2coaGlkZUJhbm5lcik7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGhpZGVCYW5uZXI6IGhpZGVCYW5uZXJcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNtaXNzQmFubmVyKCl7XG4gICAgdmFyIHRoYXQ9IHRoaXM7XG4gICAgd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOlwiXCIsXG4gICAgICBjb250ZW50Olwi56Gu5a6a5LiN5YaN5bGV56S65q2k5o+Q56S6P1wiLFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XG4gICAgICAgICAgLy9zZXR0aW5nIGdsb2JhbCB2aXJhYmxlXG4gICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxrZXlfaGlkZUJhbm5lcix0cnVlKTtcbiAgICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgaGlkZUJhbm5lcjogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVjb2duaXRpb25SZXN1bHQoaW1hZ2VLZXk6IFN0cmluZykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuivhuWIq+S4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgIGxldCByZXE6IFJldHJpZXZlUmVjb2duaXRpb25SZXEgPSB7IGltZ19rZXk6IGltYWdlS2V5LCBtZWFsX2RhdGU6IHRoaXMubWVhbERhdGUsIG1lYWxfdHlwZTogdGhpcy5tZWFsVHlwZSB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZVJlY29nbml0aW9uKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgdGhhdC5wYXJzZVJlY29nbml0aW9uRGF0YShyZXNwKTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICfojrflj5bor4bliKvnu5PmnpzlpLHotKUnLFxuICAgICAgICAgIGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KGVyciksXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHBhcnNlUmVjb2duaXRpb25EYXRhKHJlc3A6IFJldHJpZXZlUmVjb2duaXRpb25SZXNwKSB7XG4gICAgbGV0IHRhZ2dzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggaW4gcmVzcC5wcmVkaWN0aW9uKSB7XG4gICAgICBsZXQgcHJlZGljdGlvbkl0ZW0gPSByZXNwLnByZWRpY3Rpb25baW5kZXhdO1xuICAgICAgbGV0IHJlc3VsdExpc3QgPSByZXNwLnByZWRpY3Rpb25baW5kZXhdLnJlc3VsdF9saXN0O1xuICAgICAgbGV0IGl0ZW0gPSB7XG4gICAgICAgIC8vIHRhZ194OiBwcmVkaWN0aW9uSXRlbS50YWdfeCAvICh0aGlzLmRpdmlkZXByb3BvcnRpb24gKiB0aGlzLmRhdGEucGl4ZWxSYXRpbyksXG4gICAgICAgIC8vIHRhZ195OiBwcmVkaWN0aW9uSXRlbS50YWdfeSAvICh0aGlzLmRpdmlkZXByb3BvcnRpb24gKiB0aGlzLmRhdGEucGl4ZWxSYXRpbyksXG4gICAgICAgIHRhZ194OiBwcmVkaWN0aW9uSXRlbS50YWdfeCAvICh0aGlzLmRpdmlkZXByb3BvcnRpb24gKiAyKSxcbiAgICAgICAgdGFnX3k6IHByZWRpY3Rpb25JdGVtLnRhZ195IC8gKHRoaXMuZGl2aWRlcHJvcG9ydGlvbiAqIDIpLTEwLFxuICAgICAgICAvLyB0YWdfeDogcHJlZGljdGlvbkl0ZW0udGFnX3ggLyAodGhpcy5kYXRhLnBpeGVsUmF0aW8pLFxuICAgICAgICAvLyB0YWdfeTogcHJlZGljdGlvbkl0ZW0udGFnX3kgLyAodGhpcy5kYXRhLnBpeGVsUmF0aW8pLFxuICAgICAgICBiYm94X3g6IHByZWRpY3Rpb25JdGVtLmJib3hfeCxcbiAgICAgICAgYmJveF95OiBwcmVkaWN0aW9uSXRlbS5iYm94X3ksXG4gICAgICAgICBiYm94X3c6IHByZWRpY3Rpb25JdGVtLmJib3hfdyxcbiAgICAgICAgYmJveF9oOiBwcmVkaWN0aW9uSXRlbS5iYm94X2gsXG4gICAgICAgIGZvb2RfaWQ6IHByZWRpY3Rpb25JdGVtLmZvb2RfaWQsXG4gICAgICAgIGZvb2RfdHlwZTogcHJlZGljdGlvbkl0ZW0uZm9vZF90eXBlLFxuICAgICAgICBmb29kX25hbWU6IHByZWRpY3Rpb25JdGVtLmZvb2RfbmFtZSxcbiAgICAgICAgdGFnX2hlaWdodDogaW5kZXggPT0gMCA/IDk1IDogNjUgLFxuICAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgICAgICAgaXNEZWxldGVkOiBmYWxzZSxcbiAgICAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gICAgICAgIHJlc3VsdF9saXN0OiByZXN1bHRMaXN0XG4gICAgICB9O1xuICAgICAgdGFnZ3MucHVzaChpdGVtKTtcbiAgICB9XG4gICAgdGhpcy5tZWFsSWQgPSByZXNwLm1lYWxfaWQ7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRhZ2dzOiB0YWdnc1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGxvYWREdW1teURhdGEoKSB7XG4gICAgbGV0IHRhZ2dzID0gW1xuICAgICAge1xuICAgICAgICB0YWdUeXBlOiAxLFxuICAgICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAgICAgICBzZWxlY3RlZFBvczogMCxcbiAgICAgICAgcmVzdWx0X2xpc3Q6IFtcbiAgICAgICAgICB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLopb/lhbDoirHngpLohYrogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmsLTnha7pnZLoj5xcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLmnKjpobvogolcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLnlarojITngpLpuKHom4tcIiB9LCB7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLpurvlqYbosYbohZBcIiB9LFxuICAgICAgICBdLFxuICAgICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZSxcbiAgICAgICAgZm9vZF9pZDogMCxcbiAgICAgICAgZm9vZF9uYW1lOiBcIuilv+WFsOiKseeCkuiFiuiCiVwiLFxuICAgICAgICB0YWdfeDogNTAsXG4gICAgICAgIHRhZ195OiA1MFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGFnVHlwZTogMSxcbiAgICAgICAgaXNEZWxldGVkOiBmYWxzZSxcbiAgICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gICAgICAgIHJlc3VsdF9saXN0OiBbXG4gICAgICAgICAgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi57Gz6aWtXCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi6Iqx5Y23XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi54mb5aW2XCIgfSwgeyBmb29kX2lkOiAwLCBmb29kX25hbWU6IFwi55m95ben5YWL5YqbXCIgfVxuICAgICAgICBdLFxuICAgICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZSxcbiAgICAgICAgZm9vZF9pZDogMCxcbiAgICAgICAgZm9vZF9uYW1lOiBcIuexs+mlrVwiLFxuICAgICAgICB0YWdfeDogMzAwLFxuICAgICAgICB0YWdfeTogNTBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRhZ1R5cGU6IDEsXG4gICAgICAgIGlzRGVsZXRlZDogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkUG9zOiAwLFxuICAgICAgICByZXN1bHRfbGlzdDogW1xuICAgICAgICAgIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuayuem6puiPnFwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuWwj+eZveiPnFwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuWcsOeTnOWPtlwiIH0sIHsgZm9vZF9pZDogMCwgZm9vZF9uYW1lOiBcIueCkuepuuW/g+iPnFwiIH1cbiAgICAgICAgXSxcbiAgICAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gICAgICAgIGZvb2RfaWQ6IDAsXG4gICAgICAgIGZvb2RfbmFtZTogXCLngpLmsrnpuqboj5xcIixcbiAgICAgICAgdGFnX3g6IDEwMCxcbiAgICAgICAgdGFnX3k6IDIwMFxuICAgICAgfVxuICAgIF07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGFnZ3M6IHRhZ2dzIH0pO1xuICB9XG5cbiAgcHVibGljIG9uQ2hhbmdlVGFnUG9zaXRpb24oZXZlbnQ6IGFueSkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5jYW5kaWRhdGVzSW5kZXg7XG4gICAgbGV0IG9wZXJhdGlvbiA9IFwidGFnZ3NbXCIgKyB0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4ICsgXCJdLnNlbGVjdGVkUG9zXCI7XG4gICAgbGV0IGNoYW5nZUlkT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9pZFwiO1xuICAgIGxldCBjaGFuZ2VOYW1lT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF9uYW1lXCI7XG4gICAgbGV0IGNoYW5nZUZvb2RUeXBlT3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIHRoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXggKyBcIl0uZm9vZF90eXBlXCI7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFtvcGVyYXRpb25dOiBpbmRleCxcbiAgICAgIFtjaGFuZ2VJZE9wZXJhdGlvbl06IHRoaXMuZGF0YS50YWdnc1t0aGlzLmRhdGEuY3VycmVudFRhZ0luZGV4XS5yZXN1bHRfbGlzdFtpbmRleF0uZm9vZF9pZCxcbiAgICAgIFtjaGFuZ2VOYW1lT3BlcmF0aW9uXTogdGhpcy5kYXRhLnRhZ2dzW3RoaXMuZGF0YS5jdXJyZW50VGFnSW5kZXhdLnJlc3VsdF9saXN0W2luZGV4XS5mb29kX25hbWUsXG4gICAgICBbY2hhbmdlRm9vZFR5cGVPcGVyYXRpb25dOiB0aGlzLmRhdGEudGFnZ3NbdGhpcy5kYXRhLmN1cnJlbnRUYWdJbmRleF0ucmVzdWx0X2xpc3RbaW5kZXhdLmZvb2RfdHlwZVxuICAgIH0pO1xuICB9XG5cbiAgLy9jaGVjayB0aGUgdGFnIGFyZWEsIGdlbmVyYXRlIGRvdCBjb3Zlci1pbWFnZVxuICBwdWJsaWMgY3JlYXRlVGFnKGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgbGV0IHRvdWNoWCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSA0MDtcbiAgICBsZXQgdG91Y2hZID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIDE4O1xuICAgIGNvbnNvbGUubG9nKFwieDpcIiArIHRvdWNoWCArIFwiLHk6XCIgKyB0b3VjaFkpO1xuICAgIGxldCB0YWc6IFRhZyA9IHtcbiAgICAgIHRhZ1R5cGU6IDMsXG4gICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAgICAgdGFnX3g6IHRvdWNoWCxcbiAgICAgIHRhZ195OiB0b3VjaFksXG4gICAgICB0YWdfaGVpZ2h0OiA5NSxcbiAgICAgIHNlbGVjdGVkUG9zOiAwLFxuICAgICAgcmVzdWx0X2xpc3Q6IFt7IGZvb2RfaWQ6IDAsIGZvb2RfbmFtZTogXCLov5nmmK/ku4DkuYg/XCIgfV0sXG4gICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZVxuICAgIH07XG4gICAgLy9hZGQgaW50byB0YWdncyBhbmQgcmVmcmVzaFxuICAgIHRoaXMuZGF0YS50YWdncy5wdXNoKHRhZyk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRhZ2dzOiB0aGlzLmRhdGEudGFnZ3MsXG4gICAgICBjdXJyZW50VGFnSW5kZXg6IHRoaXMuZGF0YS50YWdncy5sZW5ndGggLSAxXG4gICAgfSk7XG4gICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gICAgLy9uYXZpIHRvIHRleHRTZWFyY2hcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICB1cmw6IFwiL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU96aOf54mpXCJcbiAgICAgIH0pO1xuICAgIH0sIDUwMClcbiAgfVxuXG4gIHB1YmxpYyBvblRhZ01vdmUoZXZlbnQ6IGFueSkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgICBjb25zb2xlLmxvZyhldmVudC5kZXRhaWwueCk7XG4gICAgY29uc29sZS5sb2coZXZlbnQuZGV0YWlsLnkpO1xuICAgIGxldCB4T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ194XCI7XG4gICAgbGV0IHlPcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0udGFnX3lcIjtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW3hPcGVyYXRpb25dOiBldmVudC5kZXRhaWwueCxcbiAgICAgIFt5T3BlcmF0aW9uXTogZXZlbnQuZGV0YWlsLnlcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblN0YXJ0VG91Y2hUYWcoZXZlbnQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwib24gdG91Y2ggc3RhcnRcIik7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhZ0luZGV4O1xuICAgIHRoaXMuZGF0YS50YWdnc1tpbmRleF0udGFnX2hlaWdodCA9IDk1O1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjdXJyZW50VGFnSW5kZXg6IGluZGV4LFxuICAgICAgdGFnZ3M6dGhpcy5kYXRhLnRhZ2dzXG4gICAgfSk7XG4gIH1cblxuICAvLyBwdWJsaWMgb25BZGRDYW5kaWRhdGVzVGFnKGV2ZW50OiBhbnkpIHtcbiAgLy8gICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuY2FuZGlkYXRlc0luZGV4O1xuICAvLyAgIGxldCB0YWdOYW1lID0gdGhpcy5kYXRhLmNhbmRpZGF0ZXNUYWdMaXN0W2luZGV4XS50YWdOYW1lXG4gIC8vICAgLy9nZXQgaW1hZ2UgY2VudGVyXG4gIC8vICAgbGV0IHRvdWNoWCA9IDEwO1xuICAvLyAgIGxldCB0b3VjaFkgPSAxMDtcbiAgLy8gICBsZXQgdGFnOiBUYWcgPSB7XG4gIC8vICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAvLyAgICAgeDogdG91Y2hYLFxuICAvLyAgICAgeTogdG91Y2hZLFxuICAvLyAgICAgZG90Q29sb3I6ICcjZTAxNWZhJyxcbiAgLy8gICAgIGRpc3BhbHlNZXNzYWdlOiB0YWdOYW1lLFxuICAvLyAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gIC8vICAgICByZWFsdGVkSW5mbzoge31cbiAgLy8gICB9O1xuICAvLyAgIC8vYWRkIGludG8gdGFnZ3MgYW5kIHJlZnJlc2hcbiAgLy8gICB0aGlzLmRhdGEudGFnZ3MucHVzaCh0YWcpO1xuICAvLyAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICB0YWdnczogdGhpcy5kYXRhLnRhZ2dzXG4gIC8vICAgfSk7XG4gIC8vICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIC8vIH1cblxuICAvLyBwdWJsaWMgb25Ub2dnbGVEZWxldGVUYWcoZXZlbnQ6IGFueSkge1xuICAvLyAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgLy8gICBsZXQgb3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnNob3dEZWxldGVCdG5cIjtcbiAgLy8gICBsZXQgdGFnSGVpZ2h0T3BlcmF0aW9uID0gXCJ0YWdnc1tcIiArIGluZGV4ICsgXCJdLnRhZ19oZWlnaHRcIjtcbiAgLy8gICBsZXQgZmxhZyA9IHRoaXMuZGF0YS50YWdnc1tpbmRleF0uc2hvd0RlbGV0ZUJ0bjtcbiAgLy8gICBsZXQgaGVpZ2h0ID0gZmxhZyA/IDY1IDogOTU7XG4gIC8vICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgIFtvcGVyYXRpb25dOiAhZmxhZyxcbiAgLy8gICAgIFt0YWdIZWlnaHRPcGVyYXRpb25dOiBoZWlnaHRcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG5cbiAgcHVibGljIGRlbGV0ZVRhZyhldmVudDogYW55KSB7Ly9leGNoYW5nZSBsaXN0IG9yZGVyIHRvIGF2b2lkIGFuaW1hdGlvblxuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWdJbmRleDtcbiAgICAvL2RlbGV0ZSB0YWdncyBhbmQgcmVmcmVzaFxuICAgIGNvbnNvbGUubG9nKFwiZW50ZXIgb24gZGVsZXRlIFwiICsgaW5kZXgpO1xuICAgIC8vIHRoaXMuZGF0YS50YWdncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGxldCBvcGVyYXRpb24gPSBcInRhZ2dzW1wiICsgaW5kZXggKyBcIl0uaXNEZWxldGVkXCI7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIFtvcGVyYXRpb25dOiB0cnVlLFxuICAgICAgY3VycmVudFRhZ0luZGV4OiAwXG4gICAgfSk7XG4gICAgdGhpcy5pbmNyZW1lbnRhbElkKys7XG4gIH1cblxuICBwdWJsaWMgb25BZGRUZXh0U2VhcmNoVGFnKCkge1xuICAgIC8vdXNlIG5hdmlnYXRlIGJhY2sgdG8gZ2V0IHNlYXJjaCByZXN1bHRcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIvcGFnZXMvdGV4dFNlYXJjaC9pbmRleD90aXRsZT3mm7TlpJrpo5/nialcIlxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG5hdmlUb0Zvb2REZXRhaWxQYWdlKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgc3JjOiB0aGlzLmRhdGEuaW1hZ2VVcmwsXG4gICAgICBzdWNjZXNzKGltZzogYW55KSB7XG4gICAgICAgIGxldCBwYXJhbSA9IHsgaW1hZ2VVcmw6IHRoYXQuZGF0YS5pbWFnZVVybCwgbWVhbElkOiAwLCBzaG93U2hhcmVCdG46IHRydWUgfTtcbiAgICAgICAgbGV0IHBpY1JhdGlvID0gaW1nLndpZHRoIC8gdGhhdC5kYXRhLnNjcmVlbldpZHRoXG4gICAgICAgIGNvbnNvbGUubG9nKGltZyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGljUmF0aW86XCIrcGljUmF0aW8pO1xuICAgICAgICAvL2dldCBmb29kRGV0YWlsIGZyb20gYmFja2VuZFxuICAgICAgICBsZXQgZm9vZF9saXN0ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4IGluIHRoYXQuZGF0YS50YWdncykge1xuICAgICAgICAgIGxldCB0YWcgPSB0aGF0LmRhdGEudGFnZ3NbaW5kZXhdO1xuICAgICAgICAgIGlmICh0YWcuaXNEZWxldGVkKSB7IGNvbnRpbnVlIH07XG4gICAgICAgICAgbGV0IHRhZ1ggPSBNYXRoLmZsb29yKHRhZy50YWdfeCAqIHRoYXQuZGF0YS5waXhlbFJhdGlvICogcGljUmF0aW8pO1xuICAgICAgICAgIGxldCB0YWdZID0gTWF0aC5mbG9vcih0YWcudGFnX3kgKiB0aGF0LmRhdGEucGl4ZWxSYXRpbyAqIHBpY1JhdGlvKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0YWdYICtcIixcIit0YWdZKTtcbiAgICAgICAgICBsZXQgYmJveF94ID0gdGFnLmJib3hfeDtcbiAgICAgICAgICBsZXQgYmJveF95ID0gdGFnLmJib3hfeTtcbiAgICAgICAgICBsZXQgYmJveF93ID0gdGFnLmJib3hfdztcbiAgICAgICAgICBsZXQgYmJveF9oID0gdGFnLmJib3hfaDtcbiAgICAgICAgICBsZXQgZm9vZElkID0gdGFnLnJlc3VsdF9saXN0W3RhZy5zZWxlY3RlZFBvc10uZm9vZF9pZDtcbiAgICAgICAgICBsZXQgZm9vZFR5cGUgPSB0YWcucmVzdWx0X2xpc3RbdGFnLnNlbGVjdGVkUG9zXS5mb29kX3R5cGU7XG4gICAgICAgICAgbGV0IHJlc3VsdHMgPSB0YWcucmVzdWx0X2xpc3Q7XG4gICAgICAgICAgbGV0IGZvb2QgPSB7IGZvb2RfaWQ6IGZvb2RJZCwgaW5wdXRfdHlwZTogMSwgZm9vZF90eXBlOiBmb29kVHlwZSwgdGFnX3g6IHRhZ1gsIHRhZ195OiB0YWdZLCBiYm94X3g6IGJib3hfeCwgYmJveF95OiBiYm94X3ksIGJib3hfdzogYmJveF93LCBiYm94X2g6IGJib3hfaCwgcmVjb2duaXRpb25fcmVzdWx0czogcmVzdWx0cyB9O1xuICAgICAgICAgIGZvb2RfbGlzdC5wdXNoKGZvb2QpO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IHRoYXQubWVhbElkLCBtZWFsX3R5cGU6IHRoYXQubWVhbFR5cGUsIG1lYWxfZGF0ZTogdGhhdC5tZWFsRGF0ZSwgZm9vZF9saXN0OiBmb29kX2xpc3QgfTtcbiAgICAgICAgY29uc29sZS5sb2cocmVxKTtcbiAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICAgICAgd2ViQVBJLkNyZWF0ZU9yVXBkYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIHRoYXQubWVhbElkID0gcmVzcC5tZWFsX2lkO1xuICAgICAgICAgIHBhcmFtLm1lYWxJZCA9IHRoYXQubWVhbElkXG4gICAgICAgICAgcGFyYW0uaW1hZ2VVcmwgPSB0aGF0LmRhdGEuaW1hZ2VVcmxcbiAgICAgICAgICBsZXQgcGFyYW1Kc29uID0gSlNPTi5zdHJpbmdpZnkocGFyYW0pO1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiBcIi9wYWdlcy9mb29kRGV0YWlsL2luZGV4P3BhcmFtSnNvbj1cIiArIHBhcmFtSnNvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/niankv6Hmga/lpLHotKUnLFxuICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gICAgfSk7XG4gICAgXG4gIH1cblxuXG59XG5cblBhZ2UobmV3IEltYWdlVGFnUGFnZSgpKTsiXX0=