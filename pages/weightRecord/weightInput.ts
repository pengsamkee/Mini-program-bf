import * as moment from 'moment';
import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';

class weightInputPage {
  public data = {
    weight: '50',
    todayAtMidNight: undefined
  }

  public onLoad(e) {
    let today: string = moment().format("YYYY-MM-DD");
    let todayTemp: moment = moment(today);
    (this as any).setData({
      todayAtMidNight: todayTemp
    })

    wx.setNavigationBarTitle({
      title: "记录体重"
    });

    this.retrieveLatestWeight();
  }

  // value displayed in weight input field defaults to the latest recorded weight
  public retrieveLatestWeight(): void {
    // set weekview interval and week number
    let currWeek: number = moment().week();
    let firstDayOfWeek: number = moment().week(currWeek).day(0).unix();
    let lastDayOfWeek: number = moment().week(currWeek).day(6).unix();

    let latestWeekReq = {
      date_from: firstDayOfWeek,
      date_to: lastDayOfWeek
    };

    let token = wx.getStorageSync(globalEnum.globalKey_token);
    let that: any = this;
    webAPI.SetAuthToken(token);

    webAPI.RetrieveWeightLog(latestWeekReq).then(resp => {

      that.setData({
        weight: resp.latest_weight.value.toString()
      })
    });
  }

  public onWeightInput(e): void {
    (this as any).setData({
      weight: e.detail.value
    });
  }

  public onWeightConfirm(e): void {

    if (isNaN(parseInt(this.data.weight)) || parseInt(this.data.weight) <= 0) {
      wx.showModal({
        title: "错误!",
        content: "请输入零以上的数字",
        showCancel: false,
        confirmText: "OK"
      });

      (this as any).setData({
        weight: 1
      });
    }
  }

  public submitWeightRecord(e): void {
    if (this.data.weight === null) {
      wx.showModal({
        title: "错误!",
        content: "请先输入您的体重",
        showCancel: false,
        confirmText: "OK"
      });

      return;
    }

    let tempTimestamp: number =this.data.todayAtMidNight.unix();
    let tempWeight: number = Number(Number(this.data.weight).toFixed(1));
    if (typeof tempWeight === 'number' && isNaN(tempWeight)) {
      wx.showModal({
        title: "错误!",
        content: "请输入正确的数字",
        showCancel: false,
        confirmText: "OK"
      });
      return false
    }
    let token = wx.getStorageSync(globalEnum.globalKey_token);
    webAPI.SetAuthToken(token);

    setTimeout(function () {
      let createWeightLogReq = {
        weight_value: tempWeight,
        date: tempTimestamp
      }

      webAPI.CreateWeightLog(createWeightLogReq).then(resp => {
        wx.hideLoading();
        wx.showToast({
          title: "添加完成!"
        });
      }).catch(err => wx.hideLoading());

      wx.navigateBack({
        delta: 1
      })
    }, 2000);
  }
}

Page(new weightInputPage());