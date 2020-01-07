"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var interface_1 = require("./../../../api/app/interface");
var ConfirmMeal = (function () {
    function ConfirmMeal() {
        this.data = {
            imgH: null,
            imgKey: null,
            imgW: null,
            mealDate: null,
            mealType: null,
            taggs: [],
            unitArr: [],
            showPicker: false,
            columns: [],
            pickerIndex: null,
            chooseUnitIndex: '',
            totalEnergy: 0,
            columnsForWXml: null,
            title: null,
        };
    }
    ConfirmMeal.prototype.onLoad = function (options) {
        var _this = this;
        var _a = JSON.parse(options.jsonMealInfo), imgH = _a.imgH, imgKey = _a.imgKey, imgW = _a.imgW, mealDate = _a.mealDate, mealType = _a.mealType, taggs = _a.taggs, title = _a.title;
        this.setData({
            imgH: imgH,
            imgKey: imgKey,
            imgW: imgW,
            mealDate: mealDate,
            mealType: mealType,
            taggs: taggs,
            title: title,
        }, function () {
            _this.getFoodUnitOptionList();
        });
    };
    ConfirmMeal.prototype.handleShowPicker = function (e) {
        var pickerIndex = e.currentTarget.dataset.pickerIndex;
        var columns = this.data.unitArr[pickerIndex].unitOption.map(function (item) { return item.unitName; });
        var columnsForWXml = this.data.unitArr[pickerIndex].unitOption.map(function (item) {
            return item.unitName === '100克' ? item.unitName : item.unitName + '（' + item.unitWeight + '克）';
        });
        this.setData({
            columnsForWXml: columnsForWXml,
            columns: columns,
            pickerIndex: pickerIndex,
            showPicker: true,
            showPopup: false
        });
    };
    ConfirmMeal.prototype.onConfirm = function () {
        this.setData({ showPicker: false, showPopup: true });
    };
    ConfirmMeal.prototype.onChange = function (e) {
        var _this = this;
        var chooseUnitIndex = e.detail.index;
        this.data.unitArr[this.data.pickerIndex].chooseUnitIndex = chooseUnitIndex;
        this.setData({ unitArr: this.data.unitArr }, function () {
            _this.totalEnergy();
        });
    };
    ConfirmMeal.prototype.getFoodUnitOptionList = function () {
        var _this = this;
        var foodUnitOptionList = this.data.taggs.map(function (item) {
            return {
                foodId: item.foodId,
                foodType: item.foodType
            };
        });
        interface_1.default.getFoodUnitOptionList({ foodUnitOptionList: foodUnitOptionList }).then(function (res) {
            res.map(function (item) {
                item.chooseUnitIndex = 0;
                item.amount = 1;
            });
            _this.setData({ unitArr: res }, function () {
                _this.totalEnergy();
            });
        }).catch(function (err) {
            wx.showToast({ title: err.message, icon: 'none' });
        });
    };
    ConfirmMeal.prototype.handleAmountInput = function (e) {
        var _this = this;
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var value = e.detail.value;
        this.data.unitArr[inputIndex].amount = value;
        this.setData({ unitArr: this.data.unitArr }, function () {
            _this.totalEnergy();
        });
    };
    ConfirmMeal.prototype.handleAmountInputFocus = function (e) {
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var item = this.data.unitArr[inputIndex];
        item.focusAmount = item.amount;
        item.amount = 0;
        this.setData({ unitArr: this.data.unitArr });
    };
    ConfirmMeal.prototype.handleAmountInputBlur = function (e) {
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var item = this.data.unitArr[inputIndex];
        if (item.amount == 0) {
            item.amount = item.focusAmount;
            this.setData({ unitArr: this.data.unitArr });
        }
    };
    ConfirmMeal.prototype.totalEnergy = function () {
        var unitArr = this.data.unitArr;
        var totalEnergy = unitArr.reduce(function (pre, next) {
            return next.amount * next.unitOption[next.chooseUnitIndex].energy + pre;
        }, 0);
        totalEnergy = Math.round(totalEnergy);
        this.setData({ totalEnergy: totalEnergy });
    };
    ConfirmMeal.prototype.handleGoWeightReferencePage = function () {
        wx.navigateTo({ url: './../weightReference/index' });
    };
    ConfirmMeal.prototype.createMealLog = function () {
        var _this = this;
        var _a = this.data, mealDate = _a.mealDate, mealType = _a.mealType, imgKey = _a.imgKey, imgW = _a.imgW, imgH = _a.imgH, taggs = _a.taggs, title = _a.title;
        taggs.map(function (item, index) {
            var chooseUnitItem = _this.data.unitArr[index];
            item.inputType = 1;
            item.amount = chooseUnitItem.amount;
            item.unitId = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitId;
            item.unitWeight = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitWeight;
            item.unitName = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitName;
            item.recognitionResults = item.resultList.slice();
            delete item.resultList;
            delete item.selectedPos;
        });
        var req = {
            mealDate: mealDate,
            mealType: mealType,
            imgKey: imgKey,
            imgW: imgW,
            imgH: imgH,
            foodInfoList: taggs
        };
        wx.showLoading({ title: '加载中...' });
        interface_1.default.createMealLog(req).then(function (res) {
            wx.hideLoading();
            wx.showToast({ title: '食物记录成功' });
            setTimeout(function () {
                wx.reLaunch({ url: "./../mealAnalysis/index?mealType=" + mealType + "&mealDate=" + mealDate + "&mealLogId=" + res.mealLogId + "&title=" + title });
            }, 1450);
        }).catch(function (err) {
            wx.showToast({ title: err.message });
        });
    };
    return ConfirmMeal;
}());
Page(new ConfirmMeal());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBRXBCLDBEQUFtRDtBQUVuRDtJQUFBO1FBRVcsU0FBSSxHQUFFO1lBQ1QsSUFBSSxFQUFDLElBQUk7WUFDVCxNQUFNLEVBQUMsSUFBSTtZQUNYLElBQUksRUFBQyxJQUFJO1lBQ1QsUUFBUSxFQUFDLElBQUk7WUFDYixRQUFRLEVBQUMsSUFBSTtZQUNiLEtBQUssRUFBQyxFQUFFO1lBQ1IsT0FBTyxFQUFDLEVBQUU7WUFDVixVQUFVLEVBQUMsS0FBSztZQUNoQixPQUFPLEVBQUMsRUFBRTtZQUNWLFdBQVcsRUFBQyxJQUFJO1lBQ2hCLGVBQWUsRUFBQyxFQUFFO1lBR2xCLFdBQVcsRUFBQyxDQUFDO1lBQ2IsY0FBYyxFQUFDLElBQUk7WUFDbkIsS0FBSyxFQUFDLElBQUk7U0FDYixDQUFBO0lBdUpMLENBQUM7SUF0SlUsNEJBQU0sR0FBYixVQUFjLE9BQU87UUFBckIsaUJBYUM7UUFaTyxJQUFBLHFDQUFtRixFQUFsRixjQUFJLEVBQUMsa0JBQU0sRUFBQyxjQUFJLEVBQUMsc0JBQVEsRUFBQyxzQkFBUSxFQUFDLGdCQUFLLEVBQUMsZ0JBQXlDLENBQUM7UUFDdkYsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNsQixJQUFJLE1BQUE7WUFDSixNQUFNLFFBQUE7WUFDTixJQUFJLE1BQUE7WUFDSixRQUFRLFVBQUE7WUFDUixRQUFRLFVBQUE7WUFDUixLQUFLLE9BQUE7WUFDTCxLQUFLLE9BQUE7U0FDUixFQUFDO1lBQ0UsS0FBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBSU0sc0NBQWdCLEdBQXZCLFVBQXdCLENBQUs7UUFDekIsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FB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RUQsSUFBSSxDQUFDLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImxldCBhcHAgPSAgZ2V0QXBwKCk7XG5cbmltcG9ydCByZXF1ZXN0IGZyb20gJy4vLi4vLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnO1xuXG5jbGFzcyBDb25maXJtTWVhbCB7XG5cbiAgICBwdWJsaWMgZGF0YT0ge1xuICAgICAgICBpbWdIOm51bGwsXG4gICAgICAgIGltZ0tleTpudWxsLFxuICAgICAgICBpbWdXOm51bGwsXG4gICAgICAgIG1lYWxEYXRlOm51bGwsXG4gICAgICAgIG1lYWxUeXBlOm51bGwsXG4gICAgICAgIHRhZ2dzOltdLFxuICAgICAgICB1bml0QXJyOltdLFxuICAgICAgICBzaG93UGlja2VyOmZhbHNlLFxuICAgICAgICBjb2x1bW5zOltdLFxuICAgICAgICBwaWNrZXJJbmRleDpudWxsLFxuICAgICAgICBjaG9vc2VVbml0SW5kZXg6JycsXG4gICAgICAgIC8vIHBlcnNvbnM6WyfmiJHoh6rlt7Hni6zoh6rkuIDkuronLCcy5Lq655So6aSQJywnM+S6uueUqOmkkCcsJzTkurrnlKjppJAnLCc15Lq655So6aSQJywnNuS6uueUqOmkkCddLFxuICAgICAgICAvLyBjaG9vc2VQZXJzb25OdW1JbmRleDowLFxuICAgICAgICB0b3RhbEVuZXJneTowLFxuICAgICAgICBjb2x1bW5zRm9yV1htbDpudWxsLFxuICAgICAgICB0aXRsZTpudWxsLFxuICAgIH1cbiAgICBwdWJsaWMgb25Mb2FkKG9wdGlvbnMpe1xuICAgICAgICBsZXQge2ltZ0gsaW1nS2V5LGltZ1csbWVhbERhdGUsbWVhbFR5cGUsdGFnZ3MsdGl0bGV9ID0gSlNPTi5wYXJzZShvcHRpb25zLmpzb25NZWFsSW5mbyk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBpbWdILFxuICAgICAgICAgICAgaW1nS2V5LFxuICAgICAgICAgICAgaW1nVyxcbiAgICAgICAgICAgIG1lYWxEYXRlLFxuICAgICAgICAgICAgbWVhbFR5cGUsXG4gICAgICAgICAgICB0YWdncyxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICB9LCgpPT57XG4gICAgICAgICAgICB0aGlzLmdldEZvb2RVbml0T3B0aW9uTGlzdCgpO1xuICAgICAgICB9KVxuICAgIH1cbiAgICAgLyoqXG4gICAgICog5bGV56S6cGlja2Vy77yM6YCJ5oup6aOf54mp5Y2V5L2NXG4gICAgICovXG4gICAgcHVibGljIGhhbmRsZVNob3dQaWNrZXIoZTphbnkpe1xuICAgICAgICBjb25zdCBwaWNrZXJJbmRleCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnBpY2tlckluZGV4O1xuICAgICAgICAvLyBpZihwaWNrZXJJbmRleD09PSdwZXJzb24nKXsgLy/lhbHmnInlh6DkuKrkurrpo5/nlKhcbiAgICAgICAgLy8gICAgIGNvbnN0IGNvbHVtbnMgPSBbMSwyLDMsNCw1LDZdXG4gICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IHRoaXMuZGF0YS51bml0QXJyW3BpY2tlckluZGV4XS51bml0T3B0aW9uLm1hcChpdGVtPT5pdGVtLnVuaXROYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbnNGb3JXWG1sID0gdGhpcy5kYXRhLnVuaXRBcnJbcGlja2VySW5kZXhdLnVuaXRPcHRpb24ubWFwKGl0ZW09PntcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS51bml0TmFtZT09PScxMDDlhYsnP2l0ZW0udW5pdE5hbWU6aXRlbS51bml0TmFtZSsn77yIJytpdGVtLnVuaXRXZWlnaHQrJ+WFi++8iSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBjb2x1bW5zRm9yV1htbCxcbiAgICAgICAgICAgIGNvbHVtbnMsXG4gICAgICAgICAgICBwaWNrZXJJbmRleCxcbiAgICAgICAgICAgIHNob3dQaWNrZXI6dHJ1ZSxcbiAgICAgICAgICAgIHNob3dQb3B1cDpmYWxzZVxuICAgICAgICB9KVxuICAgIH1cbiAgICBwdWJsaWMgb25Db25maXJtKCl7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7c2hvd1BpY2tlcjpmYWxzZSxzaG93UG9wdXA6dHJ1ZX0pXG4gICAgfVxuICAgIHB1YmxpYyBvbkNoYW5nZShlOmFueSl7XG4gICAgICAgIGNvbnN0IGNob29zZVVuaXRJbmRleDpudW1iZXIgPSBlLmRldGFpbC5pbmRleDtcbiAgICAgICAgLy8gaWYodGhpcy5kYXRhLnBpY2tlckluZGV4PT09J3BlcnNvbicpe1xuICAgICAgICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtjaG9vc2VQZXJzb25OdW1JbmRleCA6IGNob29zZVVuaXRJbmRleH0pXG4gICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5kYXRhLnVuaXRBcnJbdGhpcy5kYXRhLnBpY2tlckluZGV4XS5jaG9vc2VVbml0SW5kZXggPSBjaG9vc2VVbml0SW5kZXg7XG4gICAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3VuaXRBcnI6dGhpcy5kYXRhLnVuaXRBcnJ9LCgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbEVuZXJneSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAvLyB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOivt+axguaJgOacieWNleS9je+8jOS7peS+m3BpY2tlcuS9v+eUqFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGb29kVW5pdE9wdGlvbkxpc3QoKXtcbiAgICAgICAgY29uc3QgZm9vZFVuaXRPcHRpb25MaXN0ID0gdGhpcy5kYXRhLnRhZ2dzLm1hcChpdGVtPT57XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZvb2RJZDppdGVtLmZvb2RJZCxcbiAgICAgICAgICAgICAgICBmb29kVHlwZTppdGVtLmZvb2RUeXBlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJlcXVlc3QuZ2V0Rm9vZFVuaXRPcHRpb25MaXN0KHtmb29kVW5pdE9wdGlvbkxpc3R9KS50aGVuKHJlcz0+e1xuICAgICAgICAgICAgcmVzLm1hcChpdGVtPT57XG4gICAgICAgICAgICAgICAgaXRlbS5jaG9vc2VVbml0SW5kZXggPSAwXG4gICAgICAgICAgICAgICAgaXRlbS5hbW91bnQgPSAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHVuaXRBcnI6cmVzIH0sKCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsRW5lcmd5KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTplcnIubWVzc2FnZSxpY29uOidub25lJ30pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOeUqOaIt+i+k+WFpeWIhumHj1xuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVBbW91bnRJbnB1dChlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgeyB2YWx1ZSB9ID0gZS5kZXRhaWw7XG4gICAgICAgIHRoaXMuZGF0YS51bml0QXJyW2lucHV0SW5kZXhdLmFtb3VudCA9IHZhbHVlO1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3VuaXRBcnI6dGhpcy5kYXRhLnVuaXRBcnJ9LCgpPT57XG4gICAgICAgICAgICB0aGlzLnRvdGFsRW5lcmd5KClcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcHVibGljIGhhbmRsZUFtb3VudElucHV0Rm9jdXMoZTphbnkpe1xuICAgICAgICBjb25zdCBpbnB1dEluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5wdXRJbmRleDtcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmRhdGEudW5pdEFycltpbnB1dEluZGV4XTtcbiAgICAgICAgaXRlbS5mb2N1c0Ftb3VudCA9IGl0ZW0uYW1vdW50O1xuICAgICAgICBpdGVtLmFtb3VudCA9IDA7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dW5pdEFycjp0aGlzLmRhdGEudW5pdEFycn0pXG4gICAgfVxuICAgIHB1YmxpYyBoYW5kbGVBbW91bnRJbnB1dEJsdXIoZTphbnkpe1xuICAgICAgICBjb25zdCBpbnB1dEluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5wdXRJbmRleDtcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmRhdGEudW5pdEFycltpbnB1dEluZGV4XTtcbiAgICAgICAgaWYoaXRlbS5hbW91bnQ9PTApe1xuICAgICAgICAgICAgaXRlbS5hbW91bnQgPSBpdGVtLmZvY3VzQW1vdW50O1xuICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt1bml0QXJyOnRoaXMuZGF0YS51bml0QXJyfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDorqHnrpfng63ph4/mgLvlgLxcbiAgICAgKi9cbiAgICBwdWJsaWMgdG90YWxFbmVyZ3koKXtcbiAgICAgICAgbGV0IHVuaXRBcnIgPSB0aGlzLmRhdGEudW5pdEFyclxuICAgICAgICBsZXQgdG90YWxFbmVyZ3kgPSB1bml0QXJyLnJlZHVjZSgocHJlLG5leHQpPT57XG4gICAgICAgICAgICByZXR1cm4gbmV4dC5hbW91bnQgKiBuZXh0LnVuaXRPcHRpb25bbmV4dC5jaG9vc2VVbml0SW5kZXhdLmVuZXJneStwcmVcbiAgICAgICAgfSwwKTtcbiAgICAgICAgdG90YWxFbmVyZ3kgPSBNYXRoLnJvdW5kKHRvdGFsRW5lcmd5KTtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt0b3RhbEVuZXJneTp0b3RhbEVuZXJneX0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOi3s+i9rOWIsOWIhumHj+S8sOeul+mhtemdolxuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVHb1dlaWdodFJlZmVyZW5jZVBhZ2UoKXtcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7IHVybDogJy4vLi4vd2VpZ2h0UmVmZXJlbmNlL2luZGV4JyB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDlj5Hlh7phcGnor7fmsYLvvIznoa7lrprnlJ/miJBtZWFsTG9nXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZU1lYWxMb2coKXtcbiAgICAgICAgY29uc3Qge21lYWxEYXRlLG1lYWxUeXBlLGltZ0tleSxpbWdXLGltZ0gsdGFnZ3MsdGl0bGV9ID0gdGhpcy5kYXRhO1xuICAgICAgICB0YWdncy5tYXAoKGl0ZW0saW5kZXgpPT57XG4gICAgICAgICAgICBjb25zdCBjaG9vc2VVbml0SXRlbSA9IHRoaXMuZGF0YS51bml0QXJyW2luZGV4XTtcbiAgICAgICAgICAgIGl0ZW0uaW5wdXRUeXBlID0gMTtcbiAgICAgICAgICAgIGl0ZW0uYW1vdW50ID0gY2hvb3NlVW5pdEl0ZW0uYW1vdW50O1xuICAgICAgICAgICAgaXRlbS51bml0SWQgPSBjaG9vc2VVbml0SXRlbS51bml0T3B0aW9uW2Nob29zZVVuaXRJdGVtLmNob29zZVVuaXRJbmRleF0udW5pdElkO1xuICAgICAgICAgICAgaXRlbS51bml0V2VpZ2h0ID0gY2hvb3NlVW5pdEl0ZW0udW5pdE9wdGlvbltjaG9vc2VVbml0SXRlbS5jaG9vc2VVbml0SW5kZXhdLnVuaXRXZWlnaHQ7XG4gICAgICAgICAgICBpdGVtLnVuaXROYW1lID0gY2hvb3NlVW5pdEl0ZW0udW5pdE9wdGlvbltjaG9vc2VVbml0SXRlbS5jaG9vc2VVbml0SW5kZXhdLnVuaXROYW1lO1xuICAgICAgICAgICAgaXRlbS5yZWNvZ25pdGlvblJlc3VsdHMgPSBbLi4uaXRlbS5yZXN1bHRMaXN0XTtcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtLnJlc3VsdExpc3Q7XG4gICAgICAgICAgICBkZWxldGUgaXRlbS5zZWxlY3RlZFBvcztcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByZXEgPSB7XG4gICAgICAgICAgICBtZWFsRGF0ZSxcbiAgICAgICAgICAgIG1lYWxUeXBlLFxuICAgICAgICAgICAgaW1nS2V5LFxuICAgICAgICAgICAgaW1nVyxcbiAgICAgICAgICAgIGltZ0gsXG4gICAgICAgICAgICBmb29kSW5mb0xpc3Q6dGFnZ3NcbiAgICAgICAgfVxuICAgICAgICB3eC5zaG93TG9hZGluZyh7ICB0aXRsZTogJ+WKoOi9veS4rS4uLicgfSk7XG4gICAgICAgIHJlcXVlc3QuY3JlYXRlTWVhbExvZyhyZXEpLnRoZW4ocmVzPT57XG4gICAgICAgICAgICB3eC5oaWRlTG9hZGluZygpO1xuICAgICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon6aOf54mp6K6w5b2V5oiQ5YqfJ30pXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgd3gucmVMYXVuY2goe3VybDogYC4vLi4vbWVhbEFuYWx5c2lzL2luZGV4P21lYWxUeXBlPSR7bWVhbFR5cGV9Jm1lYWxEYXRlPSR7bWVhbERhdGV9Jm1lYWxMb2dJZD0ke3Jlcy5tZWFsTG9nSWR9JnRpdGxlPSR7dGl0bGV9YH0pO1xuICAgICAgICAgICAgfSwxNDUwKVxuICAgICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6ZXJyLm1lc3NhZ2V9KVxuICAgICAgICB9KVxuICAgIH1cblxufVxuXG5QYWdlKG5ldyBDb25maXJtTWVhbCgpKTsiXX0=