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
            weightBMI: 0,
            weight: 47.3,
            weightVal: [173],
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
                gender: 1
            });
        }
        else {
            this.setData({
                totalPage: 7,
                gender: 2,
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
        for (var i = 30; i <= 300; i += 0.1) {
            weightArr.push(Number(i.toFixed(1)));
        }
        this.setData({
            weightArr: weightArr
        });
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
    onBoard.prototype.focusInput = function (event) {
        this.setData({ textInputClass: "section-input" });
    };
    onBoard.prototype.bindHeightSelect = function (event) {
        var val = event.detail.value[0];
        var height = this.data.heightArr[val];
        var weightBMI = Number((21 * height / 100 * height / 100).toFixed(1));
        var weightVal = [Number(((weightBMI - 30) / 0.1).toFixed(1))];
        this.setData({
            yearDisplay: "yearDisplay-input",
            height: height,
            nextPage: true,
            empty: false,
            weight: weightBMI,
            weightVal: weightVal
        });
    };
    onBoard.prototype.bindWeightSelect = function (event) {
        var val = event.detail.value[0];
        var weight = this.data.weightArr[val];
        this.setData({
            yearDisplay: "yearDisplay-input",
            weight: weight,
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
                height: 150,
                weight: 47.3,
                weightVal: [173],
                nextPage: true,
                empty: false,
                yearDisplay: 'yearDisplay',
            });
        }
        if (this.data.countPage == 4) {
            var weightBMI = Number((21 * this.data.height / 100 * this.data.height / 100).toFixed(1));
            var weightVal = [Number(((weightBMI - 30) / 0.1).toFixed(1))];
            this.setData({
                countPage: this.data.countPage - 1,
                currentPage: this.data.currentPage - 1,
                weight: weightBMI,
                weightVal: weightVal,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25Cb2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9uQm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QixpREFBbUQ7QUFFbkQsaURBQWtEO0FBR2xEO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixXQUFXLEVBQUUsYUFBYTtZQUMxQixVQUFVLEVBQUUsWUFBWTtZQUN4QixjQUFjLEVBQUUsU0FBUztZQUN6QixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIscUJBQXFCLEVBQUUsS0FBSztZQUM1QixtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLFNBQVMsRUFBRSxDQUFDO1lBQ1osU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxFQUFFLEdBQUc7WUFDWCxTQUFTLEVBQUMsQ0FBQyxHQUFHLENBQUM7WUFDZixTQUFTLEVBQUUsRUFBRTtZQUNiLFNBQVMsRUFBQyxDQUFDO1lBQ1gsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFDLEVBQUU7WUFDWixjQUFjLEVBQUUsRUFBRTtZQUNsQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1lBQ1YsU0FBUyxFQUFFLENBQUM7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLEdBQUc7WUFDVCxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVCxhQUFhLEVBQUUsRUFBRTtZQUNqQixnQkFBZ0IsRUFBRSxDQUFD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QUVYLE9BQU8sRUFBRSxFQUFFO1lBQ1gsZUFBZSxFQUFFLENBQUM7WUFFbEIsYUFBYSxFQUFFLEVBQUU7WUFDakIsZ0JBQWdCLEVBQUUsQ0FBQztTQUNwQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0gsY0FBQztBQUFELENBQUMsQUF4eEJELElBd3hCQztBQUVELElBQUksQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IElNeUFwcCB9IGZyb20gJy4uLy4uL2FwcCdcbmltcG9ydCB7IGVwb2NoIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbCdcblxuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQgeyBNaW5pUHJvZ3JhbUxvZ2luIH0gZnJvbSAnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZSc7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJ1xuaW1wb3J0IHsgVXBkYXRlVXNlclByb2ZpbGVSZXEsIFVwZGF0ZU1lZGljYWxQcm9maWxlIH0gZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlT2Jqcyc7XG5cbmNsYXNzIG9uQm9hcmQge1xuXG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG4gICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiLFxuICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSxcbiAgICBudW1iZXJPZlByZWduYW5jaWVzOiBmYWxzZSxcbiAgICBjb3VudFBhZ2U6IDAsXG4gICAgZmluYWxQYWdlOiBmYWxzZSxcbiAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgZW1wdHk6IGZhbHNlLFxuICAgIGdlbmRlcjogMCxcbiAgICBoZWlnaHQ6IDE1MCxcbiAgICBoZWlnaHRWYWw6WzExMF0sXG4gICAgaGVpZ2h0QXJyOiBbXSxcbiAgICB3ZWlnaHRCTUk6MCxcbiAgICB3ZWlnaHQ6IDQ3LjMsXG4gICAgd2VpZ2h0VmFsOiBbMTczXSxcbiAgICB3ZWlnaHRBcnI6W10sXG4gICAgcHJlZ25hbmN5U3RhZ2U6ICcnLFxuICAgIHByZWdTdGFnZVNlbGVjdGVkOiA0LFxuICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgbnVtUHJlZzogMSxcbiAgICB0b2RheVllYXI6IDAsXG4gICAgeWVhcjogJzIwMTknLFxuICAgIG1vbnRoOiAnMTAnLFxuICAgIGRhdGU6ICcxJyxcbiAgICB5ZWFyczogWzBdLFxuICAgIG1vbnRoczogWzldLFxuICAgIGRheXM6IFswXSxcbiAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuICAgIG1lZGljYWw6ICcnLFxuICAgIG1lZGljYWxzZWxlY3RlZDogNSxcbiAgICBpbnB1dFZhbGlkYXRlOiAn6K+36L6T5YWl5L2g55qE562U5qGIJyxcbiAgICBvcHRpb25zVmFsaWRhdGU6ICfor7fpgInmi6nkvaDnmoTnrZTmoYgnLFxuICAgIC8vIGhlaWdodFZhbGlkYXRlOiAn6K+35ZyoNDAtMjMw5Y6Y57Gz6IyD5Zu05YaF6L6T5YWl5oKo55qE6Lqr6auYJyxcbiAgICAvLyB3ZWlnaHRWYWxpZGF0ZTogJ+ivt+WcqDMwLTMwMOWNg+WFi+iMg+WbtOWGhei+k+WFpeaCqOeahOS9k+mHjScsXG4gICAgZXhwZWN0ZWREYXRlVmFsaWRhdGU6ICfor7flnKjku4rlpKnliLDmnKrmnaU0NeWRqOeahOaXpeacn+WGhemAieaLqeaCqOeahOmihOS6p+acnycsXG4gICAgYWdlVmFsaWRhdGU6ICfor7fnoa7kv53mgqjnmoTlubTpvoTlnKgxLTEwMOWygeiMg+WbtOWGhScsXG4gICAgcmRpR29hbDogMjAwMCxcbiAgICBiaXJ0aFZhbDogWzcyXSxcbiAgICBwcmVnbmFuY3lOdW1WYWw6IFswXSxcbiAgICBiaXJ0aFllYXJzOiBbXSxcbiAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgbnVtUHJlZ09wdGlvbnM6IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF0sXG4gICAgdG90YWxQYWdlOiA3LFxuICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgIG5pY2tOYW1lOiBcIlwiLFxuICAgIGF2YXRhclVybDogXCJcIixcbiAgICByZGlWYWx1ZTogXCIgXCIsXG4gIH1cbiAgcHVibGljIGxhc3RUaW1lID0gMDsgLy8g6Zi75q2i55So5oi36L+e57ut5b+r6YCf54K55Ye7XG5cbiAgcHVibGljIHJkYVVybCA9IFwiXCI7XG5cbiAgcHVibGljIGdlbmRlckV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSk7XG5cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IFwi55S3XCIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRvdGFsUGFnZTogNixcbiAgICAgICAgZ2VuZGVyOiAxXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdG90YWxQYWdlOiA3LFxuICAgICAgICBnZW5kZXI6IDIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCk6IHZvaWQge1xuICAgIHd4LnNldE5hdmlnYXRpb25CYXJUaXRsZSh7XG4gICAgICB0aXRsZTogXCLln7rmnKzkv6Hmga9cIlxuICAgIH0pO1xuXG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLnNldEJpcnRoWWVhclBpY2tlcih0b2RheSk7XG4gICAgdGhpcy5zZXREdWVEYXRlUGlja2VyKHRvZGF5KTtcbiAgICB0aGlzLmluaXRIZWlnaHRBcnIoKTtcbiAgICB0aGlzLmluaXRXZWlnaHRBcnIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlvqrnjq/ojrflvpdoZWlnaHRBcnJcbiAgICovXG4gIHB1YmxpYyBpbml0SGVpZ2h0QXJyKCl7XG4gICAgbGV0IGhlaWdodEFycjpOdW1iZXJbXSA9IFtdXG4gICAgZm9yKGxldCBpPTQwO2k8PTIzMDtpKyspe1xuICAgICAgaGVpZ2h0QXJyLnB1c2goaSlcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGhlaWdodEFycjogaGVpZ2h0QXJyXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICog5b6q546v6I635b6Xd2VpZ2h0QXJyXG4gICAqL1xuICBwdWJsaWMgaW5pdFdlaWdodEFycigpIHtcbiAgICBsZXQgd2VpZ2h0QXJyOiBOdW1iZXJbXSA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDMwOyBpIDw9IDMwMDsgaSs9MC4xKSB7XG4gICAgICB3ZWlnaHRBcnIucHVzaChOdW1iZXIoaS50b0ZpeGVkKDEpKSlcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHdlaWdodEFycjogd2VpZ2h0QXJyXG4gICAgfSlcbiAgfVxuICAvLyBTZXQgdGhlIHBpY2tlciBvcHRpb25zIGZvciBwcmVnbmFuY3kgZHVlIGRhdGVcbiAgcHVibGljIHNldER1ZURhdGVQaWNrZXIodG9kYXk6IGFueSk6IHZvaWQge1xuICAgIGxldCBkdWVZZWFyID0gW107XG4gICAgbGV0IGR1ZU1vbnRoID0gW107XG4gICAgbGV0IGR1ZURheXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSB0b2RheS5nZXRGdWxsWWVhcigpOyBpIDw9IHRvZGF5LmdldEZ1bGxZZWFyKCkgKyAyOyBpKyspIHtcbiAgICAgIGR1ZVllYXIucHVzaChpKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDEyOyBpKyspIHtcbiAgICAgIGR1ZU1vbnRoLnB1c2goaSlcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAzMTsgaSsrKSB7XG4gICAgICBkdWVEYXlzLnB1c2goaSlcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB5ZWFyczogZHVlWWVhciwgbW9udGhzOiBkdWVNb250aCwgZGF5czogZHVlRGF5cyB9KTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgcGlja2VyIG9wdGlvbnMgZm9yIGJpcnRoIHllYXJcbiAgcHVibGljIHNldEJpcnRoWWVhclBpY2tlcih0b2RheTogYW55KTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgMSwgdG9kYXlZZWFyOiB0b2RheS5nZXRGdWxsWWVhcigpIC0gMSB9KTtcblxuICAgIGxldCB5ZWFycyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDE5MTk7IGkgPD0gdG9kYXkuZ2V0RnVsbFllYXIoKSAtIDE7IGkrKykge1xuICAgICAgeWVhcnMucHVzaChpKTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBiaXJ0aFllYXJzOiB5ZWFycyB9KTtcbiAgfVxuXG4gIC8vIE1ldGhvZCB0byBoYW5kbGUgc3R5bGluZyBvZiBXZUNoYXQgaW5wdXRcbiAgcHVibGljIGZvY3VzSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb24taW5wdXRcIiB9KTtcbiAgfVxuICAvLyDmjaLmiJDkuoZwaWNrZXLvvIzlpoLmnpxwaWNrZXLmsqHpl67popjvvIzlkI7nu63kuIvpnaLnmoTku6PnoIHlj6/ku6XliKDpmaRcbiAgLy8gSGFuZGxlIHRoZSBoZWlnaHQgaW5wdXQgZXZlbnRcbiAgLy8gcHVibGljIGJpbmRIZWlnaHRJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gIC8vICAgdGhpcy5mb2N1c0lucHV0KGV2ZW50KTtcblxuICAvLyAgIGxldCBoZWlnaHRJbnB1dCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAvLyAgIGlmIChoZWlnaHRJbnB1dCA+PSA0MCAmJiBoZWlnaHRJbnB1dCA8PSAyMzAgJiYgaGVpZ2h0SW5wdXQgIT0gXCJcIikge1xuXG4gIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBoZWlnaHQ6IGhlaWdodElucHV0LCBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuXG4gIC8vICAgfSBlbHNlIHtcblxuICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IGZhbHNlLCBlbXB0eTogZmFsc2UgfSk7XG5cbiAgLy8gICAgIGlmIChoZWlnaHRJbnB1dCA9PSBcIlwiKSB7XG4gIC8vICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIiB9KTtcbiAgLy8gICAgIH1cblxuICAvLyAgIH1cbiAgLy8gfVxuICBwdWJsaWMgYmluZEhlaWdodFNlbGVjdChldmVudDogYW55KSB7XG4gICAgbGV0IHZhbCA9IGV2ZW50LmRldGFpbC52YWx1ZVswXTtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5kYXRhLmhlaWdodEFyclt2YWxdO1xuICAgIGxldCB3ZWlnaHRCTUkgPSBOdW1iZXIoKDIxICogaGVpZ2h0LzEwMCAqIGhlaWdodC8xMDApLnRvRml4ZWQoMSkpO1xuICAgIGxldCB3ZWlnaHRWYWwgPSBbTnVtYmVyKCgod2VpZ2h0Qk1JIC0gMzApIC8gMC4xKS50b0ZpeGVkKDEpKV07XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5LWlucHV0XCIsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRCTUksXG4gICAgICB3ZWlnaHRWYWw6d2VpZ2h0VmFsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYmluZFdlaWdodFNlbGVjdChldmVudDphbnkpe1xuICAgIGxldCB2YWwgPSBldmVudC5kZXRhaWwudmFsdWVbMF07XG4gICAgbGV0IHdlaWdodCA9IHRoaXMuZGF0YS53ZWlnaHRBcnJbdmFsXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXktaW5wdXRcIixcbiAgICAgIHdlaWdodDogd2VpZ2h0LFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSk7XG4gIH1cbiAgLy8g5o2i5oiQ5LqGcGlja2Vy77yM5aaC5p6ccGlja2Vy5rKh6Zeu6aKY77yM5ZCO57ut5LiL6Z2i55qE5Luj56CB5Y+v5Lul5Yig6ZmkXG4gIC8vIEhhbmRsZSB0aGUgd2VpZ2h0IGlucHV0IGV2ZW50XG4gIC8vIHB1YmxpYyBiaW5kV2VpZ2h0SW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAvLyAgIHRoaXMuZm9jdXNJbnB1dChldmVudCk7XG5cbiAgLy8gICBsZXQgd2VpZ2h0SW5wdXQgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgLy8gICBpZiAod2VpZ2h0SW5wdXQgPj0gMzAgJiYgd2VpZ2h0SW5wdXQgPD0gMzAwICYmIHdlaWdodElucHV0ICE9IFwiXCIpIHtcblxuICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgICAgd2VpZ2h0OiB3ZWlnaHRJbnB1dCxcbiAgLy8gICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gIC8vICAgICAgIGVtcHR5OiBmYWxzZVxuICAvLyAgICAgfSk7XG5cbiAgLy8gICB9IGVsc2Uge1xuXG4gIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAvLyAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gIC8vICAgICAgIGVtcHR5OiBmYWxzZVxuICAvLyAgICAgfSk7XG5cbiAgLy8gICAgIGlmICh3ZWlnaHRJbnB1dCA9PSBcIlwiKSB7XG5cbiAgLy8gICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiIH0pO1xuXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gSGFuZGxlIHRoZSBhZ2UgaW5wdXQgZXZlbnRcbiAgcHVibGljIGJpbmRBZ2VJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgbGV0IHZhbCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAgIGxldCBiaXJ0aFllYXIgPSB0aGlzLmRhdGEuYmlydGhZZWFyc1t2YWxdO1xuXG4gICAgbGV0IGFnZSA9IHRoaXMuZGF0YS50b2RheVllYXIgLSBiaXJ0aFllYXI7XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheS1pbnB1dFwiIH0pO1xuXG4gICAgaWYgKGFnZSA+PSAxICYmIGFnZSA8PSAxMDApIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgYmlydGhZZWFyOiBiaXJ0aFllYXIsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGJpcnRoWWVhcjogYmlydGhZZWFyLFxuICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5leHRTdWJtaXQoKSB7XG4gICAgLy8g5YWI6L+b6KGM6IqC5rWB77yM6YG/5YWN55So5oi354K55Ye76L+H5b+rXG4gICAgbGV0IG5vd1RpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBpZiAobm93VGltZSAtIHRoaXMubGFzdFRpbWU+MTAwMCl7XG4gICAgICB0aGlzLmxhc3RUaW1lID0gbm93VGltZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5sYXN0VGltZSA9IG5vd1RpbWVcbiAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgIHRpdGxlOiAn6K+36K6k55yf5aGr5YaZJyxcbiAgICAgICAgaWNvbjogJ25vbmUnLFxuICAgICAgICBkdXJhdGlvbjogMTAwMFxuICAgICAgfSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLmRhdGEuZHVlRGF0ZUNvbmRpdGlvbikge1xuICAgICAgLy9jaGVjayB0aGUgZXhwZWN0ZWQgYmlydGggZGF0ZSBoZXJlXG4gICAgICBsZXQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG4gICAgICBsZXQgZXhwZWN0ZWRCaXJ0aERhdGUgPSBtb21lbnQoW051bWJlcih0aGlzLmRhdGEueWVhciksIE51bWJlcih0aGlzLmRhdGEubW9udGgpIC0gMSwgTnVtYmVyKHRoaXMuZGF0YS5kYXRlKV0pIC8gMTAwMDtcbiAgICAgIGxldCB0b2RheSA9IG1vbWVudCgpIC8gMTAwMDtcbiAgICAgIGlmICh0b2RheSA+IGV4cGVjdGVkQmlydGhEYXRlKSB7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGVtcHR5OiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB0ZXh0SW5wdXRDbGFzczogXCJzZWN0aW9uXCIsXG4gICAgICBkYXRlUGlja2VyOiBcImRhdGVQaWNrZXJcIlxuICAgIH0pO1xuICAgIGlmICh0aGlzLmRhdGEubmV4dFBhZ2UgPT0gdHJ1ZSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgMSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSArIDFcbiAgICAgIH0pO1xuICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBlbXB0eTogdHJ1ZSB9KTtcbiAgICB9XG4gICAgLy8gKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IGZhbHNlIH0pO1xuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDExKSB7XG4gICAgICB0aGlzLnNlbmREYXRhcygpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhhbmRsZXMgdGhlIHByZWduYW5jeSBkdWUgZGF0ZSBwaWNrZXIgZXZlbnRcbiAgcHVibGljIGJpbmREYXRlQ2hhbmdlKGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgdmFsID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlci1pbnB1dFwiLFxuICAgICAgeWVhcjogdGhpcy5kYXRhLnllYXJzW3ZhbFswXV0sXG4gICAgICBtb250aDogdGhpcy5kYXRhLm1vbnRoc1t2YWxbMV1dLFxuICAgICAgZGF0ZTogdGhpcy5kYXRhLmRheXNbdmFsWzJdXSxcbiAgICAgIG5leHRQYWdlOiB0cnVlLCBlbXB0eTogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kQmVmb3JlUHJlZ1dlaWdodElucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzSW5wdXQoZXZlbnQpO1xuXG4gICAgbGV0IHByZVdlaWdodElucHV0ID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgaWYgKHByZVdlaWdodElucHV0ICE9IG51bGwgJiYgcHJlV2VpZ2h0SW5wdXQgIT0gXCJcIikge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVQcmVnV2VpZ2h0OiBwcmVXZWlnaHRJbnB1dCxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVQcmVnV2VpZ2h0OiAwLFxuICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwcmVXZWlnaHRJbnB1dCA9PSBcIlwiKSB7XG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIiB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYmluZE51bVByZWdJbnB1dChldmVudDogYW55KTogdm9pZCB7XG5cbiAgICBsZXQgbnVtUHJlZyA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAgIGlmIChudW1QcmVnID09IG51bGwpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbnVtUHJlZzogMCxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBudW1QcmVnOiBOdW1iZXIobnVtUHJlZykgKyAxLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXRHZW5kZXJGb3JtcygpIHtcbiAgICBpZiAodGhpcy5kYXRhLmJpcnRoWWVhciA8IDIwMDMgJiYgdGhpcy5kYXRhLmdlbmRlciA9PSAyKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgICAgIHRvdGFsUGFnZTogNyxcbiAgICAgIH0pO1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSArIDQsXG4gICAgICAgIHRvdGFsUGFnZTogNixcbiAgICAgIH0pO1xuXG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uQ2hhbmdlKCkge1xuICAgIC8vIEhhbmRsZXMgbmV4dCBwYWdlIHZhbGlkYXRpb25cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSAhPT0gNCAmJiB0aGlzLmRhdGEuY291bnRQYWdlICE9PSA4ICYmIHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09MiAmJiB0aGlzLmRhdGEuY291bnRQYWdlICE9PTMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5leHRQYWdlOiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIGRpZmZlcmVudCBmb3JtcyBmbG93IGZvciBkaWZmZXJlbnQgZ2VuZGVyXG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgPT0gNSkge1xuICAgICAgdGhpcy5zZXRHZW5kZXJGb3JtcygpO1xuICAgIH1cblxuICAgIC8vIERpc3BsYXkgY29ycmVzcG9uZGluZyBmb3JtcyBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgcHJlZ25hbmN5IHN0YWdlIG9wdGlvblxuICAgIHRoaXMuaGFuZGxlUHJlZ25hbmN5U3RhZ2VPcHRpb25zRm9ybXMoKTtcblxuICAgIC8vIERpc3BsYXkgY29ycmVzcG9uZGluZyBmb3JtcyBpZiBmZW1hbGUgdXNlciBpcyBwcmVnbmFudFxuICAgIHRoaXMuaGFuZGxlUHJlZ25hbnRGZW1hbGVGb3JtcygpO1xuICB9XG5cbiAgcHVibGljIGhhbmRsZVByZWduYW50RmVtYWxlRm9ybXMoKSB7XG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgPT0gNykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsIHdlaWdodEJlZm9yZVByZWduYW5jeTogdHJ1ZSB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgPT0gOCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsIHdlaWdodEJlZm9yZVByZWduYW5jeTogZmFsc2UsIG51bWJlck9mUHJlZ25hbmNpZXM6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHdlaWdodEJlZm9yZVByZWduYW5jeTogZmFsc2UsIG51bWJlck9mUHJlZ25hbmNpZXM6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVQcmVnbmFuY3lTdGFnZU9wdGlvbnNGb3JtcygpIHtcbiAgICBpZiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICfmgIDlrZXmnJ8nICYmIHRoaXMuZGF0YS5wcmVnbmFudFN0YWdlQ29uZGl0aW9uID09IHRydWUgJiYgdGhpcy5kYXRhLmR1ZURhdGVDb25kaXRpb24gPT0gZmFsc2UpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGR1ZURhdGVDb25kaXRpb246IHRydWUsIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsIHRvdGFsUGFnZTogMTAgfSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YS5wcmVnbmFudFN0YWdlQ29uZGl0aW9uID09IHRydWUgJiYgKHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5aSH5a2V5pyfJyB8fCB0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+WTuuS5s+acnycgfHwgdGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICfpg73kuI3mmK8nKSkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSArIDIsXG4gICAgICAgIHRvdGFsUGFnZTogN1xuICAgICAgfSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5oCA5a2V5pyfJyAmJiB0aGlzLmRhdGEucHJlZ25hbnRTdGFnZUNvbmRpdGlvbiA9PSB0cnVlICYmIHRoaXMuZGF0YS5kdWVEYXRlQ29uZGl0aW9uID09IHRydWUpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlLCBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiBmYWxzZSwgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UgfSk7XG5cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcHJlZ25hbmN5U3RhZ2VFdmVudChldmVudDogYW55KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAxKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+Wkh+WtleacnycsIHByZWdTdGFnZVNlbGVjdGVkOiAxLCB0b3RhbFBhZ2U6IDcgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMikge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgcHJlZ25hbmN5U3RhZ2U6ICfmgIDlrZXmnJ8nLCBwcmVnU3RhZ2VTZWxlY3RlZDogMiwgdG90YWxQYWdlOiAxMCB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAzKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+WTuuS5s+acnycsIHByZWdTdGFnZVNlbGVjdGVkOiAzLCB0b3RhbFBhZ2U6IDcgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgcHJlZ25hbmN5U3RhZ2U6ICfpg73kuI3mmK8nLCBwcmVnU3RhZ2VTZWxlY3RlZDogMCwgdG90YWxQYWdlOiA3IH0pO1xuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG5leHRQYWdlOiB0cnVlLCBlbXB0eTogZmFsc2UgfSk7XG4gIH1cblxuICBwdWJsaWMgYWN0aXZpdHlMZXZlbEV2ZW50KGV2ZW50OiBhbnkpIHtcblxuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT0gMSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgYWN0aXZpdHlMZXZlbDogJ+WNp+W6iuS8keaBrycsIGFjdGl2aXR5U2VsZWN0ZWQ6IDEgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMikge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgYWN0aXZpdHlMZXZlbDogJ+i9u+W6pu+8jOmdmeWdkOWwkeWKqCcsIGFjdGl2aXR5U2VsZWN0ZWQ6IDIgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgYWN0aXZpdHlMZXZlbDogJ+S4reW6pu+8jOW4uOW4uOi1sOWKqCcsIGFjdGl2aXR5U2VsZWN0ZWQ6IDMgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gNCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgYWN0aXZpdHlMZXZlbDogJ+mHjeW6pu+8jOi0n+mHjScsIGFjdGl2aXR5U2VsZWN0ZWQ6IDQgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gNSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgYWN0aXZpdHlMZXZlbDogJ+WJp+eDiO+8jOi2hei0n+mHjScsIGFjdGl2aXR5U2VsZWN0ZWQ6IDUgfSk7XG4gICAgfVxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZSB9KTtcbiAgfVxuXG4gIHB1YmxpYyBtZWRpY2FsQ29uZGl0aW9uKGV2ZW50OiBhbnkpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDEpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lZGljYWw6ICfns5blsL/nl4UnLCBtZWRpY2Fsc2VsZWN0ZWQ6IDEgfSk7XG4gICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT0gMikge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVkaWNhbDogJ+eUsueKtuiFuuWKn+iDveS6oui/m+eXhycsIG1lZGljYWxzZWxlY3RlZDogMiB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWRpY2FsOiAn5pegJywgbWVkaWNhbHNlbGVjdGVkOiAwIH0pO1xuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGZpbmFsUGFnZTogdHJ1ZSwgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZSB9KTtcblxuICB9XG5cbiAgLy8gcHVibGljIGdldFJESUdvYWwoKTogdm9pZCB7XG4gIC8vICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICAvLyAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJSREEoe30pLnRoZW4ocmVzcCA9PiB7XG4gIC8vICAgICB0aGlzLnJkYVVybCA9IHJlc3AucmRhX3VybDtcbiAgLy8gICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gIC8vICAgd2ViQVBJLlJldHJpZXZlUmVjb21tZW5kZWREYWlseUFsbG93YW5jZSh7fSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgLy8gICAgIGxldCBlbmVyZ3kgPSByZXNwLmVuZXJneTtcbiAgLy8gICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICAgIHJkaVZhbHVlOiBNYXRoLmZsb29yKGVuZXJneSAvIDEwMClcbiAgLy8gICAgIH0pO1xuICAvLyAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgLy8gfVxuICBwdWJsaWMgZ2V0UkRJR29hbCgpOiB2b2lkIHtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgd2ViQVBJLlJldHJpZXZlVXNlclJEQSh7fSkudGhlbihyZXNwID0+IHtcbiAgICAgIHRoaXMucmRhVXJsID0gcmVzcC5yZGFfdXJsO1xuICAgICAgaWYgKHRoaXMucmRhVXJsICE9PSBcIlwiKSB7XG4gICAgICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgICAgICB1cmw6ICcvcGFnZXMvcmRpUGFnZS9yZGlQYWdlP3VybD0nICsgdGhpcy5yZGFVcmwsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICAgIHdlYkFQSS5SZXRyaWV2ZVJlY29tbWVuZGVkRGFpbHlBbGxvd2FuY2Uoe30pLnRoZW4ocmVzcCA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBsZXQgZW5lcmd5ID0gcmVzcC5lbmVyZ3k7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICByZGlWYWx1ZTogTWF0aC5mbG9vcihlbmVyZ3kgLyAxMDApXG4gICAgICB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gIH1cblxuICBwdWJsaWMgcmVkaXJlY3RUb1JEQVBhZ2UoKSB7XG4gICAgaWYgKHRoaXMucmRhVXJsICE9PSBcIlwiKSB7XG4gICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgdXJsOiAnL3BhZ2VzL3JkaVBhZ2UvcmRpUGFnZT91cmw9JyArIHRoaXMucmRhVXJsLFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2VuZERhdGFzKCk6IHZvaWQge1xuICAgIC8vIOafpeeci+aYr+WQpuaOiOadg1xuICAgIGxldCB0b2tlbiA9IHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKTtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHRva2VuKTtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IGdlbmRlciA9IE51bWJlcih0aGF0LmRhdGEuZ2VuZGVyKTtcbiAgICBsZXQgYmlydGhZZWFyID0gTnVtYmVyKHRoYXQuZGF0YS5iaXJ0aFllYXIpO1xuICAgIGxldCBoZWlnaHQgPSBOdW1iZXIodGhhdC5kYXRhLmhlaWdodCk7XG4gICAgbGV0IHdlaWdodCA9IE51bWJlcih0aGF0LmRhdGEud2VpZ2h0KTtcbiAgICBsZXQgd2VpZ2h0QmVmb3JlUHJlZyA9IE51bWJlcih0aGF0LmRhdGEucHJlUHJlZ1dlaWdodCk7XG4gICAgbGV0IGFjdGl2aXR5U2VsZWN0ZWQgPSBOdW1iZXIodGhhdC5kYXRhLmFjdGl2aXR5U2VsZWN0ZWQpO1xuICAgIGxldCBwcmVnU3RhZ2VTZWxlY3RlZCA9IE51bWJlcih0aGF0LmRhdGEucHJlZ1N0YWdlU2VsZWN0ZWQpO1xuICAgIGxldCBtZWRpY2FsQ29uZGl0aW9uID0gTnVtYmVyKHRoYXQuZGF0YS5tZWRpY2Fsc2VsZWN0ZWQpO1xuICAgIC8vRklYTUUgc3BlY2lhbCBzZXR0aW5nIGZvciBzZXJ2ZXIgcHJlZ25hbmN5IHN0YWdlIG91dCBvZiBpbmRleCByYW5nZSBzZXR0aW5nXG4gICAgaWYgKHByZWdTdGFnZVNlbGVjdGVkIDwgMCB8fCBwcmVnU3RhZ2VTZWxlY3RlZCA+IDMpIHtcbiAgICAgIHByZWdTdGFnZVNlbGVjdGVkID0gMDtcbiAgICB9XG5cbiAgICBsZXQgcHJlZ19iaXJ0aF9kYXRlID0gdGhpcy5kYXRhLnllYXIgKyBcIi1cIiArIHRoaXMuZGF0YS5tb250aCArIFwiLVwiICsgdGhpcy5kYXRhLmRhdGU7XG5cbiAgICAvLyBsZXQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG4gICAgLy8gd3guc2hvd01vZGFsKHsgdGl0bGU6IFwiXCIsIGNvbnRlbnQ6IFwiXCIgKyBtb21lbnQoW051bWJlcih0aGF0LmRhdGEueWVhciksIE51bWJlcih0aGF0LmRhdGEubW9udGgpIC0gMSwgTnVtYmVyKHRoYXQuZGF0YS5kYXRlKV0pIH0pIFxuXG4gICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICBpZiAocmVzLmF1dGhTZXR0aW5nWydzY29wZS51c2VySW5mbyddKSB7XG4gICAgICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICBsZXQgdXNlckluZm8gPSByZXMudXNlckluZm87XG4gICAgICAgICAgICAgIGxldCBuaWNrTmFtZSA9IHVzZXJJbmZvLm5pY2tOYW1lO1xuICAgICAgICAgICAgICBsZXQgYXZhdGFyVXJsID0gdXNlckluZm8uYXZhdGFyVXJsO1xuICAgICAgICAgICAgICBsZXQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG4gICAgICAgICAgICAgIGxldCB1cGRhdGVVc2VyUHJvZmlsZVJlcSA9IHtcbiAgICAgICAgICAgICAgICBnZW5kZXI6IGdlbmRlcixcbiAgICAgICAgICAgICAgICB5ZWFyX29mX2JpcnRoOiBiaXJ0aFllYXIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICAgICAgd2VpZ2h0OiB3ZWlnaHQsXG4gICAgICAgICAgICAgICAgd2VpZ2h0X2JlZm9yZV9wcmVnbmFuY3k6IHdlaWdodEJlZm9yZVByZWcsXG4gICAgICAgICAgICAgICAgYWN0aXZpdHlfbGV2ZWw6IGFjdGl2aXR5U2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgcHJlZ25hbmN5X3N0YWdlOiBwcmVnU3RhZ2VTZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBleHBlY3RlZF9iaXJ0aF9kYXRlOiBtb21lbnQoW051bWJlcih0aGF0LmRhdGEueWVhciksIE51bWJlcih0aGF0LmRhdGEubW9udGgpIC0gMSwgTnVtYmVyKHRoYXQuZGF0YS5kYXRlKV0pIC8gMTAwMCxcbiAgICAgICAgICAgICAgICBuaWNrbmFtZTogbmlja05hbWUsXG4gICAgICAgICAgICAgICAgYXZhdGFyX3VybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIHRpbWVzX29mX3ByZWduYW5jeTogdGhhdC5kYXRhLm51bVByZWdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiIH0pO1xuICAgICAgICAgICAgICB3ZWJBUEkuVXBkYXRlVXNlclByb2ZpbGUodXBkYXRlVXNlclByb2ZpbGVSZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgICAgICAgdGhhdC5nZXRSRElHb2FsKCk7XG4gICAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiAn5pu05paw55So5oi35L+h5oGv5aSx6LSlJyxcbiAgICAgICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIGxldCB1cGRhdGVNZWRpY2FsUHJvZmlsZVJlcSA9IHtcbiAgICAgICAgICAgICAgICBmb29kX2FsbGVyZ3lfaWRzOiBbXSxcbiAgICAgICAgICAgICAgICBtZWRpY2FsX2NvbmRpdGlvbl9pZHM6IFttZWRpY2FsQ29uZGl0aW9uXSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobWVkaWNhbENvbmRpdGlvbiAhPSAwKSB7XG4gICAgICAgICAgICAgICAgd2ViQVBJLlVwZGF0ZU1lZGljYWxQcm9maWxlKHVwZGF0ZU1lZGljYWxQcm9maWxlUmVxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6ICcuLi9sb2dpbi9pbmRleD91c2VyX3N0YXR1cz0yJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy9yZWNvcmQgdGhlIG9uQm9hcmQgbGFzdCBzdGVwIHRpbWVzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCdvbmJvYXJkX2xhc3Rfc3RlcCcsIHtcbiAgICAgIGNvdW50czogJ2NvdW50cycsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgY29uZmlybVN1Ym1pdCgpIHtcbiAgICB3eC5yZUxhdW5jaCh7XG4gICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvaG9tZS9pbmRleFwiLFxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcHJlQnV0dG9uMjM0KCl7XG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2U9PTIpe1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgIGdlbmRlcjogMCxcbiAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSAzKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgaGVpZ2h0OiAxNTAsXG4gICAgICAgIHdlaWdodDogNDcuMyxcbiAgICAgICAgd2VpZ2h0VmFsOiBbMTczXSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgICAgeWVhckRpc3BsYXk6ICd5ZWFyRGlzcGxheScsXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA0KSB7XG4gICAgICBsZXQgd2VpZ2h0Qk1JID0gTnVtYmVyKCgyMSAqIHRoaXMuZGF0YS5oZWlnaHQgLyAxMDAgKiB0aGlzLmRhdGEuaGVpZ2h0IC8gMTAwKS50b0ZpeGVkKDEpKTtcbiAgICAgIGxldCB3ZWlnaHRWYWwgPSBbTnVtYmVyKCgod2VpZ2h0Qk1JIC0gMzApIC8gMC4xKS50b0ZpeGVkKDEpKV07XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgd2VpZ2h0OiB3ZWlnaHRCTUksXG4gICAgICAgIHdlaWdodFZhbDogd2VpZ2h0VmFsLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgICB5ZWFyRGlzcGxheTogJ3llYXJEaXNwbGF5JyxcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIHB1YmxpYyBwcmVCdXR0b25QcmVnbmFudEFuZE5vdER1ZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAyLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgYmlydGhZZWFyOiAxOTkxLFxuICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXlcIixcblxuICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICAgIHByZWduYW5jeVN0YWdlOiAnJyxcbiAgICAgIHByZWdTdGFnZVNlbGVjdGVkOjQsIFxuICAgIH0pIFxuICB9XG5cbiAgcHVibGljIHByZUJ1dHRvbkR1ZURhdGVDb25kaXRpb24oKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgICB0b3RhbFBhZ2U6IDcsXG5cbiAgICAgIGR1ZURhdGVDb25kaXRpb246ZmFsc2UsXG4gICAgICBkYXRlUGlja2VyOiBcImRhdGVQaWNrZXJcIixcbiAgICAgIHllYXI6ICcyMDE5JyxcbiAgICAgIG1vbnRoOiAnMTAnLFxuICAgICAgZGF0ZTogJzEnLFxuXG4gICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiB0cnVlLFxuICAgICAgcHJlZ25hbmN5U3RhZ2U6ICcnLFxuICAgICAgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDQsXG5cbiAgICB9KSBcbiAgfVxuXG4gIHB1YmxpYyB3ZWlnaHRCZWZvcmVQcmVnbmFuY3lCYWNrKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICBwcmVQcmVnV2VpZ2h0OiAwLFxuICAgICAgZHVlRGF0ZUNvbmRpdGlvbjogdHJ1ZSwgXG4gICAgICB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IGZhbHNlLFxuXG4gICAgICBkYXRlUGlja2VyOiBcImRhdGVQaWNrZXJcIixcbiAgICAgIHllYXI6ICcyMDE5JyxcbiAgICAgIG1vbnRoOiAnMTAnLFxuICAgICAgZGF0ZTogJzEnLFxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgbnVtYmVyT2ZQcmVnbmFuY2llc1ByZSgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgIG51bVByZWc6IDEsXG4gICAgICBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSwgXG4gICAgICB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IHRydWUsIFxuICAgICAgbnVtYmVyT2ZQcmVnbmFuY2llczogZmFsc2UsXG5cbiAgICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBwcmVCdXR0b245KCl7XG4gICAgLy8g55S355SfXG4gICAgaWYgKHRoaXMuZGF0YS5nZW5kZXI9PT0xKXtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDUsXG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgICAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuXG4gICAgICAgIGJpcnRoWWVhcjogMTk5MSxcbiAgICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXlcIixcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICAvLyDlpbPnlJ9cbiAgICAgIGlmICh0aGlzLmRhdGEuYmlydGhZZWFyID49IDIwMDMpe1xuICAgICAgICAvLyDlubTpvoTlsI/vvIzmsqHmnInmu6HotrPmgIDlrZXlubTpvoTmnaHku7bnmoTlpbPlralcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSA1LFxuICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICAgICAgdG90YWxQYWdlOjcsXG5cbiAgICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuXG4gICAgICAgICAgYmlydGhZZWFyOiAxOTkxLFxuICAgICAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG4gICAgICAgIH0pXG5cbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDmu6HotrPmgIDlrZXlubTpvoTmnaHku7bnmoTlpbPnlJ9cbiAgICAgICAgaWYgKHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5oCA5a2V5pyfJyl7XG4gICAgICAgICAgLy8g6YCJ5oup5LqGXCLmgIDlrZXmnJ9cIueahOWls+eUn1xuICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgICAgICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgICAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcbiAgICAgICAgICAgIG51bWJlck9mUHJlZ25hbmNpZXM6IHRydWUsXG5cbiAgICAgICAgICAgIG51bVByZWc6IDEsXG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8g6YCJ5oup5LqG6Z2eXCLmgIDlrZXmnJ9cIueahOWls+eUn1xuICAgICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAzLFxuICAgICAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgICAgICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgICAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcbiAgICAgICAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246dHJ1ZSxcbiAgICAgICAgICAgIGR1ZURhdGVDb25kaXRpb246ZmFsc2UsXG5cbiAgICAgICAgICAgIHByZWduYW5jeVN0YWdlOiAnJyxcbiAgICAgICAgICAgIHByZWdTdGFnZVNlbGVjdGVkOiA0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHVibGljIHByZUJ1dHRvbjEwKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgIGVtcHR5OmZhbHNlLFxuXG4gICAgICBtZWRpY2FsOiAnJywgXG4gICAgICBtZWRpY2Fsc2VsZWN0ZWQ6IDUsXG5cbiAgICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcbiAgICB9KVxuICB9XG59XG5cblBhZ2UobmV3IG9uQm9hcmQoKSk7XG4iXX0=