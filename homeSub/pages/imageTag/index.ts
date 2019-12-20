import * as webAPI from '../../../api/app/AppService';
import { RetrieveRecognitionReq, RetrieveRecognitionResp } from "/api/app/AppServiceObjs";
import * as globalEnum from '../../../api/GlobalEnum';


type Data = {
  currentTagIndex: number;
  taggs: Tag[];
  imageUrl: string;
  pixelRatio: number;
  hideBanner: boolean;
  imageWidth:number;
}
type Tag = {
  isDeleted: boolean;
  tag_x: number;
  tag_y: number;
  bbox_x:number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  tag_height: number;
  food_type: number;  //1.receipe 2. receipe
  tagType: number; //1 recognition, 2 textSearch 3.additionalSearch
  showDeleteBtn: false;
  selectedPos: number;
  result_list: Result[];
}

type Result = {
  food_id: number;
  food_name: string;
  food_type: number;
}

class ImageTagPage {
  public mealId = -1;
  public incrementalId = 0;
  public textSearchFood: Result = undefined;
  public mealDate = 0;
  public mealType = 0;
  // public screenWidth = 0;
  public divideproportion=0;//真实宽度除以720rpx；
  public scrollTop = 0; // 为了自动滚动到之前的位置
  public createTag = null; // 用户长按图片所创建的临时tag
  public data: Data = {
    //mockup tag list
    currentTagIndex: 0,
    taggs: [],
    imageUrl: "",
    pixelRatio: 2,
    hideBanner: false,
    imageWidth:0,
    imageHeight:0,
    screenWidth:0,
    res:{
      img_key: "wx4714ce5383005530.o6zAJs0hy6nHM2owj6wIkyE1hfKg.leqHBlfKkOfW68a1a8e45f84ba38d33f958514ca4f55.jpg",
      meal_id: 20551,
      prediction: [
        {
          bbox_h: 100,
          bbox_w: 91,
          bbox_x: 0,
          bbox_y: 193,
          food_id: 469,
          food_name: "柠檬",
          food_type: 2,
          result_list: [
            {food_id: 469, food_type: 2, food_name: "柠檬", score: 95},
            {food_id: 456, food_type: 2, food_name: "橙", score: 1},
            {food_id: 492, food_type: 2, food_name: "哈密瓜", score: 1},
            {food_id: 1321, food_type: 2, food_name: "橙汁", score: 0},
            {food_id: 1322, food_type: 2, food_name: "柠檬汽水", score: 0},
            {food_id: 362, food_type: 2, food_name: "长把梨", score: 0},
            {food_id: 454, food_type: 2, food_name: "中华猕猴桃[毛叶猕猴桃,奇异果]", score: 0},
          ],
          tag_x: 45,
          tag_y: 243,
        },
        {
          bbox_h: 80,
          bbox_w: 97,
          bbox_x: 306,
          bbox_y: 0,
          food_id: 469,
          food_name: "柠檬",
          food_type: 2,
          result_list: [
            {food_id: 469, food_type: 2, food_name: "柠檬", score: 36},
            {food_id: 353, food_type: 2, food_name: "青香蕉苹果", score: 29},
            {food_id: 362, food_type: 2, food_name: "长把梨", score: 8},
            {food_id: 492, food_type: 2, food_name: "哈密瓜", score: 4},
            {food_id: 456, food_type: 2, food_name: "橙", score: 3},
            {food_id: 1321, food_type: 2, food_name: "橙汁", score: 3},
            {food_id: 1322, food_type: 2, food_name: "柠檬汽水", score: 3},
          ],
          tag_x: 354,
          tag_y: 40,
        },
        {
          bbox_h: 178,
          bbox_w: 201,
          bbox_x: 309,
          bbox_y: 104,
          food_id: 963,
          food_name: "焦糖布丁",
          food_type: 1,
          result_list: [
            {food_id: 963, food_type: 1, food_name: "焦糖布丁", score: 33},
            {food_id: 220, food_type: 1, food_name: "香油鸡蛋羹", score: 33},
            {food_id: 5, food_type: 1, food_name: "紫菜蛋汤", score: 26},
            {food_id: 300, food_type: 1, food_name: "豆腐海带汤", score: 26},
            {food_id: 162, food_type: 1, food_name: "大饼", score: 14},
            {food_id: 244, food_type: 1, food_name: "玉米面饼", score: 14},
            {food_id: 671, food_type: 1, food_name: "清炖鸡", score: 5}
          ],
          tag_x: 409,
          tag_y: 193,
        },
        {
          bbox_h: 297,
          bbox_w: 239,
          bbox_x: 50,
          bbox_y: 32,
          food_id: 122,
          food_name: "水煮鱼片",
          food_type: 1,
          result_list: [
            {food_id: 122, food_type: 1, food_name: "水煮鱼片", score: 100},
            {food_id: 38, food_type: 1, food_name: "酸菜鱼", score: 100},
            {food_id: 733, food_type: 1, food_name: "虾天妇罗", score: 0},
            {food_id: 512, food_type: 1, food_name: "酥衣凤尾虾", score: 0},
            {food_id: 666, food_type: 1, food_name: "雀巢黑椒牛柳", score: 0},
            {food_id: 650, food_type: 1, food_name: "牛肉饭", score: 0}
          ],
          tag_x: 169,
          tag_y: 180,
        }
      ]
    },
    showPopup:false, // 是否展示popup，以供用户自己输入tag名字
    keyword:'',
    resultList: [],
    resultError: false,
    tagIndex:null, // 用户点击第几个选项来自己输入食物名称
    scrollTop:0,
    showPopupTitle:'',
  }

  public onLoad(option: any) {
    // this.parseRecognitionData(this.data.res); // ===xinjiade===================================================================================================================================================
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
        // that.screenWidth = res.windowWidth;
        (that as any).setData({
          screenWidth: res.windowWidth
        })
        console.log("convert rate:" + 750 / res.windowWidth);
        console.log("pixel ratio:" + res.pixelRatio);
        (that as any).setData({
          pixelRatio: res.pixelRatio
        })
      }
    });
    var imagePath = option.imageUrl.split("/").pop();
    console.log(imagePath);
    this.getRecognitionResult(imagePath);//===yincangde===============================================================================
    // this.getBannerStatus();
  }

  // public onShow() {
    // if (this.textSearchFood) {
    //   console.log(this.textSearchFood);
    //   let operation = "taggs[" + this.data.currentTagIndex + "]";
    //   let foodName = this.textSearchFood.food_name.split("[")[0];
    //   let result = [{ food_id: this.textSearchFood.food_id, food_name: foodName, food_type: this.textSearchFood.food_type }];
    //   let tagY = this.data.taggs[this.data.currentTagIndex].tag_y;
    //   let tagX = this.data.taggs[this.data.currentTagIndex].tag_x;
    //   let tag = { food_id: this.textSearchFood.food_id, food_name: this.textSearchFood.food_name, food_type: this.textSearchFood.food_type, isDeleted: false, selectedPos: 0, showDeleteBtn: false, tag_x: tagX, tag_y: tagY, tag_height: 95, result_list: result };
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

  // public getBannerStatus() {
  //   let hideBanner = wx.getStorageSync(globalEnum.globalkey_hideBanner);
  //   console.log(hideBanner);
  //   (this as any).setData({
  //     hideBanner: hideBanner
  //   });
  // }

  // public dismissBanner(){
  //   var that= this;
  //   wx.showModal({
  //     title:"",
  //     content:"确定不再展示此提示?",
  //     success(res) {
  //       if (res.confirm) {
  //         //setting global virable
  //         wx.setStorageSync(globalEnum.globalkey_hideBanner,true);
  //         (that as any).setData({
  //           hideBanner: true
  //         });
  //       }
  //     }
  //   });
  // }
/**
 * 发出识别图片中食物的api
 */
  public getRecognitionResult(imageKey: String) {
    var that = this;
    wx.showLoading({ title: "识别中...", mask: true });
    let req: RetrieveRecognitionReq = { img_key: imageKey, meal_date: this.mealDate, meal_type: this.mealType };
    webAPI.RetrieveRecognition(req).then(resp => {
      that.parseRecognitionData(resp);
      wx.hideLoading({});
    }).catch(err => {
      wx.hideLoading({});
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
    for (let index in resp.prediction) {
      let predictionItem = resp.prediction[index];
      let resultList = resp.prediction[index].result_list;
      let item = {
        tag_x: predictionItem.tag_x / (this.divideproportion * 2),
        tag_y: predictionItem.tag_y / (this.divideproportion * 2),
        bbox_x: predictionItem.bbox_x,
        bbox_y: predictionItem.bbox_y,
        bbox_w: predictionItem.bbox_w,
        bbox_h: predictionItem.bbox_h,
        food_id: predictionItem.food_id,
        food_type: predictionItem.food_type,
        food_name: predictionItem.food_name,
        tag_height: index == 0 ? 95 : 65 ,
        selectedPos: 0,
        isDeleted: false,
        showDeleteBtn: false,
        result_list: resultList
      };
      taggs.push(item);
    }
    this.mealId = resp.meal_id;
    (this as any).setData({
      taggs: taggs
    },()=>{
      console.log('整理得到初始taggs',this.data.taggs)
    });
  }
  /**
   * 点击pos，用户选中某个pos
   */
  public handleTapSimilarName(e:any){
    const index = e.currentTarget.dataset.textIndex;
    const idx = e.currentTarget.dataset.textIdx;
    let taggs = [...this.data.taggs];
    console.log(77777,taggs)
    taggs[index].selectedPos = idx;
    taggs[index].food_name = taggs[index].result_list[idx].food_name;
    taggs[index].food_id = taggs[index].result_list[idx].food_id;
    taggs[index].food_type = taggs[index].result_list[idx].food_type;
    (this as any).setData({taggs:taggs},()=>{
      console.log(this.data.taggs)
    })
  }
  /**
   * 删除某个对应的tag
   */
  public handleDeleteTag(e:any){
    const index = e.currentTarget.dataset.textIndex;
    let taggs = [...this.data.taggs];
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
      (this as any).setData({
        resultList: results,
        resultError: false
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
        result_list: [{
          food_id: item.foodId,
          food_name: item.foodName,
          food_type: item.foodType
        }],
        food_id: item.foodId,
        food_name: item.foodName,
        food_type: item.foodType
      }
      taggs.push(this.createTag);
      this.createTag = null;
      let resp = {
        meal_id:this.mealId,
        prediction:[...taggs],
      };
      (this as any).setData({
        taggs:taggs,
        showPopup:false,
      },()=>{
        // this.parseRecognitionData(resp)
        wx.pageScrollTo({
          scrollTop: this.data.scrollTop,
          duration: 0
        });
      })
    }else{ // 用户点击校准按钮
      taggs[this.data.tagIndex].result_list[0]={
        food_id: item.foodId,
        food_name: item.foodName,
        food_type: item.foodType
      };
      taggs[this.data.tagIndex].selectedPos = 0;
      taggs[this.data.tagIndex].food_id = item.foodId;
      taggs[this.data.tagIndex].food_name = item.foodName;
      taggs[this.data.tagIndex].food_type = item.foodType;
      (this as any).setData({
        taggs:taggs,
        showPopup:false,
      },()=>{
        wx.pageScrollTo({
          scrollTop: this.data.scrollTop,
          duration: 0
        });
        console.log('=====4',this.data.taggs)
      })
    }
  }

  /**
   * 点击下一步，进入确认分量页面
   */
  public goConfirmMeal(){
    const mealInfo = {
      mealId:this.mealId,
      taggs:[...this.data.taggs]
    }
    const jsonMealInfo = JSON.stringify(mealInfo);
    wx.navigateTo({url:`./../confirmMeal/index?jsonMealInfo=${jsonMealInfo}`})
  }




  // public loadDummyData() {
  //   let taggs = [
  //     {
  //       tagType: 1,
  //       isDeleted: false,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "西兰花炒腊肉" }, { food_id: 0, food_name: "水煮青菜" }, { food_id: 0, food_name: "木须肉" }, { food_id: 0, food_name: "番茄炒鸡蛋" }, { food_id: 0, food_name: "麻婆豆腐" },
  //       ],
  //       showDeleteBtn: false,
  //       food_id: 0,
  //       food_name: "西兰花炒腊肉",
  //       tag_x: 50,
  //       tag_y: 50
  //     },
  //     {
  //       tagType: 1,
  //       isDeleted: false,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "米饭" }, { food_id: 0, food_name: "花卷" }, { food_id: 0, food_name: "牛奶" }, { food_id: 0, food_name: "白巧克力" }
  //       ],
  //       showDeleteBtn: false,
  //       food_id: 0,
  //       food_name: "米饭",
  //       tag_x: 300,
  //       tag_y: 50
  //     },
  //     {
  //       tagType: 1,
  //       isDeleted: false,
  //       selectedPos: 0,
  //       result_list: [
  //         { food_id: 0, food_name: "炒油麦菜" }, { food_id: 0, food_name: "炒小白菜" }, { food_id: 0, food_name: "炒地瓜叶" }, { food_id: 0, food_name: "炒空心菜" }
  //       ],
  //       showDeleteBtn: false,
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
          // that.divideproportion = res.height / 720
          // that.setData({
          //   imageHeight:720,
          //   imageWidth: res.width * 720 / res.height
          // })
          that.createTag = {
            tagType: 3,
            tag_x: clientX,
            tag_y: clientY,
            selectedPos: 0
          };
        }else{ // 宽图
          let touchX = clientX*res.width/375; // 相对于图片的位置
          let touchY = touchX*res.height/res.width;
          that.createTag = {
            tagType: 3,
            tag_x: clientX,
            tag_y: clientY,
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
    
    // this.data.taggs.push(tag);
    // (this as any).setData({
    //   taggs: this.data.taggs,
    //   currentTagIndex: this.data.taggs.length - 1
    // });
    // this.incrementalId++;
    
    // setTimeout(function () {
    //   wx.navigateTo({
    //     url: "/pages/textSearch/index?title=食物"
    //   });
    // }, 500)
  }

  public onTagMove(event: any) {
    let index = event.currentTarget.dataset.tagIndex;
    let xOperation = "taggs[" + index + "].tag_x";
    let yOperation = "taggs[" + index + "].tag_y";
    (this as any).setData({
      [xOperation]: event.detail.x,
      [yOperation]: event.detail.y
    });
  }

  // public onStartTouchTag(event: any) {
  //   console.log("on touch start");
  //   let index = event.currentTarget.dataset.tagIndex;
  //   this.data.taggs[index].tag_height = 95;
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
  //     isDeleted: false,
  //     x: touchX,
  //     y: touchY,
  //     dotColor: '#e015fa',
  //     dispalyMessage: tagName,
  //     showDeleteBtn: false,
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
  //   let tagHeightOperation = "taggs[" + index + "].tag_height";
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