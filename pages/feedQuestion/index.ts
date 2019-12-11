import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';
import * as moment from 'moment';

class FeedQuestionPage{

  public data = {
    questionText: ""
  }

  public onLoad(){
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
  }

  public bindFeedbackQuestionInput(event: any) {
    let quesText = String(event.detail.value);
    (this as any).setData({
      questionText: quesText
    });
  }

  public onFeedbackDlgBtnSubmit() {
    //submit isFeedback to backend
    let req = { date: moment().unix(), question: this.data.questionText };
    if (!this.data.questionText || this.data.questionText === "") {
      return
    }
    webAPI.CreateQuestion(req).then(resp => {
      wx.navigateBack({delta: 1});
    }).catch(err => { wx.showModal({ title: "", content: "上传留言失败", showCancel: false }) });
  }
}

Page(new FeedQuestionPage());