
import { IMyApp } from '../../app'
import { epoch } from '../../utils/util'

const app = getApp<IMyApp>()
import * as webAPI from '../../api/app/AppService';
import { MiniProgramLogin } from '../../api/login/LoginService';
import * as globalEnum from '../../api/GlobalEnum'
import { UpdateUserProfileReq, UpdateMedicalProfile } from '../../api/app/AppServiceObjs';

class onBoard {

  public data = {
    yearDisplay: "yearDisplay",
    datePicker: "datePicker",
    textInputClass: "section",
    pregnantStageCondition: true,
    dueDateCondition: false,
    weightBeforePregnancy: false,
    numberOfPregnancies: false,
    countPage: 0,
    finalPage: false,
    nextPage: false,
    empty: false,
    gender: 0,
    height: 150,
    heightVal:[110],
    heightArr: [],
    weightBMI:0,
    weight: 47.3,
    weightVal: [173],
    weightArr:[],
    pregnancyStage: '',
    pregStageSelected: 4,
    prePregWeight: 0,
    numPreg: 1,
    todayYear: 0,
    year: '2019',
    month: '10',
    date: '1',
    years: [0],
    months: [9],
    days: [0],
    activityLevel: '',
    activitySelected: 0,
    medical: '',
    medicalselected: 5,
    inputValidate: '请输入你的答案',
    optionsValidate: '请选择你的答案',
    // heightValidate: '请在40-230厘米范围内输入您的身高',
    // weightValidate: '请在30-300千克范围内输入您的体重',
    expectedDateValidate: '请在今天到未来45周的日期内选择您的预产期',
    ageValidate: '请确保您的年龄在1-100岁范围内',
    rdiGoal: 2000,
    birthVal: [72],
    pregnancyNumVal: [0],
    birthYears: [],
    birthYear: 1991,
    numPregOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    totalPage: 7,
    currentPage: 1,
    nickName: "",
    avatarUrl: "",
    rdiValue: " ",
  }
  public lastTime = 0; // 阻止用户连续快速点击

  public rdaUrl = "";

  public genderEvent(event: any) {
    (this as any).setData({
      nextPage: true,
      empty: false,
    });

    if (event.target.id == "男") {
      (this as any).setData({
        totalPage: 6,
        gender: 1
      });
    } else {
      (this as any).setData({
        totalPage: 7,
        gender: 2,
      });
    }
  }

  public onLoad(): void {
    wx.setNavigationBarTitle({
      title: "基本信息"
    });

    let today = new Date();
    this.setBirthYearPicker(today);
    this.setDueDatePicker(today);
    this.initHeightArr();
    this.initWeightArr();
  }

  /**
   * 循环获得heightArr
   */
  public initHeightArr(){
    let heightArr:Number[] = []
    for(let i=40;i<=230;i++){
      heightArr.push(i)
    }
    (this as any).setData({
      heightArr: heightArr
    })
  }
  /**
   * 循环获得weightArr
   */
  public initWeightArr() {
    let weightArr: Number[] = []
    for (let i = 30; i <= 300; i+=0.1) {
      weightArr.push(Number(i.toFixed(1)))
    }
    (this as any).setData({
      weightArr: weightArr
    })
  }
  // Set the picker options for pregnancy due date
  public setDueDatePicker(today: any): void {
    let dueYear = [];
    let dueMonth = [];
    let dueDays = [];

    for (let i = today.getFullYear(); i <= today.getFullYear() + 2; i++) {
      dueYear.push(i)
    }

    for (let i = 1; i <= 12; i++) {
      dueMonth.push(i)
    }

    for (let i = 1; i <= 31; i++) {
      dueDays.push(i)
    }

    (this as any).setData({ years: dueYear, months: dueMonth, days: dueDays });
  }

  // Set the picker options for birth year
  public setBirthYearPicker(today: any): void {
    (this as any).setData({ countPage: this.data.countPage + 1, todayYear: today.getFullYear() - 1 });

    let years = [];

    for (let i = 1919; i <= today.getFullYear() - 1; i++) {
      years.push(i);
    }

    (this as any).setData({ birthYears: years });
  }

  // Method to handle styling of WeChat input
  public focusInput(event: any): void {
    (this as any).setData({ textInputClass: "section-input" });
  }
  // 换成了picker，如果picker没问题，后续下面的代码可以删除
  // Handle the height input event
  // public bindHeightInput(event: any): void {
  //   this.focusInput(event);

  //   let heightInput = event.detail.value;

  //   if (heightInput >= 40 && heightInput <= 230 && heightInput != "") {

  //     (this as any).setData({ height: heightInput, nextPage: true, empty: false });

  //   } else {

  //     (this as any).setData({ nextPage: false, empty: false });

  //     if (heightInput == "") {
  //       (this as any).setData({ textInputClass: "section" });
  //     }

  //   }
  // }
  public bindHeightSelect(event: any) {
    let val = event.detail.value[0];
    let height = this.data.heightArr[val];
    let weightBMI = Number((21 * height/100 * height/100).toFixed(1));
    let weightVal = [Number(((weightBMI - 30) / 0.1).toFixed(1))];
    (this as any).setData({
      yearDisplay: "yearDisplay-input",
      height: height,
      nextPage: true,
      empty: false,
      weight: weightBMI,
      weightVal:weightVal
    });
  }

  public bindWeightSelect(event:any){
    let val = event.detail.value[0];
    let weight = this.data.weightArr[val];
    (this as any).setData({
      yearDisplay: "yearDisplay-input",
      weight: weight,
      nextPage: true,
      empty: false,
    });
  }
  // 换成了picker，如果picker没问题，后续下面的代码可以删除
  // Handle the weight input event
  // public bindWeightInput(event: any): void {
  //   this.focusInput(event);

  //   let weightInput = event.detail.value;

  //   if (weightInput >= 30 && weightInput <= 300 && weightInput != "") {

  //     (this as any).setData({
  //       weight: weightInput,
  //       nextPage: true,
  //       empty: false
  //     });

  //   } else {

  //     (this as any).setData({
  //       nextPage: false,
  //       empty: false
  //     });

  //     if (weightInput == "") {

  //       (this as any).setData({ textInputClass: "section" });

  //     }
  //   }
  // }

  // Handle the age input event
  public bindAgeInput(event: any): void {
    let val = event.detail.value;

    let birthYear = this.data.birthYears[val];

    let age = this.data.todayYear - birthYear;

    (this as any).setData({ yearDisplay: "yearDisplay-input" });

    if (age >= 1 && age <= 100) {

      (this as any).setData({
        birthYear: birthYear,
        nextPage: true,
        empty: false,
      });

    } else {

      (this as any).setData({
        birthYear: birthYear,
        nextPage: false,
        empty: false
      });
    }
  }

  public nextSubmit() {
    // 先进行节流，避免用户点击过快
    let nowTime = new Date().getTime();
    if (nowTime - this.lastTime>1000){
      this.lastTime = nowTime
    }else{
      this.lastTime = nowTime
      wx.showToast({
        title: '请认真填写',
        icon: 'none',
        duration: 1000
      })
      return false
    }

    if (this.data.dueDateCondition) {
      //check the expected birth date here
      let moment = require('moment');
      let expectedBirthDate = moment([Number(this.data.year), Number(this.data.month) - 1, Number(this.data.date)]) / 1000;
      let today = moment() / 1000;
      if (today > expectedBirthDate) {
        (this as any).setData({ empty: true });
        return;
      }
    }
    (this as any).setData({
      textInputClass: "section",
      datePicker: "datePicker"
    });
    if (this.data.nextPage == true) {
      (this as any).setData({
        countPage: this.data.countPage + 1,
        currentPage: this.data.currentPage + 1
      });
      this.onChange();
    } else {
      (this as any).setData({ empty: true });
    }
    // (this as any).setData({ nextPage: false });
    if (this.data.countPage == 11) {
      this.sendDatas();
    }
  }

  // Handles the pregnancy due date picker event
  public bindDateChange(event: any) {
    let val = event.detail.value;

    (this as any).setData({
      datePicker: "datePicker-input",
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      date: this.data.days[val[2]],
      nextPage: true, empty: false
    });
  }

  public bindBeforePregWeightInput(event: any): void {
    this.focusInput(event);

    let preWeightInput = event.detail.value;

    if (preWeightInput != null && preWeightInput != "") {

      (this as any).setData({
        prePregWeight: preWeightInput,
        nextPage: true,
        empty: false
      });

    } else {

      (this as any).setData({
        prePregWeight: 0,
        nextPage: false,
        empty: false
      });

      if (preWeightInput == "") {
        (this as any).setData({ textInputClass: "section" });
      }
    }
  }

  public bindNumPregInput(event: any): void {

    let numPreg = event.detail.value;

    if (numPreg == null) {

      (this as any).setData({
        numPreg: 0,
        nextPage: true,
        empty: false
      });

    } else {

      (this as any).setData({
        numPreg: Number(numPreg) + 1,
        nextPage: true,
        empty: false
      });

    }
  }

  public setGenderForms() {
    if (this.data.birthYear < 2003 && this.data.gender == 2) {

      (this as any).setData({
        pregnantStageCondition: true,
        totalPage: 7,
      });

      (this as any).setData({ countPage: this.data.countPage + 1 });

    } else {

      (this as any).setData({
        pregnantStageCondition: false,
        countPage: this.data.countPage + 4,
        totalPage: 6,
      });

    }
  }

  public onChange() {
    // Handles next page validation
    if (this.data.countPage !== 4 && this.data.countPage !== 8 && this.data.countPage !==2 && this.data.countPage !==3) {
      (this as any).setData({ nextPage: false });
    }

    // Handles different forms flow for different gender
    if (this.data.countPage == 5) {
      this.setGenderForms();
    }

    // Display corresponding forms according to selected pregnancy stage option
    this.handlePregnancyStageOptionsForms();

    // Display corresponding forms if female user is pregnant
    this.handlePregnantFemaleForms();
  }

  public handlePregnantFemaleForms() {
    if (this.data.countPage == 7) {
      (this as any).setData({ dueDateCondition: false, weightBeforePregnancy: true });
    } else if (this.data.countPage == 8) {
      (this as any).setData({ dueDateCondition: false, weightBeforePregnancy: false, numberOfPregnancies: true });
    } else {
      (this as any).setData({ weightBeforePregnancy: false, numberOfPregnancies: false });
    }
  }

  public handlePregnancyStageOptionsForms() {
    if (this.data.pregnancyStage == '怀孕期' && this.data.pregnantStageCondition == true && this.data.dueDateCondition == false) {
      (this as any).setData({ dueDateCondition: true, countPage: this.data.countPage - 1, totalPage: 10 });

    } else if (this.data.pregnantStageCondition == true && (this.data.pregnancyStage == '备孕期' || this.data.pregnancyStage == '哺乳期' || this.data.pregnancyStage == '都不是')) {

      (this as any).setData({
        pregnantStageCondition: false,
        dueDateCondition: false,
        countPage: this.data.countPage + 2,
        totalPage: 7
      });

    } else if (this.data.pregnancyStage == '怀孕期' && this.data.pregnantStageCondition == true && this.data.dueDateCondition == true) {

      (this as any).setData({ countPage: this.data.countPage, pregnantStageCondition: false, dueDateCondition: false });

    }
  }

  public pregnancyStageEvent(event: any) {
    if (event.target.id == 1) {
      (this as any).setData({ pregnancyStage: '备孕期', pregStageSelected: 1, totalPage: 7 });
    } else if (event.target.id == 2) {
      (this as any).setData({ pregnancyStage: '怀孕期', pregStageSelected: 2, totalPage: 10 });
    } else if (event.target.id == 3) {
      (this as any).setData({ pregnancyStage: '哺乳期', pregStageSelected: 3, totalPage: 7 });
    } else if (event.target.id == 0) {
      (this as any).setData({ pregnancyStage: '都不是', pregStageSelected: 0, totalPage: 7 });
    }

    (this as any).setData({ nextPage: true, empty: false });
  }

  public activityLevelEvent(event: any) {

    if (event.target.id == 1) {
      (this as any).setData({ activityLevel: '卧床休息', activitySelected: 1 });
    } else if (event.target.id == 2) {
      (this as any).setData({ activityLevel: '轻度，静坐少动', activitySelected: 2 });
    } else if (event.target.id == 3) {
      (this as any).setData({ activityLevel: '中度，常常走动', activitySelected: 3 });
    } else if (event.target.id == 4) {
      (this as any).setData({ activityLevel: '重度，负重', activitySelected: 4 });
    } else if (event.target.id == 5) {
      (this as any).setData({ activityLevel: '剧烈，超负重', activitySelected: 5 });
    }

    (this as any).setData({ nextPage: true, empty: false });
  }

  public medicalCondition(event: any) {
    if (event.target.id == 1) {
      (this as any).setData({ medical: '糖尿病', medicalselected: 1 });
    } else if (event.target.id == 2) {
      (this as any).setData({ medical: '甲状腺功能亢进症', medicalselected: 2 });
    } else if (event.target.id == 0) {
      (this as any).setData({ medical: '无', medicalselected: 0 });
    }

    (this as any).setData({ finalPage: true, nextPage: true, empty: false });

  }

  // public getRDIGoal(): void {
  //   webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
  //   webAPI.RetrieveUserRDA({}).then(resp => {
  //     this.rdaUrl = resp.rda_url;
  //   }).catch(err => console.log(err));
  //   webAPI.RetrieveRecommendedDailyAllowance({}).then(resp => {
  //     wx.hideLoading({});
  //     let energy = resp.energy;
  //     (this as any).setData({
  //       rdiValue: Math.floor(energy / 100)
  //     });
  //   }).catch(err => console.log(err));
  // }
  public getRDIGoal(): void {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    webAPI.RetrieveUserRDA({}).then(resp => {
      this.rdaUrl = resp.rda_url;
      if (this.rdaUrl !== "") {
        wx.reLaunch({
          url: '/pages/rdiPage/rdiPage?url=' + this.rdaUrl,
        })
      }
    }).catch(err => console.log(err));
    webAPI.RetrieveRecommendedDailyAllowance({}).then(resp => {
      wx.hideLoading({});
      let energy = resp.energy;
      (this as any).setData({
        rdiValue: Math.floor(energy / 100)
      });
    }).catch(err => console.log(err));
  }

  public redirectToRDAPage() {
    if (this.rdaUrl !== "") {
      wx.navigateTo({
        url: '/pages/rdiPage/rdiPage?url=' + this.rdaUrl,
      })
    }
  }

  public sendDatas(): void {
    // 查看是否授权
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    webAPI.SetAuthToken(token);
    let that = this;
    let gender = Number(that.data.gender);
    let birthYear = Number(that.data.birthYear);
    let height = Number(that.data.height);
    let weight = Number(that.data.weight);
    let weightBeforePreg = Number(that.data.prePregWeight);
    let activitySelected = Number(that.data.activitySelected);
    let pregStageSelected = Number(that.data.pregStageSelected);
    let medicalCondition = Number(that.data.medicalselected);
    //FIXME special setting for server pregnancy stage out of index range setting
    if (pregStageSelected < 0 || pregStageSelected > 3) {
      pregStageSelected = 0;
    }

    let preg_birth_date = this.data.year + "-" + this.data.month + "-" + this.data.date;

    // let moment = require('moment');
    // wx.showModal({ title: "", content: "" + moment([Number(that.data.year), Number(that.data.month) - 1, Number(that.data.date)]) }) 

    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              let userInfo = res.userInfo;
              let nickName = userInfo.nickName;
              let avatarUrl = userInfo.avatarUrl;
              let moment = require('moment');
              let updateUserProfileReq = {
                gender: gender,
                year_of_birth: birthYear,
                height: height,
                weight: weight,
                weight_before_pregnancy: weightBeforePreg,
                activity_level: activitySelected,
                pregnancy_stage: pregStageSelected,
                expected_birth_date: moment([Number(that.data.year), Number(that.data.month) - 1, Number(that.data.date)]) / 1000,
                nickname: nickName,
                avatar_url: avatarUrl,
                times_of_pregnancy: that.data.numPreg
              }
              wx.showLoading({ title: "加载中..." });
              console.log(updateUserProfileReq);
              webAPI.UpdateUserProfile(updateUserProfileReq).then(resp => {
                that.getRDIGoal();
              }).catch(err => {
                console.log(err);
                wx.hideLoading({});
                wx.showModal({
                  title: '',
                  content: '更新用户信息失败',
                  showCancel: false
                });
              });

              // webAPI.UpdateUserProfile(updateUserProfileReq);

              let updateMedicalProfileReq = {
                food_allergy_ids: [],
                medical_condition_ids: [medicalCondition],
              }
              if (medicalCondition != 0) {
                webAPI.UpdateMedicalProfile(updateMedicalProfileReq);
              }
            }
          })
        } else {
          wx.navigateTo({
            url: '../invitation/invitation?user_status=2'
          })
        }
      }
    })

    //record the onBoard last step times
    wx.reportAnalytics('onboard_last_step', {
      counts: 'counts',
    });
  }

  public confirmSubmit() {
    wx.reLaunch({
      url: "../../pages/home/index",
    })
  }

  public preButton234(){
    if (this.data.countPage==2){
      (this as any).setData({
        countPage: this.data.countPage - 1,
        currentPage: this.data.currentPage - 1,
        gender: 0,
        nextPage: false,
        empty: false,
      })
    }
    if (this.data.countPage == 3) {
      (this as any).setData({
        countPage: this.data.countPage - 1,
        currentPage: this.data.currentPage - 1,
        height: 150,
        weight: 47.3,
        weightVal: [173],
        nextPage: true,
        empty: false,
        yearDisplay: 'yearDisplay',
      })
    }
    if (this.data.countPage == 4) {
      let weightBMI = Number((21 * this.data.height / 100 * this.data.height / 100).toFixed(1));
      let weightVal = [Number(((weightBMI - 30) / 0.1).toFixed(1))];
      (this as any).setData({
        countPage: this.data.countPage - 1,
        currentPage: this.data.currentPage - 1,
        weight: weightBMI,
        weightVal: weightVal,
        nextPage: true,
        empty: false,
        yearDisplay: 'yearDisplay',
      })
    }
  }
  public preButtonPregnantAndNotDue(){
    (this as any).setData({
      countPage: this.data.countPage - 2,
      currentPage: this.data.currentPage - 1,
      nextPage: true,
      empty: false,

      birthYear: 1991,
      yearDisplay: "yearDisplay",

      pregnantStageCondition: true,
      pregnancyStage: '',
      pregStageSelected:4, 
    }) 
  }

  public preButtonDueDateCondition(){
    (this as any).setData({
      countPage: this.data.countPage,
      currentPage: this.data.currentPage - 1,
      nextPage: false,
      empty: false,
      totalPage: 7,

      dueDateCondition:false,
      datePicker: "datePicker",
      year: '2019',
      month: '10',
      date: '1',

      pregnantStageCondition: true,
      pregnancyStage: '',
      pregStageSelected: 4,

    }) 
  }

  public weightBeforePregnancyBack(){
    (this as any).setData({
      countPage: this.data.countPage - 1,
      currentPage: this.data.currentPage - 1,
      nextPage: true,
      empty: false,

      prePregWeight: 0,
      dueDateCondition: true, 
      weightBeforePregnancy: false,

      datePicker: "datePicker",
      year: '2019',
      month: '10',
      date: '1',
    })
  }

  public numberOfPregnanciesPre(){
    (this as any).setData({
      countPage: this.data.countPage - 1,
      currentPage: this.data.currentPage - 1,
      nextPage: false,
      empty: false,

      numPreg: 1,
      dueDateCondition: false, 
      weightBeforePregnancy: true, 
      numberOfPregnancies: false,

      prePregWeight: 0,
    })
  }

  public preButton9(){
    // 男生
    if (this.data.gender===1){
      (this as any).setData({
        countPage: this.data.countPage - 5,
        currentPage: this.data.currentPage - 1,
        nextPage: true,
        empty: false,

        activityLevel: '',
        activitySelected: 0,

        birthYear: 1991,
        yearDisplay: "yearDisplay",
      })
    }else{
      // 女生
      if (this.data.birthYear >= 2003){
        // 年龄小，没有满足怀孕年龄条件的女孩
        (this as any).setData({
          countPage: this.data.countPage - 5,
          currentPage: this.data.currentPage - 1,
          nextPage: false,
          empty: false,
          totalPage:7,

          activityLevel: '',
          activitySelected: 0,

          birthYear: 1991,
          yearDisplay: "yearDisplay",
        })

      }else{
        // 满足怀孕年龄条件的女生
        if (this.data.pregnancyStage == '怀孕期'){
          // 选择了"怀孕期"的女生
          (this as any).setData({
            countPage: this.data.countPage - 1,
            currentPage: this.data.currentPage - 1,
            nextPage: false,
            empty: false,

            activityLevel: '',
            activitySelected: 0,
            numberOfPregnancies: true,

            numPreg: 1,
          })
        }else{
          // 选择了非"怀孕期"的女生
          (this as any).setData({
            countPage: this.data.countPage - 3,
            currentPage: this.data.currentPage - 1,
            nextPage: false,
            empty: false,

            activityLevel: '',
            activitySelected: 0,
            pregnantStageCondition:true,
            dueDateCondition:false,

            pregnancyStage: '',
            pregStageSelected: 4,
          })
        }
      }
    }
  }
  public preButton10(){
    (this as any).setData({
      countPage: this.data.countPage - 1,
      currentPage: this.data.currentPage - 1,
      nextPage: false,
      empty:false,

      medical: '', 
      medicalselected: 5,

      activityLevel: '',
      activitySelected: 0,
    })
  }
}

Page(new onBoard());
