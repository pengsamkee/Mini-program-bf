
import request from '../../api/app/interface';
import list from './list';

import * as webAPI from '../../api/app/AppService';
class QueryCalories {

  public data = {
    activeIndex:0,
    showLoading:false,
    scrollTop:0,
    curNav: 'A',
    list:null,
    scrollTopId:'',
    queryArr:[],
  }

  public getCheckNutrientFoodList(){
    const that = this
    request.checkNutrientFoodList().then(res=>{
      that.formatList(res)
    }).catch(err=>{
      wx.showToast({
        title: '服务器开小差,稍后请重试',
        icon: 'none',
      });
    })
  }
  public onShow(){
    const that = this
    setTimeout(()=>{
      if(that.data.list===null){
        that.getCheckNutrientFoodList()
      }
    },4000)
  }

  public formatList(res){
    const key = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    let list = {}
    res.map((item,index)=>{
      list[key[index]]=[
        {name:item.efficacyName},
        ...item.foodList
      ]
    });
    (this as any).setData({
      list:list
    },()=>{
      this.getQueryArr()
    })
  }

  public getQueryArr(){
    const that = this
    const query = wx.createSelectorQuery()
    for (let index in that.data.list){
      query.select(`#${index}`).boundingClientRect()
    }
    query.exec(function (res:any) {
      res.map( i => i.top -= 66 );
      (that as any).setData({
        queryArr: res
      })
    })
  }

  public onReady(){
    this.getCheckNutrientFoodList()
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

  public onTapFoodItem(e){
    const foodId = e.currentTarget.dataset.foodId
    const foodType = e.currentTarget.dataset.foodType
    wx.navigateTo({
      url: `../../checkNutrition/pages/nutritionDetail/index?foodId=${foodId}&foodType=${foodType}`
    })
  }
}

Page(new QueryCalories());