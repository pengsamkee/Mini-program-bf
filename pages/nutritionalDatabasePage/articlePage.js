"use strict";
var app = getApp();
var articlePage = (function () {
    function articlePage() {
        this.data = {
            url: null
        };
    }
    articlePage.prototype.onLoad = function (options) {
        wx.setNavigationBarTitle({
            title: ""
        });
        this.setData({
            url: options.url
        });
    };
    return articlePage;
}());
Page(new articlePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aWNsZVBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcnRpY2xlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUI7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEdBQUcsRUFBRSxJQUFJO1NBQ1YsQ0FBQTtJQVdILENBQUM7SUFUUSw0QkFBTSxHQUFiLFVBQWMsT0FBTztRQUNuQixFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDdkIsS0FBSyxFQUFFLEVBQUU7U0FDVixDQUFDLENBQUM7UUFFRixJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztTQUNqQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBZEQsSUFjQztBQUVELElBQUksQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2FydGljbGVQYWdlLmpzXG5cbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcblxuY2xhc3MgYXJ0aWNsZVBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICB1cmw6IG51bGxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9ucyk6IHZvaWQge1xuICAgIHd4LnNldE5hdmlnYXRpb25CYXJUaXRsZSh7XG4gICAgICB0aXRsZTogXCJcIlxuICAgIH0pO1xuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHVybDogb3B0aW9ucy51cmxcbiAgICB9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyBhcnRpY2xlUGFnZSgpKTsiXX0=