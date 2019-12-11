
class webViewPage {

  public data = {
    reportUrl: "https://report.lxj3w.com/"
    // reportUrl: "http://192.168.0.189:3001/userweeklyreport/13"
  }

  public onLoad(options:any) {
    let webUrl = options.webUrl;
    if (!webUrl){
      return
    }
    let reportId = options.reportId;
    console.log(webUrl + "?report=" + reportId);
    (this as any).setData({
      reportUrl: webUrl + "?report=" + reportId + "&t=" + new Date().getTime()
    });
    
  }

}

Page(new webViewPage());