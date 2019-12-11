"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var moment = require("moment");
var FeedQuestionPage = (function () {
    function FeedQuestionPage() {
        this.data = {
            questionText: ""
        };
    }
    FeedQuestionPage.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    };
    FeedQuestionPage.prototype.bindFeedbackQuestionInput = function (event) {
        var quesText = String(event.detail.value);
        this.setData({
            questionText: quesText
        });
    };
    FeedQuestionPage.prototype.onFeedbackDlgBtnSubmit = function () {
        var req = { date: moment().unix(), question: this.data.questionText };
        if (!this.data.questionText || this.data.questionText === "") {
            return;
        }
        webAPI.CreateQuestion(req).then(function (resp) {
            wx.navigateBack({ delta: 1 });
        }).catch(function (err) { wx.showModal({ title: "", content: "上传留言失败", showCancel: false }); });
    };
    return FeedQuestionPage;
}());
Page(new FeedQuestionPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFDbkQsK0JBQWlDO0FBRWpDO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixZQUFZLEVBQUUsRUFBRTtTQUNqQixDQUFBO0lBdUJILENBQUM7SUFyQlEsaUNBQU0sR0FBYjtRQUNFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sb0RBQXlCLEdBQWhDLFVBQWlDLEtBQVU7UUFDekMsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixZQUFZLEVBQUUsUUFBUTtTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0saURBQXNCLEdBQTdCO1FBRUUsSUFBSSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFLLEVBQUUsRUFBRTtZQUM1RCxPQUFNO1NBQ1A7UUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDbEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUcsSUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FBQyxBQTNCRCxJQTJCQztBQUVELElBQUksQ0FBQyxJQUFJLGdCQUFnQixFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSc7XG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuY2xhc3MgRmVlZFF1ZXN0aW9uUGFnZXtcblxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBxdWVzdGlvblRleHQ6IFwiXCJcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKXtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIH1cblxuICBwdWJsaWMgYmluZEZlZWRiYWNrUXVlc3Rpb25JbnB1dChldmVudDogYW55KSB7XG4gICAgbGV0IHF1ZXNUZXh0ID0gU3RyaW5nKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHF1ZXN0aW9uVGV4dDogcXVlc1RleHRcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkZlZWRiYWNrRGxnQnRuU3VibWl0KCkge1xuICAgIC8vc3VibWl0IGlzRmVlZGJhY2sgdG8gYmFja2VuZFxuICAgIGxldCByZXEgPSB7IGRhdGU6IG1vbWVudCgpLnVuaXgoKSwgcXVlc3Rpb246IHRoaXMuZGF0YS5xdWVzdGlvblRleHQgfTtcbiAgICBpZiAoIXRoaXMuZGF0YS5xdWVzdGlvblRleHQgfHwgdGhpcy5kYXRhLnF1ZXN0aW9uVGV4dCA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHdlYkFQSS5DcmVhdGVRdWVzdGlvbihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB3eC5uYXZpZ2F0ZUJhY2soe2RlbHRhOiAxfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHsgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwiXCIsIGNvbnRlbnQ6IFwi5LiK5Lyg55WZ6KiA5aSx6LSlXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pIH0pO1xuICB9XG59XG5cblBhZ2UobmV3IEZlZWRRdWVzdGlvblBhZ2UoKSk7Il19