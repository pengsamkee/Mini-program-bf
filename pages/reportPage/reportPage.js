"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var moment = require("moment");
var reportPage = (function () {
    function reportPage() {
        this.data = {
            url: null
        };
    }
    reportPage.prototype.onLoad = function (options) {
        var url = options.url;
        var index = url.lastIndexOf('/');
        if (index !== -1) {
            url = url.substr(index + 1);
        }
        this.setData({
            url: url + "?time=" + moment().utc()
        });
    };
    return reportPage;
}());
Page(new reportPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0UGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9ydFBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QiwrQkFBaUM7QUFFakM7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEdBQUcsRUFBRSxJQUFJO1NBQ1YsQ0FBQTtJQVlILENBQUM7SUFWUSwyQkFBTSxHQUFiLFVBQWMsT0FBTztRQUNuQixJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3RCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsSUFBRyxLQUFLLEtBQUcsQ0FBQyxDQUFDLEVBQUM7WUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUE7U0FDMUI7UUFDQSxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLEdBQUcsRUFBRSxHQUFHLEdBQUcsUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRTtTQUNyQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBZkQsSUFlQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL3JlcG9ydFBhZ2UuanNcblxuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5cbmNsYXNzIHJlcG9ydFBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICB1cmw6IG51bGxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9ucyk6IHZvaWQge1xuICAgIGxldCB1cmwgPSBvcHRpb25zLnVybDsgXG4gICAgY29uc3QgaW5kZXggPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcbiAgICBpZihpbmRleCE9PS0xKXtcbiAgICAgIHVybCA9IHVybC5zdWJzdHIoaW5kZXgrMSlcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHVybDogdXJsICsgXCI/dGltZT1cIiArIG1vbWVudCgpLnV0YygpXG4gICAgfSk7XG4gIH1cbn1cblxuUGFnZShuZXcgcmVwb3J0UGFnZSgpKTsiXX0=