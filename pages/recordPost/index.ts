import { setStorage, chooseImage} from '../../api/promiseAPI'

class RecordPostPage {

  public data = {
    imageList: [],
    updatedImageList: [],
    recordId:1, //only store 1 record
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000
  }

  public onShow(): void {
    console.log('onShow');
    //load image list
    var that = this;
    if (this.data.recordId !== 0) {
      wx.getStorage({
        key: 'image-list-' + that.data.recordId,
        success (res){
          console.log("on show imageList:" + res.data);
          (that as any).setData({
            imageList: res.data,
          })
        },
        fail: function (error) {
          console.log("error:" + error)
        }
      })
    }
  }

  public bindAddImage(): void {
    var that = this;
    chooseImage({})
    .then(
      (res:any) =>{
        return Promise.resolve(res)
      },
      (err:any) =>{
        return Promise.reject(err)
      }
    )
    .then(
        (data:any) => {
          console.log("image:" + data.tempFilePaths);
          that.data.updatedImageList = wx.getStorageSync('image-list-' + that.data.recordId);
          if (!that.data.updatedImageList) { that.data.updatedImageList = []; }
          that.data.updatedImageList.push({ "imageURL": data.tempFilePaths });
          console.log("add image:" + that.data.updatedImageList);
          return setStorage({
            key: 'image-list-' + that.data.recordId,
            data: that.data.updatedImageList
          })
        }
    )
    .then(
      (successMsg) => {
        console.log('写入storage成功，返回的消息为：')
        console.log(successMsg);
        console.log("message image:" + that.data.imageList);
        that.setData({
          imageList: this.data.updatedImageList
        })
        // console.log(that.data.imageList);
        },
        (err:any) => {
          console.log('写入storage失败，返回的消息为：')
          console.log(err)
        }
    )

  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['original', 'compressed'],
  //     success(res) {
  //       let images = wx.getStorageSync('image-list-' + that.data.recordId)
  //       console.log("image:" + images)
  //       let imagelist: any[] = []
  //       for (var image of images) {
  //         imagelist.push(image)
  //       }
  //       imagelist.push({ "imageURL": res.tempFilePaths })
  //       console.log(imagelist)
  //       wx.setStorage({
  //         key: 'image-list-' + that.data.recordId,
  //         data: imagelist,
  //         success: function () {
  //           (that as any).setData({
  //             imageList: imagelist
  //           })
  //         }
  //       })
  //     }
  //   })
  }
}

Page(new RecordPostPage());