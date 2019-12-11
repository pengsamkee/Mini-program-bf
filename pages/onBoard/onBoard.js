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
                            console.log(updateUserProfileReq);
                            webAPI.UpdateUserProfile(updateUserProfileReq).then(function (resp) {
                                that.getRDIGoal();
                            }).catch(function (err) {
                                console.log(err);
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
                        url: '../invitation/invitation?user_status=2'
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
            url: "../../pages/foodDiary/index",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25Cb2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9uQm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QixpREFBbUQ7QUFFbkQsaURBQWtEO0FBR2xEO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixXQUFXLEVBQUUsYUFBYTtZQUMxQixVQUFVLEVBQUUsWUFBWTtZQUN4QixjQUFjLEVBQUUsU0FBUztZQUN6QixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIscUJBQXFCLEVBQUUsS0FBSztZQUM1QixtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLFNBQVMsRUFBRSxDQUFDO1lBQ1osU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsS0FBSztZQUNaLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxFQUFFLEdBQUc7WUFDWCxTQUFTLEVBQUMsQ0FBQyxHQUFHLENBQUM7WUFDZixTQUFTLEVBQUUsRUFBRTtZQUNiLFNBQVMsRUFBQyxDQUFDO1lBQ1gsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFDLEVBQUU7WUFDWixjQUFjLEVBQUUsRUFBRTtZQUNsQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1lBQ1YsU0FBUyxFQUFFLENBQUM7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLEdBQUc7WUFDVCxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVCxhQUFhLEVBQUUsRUFBRTtZQUNqQixnQkFBZ0IsRUFBRSxDQUFD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QUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztZQUN0QyxRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBQyxLQUFLO1lBRVgsT0FBTyxFQUFFLEVBQUU7WUFDWCxlQUFlLEVBQUUsQ0FBQztZQUVsQixhQUFhLEVBQUUsRUFBRTtZQUNqQixnQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDSCxjQUFDO0FBQUQsQ0FBQyxBQTV4QkQsSUE0eEJDO0FBRUQsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSU15QXBwIH0gZnJvbSAnLi4vLi4vYXBwJ1xuaW1wb3J0IHsgZXBvY2ggfSBmcm9tICcuLi8uLi91dGlscy91dGlsJ1xuXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IE1pbmlQcm9ncmFtTG9naW4gfSBmcm9tICcuLi8uLi9hcGkvbG9naW4vTG9naW5TZXJ2aWNlJztcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nXG5pbXBvcnQgeyBVcGRhdGVVc2VyUHJvZmlsZVJlcSwgVXBkYXRlTWVkaWNhbFByb2ZpbGUgfSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzJztcblxuY2xhc3Mgb25Cb2FyZCB7XG5cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXlcIixcbiAgICBkYXRlUGlja2VyOiBcImRhdGVQaWNrZXJcIixcbiAgICB0ZXh0SW5wdXRDbGFzczogXCJzZWN0aW9uXCIsXG4gICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICB3ZWlnaHRCZWZvcmVQcmVnbmFuY3k6IGZhbHNlLFxuICAgIG51bWJlck9mUHJlZ25hbmNpZXM6IGZhbHNlLFxuICAgIGNvdW50UGFnZTogMCxcbiAgICBmaW5hbFBhZ2U6IGZhbHNlLFxuICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICBlbXB0eTogZmFsc2UsXG4gICAgZ2VuZGVyOiAwLFxuICAgIGhlaWdodDogMTUwLFxuICAgIGhlaWdodFZhbDpbMTEwXSxcbiAgICBoZWlnaHRBcnI6IFtdLFxuICAgIHdlaWdodEJNSTowLFxuICAgIHdlaWdodDogNDcuMyxcbiAgICB3ZWlnaHRWYWw6IFsxNzNdLFxuICAgIHdlaWdodEFycjpbXSxcbiAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDQsXG4gICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICBudW1QcmVnOiAxLFxuICAgIHRvZGF5WWVhcjogMCxcbiAgICB5ZWFyOiAnMjAxOScsXG4gICAgbW9udGg6ICcxMCcsXG4gICAgZGF0ZTogJzEnLFxuICAgIHllYXJzOiBbMF0sXG4gICAgbW9udGhzOiBbOV0sXG4gICAgZGF5czogWzBdLFxuICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgbWVkaWNhbDogJycsXG4gICAgbWVkaWNhbHNlbGVjdGVkOiA1LFxuICAgIGlucHV0VmFsaWRhdGU6ICfor7fovpPlhaXkvaDnmoTnrZTmoYgnLFxuICAgIG9wdGlvbnNWYWxpZGF0ZTogJ+ivt+mAieaLqeS9oOeahOetlOahiCcsXG4gICAgLy8gaGVpZ2h0VmFsaWRhdGU6ICfor7flnKg0MC0yMzDljpjnsbPojIPlm7TlhoXovpPlhaXmgqjnmoTouqvpq5gnLFxuICAgIC8vIHdlaWdodFZhbGlkYXRlOiAn6K+35ZyoMzAtMzAw5Y2D5YWL6IyD5Zu05YaF6L6T5YWl5oKo55qE5L2T6YeNJyxcbiAgICBleHBlY3RlZERhdGVWYWxpZGF0ZTogJ+ivt+WcqOS7iuWkqeWIsOacquadpTQ15ZGo55qE5pel5pyf5YaF6YCJ5oup5oKo55qE6aKE5Lqn5pyfJyxcbiAgICBhZ2VWYWxpZGF0ZTogJ+ivt+ehruS/neaCqOeahOW5tOm+hOWcqDEtMTAw5bKB6IyD5Zu05YaFJyxcbiAgICByZGlHb2FsOiAyMDAwLFxuICAgIGJpcnRoVmFsOiBbNzJdLFxuICAgIHByZWduYW5jeU51bVZhbDogWzBdLFxuICAgIGJpcnRoWWVhcnM6IFtdLFxuICAgIGJpcnRoWWVhcjogMTk5MSxcbiAgICBudW1QcmVnT3B0aW9uczogWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwXSxcbiAgICB0b3RhbFBhZ2U6IDcsXG4gICAgY3VycmVudFBhZ2U6IDEsXG4gICAgbmlja05hbWU6IFwiXCIsXG4gICAgYXZhdGFyVXJsOiBcIlwiLFxuICAgIHJkaVZhbHVlOiBcIiBcIixcbiAgfVxuICBwdWJsaWMgbGFzdFRpbWUgPSAwOyAvLyDpmLvmraLnlKjmiLfov57nu63lv6vpgJ/ngrnlh7tcblxuICBwdWJsaWMgcmRhVXJsID0gXCJcIjtcblxuICBwdWJsaWMgZ2VuZGVyRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICB9KTtcblxuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT0gXCLnlLdcIikge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdG90YWxQYWdlOiA2LFxuICAgICAgICBnZW5kZXI6IDFcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICB0b3RhbFBhZ2U6IDcsXG4gICAgICAgIGdlbmRlcjogMixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKTogdm9pZCB7XG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuWfuuacrOS/oeaBr1wiXG4gICAgfSk7XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuc2V0QmlydGhZZWFyUGlja2VyKHRvZGF5KTtcbiAgICB0aGlzLnNldER1ZURhdGVQaWNrZXIodG9kYXkpO1xuICAgIHRoaXMuaW5pdEhlaWdodEFycigpO1xuICAgIHRoaXMuaW5pdFdlaWdodEFycigpO1xuICB9XG5cbiAgLyoqXG4gICAqIOW+queOr+iOt+W+l2hlaWdodEFyclxuICAgKi9cbiAgcHVibGljIGluaXRIZWlnaHRBcnIoKXtcbiAgICBsZXQgaGVpZ2h0QXJyOk51bWJlcltdID0gW11cbiAgICBmb3IobGV0IGk9NDA7aTw9MjMwO2krKyl7XG4gICAgICBoZWlnaHRBcnIucHVzaChpKVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgaGVpZ2h0QXJyOiBoZWlnaHRBcnJcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiDlvqrnjq/ojrflvpd3ZWlnaHRBcnJcbiAgICovXG4gIHB1YmxpYyBpbml0V2VpZ2h0QXJyKCkge1xuICAgIGxldCB3ZWlnaHRBcnI6IE51bWJlcltdID0gW11cbiAgICBmb3IgKGxldCBpID0gMzA7IGkgPD0gMzAwOyBpKz0wLjEpIHtcbiAgICAgIHdlaWdodEFyci5wdXNoKE51bWJlcihpLnRvRml4ZWQoMSkpKVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgd2VpZ2h0QXJyOiB3ZWlnaHRBcnJcbiAgICB9KVxuICB9XG4gIC8vIFNldCB0aGUgcGlja2VyIG9wdGlvbnMgZm9yIHByZWduYW5jeSBkdWUgZGF0ZVxuICBwdWJsaWMgc2V0RHVlRGF0ZVBpY2tlcih0b2RheTogYW55KTogdm9pZCB7XG4gICAgbGV0IGR1ZVllYXIgPSBbXTtcbiAgICBsZXQgZHVlTW9udGggPSBbXTtcbiAgICBsZXQgZHVlRGF5cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IHRvZGF5LmdldEZ1bGxZZWFyKCk7IGkgPD0gdG9kYXkuZ2V0RnVsbFllYXIoKSArIDI7IGkrKykge1xuICAgICAgZHVlWWVhci5wdXNoKGkpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTI7IGkrKykge1xuICAgICAgZHVlTW9udGgucHVzaChpKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDMxOyBpKyspIHtcbiAgICAgIGR1ZURheXMucHVzaChpKVxuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHllYXJzOiBkdWVZZWFyLCBtb250aHM6IGR1ZU1vbnRoLCBkYXlzOiBkdWVEYXlzIH0pO1xuICB9XG5cbiAgLy8gU2V0IHRoZSBwaWNrZXIgb3B0aW9ucyBmb3IgYmlydGggeWVhclxuICBwdWJsaWMgc2V0QmlydGhZZWFyUGlja2VyKHRvZGF5OiBhbnkpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxLCB0b2RheVllYXI6IHRvZGF5LmdldEZ1bGxZZWFyKCkgLSAxIH0pO1xuXG4gICAgbGV0IHllYXJzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMTkxOTsgaSA8PSB0b2RheS5nZXRGdWxsWWVhcigpIC0gMTsgaSsrKSB7XG4gICAgICB5ZWFycy5wdXNoKGkpO1xuICAgIH1cblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGJpcnRoWWVhcnM6IHllYXJzIH0pO1xuICB9XG5cbiAgLy8gTWV0aG9kIHRvIGhhbmRsZSBzdHlsaW5nIG9mIFdlQ2hhdCBpbnB1dFxuICBwdWJsaWMgZm9jdXNJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvbi1pbnB1dFwiIH0pO1xuICB9XG4gIC8vIOaNouaIkOS6hnBpY2tlcu+8jOWmguaenHBpY2tlcuayoemXrumimO+8jOWQjue7reS4i+mdoueahOS7o+eggeWPr+S7peWIoOmZpFxuICAvLyBIYW5kbGUgdGhlIGhlaWdodCBpbnB1dCBldmVudFxuICAvLyBwdWJsaWMgYmluZEhlaWdodElucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgLy8gICB0aGlzLmZvY3VzSW5wdXQoZXZlbnQpO1xuXG4gIC8vICAgbGV0IGhlaWdodElucHV0ID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gIC8vICAgaWYgKGhlaWdodElucHV0ID49IDQwICYmIGhlaWdodElucHV0IDw9IDIzMCAmJiBoZWlnaHRJbnB1dCAhPSBcIlwiKSB7XG5cbiAgLy8gICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGhlaWdodDogaGVpZ2h0SW5wdXQsIG5leHRQYWdlOiB0cnVlLCBlbXB0eTogZmFsc2UgfSk7XG5cbiAgLy8gICB9IGVsc2Uge1xuXG4gIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogZmFsc2UsIGVtcHR5OiBmYWxzZSB9KTtcblxuICAvLyAgICAgaWYgKGhlaWdodElucHV0ID09IFwiXCIpIHtcbiAgLy8gICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiIH0pO1xuICAvLyAgICAgfVxuXG4gIC8vICAgfVxuICAvLyB9XG4gIHB1YmxpYyBiaW5kSGVpZ2h0U2VsZWN0KGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgdmFsID0gZXZlbnQuZGV0YWlsLnZhbHVlWzBdO1xuICAgIGxldCBoZWlnaHQgPSB0aGlzLmRhdGEuaGVpZ2h0QXJyW3ZhbF07XG4gICAgbGV0IHdlaWdodEJNSSA9IE51bWJlcigoMjEgKiBoZWlnaHQvMTAwICogaGVpZ2h0LzEwMCkudG9GaXhlZCgxKSk7XG4gICAgbGV0IHdlaWdodFZhbCA9IFtOdW1iZXIoKCh3ZWlnaHRCTUkgLSAzMCkgLyAwLjEpLnRvRml4ZWQoMSkpXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXktaW5wdXRcIixcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgICB3ZWlnaHQ6IHdlaWdodEJNSSxcbiAgICAgIHdlaWdodFZhbDp3ZWlnaHRWYWxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kV2VpZ2h0U2VsZWN0KGV2ZW50OmFueSl7XG4gICAgbGV0IHZhbCA9IGV2ZW50LmRldGFpbC52YWx1ZVswXTtcbiAgICBsZXQgd2VpZ2h0ID0gdGhpcy5kYXRhLndlaWdodEFyclt2YWxdO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheS1pbnB1dFwiLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHQsXG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuICAvLyDmjaLmiJDkuoZwaWNrZXLvvIzlpoLmnpxwaWNrZXLmsqHpl67popjvvIzlkI7nu63kuIvpnaLnmoTku6PnoIHlj6/ku6XliKDpmaRcbiAgLy8gSGFuZGxlIHRoZSB3ZWlnaHQgaW5wdXQgZXZlbnRcbiAgLy8gcHVibGljIGJpbmRXZWlnaHRJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gIC8vICAgdGhpcy5mb2N1c0lucHV0KGV2ZW50KTtcblxuICAvLyAgIGxldCB3ZWlnaHRJbnB1dCA9IGV2ZW50LmRldGFpbC52YWx1ZTtcblxuICAvLyAgIGlmICh3ZWlnaHRJbnB1dCA+PSAzMCAmJiB3ZWlnaHRJbnB1dCA8PSAzMDAgJiYgd2VpZ2h0SW5wdXQgIT0gXCJcIikge1xuXG4gIC8vICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAvLyAgICAgICB3ZWlnaHQ6IHdlaWdodElucHV0LFxuICAvLyAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgLy8gICAgICAgZW1wdHk6IGZhbHNlXG4gIC8vICAgICB9KTtcblxuICAvLyAgIH0gZWxzZSB7XG5cbiAgLy8gICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gIC8vICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgLy8gICAgICAgZW1wdHk6IGZhbHNlXG4gIC8vICAgICB9KTtcblxuICAvLyAgICAgaWYgKHdlaWdodElucHV0ID09IFwiXCIpIHtcblxuICAvLyAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB0ZXh0SW5wdXRDbGFzczogXCJzZWN0aW9uXCIgfSk7XG5cbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBIYW5kbGUgdGhlIGFnZSBpbnB1dCBldmVudFxuICBwdWJsaWMgYmluZEFnZUlucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgdmFsID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgbGV0IGJpcnRoWWVhciA9IHRoaXMuZGF0YS5iaXJ0aFllYXJzW3ZhbF07XG5cbiAgICBsZXQgYWdlID0gdGhpcy5kYXRhLnRvZGF5WWVhciAtIGJpcnRoWWVhcjtcblxuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5LWlucHV0XCIgfSk7XG5cbiAgICBpZiAoYWdlID49IDEgJiYgYWdlIDw9IDEwMCkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBiaXJ0aFllYXI6IGJpcnRoWWVhcixcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgYmlydGhZZWFyOiBiaXJ0aFllYXIsXG4gICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbmV4dFN1Ym1pdCgpIHtcbiAgICAvLyDlhYjov5vooYzoioLmtYHvvIzpgb/lhY3nlKjmiLfngrnlh7vov4flv6tcbiAgICBsZXQgbm93VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGlmIChub3dUaW1lIC0gdGhpcy5sYXN0VGltZT4xMDAwKXtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBub3dUaW1lXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmxhc3RUaW1lID0gbm93VGltZVxuICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgdGl0bGU6ICfor7forqTnnJ/loavlhpknLFxuICAgICAgICBpY29uOiAnbm9uZScsXG4gICAgICAgIGR1cmF0aW9uOiAxMDAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGF0YS5kdWVEYXRlQ29uZGl0aW9uKSB7XG4gICAgICAvL2NoZWNrIHRoZSBleHBlY3RlZCBiaXJ0aCBkYXRlIGhlcmVcbiAgICAgIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAgIGxldCBleHBlY3RlZEJpcnRoRGF0ZSA9IG1vbWVudChbTnVtYmVyKHRoaXMuZGF0YS55ZWFyKSwgTnVtYmVyKHRoaXMuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhpcy5kYXRhLmRhdGUpXSkgLyAxMDAwO1xuICAgICAgbGV0IHRvZGF5ID0gbW9tZW50KCkgLyAxMDAwO1xuICAgICAgaWYgKHRvZGF5ID4gZXhwZWN0ZWRCaXJ0aERhdGUpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZW1wdHk6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIixcbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5uZXh0UGFnZSA9PSB0cnVlKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlICsgMVxuICAgICAgfSk7XG4gICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGVtcHR5OiB0cnVlIH0pO1xuICAgIH1cbiAgICAvLyAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogZmFsc2UgfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgPT0gMTEpIHtcbiAgICAgIHRoaXMuc2VuZERhdGFzKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gSGFuZGxlcyB0aGUgcHJlZ25hbmN5IGR1ZSBkYXRlIHBpY2tlciBldmVudFxuICBwdWJsaWMgYmluZERhdGVDaGFuZ2UoZXZlbnQ6IGFueSkge1xuICAgIGxldCB2YWwgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyLWlucHV0XCIsXG4gICAgICB5ZWFyOiB0aGlzLmRhdGEueWVhcnNbdmFsWzBdXSxcbiAgICAgIG1vbnRoOiB0aGlzLmRhdGEubW9udGhzW3ZhbFsxXV0sXG4gICAgICBkYXRlOiB0aGlzLmRhdGEuZGF5c1t2YWxbMl1dLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRCZWZvcmVQcmVnV2VpZ2h0SW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNJbnB1dChldmVudCk7XG5cbiAgICBsZXQgcHJlV2VpZ2h0SW5wdXQgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICBpZiAocHJlV2VpZ2h0SW5wdXQgIT0gbnVsbCAmJiBwcmVXZWlnaHRJbnB1dCAhPSBcIlwiKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZVByZWdXZWlnaHQ6IHByZVdlaWdodElucHV0LFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgaWYgKHByZVdlaWdodElucHV0ID09IFwiXCIpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBiaW5kTnVtUHJlZ0lucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcblxuICAgIGxldCBudW1QcmVnID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgaWYgKG51bVByZWcgPT0gbnVsbCkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBudW1QcmVnOiAwLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG51bVByZWc6IE51bWJlcihudW1QcmVnKSArIDEsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldEdlbmRlckZvcm1zKCkge1xuICAgIGlmICh0aGlzLmRhdGEuYmlydGhZZWFyIDwgMjAwMyAmJiB0aGlzLmRhdGEuZ2VuZGVyID09IDIpIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICAgICAgdG90YWxQYWdlOiA3LFxuICAgICAgfSk7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSArIDEgfSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgNCxcbiAgICAgICAgdG90YWxQYWdlOiA2LFxuICAgICAgfSk7XG5cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25DaGFuZ2UoKSB7XG4gICAgLy8gSGFuZGxlcyBuZXh0IHBhZ2UgdmFsaWRhdGlvblxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlICE9PSA0ICYmIHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09IDggJiYgdGhpcy5kYXRhLmNvdW50UGFnZSAhPT0yICYmIHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09Mykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgZGlmZmVyZW50IGZvcm1zIGZsb3cgZm9yIGRpZmZlcmVudCBnZW5kZXJcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA1KSB7XG4gICAgICB0aGlzLnNldEdlbmRlckZvcm1zKCk7XG4gICAgfVxuXG4gICAgLy8gRGlzcGxheSBjb3JyZXNwb25kaW5nIGZvcm1zIGFjY29yZGluZyB0byBzZWxlY3RlZCBwcmVnbmFuY3kgc3RhZ2Ugb3B0aW9uXG4gICAgdGhpcy5oYW5kbGVQcmVnbmFuY3lTdGFnZU9wdGlvbnNGb3JtcygpO1xuXG4gICAgLy8gRGlzcGxheSBjb3JyZXNwb25kaW5nIGZvcm1zIGlmIGZlbWFsZSB1c2VyIGlzIHByZWduYW50XG4gICAgdGhpcy5oYW5kbGVQcmVnbmFudEZlbWFsZUZvcm1zKCk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlUHJlZ25hbnRGZW1hbGVGb3JtcygpIHtcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA3KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSwgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiB0cnVlIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA4KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSwgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSwgbnVtYmVyT2ZQcmVnbmFuY2llczogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSwgbnVtYmVyT2ZQcmVnbmFuY2llczogZmFsc2UgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGhhbmRsZVByZWduYW5jeVN0YWdlT3B0aW9uc0Zvcm1zKCkge1xuICAgIGlmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+aAgOWtleacnycgJiYgdGhpcy5kYXRhLnByZWduYW50U3RhZ2VDb25kaXRpb24gPT0gdHJ1ZSAmJiB0aGlzLmRhdGEuZHVlRGF0ZUNvbmRpdGlvbiA9PSBmYWxzZSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZHVlRGF0ZUNvbmRpdGlvbjogdHJ1ZSwgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSwgdG90YWxQYWdlOiAxMCB9KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLnByZWduYW50U3RhZ2VDb25kaXRpb24gPT0gdHJ1ZSAmJiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICflpIflrZXmnJ8nIHx8IHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5ZO65Lmz5pyfJyB8fCB0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+mDveS4jeaYrycpKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IGZhbHNlLFxuICAgICAgICBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgMixcbiAgICAgICAgdG90YWxQYWdlOiA3XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICfmgIDlrZXmnJ8nICYmIHRoaXMuZGF0YS5wcmVnbmFudFN0YWdlQ29uZGl0aW9uID09IHRydWUgJiYgdGhpcy5kYXRhLmR1ZURhdGVDb25kaXRpb24gPT0gdHJ1ZSkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UsIHByZWduYW50U3RhZ2VDb25kaXRpb246IGZhbHNlLCBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSB9KTtcblxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwcmVnbmFuY3lTdGFnZUV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDEpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn5aSH5a2V5pyfJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDEsIHRvdGFsUGFnZTogNyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+aAgOWtleacnycsIHByZWdTdGFnZVNlbGVjdGVkOiAyLCB0b3RhbFBhZ2U6IDEwIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn5ZO65Lmz5pyfJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDMsIHRvdGFsUGFnZTogNyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+mDveS4jeaYrycsIHByZWdTdGFnZVNlbGVjdGVkOiAwLCB0b3RhbFBhZ2U6IDcgfSk7XG4gICAgfVxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZSB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhY3Rpdml0eUxldmVsRXZlbnQoZXZlbnQ6IGFueSkge1xuXG4gICAgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAxKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Y2n5bqK5LyR5oGvJywgYWN0aXZpdHlTZWxlY3RlZDogMSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn6L275bqm77yM6Z2Z5Z2Q5bCR5YqoJywgYWN0aXZpdHlTZWxlY3RlZDogMiB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAzKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Lit5bqm77yM5bi45bi46LWw5YqoJywgYWN0aXZpdHlTZWxlY3RlZDogMyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSA0KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn6YeN5bqm77yM6LSf6YeNJywgYWN0aXZpdHlTZWxlY3RlZDogNCB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSA1KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Ymn54OI77yM6LaF6LSf6YeNJywgYWN0aXZpdHlTZWxlY3RlZDogNSB9KTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuICB9XG5cbiAgcHVibGljIG1lZGljYWxDb25kaXRpb24oZXZlbnQ6IGFueSkge1xuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT0gMSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVkaWNhbDogJ+ezluWwv+eXhScsIG1lZGljYWxzZWxlY3RlZDogMSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWRpY2FsOiAn55Sy54q26IW65Yqf6IO95Lqi6L+b55eHJywgbWVkaWNhbHNlbGVjdGVkOiAyIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lZGljYWw6ICfml6AnLCBtZWRpY2Fsc2VsZWN0ZWQ6IDAgfSk7XG4gICAgfVxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZmluYWxQYWdlOiB0cnVlLCBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuXG4gIH1cblxuICAvLyBwdWJsaWMgZ2V0UkRJR29hbCgpOiB2b2lkIHtcbiAgLy8gICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIC8vICAgd2ViQVBJLlJldHJpZXZlVXNlclJEQSh7fSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgIHRoaXMucmRhVXJsID0gcmVzcC5yZGFfdXJsO1xuICAvLyAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgLy8gICB3ZWJBUEkuUmV0cmlldmVSZWNvbW1lbmRlZERhaWx5QWxsb3dhbmNlKHt9KS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgbGV0IGVuZXJneSA9IHJlc3AuZW5lcmd5O1xuICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgICAgcmRpVmFsdWU6IE1hdGguZmxvb3IoZW5lcmd5IC8gMTAwKVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICAvLyB9XG4gIHB1YmxpYyBnZXRSRElHb2FsKCk6IHZvaWQge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICB3ZWJBUEkuUmV0cmlldmVVc2VyUkRBKHt9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhpcy5yZGFVcmwgPSByZXNwLnJkYV91cmw7XG4gICAgICBpZiAodGhpcy5yZGFVcmwgIT09IFwiXCIpIHtcbiAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgIHVybDogJy9wYWdlcy9yZGlQYWdlL3JkaVBhZ2U/dXJsPScgKyB0aGlzLnJkYVVybCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gICAgd2ViQVBJLlJldHJpZXZlUmVjb21tZW5kZWREYWlseUFsbG93YW5jZSh7fSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGxldCBlbmVyZ3kgPSByZXNwLmVuZXJneTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJkaVZhbHVlOiBNYXRoLmZsb29yKGVuZXJneSAvIDEwMClcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyByZWRpcmVjdFRvUkRBUGFnZSgpIHtcbiAgICBpZiAodGhpcy5yZGFVcmwgIT09IFwiXCIpIHtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICB1cmw6ICcvcGFnZXMvcmRpUGFnZS9yZGlQYWdlP3VybD0nICsgdGhpcy5yZGFVcmwsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZW5kRGF0YXMoKTogdm9pZCB7XG4gICAgLy8g5p+l55yL5piv5ZCm5o6I5p2DXG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgZ2VuZGVyID0gTnVtYmVyKHRoYXQuZGF0YS5nZW5kZXIpO1xuICAgIGxldCBiaXJ0aFllYXIgPSBOdW1iZXIodGhhdC5kYXRhLmJpcnRoWWVhcik7XG4gICAgbGV0IGhlaWdodCA9IE51bWJlcih0aGF0LmRhdGEuaGVpZ2h0KTtcbiAgICBsZXQgd2VpZ2h0ID0gTnVtYmVyKHRoYXQuZGF0YS53ZWlnaHQpO1xuICAgIGxldCB3ZWlnaHRCZWZvcmVQcmVnID0gTnVtYmVyKHRoYXQuZGF0YS5wcmVQcmVnV2VpZ2h0KTtcbiAgICBsZXQgYWN0aXZpdHlTZWxlY3RlZCA9IE51bWJlcih0aGF0LmRhdGEuYWN0aXZpdHlTZWxlY3RlZCk7XG4gICAgbGV0IHByZWdTdGFnZVNlbGVjdGVkID0gTnVtYmVyKHRoYXQuZGF0YS5wcmVnU3RhZ2VTZWxlY3RlZCk7XG4gICAgbGV0IG1lZGljYWxDb25kaXRpb24gPSBOdW1iZXIodGhhdC5kYXRhLm1lZGljYWxzZWxlY3RlZCk7XG4gICAgLy9GSVhNRSBzcGVjaWFsIHNldHRpbmcgZm9yIHNlcnZlciBwcmVnbmFuY3kgc3RhZ2Ugb3V0IG9mIGluZGV4IHJhbmdlIHNldHRpbmdcbiAgICBpZiAocHJlZ1N0YWdlU2VsZWN0ZWQgPCAwIHx8IHByZWdTdGFnZVNlbGVjdGVkID4gMykge1xuICAgICAgcHJlZ1N0YWdlU2VsZWN0ZWQgPSAwO1xuICAgIH1cblxuICAgIGxldCBwcmVnX2JpcnRoX2RhdGUgPSB0aGlzLmRhdGEueWVhciArIFwiLVwiICsgdGhpcy5kYXRhLm1vbnRoICsgXCItXCIgKyB0aGlzLmRhdGEuZGF0ZTtcblxuICAgIC8vIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAvLyB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCJcIiwgY29udGVudDogXCJcIiArIG1vbWVudChbTnVtYmVyKHRoYXQuZGF0YS55ZWFyKSwgTnVtYmVyKHRoYXQuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhhdC5kYXRhLmRhdGUpXSkgfSkgXG5cbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICB3eC5nZXRVc2VySW5mbyh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IHJlcy51c2VySW5mbztcbiAgICAgICAgICAgICAgbGV0IG5pY2tOYW1lID0gdXNlckluZm8ubmlja05hbWU7XG4gICAgICAgICAgICAgIGxldCBhdmF0YXJVcmwgPSB1c2VySW5mby5hdmF0YXJVcmw7XG4gICAgICAgICAgICAgIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAgICAgICAgICAgbGV0IHVwZGF0ZVVzZXJQcm9maWxlUmVxID0ge1xuICAgICAgICAgICAgICAgIGdlbmRlcjogZ2VuZGVyLFxuICAgICAgICAgICAgICAgIHllYXJfb2ZfYmlydGg6IGJpcnRoWWVhcixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IHdlaWdodCxcbiAgICAgICAgICAgICAgICB3ZWlnaHRfYmVmb3JlX3ByZWduYW5jeTogd2VpZ2h0QmVmb3JlUHJlZyxcbiAgICAgICAgICAgICAgICBhY3Rpdml0eV9sZXZlbDogYWN0aXZpdHlTZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBwcmVnbmFuY3lfc3RhZ2U6IHByZWdTdGFnZVNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkX2JpcnRoX2RhdGU6IG1vbWVudChbTnVtYmVyKHRoYXQuZGF0YS55ZWFyKSwgTnVtYmVyKHRoYXQuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhhdC5kYXRhLmRhdGUpXSkgLyAxMDAwLFxuICAgICAgICAgICAgICAgIG5pY2tuYW1lOiBuaWNrTmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgdGltZXNfb2ZfcHJlZ25hbmN5OiB0aGF0LmRhdGEubnVtUHJlZ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Yqg6L295LitLi4uXCIgfSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVwZGF0ZVVzZXJQcm9maWxlUmVxKTtcbiAgICAgICAgICAgICAgd2ViQVBJLlVwZGF0ZVVzZXJQcm9maWxlKHVwZGF0ZVVzZXJQcm9maWxlUmVxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0UkRJR29hbCgpO1xuICAgICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiAn5pu05paw55So5oi35L+h5oGv5aSx6LSlJyxcbiAgICAgICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIHdlYkFQSS5VcGRhdGVVc2VyUHJvZmlsZSh1cGRhdGVVc2VyUHJvZmlsZVJlcSk7XG5cbiAgICAgICAgICAgICAgbGV0IHVwZGF0ZU1lZGljYWxQcm9maWxlUmVxID0ge1xuICAgICAgICAgICAgICAgIGZvb2RfYWxsZXJneV9pZHM6IFtdLFxuICAgICAgICAgICAgICAgIG1lZGljYWxfY29uZGl0aW9uX2lkczogW21lZGljYWxDb25kaXRpb25dLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtZWRpY2FsQ29uZGl0aW9uICE9IDApIHtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuVXBkYXRlTWVkaWNhbFByb2ZpbGUodXBkYXRlTWVkaWNhbFByb2ZpbGVSZXEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2ludml0YXRpb24vaW52aXRhdGlvbj91c2VyX3N0YXR1cz0yJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy9yZWNvcmQgdGhlIG9uQm9hcmQgbGFzdCBzdGVwIHRpbWVzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCdvbmJvYXJkX2xhc3Rfc3RlcCcsIHtcbiAgICAgIGNvdW50czogJ2NvdW50cycsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgY29uZmlybVN1Ym1pdCgpIHtcbiAgICB3eC5yZUxhdW5jaCh7XG4gICAgICB1cmw6IFwiLi4vLi4vcGFnZXMvZm9vZERpYXJ5L2luZGV4XCIsXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBwcmVCdXR0b24yMzQoKXtcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZT09Mil7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgZ2VuZGVyOiAwLFxuICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICBoZWlnaHQ6IDE1MCxcbiAgICAgICAgd2VpZ2h0OiA0Ny4zLFxuICAgICAgICB3ZWlnaHRWYWw6IFsxNzNdLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgICB5ZWFyRGlzcGxheTogJ3llYXJEaXNwbGF5JyxcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlID09IDQpIHtcbiAgICAgIGxldCB3ZWlnaHRCTUkgPSBOdW1iZXIoKDIxICogdGhpcy5kYXRhLmhlaWdodCAvIDEwMCAqIHRoaXMuZGF0YS5oZWlnaHQgLyAxMDApLnRvRml4ZWQoMSkpO1xuICAgICAgbGV0IHdlaWdodFZhbCA9IFtOdW1iZXIoKCh3ZWlnaHRCTUkgLSAzMCkgLyAwLjEpLnRvRml4ZWQoMSkpXTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICB3ZWlnaHQ6IHdlaWdodEJNSSxcbiAgICAgICAgd2VpZ2h0VmFsOiB3ZWlnaHRWYWwsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICAgIHllYXJEaXNwbGF5OiAneWVhckRpc3BsYXknLFxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgcHVibGljIHByZUJ1dHRvblByZWduYW50QW5kTm90RHVlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDIsXG4gICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheVwiLFxuXG4gICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOiB0cnVlLFxuICAgICAgcHJlZ25hbmN5U3RhZ2U6ICcnLFxuICAgICAgcHJlZ1N0YWdlU2VsZWN0ZWQ6NCwgXG4gICAgfSkgXG4gIH1cblxuICBwdWJsaWMgcHJlQnV0dG9uRHVlRGF0ZUNvbmRpdGlvbigpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UsXG4gICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgIHRvdGFsUGFnZTogNyxcblxuICAgICAgZHVlRGF0ZUNvbmRpdGlvbjpmYWxzZSxcbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiLFxuICAgICAgeWVhcjogJzIwMTknLFxuICAgICAgbW9udGg6ICcxMCcsXG4gICAgICBkYXRlOiAnMScsXG5cbiAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgICBwcmVnU3RhZ2VTZWxlY3RlZDogNCxcblxuICAgIH0pIFxuICB9XG5cbiAgcHVibGljIHdlaWdodEJlZm9yZVByZWduYW5jeUJhY2soKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgICBkdWVEYXRlQ29uZGl0aW9uOiB0cnVlLCBcbiAgICAgIHdlaWdodEJlZm9yZVByZWduYW5jeTogZmFsc2UsXG5cbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiLFxuICAgICAgeWVhcjogJzIwMTknLFxuICAgICAgbW9udGg6ICcxMCcsXG4gICAgICBkYXRlOiAnMScsXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBudW1iZXJPZlByZWduYW5jaWVzUHJlKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgbnVtUHJlZzogMSxcbiAgICAgIGR1ZURhdGVDb25kaXRpb246IGZhbHNlLCBcbiAgICAgIHdlaWdodEJlZm9yZVByZWduYW5jeTogdHJ1ZSwgXG4gICAgICBudW1iZXJPZlByZWduYW5jaWVzOiBmYWxzZSxcblxuICAgICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHByZUJ1dHRvbjkoKXtcbiAgICAvLyDnlLfnlJ9cbiAgICBpZiAodGhpcy5kYXRhLmdlbmRlcj09PTEpe1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gNSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG5cbiAgICAgICAgYmlydGhZZWFyOiAxOTkxLFxuICAgICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheVwiLFxuICAgICAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIC8vIOWls+eUn1xuICAgICAgaWYgKHRoaXMuZGF0YS5iaXJ0aFllYXIgPj0gMjAwMyl7XG4gICAgICAgIC8vIOW5tOm+hOWwj++8jOayoeaciea7oei2s+aAgOWtleW5tOm+hOadoeS7tueahOWls+WtqVxuICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDUsXG4gICAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICAgICAgICB0b3RhbFBhZ2U6NyxcblxuICAgICAgICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG5cbiAgICAgICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICAgICAgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXlcIixcbiAgICAgICAgfSlcblxuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIOa7oei2s+aAgOWtleW5tOm+hOadoeS7tueahOWls+eUn1xuICAgICAgICBpZiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICfmgIDlrZXmnJ8nKXtcbiAgICAgICAgICAvLyDpgInmi6nkuoZcIuaAgOWtleacn1wi55qE5aWz55SfXG4gICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDEsXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICAgICAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuICAgICAgICAgICAgbnVtYmVyT2ZQcmVnbmFuY2llczogdHJ1ZSxcblxuICAgICAgICAgICAgbnVtUHJlZzogMSxcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvLyDpgInmi6nkuobpnZ5cIuaAgOWtleacn1wi55qE5aWz55SfXG4gICAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSAtIDMsXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICAgICAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuICAgICAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjp0cnVlLFxuICAgICAgICAgICAgZHVlRGF0ZUNvbmRpdGlvbjpmYWxzZSxcblxuICAgICAgICAgICAgcHJlZ25hbmN5U3RhZ2U6ICcnLFxuICAgICAgICAgICAgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBwdWJsaWMgcHJlQnV0dG9uMTAoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgZW1wdHk6ZmFsc2UsXG5cbiAgICAgIG1lZGljYWw6ICcnLCBcbiAgICAgIG1lZGljYWxzZWxlY3RlZDogNSxcblxuICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICBhY3Rpdml0eVNlbGVjdGVkOiAwLFxuICAgIH0pXG4gIH1cbn1cblxuUGFnZShuZXcgb25Cb2FyZCgpKTtcbiJdfQ==