import fetch from './fetch.js'
export default {
  MealLogShare(data){
    return fetch('/MiniprogramWebService.MealLogShare', data, 'POST')
  },
  foodNutritions(data) {
    return fetch('/kc/miniProgram/nutrients', data, 'GET')
  },
  commonFoodList(data) {
    return fetch('/rc/miniProgram/commonFoodList', data, 'GET')
  },
  getFoodUnitOption(data) {
    return fetch('/kc/miniProgram/getFoodUnitOption', data, 'POST')
  },
  getFoodUnitOptionList(data) {
    return fetch('/kc/miniProgram/getFoodUnitOptionList', data, 'POST')
  },
  recognizeFood(data) {
    return fetch('/rc/miniProgram/recognizeFood', data, 'POST')
  },
  createMealLog(data) {
    return fetch('/rc/miniProgram/createMealLog', data, 'POST')
  },
  getMealLogSummary(data) {
    return fetch('/rc/miniProgram/getMealLogSummary', data, 'POST')
  },
  deleteMealLog(data) {
    return fetch('/rc/miniProgram/deleteMealLog', data, 'POST')
  },
  deleteFoodLog(data) {
    return fetch('/rc/miniProgram/deleteFoodLog', data, 'POST')
  },
  getSimpleDailyAnalysis(data) {
    return fetch('/rc/miniProgram/getSimpleDailyAnalysis', data, 'POST')
  },
  getMealMacronutrientAnalysis(data) {
    return fetch('/rc/miniProgram/getMealMacronutrientAnalysis', data, 'POST')
  },
  // 得到首页饮食记录数据
  getDailyMealLogGroupFoodLogDetail(data) {
    return fetch('/rc/miniProgram/getDailyMealLogGroupFoodLogDetail', data, 'POST')
  },
  // 得到首页canvas数据
  getDailyMacronutrientSummary(data) {
    return fetch('/rc/miniProgram/getDailyMacronutrientSummary', data, 'POST')
  },
  // 通过 token 获取用户个人信息
  getUserProfileByToken(data) {
    return fetch('/uc/miniProgram/getUserProfileByToken', data, 'POST')
  },
  // 请求查营养Tab页面的列表信息
  checkNutrientFoodList(data) {
    return fetch('/kc/tools/checkNutrientFoodList', data, 'GET')
  },
  // 查看用户有没有输入邀请码注册
  userLevel(data) {
    return fetch('/uc/miniProgram/userLevel', data, 'GET')
  },
  // 解密得到微信运动步数
  runStepInfo(data) {
    return fetch('/rc/wxmp/runStepInfo', data, 'GET')
  },
  
}