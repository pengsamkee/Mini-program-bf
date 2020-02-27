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
        console.log('reportPageUrl=' + reportPageUrl);
        this.setData({
            reportPageUrl: reportPageUrl
        });
    };
    return reportPage;
}());
Page(new reportPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0UGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9ydFBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QiwrQkFBaUM7QUFDakMsaURBQW1EO0FBRW5EO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFFWixhQUFhLEVBQUMsRUFBRTtTQUNqQixDQUFBO0lBZ0JILENBQUM7SUFkUSwyQkFBTSxHQUFiLFVBQWMsT0FBTztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQyxJQUFJLGFBQWEsR0FBVSxVQUFVLENBQUMsYUFBYSxHQUFDLFFBQVEsR0FBQyxPQUFPLENBQUMsSUFBSSxHQUFDLFVBQVUsR0FBQyxPQUFPLENBQUMsTUFBTSxHQUFDLFFBQVEsR0FBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3SCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFDLGFBQWEsQ0FBQyxDQUFDO1FBTTNDLElBQVksQ0FBQyxPQUFPLENBQUM7WUFFcEIsYUFBYSxlQUFBO1NBQ2QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQXBCRCxJQW9CQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL3JlcG9ydFBhZ2UuanNcblxuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcblxuY2xhc3MgcmVwb3J0UGFnZSB7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIC8vIGlkOiBudWxsLFxuICAgIHJlcG9ydFBhZ2VVcmw6JycsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnZGF0ZSx1c2VySWQnLG9wdGlvbnMpXG4gICAgdmFyIHJlcG9ydFBhZ2VVcmw6c3RyaW5nID0gZ2xvYmFsRW51bS5yZXBvcnRQYWdlVXJsKyc/ZGF0ZT0nK29wdGlvbnMuZGF0ZSsnJnVzZXJJZD0nK29wdGlvbnMudXNlcklkKycmdGltZT0nKyBtb21lbnQoKS51dGMoKTtcbiAgICBjb25zb2xlLmxvZygncmVwb3J0UGFnZVVybD0nK3JlcG9ydFBhZ2VVcmwpO1xuICAgIC8vIGxldCB1cmwgPSBvcHRpb25zLnVybDsgXG4gICAgLy8gY29uc3QgaW5kZXggPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcbiAgICAvLyBpZihpbmRleCE9PS0xKXtcbiAgICAvLyAgIHZhciBpZCA9IHVybC5zdWJzdHIoaW5kZXgrMSlcbiAgICAvLyB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIC8vIGlkOiBpZCArIFwiP3RpbWU9XCIgKyBtb21lbnQoKS51dGMoKSxcbiAgICAgIHJlcG9ydFBhZ2VVcmxcbiAgICB9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyByZXBvcnRQYWdlKCkpOyJdfQ==