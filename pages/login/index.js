"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalEnum = require("../../api/GlobalEnum");
var loginAPI = require("../../api/login/LoginService");
var app = getApp();
var LoginPage = (function () {
    function LoginPage() {
        this.data = {
            scope: "",
            code: '',
            userStatus: 1,
            showAuth: false,
            indicatorDots: true,
            autoplay: true,
            background: ['https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/tmp_45d4676e4716b3dce4a0a77636971780.png', 'https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/tmp_8a334145fcb50b643551503c814bc668.png'],
        };
    }
    LoginPage.prototype.onLoad = function (option) {
        console.log(option.user_status);
        if (option.user_status == '2' || option.user_status == '3') {
            this.setData({
                userStatus: Number(option.user_status),
                showAuth: true,
                code: '1'
            });
        }
    };
    LoginPage.prototype.submit = function (event) {
        var _this = this;
        wx.showLoading({ title: "提交中..." });
        var code = this.data.code.trim();
        wx.login({
            success: function (_res) {
                wx.hideLoading({});
                var req = { jscode: _res.code, invitation_code: code };
                loginAPI.MiniProgramRegister(req).then(function (resp) {
                    if (resp.token && resp.token != "") {
                        wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                        wx.reLaunch({ url: "/pages/onBoard/onBoard" });
                    }
                    else {
                        wx.showModal({ title: "", content: "验证邀请码失败，请联系客服。", showCancel: false });
                    }
                }).catch(function (err) {
                    wx.hideLoading({});
                    _this.setData({
                        code: ''
                    });
                    wx.showModal({ title: "", content: err.message, showCancel: false });
                });
            }
        });
    };
    LoginPage.prototype.bindGetUserInfo = function (e) {
        var _this = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    if (_this.data.userStatus == 1) {
                        if (_this.data.code) {
                            _this.submit();
                        }
                        else {
                            wx.showToast({
                                title: '请先输入邀请码',
                                icon: "none"
                            });
                        }
                    }
                    else if (_this.data.userStatus == 2) {
                        wx.reLaunch({
                            url: '../onBoard/onBoard'
                        });
                    }
                    else {
                        wx.reLaunch({
                            url: '../../pages/foodDiary/index'
                        });
                    }
                }
                else {
                    wx.showToast({
                        title: '请先微信授权',
                        icon: "none"
                    });
                }
            }
        });
    };
    LoginPage.prototype.handleInput = function (e) {
        this.setData({
            code: e.detail.value.trim()
        });
    };
    return LoginPage;
}());
Page(new LoginPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFrRDtBQUNsRCx1REFBd0Q7QUFDeEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUI7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFDLEVBQUU7WUFDUCxVQUFVLEVBQUMsQ0FBQztZQUNaLFFBQVEsRUFBQyxLQUFLO1lBQ2QsYUFBYSxFQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFDLElBQUk7WUFDYixVQUFVLEVBQUUsQ0FBQyw4R0FBOEcsRUFBQyw4R0FBOEcsQ0FBQztTQUM1TyxDQUFBO0lBOEVILENBQUM7SUE1RVEsMEJBQU0sR0FBYixVQUFjLE1BQU07UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDL0IsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEdBQUcsRUFBRTtZQUN6RCxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3RDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLElBQUksRUFBQyxHQUFHO2FBQ1QsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDO0lBRU0sMEJBQU0sR0FBYixVQUFjLEtBQVU7UUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ1AsT0FBTyxZQUFDLElBQUk7Z0JBQ1Ys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ICcuLi8uLi9hcHAnXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcblxuY2xhc3MgTG9naW5QYWdlIHtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgc2NvcGU6IFwiXCIsXG4gICAgY29kZTonJyxcbiAgICB1c2VyU3RhdHVzOjEsXG4gICAgc2hvd0F1dGg6ZmFsc2UsXG4gICAgaW5kaWNhdG9yRG90czp0cnVlLFxuICAgIGF1dG9wbGF5OnRydWUsXG4gICAgYmFja2dyb3VuZDogWydodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL3RtcF80NWQ0Njc2ZTQ3MTZiM2RjZTRhMGE3NzYzNjk3MTc4MC5wbmcnLCdodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL3RtcF84YTMzNDE0NWZjYjUwYjY0MzU1MTUwM2M4MTRiYzY2OC5wbmcnXSxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uKSB7XG4gICAgY29uc29sZS5sb2cob3B0aW9uLnVzZXJfc3RhdHVzKVxuICAgIGlmIChvcHRpb24udXNlcl9zdGF0dXMgPT0gJzInIHx8IG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMycpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHVzZXJTdGF0dXM6IE51bWJlcihvcHRpb24udXNlcl9zdGF0dXMpLFxuICAgICAgICBzaG93QXV0aDogdHJ1ZSxcbiAgICAgICAgY29kZTonMSdcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN1Ym1pdChldmVudDogYW55KTogdm9pZCB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuaPkOS6pOS4rS4uLlwiIH0pO1xuICAgIGxldCBjb2RlID0gdGhpcy5kYXRhLmNvZGUudHJpbSgpO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgIGxldCByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlLCBpbnZpdGF0aW9uX2NvZGU6IGNvZGUgfTtcbiAgICAgICAgbG9naW5BUEkuTWluaVByb2dyYW1SZWdpc3RlcihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgaWYgKHJlc3AudG9rZW4gJiYgcmVzcC50b2tlbiAhPSBcIlwiKSB7XG4gICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICB3eC5yZUxhdW5jaCh7IHVybDogXCIvcGFnZXMvb25Cb2FyZC9vbkJvYXJkXCIgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBcIumqjOivgemCgOivt+eggeWksei0pe+8jOivt+iBlOezu+WuouacjeOAglwiLCBzaG93Q2FuY2VsOiBmYWxzZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY29kZTonJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBlcnIubWVzc2FnZSwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRHZXRVc2VySW5mbyhlKSB7XG4gICAgdmFyIF90aGlzOmFueSA9IHRoaXM7XG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDEpe1xuICAgICAgICAgICAgaWYgKF90aGlzLmRhdGEuY29kZSl7XG4gICAgICAgICAgICAgIF90aGlzLnN1Ym1pdCgpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICB0aXRsZTon6K+35YWI6L6T5YWl6YKA6K+356CBJyxcbiAgICAgICAgICAgICAgICBpY29uOlwibm9uZVwiXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChfdGhpcy5kYXRhLnVzZXJTdGF0dXMgPT0gMil7XG4gICAgICAgICAgICB3eC5yZUxhdW5jaCh7XG4gICAgICAgICAgICAgIHVybDogJy4uL29uQm9hcmQvb25Cb2FyZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgICAgICB1cmw6ICcuLi8uLi9wYWdlcy9mb29kRGlhcnkvaW5kZXgnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICB0aXRsZTogJ+ivt+WFiOW+ruS/oeaOiOadgycsXG4gICAgICAgICAgICBpY29uOiBcIm5vbmVcIlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGhhbmRsZUlucHV0KGU6YW55KSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvZGUgOiBlLmRldGFpbC52YWx1ZS50cmltKClcbiAgICB9KVxuICB9XG4gXG59XG5cblBhZ2UobmV3IExvZ2luUGFnZSgpKVxuIl19