
// const app = getApp();
var globalEnum = require("../GlobalEnum");
var baseUrl = globalEnum.baseUrl;

const fetch = (url, data, method) => {
  let requestUrl = baseUrl + url;
  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method: method,
      data: data,
      header: {
        'Authorization': 'token ' + wx.getStorageSync(globalEnum.globalKey_token),
      },
      success: function (res) {
        // 兼容海报分享接口
        if ((res.data.multi_dish || res.data.single_dish) && res.data.image_url){
          return resolve(res.data)
        }
        if ( res.data.code === 200 && res.data.success ) {
          try {
            return resolve(res.data.data)
          } catch (e) {
            console.log('请求成功,但解析失败')
            return reject(res.data);
          }
        }
        console.log('请求成功,但code不等于200')
        return reject(res.data);
      },
      fail: function (err) {
        console.log('请求失败')
        return reject(err.data);
      }
    })
  })
}

export default fetch;