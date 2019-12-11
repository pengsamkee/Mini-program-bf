import { chooseImage } from '../../api/promiseAPI'
import * as webAPI from '../../api/app/AppService';
import { UpdateSelfFoodDescReq, FoodDescInfo, SubmitReportReq, CreateReportResp } from '../../api/app/AppServiceObjs'
import * as uploadFile from '../../api/uploader';
import * as wxCharts from '../../utils/wxcharts';
import * as globalEnum from '../../api/GlobalEnum'

type Data = {
  mealList: Meal[];
  scrollHeight: number;
  completedFlag: boolean;
  reportStatus: number;
  showModal: boolean;
  textAreaTxt: string;
  currentInputMealIndex: number;
  refreshing: boolean;
}

type Meal = {
  foodDescId: number;
  mealTypeId: number;
  mealType: string;
  skipMealText: string;
  hint: string;
  mealIcon: string;
  imageList: ImageEntity[];
  textDesc: string;
  isShowTextArea: boolean;
  isSkip: boolean;
}

type ImageEntity = {
  imageUrl: String;
  isUploading: boolean;
  isUploadFailed: boolean;
  uploadPercentage: number;
}

class Report {
  ringChart: any;
  public data: Data = {
    mealList: [
      {
        foodDescId: 0,
        mealTypeId: 1,
        mealType: "早餐",
        skipMealText: "没吃早餐",
        hint: "例子:白煮鸡蛋，两只, 只吃了蛋白； 纯牛奶， 一盒，200ml。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: false
      },
      {
        foodDescId: 0,
        mealTypeId: 2,
        mealType: "加餐",
        skipMealText: "没有加餐",
        hint: "例子:葡萄，巨峰, 10粒；苏打饼干，3片。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: true
      },
      {
        foodDescId: 0,
        mealTypeId: 3,
        mealType: "午餐",
        skipMealText: "没吃午餐",
        hint: "例子:米饭，普通饭碗三两，只吃了一半； 银鲳鱼，半斤，鱼头鱼尾没有吃。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: false
      },
      {
        foodDescId: 0,
        mealTypeId: 4,
        mealType: "加餐",
        skipMealText: "没有加餐",
        hint: "全麦土司面包，2片； 花生酱，一勺。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: true
      },
      {
        foodDescId: 0,
        mealTypeId: 5,
        mealType: "晚餐",
        skipMealText: "没吃晚餐",
        hint: "拌黄瓜，一小盘，约一根黄瓜；红烧牛肉面，一大碗，口味偏咸。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: false
      },
      {
        foodDescId: 0,
        mealTypeId: 6,
        mealType: "加餐",
        skipMealText: "没有加餐",
        hint: "燕麦片，无糖，3大勺；南瓜子，一小把，约20克。",
        mealIcon: "",
        imageList: [],
        textDesc: "",
        isShowTextArea: false,
        isSkip: true
      }
    ],
    scrollHeight: 0,
    completedFlag: false,
    reportStatus: 0,
    showModal: false,
    textAreaTxt: "",
    currentInputMealIndex: -1,
    refreshing: false
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
    console.log("on pullDown refresh");
    this.getFoodDescData();
  }

  public onLoad(): void {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token))
    this.getFoodDescData();
  }

  public getFoodDescData(){
    (this as any).setData({
      refreshing: true,
    })
    var reportId = wx.getStorageSync(globalEnum.globalKey_reportId)
    var req = { report_id: reportId };
    var that = this;
    var mealList: any = []
    wx.showLoading({ title: "加载中...", mask: true })
    webAPI.GetSelfFoodDesc(req).then(resp => {
      wx.hideLoading({});
      console.log(resp)
      //check the report status to set up the function
      console.log("report status:" + resp.status);
      for (let i in resp.food_desc_info) {
        let meal = this.mealDataParsing(resp.food_desc_info[i]);
        mealList.push(meal);
      }
      (that as any).setData({
        mealList: mealList,
        reportStatus: resp.status
      })
      if (resp.status >= 2) {
        this.setUpScollerHeight(100);
      } else {
        this.setUpScollerHeight(150);
      }
      for (let i = 0; i < 6; i++) {
        this.updateChartStatus(i);
      }
      //dismiss the refresh loading bar
      (that as any).setData({
        refreshing: false,
      })
    }).catch(err => wx.hideLoading({}));
  }

  public naviToReportPage() {
    wx.switchTab({ url: '/pages/report/index' });
  }

  public createNewReport(){
    //send create new report request then refresh report.
    var that = this;
    wx.showLoading({title:"新建报告中..."});
    webAPI.CreateReport({}).then(resp => { 
      wx.hideLoading({});
      //get Food desc again
      let reportId = resp.report_id;
      console.log("reportId:"+reportId);
      wx.setStorageSync(globalEnum.globalKey_reportId, reportId);
      that.getFoodDescData();
    }).catch(err => wx.hideLoading({}));
  }

  public onVoiceInputReminder() {
    //show reminder for user that can use voice input;
    wx.showModal({
      title: "",
      content: "使用键盘上的语音输入，更加便捷哦～～",
      showCancel: false
    });
  }

  public mealDataParsing(resp: FoodDescInfo) {
    console.log(resp.meal_type);
    let meal:Meal = {};
    meal.mealTypeId = resp.meal_type;
    meal.hint = this.data.mealList[resp.meal_type - 1].hint
    meal.skipMealText = this.data.mealList[resp.meal_type - 1].skipMealText
    switch (resp.meal_type) {
      case 1:
        meal.mealType = "早餐";
        break;
      case 3:
        meal.mealType = "午餐";
        break;
      case 5:
        meal.mealType = "晚餐";
        break;
      default:
        meal.mealType = "加餐";
    }
    meal.foodDescId = resp.food_desc_id;
    meal.textDesc = resp.text_desc;
    meal.isShowTextArea = resp.text_desc !== "";
    meal.isSkip = resp.is_skipped;
    meal.imageList = [];
    for (let index in resp.image_key) {
      let imageEntity:ImageEntity = {
        imageUrl: "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/" + resp.image_key[index],
        isUploading: false,
        isUploadFailed: false,
        uploadPercentage: 0
      };
      meal.imageList.push(imageEntity);
    }
    return meal;
  }

  public getReportStatus() {
    //check report status
    let reportId = wx.getStorageSync(globalEnum.globalKey_reportId);
    let req: SubmitReportReq = {
      report_id: reportId
    };
    webAPI.GetReportStatus(req).then(resp => {
      console.log("report status:" + resp.status);
    }).catch(err => console.log(err));
  }

  public onSubmitBtnPressed() {
    var that = this;
    //get profile data online
    wx.showLoading({ title: "加载中...", mask: true })
    webAPI.GetSelfProfile({}).then(resp => {
      console.log(resp);
      wx.hideLoading({});
      //check the value of the profile
      if (!that.onCheckProfileValue(resp)) {
        return;
      }
      let genderArray = ['男','女'];
      let pregnancyStatusArray = ['备孕', '已孕', '哺乳期'];
      let activityLevelArray = ['卧床休息', '轻度,静坐少动', '中度,常常站立走动', '重度,负重'];
      //check pregnancy status and change the display
      let currentWeightText = "CM"
      let pregnancyWeekText = ""
      if (resp.pregnancy_stage == 2){//备孕
        currentWeightText = "CM\n体重:" + resp.weight_pregnancy + 'KG'
      } else if (resp.pregnancy_stage == 1){//已孕
        currentWeightText = "CM\n体重:" + resp.weight_pregnancy + 'KG'
        pregnancyWeekText = "\n孕周:" + resp.pregnancy
      }
      wx.showModal({
        title: "",
        content: "确认提交？提交之后将不能再修改饮食日记和个人信息。\n您的个人信息:\n性别:" +genderArray[resp.gender]+"\n出生年份:" + resp.birthday + "\n怀孕情况:" + pregnancyStatusArray[resp.pregnancy_stage] + pregnancyWeekText + "\n身高:" + resp.height + currentWeightText + "\n孕前体重:" + resp.weight + "KG\n日常运动量:" + activityLevelArray[resp.activity_level] + "\n本次报告将基于以上信息生成",
        showCancel: true,
        success(res) {
          if (res.confirm) {
            that.onSubmitConfirmation();
            wx.reportAnalytics('submission_confirmation', {});
          } else if (res.cancel) {
            console.log('用户取消提交');
            wx.reportAnalytics('submission_cancel', {});
          }
        }
      })
    }).catch(err => wx.hideLoading({}));
    //change the report status to submitted
    //report analytics
    wx.reportAnalytics('on_submit_btn_click', {});
  }

  public onCheckProfileValue(resp:any) {
    if (resp.height < 106 || resp.height > 220 || resp.weigth < 30 || resp.weigth > 150 || resp.pregnancy_stage == -1 || resp.activity_level == -1) {
      wx.showModal({
        title: "",
        content: "请完善您的个人信息后再提交",
        showCancel: false,
        success() {
          wx.switchTab({ url: '/pages/portfolio/index' });
        }
      });
      return false;
    }
    if (resp.pregnancy_stage == 2){
      if (resp.weight_pregnancy < 30 || resp.weight_pregnancy > 150 ){
        wx.showModal({
          title: "",
          content: "请完善您的个人信息后再提交",
          showCancel: false,
          success() {
            wx.switchTab({ url: '/pages/portfolio/index' });
          }
        });
        return false;
      }
    } else if (resp.pregnancy_stage == 1){
      if (resp.pregnancy > 45){
        wx.showModal({
          title: "",
          content: "请完善您的个人信息后再提交",
          showCancel: false,
          success() {
            wx.switchTab({ url: '/pages/portfolio/index' });
          }
        });
        return false;
      }
    }
    return true;
  }

  public onSubmitConfirmation() {
    var that = this;
    //submission
    var reportId = wx.getStorageSync(globalEnum.globalKey_reportId);
    let req: SubmitReportReq = {
      report_id: reportId
    };
    webAPI.SubmitReport(req).then(resp => {
      console.log("submit report successfully");
      console.log(resp);
      (that as any).setData({
        reportStatus: resp.status
      });
      that.setUpScollerHeight(100);
    }).catch(err =>
      wx.showModal({
        title: "",
        content: String(err.message),
        showCancel: false,
        success() {
          wx.switchTab({ url: '/pages/portfolio/index' });
          //report analytics
          wx.reportAnalytics('submission_reminder', {
            err_msg: err.message,
          });
        }
      })
    );
  }

  public updateFoodLog(index: number) {
    var req = this.generateFoodReqReqBody(index);
    webAPI.UpdateSelfFoodDesc(req).then(resp => {
      console.log("update food desc successfully");
    }).catch(err =>
      wx.showModal({
        title: '更新日记失败',
        content: String(err),
        showCancel: false
      })
    );
  }

  public generateFoodReqReqBody(index: number): UpdateSelfFoodDescReq {
    //update one meal only
    let foodEntity = this.data.mealList[index];
    let imageKeys = []
    //for loop image list
    for (let index in foodEntity.imageList) {
      let imageUrl = String(foodEntity.imageList[index].imageUrl);
      let isUploading = foodEntity.imageList[index].isUploading;
      let isUploadFailed = foodEntity.imageList[index].isUploadFailed;
      var imageKey = imageUrl.substring(imageUrl.lastIndexOf("/") + 1, imageUrl.length);
      console.log(imageKey);
      if (!isUploading && !isUploadFailed){
        imageKeys.push(imageKey);
      }
    }
    let foodDescReqBody: UpdateSelfFoodDescReq = {
      food_desc_id: foodEntity.foodDescId,
      meal_type: foodEntity.mealTypeId,
      text_desc: foodEntity.textDesc,
      is_skipped: foodEntity.isSkip,
      image_key: imageKeys
    };
    return foodDescReqBody;
  }

  public onShow(): void {
  }

  public onReady(): void {
    this.initRing('ringCanvas');
    for (let i = 0; i < 6; i++) {
      this.updateChartStatus(i);
    }
  }

  public setUpScollerHeight(topHeight: number) {
    //set up scroller height
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    var scrollHeight = windowHeight - topHeight; //window height minus static view height & margin-top 
    (this as any).setData({
      scrollHeight: scrollHeight
    });
  }

  public initRing(canvasId: string) {
    var that = this;
    this.ringChart = new wxCharts({
      animation: true,
      canvasId: canvasId,
      type: 'ring',
      extra: {
        ringWidth: 25,
        pie: {
          offsetAngle: -138.5,
        }
      },
      title: {
        name: '',
        color: '#7cb5ec',
        fontSize: 25
      },
      subtitle: {
        name: '完成度',
        color: '#666666',
        fontSize: 14
      },
      series: [{
        name: '早餐',
        fromat: '早餐',
        data: 105,
        color: '#ffffff',
        stroke: true
      }, {
        name: '加餐',
        data: 15,
        color: '#ffffff',
        stroke: true
      }, {
        name: '午餐',
        data: 105,
        color: '#ffffff',
        stroke: true
      }, {
        name: '加餐',
        data: 15,
        color: '#ffffff',
        stroke: true
      }, {
        name: '晚餐',
        data: 105,
        color: '#ffffff',
        stroke: true
      }, {
        name: '加餐',
        data: 15,
        color: '#ffffff',
        stroke: true
      }],
      disablePieStroke: false,
      width: 160,
      height: 160,
      dataLabel: false,
      legend: false,
      background: '#f5f5f5',
      padding: 10
    });
    this.ringChart.addEventListener('renderComplete', () => {
    });
    setTimeout(() => {
      that.ringChart.stopAnimation();
    }, 500);
    for (let index in this.data.mealList) {
      this.updateChartStatus(index);
    }
  }

  public toogleMeal(event: any): void {
    var that = this;
    //chagne meal isSkip 
    let index = event.currentTarget.dataset.mealIndex;
    var skipOperation = 'mealList[' + index + '].isSkip';
    //reportAnalytics
    if (that.data.mealList[index].isSkip) {
      wx.reportAnalytics('on_meal_skip', {
        meal: index,
      });
    } else {
      wx.reportAnalytics('on_meal_open', {
        meal: index,
      });
    }
    // var animOperation = 'mealList[' + index + '].animationData';
    (that as any).setData({
      [skipOperation]: !that.data.mealList[index].isSkip,
    });
    // animation.height(0).step({ duration: 200 });
    this.updateChartStatus(index);
    this.updateFoodLog(index);


  }

  public addFoodImage(event: any): void {
    var that = this;
    let index = event.currentTarget.dataset.mealIndex;
    let countNum = 3 - that.data.mealList[index].imageList.length
    chooseImage({ count: countNum, sizeType: ['original', 'compressed'] })
      .then(
        (res: any) => {
          return Promise.resolve(res)
        },
        (err: any) => {
          return Promise.reject(err)
        }
      )
      .then(
        (data: any) => {
          console.log(data);
          //upload image
          var loopCounts = Math.min(data.tempFilePaths.length, (3 - this.data.mealList[index].imageList.length));
          const currentLength = that.data.mealList[index].imageList.length//exisiting imagelist length
          let imageList: ImageEntity[] = that.data.mealList[index].imageList;
          for (let i = 0; i < loopCounts; i++) {
            uploadFile(data.tempFilePaths[i], this.onImageUploadSuccess, this.onImageUploadFailed, this.onUploadProgressing, index, currentLength+i);
            console.log(index + "," + that.data);
            let imageEntity: ImageEntity = {
              imageUrl: data.tempFilePaths[i],
              isUploading: true,
              isUploadFailed: false,
              uploadPercentage: 0
            }
            imageList.push(imageEntity);
          }
          var imageOperation = 'mealList[' + index + '].imageList';
          (that as any).setData({
            [imageOperation]: imageList
          })
          this.updateChartStatus(index);
          this.updateFoodLog(index);
          //report analytics
          wx.reportAnalytics('on_image_btn_click', {
            meal: index,
            upload_pics_num: loopCounts,
          });
        }
      )
  }

  public reUploadImage(event:any) {
    let mealIndex = event.currentTarget.dataset.mealIndex;
    let imageIndex = this.data.mealList[mealIndex].imageList.length - 1
    uploadFile(this.data.mealList[mealIndex].imageList[imageIndex].imageUrl, this.onImageUploadSuccess, this.onImageUploadFailed, this.onUploadProgressing, mealIndex, imageIndex);
    //change the status of the image to start uploading
    let imageEntity: ImageEntity = {
      imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
      isUploading: true,
      isUploadFailed: false,
      uploadPercentage: 0
    }
    //operation to refresh the UI
    var imageOperation = 'mealList[' + mealIndex + '].imageList['+imageIndex+']';
    (this as any).setData({
      [imageOperation]: imageEntity
    })
  }

  public onImageUploadSuccess(mealIndex: number, imageIndex: number){
    console.log("uploadSucess" + mealIndex + "," + imageIndex);
    let percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex + "]";
    let imageEntity = {
      imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
      isUploading: false,
      isUploadFailed: false,
      uploadPercentage: 100
    };
    (this as any).setData({
      [percentageOperation]: imageEntity
    });
  }

  public onImageUploadFailed(mealIndex:number, imageIndex:number){
    console.log("uploadFailed" + mealIndex + "," + imageIndex);
    //set up the image upload warning
    let percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex + "]";
    let imageEntity = {
      imageUrl: this.data.mealList[mealIndex].imageList[imageIndex].imageUrl,
      isUploading: false,
      isUploadFailed: true,
      uploadPercentage: 0
    };
    (this as any).setData({
      [percentageOperation]: imageEntity
    });
  }

  public onUploadProgressing(progress: any, mealIndex: number, imageIndex: number){
    console.log("progress:"+progress);
    //update upload percentagetsc in  
    let percentageOperation = "mealList[" + mealIndex + "].imageList[" + imageIndex +"].uploadPercentage";
    (this as any).setData({
      [percentageOperation]: progress
    });
  }

  public previewImage(event:any) {
    let imageIndex = event.currentTarget.dataset.imageIndex;
    let mealIndex = event.currentTarget.dataset.mealIndex;
    let src= this.data.mealList[mealIndex].imageList[imageIndex].imageUrl
    // let resources = [];
    // for (let index in this.data.mealList[mealIndex].imageList){
    //   resources.push(this.data.mealList[mealIndex].imageList[index].imageUrl);
    // }
    // wx.previewImage({
    //   current: src,
    //   urls: resources
    // })
    wx.navigateTo({
      url: "../../pages/imageTag/index?imageUrl=" + src
    });
  }

  public deleteFoodImage(event: any) {
    var imageIndex = event.currentTarget.dataset.imageIndex;
    var mealIndex = event.currentTarget.dataset.mealIndex;
    var imageList = this.data.mealList[mealIndex].imageList;
    imageList.splice(imageIndex, 1)
    var imageOperation = 'mealList[' + mealIndex + '].imageList';
    (this as any).setData({
      [imageOperation]: imageList
    })
    this.updateChartStatus(mealIndex);
    this.updateFoodLog(mealIndex);
    //report analytics
    wx.reportAnalytics('on_image_delete', {
      meal: mealIndex,
    });
  }

  public addTextDesc(event: any) {
    var index = event.currentTarget.dataset.mealIndex;
    var textOperation = 'mealList[' + index + '].isShowTextArea';
    (this as any).setData({
      [textOperation]: true
    })
    //report analytics
    wx.reportAnalytics('open_text_desc', {});
  }

  public onShowTextInput(event: any){
    var currentInputMealIndex = event.currentTarget.dataset.mealIndex;
    let currentText = this.data.mealList[currentInputMealIndex].textDesc;
    (this as any).setData({
      "showModal": true,
      "currentInputMealIndex": currentInputMealIndex,
      "textAreaTxt": currentText
    })
  }

  public modalUpdate(){
    (this as any).setData({
      "showModal": false
    });
    this.updateFoodLog(this.data.currentInputMealIndex);
    this.updateChartStatus(this.data.currentInputMealIndex);
  }

  public confirmText(event: any) {
    var text = event.detail.value;
    var index = event.currentTarget.dataset.mealIndex;
    console.log("enter confirm text:" + text + "," + index)
    if (text === '') {
      var textOperation = 'mealList[' + index + '].isShowTextArea';
      (this as any).setData({
        [textOperation]: false
      })
    }
    //save the meal data
    this.updateChartStatus(index);
    this.updateFoodLog(index);
    //report analytics
    wx.reportAnalytics('text_upload', {});
  }

  public countText(event: any) {
    var text = event.detail.value;
    var index = this.data.currentInputMealIndex;
    var textOperation = 'mealList[' + index + '].textDesc';
    (this as any).setData({
      [textOperation]: text,
      'textAreaTxt': text
    })
  }

  public updateChartStatus(index: number) {
    //change head progress filling
    if (this.data.mealList[index].textDesc.length !== 0 || this.data.mealList[index].imageList.length !== 0 || this.data.mealList[index].isSkip) {
      this.ringChart.opts.series[index].color = '#ed2c48';
    } else {
      this.ringChart.opts.series[index].color = '#ffffff';
    }
    this.ringChart.updateData();
    //check whether should show the submit button
    let completedFlag = true;
    for (let index in this.ringChart.opts.series) {
      if (this.ringChart.opts.series[index].color === '#ffffff') {
        completedFlag = false;
      }
    }
    if (completedFlag !== this.data.completedFlag){
      (this as any).setData({
        "completedFlag": completedFlag
      })
    }
  }

}
Page(new Report());