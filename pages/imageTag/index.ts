import * as webAPI from '../../api/app/AppService';
import { RetrieveRecognitionReq, RetrieveRecognitionResp } from "/api/app/AppServiceObjs";
import * as globalEnum from '../../api/GlobalEnum';


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
  }

  public onLoad(option: any) {
    var that:any = this;
    //set token into webAPI
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token)); 
    //load necessary data into page
    (this as any).setData({
      imageUrl: option.imageUrl
    });
    console.log(option.mealType + "," + option.mealDate);
    wx.getImageInfo({
      src: option.imageUrl,
      success(res) {
        if(res.height/res.width>0.96){
          that.divideproportion = res.height / 720
          that.setData({
            imageHeight:720,
            imageWidth: res.width * 720 / res.height
          })
        }else{
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
    // this.loadDummyData();
    var imagePath = option.imageUrl.split("/").pop();
    console.log(imagePath);
    this.getRecognitionResult(imagePath);
    this.getBannerStatus();
  }

  public onShow() {
    if (this.textSearchFood) {
      console.log(this.textSearchFood);
      let operation = "taggs[" + this.data.currentTagIndex + "]";
      let foodName = this.textSearchFood.food_name.split("[")[0];
      let result = [{ food_id: this.textSearchFood.food_id, food_name: foodName, food_type: this.textSearchFood.food_type }];
      let tagY = this.data.taggs[this.data.currentTagIndex].tag_y;
      let tagX = this.data.taggs[this.data.currentTagIndex].tag_x;
      let tag = { food_id: this.textSearchFood.food_id, food_name: this.textSearchFood.food_name, food_type: this.textSearchFood.food_type, isDeleted: false, selectedPos: 0, showDeleteBtn: false, tag_x: tagX, tag_y: tagY, tag_height: 95, result_list: result };
      (this as any).setData({
        [operation]: tag,
      });
      this.textSearchFood = undefined;
    } else if (this.data.taggs[this.data.currentTagIndex] && this.data.taggs[this.data.currentTagIndex].result_list[0].food_id === 0) {
      //remove text search item
      this.data.taggs.splice(this.data.currentTagIndex, 1);
      (this as any).setData({
        taggs: this.data.taggs,
        currentTagIndex: 0
      });
    }
  }

  public getBannerStatus() {
    let hideBanner = wx.getStorageSync(globalEnum.globalkey_hideBanner);
    console.log(hideBanner);
    (this as any).setData({
      hideBanner: hideBanner
    });
  }

  public dismissBanner(){
    var that= this;
    wx.showModal({
      title:"",
      content:"确定不再展示此提示?",
      success(res) {
        if (res.confirm) {
          //setting global virable
          wx.setStorageSync(globalEnum.globalkey_hideBanner,true);
          (that as any).setData({
            hideBanner: true
          });
        }
      }
    });
  }

  public getRecognitionResult(imageKey: String) {
    var that = this;
    wx.showLoading({ title: "识别中...", mask: true });
    let req: RetrieveRecognitionReq = { img_key: imageKey, meal_date: this.mealDate, meal_type: this.mealType };
    webAPI.RetrieveRecognition(req).then(resp => {
      console.log(resp);
      that.parseRecognitionData(resp);
      wx.hideLoading({});
    }).catch(err => {
      wx.hideLoading({});
      console.log(err);
      wx.showModal({
          title: '获取识别结果失败',
          content: JSON.stringify(err),
          showCancel: false
      });
    });
  }

  public parseRecognitionData(resp: RetrieveRecognitionResp) {
    let taggs = [];
    for (let index in resp.prediction) {
      let predictionItem = resp.prediction[index];
      let resultList = resp.prediction[index].result_list;
      let item = {
        // tag_x: predictionItem.tag_x / (this.divideproportion * this.data.pixelRatio),
        // tag_y: predictionItem.tag_y / (this.divideproportion * this.data.pixelRatio),
        tag_x: predictionItem.tag_x / (this.divideproportion * 2),
        tag_y: predictionItem.tag_y / (this.divideproportion * 2)-10,
        // tag_x: predictionItem.tag_x / (this.data.pixelRatio),
        // tag_y: predictionItem.tag_y / (this.data.pixelRatio),
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
    });
  }

  public loadDummyData() {
    let taggs = [
      {
        tagType: 1,
        isDeleted: false,
        selectedPos: 0,
        result_list: [
          { food_id: 0, food_name: "西兰花炒腊肉" }, { food_id: 0, food_name: "水煮青菜" }, { food_id: 0, food_name: "木须肉" }, { food_id: 0, food_name: "番茄炒鸡蛋" }, { food_id: 0, food_name: "麻婆豆腐" },
        ],
        showDeleteBtn: false,
        food_id: 0,
        food_name: "西兰花炒腊肉",
        tag_x: 50,
        tag_y: 50
      },
      {
        tagType: 1,
        isDeleted: false,
        selectedPos: 0,
        result_list: [
          { food_id: 0, food_name: "米饭" }, { food_id: 0, food_name: "花卷" }, { food_id: 0, food_name: "牛奶" }, { food_id: 0, food_name: "白巧克力" }
        ],
        showDeleteBtn: false,
        food_id: 0,
        food_name: "米饭",
        tag_x: 300,
        tag_y: 50
      },
      {
        tagType: 1,
        isDeleted: false,
        selectedPos: 0,
        result_list: [
          { food_id: 0, food_name: "炒油麦菜" }, { food_id: 0, food_name: "炒小白菜" }, { food_id: 0, food_name: "炒地瓜叶" }, { food_id: 0, food_name: "炒空心菜" }
        ],
        showDeleteBtn: false,
        food_id: 0,
        food_name: "炒油麦菜",
        tag_x: 100,
        tag_y: 200
      }
    ];
    (this as any).setData({ taggs: taggs });
  }

  public onChangeTagPosition(event: any) {
    let index = event.currentTarget.dataset.candidatesIndex;
    let operation = "taggs[" + this.data.currentTagIndex + "].selectedPos";
    let changeIdOperation = "taggs[" + this.data.currentTagIndex + "].food_id";
    let changeNameOperation = "taggs[" + this.data.currentTagIndex + "].food_name";
    let changeFoodTypeOperation = "taggs[" + this.data.currentTagIndex + "].food_type";
    (this as any).setData({
      [operation]: index,
      [changeIdOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_id,
      [changeNameOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_name,
      [changeFoodTypeOperation]: this.data.taggs[this.data.currentTagIndex].result_list[index].food_type
    });
  }

  //check the tag area, generate dot cover-image
  public createTag(event: any) {
    console.log(event);
    let touchX = event.changedTouches[0].clientX - 40;
    let touchY = event.changedTouches[0].clientY - 18;
    console.log("x:" + touchX + ",y:" + touchY);
    let tag: Tag = {
      tagType: 3,
      isDeleted: false,
      tag_x: touchX,
      tag_y: touchY,
      tag_height: 95,
      selectedPos: 0,
      result_list: [{ food_id: 0, food_name: "这是什么?" }],
      showDeleteBtn: false
    };
    //add into taggs and refresh
    this.data.taggs.push(tag);
    (this as any).setData({
      taggs: this.data.taggs,
      currentTagIndex: this.data.taggs.length - 1
    });
    this.incrementalId++;
    //navi to textSearch
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/textSearch/index?title=食物"
      });
    }, 500)
  }

  public onTagMove(event: any) {
    let index = event.currentTarget.dataset.tagIndex;
    console.log(event.detail.x);
    console.log(event.detail.y);
    let xOperation = "taggs[" + index + "].tag_x";
    let yOperation = "taggs[" + index + "].tag_y";
    (this as any).setData({
      [xOperation]: event.detail.x,
      [yOperation]: event.detail.y
    });
  }

  public onStartTouchTag(event: any) {
    console.log("on touch start");
    let index = event.currentTarget.dataset.tagIndex;
    this.data.taggs[index].tag_height = 95;
    (this as any).setData({
      currentTagIndex: index,
      taggs:this.data.taggs
    });
  }

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


  public deleteTag(event: any) {//exchange list order to avoid animation
    let index = event.currentTarget.dataset.tagIndex;
    //delete taggs and refresh
    console.log("enter on delete " + index);
    // this.data.taggs.splice(index, 1);
    let operation = "taggs[" + index + "].isDeleted";
    (this as any).setData({
      [operation]: true,
      currentTagIndex: 0
    });
    this.incrementalId++;
  }

  public onAddTextSearchTag() {
    //use navigate back to get search result
    wx.navigateTo({
      url: "/pages/textSearch/index?title=更多食物"
    });
  }

  public naviToFoodDetailPage() {
    var that = this;
    wx.getImageInfo({
      src: this.data.imageUrl,
      success(img: any) {
        let param = { imageUrl: that.data.imageUrl, mealId: 0, showShareBtn: true };
        let picRatio = img.width / that.data.screenWidth
        console.log(img);
        console.log("picRatio:"+picRatio);
        //get foodDetail from backend
        let food_list = [];
        for (let index in that.data.taggs) {
          let tag = that.data.taggs[index];
          if (tag.isDeleted) { continue };
          let tagX = Math.floor(tag.tag_x * that.data.pixelRatio * picRatio);
          let tagY = Math.floor(tag.tag_y * that.data.pixelRatio * picRatio);
          // console.log(tagX +","+tagY);
          let bbox_x = tag.bbox_x;
          let bbox_y = tag.bbox_y;
          let bbox_w = tag.bbox_w;
          let bbox_h = tag.bbox_h;
          let foodId = tag.result_list[tag.selectedPos].food_id;
          let foodType = tag.result_list[tag.selectedPos].food_type;
          let results = tag.result_list;
          let food = { food_id: foodId, input_type: 1, food_type: foodType, tag_x: tagX, tag_y: tagY, bbox_x: bbox_x, bbox_y: bbox_y, bbox_w: bbox_w, bbox_h: bbox_h, recognition_results: results };
          food_list.push(food);
        }
        let req = { meal_id: that.mealId, meal_type: that.mealType, meal_date: that.mealDate, food_list: food_list };
        console.log(req);
        wx.showLoading({ title: "加载中..." });
        webAPI.CreateOrUpdateMealLog(req).then(resp => {
          wx.hideLoading({});
          that.mealId = resp.meal_id;
          param.mealId = that.mealId
          param.imageUrl = that.data.imageUrl
          let paramJson = JSON.stringify(param);
          wx.navigateTo({
            url: "/pages/foodDetail/index?paramJson=" + paramJson
          });
        }).catch(err => {
          console.log(err);
          wx.showModal({
            title: '',
            content: '获取食物信息失败',
            showCancel: false
          })
        });
      },
      fail(err) { console.log(err); }
    });
    
  }


}

Page(new ImageTagPage());