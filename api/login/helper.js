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
var httpCode;
(function (httpCode) {
    httpCode[httpCode["DEFAULT"] = 0] = "DEFAULT";
    httpCode[httpCode["NORMAL"] = 200] = "NORMAL";
    httpCode[httpCode["BIZ_ERROR"] = 400] = "BIZ_ERROR";
    httpCode[httpCode["COMMON_ERROR"] = 420] = "COMMON_ERROR";
    httpCode[httpCode["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(httpCode = exports.httpCode || (exports.httpCode = {}));
function mapCommonErrorType(commonErr) {
    for (var key in commonErr) {
        if (commonErr.hasOwnProperty(key) && commonErr[key]) {
            var err = __assign({}, commonErr[key], { kind: key });
            switch (key) {
                case 'genericError':
                    return err;
                case 'authError':
                    return err;
                case 'validateError':
                    return err;
                case 'bindError':
                    return err;
                default:
                    return null;
            }
        }
    }
    return null;
}
exports.mapCommonErrorType = mapCommonErrorType;
function errorHandling(err) {
    if (!err || err.response === undefined) {
        throw err;
    }
    var data;
    try {
        data = JSON.parse(err.response.data);
    }
    catch (e) {
        data = err.response.data;
    }
    switch (err.response.status) {
        case httpCode.BIZ_ERROR:
            return Promise.reject(__assign({}, err, { message: data.message }));
        case httpCode.COMMON_ERROR:
            var returnErr = mapCommonErrorType(data);
            if (!returnErr) {
                throw err;
            }
            return Promise.reject(__assign({}, err.response, returnErr));
        default:
            return Promise.reject(err);
    }
}
exports.errorHandling = errorHandling;
function encode(val) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
}
exports.encode = encode;
function generateQueryUrl(url, params) {
    if (!params) {
        return url;
    }
    var parts = [];
    var _loop_1 = function (key) {
        var val = void 0;
        if (Object.prototype.hasOwnProperty(key)) {
            val = params[key];
        }
        if (val === null || typeof val === 'undefined') {
            return { value: '' };
        }
        var k, vals = void 0;
        if (val.toString() === '[object Array]') {
            k = key + '[]';
        }
        else {
            k = key;
            vals = [val];
        }
        vals.forEach(function (v) {
            if (v.toString() === '[object File]') {
                v = v.toISOString();
            }
            else if (typeof v === 'object') {
                v = JSON.stringify(v);
            }
            parts.push(encode(k) + '=' + encode(v));
        });
    };
    for (var key in params) {
        var state_1 = _loop_1(key);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    var serializedParams = parts.join('&');
    if (serializedParams) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
}
exports.generateQueryUrl = generateQueryUrl;
function generateUrl(url, serviceName, functionName) {
    return url + "/" + serviceName + "." + functionName;
}
exports.generateUrl = generateUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFjQSxJQUFZLFFBTVg7QUFORCxXQUFZLFFBQVE7SUFDaEIsNkNBQVcsQ0FBQTtJQUNYLDZDQUFZLENBQUE7SUFDWixtREFBZSxDQUFBO0lBQ2YseURBQWtCLENBQUE7SUFDbEIsNkRBQW9CLENBQUE7QUFDeEIsQ0FBQyxFQU5XLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBTW5CO0FBS0QsU0FBZ0Isa0JBQWtCLENBQUMsU0FBc0I7SUFDckQsS0FBSyxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUU7UUFDdkIsSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRCxJQUFJLEdBQUcsZ0JBQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFFLElBQUksRUFBRSxHQUFHLEdBQUMsQ0FBQTtZQUN4QyxRQUFRLEdBQUcsRUFBRTtnQkFDVCxLQUFLLGNBQWM7b0JBQ2YsT0FBTyxHQUFtQixDQUFBO2dCQUM5QixLQUFLLFdBQVc7b0JBQ1osT0FBTyxHQUFnQixDQUFBO2dCQUMzQixLQUFLLGVBQWU7b0JBQ2hCLE9BQU8sR0FBb0IsQ0FBQTtnQkFDL0IsS0FBSyxXQUFXO29CQUNaLE9BQU8sR0FBZ0IsQ0FBQTtnQkFDM0I7b0JBQ0ksT0FBTyxJQUFJLENBQUE7YUFDbEI7U0FFSjtLQUNKO0lBQ0QsT0FBTyxJQUFJLENBQUE7QUFDZixDQUFDO0FBcEJELGdEQW9CQztBQUtELFNBQWdCLGFBQWEsQ0FBQyxHQUFHO0lBQzdCLElBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDbkMsTUFBTSxHQUFHLENBQUM7S0FDYjtJQUNELElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSTtRQUNBLElBQUksR0FBRyxJQUFJ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RCxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFdkMsSUFBSSxnQkFBZ0IsRUFBRTtRQUNsQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO0tBQ25FO0lBQ0QsT0FBTyxHQUFHLENBQUE7QUFDZCxDQUFDO0FBNUNELDRDQTRDQztBQWFELFNBQWdCLFdBQVcsQ0FBSSxHQUFXLEVBQUUsV0FBbUIsRUFBRSxZQUFvQjtJQUNqRixPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FBRyxZQUFZLENBQUM7QUFDeEQsQ0FBQztBQUZELGtDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgJ3Byb3RvYXBpJ1xuKiBUaGUgZmlsZSBjb250YWlucyBoZWxwZXIgZnVuY3Rpb25zIHRoYXQgd291bGQgYmUgdXNlZCBpbiBnZW5lcmF0ZWQgYXBpIGZpbGUsIHVzdWFsbHkgaW4gJy4vYXBpLnRzJyBvciAnLi94eHhTZXJ2aWNlLnRzJ1xuKiBUaGUgZ2VuZXJhdGVkIGNvZGUgaXMgd3JpdHRlbiBpbiBUeXBlU2NyaXB0XG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog6K+l5paH5Lu255Sf5oiQ5LqOcHJvdG9hcGlcbiog5paH5Lu25YyF5ZCr5LiA5Lqb5Ye95pWw5Y2P5Yqp55Sf5oiQ55qE5YmN56uv6LCD55SoQVBJXG4qIOaWh+S7tuWGheS7o+eggeS9v+eUqFR5cGVTY3JpcHRcbiovXG5pbXBvcnQgeyBDb21tb25FcnJvciwgR2VuZXJpY0Vycm9yLCBBdXRoRXJyb3IsIFZhbGlkYXRlRXJyb3IsIEJpbmRFcnJvciB9IGZyb20gJy4vTG9naW5TZXJ2aWNlT2JqcydcbmV4cG9ydCB0eXBlIENvbW1vbkVycm9yVHlwZSA9IEdlbmVyaWNFcnJvciB8IEF1dGhFcnJvciB8IEJpbmRFcnJvciB8IFZhbGlkYXRlRXJyb3Jcbi8qKlxuICogRGVmaW5lZCBIdHRwIENvZGUgZm9yIHJlc3BvbnNlIGhhbmRsaW5nXG4gKi9cbmV4cG9ydCBlbnVtIGh0dHBDb2RlIHtcbiAgICBERUZBVUxUID0gMCxcbiAgICBOT1JNQUwgPSAyMDAsXG4gICAgQklaX0VSUk9SID0gNDAwLFxuICAgIENPTU1PTl9FUlJPUiA9IDQyMCxcbiAgICBJTlRFUk5BTF9FUlJPUiA9IDUwMCxcbn1cbi8qKlxuICpcbiAqIEBwYXJhbSB7Q29tbW9uRXJyb3J9IGNvbW1vbkVyciB0aGUgZXJyb3Igb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBDb21tb25FcnJvclR5cGUoY29tbW9uRXJyOiBDb21tb25FcnJvcik6IENvbW1vbkVycm9yVHlwZSB8IG51bGwge1xuICAgIGZvciAobGV0IGtleSBpbiBjb21tb25FcnIpIHtcbiAgICAgICAgaWYgKGNvbW1vbkVyci5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGNvbW1vbkVycltrZXldKSB7XG4gICAgICAgICAgICBsZXQgZXJyID0gey4uLmNvbW1vbkVycltrZXldLCBraW5kOiBrZXl9XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2dlbmVyaWNFcnJvcic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnIgYXMgR2VuZXJpY0Vycm9yXG4gICAgICAgICAgICAgICAgY2FzZSAnYXV0aEVycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVyciBhcyBBdXRoRXJyb3JcbiAgICAgICAgICAgICAgICBjYXNlICd2YWxpZGF0ZUVycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVyciBhcyBWYWxpZGF0ZUVycm9yXG4gICAgICAgICAgICAgICAgY2FzZSAnYmluZEVycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVyciBhcyBCaW5kRXJyb3JcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgfVxuICBcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxufVxuLyoqXG4gKlxuICogQHBhcmFtIHtyZXNwb25zZX0gcmVzcG9uc2UgdGhlIGVycm9yIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckhhbmRsaW5nKGVycik6IFByb21pc2U8bmV2ZXI+IHtcbiAgICBpZighZXJyIHx8IGVyci5yZXNwb25zZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgbGV0IGRhdGE7XG4gICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZXJyLnJlc3BvbnNlLmRhdGEpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGF0YSA9IGVyci5yZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgICBzd2l0Y2ggKGVyci5yZXNwb25zZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBodHRwQ29kZS5CSVpfRVJST1I6XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoey4uLmVyciwgbWVzc2FnZTogZGF0YS5tZXNzYWdlfSk7XG5cbiAgICAgICAgY2FzZSBodHRwQ29kZS5DT01NT05fRVJST1I6XG4gICAgICAgICAgICBsZXQgcmV0dXJuRXJyID0gbWFwQ29tbW9uRXJyb3JUeXBlKGRhdGEpO1xuICAgICAgICAgICAgaWYoIXJldHVybkVycil7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoey4uLmVyci5yZXNwb25zZSwgLi4ucmV0dXJuRXJyfSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuXG4gICAgfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gdmFsIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBhbiBlbmNvZGVkIHN0cmluZyB0aGF0IGNhbiBiZSBhcHBlbmQgdG8gYXBpIHVybFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHZhbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgICAgIHJlcGxhY2UoLyU0MC9naSwgJ0AnKS5cbiAgICAgICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgICAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICAgICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgICAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICAgICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgICAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKiBAcGFyYW0gdXJsIDogdGhlIGJhc2UgdXJsIGZvciB0aGUgc2VydmljZVxuICogQHBhcmFtIHBhcmFtcyA6IHRoZSByZXF1ZXN0IG9iamVjdC4gZS5nLiBmb3IgSGVsbG9SZXF1ZXN0IHdvdWxkIGJlIHRoZSBvYmplY3Qgb2YgdHlwZSBIZWxsb1JlcXVlc3RcbiAqIEByZXR1cm5zOiByZXR1cm5zIGEgZnVsbCBVcmwgc3RyaW5nIC0gZm9yIEdFVCBieSBrZXkvdmFsdWUgcGFpcnNcbiAqIEBleGFtcGxlOlxuICogYmFzZVVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDo4MDgwXCJcbiAqIGFyZyA9IHtuYW1lOiBcIndlbmd3ZWlcIiwgbmljazogXCJ3ZW50aWFuXCJ9XG4gKiByZXR1cm5zID0+IGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MD9uYW1lPVwid2VuZ3dlaVwiJm5pY2s9XCJ3ZW50aWFuXCJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUXVlcnlVcmw8VD4odXJsOiBzdHJpbmcsIHBhcmFtczogVCk6IHN0cmluZyB7XG4gICAgaWYgKCFwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBsZXQgcGFydHM6IHN0cmluZ1tdID0gW107XG5cblxuICAgIGZvciAobGV0IGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgbGV0IHZhbDtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgdmFsID0gcGFyYW1zW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaywgdmFscztcbiAgICAgICAgLy8gaWYgaXMgYXJyYXlcbiAgICAgICAgaWYgKHZhbC50b1N0cmluZygpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICBrID0ga2V5ICsgJ1tdJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGsgPSBrZXlcbiAgICAgICAgICAgIHZhbHMgPSBbdmFsXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHMuZm9yRWFjaCh2ID0+IHtcbiAgICAgICAgICAgIC8vIGlmIGlzIGRhdGVcbiAgICAgICAgICAgIGlmICh2LnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IEZpbGVdJykge1xuICAgICAgICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXMgb2JqZWN0XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGspICsgJz0nICsgZW5jb2RlKHYpKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG5cbiAgICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgICAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiB1cmxcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHVybCB0aGUgYmFzZSB1cmwgZm9yIHRoZSBzZXJ2aWNlXG4gKiBAcGFyYW0gc2VydmljZU5hbWUgdGhlIHNlcnZpY2UgbmFtZVxuICogQHBhcmFtIGZ1bmN0aW9uTmFtZSB0aGUgZnVuY3Rpb24gbmFtZVxuICogQGV4YW1wbGVcbiAqIGJhc2VVcmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MFwiXG4gKiBzZXJ2aWNlTmFtZSA9IFwiSGVsbG9TZXJ2aWNlXCJcbiAqIGZ1bmN0aW9uTmFtZSA9IFwiU2F5SGVsbG9cIlxuICogcmV0dXJucyA9PiBodHRwOi8vbG9jYWxob3N0OjgwODAvSGVsbG9TZXJ2aWNlLlNheUhlbGxvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVybDxUPih1cmw6IHN0cmluZywgc2VydmljZU5hbWU6IHN0cmluZywgZnVuY3Rpb25OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB1cmwgKyBcIi9cIiArIHNlcnZpY2VOYW1lICsgXCIuXCIgKyBmdW5jdGlvbk5hbWU7XG59XG4iXX0=