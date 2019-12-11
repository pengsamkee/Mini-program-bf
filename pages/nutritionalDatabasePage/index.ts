"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalEnum = require("../../api/GlobalEnum");
var webAPI = require("../../api/app/AppService");
var app = getApp();
var nutritionalDatabasePage = (function () {
    function nutritionalDatabasePage() {
        this.data = {
            macroArticleArr: [{
                    url: "https://baidu.com/",
                    src: '../../images/maxresdefault.jpg',
                    title: '标题一亦亿亿一亿',
                }],
            microArticleArr: [{
                    url: "https://baidu.com/",
                    src: '../../images/maxresdefault.jpg',
                    title: '标题一亦亿亿一亿',
                    subtitle: '补维生素B1吃什么好？补维生素B1食疗？',
                }],
            macroDisplayArr: [{
                    url: '/pages/nutritionalDatabasePage/articlePage',
                    src: '../../images/maxresdefault.jpg',
                    title: '正在加载...',
                }],
            microDisplayArr: [{
                    url: '/pages/nutritionalDatabasePage/articlePage',
                    src: '../../images/maxresdefault.jpg',
                    title: '正在加载...',
                    subtitle: '正在加载...',
                }],
            textPageOneArticlesArr: [{
                    url: 'https://mp.weixin.qq.com/s/fg1qli0Dk1x9y0WZcOHv8w',
                    src: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuViamaNiaBibYKibgyVhicPzS5PzOrVn6mOdWaKmNdwcZKX93z9BJTtwnJCqiaauFhu0WoD3twaFvjjWGLA/640?wx_fmt=jpeg',
                    title: "秋季饮食攻略！"
                    
            }],
            textPageTwoArticlesArr: [{
                    url: 'https://mp.weixin.qq.com/s/-RbDF1ULR0PG7b7RIyUfNw',
                    src: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuVKWiaYgHG0GA9MiaRwsrtEboibjWRQZhz78jGJZLzG3CJlUIicngaYwgYCekDy8C3NoKjByBxY0ibiaVAg/640?wx_fmt=jpeg',
                    title: "点外卖就不健康？ 我偏不"
            }],
            textPageThreeArticlesArr: [{
                    url: 'https://mp.weixin.qq.com/s/8IcJ7H6q4vtzdlWL3WXIxQ',
                    src: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuWbLRHQEJovBCw4XUxVWKGPJiavPrA9NKPJ4sicF36o3ZZKj2StlhpVoibBv6cs0NHTJic2WFAERdeic3Q/640?wx_fmt=jpeg',
                    title: "营养师如何对老中少胖友进行运动治疗？ 看看蓝皮书怎么说"
              
            }],
            textPageFourArticlesArr: [{
                    url: 'https://mp.weixin.qq.com/s/AdGRVXlW6Kd8dULV9suYgw',
                    src: 'https://mmbiz.qpic.cn/mmbiz_jpg/etvbyK2yNuUUaus7u5nksxyjW0Fics41K5nhKq92jSJrlibicDLqrvcv5JuusrB0mALtpzP52iaiaCchrtg4xkibibKWw/640?wx_fmt=jpeg',
                    title: "如何对肥胖人员进行规范化干预？看看这3张流程图就够了"
              
            }],
            rollingImages: [],
            macroMaxIdx: 3,
            microMaxIdx: 3,
            isTabOneSelected: true,
            optionNumber: 1,
            tabOneStyleClass: "weui-navbar__item weui-bar__item_on",
            tabTwoStyleClass: "weui-navbar__item",
            textOneStyleClass: "weui-navbar-text__item weui-navbar-text__item_on",
            textTwoStyleClass: "weui-navbar-text__item",
            textThreeStyleClass: "weui-navbar-text__item",
            textFourStyleClass: "weui-navbar-text__item",
            isThereMoreMacro: true,
            isThereMoreMicro: true
        };
    }
    nutritionalDatabasePage.prototype.onNavbarSelect1 = function (e) {
        this.setData({
            isTabOneSelected: true,
            tabOneStyleClass: "weui-navbar__item weui-bar__item_on",
            tabTwoStyleClass: "weui-navbar__item"
        });
    };
    nutritionalDatabasePage.prototype.onNavbarSelect2 = function (e) {
        this.setData({
            isTabOneSelected: false,
            tabOneStyleClass: "weui-navbar__item",
            tabTwoStyleClass: "weui-navbar__item weui-bar__item_on"
        });
    };
    nutritionalDatabasePage.prototype.onNavBarTextSelect1 = function (e) {
        this.setData({
            optionNumber: 1,
            textOneStyleClass: "weui-navbar-text__item weui-navbar-text__item_on",
            textTwoStyleClass: "weui-navbar-text__item",
            textThreeStyleClass: "weui-navbar-text__item",
            textFourStyleClass: "weui-navbar-text__item",
        });
    };
    nutritionalDatabasePage.prototype.onNavBarTextSelect2 = function (e) {
        this.setData({
            optionNumber: 2,
            textOneStyleClass: "weui-navbar-text__item",
            textTwoStyleClass: "weui-navbar-text__item weui-navbar-text__item_on",
            textThreeStyleClass: "weui-navbar-text__item",
            textFourStyleClass: "weui-navbar-text__item",
        });
    };
    nutritionalDatabasePage.prototype.onNavBarTextSelect3 = function (e) {
        this.setData({
            optionNumber: 3,
            textOneStyleClass: "weui-navbar-text__item",
            textTwoStyleClass: "weui-navbar-text__item",
            textThreeStyleClass: "weui-navbar-text__item weui-navbar-text__item_on",
            textFourStyleClass: "weui-navbar-text__item",
        });
    };
    nutritionalDatabasePage.prototype.onNavBarTextSelect4 = function (e) {
        this.setData({
            optionNumber: 4,
            textOneStyleClass: "weui-navbar-text__item",
            textTwoStyleClass: "weui-navbar-text__item",
            textThreeStyleClass: "weui-navbar-text__item",
            textFourStyleClass: "weui-navbar-text__item weui-navbar-text__item_on",
        });
    };
    nutritionalDatabasePage.prototype.setRollingImages = function (e) {
        this.setData({
            rollingImages: [this.data.textPageOneArticlesArr[0], 
                            this.data.textPageTwoArticlesArr[0],
                            this.data.textPageThreeArticlesArr[0],
                            this.data.textPageFourArticlesArr[0]
                            ]
        });
    };
    nutritionalDatabasePage.prototype.setDisplayArr = function () {
        var macroTemp = this.data.macroArticleArr.slice(0, this.data.macroMaxIdx);
        var microTemp = this.data.microArticleArr.slice(0, this.data.microMaxIdx);
        this.setData({
            macroDisplayArr: macroTemp,
            microDisplayArr: microTemp
        });
    };
    nutritionalDatabasePage.prototype.onLoadMoreMacro = function (e) {
        if (this.data.macroMaxIdx < this.data.macroArticleArr.length) {
            this.setData({
                macroMaxIdx: this.data.macroMaxIdx += 3
            });
        }
        this.setDisplayArr();
        if (this.data.macroMaxIdx >= this.data.macroArticleArr.length) {
            this.hideMacroButton();
        }
    };
    nutritionalDatabasePage.prototype.onLoadMoreMicro = function (e) {
        if (this.data.microMaxIdx < this.data.microArticleArr.length) {
            this.setData({
                microMaxIdx: this.data.microMaxIdx += 3
            });
        }
        this.setDisplayArr();
        if (this.data.microMaxIdx >= this.data.microArticleArr.length) {
            this.hideMicroButton();
        }
    };
    nutritionalDatabasePage.prototype.hideMacroButton = function () {
        this.setData({
            isThereMoreMacro: false
        });
    };
    nutritionalDatabasePage.prototype.hideMicroButton = function () {
        this.setData({
            isThereMoreMicro: false
        });
    };
    nutritionalDatabasePage.prototype.getArticles = function () {
        var that = this;
        webAPI.RetrieveNutritionKnowledge({}).then(function (resp) {
            var tempMacro = [];
            var tempMicro = [];
            var i = 0;
            for (i = 0; i < resp.macro.length; i++) {
                var temp = {
                    url: resp.macro[i].article_url,
                    src: resp.macro[i].img_url,
                    title: resp.macro[i].desc,
                };
                tempMacro.push(temp);
            }
            for (i = 0; i < resp.micro.length; i++) {
                var temp = {
                    url: resp.micro[i].article_url,
                    src: resp.micro[i].img_url,
                    title: resp.micro[i].title,
                    subtitle: resp.micro[i].desc,
                };
                tempMicro.push(temp);
            }
            that.setData({
                macroArticleArr: tempMacro,
                microArticleArr: tempMicro,
                macroDisplayArr: tempMacro.slice(0, that.data.macroMaxIdx),
                microDisplayArr: tempMicro.slice(0, that.data.microMaxIdx)
            });
            that.setDisplayArr();
            if (tempMacro.length <= 3) {
                that.hideMacroButton();
            }
            if (tempMicro.length <= 3) {
                that.hideMicroButton();
            }
        }).catch(function (err) { return wx.hideLoading({}); });
    };
    nutritionalDatabasePage.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
        wx.showLoading({ title: "加载中...", mask: true });
        var that = this;
        wx.setNavigationBarTitle({
            title: "营养知识"
        });
        setTimeout(function () {
            that.getArticles();
            that.setRollingImages();
            wx.hideLoading({});
        });
    };
    return nutritionalDatabasePage;
}());
Page(new nutritionalDatabasePage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUFtRDtBQUNuRCxpREFBbUQ7QUFFbkQsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUM7QUFFN0I7SUFBQTtRQUNTLFNBQUksR0FBRztZQUNaLGVBQWUsRUFBRSxDQUFDO29CQUNoQixHQUFHLEVBQUUsb0JBQW9CO29CQUN6QixHQUFHLEVBQUUsZ0NBQWdDO29CQUNyQyxLQUFLLEVBQUUsVUFBVTtpQkFDbEIsQ0FBQztZQUNGLGVBQWUsRUFBRSxDQUFDO29CQUNoQixHQUFHLEVBQUUsb0JBQW9CO29CQUN6QixHQUFHLEVBQUUsZ0NBQWdDO29CQUNyQyxLQUFLLEVBQUUsVUFBVTtvQkFDakIsUUFBUSxFQUFFLHNCQUFzQjtpQkFDakMsQ0FBQztZQUNGLGVBQWUsRUFBRSxDQUFDO29CQUNoQixHQUFHLEVBQUUsNENBQTRDO29CQUNqRCxHQUFHLEVBQUUsZ0NBQWdDO29CQUNyQyxLQUFLLEVBQUUsU0FBUztpQkFDakIsQ0FBQztZQUNGLGVBQWUsRUFBRSxDQUFDO29CQUNoQixHQUFHLEVBQUUsNENBQTRDO29CQUNqRCxHQUFHLEVBQUUsZ0NBQWdDO29CQUNyQyxLQUFLLEVBQUUsU0FBUztvQkFDaEIsUUFBUSxFQUFFLFNBQVM7aUJBQ3BCLENBQUM7WUFDRixXQUFXLEVBQUUsQ0FBQztZQUNkLFdBQVcsRUFBRSxDQUFDO1lBQ2QsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixnQkFBZ0IsRUFBRSxxQ0FBcUM7WUFDdkQsZ0JBQWdCLEVBQUUsbUJBQW1CO1lBQ3JDLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFBO0lBZ0lILENBQUM7SUE5SFEsaURBQWUsR0FBdEIsVUFBdUIsQ0FBQztRQUNyQixJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3RCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIs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RTtnQkFDeEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3hCO1lBRUQsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3hCO1FBRUgsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx3Q0FBTSxHQUFiO1FBQ0UsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ25FLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksSUFBSSxHQUFRLElBQUksQ0FBQztRQUVyQixFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDdkIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFDLENBQUM7UUFFSCxVQUFVLENBQUM7WUFDVCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCw4QkFBQztBQUFELENBQUMsQUEvSkQsSUErSkM7QUFFRCxJQUFJLENBQUMsSUFBSSx1QkFBdUIsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2luZGV4LmpzXG5pbXBvcnQgKiBhcyBnbG9iYWxFbnVtIGZyb20gJy4uLy4uL2FwaS9HbG9iYWxFbnVtJztcbmltcG9ydCAqIGFzIHdlYkFQSSBmcm9tICcuLi8uLi9hcGkvYXBwL0FwcFNlcnZpY2UnO1xuXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpO1xuXG5jbGFzcyBudXRyaXRpb25hbERhdGFiYXNlUGFnZSB7XG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIG1hY3JvQXJ0aWNsZUFycjogW3tcbiAgICAgIHVybDogXCJodHRwczovL2JhaWR1LmNvbS9cIixcbiAgICAgIHNyYzogJy4uLy4uL2ltYWdlcy9tYXhyZXNkZWZhdWx0LmpwZycsXG4gICAgICB0aXRsZTogJ+agh+mimOS4gOS6puS6v+S6v+S4gOS6vycsXG4gICAgfV0sXG4gICAgbWljcm9BcnRpY2xlQXJyOiBbe1xuICAgICAgdXJsOiBcImh0dHBzOi8vYmFpZHUuY29tL1wiLFxuICAgICAgc3JjOiAnLi4vLi4vaW1hZ2VzL21heHJlc2RlZmF1bHQuanBnJyxcbiAgICAgIHRpdGxlOiAn5qCH6aKY5LiA5Lqm5Lq/5Lq/5LiA5Lq/JyxcbiAgICAgIHN1YnRpdGxlOiAn6KGl57u055Sf57SgQjHlkIPku4DkuYjlpb3vvJ/ooaXnu7TnlJ/ntKBCMemjn+eWl++8nycsXG4gICAgfV0sXG4gICAgbWFjcm9EaXNwbGF5QXJyOiBbe1xuICAgICAgdXJsOiAnL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2FydGljbGVQYWdlJyxcbiAgICAgIHNyYzogJy4uLy4uL2ltYWdlcy9tYXhyZXNkZWZhdWx0LmpwZycsXG4gICAgICB0aXRsZTogJ+ato+WcqOWKoOi9vS4uLicsXG4gICAgfV0sXG4gICAgbWljcm9EaXNwbGF5QXJyOiBbe1xuICAgICAgdXJsOiAnL3BhZ2VzL251dHJpdGlvbmFsRGF0YWJhc2VQYWdlL2FydGljbGVQYWdlJyxcbiAgICAgIHNyYzogJy4uLy4uL2ltYWdlcy9tYXhyZXNkZWZhdWx0LmpwZycsXG4gICAgICB0aXRsZTogJ+ato+WcqOWKoOi9vS4uLicsXG4gICAgICBzdWJ0aXRsZTogJ+ato+WcqOWKoOi9vS4uLicsXG4gICAgfV0sXG4gICAgbWFjcm9NYXhJZHg6IDMsXG4gICAgbWljcm9NYXhJZHg6IDMsXG4gICAgaXNUYWJPbmVTZWxlY3RlZDogdHJ1ZSxcbiAgICB0YWJPbmVTdHlsZUNsYXNzOiBcIndldWktbmF2YmFyX19pdGVtIHdldWktYmFyX19pdGVtX29uXCIsXG4gICAgdGFiVHdvU3R5bGVDbGFzczogXCJ3ZXVpLW5hdmJhcl9faXRlbVwiLFxuICAgIGlzVGhlcmVNb3JlTWFjcm86IHRydWUsXG4gICAgaXNUaGVyZU1vcmVNaWNybzogdHJ1ZVxuICB9XG5cbiAgcHVibGljIG9uTmF2YmFyU2VsZWN0MShlKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICBpc1RhYk9uZVNlbGVjdGVkOiB0cnVlLFxuICAgIHRhYk9uZVN0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW0gd2V1aS1iYXJfX2l0ZW1fb25cIixcbiAgICB0YWJUd29TdHlsZUNsYXNzOiBcIndldWktbmF2YmFyX19pdGVtXCJcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbk5hdmJhclNlbGVjdDIoZSk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICBpc1RhYk9uZVNlbGVjdGVkOiBmYWxzZSxcbiAgICAgIHRhYk9uZVN0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW1cIixcbiAgICAgIHRhYlR3b1N0eWxlQ2xhc3M6IFwid2V1aS1uYXZiYXJfX2l0ZW0gd2V1aS1iYXJfX2l0ZW1fb25cIlxuICAgIH0pO1xuICB9XG5cbiAgLy8gY29waWVzIGFydGljbGVzIDAgLSBNYXhJZHggZnJvbSBBcnRpY2xlQXJyIHRvIERpc3BsYXlBcnJcbiAgcHVibGljIHNldERpc3BsYXlBcnIoKTogdm9pZCB7XG4gICAgbGV0IG1hY3JvVGVtcCA9IHRoaXMuZGF0YS5tYWNyb0FydGljbGVBcnIuc2xpY2UoMCwgdGhpcy5kYXRhLm1hY3JvTWF4SWR4KTtcbiAgICBsZXQgbWljcm9UZW1wID0gdGhpcy5kYXRhLm1pY3JvQXJ0aWNsZUFyci5zbGljZSgwLCB0aGlzLmRhdGEubWljcm9NYXhJZHgpO1xuXG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIG1hY3JvRGlzcGxheUFycjogbWFjcm9UZW1wLFxuICAgICAgbWljcm9EaXNwbGF5QXJyOiBtaWNyb1RlbXBcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWRNb3JlTWFjcm8oZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGEubWFjcm9NYXhJZHggPCB0aGlzLmRhdGEubWFjcm9BcnRpY2xlQXJyLmxlbmd0aCkge1xuICAgICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbWFjcm9NYXhJZHg6IHRoaXMuZGF0YS5tYWNyb01heElkeCArPSAzXG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zZXREaXNwbGF5QXJyKCk7XG4gICAgaWYgKHRoaXMuZGF0YS5tYWNyb01heElkeCA+PSB0aGlzLmRhdGEubWFjcm9BcnRpY2xlQXJyLmxlbmd0aCkge1xuICAgICAgdGhpcy5oaWRlTWFjcm9CdXR0b24oKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25Mb2FkTW9yZU1pY3JvKGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kYXRhLm1pY3JvTWF4SWR4IDwgdGhpcy5kYXRhLm1pY3JvQXJ0aWNsZUFyci5sZW5ndGgpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICAgIG1pY3JvTWF4SWR4OiB0aGlzLmRhdGEubWljcm9NYXhJZHggKz0gM1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXREaXNwbGF5QXJyKCk7XG4gICAgaWYgKHRoaXMuZGF0YS5taWNyb01heElkeCA+PSB0aGlzLmRhdGEubWljcm9BcnRpY2xlQXJyLmxlbmd0aCkge1xuICAgICAgdGhpcy5oaWRlTWljcm9CdXR0b24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhpZGVNYWNyb0J1dHRvbigpOiB2b2lkIHtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgaXNUaGVyZU1vcmVNYWNybzogZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBoaWRlTWljcm9CdXR0b24oKTogdm9pZCB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGlzVGhlcmVNb3JlTWljcm86IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXRBcnRpY2xlcygpOiB2b2lkIHtcbiAgICB2YXIgdGhhdDogYW55ID0gdGhpcztcblxuICAgIHdlYkFQSS5SZXRyaWV2ZU51dHJpdGlvbktub3dsZWRnZSh7fSkudGhlbihyZXNwID0+IHtcblxuICAgICAgbGV0IHRlbXBNYWNybyA9IFtdO1xuICAgICAgbGV0IHRlbXBNaWNybyA9IFtdO1xuICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCByZXNwLm1hY3JvLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCB0ZW1wID0ge1xuICAgICAgICAgIHVybDogcmVzcC5tYWNyb1tpXS5hcnRpY2xlX3VybCxcbiAgICAgICAgICBzcmM6IHJlc3AubWFjcm9baV0uaW1nX3VybCxcbiAgICAgICAgICB0aXRsZTogcmVzcC5tYWNyb1tpXS5kZXNjLFxuICAgICAgICB9XG4gICAgICAgIHRlbXBNYWNyby5wdXNoKHRlbXApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzcC5taWNyby5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgdGVtcCA9IHtcbiAgICAgICAgICB1cmw6IHJlc3AubWljcm9baV0uYXJ0aWNsZV91cmwsXG4gICAgICAgICAgc3JjOiByZXNwLm1pY3JvW2ldLmltZ191cmwsXG4gICAgICAgICAgdGl0bGU6IHJlc3AubWljcm9baV0udGl0bGUsXG4gICAgICAgICAgc3VidGl0bGU6IHJlc3AubWljcm9baV0uZGVzYyxcbiAgICAgICAgfVxuICAgICAgICB0ZW1wTWljcm8ucHVzaCh0ZW1wKTtcbiAgICAgIH1cblxuICAgICAgKHRoYXQgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgICAgbWFjcm9BcnRpY2xlQXJyOiB0ZW1wTWFjcm8sXG4gICAgICAgIG1pY3JvQXJ0aWNsZUFycjogdGVtcE1pY3JvLFxuICAgICAgICBtYWNyb0Rpc3BsYXlBcnI6IHRlbXBNYWNyby5zbGljZSgwLCB0aGF0LmRhdGEubWFjcm9NYXhJZHgpLFxuICAgICAgICBtaWNyb0Rpc3BsYXlBcnI6IHRlbXBNaWNyby5zbGljZSgwLCB0aGF0LmRhdGEubWljcm9NYXhJZHgpXG4gICAgICB9KTtcblxuICAgICAgKHRoYXQgYXMgYW55KS5zZXREaXNwbGF5QXJyKCk7XG4gICAgICBpZih0ZW1wTWFjcm8ubGVuZ3RoIDw9IDMpIHtcbiAgICAgICAgdGhhdC5oaWRlTWFjcm9CdXR0b24oKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRlbXBNaWNyby5sZW5ndGggPD0gMykge1xuICAgICAgICB0aGF0LmhpZGVNaWNyb0J1dHRvbigpO1xuICAgICAgfVxuXG4gICAgfSkuY2F0Y2goZXJyID0+IHd4LmhpZGVMb2FkaW5nKHt9KSk7XG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCk6IHZvaWQge1xuICAgIHdlYkFQSS5TZXRBdXRoVG9rZW4od3guZ2V0U3RvcmFnZVN5bmMoZ2xvYmFsRW51bS5nbG9iYWxLZXlfdG9rZW4pKTtcbiAgICB3eC5zaG93TG9hZGluZyh7IHRpdGxlOiBcIuWKoOi9veS4rS4uLlwiLCBtYXNrOiB0cnVlIH0pO1xuICAgIGxldCB0aGF0OiBhbnkgPSB0aGlzO1xuXG4gICAgd3guc2V0TmF2aWdhdGlvbkJhclRpdGxlKHtcbiAgICAgIHRpdGxlOiBcIuiQpeWFu+efpeivhlwiXG4gICAgfSk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoYXQuZ2V0QXJ0aWNsZXMoKTtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5QYWdlKG5ldyBudXRyaXRpb25hbERhdGFiYXNlUGFnZSgpKTtcbiJdfQ==