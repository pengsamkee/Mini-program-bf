"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var targetInputPage = (function () {
    function targetInputPage() {
        this.data = {
            weight: "50",
            date: "2019-06-01",
            year: "2019",
            month: "06",
            day: "01"
        };
    }
    targetInputPage.prototype.onLoad = function (e) {
        this.setData({
            date: moment().format("YYYY-MM-DD"),
            year: moment().format("YYYY"),
            month: moment().format("MM"),
            day: moment().format("DD"),
        });
        wx.setNavigationBarTitle({
            title: "设定新目标"
        });
    };
    targetInputPage.prototype.bindDateChange = function (e) {
        var newDate = moment(e.detail.value);
        var year = newDate.year();
        var month = newDate.month() + 1;
        var day = newDate.date();
        this.setData({
            date: e.detail.value,
            year: year.toString(),
            month: month.toString(),
            day: day.toString()
        });
    };
    targetInputPage.prototype.onWeightInput = function (e) {
        this.setData({
            weight: e.detail.value
        });
    };
    targetInputPage.prototype.onWeightConfirm = function (e) {
        if (isNaN(this.data.weight) || this.data.weight <= 0) {
            wx.showModal({
                title: "错误!",
                content: "请输入零以上的数字",
                showCancel: false,
                confirmText: "OK"
            });
            this.setData({
                weight: 1
            });
        }
    };
    targetInputPage.prototype.submitWeightRecord = function (e) {
        if (this.data.weight === null) {
            wx.showModal({
                title: "错误!",
                content: "请先输入您的体重",
                showCancel: false,
                confirmText: "OK"
            });
            return;
        }
        wx.showLoading({
            title: '正在添加',
        });
        var tempTimestamp = moment(this.data.date).unix();
        var tempWeight = Number(Number(this.data.weight).toFixed(1));
        if (typeof tempWeight === 'number' && isNaN(tempWeight)) {
            wx.showModal({
                title: "错误!",
                content: "请输入正确的数字",
                showCancel: false,
                confirmText: "OK"
            });
            return false;
        }
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
        setTimeout(function () {
            var createTargetWeightReq = {
                target_weight_value: tempWeight,
                date: tempTimestamp
            };
            webAPI.CreateTargetWeight(createTargetWeightReq).then(function (resp) {
                wx.hideLoading();
                wx.showToast({
                    title: "添加完成!"
                });
            }).catch(function (err) { return wx.hideLoading(); });
            wx.navigateBack({
                delta: 1
            });
        }, 2000);
    };
    return targetInputPage;
}());
Page(new targetInputPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0SW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0YXJnZXRJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFpQztBQUNqQyxpREFBbUQ7QUFDbkQsaURBQW1EO0FBRW5EO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFDWixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxZQUFZO1lBQ2xCLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLElBQUk7WUFDWCxHQUFHLEVBQUUsSUFBSTtTQUNWLENBQUE7SUFvR0gsQ0FBQztJQWxHUSxnQ0FBTSxHQUFiLFVBQWMsQ0FBQztRQUNaLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDbkMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDNUIsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ3ZCLEtBQUssRUFBRSxPQUFPO1NBQ2YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLHdDQUFjLEdBQXJCLFVBQXNCLENBQUM7UUFDckIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXhCLElBQVksQ0FBQyxPQUFP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QUFLLEVBQUUsQ0FBQzthQUNULENBQUMsQ0FBQTtRQUNKLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUEzR0QsSUEyR0M7QUFFRCxJQUFJLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuXG5jbGFzcyB0YXJnZXRJbnB1dFBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICB3ZWlnaHQ6IFwiNTBcIixcbiAgICBkYXRlOiBcIjIwMTktMDYtMDFcIixcbiAgICB5ZWFyOiBcIjIwMTlcIixcbiAgICBtb250aDogXCIwNlwiLFxuICAgIGRheTogXCIwMVwiXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKGUpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgZGF0ZTogbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbiAgICAgIHllYXI6IG1vbWVudCgpLmZvcm1hdChcIllZWVlcIiksXG4gICAgICBtb250aDogbW9tZW50KCkuZm9ybWF0KFwiTU1cIiksXG4gICAgICBkYXk6IG1vbWVudCgpLmZvcm1hdChcIkREXCIpLFxuICAgIH0pO1xuXG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuiuvuWumuaWsOebruagh1wiXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZERhdGVDaGFuZ2UoZSk6IHZvaWQge1xuICAgIGxldCBuZXdEYXRlID0gbW9tZW50KGUuZGV0YWlsLnZhbHVlKTtcbiAgICBsZXQgeWVhciA9IG5ld0RhdGUueWVhcigpO1xuICAgIGxldCBtb250aCA9IG5ld0RhdGUubW9udGgoKSArIDE7XG4gICAgbGV0IGRheSA9IG5ld0RhdGUuZGF0ZSgpO1xuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGRhdGU6IGUuZGV0YWlsLnZhbHVlLFxuICAgICAgeWVhcjogeWVhci50b1N0cmluZygpLFxuICAgICAgbW9udGg6IG1vbnRoLnRvU3RyaW5nKCksXG4gICAgICBkYXk6IGRheS50b1N0cmluZygpXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25XZWlnaHRJbnB1dChlKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHdlaWdodDogZS5kZXRhaWwudmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGNoZWNrcyB0aGF0IHdlaWdodCBpcyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiAwXG4gIHB1YmxpYyBvbldlaWdodENvbmZpcm0oZSk6IHZvaWQge1xuICAgIGlmIChpc05hTih0aGlzLmRhdGEud2VpZ2h0KSB8fCB0aGlzLmRhdGEud2VpZ2h0IDw9IDApIHtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIumUmeivryFcIixcbiAgICAgICAgY29udGVudDogXCLor7fovpPlhaXpm7bku6XkuIrnmoTmlbDlrZdcIixcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgIGNvbmZpcm1UZXh0OiBcIk9LXCJcbiAgICAgIH0pO1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICB3ZWlnaHQ6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdWJtaXRXZWlnaHRSZWNvcmQoZSk6IHZvaWQge1xuXG4gICAgaWYgKHRoaXMuZGF0YS53ZWlnaHQgPT09IG51bGwpIHtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIumUmeivryFcIixcbiAgICAgICAgY29udGVudDogXCLor7flhYjovpPlhaXmgqjnmoTkvZPph41cIixcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgIGNvbmZpcm1UZXh0OiBcIk9LXCJcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd3guc2hvd0xvYWRpbmcoe1xuICAgICAgdGl0bGU6ICfmraPlnKjmt7vliqAnLFxuICAgIH0pO1xuXG4gICAgbGV0IHRlbXBUaW1lc3RhbXA6IG51bWJlciA9IG1vbWVudCh0aGlzLmRhdGEuZGF0ZSkudW5peCgpO1xuICAgIGxldCB0ZW1wV2VpZ2h0OiBudW1iZXIgPSBOdW1iZXIoTnVtYmVyKHRoaXMuZGF0YS53ZWlnaHQpLnRvRml4ZWQoMSkpO1xuICAgIGlmICh0eXBlb2YgdGVtcFdlaWdodCA9PT0gJ251bWJlcicgJiYgaXNOYU4odGVtcFdlaWdodCkpIHtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIumUmeivryFcIixcbiAgICAgICAgY29udGVudDogXCLor7fovpPlhaXmraPnoa7nmoTmlbDlrZdcIixcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgIGNvbmZpcm1UZXh0OiBcIk9LXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGNyZWF0ZVRhcmdldFdlaWdodFJlcSA9IHtcbiAgICAgICAgdGFyZ2V0X3dlaWdodF92YWx1ZTogdGVtcFdlaWdodCxcbiAgICAgICAgZGF0ZTogdGVtcFRpbWVzdGFtcFxuICAgICAgfVxuXG4gICAgICB3ZWJBUEkuQ3JlYXRlVGFyZ2V0V2VpZ2h0KGNyZWF0ZVRhcmdldFdlaWdodFJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcbiAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICB0aXRsZTogXCLmt7vliqDlrozmiJAhXCJcbiAgICAgICAgfSk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4gd3guaGlkZUxvYWRpbmcoKSk7XG4gICAgICBcbiAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XG4gICAgICAgIGRlbHRhOiAxXG4gICAgICB9KVxuICAgIH0sIDIwMDApO1xuICB9XG59XG5cblBhZ2UobmV3IHRhcmdldElucHV0UGFnZSgpKTsiXX0=