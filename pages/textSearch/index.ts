import * as webAPI from '../../api/app/AppService';
import { RetrieveTextSearchReq, RetrieveTextSearchResp, CreateOrUpdateMealLogReq, AddRecipeItemReq, MealLogResp } from "/api/app/AppServiceObjs"
import * as globalEnum from '../../api/GlobalEnum'
import * as textCache from './textCache/TextCache'

type data = {
  keyword: String;
  resultList: Result[];
}

type Result = {
  foodId: number;
  displayName: String;
  foodType: number;
  engry: number;
}

class textSearch {
  public filterType = 0; //0.all 1.recipe 2.ingreident
  public mealType = 0; //1.breakfast 2.lunch 3.dinner 4.snack
  public naviType = 0; //0.textsearch => detail 1.textsearch => tag 2.textsearch=> ingredient
  public mealDate = 0; //prev page must pass mealDate to textSearch page

  public data = {
    keyword: "",
    inputShowed: false,
    resultList: [],
    resultError: [],
    recentList: []
  }

  public onLoad(options: any) {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    console.log(wx.getStorageSync(globalEnum.globalKey_token));
    // webAPI.SetAuthToken("bimlkbqkh52pa0ta7asg");
    let title = options.title;
    this.filterType = parseInt(options.filterType);
    this.mealType = parseInt(options.mealType);
    this.naviType = parseInt(options.naviType);
    this.mealDate = parseInt(options.mealDate);
    wx.setNavigationBarTitle({
      title: "添加" + title//页面标题为路由参数
    });
  }

  public onShow() {
    if (this.data.resultList.length === 0){
       this.getRecentList();
    }
  }

  public getRecentList(){
    let recentList = textCache.getAllValue();
    console.log(recentList);
    (this as any).setData({
      recentList: recentList
    });
  }

  public showInput() {
    (this as any).setData({
      inputShowed: true
    });
  }

  public clearInput() {
    (this as any).setData({
      keyword: "",
      resultError: false
    });
  }

  public inputTyping(event: any) {
    (this as any).setData({
      resultError: false,
      keyword: event.detail.value,
    });
  }

  public performSearch() {
    let keyword = this.data.keyword;
    let req = { query: keyword, filter_type: this.filterType, meal_type: this.mealType };
    console.log(req);
    var that = this;
    webAPI.RetrieveTextSearch(req).then(resp => {
      console.log(resp);
      that.setResultList(resp);
    }).catch(err => console.log(err));
  }

  public setResultList(resp: RetrieveTextSearchResp) {
    let results = [];

    if (resp.result_list.length==0) {
      (this as any).setData({
        resultList: [],
        resultError: true
      })
    } else {

      for (let index in resp.result_list) {
        let item = resp.result_list[index];
        let result = {
          foodId: item.food_id,
          foodName: item.food_name,
          foodType: item.food_type,
          amount: item.amount,
          unit: item.unit_name,
          energy: Math.floor(item.energy / 100)
        }
        results.push(result);
      }
      (this as any).setData({
        resultList: results,
        resultError: false
      });
    }


    console.log(this.data.resultList);
  }

  /**
   * three case
   * 1.foodDiary -> textsearch -> foodDetailPage(return ingredient/receipe)
   * 2.imageTag -> textsearch -> imageTag(return ingredient/receipe)
   * 3.foodDetail -> textsearch -> foodDetail(return ingredient)
   * common solution: set prevPage.data.textSearchItem
   */
  public onTextSearchResultSelect(event: any) {
    let index = event.currentTarget.dataset.textIndex;
    let foodId = this.data.resultList[index].foodId;
    let foodName = this.data.resultList[index].foodName;
    let foodType = this.data.resultList[index].foodType;
    let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    if (this.naviType === 0) {
      //create meal here
      wx.showLoading({ title: "加载中...", mask: true });
      let results = [{ food_id: foodId, food_name: foodName, food_type: foodType }];
      let food = { food_id: foodId, input_type: 2, food_type: foodType, recognition_results: results };
      let foodList = [food];
      let req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
      webAPI.CreateOrUpdateMealLog(req).then(resp => {
        wx.hideLoading({});
        let param = {};
        param.mealId = resp.meal_id;
        param.imageUrl = imageUrl;
        param.showShareBtn = false;
        let paramJson = JSON.stringify(param);
        wx.navigateTo({
          url: "/pages/foodDetail/index?paramJson=" + paramJson
        });
      }).catch(err => {
        console.log(err);
        wx.hideLoading({});
        });
    } else {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      //set text search result to prev pages
      prevPage.textSearchFood = { food_id: foodId, food_name: foodName, food_type: foodType }
      wx.navigateBack({
        delta: 1
      })
    }
    //recent LRU
    textCache.setValue(this.data.resultList[index]);
  }

  public onRecentResultSelect(event: any){
    let index = event.currentTarget.dataset.textIndex;
    let foodId = this.data.recentList[index].foodId;
    let foodName = this.data.recentList[index].foodName;
    let foodType = this.data.recentList[index].foodType;
    let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    if (this.naviType === 0) {
      //create meal here
      wx.showLoading({ title: "加载中...", mask: true });
      let results = [{ food_id: foodId, food_name: foodName, food_type: foodType }];
      let food = { food_id: foodId, input_type: 2, food_type: foodType, recognition_results: results };
      let foodList = [food];
      let req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
      webAPI.CreateOrUpdateMealLog(req).then(resp => {
        wx.hideLoading({});
        let param = {};
        param.mealId = resp.meal_id;
        param.imageUrl = imageUrl;
        param.showShareBtn = false;
        let paramJson = JSON.stringify(param);
        wx.navigateTo({
          url: "/pages/foodDetail/index?paramJson=" + paramJson
        });
      }).catch(err => {
        console.log(err);
        wx.hideLoading({});
      });
    } else {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      //set text search result to prev pages
      prevPage.textSearchFood = { food_id: foodId, food_name: foodName, food_type: foodType }
      wx.navigateBack({
        delta: 1
      })
    }
    //recent LRU
    textCache.setValue(this.data.recentList[index]);
  }

  public deleteTextSearchCache(event: any){
    textCache.clearAll();
    this.getRecentList();
  }

}

Page(new textSearch())
