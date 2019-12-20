import * as webAPI from '../../../api/app/AppService';
import { RetrieveRecognitionReq, RetrieveRecognitionResp } from "/api/app/AppServiceObjs";
import * as globalEnum from '../../../api/GlobalEnum';

let chart = null;
let data = [];
function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const map = {};
  data.forEach(function(obj) {
    console.log(obj)
    if (obj.name==='蛋白质'){
      if(obj.percent>9){
        return map[obj.name] = `       `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `       `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }else if (obj.name === '脂肪') {
      if(obj.percent>9){
        return map[obj.name] = `          `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `          `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }else{
      if(obj.percent>9){
        return map[obj.name] = `   `+ obj.percent + '%' + `    ` + obj.content + obj.unit;
      }else{
        return map[obj.name] = `   `+ obj.percent + '%'+ `      ` + obj.content + obj.unit;
      }
    }
  });
  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });
  chart.source(data, {
    percent: {
      formatter: function formatter(val) {
        return val + '%';
      }
    }
  });
  chart.tooltip(false);
  chart.legend({
    position: 'right',
    itemFormatter: function itemFormatter(val) {
      return val + ' ' + map[val];
    }
  });
  chart.coord('polar', {
    transposed: true,
    innerRadius: 0.7,
    radius: 1
  });
  chart.axis(false);
  chart.interval()
    .position('a*percent')
    .color('name', ['#FFB400', '#FF5C47', '#FF822D'])
    .adjust('stack');
  chart.render();
  return chart;
}

type Data = {
  currentTagIndex: number;
  taggs: Tag[];
  imageUrl: string;
  pixelRatio: number;
  hideBanner: boolean;
  imageWidth:number;
  imageHeight:number;
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

class FoodDetail {
  public mealId = -1; // 得到taggs信息接口中返回
  public mealDate = 0; // 上个页面传递来的
  public mealType = 0; // 上个页面传递来的
  public divideproportion=0;//真实宽度除以720rpx；
  public data: Data = {
    currentTagIndex: 0,
    taggs:[{
      bboxH: 100,
      bboxW: 91,
      bboxX: 0,
      bboxY: 193,
      foodId: 12,
      foodName: "牛奶椰丝小方糕",
      foodType: 2,
      isDeleted: false,
      resultList: [
          {foodId: 836, foodName: "牛奶椰丝小方糕", foodType: 1},
          {foodId: 456, foodType: 2, foodName: "橙", score: 1},
          {foodId: 492, foodType: 2, foodName: "哈密瓜", score: 1},
          {foodId: 1321, foodType: 2, foodName: "橙汁", score: 0},
          {foodId: 1322, foodType: 2, foodName: "柠檬汽水", score: 0},
          {foodId: 362, foodType: 2, foodName: "长把梨", score: 0},
          {foodId: 454, foodType: 2, foodName: "中华猕猴桃[毛叶猕猴桃,奇异果]", score: 0}
      ],
      selectedPos: 0,
      showDeleteBtn: false,
      tagHeight: 95,
      tagX: 33.75,
      tagY: 182.25,
  },
  {
      bboxH: 178,
      bboxW: 201,
      bboxX: 309,
      bboxY: 104,
      foodId: 14,
      foodName: "牛奶雪糕",
      foodType: 2,
      isDeleted: false,
      resultList: [
          {foodId: 830, foodName: "牛奶雪糕", foodType: 1},
          {foodId: 220, foodType: 1, foodName: "香油鸡蛋羹", score: 33},
          {foodId: 5, foodType: 1, foodName: "紫菜蛋汤", score: 26},
          {foodId: 300, foodType: 1, foodName: "豆腐海带汤", score: 26},
          {foodId: 162, foodType: 1, foodName: "大饼", score: 14},
          {foodId: 244, foodType: 1, foodName: "玉米面饼", score: 14},
          {foodId: 671, foodType: 1, foodName: "清炖鸡", score: 5}
      ],
      selectedPos: 0,
      showDeleteBtn: false,
      tagHeight: 65,
      tagX: 306.7,
      tagY: 144.7,
  }],
    imageUrl: "",
    pixelRatio: 2,
    imageWidth:0,
    imageHeight:0,
  }

  public onLoad(option: any) {
    var that:any = this;
    option.imageUrl='https://dietlens-1258665547.cos.ap-shanghai.myqcloud.com/food-image/wx4714ce5383005530.o6zAJs0hy6nHM2owj6wIkyE1hfKg.N2j1od6jBhfF991b7dbdd5c73940a1d94b72bd21d2e6.jpeg'
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token)); 
    (this as any).setData({ imageUrl: option.imageUrl });
    this.mealType = parseInt(option.mealType);
    this.mealDate = parseInt(option.mealDate);
    var imagePath = option.imageUrl.split("/").pop();
    this.getRecognitionResult(imagePath);
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
  }
  onReady(){
    this.setCanvasValue();
  }
  /**
   *为canvas赋值
   */
  setCanvasValue(){
    const that = this;
    data = [
      { name:"蛋白质", percent:30, content:200, unit:'克' },
      { name:"脂肪", percent:40, content:300, unit:'吨' },
      { name:"碳水化物", percent:30, content:400, unit:'千克' }
    ];
    let salesTrendChartComponent = that.selectComponent('#canvasf2');
    salesTrendChartComponent.init(initChart)
  }

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
        tagX: predictionItem.tag_x / (this.divideproportion * 2),
        tagY: predictionItem.tag_y / (this.divideproportion * 2),
        bboxX: predictionItem.bbox_x,
        bboxY: predictionItem.bbox_y,
        bboxW: predictionItem.bbox_w,
        bboxH: predictionItem.bbox_h,
        foodId: predictionItem.food_id,
        foodType: predictionItem.food_type,
        foodName: predictionItem.food_name,
        tagHeight: index == 0 ? 95 : 65 ,
        selectedPos: 0,
        isDeleted: false,
        showDeleteBtn: false,
        resultList: resultList
      };
      taggs.push(item);
    }
    this.mealId = resp.meal_id;
    this.mealId = 20361;
    //============上面的要删掉这行========================================================================================================================================================================================================================
    (this as any).setData({
      taggs: taggs
    },()=>{
      console.log('整理得到初始taggs',this.data.taggs)
    });
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
  
  public onTagMove(event: any) {
    let index = event.currentTarget.dataset.tagIndex;
    let xOperation = "taggs[" + index + "].tag_x";
    let yOperation = "taggs[" + index + "].tag_y";
    (this as any).setData({
      [xOperation]: event.detail.x,
      [yOperation]: event.detail.y
    });
  }

  /**
   * 点击分享按钮，去分享页面
   */
  public handleGoSharePage(){
    wx.navigateTo({url: `/pages/foodShare/index?mealId=${this.mealId}`});
      
  }
}

Page(new FoodDetail());