import * as webAPI from '../../api/app/AppService';
import request from '../../api/app/interface';
import { RetrieveTextSearchReq, RetrieveTextSearchResp, AddRecipeItemReq, MealLogResp } from "/api/app/AppServiceObjs"
import * as globalEnum from '../../api/GlobalEnum'
import * as textCache from './textCache/TextCache'

class textSearch {
  public filterType = 0; //0.all 1.recipe 2.ingreident
  public mealType = 0; //1.breakfast 2.lunch 3.dinner 4.snack
  public naviType = 0; //0.textsearch => detail 1.textsearch => tag 2.textsearch=> ingredient
  public mealDate = 0; //prev page must pass mealDate to textSearch page
  public title = 0; //prev page must pass mealDate to textSearch page

  public data = {
    keyword: "",
    inputShowed: false,
    resultList: [],
    resultError: [],
    recentList: [],
    commonFoodList:[], // 常见食物列表
    showChoosedLists:false,
    showChoosedConfirm:false,
    showPopup: false,
    showPicker:false,
    choosedLists:[],  // 已经添加的食物信息列表
    unitArr:[],
    nameArrForWXML:[],
    foodUnitAndUnitEnergy:[],
    foodNumValue:1,
    chooseUinitIndex:0, // 用户选择了picker中的index
    textSearchResultSelectIndex:null, // 用户点击文字搜索列表中的哪一项
    recentResultSelectIndex:null, // 用户点击了历史缓存数组中的index
    commonFoodIndex:null, // 常见列表中的index
    totalEnergy:0,
  }

  public onLoad(options: any) {
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    wx.setNavigationBarTitle({ title: "添加" + options.title });
    this.title = options.title;
    this.filterType = parseInt(options.filterType);
    this.mealType = parseInt(options.mealType);
    this.naviType = parseInt(options.naviType);
    this.mealDate = parseInt(options.mealDate);
    this.getCommonFoodList();
  }

  public onShow() {
    this.getRecentList();
  }
  /**
   * 获取常见的食物列表
   */
  public getCommonFoodList(){
    const that = this
    request.commonFoodList({
    }).then(res=>{
      (this as any).setData({commonFoodList:res})
    }).catch(err=>{
      console.log(err)
    })
  }

  /**
   * 获取食物单位信息
   */
  public getFoodUnitOption(item){
    const that = this
    request.getFoodUnitOption({
      foodId:item.foodId,
      foodType:item.foodType
    }).then(res=>{
      console.log('getFoodUnitOption',res)
      that.parseFoodUnitOptionResp(res)
    }).catch(err=>{
      wx.showToast({
        title:'获取食物信息失败',
        icon:'none'
      })
    })
  }
  /**
   * 解析获取到的食物单位信息
   */
  public parseFoodUnitOptionResp(res){
    const arr = res.unitOption.map(item=>{
      return {
        name:item.unitName,
        unitEnergy : Math.round(item.energy),
        unit_id : item.unitId,
        unitWeight:item.unitWeight
      }
    })
    const nameArr = arr.map(item=>{
      return item.name==='100克'?item.name:item.name+'（'+item.unitWeight+'克）'
    });
    const nameArrForWXML = arr.map(item=>item.name);
    (this as any).setData({
      foodNumValue:1,
      chooseUinitIndex:0,
      unitArr:nameArr,
      nameArrForWXML,
      foodUnitAndUnitEnergy:arr,
      showPopup:true
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
      resultError: false,
      resultList:[]
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
  }

 
  public onTextSearchResultSelect(event: any) {
    let index = event.currentTarget.dataset.textIndex;
    this.getFoodUnitOption(this.data.resultList[index]);
    (this as any).setData({
      recentResultSelectIndex:null,
      commonFoodIndex:null,
      textSearchResultSelectIndex:index,
    },()=>{
      textCache.setValue(this.data.resultList[index]);
      this.getRecentList();
    })
  }
  public handleTapCommonFoodItem(event: any){
    let index = event.currentTarget.dataset.textIndex;
    this.getFoodUnitOption(this.data.commonFoodList[index]);
    (this as any).setData({
      textSearchResultSelectIndex:null,
      recentResultSelectIndex:null,
      commonFoodIndex:index,
    })
    // textCache.setValue(this.data.commonFoodList[index]);
    // this.getRecentList()
  }

  public onRecentResultSelect(event: any){
    let index = event.currentTarget.dataset.textIndex;
    this.getFoodUnitOption(this.data.recentList[index]);
    (this as any).setData({
      textSearchResultSelectIndex:null,
      commonFoodIndex:null,
      recentResultSelectIndex:index,
    })
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
    let commonFoodIndex = this.data.commonFoodIndex;
    if(recentResultSelectIndex !== null ){
      let item:any = this.data.recentList[recentResultSelectIndex];
    }else if(textSearchResultSelectIndex !== null){
      let item:any = this.data.resultList[textSearchResultSelectIndex];
    }else{
      let item:any = this.data.commonFoodList[commonFoodIndex];
    }
    const choosedUnit = this.data.nameArrForWXML[this.data.chooseUinitIndex];
    const foodUnitAndUnitEnergyItem = this.data.foodUnitAndUnitEnergy[this.data.chooseUinitIndex];
    item = {
      ...item,
      choosedUnit,
      weightNumber:Number(this.data.foodNumValue),
      unitEnergy:foodUnitAndUnitEnergyItem.unitEnergy,
      unit_id:foodUnitAndUnitEnergyItem.unit_id,
      unitWeight:foodUnitAndUnitEnergyItem.unitWeight
    };
    this.data.choosedLists.push(item);
    (this as any).setData({ 
      choosedLists : this.data.choosedLists,
      showPopup : false
    },()=>{
      this.sumEnergy();
      if(recentResultSelectIndex !== null){ // 为历史搜索重新排序
        textCache.setValue(this.data.recentList[recentResultSelectIndex])
        this.getRecentList();
      }
    })
  }
  /**
   * @param 计算用户食物一共有多少热量
   */
  public sumEnergy(){
    const totalEnergy = this.data.choosedLists.reduce((pre,next)=>{
      return next.weightNumber*next.unitEnergy+pre
    },0);
    (this as any).setData({totalEnergy:Number(totalEnergy.toFixed(1))})
  }

  /**
   * 用户输入食物的份数
   */
  public handleFoodNumInput(e:any){
    const {value} = e.detail;
    // if(value==='0' || value==='0.'){
      var foodNumValue = value;
    // }else{
    //   var foodNumValue = Number(value);
    // }
    (this as any).setData({foodNumValue},()=>{
  
    })
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
    let foodInfoList:any[] = [];
    this.data.choosedLists.map((item:any) => {
      //文字搜索，不再要recognitionResults，因为第一项和外面数据一样
      // let results = [{ foodId: item.foodId, foodName: item.foodName, foodType: item.foodType }];
      let food = { 
        foodId: item.foodId, 
        foodType: item.foodType, 
        inputType: 2, 
        amount:item.weightNumber,
        unitId: item.unit_id,
        unitWeight: item.unitWeight,
        unitName:item.choosedUnit,
        // recognition_results: results,
      };
      foodInfoList.push(food)
    })
    let req = { mealType: this.mealType, mealDate: this.mealDate, foodInfoList};
    console.log('请求参数req',req);
    this.createMealLog(req);
  }

  public createMealLog(req){
    request.createMealLog(req).then(res=>{
      wx.hideLoading()
      wx.showToast({title:'食物记录成功'})
      setTimeout(()=>{
        wx.reLaunch({url: `./../../homeSub/pages/mealAnalysis/index?mealLogId=${res.mealLogId}&mealType=${this.mealType}&mealDate=${this.mealDate}&title=${this.title}`});
      },1450)
    }).catch(err=>{
      wx.hideLoading()
      wx.showToast({title: '提交食物记录失败',icon: 'none'});
    })
  }
  






  // /**
  //  * 格式化数据后，发出请求，获得meal_id
  //  */
  // public CreateOrUpdateMealLog(req:any){
  //   let imageUrl = "https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/mini-app-image/defaultImage/textsearch-default-image.png";
  //   webAPI.CreateOrUpdateMealLog(req).then(resp => {
  //     this.ConfirmMealLog(resp.meal_id)
  //   }).catch(err => {
  //     wx.showToast({title: '请求失败',icon: 'none'});
  //     wx.hideLoading({});
  //   });
  // }
  // /**
  //  * 发出请求，创建记录
  //  */
  // public ConfirmMealLog(meal_id:number){
  //   let req = { meal_id: meal_id };
  //   webAPI.ConfirmMealLog(req).then(resp => {
  //     wx.hideLoading({});
  //     wx.navigateTo({ url: `../../homeSub/pages/mealAnalysis/index?mealDate=${this.mealDate}&mealType=${this.mealType}`})
  //   }).catch(err => {
  //     wx.showToast({title: '提交食物记录失败',icon: 'none'});
  //   });
  // }
  /**
   * 去食物估算重量的页面
   */
  public goWeightReferencePage(){
    wx.navigateTo({url:'./../../homeSub/pages/weightReference/index'})
  }

}

Page(new textSearch())
