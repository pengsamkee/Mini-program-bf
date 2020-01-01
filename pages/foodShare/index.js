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
    };
    FoodSharePage.prototype.mealLogShare = function () {
        var that = this;
        interface_1.default.MealLogShare({
            "meal_log_id": this.mealLogId
        }).then(function (res) {
            console.log(4567, res);
            if (res.single_dish) {
                for (var index in res.single_dish) {
                    var item = res.single_dish[index];
                    if (res.single_dish[index].value) {
                        if (index === 'calorie') {
                            item.value = item.value.toFixed(0);
                        }
                        else {
                            item.value = item.value.toFixed(1);
                        }
                    }
                }
            }
            else {
                for (var index in res.multi_dish) {
                    var item = res.multi_dish[index];
                    if (res.multi_dish[index].value) {
                        if (index === 'calorie') {
                            item.value = item.value.toFixed(0);
                        }
                        else {
                            item.value = item.value.toFixed(1);
                        }
                    }
                }
            }
            var r = res;
            var image_url = res.image_url;
            that.setData({
                image_url: image_url,
                multi: res.multi_dish,
                single: res.single_dish,
                user_info: res.user_info
            }, function () {
                wx.getImageInfo({
                    src: image_url,
                    success: function (res) {
                        var h = res.height * that.data.imgWidth / res.width;
                        var canChangeHeight = r.multi_dish ? h : h + 170;
                        that.setData({
                            imgHeight: canChangeHeight,
                            percent: 1
                        }, setTimeout(function () {
                            that.drawImage();
                        }, 250));
                    }
                });
            });
        }).catch(function (err) {
            console.log(111);
            console.log(err);
            console.log(222);
        });
    };
    FoodSharePage.prototype.handleImageLoad = function () {
    };
    FoodSharePage.prototype.onBackFoodDiary = function () {
        wx.switchTab({
            url: '/pages/home/index'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFDbkQsb0RBQW9EO0FBQ3BELHFEQUE2QztBQUU3QztJQUFBO1FBQ1MsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLFNBQUksR0FBRztZQUNaLFFBQVEsRUFBRSxFQUFFO1lBQ1osS0FBSyxFQUFFLHdCQUF3QjtZQUMvQixTQUFTLEVBQUMsQ0FBQztZQUNYLFFBQVEsRUFBQyxHQUFHO1lBQ1osU0FBUyxFQUFDLEVBQUU7WUFDWixPQUFPLEVBQUMsQ0FBQztZQUNULEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLEVBQUU7WUFDVixTQUFTLEVBQUUsRUFBRTtZQUNiLFFBQVEsRUFBQyxFQUFFO1NBQ1osQ0FBQTtJQW1OSCxDQUFDO0lBak5RLGlDQUFTLEdBQWhCO1FBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksT0FBTyxHQUFHLElBQUksZUFBVyxDQUFDO1lBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUMzQixPQUFPLEVBQUUsU0FBUztZQUNsQixVQUFVLEVBQUUsU0FBUztZQUNyQixRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksRUFBRSxDQUFDO1lBQ1AsUUFBUSxZQUFDLE9BQU87Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWCxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQzVCLENBQUMsQ0FBQTtZQUNKLENBQUM7WUFDRCxNQUFNLFlBQUMsR0FBRztnQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtnQkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWCxRQUFRLEVB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VSxFQUFFLEtBQUs7cUJBQ2xCLENBQUMsQ0FBQztpQkFDSjtZQUNILENBQUM7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0lBRU0seUNBQWlCLEdBQXhCO1FBQ0UsT0FBTztZQUNMLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLEVBQUU7WUFDUixRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1NBQzdCLENBQUE7SUFDSCxDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBaE9ELElBZ09DO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSc7XG5pbXBvcnQgV3htbDJDYW52YXMgZnJvbSBcIi4uLy4uL3V0aWxzL2NhbnZhc0pTL2luZGV4XCJcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJ1xuXG5jbGFzcyBGb29kU2hhcmVQYWdlIHtcbiAgcHVibGljIG1lYWxMb2dJZCA9IDA7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIGltYWdlVXJsOiBcIlwiLCAvLyDnlLvlh7rmnaXnmoTlm75cbiAgICBiZ1VybDogXCIuLi8uLi9pbWFnZXMvYmdAM3gucG5nXCIsXG4gICAgaW1nSGVpZ2h0OjAsXG4gICAgaW1nV2lkdGg6MzUwLFxuICAgIGltYWdlX3VybDonJywgLy8g5Y6f5p2l55qE5Zu+XG4gICAgcGVyY2VudDowLFxuICAgIG11bHRpOiB7fSAsXG4gICAgc2luZ2xlOiB7fSAsXG4gICAgdXNlcl9pbmZvOiB7fSxcbiAgICB1c2VySW5mbzp7fSwvL+aaguaXtuayoeeUqFxuICB9XG5cbiAgcHVibGljIGRyYXdJbWFnZSgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRyYXdpbWcgPSBuZXcgV3htbDJDYW52YXMoe1xuICAgICAgd2lkdGg6IHNlbGYuZGF0YS5pbWdXaWR0aCxcbiAgICAgIGhlaWdodDogc2VsZi5kYXRhLmltZ0hlaWdodCxcbiAgICAgIGVsZW1lbnQ6ICdjYW52YXMxJyxcbiAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgICAgIGRlc3Rab29tOiAzLFxuICAgICAgem9vbTogMixcbiAgICAgIHByb2dyZXNzKHBlcmNlbnQpIHtcbiAgICAgICAgc2VsZi5zZXREYXRhKHtcbiAgICAgICAgICBwZXJjZW50OiBwZXJjZW50LnRvRml4ZWQoMClcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBmaW5pc2godXJsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKDc3Nzg4OCx1cmwpXG4gICAgICAgIHNlbGYuc2V0RGF0YSh7XG4gICAgICAgICAgaW1hZ2VVcmw6IHVybFxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGVycm9yKHJlcykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLmRyYXdJbWFnZSgpO1xuICAgICAgICB9LCA1MDApXG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGRhdGEyID0ge1xuICAgICAgbGlzdDogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3d4bWwnLFxuICAgICAgICAgIGNsYXNzOiAnLmRyYXctd3JhcCAuZHJhd19jYW52YXMnLFxuICAgICAgICAgIGxpbWl0OiAnLmRyYXctd3JhcCcsXG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gICAgZHJhd2ltZy5kcmF3KGRhdGEyKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uOiBhbnkpIHtcbiAgICB3ZWJBUEkuU2V0QXV0aFRva2VuKHd4LmdldFN0b3JhZ2VTeW5jKGdsb2JhbEVudW0uZ2xvYmFsS2V5X3Rva2VuKSk7XG4gICAgdGhpcy5tZWFsTG9nSWQgPSBOdW1iZXIob3B0aW9uLm1lYWxJZCk7XG4gICAgdGhpcy5tZWFsTG9nU2hhcmUoKVxuICAgIC8vIHRoaXMuZ2V0U2hhcmVQaWMoKTtcbiAgfVxuXG4gIHB1YmxpYyBtZWFsTG9nU2hhcmUoKXtcbiAgICBjb25zdCB0aGF0OmFueSA9IHRoaXNcbiAgICByZXF1ZXN0Lk1lYWxMb2dTaGFyZSh7XG4gICAgICBcIm1lYWxfbG9nX2lkXCI6IHRoaXMubWVhbExvZ0lkXG4gICAgfSkudGhlbihyZXMgPT4ge1xuICAgICAgY29uc29sZS5sb2coNDU2NyxyZXMpXG4gICAgICBpZihyZXMuc2luZ2xlX2Rpc2gpe1xuICAgICAgICBmb3IobGV0IGluZGV4IGluIHJlcy5zaW5nbGVfZGlzaCl7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHJlcy5zaW5nbGVfZGlzaFtpbmRleF07XG4gICAgICAgICAgaWYocmVzLnNpbmdsZV9kaXNoW2luZGV4XS52YWx1ZSl7XG4gICAgICAgICAgICBpZihpbmRleD09PSdjYWxvcmllJyl7XG4gICAgICAgICAgICAgIGl0ZW0udmFsdWUgPSBpdGVtLnZhbHVlLnRvRml4ZWQoMClcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBpdGVtLnZhbHVlID0gaXRlbS52YWx1ZS50b0ZpeGVkKDEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgZm9yKGxldCBpbmRleCBpbiByZXMubXVsdGlfZGlzaCl7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHJlcy5tdWx0aV9kaXNoW2luZGV4XTtcbiAgICAgICAgICBpZihyZXMubXVsdGlfZGlzaFtpbmRleF0udmFsdWUpe1xuICAgICAgICAgICAgaWYoaW5kZXg9PT0nY2Fsb3JpZScpe1xuICAgICAgICAgICAgICBpdGVtLnZhbHVlID0gaXRlbS52YWx1ZS50b0ZpeGVkKDApXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgaXRlbS52YWx1ZSA9IGl0ZW0udmFsdWUudG9GaXhlZCgxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgciA9IHJlc1xuICAgICAgY29uc3QgaW1hZ2VfdXJsID0gcmVzLmltYWdlX3VybFxuICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgaW1hZ2VfdXJsOiBpbWFnZV91cmwsXG4gICAgICAgIG11bHRpOiByZXMubXVsdGlfZGlzaCxcbiAgICAgICAgc2luZ2xlOiByZXMuc2luZ2xlX2Rpc2gsXG4gICAgICAgIHVzZXJfaW5mbzogcmVzLnVzZXJfaW5mb1xuICAgICAgfSwoKT0+e1xuICAgICAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgICAgIHNyYzogaW1hZ2VfdXJsLFxuICAgICAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgICAgICBsZXQgaCA9IHJlcy5oZWlnaHQgKiB0aGF0LmRhdGEuaW1nV2lkdGggLyByZXMud2lkdGg7XG4gICAgICAgICAgICBsZXQgY2FuQ2hhbmdlSGVpZ2h0ID0gci5tdWx0aV9kaXNoID8gaDpoKzE3MDtcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAgIC8vIOWbvueJh+m7mOiupOaYrzMwMHB45a69XG4gICAgICAgICAgICAgIGltZ0hlaWdodDogY2FuQ2hhbmdlSGVpZ2h0LFxuICAgICAgICAgICAgICBwZXJjZW50OjEgLy8g5Y+q5piv5Li65LqG5Zyo55S75Zu+5LmL5YmNMjUwbXPvvIzorqnov5vluqbmnaHlhYjmmL7npLrlh7rmnaVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICB0aGF0LmRyYXdJbWFnZSgpXG4gICAgICAgICAgICB9LCAyNTApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS5sb2coMTExKVxuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgY29uc29sZS5sb2coMjIyKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgaGFuZGxlSW1hZ2VMb2FkKCl7XG4gIH1cbiAgXG4gIHB1YmxpYyBvbkJhY2tGb29kRGlhcnkoKXtcbiAgICB3eC5zd2l0Y2hUYWIoe1xuICAgICAgdXJsOicvcGFnZXMvaG9tZS9pbmRleCdcbiAgICB9KVxuICB9XG5cbi8qKlxuICog5bey57uP5rOo6YeKXG4gKi9cbiAgcHVibGljIGdldFNoYXJlUGljKCkge1xuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi55Sf5oiQ576O5Zu+5LitLi4uXCIgfSk7XG4gICAgbGV0IHJlcSA9IHsgXCJtZWFsX2xvZ19pZFwiOiB0aGlzLm1lYWxMb2dJZCB9O1xuICAgIHdlYkFQSS5SZXRyaWV2ZU1lYWxMb2dTaGFyZVVSTChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBsZXQgaW1hZ2VVcmwgPSByZXNwLnNoYXJpbmdfaW1nX2xpbms7XG4gICAgICBjb25zb2xlLmxvZyhpbWFnZVVybCk7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICBpbWFnZVVybDogaW1hZ2VVcmxcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBjb250ZW50OiAn55Sf5oiQ576O5Zu+5aSx6LSlJyxcbiAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7IGltYWdlVXJsOlwiaHR0cDovL3M1LnNpbmFpbWcuY24vbXc2OTAvMDAyYVJtVkZ6eTc2NEcyejBnWWU0JjY5MFwifSk7XG4gIH1cblxuICBwdWJsaWMgb25TYXZlVG9BbGJ1bUJ0blByZXNzZWQoKSB7XG4gICAgLy9kb3dubG9hZEZpbGUgLT4gc2F2ZSB0ZW1wRmlsZSBmcm9tIHRlbXBGaWxlUGF0aFxuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5zaG93TG9hZGluZyh7XG4gICAgICB0aXRsZTogJ+S/neWtmOS4rS4uLidcbiAgICB9KTtcbiAgICAvL+WbvueJh+S/neWtmOWIsOacrOWcsFxuICAgIHd4LnNhdmVJbWFnZVRvUGhvdG9zQWxidW0oe1xuICAgICAgZmlsZVBhdGg6IHRoaXMuZGF0YS5pbWFnZVVybCxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICB0aXRsZTogJ+S/neWtmOWbvueJh+aIkOWKnycsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICBpZiAoZXJyLmVyck1zZyA9PT0gXCJzYXZlSW1hZ2VUb1Bob3Rvc0FsYnVtOmZhaWw6YXV0aCBkZW5pZWRcIiB8fCBlcnIuZXJyTXNnID09PSBcInNhdmVJbWFnZVRvUGhvdG9zQWxidW06ZmFpbCBhdXRoIGRlbnlcIikge1xuICAgICAgICAgIC8vIOi/mei+ueW+ruS/oeWBmui/h+iwg+aVtO+8jOW/hemhu+imgeWcqOaMiemSruS4reinpuWPke+8jOWboOatpOmcgOimgeWcqOW8ueahhuWbnuiwg+S4rei/m+ihjOiwg+eUqFxuICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICB0aXRsZTogJ+aPkOekuicsXG4gICAgICAgICAgICBjb250ZW50OiAn6ZyA6KaB5oKo5o6I5p2D5L+d5a2Y55u45YaMJyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogbW9kYWxTdWNjZXNzID0+IHtcbiAgICAgICAgICAgICAgd3gub3BlblNldHRpbmcoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3Moc2V0dGluZ2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2V0dGluZ2RhdGFcIiwgc2V0dGluZ2RhdGEpXG4gICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ2RhdGEuYXV0aFNldHRpbmdbJ3Njb3BlLndyaXRlUGhvdG9zQWxidW0nXSkge1xuICAgICAgICAgICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAn6I635Y+W5p2D6ZmQ5oiQ5YqfLOWGjeasoeeCueWHu+WbvueJh+WNs+WPr+S/neWtmCcsXG4gICAgICAgICAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAn6I635Y+W5p2D6ZmQ5aSx6LSl77yM5bCG5peg5rOV5L+d5a2Y5Yiw55u45YaM5ZOmficsXG4gICAgICAgICAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsKGZhaWxEYXRhKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxEYXRhXCIsIGZhaWxEYXRhKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tcGxldGUoZmluaXNoRGF0YSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaW5pc2hEYXRhXCIsIGZpbmlzaERhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGVyci5lcnJNc2csXG4gICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgb25TaGFyZUFwcE1lc3NhZ2UoKSB7IFxuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogJ+efpemjnycsXG4gICAgICBwYXRoOiAnJyxcbiAgICAgIGltYWdlVXJsOiB0aGlzLmRhdGEuaW1hZ2VVcmxcbiAgICB9XG4gIH1cbn1cblxuUGFnZShuZXcgRm9vZFNoYXJlUGFnZSgpKTsiXX0=