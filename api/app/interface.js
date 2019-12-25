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

  
  // getPoidetail(data) {
  //   return fetch('/api/poi/' + data.id + '.json', {}, 'GET')
  // },
  // clock(data) {
  //   return fetch('/api/checkpoint/' + data.id + '.json', {}, 'POST')
  // },
  // getPhone(data) {
  //   return fetch('/api/member/decrypt.json', data, 'POST')
  // },
  // getCommentList(data) {
  //   return fetch('/api/poi/' + data.id + '/comment.json', data, 'GET')
  // }
  
}