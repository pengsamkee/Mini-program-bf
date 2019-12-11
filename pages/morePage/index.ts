//index.js

const app = getApp<IMyApp>()
import * as webAPI from '../../api/app/AppService';

class morePage {
  public data = {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  }

  public bindViewTap(): void {
    wx.navigateTo({
      url: '../logs/logs'
    })
  }

  public handlePortfolioPageNav(): void {
    wx.navigateTo({
      url: '/pages/portfolio/index'
    })
  }

  public handleNutriDatabaseNav(): void {
    wx.navigateTo({
      url: '/pages/nutritionalDatabasePage/index'
    })
  }

  public handleweightRecordNav(): void {
    wx.navigateTo({
      url: '/pages/weightRecord/index'
    })
  }

  public handleRDINav(): void {
    webAPI.RetrieveUserRDA({}).then(resp => {
      let rdaUrl = resp.rda_url;
      wx.navigateTo({ url: '../../pages/rdiPage/rdiPage?url=' + rdaUrl });
    }).catch(err => {
      console.log(err);
      wx.showModal({
        title: '',
        content: '获取推荐值失败',
        showCancel: false
      });
    });
    // wx.navigateTo({
    //   url: '/pages/rdiGoal/index'
    // })
  }

  // public handleCustomerServiceCP() {
  //   wx.setClipboardData({
  //     data: "DietlensZhaoyan",
  //     success: function (res) {
  //       wx.showModal({
  //         title: '提示',
  //         content: '已将客服微信号复制到剪贴板,请通过搜索微信号添加好友使用。',
  //         showCancel: false,
  //         success: function (res) {
  //           if (res.confirm) {
  //             console.log('确定')
  //           } else if (res.cancel) {
  //             console.log('取消')
  //           }
  //         }
  //       })
  //     }
  //   });
  // }

  public onLoad(): void {
    // var that = this;

    // if (app.globalData.userInfo) {
    //   this.setUserInfo(app.globalData.userInfo);

    // } else {
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       that.setUserInfo(res.userInfo);
    //     },
    //     fail: err => {
    //       wx.navigateTo({
    //         url: '../invitation/index'
    //       })
    //     }
    //   })
    // }
  }

  public getUserInfo(e: any): void {
    var that = this;
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;

    this.setUserInfo(e.detail.userInfo);
  }

  private setUserInfo(userInfo: any) {
    (this as any).setData({
      userInfo: userInfo,
      hasUserInfo: true
    });
  }
}

Page(new morePage());
