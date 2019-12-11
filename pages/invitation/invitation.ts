import * as loginAPI from '../../api/login/LoginService'
import * as globalEnum from '../../api/GlobalEnum';


class invitation {
  public data = {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasCode: false,
    codeInput: "",
    empty: true,
    codeValidate: "",
    showAuth: false,
    userStatus: 1
  }

  public onLoad(option): void {
    console.log(option.user_status)
    if (option.user_status == '2'||option.user_status == '3') {
      this.setData({
        userStatus: Number(option.user_status),
        showAuth: true
      })
      console.log(this.data.userStatus)
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
            console.log('')
          }
        }
      })
    }
  }

  public onShow(): void {
    (this as any).setData({ hasCode: false });
  }

  public bindCodeInput(event: any): void {
    (this as any).setData({ codeInput: event.detail.value });

    if (this.data.codeInput == "") {
      (this as any).setData({ empty: true, codeValidate: "You do not have the invitation code to use the app" });
    } else {
      (this as any).setData({ empty: false, codeValidate: "" });
    }
  }

  public submit(event: any): void {
    var _this = this;
    wx.showLoading({ title: "提交中..." });
    let code = this.data.codeInput.trim();
    wx.login({
      success(_res) {
        wx.hideLoading({});
        let req = { jscode: _res.code, invitation_code: code };
        loginAPI.MiniProgramRegister(req).then(resp => {
          if (resp.token && resp.token != "") {
            wx.setStorageSync(globalEnum.globalKey_token, resp.token);
            _this.setData({
              showAuth: true,
            })
          } else {
            wx.showModal({ title: "", content: "验证邀请码失败，请联系客服。", showCancel: false });
          }
        }).catch(err => {
          console.log(err);
          wx.hideLoading({});
          wx.showModal({ title: "", content: err.message, showCancel: false });
        });
      }
    });
  }
  public bindgetuserInfo(e) {
    var _this = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          if (_this.data.userStatus == 1 || _this.data.userStatus == 2) {
            wx.reLaunch({
              url: '../onBoard/onBoard'
            });
          } else if (_this.data.userStatus == 3) {
            console.log('home page')
            wx.reLaunch({
              url: '../../pages/foodDiary/index'
            });
          }
        }
      }
    })
  }
}

Page(new invitation());
