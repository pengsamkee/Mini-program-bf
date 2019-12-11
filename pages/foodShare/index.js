"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../api/app/AppService");
var globalEnum = require("../../api/GlobalEnum");
var index_1 = require("../../utils/canvasJS/index");
var interface_1 = require("../../api/app/interface");
var FoodSharePage = (function () {
    function FoodSharePage() {
        this.mealLogId = 0;
        this.data = {
            imageUrl: "",
            bgUrl: "../../images/bg@3x.png",
            imgHeight: 0,
            imgWidth: 350,
            image_url: '',
            percent: 0,
            multi: {},
            single: {},
            user_info: {},
            userInfo: {},
        };
    }
    FoodSharePage.prototype.drawImage = function () {
        var self = this;
        var drawimg = new index_1.default({
            width: self.data.imgWidth,
            height: self.data.imgHeight,
            element: 'canvas1',
            background: '#ffffff',
            destZoom: 3,
            zoom: 2,
            progress: function (percent) {
                self.setData({
                    percent: percent.toFixed(0)
                });
            },
            finish: function (url) {
                console.log(777888, url);
                self.setData({
                    imageUrl: url
                });
            },
            error: function (res) {
                setTimeout(function () {
                    self.drawImage();
                }, 500);
            }
        });
        var data2 = {
            list: [
                {
                    type: 'wxml',
                    class: '.draw-wrap .draw_canvas',
                    limit: '.draw-wrap',
                    x: 0,
                    y: 0
                }
            ]
        };
        drawimg.draw(data2);
    };
    FoodSharePage.prototype.onLoad = function (option) {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        this.mealLogId = Number(option.mealId);
        this.mealLogShare();
        console.log('this.mealLogId', this.mealLogId);
    };
    FoodSharePage.prototype.mealLogShare = function () {
        var that = this;
        interface_1.default.MealLogShare({
            "meal_log_id": this.mealLogId
        }).then(function (res) {
            var r = res;
            var image_url = res.image_url;
            that.setData({
                image_url: image_url,
                multi: res.multi_dish,
                single: res.single_dish,
                user_info: res.user_info
            });
            wx.getImageInfo({
                src: image_url,
                success: function (res) {
                    var h = res.height * that.data.imgWidth / res.width;
                    var canChangeHeight = r.multi_dish ? h : h + 170;
                    that.setData({
                        imgHeight: canChangeHeight,
                        percent: 1
                    }, console.log('================getImageInfo'));
                    setTimeout(function () {
                        that.drawImage();
                    }, 250);
                }
            });
        }).catch(function (err) {
            console.log(err);
        });
    };
    FoodSharePage.prototype.handleImageLoad = function () {
        console.log('================handleImageLoad');
    };
    FoodSharePage.prototype.onBackFoodDiary = function () {
        wx.switchTab({
            url: '/pages/foodDiary/index'
        });
    };
    FoodSharePage.prototype.getSharePic = function () {
        var _this = this;
        wx.showLoading({ title: "生成美图中..." });
        var req = { "meal_log_id": this.mealLogId };
        webAPI.RetrieveMealLogShareURL(req).then(function (resp) {
            wx.hideLoading({});
            var imageUrl = resp.sharing_img_link;
            console.log(imageUrl);
            _this.setData({
                imageUrl: imageUrl
            });
        }).catch(function (err) {
            wx.hideLoading({});
            console.log(err);
            wx.showModal({
                title: '',
                content: '生成美图失败',
                showCancel: false
            });
        });
    };
    FoodSharePage.prototype.onSaveToAlbumBtnPressed = function () {
        var that = this;
        wx.showLoading({
            title: '保存中...'
        });
        wx.saveImageToPhotosAlbum({
            filePath: this.data.imageUrl,
            success: function (data) {
                wx.hideLoading({});
                wx.showToast({
                    title: '保存图片成功',
                });
            },
            fail: function (err) {
                wx.hideLoading({});
                if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                    wx.showModal({
                        title: '提示',
                        content: '需要您授权保存相册',
                        showCancel: false,
                        success: function (modalSuccess) {
                            wx.openSetting({
                                success: function (settingdata) {
                                    console.log("settingdata", settingdata);
                                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取权限成功,再次点击图片即可保存',
                                            showCancel: false,
                                        });
                                    }
                                    else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取权限失败，将无法保存到相册哦~',
                                            showCancel: false,
                                        });
                                    }
                                },
                                fail: function (failData) {
                                    console.log("failData", failData);
                                },
                                complete: function (finishData) {
                                    console.log("finishData", finishData);
                                }
                            });
                        }
                    });
                }
                else {
                    wx.showModal({
                        title: '提示',
                        content: err.errMsg,
                        showCancel: false,
                    });
                }
            }
        });
    };
    FoodSharePage.prototype.onShareAppMessage = function () {
        return {
            title: '知食',
            path: '',
            imageUrl: this.data.imageUrl
        };
    };
    return FoodSharePage;
}());
Page(new FoodSharePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFDbkQsb0RBQW9EO0FBQ3BELHFEQUE2QztBQUU3QztJQUFBO1FBQ1MsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLFNBQUksR0FBRztZQUNaLFFBQVEsRUFBRSxFQUFFO1lBQ1osS0FBSyxFQUFFLHdCQUF3QjtZQUMvQixTQUFTLEVBQUMsQ0FBQztZQUNYLFFBQVEsRUFBQyxHQUFHO1lBQ1osU0FBUyxFQUFDLEVBQUU7WUFDWixPQUFPLEVBQUMsQ0FBQztZQUNULEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLEVBQUU7WUFDVixTQUFTLEVBQUUsRUFBRTtZQUNiLFFBQVEsRUFBQyxFQUFFO1NBQ1osQ0FBQTtJQTJMSCxDQUFDO0lBekxRLGlDQUFTLEdBQWhCO1FBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksT0FBTyxHQUFHLElBQUksZUFBVyxDQUFDO1lBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUMzQixPQUFPLEVBQUUsU0FBUztZQUNsQixVQUFVLEVBQUUsU0FBUztZQUNyQixRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksRUFBRSxDQUFDO1lBQ1AsUUFBUSxZQUFDLE9BQU87Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWCxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQzVCLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxNQUFNLFlBQUMsR0FBRztnQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtnQkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWCxRQUFRLEVB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QUM7cUJBQ0YsQ0FBQyxDQUFBO2lCQUNIO3FCQUFNO29CQUNMLEVBQUUsQ0FBQyxTQUFTLENBQUM7d0JBQ1gsS0FBSyxFQUFFLElBQUk7d0JBQ1gsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFNO3dCQUNuQixVQUFVLEVBQUUsS0FBSztxQkFDbEIsQ0FBQyxDQUFDO2lCQUNKO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTSx5Q0FBaUIsR0FBeEI7UUFDRSxPQUFPO1lBQ0wsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsRUFBRTtZQUNSLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7U0FDN0IsQ0FBQTtJQUNILENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF4TUQsSUF3TUM7QUFFRCxJQUFJLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2ViQVBJIGZyb20gJy4uLy4uL2FwaS9hcHAvQXBwU2VydmljZSc7XG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCBXeG1sMkNhbnZhcyBmcm9tIFwiLi4vLi4vdXRpbHMvY2FudmFzSlMvaW5kZXhcIlxuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi4vLi4vYXBpL2FwcC9pbnRlcmZhY2UnXG5cbmNsYXNzIEZvb2RTaGFyZVBhZ2Uge1xuICBwdWJsaWMgbWVhbExvZ0lkID0gMDtcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsIC8vIOeUu+WHuuadpeeahOWbvlxuICAgIGJnVXJsOiBcIi4uLy4uL2ltYWdlcy9iZ0AzeC5wbmdcIixcbiAgICBpbWdIZWlnaHQ6MCxcbiAgICBpbWdXaWR0aDozNTAsXG4gICAgaW1hZ2VfdXJsOicnLCAvLyDljp/mnaXnmoTlm75cbiAgICBwZXJjZW50OjAsXG4gICAgbXVsdGk6IHt9ICxcbiAgICBzaW5nbGU6IHt9ICxcbiAgICB1c2VyX2luZm86IHt9LFxuICAgIHVzZXJJbmZvOnt9LC8v5pqC5pe25rKh55SoXG4gIH1cblxuICBwdWJsaWMgZHJhd0ltYWdlKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB2YXIgZHJhd2ltZyA9IG5ldyBXeG1sMkNhbnZhcyh7XG4gICAgICB3aWR0aDogc2VsZi5kYXRhLmltZ1dpZHRoLFxuICAgICAgaGVpZ2h0OiBzZWxmLmRhdGEuaW1nSGVpZ2h0LFxuICAgICAgZWxlbWVudDogJ2NhbnZhczEnLFxuICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnLFxuICAgICAgZGVzdFpvb206IDMsXG4gICAgICB6b29tOiAyLFxuICAgICAgcHJvZ3Jlc3MocGVyY2VudCkge1xuICAgICAgICBzZWxmLnNldERhdGEoe1xuICAgICAgICAgIHBlcmNlbnQ6IHBlcmNlbnQudG9GaXhlZCgwKVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGZpbmlzaCh1cmwpIHtcbiAgICAgICAgY29uc29sZS5sb2coNzc3ODg4LHVybClcbiAgICAgICAgc2VsZi5zZXREYXRhKHtcbiAgICAgICAgICBpbWFnZVVybDogdXJsXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgZXJyb3IocmVzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuZHJhd0ltYWdlKCk7XG4gICAgICAgIH0sIDUwMClcbiAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgZGF0YTIgPSB7XG4gICAgICBsaXN0OiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnd3htbCcsXG4gICAgICAgICAgY2xhc3M6ICcuZHJhdy13cmFwIC5kcmF3X2NhbnZhcycsXG4gICAgICAgICAgbGltaXQ6ICcuZHJhdy13cmFwJyxcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDBcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgICBkcmF3aW1nLmRyYXcoZGF0YTIpO1xuICB9XG5cbiAgcHVibGljIG9uTG9hZChvcHRpb246IGFueSkge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICB0aGlzLm1lYWxMb2dJZCA9IE51bWJlcihvcHRpb24ubWVhbElkKTtcbiAgICB0aGlzLm1lYWxMb2dTaGFyZSgpXG4gICAgY29uc29sZS5sb2coJ3RoaXMubWVhbExvZ0lkJywgdGhpcy5tZWFsTG9nSWQpXG4gICAgLy8gdGhpcy5nZXRTaGFyZVBpYygpO1xuICB9XG5cbiAgcHVibGljIG1lYWxMb2dTaGFyZSgpe1xuICAgIGNvbnN0IHRoYXQ6YW55ID0gdGhpc1xuICAgIHJlcXVlc3QuTWVhbExvZ1NoYXJlKHtcbiAgICAgIFwibWVhbF9sb2dfaWRcIjogdGhpcy5tZWFsTG9nSWRcbiAgICB9KS50aGVuKHJlcyA9PiB7XG4gICAgICBjb25zdCByID0gcmVzXG4gICAgICBjb25zdCBpbWFnZV91cmwgPSByZXMuaW1hZ2VfdXJsXG4gICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICBpbWFnZV91cmw6IGltYWdlX3VybCxcbiAgICAgICAgbXVsdGk6IHJlcy5tdWx0aV9kaXNoLFxuICAgICAgICBzaW5nbGU6IHJlcy5zaW5nbGVfZGlzaCxcbiAgICAgICAgdXNlcl9pbmZvOiByZXMudXNlcl9pbmZvXG4gICAgICB9KVxuICAgICAgd3guZ2V0SW1hZ2VJbmZvKHtcbiAgICAgICAgc3JjOiBpbWFnZV91cmwsXG4gICAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgICAgbGV0IGggPSByZXMuaGVpZ2h0ICogdGhhdC5kYXRhLmltZ1dpZHRoIC8gcmVzLndpZHRoO1xuICAgICAgICAgIGxldCBjYW5DaGFuZ2VIZWlnaHQgPSByLm11bHRpX2Rpc2ggPyBoOmgrMTcwO1xuICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAvLyDlm77niYfpu5jorqTmmK8zMDBweOWuvVxuICAgICAgICAgICAgaW1nSGVpZ2h0OiBjYW5DaGFuZ2VIZWlnaHQsXG4gICAgICAgICAgICBwZXJjZW50OjEgLy8g5Y+q5piv5Li65LqG5Zyo55S75Zu+5LmL5YmNMjUwbXPvvIzorqnov5vluqbmnaHlhYjmmL7npLrlh7rmnaVcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coJz09PT09PT09PT09PT09PT1nZXRJbWFnZUluZm8nKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoYXQuZHJhd0ltYWdlKClcbiAgICAgICAgICB9LCAyNTApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGhhbmRsZUltYWdlTG9hZCgpe1xuICAgIGNvbnNvbGUubG9nKCc9PT09PT09PT09PT09PT09aGFuZGxlSW1hZ2VMb2FkJyk7XG4gIH1cbiAgXG4gIHB1YmxpYyBvbkJhY2tGb29kRGlhcnkoKXtcbiAgICB3eC5zd2l0Y2hUYWIoe1xuICAgICAgdXJsOicvcGFnZXMvZm9vZERpYXJ5L2luZGV4J1xuICAgIH0pXG4gIH1cblxuLyoqXG4gKiDlt7Lnu4/ms6jph4pcbiAqL1xuICBwdWJsaWMgZ2V0U2hhcmVQaWMoKSB7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLnlJ/miJDnvo7lm77kuK0uLi5cIiB9KTtcbiAgICBsZXQgcmVxID0geyBcIm1lYWxfbG9nX2lkXCI6IHRoaXMubWVhbExvZ0lkIH07XG4gICAgd2ViQVBJLlJldHJpZXZlTWVhbExvZ1NoYXJlVVJMKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGxldCBpbWFnZVVybCA9IHJlc3Auc2hhcmluZ19pbWdfbGluaztcbiAgICAgIGNvbnNvbGUubG9nKGltYWdlVXJsKTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGltYWdlVXJsOiBpbWFnZVVybFxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfnlJ/miJDnvo7lm77lpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaW1hZ2VVcmw6XCJodHRwOi8vczUuc2luYWltZy5jbi9tdzY5MC8wMDJhUm1WRnp5NzY0RzJ6MGdZZTQmNjkwXCJ9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblNhdmVUb0FsYnVtQnRuUHJlc3NlZCgpIHtcbiAgICAvL2Rvd25sb2FkRmlsZSAtPiBzYXZlIHRlbXBGaWxlIGZyb20gdGVtcEZpbGVQYXRoXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHtcbiAgICAgIHRpdGxlOiAn5L+d5a2Y5LitLi4uJ1xuICAgIH0pO1xuICAgIC8v5Zu+54mH5L+d5a2Y5Yiw5pys5ZywXG4gICAgd3guc2F2ZUltYWdlVG9QaG90b3NBbGJ1bSh7XG4gICAgICBmaWxlUGF0aDogdGhpcy5kYXRhLmltYWdlVXJsLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgIHRpdGxlOiAn5L+d5a2Y5Zu+54mH5oiQ5YqfJyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmFpbDogZnVuY3Rpb24gKGVycikge1xuICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgIGlmIChlcnIuZXJyTXNnID09PSBcInNhdmVJbWFnZVRvUGhvdG9zQWxidW06ZmFpbDphdXRoIGRlbmllZFwiIHx8IGVyci5lcnJNc2cgPT09IFwic2F2ZUltYWdlVG9QaG90b3NBbGJ1bTpmYWlsIGF1dGggZGVueVwiKSB7XG4gICAgICAgICAgLy8g6L+Z6L655b6u5L+h5YGa6L+H6LCD5pW077yM5b+F6aG76KaB5Zyo5oyJ6ZKu5Lit6Kem5Y+R77yM5Zug5q2k6ZyA6KaB5Zyo5by55qGG5Zue6LCD5Lit6L+b6KGM6LCD55SoXG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfpnIDopoHmgqjmjojmnYPkv53lrZjnm7jlhownLFxuICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBtb2RhbFN1Y2Nlc3MgPT4ge1xuICAgICAgICAgICAgICB3eC5vcGVuU2V0dGluZyh7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyhzZXR0aW5nZGF0YSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzZXR0aW5nZGF0YVwiLCBzZXR0aW5nZGF0YSlcbiAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5nZGF0YS5hdXRoU2V0dGluZ1snc2NvcGUud3JpdGVQaG90b3NBbGJ1bSddKSB7XG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bmnYPpmZDmiJDlip8s5YaN5qyh54K55Ye75Zu+54mH5Y2z5Y+v5L+d5a2YJyxcbiAgICAgICAgICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bmnYPpmZDlpLHotKXvvIzlsIbml6Dms5Xkv53lrZjliLDnm7jlhozlk6Z+JyxcbiAgICAgICAgICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWwoZmFpbERhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbERhdGFcIiwgZmFpbERhdGEpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZShmaW5pc2hEYXRhKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmlzaERhdGFcIiwgZmluaXNoRGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgY29udGVudDogZXJyLmVyck1zZyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBvblNoYXJlQXBwTWVzc2FnZSgpIHsgXG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAn55+l6aOfJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgaW1hZ2VVcmw6IHRoaXMuZGF0YS5pbWFnZVVybFxuICAgIH1cbiAgfVxufVxuXG5QYWdlKG5ldyBGb29kU2hhcmVQYWdlKCkpOyJdfQ==