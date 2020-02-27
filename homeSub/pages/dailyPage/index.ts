let app =  getApp();

import request from '../../../api/app/interface';

type options = {
  mealType:number
  mealDtate:number
  title:string
}
class DailyPage {
  
  public data = {
    
  }

  public onLoad() {
    
  }
  public onReady(){
   
  }
  public backToHome(){
    console.log(999)
    wx.switchTab({url: '/pages/home/index'});
  }
}

Page(new DailyPage())