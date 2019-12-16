import * as webAPI from '../../api/app/AppService';
import request from '../../api/app/interface';
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
    recentList: [],
    showChoosedLists:false,
    showChoosedConfirm:false,
    showPopup: false,
    showPicker:false,
    choosedLists:[],  // 已经添加的食物信息列表
    unitArr:['克','碗','把','捧','盆','瓢'],
    foodUnitAndUnitEnergy:[],
    foodNumValue:100,
    foodNumValueMaxlength:3,
    chooseUinitIndex:0, // 用户选择了picker中的index
    textSearchResultSelectIndex:null, // 用户点击文字搜索列表中的哪一项
    recentResultSelectIndex:null, // 用户点击了历史缓存数组中的index
    totalEnergy:0,
  }

  public onLoad(options: any) {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
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
      this.getCommonFoodList();
    }
  }
  /**
   * 获取常见的食物列表
   */
  public getCommonFoodList(){
    request.commonFoodList({

    }).then(res=>{
      console.log(res)
    }).catch(err=>{
      console.log(err)
    })
  }

  public getRecentList(){
    let recentList = textCache.getAllValue();
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
    var that = this;
    wx.showLoading({
      title:'加载中...'
    })
    webAPI.RetrieveTextSearch(req).then(resp => {
      wx.hideLoading()
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
    // let foodId = this.data.resultList[index].foodId;
    // let foodName = this.data.resultList[index].foodName;
    // let foodType = this.data.resultList[index].foodType;
    // let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    const unit_option=[
      {"unit_name":"克","weight":800,"unit_id":70},
      {"unit_name":"鸡蛋大小","weight":36000,"unit_id":74},
      {"unit_name":"碗","weight":21000,"unit_id":74}
    ];
    const arr = unit_option.map(item=>{
      return ({ 
        'name' : item.unit_name,
        'unitEnergy' : item.weight/100,
        'unit_id' : item.unit_id
      })
    })

    const nameArr = arr.map(item=>item.name);
    (this as any).setData({
      recentResultSelectIndex:null,
      foodNumValue:100, // 初始化数量100克
      chooseUinitIndex:0, // 初始化数量100克
      textSearchResultSelectIndex:index,
      unitArr:nameArr,
      foodUnitAndUnitEnergy:arr,
      showPopup:true
    },()=>{
      textCache.setValue(this.data.resultList[index]);
    })
    
    // if (this.naviType === 0) {
    //   wx.showLoading({ title: "加载中...", mask: true });
    //   let results = [{ food_id: foodId, food_name: foodName, food_type: foodType }];
    //   let food = { food_id: foodId, input_type: 2, food_type: foodType, recognition_results: results };
    //   let foodList = [food];
    //   let req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
    //   webAPI.CreateOrUpdateMealLog(req).then(resp => {
    //     wx.hideLoading({});
    //     let param = {};
    //     param.mealId = resp.meal_id;
    //     param.imageUrl = imageUrl;
    //     param.showShareBtn = false;
    //     let paramJson = JSON.stringify(param);
    //     wx.navigateTo({
    //       url: "/pages/foodDetail/index?paramJson=" + paramJson
    //     });
    //   }).catch(err => {
    //     wx.hideLoading({});
    //     });
    // } else {
    //   let pages = getCurrentPages();
    //   let prevPage = pages[pages.length - 2];
    //   prevPage.textSearchFood = { food_id: foodId, food_name: foodName, food_type: foodType }
    //   wx.navigateBack({
    //     delta: 1
    //   })
    // }

    // textCache.setValue(this.data.resultList[index]);
  }

  public onRecentResultSelect(event: any){
    let index = event.currentTarget.dataset.textIndex;
    // let foodId = this.data.recentList[index].foodId;
    // let foodName = this.data.recentList[index].foodName;
    // let foodType = this.data.recentList[index].foodType;
    // let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    const unit_option=[
      {"unit_name":"克","weight":800,"unit_id":70},
      {"unit_name":"鸡蛋大小","weight":36000,"unit_id":74},
      {"unit_name":"碗","weight":21000,"unit_id":74}
    ];
    const arr = unit_option.map(item=>{
      return ({ 
        'name' : item.unit_name,
        'unitEnergy' : item.weight/100,
        'unit_id' : item.unit_id
      })
    })

    const nameArr = arr.map(item=>item.name);
    (this as any).setData({
      textSearchResultSelectIndex:null,
      foodNumValue:100, // 初始化数量100克
      chooseUinitIndex:0, // 初始化数量100克
      recentResultSelectIndex:index,
      unitArr:nameArr,
      foodUnitAndUnitEnergy:arr,
      showPopup:true
    },()=>{
      
    })
    // textCache.setValue(this.data.recentList[index]);

    // if (this.naviType === 0) {
    //   wx.showLoading({ title: "加载中...", mask: true });
    //   let results = [{ food_id: foodId, food_name: foodName, food_type: foodType }];
    //   let food = { food_id: foodId, input_type: 2, food_type: foodType, recognition_results: results };
    //   let foodList = [food];
    //   let req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
    //   webAPI.CreateOrUpdateMealLog(req).then(resp => {
    //     wx.hideLoading({});
    //     let param = {};
    //     param.mealId = resp.meal_id;
    //     param.imageUrl = imageUrl;
    //     param.showShareBtn = false;
    //     let paramJson = JSON.stringify(param);
    //     wx.navigateTo({
    //       url: "/pages/foodDetail/index?paramJson=" + paramJson
    //     });
    //   }).catch(err => {
    //     console.log(err);
    //     wx.hideLoading({});
    //   });
    // } else {
    //   let pages = getCurrentPages();
    //   let prevPage = pages[pages.length - 2];
    //   prevPage.textSearchFood = { food_id: foodId, food_name: foodName, food_type: foodType }
    //   wx.navigateBack({
    //     delta: 1
    //   })
    // }
   
  }

  public deleteTextSearchCache(event: any){
    textCache.clearAll();
    this.getRecentList();
  }
  /**
   * 关闭弹窗popup框
   */
  public onClose(){
    (this as any).setData({ showPopup: false,showChoosedLists:false});
  }
/**
 * 切换已选食物列表的显示与隐藏
 */
  public toggleChoosedLists(){
    (this as any).setData({showChoosedLists:!this.data.showChoosedLists})
  }
  /**
   * 点击添加按钮，将食物添加至已选
   */
  public handleAddFood(){
    let textSearchResultSelectIndex = this.data.textSearchResultSelectIndex;
    let recentResultSelectIndex = this.data.recentResultSelectIndex;
    let item:any = recentResultSelectIndex === null ? this.data.resultList[textSearchResultSelectIndex] : this.data.recentList[recentResultSelectIndex];
    item = {
      ...item,
      choosedUnit:this.data.unitArr[this.data.chooseUinitIndex],
      weightNumber:this.data.foodNumValue,
      unitEnergy:this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex].unitEnergy,
      unit_id:this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex].unit_id
    };
    this.data.choosedLists.push(item);
    (this as any).setData({ 
      choosedLists : this.data.choosedLists,
      showPopup : false
    },()=>{
      this.sumEnergy();
      if(recentResultSelectIndex !== null){
        textCache.setValue(this.data.recentList[recentResultSelectIndex])
        if (this.data.resultList.length === 0){
          this.getRecentList();
        }
      }
      console.log(this.data.choosedLists)   
    })
  }
  /**
   * @param 计算用户食物一共有多少热量
   */
  public sumEnergy(){
    const totalEnergy = this.data.choosedLists.reduce((pre,next)=>{
      return next.weightNumber*next.unitEnergy+pre
    },0);
    (this as any).setData({totalEnergy:totalEnergy})
  }

  /**
   * 用户输入食物的份数
   */
  public handleFoodNumInput(e:any){
    (this as any).setData({foodNumValue:parseInt(e.detail.value)})
  }
  /**
   * 展示picker，选择食物单位
   */
  public showPicker(){
    (this as any).setData({showPicker:true,showPopup:false})
  }
  public onConfirm(){
    (this as any).setData({showPicker:false,showPopup:true})
  }
  public onChange(e:any){
    let chooseUinitIndex:number = e.detail.index;
    if(this.data.unitArr[chooseUinitIndex]==='克'){
      (this as any).setData({foodNumValueMaxlength:3})
    }
    (this as any).setData({chooseUinitIndex:chooseUinitIndex})
  }
  /**
   * 删除选中列表中的某一项
   */
  public handleDeleteChoosedItem(e:any){
    let index = e.currentTarget.dataset.index;
    this.data.choosedLists.splice(index,1);
    (this as any).setData({choosedLists:this.data.choosedLists},()=>{
      this.sumEnergy()
      if(this.data.choosedLists.length===0){
        (this as any).setData({showChoosedLists:false})
      }
    })
  }
  /**
   * 批量添加食物整合参数
   */
  public handleConfirmBtn(){
    wx.showLoading({ title: "加载中...", mask: true });
    let foodList:any[] = [];
    this.data.choosedLists.map((item:any) => {
      let results = [{ food_id: item.foodId, food_name: item.foodName, food_type: item.foodType }];
      let food = { 
        food_id: item.foodId, 
        food_type: item.foodType, 
        recognition_results: results,
        input_type: 2, 
        amount:parseInt(item.weightNumber)*100,
        unit_id: item.unit_id
      };
      foodList.push(food)
    })
    let req = { meal_id: -1, meal_type: this.mealType, meal_date: this.mealDate, food_list: foodList };
    console.log('请求参数req',req)
    this.CreateOrUpdateMealLog(req);
  }
  /**
   * 格式化数据后，发出请求，获得meal_id
   */
  public CreateOrUpdateMealLog(req:any){
    let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
    webAPI.CreateOrUpdateMealLog(req).then(resp => {
      // let param:any = {};
      // param.mealId = resp.meal_id;
      // param.imageUrl = imageUrl;
      // param.showShareBtn = false;
      // let paramJson = JSON.stringify(param);
      this.ConfirmMealLog(resp.meal_id)
    }).catch(err => {
      wx.showToast({title: '请求失败',icon: 'none'});
      wx.hideLoading({});
    });
  }
  /**
   * 发出请求，创建记录
   */
  public ConfirmMealLog(meal_id:number){
    let req = { meal_id: meal_id };
    webAPI.ConfirmMealLog(req).then(resp => {
      wx.hideLoading({});
      wx.navigateTo({ url: `../../homeSub/pages/mealAnalysis/index?mealDate=${this.mealDate}&mealType=${this.mealType}`})
    }).catch(err => {
      wx.showToast({title: '提交食物记录失败',icon: 'none'});
    });
  }

}

Page(new textSearch())
