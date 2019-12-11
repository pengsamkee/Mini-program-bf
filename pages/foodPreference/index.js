"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var foodPreference = (function () {
    function foodPreference() {
        this.data = {
            food_preference: [],
        };
    }
    foodPreference.prototype.onLoad = function () {
        var that = this;
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        var req = {};
        webAPI.RetrieveFoodPreference(req).then(function (resp) {
            console.log(resp);
            that.setData({
                food_preference: resp.food_preferences,
            });
        }).catch(function (err) { return console.log(err); });
    };
    foodPreference.prototype.onShow = function () {
    };
    foodPreference.prototype.checkboxChange = function (event) {
        var _a;
        var indexList = event.detail.value;
        for (var index in this.data.food_preference) {
            var preferenceOperation = 'food_preference[' + index + '].is_selected';
            var flag = indexList.includes(index.toString());
            this.setData((_a = {},
                _a[preferenceOperation] = flag,
                _a));
        }
        wx.reportAnalytics('food_preference_checkbox_change', {});
    };
    foodPreference.prototype.confirmFoodPreference = function () {
        webAPI.UpdateFoodPreference(this.generateFoodPreferenceReqBody()).then(function (resp) {
            console.log("update food preference succeed ");
            wx.navigateBack({ delta: 1 });
        }).catch(function (err) { return console.log(err); });
    };
    foodPreference.prototype.generateFoodPreferenceReqBody = function () {
        var tempIds = [];
        for (var i in this.data.food_preference) {
            if (this.data.food_preference[i].is_selected) {
                tempIds.push(this.data.food_preference[i].food_preference_id);
            }
        }
        var reqBody = {
            food_preference_ids: tempIds,
        };
        return reqBody;
    };
    return foodPreference;
}());
Page(new foodPreference());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFtRDtBQUVuRCxpREFBa0Q7QUFFbEQ7SUFBQTtRQUVTLFNBQUksR0FBRztZQUNaLGVBQWUsRUFBRSxFQUFFO1NBQ3BCLENBQUE7SUFtREgsQ0FBQztJQWpEUSwrQkFBTSxHQUFiO1FBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pCLElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO2FBQ3ZDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sK0JBQU0sR0FBYjtJQUVBLENBQUM7SUFFTSx1Q0FBYyxHQUFyQixVQUFzQixLQUFTOztRQUM3QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUVsQyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3hDLElBQUksbUJBQW1CLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxHQUFHLGVBQWUsQ0FBQztZQUN2RSxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLElBQVksQ0FBQyxPQUFPO2dCQUNuQixHQUFDLG1CQUFtQixJQUFHLElBQUk7b0JBQzNCLENBQUE7U0FDTDtRQUVELEVBQUUsQ0FBQyxlQUFlLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLDhDQUFxQixHQUE1QjtRQUNFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLHNEQUE2QixHQUFwQztRQUNFLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3ZDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFDO2dCQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDL0Q7U0FDRjtRQUNELElBQUksT0FBTyxHQUFHO1lBQ1osbUJBQW1CLEVBQUUsT0FBTztTQUM3QixDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUNILHFCQUFDO0FBQUQsQ0FBQyxBQXZERCxJQXVEQztBQUVELElBQUksQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0IHsgVXBkYXRlRm9vZFByZWZlcmVuY2VSZXEgfSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzJ1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcblxuY2xhc3MgZm9vZFByZWZlcmVuY2Uge1xuXG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIGZvb2RfcHJlZmVyZW5jZTogW10sXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCk6IHZvaWQge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgdmFyIHJlcSA9IHt9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZUZvb2RQcmVmZXJlbmNlKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgZm9vZF9wcmVmZXJlbmNlOiByZXNwLmZvb2RfcHJlZmVyZW5jZXMsXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKTogdm9pZCB7XG5cbiAgfVxuXG4gIHB1YmxpYyBjaGVja2JveENoYW5nZShldmVudDphbnkpOiB2b2lkIHtcbiAgICBsZXQgaW5kZXhMaXN0ID0gZXZlbnQuZGV0YWlsLnZhbHVlXG5cbiAgICBmb3IgKGxldCBpbmRleCBpbiB0aGlzLmRhdGEuZm9vZF9wcmVmZXJlbmNlKXtcbiAgICAgICAgbGV0IHByZWZlcmVuY2VPcGVyYXRpb24gPSAnZm9vZF9wcmVmZXJlbmNlWycgKyBpbmRleCArICddLmlzX3NlbGVjdGVkJztcbiAgICAgICAgbGV0IGZsYWcgPSBpbmRleExpc3QuaW5jbHVkZXMoaW5kZXgudG9TdHJpbmcoKSk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgW3ByZWZlcmVuY2VPcGVyYXRpb25dOiBmbGFnXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8vcmVwb3J0IGFuYWx5dGljc1xuICAgIHd4LnJlcG9ydEFuYWx5dGljcygnZm9vZF9wcmVmZXJlbmNlX2NoZWNrYm94X2NoYW5nZScsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBjb25maXJtRm9vZFByZWZlcmVuY2UoKTogdm9pZCB7XG4gICAgd2ViQVBJLlVwZGF0ZUZvb2RQcmVmZXJlbmNlKHRoaXMuZ2VuZXJhdGVGb29kUHJlZmVyZW5jZVJlcUJvZHkoKSkudGhlbihyZXNwID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlIGZvb2QgcHJlZmVyZW5jZSBzdWNjZWVkIFwiKTtcbiAgICAgIHd4Lm5hdmlnYXRlQmFjayh7IGRlbHRhOiAxIH0pXG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlRm9vZFByZWZlcmVuY2VSZXFCb2R5KCk6IFVwZGF0ZUZvb2RQcmVmZXJlbmNlUmVxIHtcbiAgICB2YXIgdGVtcElkcyA9IFtdO1xuICAgIGZvciAobGV0IGkgaW4gdGhpcy5kYXRhLmZvb2RfcHJlZmVyZW5jZSkge1xuICAgICAgaWYgKHRoaXMuZGF0YS5mb29kX3ByZWZlcmVuY2VbaV0uaXNfc2VsZWN0ZWQpe1xuICAgICAgICB0ZW1wSWRzLnB1c2godGhpcy5kYXRhLmZvb2RfcHJlZmVyZW5jZVtpXS5mb29kX3ByZWZlcmVuY2VfaWQpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVxQm9keSA9IHtcbiAgICAgIGZvb2RfcHJlZmVyZW5jZV9pZHM6IHRlbXBJZHMsXG4gICAgfTtcbiAgICByZXR1cm4gcmVxQm9keTtcbiAgfVxufVxuXG5QYWdlKG5ldyBmb29kUHJlZmVyZW5jZSgpKSJdfQ==