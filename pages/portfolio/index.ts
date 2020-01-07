import { IMyApp } from '../../app'
import { UpdateUserProfileReq } from "../../api/app/AppServiceObjs"
import * as globalEnum from '../../api/GlobalEnum'
import * as moment from 'moment';

const app = getApp<IMyApp>()

import * as webAPI from '../../api/app/AppService';

class PortfolioPage {

  public userInfo = {}
  public data = {
    birthday: 2000,
    ageGroupIndex: 3,
    ageGroup: ['6个月以下', '6个月-1岁', '1-3岁', '3-4岁', '4-7岁', '7-10岁', '10-11岁', '11-14岁', '14-18岁', '18-30岁', '30-50岁', '50-60岁', '60-65岁', '65-80岁', '80岁以上'],
    genderIndex: 1,
    genderArray: ['男', '女'],
    preHeight: 170,//为了用户修改身高时，身高值自动等于0，保留用户进入页面时候的身高
    height: 170,
    preCurrentWeight:50,
    currentWeight: 50,
    weightBeforePreg: 60,
    pregnancyStatusIndex: 1,
    pregnancyStatusArray: ['都不是', '备孕', '已孕', '哺乳期'],
    activityLevelIndex: 1,
    activityLevelArray: ['卧床休息', '轻度,静坐少动', '中度,常常站立走动', '重度,负重', '剧烈，超负重'],
    pregnancyDate: {
      date: moment().format("YYYY-MM-DD"),
      year: moment().format("YYYY"),
      month: moment().format("MM"),
      day: moment().format("DD")
    },
  }

  public onTabItemTap(item: any) {
    //wx report analytics
    wx.reportAnalytics('switch_tab', {
      tab_index: item.index,
      tab_pagepath: item.pagePath,
      tab_text: item.text
    });
  }

  public onPullDownRefresh() {
    //get report status again
    this.getProfileData();
  }

  public onLoad(): void {
    //get profile
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    this.getProfileData();
  }

  public getProfileData() {
    var req = {};
    var that = this;
    wx.showLoading({ title: "加载中...", mask: true })
    webAPI.RetrieveUserProfile(req).then(resp => {
      wx.hideLoading({});
      //-1 value filtering
      let keys = Object.keys(resp); 
      let errorChecking = [];
      for (var i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (resp[key] === -1 || resp[key] === '') {
          errorChecking[i] = true;
        } else {
          errorChecking[i] = false;
        }
        (that as any).setData({
          errorChecking: errorChecking
        });
      }
      // parse pregnancyDate timestamp
      let tempDate: moment;
      if (resp.expected_birth_date == -1) {
        tempDate = moment();
      } else {
        tempDate = moment.unix(resp.expected_birth_date);
      }
      //set data into profile
      (that as any).setData({
        genderIndex: Number(resp.gender)-1,
        birthday: resp.year_of_birth == -1 ? 1980 : resp.year_of_birth,
        // intoPageHeight: resp.height == -1 ? 0 : resp.height,
        height: resp.height == -1 ? 0 : resp.height,
        currentWeight: resp.weight == -1 ? 0 : resp.weight,
        weightBeforePreg: resp.weight_before_pregnancy == -1 ? 0 : resp.weight_before_pregnancy,
        pregnancyStatusIndex: resp.pregnancy_stage, // local index starts from 0, not 1
        activityLevelIndex: resp.activity_level - 1, // local index starts from 0, not 1
        externalId: resp.external_id,

        pregnancyDate: {
          date: tempDate.format('YYYY-MM-DD'),
          year: tempDate.format('YYYY'),
          month: tempDate.format('MM'),
          day: tempDate.format('DD')
        },
      });
      //dismiss the refresh loading bar
      wx.stopPullDownRefresh({});
    }).catch(err => wx.hideLoading({}));
  }

  public profileChecking() {
    let values = Object.values(this.data);
    console.log(values);
    let errorChecking = [];
    for (var i = 0; i < values.length; i++) {
      let value = values[i];
      if (value === -1 || value === '') {
        errorChecking[i] = true;
      } else {
        errorChecking[i] = false;
      }
      (this as any).setData({
        errorChecking: errorChecking
      });
    }
  }

  public onShow() {
   this.authenticationRequest();
  }

  public authenticationRequest() {
    //userInfo request
    if (app.globalData.userInfo) {
      // (this as any).setData!({
      //   userInfo: app.globalData.userInfo,
      // })
      this.userInfo = app.globalData.userInfo;
    } else {
      console.log('start getUserInfo');
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          console.log('get getUserInfo' + res.userInfo);
          this.userInfo = app.globalData.userInfo;
        },
        fail: err => {
          //跳转到验证页面
          wx.navigateTo({
            url: '../login/index'
          })
        }
      })
    }
  }

  public generateProfileReqBody(): UpdateUserProfileReq {
    //check profile status each time submit profile
    let pregDateTimestamp: number = moment(this.data.pregnancyDate.date).unix();

    var reqBody = {
      gender: Number(this.data.genderIndex)+1, 
      year_of_birth: this.data.birthday,
      height: this.data.height,
      weight: this.data.currentWeight,
      weight_before_pregnancy: this.data.weightBeforePreg,

      activity_level: this.data.activityLevelIndex + 1, // backend index starts from 1, not 10
      pregnancy_stage: this.data.pregnancyStatusIndex, // backend index starts from 1, not 10

      expected_birth_date: pregDateTimestamp,
      nickname: this.userInfo.nickName,
      avatar_url: this.userInfo.avatarUrl,
      external_id: this.data.externalId,

    }
    console.log("Request body generated.");
    console.log(reqBody);
    return reqBody;
  }

  public pregnancyStatusSelect(event: any): void {
    (this as any).setData({
      pregnancyStatusIndex: Number(event.detail.value)
    })

    this.updateProfile();
  }

  public activityLvlSelect(event: any): void {
    (this as any).setData({
      activityLevelIndex: Number(event.detail.value)
    })

    this.updateProfile();
  }


  public onPregnancyDateInput(event: any): void {
    let newDate = moment(event.detail.value);
    let year = newDate.year();
    let month = newDate.month() + 1;
    let day = newDate.date();
    let today = moment();
    let pregDateLimit = moment().add(45, 'w');

    if (newDate.isBetween(today, pregDateLimit)) {
      console.log("Pregnancy date is valid");
      (this as any).setData({
        pregnancyDate: {
          date: event.detail.value,
          year: year.toString(),
          month: month.toString(),
          day: day.toString()
        }
      });
      this.updateProfile();

    } else {
      (this as any).setData({
        pregnancyDate: {
          date: today.format("YYYY-MM-DD"),
          year: today.format("YYYY"),
          month: today.format("MM"),
          day: today.format("DD")
        }
      });
      wx.showModal({
        title: "",
        content: "预产期只能输入今天到未来45周后的日期",
        showCancel: false
      });
    }
  }
  public onFocusHeightInput(e){
    this.setData({
      preHeight:this.data.height,
      height: ''
    })
  }
  public onHeightInput(event: any) {
    let heightValue = Number(event.detail.value);
    //check the pregnancy week status
    if (heightValue > 230 || (heightValue < 40) {
      (this as any).setData({
        height: this.data.preHeight
      });
      if (heightValue!=0){
        wx.showModal({
          title: "",
          content: "身高的范围在40cm和230cm之间",
          showCancel: false
        });
      }
    } else {
      (this as any).setData({
        height: heightValue
      },)
      this.updateProfile();
    }
  }

  public checkWeight(event: any) {
    let weightValue = Number(event.detail.value);
    if (weightValue < 30 || weightValue > 300) {
      (this as any).setData({
        weight: 0
      })
      wx.showModal({
        title: "",
        content: "体重的范围在30kg和300kg之间",
        showCancel: false
      });
    } else {
      (this as any).setData({
        weight: weightValue
      })

      this.updateProfile();
    }
  }

  public onWeightBeforePregInput(event: any): void {
    let weightValue = Number(event.detail.value);
    (this as any).setData({
      weightBeforePreg: weightValue
    })

    this.updateProfile();
  }

  public onFocusWeightInput(e) {
    this.setData({
      preCurrentWeight: this.data.currentWeight,
      currentWeight: ''
    })
  }

  public onCurrentWeightInput(event: any) {
    let currentWeightValue = Number(event.detail.value);
    if (currentWeightValue < 3 || currentWeightValue > 150) {
      (this as any).setData({
        currentWeight: this.data.preCurrentWeight
      });
      if (currentWeightValue!=0){
        wx.showModal({
          title: "",
          content: "体重的范围在3kg和150kg之间",
          showCancel: false
        });
      }
    } else {
      (this as any).setData({
        currentWeight: currentWeightValue
      })

      this.updateProfile();
    }
  }


  public birthdaySelect(event: any): void {
    (this as any).setData({
      birthday: Number(event.detail.value)
    })

    this.updateProfile();
  }

  public genderSelect(event: any): void {
    (this as any).setData({
      genderIndex: Number(event.detail.value)
    })

    this.updateProfile();
  }

  public tapOnMealHabit(): void {
    wx.navigateTo({
      url: '../foodPreference/index'
    });
    //report analytics
    wx.reportAnalytics('tap_on_meal_habit', {});
  }

  public tapOnMedicalRecord(): void {
    wx.navigateTo({
      url: '../medicalCase/index'
    });
    //report analytics
    wx.reportAnalytics('tap_medical_record', {});
  }

  public onIDInput(event: any): void {
    let inputId = (event.detail.value).trim();
    (this as any).setData({
      externalId: inputId
    });
    this.updateProfile();
  }

  public updateProfile() {
    webAPI.UpdateUserProfile(this.generateProfileReqBody()).then(resp => {

    }).catch(err => wx.showModal({
      title: '更新个人资料失败',
      content: String(err),
      showCancel: false
    }));
    //report analytics
    wx.reportAnalytics('update_profile', {});
  }
}

Page(new PortfolioPage());
