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
            checked: false,
            showAgreeText: false,
            agreement: [
                {
                    title: '一、定义', content: '很多个很短很短个和豆腐干分工会的个低功耗好机会电饭锅见到过点击蝶粉蜂黄返回'
                },
                {
                    title: '三、定义', content: '很多个很短很短个和豆腐干分工会的个低功耗好机会电饭锅见到过点击蝶粉蜂黄返'
                }
            ]
        };
    }
    LoginPage.prototype.onLoad = function (option) {
        console.log(option.user_status);
        if (option.user_status == '2' || option.user_status == '3') {
            this.setData({
                userStatus: Number(option.user_status),
                showAuth: true,
                code: '1',
                checked: true
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
                        wx.showModal({
                            title: "",
                            content: "验证邀请码失败，请联系客服。",
                            showCancel: false
                        });
                        _this.setData({
                            code: ''
                        });
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
                        if (_this.data.code && _this.data.checked) {
                            _this.submit();
                        }
                        else if (!_this.data.code) {
                            wx.showToast({
                                title: '请先输入邀请码',
                                icon: "none"
                            });
                        }
                        else {
                            wx.showToast({
                                title: '请先同意用户协议',
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
                            url: '../../pages/home/index'
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
    LoginPage.prototype.handleToogleAgree = function () {
        this.setData({
            checked: !this.data.checked
        });
    };
    LoginPage.prototype.handleConfirmAgree = function () {
        this.setData({
            checked: true,
            showAgreeText: false
        });
    };
    LoginPage.prototype.showAgreeText = function () {
        this.setData({
            showAgreeText: true
        });
    };
    LoginPage.prototype.closeAgreeText = function () {
        this.setData({
            showAgreeText: false
        });
    };
    return LoginPage;
}());
Page(new LoginPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFrRDtBQUNsRCx1REFBd0Q7QUFDeEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUI7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFDLEVBQUU7WUFDUCxVQUFVLEVBQUMsQ0FBQztZQUNaLFFBQVEsRUFBQyxLQUFLO1lBQ2QsYUFBYSxFQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFDLElBQUk7WUFDYixVQUFVLEVBQUUsQ0FBQyw4R0FBOEcsRUFBQyw4R0FBOEcsQ0FBQztZQUMzTyxPQUFPLEVBQUMsS0FBSztZQUNiLGFBQWEsRUFBQyxLQUFLO1lBQ25CLFNBQVMsRUFBQztnQkFDUjtvQkFDRSxLQUFLLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyx1Q0FBdUM7aUJBQzdEO2dCQUNEO29CQUNFLEtBQUssRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLHNDQUFzQztpQkFDNUQ7YUFDRjtTQUNGLENBQUE7SUFnSEgsQ0FBQztJQTlHUSwwQkFBTSxHQUFiLFVBQWMsTUFBTTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUMvQixJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksR0FBRyxFQUFFO1lBQ3pELElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDdEMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsSUFBSSxFQUFDLEdBQUc7Z0JBQ1IsT0FBTyxFQUFDLElBQUk7YUFDYixDQUFDLENBQUE7U0FDSDtJQUNILENBQUM7SUFFTSwwQkFBTSxHQUFiLFVBQWMsS0FBVTtRQUN0QixJQUFJLEtBQUss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Q1YsR0FBRyxFQUFFLHdCQUF3Qjt5QkFDOUIsQ0FBQyxDQUFDO3FCQUNKO2lCQUNGO3FCQUFJO29CQUNILEVBQUUsQ0FBQyxTQUFTLENBQUM7d0JBQ1gsS0FBSyxFQUFFLFFBQVE7d0JBQ2YsSUFBSSxFQUFFLE1BQU07cUJBQ2IsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSwrQkFBVyxHQUFsQixVQUFtQixDQUFLO1FBQ3JCLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsSUFBSSxFQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtTQUM3QixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ00scUNBQWlCLEdBQXhCO1FBQ0csSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87U0FDNUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNNLHNDQUFrQixHQUF6QjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsT0FBTyxFQUFFLElBQUk7WUFDYixhQUFhLEVBQUMsS0FBSztTQUNwQixDQUFDLENBQUE7SUFDSixDQUFDO0lBRU0saUNBQWEsR0FBcEI7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDTSxrQ0FBYyxHQUFyQjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsYUFBYSxFQUFFLEtBQUs7U0FDckIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQW5JRCxJQW1JQztBQUVELElBQUksQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0ICogYXMgbG9naW5BUEkgZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSdcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcblxuY2xhc3MgTG9naW5QYWdlIHtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgc2NvcGU6IFwiXCIsXG4gICAgY29kZTonJyxcbiAgICB1c2VyU3RhdHVzOjEsXG4gICAgc2hvd0F1dGg6ZmFsc2UsXG4gICAgaW5kaWNhdG9yRG90czp0cnVlLFxuICAgIGF1dG9wbGF5OnRydWUsXG4gICAgYmFja2dyb3VuZDogWydodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL3RtcF80NWQ0Njc2ZTQ3MTZiM2RjZTRhMGE3NzYzNjk3MTc4MC5wbmcnLCdodHRwczovL2RpZXRsZW5zLTEyNTg2NjU1NDcuY29zLmFwLXNoYW5naGFpLm15cWNsb3VkLmNvbS9mb29kLWltYWdlL3RtcF84YTMzNDE0NWZjYjUwYjY0MzU1MTUwM2M4MTRiYzY2OC5wbmcnXSxcbiAgICBjaGVja2VkOmZhbHNlLFxuICAgIHNob3dBZ3JlZVRleHQ6ZmFsc2UsXG4gICAgYWdyZWVtZW50OltcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6J+S4gOOAgeWumuS5iScsY29udGVudDon5b6I5aSa5Liq5b6I55+t5b6I55+t5Liq5ZKM6LGG6IWQ5bmy5YiG5bel5Lya55qE5Liq5L2O5Yqf6ICX5aW95py65Lya55S16aWt6ZSF6KeB5Yiw6L+H54K55Ye76J2257KJ6JyC6buE6L+U5ZueJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6J+S4ieOAgeWumuS5iScsY29udGVudDon5b6I5aSa5Liq5b6I55+t5b6I55+t5Liq5ZKM6LGG6IWQ5bmy5YiG5bel5Lya55qE5Liq5L2O5Yqf6ICX5aW95py65Lya55S16aWt6ZSF6KeB5Yiw6L+H54K55Ye76J2257KJ6JyC6buE6L+UJ1xuICAgICAgfVxuICAgIF1cbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uKSB7XG4gICAgY29uc29sZS5sb2cob3B0aW9uLnVzZXJfc3RhdHVzKVxuICAgIGlmIChvcHRpb24udXNlcl9zdGF0dXMgPT0gJzInIHx8IG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMycpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHVzZXJTdGF0dXM6IE51bWJlcihvcHRpb24udXNlcl9zdGF0dXMpLFxuICAgICAgICBzaG93QXV0aDogdHJ1ZSxcbiAgICAgICAgY29kZTonMScsXG4gICAgICAgIGNoZWNrZWQ6dHJ1ZVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3VibWl0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5o+Q5Lqk5LitLi4uXCIgfSk7XG4gICAgbGV0IGNvZGUgPSB0aGlzLmRhdGEuY29kZS50cmltKCk7XG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgbGV0IHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUsIGludml0YXRpb25fY29kZTogY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbVJlZ2lzdGVyKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBpZiAocmVzcC50b2tlbiAmJiByZXNwLnRva2VuICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiBcIi9wYWdlcy9vbkJvYXJkL29uQm9hcmRcIiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgXG4gICAgICAgICAgICAgIHRpdGxlOiBcIlwiLCBcbiAgICAgICAgICAgICAgY29udGVudDogXCLpqozor4HpgoDor7fnoIHlpLHotKXvvIzor7fogZTns7vlrqLmnI3jgIJcIiwgXG4gICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgICBjb2RlOiAnJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY29kZTonJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBlcnIubWVzc2FnZSwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRHZXRVc2VySW5mbyhlKSB7XG4gICAgdmFyIF90aGlzOmFueSA9IHRoaXM7XG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDEpe1xuICAgICAgICAgICAgaWYgKF90aGlzLmRhdGEuY29kZSAmJiBfdGhpcy5kYXRhLmNoZWNrZWQpe1xuICAgICAgICAgICAgICBfdGhpcy5zdWJtaXQoKVxuICAgICAgICAgICAgfWVsc2UgaWYoIV90aGlzLmRhdGEuY29kZSl7XG4gICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6J+ivt+WFiOi+k+WFpemCgOivt+eggScsXG4gICAgICAgICAgICAgICAgaWNvbjpcIm5vbmVcIlxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6J+ivt+WFiOWQjOaEj+eUqOaIt+WNj+iuricsXG4gICAgICAgICAgICAgICAgaWNvbjpcIm5vbmVcIlxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDIpe1xuICAgICAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgICAgICB1cmw6ICcuLi9vbkJvYXJkL29uQm9hcmQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgICAgICAgICAgdXJsOiAnLi4vLi4vcGFnZXMvaG9tZS9pbmRleCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgIHRpdGxlOiAn6K+35YWI5b6u5L+h5o6I5p2DJyxcbiAgICAgICAgICAgIGljb246IFwibm9uZVwiXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgaGFuZGxlSW5wdXQoZTphbnkpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY29kZSA6IGUuZGV0YWlsLnZhbHVlLnRyaW0oKVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZVRvb2dsZUFncmVlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNoZWNrZWQ6ICF0aGlzLmRhdGEuY2hlY2tlZFxuICAgIH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZUNvbmZpcm1BZ3JlZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjaGVja2VkOiB0cnVlLFxuICAgICAgc2hvd0FncmVlVGV4dDpmYWxzZVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgc2hvd0FncmVlVGV4dCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBzaG93QWdyZWVUZXh0OiB0cnVlXG4gICAgfSlcbiAgfVxuICBwdWJsaWMgY2xvc2VBZ3JlZVRleHQoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgc2hvd0FncmVlVGV4dDogZmFsc2VcbiAgICB9KVxuICB9XG59XG5cblBhZ2UobmV3IExvZ2luUGFnZSgpKVxuIl19