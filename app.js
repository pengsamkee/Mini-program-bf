"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELHdDQUF5QztBQUV6QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFBO0FBQ3ZDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUVuQixHQUFHLENBQVM7SUFDVixRQUFRO1FBQVIsaUJBdUNDO1FBdENDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3pDLElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUE7UUFDL0MsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDbkQsSUFBSSxTQUFTLENBQUM7UUFDZCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNoQjthQUFNO1lBQ0wsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNsQjtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFdEMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsR0FBRztZQUNwQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFBO1lBQ2pDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUE7WUFDakMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHO1FBQ2hDLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLE9BQU8sRUFBRSxVQUFDLEdBQUc7Z0JBQ1gsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBRXJDLEVBQUUsQ0FBQyxXQUFXLENBQUM7d0JBQ2IsT0FBTyxFQUFFLFVBQUEsR0FBRzs0QkFFVixLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBOzRCQUd2QyxJQUFJLEtBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDOUIsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQ0FDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQzNCO3dCQUNILENBQUM7cUJBQ0YsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxVQUFVLEVBQUU7UUFDVixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUMsSUFBSTtRQUNiLFlBQVksRUFBQyxJQUFJO1FBQ2pCLFNBQVMsRUFBQyxJQUFJO0tBQ2Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvL2FwcC50c1xuZXhwb3J0IGludGVyZmFjZSBJTXlBcHAge1xuICB1c2VySW5mb1JlYWR5Q2FsbGJhY2s/KHJlczogd3guVXNlckluZm8pOiB2b2lkXG4gIGdsb2JhbERhdGE6IHtcbiAgICB1c2VySW5mbz86IHd4LlVzZXJJbmZvLFxuICAgIHByb2ZpbGVEYXRhPzoge1xuICAgICAgYmlydGhkYXk6IC0xLFxuICAgICAgaGVpZ2h0OiAtMSxcbiAgICAgIHdlaWdodDogLTEsXG4gICAgICBjdXJyZW50V2VpZ2h0OiAtMSxcbiAgICAgIHByZWduYW5jeVN0YXR1c0luZGV4OiAtMSxcbiAgICAgIGFjdGl2aXR5TGV2ZWxJbmRleDogLTEsXG4gICAgICBwcmVnbmFuY3lXZWVrczogLTFcbiAgICB9XG4gIH1cbn1cblxuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuL2FwaS9HbG9iYWxFbnVtJ1xudmFyIHdlYkFQSSA9IHJlcXVpcmUoJy4vYXBpL2xvZ2luL0xvZ2luU2VydmljZScpO1xuaW1wb3J0IEdsb2JhbENvbmZpZyBmcm9tICcuL2NvbmZpZy9pbmRleCdcblxuY29uc3QgZ2xvYmFsQ29uZmlnID0gbmV3IEdsb2JhbENvbmZpZygpXG5nbG9iYWxDb25maWcuaW5pdCgpXG5cbkFwcDxJTXlBcHA+KHtcbiAgb25MYXVuY2goKSB7XG4gICAgY29uc3Qgc3lzdGVtSW5mbyA9IHd4LmdldFN5c3RlbUluZm9TeW5jKClcbiAgICBjb25zdCBzdGF0dXNIZWlnaHQgPSBzeXN0ZW1JbmZvLnN0YXR1c0JhckhlaWdodFxuICAgIGNvbnN0IGlzaU9TID0gc3lzdGVtSW5mby5zeXN0ZW0uaW5kZXhPZignaU9TJykgPiAtMSAgXG4gICAgdmFyIG5hdkhlaWdodDtcbiAgICBpZiAoIWlzaU9TKSB7IC8vIOWuieWNk1xuICAgICAgICBuYXZIZWlnaHQgPSA0ODsgICAgICAgICAgICBcbiAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgIFxuICAgICAgICBuYXZIZWlnaHQgPSA0NDsgICAgICAgICAgICBcbiAgICB9XG4gICAgdGhpcy5nbG9iYWxEYXRhLnN0YXR1c0hlaWdodCA9IHN0YXR1c0hlaWdodDtcbiAgICB0aGlzLmdsb2JhbERhdGEubmF2SGVpZ2h0ID0gbmF2SGVpZ2h0O1xuXG4gICAgd3gub25OZXR3b3JrU3RhdHVzQ2hhbmdlKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHZhciBuZXR3b3JrVHlwZSA9IHJlcy5uZXR3b3JrVHlwZVxuICAgICAgdmFyIGlzQ29ubmVjdGVkID0gcmVzLmlzQ29ubmVjdGVkXG4gICAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhcInRva2VuXCIpO1xuICAgICAgaWYgKGlzQ29ubmVjdGVkICYmICF0b2tlbikgeyB9IFxuICAgIH0pXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICAvLyDlt7Lnu4/mjojmnYPvvIzlj6/ku6Xnm7TmjqXosIPnlKggZ2V0VXNlckluZm8g6I635Y+W5aS05YOP5pi156ew77yM5LiN5Lya5by55qGGXG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgLy8g5Y+v5Lul5bCGIHJlcyDlj5HpgIHnu5nlkI7lj7Dop6PnoIHlh7ogdW5pb25JZFxuICAgICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgICAgLy8g55Sx5LqOIGdldFVzZXJJbmZvIOaYr+e9kee7nOivt+axgu+8jOWPr+iDveS8muWcqCBQYWdlLm9uTG9hZCDkuYvlkI7miY3ov5Tlm55cbiAgICAgICAgICAgICAgLy8g5omA5Lul5q2k5aSE5Yqg5YWlIGNhbGxiYWNrIOS7pemYsuatoui/meenjeaDheWGtVxuICAgICAgICAgICAgICBpZiAodGhpcy51c2VySW5mb1JlYWR5Q2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJJbmZvUmVhZHlDYWxsYmFjayhyZXMudXNlckluZm8pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBnbG9iYWxEYXRhOiB7XG4gICAgY29uZmlnOiBnbG9iYWxDb25maWcsXG4gICAgbWVhbERhdGU6bnVsbCwgLy8g55Sx5LqO6Lev55Sx6Lez6L2s6Zeu6aKY77yM5Zyo6Z2e5b2T5pel5LiK5Lyg5Zu+54mH5ZCO77yM5YaN5Zue6aaW6aG15Lya5Y+Y5oiQ5LuK5pelXG4gICAgc3RhdHVzSGVpZ2h0Om51bGwsXG4gICAgbmF2SGVpZ2h0Om51bGwsXG4gIH1cbn0pIl19