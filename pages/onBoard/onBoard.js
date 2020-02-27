"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var moment = require("moment");
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
        var nowYear = Number(moment().format('YYYY'));
        if (nowYear - this.data.birthYear > 18) {
            for (var i = 30; i <= 150; i += 1) {
                var num = i + '.';
                weightArr.push(num);
            }
        }
        else {
            for (var i = 0; i <= 150; i += 1) {
                var num = i + '.';
                weightArr.push(num);
            }
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
        var _this = this;
        var val = event.detail.value;
        var birthYear = this.data.birthYears[val];
        var age = this.data.todayYear - birthYear;
        this.setData({ yearDisplay: "yearDisplay-input" });
        if (age >= 0 && age <= 100) {
            this.setData({
                birthYear: birthYear,
                nextPage: true,
                empty: false,
            }, function () {
                console.log('birthYear', birthYear);
                _this.initWeightArr();
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
            var moment_1 = require('moment');
            var expectedBirthDate = moment_1([Number(this.data.year), Number(this.data.month) - 1, Number(this.data.date)]) / 1000;
            var today = moment_1() / 1000;
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
            if (this.data.countPage === 4) {
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
                birthYear: 1991,
            });
        }
        if (this.data.countPage == 4) {
            this.setData({
                countPage: this.data.countPage - 1,
                currentPage: this.data.currentPage - 1,
                nextPage: true,
                empty: false,
                yearDisplay: 'yearDisplay',
                birthYear: 1991,
            });
        }
    };
    onBoard.prototype.preButtonPregnantAndNotDue = function () {
        this.setData({
            countPage: this.data.countPage - 2,
            currentPage: this.data.currentPage - 1,
            nextPage: true,
            empty: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25Cb2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9uQm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxJQUFNLEdBQUcsR0FBRyxNQUFNLEVBQVUsQ0FBQTtBQUM1QixpREFBbUQ7QUFDbkQsaURBQWtEO0FBQ2xELCtCQUFnQztBQUVoQztJQUFBO1FBRVMsU0FBSSxHQUFHO1lBQ1osV0FBVyxFQUFFLGFBQWE7WUFDMUIsVUFBVSxFQUFFLFlBQVk7WUFDeEIsY0FBYyxFQUFFLFNBQVM7WUFDekIsc0JBQXNCLEVBQUUsSUFBSTtZQUM1QixnQkFBZ0IsRUFBRSxLQUFLO1lBQ3ZCLHFCQUFxQixFQUFFLEtBQUs7WUFDNUIsbUJBQW1CLEVBQUUsS0FBSztZQUMxQixTQUFTLEVBQUUsQ0FBQztZQUNaLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLEtBQUs7WUFDWixNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sRUFBRSxHQUFHO1lBQ1gsU0FBUyxFQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2YsU0FBUyxFQUFFLEVBQUU7WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDakIsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLFNBQVMsRUFBQyxFQUFFO1lBQ1osY0FBYyxFQUFFLEVBQUU7WUFDbEIsaUJBQWlCLEVBQUUsQ0FBQztZQUNwQixhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQztZQUNWLFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRSxHQUFHO1lBQ1QsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1YsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1QsYUFBYSxFQUFFLEVBQUU7WUFDakIsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixPQUFPLEVBQUUsRUFBRTtZQUNYLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLGVBQWUsRUFBRSxTQUFTO1lBQzFCLG9CQUFvQixFQUFFLHVCQUF1QjtZQUM3QyxXQUFXLEVBQUUsbUJBQW1CO1lBQ2hDLE9BQU8sRUFBRSxJQUFJO1lBQ2IsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2QsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0MsU0FBUyxFQUFFLENBQUM7WUFDWixXQUFXLEVBQUUsQ0FBQztZQUNkLFFBQVEsRUFBRSxFQUFFO1lBQ1osU0FBUyxFQUFFLEVBQUU7WUFDYixRQUFRLEVBQUUsR0FBRztTQUNkLENBQUE7UUFDTSxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWIsV0FBTSxHQUFHLEVBQUUsQ0FBQztJQXNzQnJCLENBQUM7SUFwc0JRLDZCQUFXLEdBQWxCLFVBQW1CLEtBQVU7UUFDMUIsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixRQUFRLEVBQUUsSUFBSTtZQUNkLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUU7WUFDekIsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsU0FBUyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFDLEdBQUc7Z0JBQ1YsU0FBUyxFQUFDLENBQUMsR0FBRyxDQUFDO2FBQ2hCLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDSixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixTQUFTLEVBQUUsQ0FBQztnQkFDWixNQUFNLEVBQUUsQ0FBQztnQkFDVCxNQUFNLEVBQUMsR0FBRztnQkFDVixTQUFTLEVBQUMsQ0FBQyxHQUFHLENBQUM7YUFDaEIsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU0sd0JBQU0sR0FBYjtRQUNFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUN2QixLQUFLLEVBQUUsTUFBTTtTQUNkLENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFdkIsQ0FBQztJQUVNLGtDQUFnQixHQUF2QixVQUF3QixLQUFVO1FBQ2hDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDaEI7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDakI7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDaEI7UUFFQSxJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFHTSxvQ0FBa0IsR0FBekIsVUFBMEIsS0FBVTtRQUNqQyxJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFbEcsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBRWYsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNmO1FBRUEsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFLTSwrQkFBYSxHQUFwQjtRQUNFLElBQUksU0FBUyxHQUFZLEVBQUUsQ0FBQTtRQUMzQixLQUFJLElBQUksQ0FBQyxHQUFDLEVBQUUsRUFBQyxDQUFDLElBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFDO1lBQ3RCLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDbEI7UUFDQSxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsV0FBQTtTQUNWLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFJTSwrQkFBYSxHQUFwQjtRQUNFLElBQUksU0FBUyxHQUFhLEVBQUUsQ0FBQTtRQUM1QixJQUFNLE9BQU8sR0FBVSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDdEQsSUFBRyxPQUFPLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUMsRUFBRSxFQUFDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRTtnQkFDL0IsSUFBTSxHQUFHLEdBQVUsQ0FBQyxHQUFDLEdBQUcsQ0FBQztnQkFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUNwQjtTQUNGO2FBQUk7WUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsSUFBRSxDQUFDLEVBQUU7Z0JBQzlCLElBQU0sR0FBRyxHQUFVLENBQUMsR0FBQyxHQUFHLENBQUM7Z0JBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDcEI7U0FDRjtRQUNBLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsU0FBUyxXQUFBO1NBQ1YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUdNLDRCQUFVLEdBQWpCLFVBQWtCLEtBQVU7UUFDekIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDTSxrQ0FBZ0IsR0FBdkIsVUFBd0IsS0FBVTtRQUNoQyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsTUFBTSxFQUFFLE1BQU07WUFDZCxTQUFTLEVBQUMsQ0FBQyxHQUFHLENBQUM7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGtDQUFnQixHQUF2QixVQUF3QixLQUFTO1FBQ3ZCLElBQUEsMEJBQUssQ0FBa0I7UUFDekIsSUFBQSxjQUFtQyxFQUFqQyxzQkFBUSxFQUFFLHdCQUF1QixDQUFDO1FBQzFDLElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixNQUFNLEVBQUMsS0FBSyxHQUFDLEtBQUs7WUFDbEIsU0FBUyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixXQUFXLEVBQUUsbUJBQW1CO1lBQ2hDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsS0FBSyxFQUFFLEtBQUs7U0FDYixDQUFDLENBQUE7SUFDSixDQUFDO0lBR00sOEJBQVksR0FBbkIsVUFBb0IsS0FBVTtRQUE5QixpQkE0QkM7UUEzQkMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFN0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRXpDLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBRTVELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFO1lBRXpCLElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixRQUFRLEVBQUUsSUFBSTtnQkFDZCxLQUFLLEVBQUUsS0FBSzthQUNiLEVBQUM7Z0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ2xDLEtBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQztTQUVKO2FBQU07WUFFSixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixTQUFTLEVBQUUsU0FBUztnQkFDcEIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFHTSwrQkFBYSxHQUFwQjtRQUNRLElBQUEsY0FBaUMsRUFBL0Isa0JBQU0sRUFBRSx3QkFBdUIsQ0FBQztRQUN4QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxHQUFHLEdBQUMsTUFBTSxHQUFDLEdBQUcsR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQzNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksS0FBSyxHQUFHLFNBQVMsR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDO1FBQzNCLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsTUFBTSxFQUFFLFNBQVM7WUFDakIsU0FBUyxFQUFDLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQztTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sNEJBQVUsR0FBakI7UUFFRSxJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUMsSUFBSSxFQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1NBQ3hCO2FBQUk7WUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtZQUN2QixFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNYLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxNQUFNO2dCQUNaLFFBQVEsRUFBRSxJQUFJO2FBQ2YsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxLQUFLLENBQUE7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUU5QixJQUFJLFFBQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0IsSUFBSSxpQkFBaUIsR0FBRyxRQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNySCxJQUFJLEtBQUssR0FBRyxRQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxLQUFLLEdBQUcsaUJBQWlCLEVBQUU7Z0JBQzVCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDdkMsT0FBTzthQUNSO1NBQ0Y7UUFDQSxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLGNBQWMsRUFBRSxTQUFTO1lBQ3pCLFVBQVUsRUFBRSxZQUFZO1NBQ3pCLENBQUMsQ0FBQztRQUNILElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQzdCLElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO2dCQUNsQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQzthQUN2QyxDQUFDLENBQUM7WUFDSCxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFHLENBQUMsRUFBQztnQkFDekIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO2FBQ3JCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pCO2FBQU07WUFDSixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDeEM7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBR00sZ0NBQWMsR0FBckIsVUFBc0IsS0FBVTtRQUM5QixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUU1QixJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFVBQVUsRUFBRSxrQkFBa0I7WUFDOUIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSztTQUM3QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sMkNBQXlCLEdBQWhDLFVBQWlDLEtBQVU7UUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2QixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUV4QyxJQUFJLGNBQWMsSUFBSSxJQUFJLElBQUksY0FBYyxJQUFJLEVBQUUsRUFBRTtZQUVqRCxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixhQUFhLEVBQUUsY0FBYztnQkFDN0IsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLENBQUM7U0FFSjthQUFNO1lBRUosSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLFFBQVEsRUFBRSxLQUFLO2dCQUNmLEtBQUssRUFBRSxLQUFLO2FBQ2IsQ0FBQyxDQUFDO1lBRUgsSUFBSSxjQUFjLElBQUksRUFBRSxFQUFFO2dCQUN2QixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDdEQ7U0FDRjtJQUNILENBQUM7SUFFTSxrQ0FBZ0IsR0FBdkIsVUFBd0IsS0FBVTtRQUVoQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUVqQyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFFbEIsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7YUFDYixDQUFDLENBQUM7U0FFSjthQUFNO1lBRUosSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUM1QixRQUFRLEVBQUUsSUFBSTtnQkFDZCxLQUFLLEVBQUUsS0FBSzthQUNiLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVNLGdDQUFjLEdBQXJCO1FBQ0UsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBRXRELElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLHNCQUFzQixFQUFFLElBQUk7Z0JBQzVCLFNBQVMsRUFBRSxDQUFDO2FBQ2IsQ0FBQyxDQUFDO1lBRUYsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBRS9EO2FBQU07WUFFSixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixzQkFBc0IsRUFBRSxLQUFLO2dCQUM3QixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztnQkFDbEMsU0FBUyxFQUFFLENBQUM7YUFDYixDQUFDLENBQUM7U0FFSjtJQUNILENBQUM7SUFFTSwwQkFBUSxHQUFmO1FBR0UsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSSxDQUFDLEVBQUU7WUFDakgsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO1FBR0QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZCO1FBR0QsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7UUFHeEMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVNLDJDQUF5QixHQUFoQztRQUNFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFO1lBQzNCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNqRjthQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFO1lBQ2xDLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDN0c7YUFBTTtZQUNKLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNyRjtJQUNILENBQUM7SUFFTSxrREFBZ0MsR0FBdkM7UUFDRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEtBQUssRUFBRTtZQUN2SCxJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FFdEc7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUVuSyxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixzQkFBc0IsRUFBRSxLQUFLO2dCQUM3QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztnQkFDbEMsU0FBUyxFQUFFLENBQUM7YUFDYixDQUFDLENBQUM7U0FFSjthQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUFFO1lBRTdILElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7U0FFbkg7SUFDSCxDQUFDO0lBRU0scUNBQW1CLEdBQTFCLFVBQTJCLEtBQVU7UUFDbkMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDdkIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RGO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RGO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RGO1FBRUEsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLG9DQUFrQixHQUF6QixVQUEwQixLQUFVO1FBRWxDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdkU7YUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM5QixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzFFO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMxRTthQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzlCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDeEU7YUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM5QixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO1FBRUEsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLGtDQUFnQixHQUF2QixVQUF3QixLQUFVO1FBQ2hDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDcEU7YUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM5QixJQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUVBLElBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFM0UsQ0FBQztJQWVNLDRCQUFVLEdBQWpCO1FBQUEsaUJBaUJDO1FBaEJDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNuRSxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7WUFDbEMsS0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzNCLElBQUksS0FBSSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7Z0JBQ3RCLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0JBQ1YsR0FBRyxFQUFFLDZCQUE2QixHQUFHLEtBQUksQ0FBQyxNQUFNO2lCQUNqRCxDQUFDLENBQUE7YUFDSDtRQUNILENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtZQUNwRCxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDeEIsS0FBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQzthQUNuQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLG1DQUFpQixHQUF4QjtRQUNFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7WUFDdEIsRUFBRSxDQUFDLFVBQVUsQ0FBQztnQkFDWixHQUFHLEVBQUUsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLE1BQU07YUFDakQsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDO0lBRU0sMkJBQVMsR0FBaEI7UUFFRSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMxRCxJQUFJLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUQsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV6RCxJQUFJLGlCQUFpQixHQUFHLENBQUMsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLEVBQUU7WUFDbEQsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUtwRixFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osT0FBTyxZQUFDLEdBQUc7Z0JBQ1QsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBQ3JDLEVBQUUsQ0FBQyxXQUFXLENBQUM7d0JBQ2IsT0FBTyxFQUFFLFVBQVUsR0FBRzs0QkFDcEIsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQzs0QkFDNUIsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQzs0QkFDakMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQzs0QkFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUMvQixJQUFJLG9CQUFvQixHQUFHO2dDQUN6QixNQUFNLEVBQUUsTUFBTTtnQ0FDZCxhQUFhLEVBQUUsU0FBUztnQ0FDeEIsTUFBTSxFQUFFLE1BQU07Z0NBQ2QsTUFBTSxFQUFFLE1BQU07Z0NBQ2QsdUJBQXVCLEVBQUUsZ0JBQWdCO2dDQUN6QyxjQUFjLEVBQUUsZ0JBQWdCO2dDQUNoQyxlQUFlLEVBQUUsaUJBQWlCO2dDQUNsQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUk7Z0NBQ2pILFFBQVEsRUFBRSxRQUFRO2dDQUNsQixVQUFVLEVBQUUsU0FBUztnQ0FDckIsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPOzZCQUN0QyxDQUFBOzRCQUNELEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQzs0QkFDcEMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtnQ0FDdEQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOzRCQUNwQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHO2dDQUNWLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ25CLEVBQUUsQ0FBQyxTQUFTLENBQUM7b0NBQ1gsS0FBSyxFQUFFLEVBQUU7b0NBQ1QsT0FBTyxFQUFFLFVBQVU7b0NBQ25CLFVBQVUsRUFBRSxLQUFLO2lDQUNsQixDQUFDLENBQUM7NEJBQ0wsQ0FBQyxDQUFDLENBQUM7NEJBRUgsSUFBSSx1QkFBdUIsR0FBRztnQ0FDNUIsZ0JBQWdCLEVBQUUsRUFBRTtnQ0FDcEIscUJBQXFCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQzs2QkFDMUMsQ0FBQTs0QkFDRCxJQUFJLGdCQUFnQixJQUFJLENBQUMsRUFBRTtnQ0FDekIsTUFBTSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUM7NkJBQ3REO3dCQUNILENBQUM7cUJBQ0YsQ0FBQyxDQUFBO2lCQUNIO3FCQUFNO29CQUNMLEVBQUUsQ0FBQyxVQUFVLENBQUM7d0JBQ1osR0FBRyxFQUFFLDhCQUE4QjtxQkFDcEMsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtRQUdGLEVBQUUsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUU7WUFDdEMsTUFBTSxFQUFFLFFBQVE7U0FDakIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLCtCQUFhLEdBQXBCO1FBQ0UsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNWLEdBQUcsRUFBRSx3QkFBd0I7U0FDOUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLDhCQUFZLEdBQW5CO1FBQ0UsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBRSxDQUFDLEVBQUM7WUFDeEIsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7Z0JBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO2dCQUN0QyxNQUFNLEVBQUUsQ0FBQztnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLEVBQUUsS0FBSzthQUNiLENBQUMsQ0FBQTtTQUNIO1FBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7Z0JBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO2dCQUN0QyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxLQUFLLEVBQUUsS0FBSztnQkFDWixXQUFXLEVBQUUsYUFBYTtnQkFDMUIsU0FBUyxFQUFFLElBQUk7YUFDaEIsQ0FBQyxDQUFBO1NBQ0g7UUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsRUFBRTtZQUMzQixJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztnQkFDbEMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUM7Z0JBQ3RDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLEtBQUssRUFBRSxLQUFLO2dCQUNaLFdBQVcsRUFBRSxhQUFhO2dCQUMxQixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUE7U0FDSDtJQUNILENBQUM7SUFDTSw0Q0FBMEIsR0FBakM7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO1lBQ3RDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsS0FBSyxFQUFFLEtBQUs7WUFFWixXQUFXLEVBQUUsYUFBYTtZQUUxQixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLGlCQUFpQixFQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLDJDQUF5QixHQUFoQztRQUNHLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUM5QixXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztZQUN0QyxRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxLQUFLO1lBQ1osU0FBUyxFQUFFLENBQUM7WUFFWixnQkFBZ0IsRUFBQyxLQUFLO1lBQ3RCLFVBQVUsRUFBRSxZQUFZO1lBQ3hCLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsR0FBRztZQUVULHNCQUFzQixFQUFFLElBQUk7WUFDNUIsY0FBYyxFQUFFLEVBQUU7WUFDbEIsaUJBQWlCLEVBQUUsQ0FBQztTQUVyQixDQUFDLENBQUE7SUFDSixDQUFDO0lBRU0sMkNBQXlCLEdBQWhDO1FBQ0csSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztZQUNsQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztZQUN0QyxRQUFRLEVBQUUsSUFBSTtZQUNkLEtBQUssRUFBRSxLQUFLO1lBRVosYUFBYSxFQUFFLENBQUM7WUFDaEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixxQkFBcUIsRUFBRSxLQUFLO1lBRTVCLFVBQVUsRUFBRSxZQUFZO1lBQ3hCLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsR0FBRztTQUNWLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSx3Q0FBc0IsR0FBN0I7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO1lBQ3RDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLEtBQUs7WUFFWixPQUFPLEVBQUUsQ0FBQztZQUNWLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIscUJBQXFCLEVBQUUsSUFBSTtZQUMzQixtQkFBbUIsRUFBRSxLQUFLO1lBRTFCLGFBQWEsRUFBRSxDQUFDO1NBQ2pCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSw0QkFBVSxHQUFqQjtRQUVFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUcsQ0FBQyxFQUFDO1lBQ3RCLElBQVksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO2dCQUNsQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztnQkFDdEMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7Z0JBRVosYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGdCQUFnQixFQUFFLENBQUM7Z0JBRW5CLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFdBQVcsRUFBRSxhQUFhO2FBQzNCLENBQUMsQ0FBQTtTQUNIO2FBQUk7WUFFSCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFBQztnQkFFN0IsSUFBWSxDQUFDLE9BQU8sQ0FBQztvQkFDcEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7b0JBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO29CQUN0QyxRQUFRLEVBQUUsS0FBSztvQkFDZixLQUFLLEVBQUUsS0FBSztvQkFDWixTQUFTLEVBQUMsQ0FBQztvQkFFWCxhQUFhLEVBQUUsRUFBRTtvQkFDakIsZ0JBQWdCLEVBQUUsQ0FBQztvQkFFbkIsU0FBUyxFQUFFLElBQUk7b0JBQ2YsV0FBVyxFQUFFLGFBQWE7aUJBQzNCLENBQUMsQ0FBQTthQUVIO2lCQUFJO2dCQUVILElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxFQUFDO29CQUVuQyxJQUFZLENBQUMsT0FBTyxDQUFDO3dCQUNwQixTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQzt3QkFDbEMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUM7d0JBQ3RDLFFBQVEsRUFBRSxLQUFLO3dCQUNmLEtBQUssRUFBRSxLQUFLO3dCQUVaLGFBQWEsRUFBRSxFQUFFO3dCQUNqQixnQkFBZ0IsRUFBRSxDQUFDO3dCQUNuQixtQkFBbUIsRUFBRSxJQUFJO3dCQUV6QixPQUFPLEVBQUUsQ0FBQztxQkFDWCxDQUFDLENBQUE7aUJBQ0g7cUJBQUk7b0JBRUYsSUFBWSxDQUFDLE9BQU8sQ0FBQzt3QkFDcEIsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7d0JBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO3dCQUN0QyxRQUFRLEVBQUUsS0FBSzt3QkFDZixLQUFLLEVBQUUsS0FBSzt3QkFFWixhQUFhLEVBQUUsRUFBRTt3QkFDakIsZ0JBQWdCLEVBQUUsQ0FBQzt3QkFDbkIsc0JBQXNCLEVBQUMsSUFBSTt3QkFDM0IsZ0JBQWdCLEVBQUMsS0FBSzt3QkFFdEIsY0FBYyxFQUFFLEVBQUU7d0JBQ2xCLGlCQUFpQixFQUFFLENBQUM7cUJBQ3JCLENBQUMsQ0FBQTtpQkFDSDthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBQ00sNkJBQVcsR0FBbEI7UUFDRyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQ2xDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO1lBQ3RDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFDLEtBQUs7WUFFWCxPQUFPLEVBQUUsRUFBRTtZQUNYLGVBQWUsRUFBRSxDQUFDO1lBRWxCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLGdCQUFnQixFQUFFLENBQUM7U0FDcEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNILGNBQUM7QUFBRCxDQUFDLEFBN3ZCRCxJQTZ2QkM7QUFFRCxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5cbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KClcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnXG5cbmNsYXNzIG9uQm9hcmQge1xuXG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG4gICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiLFxuICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSxcbiAgICBudW1iZXJPZlByZWduYW5jaWVzOiBmYWxzZSxcbiAgICBjb3VudFBhZ2U6IDAsXG4gICAgZmluYWxQYWdlOiBmYWxzZSxcbiAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgZW1wdHk6IGZhbHNlLFxuICAgIGdlbmRlcjogMCxcbiAgICBoZWlnaHQ6IDE1MCxcbiAgICBoZWlnaHRWYWw6WzExMF0sXG4gICAgaGVpZ2h0QXJyOiBbXSwgLy8g6Lqr6auY5Yid5aeL5YyW5pWw57uE77yM5YyF5ZCrNDAtMjMwXG4gICAgd2VpZ2h0OiA1MC41LFxuICAgIHdlaWdodFZhbDogWzIwLDVdLFxuICAgIHBvaW50QXJyOlswLDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuICAgIHdlaWdodEFycjpbXSxcbiAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDQsXG4gICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICBudW1QcmVnOiAxLFxuICAgIHRvZGF5WWVhcjogMCxcbiAgICB5ZWFyOiAnMjAxOScsXG4gICAgbW9udGg6ICcxMCcsXG4gICAgZGF0ZTogJzEnLFxuICAgIHllYXJzOiBbMF0sXG4gICAgbW9udGhzOiBbOV0sXG4gICAgZGF5czogWzBdLFxuICAgIGFjdGl2aXR5TGV2ZWw6ICcnLFxuICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgbWVkaWNhbDogJycsXG4gICAgbWVkaWNhbHNlbGVjdGVkOiA1LFxuICAgIGlucHV0VmFsaWRhdGU6ICfor7fovpPlhaXkvaDnmoTnrZTmoYgnLFxuICAgIG9wdGlvbnNWYWxpZGF0ZTogJ+ivt+mAieaLqeS9oOeahOetlOahiCcsXG4gICAgZXhwZWN0ZWREYXRlVmFsaWRhdGU6ICfor7flnKjku4rlpKnliLDmnKrmnaU0NeWRqOeahOaXpeacn+WGhemAieaLqeaCqOeahOmihOS6p+acnycsXG4gICAgYWdlVmFsaWRhdGU6ICfor7fnoa7kv53mgqjnmoTlubTpvoTlnKgxLTEwMOWygeiMg+WbtOWGhScsXG4gICAgcmRpR29hbDogMjAwMCxcbiAgICBiaXJ0aFZhbDogWzcyXSxcbiAgICBwcmVnbmFuY3lOdW1WYWw6IFswXSxcbiAgICBiaXJ0aFllYXJzOiBbXSxcbiAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgbnVtUHJlZ09wdGlvbnM6IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF0sXG4gICAgdG90YWxQYWdlOiA3LFxuICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgIG5pY2tOYW1lOiBcIlwiLFxuICAgIGF2YXRhclVybDogXCJcIixcbiAgICByZGlWYWx1ZTogXCIgXCIsXG4gIH1cbiAgcHVibGljIGxhc3RUaW1lID0gMDsgLy8g6Zi75q2i55So5oi36L+e57ut5b+r6YCf54K55Ye7XG5cbiAgcHVibGljIHJkYVVybCA9IFwiXCI7XG5cbiAgcHVibGljIGdlbmRlckV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSk7XG5cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IFwi55S3XCIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHRvdGFsUGFnZTogNixcbiAgICAgICAgZ2VuZGVyOiAxLFxuICAgICAgICBoZWlnaHQ6MTcwLFxuICAgICAgICBoZWlnaHRWYWw6WzEzMF0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgdG90YWxQYWdlOiA3LFxuICAgICAgICBnZW5kZXI6IDIsXG4gICAgICAgIGhlaWdodDoxNTAsXG4gICAgICAgIGhlaWdodFZhbDpbMTEwXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKTogdm9pZCB7XG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuWfuuacrOS/oeaBr1wiXG4gICAgfSk7XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuc2V0QmlydGhZZWFyUGlja2VyKHRvZGF5KTsgXG4gICAgdGhpcy5zZXREdWVEYXRlUGlja2VyKHRvZGF5KTtcbiAgICB0aGlzLmluaXRIZWlnaHRBcnIoKTtcbiAgICBcbiAgfVxuICAvLyBTZXQgdGhlIHBpY2tlciBvcHRpb25zIGZvciBwcmVnbmFuY3kgZHVlIGRhdGVcbiAgcHVibGljIHNldER1ZURhdGVQaWNrZXIodG9kYXk6IGFueSk6IHZvaWQge1xuICAgIGxldCBkdWVZZWFyID0gW107XG4gICAgbGV0IGR1ZU1vbnRoID0gW107XG4gICAgbGV0IGR1ZURheXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSB0b2RheS5nZXRGdWxsWWVhcigpOyBpIDw9IHRvZGF5LmdldEZ1bGxZZWFyKCkgKyAyOyBpKyspIHtcbiAgICAgIGR1ZVllYXIucHVzaChpKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDEyOyBpKyspIHtcbiAgICAgIGR1ZU1vbnRoLnB1c2goaSlcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAzMTsgaSsrKSB7XG4gICAgICBkdWVEYXlzLnB1c2goaSlcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyB5ZWFyczogZHVlWWVhciwgbW9udGhzOiBkdWVNb250aCwgZGF5czogZHVlRGF5cyB9KTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgcGlja2VyIG9wdGlvbnMgZm9yIGJpcnRoIHllYXJcbiAgcHVibGljIHNldEJpcnRoWWVhclBpY2tlcih0b2RheTogYW55KTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgMSwgdG9kYXlZZWFyOiB0b2RheS5nZXRGdWxsWWVhcigpIC0gMSB9KTtcblxuICAgIGxldCB5ZWFycyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDE5MTk7IGkgPD0gdG9kYXkuZ2V0RnVsbFllYXIoKSAtIDE7IGkrKykge1xuICAgICAgeWVhcnMucHVzaChpKTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBiaXJ0aFllYXJzOiB5ZWFycyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlvqrnjq/ojrflvpdoZWlnaHRBcnJcbiAgICovXG4gIHB1YmxpYyBpbml0SGVpZ2h0QXJyKCl7XG4gICAgbGV0IGhlaWdodEFycjpOdW1iZXJbXSA9IFtdXG4gICAgZm9yKGxldCBpPTQwO2k8PTIzMDtpKyspe1xuICAgICAgaGVpZ2h0QXJyLnB1c2goaSlcbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGhlaWdodEFyclxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIOW+queOr+iOt+W+l3dlaWdodEFyclxuICAgKi9cbiAgcHVibGljIGluaXRXZWlnaHRBcnIoKSB7XG4gICAgbGV0IHdlaWdodEFycjogTnVtYmVyW10gPSBbXVxuICAgIGNvbnN0IG5vd1llYXI6bnVtYmVyID0gTnVtYmVyKG1vbWVudCgpLmZvcm1hdCgnWVlZWScpKVxuICAgIGlmKG5vd1llYXItdGhpcy5kYXRhLmJpcnRoWWVhcj4xOCl7XG4gICAgICBmb3IgKGxldCBpID0gMzA7IGkgPD0gMTUwOyBpKz0xKSB7XG4gICAgICAgIGNvbnN0IG51bTpzdHJpbmcgPSBpKycuJztcbiAgICAgICAgd2VpZ2h0QXJyLnB1c2gobnVtKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gMTUwOyBpKz0xKSB7XG4gICAgICAgIGNvbnN0IG51bTpzdHJpbmcgPSBpKycuJztcbiAgICAgICAgd2VpZ2h0QXJyLnB1c2gobnVtKVxuICAgICAgfVxuICAgIH1cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgd2VpZ2h0QXJyXG4gICAgfSlcbiAgfVxuXG4gIC8vIE1ldGhvZCB0byBoYW5kbGUgc3R5bGluZyBvZiBXZUNoYXQgaW5wdXRcbiAgcHVibGljIGZvY3VzSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb24taW5wdXRcIiB9KTtcbiAgfVxuICBwdWJsaWMgYmluZEhlaWdodFNlbGVjdChldmVudDogYW55KSB7XG4gICAgbGV0IHZhbCA9IGV2ZW50LmRldGFpbC52YWx1ZVswXTtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5kYXRhLmhlaWdodEFyclt2YWxdO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheS1pbnB1dFwiLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBoZWlnaHRWYWw6W3ZhbF0sXG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBiaW5kV2VpZ2h0U2VsZWN0KGV2ZW50OmFueSl7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gZXZlbnQuZGV0YWlsO1xuICAgIGNvbnN0IHsgcG9pbnRBcnIsIHdlaWdodEFyciB9ID0gdGhpcy5kYXRhO1xuICAgIGNvbnN0IHVuaXRzID0gd2VpZ2h0QXJyW3ZhbHVlWzBdXTtcbiAgICBjb25zdCBwb2ludCA9IHBvaW50QXJyW3ZhbHVlWzFdXTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgd2VpZ2h0OnVuaXRzK3BvaW50LFxuICAgICAgd2VpZ2h0VmFsOlt2YWx1ZVswXSx2YWx1ZVsxXV0sXG4gICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheS1pbnB1dFwiLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIEhhbmRsZSB0aGUgYWdlIGlucHV0IGV2ZW50XG4gIHB1YmxpYyBiaW5kQWdlSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGxldCB2YWwgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICBsZXQgYmlydGhZZWFyID0gdGhpcy5kYXRhLmJpcnRoWWVhcnNbdmFsXTtcblxuICAgIGxldCBhZ2UgPSB0aGlzLmRhdGEudG9kYXlZZWFyIC0gYmlydGhZZWFyO1xuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgeWVhckRpc3BsYXk6IFwieWVhckRpc3BsYXktaW5wdXRcIiB9KTtcblxuICAgIGlmIChhZ2UgPj0gMCAmJiBhZ2UgPD0gMTAwKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGJpcnRoWWVhcjogYmlydGhZZWFyLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgfSwoKT0+e1xuICAgICAgICBjb25zb2xlLmxvZygnYmlydGhZZWFyJyxiaXJ0aFllYXIpXG4gICAgICAgIHRoaXMuaW5pdFdlaWdodEFycigpO1xuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBiaXJ0aFllYXI6IGJpcnRoWWVhcixcbiAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB3ZWlnaEluZGV4IGFuZCBpbml0IHdlaWdodFxuICBwdWJsaWMgZ2V0V2VpZ2h0SW5mbygpIHtcbiAgICBjb25zdCB7IGhlaWdodCwgd2VpZ2h0QXJyIH0gPSB0aGlzLmRhdGE7XG4gICAgbGV0IGJtaVdlaWdodCA9IE1hdGgucm91bmQoaGVpZ2h0LzEwMCpoZWlnaHQvMTAwKjIxKjEwKS8xMDtcbiAgICBsZXQgdW5pdCA9IE1hdGguZmxvb3IoYm1pV2VpZ2h0KSAtIHBhcnNlSW50KHdlaWdodEFyclswXSk7XG4gICAgbGV0IHBvaW50ID0gYm1pV2VpZ2h0KjEwJTEwO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IFxuICAgICAgd2VpZ2h0OiBibWlXZWlnaHQsXG4gICAgICB3ZWlnaHRWYWw6W3VuaXQscG9pbnRdXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgbmV4dFN1Ym1pdCgpIHtcbiAgICAvLyDlhYjov5vooYzoioLmtYHvvIzpgb/lhY3nlKjmiLfngrnlh7vov4flv6tcbiAgICBsZXQgbm93VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGlmIChub3dUaW1lIC0gdGhpcy5sYXN0VGltZT4xMDAwKXtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBub3dUaW1lXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmxhc3RUaW1lID0gbm93VGltZVxuICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgdGl0bGU6ICfor7forqTnnJ/loavlhpknLFxuICAgICAgICBpY29uOiAnbm9uZScsXG4gICAgICAgIGR1cmF0aW9uOiAxMDAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGF0YS5kdWVEYXRlQ29uZGl0aW9uKSB7XG4gICAgICAvL2NoZWNrIHRoZSBleHBlY3RlZCBiaXJ0aCBkYXRlIGhlcmVcbiAgICAgIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAgIGxldCBleHBlY3RlZEJpcnRoRGF0ZSA9IG1vbWVudChbTnVtYmVyKHRoaXMuZGF0YS55ZWFyKSwgTnVtYmVyKHRoaXMuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhpcy5kYXRhLmRhdGUpXSkgLyAxMDAwO1xuICAgICAgbGV0IHRvZGF5ID0gbW9tZW50KCkgLyAxMDAwO1xuICAgICAgaWYgKHRvZGF5ID4gZXhwZWN0ZWRCaXJ0aERhdGUpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZW1wdHk6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHRleHRJbnB1dENsYXNzOiBcInNlY3Rpb25cIixcbiAgICAgIGRhdGVQaWNrZXI6IFwiZGF0ZVBpY2tlclwiXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5uZXh0UGFnZSA9PSB0cnVlKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxLFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlICsgMVxuICAgICAgfSk7XG4gICAgICBpZih0aGlzLmRhdGEuY291bnRQYWdlPT09NCl7XG4gICAgICAgIHRoaXMuZ2V0V2VpZ2h0SW5mbygpXG4gICAgICB9XG4gICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGVtcHR5OiB0cnVlIH0pO1xuICAgIH1cbiAgICAvLyAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogZmFsc2UgfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5jb3VudFBhZ2UgPT0gMTEpIHtcbiAgICAgIHRoaXMuc2VuZERhdGFzKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gSGFuZGxlcyB0aGUgcHJlZ25hbmN5IGR1ZSBkYXRlIHBpY2tlciBldmVudFxuICBwdWJsaWMgYmluZERhdGVDaGFuZ2UoZXZlbnQ6IGFueSkge1xuICAgIGxldCB2YWwgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyLWlucHV0XCIsXG4gICAgICB5ZWFyOiB0aGlzLmRhdGEueWVhcnNbdmFsWzBdXSxcbiAgICAgIG1vbnRoOiB0aGlzLmRhdGEubW9udGhzW3ZhbFsxXV0sXG4gICAgICBkYXRlOiB0aGlzLmRhdGEuZGF5c1t2YWxbMl1dLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGJpbmRCZWZvcmVQcmVnV2VpZ2h0SW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNJbnB1dChldmVudCk7XG5cbiAgICBsZXQgcHJlV2VpZ2h0SW5wdXQgPSBldmVudC5kZXRhaWwudmFsdWU7XG5cbiAgICBpZiAocHJlV2VpZ2h0SW5wdXQgIT0gbnVsbCAmJiBwcmVXZWlnaHRJbnB1dCAhPSBcIlwiKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZVByZWdXZWlnaHQ6IHByZVdlaWdodElucHV0LFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZVByZWdXZWlnaHQ6IDAsXG4gICAgICAgIG5leHRQYWdlOiBmYWxzZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgaWYgKHByZVdlaWdodElucHV0ID09IFwiXCIpIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgdGV4dElucHV0Q2xhc3M6IFwic2VjdGlvblwiIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBiaW5kTnVtUHJlZ0lucHV0KGV2ZW50OiBhbnkpOiB2b2lkIHtcblxuICAgIGxldCBudW1QcmVnID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xuXG4gICAgaWYgKG51bVByZWcgPT0gbnVsbCkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBudW1QcmVnOiAwLFxuICAgICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgICAgZW1wdHk6IGZhbHNlXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG51bVByZWc6IE51bWJlcihudW1QcmVnKSArIDEsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXRHZW5kZXJGb3JtcygpIHtcbiAgICBpZiAodGhpcy5kYXRhLmJpcnRoWWVhciA8IDIwMDMgJiYgdGhpcy5kYXRhLmdlbmRlciA9PSAyKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgICAgIHRvdGFsUGFnZTogNyxcbiAgICAgIH0pO1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgKyAxIH0pO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogZmFsc2UsXG4gICAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSArIDQsXG4gICAgICAgIHRvdGFsUGFnZTogNixcbiAgICAgIH0pO1xuXG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uQ2hhbmdlKCkge1xuICAgIC8vIEhhbmRsZXMgbmV4dCBwYWdlIHZhbGlkYXRpb25cblxuICAgIGlmICh0aGlzLmRhdGEuY291bnRQYWdlICE9PSA0ICYmIHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09IDggJiYgdGhpcy5kYXRhLmNvdW50UGFnZSAhPT0yICYmIHRoaXMuZGF0YS5jb3VudFBhZ2UgIT09Mykge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZXMgZGlmZmVyZW50IGZvcm1zIGZsb3cgZm9yIGRpZmZlcmVudCBnZW5kZXJcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA1KSB7XG4gICAgICB0aGlzLnNldEdlbmRlckZvcm1zKCk7XG4gICAgfVxuXG4gICAgLy8gRGlzcGxheSBjb3JyZXNwb25kaW5nIGZvcm1zIGFjY29yZGluZyB0byBzZWxlY3RlZCBwcmVnbmFuY3kgc3RhZ2Ugb3B0aW9uXG4gICAgdGhpcy5oYW5kbGVQcmVnbmFuY3lTdGFnZU9wdGlvbnNGb3JtcygpO1xuXG4gICAgLy8gRGlzcGxheSBjb3JyZXNwb25kaW5nIGZvcm1zIGlmIGZlbWFsZSB1c2VyIGlzIHByZWduYW50XG4gICAgdGhpcy5oYW5kbGVQcmVnbmFudEZlbWFsZUZvcm1zKCk7XG4gIH1cblxuICBwdWJsaWMgaGFuZGxlUHJlZ25hbnRGZW1hbGVGb3JtcygpIHtcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA3KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSwgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiB0cnVlIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA4KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSwgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSwgbnVtYmVyT2ZQcmVnbmFuY2llczogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSwgbnVtYmVyT2ZQcmVnbmFuY2llczogZmFsc2UgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGhhbmRsZVByZWduYW5jeVN0YWdlT3B0aW9uc0Zvcm1zKCkge1xuICAgIGlmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+aAgOWtleacnycgJiYgdGhpcy5kYXRhLnByZWduYW50U3RhZ2VDb25kaXRpb24gPT0gdHJ1ZSAmJiB0aGlzLmRhdGEuZHVlRGF0ZUNvbmRpdGlvbiA9PSBmYWxzZSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZHVlRGF0ZUNvbmRpdGlvbjogdHJ1ZSwgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSwgdG90YWxQYWdlOiAxMCB9KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLnByZWduYW50U3RhZ2VDb25kaXRpb24gPT0gdHJ1ZSAmJiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICflpIflrZXmnJ8nIHx8IHRoaXMuZGF0YS5wcmVnbmFuY3lTdGFnZSA9PSAn5ZO65Lmz5pyfJyB8fCB0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+mDveS4jeaYrycpKSB7XG5cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IGZhbHNlLFxuICAgICAgICBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSxcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlICsgMixcbiAgICAgICAgdG90YWxQYWdlOiA3XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhLnByZWduYW5jeVN0YWdlID09ICfmgIDlrZXmnJ8nICYmIHRoaXMuZGF0YS5wcmVnbmFudFN0YWdlQ29uZGl0aW9uID09IHRydWUgJiYgdGhpcy5kYXRhLmR1ZURhdGVDb25kaXRpb24gPT0gdHJ1ZSkge1xuXG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UsIHByZWduYW50U3RhZ2VDb25kaXRpb246IGZhbHNlLCBkdWVEYXRlQ29uZGl0aW9uOiBmYWxzZSB9KTtcblxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwcmVnbmFuY3lTdGFnZUV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDEpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn5aSH5a2V5pyfJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDEsIHRvdGFsUGFnZTogNyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+aAgOWtleacnycsIHByZWdTdGFnZVNlbGVjdGVkOiAyLCB0b3RhbFBhZ2U6IDEwIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDMpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IHByZWduYW5jeVN0YWdlOiAn5ZO65Lmz5pyfJywgcHJlZ1N0YWdlU2VsZWN0ZWQ6IDMsIHRvdGFsUGFnZTogNyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBwcmVnbmFuY3lTdGFnZTogJ+mDveS4jeaYrycsIHByZWdTdGFnZVNlbGVjdGVkOiAwLCB0b3RhbFBhZ2U6IDcgfSk7XG4gICAgfVxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbmV4dFBhZ2U6IHRydWUsIGVtcHR5OiBmYWxzZSB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhY3Rpdml0eUxldmVsRXZlbnQoZXZlbnQ6IGFueSkge1xuXG4gICAgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAxKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Y2n5bqK5LyR5oGvJywgYWN0aXZpdHlTZWxlY3RlZDogMSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn6L275bqm77yM6Z2Z5Z2Q5bCR5YqoJywgYWN0aXZpdHlTZWxlY3RlZDogMiB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAzKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Lit5bqm77yM5bi45bi46LWw5YqoJywgYWN0aXZpdHlTZWxlY3RlZDogMyB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSA0KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn6YeN5bqm77yM6LSf6YeNJywgYWN0aXZpdHlTZWxlY3RlZDogNCB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSA1KSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBhY3Rpdml0eUxldmVsOiAn5Ymn54OI77yM6LaF6LSf6YeNJywgYWN0aXZpdHlTZWxlY3RlZDogNSB9KTtcbiAgICB9XG5cbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuICB9XG5cbiAgcHVibGljIG1lZGljYWxDb25kaXRpb24oZXZlbnQ6IGFueSkge1xuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT0gMSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgbWVkaWNhbDogJ+ezluWwv+eXhScsIG1lZGljYWxzZWxlY3RlZDogMSB9KTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PSAyKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoeyBtZWRpY2FsOiAn55Sy54q26IW65Yqf6IO95Lqi6L+b55eHJywgbWVkaWNhbHNlbGVjdGVkOiAyIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmlkID09IDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IG1lZGljYWw6ICfml6AnLCBtZWRpY2Fsc2VsZWN0ZWQ6IDAgfSk7XG4gICAgfVxuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgZmluYWxQYWdlOiB0cnVlLCBuZXh0UGFnZTogdHJ1ZSwgZW1wdHk6IGZhbHNlIH0pO1xuXG4gIH1cblxuICAvLyBwdWJsaWMgZ2V0UkRJR29hbCgpOiB2b2lkIHtcbiAgLy8gICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gIC8vICAgd2ViQVBJLlJldHJpZXZlVXNlclJEQSh7fSkudGhlbihyZXNwID0+IHtcbiAgLy8gICAgIHRoaXMucmRhVXJsID0gcmVzcC5yZGFfdXJsO1xuICAvLyAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgLy8gICB3ZWJBUEkuUmV0cmlldmVSZWNvbW1lbmRlZERhaWx5QWxsb3dhbmNlKHt9KS50aGVuKHJlc3AgPT4ge1xuICAvLyAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAvLyAgICAgbGV0IGVuZXJneSA9IHJlc3AuZW5lcmd5O1xuICAvLyAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgLy8gICAgICAgcmRpVmFsdWU6IE1hdGguZmxvb3IoZW5lcmd5IC8gMTAwKVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICAvLyB9XG4gIHB1YmxpYyBnZXRSRElHb2FsKCk6IHZvaWQge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICB3ZWJBUEkuUmV0cmlldmVVc2VyUkRBKHt9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgdGhpcy5yZGFVcmwgPSByZXNwLnJkYV91cmw7XG4gICAgICBpZiAodGhpcy5yZGFVcmwgIT09IFwiXCIpIHtcbiAgICAgICAgd3gucmVMYXVuY2goe1xuICAgICAgICAgIHVybDogJy9wYWdlcy9yZGlQYWdlL3JkaVBhZ2U/dXJsPScgKyB0aGlzLnJkYVVybCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gICAgd2ViQVBJLlJldHJpZXZlUmVjb21tZW5kZWREYWlseUFsbG93YW5jZSh7fSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGxldCBlbmVyZ3kgPSByZXNwLmVuZXJneTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHJkaVZhbHVlOiBNYXRoLmZsb29yKGVuZXJneSAvIDEwMClcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcbiAgfVxuXG4gIHB1YmxpYyByZWRpcmVjdFRvUkRBUGFnZSgpIHtcbiAgICBpZiAodGhpcy5yZGFVcmwgIT09IFwiXCIpIHtcbiAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICB1cmw6ICcvcGFnZXMvcmRpUGFnZS9yZGlQYWdlP3VybD0nICsgdGhpcy5yZGFVcmwsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZW5kRGF0YXMoKTogdm9pZCB7XG4gICAgLy8g5p+l55yL5piv5ZCm5o6I5p2DXG4gICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pO1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4odG9rZW4pO1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgZ2VuZGVyID0gTnVtYmVyKHRoYXQuZGF0YS5nZW5kZXIpO1xuICAgIGxldCBiaXJ0aFllYXIgPSBOdW1iZXIodGhhdC5kYXRhLmJpcnRoWWVhcik7XG4gICAgbGV0IGhlaWdodCA9IE51bWJlcih0aGF0LmRhdGEuaGVpZ2h0KTtcbiAgICBsZXQgd2VpZ2h0ID0gTnVtYmVyKHRoYXQuZGF0YS53ZWlnaHQpO1xuICAgIGxldCB3ZWlnaHRCZWZvcmVQcmVnID0gTnVtYmVyKHRoYXQuZGF0YS5wcmVQcmVnV2VpZ2h0KTtcbiAgICBsZXQgYWN0aXZpdHlTZWxlY3RlZCA9IE51bWJlcih0aGF0LmRhdGEuYWN0aXZpdHlTZWxlY3RlZCk7XG4gICAgbGV0IHByZWdTdGFnZVNlbGVjdGVkID0gTnVtYmVyKHRoYXQuZGF0YS5wcmVnU3RhZ2VTZWxlY3RlZCk7XG4gICAgbGV0IG1lZGljYWxDb25kaXRpb24gPSBOdW1iZXIodGhhdC5kYXRhLm1lZGljYWxzZWxlY3RlZCk7XG4gICAgLy9GSVhNRSBzcGVjaWFsIHNldHRpbmcgZm9yIHNlcnZlciBwcmVnbmFuY3kgc3RhZ2Ugb3V0IG9mIGluZGV4IHJhbmdlIHNldHRpbmdcbiAgICBpZiAocHJlZ1N0YWdlU2VsZWN0ZWQgPCAwIHx8IHByZWdTdGFnZVNlbGVjdGVkID4gMykge1xuICAgICAgcHJlZ1N0YWdlU2VsZWN0ZWQgPSAwO1xuICAgIH1cblxuICAgIGxldCBwcmVnX2JpcnRoX2RhdGUgPSB0aGlzLmRhdGEueWVhciArIFwiLVwiICsgdGhpcy5kYXRhLm1vbnRoICsgXCItXCIgKyB0aGlzLmRhdGEuZGF0ZTtcblxuICAgIC8vIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAvLyB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCJcIiwgY29udGVudDogXCJcIiArIG1vbWVudChbTnVtYmVyKHRoYXQuZGF0YS55ZWFyKSwgTnVtYmVyKHRoYXQuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhhdC5kYXRhLmRhdGUpXSkgfSkgXG5cbiAgICB3eC5nZXRTZXR0aW5nKHtcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAgICAgICB3eC5nZXRVc2VySW5mbyh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IHJlcy51c2VySW5mbztcbiAgICAgICAgICAgICAgbGV0IG5pY2tOYW1lID0gdXNlckluZm8ubmlja05hbWU7XG4gICAgICAgICAgICAgIGxldCBhdmF0YXJVcmwgPSB1c2VySW5mby5hdmF0YXJVcmw7XG4gICAgICAgICAgICAgIGxldCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbiAgICAgICAgICAgICAgbGV0IHVwZGF0ZVVzZXJQcm9maWxlUmVxID0ge1xuICAgICAgICAgICAgICAgIGdlbmRlcjogZ2VuZGVyLFxuICAgICAgICAgICAgICAgIHllYXJfb2ZfYmlydGg6IGJpcnRoWWVhcixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgICAgICB3ZWlnaHQ6IHdlaWdodCxcbiAgICAgICAgICAgICAgICB3ZWlnaHRfYmVmb3JlX3ByZWduYW5jeTogd2VpZ2h0QmVmb3JlUHJlZyxcbiAgICAgICAgICAgICAgICBhY3Rpdml0eV9sZXZlbDogYWN0aXZpdHlTZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBwcmVnbmFuY3lfc3RhZ2U6IHByZWdTdGFnZVNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkX2JpcnRoX2RhdGU6IG1vbWVudChbTnVtYmVyKHRoYXQuZGF0YS55ZWFyKSwgTnVtYmVyKHRoYXQuZGF0YS5tb250aCkgLSAxLCBOdW1iZXIodGhhdC5kYXRhLmRhdGUpXSkgLyAxMDAwLFxuICAgICAgICAgICAgICAgIG5pY2tuYW1lOiBuaWNrTmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgdGltZXNfb2ZfcHJlZ25hbmN5OiB0aGF0LmRhdGEubnVtUHJlZ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Yqg6L295LitLi4uXCIgfSk7XG4gICAgICAgICAgICAgIHdlYkFQSS5VcGRhdGVVc2VyUHJvZmlsZSh1cGRhdGVVc2VyUHJvZmlsZVJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFJESUdvYWwoKTtcbiAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfmm7TmlrDnlKjmiLfkv6Hmga/lpLHotKUnLFxuICAgICAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgbGV0IHVwZGF0ZU1lZGljYWxQcm9maWxlUmVxID0ge1xuICAgICAgICAgICAgICAgIGZvb2RfYWxsZXJneV9pZHM6IFtdLFxuICAgICAgICAgICAgICAgIG1lZGljYWxfY29uZGl0aW9uX2lkczogW21lZGljYWxDb25kaXRpb25dLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtZWRpY2FsQ29uZGl0aW9uICE9IDApIHtcbiAgICAgICAgICAgICAgICB3ZWJBUEkuVXBkYXRlTWVkaWNhbFByb2ZpbGUodXBkYXRlTWVkaWNhbFByb2ZpbGVSZXEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIHVybDogJy4uL2xvZ2luL2luZGV4P3VzZXJfc3RhdHVzPTInXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvL3JlY29yZCB0aGUgb25Cb2FyZCBsYXN0IHN0ZXAgdGltZXNcbiAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ29uYm9hcmRfbGFzdF9zdGVwJywge1xuICAgICAgY291bnRzOiAnY291bnRzJyxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBjb25maXJtU3VibWl0KCkge1xuICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgIHVybDogXCIuLi8uLi9wYWdlcy9ob21lL2luZGV4XCIsXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBwcmVCdXR0b24yMzQoKXtcbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZT09Mil7IC8vIOW9k+WJjeWcqOmAieaLqei6q+mrmOmhtVxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgIGdlbmRlcjogMCxcbiAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSAzKSB7IC8vIOW5tOm+hOmhtVxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICAgIHllYXJEaXNwbGF5OiAneWVhckRpc3BsYXknLFxuICAgICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLmNvdW50UGFnZSA9PSA0KSB7IC8vIOS9k+mHjemhtVxuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICAgIG5leHRQYWdlOiB0cnVlLFxuICAgICAgICBlbXB0eTogZmFsc2UsXG4gICAgICAgIHllYXJEaXNwbGF5OiAneWVhckRpc3BsYXknLFxuICAgICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBwdWJsaWMgcHJlQnV0dG9uUHJlZ25hbnRBbmROb3REdWUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMixcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICBlbXB0eTogZmFsc2UsXG5cbiAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG5cbiAgICAgIHByZWduYW50U3RhZ2VDb25kaXRpb246IHRydWUsXG4gICAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgICBwcmVnU3RhZ2VTZWxlY3RlZDo0LCBcbiAgICB9KSBcbiAgfVxuXG4gIHB1YmxpYyBwcmVCdXR0b25EdWVEYXRlQ29uZGl0aW9uKCl7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGNvdW50UGFnZTogdGhpcy5kYXRhLmNvdW50UGFnZSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgdG90YWxQYWdlOiA3LFxuXG4gICAgICBkdWVEYXRlQ29uZGl0aW9uOmZhbHNlLFxuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgICB5ZWFyOiAnMjAxOScsXG4gICAgICBtb250aDogJzEwJyxcbiAgICAgIGRhdGU6ICcxJyxcblxuICAgICAgcHJlZ25hbnRTdGFnZUNvbmRpdGlvbjogdHJ1ZSxcbiAgICAgIHByZWduYW5jeVN0YWdlOiAnJyxcbiAgICAgIHByZWdTdGFnZVNlbGVjdGVkOiA0LFxuXG4gICAgfSkgXG4gIH1cblxuICBwdWJsaWMgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5QmFjaygpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogdHJ1ZSxcbiAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgcHJlUHJlZ1dlaWdodDogMCxcbiAgICAgIGR1ZURhdGVDb25kaXRpb246IHRydWUsIFxuICAgICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiBmYWxzZSxcblxuICAgICAgZGF0ZVBpY2tlcjogXCJkYXRlUGlja2VyXCIsXG4gICAgICB5ZWFyOiAnMjAxOScsXG4gICAgICBtb250aDogJzEwJyxcbiAgICAgIGRhdGU6ICcxJyxcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIG51bWJlck9mUHJlZ25hbmNpZXNQcmUoKXtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICBudW1QcmVnOiAxLFxuICAgICAgZHVlRGF0ZUNvbmRpdGlvbjogZmFsc2UsIFxuICAgICAgd2VpZ2h0QmVmb3JlUHJlZ25hbmN5OiB0cnVlLCBcbiAgICAgIG51bWJlck9mUHJlZ25hbmNpZXM6IGZhbHNlLFxuXG4gICAgICBwcmVQcmVnV2VpZ2h0OiAwLFxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcHJlQnV0dG9uOSgpe1xuICAgIC8vIOeUt+eUn1xuICAgIGlmICh0aGlzLmRhdGEuZ2VuZGVyPT09MSl7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSA1LFxuICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgbmV4dFBhZ2U6IHRydWUsXG4gICAgICAgIGVtcHR5OiBmYWxzZSxcblxuICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcblxuICAgICAgICBiaXJ0aFllYXI6IDE5OTEsXG4gICAgICAgIHllYXJEaXNwbGF5OiBcInllYXJEaXNwbGF5XCIsXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgLy8g5aWz55SfXG4gICAgICBpZiAodGhpcy5kYXRhLmJpcnRoWWVhciA+PSAyMDAzKXtcbiAgICAgICAgLy8g5bm06b6E5bCP77yM5rKh5pyJ5ruh6Laz5oCA5a2V5bm06b6E5p2h5Lu255qE5aWz5a2pXG4gICAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gNSxcbiAgICAgICAgICBjdXJyZW50UGFnZTogdGhpcy5kYXRhLmN1cnJlbnRQYWdlIC0gMSxcbiAgICAgICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICAgICAgZW1wdHk6IGZhbHNlLFxuICAgICAgICAgIHRvdGFsUGFnZTo3LFxuXG4gICAgICAgICAgYWN0aXZpdHlMZXZlbDogJycsXG4gICAgICAgICAgYWN0aXZpdHlTZWxlY3RlZDogMCxcblxuICAgICAgICAgIGJpcnRoWWVhcjogMTk5MSxcbiAgICAgICAgICB5ZWFyRGlzcGxheTogXCJ5ZWFyRGlzcGxheVwiLFxuICAgICAgICB9KVxuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5ruh6Laz5oCA5a2V5bm06b6E5p2h5Lu255qE5aWz55SfXG4gICAgICAgIGlmICh0aGlzLmRhdGEucHJlZ25hbmN5U3RhZ2UgPT0gJ+aAgOWtleacnycpe1xuICAgICAgICAgIC8vIOmAieaLqeS6hlwi5oCA5a2V5pyfXCLnmoTlpbPnlJ9cbiAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMSxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgICAgICAgICBudW1iZXJPZlByZWduYW5jaWVzOiB0cnVlLFxuXG4gICAgICAgICAgICBudW1QcmVnOiAxLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vIOmAieaLqeS6humdnlwi5oCA5a2V5pyfXCLnmoTlpbPnlJ9cbiAgICAgICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgICAgY291bnRQYWdlOiB0aGlzLmRhdGEuY291bnRQYWdlIC0gMyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRhdGEuY3VycmVudFBhZ2UgLSAxLFxuICAgICAgICAgICAgbmV4dFBhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgZW1wdHk6IGZhbHNlLFxuXG4gICAgICAgICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgICAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgICAgICAgICBwcmVnbmFudFN0YWdlQ29uZGl0aW9uOnRydWUsXG4gICAgICAgICAgICBkdWVEYXRlQ29uZGl0aW9uOmZhbHNlLFxuXG4gICAgICAgICAgICBwcmVnbmFuY3lTdGFnZTogJycsXG4gICAgICAgICAgICBwcmVnU3RhZ2VTZWxlY3RlZDogNCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHB1YmxpYyBwcmVCdXR0b24xMCgpe1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBjb3VudFBhZ2U6IHRoaXMuZGF0YS5jb3VudFBhZ2UgLSAxLFxuICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZGF0YS5jdXJyZW50UGFnZSAtIDEsXG4gICAgICBuZXh0UGFnZTogZmFsc2UsXG4gICAgICBlbXB0eTpmYWxzZSxcblxuICAgICAgbWVkaWNhbDogJycsIFxuICAgICAgbWVkaWNhbHNlbGVjdGVkOiA1LFxuXG4gICAgICBhY3Rpdml0eUxldmVsOiAnJyxcbiAgICAgIGFjdGl2aXR5U2VsZWN0ZWQ6IDAsXG4gICAgfSlcbiAgfVxufVxuXG5QYWdlKG5ldyBvbkJvYXJkKCkpO1xuIl19