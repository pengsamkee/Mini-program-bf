import request from './../../../api/app/interface';

class ConfirmMeal {

    public data= {
        mealId: 20646,
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
        unitArr:[
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
        showPicker:false,
        columns:[],
        pickerIndex:null,
        chooseUnitIndex:'',
        persons:['我自己独自一人','2人用餐','3人用餐','4人用餐','5人用餐','6人用餐'],
        choosePersonNumIndex:0,
        totalEnergy:0,
    }
    public onLoad(options){
        // let mealInfo = JSON.parse(options.jsonMealInfo);
        // (this as any).setData({mealInfo:mealInfo},()=>{
        //     console.log(this.data.mealInfo)
        // })
        this.getFoodUnitOptionList();
    }
     /**
     * 展示picker，选择食物单位
     */
    public handleShowPicker(e:any){
        const pickerIndex = e.currentTarget.dataset.pickerIndex;
        if(pickerIndex==='person'){ //共有几个人食用
            const columns = [1,2,3,4,5,6]
        }else{
            const columns = this.data.unitArr[pickerIndex].unitOption.map(item=>item.unitName)
        }
        (this as any).setData({
            columns:columns,
            pickerIndex:pickerIndex,
            showPicker:true,
            showPopup:false
        })
    }
    public onConfirm(){
        (this as any).setData({showPicker:false,showPopup:true})
    }
    public onChange(e:any){
        const chooseUnitIndex:number = e.detail.index;
        if(this.data.pickerIndex==='person'){
            (this as any).setData({choosePersonNumIndex : chooseUnitIndex},()=>{
                console.log('choosePersonNumIndex===',this.data.choosePersonNumIndex)
            })
        }else{
            this.data.unitArr[this.data.pickerIndex].chooseUnitIndex = chooseUnitIndex;
            (this as any).setData({unitArr:this.data.unitArr},()=>{
                this.totalEnergy()
            })
        }
    }
    /**
     * 请求所有单位，以供picker使用
     */
    public getFoodUnitOptionList(){
        const req = this.data.taggs.map(item=>{
            return {
                foodId:item.foodId,
                foodType:item.foodType
            }
        })
        request.getFoodUnitOptionList({foodUnitOptionList:req}).then(res=>{
            res.map(item=>{
                item.chooseUnitIndex = 0
                item.amount = 100
            });
            let unitArr = [...res];
            (this as any).setData({ unitArr:unitArr },()=>{
                this.totalEnergy()
            })
        }).catch(err=>{
            wx.showToast({title:err.msg,icon:'none'})
        })
    }
    /**
     * 用户输入分量
     */
    public handleAmountInput(e:any){
        const inputIndex = e.currentTarget.dataset.inputIndex;
        let { value } = e.detail;
        value = parseInt(value);
        this.data.unitArr[inputIndex].amount = 100*value;
        (this as any).setData({unitArr:this.data.unitArr},()=>{
            this.totalEnergy()
        })
    }
    public handleAmountInputFocus(e:any){
        const inputIndex = e.currentTarget.dataset.inputIndex;
        let item = this.data.unitArr[inputIndex];
        item.focusAmount = item.amount;
        item.amount = 0;
        (this as any).setData({unitArr:this.data.unitArr})
    }
    public handleAmountInputBlur(e:any){
        const inputIndex = e.currentTarget.dataset.inputIndex;
        let item = this.data.unitArr[inputIndex];
        if(item.amount==0){
            debugger
            item.amount = item.focusAmount;
            (this as any).setData({unitArr:this.data.unitArr})
        }
    }
    /**
     * 计算热量总值
     */
    public totalEnergy(){
        let unitArr = this.data.unitArr
        let totalEnergy = unitArr.reduce((pre,next)=>{
            return next.amount/100 * next.unitOption[next.chooseUnitIndex].energy+pre
        },0);
        totalEnergy = Math.round(totalEnergy);
        (this as any).setData({totalEnergy:totalEnergy})
    }
}

Page(new ConfirmMeal());