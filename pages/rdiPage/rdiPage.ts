
const app = getApp<IMyApp>()

class rdiPage {
  public data = {
    url: null
  }

  public onLoad(options): void {
    (this as any).setData({
      url: options.url
    });
  }

  public loadPageFailed(){
      console.log("load web error");
  }
}

Page(new rdiPage());