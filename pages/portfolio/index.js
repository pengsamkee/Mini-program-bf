"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalEnum = require("../../api/GlobalEnum");
var moment = require("moment");
var app = getApp();
var webAPI = require("../../api/app/AppService");
var PortfolioPage = (function () {
    function PortfolioPage() {
        this.userInfo = {};
        this.data = {
            birthday: 2000,
            ageGroupIndex: 3,
            ageGroup: ['6个月以下', '6个月-1岁', '1-3岁', '3-4岁', '4-7岁', '7-10岁', '10-11岁', '11-14岁', '14-18岁', '18-30岁', '30-50岁', '50-60岁', '60-65岁', '65-80岁', '80岁以上'],
            genderIndex: 1,
            genderArray: ['男', '女'],
            preHeight: 170,
            height: 170,
            preCurrentWeight: 50,
            currentWeight: 50,
            weightBeforePreg: 60,
            pregnancyStatusIndex: 1,
            pregnancyStatusArray: ['都不是', '备孕', '已孕', '哺乳期'],
            activityLevelIndex: 1,
            activityLevelArray: ['卧床休息', '轻度,静坐少动', '中度,常常站立走动', '重度,负重', '剧烈，超负重'],
            pregnancyDate: {
                date: moment().format("YYYY-MM-DD"),
                year: moment().format("YYYY"),
                month: moment().format("MM"),
                day: moment().format("DD")
            },
        };
    }
    PortfolioPage.prototype.onTabItemTap = function (item) {
        wx.reportAnalytics('switch_tab', {
            tab_index: item.index,
            tab_pagepath: item.pagePath,
            tab_text: item.text
        });
    };
    PortfolioPage.prototype.onPullDownRefresh = function () {
        this.getProfileData();
    };
    PortfolioPage.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        this.getProfileData();
    };
    PortfolioPage.prototype.getProfileData = function () {
        var req = {};
        var that = this;
        wx.showLoading({ title: "加载中...", mask: true });
        webAPI.RetrieveUserProfile(req).then(function (resp) {
            wx.hideLoading({});
            var keys = Object.keys(resp);
            var errorChecking = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (resp[key] === -1 || resp[key] === '') {
                    errorChecking[i] = true;
                }
                else {
                    errorChecking[i] = false;
                }
                that.setData({
                    errorChecking: errorChecking
                });
            }
            var tempDate;
            if (resp.expected_birth_date == -1) {
                tempDate = moment();
            }
            else {
                tempDate = moment.unix(resp.expected_birth_date);
            }
            that.setData({
                genderIndex: Number(resp.gender) - 1,
                birthday: resp.year_of_birth == -1 ? 1980 : resp.year_of_birth,
                height: resp.height == -1 ? 0 : resp.height,
                currentWeight: resp.weight == -1 ? 0 : resp.weight,
                weightBeforePreg: resp.weight_before_pregnancy == -1 ? 0 : resp.weight_before_pregnancy,
                pregnancyStatusIndex: resp.pregnancy_stage,
                activityLevelIndex: resp.activity_level - 1,
                externalId: resp.external_id,
                pregnancyDate: {
                    date: tempDate.format('YYYY-MM-DD'),
                    year: tempDate.format('YYYY'),
                    month: tempDate.format('MM'),
                    day: tempDate.format('DD')
                },
            });
            wx.stopPullDownRefresh({});
        }).catch(function (err) { return wx.hideLoading({}); });
    };
    PortfolioPage.prototype.profileChecking = function () {
        var values = Object.values(this.data);
        console.log(values);
        var errorChecking = [];
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            if (value === -1 || value === '') {
                errorChecking[i] = true;
            }
            else {
                errorChecking[i] = false;
            }
            this.setData({
                errorChecking: errorChecking
            });
        }
    };
    PortfolioPage.prototype.onShow = function () {
        this.authenticationRequest();
    };
    PortfolioPage.prototype.authenticationRequest = function () {
        var _this = this;
        if (app.globalData.userInfo) {
            this.userInfo = app.globalData.userInfo;
        }
        else {
            console.log('start getUserInfo');
            wx.getUserInfo({
                success: function (res) {
                    app.globalData.userInfo = res.userInfo;
                    console.log('get getUserInfo' + res.userInfo);
                    _this.userInfo = app.globalData.userInfo;
                },
                fail: function (err) {
                    wx.navigateTo({
                        url: '../login/index'
                    });
                }
            });
        }
    };
    PortfolioPage.prototype.generateProfileReqBody = function () {
        var pregDateTimestamp = moment(this.data.pregnancyDate.date).unix();
        var reqBody = {
            gender: Number(this.data.genderIndex) + 1,
            year_of_birth: this.data.birthday,
            height: this.data.height,
            weight: this.data.currentWeight,
            weight_before_pregnancy: this.data.weightBeforePreg,
            activity_level: this.data.activityLevelIndex + 1,
            pregnancy_stage: this.data.pregnancyStatusIndex,
            expected_birth_date: pregDateTimestamp,
            nickname: this.userInfo.nickName,
            avatar_url: this.userInfo.avatarUrl,
            external_id: this.data.externalId,
        };
        console.log("Request body generated.");
        console.log(reqBody);
        return reqBody;
    };
    PortfolioPage.prototype.pregnancyStatusSelect = function (event) {
        this.setData({
            pregnancyStatusIndex: Number(event.detail.value)
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.activityLvlSelect = function (event) {
        this.setData({
            activityLevelIndex: Number(event.detail.value)
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.onPregnancyDateInput = function (event) {
        var newDate = moment(event.detail.value);
        var year = newDate.year();
        var month = newDate.month() + 1;
        var day = newDate.date();
        var today = moment();
        var pregDateLimit = moment().add(45, 'w');
        if (newDate.isBetween(today, pregDateLimit)) {
            console.log("Pregnancy date is valid");
            this.setData({
                pregnancyDate: {
                    date: event.detail.value,
                    year: year.toString(),
                    month: month.toString(),
                    day: day.toString()
                }
            });
            this.updateProfile();
        }
        else {
            this.setData({
                pregnancyDate: {
                    date: today.format("YYYY-MM-DD"),
                    year: today.format("YYYY"),
                    month: today.format("MM"),
                    day: today.format("DD")
                }
            });
            wx.showModal({
                title: "",
                content: "预产期只能输入今天到未来45周后的日期",
                showCancel: false
            });
        }
    };
    PortfolioPage.prototype.onFocusHeightInput = function (e) {
        this.setData({
            preHeight: this.data.height,
            height: ''
        });
    };
    PortfolioPage.prototype.onHeightInput = function (event) {
        var heightValue = Number(event.detail.value);
        if (heightValue > 230 || (heightValue < 40)) {
            this.setData({
                height: this.data.preHeight
            });
            if (heightValue != 0) {
                wx.showModal({
                    title: "",
                    content: "身高的范围在40cm和230cm之间",
                    showCancel: false
                });
            }
        }
        else {
            this.setData({
                height: heightValue
            });
            this.updateProfile();
        }
    };
    PortfolioPage.prototype.checkWeight = function (event) {
        var weightValue = Number(event.detail.value);
        if (weightValue < 30 || weightValue > 300) {
            this.setData({
                weight: 0
            });
            wx.showModal({
                title: "",
                content: "体重的范围在30kg和300kg之间",
                showCancel: false
            });
        }
        else {
            this.setData({
                weight: weightValue
            });
            this.updateProfile();
        }
    };
    PortfolioPage.prototype.onWeightBeforePregInput = function (event) {
        var weightValue = Number(event.detail.value);
        this.setData({
            weightBeforePreg: weightValue
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.onFocusWeightInput = function (e) {
        this.setData({
            preCurrentWeight: this.data.currentWeight,
            currentWeight: ''
        });
    };
    PortfolioPage.prototype.onCurrentWeightInput = function (event) {
        var currentWeightValue = Number(event.detail.value);
        if (currentWeightValue < 3 || currentWeightValue > 150) {
            this.setData({
                currentWeight: this.data.preCurrentWeight
            });
            if (currentWeightValue != 0) {
                wx.showModal({
                    title: "",
                    content: "体重的范围在3kg和150kg之间",
                    showCancel: false
                });
            }
        }
        else {
            this.setData({
                currentWeight: currentWeightValue
            });
            this.updateProfile();
        }
    };
    PortfolioPage.prototype.birthdaySelect = function (event) {
        this.setData({
            birthday: Number(event.detail.value)
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.genderSelect = function (event) {
        this.setData({
            genderIndex: Number(event.detail.value)
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.tapOnMealHabit = function () {
        wx.navigateTo({
            url: '../foodPreference/index'
        });
        wx.reportAnalytics('tap_on_meal_habit', {});
    };
    PortfolioPage.prototype.tapOnMedicalRecord = function () {
        wx.navigateTo({
            url: '../medicalCase/index'
        });
        wx.reportAnalytics('tap_medical_record', {});
    };
    PortfolioPage.prototype.onIDInput = function (event) {
        var inputId = (event.detail.value).trim();
        this.setData({
            externalId: inputId
        });
        this.updateProfile();
    };
    PortfolioPage.prototype.updateProfile = function () {
        webAPI.UpdateUserProfile(this.generateProfileReqBody()).then(function (resp) {
        }).catch(function (err) { return wx.showModal({
            title: '更新个人资料失败',
            content: String(err),
            showCancel: false
        }); });
        wx.reportAnalytics('update_profile', {});
    };
    return PortfolioPage;
}());
Page(new PortfolioPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLGlEQUFrRDtBQUNsRCwrQkFBaUM7QUFFakMsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUE7QUFFNUIsaURBQW1EO0FBRW5EO0lBQUE7UUFFUyxhQUFRLEdBQUcsRUFBRSxDQUFBO1FBQ2IsU0FBSSxHQUFHO1lBQ1osUUFBUSxFQUFFLElBQUk7WUFDZCxhQUFhLEVBQUUsQ0FBQztZQUNoQixRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQztZQUN2SixXQUFXLEVBQUUsQ0FBQztZQUNkLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDdkIsU0FBUyxFQUFFLEdBQUc7WUFDZCxNQUFNLEVBQUUsR0FBRztZQUNYLGdCQUFnQixFQUFDLEVBQUU7WUFDbkIsYUFBYSxFQUFFLEVBQUU7WUFDakIsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLG9CQUFvQixFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLENBQUM7WUFDckIsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO1lBQ3ZFLGFBQWEsRUFBRTtnQkFDYixJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDbkMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7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O1FBQ0UsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxzQkFBc0I7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU0saUNBQVMsR0FBaEIsVUFBaUIsS0FBVTtRQUN6QixJQUFJLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekMsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixVQUFVLEVBQUUsT0FBTztTQUNwQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLHFDQUFhLEdBQXBCO1FBQ0UsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtRQUVqRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQzNCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ3BCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsRUFKYyxDQUlkLENBQUMsQ0FBQztRQUVKLEVBQUUsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FBQyxBQXZXRCxJQXVXQztBQUVELElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG5pbXBvcnQgeyBVcGRhdGVVc2VyUHJvZmlsZVJlcSB9IGZyb20gXCIuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2VPYmpzXCJcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vYXBpL0dsb2JhbEVudW0nXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuY29uc3QgYXBwID0gZ2V0QXBwPElNeUFwcD4oKVxuXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcblxuY2xhc3MgUG9ydGZvbGlvUGFnZSB7XG5cbiAgcHVibGljIHVzZXJJbmZvID0ge31cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgYmlydGhkYXk6IDIwMDAsXG4gICAgYWdlR3JvdXBJbmRleDogMyxcbiAgICBhZ2VHcm91cDogWyc25Liq5pyI5Lul5LiLJywgJzbkuKrmnIgtMeWygScsICcxLTPlsoEnLCAnMy005bKBJywgJzQtN+WygScsICc3LTEw5bKBJywgJzEwLTEx5bKBJywgJzExLTE05bKBJywgJzE0LTE45bKBJywgJzE4LTMw5bKBJywgJzMwLTUw5bKBJywgJzUwLTYw5bKBJywgJzYwLTY15bKBJywgJzY1LTgw5bKBJywgJzgw5bKB5Lul5LiKJ10sXG4gICAgZ2VuZGVySW5kZXg6IDEsXG4gICAgZ2VuZGVyQXJyYXk6IFsn55S3JywgJ+WlsyddLFxuICAgIHByZUhlaWdodDogMTcwLC8v5Li65LqG55So5oi35L+u5pS56Lqr6auY5pe277yM6Lqr6auY5YC86Ieq5Yqo562J5LqOMO+8jOS/neeVmeeUqOaIt+i/m+WFpemhtemdouaXtuWAmeeahOi6q+mrmFxuICAgIGhlaWdodDogMTcwLFxuICAgIHByZUN1cnJlbnRXZWlnaHQ6NTAsXG4gICAgY3VycmVudFdlaWdodDogNTAsXG4gICAgd2VpZ2h0QmVmb3JlUHJlZzogNjAsXG4gICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IDEsXG4gICAgcHJlZ25hbmN5U3RhdHVzQXJyYXk6IFsn6YO95LiN5pivJywgJ+Wkh+WtlScsICflt7LlrZUnLCAn5ZO65Lmz5pyfJ10sXG4gICAgYWN0aXZpdHlMZXZlbEluZGV4OiAxLFxuICAgIGFjdGl2aXR5TGV2ZWxBcnJheTogWyfljafluorkvJHmga8nLCAn6L275bqmLOmdmeWdkOWwkeWKqCcsICfkuK3luqYs5bi45bi456uZ56uL6LWw5YqoJywgJ+mHjeW6pizotJ/ph40nLCAn5Ymn54OI77yM6LaF6LSf6YeNJ10sXG4gICAgcHJlZ25hbmN5RGF0ZToge1xuICAgICAgZGF0ZTogbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbiAgICAgIHllYXI6IG1vbWVudCgpLmZvcm1hdChcIllZWVlcIiksXG4gICAgICBtb250aDogbW9tZW50KCkuZm9ybWF0KFwiTU1cIiksXG4gICAgICBkYXk6IG1vbWVudCgpLmZvcm1hdChcIkREXCIpXG4gICAgfSxcbiAgfVxuXG4gIHB1YmxpYyBvblRhYkl0ZW1UYXAoaXRlbTogYW55KSB7XG4gICAgLy93eCByZXBvcnQgYW5hbHl0aWNzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCdzd2l0Y2hfdGFiJywge1xuICAgICAgdGFiX2luZGV4OiBpdGVtLmluZGV4LFxuICAgICAgdGFiX3BhZ2VwYXRoOiBpdGVtLnBhZ2VQYXRoLFxuICAgICAgdGFiX3RleHQ6IGl0ZW0udGV4dFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uUHVsbERvd25SZWZyZXNoKCkge1xuICAgIC8vZ2V0IHJlcG9ydCBzdGF0dXMgYWdhaW5cbiAgICB0aGlzLmdldFByb2ZpbGVEYXRhKCk7XG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCk6IHZvaWQge1xuICAgIC8vZ2V0IHByb2ZpbGVcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgdGhpcy5nZXRQcm9maWxlRGF0YSgpO1xuICB9XG5cbiAgcHVibGljIGdldFByb2ZpbGVEYXRhKCkge1xuICAgIHZhciByZXEgPSB7fTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLliqDovb3kuK0uLi5cIiwgbWFzazogdHJ1ZSB9KVxuICAgIHdlYkFQSS5SZXRyaWV2ZVVzZXJQcm9maWxlKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIC8vLTEgdmFsdWUgZmlsdGVyaW5nXG4gICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHJlc3ApOyBcbiAgICAgIGxldCBlcnJvckNoZWNraW5nID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGtleSA9IGtleXNbaV1cbiAgICAgICAgaWYgKHJlc3Bba2V5XSA9PT0gLTEgfHwgcmVzcFtrZXldID09PSAnJykge1xuICAgICAgICAgIGVycm9yQ2hlY2tpbmdbaV0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVycm9yQ2hlY2tpbmdbaV0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAodGhhdCBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICAgIGVycm9yQ2hlY2tpbmc6IGVycm9yQ2hlY2tpbmdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvLyBwYXJzZSBwcmVnbmFuY3lEYXRlIHRpbWVzdGFtcFxuICAgICAgbGV0IHRlbXBEYXRlOiBtb21lbnQ7XG4gICAgICBpZiAocmVzcC5leHBlY3RlZF9iaXJ0aF9kYXRlID09IC0xKSB7XG4gICAgICAgIHRlbXBEYXRlID0gbW9tZW50KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZW1wRGF0ZSA9IG1vbWVudC51bml4KHJlc3AuZXhwZWN0ZWRfYmlydGhfZGF0ZSk7XG4gICAgICB9XG4gICAgICAvL3NldCBkYXRhIGludG8gcHJvZmlsZVxuICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgZ2VuZGVySW5kZXg6IE51bWJlcihyZXNwLmdlbmRlciktMSxcbiAgICAgICAgYmlydGhkYXk6IHJlc3AueWVhcl9vZl9iaXJ0aCA9PSAtMSA/IDE5ODAgOiByZXNwLnllYXJfb2ZfYmlydGgsXG4gICAgICAgIC8vIGludG9QYWdlSGVpZ2h0OiByZXNwLmhlaWdodCA9PSAtMSA/IDAgOiByZXNwLmhlaWdodCxcbiAgICAgICAgaGVpZ2h0OiByZXNwLmhlaWdodCA9PSAtMSA/IDAgOiByZXNwLmhlaWdodCxcbiAgICAgICAgY3VycmVudFdlaWdodDogcmVzcC53ZWlnaHQgPT0gLTEgPyAwIDogcmVzcC53ZWlnaHQsXG4gICAgICAgIHdlaWdodEJlZm9yZVByZWc6IHJlc3Aud2VpZ2h0X2JlZm9yZV9wcmVnbmFuY3kgPT0gLTEgPyAwIDogcmVzcC53ZWlnaHRfYmVmb3JlX3ByZWduYW5jeSxcbiAgICAgICAgcHJlZ25hbmN5U3RhdHVzSW5kZXg6IHJlc3AucHJlZ25hbmN5X3N0YWdlLCAvLyBsb2NhbCBpbmRleCBzdGFydHMgZnJvbSAwLCBub3QgMVxuICAgICAgICBhY3Rpdml0eUxldmVsSW5kZXg6IHJlc3AuYWN0aXZpdHlfbGV2ZWwgLSAxLCAvLyBsb2NhbCBpbmRleCBzdGFydHMgZnJvbSAwLCBub3QgMVxuICAgICAgICBleHRlcm5hbElkOiByZXNwLmV4dGVybmFsX2lkLFxuXG4gICAgICAgIHByZWduYW5jeURhdGU6IHtcbiAgICAgICAgICBkYXRlOiB0ZW1wRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSxcbiAgICAgICAgICB5ZWFyOiB0ZW1wRGF0ZS5mb3JtYXQoJ1lZWVknKSxcbiAgICAgICAgICBtb250aDogdGVtcERhdGUuZm9ybWF0KCdNTScpLFxuICAgICAgICAgIGRheTogdGVtcERhdGUuZm9ybWF0KCdERCcpXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIC8vZGlzbWlzcyB0aGUgcmVmcmVzaCBsb2FkaW5nIGJhclxuICAgICAgd3guc3RvcFB1bGxEb3duUmVmcmVzaCh7fSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHd4LmhpZGVMb2FkaW5nKHt9KSk7XG4gIH1cblxuICBwdWJsaWMgcHJvZmlsZUNoZWNraW5nKCkge1xuICAgIGxldCB2YWx1ZXMgPSBPYmplY3QudmFsdWVzKHRoaXMuZGF0YSk7XG4gICAgY29uc29sZS5sb2codmFsdWVzKTtcbiAgICBsZXQgZXJyb3JDaGVja2luZyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbaV07XG4gICAgICBpZiAodmFsdWUgPT09IC0xIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICBlcnJvckNoZWNraW5nW2ldID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yQ2hlY2tpbmdbaV0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGVycm9yQ2hlY2tpbmc6IGVycm9yQ2hlY2tpbmdcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvblNob3coKSB7XG4gICB0aGlzLmF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpO1xuICB9XG5cbiAgcHVibGljIGF1dGhlbnRpY2F0aW9uUmVxdWVzdCgpIHtcbiAgICAvL3VzZXJJbmZvIHJlcXVlc3RcbiAgICBpZiAoYXBwLmdsb2JhbERhdGEudXNlckluZm8pIHtcbiAgICAgIC8vICh0aGlzIGFzIGFueSkuc2V0RGF0YSEoe1xuICAgICAgLy8gICB1c2VySW5mbzogYXBwLmdsb2JhbERhdGEudXNlckluZm8sXG4gICAgICAvLyB9KVxuICAgICAgdGhpcy51c2VySW5mbyA9IGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnc3RhcnQgZ2V0VXNlckluZm8nKTtcbiAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyA9IHJlcy51c2VySW5mbztcbiAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGdldFVzZXJJbmZvJyArIHJlcy51c2VySW5mbyk7XG4gICAgICAgICAgdGhpcy51c2VySW5mbyA9IGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvO1xuICAgICAgICB9LFxuICAgICAgICBmYWlsOiBlcnIgPT4ge1xuICAgICAgICAgIC8v6Lez6L2s5Yiw6aqM6K+B6aG16Z2iXG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6ICcuLi9sb2dpbi9pbmRleCdcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZVByb2ZpbGVSZXFCb2R5KCk6IFVwZGF0ZVVzZXJQcm9maWxlUmVxIHtcbiAgICAvL2NoZWNrIHByb2ZpbGUgc3RhdHVzIGVhY2ggdGltZSBzdWJtaXQgcHJvZmlsZVxuICAgIGxldCBwcmVnRGF0ZVRpbWVzdGFtcDogbnVtYmVyID0gbW9tZW50KHRoaXMuZGF0YS5wcmVnbmFuY3lEYXRlLmRhdGUpLnVuaXgoKTtcblxuICAgIHZhciByZXFCb2R5ID0ge1xuICAgICAgZ2VuZGVyOiBOdW1iZXIodGhpcy5kYXRhLmdlbmRlckluZGV4KSsxLCBcbiAgICAgIHllYXJfb2ZfYmlydGg6IHRoaXMuZGF0YS5iaXJ0aGRheSxcbiAgICAgIGhlaWdodDogdGhpcy5kYXRhLmhlaWdodCxcbiAgICAgIHdlaWdodDogdGhpcy5kYXRhLmN1cnJlbnRXZWlnaHQsXG4gICAgICB3ZWlnaHRfYmVmb3JlX3ByZWduYW5jeTogdGhpcy5kYXRhLndlaWdodEJlZm9yZVByZWcsXG5cbiAgICAgIGFjdGl2aXR5X2xldmVsOiB0aGlzLmRhdGEuYWN0aXZpdHlMZXZlbEluZGV4ICsgMSwgLy8gYmFja2VuZCBpbmRleCBzdGFydHMgZnJvbSAxLCBub3QgMTBcbiAgICAgIHByZWduYW5jeV9zdGFnZTogdGhpcy5kYXRhLnByZWduYW5jeVN0YXR1c0luZGV4LCAvLyBiYWNrZW5kIGluZGV4IHN0YXJ0cyBmcm9tIDEsIG5vdCAxMFxuXG4gICAgICBleHBlY3RlZF9iaXJ0aF9kYXRlOiBwcmVnRGF0ZVRpbWVzdGFtcCxcbiAgICAgIG5pY2tuYW1lOiB0aGlzLnVzZXJJbmZvLm5pY2tOYW1lLFxuICAgICAgYXZhdGFyX3VybDogdGhpcy51c2VySW5mby5hdmF0YXJVcmwsXG4gICAgICBleHRlcm5hbF9pZDogdGhpcy5kYXRhLmV4dGVybmFsSWQsXG5cbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJSZXF1ZXN0IGJvZHkgZ2VuZXJhdGVkLlwiKTtcbiAgICBjb25zb2xlLmxvZyhyZXFCb2R5KTtcbiAgICByZXR1cm4gcmVxQm9keTtcbiAgfVxuXG4gIHB1YmxpYyBwcmVnbmFuY3lTdGF0dXNTZWxlY3QoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBwcmVnbmFuY3lTdGF0dXNJbmRleDogTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSlcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVQcm9maWxlKCk7XG4gIH1cblxuICBwdWJsaWMgYWN0aXZpdHlMdmxTZWxlY3QoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBhY3Rpdml0eUxldmVsSW5kZXg6IE51bWJlcihldmVudC5kZXRhaWwudmFsdWUpXG4gICAgfSlcblxuICAgIHRoaXMudXBkYXRlUHJvZmlsZSgpO1xuICB9XG5cblxuICBwdWJsaWMgb25QcmVnbmFuY3lEYXRlSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGxldCBuZXdEYXRlID0gbW9tZW50KGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgbGV0IHllYXIgPSBuZXdEYXRlLnllYXIoKTtcbiAgICBsZXQgbW9udGggPSBuZXdEYXRlLm1vbnRoKCkgKyAxO1xuICAgIGxldCBkYXkgPSBuZXdEYXRlLmRhdGUoKTtcbiAgICBsZXQgdG9kYXkgPSBtb21lbnQoKTtcbiAgICBsZXQgcHJlZ0RhdGVMaW1pdCA9IG1vbWVudCgpLmFkZCg0NSwgJ3cnKTtcblxuICAgIGlmIChuZXdEYXRlLmlzQmV0d2Vlbih0b2RheSwgcHJlZ0RhdGVMaW1pdCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUHJlZ25hbmN5IGRhdGUgaXMgdmFsaWRcIik7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBwcmVnbmFuY3lEYXRlOiB7XG4gICAgICAgICAgZGF0ZTogZXZlbnQuZGV0YWlsLnZhbHVlLFxuICAgICAgICAgIHllYXI6IHllYXIudG9TdHJpbmcoKSxcbiAgICAgICAgICBtb250aDogbW9udGgudG9TdHJpbmcoKSxcbiAgICAgICAgICBkYXk6IGRheS50b1N0cmluZygpXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGVQcm9maWxlKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgcHJlZ25hbmN5RGF0ZToge1xuICAgICAgICAgIGRhdGU6IHRvZGF5LmZvcm1hdChcIllZWVktTU0tRERcIiksXG4gICAgICAgICAgeWVhcjogdG9kYXkuZm9ybWF0KFwiWVlZWVwiKSxcbiAgICAgICAgICBtb250aDogdG9kYXkuZm9ybWF0KFwiTU1cIiksXG4gICAgICAgICAgZGF5OiB0b2RheS5mb3JtYXQoXCJERFwiKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBcIumihOS6p+acn+WPquiDvei+k+WFpeS7iuWkqeWIsOacquadpTQ15ZGo5ZCO55qE5pel5pyfXCIsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcHVibGljIG9uRm9jdXNIZWlnaHRJbnB1dChlKXtcbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgcHJlSGVpZ2h0OnRoaXMuZGF0YS5oZWlnaHQsXG4gICAgICBoZWlnaHQ6ICcnXG4gICAgfSlcbiAgfVxuICBwdWJsaWMgb25IZWlnaHRJbnB1dChldmVudDogYW55KSB7XG4gICAgbGV0IGhlaWdodFZhbHVlID0gTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgLy9jaGVjayB0aGUgcHJlZ25hbmN5IHdlZWsgc3RhdHVzXG4gICAgaWYgKGhlaWdodFZhbHVlID4gMjMwIHx8IChoZWlnaHRWYWx1ZSA8IDQwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBoZWlnaHQ6IHRoaXMuZGF0YS5wcmVIZWlnaHRcbiAgICAgIH0pO1xuICAgICAgaWYgKGhlaWdodFZhbHVlIT0wKXtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICBjb250ZW50OiBcIui6q+mrmOeahOiMg+WbtOWcqDQwY23lkowyMzBjbeS5i+mXtFwiLFxuICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBoZWlnaHQ6IGhlaWdodFZhbHVlXG4gICAgICB9LClcbiAgICAgIHRoaXMudXBkYXRlUHJvZmlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjaGVja1dlaWdodChldmVudDogYW55KSB7XG4gICAgbGV0IHdlaWdodFZhbHVlID0gTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgaWYgKHdlaWdodFZhbHVlIDwgMzAgfHwgd2VpZ2h0VmFsdWUgPiAzMDApIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHdlaWdodDogMFxuICAgICAgfSlcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBjb250ZW50OiBcIuS9k+mHjeeahOiMg+WbtOWcqDMwa2flkowzMDBrZ+S5i+mXtFwiLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIHdlaWdodDogd2VpZ2h0VmFsdWVcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMudXBkYXRlUHJvZmlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbldlaWdodEJlZm9yZVByZWdJbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgbGV0IHdlaWdodFZhbHVlID0gTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHdlaWdodEJlZm9yZVByZWc6IHdlaWdodFZhbHVlXG4gICAgfSlcblxuICAgIHRoaXMudXBkYXRlUHJvZmlsZSgpO1xuICB9XG5cbiAgcHVibGljIG9uRm9jdXNXZWlnaHRJbnB1dChlKSB7XG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIHByZUN1cnJlbnRXZWlnaHQ6IHRoaXMuZGF0YS5jdXJyZW50V2VpZ2h0LFxuICAgICAgY3VycmVudFdlaWdodDogJydcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIG9uQ3VycmVudFdlaWdodElucHV0KGV2ZW50OiBhbnkpIHtcbiAgICBsZXQgY3VycmVudFdlaWdodFZhbHVlID0gTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSk7XG4gICAgaWYgKGN1cnJlbnRXZWlnaHRWYWx1ZSA8IDMgfHwgY3VycmVudFdlaWdodFZhbHVlID4gMTUwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBjdXJyZW50V2VpZ2h0OiB0aGlzLmRhdGEucHJlQ3VycmVudFdlaWdodFxuICAgICAgfSk7XG4gICAgICBpZiAoY3VycmVudFdlaWdodFZhbHVlIT0wKXtcbiAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICBjb250ZW50OiBcIuS9k+mHjeeahOiMg+WbtOWcqDNrZ+WSjDE1MGtn5LmL6Ze0XCIsXG4gICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGN1cnJlbnRXZWlnaHQ6IGN1cnJlbnRXZWlnaHRWYWx1ZVxuICAgICAgfSlcblxuICAgICAgdGhpcy51cGRhdGVQcm9maWxlKCk7XG4gICAgfVxuICB9XG5cblxuICBwdWJsaWMgYmlydGhkYXlTZWxlY3QoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBiaXJ0aGRheTogTnVtYmVyKGV2ZW50LmRldGFpbC52YWx1ZSlcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVQcm9maWxlKCk7XG4gIH1cblxuICBwdWJsaWMgZ2VuZGVyU2VsZWN0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgZ2VuZGVySW5kZXg6IE51bWJlcihldmVudC5kZXRhaWwudmFsdWUpXG4gICAgfSlcblxuICAgIHRoaXMudXBkYXRlUHJvZmlsZSgpO1xuICB9XG5cbiAgcHVibGljIHRhcE9uTWVhbEhhYml0KCk6IHZvaWQge1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnLi4vZm9vZFByZWZlcmVuY2UvaW5kZXgnXG4gICAgfSk7XG4gICAgLy9yZXBvcnQgYW5hbHl0aWNzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCd0YXBfb25fbWVhbF9oYWJpdCcsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyB0YXBPbk1lZGljYWxSZWNvcmQoKTogdm9pZCB7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICcuLi9tZWRpY2FsQ2FzZS9pbmRleCdcbiAgICB9KTtcbiAgICAvL3JlcG9ydCBhbmFseXRpY3NcbiAgICB3eC5yZXBvcnRBbmFseXRpY3MoJ3RhcF9tZWRpY2FsX3JlY29yZCcsIHt9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbklESW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGxldCBpbnB1dElkID0gKGV2ZW50LmRldGFpbC52YWx1ZSkudHJpbSgpO1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBleHRlcm5hbElkOiBpbnB1dElkXG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVQcm9maWxlKCk7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlUHJvZmlsZSgpIHtcbiAgICB3ZWJBUEkuVXBkYXRlVXNlclByb2ZpbGUodGhpcy5nZW5lcmF0ZVByb2ZpbGVSZXFCb2R5KCkpLnRoZW4ocmVzcCA9PiB7XG5cbiAgICB9KS5jYXRjaChlcnIgPT4gd3guc2hvd01vZGFsKHtcbiAgICAgIHRpdGxlOiAn5pu05paw5Liq5Lq66LWE5paZ5aSx6LSlJyxcbiAgICAgIGNvbnRlbnQ6IFN0cmluZyhlcnIpLFxuICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICB9KSk7XG4gICAgLy9yZXBvcnQgYW5hbHl0aWNzXG4gICAgd3gucmVwb3J0QW5hbHl0aWNzKCd1cGRhdGVfcHJvZmlsZScsIHt9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyBQb3J0Zm9saW9QYWdlKCkpO1xuIl19