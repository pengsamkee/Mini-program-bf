import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';
import Wxml2Canvas from "../../utils/canvasJS/index"
import request from '../../api/app/interface'

class FoodSharePage {
  public mealLogId = 0;
  public data = {
    imageUrl: "", // 画出来的图
    imgHeight:0,
    imgWidth:3,
    image_url:'', // 原来的图
    percent:0,
    multi: {} ,
    single: {} ,
    user_info: {},
    userInfo:{},//暂时没用
  }

  public drawImage() {
    let self = this;
    var drawimg = new Wxml2Canvas({
      width: self.data.imgWidth,
      height: self.data.imgHeight,
      element: 'canvas1',
      background: '#ffffff',
      destZoom: 3,
      zoom: 2,
      progress(percent) {
        self.setData({
          percent: percent.toFixed(0)
        })
      },
      finish(url) {
        self.setData({
          imageUrl: url
        })
      },
      error(res) {
        setTimeout(() => {
          self.drawImage();
        }, 500)
      }
    });
    let data2 = {
      list: [
        {
          type: 'wxml',
          class: '.draw-wrap .draw_canvas',
          limit: '.draw-wrap',
          x: 0,
          y: 0
        }
      ]
    }
    drawimg.draw(data2);
  }

  public onLoad(options: any) {
    this.mealLogId = Number(options.mealId);
    if(options.token){
      wx.setStorageSync('token',options.token);
      webAPI.SetAuthToken(options.token);
    }
    
  }
  public onReady(){
    const that = this
    const windowWidth = wx.getSystemInfoSync().windowWidth
    this.setData({
      imgWidth:windowWidth*0.8
    },()=>{
      setTimeout(()=>{
        that.mealLogShare()
      },300)
    })
  }

  public mealLogShare(){
    const that:any = this
    request.MealLogShare({
      "meal_log_id": this.mealLogId
    }).then(res => {
      console.log(4567,res)
      if(res.single_dish){
        for(let index in res.single_dish){
          const item = res.single_dish[index];
          if(res.single_dish[index].value){
            if(index==='calorie'){
              item.value = item.value.toFixed(0)
            }else{
              item.value = item.value.toFixed(1)
            }
          }
        }
      }else{
        for(let index in res.multi_dish){
          const item = res.multi_dish[index];
          if(res.multi_dish[index].value){
            if(index==='calorie'){
              item.value = item.value.toFixed(0)
            }else{
              item.value = item.value.toFixed(1)
            }
          }
        }
      }
      const r = res
      const image_url = res.image_url
      that.setData({
        image_url: image_url,
        // multi: res.multi_dish,
        // single: res.single_dish,
        multiOrSingle:res.multi_dish?res.multi_dish:res.single_dish,
        user_info: res.user_info
      },()=>{
        wx.getImageInfo({
          src: image_url,
          success(res) {
            let h = (res.height * that.data.imgWidth / res.width)+275;
            // let canChangeHeight = r.multi_dish ? h:h+170;
            that.setData({
              // 图片默认是300px宽
              imgHeight: h,
              percent:1 // 只是为了在画图之前250ms，让进度条先显示出来
            })
            setTimeout(() => {
              console.log(that.data.imgHeight)
              that.drawImage()
            }, 250)
          }
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }
  
  public handleGoHome(){
    wx.switchTab({
      url:'/pages/home/index'
    })
  }

/**
 * 已经注释
 */
  public getSharePic() {
    wx.showLoading({ title: "生成美图中..." });
    let req = { "meal_log_id": this.mealLogId };
    webAPI.RetrieveMealLogShareURL(req).then(resp => {
      wx.hideLoading({});
      let imageUrl = resp.sharing_img_link;
      console.log(imageUrl);
      (this as any).setData({
        imageUrl: imageUrl
      });
    }).catch(err => {
      wx.hideLoading({});
      console.log(err);
      wx.showModal({
        title: '',
        content: '生成美图失败',
        showCancel: false
      });
    });
    // (this as any).setData({ imageUrl:"http://s5.sinaimg.cn/mw690/002aRmVFzy764G2z0gYe4&690"});
  }

  public onSaveToAlbumBtnPressed() {
    //downloadFile -> save tempFile from tempFilePath
    var that = this;
    wx.showLoading({
      title: '保存中...'
    });
    //图片保存到本地
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imageUrl,
      success: function (data) {
        wx.hideLoading({});
        wx.showToast({
          title: '保存图片成功',
        });
      },
      fail: function (err) {
        wx.hideLoading({});
        if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
          wx.showModal({
            title: '提示',
            content: '需要您授权保存相册',
            showCancel: false,
            success: modalSuccess => {
              wx.openSetting({
                success(settingdata) {
                  console.log("settingdata", settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限成功,再次点击图片即可保存',
                      showCancel: false,
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限失败，将无法保存到相册哦~',
                      showCancel: false,
                    })
                  }
                },
                fail(failData) {
                  console.log("failData", failData)
                },
                complete(finishData) {
                  console.log("finishData", finishData)
                }
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: err.errMsg,
            showCancel: false,
          });
        }
      }
    })
  }

  public onShareAppMessage() { 
    const token = wx.getStorageSync(globalEnum.globalKey_token)
    return {
      title: '瘦熊猫Nutritionist',
      path: `/pages/foodShare/index?token=${token}&mealId=${this.mealLogId}`,
      imageUrl: this.data.imageUrl
    }
  }
}

Page(new FoodSharePage());