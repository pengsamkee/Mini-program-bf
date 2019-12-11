//reportPage.js

const app = getApp<IMyApp>()
import * as moment from 'moment';

class reportPage {
  public data = {
    url: null
  }

  public onLoad(options): void {
    (this as any).setData({
      url: options.url + "?time=" + moment().utc()
    });
    console.log(this.data.url);
  }

  // 
}

Page(new reportPage());