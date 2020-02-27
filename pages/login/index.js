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
                var req = { jscode: _res.code, invitation_code: code || 'free202002' };
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
                        if (_this.data.checked) {
                            _this.submit();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFrRDtBQUNsRCx1REFBd0Q7QUFDeEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUI7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFDLEVBQUU7WUFDUCxVQUFVLEVBQUMsQ0FBQztZQUNaLFFBQVEsRUFBQyxLQUFLO1lBQ2QsYUFBYSxFQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFDLElBQUk7WUFDYixVQUFVLEVBQUUsQ0FBQyw4R0FBOEcsRUFBQyw4R0FBOEcsQ0FBQztZQUMzTyxPQUFPLEVBQUMsS0FBSztZQUNiLGFBQWEsRUFBQyxLQUFLO1lBQ25CLFNBQVMsRUFBQztnQkFDUjtvQkFDRSxLQUFLLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyx1Q0FBdUM7aUJBQzdEO2dCQUNEO29CQUNFLEtBQUssRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLHNDQUFzQztpQkFDNUQ7YUFDRjtTQUNGLENBQUE7SUFtSEgsQ0FBQztJQWpIUSwwQkFBTSxHQUFiLFVBQWMsTUFBTTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUMvQixJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksR0FBRyxFQUFFO1lBQ3pELElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDdEMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsSUFBSSxFQUFDLEdBQUc7Z0JBQ1IsT0FBTyxFQUFDLElBQUk7YUFDYixDQUFDLENBQUE7U0FDSDtJQUNILENBQUM7SUFFTSwwQkFBTSxHQUFiLFVBQWMsS0FBVTtRQUN0QixJQUFJLEtBQUss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Q0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLCtCQUFXLEdBQWxCLFVBQW1CLENBQUs7UUFDckIsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixJQUFJLEVBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1NBQzdCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDTSxxQ0FBaUIsR0FBeEI7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztTQUM1QixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ00sc0NBQWtCLEdBQXpCO1FBQ0csSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixPQUFPLEVBQUUsSUFBSTtZQUNiLGFBQWEsRUFBQyxLQUFLO1NBQ3BCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSxpQ0FBYSxHQUFwQjtRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsYUFBYSxFQUFFLElBQUk7U0FDcEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNNLGtDQUFjLEdBQXJCO1FBQ0csSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixhQUFhLEVBQUUsS0FBSztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBdElELElBc0lDO0FBRUQsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nXG5pbXBvcnQgKiBhcyBsb2dpbkFQSSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJ1xuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuXG5jbGFzcyBMb2dpblBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBzY29wZTogXCJcIixcbiAgICBjb2RlOicnLFxuICAgIHVzZXJTdGF0dXM6MSxcbiAgICBzaG93QXV0aDpmYWxzZSxcbiAgICBpbmRpY2F0b3JEb3RzOnRydWUsXG4gICAgYXV0b3BsYXk6dHJ1ZSxcbiAgICBiYWNrZ3JvdW5kOiBbJ2h0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvdG1wXzQ1ZDQ2NzZlNDcxNmIzZGNlNGEwYTc3NjM2OTcxNzgwLnBuZycsJ2h0dHBzOi8vZGlldGxlbnMtMTI1ODY2NTU0Ny5jb3MuYXAtc2hhbmdoYWkubXlxY2xvdWQuY29tL2Zvb2QtaW1hZ2UvdG1wXzhhMzM0MTQ1ZmNiNTBiNjQzNTUxNTAzYzgxNGJjNjY4LnBuZyddLFxuICAgIGNoZWNrZWQ6ZmFsc2UsXG4gICAgc2hvd0FncmVlVGV4dDpmYWxzZSxcbiAgICBhZ3JlZW1lbnQ6W1xuICAgICAge1xuICAgICAgICB0aXRsZTon5LiA44CB5a6a5LmJJyxjb250ZW50OiflvojlpJrkuKrlvojnn63lvojnn63kuKrlkozosYbohZDlubLliIblt6XkvJrnmoTkuKrkvY7lip/ogJflpb3mnLrkvJrnlLXppa3plIXop4HliLDov4fngrnlh7vonbbnsononILpu4Tov5Tlm54nXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTon5LiJ44CB5a6a5LmJJyxjb250ZW50OiflvojlpJrkuKrlvojnn63lvojnn63kuKrlkozosYbohZDlubLliIblt6XkvJrnmoTkuKrkvY7lip/ogJflpb3mnLrkvJrnlLXppa3plIXop4HliLDov4fngrnlh7vonbbnsononILpu4Tov5QnXG4gICAgICB9XG4gICAgXVxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb24pIHtcbiAgICBjb25zb2xlLmxvZyhvcHRpb24udXNlcl9zdGF0dXMpXG4gICAgaWYgKG9wdGlvbi51c2VyX3N0YXR1cyA9PSAnMicgfHwgb3B0aW9uLnVzZXJfc3RhdHVzID09ICczJykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdXNlclN0YXR1czogTnVtYmVyKG9wdGlvbi51c2VyX3N0YXR1cyksXG4gICAgICAgIHNob3dBdXRoOiB0cnVlLFxuICAgICAgICBjb2RlOicxJyxcbiAgICAgICAgY2hlY2tlZDp0cnVlXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzdWJtaXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLmj5DkuqTkuK0uLi5cIiB9KTtcbiAgICBsZXQgY29kZSA9IHRoaXMuZGF0YS5jb2RlLnRyaW0oKTtcbiAgICB3eC5sb2dpbih7XG4gICAgICBzdWNjZXNzKF9yZXMpIHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICBsZXQgcmVxID0geyBqc2NvZGU6IF9yZXMuY29kZSwgaW52aXRhdGlvbl9jb2RlOiBjb2RlIHx8ICdmcmVlMjAyMDAyJyB9O1xuICAgICAgICBsb2dpbkFQSS5NaW5pUHJvZ3JhbVJlZ2lzdGVyKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBpZiAocmVzcC50b2tlbiAmJiByZXNwLnRva2VuICE9IFwiXCIpIHtcbiAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuLCByZXNwLnRva2VuKTtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHsgdXJsOiBcIi9wYWdlcy9vbkJvYXJkL29uQm9hcmRcIiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgXG4gICAgICAgICAgICAgIHRpdGxlOiBcIlwiLCBcbiAgICAgICAgICAgICAgY29udGVudDogXCLpqozor4HpgoDor7fnoIHlpLHotKXvvIzor7fogZTns7vlrqLmnI3jgIJcIiwgXG4gICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgICBjb2RlOiAnJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgIChfdGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY29kZTonJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBlcnIubWVzc2FnZSwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRHZXRVc2VySW5mbyhlKSB7XG4gICAgdmFyIF90aGlzOmFueSA9IHRoaXM7XG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDEpe1xuICAgICAgICAgICAgLy8gaWYgKF90aGlzLmRhdGEuY29kZSAmJiBfdGhpcy5kYXRhLmNoZWNrZWQpe1xuICAgICAgICAgICAgaWYgKF90aGlzLmRhdGEuY2hlY2tlZCl7XG4gICAgICAgICAgICAgIF90aGlzLnN1Ym1pdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbHNlIGlmKCFfdGhpcy5kYXRhLmNvZGUpe1xuICAgICAgICAgICAgICAvLyB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAvLyAgIHRpdGxlOifor7flhYjovpPlhaXpgoDor7fnoIEnLFxuICAgICAgICAgICAgICAvLyAgIGljb246XCJub25lXCJcbiAgICAgICAgICAgICAgLy8gfSlcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6J+ivt+WFiOWQjOaEj+eUqOaIt+WNj+iuricsXG4gICAgICAgICAgICAgICAgaWNvbjpcIm5vbmVcIlxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuZGF0YS51c2VyU3RhdHVzID09IDIpe1xuICAgICAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgICAgICB1cmw6ICcuLi9vbkJvYXJkL29uQm9hcmQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgICAgICAgICAgdXJsOiAnLi4vLi4vcGFnZXMvaG9tZS9pbmRleCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgIHRpdGxlOiAn6K+35YWI5b6u5L+h5o6I5p2DJyxcbiAgICAgICAgICAgIGljb246IFwibm9uZVwiXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgaGFuZGxlSW5wdXQoZTphbnkpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY29kZSA6IGUuZGV0YWlsLnZhbHVlLnRyaW0oKVxuICAgIH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZVRvb2dsZUFncmVlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNoZWNrZWQ6ICF0aGlzLmRhdGEuY2hlY2tlZFxuICAgIH0pXG4gIH1cbiAgcHVibGljIGhhbmRsZUNvbmZpcm1BZ3JlZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjaGVja2VkOiB0cnVlLFxuICAgICAgc2hvd0FncmVlVGV4dDpmYWxzZVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgc2hvd0FncmVlVGV4dCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBzaG93QWdyZWVUZXh0OiB0cnVlXG4gICAgfSlcbiAgfVxuICBwdWJsaWMgY2xvc2VBZ3JlZVRleHQoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgc2hvd0FncmVlVGV4dDogZmFsc2VcbiAgICB9KVxuICB9XG59XG5cblBhZ2UobmV3IExvZ2luUGFnZSgpKVxuIl19