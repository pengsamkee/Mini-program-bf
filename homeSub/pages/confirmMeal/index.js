"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interface_1 = require("./../../../api/app/interface");
var ConfirmMeal = (function () {
    function ConfirmMeal() {
        this.data = {
            mealId: 20646,
            taggs: [{
                    bboxH: 100,
                    bboxW: 91,
                    bboxX: 0,
                    bboxY: 193,
                    foodId: 12,
                    foodName: "牛奶椰丝小方糕",
                    foodType: 2,
                    isDeleted: false,
                    resultList: [
                        { foodId: 836, foodName: "牛奶椰丝小方糕", foodType: 1 },
                        { foodId: 456, foodType: 2, foodName: "橙", score: 1 },
                        { foodId: 492, foodType: 2, foodName: "哈密瓜", score: 1 },
                        { foodId: 1321, foodType: 2, foodName: "橙汁", score: 0 },
                        { foodId: 1322, foodType: 2, foodName: "柠檬汽水", score: 0 },
                        { foodId: 362, foodType: 2, foodName: "长把梨", score: 0 },
                        { foodId: 454, foodType: 2, foodName: "中华猕猴桃[毛叶猕猴桃,奇异果]", score: 0 }
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
                        { foodId: 830, foodName: "牛奶雪糕", foodType: 1 },
                        { foodId: 220, foodType: 1, foodName: "香油鸡蛋羹", score: 33 },
                        { foodId: 5, foodType: 1, foodName: "紫菜蛋汤", score: 26 },
                        { foodId: 300, foodType: 1, foodName: "豆腐海带汤", score: 26 },
                        { foodId: 162, foodType: 1, foodName: "大饼", score: 14 },
                        { foodId: 244, foodType: 1, foodName: "玉米面饼", score: 14 },
                        { foodId: 671, foodType: 1, foodName: "清炖鸡", score: 5 }
                    ],
                    selectedPos: 0,
                    showDeleteBtn: false,
                    tagHeight: 65,
                    tagX: 306.7,
                    tagY: 144.7,
                }],
            unitArr: [
                {
                    "foodName": "面条",
                    "foodId": 12,
                    "foodType": 2,
                    "unitOption": [
                        {
                            unitName: "100克",
                            "unitWeight": 100,
                            "unitId": 263,
                            "energy": 286.0,
                            "energyUnit": "千卡"
                        },
                        {
                            unitName: "份",
                            "unitWeight": 100,
                            "unitId": 809,
                            "energy": 286.0,
                            "energyUnit": "千卡"
                        },
                        {
                            unitName: "碗",
                            "unitWeight": 350,
                            "unitId": 262,
                            "energy": 1001.0,
                            "energyUnit": "千卡"
                        }
                    ]
                },
                {
                    "foodName": "富强粉切面",
                    "foodId": 14,
                    "foodType": 2,
                    "unitOption": [
                        {
                            "unitName": "100克",
                            "unitWeight": 100,
                            "unitId": 52,
                            "energy": 277.0,
                            "energyUnit": "千卡"
                        },
                        {
                            "unitName": "份",
                            "unitWeight": 100,
                            "unitId": 708,
                            "energy": 277.0,
                            "energyUnit": "千卡"
                        },
                        {
                            "unitName": "小饭碗",
                            "unitWeight": 200,
                            "unitId": 3,
                            "energy": 554.0,
                            "energyUnit": "千卡"
                        },
                        {
                            "unitName": "拳头大小",
                            "unitWeight": 110,
                            "unitId": 2,
                            "energy": 304.7,
                            "energyUnit": "千卡"
                        },
                        {
                            "unitName": "鸡蛋大小",
                            "unitWeight": 50,
                            "unitId": 1,
                            "energy": 138.5,
                            "energyUnit": "千卡"
                        }
                    ]
                }
            ],
            showPicker: false,
            columns: [],
            pickerIndex: null,
            chooseUnitIndex: '',
            persons: ['我自己独自一人', '2人用餐', '3人用餐', '4人用餐', '5人用餐', '6人用餐'],
            choosePersonNumIndex: 0,
            totalEnergy: 0,
        };
    }
    ConfirmMeal.prototype.onLoad = function (options) {
        this.getFoodUnitOptionList();
    };
    ConfirmMeal.prototype.handleShowPicker = function (e) {
        var pickerIndex = e.currentTarget.dataset.pickerIndex;
        if (pickerIndex === 'person') {
            var columns = [1, 2, 3, 4, 5, 6];
        }
        else {
            var columns = this.data.unitArr[pickerIndex].unitOption.map(function (item) { return item.unitName; });
        }
        this.setData({
            columns: columns,
            pickerIndex: pickerIndex,
            showPicker: true,
            showPopup: false
        });
    };
    ConfirmMeal.prototype.onConfirm = function () {
        this.setData({ showPicker: false, showPopup: true });
    };
    ConfirmMeal.prototype.onChange = function (e) {
        var _this = this;
        var chooseUnitIndex = e.detail.index;
        if (this.data.pickerIndex === 'person') {
            this.setData({ choosePersonNumIndex: chooseUnitIndex }, function () {
                console.log('choosePersonNumIndex===', _this.data.choosePersonNumIndex);
            });
        }
        else {
            this.data.unitArr[this.data.pickerIndex].chooseUnitIndex = chooseUnitIndex;
            this.setData({ unitArr: this.data.unitArr }, function () {
                _this.totalEnergy();
            });
        }
    };
    ConfirmMeal.prototype.getFoodUnitOptionList = function () {
        var _this = this;
        var req = this.data.taggs.map(function (item) {
            return {
                foodId: item.foodId,
                foodType: item.foodType
            };
        });
        interface_1.default.getFoodUnitOptionList({ foodUnitOptionList: req }).then(function (res) {
            res.map(function (item) {
                item.chooseUnitIndex = 0;
                item.amount = 100;
            });
            var unitArr = res.slice();
            _this.setData({ unitArr: unitArr }, function () {
                _this.totalEnergy();
            });
        }).catch(function (err) {
            wx.showToast({ title: err.msg, icon: 'none' });
        });
    };
    ConfirmMeal.prototype.handleAmountInput = function (e) {
        var _this = this;
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var value = e.detail.value;
        value = parseInt(value);
        this.data.unitArr[inputIndex].amount = 100 * value;
        this.setData({ unitArr: this.data.unitArr }, function () {
            _this.totalEnergy();
        });
    };
    ConfirmMeal.prototype.handleAmountInputFocus = function (e) {
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var item = this.data.unitArr[inputIndex];
        item.focusAmount = item.amount;
        item.amount = 0;
        this.setData({ unitArr: this.data.unitArr });
    };
    ConfirmMeal.prototype.handleAmountInputBlur = function (e) {
        var inputIndex = e.currentTarget.dataset.inputIndex;
        var item = this.data.unitArr[inputIndex];
        if (item.amount == 0) {
            debugger;
            item.amount = item.focusAmount;
            this.setData({ unitArr: this.data.unitArr });
        }
    };
    ConfirmMeal.prototype.totalEnergy = function () {
        var unitArr = this.data.unitArr;
        var totalEnergy = unitArr.reduce(function (pre, next) {
            return next.amount / 100 * next.unitOption[next.chooseUnitIndex].energy + pre;
        }, 0);
        totalEnergy = Math.round(totalEnergy);
        this.setData({ totalEnergy: totalEnergy });
    };
    return ConfirmMeal;
}());
Page(new ConfirmMeal());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBEQUFtRDtBQUVuRDtJQUFBO1FBRVcsU0FBSSxHQUFFO1lBQ1QsTUFBTSxFQUFFLEtBQUs7WUFDYixLQUFLLEVBQUMsQ0FBQztvQkFDSCxLQUFLLEVBQUUsR0FBRztvQkFDVixLQUFLLEVBQUUsRUFBRTtvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLLEVBQUUsR0FBRztvQkFDVixNQUFNLEVBQUUsRUFBRTtvQkFDVixRQUFRLEVBQUUsU0FBUztvQkFDbkIsUUFBUSxFQUFFLENBQUM7b0JBQ1gsU0FBUyxFQUFFLEtBQUs7b0JBQ2hCLFVBQVUsRUFBRTt3QkFDUixFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDO3dCQUMvQyxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7d0JBQ25ELEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQzt3QkFDckQsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO3dCQUNyRCxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7d0JBQ3ZELEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQzt3QkFDckQsRUFB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WUFDZCxRQUFRLENBQUE7WUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFDLE9BQU8sRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUE7U0FDckQ7SUFDTCxDQUFDO0lBSU0saUNBQVcsR0FBbEI7UUFDSSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUMvQixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFDLElBQUk7WUFDdEMsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEdBQUMsR0FBRyxDQUFBO1FBQzdFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNMLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQUFDLEFBMU9ELElBME9DO0FBRUQsSUFBSSxDQUFDLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0IGZyb20gJy4vLi4vLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnO1xuXG5jbGFzcyBDb25maXJtTWVhbCB7XG5cbiAgICBwdWJsaWMgZGF0YT0ge1xuICAgICAgICBtZWFsSWQ6IDIwNjQ2LFxuICAgICAgICB0YWdnczpbe1xuICAgICAgICAgICAgYmJveEg6IDEwMCxcbiAgICAgICAgICAgIGJib3hXOiA5MSxcbiAgICAgICAgICAgIGJib3hYOiAwLFxuICAgICAgICAgICAgYmJveFk6IDE5MyxcbiAgICAgICAgICAgIGZvb2RJZDogMTIsXG4gICAgICAgICAgICBmb29kTmFtZTogXCLniZvlpbbmpLDkuJ3lsI/mlrnns5VcIixcbiAgICAgICAgICAgIGZvb2RUeXBlOiAyLFxuICAgICAgICAgICAgaXNEZWxldGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc3VsdExpc3Q6IFtcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiA4MzYsIGZvb2ROYW1lOiBcIueJm+WltuaksOS4neWwj+aWueezlVwiLCBmb29kVHlwZTogMX0sXG4gICAgICAgICAgICAgICAge2Zvb2RJZDogNDU2LCBmb29kVHlwZTogMiwgZm9vZE5hbWU6IFwi5qmZXCIsIHNjb3JlOiAxfSxcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiA0OTIsIGZvb2RUeXBlOiAyLCBmb29kTmFtZTogXCLlk4jlr4bnk5xcIiwgc2NvcmU6IDF9LFxuICAgICAgICAgICAgICAgIHtmb29kSWQ6IDEzMjEsIGZvb2RUeXBlOiAyLCBmb29kTmFtZTogXCLmqZnmsYFcIiwgc2NvcmU6IDB9LFxuICAgICAgICAgICAgICAgIHtmb29kSWQ6IDEzMjIsIGZvb2RUeXBlOiAyLCBmb29kTmFtZTogXCLmn6Dmqqzmsb3msLRcIiwgc2NvcmU6IDB9LFxuICAgICAgICAgICAgICAgIHtmb29kSWQ6IDM2MiwgZm9vZFR5cGU6IDIsIGZvb2ROYW1lOiBcIumVv+aKiuaiqFwiLCBzY29yZTogMH0sXG4gICAgICAgICAgICAgICAge2Zvb2RJZDogNDU0LCBmb29kVHlwZTogMiwgZm9vZE5hbWU6IFwi5Lit5Y2O54yV54y05qGDW+avm+WPtueMleeMtOahgyzlpYflvILmnpxdXCIsIHNjb3JlOiAwfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNlbGVjdGVkUG9zOiAwLFxuICAgICAgICAgICAgc2hvd0RlbGV0ZUJ0bjogZmFsc2UsXG4gICAgICAgICAgICB0YWdIZWlnaHQ6IDk1LFxuICAgICAgICAgICAgdGFnWDogMzMuNzUsXG4gICAgICAgICAgICB0YWdZOiAxODIuMjUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJib3hIOiAxNzgsXG4gICAgICAgICAgICBiYm94VzogMjAxLFxuICAgICAgICAgICAgYmJveFg6IDMwOSxcbiAgICAgICAgICAgIGJib3hZOiAxMDQsXG4gICAgICAgICAgICBmb29kSWQ6IDE0LFxuICAgICAgICAgICAgZm9vZE5hbWU6IFwi54mb5aW26Zuq57OVXCIsXG4gICAgICAgICAgICBmb29kVHlwZTogMixcbiAgICAgICAgICAgIGlzRGVsZXRlZDogZmFsc2UsXG4gICAgICAgICAgICByZXN1bHRMaXN0OiBbXG4gICAgICAgICAgICAgICAge2Zvb2RJZDogODMwLCBmb29kTmFtZTogXCLniZvlpbbpm6rns5VcIiwgZm9vZFR5cGU6IDF9LFxuICAgICAgICAgICAgICAgIHtmb29kSWQ6IDIyMCwgZm9vZFR5cGU6IDEsIGZvb2ROYW1lOiBcIummmeayuem4oeibi+e+uVwiLCBzY29yZTogMzN9LFxuICAgICAgICAgICAgICAgIHtmb29kSWQ6IDUsIGZvb2RUeXBlOiAxLCBmb29kTmFtZTogXCLntKvoj5zom4vmsaRcIiwgc2NvcmU6IDI2fSxcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiAzMDAsIGZvb2RUeXBlOiAxLCBmb29kTmFtZTogXCLosYbohZDmtbfluKbmsaRcIiwgc2NvcmU6IDI2fSxcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiAxNjIsIGZvb2RUeXBlOiAxLCBmb29kTmFtZTogXCLlpKfppbxcIiwgc2NvcmU6IDE0fSxcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiAyNDQsIGZvb2RUeXBlOiAxLCBmb29kTmFtZTogXCLnjonnsbPpnaLppbxcIiwgc2NvcmU6IDE0fSxcbiAgICAgICAgICAgICAgICB7Zm9vZElkOiA2NzEsIGZvb2RUeXBlOiAxLCBmb29kTmFtZTogXCLmuIXngpbpuKFcIiwgc2NvcmU6IDV9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc2VsZWN0ZWRQb3M6IDAsXG4gICAgICAgICAgICBzaG93RGVsZXRlQnRuOiBmYWxzZSxcbiAgICAgICAgICAgIHRhZ0hlaWdodDogNjUsXG4gICAgICAgICAgICB0YWdYOiAzMDYuNyxcbiAgICAgICAgICAgIHRhZ1k6IDE0NC43LFxuICAgICAgICB9XSxcbiAgICAgICAgdW5pdEFycjpbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJmb29kTmFtZVwiOiBcIumdouadoVwiLFxuICAgICAgICAgICAgICAgIFwiZm9vZElkXCI6IDEyLFxuICAgICAgICAgICAgICAgIFwiZm9vZFR5cGVcIjogMixcbiAgICAgICAgICAgICAgICBcInVuaXRPcHRpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bml0TmFtZTogXCIxMDDlhYtcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdFdlaWdodFwiOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRJZFwiOiAyNjMsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVuZXJneVwiOiAyODYuMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5VW5pdFwiOiBcIuWNg+WNoVwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXROYW1lOiBcIuS7vVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0V2VpZ2h0XCI6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdElkXCI6IDgwOSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5XCI6IDI4Ni4wLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lVbml0XCI6IFwi5Y2D5Y2hXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdE5hbWU6IFwi56KXXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRXZWlnaHRcIjogMzUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0SWRcIjogMjYyLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lcIjogMTAwMS4wLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lVbml0XCI6IFwi5Y2D5Y2hXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJmb29kTmFtZVwiOiBcIuWvjOW8uueyieWIh+mdolwiLFxuICAgICAgICAgICAgICAgIFwiZm9vZElkXCI6IDE0LFxuICAgICAgICAgICAgICAgIFwiZm9vZFR5cGVcIjogMixcbiAgICAgICAgICAgICAgICBcInVuaXRPcHRpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXROYW1lXCI6IFwiMTAw5YWLXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRXZWlnaHRcIjogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0SWRcIjogNTIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVuZXJneVwiOiAyNzcuMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5VW5pdFwiOiBcIuWNg+WNoVwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdE5hbWVcIjogXCLku71cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdFdlaWdodFwiOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRJZFwiOiA3MDgsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVuZXJneVwiOiAyNzcuMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5VW5pdFwiOiBcIuWNg+WNoVwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdE5hbWVcIjogXCLlsI/ppa3nopdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidW5pdFdlaWdodFwiOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRJZFwiOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lcIjogNTU0LjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVuZXJneVVuaXRcIjogXCLljYPljaFcIlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXROYW1lXCI6IFwi5ouz5aS05aSn5bCPXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVuaXRXZWlnaHRcIjogMTEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0SWRcIjogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5XCI6IDMwNC43LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lVbml0XCI6IFwi5Y2D5Y2hXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0TmFtZVwiOiBcIum4oeibi+Wkp+Wwj1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0V2VpZ2h0XCI6IDUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bml0SWRcIjogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5lcmd5XCI6IDEzOC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmVyZ3lVbml0XCI6IFwi5Y2D5Y2hXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgc2hvd1BpY2tlcjpmYWxzZSxcbiAgICAgICAgY29sdW1uczpbXSxcbiAgICAgICAgcGlja2VySW5kZXg6bnVsbCxcbiAgICAgICAgY2hvb3NlVW5pdEluZGV4OicnLFxuICAgICAgICBwZXJzb25zOlsn5oiR6Ieq5bex54us6Ieq5LiA5Lq6JywnMuS6uueUqOmkkCcsJzPkurrnlKjppJAnLCc05Lq655So6aSQJywnNeS6uueUqOmkkCcsJzbkurrnlKjppJAnXSxcbiAgICAgICAgY2hvb3NlUGVyc29uTnVtSW5kZXg6MCxcbiAgICAgICAgdG90YWxFbmVyZ3k6MCxcbiAgICB9XG4gICAgcHVibGljIG9uTG9hZChvcHRpb25zKXtcbiAgICAgICAgLy8gbGV0IG1lYWxJbmZvID0gSlNPTi5wYXJzZShvcHRpb25zLmpzb25NZWFsSW5mbyk7XG4gICAgICAgIC8vICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7bWVhbEluZm86bWVhbEluZm99LCgpPT57XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEubWVhbEluZm8pXG4gICAgICAgIC8vIH0pXG4gICAgICAgIHRoaXMuZ2V0Rm9vZFVuaXRPcHRpb25MaXN0KCk7XG4gICAgfVxuICAgICAvKipcbiAgICAgKiDlsZXnpLpwaWNrZXLvvIzpgInmi6npo5/nianljZXkvY1cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFuZGxlU2hvd1BpY2tlcihlOmFueSl7XG4gICAgICAgIGNvbnN0IHBpY2tlckluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQucGlja2VySW5kZXg7XG4gICAgICAgIGlmKHBpY2tlckluZGV4PT09J3BlcnNvbicpeyAvL+WFseacieWHoOS4quS6uumjn+eUqFxuICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFsxLDIsMyw0LDUsNl1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gdGhpcy5kYXRhLnVuaXRBcnJbcGlja2VySW5kZXhdLnVuaXRPcHRpb24ubWFwKGl0ZW09Pml0ZW0udW5pdE5hbWUpXG4gICAgICAgIH1cbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGNvbHVtbnM6Y29sdW1ucyxcbiAgICAgICAgICAgIHBpY2tlckluZGV4OnBpY2tlckluZGV4LFxuICAgICAgICAgICAgc2hvd1BpY2tlcjp0cnVlLFxuICAgICAgICAgICAgc2hvd1BvcHVwOmZhbHNlXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHB1YmxpYyBvbkNvbmZpcm0oKXtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtzaG93UGlja2VyOmZhbHNlLHNob3dQb3B1cDp0cnVlfSlcbiAgICB9XG4gICAgcHVibGljIG9uQ2hhbmdlKGU6YW55KXtcbiAgICAgICAgY29uc3QgY2hvb3NlVW5pdEluZGV4Om51bWJlciA9IGUuZGV0YWlsLmluZGV4O1xuICAgICAgICBpZih0aGlzLmRhdGEucGlja2VySW5kZXg9PT0ncGVyc29uJyl7XG4gICAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe2Nob29zZVBlcnNvbk51bUluZGV4IDogY2hvb3NlVW5pdEluZGV4fSwoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaG9vc2VQZXJzb25OdW1JbmRleD09PScsdGhpcy5kYXRhLmNob29zZVBlcnNvbk51bUluZGV4KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmRhdGEudW5pdEFyclt0aGlzLmRhdGEucGlja2VySW5kZXhdLmNob29zZVVuaXRJbmRleCA9IGNob29zZVVuaXRJbmRleDtcbiAgICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dW5pdEFycjp0aGlzLmRhdGEudW5pdEFycn0sKCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsRW5lcmd5KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6K+35rGC5omA5pyJ5Y2V5L2N77yM5Lul5L6bcGlja2Vy5L2/55SoXG4gICAgICovXG4gICAgcHVibGljIGdldEZvb2RVbml0T3B0aW9uTGlzdCgpe1xuICAgICAgICBjb25zdCByZXEgPSB0aGlzLmRhdGEudGFnZ3MubWFwKGl0ZW09PntcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9vZElkOml0ZW0uZm9vZElkLFxuICAgICAgICAgICAgICAgIGZvb2RUeXBlOml0ZW0uZm9vZFR5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmVxdWVzdC5nZXRGb29kVW5pdE9wdGlvbkxpc3Qoe2Zvb2RVbml0T3B0aW9uTGlzdDpyZXF9KS50aGVuKHJlcz0+e1xuICAgICAgICAgICAgcmVzLm1hcChpdGVtPT57XG4gICAgICAgICAgICAgICAgaXRlbS5jaG9vc2VVbml0SW5kZXggPSAwXG4gICAgICAgICAgICAgICAgaXRlbS5hbW91bnQgPSAxMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHVuaXRBcnIgPSBbLi4ucmVzXTtcbiAgICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHVuaXRBcnI6dW5pdEFyciB9LCgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbEVuZXJneSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KS5jYXRjaChlcnI9PntcbiAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7dGl0bGU6ZXJyLm1zZyxpY29uOidub25lJ30pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOeUqOaIt+i+k+WFpeWIhumHj1xuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVBbW91bnRJbnB1dChlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgeyB2YWx1ZSB9ID0gZS5kZXRhaWw7XG4gICAgICAgIHZhbHVlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICB0aGlzLmRhdGEudW5pdEFycltpbnB1dEluZGV4XS5hbW91bnQgPSAxMDAqdmFsdWU7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dW5pdEFycjp0aGlzLmRhdGEudW5pdEFycn0sKCk9PntcbiAgICAgICAgICAgIHRoaXMudG90YWxFbmVyZ3koKVxuICAgICAgICB9KVxuICAgIH1cbiAgICBwdWJsaWMgaGFuZGxlQW1vdW50SW5wdXRGb2N1cyhlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZGF0YS51bml0QXJyW2lucHV0SW5kZXhdO1xuICAgICAgICBpdGVtLmZvY3VzQW1vdW50ID0gaXRlbS5hbW91bnQ7XG4gICAgICAgIGl0ZW0uYW1vdW50ID0gMDtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt1bml0QXJyOnRoaXMuZGF0YS51bml0QXJyfSlcbiAgICB9XG4gICAgcHVibGljIGhhbmRsZUFtb3VudElucHV0Qmx1cihlOmFueSl7XG4gICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pbnB1dEluZGV4O1xuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuZGF0YS51bml0QXJyW2lucHV0SW5kZXhdO1xuICAgICAgICBpZihpdGVtLmFtb3VudD09MCl7XG4gICAgICAgICAgICBkZWJ1Z2dlclxuICAgICAgICAgICAgaXRlbS5hbW91bnQgPSBpdGVtLmZvY3VzQW1vdW50O1xuICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHt1bml0QXJyOnRoaXMuZGF0YS51bml0QXJyfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiDorqHnrpfng63ph4/mgLvlgLxcbiAgICAgKi9cbiAgICBwdWJsaWMgdG90YWxFbmVyZ3koKXtcbiAgICAgICAgbGV0IHVuaXRBcnIgPSB0aGlzLmRhdGEudW5pdEFyclxuICAgICAgICBsZXQgdG90YWxFbmVyZ3kgPSB1bml0QXJyLnJlZHVjZSgocHJlLG5leHQpPT57XG4gICAgICAgICAgICByZXR1cm4gbmV4dC5hbW91bnQvMTAwICogbmV4dC51bml0T3B0aW9uW25leHQuY2hvb3NlVW5pdEluZGV4XS5lbmVyZ3krcHJlXG4gICAgICAgIH0sMCk7XG4gICAgICAgIHRvdGFsRW5lcmd5ID0gTWF0aC5yb3VuZCh0b3RhbEVuZXJneSk7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7dG90YWxFbmVyZ3k6dG90YWxFbmVyZ3l9KVxuICAgIH1cbn1cblxuUGFnZShuZXcgQ29uZmlybU1lYWwoKSk7Il19