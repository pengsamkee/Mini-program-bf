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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBRXBCLDBEQUFtRDtBQUVuRDtJQUFBO1FBRVcsU0FBSSxHQUFFO1lBQ1QsSUFBSSxFQUFDLElBQUk7WUFDVCxNQUFNLEVBQUMsSUFBSTtZQUNYLElBQUksRUFBQyxJQUFJO1lBQ1QsUUFBUSxFQUFDLElBQUk7WUFDYixRQUFRLEVBQUMsSUFBSTtZQUNiLEtBQUssRUFBQyxFQUFFO1lBQ1IsT0FBTyxFQUFDLEVBQUU7WUFDVixVQUFVLEVBQUMsS0FBSztZQUNoQixPQUFPLEVBQUMsRUFBRTtZQUNWLFdBQVcsRUFBQyxJQUFJO1lBQ2hCLGVBQWUsRUFBQyxFQUFFO1lBR2xCLFdBQVcsRUFBQyxDQUFDO1lBQ2IsY0FBYyxFQUFDLElBQUk7WUFDbkIsS0FBSyxFQUFDLElBQUk7U0FDYixDQUFBO0lBdUpMLENBQUM7SUF0SlUsNEJBQU0sR0FBYixVQUFjLE9BQU87UUFBckIsaUJBYUM7UUFaTyxJQUFBLHFDQUFtRixFQUFsRixjQUFJLEVBQUMsa0JBQU0sRUFBQyxjQUFJLEVBQUMsc0JBQVEsRUFBQyxzQkFBUSxFQUFDLGdCQUFLLEVBQUMsZ0JBQXlDLENBQUM7UUFDdkYsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNsQixJQUFJLE1BQUE7WUFDSixNQUFNLFFBQUE7WUFDTixJQUFJLE1BQUE7WUFDSixRQUFRLFVBQUE7WUFDUixRQUFRLFVBQUE7WUFDUixLQUFLLE9BQUE7WUFDTCxLQUFLLE9BQUE7U0FDUixFQUFDO1lBQ0UsS0FBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBSU0sc0NBQWdCLEdBQXZCLFVBQXdCLENBQUs7UUFDekIsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FB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QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsibGV0IGFwcCA9ICBnZXRBcHAoKTtcblxuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi8uLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbmNsYXNzIENvbmZpcm1NZWFsIHtcblxuICAgIHB1YmxpYyBkYXRhPSB7XG4gICAgICAgIGltZ0g6bnVsbCxcbiAgICAgICAgaW1nS2V5Om51bGwsXG4gICAgICAgIGltZ1c6bnVsbCxcbiAgICAgICAgbWVhbERhdGU6bnVsbCxcbiAgICAgICAgbWVhbFR5cGU6bnVsbCxcbiAgICAgICAgdGFnZ3M6W10sXG4gICAgICAgIHVuaXRBcnI6W10sXG4gICAgICAgIHNob3dQaWNrZXI6ZmFsc2UsXG4gICAgICAgIGNvbHVtbnM6W10sXG4gICAgICAgIHBpY2tlckluZGV4Om51bGwsXG4gICAgICAgIGNob29zZVVuaXRJbmRleDonJyxcbiAgICAgICAgLy8gcGVyc29uczpbJ+aIkeiHquW3seeLrOiHquS4gOS6uicsJzLkurrnlKjppJAnLCcz5Lq655So6aSQJywnNOS6uueUqOmkkCcsJzXkurrnlKjppJAnLCc25Lq655So6aSQJ10sXG4gICAgICAgIC8vIGNob29zZVBlcnNvbk51bUluZGV4OjAsXG4gICAgICAgIHRvdGFsRW5lcmd5OjAsXG4gICAgICAgIGNvbHVtbnNGb3JXWG1sOm51bGwsXG4gICAgICAgIHRpdGxlOm51bGwsXG4gICAgfVxuICAgIHB1YmxpYyBvbkxvYWQob3B0aW9ucyl7XG4gICAgICAgIGxldCB7aW1nSCxpbWdLZXksaW1nVyxtZWFsRGF0ZSxtZWFsVHlwZSx0YWdncyx0aXRsZX0gPSBKU09OLnBhcnNlKG9wdGlvbnMuanNvbk1lYWxJbmZvKTtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGltZ0gsXG4gICAgICAgICAgICBpbWdLZXksXG4gICAgICAgICAgICBpbWdXLFxuICAgICAgICAgICAgbWVhbERhdGUsXG4gICAgICAgICAgICBtZWFsVHlwZSxcbiAgICAgICAgICAgIHRhZ2dzLFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgIH0sKCk9PntcbiAgICAgICAgICAgIHRoaXMuZ2V0Rm9vZFVuaXRPcHRpb25MaXN0KCk7XG4gICAgICAgIH0pXG4gICAgfVxuICAgICAvKipcbiAgICAgKiDlsZXnpLpwaWNrZXLvvIzpgInmi6npo5/nianljZXkvY1cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFuZGxlU2hvd1BpY2tlcihlOmFueSl7XG4gICAgICAgIGNvbnN0IHBpY2tlckluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucGlja2VySW5kZXg7XG4gICAgICAgIC8vIGlmKHBpY2tlckluZGV4PT09J3BlcnNvbicpeyAvL+WFseacieWHoOS4quS6uumjn+eUqFxuICAgICAgICAvLyAgICAgY29uc3QgY29sdW1ucyA9IFsxLDIsMyw0LDUsNl1cbiAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gdGhpcy5kYXRhLnVuaXRBcnJbcGlja2VySW5kZXhdLnVuaXRPcHRpb24ubWFwKGl0ZW09Pml0ZW0udW5pdE5hbWUpO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uc0ZvcldYbWwgPSB0aGlzLmRhdGEudW5pdEFycltwaWNrZXJJbmRleF0udW5pdE9wdGlvbi5tYXAoaXRlbT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnVuaXROYW1lPT09JzEwMOWFiyc/aXRlbS51bml0TmFtZTppdGVtLnVuaXROYW1lKyfvvIgnK2l0ZW0udW5pdFdlaWdodCsn5YWL77yJJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGNvbHVtbnNGb3JXWG1sLFxuICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgIHBpY2tlckluZGV4LFxuICAgICAgICAgICAgc2hvd1BpY2tlcjp0cnVlLFxuICAgICAgICAgICAgc2hvd1BvcHVwOmZhbHNlXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHB1YmxpYyBvbkNvbmZpcm0oKXtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93UGlja2VyOmZhbHNlLHNob3dQb3B1cDp0cnVlfSlcbiAgICB9XG4gICAgcHVibGljIG9uQ2hhbmdlKGU6YW55KXtcbiAgICAgICAgY29uc3QgY2hvb3NlVW5pdEluZGV4Om51bWJlciA9IGUuZGV0YWlsLmluZGV4O1xuICAgICAgICAvLyBpZih0aGlzLmRhdGEucGlja2VySW5kZXg9PT0ncGVyc29uJyl7XG4gICAgICAgIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZVBlcnNvbk51bUluZGV4IDogY2hvb3NlVW5pdEluZGV4fSlcbiAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmRhdGEudW5pdEFyclt0aGlzLmRhdGEucGlja2VySW5kZXhdLmNob29zZVVuaXRJbmRleCA9IGNob29zZVVuaXRJbmRleDtcbiAgICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dW5pdEFycjp0aGlzLmRhdGEudW5pdEFycn0sKCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsRW5lcmd5KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIC8vIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6K+35rGC5omA5pyJ5Y2V5L2N77yM5Lul5L6bcGlja2Vy5L2/55SoXG4gICAgICovXG4gICAgcHVibGljIGdldEZvb2RVbml0T3B0aW9uTGlzdCgpe1xuICAgICAgICBjb25zdCBmb29kVW5pdE9wdGlvbkxpc3QgPSB0aGlzLmRhdGEudGFnZ3MubWFwKGl0ZW09PntcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9vZElkOml0ZW0uZm9vZElkLFxuICAgICAgICAgICAgICAgIGZvb2RUeXBlOml0ZW0uZm9vZFR5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmVxdWVzdC5nZXRGb29kVW5pdE9wdGlvbkxpc3Qoe2Zvb2RVbml0T3B0aW9uTGlzdH0pLnRoZW4ocmVzPT57XG4gICAgICAgICAgICByZXMubWFwKGl0ZW09PntcbiAgICAgICAgICAgICAgICBpdGVtLmNob29zZVVuaXRJbmRleCA9IDBcbiAgICAgICAgICAgICAgICBpdGVtLmFtb3VudCA9IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdW5pdEFycjpyZXMgfSwoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxFbmVyZ3koKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOmVyci5tZXNzYWdlLGljb246J25vbmUnfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLyoqXG4gICAgICog55So5oi36L6T5YWl5YiG6YePXG4gICAgICovXG4gICAgcHVibGljIGhhbmRsZUFtb3VudElucHV0KGU6YW55KXtcbiAgICAgICAgY29uc3QgaW5wdXRJbmRleCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmlucHV0SW5kZXg7XG4gICAgICAgIGxldCB7IHZhbHVlIH0gPSBlLmRldGFpbDtcbiAgICAgICAgdGhpcy5kYXRhLnVuaXRBcnJbaW5wdXRJbmRleF0uYW1vdW50ID0gdmFsdWU7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dW5pdEFycjp0aGlzLmRhdGEudW5pdEFycn0sKCk9PntcbiAgICAgICAgICAgIHRoaXMudG90YWxFbmVyZ3koKVxuICAgICAgICB9KVxuICAgIH1cbiAgICBwdWJsaWMgaGFuZGxlQW1vdW50SW5wdXRGb2N1cyhlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZGF0YS51bml0QXJyW2lucHV0SW5kZXhdO1xuICAgICAgICBpdGVtLmZvY3VzQW1vdW50ID0gaXRlbS5hbW91bnQ7XG4gICAgICAgIGl0ZW0uYW1vdW50ID0gMDtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt1bml0QXJyOnRoaXMuZGF0YS51bml0QXJyfSlcbiAgICB9XG4gICAgcHVibGljIGhhbmRsZUFtb3VudElucHV0Qmx1cihlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZGF0YS51bml0QXJyW2lucHV0SW5kZXhdO1xuICAgICAgICBpZihpdGVtLmFtb3VudD09MCl7XG4gICAgICAgICAgICBpdGVtLmFtb3VudCA9IGl0ZW0uZm9jdXNBbW91bnQ7XG4gICAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3VuaXRBcnI6dGhpcy5kYXRhLnVuaXRBcnJ9KVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiuoeeul+eDremHj+aAu+WAvFxuICAgICAqL1xuICAgIHB1YmxpYyB0b3RhbEVuZXJneSgpe1xuICAgICAgICBsZXQgdW5pdEFyciA9IHRoaXMuZGF0YS51bml0QXJyXG4gICAgICAgIGxldCB0b3RhbEVuZXJneSA9IHVuaXRBcnIucmVkdWNlKChwcmUsbmV4dCk9PntcbiAgICAgICAgICAgIHJldHVybiBuZXh0LmFtb3VudCAqIG5leHQudW5pdE9wdGlvbltuZXh0LmNob29zZVVuaXRJbmRleF0uZW5lcmd5K3ByZVxuICAgICAgICB9LDApO1xuICAgICAgICB0b3RhbEVuZXJneSA9IE1hdGgucm91bmQodG90YWxFbmVyZ3kpO1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe3RvdGFsRW5lcmd5OnRvdGFsRW5lcmd5fSlcbiAgICB9XG4gICAgLyoqXG4gICAgICog6Lez6L2s5Yiw5YiG6YeP5Lyw566X6aG16Z2iXG4gICAgICovXG4gICAgcHVibGljIGhhbmRsZUdvV2VpZ2h0UmVmZXJlbmNlUGFnZSgpe1xuICAgICAgICB3eC5uYXZpZ2F0ZVRvKHsgdXJsOiAnLi8uLi93ZWlnaHRSZWZlcmVuY2UvaW5kZXgnIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWPkeWHumFwaeivt+axgu+8jOehruWumueUn+aIkG1lYWxMb2dcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlTWVhbExvZygpe1xuICAgICAgICBjb25zdCB7bWVhbERhdGUsbWVhbFR5cGUsaW1nS2V5LGltZ1csaW1nSCx0YWdncyx0aXRsZX0gPSB0aGlzLmRhdGE7XG4gICAgICAgIHRhZ2dzLm1hcCgoaXRlbSxpbmRleCk9PntcbiAgICAgICAgICAgIGNvbnN0IGNob29zZVVuaXRJdGVtID0gdGhpcy5kYXRhLnVuaXRBcnJbaW5kZXhdO1xuICAgICAgICAgICAgaXRlbS5pbnB1dFR5cGUgPSAxO1xuICAgICAgICAgICAgaXRlbS5hbW91bnQgPSBjaG9vc2VVbml0SXRlbS5hbW91bnQ7XG4gICAgICAgICAgICBpdGVtLnVuaXRJZCA9IGNob29zZVVuaXRJdGVtLnVuaXRPcHRpb25bY2hvb3NlVW5pdEl0ZW0uY2hvb3NlVW5pdEluZGV4XS51bml0SWQ7XG4gICAgICAgICAgICBpdGVtLnVuaXRXZWlnaHQgPSBjaG9vc2VVbml0SXRlbS51bml0T3B0aW9uW2Nob29zZVVuaXRJdGVtLmNob29zZVVuaXRJbmRleF0udW5pdFdlaWdodDtcbiAgICAgICAgICAgIGl0ZW0udW5pdE5hbWUgPSBjaG9vc2VVbml0SXRlbS51bml0T3B0aW9uW2Nob29zZVVuaXRJdGVtLmNob29zZVVuaXRJbmRleF0udW5pdE5hbWU7XG4gICAgICAgICAgICBpdGVtLnJlY29nbml0aW9uUmVzdWx0cyA9IFsuLi5pdGVtLnJlc3VsdExpc3RdO1xuICAgICAgICAgICAgZGVsZXRlIGl0ZW0ucmVzdWx0TGlzdDtcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtLnNlbGVjdGVkUG9zO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHJlcSA9IHtcbiAgICAgICAgICAgIG1lYWxEYXRlLFxuICAgICAgICAgICAgbWVhbFR5cGUsXG4gICAgICAgICAgICBpbWdLZXksXG4gICAgICAgICAgICBpbWdXLFxuICAgICAgICAgICAgaW1nSCxcbiAgICAgICAgICAgIGZvb2RJbmZvTGlzdDp0YWdnc1xuICAgICAgICB9XG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgIHRpdGxlOiAn5Yqg6L295LitLi4uJyB9KTtcbiAgICAgICAgcmVxdWVzdC5jcmVhdGVNZWFsTG9nKHJlcSkudGhlbihyZXM9PntcbiAgICAgICAgIFxuICAgICAgICAgICAgd3guc2hvd1RvYXN0KHt0aXRsZTon6aOf54mp6K6w5b2V5oiQ5YqfJ30pXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57IFxuICAgICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHt1cmw6IGAuLy4uL21lYWxBbmFseXNpcy9pbmRleD9tZWFsVHlwZT0ke21lYWxUeXBlfSZtZWFsRGF0ZT0ke21lYWxEYXRlfSZtZWFsTG9nSWQ9JHtyZXMubWVhbExvZ0lkfSZ0aXRsZT0ke3RpdGxlfWB9KTtcbiAgICAgICAgICAgIH0sMTQ1MClcbiAgICAgICAgfSkuY2F0Y2goZXJyPT57XG4gICAgICAgICAgICB3eC5zaG93VG9hc3Qoe3RpdGxlOmVyci5tZXNzYWdlfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbn1cblxuUGFnZShuZXcgQ29uZmlybU1lYWwoKSk7Il19