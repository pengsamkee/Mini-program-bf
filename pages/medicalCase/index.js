"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var medicalCasePage = (function () {
    function medicalCasePage() {
        this.data = {
            medical_condition: [],
            food_allergy: [],
            otherChecked: false,
            otherAllergyChecked: false
        };
    }
    medicalCasePage.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        var req = {};
        var that = this;
        webAPI.RetrieveMedicalProfile(req).then(function (resp) {
            console.log(resp);
            that.setData({
                medical_condition: resp.medical_conditions,
                food_allergy: resp.food_allergies
            });
        }).catch(function (err) { return console.log(err); });
    };
    medicalCasePage.prototype.allergyCheckboxChange = function (event) {
        var _a;
        var indexList = event.detail.value;
        if (indexList.includes(this.data.food_allergy.length.toString())) {
            this.setData({
                otherAllergyChecked: true
            });
        }
        else {
            this.setData({
                otherAllergyChecked: false,
            });
        }
        for (var index in this.data.food_allergy) {
            var operation = 'food_allergy[' + index + '].is_selected';
            var flag = indexList.includes(index.toString());
            this.setData((_a = {},
                _a[operation] = flag,
                _a));
        }
        wx.reportAnalytics('allergy_checkbox_change', {});
    };
    medicalCasePage.prototype.medicalConditionboxChange = function (event) {
        var _a;
        var indexList = event.detail.value;
        if (indexList.includes(this.data.medical_condition.length.toString())) {
            this.setData({
                otherChecked: true
            });
        }
        else {
            this.setData({
                otherChecked: false,
            });
        }
        for (var index in this.data.medical_condition) {
            var operation = 'medical_condition[' + index + '].is_selected';
            var flag = indexList.includes(index.toString());
            this.setData((_a = {},
                _a[operation] = flag,
                _a));
        }
        wx.reportAnalytics('medical_record_checkbox_change', {});
    };
    medicalCasePage.prototype.confirmMedicalProfile = function () {
        webAPI.UpdateMedicalProfile(this.generateMedicalReqBody()).then(function (resp) {
            console.log("update medical profile succeed ");
            wx.navigateBack();
        }).catch(function (err) { return console.log(err); });
    };
    medicalCasePage.prototype.generateMedicalReqBody = function () {
        var foodAllergy = [];
        var medicalCondition = [];
        for (var i in this.data.food_allergy) {
            if (this.data.food_allergy[i].is_selected) {
                foodAllergy.push(this.data.food_allergy[i].food_allergy_id);
            }
        }
        for (var i in this.data.medical_condition) {
            if (this.data.medical_condition[i].is_selected) {
                medicalCondition.push(this.data.medical_condition[i].medical_condition_id);
            }
        }
        var reqBody = {
            food_allergy_ids: foodAllergy,
            medical_condition_ids: medicalCondition,
        };
        return reqBody;
    };
    return medicalCasePage;
}());
Page(new medicalCasePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFtRDtBQUVuRCxpREFBa0Q7QUFFbEQ7SUFBQTtRQUVTLFNBQUksR0FBRztZQUNaLGlCQUFpQixFQUFFLEVBQUU7WUFDckIsWUFBWSxFQUFFLEVBQUU7WUFDaEIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsbUJBQW1CLEVBQUUsS0FBSztTQUMzQixDQUFBO0lBeUZILENBQUM7SUF2RlEsZ0NBQU0sR0FBYjtRQUNFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVqQixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixpQkFBaUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCO2dCQUMxQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWM7YUFDbEMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSwrQ0FBcUIsR0FBNUIsVUFBNkIsS0FBVTs7UUFDckMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDbEMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FB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LGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDNUU7U0FDRjtRQUNELElBQUksT0FBTyxHQUFHO1lBQ1osZ0JBQWdCLEVBQUUsV0FBVztZQUM3QixxQkFBcUIsRUFBRSxnQkFBZ0I7U0FDeEMsQ0FBQTtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFSCxzQkFBQztBQUFELENBQUMsQUFoR0QsSUFnR0M7QUFFRCxJQUFJLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IFVwZGF0ZU1lZGljYWxQcm9maWxlUmVxIH0gZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2JqcydcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nXG5cbmNsYXNzIG1lZGljYWxDYXNlUGFnZSB7XG5cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgbWVkaWNhbF9jb25kaXRpb246IFtdLFxuICAgIGZvb2RfYWxsZXJneTogW10sXG4gICAgb3RoZXJDaGVja2VkOiBmYWxzZSxcbiAgICBvdGhlckFsbGVyZ3lDaGVja2VkOiBmYWxzZVxuICB9XG5cbiAgcHVibGljIG9uTG9hZCgpOiB2b2lkIHtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgdmFyIHJlcSA9IHt9O1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3ZWJBUEkuUmV0cmlldmVNZWRpY2FsUHJvZmlsZShyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgIC8vc2V0IHVwIHRoZSBjaGVjayBkYXRhXG4gICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBtZWRpY2FsX2NvbmRpdGlvbjogcmVzcC5tZWRpY2FsX2NvbmRpdGlvbnMsXG4gICAgICAgIGZvb2RfYWxsZXJneTogcmVzcC5mb29kX2FsbGVyZ2llc1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG5cbiAgcHVibGljIGFsbGVyZ3lDaGVja2JveENoYW5nZShldmVudDogYW55KTogdm9pZCB7XG4gICAgbGV0IGluZGV4TGlzdCA9IGV2ZW50LmRldGFpbC52YWx1ZVxuICAgIGlmIChpbmRleExpc3QuaW5jbHVkZXModGhpcy5kYXRhLmZvb2RfYWxsZXJneS5sZW5ndGgudG9TdHJpbmcoKSkpIHsgLy9vdGhlciBvcHRpb24gY2hlY2tlZFxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgb3RoZXJBbGxlcmd5Q2hlY2tlZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgb3RoZXJBbGxlcmd5Q2hlY2tlZDogZmFsc2UsXG4gICAgICB9KVxuICAgIH1cbiAgICBmb3IgKGxldCBpbmRleCBpbiB0aGlzLmRhdGEuZm9vZF9hbGxlcmd5KSB7XG4gICAgICBsZXQgb3BlcmF0aW9uID0gJ2Zvb2RfYWxsZXJneVsnICsgaW5kZXggKyAnXS5pc19zZWxlY3RlZCc7XG4gICAgICBsZXQgZmxhZyA9IGluZGV4TGlzdC5pbmNsdWRlcyhpbmRleC50b1N0cmluZygpKTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIFtvcGVyYXRpb25dOiBmbGFnXG4gICAgICB9KVxuICAgIH1cbiAgICAvL3JlcG9ydCBhbmFseXRpY3NcbiAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ2FsbGVyZ3lfY2hlY2tib3hfY2hhbmdlJywge30pO1xuICB9XG5cbiAgcHVibGljIG1lZGljYWxDb25kaXRpb25ib3hDaGFuZ2UoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGxldCBpbmRleExpc3QgPSBldmVudC5kZXRhaWwudmFsdWVcbiAgICBpZiAoaW5kZXhMaXN0LmluY2x1ZGVzKHRoaXMuZGF0YS5tZWRpY2FsX2NvbmRpdGlvbi5sZW5ndGgudG9TdHJpbmcoKSkpIHsgLy9vdGhlciBvcHRpb24gY2hlY2tlZFxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgb3RoZXJDaGVja2VkOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBvdGhlckNoZWNrZWQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggaW4gdGhpcy5kYXRhLm1lZGljYWxfY29uZGl0aW9uKSB7XG4gICAgICBsZXQgb3BlcmF0aW9uID0gJ21lZGljYWxfY29uZGl0aW9uWycgKyBpbmRleCArICddLmlzX3NlbGVjdGVkJztcbiAgICAgIGxldCBmbGFnID0gaW5kZXhMaXN0LmluY2x1ZGVzKGluZGV4LnRvU3RyaW5nKCkpO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgW29wZXJhdGlvbl06IGZsYWdcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vcmVwb3J0IGFuYWx5dGljc1xuICAgIHd4LnJlcG9ydEFuYWx5dGljcygnbWVkaWNhbF9yZWNvcmRfY2hlY2tib3hfY2hhbmdlJywge30pO1xuICB9XG5cbiAgcHVibGljIGNvbmZpcm1NZWRpY2FsUHJvZmlsZSgpOiB2b2lkIHtcbiAgICB3ZWJBUEkuVXBkYXRlTWVkaWNhbFByb2ZpbGUodGhpcy5nZW5lcmF0ZU1lZGljYWxSZXFCb2R5KCkpLnRoZW4ocmVzcCA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZSBtZWRpY2FsIHByb2ZpbGUgc3VjY2VlZCBcIik7XG4gICAgICB3eC5uYXZpZ2F0ZUJhY2soKVxuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZU1lZGljYWxSZXFCb2R5KCk6IFVwZGF0ZU1lZGljYWxQcm9maWxlUmVxIHtcbiAgICB2YXIgZm9vZEFsbGVyZ3kgPSBbXTtcbiAgICB2YXIgbWVkaWNhbENvbmRpdGlvbiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmRhdGEuZm9vZF9hbGxlcmd5KSB7XG4gICAgICBpZiAodGhpcy5kYXRhLmZvb2RfYWxsZXJneVtpXS5pc19zZWxlY3RlZCkge1xuICAgICAgICBmb29kQWxsZXJneS5wdXNoKHRoaXMuZGF0YS5mb29kX2FsbGVyZ3lbaV0uZm9vZF9hbGxlcmd5X2lkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmRhdGEubWVkaWNhbF9jb25kaXRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRhdGEubWVkaWNhbF9jb25kaXRpb25baV0uaXNfc2VsZWN0ZWQpIHtcbiAgICAgICAgbWVkaWNhbENvbmRpdGlvbi5wdXNoKHRoaXMuZGF0YS5tZWRpY2FsX2NvbmRpdGlvbltpXS5tZWRpY2FsX2NvbmRpdGlvbl9pZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciByZXFCb2R5ID0ge1xuICAgICAgZm9vZF9hbGxlcmd5X2lkczogZm9vZEFsbGVyZ3ksXG4gICAgICBtZWRpY2FsX2NvbmRpdGlvbl9pZHM6IG1lZGljYWxDb25kaXRpb24sXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcUJvZHk7XG4gIH1cblxufVxuXG5QYWdlKG5ldyBtZWRpY2FsQ2FzZVBhZ2UoKSkiXX0=