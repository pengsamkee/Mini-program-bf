"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./helper");
var promisify = function (wx) {
    return function (method) {
        return function (option) {
            return new Promise(function (resolve, reject) {
                wx[method](__assign({}, option, { success: function (res) { resolve(res); }, fail: function (err) { reject(err); } }));
            });
        };
    };
};
var wxPromisify = promisify(wx);
var wxRequest = wxPromisify('request');
var globalEnum = require("../GlobalEnum");
var baseUrl = globalEnum.baseUrl;
function SetBaseUrl(url) {
    baseUrl = url;
}
exports.SetBaseUrl = SetBaseUrl;
var authToken = "";
function SetAuthToken(token) {
    authToken = token;
}
exports.SetAuthToken = SetAuthToken;
function MiniProgramRegister(params) {
    var url = helper_1.generateUrl(baseUrl, "LoginService", "MiniProgramRegister");
    return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(function (res) {
        if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
            try {
                return Promise.resolve(res.data);
            }
            catch (e) {
                return Promise.reject(res.data);
            }
        }
        return Promise.reject(res.data);
    }).catch(function (err) {
        return helper_1.errorHandling(err);
    });
}
exports.MiniProgramRegister = MiniProgramRegister;
function MiniProgramLogin(params) {
    var url = helper_1.generateUrl(baseUrl, "LoginService", "MiniProgramLogin");
    return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(function (res) {
        if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
            try {
                return Promise.resolve(res.data);
            }
            catch (e) {
                return Promise.reject(res.data);
            }
        }
        return Promise.reject(res.data);
    }).catch(function (err) {
        return helper_1.errorHandling(err);
    });
}
exports.MiniProgramLogin = MiniProgramLogin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9naW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTG9naW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFZQSxtQ0FBc0Q7QUFFdEQsSUFBTSxTQUFTLEdBQUcsVUFBQyxFQUFFO0lBQ25CLE9BQU8sVUFBQyxNQUFNO1FBQ1osT0FBTyxVQUFDLE1BQU07WUFDWixPQUFPLElBQUksT0FBTyxDQUFFLFVBQUMsT0FBTyxFQUFDLE1BQU07Z0JBQ2pDLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FDTCxNQUFNLElBQ1QsT0FBTyxFQUFDLFVBQUMsR0FBRyxJQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsRUFDakMsSUFBSSxFQUFFLFVBQUMsR0FBRyxJQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFBLENBQUMsSUFDNUIsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUV4QyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUVqQyxTQUFnQixVQUFVLENBQUMsR0FBVztJQUNsQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLENBQUM7QUFGRCxnQ0FFQztBQUVELElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUVuQixTQUFnQixZQUFZLENBQUMsS0FBYTtJQUN4QyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLENBQUM7QUFGRCxvQ0FFQztBQUVELFNBQWdCLG1CQUFtQixDQUFDLE1BQThCO0lBQ2hFLElBQUksR0FBRyxHQUFXLG9CQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBRTlFLE9BQU8sU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUMsZUFBZSxFQUFFLFFBQVEsR0FBRyxTQUFTLEVBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRztRQUNqSCxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDakYsSUFBSTtnQkFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQStCLENBQUMsQ0FBQTthQUM1RDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakM7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsR0FBRztRQUVWLE9BQU8sc0JBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFoQkQsa0RBZ0JDO0FBR0QsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBMkI7SUFDMUQsSUFBSSxHQUFHLEdBQVcsb0JBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFFM0UsT0FBTyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsRUFBQyxlQUFlLEVBQUUsUUFBUSxHQUFHLFNBQVMsRUFBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHO1FBQ2pILElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsRUFBRTtZQUNqRixJQUFJO2dCQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBNEIsQ0FBQyxDQUFBO2FBQ3pEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqQztTQUNGO1FBQ0QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHO1FBRVYsT0FBTyxzQkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWhCRCw0Q0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiog6K+l5paH5Lu255Sf5oiQ5LqOcHJvdG9hcGlcbiog5paH5Lu25YyF5ZCr5YmN56uv6LCD55SoQVBJ55qE5Luj56CB77yM5L6b5b6u5L+h5bCP56iL5bqP5L2/55SoXG4qIOaWh+S7tuWGheS7o+eggeS9v+eUqFR5cGVTY3JpcHRcbiovXG5pbXBvcnQge1xuICAgIE1pbmlQcm9ncmFtTG9naW5SZXEsXG4gICAgTWluaVByb2dyYW1Mb2dpblJlc3AsXG4gICAgTWluaVByb2dyYW1SZWdpc3RlclJlcSxcbiAgICBNaW5pUHJvZ3JhbVJlZ2lzdGVyUmVzcCxcbiAgICBcbn0gZnJvbSAnLi9Mb2dpblNlcnZpY2VPYmpzJztcbmltcG9ydCB7IGdlbmVyYXRlVXJsLCBlcnJvckhhbmRsaW5nIH0gZnJvbSAnLi9oZWxwZXInO1xuXG5jb25zdCBwcm9taXNpZnkgPSAod3gpID0+IHtcbiAgcmV0dXJuIChtZXRob2QpID0+IHtcbiAgICByZXR1cm4gKG9wdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgICAgd3hbbWV0aG9kXSh7XG4gICAgICAgICAgLi4ub3B0aW9uLFxuICAgICAgICAgIHN1Y2Nlc3M6KHJlcykgPT4geyByZXNvbHZlKHJlcykgfSxcbiAgICAgICAgICBmYWlsOiAoZXJyKSA9PiB7cmVqZWN0KGVycil9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCB3eFByb21pc2lmeSA9IHByb21pc2lmeSh3eClcbmNvbnN0IHd4UmVxdWVzdCA9IHd4UHJvbWlzaWZ5KCdyZXF1ZXN0JylcblxudmFyIGdsb2JhbEVudW0gPSByZXF1aXJlKFwiLi4vR2xvYmFsRW51bVwiKTtcbnZhciBiYXNlVXJsID0gZ2xvYmFsRW51bS5iYXNlVXJsO1xuXG5leHBvcnQgZnVuY3Rpb24gU2V0QmFzZVVybCh1cmw6IHN0cmluZykge1xuICAgIGJhc2VVcmwgPSB1cmw7XG59XG5cbnZhciBhdXRoVG9rZW4gPSBcIlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU2V0QXV0aFRva2VuKHRva2VuOiBzdHJpbmcpIHtcbiAgYXV0aFRva2VuID0gdG9rZW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNaW5pUHJvZ3JhbVJlZ2lzdGVyKHBhcmFtczogTWluaVByb2dyYW1SZWdpc3RlclJlcSk6IFByb21pc2U8TWluaVByb2dyYW1SZWdpc3RlclJlc3AgfCBuZXZlcj4ge1xuICBsZXQgdXJsOiBzdHJpbmcgPSBnZW5lcmF0ZVVybChiYXNlVXJsLCBcIkxvZ2luU2VydmljZVwiLCBcIk1pbmlQcm9ncmFtUmVnaXN0ZXJcIik7XG5cbiAgcmV0dXJuIHd4UmVxdWVzdCh7IHVybDogdXJsLCBkYXRhOiBwYXJhbXMsIG1ldGhvZDonUE9TVCcsIGhlYWRlcjp7J0F1dGhvcml6YXRpb24nOiAndG9rZW4gJyArIGF1dGhUb2tlbn19KS50aGVuKHJlcyA9PiB7XG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgcmVzLnN0YXR1c0NvZGUgPj0gMjAwICYmIHJlcy5zdGF0dXNDb2RlIDwgMzAwKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcy5kYXRhIGFzIE1pbmlQcm9ncmFtUmVnaXN0ZXJSZXNwKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVzLmRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVzLmRhdGEpO1xuICB9KS5jYXRjaChlcnIgPT4ge1xuICAgIC8vIGhhbmRsZSBlcnJvciByZXNwb25zZVxuICAgIHJldHVybiBlcnJvckhhbmRsaW5nKGVycilcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIE1pbmlQcm9ncmFtTG9naW4ocGFyYW1zOiBNaW5pUHJvZ3JhbUxvZ2luUmVxKTogUHJvbWlzZTxNaW5pUHJvZ3JhbUxvZ2luUmVzcCB8IG5ldmVyPiB7XG4gIGxldCB1cmw6IHN0cmluZyA9IGdlbmVyYXRlVXJsKGJhc2VVcmwsIFwiTG9naW5TZXJ2aWNlXCIsIFwiTWluaVByb2dyYW1Mb2dpblwiKTtcblxuICByZXR1cm4gd3hSZXF1ZXN0KHsgdXJsOiB1cmwsIGRhdGE6IHBhcmFtcywgbWV0aG9kOidQT1NUJywgaGVhZGVyOnsnQXV0aG9yaXphdGlvbic6ICd0b2tlbiAnICsgYXV0aFRva2VufX0pLnRoZW4ocmVzID0+IHtcbiAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSAnb2JqZWN0JyAmJiByZXMuc3RhdHVzQ29kZSA+PSAyMDAgJiYgcmVzLnN0YXR1c0NvZGUgPCAzMDApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzLmRhdGEgYXMgTWluaVByb2dyYW1Mb2dpblJlc3ApXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZXMuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZXMuZGF0YSk7XG4gIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgLy8gaGFuZGxlIGVycm9yIHJlc3BvbnNlXG4gICAgcmV0dXJuIGVycm9ySGFuZGxpbmcoZXJyKVxuICB9KTtcbn1cbiJdfQ==