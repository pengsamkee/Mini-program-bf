import WeCropper from '../../utils/we-cropper.js'
import UploadFile from '../../api/uploader.js';

const app = getApp()
const config = app.globalData.config

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
  path: "",
  mealDate: 0,
  mealType: 0,
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: config.getThemeColor(),
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    var that = this;
    this.cropper.getCropperImage(function (path, err) {
      if (err) {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      } else {
        that.path = path;
        wx.showLoading({
          title: '上传图片中...',
          mask: true
        });
        UploadFile(path, that.onImageUploadSuccess, that.onImageUploadFailed, that.onUploadProgressing, 0, 0);
        // wx.navigateTo({
        //   url: '/pages/imageTag/index?imageUrl='+path,
        // });
        // wx.previewImage({
        //   current: '', // 当前显示图片的 http 链接
        //   urls: [path] // 需要预览的图片 http 链接列表
        // })
      }
    })
  },
  onImageUploadSuccess: function (mealIndex, imageIndex) {
    console.log("uploadSucess" + this.mealType + "," + this.mealDate);
    wx.hideLoading();
    wx.navigateTo({
      url: '/pages/imageTag/index?imageUrl=' + this.path + "&mealType=" + this.mealType + "&mealDate=" + this.mealDate,
    });
  },
  onImageUploadFailed: function (mealIndex, imageIndex) {
    console.log("uploadfailed");
    wx.hideLoading();
  },
  onUploadProgressing: function (progress, mealIndex, imageIndex) {
    console.log("progress:" + progress);
  },
  onLoad(option) {
    const { cropperOpt } = this.data

    cropperOpt.boundStyle.color = config.getThemeColor()

    this.setData({ cropperOpt });

    if (option.mealDate && option.mealType) {
      console.log(option.mealDate + "," + option.mealType);
      this.mealDate = option.mealDate;
      this.mealType = option.mealType;
    }
    if (option.imageUrl) {
      cropperOpt.src = option.imageUrl
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          console.log(`before picture loaded, i can do something`)
          console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          console.log(`picture loaded`)
          console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          console.log(`before canvas draw,i can do something`)
          console.log(`current canvas context:`, ctx)
        })
    }
  }
})
