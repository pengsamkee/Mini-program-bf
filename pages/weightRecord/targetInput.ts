import * as moment from 'moment';
import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';

class targetInputPage {
  public data = {
    weight: "50",
    date: "2019-06-01",
    year: "2019",
    month: "06",
    day: "01"
  }

  public onLoad(e) {
    (this as any).setData({
      date: moment().format("YYYY-MM-DD"),
      year: moment().format("YYYY"),
      month: moment().format("MM"),
      day: moment().format("DD"),
    });

    wx.setNavigationBarTitle({
      title: "设定新目标"
    });
  }

  public bindDateChange(e): void {
    let newDate = moment(e.detail.value);
    let year = newDate.year();
    let month = newDate.month() + 1;
    let day = newDate.date();

    (this as any).setData({
      date: e.detail.value,
      year: year.toString(),
      month: month.toString(),
      day: day.toString()
    });
  }

  public onWeightInput(e): void {
    (this as any).setData({
      weight: e.detail.value
    });
  }

  // checks that weight is an integer greater than 0
  public onWeightConfirm(e): void {
    if (isNaN(this.data.weight) || this.data.weight <= 0) {
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

    wx.showLoading({
      title: '正在添加',
    });

    let tempTimestamp: number = moment(this.data.date).unix();
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
      let createTargetWeightReq = {
        target_weight_value: tempWeight,
        date: tempTimestamp
      }

      webAPI.CreateTargetWeight(createTargetWeightReq).then(resp => {
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

Page(new targetInputPage());