
import * as webAPI from '../../api/app/AppService';
import { UpdateFoodPreferenceReq } from '../../api/app/AppServiceObjs'
import * as globalEnum from '../../api/GlobalEnum'

class foodPreference {

  public data = {
    food_preference: [],
  }

  public onLoad(): void {
    var that = this;
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    var req = {};
    webAPI.RetrieveFoodPreference(req).then(resp => {
      console.log(resp);
      (that as any).setData({
        food_preference: resp.food_preferences,
      })
    }).catch(err => console.log(err));
  }

  public onShow(): void {

  }

  public checkboxChange(event:any): void {
    let indexList = event.detail.value

    for (let index in this.data.food_preference){
        let preferenceOperation = 'food_preference[' + index + '].is_selected';
        let flag = indexList.includes(index.toString());
        (this as any).setData({
          [preferenceOperation]: flag
        })
    }
    //report analytics
    wx.reportAnalytics('food_preference_checkbox_change', {});
  }

  public confirmFoodPreference(): void {
    webAPI.UpdateFoodPreference(this.generateFoodPreferenceReqBody()).then(resp => {
      console.log("update food preference succeed ");
      wx.navigateBack({ delta: 1 })
    }).catch(err => console.log(err));
  }

  public generateFoodPreferenceReqBody(): UpdateFoodPreferenceReq {
    var tempIds = [];
    for (let i in this.data.food_preference) {
      if (this.data.food_preference[i].is_selected){
        tempIds.push(this.data.food_preference[i].food_preference_id);
      }
    }
    var reqBody = {
      food_preference_ids: tempIds,
    };
    return reqBody;
  }
}

Page(new foodPreference())