
const envVersion = __wxConfig.envVersion;
let baseUrl,cosSignUrl,reportPageUrl;
if(envVersion && (envVersion==='develop' || envVersion==='trial')){ 
  // 早餐吃好Java版本体验版api
  baseUrl = 'https://test-japi.pinshen.com.cn',  
  cosSignUrl = "https://sts.pinshen.com.cn/sts",
  reportPageUrl = 'https://test-jreport.pinshen.com.cn/userdailywebreport'
}else{ 
  // 早餐吃好Java版本正式版api
  baseUrl = 'https://japi.pinshen.com.cn',  
  // cosSignUrl = "https://sts-bf.pinshen.com.cn/sts", 
  cosSignUrl = "https://sts.pinshen.com.cn/sts",
  reportPageUrl = 'https://jreport.pinshen.com.cn/userdailywebreport'
}

module.exports = {
  globalKey_reportId: 'reportId',   // 对外暴露的变量名叫myDataPost,对应着内部的dataPost对象   
  globalKey_token: 'token',
  globalKey_jscode: 'jscode',
  globalkey_hideBanner: 'hideBanner',
<<<<<<< HEAD
  // baseUrl: 'https://test-japi.pinshen.com.cn',  // 早餐吃好Java版本体验版api
  cosSignUrl: "https://sts.pinshen.com.cn/sts", // 早餐吃好Java版本体验版api
  baseUrl: 'https://japi.pinshen.com.cn',  // 早餐吃好Java版本正式版api
  // cosSignUrl: "https://sts-bf.pinshen.com.cn/sts", // 早餐吃好Java版本正式版api
=======
  baseUrl,
  cosSignUrl,
  reportPageUrl
>>>>>>> version1.0.2
}  
