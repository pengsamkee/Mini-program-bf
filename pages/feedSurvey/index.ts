import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';

class FeedSurveyPage {
  public data = {
    quesTitle: "",
    surveyId: 0,
    isAnswerPositive: true,
  }

  public onLoad(option:any) {
    let surveyId = Number(option.surveyId);
    (this as any).setData({
      surveyId: surveyId
    });
    let req = { survey_id: surveyId };
    var that = this;
    webAPI.RetrieveSurvey(req).then(resp => {
      let quesTitle = resp.question;
      (that as any).setData({
        quesTitle: quesTitle,
        showQuesDlg: true
      });
    }).catch(err => { console.log(err); });
  }

  public onQuesDlgBtnPress(event:any){
    let flag = event.currentTarget.dataset.selection;
    (this as any).setData({
      isAnswerPositive: flag
    })
  }

  public onQuesDlgBtnSubmit() {
    //submit isAnswerPositive to backend
    let surveyId = this.data.surveyId;
    if (surveyId === 0) {
      return;
    }
    let req = { survey_id: surveyId, is_positive: this.data.isAnswerPositive };
    webAPI.CreateSurveyAnswer(req).then(resp => {
      //dismiss the dialog then set survey id to 0
      console.log(resp);
      wx.navigateBack({ delta: 1 });
    }).catch(err => wx.showModal({ title: "", content: "上传用户回答失败", showCancel: false }));
  }
}

Page(new FeedSurveyPage())