"use strict";
var webViewPage = (function () {
    function webViewPage() {
        this.data = {
            reportUrl: "https://report.lxj3w.com/"
        };
    }
    webViewPage.prototype.onLoad = function (options) {
        var webUrl = options.webUrl;
        if (!webUrl) {
            return;
        }
        var reportId = options.reportId;
        console.log(webUrl + "?report=" + reportId);
        this.setData({
            reportUrl: webUrl + "?report=" + reportId + "&t=" + new Date().getTime()
        });
    };
    return webViewPage;
}());
Page(new webViewPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7SUFBQTtRQUVTLFNBQUksR0FBRztZQUNaLFNBQVMsRUFBRSwyQkFBMkI7U0FFdkMsQ0FBQTtJQWVILENBQUM7SUFiUSw0QkFBTSxHQUFiLFVBQWMsT0FBVztRQUN2QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLEVBQUM7WUFDVixPQUFNO1NBQ1A7UUFDRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxNQUFNLEdBQUcsVUFBVSxHQUFHLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7U0FDekUsQ0FBQyxDQUFDO0lBRUwsQ0FBQztJQUVILGtCQUFDO0FBQUQsQ0FBQyxBQXBCRCxJQW9CQztBQUVELElBQUksQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIHdlYlZpZXdQYWdlIHtcblxuICBwdWJsaWMgZGF0YSA9IHtcbiAgICByZXBvcnRVcmw6IFwiaHR0cHM6Ly9yZXBvcnQubHhqM3cuY29tL1wiXG4gICAgLy8gcmVwb3J0VXJsOiBcImh0dHA6Ly8xOTIuMTY4LjAuMTg5OjMwMDEvdXNlcndlZWtseXJlcG9ydC8xM1wiXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnM6YW55KSB7XG4gICAgbGV0IHdlYlVybCA9IG9wdGlvbnMud2ViVXJsO1xuICAgIGlmICghd2ViVXJsKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgcmVwb3J0SWQgPSBvcHRpb25zLnJlcG9ydElkO1xuICAgIGNvbnNvbGUubG9nKHdlYlVybCArIFwiP3JlcG9ydD1cIiArIHJlcG9ydElkKTtcbiAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgcmVwb3J0VXJsOiB3ZWJVcmwgKyBcIj9yZXBvcnQ9XCIgKyByZXBvcnRJZCArIFwiJnQ9XCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIH0pO1xuICAgIFxuICB9XG5cbn1cblxuUGFnZShuZXcgd2ViVmlld1BhZ2UoKSk7Il19