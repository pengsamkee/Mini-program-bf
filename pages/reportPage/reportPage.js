"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var moment = require("moment");
var globalEnum = require("../../api/GlobalEnum");
var reportPage = (function () {
    function reportPage() {
        this.data = {
            reportPageUrl: '',
        };
    }
    reportPage.prototype.onLoad = function (options) {
        console.log('date,userId', options);
        var reportPageUrl = globalEnum.reportPageUrl + '?date=' + options.date + '&userId=' + options.userId + '&time=' + moment().utc();
        this.setData({
            reportPageUrl: reportPageUrl
        });
    };
    return reportPage;
}());
Page(new reportPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0UGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9ydFBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QiwrQkFBaUM7QUFDakMsaURBQW1EO0FBRW5EO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFFWixhQUFhLEVBQUMsRUFBRTtTQUNqQixDQUFBO0lBZUgsQ0FBQztJQWJRLDJCQUFNLEdBQWIsVUFBYyxPQUFPO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2xDLElBQUksYUFBYSxHQUFVLFVBQVUsQ0FBQyxhQUFhLEdBQUMsUUFBUSxHQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUMsVUFBVSxHQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUMsUUFBUSxHQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBTTVILElBQVksQ0FBQyxPQUFPLENBQUM7WUFFcEIsYUFBYSxlQUFBO1NBQ2QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQW5CRCxJQW1CQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL3JlcG9ydFBhZ2UuanNcblxuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcblxuY2xhc3MgcmVwb3J0UGFnZSB7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIC8vIGlkOiBudWxsLFxuICAgIHJlcG9ydFBhZ2VVcmw6JycsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnZGF0ZSx1c2VySWQnLG9wdGlvbnMpXG4gICAgdmFyIHJlcG9ydFBhZ2VVcmw6c3RyaW5nID0gZ2xvYmFsRW51bS5yZXBvcnRQYWdlVXJsKyc/ZGF0ZT0nK29wdGlvbnMuZGF0ZSsnJnVzZXJJZD0nK29wdGlvbnMudXNlcklkKycmdGltZT0nKyBtb21lbnQoKS51dGMoKTtcbiAgICAvLyBsZXQgdXJsID0gb3B0aW9ucy51cmw7IFxuICAgIC8vIGNvbnN0IGluZGV4ID0gdXJsLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgLy8gaWYoaW5kZXghPT0tMSl7XG4gICAgLy8gICB2YXIgaWQgPSB1cmwuc3Vic3RyKGluZGV4KzEpXG4gICAgLy8gfVxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAvLyBpZDogaWQgKyBcIj90aW1lPVwiICsgbW9tZW50KCkudXRjKCksXG4gICAgICByZXBvcnRQYWdlVXJsXG4gICAgfSk7XG4gIH1cbn1cblxuUGFnZShuZXcgcmVwb3J0UGFnZSgpKTsiXX0=