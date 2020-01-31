"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ald = require('./utils/ald-stat.js');
var webAPI = require('./api/login/LoginService');
var index_1 = require("./config/index");
var globalConfig = new index_1.default();
globalConfig.init();
App({
    onLaunch: function () {
        var _this = this;
        var systemInfo = wx.getSystemInfoSync();
        var statusHeight = systemInfo.statusBarHeight;
        var isiOS = systemInfo.system.indexOf('iOS') > -1;
        var navHeight;
        if (!isiOS) {
            navHeight = 48;
        }
        else {
            navHeight = 44;
        }
        this.globalData.statusHeight = statusHeight;
        this.globalData.navHeight = navHeight;
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
        mealDate: null,
        statusHeight: null,
        navHeight: null,
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBRTFDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELHdDQUF5QztBQUV6QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFBO0FBQ3ZDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUVuQixHQUFHLENBQVM7SUFDVixRQUFRO1FBQVIsaUJBdUNDO1FBdENDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3pDLElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUE7UUFDL0MsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDbkQsSUFBSSxTQUFTLENBQUM7UUFDZCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNoQjthQUFNO1lBQ0wsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNsQjtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFdEMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsR0FBRztZQUNwQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFBO1lBQ2pDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUE7WUFDakMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHO1FBQ2hDLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLE9BQU8sRUFBRSxVQUFDLEdBQUc7Z0JBQ1gsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBRXJDLEVBQUUsQ0FBQyxXQUFXLENBQUM7d0JBQ2IsT0FBTyxFQUFFLFVBQUEsR0FBRzs0QkFFVixLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBOzRCQUd2QyxJQUFJLEtBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDOUIsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQ0FDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQzNCO3dCQUNILENBQUM7cUJBQ0YsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxVQUFVLEVBQUU7UUFDVixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUMsSUFBSTtRQUNiLFlBQVksRUFBQyxJQUFJO1FBQ2pCLFNBQVMsRUFBQyxJQUFJO0tBQ2Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvL2FwcC50c1xuXG5leHBvcnQgaW50ZXJmYWNlIElNeUFwcCB7XG4gIHVzZXJJbmZvUmVhZHlDYWxsYmFjaz8ocmVzOiB3eC5Vc2VySW5mbyk6IHZvaWRcbiAgZ2xvYmFsRGF0YToge1xuICAgIHVzZXJJbmZvPzogd3guVXNlckluZm8sXG4gICAgcHJvZmlsZURhdGE/OiB7XG4gICAgICBiaXJ0aGRheTogLTEsXG4gICAgICBoZWlnaHQ6IC0xLFxuICAgICAgd2VpZ2h0OiAtMSxcbiAgICAgIGN1cnJlbnRXZWlnaHQ6IC0xLFxuICAgICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IC0xLFxuICAgICAgYWN0aXZpdHlMZXZlbEluZGV4OiAtMSxcbiAgICAgIHByZWduYW5jeVdlZWtzOiAtMVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBhbGQgPSByZXF1aXJlKCcuL3V0aWxzL2FsZC1zdGF0LmpzJylcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi9hcGkvR2xvYmFsRW51bSdcbnZhciB3ZWJBUEkgPSByZXF1aXJlKCcuL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnKTtcbmltcG9ydCBHbG9iYWxDb25maWcgZnJvbSAnLi9jb25maWcvaW5kZXgnXG5cbmNvbnN0IGdsb2JhbENvbmZpZyA9IG5ldyBHbG9iYWxDb25maWcoKVxuZ2xvYmFsQ29uZmlnLmluaXQoKVxuXG5BcHA8SU15QXBwPih7XG4gIG9uTGF1bmNoKCkge1xuICAgIGNvbnN0IHN5c3RlbUluZm8gPSB3eC5nZXRTeXN0ZW1JbmZvU3luYygpXG4gICAgY29uc3Qgc3RhdHVzSGVpZ2h0ID0gc3lzdGVtSW5mby5zdGF0dXNCYXJIZWlnaHRcbiAgICBjb25zdCBpc2lPUyA9IHN5c3RlbUluZm8uc3lzdGVtLmluZGV4T2YoJ2lPUycpID4gLTEgIFxuICAgIHZhciBuYXZIZWlnaHQ7XG4gICAgaWYgKCFpc2lPUykgeyAvLyDlronljZNcbiAgICAgICAgbmF2SGVpZ2h0ID0gNDg7ICAgICAgICAgICAgXG4gICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgbmF2SGVpZ2h0ID0gNDQ7ICAgICAgICAgICAgXG4gICAgfVxuICAgIHRoaXMuZ2xvYmFsRGF0YS5zdGF0dXNIZWlnaHQgPSBzdGF0dXNIZWlnaHQ7XG4gICAgdGhpcy5nbG9iYWxEYXRhLm5hdkhlaWdodCA9IG5hdkhlaWdodDtcblxuICAgIHd4Lm9uTmV0d29ya1N0YXR1c0NoYW5nZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICB2YXIgbmV0d29ya1R5cGUgPSByZXMubmV0d29ya1R5cGVcbiAgICAgIHZhciBpc0Nvbm5lY3RlZCA9IHJlcy5pc0Nvbm5lY3RlZFxuICAgICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICAgIGlmIChpc0Nvbm5lY3RlZCAmJiAhdG9rZW4pIHsgfSBcbiAgICB9KVxuICAgIC8vIOiOt+WPlueUqOaIt+S/oeaBr1xuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzczogKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgLy8g5bey57uP5o6I5p2D77yM5Y+v5Lul55u05o6l6LCD55SoIGdldFVzZXJJbmZvIOiOt+WPluWktOWDj+aYteensO+8jOS4jeS8muW8ueahhlxuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgICAgICAgICAgIC8vIOWPr+S7peWwhiByZXMg5Y+R6YCB57uZ5ZCO5Y+w6Kej56CB5Ye6IHVuaW9uSWRcbiAgICAgICAgICAgICAgdGhpcy5nbG9iYWxEYXRhLnVzZXJJbmZvID0gcmVzLnVzZXJJbmZvXG4gICAgICAgICAgICAgIC8vIOeUseS6jiBnZXRVc2VySW5mbyDmmK/nvZHnu5zor7fmsYLvvIzlj6/og73kvJrlnKggUGFnZS5vbkxvYWQg5LmL5ZCO5omN6L+U5ZueXG4gICAgICAgICAgICAgIC8vIOaJgOS7peatpOWkhOWKoOWFpSBjYWxsYmFjayDku6XpmLLmraLov5nnp43mg4XlhrVcbiAgICAgICAgICAgICAgaWYgKHRoaXMudXNlckluZm9SZWFkeUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VySW5mb1JlYWR5Q2FsbGJhY2socmVzLnVzZXJJbmZvKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy51c2VySW5mbyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgZ2xvYmFsRGF0YToge1xuICAgIGNvbmZpZzogZ2xvYmFsQ29uZmlnLFxuICAgIG1lYWxEYXRlOm51bGwsIC8vIOeUseS6jui3r+eUsei3s+i9rOmXrumimO+8jOWcqOmdnuW9k+aXpeS4iuS8oOWbvueJh+WQju+8jOWGjeWbnummlumhteS8muWPmOaIkOS7iuaXpVxuICAgIHN0YXR1c0hlaWdodDpudWxsLFxuICAgIG5hdkhlaWdodDpudWxsLFxuICB9XG59KSJdfQ==