//reportPage.js

const app = getApp<IMyApp>()
import * as moment from 'moment';

class reportPage {
  public data = {
    url: null
  }

  public onLoad(options): void {
    let url = options.url; 
    const index = url.lastIndexOf('/');
    if(index!==-1){
      url = url.substr(index+1)
    }
    (this as any).setData({
      url: url + "?time=" + moment().utc()
    });
  }
}

Page(new reportPage());