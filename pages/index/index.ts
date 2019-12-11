//index.js
//获取应用实例
import { IMyApp } from '../../app'
//set up axios adapter
var webAPI = require('../../api/login/LoginService.js');
import * as globalEnum from '../../api/GlobalEnum'
//write a loading page to ensure user login

class IndexPage {
  public data = {

  }

  public onLoad() {
    this.login();
  }

  public login() {
    // 登录
    wx.showLoading({ title: "加载数据中...", mask: true });
    wx.login({
      success(_res) {
        wx.hideLoading({});
        console.log(_res.code)
        // 发送 _res.code 到后台换取 openId, sessionKey, unionId
        var req = { jscode: _res.code };
        webAPI.MiniProgramLogin(req)
          .then(resp => {
            //store token to storage
            var token = resp.token;
            let reportId = resp.report_id;
            console.log("token:" + token);
            console.log("reportId:" + reportId);
            if (token && reportId) {
              wx.setStorageSync(globalEnum.globalKey_token, token);
              wx.setStorageSync(globalEnum.globalKey_reportId, reportId);
            }
            //forward to home report page
            console.log("forward to report index page");
            wx.redirectTo({
              url: '../report/index'
            })
          })
          .catch(err => wx.hideLoading({}));
      }
    })
  };
}

Page(new IndexPage());