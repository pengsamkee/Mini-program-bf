"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require('./api/login/LoginService');
var index_1 = require("./config/index");
var globalConfig = new index_1.default();
globalConfig.init();
App({
    onLaunch: function () {
        var _this = this;
        console.log("app launch...");
        console.log("set up network status change");
        wx.onNetworkStatusChange(function (res) {
            var networkType = res.networkType;
            var isConnected = res.isConnected;
            var token = wx.getStorageSync("token");
            console.log(networkType);
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
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELHdDQUF5QztBQUV6QyxJQUFNLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFBO0FBQ3ZDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUVuQixHQUFHLENBQVM7SUFDVixRQUFRO1FBQVIsaUJBbUNDO1FBOUJDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEdBQUc7WUFDcEMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQTtZQUNqQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFBO1lBQ2pDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHO1FBQ2hDLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLE9BQU8sRUFBRSxVQUFDLEdBQUc7Z0JBQ1gsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBRXJDLEVBQUUsQ0FBQyxXQUFXLENBQUM7d0JBQ2IsT0FBTyxFQUFFLFVBQUEsR0FBRzs0QkFFVixLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBOzRCQUd2QyxJQUFJLEtBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDOUIsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQ0FDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQzNCO3dCQUNILENBQUM7cUJBQ0YsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxVQUFVLEVBQUU7UUFDVixNQUFNLEVBQUUsWUFBWTtLQUNyQjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vYXBwLnRzXG5leHBvcnQgaW50ZXJmYWNlIElNeUFwcCB7XG4gIHVzZXJJbmZvUmVhZHlDYWxsYmFjaz8ocmVzOiB3eC5Vc2VySW5mbyk6IHZvaWRcbiAgZ2xvYmFsRGF0YToge1xuICAgIHVzZXJJbmZvPzogd3guVXNlckluZm8sXG4gICAgcHJvZmlsZURhdGE/OiB7XG4gICAgICBiaXJ0aGRheTogLTEsXG4gICAgICBoZWlnaHQ6IC0xLFxuICAgICAgd2VpZ2h0OiAtMSxcbiAgICAgIGN1cnJlbnRXZWlnaHQ6IC0xLFxuICAgICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IC0xLFxuICAgICAgYWN0aXZpdHlMZXZlbEluZGV4OiAtMSxcbiAgICAgIHByZWduYW5jeVdlZWtzOiAtMVxuICAgIH1cbiAgfVxufVxuXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4vYXBpL0dsb2JhbEVudW0nXG52YXIgd2ViQVBJID0gcmVxdWlyZSgnLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJyk7XG5pbXBvcnQgR2xvYmFsQ29uZmlnIGZyb20gJy4vY29uZmlnL2luZGV4J1xuXG5jb25zdCBnbG9iYWxDb25maWcgPSBuZXcgR2xvYmFsQ29uZmlnKClcbmdsb2JhbENvbmZpZy5pbml0KClcblxuQXBwPElNeUFwcD4oe1xuICBvbkxhdW5jaCgpIHtcbiAgICAvLyDlsZXnpLrmnKzlnLDlrZjlgqjog73liptcbiAgICAvLyB2YXIgbG9nczogbnVtYmVyW10gPSB3eC5nZXRTdG9yYWdlU3luYygnbG9ncycpIHx8IFtdXG4gICAgLy8gbG9ncy51bnNoaWZ0KERhdGUubm93KCkpXG4gICAgLy8gd3guc2V0U3RvcmFnZVN5bmMoJ2xvZ3MnLCBsb2dzKVxuICAgIGNvbnNvbGUubG9nKFwiYXBwIGxhdW5jaC4uLlwiKTtcbiAgICAvL25ldHdvcmsgc3RhdHVzXG4gICAgY29uc29sZS5sb2coXCJzZXQgdXAgbmV0d29yayBzdGF0dXMgY2hhbmdlXCIpO1xuICAgIHd4Lm9uTmV0d29ya1N0YXR1c0NoYW5nZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICB2YXIgbmV0d29ya1R5cGUgPSByZXMubmV0d29ya1R5cGVcbiAgICAgIHZhciBpc0Nvbm5lY3RlZCA9IHJlcy5pc0Nvbm5lY3RlZFxuICAgICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICAgIGNvbnNvbGUubG9nKG5ldHdvcmtUeXBlKTtcbiAgICAgIGlmIChpc0Nvbm5lY3RlZCAmJiAhdG9rZW4pIHsgfSAvL3JlLWxvZ2luIHdoZW4gbm8gdG9rZW4gc3RvcmFnZSBhbmQgY29ubmVjdCB0byBJbnRlcm5ldFxuICAgIH0pXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICAvLyDlt7Lnu4/mjojmnYPvvIzlj6/ku6Xnm7TmjqXosIPnlKggZ2V0VXNlckluZm8g6I635Y+W5aS05YOP5pi156ew77yM5LiN5Lya5by55qGGXG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICAgICAgLy8g5Y+v5Lul5bCGIHJlcyDlj5HpgIHnu5nlkI7lj7Dop6PnoIHlh7ogdW5pb25JZFxuICAgICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEudXNlckluZm8gPSByZXMudXNlckluZm9cbiAgICAgICAgICAgICAgLy8g55Sx5LqOIGdldFVzZXJJbmZvIOaYr+e9kee7nOivt+axgu+8jOWPr+iDveS8muWcqCBQYWdlLm9uTG9hZCDkuYvlkI7miY3ov5Tlm55cbiAgICAgICAgICAgICAgLy8g5omA5Lul5q2k5aSE5Yqg5YWlIGNhbGxiYWNrIOS7pemYsuatoui/meenjeaDheWGtVxuICAgICAgICAgICAgICBpZiAodGhpcy51c2VySW5mb1JlYWR5Q2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJJbmZvUmVhZHlDYWxsYmFjayhyZXMudXNlckluZm8pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBnbG9iYWxEYXRhOiB7XG4gICAgY29uZmlnOiBnbG9iYWxDb25maWcsXG4gIH1cbn0pIl19