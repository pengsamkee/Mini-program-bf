"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var DailyPage = (function () {
    function DailyPage() {
        this.data = {};
    }
    DailyPage.prototype.onLoad = function () {
    };
    DailyPage.prototype.onReady = function () {
    };
    DailyPage.prototype.backToHome = function () {
        console.log(999);
        wx.switchTab({ url: '/pages/home/index' });
    };
    return DailyPage;
}());
Page(new DailyPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBU3BCO0lBQUE7UUFFUyxTQUFJLEdBQUcsRUFFYixDQUFBO0lBWUgsQ0FBQztJQVZRLDBCQUFNLEdBQWI7SUFFQSxDQUFDO0lBQ00sMkJBQU8sR0FBZDtJQUVBLENBQUM7SUFDTSw4QkFBVSxHQUFqQjtRQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQWhCRCxJQWdCQztBQUVELElBQUksQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgYXBwID0gIGdldEFwcCgpO1xuXG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbnR5cGUgb3B0aW9ucyA9IHtcbiAgbWVhbFR5cGU6bnVtYmVyXG4gIG1lYWxEdGF0ZTpudW1iZXJcbiAgdGl0bGU6c3RyaW5nXG59XG5jbGFzcyBEYWlseVBhZ2Uge1xuICBcbiAgcHVibGljIGRhdGEgPSB7XG4gICAgXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKCkge1xuICAgIFxuICB9XG4gIHB1YmxpYyBvblJlYWR5KCl7XG4gICBcbiAgfVxuICBwdWJsaWMgYmFja1RvSG9tZSgpe1xuICAgIGNvbnNvbGUubG9nKDk5OSlcbiAgICB3eC5zd2l0Y2hUYWIoe3VybDogJy9wYWdlcy9ob21lL2luZGV4J30pO1xuICB9XG59XG5cblBhZ2UobmV3IERhaWx5UGFnZSgpKSJdfQ==