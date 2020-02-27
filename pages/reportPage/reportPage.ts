//reportPage.js

const app = getApp<IMyApp>()
import * as moment from 'moment';
import * as globalEnum from '../../api/GlobalEnum';

class reportPage {
  public data = {
    // id: null,
    reportPageUrl:'',
  }

  public onLoad(options): void {
    console.log('date,userId',options)
    var reportPageUrl:string = globalEnum.reportPageUrl+'?date='+options.date+'&userId='+options.userId+'&time='+ moment().utc();
    console.log('reportPageUrl='+reportPageUrl);
    // let url = options.url; 
    // const index = url.lastIndexOf('/');
    // if(index!==-1){
    //   var id = url.substr(index+1)
    // }
    (this as any).setData({
      // id: id + "?time=" + moment().utc(),
      reportPageUrl
    });
  }
}

Page(new reportPage());