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
var moment = require("./moment");
function formatTime(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
exports.formatTime = formatTime;
exports.epoch = function (time) {
    var date = moment.unix(time);
    return date.format('LL');
};
function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return [year, month, day].map(formatNumber).join('-');
}
exports.formatDate = formatDate;
var formatNumber = function (n) {
    var str = n.toString();
    return str[1] ? str : '0' + str;
};
var promisify = function (wx) {
    return function (method) {
        return function (option) {
            return new Promise(function (resolve, reject) {
                wx[method](__assign({}, option, { success: function (res) { resolve(res); }, fail: function (err) { reject(err); } }));
            });
        };
    };
};
exports.default = promisify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFtQztBQUVuQyxTQUFnQixVQUFVLENBQUMsSUFBVTtJQUNuQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDL0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNqQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQzVCLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUNoQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7SUFFaEMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDbEgsQ0FBQztBQVRELGdDQVNDO0FBRVksUUFBQSxLQUFLLEdBQUcsVUFBQSxJQUFJO0lBQ3ZCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQztBQUVGLFNBQWdCLFVBQVUsQ0FBQyxJQUFVO0lBQ25DLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNoQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFMRCxnQ0FLQztBQUVELElBQU0sWUFBWSxHQUFHLFVBQUMsQ0FBUztJQUM3QixJQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDeEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNqQyxDQUFDLENBQUE7QUFPRCxJQUFNLFNBQVMsR0FBRyxVQUFDLEVBQUU7SUFDbkIsT0FBTyxVQUFDLE1BQU07UUFDWixPQUFPLFVBQUMsTUFBTTtZQUNaLE9BQU8sSUFBSSxPQUFPLENBQUUsVUFBQyxPQUFPLEVBQUMsTUFBTTtnQkFDakMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUNMLE1BQU0sSUFDVCxPQUFPLEVBQUMsVUFBQyxHQUFHLElBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUNqQyxJQUFJLEVBQUUsVUFBQyxHQUFHLElBQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUEsQ0FBQyxJQUM1QixDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUE7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxrQkFBZSxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnLi9tb21lbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VGltZShkYXRlOiBEYXRlKTogc3RyaW5nIHtcbiAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKVxuICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDFcbiAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXRlKClcbiAgY29uc3QgaG91ciA9IGRhdGUuZ2V0SG91cnMoKVxuICBjb25zdCBtaW51dGUgPSBkYXRlLmdldE1pbnV0ZXMoKVxuICBjb25zdCBzZWNvbmQgPSBkYXRlLmdldFNlY29uZHMoKVxuXG4gIHJldHVybiBbeWVhciwgbW9udGgsIGRheV0ubWFwKGZvcm1hdE51bWJlcikuam9pbignLycpICsgJyAnICsgW2hvdXIsIG1pbnV0ZSwgc2Vjb25kXS5tYXAoZm9ybWF0TnVtYmVyKS5qb2luKCc6Jylcbn1cblxuZXhwb3J0IGNvbnN0IGVwb2NoID0gdGltZSA9PiB7XG4gIGxldCBkYXRlID0gbW9tZW50LnVuaXgodGltZSk7XG4gIHJldHVybiBkYXRlLmZvcm1hdCgnTEwnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XG4gIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICByZXR1cm4gW3llYXIsIG1vbnRoLCBkYXldLm1hcChmb3JtYXROdW1iZXIpLmpvaW4oJy0nKTtcbn1cblxuY29uc3QgZm9ybWF0TnVtYmVyID0gKG46IG51bWJlcikgPT4ge1xuICBjb25zdCBzdHIgPSBuLnRvU3RyaW5nKClcbiAgcmV0dXJuIHN0clsxXSA/IHN0ciA6ICcwJyArIHN0clxufVxuXG5cbi8qKlxuICogZm4ge2Z1bmN0aW9ufSBBUEkgc2VydmljZVxuICovXG5cbmNvbnN0IHByb21pc2lmeSA9ICh3eCkgPT4ge1xuICByZXR1cm4gKG1ldGhvZCkgPT4ge1xuICAgIHJldHVybiAob3B0aW9uKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgICB3eFttZXRob2RdKHtcbiAgICAgICAgICAuLi5vcHRpb24sXG4gICAgICAgICAgc3VjY2VzczoocmVzKSA9PiB7IHJlc29sdmUocmVzKSB9LFxuICAgICAgICAgIGZhaWw6IChlcnIpID0+IHtyZWplY3QoZXJyKX1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByb21pc2lmeSJdfQ==