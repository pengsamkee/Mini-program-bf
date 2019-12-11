//articlePage.js

const app = getApp<IMyApp>()

class articlePage {
  public data = {
    url: null
  }

  public onLoad(options): void {
    wx.setNavigationBarTitle({
      title: ""
    });

    (this as any).setData({
      url: options.url
    });
  }
}

Page(new articlePage());