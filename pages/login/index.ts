import { IMyApp } from '../../app'
import * as globalEnum from '../../api/GlobalEnum'
import * as loginAPI from '../../api/login/LoginService'
const app = getApp<IMyApp>()

class LoginPage {
  public data = {
    scope: "",
    code:'',
    userStatus:1,
    showAuth:false,
    indicatorDots:true,
    autoplay:true,
    background: ['https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/tmp_45d4676e4716b3dce4a0a77636971780.png','https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/tmp_8a334145fcb50b643551503c814bc668.png'],
    checked:false,
    showAgreeText:false,
    agreement:[
      {
        title:'一、定义',content:'很多个很短很短个和豆腐干分工会的个低功耗好机会电饭锅见到过点击蝶粉蜂黄返回'
      },
      {
        title:'三、定义',content:'很多个很短很短个和豆腐干分工会的个低功耗好机会电饭锅见到过点击蝶粉蜂黄返'
      }
    ]
  }

  public onLoad(option) {
    console.log(option.user_status)
    if (option.user_status == '2' || option.user_status == '3') {
      (this as any).setData({
        userStatus: Number(option.user_status),
        showAuth: true,
        code:'1',
        checked:true
      })
    }
  }

  public submit(event: any): void {
    var _this = this;
    wx.showLoading({ title: "提交中..." });
    let code = this.data.code.trim();
    wx.login({
      success(_res) {
        wx.hideLoading({});
        let req = { jscode: _res.code, invitation_code: code };
        loginAPI.MiniProgramRegister(req).then(resp => {
          if (resp.token && resp.token != "") {
            wx.setStorageSync(globalEnum.globalKey_token, resp.token);
            wx.reLaunch({ url: "/pages/onBoard/onBoard" });
          } else {
            wx.showModal({ 
              title: "", 
              content: "验证邀请码失败，请联系客服。", 
              showCancel: false
            });
            (_this as any).setData({
              code: ''
            })
          }
        }).catch(err => {
          wx.hideLoading({});
          (_this as any).setData({
            code:''
          });
          wx.showModal({ title: "", content: err.message, showCancel: false });
        });
      }
    });
  }

  public bindGetUserInfo(e) {
    var _this:any = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          if (_this.data.userStatus == 1){
            if (_this.data.code && _this.data.checked){
              _this.submit()
            }else if(!_this.data.code){
              wx.showToast({
                title:'请先输入邀请码',
                icon:"none"
              })
            }else{
              wx.showToast({
                title:'请先同意用户协议',
                icon:"none"
              })
            }
          } else if (_this.data.userStatus == 2){
            wx.reLaunch({
              url: '../onBoard/onBoard'
            });
          }else{
            wx.reLaunch({
              url: '../../pages/home/index'
            });
          }
        }else{
          wx.showToast({
            title: '请先微信授权',
            icon: "none"
          })
        }
      }
    })
  }

  public handleInput(e:any) {
    (this as any).setData({
      code : e.detail.value.trim()
    })
  }
  public handleToogleAgree(){
    (this as any).setData({
      checked: !this.data.checked
    })
  }
  public handleConfirmAgree(){
    (this as any).setData({
      checked: true,
      showAgreeText:false
    })
  }

  public showAgreeText(){
    (this as any).setData({
      showAgreeText: true
    })
  }
  public closeAgreeText(){
    (this as any).setData({
      showAgreeText: false
    })
  }
}

Page(new LoginPage())
