import { IMyApp } from '../../../app'
import * as webAPI from '../../../api/app/AppService';
import { RetrieveTextSearchResp } from "/api/app/AppServiceObjs";
import * as globalEnum from '../../../api/GlobalEnum';
import * as textCache from './textCache/TextCache';
const app = getApp<IMyApp>()

class SearchFood {
  public data = {
    keyword: "",
    resultList:[],
    resultError:[],
    recentList:[],
  }

  public onLoad() {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
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

/**
 * 用户点击搜索
 */
  public performSearch() {
    let keyword = this.data.keyword;
    let req = { query: keyword };
    var that = this;
    webAPI.RetrieveTextSearch(req).then(resp => {
      that.setResultList(resp);
    }).catch(err => console.log(err));
  }
/**
 * 解析接口的数据
 */
  public setResultList(resp: RetrieveTextSearchResp) {
    let results = [];
    if (resp.result_list.length == 0) {
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
      console.log('results=====',results);
      (this as any).setData({
        resultList: results,
        resultError: false
      });
    }
  }
  /**
   * 获取用户输入的文字
   */
  public inputTyping(event: any) {
    (this as any).setData({
      resultError: false,
      keyword: event.detail.value,
    });
  }
/**
 * 点击清除按钮，清除数据
 */
  public clearInput() {
    (this as any).setData({
      keyword: "",
      resultError: false
    });
  }

  /**
   * 用户点击列表中的某个事物，页面做跳转
   */
  public onTapFoodItem(event:any){
    let index = event.currentTarget.dataset.textIndex;
    textCache.setValue(this.data.resultList[index]);
  }

  public onRecentResultSelect(event:any){
    let index = event.currentTarget.dataset.textIndex;
    textCache.setValue(this.data.recentList[index]);
  }

  public deleteTextSearchCache() {
    textCache.clearAll();
    this.getRecentList();
  }

}

Page(new SearchFood())
