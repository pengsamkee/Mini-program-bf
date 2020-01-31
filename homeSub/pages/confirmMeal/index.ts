let app =  getApp();

import request from './../../../api/app/interface';

class ConfirmMeal {

    public data= {
        imgH:null,
        imgKey:null,
        imgW:null,
        mealDate:null,
        mealType:null,
        taggs:[],
        unitArr:[],
        showPicker:false,
        columns:[],
        pickerIndex:null,
        chooseUnitIndex:'',
        // persons:['我自己独自一人','2人用餐','3人用餐','4人用餐','5人用餐','6人用餐'],
        // choosePersonNumIndex:0,
        totalEnergy:0,
        columnsForWXml:null,
        title:null,
    }
    public onLoad(options){
        let {imgH,imgKey,imgW,mealDate,mealType,taggs,title} = JSON.parse(options.jsonMealInfo);
        (this as any).setData({
            imgH,
            imgKey,
            imgW,
            mealDate,
            mealType,
            taggs,
            title,
        },()=>{
            this.getFoodUnitOptionList();
        })
    }
     /**
     * 展示picker，选择食物单位
     */
    public handleShowPicker(e:any){
        const pickerIndex = e.currentTarget.dataset.pickerIndex;
        // if(pickerIndex==='person'){ //共有几个人食用
        //     const columns = [1,2,3,4,5,6]
        // }else{
            const columns = this.data.unitArr[pickerIndex].unitOption.map(item=>item.unitName);
            const columnsForWXml = this.data.unitArr[pickerIndex].unitOption.map(item=>{
                return item.unitName==='100克'?item.unitName:item.unitName+'（'+item.unitWeight+'克）'
            });
        // }
        (this as any).setData({
            columnsForWXml,
            columns,
            pickerIndex,
            showPicker:true,
            showPopup:false
        })
    }
    public onConfirm(){
        (this as any).setData({showPicker:false,showPopup:true})
    }
    public onChange(e:any){
        const chooseUnitIndex:number = e.detail.index;
        // if(this.data.pickerIndex==='person'){
        //     (this as any).setData({choosePersonNumIndex : chooseUnitIndex})
        // }else{
            this.data.unitArr[this.data.pickerIndex].chooseUnitIndex = chooseUnitIndex;
            (this as any).setData({unitArr:this.data.unitArr},()=>{
                this.totalEnergy()
            })
        // }
    }
    /**
     * 请求所有单位，以供picker使用
     */
    public getFoodUnitOptionList(){
        const foodUnitOptionList = this.data.taggs.map(item=>{
            return {
                foodId:item.foodId,
                foodType:item.foodType
            }
        })
        request.getFoodUnitOptionList({foodUnitOptionList}).then(res=>{
            res.map(item=>{
                item.chooseUnitIndex = 0
                item.amount = 1
            });
            (this as any).setData({ unitArr:res },()=>{
                this.totalEnergy()
            })
        }).catch(err=>{
            wx.showToast({title:err.message,icon:'none'})
        })
    }
    /**
     * 用户输入分量
     */
    public handleAmountInput(e:any){
        const inputIndex = e.currentTarget.dataset.inputIndex;
        let { value } = e.detail;
        this.data.unitArr[inputIndex].amount = value;
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
            return next.amount * next.unitOption[next.chooseUnitIndex].energy+pre
        },0);
        totalEnergy = Math.round(totalEnergy);
        (this as any).setData({totalEnergy:totalEnergy})
    }
    /**
     * 跳转到分量估算页面
     */
    public handleGoWeightReferencePage(){
        wx.navigateTo({ url: './../weightReference/index' })
    }
    /**
     * 发出api请求，确定生成mealLog
     */
    public createMealLog(){
        const {mealDate,mealType,imgKey,imgW,imgH,taggs,title} = this.data;
        taggs.map((item,index)=>{
            const chooseUnitItem = this.data.unitArr[index];
            item.inputType = 1;
            item.amount = chooseUnitItem.amount;
            item.unitId = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitId;
            item.unitWeight = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitWeight;
            item.unitName = chooseUnitItem.unitOption[chooseUnitItem.chooseUnitIndex].unitName;
            item.recognitionResults = [...item.resultList];
            delete item.resultList;
            delete item.selectedPos;
        });
        let req = {
            mealDate,
            mealType,
            imgKey,
            imgW,
            imgH,
            foodInfoList:taggs
        }
        wx.showLoading({  title: '加载中...' });
        request.createMealLog(req).then(res=>{
         
            wx.showToast({title:'食物记录成功'})
            setTimeout(()=>{ 
                wx.reLaunch({url: `./../mealAnalysis/index?mealType=${mealType}&mealDate=${mealDate}&mealLogId=${res.mealLogId}&title=${title}`});
            },1450)
        }).catch(err=>{
            wx.showToast({title:err.message})
        })
    }

}

Page(new ConfirmMeal());