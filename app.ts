//app.ts
export interface IMyApp {
  userInfoReadyCallback?(res: wx.UserInfo): void
  globalData: {
    userInfo?: wx.UserInfo,
    profileData?: {
      birthday: -1,
      height: -1,
      weight: -1,
      currentWeight: -1,
      pregnancyStatusIndex: -1,
      activityLevelIndex: -1,
      pregnancyWeeks: -1
    }
  }
}

import * as globalEnum from './api/GlobalEnum'
var webAPI = require('./api/login/LoginService');
import GlobalConfig from './config/index'

const globalConfig = new GlobalConfig()
globalConfig.init()

App<IMyApp>({
  onLaunch() {
    /**
     * 获取右上角胶囊尺寸，计算自定义标题栏位置
     */
    const menuInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.menuInfo = menuInfo;
    wx.onNetworkStatusChange(function (res) {
      var networkType = res.networkType
      var isConnected = res.isConnected
      let token = wx.getStorageSync("token");
      if (isConnected && !token) { } 
    })
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res.userInfo)
                console.log(res.userInfo);
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    config: globalConfig,
    menuInfo:null,
    mealDate:null, // 由于路由跳转问题，在非当日上传图片后，再回首页会变成今日
  }
})