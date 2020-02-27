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
            imgHeight: 0,
            imgWidth: 3,
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
    FoodSharePage.prototype.onLoad = function (options) {
        this.mealLogId = Number(options.mealId);
        if (options.token) {
            wx.setStorageSync('token', options.token);
            webAPI.SetAuthToken(options.token);
        }
    };
    FoodSharePage.prototype.onReady = function () {
        var that = this;
        var windowWidth = wx.getSystemInfoSync().windowWidth;
        this.setData({
            imgWidth: windowWidth * 0.8
        }, function () {
            setTimeout(function () {
                that.mealLogShare();
            }, 300);
        });
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
                multiOrSingle: res.multi_dish ? res.multi_dish : res.single_dish,
                user_info: res.user_info
            }, function () {
                wx.getImageInfo({
                    src: image_url,
                    success: function (res) {
                        var h = (res.height * that.data.imgWidth / res.width) + 275;
                        that.setData({
                            imgHeight: h,
                            percent: 1
                        });
                        setTimeout(function () {
                            console.log(that.data.imgHeight);
                            that.drawImage();
                        }, 250);
                    }
                });
            });
        }).catch(function (err) {
            console.log(err);
        });
    };
    FoodSharePage.prototype.handleGoHome = function () {
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
        var token = wx.getStorageSync(globalEnum.globalKey_token);
        return {
            title: '瘦熊猫Nutritionist',
            path: "/pages/foodShare/index?token=" + token + "&mealId=" + this.mealLogId,
            imageUrl: this.data.imageUrl
        };
    };
    return FoodSharePage;
}());
Page(new FoodSharePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFDbkQsb0RBQW9EO0FBQ3BELHFEQUE2QztBQUU3QztJQUFBO1FBQ1MsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLFNBQUksR0FBRztZQUNaLFFBQVEsRUFBRSxFQUFFO1lBQ1osU0FBUyxFQUFDLENBQUM7WUFDWCxRQUFRLEVBQUMsQ0FBQztZQUNWLFNBQVMsRUFBQyxFQUFFO1lBQ1osT0FBTyxFQUFDLENBQUM7WUFDVCxLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxFQUFFO1lBQ1YsU0FBUyxFQUFFLEVBQUU7WUFDYixRQUFRLEVBQUMsRUFBRTtTQUNaLENBQUE7SUE2TkgsQ0FBQztJQTNOUSxpQ0FBUyxHQUFoQjtRQUNFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLE9BQU8sR0FBRyxJQUFJLGVBQVcsQ0FBQztZQUM1QixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFDM0IsT0FBTyxFQUFFLFNBQVM7WUFDbEIsVUFBVSxFQUFFLFNBQVM7WUFDckIsUUFBUSxFQUFFLENBQUM7WUFDWCxJQUFJLEVBQUUsQ0FBQztZQUNQLFFBQVEsWUFBQyxPQUFPO2dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUM7b0JBQ1gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUM1QixDQUFDLENBQUE7WUFDSixDQUFDO1lBQ0QsTUFBTSxZQUFDLEdBQUc7Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDWCxRQUFRLEVBQUUsR0FBRztpQkFDZCxDQUFDLENBQUE7WUFDSixDQUFDO1lBQ0QsS0FBSyxZQUFDLEdBQUc7Z0JBQ1AsVUFBVSxDQUFDO29CQUNU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QTtnQ0FDdkMsQ0FBQzs2QkFDRixDQUFDLENBQUE7d0JBQ0osQ0FBQztxQkFDRixDQUFDLENBQUE7aUJBQ0g7cUJBQU07b0JBQ0wsRUFBRSxDQUFDLFNBQVMsQ0FBQzt3QkFDWCxLQUFLLEVBQUUsSUFBSTt3QkFDWCxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU07d0JBQ25CLFVBQVUsRUFBRSxLQUFLO3FCQUNsQixDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLHlDQUFpQixHQUF4QjtRQUNFLElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQzNELE9BQU87WUFDTCxLQUFLLEVBQUUsaUJBQWlCO1lBQ3hCLElBQUksRUFBRSxrQ0FBZ0MsS0FBSyxnQkFBVyxJQUFJLENBQUMsU0FBVztZQUN0RSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1NBQzdCLENBQUE7SUFDSCxDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBek9ELElBeU9DO0FBRUQsSUFBSSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSc7XG5pbXBvcnQgV3htbDJDYW52YXMgZnJvbSBcIi4uLy4uL3V0aWxzL2NhbnZhc0pTL2luZGV4XCJcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4uLy4uL2FwaS9hcHAvaW50ZXJmYWNlJ1xuXG5jbGFzcyBGb29kU2hhcmVQYWdlIHtcbiAgcHVibGljIG1lYWxMb2dJZCA9IDA7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIGltYWdlVXJsOiBcIlwiLCAvLyDnlLvlh7rmnaXnmoTlm75cbiAgICBpbWdIZWlnaHQ6MCxcbiAgICBpbWdXaWR0aDozLFxuICAgIGltYWdlX3VybDonJywgLy8g5Y6f5p2l55qE5Zu+XG4gICAgcGVyY2VudDowLFxuICAgIG11bHRpOiB7fSAsXG4gICAgc2luZ2xlOiB7fSAsXG4gICAgdXNlcl9pbmZvOiB7fSxcbiAgICB1c2VySW5mbzp7fSwvL+aaguaXtuayoeeUqFxuICB9XG5cbiAgcHVibGljIGRyYXdJbWFnZSgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRyYXdpbWcgPSBuZXcgV3htbDJDYW52YXMoe1xuICAgICAgd2lkdGg6IHNlbGYuZGF0YS5pbWdXaWR0aCxcbiAgICAgIGhlaWdodDogc2VsZi5kYXRhLmltZ0hlaWdodCxcbiAgICAgIGVsZW1lbnQ6ICdjYW52YXMxJyxcbiAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgICAgIGRlc3Rab29tOiAzLFxuICAgICAgem9vbTogMixcbiAgICAgIHByb2dyZXNzKHBlcmNlbnQpIHtcbiAgICAgICAgc2VsZi5zZXREYXRhKHtcbiAgICAgICAgICBwZXJjZW50OiBwZXJjZW50LnRvRml4ZWQoMClcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBmaW5pc2godXJsKSB7XG4gICAgICAgIHNlbGYuc2V0RGF0YSh7XG4gICAgICAgICAgaW1hZ2VVcmw6IHVybFxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGVycm9yKHJlcykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLmRyYXdJbWFnZSgpO1xuICAgICAgICB9LCA1MDApXG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGRhdGEyID0ge1xuICAgICAgbGlzdDogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3d4bWwnLFxuICAgICAgICAgIGNsYXNzOiAnLmRyYXctd3JhcCAuZHJhd19jYW52YXMnLFxuICAgICAgICAgIGxpbWl0OiAnLmRyYXctd3JhcCcsXG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gICAgZHJhd2ltZy5kcmF3KGRhdGEyKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5tZWFsTG9nSWQgPSBOdW1iZXIob3B0aW9ucy5tZWFsSWQpO1xuICAgIGlmKG9wdGlvbnMudG9rZW4pe1xuICAgICAgd3guc2V0U3RvcmFnZVN5bmMoJ3Rva2VuJyxvcHRpb25zLnRva2VuKTtcbiAgICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4ob3B0aW9ucy50b2tlbik7XG4gICAgfVxuICAgIFxuICB9XG4gIHB1YmxpYyBvblJlYWR5KCl7XG4gICAgY29uc3QgdGhhdCA9IHRoaXNcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IHd4LmdldFN5c3RlbUluZm9TeW5jKCkud2luZG93V2lkdGhcbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgaW1nV2lkdGg6d2luZG93V2lkdGgqMC44XG4gICAgfSwoKT0+e1xuICAgICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICB0aGF0Lm1lYWxMb2dTaGFyZSgpXG4gICAgICB9LDMwMClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIG1lYWxMb2dTaGFyZSgpe1xuICAgIGNvbnN0IHRoYXQ6YW55ID0gdGhpc1xuICAgIHJlcXVlc3QuTWVhbExvZ1NoYXJlKHtcbiAgICAgIFwibWVhbF9sb2dfaWRcIjogdGhpcy5tZWFsTG9nSWRcbiAgICB9KS50aGVuKHJlcyA9PiB7XG4gICAgICBjb25zb2xlLmxvZyg0NTY3LHJlcylcbiAgICAgIGlmKHJlcy5zaW5nbGVfZGlzaCl7XG4gICAgICAgIGZvcihsZXQgaW5kZXggaW4gcmVzLnNpbmdsZV9kaXNoKXtcbiAgICAgICAgICBjb25zdCBpdGVtID0gcmVzLnNpbmdsZV9kaXNoW2luZGV4XTtcbiAgICAgICAgICBpZihyZXMuc2luZ2xlX2Rpc2hbaW5kZXhdLnZhbHVlKXtcbiAgICAgICAgICAgIGlmKGluZGV4PT09J2NhbG9yaWUnKXtcbiAgICAgICAgICAgICAgaXRlbS52YWx1ZSA9IGl0ZW0udmFsdWUudG9GaXhlZCgwKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGl0ZW0udmFsdWUgPSBpdGVtLnZhbHVlLnRvRml4ZWQoMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBmb3IobGV0IGluZGV4IGluIHJlcy5tdWx0aV9kaXNoKXtcbiAgICAgICAgICBjb25zdCBpdGVtID0gcmVzLm11bHRpX2Rpc2hbaW5kZXhdO1xuICAgICAgICAgIGlmKHJlcy5tdWx0aV9kaXNoW2luZGV4XS52YWx1ZSl7XG4gICAgICAgICAgICBpZihpbmRleD09PSdjYWxvcmllJyl7XG4gICAgICAgICAgICAgIGl0ZW0udmFsdWUgPSBpdGVtLnZhbHVlLnRvRml4ZWQoMClcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBpdGVtLnZhbHVlID0gaXRlbS52YWx1ZS50b0ZpeGVkKDEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByID0gcmVzXG4gICAgICBjb25zdCBpbWFnZV91cmwgPSByZXMuaW1hZ2VfdXJsXG4gICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICBpbWFnZV91cmw6IGltYWdlX3VybCxcbiAgICAgICAgLy8gbXVsdGk6IHJlcy5tdWx0aV9kaXNoLFxuICAgICAgICAvLyBzaW5nbGU6IHJlcy5zaW5nbGVfZGlzaCxcbiAgICAgICAgbXVsdGlPclNpbmdsZTpyZXMubXVsdGlfZGlzaD9yZXMubXVsdGlfZGlzaDpyZXMuc2luZ2xlX2Rpc2gsXG4gICAgICAgIHVzZXJfaW5mbzogcmVzLnVzZXJfaW5mb1xuICAgICAgfSwoKT0+e1xuICAgICAgICB3eC5nZXRJbWFnZUluZm8oe1xuICAgICAgICAgIHNyYzogaW1hZ2VfdXJsLFxuICAgICAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgICAgICBsZXQgaCA9IChyZXMuaGVpZ2h0ICogdGhhdC5kYXRhLmltZ1dpZHRoIC8gcmVzLndpZHRoKSsyNzU7XG4gICAgICAgICAgICAvLyBsZXQgY2FuQ2hhbmdlSGVpZ2h0ID0gci5tdWx0aV9kaXNoID8gaDpoKzE3MDtcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAgIC8vIOWbvueJh+m7mOiupOaYrzMwMHB45a69XG4gICAgICAgICAgICAgIGltZ0hlaWdodDogaCxcbiAgICAgICAgICAgICAgcGVyY2VudDoxIC8vIOWPquaYr+S4uuS6huWcqOeUu+WbvuS5i+WJjTI1MG1z77yM6K6p6L+b5bqm5p2h5YWI5pi+56S65Ye65p2lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoYXQuZGF0YS5pbWdIZWlnaHQpXG4gICAgICAgICAgICAgIHRoYXQuZHJhd0ltYWdlKClcbiAgICAgICAgICAgIH0sIDI1MClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfSlcbiAgfVxuICBcbiAgcHVibGljIGhhbmRsZUdvSG9tZSgpe1xuICAgIHd4LnN3aXRjaFRhYih7XG4gICAgICB1cmw6Jy9wYWdlcy9ob21lL2luZGV4J1xuICAgIH0pXG4gIH1cblxuLyoqXG4gKiDlt7Lnu4/ms6jph4pcbiAqL1xuICBwdWJsaWMgZ2V0U2hhcmVQaWMoKSB7XG4gICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLnlJ/miJDnvo7lm77kuK0uLi5cIiB9KTtcbiAgICBsZXQgcmVxID0geyBcIm1lYWxfbG9nX2lkXCI6IHRoaXMubWVhbExvZ0lkIH07XG4gICAgd2ViQVBJLlJldHJpZXZlTWVhbExvZ1NoYXJlVVJMKHJlcSkudGhlbihyZXNwID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGxldCBpbWFnZVVybCA9IHJlc3Auc2hhcmluZ19pbWdfbGluaztcbiAgICAgIGNvbnNvbGUubG9nKGltYWdlVXJsKTtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIGltYWdlVXJsOiBpbWFnZVVybFxuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGNvbnRlbnQ6ICfnlJ/miJDnvo7lm77lpLHotKUnLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gKHRoaXMgYXMgYW55KS5zZXREYXRhKHsgaW1hZ2VVcmw6XCJodHRwOi8vczUuc2luYWltZy5jbi9tdzY5MC8wMDJhUm1WRnp5NzY0RzJ6MGdZZTQmNjkwXCJ9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblNhdmVUb0FsYnVtQnRuUHJlc3NlZCgpIHtcbiAgICAvL2Rvd25sb2FkRmlsZSAtPiBzYXZlIHRlbXBGaWxlIGZyb20gdGVtcEZpbGVQYXRoXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHd4LnNob3dMb2FkaW5nKHtcbiAgICAgIHRpdGxlOiAn5L+d5a2Y5LitLi4uJ1xuICAgIH0pO1xuICAgIC8v5Zu+54mH5L+d5a2Y5Yiw5pys5ZywXG4gICAgd3guc2F2ZUltYWdlVG9QaG90b3NBbGJ1bSh7XG4gICAgICBmaWxlUGF0aDogdGhpcy5kYXRhLmltYWdlVXJsLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoe30pO1xuICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgIHRpdGxlOiAn5L+d5a2Y5Zu+54mH5oiQ5YqfJyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmFpbDogZnVuY3Rpb24gKGVycikge1xuICAgICAgICB3eC5oaWRlTG9hZGluZyh7fSk7XG4gICAgICAgIGlmIChlcnIuZXJyTXNnID09PSBcInNhdmVJbWFnZVRvUGhvdG9zQWxidW06ZmFpbDphdXRoIGRlbmllZFwiIHx8IGVyci5lcnJNc2cgPT09IFwic2F2ZUltYWdlVG9QaG90b3NBbGJ1bTpmYWlsIGF1dGggZGVueVwiKSB7XG4gICAgICAgICAgLy8g6L+Z6L655b6u5L+h5YGa6L+H6LCD5pW077yM5b+F6aG76KaB5Zyo5oyJ6ZKu5Lit6Kem5Y+R77yM5Zug5q2k6ZyA6KaB5Zyo5by55qGG5Zue6LCD5Lit6L+b6KGM6LCD55SoXG4gICAgICAgICAgd3guc2hvd01vZGFsKHtcbiAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfpnIDopoHmgqjmjojmnYPkv53lrZjnm7jlhownLFxuICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBtb2RhbFN1Y2Nlc3MgPT4ge1xuICAgICAgICAgICAgICB3eC5vcGVuU2V0dGluZyh7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyhzZXR0aW5nZGF0YSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzZXR0aW5nZGF0YVwiLCBzZXR0aW5nZGF0YSlcbiAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5nZGF0YS5hdXRoU2V0dGluZ1snc2NvcGUud3JpdGVQaG90b3NBbGJ1bSddKSB7XG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bmnYPpmZDmiJDlip8s5YaN5qyh54K55Ye75Zu+54mH5Y2z5Y+v5L+d5a2YJyxcbiAgICAgICAgICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfojrflj5bmnYPpmZDlpLHotKXvvIzlsIbml6Dms5Xkv53lrZjliLDnm7jlhozlk6Z+JyxcbiAgICAgICAgICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWwoZmFpbERhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbERhdGFcIiwgZmFpbERhdGEpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZShmaW5pc2hEYXRhKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmlzaERhdGFcIiwgZmluaXNoRGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICfmj5DnpLonLFxuICAgICAgICAgICAgY29udGVudDogZXJyLmVyck1zZyxcbiAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBvblNoYXJlQXBwTWVzc2FnZSgpIHsgXG4gICAgY29uc3QgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbilcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6ICfnmKbnhornjKtOdXRyaXRpb25pc3QnLFxuICAgICAgcGF0aDogYC9wYWdlcy9mb29kU2hhcmUvaW5kZXg/dG9rZW49JHt0b2tlbn0mbWVhbElkPSR7dGhpcy5tZWFsTG9nSWR9YCxcbiAgICAgIGltYWdlVXJsOiB0aGlzLmRhdGEuaW1hZ2VVcmxcbiAgICB9XG4gIH1cbn1cblxuUGFnZShuZXcgRm9vZFNoYXJlUGFnZSgpKTsiXX0=