import * as webAPI from '../../api/app/AppService';
import * as globalEnum from '../../api/GlobalEnum';
import { RetrieveMealLogReq, MealLogResp } from "/api/app/AppServiceObjs";


type Food = {
  foodName: string;
  engry: number;
  unit: string;
  portionList: Portion[];
  portionStrArr: string[];
  ingredientList: [];
  selectedPortionId: number;
}

type Portion = {
  portionName: string;
  weight: number;
}

type Data = {
  imageUrl: string;
  totalIntake: Nutrient;
  foodList: Food[];
}

type Nutrient = {
  energy: number,
  protein: number,
  carbohydrate: number,
  fat: number
}

class FoodDetail {
  public textSearchFood = undefined;
  public mealType = 0;
  public currentEditFoodIndex = 0;
  public mealId = 0;

  public data = {
    mealLogId: 0,
    showShareBtn: true,
    showDeleteBtn: false,
    imageUrl: "",
    totalIntake: {},
    foodList: []
  }

  public onLoad(option: any) {
    wx.showShareMenu({withShareTicket: true});
    wx.setNavigationBarTitle({
      title: "确认分量"
    });

    //set API to mealLog
    webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    //option param json
    if (option.paramJson) {
      let param = JSON.parse(option.paramJson);
      console.log('param',param);
      let imageUrl = param.imageUrl;
      this.mealId = param.mealId;
      (this as any).setData({
        imageUrl: imageUrl,
        showDeleteBtn: param.showDeleteBtn,
        showShareBtn: param.showShareBtn
      });
      this.retrieveMealLog(this.mealId);
      // this.loadSingleSearchData(param.textSearchItem);
    }
  }

  public onShow() {
    //add ingredient
    if (this.textSearchFood) {
      let req = { food_log_id: this.data.foodList[this.currentEditFoodIndex].food_log_id, ingredient_id: this.textSearchFood.food_id };
      webAPI.AddRecipeItem(req).then(resp => {
        this.parseMealData(resp);
      }).catch(err => {
        console.log(err);
        wx.showModal({
          title: '',
          content: '添加食材失败',
          showCancel: false
        });
      });
      this.textSearchFood = undefined;
    }
  }

  public retrieveMealLog(mealId: number) {
    let req: RetrieveMealLogReq = { meal_id: mealId }
    webAPI.RetrieveMealLog(req).then(resp => {
      this.parseMealData(resp);
    }).catch(err =>
      wx.showModal({
        title: '',
        content: '获取食物数据失败',
        showCancel: false
      })
    );
  }

  public parseMealData(resp: MealLogResp) {
    let mealLogId = resp.meal_id;
    let totalIntake = resp.total_intake;
    let foodList = [];
    for (let index in resp.food_log) {
      let foodLog = resp.food_log[index];
      let portionStrArr = [];
      for (let unitIndex in foodLog.unit_option) {
        let unitName = foodLog.unit_option[unitIndex].unit_name;
        console.log(foodLog.amount);
        // foodLog.amount = Math.floor(foodLog.amount/100);
        foodLog.unit_option[unitIndex].weight = Math.floor(foodLog.unit_option[unitIndex].weight / 100);

        portionStrArr.push(unitName + " (" + foodLog.unit_option[unitIndex].weight + "克) ");
        if (foodLog.unit_id === foodLog.unit_option[unitIndex].unit_id) {
          foodLog.selectedPortionIndex = unitIndex;
        }
      }
      foodLog.portionStrArr = portionStrArr;
      foodLog.amount = foodLog.amount / 100;
      foodLog.energy = Math.floor(foodLog.energy / 100);
      foodLog.weight = Math.floor(foodLog.weight / 100);
      if (this.data.foodList[index]) {
        foodLog.showIngredients = this.data.foodList[index].showIngredients;
      }
      for (let ingredientIndex in foodLog.ingredient_list) {
        let ingredientPortionStrArr = [];
        let ingredient = foodLog.ingredient_list[ingredientIndex];
        ingredient.amount = ingredient.amount / 100;
        for (let unitIndex in ingredient.unit_option) {
          let ingredientUnitName = ingredient.unit_option[unitIndex].unit_name;
          ingredient.unit_option[unitIndex].weight = ingredient.unit_option[unitIndex].weight / 100;
          ingredientPortionStrArr.push(ingredientUnitName + " (" + ingredient.unit_option[unitIndex].weight + "克) ");

          if (ingredient.unit_id === ingredient.unit_option[unitIndex].unit_id) {
            ingredient.selectedPortionIndex = unitIndex;
          }
        }
        console.log(ingredientPortionStrArr);
        ingredient.portionStrArr = ingredientPortionStrArr;
      }
      foodList.push(foodLog);
    }
    (this as any).setData({
      mealLogId: mealLogId,
      totalEngry: Math.floor(totalIntake.energy.intake / 100),
      foodList: foodList
    })
  }

  public loadSingleSearchData(foodName: string) {
    let foods = [
      { foodName: foodName, engry: 200, unit: "碗", amount: 1, selectedPortionId: 0, portionList: [{ portionName: "碗", weight: 200 }], showIngredients: false, ingredientList: [] }
    ];
    (this as any).setData({
      totalEngry: 200,
      foodList: foods
    });
  }

  public toggleShowIngredients(event: any) {
    let foodIndex = event.currentTarget.dataset.foodIndex;
    let operation = "foodList[" + foodIndex + "].showIngredients";
    (this as any).setData({
      [operation]: !this.data.foodList[foodIndex].showIngredients
    })
  }s

  public onConfirmPressed() {
    let req = { meal_id: this.mealId };
    webAPI.ConfirmMealLog(req).then(resp => {
      wx.navigateTo({
        url: "/pages/foodShare/index?mealId=" + this.data.mealLogId
      })
    }).catch(err => {
      wx.showModal({
        title: '',
        content: '提交食物记录失败',
        showCancel: false
      });
    });
  }

  public addMoreIngredient(event: any) {
    let foodIndex = event.currentTarget.dataset.foodIndex;
    this.currentEditFoodIndex = foodIndex;
    wx.navigateTo({
      url: "/pages/textSearch/index?title=食材&mealType=" + this.mealType + "&naviType=2" + "&filterType=2"
    });
  }

  public deleteMeal() {
    var that = this;
    wx.showModal({
      title: "",
      content: "确定删除吗?",
      success: function (res) {
        if (res.confirm) {
          let req = { meal_id: that.mealId }
          webAPI.DestroyMealLog(req).then(resp => {
            //回退到主页
            wx.navigateBack({
              delta: 100
            })
          }).catch(err => {
            console.log(err);
            wx.showModal({
              title: '',
              content: '删除失败',
              showCancel: false
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  }

  public deleteFood(event: any) {
    var that = this;
    let foodIndex = event.currentTarget.dataset.foodIndex;
    let foodLogId = this.data.foodList[foodIndex].food_log_id;
    let foodName = this.data.foodList[foodIndex].food_name;
    wx.showModal({
      title: "",
      content: "确定删除" + foodName + "吗?",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let req = { food_log_id: foodLogId };
          webAPI.DestroyFoodLog(req).then(resp => {
            that.retrieveMealLog(that.mealId);
          }).catch(err =>{
            console.log(err);
            wx.showModal({
              title: '',
              content: '删除失败',
              showCancel: false
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  }

  public deleteIngredient(event: any) {
    var that = this;
    let foodIndex = event.currentTarget.dataset.foodIndex;
    let ingredientIndex = event.currentTarget.dataset.ingredientIndex;
    let ingredientId = this.data.foodList[foodIndex].ingredient_list[ingredientIndex].recipe_details_id;
    let ingredientName = this.data.foodList[foodIndex].ingredient_list[ingredientIndex].ingredient_name;
    wx.showModal({
      title: "",
      content: "确定删除" + ingredientName + "吗?",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let req = { recipe_item_id: ingredientId }
          webAPI.DestroyRecipeItem(req).then(resp => {
            that.retrieveMealLog(that.mealId);
          }).catch(err => {
            console.log(err);
            wx.showModal({
              title: '',
              content: '删除失败',
              showCancel: false
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  }

  public onFoodPortionSelect(event: any) {
    console.log("onFoodPortionSelect" + Number(event.detail.value));
    let foodIndex = event.currentTarget.dataset.foodIndex;
    let selectedPos = Number(event.detail.value);
    //refresh food log data
    let foodLog = this.data.foodList[foodIndex];
    let foodLogId = foodLog.food_log_id;
    let unitId = foodLog.unit_option[selectedPos].unit_id;
    let amountValue = foodLog.amount * 100;
    let req = { food_log_id: foodLogId, unit_id: unitId, amount: amountValue };
    webAPI.UpdateFoodLog(req).then(resp => {
      this.parseMealData(resp);
      let operation = "foodList[" + foodIndex + "].selectedPortionIndex";
      (this as any).setData({
        [operation]: selectedPos
      });
    }).catch(err => {
      console.log(err);
      wx.showModal({
        title: '',
        content: '更新失败',
        showCancel: false
      });
    });
  }

  public onIngredientPortionSelect(event: any) {
    console.log("onIngredientPortionSelect" + Number(event.detail.value));
    let foodLogIndex = event.currentTarget.dataset.foodIndex;
    let ingredientIndex = event.currentTarget.dataset.ingredientIndex;
    let selectedPos = Number(event.detail.value);
    //refresh ingredient list data
    let ingredient = this.data.foodList[foodLogIndex].ingredient_list[ingredientIndex];
    let recipeId = ingredient.recipe_details_id;
    let unitId = ingredient.unit_option[selectedPos].unit_id;
    let amountValue = ingredient.amount * 100;
    let req = { recipe_item_id: recipeId, unit_id: unitId, amount: amountValue };
    webAPI.UpdateRecipeItem(req).then(resp => {
      this.parseMealData(resp);
      let operation = "foodList[" + foodLogIndex + "].ingredient_list[" + ingredientIndex + "].selectedPortionIndex";
      (this as any).setData({
        [operation]: selectedPos
      });
    }).catch(err => {
        console.log(err);
        wx.showModal({
          title: '',
          content: '更新失败',
          showCancel: false
        });
    });
  }

  public onFoodAmountChange(event: any) {
    let amountValue = parseInt(event.detail.value * 100);
    let foodLogIndex = event.currentTarget.dataset.foodIndex;
    let foodLog = this.data.foodList[foodLogIndex];
    console.log(foodLogIndex);
    let foodLogId = foodLog.food_log_id;
    let unitId = foodLog.unit_option[foodLog.selectedPortionIndex].unit_id;
    let req = { food_log_id: foodLogId, unit_id: unitId, amount: amountValue };
    console.log(req);
    webAPI.UpdateFoodLog(req).then(resp => { this.parseMealData(resp); }).catch(err => {
      console.log(err);
      wx.showModal({
        title: '',
        content: '更新失败',
        showCancel: false
      });
    });
  }

  public onIngredientAmountChange(event: any) {
    let amountValue = parseInt(event.detail.value * 100);
    let foodLogIndex = event.currentTarget.dataset.foodIndex;
    let ingredientIndex = event.currentTarget.dataset.ingredientIndex;
    let ingredient = this.data.foodList[foodLogIndex].ingredient_list[ingredientIndex];
    let recipeId = ingredient.recipe_details_id;
    let unitId = ingredient.unit_option[ingredient.selectedPortionIndex].unit_id;
    let req = { recipe_item_id: recipeId, unit_id: unitId, amount: amountValue };
    webAPI.UpdateRecipeItem(req).then(resp => { this.parseMealData(resp); }).catch(err => {
      console.log(err);
      wx.showModal({
        title: '',
        content: '更新失败',
        showCancel: false
      });
    });
  }

}

Page(new FoodDetail())