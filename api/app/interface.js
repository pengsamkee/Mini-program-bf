import fetch from './fetch.js'
export default {
  MealLogShare(data){
    return fetch('/MiniprogramWebService.MealLogShare', data, 'POST')
  },
  foodNutritions(data) {
    return fetch('/knowledgeCenter/foodNutritions', data, 'GET')
  },
  commonFoodList(data) {
    return fetch('http://192.168.110.241:18082/rc/miniProgram/commonFoodList', data, 'GET')
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