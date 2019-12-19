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
var webAPI = require("../../api/app/AppService");
var interface_1 = require("../../api/app/interface");
var globalEnum = require("../../api/GlobalEnum");
var textCache = require("./textCache/TextCache");
var list_js_1 = require("./list.js");
var moment = require("moment");
var textSearch = (function () {
    function textSearch() {
        this.filterType = 0;
        this.mealType = 0;
        this.naviType = 0;
        this.mealDate = 0;
        this.data = {
            keyword: "",
            inputShowed: false,
            resultList: [],
            resultError: [],
            recentList: [],
            commonFoodList: [],
            showChoosedLists: false,
            showChoosedConfirm: false,
            showPopup: false,
            showPicker: false,
            choosedLists: [],
            unitArr: ['克', '碗', '把', '捧', '盆', '瓢'],
            foodUnitAndUnitEnergy: [],
            foodNumValue: 100,
            foodNumValueMaxlength: 3,
            chooseUinitIndex: 0,
            textSearchResultSelectIndex: null,
            recentResultSelectIndex: null,
            commonFoodIndex: null,
            totalEnergy: 0,
        };
    }
    textSearch.prototype.onLoad = function (options) {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        var title = options.title;
        this.filterType = parseInt(options.filterType);
        this.mealType = parseInt(options.mealType);
        this.naviType = parseInt(options.naviType);
        this.mealDate = parseInt(options.mealDate);
        wx.setNavigationBarTitle({
            title: "添加" + title
        });
        this.getCommonFoodList();
    };
    textSearch.prototype.onShow = function () {
        this.getRecentList();
    };
    textSearch.prototype.getCommonFoodList = function () {
        var hour = parseInt(moment().format('HH'));
        if (hour >= 16) {
            this.setData({ commonFoodList: list_js_1.default.c });
            return;
        }
        else if (hour >= 10) {
            this.setData({ commonFoodList: list_js_1.default.b });
            return;
        }
        else {
            this.setData({ commonFoodList: list_js_1.default.a });
        }
    };
    textSearch.prototype.getFoodUnitOption = function (item) {
        var that = this;
        interface_1.default.getFoodUnitOption({
            foodId: item.foodId,
            foodType: item.foodType
        }).then(function (res) {
            console.log('getFoodUnitOption', res);
            that.parseFoodUnitOptionResp(res);
        }).catch(function (err) {
            wx.showToast({
                title: '获取食物信息失败',
                icon: 'none'
            });
        });
    };
    textSearch.prototype.parseFoodUnitOptionResp = function (res) {
        var arr = res.unitOption.map(function (item) {
            return {
                name: item.unitName,
                unitEnergy: Math.round(item.energy),
                unit_id: item.unitId
            };
        });
        var nameArr = arr.map(function (item) { return item.name; });
        this.setData({
            foodNumValue: res.unitOption[0].unitWeight / 100,
            chooseUinitIndex: 0,
            unitArr: nameArr,
            foodUnitAndUnitEnergy: arr,
            showPopup: true
        });
    };
    textSearch.prototype.getRecentList = function () {
        var recentList = textCache.getAllValue();
        this.setData({
            recentList: recentList
        });
    };
    textSearch.prototype.showInput = function () {
        this.setData({
            inputShowed: true
        });
    };
    textSearch.prototype.clearInput = function () {
        this.setData({
            keyword: "",
            resultError: false,
            resultList: []
        });
    };
    textSearch.prototype.inputTyping = function (event) {
        this.setData({
            resultError: false,
            keyword: event.detail.value,
        });
    };
    textSearch.prototype.performSearch = function () {
        var keyword = this.data.keyword;
        var req = { query: keyword, filter_type: this.filterType, meal_type: this.mealType };
        var that = this;
        wx.showLoading({
            title: '加载中...'
        });
        webAPI.RetrieveTextSearch(req).then(function (resp) {
            wx.hideLoading();
            that.setResultList(resp);
        }).catch(function (err) { return console.log(err); });
    };
    textSearch.prototype.setResultList = function (resp) {
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
        console.log(this.data.resultList);
    };
    textSearch.prototype.onTextSearchResultSelect = function (event) {
        var _this = this;
        var index = event.currentTarget.dataset.textIndex;
        this.getFoodUnitOption(this.data.resultList[index]);
        this.setData({
            recentResultSelectIndex: null,
            commonFoodIndex: null,
            textSearchResultSelectIndex: index,
        }, function () {
            textCache.setValue(_this.data.resultList[index]);
            _this.getRecentList();
        });
    };
    textSearch.prototype.handleTapCommonFoodItem = function (event) {
        var index = event.currentTarget.dataset.textIndex;
        this.getFoodUnitOption(this.data.commonFoodList[index]);
        this.setData({
            textSearchResultSelectIndex: null,
            recentResultSelectIndex: null,
            commonFoodIndex: index,
        });
        textCache.setValue(this.data.commonFoodList[index]);
        this.getRecentList();
    };
    textSearch.prototype.onRecentResultSelect = function (event) {
        var index = event.currentTarget.dataset.textIndex;
        this.getFoodUnitOption(this.data.recentList[index]);
        this.setData({
            textSearchResultSelectIndex: null,
            commonFoodIndex: null,
            recentResultSelectIndex: index,
        });
    };
    textSearch.prototype.deleteTextSearchCache = function (event) {
        textCache.clearAll();
        this.getRecentList();
    };
    textSearch.prototype.onClose = function () {
        this.setData({ showPopup: false, showChoosedLists: false });
    };
    textSearch.prototype.toggleChoosedLists = function () {
        this.setData({ showChoosedLists: !this.data.showChoosedLists });
    };
    textSearch.prototype.handleAddFood = function () {
        var _this = this;
        var textSearchResultSelectIndex = this.data.textSearchResultSelectIndex;
        var recentResultSelectIndex = this.data.recentResultSelectIndex;
        var commonFoodIndex = this.data.commonFoodIndex;
        if (recentResultSelectIndex !== null) {
            var item = this.data.recentList[recentResultSelectIndex];
        }
        else if (textSearchResultSelectIndex !== null) {
            var item = this.data.resultList[textSearchResultSelectIndex];
        }
        else {
            var item = this.data.commonFoodList[commonFoodIndex];
        }
        item = __assign({}, item, { choosedUnit: this.data.unitArr[this.data.chooseUinitIndex], weightNumber: this.data.foodNumValue, unitEnergy: this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex].unitEnergy, unit_id: this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex].unit_id });
        this.data.choosedLists.push(item);
        this.setData({
            choosedLists: this.data.choosedLists,
            showPopup: false
        }, function () {
            _this.sumEnergy();
            if (recentResultSelectIndex !== null) {
                textCache.setValue(_this.data.recentList[recentResultSelectIndex]);
                _this.getRecentList();
            }
            console.log(_this.data.choosedLists);
        });
    };
    textSearch.prototype.sumEnergy = function () {
        var totalEnergy = this.data.choosedLists.reduce(function (pre, next) {
            return next.weightNumber * next.unitEnergy + pre;
        }, 0);
        this.setData({ totalEnergy: totalEnergy });
    };
    textSearch.prototype.handleFoodNumInput = function (e) {
        this.setData({ foodNumValue: parseInt(e.detail.value) });
    };
    textSearch.prototype.showPicker = function () {
        this.setData({ showPicker: true, showPopup: false });
    };
    textSearch.prototype.onConfirm = function () {
        this.setData({ showPicker: false, showPopup: true });
    };
    textSearch.prototype.onChange = function (e) {
        var chooseUinitIndex = e.detail.index;
        if (this.data.unitArr[chooseUinitIndex] === '克') {
            this.setData({ foodNumValueMaxlength: 3 });
        }
        this.setData({ chooseUinitIndex: chooseUinitIndex });
    };
    textSearch.prototype.handleDeleteChoosedItem = function (e) {
        var _this = this;
        var index = e.currentTarget.dataset.index;
        this.data.choosedLists.splice(index, 1);
        this.setData({ choosedLists: this.data.choosedLists }, function () {
            _this.sumEnergy();
            if (_this.data.choosedLists.length === 0) {
                _this.setData({ showChoosedLists: false });
            }
        });
    };
    textSearch.prototype.handleConfirmBtn = function () {
        wx.showLoading({ title: "加载中...", mask: true });
        var foodList = [];
        this.data.choosedLists.map(function (item) {
            var results = [{ food_id: item.foodId, food_name: item.foodName, food_type: item.foodType }];
            var food = {
                food_id: item.foodId,
                food_type: item.foodType,
                recognition_results: results,
                input_type: 2,
                amount: parseInt(item.weightNumber) * 100,
                unit_id: item.unit_id
            };
            foodList.push(food);
        });
        var req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
        console.log('请求参数req', req);
        this.CreateOrUpdateMealLog(req);
    };
    textSearch.prototype.CreateOrUpdateMealLog = function (req) {
        var _this = this;
        var imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
        webAPI.CreateOrUpdateMealLog(req).then(function (resp) {
            _this.ConfirmMealLog(resp.meal_id);
        }).catch(function (err) {
            wx.showToast({ title: '请求失败', icon: 'none' });
            wx.hideLoading({});
        });
    };
    textSearch.prototype.ConfirmMealLog = function (meal_id) {
        var _this = this;
        var req = { meal_id: meal_id };
        webAPI.ConfirmMealLog(req).then(function (resp) {
            wx.hideLoading({});
            wx.navigateTo({ url: "../../homeSub/pages/mealAnalysis/index?mealDate=" + _this.mealDate + "&mealType=" + _this.mealType });
        }).catch(function (err) {
            wx.showToast({ title: '提交食物记录失败', icon: 'none' });
        });
    };
    return textSearch;
}());
Page(new textSearch());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1EO0FBQ25ELHFEQUE4QztBQUU5QyxpREFBa0Q7QUFDbEQsaURBQWtEO0FBQ2xELHFDQUFzQztBQUN0QywrQkFBa0M7QUFjbEM7SUFBQTtRQUNTLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDZixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFFYixTQUFJLEdBQUc7WUFDWixPQUFPLEVBQUUsRUFBRTtZQUNYLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsV0FBVyxFQUFFLEVBQUU7WUFDZixVQUFVLEVBQUUsRUFBRTtZQUNkLGNBQWMsRUFBQyxFQUFFO1lBQ2pCLGdCQUFnQixFQUFDLEtBQUs7WUFDdEIsa0JBQWtCLEVBQUMsS0FBSztZQUN4QixTQUFTLEVBQUUsS0FBSztZQUNoQixVQUFVLEVBQUMsS0FBSztZQUNoQixZQUFZLEVBQUMsRUFBRTtZQUNmLE9BQU8sRUFBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDO1lBQ2pDLHFCQUFxQixFQUFDLEVBQUU7WUFDeEIsWUFBWSxFQUFDLEdBQUc7WUFDaEIscUJBQXFCLEVBQUMsQ0FBQztZQUN2QixnQkFBZ0IsRUFBQyxDQUFDO1lBQ2xCLDJCQUEyQixFQUFDLElBQUk7WUFDaEMsdUJBQXVCLEVBQUMsSUFBSTtZQUM1QixlQUFlLEVBQUMsSUFBSTtZQUNwQixXQUFXLEVBQUMsQ0FBQztTQUNkLENBQUE7SUEyVUgsQ0FBQztJQXpVUSwyQkFBTSxHQUFiLFVBQWMsT0FBWTtRQUN4QixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFD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LENBQUM7UUFDL0IsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO1lBQ2xDLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxREFBbUQsS0FBSSxDQUFDLFFBQVEsa0JBQWEsS0FBSSxDQUFDLFFBQVUsRUFBQyxDQUFDLENBQUE7UUFDckgsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRztZQUNWLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVILGlCQUFDO0FBQUQsQ0FBQyxBQXRXRCxJQXNXQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJztcbmltcG9ydCB7IFJldHJpZXZlVGV4dFNlYXJjaFJlcSwgUmV0cmlldmVUZXh0U2VhcmNoUmVzcCwgQ3JlYXRlT3JVcGRhdGVNZWFsTG9nUmVxLCBBZGRSZWNpcGVJdGVtUmVxLCBNZWFsTG9nUmVzcCB9IGZyb20gXCIvYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0ICogYXMgdGV4dENhY2hlIGZyb20gJy4vdGV4dENhY2hlL1RleHRDYWNoZSdcbmltcG9ydCBjb21tb25Gb29kTGlzdCBmcm9tICcuL2xpc3QuanMnXG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5cbnR5cGUgZGF0YSA9IHtcbiAga2V5d29yZDogU3RyaW5nO1xuICByZXN1bHRMaXN0OiBSZXN1bHRbXTtcbn1cblxudHlwZSBSZXN1bHQgPSB7XG4gIGZvb2RJZDogbnVtYmVyO1xuICBkaXNwbGF5TmFtZTogU3RyaW5nO1xuICBmb29kVHlwZTogbnVtYmVyO1xuICBlbmdyeTogbnVtYmVyO1xufVxuXG5jbGFzcyB0ZXh0U2VhcmNoIHtcbiAgcHVibGljIGZpbHRlclR5cGUgPSAwOyAvLzAuYWxsIDEucmVjaXBlIDIuaW5ncmVpZGVudFxuICBwdWJsaWMgbWVhbFR5cGUgPSAwOyAvLzEuYnJlYWtmYXN0IDIubHVuY2ggMy5kaW5uZXIgNC5zbmFja1xuICBwdWJsaWMgbmF2aVR5cGUgPSAwOyAvLzAudGV4dHNlYXJjaCA9PiBkZXRhaWwgMS50ZXh0c2VhcmNoID0+IHRhZyAyLnRleHRzZWFyY2g9PiBpbmdyZWRpZW50XG4gIHB1YmxpYyBtZWFsRGF0ZSA9IDA7IC8vcHJldiBwYWdlIG11c3QgcGFzcyBtZWFsRGF0ZSB0byB0ZXh0U2VhcmNoIHBhZ2VcblxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBrZXl3b3JkOiBcIlwiLFxuICAgIGlucHV0U2hvd2VkOiBmYWxzZSxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICByZXN1bHRFcnJvcjogW10sXG4gICAgcmVjZW50TGlzdDogW10sXG4gICAgY29tbW9uRm9vZExpc3Q6W10sIC8vIOW4uOingemjn+eJqeWIl+ihqFxuICAgIHNob3dDaG9vc2VkTGlzdHM6ZmFsc2UsXG4gICAgc2hvd0Nob29zZWRDb25maXJtOmZhbHNlLFxuICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgc2hvd1BpY2tlcjpmYWxzZSxcbiAgICBjaG9vc2VkTGlzdHM6W10sICAvLyDlt7Lnu4/mt7vliqDnmoTpo5/niankv6Hmga/liJfooahcbiAgICB1bml0QXJyOlsn5YWLJywn56KXJywn5oqKJywn5o2nJywn55uGJywn55OiJ10sXG4gICAgZm9vZFVuaXRBbmRVbml0RW5lcmd5OltdLFxuICAgIGZvb2ROdW1WYWx1ZToxMDAsXG4gICAgZm9vZE51bVZhbHVlTWF4bGVuZ3RoOjMsXG4gICAgY2hvb3NlVWluaXRJbmRleDowLCAvLyDnlKjmiLfpgInmi6nkuoZwaWNrZXLkuK3nmoRpbmRleFxuICAgIHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleDpudWxsLCAvLyDnlKjmiLfngrnlh7vmloflrZfmkJzntKLliJfooajkuK3nmoTlk6rkuIDpoblcbiAgICByZWNlbnRSZXN1bHRTZWxlY3RJbmRleDpudWxsLCAvLyDnlKjmiLfngrnlh7vkuobljoblj7LnvJPlrZjmlbDnu4TkuK3nmoRpbmRleFxuICAgIGNvbW1vbkZvb2RJbmRleDpudWxsLCAvLyDluLjop4HliJfooajkuK3nmoRpbmRleFxuICAgIHRvdGFsRW5lcmd5OjAsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnM6IGFueSkge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICBsZXQgdGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KG9wdGlvbnMuZmlsdGVyVHlwZSk7XG4gICAgdGhpcy5tZWFsVHlwZSA9IHBhcnNlSW50KG9wdGlvbnMubWVhbFR5cGUpO1xuICAgIHRoaXMubmF2aVR5cGUgPSBwYXJzZUludChvcHRpb25zLm5hdmlUeXBlKTtcbiAgICB0aGlzLm1lYWxEYXRlID0gcGFyc2VJbnQob3B0aW9ucy5tZWFsRGF0ZSk7XG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIua3u+WKoFwiICsgdGl0bGUvL+mhtemdouagh+mimOS4uui3r+eUseWPguaVsFxuICAgIH0pO1xuICAgIHRoaXMuZ2V0Q29tbW9uRm9vZExpc3QoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5nZXRSZWNlbnRMaXN0KCk7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPluW4uOingeeahOmjn+eJqeWIl+ihqFxuICAgKi9cbiAgcHVibGljIGdldENvbW1vbkZvb2RMaXN0KCl7XG4gICAgLy8gY29uc3QgdGhhdCA9IHRoaXNcbiAgICAvLyByZXF1ZXN0LmNvbW1vbkZvb2RMaXN0KHtcbiAgICAvLyB9KS50aGVuKHJlcz0+e1xuICAgIC8vICAgdGhhdC5zZXREYXRhKHtjb21tb25Gb29kTGlzdDpyZXN9KVxuICAgIC8vIH0pLmNhdGNoKGVycj0+e1xuICAgIC8vICAgY29uc29sZS5sb2coZXJyKVxuICAgIC8vIH0pXG4gICAgbGV0IGhvdXIgPSBwYXJzZUludChtb21lbnQoKS5mb3JtYXQoJ0hIJykpO1xuICAgIGlmKGhvdXI+PTE2KXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7Y29tbW9uRm9vZExpc3Q6Y29tbW9uRm9vZExpc3QuY30pXG4gICAgICByZXR1cm5cbiAgICB9ZWxzZSBpZihob3VyPj0xMCl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2NvbW1vbkZvb2RMaXN0OmNvbW1vbkZvb2RMaXN0LmJ9KVxuICAgICAgcmV0dXJuXG4gICAgfWVsc2V7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2NvbW1vbkZvb2RMaXN0OmNvbW1vbkZvb2RMaXN0LmF9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bpo5/nianljZXkvY3kv6Hmga9cbiAgICovXG4gIHB1YmxpYyBnZXRGb29kVW5pdE9wdGlvbihpdGVtKXtcbiAgICBjb25zdCB0aGF0ID0gdGhpc1xuICAgIHJlcXVlc3QuZ2V0Rm9vZFVuaXRPcHRpb24oe1xuICAgICAgZm9vZElkOml0ZW0uZm9vZElkLFxuICAgICAgZm9vZFR5cGU6aXRlbS5mb29kVHlwZVxuICAgIH0pLnRoZW4ocmVzPT57XG4gICAgICBjb25zb2xlLmxvZygnZ2V0Rm9vZFVuaXRPcHRpb24nLHJlcylcbiAgICAgIHRoYXQucGFyc2VGb29kVW5pdE9wdGlvblJlc3AocmVzKVxuICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgdGl0bGU6J+iOt+WPlumjn+eJqeS/oeaBr+Wksei0pScsXG4gICAgICAgIGljb246J25vbmUnXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIOino+aekOiOt+WPluWIsOeahOmjn+eJqeWNleS9jeS/oeaBr1xuICAgKi9cbiAgcHVibGljIHBhcnNlRm9vZFVuaXRPcHRpb25SZXNwKHJlcyl7XG4gICAgY29uc3QgYXJyID0gcmVzLnVuaXRPcHRpb24ubWFwKGl0ZW09PntcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6aXRlbS51bml0TmFtZSxcbiAgICAgICAgdW5pdEVuZXJneSA6IE1hdGgucm91bmQoaXRlbS5lbmVyZ3kpLFxuICAgICAgICB1bml0X2lkIDogaXRlbS51bml0SWRcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IG5hbWVBcnIgPSBhcnIubWFwKGl0ZW09Pml0ZW0ubmFtZSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGZvb2ROdW1WYWx1ZTpyZXMudW5pdE9wdGlvblswXS51bml0V2VpZ2h0LzEwMCxcbiAgICAgIGNob29zZVVpbml0SW5kZXg6MCwgLy8g5Yid5aeL5YyW5pWw6YePMTAw5YWLXG4gICAgICB1bml0QXJyOm5hbWVBcnIsXG4gICAgICBmb29kVW5pdEFuZFVuaXRFbmVyZ3k6YXJyLFxuICAgICAgc2hvd1BvcHVwOnRydWVcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGdldFJlY2VudExpc3QoKXtcbiAgICBsZXQgcmVjZW50TGlzdCA9IHRleHRDYWNoZS5nZXRBbGxWYWx1ZSgpO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZWNlbnRMaXN0OiByZWNlbnRMaXN0XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgc2hvd0lucHV0KCkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpbnB1dFNob3dlZDogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGNsZWFySW5wdXQoKSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGtleXdvcmQ6IFwiXCIsXG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICByZXN1bHRMaXN0OltdXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgaW5wdXRUeXBpbmcoZXZlbnQ6IGFueSkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICBrZXl3b3JkOiBldmVudC5kZXRhaWwudmFsdWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcGVyZm9ybVNlYXJjaCgpIHtcbiAgICBsZXQga2V5d29yZCA9IHRoaXMuZGF0YS5rZXl3b3JkO1xuICAgIGxldCByZXEgPSB7IHF1ZXJ5OiBrZXl3b3JkLCBmaWx0ZXJfdHlwZTogdGhpcy5maWx0ZXJUeXBlLCBtZWFsX3R5cGU6IHRoaXMubWVhbFR5cGUgfTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoe1xuICAgICAgdGl0bGU6J+WKoOi9veS4rS4uLidcbiAgICB9KVxuICAgIHdlYkFQSS5SZXRyaWV2ZVRleHRTZWFyY2gocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoKVxuICAgICAgdGhhdC5zZXRSZXN1bHRMaXN0KHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXN1bHRMaXN0KHJlc3A6IFJldHJpZXZlVGV4dFNlYXJjaFJlc3ApIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChyZXNwLnJlc3VsdF9saXN0Lmxlbmd0aD09MCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcmVzdWx0TGlzdDogW10sXG4gICAgICAgIHJlc3VsdEVycm9yOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLnJlc3VsdF9saXN0KSB7XG4gICAgICAgIGxldCBpdGVtID0gcmVzcC5yZXN1bHRfbGlzdFtpbmRleF07XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RfaWQsXG4gICAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZF9uYW1lLFxuICAgICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RfdHlwZSxcbiAgICAgICAgICBhbW91bnQ6IGl0ZW0uYW1vdW50LFxuICAgICAgICAgIHVuaXQ6IGl0ZW0udW5pdF9uYW1lLFxuICAgICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihpdGVtLmVuZXJneSAvIDEwMClcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlc3VsdExpc3Q6IHJlc3VsdHMsXG4gICAgICAgIHJlc3VsdEVycm9yOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5yZXN1bHRMaXN0KTtcbiAgfVxuXG4gXG4gIHB1YmxpYyBvblRleHRTZWFyY2hSZXN1bHRTZWxlY3QoZXZlbnQ6IGFueSkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgdGhpcy5nZXRGb29kVW5pdE9wdGlvbih0aGlzLmRhdGEucmVzdWx0TGlzdFtpbmRleF0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZWNlbnRSZXN1bHRTZWxlY3RJbmRleDpudWxsLFxuICAgICAgY29tbW9uRm9vZEluZGV4Om51bGwsXG4gICAgICB0ZXh0U2VhcmNoUmVzdWx0U2VsZWN0SW5kZXg6aW5kZXgsXG4gICAgfSwoKT0+e1xuICAgICAgdGV4dENhY2hlLnNldFZhbHVlKHRoaXMuZGF0YS5yZXN1bHRMaXN0W2luZGV4XSk7XG4gICAgICB0aGlzLmdldFJlY2VudExpc3QoKTtcbiAgICB9KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVUYXBDb21tb25Gb29kSXRlbShldmVudDogYW55KXtcbiAgICBsZXQgaW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudGV4dEluZGV4O1xuICAgIHRoaXMuZ2V0Rm9vZFVuaXRPcHRpb24odGhpcy5kYXRhLmNvbW1vbkZvb2RMaXN0W2luZGV4XSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleDpudWxsLFxuICAgICAgcmVjZW50UmVzdWx0U2VsZWN0SW5kZXg6bnVsbCxcbiAgICAgIGNvbW1vbkZvb2RJbmRleDppbmRleCxcbiAgICB9KVxuICAgIHRleHRDYWNoZS5zZXRWYWx1ZSh0aGlzLmRhdGEuY29tbW9uRm9vZExpc3RbaW5kZXhdKTtcbiAgICB0aGlzLmdldFJlY2VudExpc3QoKVxuICB9XG5cbiAgcHVibGljIG9uUmVjZW50UmVzdWx0U2VsZWN0KGV2ZW50OiBhbnkpe1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgdGhpcy5nZXRGb29kVW5pdE9wdGlvbih0aGlzLmRhdGEucmVjZW50TGlzdFtpbmRleF0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB0ZXh0U2VhcmNoUmVzdWx0U2VsZWN0SW5kZXg6bnVsbCxcbiAgICAgIGNvbW1vbkZvb2RJbmRleDpudWxsLFxuICAgICAgcmVjZW50UmVzdWx0U2VsZWN0SW5kZXg6aW5kZXgsXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVUZXh0U2VhcmNoQ2FjaGUoZXZlbnQ6IGFueSl7XG4gICAgdGV4dENhY2hlLmNsZWFyQWxsKCk7XG4gICAgdGhpcy5nZXRSZWNlbnRMaXN0KCk7XG4gIH1cbiAgLyoqXG4gICAqIOWFs+mXreW8ueeql3BvcHVw5qGGXG4gICAqL1xuICBwdWJsaWMgb25DbG9zZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHNob3dQb3B1cDogZmFsc2Usc2hvd0Nob29zZWRMaXN0czpmYWxzZX0pO1xuICB9XG4vKipcbiAqIOWIh+aNouW3sumAiemjn+eJqeWIl+ihqOeahOaYvuekuuS4jumakOiXj1xuICovXG4gIHB1YmxpYyB0b2dnbGVDaG9vc2VkTGlzdHMoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3Nob3dDaG9vc2VkTGlzdHM6IXRoaXMuZGF0YS5zaG93Q2hvb3NlZExpc3RzfSlcbiAgfVxuICAvKipcbiAgICog54K55Ye75re75Yqg5oyJ6ZKu77yM5bCG6aOf54mp5re75Yqg6Iez5bey6YCJXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlQWRkRm9vZCgpe1xuICAgIGxldCB0ZXh0U2VhcmNoUmVzdWx0U2VsZWN0SW5kZXggPSB0aGlzLmRhdGEudGV4dFNlYXJjaFJlc3VsdFNlbGVjdEluZGV4O1xuICAgIGxldCByZWNlbnRSZXN1bHRTZWxlY3RJbmRleCA9IHRoaXMuZGF0YS5yZWNlbnRSZXN1bHRTZWxlY3RJbmRleDtcbiAgICBsZXQgY29tbW9uRm9vZEluZGV4ID0gdGhpcy5kYXRhLmNvbW1vbkZvb2RJbmRleDtcbiAgICBpZihyZWNlbnRSZXN1bHRTZWxlY3RJbmRleCAhPT0gbnVsbCApe1xuICAgICAgbGV0IGl0ZW06YW55ID0gdGhpcy5kYXRhLnJlY2VudExpc3RbcmVjZW50UmVzdWx0U2VsZWN0SW5kZXhdO1xuICAgIH1lbHNlIGlmKHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleCAhPT0gbnVsbCl7XG4gICAgICBsZXQgaXRlbTphbnkgPSB0aGlzLmRhdGEucmVzdWx0TGlzdFt0ZXh0U2VhcmNoUmVzdWx0U2VsZWN0SW5kZXhdO1xuICAgIH1lbHNle1xuICAgICAgbGV0IGl0ZW06YW55ID0gdGhpcy5kYXRhLmNvbW1vbkZvb2RMaXN0W2NvbW1vbkZvb2RJbmRleF07XG4gICAgfVxuICAgIGl0ZW0gPSB7XG4gICAgICAuLi5pdGVtLFxuICAgICAgY2hvb3NlZFVuaXQ6dGhpcy5kYXRhLnVuaXRBcnJbdGhpcy5kYXRhLmNob29zZVVpbml0SW5kZXhdLFxuICAgICAgd2VpZ2h0TnVtYmVyOnRoaXMuZGF0YS5mb29kTnVtVmFsdWUsXG4gICAgICB1bml0RW5lcmd5OnRoaXMuZGF0YS5mb29kVW5pdEFuZFVuaXRFbmVyZ3lbdGhpcy5kYXRhLmNob29zZVVpbml0SW5kZXhdLnVuaXRFbmVyZ3ksXG4gICAgICB1bml0X2lkOnRoaXMuZGF0YS5mb29kVW5pdEFuZFVuaXRFbmVyZ3lbdGhpcy5kYXRhLmNob29zZVVpbml0SW5kZXhdLnVuaXRfaWRcbiAgICB9O1xuICAgIHRoaXMuZGF0YS5jaG9vc2VkTGlzdHMucHVzaChpdGVtKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBcbiAgICAgIGNob29zZWRMaXN0cyA6IHRoaXMuZGF0YS5jaG9vc2VkTGlzdHMsXG4gICAgICBzaG93UG9wdXAgOiBmYWxzZVxuICAgIH0sKCk9PntcbiAgICAgIHRoaXMuc3VtRW5lcmd5KCk7XG4gICAgICBpZihyZWNlbnRSZXN1bHRTZWxlY3RJbmRleCAhPT0gbnVsbCl7IC8vIOS4uuWOhuWPsuaQnOe0oumHjeaWsOaOkuW6j1xuICAgICAgICB0ZXh0Q2FjaGUuc2V0VmFsdWUodGhpcy5kYXRhLnJlY2VudExpc3RbcmVjZW50UmVzdWx0U2VsZWN0SW5kZXhdKVxuICAgICAgICB0aGlzLmdldFJlY2VudExpc3QoKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5jaG9vc2VkTGlzdHMpICAgXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIOiuoeeul+eUqOaIt+mjn+eJqeS4gOWFseacieWkmuWwkeeDremHj1xuICAgKi9cbiAgcHVibGljIHN1bUVuZXJneSgpe1xuICAgIGNvbnN0IHRvdGFsRW5lcmd5ID0gdGhpcy5kYXRhLmNob29zZWRMaXN0cy5yZWR1Y2UoKHByZSxuZXh0KT0+e1xuICAgICAgcmV0dXJuIG5leHQud2VpZ2h0TnVtYmVyKm5leHQudW5pdEVuZXJneStwcmVcbiAgICB9LDApO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dG90YWxFbmVyZ3k6dG90YWxFbmVyZ3l9KVxuICB9XG5cbiAgLyoqXG4gICAqIOeUqOaIt+i+k+WFpemjn+eJqeeahOS7veaVsFxuICAgKi9cbiAgcHVibGljIGhhbmRsZUZvb2ROdW1JbnB1dChlOmFueSl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtmb29kTnVtVmFsdWU6cGFyc2VJbnQoZS5kZXRhaWwudmFsdWUpfSlcbiAgfVxuICAvKipcbiAgICog5bGV56S6cGlja2Vy77yM6YCJ5oup6aOf54mp5Y2V5L2NXG4gICAqL1xuICBwdWJsaWMgc2hvd1BpY2tlcigpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BpY2tlcjp0cnVlLHNob3dQb3B1cDpmYWxzZX0pXG4gIH1cbiAgcHVibGljIG9uQ29uZmlybSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BpY2tlcjpmYWxzZSxzaG93UG9wdXA6dHJ1ZX0pXG4gIH1cbiAgcHVibGljIG9uQ2hhbmdlKGU6YW55KXtcbiAgICBsZXQgY2hvb3NlVWluaXRJbmRleDpudW1iZXIgPSBlLmRldGFpbC5pbmRleDtcbiAgICBpZih0aGlzLmRhdGEudW5pdEFycltjaG9vc2VVaW5pdEluZGV4XT09PSflhYsnKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7Zm9vZE51bVZhbHVlTWF4bGVuZ3RoOjN9KVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZVVpbml0SW5kZXg6Y2hvb3NlVWluaXRJbmRleH0pXG4gIH1cbiAgLyoqXG4gICAqIOWIoOmZpOmAieS4reWIl+ihqOS4reeahOafkOS4gOmhuVxuICAgKi9cbiAgcHVibGljIGhhbmRsZURlbGV0ZUNob29zZWRJdGVtKGU6YW55KXtcbiAgICBsZXQgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbmRleDtcbiAgICB0aGlzLmRhdGEuY2hvb3NlZExpc3RzLnNwbGljZShpbmRleCwxKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZWRMaXN0czp0aGlzLmRhdGEuY2hvb3NlZExpc3RzfSwoKT0+e1xuICAgICAgdGhpcy5zdW1FbmVyZ3koKVxuICAgICAgaWYodGhpcy5kYXRhLmNob29zZWRMaXN0cy5sZW5ndGg9PT0wKXtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93Q2hvb3NlZExpc3RzOmZhbHNlfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDmibnph4/mt7vliqDpo5/nianmlbTlkIjlj4LmlbBcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVDb25maXJtQnRuKCl7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICBsZXQgZm9vZExpc3Q6YW55W10gPSBbXTtcbiAgICB0aGlzLmRhdGEuY2hvb3NlZExpc3RzLm1hcCgoaXRlbTphbnkpID0+IHtcbiAgICAgIGxldCByZXN1bHRzID0gW3sgZm9vZF9pZDogaXRlbS5mb29kSWQsIGZvb2RfbmFtZTogaXRlbS5mb29kTmFtZSwgZm9vZF90eXBlOiBpdGVtLmZvb2RUeXBlIH1dO1xuICAgICAgbGV0IGZvb2QgPSB7IFxuICAgICAgICBmb29kX2lkOiBpdGVtLmZvb2RJZCwgXG4gICAgICAgIGZvb2RfdHlwZTogaXRlbS5mb29kVHlwZSwgXG4gICAgICAgIHJlY29nbml0aW9uX3Jlc3VsdHM6IHJlc3VsdHMsXG4gICAgICAgIGlucHV0X3R5cGU6IDIsIFxuICAgICAgICBhbW91bnQ6cGFyc2VJbnQoaXRlbS53ZWlnaHROdW1iZXIpKjEwMCxcbiAgICAgICAgdW5pdF9pZDogaXRlbS51bml0X2lkXG4gICAgICB9O1xuICAgICAgZm9vZExpc3QucHVzaChmb29kKVxuICAgIH0pXG4gICAgbGV0IHJlcSA9IHsgbWVhbF9pZDogLTEsIG1lYWxfdHlwZTogdGhpcy5tZWFsVHlwZSwgbWVhbF9kYXRlOiB0aGlzLm1lYWxEYXRlLCBmb29kX2xpc3Q6IGZvb2RMaXN0IH07XG4gICAgY29uc29sZS5sb2coJ+ivt+axguWPguaVsHJlcScscmVxKVxuICAgIHRoaXMuQ3JlYXRlT3JVcGRhdGVNZWFsTG9nKHJlcSk7XG4gIH1cbiAgLyoqXG4gICAqIOagvOW8j+WMluaVsOaNruWQju+8jOWPkeWHuuivt+axgu+8jOiOt+W+l21lYWxfaWRcbiAgICovXG4gIHB1YmxpYyBDcmVhdGVPclVwZGF0ZU1lYWxMb2cocmVxOmFueSl7XG4gICAgbGV0IGltYWdlVXJsID0gXCJodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9taW5pLWFwcC1pbWFnZS9kZWZhdWx0SW1hZ2UvdGV4dHNlYXJjaC1kZWZhdWx0LWltYWdlLnBuZ1wiO1xuICAgIHdlYkFQSS5DcmVhdGVPclVwZGF0ZU1lYWxMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgLy8gbGV0IHBhcmFtOmFueSA9IHt9O1xuICAgICAgLy8gcGFyYW0ubWVhbElkID0gcmVzcC5tZWFsX2lkO1xuICAgICAgLy8gcGFyYW0uaW1hZ2VVcmwgPSBpbWFnZVVybDtcbiAgICAgIC8vIHBhcmFtLnNob3dTaGFyZUJ0biA9IGZhbHNlO1xuICAgICAgLy8gbGV0IHBhcmFtSnNvbiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtKTtcbiAgICAgIHRoaXMuQ29uZmlybU1lYWxMb2cocmVzcC5tZWFsX2lkKVxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOiAn6K+35rGC5aSx6LSlJyxpY29uOiAnbm9uZSd9KTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICog5Y+R5Ye66K+35rGC77yM5Yib5bu66K6w5b2VXG4gICAqL1xuICBwdWJsaWMgQ29uZmlybU1lYWxMb2cobWVhbF9pZDpudW1iZXIpe1xuICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IG1lYWxfaWQgfTtcbiAgICB3ZWJBUEkuQ29uZmlybU1lYWxMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogYC4uLy4uL2hvbWVTdWIvcGFnZXMvbWVhbEFuYWx5c2lzL2luZGV4P21lYWxEYXRlPSR7dGhpcy5tZWFsRGF0ZX0mbWVhbFR5cGU9JHt0aGlzLm1lYWxUeXBlfWB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOiAn5o+Q5Lqk6aOf54mp6K6w5b2V5aSx6LSlJyxpY29uOiAnbm9uZSd9KTtcbiAgICB9KTtcbiAgfVxuXG59XG5cblBhZ2UobmV3IHRleHRTZWFyY2goKSlcbiJdfQ==