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
                        wx.showModal({
                            title: "",
                            content: "验证邀请码失败，请联系客服。",
                            showCancel: false
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
    return LoginPage;
}());
Page(new LoginPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFrRDtBQUNsRCx1REFBd0Q7QUFDeEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUI7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFDLEVBQUU7WUFDUCxVQUFVLEVBQUMsQ0FBQztZQUNaLFFBQVEsRUFBQyxLQUFLO1lBQ2QsYUFBYSxFQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFDLElBQUk7WUFDYixVQUFVLEVBQUUsQ0FBQyw4R0FBOEcsRUFBQyw4R0FBOEcsQ0FBQztTQUM1TyxDQUFBO0lBa0ZILENBQUM7SUFoRlEsMEJBQU0sR0FBYixVQUFjLE1BQU07UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDL0IsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEdBQUcsRUFBRTtZQUN6RCxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3RDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLElBQUksRUFBQyxHQUFHO2FBQ1QsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDO0lBRU0sMEJBQU0sR0FBYixVQUFjLEtBQVU7UUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ1AsT0FBTyxZQUFDLElBQUk7Z0JBQ1Ys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IGZyb20gJy4uLy4uL2FwcCdcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJ1xuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuXG5jbGFzcyBMb2dpblBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBzY29wZTogXCJcIixcbiAgICBjb2RlOicnLFxuICAgIHVzZXJTdGF0dXM6MSxcbiAgICBzaG93QXV0aDpmYWxzZSxcbiAgICBpbmRpY2F0b3JEb3RzOnRydWUsXG4gICAgYXV0b3BsYXk6dHJ1ZSxcbiAgICBiYWNrZ3JvdW5kOiBbJ2h0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvdG1wXzQ1ZDQ2NzZlNDcxNmIzZGNlNGEwYTc3NjM2OTcxNzgwLnBuZycsJ2h0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvdG1wXzhhMzM0MTQ1ZmNiNTBiNjQzNTUxNTAzYzgxNGJjNjY4LnBuZyddLFxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb24pIHtcbiAgICBjb25zb2xlLmxvZyhvcHRpb24udXNlcl9zdGF0dXMpXG4gICAgaWYgKG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMicgfHwgb3B0aW9uLnVzZXJfc3RhdHVzID09ICczJykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdXNlclN0YXR1czogTnVtYmVyKG9wdGlvbi51c2VyX3N0YXR1cyksXG4gICAgICAgIHNob3dBdXRoOiB0cnVlLFxuICAgICAgICBjb2RlOicxJ1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc3VibWl0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5o+Q5Lqk5LitLi4uXCIgfSk7XG4gICAgbGV0IGNvZGUgPSB0aGlzLmRhdGEuY29kZS50cmltKCk7XG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgbGV0IHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUsIGludml0YXRpb25fY29kZTogY29kZSB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbVJlZ2lzdGVyKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBpZiAocmVzcC50b2tlbiAmJiByZXNwLnRva2VuICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiBcIi9wYWdlcy9vbkJvYXJkL29uQm9hcmRcIiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgXG4gICAgICAgICAgICAgIHRpdGxlOiBcIlwiLCBcbiAgICAgICAgICAgICAgY29udGVudDogXCLpqozor4HpgoDor7fnoIHlpLHotKXvvIzor7fogZTns7vlrqLmnI3jgIJcIiwgXG4gICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY29kZTonJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBlcnIubWVzc2FnZSwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRHZXRVc2VySW5mbyhlKSB7XG4gICAgdmFyIF90aGlzOmFueSA9IHRoaXM7XG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDEpe1xuICAgICAgICAgICAgaWYgKF90aGlzLmRhdGEuY29kZSl7XG4gICAgICAgICAgICAgIF90aGlzLnN1Ym1pdCgpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICB0aXRsZTon6K+35YWI6L6T5YWl6YKA6K+356CBJyxcbiAgICAgICAgICAgICAgICBpY29uOlwibm9uZVwiXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChfdGhpcy5kYXRhLnVzZXJTdGF0dXMgPT0gMil7XG4gICAgICAgICAgICB3eC5yZUxhdW5jaCh7XG4gICAgICAgICAgICAgIHVybDogJy4uL29uQm9hcmQvb25Cb2FyZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgICAgICB1cmw6ICcuLi8uLi9wYWdlcy9ob21lL2luZGV4J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgdGl0bGU6ICfor7flhYjlvq7kv6HmjojmnYMnLFxuICAgICAgICAgICAgaWNvbjogXCJub25lXCJcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVJbnB1dChlOmFueSkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb2RlIDogZS5kZXRhaWwudmFsdWUudHJpbSgpXG4gICAgfSlcbiAgfVxuIFxufVxuXG5QYWdlKG5ldyBMb2dpblBhZ2UoKSlcbiJdfQ==