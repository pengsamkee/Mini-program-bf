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
        this.setData({
            url: options.url + "?time=" + moment().utc()
        });
        console.log(this.data.url);
    };
    return reportPage;
}());
Page(new reportPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0UGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9ydFBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QiwrQkFBaUM7QUFFakM7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEdBQUcsRUFBRSxJQUFJO1NBQ1YsQ0FBQTtJQVVILENBQUM7SUFSUSwyQkFBTSxHQUFiLFVBQWMsT0FBTztRQUNsQixJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxHQUFHLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUU7U0FDN0MsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFHSCxpQkFBQztBQUFELENBQUMsQUFiRCxJQWFDO0FBRUQsSUFBSSxDQUFDLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vcmVwb3J0UGFnZS5qc1xuXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuY2xhc3MgcmVwb3J0UGFnZSB7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIHVybDogbnVsbFxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb25zKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHVybDogb3B0aW9ucy51cmwgKyBcIj90aW1lPVwiICsgbW9tZW50KCkudXRjKClcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEudXJsKTtcbiAgfVxuXG4gIC8vIFxufVxuXG5QYWdlKG5ldyByZXBvcnRQYWdlKCkpOyJdfQ==