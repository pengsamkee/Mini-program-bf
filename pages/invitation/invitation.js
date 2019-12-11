"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loginAPI = require("../../api/login/LoginService");
var globalEnum = require("../../api/GlobalEnum");
var invitation = (function () {
    function invitation() {
        this.data = {
            canIUse: wx.canIUse('button.open-type.getUserInfo'),
            hasCode: false,
            codeInput: "",
            empty: true,
            codeValidate: "",
            showAuth: false,
            userStatus: 1
        };
    }
    invitation.prototype.onLoad = function (option) {
        console.log(option.user_status);
        if (option.user_status == '2' || option.user_status == '3') {
            this.setData({
                userStatus: Number(option.user_status),
                showAuth: true
            });
            console.log(this.data.userStatus);
        }
        if (!this.data.showAuth) {
            wx.setNavigationBarTitle({
                title: "使用小程序"
            });
            wx.showModal({
                content: "我们的测试版小程序目前只对部分用户开放，对所有用户开放的正式版小程序即将上线，敬请期待",
                confirmText: "好的",
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        console.log('');
                    }
                }
            });
        }
    };
    invitation.prototype.onShow = function () {
        this.setData({ hasCode: false });
    };
    invitation.prototype.bindCodeInput = function (event) {
        this.setData({ codeInput: event.detail.value });
        if (this.data.codeInput == "") {
            this.setData({ empty: true, codeValidate: "You do not have the invitation code to use the app" });
        }
        else {
            this.setData({ empty: false, codeValidate: "" });
        }
    };
    invitation.prototype.submit = function (event) {
        var _this = this;
        wx.showLoading({ title: "提交中..." });
        var code = this.data.codeInput.trim();
        wx.login({
            success: function (_res) {
                wx.hideLoading({});
                var req = { jscode: _res.code, invitation_code: code };
                loginAPI.MiniProgramRegister(req).then(function (resp) {
                    if (resp.token && resp.token != "") {
                        wx.setStorageSync(globalEnum.globalKey_token, resp.token);
                        _this.setData({
                            showAuth: true,
                        });
                    }
                    else {
                        wx.showModal({ title: "", content: "验证邀请码失败，请联系客服。", showCancel: false });
                    }
                }).catch(function (err) {
                    console.log(err);
                    wx.hideLoading({});
                    wx.showModal({ title: "", content: err.message, showCancel: false });
                });
            }
        });
    };
    invitation.prototype.bindgetuserInfo = function (e) {
        var _this = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    if (_this.data.userStatus == 1 || _this.data.userStatus == 2) {
                        wx.reLaunch({
                            url: '../onBoard/onBoard'
                        });
                    }
                    else if (_this.data.userStatus == 3) {
                        console.log('home page');
                        wx.reLaunch({
                            url: '../../pages/foodDiary/index'
                        });
                    }
                }
            }
        });
    };
    return invitation;
}());
Page(new invitation());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludml0YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsaURBQW1EO0FBR25EO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFDWixPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztZQUNuRCxPQUFPLEVBQUUsS0FBSztZQUNkLFNBQVMsRUFBRSxFQUFFO1lBQ2IsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsRUFBRTtZQUNoQixRQUFRLEVBQUUsS0FBSztZQUNmLFVBQVUsRUFBRSxDQUFDO1NBQ2QsQ0FBQTtJQXdGSCxDQUFDO0lBdEZRLDJCQUFNLEdBQWIsVUFBYyxNQUFNO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQy9CLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxHQUFHLElBQUUsTUFBTSxDQUFDLFdBQVcsSUFBSSxHQUFHLEVBQUU7WUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDWCxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3RDLFFBQVEsRUFBRSxJQUFJO2FBQ2YsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ2xDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDdkIsS0FBSyxFQUFFLE9BQU87YUFDZixDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNYLE9BQU8sRUFBRSw2Q0FBNkM7Z0JBQ3RELFdBQVcsRUFBRSxJQUFJO2dCQUNqQixVQUFVLEVBQUUsS0FBSztnQkFDakIsT0FBTyxFQUFFLFVBQVUsR0FBRztv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QUssQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRTt3QkFDNUQsRUFBRSxDQUFDLFFBQVEsQ0FBQzs0QkFDVixHQUFHLEVBQUUsb0JBQW9CO3lCQUMxQixDQUFDLENBQUM7cUJBQ0o7eUJBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUU7d0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7d0JBQ3hCLEVBQUUsQ0FBQyxRQUFRLENBQUM7NEJBQ1YsR0FBRyxFQUFFLDZCQUE2Qjt5QkFDbkMsQ0FBQyxDQUFDO3FCQUNKO2lCQUNGO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUFqR0QsSUFpR0M7QUFFRCxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSdcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuXG5cbmNsYXNzIGludml0YXRpb24ge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBjYW5JVXNlOiB3eC5jYW5JVXNlKCdidXR0b24ub3Blbi10eXBlLmdldFVzZXJJbmZvJyksXG4gICAgaGFzQ29kZTogZmFsc2UsXG4gICAgY29kZUlucHV0OiBcIlwiLFxuICAgIGVtcHR5OiB0cnVlLFxuICAgIGNvZGVWYWxpZGF0ZTogXCJcIixcbiAgICBzaG93QXV0aDogZmFsc2UsXG4gICAgdXNlclN0YXR1czogMVxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb24pOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZyhvcHRpb24udXNlcl9zdGF0dXMpXG4gICAgaWYgKG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMid8fG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMycpIHtcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIHVzZXJTdGF0dXM6IE51bWJlcihvcHRpb24udXNlcl9zdGF0dXMpLFxuICAgICAgICBzaG93QXV0aDogdHJ1ZVxuICAgICAgfSlcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS51c2VyU3RhdHVzKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5kYXRhLnNob3dBdXRoKSB7XG4gICAgICB3eC5zZXROYXZpZ2F0aW9uQmFyVGl0bGUoe1xuICAgICAgICB0aXRsZTogXCLkvb/nlKjlsI/nqIvluo9cIlxuICAgICAgfSk7XG5cbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIGNvbnRlbnQ6IFwi5oiR5Lus55qE5rWL6K+V54mI5bCP56iL5bqP55uu5YmN5Y+q5a+56YOo5YiG55So5oi35byA5pS+77yM5a+55omA5pyJ55So5oi35byA5pS+55qE5q2j5byP54mI5bCP56iL5bqP5Y2z5bCG5LiK57q/77yM5pWs6K+35pyf5b6FXCIsXG4gICAgICAgIGNvbmZpcm1UZXh0OiBcIuWlveeahFwiLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaGFzQ29kZTogZmFsc2UgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZENvZGVJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgY29kZUlucHV0OiBldmVudC5kZXRhaWwudmFsdWUgfSk7XG5cbiAgICBpZiAodGhpcy5kYXRhLmNvZGVJbnB1dCA9PSBcIlwiKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBlbXB0eTogdHJ1ZSwgY29kZVZhbGlkYXRlOiBcIllvdSBkbyBub3QgaGF2ZSB0aGUgaW52aXRhdGlvbiBjb2RlIHRvIHVzZSB0aGUgYXBwXCIgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGVtcHR5OiBmYWxzZSwgY29kZVZhbGlkYXRlOiBcIlwiIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdWJtaXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLmj5DkuqTkuK0uLi5cIiB9KTtcbiAgICBsZXQgY29kZSA9IHRoaXMuZGF0YS5jb2RlSW5wdXQudHJpbSgpO1xuICAgIHd4LmxvZ2luKHtcbiAgICAgIHN1Y2Nlc3MoX3Jlcykge1xuICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgIGxldCByZXEgPSB7IGpzY29kZTogX3Jlcy5jb2RlLCBpbnZpdGF0aW9uX2NvZGU6IGNvZGUgfTtcbiAgICAgICAgbG9naW5BUEkuTWluaVByb2dyYW1SZWdpc3RlcihyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgaWYgKHJlc3AudG9rZW4gJiYgcmVzcC50b2tlbiAhPSBcIlwiKSB7XG4gICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgcmVzcC50b2tlbik7XG4gICAgICAgICAgICBfdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgICAgc2hvd0F1dGg6IHRydWUsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCJcIiwgY29udGVudDogXCLpqozor4HpgoDor7fnoIHlpLHotKXvvIzor7fogZTns7vlrqLmnI3jgIJcIiwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBlcnIubWVzc2FnZSwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHB1YmxpYyBiaW5kZ2V0dXNlckluZm8oZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDEgfHwgX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDIpIHtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgICAgICAgICAgdXJsOiAnLi4vb25Cb2FyZC9vbkJvYXJkJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChfdGhpcy5kYXRhLnVzZXJTdGF0dXMgPT0gMykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2hvbWUgcGFnZScpXG4gICAgICAgICAgICB3eC5yZUxhdW5jaCh7XG4gICAgICAgICAgICAgIHVybDogJy4uLy4uL3BhZ2VzL2Zvb2REaWFyeS9pbmRleCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuUGFnZShuZXcgaW52aXRhdGlvbigpKTtcbiJdfQ==