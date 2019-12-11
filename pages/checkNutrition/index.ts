import { IMyApp } from '../../app'
import { UpdateUserProfileReq } from "../../api/app/AppServiceObjs"
import * as globalEnum from '../../api/GlobalEnum'
import * as moment from 'moment';
import request from '../../api/app/interface';
import list from './list';
const app = getApp<IMyApp>()

import * as webAPI from '../../api/app/AppService';
class QueryCalories {

  public data = {
    activeIndex:0,
    showLoading:false,
    scrollTop:0,
    // 左侧点击类样式
    curNav: 'A',
    list:list,
    scrollTopId:'',
    queryArr:[],

  }

  public goSearchFood(){
    wx.navigateTo({
      url:'/checkNutrition/pages/searchFood/index'
    })
  }

  public scrollToLower():any{
    const that = this;
    if (this.data.category[this.data.activeIndex].totalPage==1){
      return false
    }
    (that as any).setData({
      showLoading:true
    })
    setTimeout(()=>{
      (that as any).setData({
        showLoading: false
      })
    },2000)
  }
  public handleTapCategoryItem(e:any):void{
    let idx = e.target.dataset.categoryIndex;
    (this as any).setData({
      activeIndex: idx,
    })
    if (this.data.category.length - idx < 5){
      (this as any).setData({
        scrollTop:99999,
      })
    }
  }
  public onShow() {

  }
  public goNutritionDetil(e){
    console.log(e.currentTarget.dataset.itemId)
    const id = e.currentTarget.dataset.itemId
    wx.navigateTo({
      url:`/checkNutrition/pages/nutritionDetail/index?id=${id}`
    })
  }




  //点击左侧 tab ，右侧列表相应位置联动 置顶
  public switchRightTab(e) {
  var id = e.target.dataset.id;
  console.log(typeof id)
  this.setData({
    // 动态把获取到的 id 传给 scrollTopId
    scrollTopId: id,
    // 左侧点击类样式
    curNav: id
  })

  public bindscroll(e) {
    const viewItemArr = this.data.queryArr.map(item=>{
      if (e.detail.scrollTop>item.top){
        return item.id
      }
    })
    const str = viewItemArr.join('');
    let curId = str.substr(str.length-1);
    curId = curId ? curId : 'A';
    (this as any).setData({ curNav: curId})
  }

  public onReady(){
    const that = this
    const query = wx.createSelectorQuery()
    for (let index in this.data.list){
      query.select(`#${index}`).boundingClientRect()
    }
    query.exec(function (res:any) {
      res.map( i => i.top -= 66 );
      (that as any).setData({
        queryArr: res
      })
    })
  }
  public onTapFoodItem(e){
    const foodId = e.currentTarget.dataset.foodId
    const foodType = e.currentTarget.dataset.foodType
    wx.navigateTo({
      url: `../../checkNutrition/pages/nutritionDetail/index?foodId=${foodId}&foodType=${foodType}`
    })
  }
}

Page(new QueryCalories());
