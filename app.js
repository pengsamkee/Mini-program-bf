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
        menuInfo: null
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELHdDQUF5QztBQUV6QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFBO0FBQ3ZDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUVuQixHQUFHLENBQVM7SUFDVixRQUFRO1FBQVIsaUJBZ0NDO1FBNUJDLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxFQUFFLENBQUMscUJBQXFCLENBQUMsVUFBVSxHQUFHO1lBQ3BDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUE7WUFDakMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQTtZQUNqQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksV0FBVyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUc7UUFDaEMsQ0FBQyxDQUFDLENBQUE7UUFFRixFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osT0FBTyxFQUFFLFVBQUMsR0FBRztnQkFDWCxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtvQkFFckMsRUFBRSxDQUFDLFdBQVcsQ0FBQzt3QkFDYixPQUFPLEVBQUUsVUFBQSxHQUFHOzRCQUVWLEtBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUE7NEJBR3ZDLElBQUksS0FBSSxDQUFDLHFCQUFxQixFQUFFO2dDQUM5QixLQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dDQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDM0I7d0JBQ0gsQ0FBQztxQkFDRixDQUFDLENBQUE7aUJBQ0g7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELFVBQVUsRUFBRTtRQUNWLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLFFBQVEsRUFBQyxJQUFJO0tBQ2Q7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvL2FwcC50c1xuZXhwb3J0IGludGVyZmFjZSBJTXlBcHAge1xuICB1c2VySW5mb1JlYWR5Q2FsbGJhY2s/KHJlczogd3guVXNlckluZm8pOiB2b2lkXG4gIGdsb2JhbERhdGE6IHtcbiAgICB1c2VySW5mbz86IHd4LlVzZXJJbmZvLFxuICAgIHByb2ZpbGVEYXRhPzoge1xuICAgICAgYmlydGhkYXk6IC0xLFxuICAgICAgaGVpZ2h0OiAtMSxcbiAgICAgIHdlaWdodDogLTEsXG4gICAgICBjdXJyZW50V2VpZ2h0OiAtMSxcbiAgICAgIHByZWduYW5jeVN0YXR1c0luZGV4OiAtMSxcbiAgICAgIGFjdGl2aXR5TGV2ZWxJbmRleDogLTEsXG4gICAgICBwcmVnbmFuY3lXZWVrczogLTFcbiAgICB9XG4gIH1cbn1cblxuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuL2FwaS9HbG9iYWxFbnVtJ1xudmFyIHdlYkFQSSA9IHJlcXVpcmUoJy4vYXBpL2xvZ2luL0xvZ2luU2VydmljZScpO1xuaW1wb3J0IEdsb2JhbENvbmZpZyBmcm9tICcuL2NvbmZpZy9pbmRleCdcblxuY29uc3QgZ2xvYmFsQ29uZmlnID0gbmV3IEdsb2JhbENvbmZpZygpXG5nbG9iYWxDb25maWcuaW5pdCgpXG5cbkFwcDxJTXlBcHA+KHtcbiAgb25MYXVuY2goKSB7XG4gICAgLyoqXG4gICAgICog6I635Y+W5Y+z5LiK6KeS6IO25ZuK5bC65a+477yM6K6h566X6Ieq5a6a5LmJ5qCH6aKY5qCP5L2N572uXG4gICAgICovXG4gICAgY29uc3QgbWVudUluZm8gPSB3eC5nZXRNZW51QnV0dG9uQm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5nbG9iYWxEYXRhLm1lbnVJbmZvID0gbWVudUluZm87XG4gICAgd3gub25OZXR3b3JrU3RhdHVzQ2hhbmdlKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHZhciBuZXR3b3JrVHlwZSA9IHJlcy5uZXR3b3JrVHlwZVxuICAgICAgdmFyIGlzQ29ubmVjdGVkID0gcmVzLmlzQ29ubmVjdGVkXG4gICAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhcInRva2VuXCIpO1xuICAgICAgaWYgKGlzQ29ubmVjdGVkICYmICF0b2tlbikgeyB9IFxuICAgIH0pXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICAvLyDlt7Lnu4/mjojmnYPvvIzlj6/ku6Xnm7TmjqXosIPnlKggZ2V0VXNlckluZm8g6I635Y+W5aS05YOP5pi156ew77yM5LiN5Lya5by55qGGXG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgLy8g5Y+v5Lul5bCGIHJlcyDlj5HpgIHnu5nlkI7lj7Dop6PnoIHlh7ogdW5pb25JZFxuICAgICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgICAgLy8g55Sx5LqOIGdldFVzZXJJbmZvIOaYr+e9kee7nOivt+axgu+8jOWPr+iDveS8muWcqCBQYWdlLm9uTG9hZCDkuYvlkI7miY3ov5Tlm55cbiAgICAgICAgICAgICAgLy8g5omA5Lul5q2k5aSE5Yqg5YWlIGNhbGxiYWNrIOS7pemYsuatoui/meenjeaDheWGtVxuICAgICAgICAgICAgICBpZiAodGhpcy51c2VySW5mb1JlYWR5Q2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJJbmZvUmVhZHlDYWxsYmFjayhyZXMudXNlckluZm8pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBnbG9iYWxEYXRhOiB7XG4gICAgY29uZmlnOiBnbG9iYWxDb25maWcsXG4gICAgbWVudUluZm86bnVsbFxuICB9XG59KSJdfQ==