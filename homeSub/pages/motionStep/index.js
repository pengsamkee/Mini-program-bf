"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = getApp();
var MotionStep = (function () {
    function MotionStep() {
        this.data = {
            step: '-/-'
        };
    }
    MotionStep.prototype.onLoad = function (options) {
        this.setData({
            step: options.step
        });
    };
    MotionStep.prototype.onReady = function () {
    };
    MotionStep.prototype.backToHome = function () {
        console.log(999);
        wx.switchTab({ url: '/pages/home/index' });
    };
    return MotionStep;
}());
Page(new MotionStep());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksR0FBRyxHQUFJLE1BQU0sRUFBRSxDQUFDO0FBU3BCO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixJQUFJLEVBQUMsS0FBSztTQUNYLENBQUE7SUFjSCxDQUFDO0lBWlEsMkJBQU0sR0FBYixVQUFjLE9BQU87UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNYLElBQUksRUFBQyxPQUFPLENBQUMsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ00sNEJBQU8sR0FBZDtJQUVBLENBQUM7SUFDTSwrQkFBVSxHQUFqQjtRQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQWxCRCxJQWtCQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgYXBwID0gIGdldEFwcCgpO1xuXG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbnR5cGUgb3B0aW9ucyA9IHtcbiAgbWVhbFR5cGU6bnVtYmVyXG4gIG1lYWxEdGF0ZTpudW1iZXJcbiAgdGl0bGU6c3RyaW5nXG59XG5jbGFzcyBNb3Rpb25TdGVwIHtcbiAgXG4gIHB1YmxpYyBkYXRhID0ge1xuICAgIHN0ZXA6Jy0vLSdcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9ucykge1xuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICBzdGVwOm9wdGlvbnMuc3RlcFxuICAgIH0pXG4gIH1cbiAgcHVibGljIG9uUmVhZHkoKXtcbiAgIFxuICB9XG4gIHB1YmxpYyBiYWNrVG9Ib21lKCl7XG4gICAgY29uc29sZS5sb2coOTk5KVxuICAgIHd4LnN3aXRjaFRhYih7dXJsOiAnL3BhZ2VzL2hvbWUvaW5kZXgnfSk7XG4gIH1cbn1cblxuUGFnZShuZXcgTW90aW9uU3RlcCgpKSJdfQ==