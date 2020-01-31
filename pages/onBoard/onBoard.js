"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var onBoard = (function () {
    function onBoard() {
        this.data = {
            yearDisplay: "yearDisplay",
            datePicker: "datePicker",
            textInputClass: "section",
            pregnantStageCondition: true,
            dueDateCondition: false,
            weightBeforePregnancy: false,
            numberOfPregnancies: false,
            countPage: 0,
            finalPage: false,
            nextPage: false,
            empty: false,
            gender: 0,
            height: 150,
            heightVal: [110],
            heightArr: [],
            weight: 50.5,
            weightVal: [20, 5],
            pointArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            weightArr: [],
            pregnancyStage: '',
            pregStageSelected: 4,
            prePregWeight: 0,
            numPreg: 1,
            todayYear: 0,
            year: '2019',
            month: '10',
            date: '1',
            years: [0],
            months: [9],
            days: [0],
            activityLevel: '',
            activitySelected: 0,
            medical: '',
            medicalselected: 5,
            inputValidate: '请输入你的答案',
            optionsValidate: '请选择你的答案',
            expectedDateValidate: '请在今天到未来45周的日期内选择您的预产期',
            ageValidate: '请确保您的年龄在1-100岁范围内',
            rdiGoal: 2000,
            birthVal: [72],
            pregnancyNumVal: [0],
            birthYears: [],
            birthYear: 1991,
            numPregOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            totalPage: 7,
            currentPage: 1,
            nickName: "",
            avatarUrl: "",
            rdiValue: " ",
        };
        this.lastTime = 0;
        this.rdaUrl = "";
    }
    onBoard.prototype.genderEvent = function (event) {
        this.setData({
            nextPage: true,
            empty: false,
        });
        if (event.target.id == "男") {
            this.setData({
                totalPage: 6,
                gender: 1,
                height: 170,
                heightVal: [130],
            });
        }
        else {
            this.setData({
                totalPage: 7,
                gender: 2,
                height: 150,
                heightVal: [110],
            });
        }
    };
    onBoard.prototype.onLoad = function () {
        wx.setNavigationBarTitle({
            title: "基本信息"
        });
        var today = new Date();
        this.setBirthYearPicker(today);
        this.setDueDatePicker(today);
        this.initHeightArr();
        this.initWeightArr();
    };
    onBoard.prototype.setDueDatePicker = function (today) {
        var dueYear = [];
        var dueMonth = [];
        var dueDays = [];
        for (var i = today.getFullYear(); i <= today.getFullYear() + 2; i++) {
            dueYear.push(i);
        }
        for (var i = 1; i <= 12; i++) {
            dueMonth.push(i);
        }
        for (var i = 1; i <= 31; i++) {
            dueDays.push(i);
        }
        this.setData({ years: dueYear, months: dueMonth, days: dueDays });
    };
    onBoard.prototype.setBirthYearPicker = function (today) {
        this.setData({ countPage: this.data.countPage + 1, todayYear: today.getFullYear() - 1 });
        var years = [];
        for (var i = 1919; i <= today.getFullYear() - 1; i++) {
            years.push(i);
        }
        this.setData({ birthYears: years });
    };
    onBoard.prototype.initHeightArr = function () {
        var heightArr = [];
        for (var i = 40; i <= 230; i++) {
            heightArr.push(i);
        }
        this.setData({
            heightArr: heightArr
        });
    };
    onBoard.prototype.initWeightArr = function () {
        var weightArr = [];
        for (var i = 30; i <= 200; i += 1) {
            var num = i + '.';
            weightArr.push(num);
        }
        this.setData({
            weightArr: weightArr
        });
    };
    onBoard.prototype.focusInput = function (event) {
        this.setData({ textInputClass: "section-input" });
    };
    onBoard.prototype.bindHeightSelect = function (event) {
        var val = event.detail.value[0];
        var height = this.data.heightArr[val];
        this.setData({
            yearDisplay: "yearDisplay-input",
            height: height,
            heightVal: [val],
            nextPage: true,
            empty: false,
        });
    };
    onBoard.prototype.bindWeightSelect = function (event) {
        var value = event.detail.value;
        var _a = this.data, pointArr = _a.pointArr, weightArr = _a.weightArr;
        var units = weightArr[value[0]];
        var point = pointArr[value[1]];
        this.setData({
            weight: units + point,
            weightVal: [value[0], value[1]],
            yearDisplay: "yearDisplay-input",
            nextPage: true,
            empty: false,
        });
    };
    onBoard.prototype.bindAgeInput = function (event) {
        var val = event.detail.value;
        var birthYear = this.data.birthYears[val];
        var age = this.data.todayYear - birthYear;
        this.setData({ yearDisplay: "yearDisplay-input" });
        if (age >= 1 && age <= 100) {
            this.setData({
                birthYear: birthYear,
                nextPage: true,
                empty: false,
            });
        }
        else {
            this.setData({
                birthYear: birthYear,
                nextPage: false,
                empty: false
            });
        }
    };
    onBoard.prototype.getWeightInfo = function () {
        console.log('=============================================================================================================================');
        var _a = this.data, height = _a.height, weightArr = _a.weightArr;
        var bmiWeight = Math.round(height / 100 * height / 100 * 21 * 10) / 10;
        var unit = Math.floor(bmiWeight) - parseInt(weightArr[0]);
        var point = bmiWeight * 10 % 10;
        this.setData({
            weight: bmiWeight,
            weightVal: [unit, point]
        });
    };
    onBoard.prototype.nextSubmit = function () {
        var nowTime = new Date().getTime();
        if (nowTime - this.lastTime > 1000) {
            this.lastTime = nowTime;
        }
        else {
            this.lastTime = nowTime;
            wx.showToast({
                title: '请认真填写',
                icon: 'none',
                duration: 1000
            });
            return false;
        }
        if (this.data.dueDateCondition) {
            var moment = require('moment');
            var expectedBirthDate = moment([Number(this.data.year), Number(this.data.month) - 1, Number(this.data.date)]) / 1000;
            var today = moment() / 1000;
            if (today > expectedBirthDate) {
                this.setData({ empty: true });
                return;
            }
        }
        this.setData({
            textInputClass: "section",
            datePicker: "datePicker"
        });
        if (this.data.nextPage == true) {
            this.setData({
                countPage: this.data.countPage + 1,
                currentPage: this.data.currentPage + 1
            });
            console.log('this.data.countPage', this.data.countPage);
            if (this.data.countPage === 3) {
                this.getWeightInfo();
            }
            this.onChange();
        }
        else {
            this.setData({ empty: true });
        }
        if (this.data.countPage == 11) {
            this.sendDatas();
        }
    };
    onBoard.prototype.bindDateChange = function (event) {
        var val = event.detail.value;
        this.setData({
            datePicker: "datePicker-input",
            year: this.data.years[val[0]],
            month: this.data.months[val[1]],
            date: this.data.days[val[2]],
            nextPage: true, empty: false
        });
    };
    onBoard.prototype.bindBeforePregWeightInput = function (event) {
        this.focusInput(event);
        var preWeightInput = event.detail.value;
        if (preWeightInput != null && preWeightInput != "") {
            this.setData({
                prePregWeight: preWeightInput,
                nextPage: true,
                empty: false
            });
        }
        else {
            this.setData({
                prePregWeight: 0,
                nextPage: false,
                empty: false
            });
            if (preWeightInput == "") {
                this.setData({ textInputClass: "section" });
            }
        }
    };
    onBoard.prototype.bindNumPregInput = function (event) {
        var numPreg = event.detail.value;
        if (numPreg == null) {
            this.setData({
                numPreg: 0,
                nextPage: true,
                empty: false
            });
        }
        else {
            this.setData({
                numPreg: Number(numPreg) + 1,
                nextPage: true,
                empty: false
            });
        }
    };
    onBoard.prototype.setGenderForms = function () {
        if (this.data.birthYear < 2003 && this.data.gender == 2) {
            this.setData({
                pregnantStageCondition: true,
                totalPage: 7,
            });
            this.setData({ countPage: this.data.countPage + 1 });
        }
        else {
            this.setData({
                pregnantStageCondition: false,
                countPage: this.data.countPage + 4,
                totalPage: 6,
            });
        }
    };
    onBoard.prototype.onChange = function () {
        if (this.data.countPage !== 4 && this.data.countPage !== 8 && this.data.countPage !== 2 && this.data.countPage !== 3) {
            this.setData({ nextPage: false });
        }
        if (this.data.countPage == 5) {
            this.setGenderForms();
        }
        this.handlePregnancyStageOptionsForms();
        this.handlePregnantFemaleForms();
    };
    onBoard.prototype.handlePregnantFemaleForms = function () {
        if (this.data.countPage == 7) {
            this.setData({ dueDateCondition: false, weightBeforePregnancy: true });
        }
        else if (this.data.countPage == 8) {
            this.setData({ dueDateCondition: false, weightBeforePregnancy: false, numberOfPregnancies: true });
        }
        else {
            this.setData({ weightBeforePregnancy: false, numberOfPregnancies: false });
        }
    };
    onBoard.prototype.handlePregnancyStageOptionsForms = function () {
        if (this.data.pregnancyStage == '怀孕期' && this.data.pregnantStageCondition == true && this.data.dueDateCondition == false) {
            this.setData({ dueDateCondition: true, countPage: this.data.countPage - 1, totalPage: 10 });
        }
        else if (this.data.pregnantStageCondition == true && (this.data.pregnancyStage == '备孕期' || this.data.pregnancyStage == '哺乳期' || this.data.pregnancyStage == '都不是')) {
            this.setData({
                pregnantStageCondition: false,
                dueDateCondition: false,
                countPage: this.data.countPage + 2,
                totalPage: 7
            });
        }
        else if (this.data.pregnancyStage == '怀孕期' && this.data.pregnantStageCondition == true && this.data.dueDateCondition == true) {
            this.setData({ countPage: this.data.countPage, pregnantStageCondition: false, dueDateCondition: false });
        }
    };
    onBoard.prototype.pregnancyStageEvent = function (event) {
        if (event.target.id == 1) {
            this.setData({ pregnancyStage: '备孕期', pregStageSelected: 1, totalPage: 7 });
        }
        else if (event.target.id == 2) {
            this.setData({ pregnancyStage: '怀孕期', pregStageSelected: 2, totalPage: 10 });
        }
        else if (event.target.id == 3) {
            this.setData({ pregnancyStage: '哺乳期', pregStageSelected: 3, totalPage: 7 });
        }
        else if (event.target.id == 0) {
            this.setData({ pregnancyStage: '都不是', pregStageSelected: 0, totalPage: 7 });
        }
        this.setData({ nextPage: true, empty: false });
    };
    onBoard.prototype.activityLevelEvent = function (event) {
        if (event.target.id == 1) {
            this.setData({ activityLevel: '卧床休息', activitySelected: 1 });
        }
        else if (event.target.id == 2) {
            this.setData({ activityLevel: '轻度，静坐少动', activitySelected: 2 });
        }
        else if (event.target.id == 3) {
            this.setData({ activityLevel: '中度，常常走动', activitySelected: 3 });
        }
        else if (event.target.id == 4) {
            this.setData({ activityLevel: '重度，负重', activitySelected: 4 });
        }
        else if (event.target.id == 5) {
            this.setData({ activityLevel: '剧烈，超负重', activitySelected: 5 });
        }
        this.setData({ nextPage: true, empty: false });
    };
    onBoard.prototype.medicalCondition = function (event) {
        if (event.target.id == 1) {
            this.setData({ medical: '糖尿病', medicalselected: 1 });
        }
        else if (event.target.id == 2) {
            this.setData({ medical: '甲状腺功能亢进症', medicalselected: 2 });
        }
        else if (event.target.id == 0) {
            this.setData({ medical: '无', medicalselected: 0 });
        }
        this.setData({ finalPage: true, nextPage: true, empty: false });
    };
    onBoard.prototype.getRDIGoal = function () {
        var _this = this;
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        webAPI.RetrieveUserRDA({}).then(function (resp) {
            _this.rdaUrl = resp.rda_url;
            if (_this.rdaUrl !== "") {
                wx.reLaunch({
                    url: '/pages/rdiPage/rdiPage?url=' + _this.rdaUrl,
                });
            }
        }).catch(function (err) { return console.log(err); });
        webAPI.RetrieveRecommendedDailyAllowance({}).then(function (resp) {
            wx.hideLoading({});
            var energy = resp.energy;
            _this.setData({
                rdiValue: Math.floor(energy / 100)
            });
        }).catch(function (err) { return console.log(err); });
    };
    onBoard.prototype.redirectToRDAPage = function () {
        if (this.rdaUrl !== "") {
            wx.navigateTo({
                url: '/pages/rdiPage/rdiPage?url=' + this.rdaUrl,
            });
        }
    };
    onBoard.prototype.sendDatas = function () {
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        webAPI.SetAuthToken(token);
        var that = this;
        var gender = Number(that.data.gender);
        var birthYear = Number(that.data.birthYear);
        var height = Number(that.data.height);
        var weight = Number(that.data.weight);
        var weightBeforePreg = Number(that.data.prePregWeight);
        var activitySelected = Number(that.data.activitySelected);
        var pregStageSelected = Number(that.data.pregStageSelected);
        var medicalCondition = Number(that.data.medicalselected);
        if (pregStageSelected < 0 || pregStageSelected > 3) {
            pregStageSelected = 0;
        }
        var preg_birth_date = this.data.year + "-" + this.data.month + "-" + this.data.date;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            var userInfo = res.userInfo;
                            var nickName = userInfo.nickName;
                            var avatarUrl = userInfo.avatarUrl;
                            var moment = require('moment');
                            var updateUserProfileReq = {
                                gender: gender,
                                year_of_birth: birthYear,
                                height: height,
                                weight: weight,
                                weight_before_pregnancy: weightBeforePreg,
                                activity_level: activitySelected,
                                pregnancy_stage: pregStageSelected,
                                expected_birth_date: moment([Number(that.data.year), Number(that.data.month) - 1, Number(that.data.date)]) / 1000,
                                nickname: nickName,
                                avatar_url: avatarUrl,
                                times_of_pregnancy: that.data.numPreg
                            };
                            wx.showLoading({ title: "加载中..." });
                            webAPI.UpdateUserProfile(updateUserProfileReq).then(function (resp) {
                                that.getRDIGoal();
                            }).catch(function (err) {
                                wx.hideLoading({});
                                wx.showModal({
                                    title: '',
                                    content: '更新用户信息失败',
                                    showCancel: false
                                });
                            });
                            var updateMedicalProfileReq = {
                                food_allergy_ids: [],
                                medical_condition_ids: [medicalCondition],
                            };
                            if (medicalCondition != 0) {
                                webAPI.UpdateMedicalProfile(updateMedicalProfileReq);
                            }
                        }
                    });
                }
                else {
                    wx.navigateTo({
                        url: '../login/index?user_status=2'
                    });
                }
            }
        });
        wx.reportAnalytics('onboard_last_step', {
            counts: 'counts',
        });
    };
    onBoard.prototype.confirmSubmit = function () {
        wx.reLaunch({
            url: "../../pages/home/index",
        });
    };
    onBoard.prototype.preButton234 = function () {
        if (this.data.countPage == 2) {
            this.setData({
                countPage: this.data.countPage - 1,
                currentPage: this.data.currentPage - 1,
                gender: 0,
                nextPage: false,
                empty: false,
            });
        }
        if (this.data.countPage == 3) {
            this.setData({
                countPage: this.data.countPage - 1,
                currentPage: this.data.currentPage - 1,
                nextPage: true,
                empty: false,
                yearDisplay: 'yearDisplay',
            });
        }
        if (this.data.countPage == 4) {
            this.setData({
                countPage: this.data.countPage - 1,
                currentPage: this.data.currentPage - 1,
                nextPage: true,
                empty: false,
                yearDisplay: 'yearDisplay',
            });
        }
    };
    onBoard.prototype.preButtonPregnantAndNotDue = function () {
        this.setData({
            countPage: this.data.countPage - 2,
            currentPage: this.data.currentPage - 1,
            nextPage: true,
            empty: false,
            birthYear: 1991,
            yearDisplay: "yearDisplay",
            pregnantStageCondition: true,
            pregnancyStage: '',
            pregStageSelected: 4,
        });
    };
    onBoard.prototype.preButtonDueDateCondition = function () {
        this.setData({
            countPage: this.data.countPage,
            currentPage: this.data.currentPage - 1,
            nextPage: false,
            empty: false,
            totalPage: 7,
            dueDateCondition: false,
            datePicker: "datePicker",
            year: '2019',
            month: '10',
            date: '1',
            pregnantStageCondition: true,
            pregnancyStage: '',
            pregStageSelected: 4,
        });
    };
    onBoard.prototype.weightBeforePregnancyBack = function () {
        this.setData({
            countPage: this.data.countPage - 1,
            currentPage: this.data.currentPage - 1,
            nextPage: true,
            empty: false,
            prePregWeight: 0,
            dueDateCondition: true,
            weightBeforePregnancy: false,
            datePicker: "datePicker",
            year: '2019',
            month: '10',
            date: '1',
        });
    };
    onBoard.prototype.numberOfPregnanciesPre = function () {
        this.setData({
            countPage: this.data.countPage - 1,
            currentPage: this.data.currentPage - 1,
            nextPage: false,
            empty: false,
            numPreg: 1,
            dueDateCondition: false,
            weightBeforePregnancy: true,
            numberOfPregnancies: false,
            prePregWeight: 0,
        });
    };
    onBoard.prototype.preButton9 = function () {
        if (this.data.gender === 1) {
            this.setData({
                countPage: this.data.countPage - 5,
                currentPage: this.data.currentPage - 1,
                nextPage: true,
                empty: false,
                activityLevel: '',
                activitySelected: 0,
                birthYear: 1991,
                yearDisplay: "yearDisplay",
            });
        }
        else {
            if (this.data.birthYear >= 2003) {
                this.setData({
                    countPage: this.data.countPage - 5,
                    currentPage: this.data.currentPage - 1,
                    nextPage: false,
                    empty: false,
                    totalPage: 7,
                    activityLevel: '',
                    activitySelected: 0,
                    birthYear: 1991,
                    yearDisplay: "yearDisplay",
                });
            }
            else {
                if (this.data.pregnancyStage == '怀孕期') {
                    this.setData({
                        countPage: this.data.countPage - 1,
                        currentPage: this.data.currentPage - 1,
                        nextPage: false,
                        empty: false,
                        activityLevel: '',
                        activitySelected: 0,
                        numberOfPregnancies: true,
                        numPreg: 1,
                    });
                }
                else {
                    this.setData({
                        countPage: this.data.countPage - 3,
                        currentPage: this.data.currentPage - 1,
                        nextPage: false,
                        empty: false,
                        activityLevel: '',
                        activitySelected: 0,
                        pregnantStageCondition: true,
                        dueDateCondition: false,
                        pregnancyStage: '',
                        pregStageSelected: 4,
                    });
                }
            }
        }
    };
    onBoard.prototype.preButton10 = function () {
        this.setData({
            countPage: this.data.countPage - 1,
            currentPage: this.data.currentPage - 1,
            nextPage: false,
            empty: false,
            medical: '',
            medicalselected: 5,
            activityLevel: '',
            activitySelected: 0,
        });
    };
    return onBoard;
}());
Page(new onBoard());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25Cb2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9uQm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QixpREFBbUQ7QUFFbkQsaURBQWtEO0FBR2xEO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixXQUFXLEVBQUUsYUFBYTtZQUMxQixVQUFVLEVBQUUsWUFBWTtZQUN4QixjQUFjLEVBQUUsU0FBUztZQUN6QixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIscUJBQXFCLEVBQUUsS0FBSztZQUM1QixtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLFNBQVMsRUFBRSxDQUFDO1lBQ1osU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxFQUFFLEdBQUc7WUFDWCxTQUFTLEVBQUMsQ0FBQyxHQUFHLENBQUM7WUFDZixTQUFTLEVBQUUsRUFBRTtZQUNiLE1BQU0sRUFBRSxJQUFJO1lBQ1osU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQztZQUNqQixRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsU0FBUyxFQUFDLEVBQUU7WUFDWixjQUFjLEVBQUUsRUFBRTtZQUNsQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1lBQ1YsU0FBUyxFQUFFLENBQUM7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLEdBQUc7WUFDVCxLQUFLLEVBQUUsQ0FBQyxD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LEVBQUUsQ0FBQzt3QkFDbkIsc0JBQXNCLEVBQUMsSUFBSTt3QkFDM0IsZ0JBQWdCLEVBQUMsS0FBSzt3QkFFdEIsY0FBYyxFQUFFLEVBQUU7d0JBQ2xCLGlCQUFpQixFQUFFLENBQUM7cUJBQ3JCLENBQUMsQ0FBQTtpQkFDSDthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBQ00sNkJBQVcsR0FBbEI7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO1lBQ3RDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFDLEtBQUs7WUFFWCxPQUFPLEVBQUUsRUFBRTtZQUNYLGVBQWUsRUFBRSxDQUFDO1lBRWxCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLGdCQUFnQixFQUFFLENBQUM7U0FDcEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNILGNBQUM7QUFBRCxDQUFDLEFBOXZCRCxJQTh2QkM7QUFFRCxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5pbXBvcnQgeyBlcG9jaCB9IGZyb20gJy4uLy4uL3V0aWxzL3V0aWwnXG5cbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0IHsgTWluaVByb2dyYW1Mb2dpbiB9IGZyb20gJy4uLy4uL2FwaS9sb2dpbi9Mb2dpblNlcnZpY2UnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbmltcG9ydCB7IFVwZGF0ZVVzZXJQcm9maWxlUmVxLCBVcGRhdGVNZWRpY2FsUHJvZmlsZSB9IGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZU9ianMnO1xuXG5jbGFzcyBvbkJvYXJkIHtcblxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheVwiLFxuICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiLFxuICAgIHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIixcbiAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiB0cnVlLFxuICAgIGR1ZURhdGVDb25kaXRpb246IGZhbHNlLFxuICAgIHdlaWdodEJlZm9yZVByZWduYW5jeTogZmFsc2UsXG4gICAgbnVtYmVyT2ZQcmVnbmFuY2llczogZmFsc2UsXG4gICAgY291bnRQYWdlOiAwLFxuICAgIGZpbmFsUGFnZTogZmFsc2UsXG4gICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgIGVtcHR5OiBmYWxzZSxcbiAgICBnZW5kZXI6IDAsXG4gICAgaGVpZ2h0OiAxNTAsXG4gICAgaGVpZ2h0VmFsOlsxMTBdLFxuICAgIGhlaWdodEFycjogW10sIC8vIOi6q+mrmOWIneWni+WMluaVsOe7hO+8jOWMheWQqzQwLTIzMFxuICAgIHdlaWdodDogNTAuNSxcbiAgICB3ZWlnaHRWYWw6IFsyMCw1XSxcbiAgICBwb2ludEFycjpbMCwxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAgICB3ZWlnaHRBcnI6W10sXG4gICAgcHJlZ25hbmN5U3RhZ2U6ICcnLFxuICAgIHByZWdTdGFnZVNlbGVjdGVkOiA0LFxuICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgbnVtUHJlZzogMSxcbiAgICB0b2RheVllYXI6IDAsXG4gICAgeWVhcjogJzIwMTknLFxuICAgIG1vbnRoOiAnMTAnLFxuICAgIGRhdGU6ICcxJyxcbiAgICB5ZWFyczogWzBdLFxuICAgIG1vbnRoczogWzldLFxuICAgIGRheXM6IFswXSxcbiAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuICAgIG1lZGljYWw6ICcnLFxuICAgIG1lZGljYWxzZWxlY3RlZDogNSxcbiAgICBpbnB1dFZhbGlkYXRlOiAn6K+36L6T5YWl5L2g55qE562U5qGIJyxcbiAgICBvcHRpb25zVmFsaWRhdGU6ICfor7fpgInmi6nkvaDnmoTnrZTmoYgnLFxuICAgIC8vIGhlaWdodFZhbGlkYXRlOiAn6K+35ZyoNDAtMjMw5Y6Y57Gz6IyD5Zu05YaF6L6T5YWl5oKo55qE6Lqr6auYJyxcbiAgICAvLyB3ZWlnaHRWYWxpZGF0ZTogJ+ivt+WcqDMwLTMwMOWNg+WFi+iMg+WbtOWGhei+k+WFpeaCqOeahOS9k+mHjScsXG4gICAgZXhwZWN0ZWREYXRlVmFsaWRhdGU6ICfor7flnKjku4rlpKnliLDmnKrmnaU0NeWRqOeahOaXpeacn+WGhemAieaLqeaCqOeahOmihOS6p+acnycsXG4gICAgYWdlVmFsaWRhdGU6ICfor7fnoa7kv53mgqjnmoTlubTpvoTlnKgxLTEwMOWygeiMg+WbtOWGhScsXG4gICAgcmRpR29hbDogMjAwMCxcbiAgICBiaXJ0aFZhbDogWzcyXSxcbiAgICBwcmVnbmFuY3lOdW1WYWw6IFswXSxcbiAgICBiaXJ0aFllYXJzOiBbXSxcbiAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgbnVtUHJlZ09wdGlvbnM6IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF0sXG4gICAgdG90YWxQYWdlOiA3LFxuICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgIG5pY2tOYW1lOiBcIlwiLFxuICAgIGF2YXRhclVybDogXCJcIixcbiAgICByZGlWYWx1ZTogXCIgXCIsXG4gIH1cbiAgcHVibGljIGxhc3RUaW1lID0gMDsgLy8g6Zi75q2i55So5oi36L+e57ut5b+r6YCf54K55Ye7XG5cbiAgcHVibGljIHJkYVVybCA9IFwiXCI7XG5cbiAgcHVibGljIGdlbmRlckV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSk7XG5cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IFwi55S3XCIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRvdGFsUGFnZTogNixcbiAgICAgICAgZ2VuZGVyOiAxLFxuICAgICAgICBoZWlnaHQ6MTcwLFxuICAgICAgICBoZWlnaHRWYWw6WzEzMF0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdG90YWxQYWdlOiA3LFxuICAgICAgICBnZW5kZXI6IDIsXG4gICAgICAgIGhlaWdodDoxNTAsXG4gICAgICAgIGhlaWdodFZhbDpbMTEwXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKTogdm9pZCB7XG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuWfuuacrOS/oeaBr1wiXG4gICAgfSk7XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuc2V0QmlydGhZZWFyUGlja2VyKHRvZGF5KTtcbiAgICB0aGlzLnNldER1ZURhdGVQaWNrZXIodG9kYXkpO1xuICAgIHRoaXMuaW5pdEhlaWdodEFycigpO1xuICAgIHRoaXMuaW5pdFdlaWdodEFycigpO1xuICB9XG4gIC8vIFNldCB0aGUgcGlja2VyIG9wdGlvbnMgZm9yIHByZWduYW5jeSBkdWUgZGF0ZVxuICBwdWJsaWMgc2V0RHVlRGF0ZVBpY2tlcih0b2RheTogYW55KTogdm9pZCB7XG4gICAgbGV0IGR1ZVllYXIgPSBbXTtcbiAgICBsZXQgZHVlTW9udGggPSBbXTtcbiAgICBsZXQgZHVlRGF5cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IHRvZGF5LmdldEZ1bGxZZWFyKCk7IGkgPD0gdG9kYXkuZ2V0RnVsbFllYXIoKSArIDI7IGkrKykge1xuICAgICAgZHVlWWVhci5wdXNoKGkpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTI7IGkrKykge1xuICAgICAgZHVlTW9udGgucHVzaChpKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDMxOyBpKyspIHtcbiAgICAgIGR1ZURheXMucHVzaChpKVxuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHllYXJzOiBkdWVZZWFyLCBtb250aHM6IGR1ZU1vbnRoLCBkYXlzOiBkdWVEYXlzIH0pO1xuICB9XG5cbiAgLy8gU2V0IHRoZSBwaWNrZXIgb3B0aW9ucyBmb3IgYmlydGggeWVhclxuICBwdWJsaWMgc2V0QmlydGhZZWFyUGlja2VyKHRvZGF5OiBhbnkpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxLCB0b2RheVllYXI6IHRvZGF5LmdldEZ1bGxZZWFyKCkgLSAxIH0pO1xuXG4gICAgbGV0IHllYXJzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMTkxOTsgaSA8PSB0b2RheS5nZXRGdWxsWWVhcigpIC0gMTsgaSsrKSB7XG4gICAgICB5ZWFycy5wdXNoKGkpO1xuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGJpcnRoWWVhcnM6IHllYXJzIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOW+queOr+iOt+W+l2hlaWdodEFyclxuICAgKi9cbiAgcHVibGljIGluaXRIZWlnaHRBcnIoKXtcbiAgICBsZXQgaGVpZ2h0QXJyOk51bWJlcltdID0gW11cbiAgICBmb3IobGV0IGk9NDA7aTw9MjMwO2krKyl7XG4gICAgICBoZWlnaHRBcnIucHVzaChpKVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgaGVpZ2h0QXJyXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog5b6q546v6I635b6Xd2VpZ2h0QXJyXG4gICAqL1xuICBwdWJsaWMgaW5pdFdlaWdodEFycigpIHtcbiAgICBsZXQgd2VpZ2h0QXJyOiBOdW1iZXJbXSA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDMwOyBpIDw9IDIwMDsgaSs9MSkge1xuICAgICAgY29uc3QgbnVtOnN0cmluZyA9IGkrJy4nO1xuICAgICAgd2VpZ2h0QXJyLnB1c2gobnVtKVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgd2VpZ2h0QXJyXG4gICAgfSlcbiAgfVxuXG5cblxuICAvLyBNZXRob2QgdG8gaGFuZGxlIHN0eWxpbmcgb2YgV2VDaGF0IGlucHV0XG4gIHB1YmxpYyBmb2N1c0lucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB0ZXh0SW5wdXRDbGFzczogXCJzZWN0aW9uLWlucHV0XCIgfSk7XG4gIH1cbiAgcHVibGljIGJpbmRIZWlnaHRTZWxlY3QoZXZlbnQ6IGFueSkge1xuICAgIGxldCB2YWwgPSBldmVudC5kZXRhaWwudmFsdWVbMF07XG4gICAgbGV0IGhlaWdodCA9IHRoaXMuZGF0YS5oZWlnaHRBcnJbdmFsXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXktaW5wdXRcIixcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgaGVpZ2h0VmFsOlt2YWxdLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZFdlaWdodFNlbGVjdChldmVudDphbnkpe1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGV2ZW50LmRldGFpbDtcbiAgICBjb25zdCB7IHBvaW50QXJyLCB3ZWlnaHRBcnIgfSA9IHRoaXMuZGF0YTtcbiAgICBjb25zdCB1bml0cyA9IHdlaWdodEFyclt2YWx1ZVswXV07XG4gICAgY29uc3QgcG9pbnQgPSBwb2ludEFyclt2YWx1ZVsxXV07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHdlaWdodDp1bml0cytwb2ludCxcbiAgICAgIHdlaWdodFZhbDpbdmFsdWVbMF0sdmFsdWVbMV1dLFxuICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXktaW5wdXRcIixcbiAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuICAgIH0pXG4gIH1cblxuICAvLyBIYW5kbGUgdGhlIGFnZSBpbnB1dCBldmVudFxuICBwdWJsaWMgYmluZEFnZUlucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgdmFsID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgbGV0IGJpcnRoWWVhciA9IHRoaXMuZGF0YS5iaXJ0aFllYXJzW3ZhbF07XG5cbiAgICBsZXQgYWdlID0gdGhpcy5kYXRhLnRvZGF5WWVhciAtIGJpcnRoWWVhcjtcblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5LWlucHV0XCIgfSk7XG5cbiAgICBpZiAoYWdlID49IDEgJiYgYWdlIDw9IDEwMCkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBiaXJ0aFllYXI6IGJpcnRoWWVhcixcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgYmlydGhZZWFyOiBiaXJ0aFllYXIsXG4gICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBnZXQgd2VpZ2hJbmRleCBhbmQgaW5pdCB3ZWlnaHRcbiAgcHVibGljIGdldFdlaWdodEluZm8oKSB7XG4gICAgY29uc29sZS5sb2coJz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09JylcbiAgICBjb25zdCB7IGhlaWdodCwgd2VpZ2h0QXJyIH0gPSB0aGlzLmRhdGE7XG4gICAgbGV0IGJtaVdlaWdodCA9IE1hdGgucm91bmQoaGVpZ2h0LzEwMCpoZWlnaHQvMTAwKjIxKjEwKS8xMDtcbiAgICBsZXQgdW5pdCA9IE1hdGguZmxvb3IoYm1pV2VpZ2h0KSAtIHBhcnNlSW50KHdlaWdodEFyclswXSk7XG4gICAgbGV0IHBvaW50ID0gYm1pV2VpZ2h0KjEwJTEwO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IFxuICAgICAgd2VpZ2h0OiBibWlXZWlnaHQsXG4gICAgICB3ZWlnaHRWYWw6W3VuaXQscG9pbnRdXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgbmV4dFN1Ym1pdCgpIHtcbiAgICAvLyDlhYjov5vooYzoioLmtYHvvIzpgb/lhY3nlKjmiLfngrnlh7vov4flv6tcbiAgICBsZXQgbm93VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGlmIChub3dUaW1lIC0gdGhpcy5sYXN0VGltZT4xMDAwKXtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBub3dUaW1lXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmxhc3RUaW1lID0gbm93VGltZVxuICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgdGl0bGU6ICfor7forqTnnJ/loavlhpknLFxuICAgICAgICBpY29uOiAnbm9uZScsXG4gICAgICAgIGR1cmF0aW9uOiAxMDAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGF0YS5kdWVEYXRlQ29uZGl0aW9uKSB7XG4gICAgICAvL2NoZWNrIHRoZSBleHBlY3RlZCBiaXJ0aCBkYXRlIGhlcmVcbiAgICAgIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAgIGxldCBleHBlY3RlZEJpcnRoRGF0ZSA9IG1vbWVudChbTnVtYmVyKHRoaXMuZGF0YS55ZWFyKSwgTnVtYmVyKHRoaXMuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhpcy5kYXRhLmRhdGUpXSkgLyAxMDAwO1xuICAgICAgbGV0IHRvZGF5ID0gbW9tZW50KCkgLyAxMDAwO1xuICAgICAgaWYgKHRvZGF5ID4gZXhwZWN0ZWRCaXJ0aERhdGUpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZW1wdHk6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIixcbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5uZXh0UGFnZSA9PSB0cnVlKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlICsgMVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygndGhpcy5kYXRhLmNvdW50UGFnZScsdGhpcy5kYXRhLmNvdW50UGFnZSlcbiAgICAgIGlmKHRoaXMuZGF0YS5jb3VudFBhZ2U9PT0zKXtcbiAgICAgICAgdGhpcy5nZXRXZWlnaHRJbmZvKClcbiAgICAgIH1cbiAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZW1wdHk6IHRydWUgfSk7XG4gICAgfVxuICAgIC8vICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5leHRQYWdlOiBmYWxzZSB9KTtcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSAxMSkge1xuICAgICAgdGhpcy5zZW5kRGF0YXMoKTtcbiAgICB9XG4gIH1cblxuICAvLyBIYW5kbGVzIHRoZSBwcmVnbmFuY3kgZHVlIGRhdGUgcGlja2VyIGV2ZW50XG4gIHB1YmxpYyBiaW5kRGF0ZUNoYW5nZShldmVudDogYW55KSB7XG4gICAgbGV0IHZhbCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBkYXRlUGlja2VyOiBcImRhdGVQaWNrZXItaW5wdXRcIixcbiAgICAgIHllYXI6IHRoaXMuZGF0YS55ZWFyc1t2YWxbMF1dLFxuICAgICAgbW9udGg6IHRoaXMuZGF0YS5tb250aHNbdmFsWzFdXSxcbiAgICAgIGRhdGU6IHRoaXMuZGF0YS5kYXlzW3ZhbFsyXV0sXG4gICAgICBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZEJlZm9yZVByZWdXZWlnaHRJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c0lucHV0KGV2ZW50KTtcblxuICAgIGxldCBwcmVXZWlnaHRJbnB1dCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAgIGlmIChwcmVXZWlnaHRJbnB1dCAhPSBudWxsICYmIHByZVdlaWdodElucHV0ICE9IFwiXCIpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlUHJlZ1dlaWdodDogcHJlV2VpZ2h0SW5wdXQsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocHJlV2VpZ2h0SW5wdXQgPT0gXCJcIikge1xuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB0ZXh0SW5wdXRDbGFzczogXCJzZWN0aW9uXCIgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJpbmROdW1QcmVnSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuXG4gICAgbGV0IG51bVByZWcgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICBpZiAobnVtUHJlZyA9PSBudWxsKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG51bVByZWc6IDAsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbnVtUHJlZzogTnVtYmVyKG51bVByZWcpICsgMSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldEdlbmRlckZvcm1zKCkge1xuICAgIGlmICh0aGlzLmRhdGEuYmlydGhZZWFyIDwgMjAwMyAmJiB0aGlzLmRhdGEuZ2VuZGVyID09IDIpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICAgICAgdG90YWxQYWdlOiA3LFxuICAgICAgfSk7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSArIDEgfSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgNCxcbiAgICAgICAgdG90YWxQYWdlOiA2LFxuICAgICAgfSk7XG5cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25DaGFuZ2UoKSB7XG4gICAgLy8gSGFuZGxlcyBuZXh0IHBhZ2UgdmFsaWRhdGlvblxuXG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09IDQgJiYgdGhpcy5kYXRhLmNvdW50UGFnZSAhPT0gOCAmJiB0aGlzLmRhdGEuY291bnRQYWdlICE9PTIgJiYgdGhpcy5kYXRhLmNvdW50UGFnZSAhPT0zKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlcyBkaWZmZXJlbnQgZm9ybXMgZmxvdyBmb3IgZGlmZmVyZW50IGdlbmRlclxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDUpIHtcbiAgICAgIHRoaXMuc2V0R2VuZGVyRm9ybXMoKTtcbiAgICB9XG5cbiAgICAvLyBEaXNwbGF5IGNvcnJlc3BvbmRpbmcgZm9ybXMgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIHByZWduYW5jeSBzdGFnZSBvcHRpb25cbiAgICB0aGlzLmhhbmRsZVByZWduYW5jeVN0YWdlT3B0aW9uc0Zvcm1zKCk7XG5cbiAgICAvLyBEaXNwbGF5IGNvcnJlc3BvbmRpbmcgZm9ybXMgaWYgZmVtYWxlIHVzZXIgaXMgcHJlZ25hbnRcbiAgICB0aGlzLmhhbmRsZVByZWduYW50RmVtYWxlRm9ybXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVQcmVnbmFudEZlbWFsZUZvcm1zKCkge1xuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDcpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGR1ZURhdGVDb25kaXRpb246IGZhbHNlLCB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IHRydWUgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDgpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGR1ZURhdGVDb25kaXRpb246IGZhbHNlLCB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IGZhbHNlLCBudW1iZXJPZlByZWduYW5jaWVzOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IGZhbHNlLCBudW1iZXJPZlByZWduYW5jaWVzOiBmYWxzZSB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlUHJlZ25hbmN5U3RhZ2VPcHRpb25zRm9ybXMoKSB7XG4gICAgaWYgKHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5oCA5a2V5pyfJyAmJiB0aGlzLmRhdGEucHJlZ25hbnRTdGFnZUNvbmRpdGlvbiA9PSB0cnVlICYmIHRoaXMuZGF0YS5kdWVEYXRlQ29uZGl0aW9uID09IGZhbHNlKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBkdWVEYXRlQ29uZGl0aW9uOiB0cnVlLCBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLCB0b3RhbFBhZ2U6IDEwIH0pO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmRhdGEucHJlZ25hbnRTdGFnZUNvbmRpdGlvbiA9PSB0cnVlICYmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+Wkh+WtleacnycgfHwgdGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICflk7rkubPmnJ8nIHx8IHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn6YO95LiN5pivJykpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgICAgIGR1ZURhdGVDb25kaXRpb246IGZhbHNlLFxuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAyLFxuICAgICAgICB0b3RhbFBhZ2U6IDdcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+aAgOWtleacnycgJiYgdGhpcy5kYXRhLnByZWduYW50U3RhZ2VDb25kaXRpb24gPT0gdHJ1ZSAmJiB0aGlzLmRhdGEuZHVlRGF0ZUNvbmRpdGlvbiA9PSB0cnVlKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSwgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogZmFsc2UsIGR1ZURhdGVDb25kaXRpb246IGZhbHNlIH0pO1xuXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHByZWduYW5jeVN0YWdlRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT0gMSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgcHJlZ25hbmN5U3RhZ2U6ICflpIflrZXmnJ8nLCBwcmVnU3RhZ2VTZWxlY3RlZDogMSwgdG90YWxQYWdlOiA3IH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn5oCA5a2V5pyfJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDIsIHRvdGFsUGFnZTogMTAgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgcHJlZ25hbmN5U3RhZ2U6ICflk7rkubPmnJ8nLCBwcmVnU3RhZ2VTZWxlY3RlZDogMywgdG90YWxQYWdlOiA3IH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn6YO95LiN5pivJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDAsIHRvdGFsUGFnZTogNyB9KTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuICB9XG5cbiAgcHVibGljIGFjdGl2aXR5TGV2ZWxFdmVudChldmVudDogYW55KSB7XG5cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDEpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGFjdGl2aXR5TGV2ZWw6ICfljafluorkvJHmga8nLCBhY3Rpdml0eVNlbGVjdGVkOiAxIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGFjdGl2aXR5TGV2ZWw6ICfovbvluqbvvIzpnZnlnZDlsJHliqgnLCBhY3Rpdml0eVNlbGVjdGVkOiAyIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGFjdGl2aXR5TGV2ZWw6ICfkuK3luqbvvIzluLjluLjotbDliqgnLCBhY3Rpdml0eVNlbGVjdGVkOiAzIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDQpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGFjdGl2aXR5TGV2ZWw6ICfph43luqbvvIzotJ/ph40nLCBhY3Rpdml0eVNlbGVjdGVkOiA0IH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDUpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGFjdGl2aXR5TGV2ZWw6ICfliafng4jvvIzotoXotJ/ph40nLCBhY3Rpdml0eVNlbGVjdGVkOiA1IH0pO1xuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5leHRQYWdlOiB0cnVlLCBlbXB0eTogZmFsc2UgfSk7XG4gIH1cblxuICBwdWJsaWMgbWVkaWNhbENvbmRpdGlvbihldmVudDogYW55KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAxKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWRpY2FsOiAn57OW5bC/55eFJywgbWVkaWNhbHNlbGVjdGVkOiAxIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lZGljYWw6ICfnlLLnirbohbrlip/og73kuqLov5vnl4cnLCBtZWRpY2Fsc2VsZWN0ZWQ6IDIgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVkaWNhbDogJ+aXoCcsIG1lZGljYWxzZWxlY3RlZDogMCB9KTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBmaW5hbFBhZ2U6IHRydWUsIG5leHRQYWdlOiB0cnVlLCBlbXB0eTogZmFsc2UgfSk7XG5cbiAgfVxuXG4gIC8vIHB1YmxpYyBnZXRSRElHb2FsKCk6IHZvaWQge1xuICAvLyAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgLy8gICB3ZWJBUEkuUmV0cmlldmVVc2VyUkRBKHt9KS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgdGhpcy5yZGFVcmwgPSByZXNwLnJkYV91cmw7XG4gIC8vICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICAvLyAgIHdlYkFQSS5SZXRyaWV2ZVJlY29tbWVuZGVkRGFpbHlBbGxvd2FuY2Uoe30pLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gIC8vICAgICBsZXQgZW5lcmd5ID0gcmVzcC5lbmVyZ3k7XG4gIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAvLyAgICAgICByZGlWYWx1ZTogTWF0aC5mbG9vcihlbmVyZ3kgLyAxMDApXG4gIC8vICAgICB9KTtcbiAgLy8gICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gIC8vIH1cbiAgcHVibGljIGdldFJESUdvYWwoKTogdm9pZCB7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJSREEoe30pLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGlzLnJkYVVybCA9IHJlc3AucmRhX3VybDtcbiAgICAgIGlmICh0aGlzLnJkYVVybCAhPT0gXCJcIikge1xuICAgICAgICB3eC5yZUxhdW5jaCh7XG4gICAgICAgICAgdXJsOiAnL3BhZ2VzL3JkaVBhZ2UvcmRpUGFnZT91cmw9JyArIHRoaXMucmRhVXJsLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgICB3ZWJBUEkuUmV0cmlldmVSZWNvbW1lbmRlZERhaWx5QWxsb3dhbmNlKHt9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgbGV0IGVuZXJneSA9IHJlc3AuZW5lcmd5O1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcmRpVmFsdWU6IE1hdGguZmxvb3IoZW5lcmd5IC8gMTAwKVxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG5cbiAgcHVibGljIHJlZGlyZWN0VG9SREFQYWdlKCkge1xuICAgIGlmICh0aGlzLnJkYVVybCAhPT0gXCJcIikge1xuICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgIHVybDogJy9wYWdlcy9yZGlQYWdlL3JkaVBhZ2U/dXJsPScgKyB0aGlzLnJkYVVybCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNlbmREYXRhcygpOiB2b2lkIHtcbiAgICAvLyDmn6XnnIvmmK/lkKbmjojmnYNcbiAgICBsZXQgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbik7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih0b2tlbik7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBnZW5kZXIgPSBOdW1iZXIodGhhdC5kYXRhLmdlbmRlcik7XG4gICAgbGV0IGJpcnRoWWVhciA9IE51bWJlcih0aGF0LmRhdGEuYmlydGhZZWFyKTtcbiAgICBsZXQgaGVpZ2h0ID0gTnVtYmVyKHRoYXQuZGF0YS5oZWlnaHQpO1xuICAgIGxldCB3ZWlnaHQgPSBOdW1iZXIodGhhdC5kYXRhLndlaWdodCk7XG4gICAgbGV0IHdlaWdodEJlZm9yZVByZWcgPSBOdW1iZXIodGhhdC5kYXRhLnByZVByZWdXZWlnaHQpO1xuICAgIGxldCBhY3Rpdml0eVNlbGVjdGVkID0gTnVtYmVyKHRoYXQuZGF0YS5hY3Rpdml0eVNlbGVjdGVkKTtcbiAgICBsZXQgcHJlZ1N0YWdlU2VsZWN0ZWQgPSBOdW1iZXIodGhhdC5kYXRhLnByZWdTdGFnZVNlbGVjdGVkKTtcbiAgICBsZXQgbWVkaWNhbENvbmRpdGlvbiA9IE51bWJlcih0aGF0LmRhdGEubWVkaWNhbHNlbGVjdGVkKTtcbiAgICAvL0ZJWE1FIHNwZWNpYWwgc2V0dGluZyBmb3Igc2VydmVyIHByZWduYW5jeSBzdGFnZSBvdXQgb2YgaW5kZXggcmFuZ2Ugc2V0dGluZ1xuICAgIGlmIChwcmVnU3RhZ2VTZWxlY3RlZCA8IDAgfHwgcHJlZ1N0YWdlU2VsZWN0ZWQgPiAzKSB7XG4gICAgICBwcmVnU3RhZ2VTZWxlY3RlZCA9IDA7XG4gICAgfVxuXG4gICAgbGV0IHByZWdfYmlydGhfZGF0ZSA9IHRoaXMuZGF0YS55ZWFyICsgXCItXCIgKyB0aGlzLmRhdGEubW9udGggKyBcIi1cIiArIHRoaXMuZGF0YS5kYXRlO1xuXG4gICAgLy8gbGV0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuICAgIC8vIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIlwiLCBjb250ZW50OiBcIlwiICsgbW9tZW50KFtOdW1iZXIodGhhdC5kYXRhLnllYXIpLCBOdW1iZXIodGhhdC5kYXRhLm1vbnRoKSAtIDEsIE51bWJlcih0aGF0LmRhdGEuZGF0ZSldKSB9KSBcblxuICAgIHd4LmdldFNldHRpbmcoe1xuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgbGV0IHVzZXJJbmZvID0gcmVzLnVzZXJJbmZvO1xuICAgICAgICAgICAgICBsZXQgbmlja05hbWUgPSB1c2VySW5mby5uaWNrTmFtZTtcbiAgICAgICAgICAgICAgbGV0IGF2YXRhclVybCA9IHVzZXJJbmZvLmF2YXRhclVybDtcbiAgICAgICAgICAgICAgbGV0IG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuICAgICAgICAgICAgICBsZXQgdXBkYXRlVXNlclByb2ZpbGVSZXEgPSB7XG4gICAgICAgICAgICAgICAgZ2VuZGVyOiBnZW5kZXIsXG4gICAgICAgICAgICAgICAgeWVhcl9vZl9iaXJ0aDogYmlydGhZZWFyLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdlaWdodDogd2VpZ2h0LFxuICAgICAgICAgICAgICAgIHdlaWdodF9iZWZvcmVfcHJlZ25hbmN5OiB3ZWlnaHRCZWZvcmVQcmVnLFxuICAgICAgICAgICAgICAgIGFjdGl2aXR5X2xldmVsOiBhY3Rpdml0eVNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIHByZWduYW5jeV9zdGFnZTogcHJlZ1N0YWdlU2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWRfYmlydGhfZGF0ZTogbW9tZW50KFtOdW1iZXIodGhhdC5kYXRhLnllYXIpLCBOdW1iZXIodGhhdC5kYXRhLm1vbnRoKSAtIDEsIE51bWJlcih0aGF0LmRhdGEuZGF0ZSldKSAvIDEwMDAsXG4gICAgICAgICAgICAgICAgbmlja25hbWU6IG5pY2tOYW1lLFxuICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGF2YXRhclVybCxcbiAgICAgICAgICAgICAgICB0aW1lc19vZl9wcmVnbmFuY3k6IHRoYXQuZGF0YS5udW1QcmVnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiB9KTtcbiAgICAgICAgICAgICAgd2ViQVBJLlVwZGF0ZVVzZXJQcm9maWxlKHVwZGF0ZVVzZXJQcm9maWxlUmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0UkRJR29hbCgpO1xuICAgICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgICAgICAgY29udGVudDogJ+abtOaWsOeUqOaIt+S/oeaBr+Wksei0pScsXG4gICAgICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBsZXQgdXBkYXRlTWVkaWNhbFByb2ZpbGVSZXEgPSB7XG4gICAgICAgICAgICAgICAgZm9vZF9hbGxlcmd5X2lkczogW10sXG4gICAgICAgICAgICAgICAgbWVkaWNhbF9jb25kaXRpb25faWRzOiBbbWVkaWNhbENvbmRpdGlvbl0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1lZGljYWxDb25kaXRpb24gIT0gMCkge1xuICAgICAgICAgICAgICAgIHdlYkFQSS5VcGRhdGVNZWRpY2FsUHJvZmlsZSh1cGRhdGVNZWRpY2FsUHJvZmlsZVJlcSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiAnLi4vbG9naW4vaW5kZXg/dXNlcl9zdGF0dXM9MidcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vcmVjb3JkIHRoZSBvbkJvYXJkIGxhc3Qgc3RlcCB0aW1lc1xuICAgIHd4LnJlcG9ydEFuYWx5dGljcygnb25ib2FyZF9sYXN0X3N0ZXAnLCB7XG4gICAgICBjb3VudHM6ICdjb3VudHMnLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGNvbmZpcm1TdWJtaXQoKSB7XG4gICAgd3gucmVMYXVuY2goe1xuICAgICAgdXJsOiBcIi4uLy4uL3BhZ2VzL2hvbWUvaW5kZXhcIixcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHByZUJ1dHRvbjIzNCgpe1xuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlPT0yKXsgLy8g5b2T5YmN5Zyo6YCJ5oup6Lqr6auY6aG1XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgZ2VuZGVyOiAwLFxuICAgICAgICAvLyBoZWlnaHQ6IDE1MCxcbiAgICAgICAgLy8gaGVpZ2h0VmFsOlsxMTBdLFxuICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAvLyBoZWlnaHQ6IDE1MCxcbiAgICAgICAgLy8gd2VpZ2h0OiA1MC41LFxuICAgICAgICAvLyB3ZWlnaHRWYWw6IFsyMCw1XSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgICAgeWVhckRpc3BsYXk6ICd5ZWFyRGlzcGxheScsXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA0KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgLy8gd2VpZ2h0OiA1MC41LFxuICAgICAgICAvLyB3ZWlnaHRWYWw6IFsyMCw1XSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgICAgeWVhckRpc3BsYXk6ICd5ZWFyRGlzcGxheScsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBwdWJsaWMgcHJlQnV0dG9uUHJlZ25hbnRBbmROb3REdWUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMixcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgIGJpcnRoWWVhcjogMTk5MSxcbiAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG5cbiAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgICBwcmVnU3RhZ2VTZWxlY3RlZDo0LCBcbiAgICB9KSBcbiAgfVxuXG4gIHB1YmxpYyBwcmVCdXR0b25EdWVEYXRlQ29uZGl0aW9uKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgdG90YWxQYWdlOiA3LFxuXG4gICAgICBkdWVEYXRlQ29uZGl0aW9uOmZhbHNlLFxuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgICB5ZWFyOiAnMjAxOScsXG4gICAgICBtb250aDogJzEwJyxcbiAgICAgIGRhdGU6ICcxJyxcblxuICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICAgIHByZWduYW5jeVN0YWdlOiAnJyxcbiAgICAgIHByZWdTdGFnZVNlbGVjdGVkOiA0LFxuXG4gICAgfSkgXG4gIH1cblxuICBwdWJsaWMgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5QmFjaygpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICAgIGR1ZURhdGVDb25kaXRpb246IHRydWUsIFxuICAgICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSxcblxuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgICB5ZWFyOiAnMjAxOScsXG4gICAgICBtb250aDogJzEwJyxcbiAgICAgIGRhdGU6ICcxJyxcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIG51bWJlck9mUHJlZ25hbmNpZXNQcmUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICBudW1QcmVnOiAxLFxuICAgICAgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsIFxuICAgICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiB0cnVlLCBcbiAgICAgIG51bWJlck9mUHJlZ25hbmNpZXM6IGZhbHNlLFxuXG4gICAgICBwcmVQcmVnV2VpZ2h0OiAwLFxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcHJlQnV0dG9uOSgpe1xuICAgIC8vIOeUt+eUn1xuICAgIGlmICh0aGlzLmRhdGEuZ2VuZGVyPT09MSl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSA1LFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcblxuICAgICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgLy8g5aWz55SfXG4gICAgICBpZiAodGhpcy5kYXRhLmJpcnRoWWVhciA+PSAyMDAzKXtcbiAgICAgICAgLy8g5bm06b6E5bCP77yM5rKh5pyJ5ruh6Laz5oCA5a2V5bm06b6E5p2h5Lu255qE5aWz5a2pXG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gNSxcbiAgICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgICAgIHRvdGFsUGFnZTo3LFxuXG4gICAgICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcblxuICAgICAgICAgIGJpcnRoWWVhcjogMTk5MSxcbiAgICAgICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheVwiLFxuICAgICAgICB9KVxuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5ruh6Laz5oCA5a2V5bm06b6E5p2h5Lu255qE5aWz55SfXG4gICAgICAgIGlmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+aAgOWtleacnycpe1xuICAgICAgICAgIC8vIOmAieaLqeS6hlwi5oCA5a2V5pyfXCLnmoTlpbPnlJ9cbiAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgICAgICAgICBudW1iZXJPZlByZWduYW5jaWVzOiB0cnVlLFxuXG4gICAgICAgICAgICBudW1QcmVnOiAxLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vIOmAieaLqeS6humdnlwi5oCA5a2V5pyfXCLnmoTlpbPnlJ9cbiAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgICAgICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOnRydWUsXG4gICAgICAgICAgICBkdWVEYXRlQ29uZGl0aW9uOmZhbHNlLFxuXG4gICAgICAgICAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgICAgICAgICBwcmVnU3RhZ2VTZWxlY3RlZDogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHB1YmxpYyBwcmVCdXR0b24xMCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICBlbXB0eTpmYWxzZSxcblxuICAgICAgbWVkaWNhbDogJycsIFxuICAgICAgbWVkaWNhbHNlbGVjdGVkOiA1LFxuXG4gICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgfSlcbiAgfVxufVxuXG5QYWdlKG5ldyBvbkJvYXJkKCkpO1xuIl19