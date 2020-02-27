"use strict";
var app = getApp();
var rdiPage = (function () {
    function rdiPage() {
        this.data = {
            url: null
        };
    }
    rdiPage.prototype.onLoad = function (options) {
        this.setData({
            url: options.url + '#wechat_redirect'
        });
    };
    rdiPage.prototype.loadPageFailed = function () {
        console.log("load web error");
    };
    return rdiPage;
}());
Page(new rdiPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmRpUGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJkaVBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBRTVCO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFDWixHQUFHLEVBQUUsSUFBSTtTQUNWLENBQUE7SUFXSCxDQUFDO0lBVFEsd0JBQU0sR0FBYixVQUFjLE9BQU87UUFDbEIsSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBQyxrQkFBa0I7U0FDcEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGdDQUFjLEdBQXJCO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDSCxjQUFDO0FBQUQsQ0FBQyxBQWRELElBY0M7QUFFRCxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5cbmNsYXNzIHJkaVBhZ2Uge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICB1cmw6IG51bGxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQob3B0aW9ucyk6IHZvaWQge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICB1cmw6IG9wdGlvbnMudXJsKycjd2VjaGF0X3JlZGlyZWN0J1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGxvYWRQYWdlRmFpbGVkKCl7XG4gICAgICBjb25zb2xlLmxvZyhcImxvYWQgd2ViIGVycm9yXCIpO1xuICB9XG59XG5cblBhZ2UobmV3IHJkaVBhZ2UoKSk7Il19