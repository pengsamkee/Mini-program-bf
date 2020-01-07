"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require('./api/login/LoginService');
var index_1 = require("./config/index");
var globalConfig = new index_1.default();
globalConfig.init();
App({
    onLaunch: function () {
        var _this = this;
        var menuInfo = wx.getMenuButtonBoundingClientRect();
        this.globalData.menuInfo = menuInfo;
        wx.onNetworkStatusChange(function (res) {
            var networkType = res.networkType;
            var isConnected = res.isConnected;
            var token = wx.getStorageSync("token");
            if (isConnected && !token) { }
        });
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            _this.globalData.userInfo = res.userInfo;
                            if (_this.userInfoReadyCallback) {
                                _this.userInfoReadyCallback(res.userInfo);
                                console.log(res.userInfo);
                            }
                        }
                    });
                }
            }
        });
    },
    globalData: {
        config: globalConfig,
        menuInfo: null,
        mealDate: null,
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELHdDQUF5QztBQUV6QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFBO0FBQ3ZDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUVuQixHQUFHLENBQVM7SUFDVixRQUFRO1FBQVIsaUJBZ0NDO1FBNUJDLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxFQUFFLENBQUMscUJBQXFCLENBQUMsVUFBVSxHQUFHO1lBQ3BDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUE7WUFDakMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQTtZQUNqQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksV0FBVyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUc7UUFDaEMsQ0FBQyxDQUFDLENBQUE7UUFFRixFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osT0FBTyxFQUFFLFVBQUMsR0FBRztnQkFDWCxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtvQkFFckMsRUFBRSxDQUFDLFdBQVcsQ0FBQzt3QkFDYixPQUFPLEVBQUUsVUFBQSxHQUFHOzRCQUVWLEtBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUE7NEJBR3ZDLElBQUksS0FBSSxDQUFDLHFCQUFxQixFQUFFO2dDQUM5QixLQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dDQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDM0I7d0JBQ0gsQ0FBQztxQkFDRixDQUFDLENBQUE7aUJBQ0g7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBRTtRQUNWLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFFBQVEsRUFBQyxJQUFJO1FBQ2IsUUFBUSxFQUFDLElBQUk7S0FDZDtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vYXBwLnRzXG5leHBvcnQgaW50ZXJmYWNlIElNeUFwcCB7XG4gIHVzZXJJbmZvUmVhZHlDYWxsYmFjaz8ocmVzOiB3eC5Vc2VySW5mbyk6IHZvaWRcbiAgZ2xvYmFsRGF0YToge1xuICAgIHVzZXJJbmZvPzogd3guVXNlckluZm8sXG4gICAgcHJvZmlsZURhdGE/OiB7XG4gICAgICBiaXJ0aGRheTogLTEsXG4gICAgICBoZWlnaHQ6IC0xLFxuICAgICAgd2VpZ2h0OiAtMSxcbiAgICAgIGN1cnJlbnRXZWlnaHQ6IC0xLFxuICAgICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IC0xLFxuICAgICAgYWN0aXZpdHlMZXZlbEluZGV4OiAtMSxcbiAgICAgIHByZWduYW5jeVdlZWtzOiAtMVxuICAgIH1cbiAgfVxufVxuXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4vYXBpL0dsb2JhbEVudW0nXG52YXIgd2ViQVBJID0gcmVxdWlyZSgnLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJyk7XG5pbXBvcnQgR2xvYmFsQ29uZmlnIGZyb20gJy4vY29uZmlnL2luZGV4J1xuXG5jb25zdCBnbG9iYWxDb25maWcgPSBuZXcgR2xvYmFsQ29uZmlnKClcbmdsb2JhbENvbmZpZy5pbml0KClcblxuQXBwPElNeUFwcD4oe1xuICBvbkxhdW5jaCgpIHtcbiAgICAvKipcbiAgICAgKiDojrflj5blj7PkuIrop5Log7blm4rlsLrlr7jvvIzorqHnrpfoh6rlrprkuYnmoIfpopjmoI/kvY3nva5cbiAgICAgKi9cbiAgICBjb25zdCBtZW51SW5mbyA9IHd4LmdldE1lbnVCdXR0b25Cb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLmdsb2JhbERhdGEubWVudUluZm8gPSBtZW51SW5mbztcbiAgICB3eC5vbk5ldHdvcmtTdGF0dXNDaGFuZ2UoZnVuY3Rpb24gKHJlcykge1xuICAgICAgdmFyIG5ldHdvcmtUeXBlID0gcmVzLm5ldHdvcmtUeXBlXG4gICAgICB2YXIgaXNDb25uZWN0ZWQgPSByZXMuaXNDb25uZWN0ZWRcbiAgICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKFwidG9rZW5cIik7XG4gICAgICBpZiAoaXNDb25uZWN0ZWQgJiYgIXRva2VuKSB7IH0gXG4gICAgfSlcbiAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3M6IChyZXMpID0+IHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIC8vIOW3sue7j+aOiOadg++8jOWPr+S7peebtOaOpeiwg+eUqCBnZXRVc2VySW5mbyDojrflj5blpLTlg4/mmLXnp7DvvIzkuI3kvJrlvLnmoYZcbiAgICAgICAgICB3eC5nZXRVc2VySW5mbyh7XG4gICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgICAgICAvLyDlj6/ku6XlsIYgcmVzIOWPkemAgee7meWQjuWPsOino+eggeWHuiB1bmlvbklkXG4gICAgICAgICAgICAgIHRoaXMuZ2xvYmFsRGF0YS51c2VySW5mbyA9IHJlcy51c2VySW5mb1xuICAgICAgICAgICAgICAvLyDnlLHkuo4gZ2V0VXNlckluZm8g5piv572R57uc6K+35rGC77yM5Y+v6IO95Lya5ZyoIFBhZ2Uub25Mb2FkIOS5i+WQjuaJjei/lOWbnlxuICAgICAgICAgICAgICAvLyDmiYDku6XmraTlpITliqDlhaUgY2FsbGJhY2sg5Lul6Ziy5q2i6L+Z56eN5oOF5Ya1XG4gICAgICAgICAgICAgIGlmICh0aGlzLnVzZXJJbmZvUmVhZHlDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckluZm9SZWFkeUNhbGxiYWNrKHJlcy51c2VySW5mbylcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMudXNlckluZm8pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG4gIGdsb2JhbERhdGE6IHtcbiAgICBjb25maWc6IGdsb2JhbENvbmZpZyxcbiAgICBtZW51SW5mbzpudWxsLFxuICAgIG1lYWxEYXRlOm51bGwsIC8vIOeUseS6jui3r+eUsei3s+i9rOmXrumimO+8jOWcqOmdnuW9k+aXpeS4iuS8oOWbvueJh+WQju+8jOWGjeWbnummlumhteS8muWPmOaIkOS7iuaXpVxuICB9XG59KSJdfQ==