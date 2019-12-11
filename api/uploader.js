const REGION = "ap-shanghai"
const APPID = "1258665547"
const BUCKET_NAME = "dietlens"
const DIR_NAME = "/food-image/"
const secretId = "AKIDyIAsLYphXBbZHK93obQ5VItlz3sVAegL"
// const secretKey = "d06xYvQfeLmz4LOAftuslUxwiDSSBfFh"
const secretKey = "jEOTUFHC4mHXLwHF4ex854nCRjlcDaiZ"

var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + DIR_NAME;

var globalEnum=require('../api/GlobalEnum.js')
var cosSignUrl = globalEnum.cosSignUrl;

// var cosUrl = "https://.ap-shanghai.file.myqcloud.com/files/v2/food-image/dietlens-1258665547/food-image"

var CosAuth = require('./cos-auth');

// 请求用到的参数
// var prefix = 'https://cos.' + REGION + '.myqcloud.com/' + BUCKET_NAME + '/'; // 这个是后缀式，签名也要指定 Pathname: '/' + config.Bucket + '/'
var prefix = 'https://' + BUCKET_NAME + "-" + APPID + '.cos.' + REGION + '.myqcloud.com/';


// 对更多字符编码的 url encode 格式
var camSafeUrlEncode = function(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};

// 获取临时密钥
var stsCache;
var getCredentials = function(callback,failCallback) {
  // if (stsCache && Date.now() / 1000 + 30 < stsCache.expiredTime) {
  //   callback();
  //   return;
  // }
  wx.request({
    method: 'GET',
    url: cosSignUrl, // 服务端签名，参考 server 目录下的两个签名例子
    dataType: 'json',
    success: function(result) {
      var data = result.data;
      var credentials = data.credentials;
      console.log(typeof data);
      console.log(data.credentials);
      if (credentials) {
        stsCache = data
      } else {
        wx.showModal({
          title: '临时密钥获取失败',
          content: JSON.stringify(data),
          showCancel: false
        });
      }
      callback(stsCache && stsCache.credentials);
    },
    error: function(err) {
      console.log("stsLog:"+err);
      wx.showModal({
        title: '临时密钥获取失败',
        content: JSON.stringify(err),
        showCancel: false
      });
      failCallback(err);
    }
  });
};

// 计算签名
var getAuthorization = function(options, callback, errcb) {
  getCredentials(function(credentials) {
    callback({
      XCosSecurityToken: credentials.sessionToken,
      Authorization: CosAuth({
        SecretId: credentials.tmpSecretId,
        SecretKey: credentials.tmpSecretKey,
        Method: options.Method,
        Pathname: options.Pathname,
      })
    });
  },function(error){
    errcb(error)
  });
};

// 上传文件
export var uploadFile = function(filePath,successcb,failurecb,progresscb,mealIndex,imageIndex) {
  console.log("start upload image"+filePath);
  var Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
  getAuthorization({
    Method: 'POST',
    Pathname: '/'
  }, function(AuthData) {
    var requestTask = wx.uploadFile({
      url: prefix,
      name: 'file',
      filePath: filePath,
      formData: {
        'key': DIR_NAME+Key,
        'success_action_status': 200,
        'Signature': AuthData.Authorization,
        'x-cos-security-token': AuthData.XCosSecurityToken,
        'Content-Type': '',
      },
      success: function(res) {
        var url = prefix + camSafeUrlEncode(Key).replace(/%2F/g, '/');
        if (res.statusCode === 200) {
          successcb(mealIndex, imageIndex);
        } else {
          wx.showModal({
            title: '上传失败',
            content: JSON.stringify(res),
            showCancel: false
          });
          failurecb(mealIndex, imageIndex);
        }
        console.log(res.statusCode);
        console.log(url);
      },
      fail: function(res) {
        wx.showModal({
          title: '上传失败',
          content: JSON.stringify(res),
          showCancel: false
        });
        failurecb(mealIndex, imageIndex);
      }
    });
    requestTask.onProgressUpdate(function(res) {
      console.log(res);
      progresscb(res.progress, mealIndex, imageIndex);
    });
  },function(error){//get authentication error
    console.log(error);
    failurecb(mealIndex, imageIndex);
  });
};

module.exports = uploadFile;