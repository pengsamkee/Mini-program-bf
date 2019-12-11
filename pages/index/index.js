"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require('../../api/login/LoginService.js');
var globalEnum = require("../../api/GlobalEnum");
var IndexPage = (function () {
    function IndexPage() {
        this.data = {};
    }
    IndexPage.prototype.onLoad = function () {
        this.login();
    };
    IndexPage.prototype.login = function () {
        wx.showLoading({ title: "加载数据中...", mask: true });
        wx.login({
            success: function (_res) {
                wx.hideLoading({});
                console.log(_res.code);
                var req = { jscode: _res.code };
                webAPI.MiniProgramLogin(req)
                    .then(function (resp) {
                    var token = resp.token;
                    var reportId = resp.report_id;
                    console.log("token:" + token);
                    console.log("reportId:" + reportId);
                    if (token && reportId) {
                        wx.setStorageSync(globalEnum.globalKey_token, token);
                        wx.setStorageSync(globalEnum.globalKey_reportId, reportId);
                    }
                    console.log("forward to report index page");
                    wx.redirectTo({
                        url: '../report/index'
                    });
                })
                    .catch(function (err) { return wx.hideLoading({}); });
            }
        });
    };
    ;
    return IndexPage;
}());
Page(new IndexPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ3hELGlEQUFrRDtBQUdsRDtJQUFBO1FBQ1MsU0FBSSxHQUFHLEVBRWIsQ0FBQTtJQW9DSCxDQUFDO0lBbENRLDBCQUFNLEdBQWI7UUFDRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRU0seUJBQUssR0FBWjtRQUVFLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDUCxPQUFPLFlBQUMsSUFBSTtnQkFDVixFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFFdEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO3FCQUN6QixJQUFJLENBQUMsVUFBQSxJQUFJO29CQUVSLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDO29CQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFO3dCQUNyQixFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ3JELEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUM1RDtvQkFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7b0JBQzVDLEVBQUUsQ0FBQyxVQUFVLENBQUM7d0JBQ1osR0FBRyxFQUFFLGlCQUFpQjtxQkFDdkIsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQztxQkFDRCxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7WUFDdEMsQ0FBQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFBQSxDQUFDO0lBQ0osZ0JBQUM7QUFBRCxDQUFDLEFBdkNELElBdUNDO0FBRUQsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vaW5kZXguanNcbi8v6I635Y+W5bqU55So5a6e5L6LXG5pbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi9hcHAnXG4vL3NldCB1cCBheGlvcyBhZGFwdGVyXG52YXIgd2ViQVBJID0gcmVxdWlyZSgnLi4vLi4vYXBpL2xvZ2luL0xvZ2luU2VydmljZS5qcycpO1xuaW1wb3J0ICogYXMgZ2xvYmFsRW51bSBmcm9tICcuLi8uLi9hcGkvR2xvYmFsRW51bSdcbi8vd3JpdGUgYSBsb2FkaW5nIHBhZ2UgdG8gZW5zdXJlIHVzZXIgbG9naW5cblxuY2xhc3MgSW5kZXhQYWdlIHtcbiAgcHVibGljIGRhdGEgPSB7XG5cbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgdGhpcy5sb2dpbigpO1xuICB9XG5cbiAgcHVibGljIGxvZ2luKCkge1xuICAgIC8vIOeZu+W9lVxuICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Yqg6L295pWw5o2u5LitLi4uXCIsIG1hc2s6IHRydWUgfSk7XG4gICAgd3gubG9naW4oe1xuICAgICAgc3VjY2VzcyhfcmVzKSB7XG4gICAgICAgIHd4LmhpZGVMb2FkaW5nKHt9KTtcbiAgICAgICAgY29uc29sZS5sb2coX3Jlcy5jb2RlKVxuICAgICAgICAvLyDlj5HpgIEgX3Jlcy5jb2RlIOWIsOWQjuWPsOaNouWPliBvcGVuSWQsIHNlc3Npb25LZXksIHVuaW9uSWRcbiAgICAgICAgdmFyIHJlcSA9IHsganNjb2RlOiBfcmVzLmNvZGUgfTtcbiAgICAgICAgd2ViQVBJLk1pbmlQcm9ncmFtTG9naW4ocmVxKVxuICAgICAgICAgIC50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgLy9zdG9yZSB0b2tlbiB0byBzdG9yYWdlXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSByZXNwLnRva2VuO1xuICAgICAgICAgICAgbGV0IHJlcG9ydElkID0gcmVzcC5yZXBvcnRfaWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRva2VuOlwiICsgdG9rZW4pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXBvcnRJZDpcIiArIHJlcG9ydElkKTtcbiAgICAgICAgICAgIGlmICh0b2tlbiAmJiByZXBvcnRJZCkge1xuICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbiwgdG9rZW4pO1xuICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV9yZXBvcnRJZCwgcmVwb3J0SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9mb3J3YXJkIHRvIGhvbWUgcmVwb3J0IHBhZ2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm9yd2FyZCB0byByZXBvcnQgaW5kZXggcGFnZVwiKTtcbiAgICAgICAgICAgIHd4LnJlZGlyZWN0VG8oe1xuICAgICAgICAgICAgICB1cmw6ICcuLi9yZXBvcnQvaW5kZXgnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB3eC5oaWRlTG9hZGluZyh7fSkpO1xuICAgICAgfVxuICAgIH0pXG4gIH07XG59XG5cblBhZ2UobmV3IEluZGV4UGFnZSgpKTsiXX0=