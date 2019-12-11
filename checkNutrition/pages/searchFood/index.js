"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webAPI = require("../../../api/app/AppService");
var globalEnum = require("../../../api/GlobalEnum");
var textCache = require("./textCache/TextCache");
var app = getApp();
var SearchFood = (function () {
    function SearchFood() {
        this.data = {
            keyword: "",
            resultList: [],
            resultError: [],
            recentList: [],
        };
    }
    SearchFood.prototype.onLoad = function () {
        webAPI.SetAuthToken(wx.getStorageSync(globalEnum.globalKey_token));
    };
    SearchFood.prototype.onShow = function () {
        if (this.data.resultList.length === 0) {
            this.getRecentList();
        }
    };
    SearchFood.prototype.getRecentList = function () {
        var recentList = textCache.getAllValue();
        console.log(recentList);
        this.setData({
            recentList: recentList
        });
    };
    SearchFood.prototype.performSearch = function () {
        var keyword = this.data.keyword;
        var req = { query: keyword };
        var that = this;
        webAPI.RetrieveTextSearch(req).then(function (resp) {
            that.setResultList(resp);
        }).catch(function (err) { return console.log(err); });
    };
    SearchFood.prototype.setResultList = function (resp) {
        var results = [];
        if (resp.result_list.length == 0) {
            this.setData({
                resultList: [],
                resultError: true
            });
        }
        else {
            for (var index in resp.result_list) {
                var item = resp.result_list[index];
                var result = {
                    foodId: item.food_id,
                    foodName: item.food_name,
                    foodType: item.food_type,
                    amount: item.amount,
                    unit: item.unit_name,
                    energy: Math.floor(item.energy / 100)
                };
                results.push(result);
            }
            console.log('results=====', results);
            this.setData({
                resultList: results,
                resultError: false
            });
        }
    };
    SearchFood.prototype.inputTyping = function (event) {
        this.setData({
            resultError: false,
            keyword: event.detail.value,
        });
    };
    SearchFood.prototype.clearInput = function () {
        this.setData({
            keyword: "",
            resultError: false
        });
    };
    SearchFood.prototype.onTapFoodItem = function (event) {
        var index = event.currentTarget.dataset.textIndex;
        textCache.setValue(this.data.resultList[index]);
    };
    SearchFood.prototype.onRecentResultSelect = function (event) {
        var index = event.currentTarget.dataset.textIndex;
        textCache.setValue(this.data.recentList[index]);
    };
    SearchFood.prototype.deleteTextSearchCache = function () {
        textCache.clearAll();
        this.getRecentList();
    };
    return SearchFood;
}());
Page(new SearchFood());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG9EQUFzRDtBQUV0RCxvREFBc0Q7QUFDdEQsaURBQW1EO0FBQ25ELElBQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFBO0FBRTVCO0lBQUE7UUFDUyxTQUFJLEdBQUc7WUFDWixPQUFPLEVBQUUsRUFBRTtZQUNYLFVBQVUsRUFBQyxFQUFFO1lBQ2IsV0FBVyxFQUFDLEVBQUU7WUFDZCxVQUFVLEVBQUMsRUFBRTtTQUNkLENBQUE7SUFrR0gsQ0FBQztJQWhHUSwyQkFBTSxHQUFiO1FBQ0UsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFTSwyQkFBTSxHQUFiO1FBQ0UsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFDO1lBQ25DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN2QjtJQUNILENBQUM7SUFFTSxrQ0FBYSxHQUFwQjtRQUNFLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZCLElBQVksQ0FBQyxPQUFPLENBQUM7WUFDcEIsVUFBVSxFQUFFLFVBQVU7U0FDdkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUtNLGtDQUFhLEdBQXBCO1FBQ0UsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDN0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO1lBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFJTSxrQ0FBYSxHQUFwQixVQUFxQixJQUE0QjtRQUMvQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDL0IsSUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDcEIsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsV0FBVyxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFBO1NBQ0g7YUFBTTtZQUNMLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxNQUFNLEdBQUc7b0JBQ1gsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNwQixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3hCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO29CQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3BCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2lCQUN0QyxDQUFBO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDdEI7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxJQUFZLENBQUMsT0FBTyxDQUFDO2dCQUNwQixVQUFVLEVBQUUsT0FBTztnQkFDbkIsV0FBVyxFQUFFLEtBQUs7YUFDbkIsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBSU0sZ0NBQVcsR0FBbEIsVUFBbUIsS0FBVTtRQUMxQixJQUFZLENBQUMsT0FBTyxDQUFDO1lBQ3BCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUs7U0FDNUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUlNLCtCQUFVLEdBQWpCO1FBQ0csSUFBWSxDQUFDLE9BQU8sQ0FBQztZQUNwQixPQUFPLEVBQUUsRUFBRTtZQUNYLFdBQVcsRUFBRSxLQUFLO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLTSxrQ0FBYSxHQUFwQixVQUFxQixLQUFTO1FBQzVCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNsRCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLHlDQUFvQixHQUEzQixVQUE0QixLQUFTO1FBQ25DLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNsRCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLDBDQUFxQixHQUE1QjtRQUNFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVILGlCQUFDO0FBQUQsQ0FBQyxBQXhHRCxJQXdHQztBQUVELElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tICcuLi8uLi8uLi9hcHAnXG5pbXBvcnQgKiBhcyB3ZWJBUEkgZnJvbSAnLi4vLi4vLi4vYXBpL2FwcC9BcHBTZXJ2aWNlJztcbmltcG9ydCB7IFJldHJpZXZlVGV4dFNlYXJjaFJlc3AgfSBmcm9tIFwiL2FwaS9hcHAvQXBwU2VydmljZU9ianNcIjtcbmltcG9ydCAqIGFzIGdsb2JhbEVudW0gZnJvbSAnLi4vLi4vLi4vYXBpL0dsb2JhbEVudW0nO1xuaW1wb3J0ICogYXMgdGV4dENhY2hlIGZyb20gJy4vdGV4dENhY2hlL1RleHRDYWNoZSc7XG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpXG5cbmNsYXNzIFNlYXJjaEZvb2Qge1xuICBwdWJsaWMgZGF0YSA9IHtcbiAgICBrZXl3b3JkOiBcIlwiLFxuICAgIHJlc3VsdExpc3Q6W10sXG4gICAgcmVzdWx0RXJyb3I6W10sXG4gICAgcmVjZW50TGlzdDpbXSxcbiAgfVxuXG4gIHB1YmxpYyBvbkxvYWQoKSB7XG4gICAgd2ViQVBJLlNldEF1dGhUb2tlbih3eC5nZXRTdG9yYWdlU3luYyhnbG9iYWxFbnVtLmdsb2JhbEtleV90b2tlbikpO1xuICB9XG5cbiAgcHVibGljIG9uU2hvdygpIHtcbiAgICBpZiAodGhpcy5kYXRhLnJlc3VsdExpc3QubGVuZ3RoID09PSAwKXtcbiAgICAgICB0aGlzLmdldFJlY2VudExpc3QoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVjZW50TGlzdCgpe1xuICAgIGxldCByZWNlbnRMaXN0ID0gdGV4dENhY2hlLmdldEFsbFZhbHVlKCk7XG4gICAgY29uc29sZS5sb2cocmVjZW50TGlzdCk7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIHJlY2VudExpc3Q6IHJlY2VudExpc3RcbiAgICB9KTtcbiAgfVxuXG4vKipcbiAqIOeUqOaIt+eCueWHu+aQnOe0olxuICovXG4gIHB1YmxpYyBwZXJmb3JtU2VhcmNoKCkge1xuICAgIGxldCBrZXl3b3JkID0gdGhpcy5kYXRhLmtleXdvcmQ7XG4gICAgbGV0IHJlcSA9IHsgcXVlcnk6IGtleXdvcmQgfTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgd2ViQVBJLlJldHJpZXZlVGV4dFNlYXJjaChyZXEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICB0aGF0LnNldFJlc3VsdExpc3QocmVzcCk7XG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xuICB9XG4vKipcbiAqIOino+aekOaOpeWPo+eahOaVsOaNrlxuICovXG4gIHB1YmxpYyBzZXRSZXN1bHRMaXN0KHJlc3A6IFJldHJpZXZlVGV4dFNlYXJjaFJlc3ApIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChyZXNwLnJlc3VsdF9saXN0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICByZXN1bHRMaXN0OiBbXSxcbiAgICAgICAgcmVzdWx0RXJyb3I6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGluZGV4IGluIHJlc3AucmVzdWx0X2xpc3QpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSByZXNwLnJlc3VsdF9saXN0W2luZGV4XTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICBmb29kSWQ6IGl0ZW0uZm9vZF9pZCxcbiAgICAgICAgICBmb29kTmFtZTogaXRlbS5mb29kX25hbWUsXG4gICAgICAgICAgZm9vZFR5cGU6IGl0ZW0uZm9vZF90eXBlLFxuICAgICAgICAgIGFtb3VudDogaXRlbS5hbW91bnQsXG4gICAgICAgICAgdW5pdDogaXRlbS51bml0X25hbWUsXG4gICAgICAgICAgZW5lcmd5OiBNYXRoLmZsb29yKGl0ZW0uZW5lcmd5IC8gMTAwKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdHM9PT09PScscmVzdWx0cyk7XG4gICAgICAodGhpcyBhcyBhbnkpLnNldERhdGEoe1xuICAgICAgICByZXN1bHRMaXN0OiByZXN1bHRzLFxuICAgICAgICByZXN1bHRFcnJvcjogZmFsc2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICog6I635Y+W55So5oi36L6T5YWl55qE5paH5a2XXG4gICAqL1xuICBwdWJsaWMgaW5wdXRUeXBpbmcoZXZlbnQ6IGFueSkge1xuICAgICh0aGlzIGFzIGFueSkuc2V0RGF0YSh7XG4gICAgICByZXN1bHRFcnJvcjogZmFsc2UsXG4gICAgICBrZXl3b3JkOiBldmVudC5kZXRhaWwudmFsdWUsXG4gICAgfSk7XG4gIH1cbi8qKlxuICog54K55Ye75riF6Zmk5oyJ6ZKu77yM5riF6Zmk5pWw5o2uXG4gKi9cbiAgcHVibGljIGNsZWFySW5wdXQoKSB7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtcbiAgICAgIGtleXdvcmQ6IFwiXCIsXG4gICAgICByZXN1bHRFcnJvcjogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDnlKjmiLfngrnlh7vliJfooajkuK3nmoTmn5DkuKrkuovnianvvIzpobXpnaLlgZrot7PovaxcbiAgICovXG4gIHB1YmxpYyBvblRhcEZvb2RJdGVtKGV2ZW50OmFueSl7XG4gICAgbGV0IGluZGV4ID0gZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRleHRJbmRleDtcbiAgICB0ZXh0Q2FjaGUuc2V0VmFsdWUodGhpcy5kYXRhLnJlc3VsdExpc3RbaW5kZXhdKTtcbiAgfVxuXG4gIHB1YmxpYyBvblJlY2VudFJlc3VsdFNlbGVjdChldmVudDphbnkpe1xuICAgIGxldCBpbmRleCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50ZXh0SW5kZXg7XG4gICAgdGV4dENhY2hlLnNldFZhbHVlKHRoaXMuZGF0YS5yZWNlbnRMaXN0W2luZGV4XSk7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlVGV4dFNlYXJjaENhY2hlKCkge1xuICAgIHRleHRDYWNoZS5jbGVhckFsbCgpO1xuICAgIHRoaXMuZ2V0UmVjZW50TGlzdCgpO1xuICB9XG5cbn1cblxuUGFnZShuZXcgU2VhcmNoRm9vZCgpKVxuIl19