let app =  getApp();

import request from '../../../api/app/interface';

type options = {
  mealType:number
  mealDtate:number
  title:string
}
class MotionStep {
  
  public data = {
    step:'-/-'
  }

  public onLoad(options) {
    this.setData({
      step:options.step
    })
  }
  public onReady(){
   
  }
  public backToHome(){
    console.log(999)
    wx.switchTab({url: '/pages/home/index'});
  }
}

Page(new MotionStep())