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
var textSearch = (function () {
    function textSearch() {
        this.filterType = 0;
        this.mealType = 0;
        this.naviType = 0;
        this.mealDate = 0;
        this.title = 0;
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
            unitArr: [],
            nameArrForWXML: [],
            foodUnitAndUnitEnergy: [],
            foodNumValue: 1,
            chooseUinitIndex: 0,
            textSearchResultSelectIndex: null,
            recentResultSelectIndex: null,
            commonFoodIndex: null,
            totalEnergy: 0,
        };
    }
    textSearch.prototype.onLoad = function (options) {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        wx.setNavigationBarTitle({ title: "添加" + options.title });
        this.title = options.title;
        this.filterType = parseInt(options.filterType);
        this.mealType = parseInt(options.mealType);
        this.naviType = parseInt(options.naviType);
        this.mealDate = parseInt(options.mealDate);
        this.getCommonFoodList();
    };
    textSearch.prototype.onShow = function () {
        this.getRecentList();
    };
    textSearch.prototype.getCommonFoodList = function () {
        var _this = this;
        var that = this;
        interface_1.default.commonFoodList({}).then(function (res) {
            _this.setData({ commonFoodList: res });
        }).catch(function (err) {
            console.log(err);
        });
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
                unit_id: item.unitId,
                unitWeight: item.unitWeight
            };
        });
        var nameArr = arr.map(function (item) {
            return item.name === '100克' ? item.name : item.name + '（' + item.unitWeight + '克）';
        });
        var nameArrForWXML = arr.map(function (item) { return item.name; });
        this.setData({
            foodNumValue: 1,
            chooseUinitIndex: 0,
            unitArr: nameArr,
            nameArrForWXML: nameArrForWXML,
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
        var choosedUnit = this.data.nameArrForWXML[this.data.chooseUinitIndex];
        var foodUnitAndUnitEnergyItem = this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex];
        item = __assign({}, item, { choosedUnit: choosedUnit, weightNumber: Number(this.data.foodNumValue), unitEnergy: foodUnitAndUnitEnergyItem.unitEnergy, unit_id: foodUnitAndUnitEnergyItem.unit_id, unitWeight: foodUnitAndUnitEnergyItem.unitWeight });
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
        });
    };
    textSearch.prototype.sumEnergy = function () {
        var totalEnergy = this.data.choosedLists.reduce(function (pre, next) {
            return next.weightNumber * next.unitEnergy + pre;
        }, 0);
        this.setData({ totalEnergy: Number(totalEnergy.toFixed(1)) });
    };
    textSearch.prototype.handleFoodNumInput = function (e) {
        var value = e.detail.value;
        var foodNumValue = value;
        this.setData({ foodNumValue: foodNumValue }, function () {
        });
    };
    textSearch.prototype.showPicker = function () {
        this.setData({ showPicker: true, showPopup: false });
    };
    textSearch.prototype.onConfirm = function () {
        this.setData({ showPicker: false, showPopup: true });
    };
    textSearch.prototype.onChange = function (e) {
        var chooseUinitIndex = e.detail.index;
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
        var foodInfoList = [];
        this.data.choosedLists.map(function (item) {
            var food = {
                foodId: item.foodId,
                foodType: item.foodType,
                inputType: 2,
                amount: item.weightNumber,
                unitId: item.unit_id,
                unitWeight: item.unitWeight,
                unitName: item.choosedUnit,
            };
            foodInfoList.push(food);
        });
        var req = { mealType: this.mealType, mealDate: this.mealDate, foodInfoList: foodInfoList };
        console.log('请求参数req', req);
        this.createMealLog(req);
    };
    textSearch.prototype.createMealLog = function (req) {
        var _this = this;
        interface_1.default.createMealLog(req).then(function (res) {
            wx.hideLoading();
            wx.showToast({ title: '食物记录成功' });
            setTimeout(function () {
                wx.reLaunch({ url: "./../../homeSub/pages/mealAnalysis/index?mealLogId=" + res.mealLogId + "&mealType=" + _this.mealType + "&mealDate=" + _this.mealDate + "&title=" + _this.title });
            }, 1450);
        }).catch(function (err) {
            wx.hideLoading();
            wx.showToast({ title: '提交食物记录失败', icon: 'none' });
        });
    };
    textSearch.prototype.goWeightReferencePage = function () {
        wx.navigateTo({ url: './../../homeSub/pages/weightReference/index' });
    };
    return textSearch;
}());
Page(new textSearch());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1EO0FBQ25ELHFEQUE4QztBQUU5QyxpREFBa0Q7QUFDbEQsaURBQWtEO0FBRWxEO0lBQUE7UUFDUyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDYixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsVUFBSyxHQUFHLENBQUMsQ0FBQztRQUVWLFNBQUksR0FBRztZQUNaLE9BQU8sRUFBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEtBQUs7WUFDbEIsVUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsRUFBRTtZQUNmLFVBQVUsRUFBRSxFQUFFO1lBQ2QsY0FBYyxFQUFDLEVBQUU7WUFDakIsZ0JBQWdCLEVBQUMsS0FBSztZQUN0QixrQkFBa0IsRUFBQyxLQUFLO1lBQ3hCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFVBQVUsRUFBQyxLQUFLO1lBQ2hCLFlBQVksRUFBQyxFQUFFO1lBQ2YsT0FBTyxFQUFDLEVBQUU7WUFDVixjQUFjLEVBQUMsRUFBRTtZQUNqQixxQkFBcUIsRUFBQyxFQUFFO1lBQ3hCLFlBQVksRUFBQyxDQUFDO1lBQ2QsZ0JBQWdCLEVBQUMsQ0FBQztZQUNsQiwyQkFBMkIsRUFBQyxJQUFJO1lBQ2hDLHVCQUF1QixFQUFDLElBQUk7WUFDNUIsZUFBZSxFQUFDLElBQUk7WUFDcEIsV0FBVyxFQUFDLENBQUM7U0FDZCxDQUFBO0lBa1dILENBQUM7SUFoV1EsMkJBQU0sR0FBYixVQUFjLE9BQVk7UUFDeEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ25FLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEtBQUssRUFBRSxJ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QyxTQUFTLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sa0NBQWEsR0FBcEIsVUFBcUIsR0FBRztRQUF4QixpQkFXQztRQVZDLG1CQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLEdBQUc7WUFDakMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ2hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQTtZQUM5QixVQUFVLENBQUM7Z0JBQ1QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFDLEdBQUcsRUFBRSx3REFBc0QsR0FBRyxDQUFDLFNBQVMsa0JBQWEsS0FBSSxDQUFDLFFBQVEsa0JBQWEsS0FBSSxDQUFDLFFBQVEsZUFBVSxLQUFJLENBQUMsS0FBTyxFQUFDLENBQUMsQ0FBQztZQUNwSyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7UUFDVCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHO1lBQ1YsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQ2hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQW1DTSwwQ0FBcUIsR0FBNUI7UUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUMsR0FBRyxFQUFDLDZDQUE2QyxFQUFDLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBRUgsaUJBQUM7QUFBRCxDQUFDLEFBOVhELElBOFhDO0FBRUQsSUFBSSxDQUFDLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgUmV0cmlldmVUZXh0U2VhcmNoUmVxLCBSZXRyaWV2ZVRleHRTZWFyY2hSZXNwLCBBZGRSZWNpcGVJdGVtUmVxLCBNZWFsTG9nUmVzcCB9IGZyb20gXCIvYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0ICogYXMgdGV4dENhY2hlIGZyb20gJy4vdGV4dENhY2hlL1RleHRDYWNoZSdcblxuY2xhc3MgdGV4dFNlYXJjaCB7XG4gIHB1YmxpYyBmaWx0ZXJUeXBlID0gMDsgLy8wLmFsbCAxLnJlY2lwZSAyLmluZ3JlaWRlbnRcbiAgcHVibGljIG1lYWxUeXBlID0gMDsgLy8xLmJyZWFrZmFzdCAyLmx1bmNoIDMuZGlubmVyIDQuc25hY2tcbiAgcHVibGljIG5hdmlUeXBlID0gMDsgLy8wLnRleHRzZWFyY2ggPT4gZGV0YWlsIDEudGV4dHNlYXJjaCA9PiB0YWcgMi50ZXh0c2VhcmNoPT4gaW5ncmVkaWVudFxuICBwdWJsaWMgbWVhbERhdGUgPSAwOyAvL3ByZXYgcGFnZSBtdXN0IHBhc3MgbWVhbERhdGUgdG8gdGV4dFNlYXJjaCBwYWdlXG4gIHB1YmxpYyB0aXRsZSA9IDA7IC8vcHJldiBwYWdlIG11c3QgcGFzcyBtZWFsRGF0ZSB0byB0ZXh0U2VhcmNoIHBhZ2VcblxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBrZXl3b3JkOiBcIlwiLFxuICAgIGlucHV0U2hvd2VkOiBmYWxzZSxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICByZXN1bHRFcnJvcjogW10sXG4gICAgcmVjZW50TGlzdDogW10sXG4gICAgY29tbW9uRm9vZExpc3Q6W10sIC8vIOW4uOingemjn+eJqeWIl+ihqFxuICAgIHNob3dDaG9vc2VkTGlzdHM6ZmFsc2UsXG4gICAgc2hvd0Nob29zZWRDb25maXJtOmZhbHNlLFxuICAgIHNob3dQb3B1cDogZmFsc2UsXG4gICAgc2hvd1BpY2tlcjpmYWxzZSxcbiAgICBjaG9vc2VkTGlzdHM6W10sICAvLyDlt7Lnu4/mt7vliqDnmoTpo5/niankv6Hmga/liJfooahcbiAgICB1bml0QXJyOltdLFxuICAgIG5hbWVBcnJGb3JXWE1MOltdLFxuICAgIGZvb2RVbml0QW5kVW5pdEVuZXJneTpbXSxcbiAgICBmb29kTnVtVmFsdWU6MSxcbiAgICBjaG9vc2VVaW5pdEluZGV4OjAsIC8vIOeUqOaIt+mAieaLqeS6hnBpY2tlcuS4reeahGluZGV4XG4gICAgdGV4dFNlYXJjaFJlc3VsdFNlbGVjdEluZGV4Om51bGwsIC8vIOeUqOaIt+eCueWHu+aWh+Wtl+aQnOe0ouWIl+ihqOS4reeahOWTquS4gOmhuVxuICAgIHJlY2VudFJlc3VsdFNlbGVjdEluZGV4Om51bGwsIC8vIOeUqOaIt+eCueWHu+S6huWOhuWPsue8k+WtmOaVsOe7hOS4reeahGluZGV4XG4gICAgY29tbW9uRm9vZEluZGV4Om51bGwsIC8vIOW4uOingeWIl+ihqOS4reeahGluZGV4XG4gICAgdG90YWxFbmVyZ3k6MCxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uczogYW55KSB7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgIHd4LnNldE5hdmlnYXRpb25CYXJUaXRsZSh7IHRpdGxlOiBcIua3u+WKoFwiICsgb3B0aW9ucy50aXRsZSB9KTtcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBwYXJzZUludChvcHRpb25zLmZpbHRlclR5cGUpO1xuICAgIHRoaXMubWVhbFR5cGUgPSBwYXJzZUludChvcHRpb25zLm1lYWxUeXBlKTtcbiAgICB0aGlzLm5hdmlUeXBlID0gcGFyc2VJbnQob3B0aW9ucy5uYXZpVHlwZSk7XG4gICAgdGhpcy5tZWFsRGF0ZSA9IHBhcnNlSW50KG9wdGlvbnMubWVhbERhdGUpO1xuICAgIHRoaXMuZ2V0Q29tbW9uRm9vZExpc3QoKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICAgdGhpcy5nZXRSZWNlbnRMaXN0KCk7XG4gIH1cbiAgLyoqXG4gICAqIOiOt+WPluW4uOingeeahOmjn+eJqeWIl+ihqFxuICAgKi9cbiAgcHVibGljIGdldENvbW1vbkZvb2RMaXN0KCl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICByZXF1ZXN0LmNvbW1vbkZvb2RMaXN0KHtcbiAgICB9KS50aGVuKHJlcz0+e1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtjb21tb25Gb29kTGlzdDpyZXN9KVxuICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6aOf54mp5Y2V5L2N5L+h5oGvXG4gICAqL1xuICBwdWJsaWMgZ2V0Rm9vZFVuaXRPcHRpb24oaXRlbSl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICByZXF1ZXN0LmdldEZvb2RVbml0T3B0aW9uKHtcbiAgICAgIGZvb2RJZDppdGVtLmZvb2RJZCxcbiAgICAgIGZvb2RUeXBlOml0ZW0uZm9vZFR5cGVcbiAgICB9KS50aGVuKHJlcz0+e1xuICAgICAgY29uc29sZS5sb2coJ2dldEZvb2RVbml0T3B0aW9uJyxyZXMpXG4gICAgICB0aGF0LnBhcnNlRm9vZFVuaXRPcHRpb25SZXNwKHJlcylcbiAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgIHRpdGxlOifojrflj5bpo5/niankv6Hmga/lpLHotKUnLFxuICAgICAgICBpY29uOidub25lJ1xuICAgICAgfSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDop6PmnpDojrflj5bliLDnmoTpo5/nianljZXkvY3kv6Hmga9cbiAgICovXG4gIHB1YmxpYyBwYXJzZUZvb2RVbml0T3B0aW9uUmVzcChyZXMpe1xuICAgIGNvbnN0IGFyciA9IHJlcy51bml0T3B0aW9uLm1hcChpdGVtPT57XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOml0ZW0udW5pdE5hbWUsXG4gICAgICAgIHVuaXRFbmVyZ3kgOiBNYXRoLnJvdW5kKGl0ZW0uZW5lcmd5KSxcbiAgICAgICAgdW5pdF9pZCA6IGl0ZW0udW5pdElkLFxuICAgICAgICB1bml0V2VpZ2h0Oml0ZW0udW5pdFdlaWdodFxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc3QgbmFtZUFyciA9IGFyci5tYXAoaXRlbT0+e1xuICAgICAgcmV0dXJuIGl0ZW0ubmFtZT09PScxMDDlhYsnP2l0ZW0ubmFtZTppdGVtLm5hbWUrJ++8iCcraXRlbS51bml0V2VpZ2h0KyflhYvvvIknXG4gICAgfSk7XG4gICAgY29uc3QgbmFtZUFyckZvcldYTUwgPSBhcnIubWFwKGl0ZW09Pml0ZW0ubmFtZSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGZvb2ROdW1WYWx1ZToxLFxuICAgICAgY2hvb3NlVWluaXRJbmRleDowLFxuICAgICAgdW5pdEFycjpuYW1lQXJyLFxuICAgICAgbmFtZUFyckZvcldYTUwsXG4gICAgICBmb29kVW5pdEFuZFVuaXRFbmVyZ3k6YXJyLFxuICAgICAgc2hvd1BvcHVwOnRydWVcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGdldFJlY2VudExpc3QoKXtcbiAgICBsZXQgcmVjZW50TGlzdCA9IHRleHRDYWNoZS5nZXRBbGxWYWx1ZSgpO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZWNlbnRMaXN0OiByZWNlbnRMaXN0XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgc2hvd0lucHV0KCkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpbnB1dFNob3dlZDogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGNsZWFySW5wdXQoKSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGtleXdvcmQ6IFwiXCIsXG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICByZXN1bHRMaXN0OltdXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgaW5wdXRUeXBpbmcoZXZlbnQ6IGFueSkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICBrZXl3b3JkOiBldmVudC5kZXRhaWwudmFsdWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcGVyZm9ybVNlYXJjaCgpIHtcbiAgICBsZXQga2V5d29yZCA9IHRoaXMuZGF0YS5rZXl3b3JkO1xuICAgIGxldCByZXEgPSB7IHF1ZXJ5OiBrZXl3b3JkLCBmaWx0ZXJfdHlwZTogdGhpcy5maWx0ZXJUeXBlLCBtZWFsX3R5cGU6IHRoaXMubWVhbFR5cGUgfTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoe1xuICAgICAgdGl0bGU6J+WKoOi9veS4rS4uLidcbiAgICB9KVxuICAgIHdlYkFQSS5SZXRyaWV2ZVRleHRTZWFyY2gocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoKVxuICAgICAgdGhhdC5zZXRSZXN1bHRMaXN0KHJlc3ApO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXN1bHRMaXN0KHJlc3A6IFJldHJpZXZlVGV4dFNlYXJjaFJlc3ApIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChyZXNwLnJlc3VsdF9saXN0Lmxlbmd0aD09MCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcmVzdWx0TGlzdDogW10sXG4gICAgICAgIHJlc3VsdEVycm9yOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpbmRleCBpbiByZXNwLnJlc3VsdF9saXN0KSB7XG4gICAgICAgIGxldCBpdGVtID0gcmVzcC5yZXN1bHRfbGlzdFtpbmRleF07XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgZm9vZElkOiBpdGVtLmZvb2RfaWQsXG4gICAgICAgICAgZm9vZE5hbWU6IGl0ZW0uZm9vZF9uYW1lLFxuICAgICAgICAgIGZvb2RUeXBlOiBpdGVtLmZvb2RfdHlwZSxcbiAgICAgICAgICBhbW91bnQ6IGl0ZW0uYW1vdW50LFxuICAgICAgICAgIHVuaXQ6IGl0ZW0udW5pdF9uYW1lLFxuICAgICAgICAgIGVuZXJneTogTWF0aC5mbG9vcihpdGVtLmVuZXJneSAvIDEwMClcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJlc3VsdExpc3Q6IHJlc3VsdHMsXG4gICAgICAgIHJlc3VsdEVycm9yOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiBcbiAgcHVibGljIG9uVGV4dFNlYXJjaFJlc3VsdFNlbGVjdChldmVudDogYW55KSB7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRleHRJbmRleDtcbiAgICB0aGlzLmdldEZvb2RVbml0T3B0aW9uKHRoaXMuZGF0YS5yZXN1bHRMaXN0W2luZGV4XSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHJlY2VudFJlc3VsdFNlbGVjdEluZGV4Om51bGwsXG4gICAgICBjb21tb25Gb29kSW5kZXg6bnVsbCxcbiAgICAgIHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleDppbmRleCxcbiAgICB9LCgpPT57XG4gICAgICB0ZXh0Q2FjaGUuc2V0VmFsdWUodGhpcy5kYXRhLnJlc3VsdExpc3RbaW5kZXhdKTtcbiAgICAgIHRoaXMuZ2V0UmVjZW50TGlzdCgpO1xuICAgIH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZVRhcENvbW1vbkZvb2RJdGVtKGV2ZW50OiBhbnkpe1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgdGhpcy5nZXRGb29kVW5pdE9wdGlvbih0aGlzLmRhdGEuY29tbW9uRm9vZExpc3RbaW5kZXhdKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgdGV4dFNlYXJjaFJlc3VsdFNlbGVjdEluZGV4Om51bGwsXG4gICAgICByZWNlbnRSZXN1bHRTZWxlY3RJbmRleDpudWxsLFxuICAgICAgY29tbW9uRm9vZEluZGV4OmluZGV4LFxuICAgIH0pXG4gICAgLy8gdGV4dENhY2hlLnNldFZhbHVlKHRoaXMuZGF0YS5jb21tb25Gb29kTGlzdFtpbmRleF0pO1xuICAgIC8vIHRoaXMuZ2V0UmVjZW50TGlzdCgpXG4gIH1cblxuICBwdWJsaWMgb25SZWNlbnRSZXN1bHRTZWxlY3QoZXZlbnQ6IGFueSl7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRleHRJbmRleDtcbiAgICB0aGlzLmdldEZvb2RVbml0T3B0aW9uKHRoaXMuZGF0YS5yZWNlbnRMaXN0W2luZGV4XSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleDpudWxsLFxuICAgICAgY29tbW9uRm9vZEluZGV4Om51bGwsXG4gICAgICByZWNlbnRSZXN1bHRTZWxlY3RJbmRleDppbmRleCxcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGRlbGV0ZVRleHRTZWFyY2hDYWNoZShldmVudDogYW55KXtcbiAgICB0ZXh0Q2FjaGUuY2xlYXJBbGwoKTtcbiAgICB0aGlzLmdldFJlY2VudExpc3QoKTtcbiAgfVxuICAvKipcbiAgICog5YWz6Zet5by556qXcG9wdXDmoYZcbiAgICovXG4gIHB1YmxpYyBvbkNsb3NlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgc2hvd1BvcHVwOiBmYWxzZSxzaG93Q2hvb3NlZExpc3RzOmZhbHNlfSk7XG4gIH1cbi8qKlxuICog5YiH5o2i5bey6YCJ6aOf54mp5YiX6KGo55qE5pi+56S65LiO6ZqQ6JePXG4gKi9cbiAgcHVibGljIHRvZ2dsZUNob29zZWRMaXN0cygpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd0Nob29zZWRMaXN0czohdGhpcy5kYXRhLnNob3dDaG9vc2VkTGlzdHN9KVxuICB9XG4gIC8qKlxuICAgKiDngrnlh7vmt7vliqDmjInpkq7vvIzlsIbpo5/nianmt7vliqDoh7Plt7LpgIlcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVBZGRGb29kKCl7XG4gICAgbGV0IHRleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleCA9IHRoaXMuZGF0YS50ZXh0U2VhcmNoUmVzdWx0U2VsZWN0SW5kZXg7XG4gICAgbGV0IHJlY2VudFJlc3VsdFNlbGVjdEluZGV4ID0gdGhpcy5kYXRhLnJlY2VudFJlc3VsdFNlbGVjdEluZGV4O1xuICAgIGxldCBjb21tb25Gb29kSW5kZXggPSB0aGlzLmRhdGEuY29tbW9uRm9vZEluZGV4O1xuICAgIGlmKHJlY2VudFJlc3VsdFNlbGVjdEluZGV4ICE9PSBudWxsICl7XG4gICAgICBsZXQgaXRlbTphbnkgPSB0aGlzLmRhdGEucmVjZW50TGlzdFtyZWNlbnRSZXN1bHRTZWxlY3RJbmRleF07XG4gICAgfWVsc2UgaWYodGV4dFNlYXJjaFJlc3VsdFNlbGVjdEluZGV4ICE9PSBudWxsKXtcbiAgICAgIGxldCBpdGVtOmFueSA9IHRoaXMuZGF0YS5yZXN1bHRMaXN0W3RleHRTZWFyY2hSZXN1bHRTZWxlY3RJbmRleF07XG4gICAgfWVsc2V7XG4gICAgICBsZXQgaXRlbTphbnkgPSB0aGlzLmRhdGEuY29tbW9uRm9vZExpc3RbY29tbW9uRm9vZEluZGV4XTtcbiAgICB9XG4gICAgY29uc3QgY2hvb3NlZFVuaXQgPSB0aGlzLmRhdGEubmFtZUFyckZvcldYTUxbdGhpcy5kYXRhLmNob29zZVVpbml0SW5kZXhdO1xuICAgIGNvbnN0IGZvb2RVbml0QW5kVW5pdEVuZXJneUl0ZW0gPSB0aGlzLmRhdGEuZm9vZFVuaXRBbmRVbml0RW5lcmd5W3RoaXMuZGF0YS5jaG9vc2VVaW5pdEluZGV4XTtcbiAgICBpdGVtID0ge1xuICAgICAgLi4uaXRlbSxcbiAgICAgIGNob29zZWRVbml0LFxuICAgICAgd2VpZ2h0TnVtYmVyOk51bWJlcih0aGlzLmRhdGEuZm9vZE51bVZhbHVlKSxcbiAgICAgIHVuaXRFbmVyZ3k6Zm9vZFVuaXRBbmRVbml0RW5lcmd5SXRlbS51bml0RW5lcmd5LFxuICAgICAgdW5pdF9pZDpmb29kVW5pdEFuZFVuaXRFbmVyZ3lJdGVtLnVuaXRfaWQsXG4gICAgICB1bml0V2VpZ2h0OmZvb2RVbml0QW5kVW5pdEVuZXJneUl0ZW0udW5pdFdlaWdodFxuICAgIH07XG4gICAgdGhpcy5kYXRhLmNob29zZWRMaXN0cy5wdXNoKGl0ZW0pO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IFxuICAgICAgY2hvb3NlZExpc3RzIDogdGhpcy5kYXRhLmNob29zZWRMaXN0cyxcbiAgICAgIHNob3dQb3B1cCA6IGZhbHNlXG4gICAgfSwoKT0+e1xuICAgICAgdGhpcy5zdW1FbmVyZ3koKTtcbiAgICAgIGlmKHJlY2VudFJlc3VsdFNlbGVjdEluZGV4ICE9PSBudWxsKXsgLy8g5Li65Y6G5Y+y5pCc57Si6YeN5paw5o6S5bqPXG4gICAgICAgIHRleHRDYWNoZS5zZXRWYWx1ZSh0aGlzLmRhdGEucmVjZW50TGlzdFtyZWNlbnRSZXN1bHRTZWxlY3RJbmRleF0pXG4gICAgICAgIHRoaXMuZ2V0UmVjZW50TGlzdCgpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSDorqHnrpfnlKjmiLfpo5/niankuIDlhbHmnInlpJrlsJHng63ph49cbiAgICovXG4gIHB1YmxpYyBzdW1FbmVyZ3koKXtcbiAgICBjb25zdCB0b3RhbEVuZXJneSA9IHRoaXMuZGF0YS5jaG9vc2VkTGlzdHMucmVkdWNlKChwcmUsbmV4dCk9PntcbiAgICAgIHJldHVybiBuZXh0LndlaWdodE51bWJlcipuZXh0LnVuaXRFbmVyZ3krcHJlXG4gICAgfSwwKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3RvdGFsRW5lcmd5Ok51bWJlcih0b3RhbEVuZXJneS50b0ZpeGVkKDEpKX0pXG4gIH1cblxuICAvKipcbiAgICog55So5oi36L6T5YWl6aOf54mp55qE5Lu95pWwXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlRm9vZE51bUlucHV0KGU6YW55KXtcbiAgICBjb25zdCB7dmFsdWV9ID0gZS5kZXRhaWw7XG4gICAgLy8gaWYodmFsdWU9PT0nMCcgfHwgdmFsdWU9PT0nMC4nKXtcbiAgICAgIHZhciBmb29kTnVtVmFsdWUgPSB2YWx1ZTtcbiAgICAvLyB9ZWxzZXtcbiAgICAvLyAgIHZhciBmb29kTnVtVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgIC8vIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Zvb2ROdW1WYWx1ZX0sKCk9PntcbiAgXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog5bGV56S6cGlja2Vy77yM6YCJ5oup6aOf54mp5Y2V5L2NXG4gICAqL1xuICBwdWJsaWMgc2hvd1BpY2tlcigpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BpY2tlcjp0cnVlLHNob3dQb3B1cDpmYWxzZX0pXG4gIH1cbiAgcHVibGljIG9uQ29uZmlybSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BpY2tlcjpmYWxzZSxzaG93UG9wdXA6dHJ1ZX0pXG4gIH1cbiAgcHVibGljIG9uQ2hhbmdlKGU6YW55KXtcbiAgICBsZXQgY2hvb3NlVWluaXRJbmRleDpudW1iZXIgPSBlLmRldGFpbC5pbmRleDtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZVVpbml0SW5kZXg6Y2hvb3NlVWluaXRJbmRleH0pXG4gIH1cbiAgLyoqXG4gICAqIOWIoOmZpOmAieS4reWIl+ihqOS4reeahOafkOS4gOmhuVxuICAgKi9cbiAgcHVibGljIGhhbmRsZURlbGV0ZUNob29zZWRJdGVtKGU6YW55KXtcbiAgICBsZXQgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbmRleDtcbiAgICB0aGlzLmRhdGEuY2hvb3NlZExpc3RzLnNwbGljZShpbmRleCwxKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZWRMaXN0czp0aGlzLmRhdGEuY2hvb3NlZExpc3RzfSwoKT0+e1xuICAgICAgdGhpcy5zdW1FbmVyZ3koKVxuICAgICAgaWYodGhpcy5kYXRhLmNob29zZWRMaXN0cy5sZW5ndGg9PT0wKXtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93Q2hvb3NlZExpc3RzOmZhbHNlfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDmibnph4/mt7vliqDpo5/nianmlbTlkIjlj4LmlbBcbiAgICovXG4gIHB1YmxpYyBoYW5kbGVDb25maXJtQnRuKCl7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiwgbWFzazogdHJ1ZSB9KTtcbiAgICBsZXQgZm9vZEluZm9MaXN0OmFueVtdID0gW107XG4gICAgdGhpcy5kYXRhLmNob29zZWRMaXN0cy5tYXAoKGl0ZW06YW55KSA9PiB7XG4gICAgICAvL+aWh+Wtl+aQnOe0ou+8jOS4jeWGjeimgXJlY29nbml0aW9uUmVzdWx0c++8jOWboOS4uuesrOS4gOmhueWSjOWklumdouaVsOaNruS4gOagt1xuICAgICAgLy8gbGV0IHJlc3VsdHMgPSBbeyBmb29kSWQ6IGl0ZW0uZm9vZElkLCBmb29kTmFtZTogaXRlbS5mb29kTmFtZSwgZm9vZFR5cGU6IGl0ZW0uZm9vZFR5cGUgfV07XG4gICAgICBsZXQgZm9vZCA9IHsgXG4gICAgICAgIGZvb2RJZDogaXRlbS5mb29kSWQsIFxuICAgICAgICBmb29kVHlwZTogaXRlbS5mb29kVHlwZSwgXG4gICAgICAgIGlucHV0VHlwZTogMiwgXG4gICAgICAgIGFtb3VudDppdGVtLndlaWdodE51bWJlcixcbiAgICAgICAgdW5pdElkOiBpdGVtLnVuaXRfaWQsXG4gICAgICAgIHVuaXRXZWlnaHQ6IGl0ZW0udW5pdFdlaWdodCxcbiAgICAgICAgdW5pdE5hbWU6aXRlbS5jaG9vc2VkVW5pdCxcbiAgICAgICAgLy8gcmVjb2duaXRpb25fcmVzdWx0czogcmVzdWx0cyxcbiAgICAgIH07XG4gICAgICBmb29kSW5mb0xpc3QucHVzaChmb29kKVxuICAgIH0pXG4gICAgbGV0IHJlcSA9IHsgbWVhbFR5cGU6IHRoaXMubWVhbFR5cGUsIG1lYWxEYXRlOiB0aGlzLm1lYWxEYXRlLCBmb29kSW5mb0xpc3R9O1xuICAgIGNvbnNvbGUubG9nKCfor7fmsYLlj4LmlbByZXEnLHJlcSk7XG4gICAgdGhpcy5jcmVhdGVNZWFsTG9nKHJlcSk7XG4gIH1cblxuICBwdWJsaWMgY3JlYXRlTWVhbExvZyhyZXEpe1xuICAgIHJlcXVlc3QuY3JlYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzPT57XG4gICAgICB3eC5oaWRlTG9hZGluZygpXG4gICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOifpo5/nianorrDlvZXmiJDlip8nfSlcbiAgICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgd3gucmVMYXVuY2goe3VybDogYC4vLi4vLi4vaG9tZVN1Yi9wYWdlcy9tZWFsQW5hbHlzaXMvaW5kZXg/bWVhbExvZ0lkPSR7cmVzLm1lYWxMb2dJZH0mbWVhbFR5cGU9JHt0aGlzLm1lYWxUeXBlfSZtZWFsRGF0ZT0ke3RoaXMubWVhbERhdGV9JnRpdGxlPSR7dGhpcy50aXRsZX1gfSk7XG4gICAgICB9LDE0NTApXG4gICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICB3eC5oaWRlTG9hZGluZygpXG4gICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOiAn5o+Q5Lqk6aOf54mp6K6w5b2V5aSx6LSlJyxpY29uOiAnbm9uZSd9KTtcbiAgICB9KVxuICB9XG4gIFxuXG5cblxuXG5cblxuICAvLyAvKipcbiAgLy8gICog5qC85byP5YyW5pWw5o2u5ZCO77yM5Y+R5Ye66K+35rGC77yM6I635b6XbWVhbF9pZFxuICAvLyAgKi9cbiAgLy8gcHVibGljIENyZWF0ZU9yVXBkYXRlTWVhbExvZyhyZXE6YW55KXtcbiAgLy8gICBsZXQgaW1hZ2VVcmwgPSBcImh0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL21pbmktYXBwLWltYWdlL2RlZmF1bHRJbWFnZS90ZXh0c2VhcmNoLWRlZmF1bHQtaW1hZ2UucG5nXCI7XG4gIC8vICAgd2ViQVBJLkNyZWF0ZU9yVXBkYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICB0aGlzLkNvbmZpcm1NZWFsTG9nKHJlc3AubWVhbF9pZClcbiAgLy8gICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTogJ+ivt+axguWksei0pScsaWNvbjogJ25vbmUnfSk7XG4gIC8vICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIC8vICAgfSk7XG4gIC8vIH1cbiAgLy8gLyoqXG4gIC8vICAqIOWPkeWHuuivt+axgu+8jOWIm+W7uuiusOW9lVxuICAvLyAgKi9cbiAgLy8gcHVibGljIENvbmZpcm1NZWFsTG9nKG1lYWxfaWQ6bnVtYmVyKXtcbiAgLy8gICBsZXQgcmVxID0geyBtZWFsX2lkOiBtZWFsX2lkIH07XG4gIC8vICAgd2ViQVBJLkNvbmZpcm1NZWFsTG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgLy8gICAgIHd4Lm5hdmlnYXRlVG8oeyB1cmw6IGAuLi8uLi9ob21lU3ViL3BhZ2VzL21lYWxBbmFseXNpcy9pbmRleD9tZWFsRGF0ZT0ke3RoaXMubWVhbERhdGV9Jm1lYWxUeXBlPSR7dGhpcy5tZWFsVHlwZX1gfSlcbiAgLy8gICB9KS5jYXRjaChlcnIgPT4ge1xuICAvLyAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTogJ+aPkOS6pOmjn+eJqeiusOW9leWksei0pScsaWNvbjogJ25vbmUnfSk7XG4gIC8vICAgfSk7XG4gIC8vIH1cbiAgLyoqXG4gICAqIOWOu+mjn+eJqeS8sOeul+mHjemHj+eahOmhtemdolxuICAgKi9cbiAgcHVibGljIGdvV2VpZ2h0UmVmZXJlbmNlUGFnZSgpe1xuICAgIHd4Lm5hdmlnYXRlVG8oe3VybDonLi8uLi8uLi9ob21lU3ViL3BhZ2VzL3dlaWdodFJlZmVyZW5jZS9pbmRleCd9KVxuICB9XG5cbn1cblxuUGFnZShuZXcgdGV4dFNlYXJjaCgpKVxuIl19