"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var FoodDetail = (function () {
    function FoodDetail() {
        this.textSearchFood = undefined;
        this.mealType = 0;
        this.currentEditFoodIndex = 0;
        this.mealId = 0;
        this.data = {
            mealLogId: 0,
            showShareBtn: true,
            showDeleteBtn: false,
            imageUrl: "",
            totalIntake: {},
            foodList: []
        };
    }
    FoodDetail.prototype.onLoad = function (option) {
        wx.showShareMenu({ withShareTicket: true });
        wx.setNavigationBarTitle({
            title: "确认分量"
        });
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        if (option.paramJson) {
            var param = JSON.parse(option.paramJson);
            console.log('param', param);
            var imageUrl = param.imageUrl;
            this.mealId = param.mealId;
            this.setData({
                imageUrl: imageUrl,
                showDeleteBtn: param.showDeleteBtn,
                showShareBtn: param.showShareBtn
            });
            this.retrieveMealLog(this.mealId);
        }
    };
    FoodDetail.prototype.onShow = function () {
        var _this = this;
        if (this.textSearchFood) {
            var req = { food_log_id: this.data.foodList[this.currentEditFoodIndex].food_log_id, ingredient_id: this.textSearchFood.food_id };
            webAPI.AddRecipeItem(req).then(function (resp) {
                _this.parseMealData(resp);
            }).catch(function (err) {
                console.log(err);
                wx.showModal({
                    title: '',
                    content: '添加食材失败',
                    showCancel: false
                });
            });
            this.textSearchFood = undefined;
        }
    };
    FoodDetail.prototype.retrieveMealLog = function (mealId) {
        var _this = this;
        var req = { meal_id: mealId };
        webAPI.RetrieveMealLog(req).then(function (resp) {
            _this.parseMealData(resp);
        }).catch(function (err) {
            return wx.showModal({
                title: '',
                content: '获取食物数据失败',
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.parseMealData = function (resp) {
        var mealLogId = resp.meal_id;
        var totalIntake = resp.total_intake;
        var foodList = [];
        for (var index in resp.food_log) {
            var foodLog = resp.food_log[index];
            var portionStrArr = [];
            for (var unitIndex in foodLog.unit_option) {
                var unitName = foodLog.unit_option[unitIndex].unit_name;
                console.log(foodLog.amount);
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
            for (var ingredientIndex in foodLog.ingredient_list) {
                var ingredientPortionStrArr = [];
                var ingredient = foodLog.ingredient_list[ingredientIndex];
                ingredient.amount = ingredient.amount / 100;
                for (var unitIndex in ingredient.unit_option) {
                    var ingredientUnitName = ingredient.unit_option[unitIndex].unit_name;
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
        this.setData({
            mealLogId: mealLogId,
            totalEngry: Math.floor(totalIntake.energy.intake / 100),
            foodList: foodList
        });
    };
    FoodDetail.prototype.loadSingleSearchData = function (foodName) {
        var foods = [
            { foodName: foodName, engry: 200, unit: "碗", amount: 1, selectedPortionId: 0, portionList: [{ portionName: "碗", weight: 200 }], showIngredients: false, ingredientList: [] }
        ];
        this.setData({
            totalEngry: 200,
            foodList: foods
        });
    };
    FoodDetail.prototype.toggleShowIngredients = function (event) {
        var _a;
        var foodIndex = event.currentTarget.dataset.foodIndex;
        var operation = "foodList[" + foodIndex + "].showIngredients";
        this.setData((_a = {},
            _a[operation] = !this.data.foodList[foodIndex].showIngredients,
            _a));
    };
    FoodDetail.prototype.onConfirmPressed = function () {
        var _this = this;
        var req = { meal_id: this.mealId };
        webAPI.ConfirmMealLog(req).then(function (resp) {
            wx.navigateTo({
                url: "/pages/foodShare/index?mealId=" + _this.data.mealLogId
            });
        }).catch(function (err) {
            wx.showModal({
                title: '',
                content: '提交食物记录失败',
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.addMoreIngredient = function (event) {
        var foodIndex = event.currentTarget.dataset.foodIndex;
        this.currentEditFoodIndex = foodIndex;
        wx.navigateTo({
            url: "/pages/textSearch/index?title=食材&mealType=" + this.mealType + "&naviType=2" + "&filterType=2"
        });
    };
    FoodDetail.prototype.deleteMeal = function () {
        var that = this;
        wx.showModal({
            title: "",
            content: "确定删除吗?",
            success: function (res) {
                if (res.confirm) {
                    var req = { meal_id: that.mealId };
                    webAPI.DestroyMealLog(req).then(function (resp) {
                        wx.navigateBack({
                            delta: 100
                        });
                    }).catch(function (err) {
                        console.log(err);
                        wx.showModal({
                            title: '',
                            content: '删除失败',
                            showCancel: false
                        });
                    });
                }
                else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
    };
    FoodDetail.prototype.deleteFood = function (event) {
        var that = this;
        var foodIndex = event.currentTarget.dataset.foodIndex;
        var foodLogId = this.data.foodList[foodIndex].food_log_id;
        var foodName = this.data.foodList[foodIndex].food_name;
        wx.showModal({
            title: "",
            content: "确定删除" + foodName + "吗?",
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定');
                    var req = { food_log_id: foodLogId };
                    webAPI.DestroyFoodLog(req).then(function (resp) {
                        that.retrieveMealLog(that.mealId);
                    }).catch(function (err) {
                        console.log(err);
                        wx.showModal({
                            title: '',
                            content: '删除失败',
                            showCancel: false
                        });
                    });
                }
                else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
    };
    FoodDetail.prototype.deleteIngredient = function (event) {
        var that = this;
        var foodIndex = event.currentTarget.dataset.foodIndex;
        var ingredientIndex = event.currentTarget.dataset.ingredientIndex;
        var ingredientId = this.data.foodList[foodIndex].ingredient_list[ingredientIndex].recipe_details_id;
        var ingredientName = this.data.foodList[foodIndex].ingredient_list[ingredientIndex].ingredient_name;
        wx.showModal({
            title: "",
            content: "确定删除" + ingredientName + "吗?",
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定');
                    var req = { recipe_item_id: ingredientId };
                    webAPI.DestroyRecipeItem(req).then(function (resp) {
                        that.retrieveMealLog(that.mealId);
                    }).catch(function (err) {
                        console.log(err);
                        wx.showModal({
                            title: '',
                            content: '删除失败',
                            showCancel: false
                        });
                    });
                }
                else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
    };
    FoodDetail.prototype.onFoodPortionSelect = function (event) {
        var _this = this;
        console.log("onFoodPortionSelect" + Number(event.detail.value));
        var foodIndex = event.currentTarget.dataset.foodIndex;
        var selectedPos = Number(event.detail.value);
        var foodLog = this.data.foodList[foodIndex];
        var foodLogId = foodLog.food_log_id;
        var unitId = foodLog.unit_option[selectedPos].unit_id;
        var amountValue = foodLog.amount * 100;
        var req = { food_log_id: foodLogId, unit_id: unitId, amount: amountValue };
        webAPI.UpdateFoodLog(req).then(function (resp) {
            var _a;
            _this.parseMealData(resp);
            var operation = "foodList[" + foodIndex + "].selectedPortionIndex";
            _this.setData((_a = {},
                _a[operation] = selectedPos,
                _a));
        }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '',
                content: '更新失败',
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.onIngredientPortionSelect = function (event) {
        var _this = this;
        console.log("onIngredientPortionSelect" + Number(event.detail.value));
        var foodLogIndex = event.currentTarget.dataset.foodIndex;
        var ingredientIndex = event.currentTarget.dataset.ingredientIndex;
        var selectedPos = Number(event.detail.value);
        var ingredient = this.data.foodList[foodLogIndex].ingredient_list[ingredientIndex];
        var recipeId = ingredient.recipe_details_id;
        var unitId = ingredient.unit_option[selectedPos].unit_id;
        var amountValue = ingredient.amount * 100;
        var req = { recipe_item_id: recipeId, unit_id: unitId, amount: amountValue };
        webAPI.UpdateRecipeItem(req).then(function (resp) {
            var _a;
            _this.parseMealData(resp);
            var operation = "foodList[" + foodLogIndex + "].ingredient_list[" + ingredientIndex + "].selectedPortionIndex";
            _this.setData((_a = {},
                _a[operation] = selectedPos,
                _a));
        }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '',
                content: '更新失败',
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.onFoodAmountChange = function (event) {
        var _this = this;
        var amountValue = parseInt(event.detail.value * 100);
        var foodLogIndex = event.currentTarget.dataset.foodIndex;
        var foodLog = this.data.foodList[foodLogIndex];
        console.log(foodLogIndex);
        var foodLogId = foodLog.food_log_id;
        var unitId = foodLog.unit_option[foodLog.selectedPortionIndex].unit_id;
        var req = { food_log_id: foodLogId, unit_id: unitId, amount: amountValue };
        console.log(req);
        webAPI.UpdateFoodLog(req).then(function (resp) { _this.parseMealData(resp); }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '',
                content: '更新失败',
                showCancel: false
            });
        });
    };
    FoodDetail.prototype.onIngredientAmountChange = function (event) {
        var _this = this;
        var amountValue = parseInt(event.detail.value * 100);
        var foodLogIndex = event.currentTarget.dataset.foodIndex;
        var ingredientIndex = event.currentTarget.dataset.ingredientIndex;
        var ingredient = this.data.foodList[foodLogIndex].ingredient_list[ingredientIndex];
        var recipeId = ingredient.recipe_details_id;
        var unitId = ingredient.unit_option[ingredient.selectedPortionIndex].unit_id;
        var req = { recipe_item_id: recipeId, unit_id: unitId, amount: amountValue };
        webAPI.UpdateRecipeItem(req).then(function (resp) { _this.parseMealData(resp); }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '',
                content: '更新失败',
                showCancel: false
            });
        });
    };
    return FoodDetail;
}());
Page(new FoodDetail());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFnQ25EO0lBQUE7UUFDUyxtQkFBYyxHQUFHLFNBQVMsQ0FBQztRQUMzQixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IseUJBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFFWCxTQUFJLEdBQUc7WUFDWixTQUFTLEVBQUUsQ0FBQztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLFFBQVEsRUFBRSxFQUFFO1lBQ1osV0FBVyxFQUFFLEVBQUU7WUFDZixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUE7SUFxVUgsQ0FBQztJQW5VUSwyQkFBTSxHQUFiLFVBQWMsTUFBVztRQUN2QixFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMsZUFBZSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ3ZCLEtBQUssRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBR0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBRW5FLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNwQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixRQUFRLEVBQUUs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QkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQU0sS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUc7WUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNYLEtBQUssRUFBRSxFQUFFO2dCQUNULE9BQU8sRUFBRSxNQUFNO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2FBQ2xCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVILGlCQUFDO0FBQUQsQ0FBQyxBQWxWRCxJQWtWQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0IHsgUmV0cmlldmVNZWFsTG9nUmVxLCBNZWFsTG9nUmVzcCB9IGZyb20gXCIvYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqc1wiO1xuXG5cbnR5cGUgRm9vZCA9IHtcbiAgZm9vZE5hbWU6IHN0cmluZztcbiAgZW5ncnk6IG51bWJlcjtcbiAgdW5pdDogc3RyaW5nO1xuICBwb3J0aW9uTGlzdDogUG9ydGlvbltdO1xuICBwb3J0aW9uU3RyQXJyOiBzdHJpbmdbXTtcbiAgaW5ncmVkaWVudExpc3Q6IFtdO1xuICBzZWxlY3RlZFBvcnRpb25JZDogbnVtYmVyO1xufVxuXG50eXBlIFBvcnRpb24gPSB7XG4gIHBvcnRpb25OYW1lOiBzdHJpbmc7XG4gIHdlaWdodDogbnVtYmVyO1xufVxuXG50eXBlIERhdGEgPSB7XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHRvdGFsSW50YWtlOiBOdXRyaWVudDtcbiAgZm9vZExpc3Q6IEZvb2RbXTtcbn1cblxudHlwZSBOdXRyaWVudCA9IHtcbiAgZW5lcmd5OiBudW1iZXIsXG4gIHByb3RlaW46IG51bWJlcixcbiAgY2FyYm9oeWRyYXRlOiBudW1iZXIsXG4gIGZhdDogbnVtYmVyXG59XG5cbmNsYXNzIEZvb2REZXRhaWwge1xuICBwdWJsaWMgdGV4dFNlYXJjaEZvb2QgPSB1bmRlZmluZWQ7XG4gIHB1YmxpYyBtZWFsVHlwZSA9IDA7XG4gIHB1YmxpYyBjdXJyZW50RWRpdEZvb2RJbmRleCA9IDA7XG4gIHB1YmxpYyBtZWFsSWQgPSAwO1xuXG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIG1lYWxMb2dJZDogMCxcbiAgICBzaG93U2hhcmVCdG46IHRydWUsXG4gICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgdG90YWxJbnRha2U6IHt9LFxuICAgIGZvb2RMaXN0OiBbXVxuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb246IGFueSkge1xuICAgIHd4LnNob3dTaGFyZU1lbnUoe3dpdGhTaGFyZVRpY2tldDogdHJ1ZX0pO1xuICAgIHd4LnNldE5hdmlnYXRpb25CYXJUaXRsZSh7XG4gICAgICB0aXRsZTogXCLnoa7orqTliIbph49cIlxuICAgIH0pO1xuXG4gICAgLy9zZXQgQVBJIHRvIG1lYWxMb2dcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgLy9vcHRpb24gcGFyYW0ganNvblxuICAgIGlmIChvcHRpb24ucGFyYW1Kc29uKSB7XG4gICAgICBsZXQgcGFyYW0gPSBKU09OLnBhcnNlKG9wdGlvbi5wYXJhbUpzb24pO1xuICAgICAgY29uc29sZS5sb2coJ3BhcmFtJyxwYXJhbSk7XG4gICAgICBsZXQgaW1hZ2VVcmwgPSBwYXJhbS5pbWFnZVVybDtcbiAgICAgIHRoaXMubWVhbElkID0gcGFyYW0ubWVhbElkO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgaW1hZ2VVcmw6IGltYWdlVXJsLFxuICAgICAgICBzaG93RGVsZXRlQnRuOiBwYXJhbS5zaG93RGVsZXRlQnRuLFxuICAgICAgICBzaG93U2hhcmVCdG46IHBhcmFtLnNob3dTaGFyZUJ0blxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldHJpZXZlTWVhbExvZyh0aGlzLm1lYWxJZCk7XG4gICAgICAvLyB0aGlzLmxvYWRTaW5nbGVTZWFyY2hEYXRhKHBhcmFtLnRleHRTZWFyY2hJdGVtKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25TaG93KCkge1xuICAgIC8vYWRkIGluZ3JlZGllbnRcbiAgICBpZiAodGhpcy50ZXh0U2VhcmNoRm9vZCkge1xuICAgICAgbGV0IHJlcSA9IHsgZm9vZF9sb2dfaWQ6IHRoaXMuZGF0YS5mb29kTGlzdFt0aGlzLmN1cnJlbnRFZGl0Rm9vZEluZGV4XS5mb29kX2xvZ19pZCwgaW5ncmVkaWVudF9pZDogdGhpcy50ZXh0U2VhcmNoRm9vZC5mb29kX2lkIH07XG4gICAgICB3ZWJBUEkuQWRkUmVjaXBlSXRlbShyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIHRoaXMucGFyc2VNZWFsRGF0YShyZXNwKTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGNvbnRlbnQ6ICfmt7vliqDpo5/mnZDlpLHotKUnLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnRleHRTZWFyY2hGb29kID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXRyaWV2ZU1lYWxMb2cobWVhbElkOiBudW1iZXIpIHtcbiAgICBsZXQgcmVxOiBSZXRyaWV2ZU1lYWxMb2dSZXEgPSB7IG1lYWxfaWQ6IG1lYWxJZCB9XG4gICAgd2ViQVBJLlJldHJpZXZlTWVhbExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGlzLnBhcnNlTWVhbERhdGEocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfojrflj5bpo5/nianmlbDmja7lpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIHBhcnNlTWVhbERhdGEocmVzcDogTWVhbExvZ1Jlc3ApIHtcbiAgICBsZXQgbWVhbExvZ0lkID0gcmVzcC5tZWFsX2lkO1xuICAgIGxldCB0b3RhbEludGFrZSA9IHJlc3AudG90YWxfaW50YWtlO1xuICAgIGxldCBmb29kTGlzdCA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4IGluIHJlc3AuZm9vZF9sb2cpIHtcbiAgICAgIGxldCBmb29kTG9nID0gcmVzcC5mb29kX2xvZ1tpbmRleF07XG4gICAgICBsZXQgcG9ydGlvblN0ckFyciA9IFtdO1xuICAgICAgZm9yIChsZXQgdW5pdEluZGV4IGluIGZvb2RMb2cudW5pdF9vcHRpb24pIHtcbiAgICAgICAgbGV0IHVuaXROYW1lID0gZm9vZExvZy51bml0X29wdGlvblt1bml0SW5kZXhdLnVuaXRfbmFtZTtcbiAgICAgICAgY29uc29sZS5sb2coZm9vZExvZy5hbW91bnQpO1xuICAgICAgICAvLyBmb29kTG9nLmFtb3VudCA9IE1hdGguZmxvb3IoZm9vZExvZy5hbW91bnQvMTAwKTtcbiAgICAgICAgZm9vZExvZy51bml0X29wdGlvblt1bml0SW5kZXhdLndlaWdodCA9IE1hdGguZmxvb3IoZm9vZExvZy51bml0X29wdGlvblt1bml0SW5kZXhdLndlaWdodCAvIDEwMCk7XG5cbiAgICAgICAgcG9ydGlvblN0ckFyci5wdXNoKHVuaXROYW1lICsgXCIgKFwiICsgZm9vZExvZy51bml0X29wdGlvblt1bml0SW5kZXhdLndlaWdodCArIFwi5YWLKSBcIik7XG4gICAgICAgIGlmIChmb29kTG9nLnVuaXRfaWQgPT09IGZvb2RMb2cudW5pdF9vcHRpb25bdW5pdEluZGV4XS51bml0X2lkKSB7XG4gICAgICAgICAgZm9vZExvZy5zZWxlY3RlZFBvcnRpb25JbmRleCA9IHVuaXRJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9vZExvZy5wb3J0aW9uU3RyQXJyID0gcG9ydGlvblN0ckFycjtcbiAgICAgIGZvb2RMb2cuYW1vdW50ID0gZm9vZExvZy5hbW91bnQgLyAxMDA7XG4gICAgICBmb29kTG9nLmVuZXJneSA9IE1hdGguZmxvb3IoZm9vZExvZy5lbmVyZ3kgLyAxMDApO1xuICAgICAgZm9vZExvZy53ZWlnaHQgPSBNYXRoLmZsb29yKGZvb2RMb2cud2VpZ2h0IC8gMTAwKTtcbiAgICAgIGlmICh0aGlzLmRhdGEuZm9vZExpc3RbaW5kZXhdKSB7XG4gICAgICAgIGZvb2RMb2cuc2hvd0luZ3JlZGllbnRzID0gdGhpcy5kYXRhLmZvb2RMaXN0W2luZGV4XS5zaG93SW5ncmVkaWVudHM7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpbmdyZWRpZW50SW5kZXggaW4gZm9vZExvZy5pbmdyZWRpZW50X2xpc3QpIHtcbiAgICAgICAgbGV0IGluZ3JlZGllbnRQb3J0aW9uU3RyQXJyID0gW107XG4gICAgICAgIGxldCBpbmdyZWRpZW50ID0gZm9vZExvZy5pbmdyZWRpZW50X2xpc3RbaW5ncmVkaWVudEluZGV4XTtcbiAgICAgICAgaW5ncmVkaWVudC5hbW91bnQgPSBpbmdyZWRpZW50LmFtb3VudCAvIDEwMDtcbiAgICAgICAgZm9yIChsZXQgdW5pdEluZGV4IGluIGluZ3JlZGllbnQudW5pdF9vcHRpb24pIHtcbiAgICAgICAgICBsZXQgaW5ncmVkaWVudFVuaXROYW1lID0gaW5ncmVkaWVudC51bml0X29wdGlvblt1bml0SW5kZXhdLnVuaXRfbmFtZTtcbiAgICAgICAgICBpbmdyZWRpZW50LnVuaXRfb3B0aW9uW3VuaXRJbmRleF0ud2VpZ2h0ID0gaW5ncmVkaWVudC51bml0X29wdGlvblt1bml0SW5kZXhdLndlaWdodCAvIDEwMDtcbiAgICAgICAgICBpbmdyZWRpZW50UG9ydGlvblN0ckFyci5wdXNoKGluZ3JlZGllbnRVbml0TmFtZSArIFwiIChcIiArIGluZ3JlZGllbnQudW5pdF9vcHRpb25bdW5pdEluZGV4XS53ZWlnaHQgKyBcIuWFiykgXCIpO1xuXG4gICAgICAgICAgaWYgKGluZ3JlZGllbnQudW5pdF9pZCA9PT0gaW5ncmVkaWVudC51bml0X29wdGlvblt1bml0SW5kZXhdLnVuaXRfaWQpIHtcbiAgICAgICAgICAgIGluZ3JlZGllbnQuc2VsZWN0ZWRQb3J0aW9uSW5kZXggPSB1bml0SW5kZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGluZ3JlZGllbnRQb3J0aW9uU3RyQXJyKTtcbiAgICAgICAgaW5ncmVkaWVudC5wb3J0aW9uU3RyQXJyID0gaW5ncmVkaWVudFBvcnRpb25TdHJBcnI7XG4gICAgICB9XG4gICAgICBmb29kTGlzdC5wdXNoKGZvb2RMb2cpO1xuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbWVhbExvZ0lkOiBtZWFsTG9nSWQsXG4gICAgICB0b3RhbEVuZ3J5OiBNYXRoLmZsb29yKHRvdGFsSW50YWtlLmVuZXJneS5pbnRha2UgLyAxMDApLFxuICAgICAgZm9vZExpc3Q6IGZvb2RMaXN0XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBsb2FkU2luZ2xlU2VhcmNoRGF0YShmb29kTmFtZTogc3RyaW5nKSB7XG4gICAgbGV0IGZvb2RzID0gW1xuICAgICAgeyBmb29kTmFtZTogZm9vZE5hbWUsIGVuZ3J5OiAyMDAsIHVuaXQ6IFwi56KXXCIsIGFtb3VudDogMSwgc2VsZWN0ZWRQb3J0aW9uSWQ6IDAsIHBvcnRpb25MaXN0OiBbeyBwb3J0aW9uTmFtZTogXCLnopdcIiwgd2VpZ2h0OiAyMDAgfV0sIHNob3dJbmdyZWRpZW50czogZmFsc2UsIGluZ3JlZGllbnRMaXN0OiBbXSB9XG4gICAgXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgdG90YWxFbmdyeTogMjAwLFxuICAgICAgZm9vZExpc3Q6IGZvb2RzXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgdG9nZ2xlU2hvd0luZ3JlZGllbnRzKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgZm9vZEluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmZvb2RJbmRleDtcbiAgICBsZXQgb3BlcmF0aW9uID0gXCJmb29kTGlzdFtcIiArIGZvb2RJbmRleCArIFwiXS5zaG93SW5ncmVkaWVudHNcIjtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgW29wZXJhdGlvbl06ICF0aGlzLmRhdGEuZm9vZExpc3RbZm9vZEluZGV4XS5zaG93SW5ncmVkaWVudHNcbiAgICB9KVxuICB9c1xuXG4gIHB1YmxpYyBvbkNvbmZpcm1QcmVzc2VkKCkge1xuICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IHRoaXMubWVhbElkIH07XG4gICAgd2ViQVBJLkNvbmZpcm1NZWFsTG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICB1cmw6IFwiL3BhZ2VzL2Zvb2RTaGFyZS9pbmRleD9tZWFsSWQ9XCIgKyB0aGlzLmRhdGEubWVhbExvZ0lkXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfmj5DkuqTpo5/nianorrDlvZXlpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYWRkTW9yZUluZ3JlZGllbnQoZXZlbnQ6IGFueSkge1xuICAgIGxldCBmb29kSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuZm9vZEluZGV4O1xuICAgIHRoaXMuY3VycmVudEVkaXRGb29kSW5kZXggPSBmb29kSW5kZXg7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6IFwiL3BhZ2VzL3RleHRTZWFyY2gvaW5kZXg/dGl0bGU96aOf5p2QJm1lYWxUeXBlPVwiICsgdGhpcy5tZWFsVHlwZSArIFwiJm5hdmlUeXBlPTJcIiArIFwiJmZpbHRlclR5cGU9MlwiXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWVhbCgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgY29udGVudDogXCLnoa7lrprliKDpmaTlkJc/XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgIGxldCByZXEgPSB7IG1lYWxfaWQ6IHRoYXQubWVhbElkIH1cbiAgICAgICAgICB3ZWJBUEkuRGVzdHJveU1lYWxMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgLy/lm57pgIDliLDkuLvpobVcbiAgICAgICAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XG4gICAgICAgICAgICAgIGRlbHRhOiAxMDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICfliKDpmaTlpLHotKUnLFxuICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzLmNhbmNlbCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLfngrnlh7vlj5bmtognKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlRm9vZChldmVudDogYW55KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGxldCBmb29kSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuZm9vZEluZGV4O1xuICAgIGxldCBmb29kTG9nSWQgPSB0aGlzLmRhdGEuZm9vZExpc3RbZm9vZEluZGV4XS5mb29kX2xvZ19pZDtcbiAgICBsZXQgZm9vZE5hbWUgPSB0aGlzLmRhdGEuZm9vZExpc3RbZm9vZEluZGV4XS5mb29kX25hbWU7XG4gICAgd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgY29udGVudDogXCLnoa7lrprliKDpmaRcIiArIGZvb2ROYW1lICsgXCLlkJc/XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLfngrnlh7vnoa7lrponKVxuICAgICAgICAgIGxldCByZXEgPSB7IGZvb2RfbG9nX2lkOiBmb29kTG9nSWQgfTtcbiAgICAgICAgICB3ZWJBUEkuRGVzdHJveUZvb2RMb2cocmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgdGhhdC5yZXRyaWV2ZU1lYWxMb2codGhhdC5tZWFsSWQpO1xuICAgICAgICAgIH0pLmNhdGNoKGVyciA9PntcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICfliKDpmaTlpLHotKUnLFxuICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzLmNhbmNlbCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLfngrnlh7vlj5bmtognKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlSW5ncmVkaWVudChldmVudDogYW55KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGxldCBmb29kSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuZm9vZEluZGV4O1xuICAgIGxldCBpbmdyZWRpZW50SW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5ncmVkaWVudEluZGV4O1xuICAgIGxldCBpbmdyZWRpZW50SWQgPSB0aGlzLmRhdGEuZm9vZExpc3RbZm9vZEluZGV4XS5pbmdyZWRpZW50X2xpc3RbaW5ncmVkaWVudEluZGV4XS5yZWNpcGVfZGV0YWlsc19pZDtcbiAgICBsZXQgaW5ncmVkaWVudE5hbWUgPSB0aGlzLmRhdGEuZm9vZExpc3RbZm9vZEluZGV4XS5pbmdyZWRpZW50X2xpc3RbaW5ncmVkaWVudEluZGV4XS5pbmdyZWRpZW50X25hbWU7XG4gICAgd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgY29udGVudDogXCLnoa7lrprliKDpmaRcIiArIGluZ3JlZGllbnROYW1lICsgXCLlkJc/XCIsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLfngrnlh7vnoa7lrponKVxuICAgICAgICAgIGxldCByZXEgPSB7IHJlY2lwZV9pdGVtX2lkOiBpbmdyZWRpZW50SWQgfVxuICAgICAgICAgIHdlYkFQSS5EZXN0cm95UmVjaXBlSXRlbShyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgICB0aGF0LnJldHJpZXZlTWVhbExvZyh0aGF0Lm1lYWxJZCk7XG4gICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICfliKDpmaTlpLHotKUnLFxuICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzLmNhbmNlbCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfnlKjmiLfngrnlh7vlj5bmtognKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25Gb29kUG9ydGlvblNlbGVjdChldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJvbkZvb2RQb3J0aW9uU2VsZWN0XCIgKyBOdW1iZXIoZXZlbnQuZGV0YWlsLnZhbHVlKSk7XG4gICAgbGV0IGZvb2RJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5mb29kSW5kZXg7XG4gICAgbGV0IHNlbGVjdGVkUG9zID0gTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgLy9yZWZyZXNoIGZvb2QgbG9nIGRhdGFcbiAgICBsZXQgZm9vZExvZyA9IHRoaXMuZGF0YS5mb29kTGlzdFtmb29kSW5kZXhdO1xuICAgIGxldCBmb29kTG9nSWQgPSBmb29kTG9nLmZvb2RfbG9nX2lkO1xuICAgIGxldCB1bml0SWQgPSBmb29kTG9nLnVuaXRfb3B0aW9uW3NlbGVjdGVkUG9zXS51bml0X2lkO1xuICAgIGxldCBhbW91bnRWYWx1ZSA9IGZvb2RMb2cuYW1vdW50ICogMTAwO1xuICAgIGxldCByZXEgPSB7IGZvb2RfbG9nX2lkOiBmb29kTG9nSWQsIHVuaXRfaWQ6IHVuaXRJZCwgYW1vdW50OiBhbW91bnRWYWx1ZSB9O1xuICAgIHdlYkFQSS5VcGRhdGVGb29kTG9nKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHRoaXMucGFyc2VNZWFsRGF0YShyZXNwKTtcbiAgICAgIGxldCBvcGVyYXRpb24gPSBcImZvb2RMaXN0W1wiICsgZm9vZEluZGV4ICsgXCJdLnNlbGVjdGVkUG9ydGlvbkluZGV4XCI7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBbb3BlcmF0aW9uXTogc2VsZWN0ZWRQb3NcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBjb250ZW50OiAn5pu05paw5aSx6LSlJyxcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSW5ncmVkaWVudFBvcnRpb25TZWxlY3QoZXZlbnQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwib25JbmdyZWRpZW50UG9ydGlvblNlbGVjdFwiICsgTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSkpO1xuICAgIGxldCBmb29kTG9nSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuZm9vZEluZGV4O1xuICAgIGxldCBpbmdyZWRpZW50SW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5ncmVkaWVudEluZGV4O1xuICAgIGxldCBzZWxlY3RlZFBvcyA9IE51bWJlcihldmVudC5kZXRhaWwudmFsdWUpO1xuICAgIC8vcmVmcmVzaCBpbmdyZWRpZW50IGxpc3QgZGF0YVxuICAgIGxldCBpbmdyZWRpZW50ID0gdGhpcy5kYXRhLmZvb2RMaXN0W2Zvb2RMb2dJbmRleF0uaW5ncmVkaWVudF9saXN0W2luZ3JlZGllbnRJbmRleF07XG4gICAgbGV0IHJlY2lwZUlkID0gaW5ncmVkaWVudC5yZWNpcGVfZGV0YWlsc19pZDtcbiAgICBsZXQgdW5pdElkID0gaW5ncmVkaWVudC51bml0X29wdGlvbltzZWxlY3RlZFBvc10udW5pdF9pZDtcbiAgICBsZXQgYW1vdW50VmFsdWUgPSBpbmdyZWRpZW50LmFtb3VudCAqIDEwMDtcbiAgICBsZXQgcmVxID0geyByZWNpcGVfaXRlbV9pZDogcmVjaXBlSWQsIHVuaXRfaWQ6IHVuaXRJZCwgYW1vdW50OiBhbW91bnRWYWx1ZSB9O1xuICAgIHdlYkFQSS5VcGRhdGVSZWNpcGVJdGVtKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHRoaXMucGFyc2VNZWFsRGF0YShyZXNwKTtcbiAgICAgIGxldCBvcGVyYXRpb24gPSBcImZvb2RMaXN0W1wiICsgZm9vZExvZ0luZGV4ICsgXCJdLmluZ3JlZGllbnRfbGlzdFtcIiArIGluZ3JlZGllbnRJbmRleCArIFwiXS5zZWxlY3RlZFBvcnRpb25JbmRleFwiO1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgW29wZXJhdGlvbl06IHNlbGVjdGVkUG9zXG4gICAgICB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBjb250ZW50OiAn5pu05paw5aSx6LSlJyxcbiAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkZvb2RBbW91bnRDaGFuZ2UoZXZlbnQ6IGFueSkge1xuICAgIGxldCBhbW91bnRWYWx1ZSA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC52YWx1ZSAqIDEwMCk7XG4gICAgbGV0IGZvb2RMb2dJbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5mb29kSW5kZXg7XG4gICAgbGV0IGZvb2RMb2cgPSB0aGlzLmRhdGEuZm9vZExpc3RbZm9vZExvZ0luZGV4XTtcbiAgICBjb25zb2xlLmxvZyhmb29kTG9nSW5kZXgpO1xuICAgIGxldCBmb29kTG9nSWQgPSBmb29kTG9nLmZvb2RfbG9nX2lkO1xuICAgIGxldCB1bml0SWQgPSBmb29kTG9nLnVuaXRfb3B0aW9uW2Zvb2RMb2cuc2VsZWN0ZWRQb3J0aW9uSW5kZXhdLnVuaXRfaWQ7XG4gICAgbGV0IHJlcSA9IHsgZm9vZF9sb2dfaWQ6IGZvb2RMb2dJZCwgdW5pdF9pZDogdW5pdElkLCBhbW91bnQ6IGFtb3VudFZhbHVlIH07XG4gICAgY29uc29sZS5sb2cocmVxKTtcbiAgICB3ZWJBUEkuVXBkYXRlRm9vZExvZyhyZXEpLnRoZW4ocmVzcCA9PiB7IHRoaXMucGFyc2VNZWFsRGF0YShyZXNwKTsgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfmm7TmlrDlpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25JbmdyZWRpZW50QW1vdW50Q2hhbmdlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgYW1vdW50VmFsdWUgPSBwYXJzZUludChldmVudC5kZXRhaWwudmFsdWUgKiAxMDApO1xuICAgIGxldCBmb29kTG9nSW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuZm9vZEluZGV4O1xuICAgIGxldCBpbmdyZWRpZW50SW5kZXggPSBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5ncmVkaWVudEluZGV4O1xuICAgIGxldCBpbmdyZWRpZW50ID0gdGhpcy5kYXRhLmZvb2RMaXN0W2Zvb2RMb2dJbmRleF0uaW5ncmVkaWVudF9saXN0W2luZ3JlZGllbnRJbmRleF07XG4gICAgbGV0IHJlY2lwZUlkID0gaW5ncmVkaWVudC5yZWNpcGVfZGV0YWlsc19pZDtcbiAgICBsZXQgdW5pdElkID0gaW5ncmVkaWVudC51bml0X29wdGlvbltpbmdyZWRpZW50LnNlbGVjdGVkUG9ydGlvbkluZGV4XS51bml0X2lkO1xuICAgIGxldCByZXEgPSB7IHJlY2lwZV9pdGVtX2lkOiByZWNpcGVJZCwgdW5pdF9pZDogdW5pdElkLCBhbW91bnQ6IGFtb3VudFZhbHVlIH07XG4gICAgd2ViQVBJLlVwZGF0ZVJlY2lwZUl0ZW0ocmVxKS50aGVuKHJlc3AgPT4geyB0aGlzLnBhcnNlTWVhbERhdGEocmVzcCk7IH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBjb250ZW50OiAn5pu05paw5aSx6LSlJyxcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbn1cblxuUGFnZShuZXcgRm9vZERldGFpbCgpKSJdfQ==