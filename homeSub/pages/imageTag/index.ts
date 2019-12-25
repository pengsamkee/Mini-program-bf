import * as webAPI from '../../../api/app/AppService';
import { RetrieveRecognitionReq, RetrieveRecognitionResp } from "/api/app/AppServiceObjs";
import * as globalEnum from '../../../api/GlobalEnum';
import request from '../../../api/app/interface'


type Data = {
  currentTagIndex: number;
  taggs: Tag[];
  imageUrl: string;
  pixelRatio: number;
  hideBanner: boolean;
  imageWidth:number;
}
type Tag = {
  tagX: number;
  tagY: number;
  bboxX:number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
  foodType: number;  //1.receipe 2. receipe
  tagType: number; //1 recognition, 2 textSearch 3.additionalSearch
  selectedPos: number;
  resultList: Result[];
}

class ImageTagPage {
  public mealId = -1;
  public incrementalId = 0;
  public textSearchFood = undefined;
  public mealDate = 0; // 首页传递进来的
  public mealType = 0; // 首页传递进来的
  // public screenWidth = 0;
  public divideproportion=0;//真实宽度除以720rpx；
  public scrollTop = 0; // 为了自动滚动到之前的位置
  public createTag = null; // 用户长按图片所创建的临时tag
  public imgH = null; // 识别图片后，后台返回的图片高度
  public imgW = null; // 识别图片后，后台返回的图片宽度
  public imgKey =null; // 裁剪上个页面传来的img路径得到
  public data: Data = {
    //mockup tag list
    currentTagIndex: 0,
    taggs: [],
    imageUrl: "",
    pixelRatio: 2,
    hideBanner: false,
    imageWidth:0,
    imageHeight:0,
    // screenWidth:0,
    showPopup:false, // 是否展示popup，以供用户自己输入tag名字
    keyword:'',
    resultList: [],
    resultError: false,
    tagIndex:null, // 用户点击第几个选项来自己输入食物名称
    scrollTop:0,
    showPopupTitle:'',
  }

  public onLoad(option: any) {
    var that:any = this;
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token)); 
    (this as any).setData({ imageUrl: option.imageUrl });
    console.log('页面加载时的option.imageurl',option.imageUrl)
    wx.getImageInfo({
      src: option.imageUrl,
      success(res) {
        if(res.height/res.width>0.96){ // 高图
          that.divideproportion = res.height / 720
          that.setData({
            imageHeight:720,
            imageWidth: res.width * 720 / res.height
          })
        }else{ // 宽图
          that.divideproportion = res.width / 750
          that.setData({
            imageWidth: 750,
            imageHeight: res.height * 720 / res.width
          })
        }
      }
    })
    this.mealType = parseInt(option.mealType);
    this.mealDate = parseInt(option.mealDate);
    wx.getSystemInfo({
      success: function (res) {
        that.screenWidth = res.windowWidth;
        (that as any).setData({
          screenWidth: res.windowWidth,
          pixelRatio: res.pixelRatio
        })
      }
    });
    this.imgKey = option.imageUrl.split("/").pop();
    this.getRecognitionResult(this.imgKey);
  }

  // public onShow() {
    // if (this.textSearchFood) {
    //   console.log(this.textSearchFood);
    //   let operation = "taggs[" + this.data.currentTagIndex + "]";
    //   let foodName = this.textSearchFood.food_name.split("[")[0];
    //   let result = [{ food_id: this.textSearchFood.food_id, food_name: foodName, food_type: this.textSearchFood.food_type }];
    //   let tagY = this.data.taggs[this.data.currentTagIndex].tag_y;
    //   let tagX = this.data.taggs[this.data.currentTagIndex].tag_x;
    //   let tag = { food_id: this.textSearchFood.food_id, food_name: this.textSearchFood.food_name, food_type: this.textSearchFood.food_type, selectedPos: 0, showDeleteBtn: false, tag_x: tagX, tag_y: tagY, result_list: result };
    //   (this as any).setData({
    //     [operation]: tag,
    //   });
    //   this.textSearchFood = undefined;
    // } else if (this.data.taggs[this.data.currentTagIndex] && this.data.taggs[this.data.currentTagIndex].result_list[0].food_id === 0) {
    //   //remove text search item
    //   this.data.taggs.splice(this.data.currentTagIndex, 1);
    //   (this as any).setData({
    //     taggs: this.data.taggs,
    //     currentTagIndex: 0
    //   });
    // }
  // }

  public onPageScroll(e:any){
    this.scrollTop = e.scrollTop;
  }

/**
 * 发出识别图片中食物的api
 */
  public getRecognitionResult(imageKey: String) {
    var that = this;
    wx.showLoading({ title: "识别中...", mask: true });
    let req: RetrieveRecognitionReq = { mealType: this.mealType,mealDate:this.mealDate,imageKey};
    request.recognizeFood(req).then(resp => {
      that.parseRecognitionData(resp);
    }).catch(err => {
      wx.hideLoading();
      wx.showModal({
        title: '获取识别结果失败',
        content: JSON.stringify(err),
        showCancel: false
      });
    });
  }

  /**
   * 解析返回的数据
   */
  public parseRecognitionData(resp: RetrieveRecognitionResp) {
    let taggs = [];
    console.log('分辨率 ',this.data.pixelRatio)
    for (let index in resp.predictionInfoList) {
      let predictionItem = resp.predictionInfoList[index];
      let resultList = resp.predictionInfoList[index].recognitionResultList;
      let item = {
        tagX: predictionItem.tagX / (this.divideproportion * 2),
        tagY: predictionItem.tagY / (this.divideproportion * 2),
        bboxX: predictionItem.bboxX,
        bboxY: predictionItem.bboxY,
        bboxW: predictionItem.bboxW,
        bboxH: predictionItem.bboxH,
        foodId: predictionItem.foodId,
        foodType: predictionItem.foodType,
        foodName: predictionItem.foodName,
        selectedPos: 0,
        resultList: resultList
      };
      taggs.push(item);
    }
    console.log(8787787878,taggs)
    this.mealId = resp.mealId;
    this.imgH = resp.imgH;
    this.imgW = resp.imgW;
    (this as any).setData({ taggs: taggs });
    wx.hideLoading()
  }
  /**
   * 点击pos，用户选中某个pos
   */
  public handleTapSimilarName(e:any){
    const index = e.currentTarget.dataset.textIndex;
    const idx = e.currentTarget.dataset.textIdx;
    let taggs = [...this.data.taggs];
    taggs[index].selectedPos = idx;
    taggs[index].foodName = taggs[index].resultList[idx].foodName;
    taggs[index].foodId = taggs[index].resultList[idx].foodId;
    taggs[index].foodType = taggs[index].resultList[idx].foodType;
    (this as any).setData({taggs:taggs},()=>{
      console.log(this.data.taggs)
    })
  }
  /**
   * 删除某个对应的tag
   */
  public handleDeleteTag(e:any){
    const index = e.currentTarget.dataset.textIndex;
    // let taggs = [...this.data.taggs];
    let taggs = JSON.parse(JSON.stringify(this.data.taggs));
    taggs.splice(index,1);
    (this as any).setData({taggs:taggs})
  }
  /**
   * 点击校验选项，用户自己输入tag名字
   */
  public handleInputNameBySelf(e:any){
    const tagIndex = e.currentTarget.dataset.textIndex;
    (this as any).setData({
      showPopup:true,
      scrollTop:this.scrollTop,
      tagIndex:tagIndex,
      keyword:'', // 数据初始化
      resultList: [], // 数据初始化
      resultError: false, // 数据初始化
      showPopupTitle:`请更改第${tagIndex+1}个食物的名称`,
    });
  }
  /**
   * 用户点击关闭popup
   */
  public handleClosePopup(){
    (this as any).setData({showPopup:false});
    wx.pageScrollTo({
      scrollTop: this.data.scrollTop,
      duration: 0
    });
  }
  /**
   * 获取用户输入文字
   */
  public handleInputSearchValue(e:any){
    (this as any).setData({keyword: e.detail});
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
  public setResultList(resp) {
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
      (this as any).setData({
        resultList: results,
        resultError: false
      },()=>{
        console.log('resultList',this.data.resultList)
      });
    }
  }
  /**
   * 用户点击搜索列表中的某项
   */
  public handleTapResultItem(e:any){
    const itemIndex = e.currentTarget.dataset.textIndex;
    const item = this.data.resultList[itemIndex];
    let taggs = [...this.data.taggs];
    if(this.createTag){ // 用户长按图片
      this.createTag={
        ...this.createTag,
        resultList: [{
          foodId: item.foodId,
          foodName: item.foodName,
          foodType: item.foodType
        }],
        foodId: item.foodId,
        foodName: item.foodName,
        foodType: item.foodType
      }
      taggs.push(this.createTag);
      this.createTag = null;
      let resp = {
        mealId:this.mealId,
        prediction:[...taggs],
      };
      (this as any).setData({
        taggs:taggs,
        showPopup:false,
      },()=>{
        wx.pageScrollTo({
          scrollTop: this.data.scrollTop,
          duration: 0
        });
      })
    }else{ // 用户点击校准按钮
      taggs[this.data.tagIndex].resultList[0]={
        foodId: item.foodId,
        foodName: item.foodName,
        foodType: item.foodType
      };
      taggs[this.data.tagIndex].selectedPos = 0;
      taggs[this.data.tagIndex].foodId = item.foodId;
      taggs[this.data.tagIndex].foodName = item.foodName;
      taggs[this.data.tagIndex].foodType = item.foodType;
      (this as any).setData({
        taggs:taggs,
        showPopup:false,
      },()=>{
        wx.pageScrollTo({
          scrollTop: this.data.scrollTop,
          duration: 0
        })
      })
    }
  }

  /**
   * 点击下一步，进入确认分量页面
   */
  public goConfirmMeal(){
    let taggsTemp = [...this.data.taggs];
    taggsTemp.map(item=>{
      item.tagX = item.tagX * this.divideproportion * 2
      item.tagY = item.tagY * this.divideproportion * 2
    });
    const mealInfo = {
      mealDate:this.mealDate,
      mealType:1,
      imgKey:this.imgKey,
      imgH:this.imgH,
      imgW:this.imgW,
      taggs:taggsTemp
    }
    const jsonMealInfo = JSON.stringify(mealInfo);
    wx.navigateTo({url:`./../confirmMeal/index?jsonMealInfo=${jsonMealInfo}`})
  }




  // public loadDummyData() {
  //   let taggs = [
  //     {
  //       tagType: 1,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "西兰花炒腊肉" }, { food_id: 0, food_name: "水煮青菜" }, { food_id: 0, food_name: "木须肉" }, { food_id: 0, food_name: "番茄炒鸡蛋" }, { food_id: 0, food_name: "麻婆豆腐" },
  //       ],
  //       food_id: 0,
  //       food_name: "西兰花炒腊肉",
  //       tag_x: 50,
  //       tag_y: 50
  //     },
  //     {
  //       tagType: 1,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "米饭" }, { food_id: 0, food_name: "花卷" }, { food_id: 0, food_name: "牛奶" }, { food_id: 0, food_name: "白巧克力" }
  //       ],
  //       food_id: 0,
  //       food_name: "米饭",
  //       tag_x: 300,
  //       tag_y: 50
  //     },
  //     {
  //       tagType: 1,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "炒油麦菜" }, { food_id: 0, food_name: "炒小白菜" }, { food_id: 0, food_name: "炒地瓜叶" }, { food_id: 0, food_name: "炒空心菜" }
  //       ],
  //       food_id: 0,
  //       food_name: "炒油麦菜",
  //       tag_x: 100,
  //       tag_y: 200
  //     }
  //   ];
  //   (this as any).setData({ taggs: taggs });
  // }

  // public onChangeTagPosition(event: any) {
  //   let index = event.currentTarget.dataset.candidatesIndex;
  //   let operation = "taggs[" + this.data.currentTagIndex + "].selectedPos";
  //   let changeIdOperation = "taggs[" + this.data.currentTagIndex + "].food_id";
  //   let changeNameOperation = "taggs[" + this.data.currentTagIndex + "].food_name";
  //   let changeFoodTypeOperation = "taggs[" + this.data.currentTagIndex + "].food_type";
  //   (this as any).setData({
  //     [operation]: index,
  //     [changeIdOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_id,
  //     [changeNameOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_name,
  //     [changeFoodTypeOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_type
  //   });
  // }

  /**
   * 长按生成新的标签
   */
  public handleCreateTag(event: any) {
    const that = this;
    const clientX = event.changedTouches[0].clientX; //相对于屏幕
    const clientY = event.changedTouches[0].clientY; //相对于屏幕
    wx.getImageInfo({
      src: that.data.imageUrl,
      success(res) {
        if(res.height/res.width>0.96){ // 高图
          const query = wx.createSelectorQuery()
          query.select('.fix-image').boundingClientRect()
          query.exec(function(res){
            let leftX = res[0].left
            let tagX = clientX-leftX;
            that.createTag = {
              tagType: 3,
              tagX: tagX,
              tagY: clientY,
              selectedPos: 0
            };
          })
        }else{ // 宽图
          that.createTag = {
            tagType: 3,
            tagX: clientX,
            tagY: clientY,
            selectedPos: 0
          };
        }
      }
    });
    (this as any).setData({
      showPopup:true,
      keyword:'',
      resultList: [],
      resultError: false,
      showPopupTitle:`请搜索添加第${this.data.taggs.length+1}个食物`
    })
  }

  public onTagMove(event: any) {
    let index = event.currentTarget.dataset.tagIndex;
    let xOperation = "taggs[" + index + "].tagX";
    let yOperation = "taggs[" + index + "].tagY";
    (this as any).setData({
      [xOperation]: event.detail.x,
      [yOperation]: event.detail.y
    });
  }

  // public onStartTouchTag(event: any) {
  //   console.log("on touch start");
  //   let index = event.currentTarget.dataset.tagIndex;
  //   (this as any).setData({
  //     currentTagIndex: index,
  //     taggs:this.data.taggs
  //   });
  // }

  // public onAddCandidatesTag(event: any) {
  //   let index = event.currentTarget.dataset.candidatesIndex;
  //   let tagName = this.data.candidatesTagList[index].tagName
  //   //get image center
  //   let touchX = 10;
  //   let touchY = 10;
  //   let tag: Tag = {
  //     x: touchX,
  //     y: touchY,
  //     dotColor: '#e015fa',
  //     dispalyMessage: tagName,
  //     realtedInfo: {}
  //   };
  //   //add into taggs and refresh
  //   this.data.taggs.push(tag);
  //   (this as any).setData({
  //     taggs: this.data.taggs
  //   });
  //   this.incrementalId++;
  // }

  // public onToggleDeleteTag(event: any) {
  //   let index = event.currentTarget.dataset.tagIndex;
  //   let operation = "taggs[" + index + "].showDeleteBtn";
  //   let flag = this.data.taggs[index].showDeleteBtn;
  //   let height = flag ? 65 : 95;
  //   (this as any).setData({
  //     [operation]: !flag,
  //     [tagHeightOperation]: height
  //   });
  // }


  // public deleteTag(event: any) {
  //   let index = event.currentTarget.dataset.tagIndex;
  //   let operation = "taggs[" + index + "].isDeleted";
  //   (this as any).setData({
  //     [operation]: true,
  //     currentTagIndex: 0
  //   });
  //   this.incrementalId++;
  // }

  // public onAddTextSearchTag() {
  //   //use navigate back to get search result
  //   wx.navigateTo({
  //     url: "/pages/textSearch/index?title=更多食物"
  //   });
  // }

  // public naviToFoodDetailPage() {
  //   var that = this;
  //   wx.getImageInfo({
  //     src: this.data.imageUrl,
  //     success(img: any) {
  //       let param = { imageUrl: that.data.imageUrl, mealId: 0, showShareBtn: true };
  //       let picRatio = img.width / that.data.screenWidth
  //       console.log(img);
  //       console.log("picRatio:"+picRatio);
  //       //get foodDetail from backend
  //       let food_list = [];
  //       for (let index in that.data.taggs) {
  //         let tag = that.data.taggs[index];
  //         if (tag.isDeleted) { continue };
  //         let tagX = Math.floor(tag.tag_x * that.data.pixelRatio * picRatio);
  //         let tagY = Math.floor(tag.tag_y * that.data.pixelRatio * picRatio);
  //         // console.log(tagX +","+tagY);
  //         let bbox_x = tag.bbox_x;
  //         let bbox_y = tag.bbox_y;
  //         let bbox_w = tag.bbox_w;
  //         let bbox_h = tag.bbox_h;
  //         let foodId = tag.result_list[tag.selectedPos].food_id;
  //         let foodType = tag.result_list[tag.selectedPos].food_type;
  //         let results = tag.result_list;
  //         let food = { food_id: foodId, input_type: 1, food_type: foodType, tag_x: tagX, tag_y: tagY, bbox_x: bbox_x, bbox_y: bbox_y, bbox_w: bbox_w, bbox_h: bbox_h, recognition_results: results };
  //         food_list.push(food);
  //       }
  //       let req = { meal_id: that.mealId, meal_type: that.mealType, meal_date: that.mealDate, food_list: food_list };
  //       console.log(req);
  //       wx.showLoading({ title: "加载中..." });
  //       webAPI.CreateOrUpdateMealLog(req).then(resp => {
  //         wx.hideLoading({});
  //         that.mealId = resp.meal_id;
  //         param.mealId = that.mealId
  //         param.imageUrl = that.data.imageUrl
  //         let paramJson = JSON.stringify(param);
  //         wx.navigateTo({
  //           url: "/pages/foodDetail/index?paramJson=" + paramJson
  //         });
  //       }).catch(err => {
  //         console.log(err);
  //         wx.showModal({
  //           title: '',
  //           content: '获取食物信息失败',
  //           showCancel: false
  //         })
  //       });
  //     },
  //     fail(err) { console.log(err); }
  //   });
  // }
}

Page(new ImageTagPage());