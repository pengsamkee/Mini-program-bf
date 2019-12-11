
import * as webAPI from '../../api/app/AppService';
import { UpdateMedicalProfileReq } from '../../api/app/AppServiceObjs'
import * as globalEnum from '../../api/GlobalEnum'

class medicalCasePage {

  public data = {
    medical_condition: [],
    food_allergy: [],
    otherChecked: false,
    otherAllergyChecked: false
  }

  public onLoad(): void {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    var req = {};
    var that = this;
    webAPI.RetrieveMedicalProfile(req).then(resp => {
      console.log(resp);
      //set up the check data
      (that as any).setData({
        medical_condition: resp.medical_conditions,
        food_allergy: resp.food_allergies
      });
    }).catch(err => console.log(err));
  }

  public allergyCheckboxChange(event: any): void {
    let indexList = event.detail.value
    if (indexList.includes(this.data.food_allergy.length.toString())) { //other option checked
      (this as any).setData({
        otherAllergyChecked: true
      })
    } else {
      (this as any).setData({
        otherAllergyChecked: false,
      })
    }
    for (let index in this.data.food_allergy) {
      let operation = 'food_allergy[' + index + '].is_selected';
      let flag = indexList.includes(index.toString());
      (this as any).setData({
        [operation]: flag
      })
    }
    //report analytics
    wx.reportAnalytics('allergy_checkbox_change', {});
  }

  public medicalConditionboxChange(event: any): void {
    let indexList = event.detail.value
    if (indexList.includes(this.data.medical_condition.length.toString())) { //other option checked
      (this as any).setData({
        otherChecked: true
      })
    } else {
      (this as any).setData({
        otherChecked: false,
      })
    }
    for (let index in this.data.medical_condition) {
      let operation = 'medical_condition[' + index + '].is_selected';
      let flag = indexList.includes(index.toString());
      (this as any).setData({
        [operation]: flag
      })
    }
    //report analytics
    wx.reportAnalytics('medical_record_checkbox_change', {});
  }

  public confirmMedicalProfile(): void {
    webAPI.UpdateMedicalProfile(this.generateMedicalReqBody()).then(resp => {
      console.log("update medical profile succeed ");
      wx.navigateBack()
    }).catch(err => console.log(err));
  }

  public generateMedicalReqBody(): UpdateMedicalProfileReq {
    var foodAllergy = [];
    var medicalCondition = [];

    for (let i in this.data.food_allergy) {
      if (this.data.food_allergy[i].is_selected) {
        foodAllergy.push(this.data.food_allergy[i].food_allergy_id);
      }
    }
    for (let i in this.data.medical_condition) {
      if (this.data.medical_condition[i].is_selected) {
        medicalCondition.push(this.data.medical_condition[i].medical_condition_id);
      }
    }
    var reqBody = {
      food_allergy_ids: foodAllergy,
      medical_condition_ids: medicalCondition,
    }

    return reqBody;
  }

}

Page(new medicalCasePage())