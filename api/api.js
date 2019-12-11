"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mockyRequestURL = "https://www.mocky.io/v2/5c761b1b3200007f17f45ea2";
var MockyObj = (function () {
    function MockyObj(id, name, created_time) {
        this.id = id;
        this.name = name;
        this.created_time = created_time;
        this.kind = "MockyObj";
    }
    ;
    return MockyObj;
}());
exports.MockyObj = MockyObj;
function call_async(url, input) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) {
                    wx.request({
                        url: url,
                        method: "GET",
                        data: input,
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            console.log("statusCode:" + res.statusCode + ",resData:" + res.data);
                            if (res.statusCode == 200) {
                                res.data.kind = "MockyObj";
                                resolve(res.data);
                            }
                            else if (res.statusCode == 400) {
                                resolve(res.data);
                            }
                            else {
                                reject(res.data);
                            }
                        }
                    });
                })];
        });
    });
}
function GetMockObjAsync(params) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, call_async(mockyRequestURL, params)];
        });
    });
}
exports.GetMockObjAsync = GetMockObjAsync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFNLGVBQWUsR0FBRyxrREFBa0QsQ0FBQTtBQU0xRTtJQUVFLGtCQUFtQixFQUFTLEVBQVMsSUFBVyxFQUFRLFlBQW1CO1FBQXhELE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87UUFDekUsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUE7SUFDeEIsQ0FBQztJQUFBLENBQUM7SUFNSixlQUFDO0FBQUQsQ0FBQyxBQVZELElBVUM7QUFWWSw0QkFBUTtBQWlCckIsU0FBZSxVQUFVLENBQThCLEdBQVcsRUFBRSxLQUFhOzs7WUFDL0UsV0FBTyxJQUFJLE9BQU8sQ0FBdUIsVUFBQyxPQUFPLEVBQUUsTUFBTTtvQkFBTSxFQUFFLENBQUMsT0FBTyxDQUFDO3dCQUN0RSxHQUFHLEVBQUUsR0FBRzt3QkFDUixNQUFNLEVBQUUsS0FBSzt3QkFDYixJQUFJLEVBQUUsS0FBSzt3QkFDWCxNQUFNLEVBQUU7NEJBQ04sY0FBYyxFQUFFLGtCQUFrQjt5QkFDbkM7d0JBQ0QsT0FBTyxFQUFQLFVBQVEsR0FBb0M7NEJBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUUsV0FBVyxHQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTs0QkFDaEUsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsRUFBRTtnQ0FDeEIsR0FBRyxDQUFDLElBQWlCLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQTtnQ0FDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFlLENBQUMsQ0FBQzs2QkFDOUI7aUNBQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsRUFBRTtnQ0FDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFrQixDQUFDLENBQUM7NkJBQ2pDO2lDQUFNO2dDQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7NkJBQ2xCO3dCQUNILENBQUM7cUJBQ0YsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxFQUFDOzs7Q0FDSjtBQUVELFNBQXNCLGVBQWUsQ0FBQyxNQUFpQjs7O1lBQ3JELFdBQU8sVUFBVSxDQUFrQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEVBQUE7OztDQUM1RTtBQUZELDBDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiXG5jb25zdCBtb2NreVJlcXVlc3RVUkwgPSBcImh0dHBzOi8vd3d3Lm1vY2t5LmlvL3YyLzVjNzYxYjFiMzIwMDAwN2YxN2Y0NWVhMlwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9ja1VwUmVxe1xuICBwYXJhbTogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgTW9ja3lPYmoge1xuICBraW5kOlwiTW9ja3lPYmpcIjtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIG5hbWU6c3RyaW5nLHB1YmxpYyBjcmVhdGVkX3RpbWU6c3RyaW5nKSB7XG4gICAgdGhpcy5raW5kID0gXCJNb2NreU9ialwiXG4gIH07XG4gIC8vIHZhciBraW5kID0gXCJNb2NreU9ialwiO1xuICAvLyBraW5kOiBcIk1vY2t5T2JqXCI7XG4gIC8vIGlkOiBzdHJpbmc7XG4gIC8vIG5hbWU6IHN0cmluZztcbiAgLy8gY3JlYXRlZF90aW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9ja3lJT0VyciB7XG4gIGtpbmQ6XCJNb2NreUlPRXJyXCI7XG4gIG1zZzogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjYWxsX2FzeW5jPEluVHlwZSwgT3V0VHlwZSwgTW9ja3lJT0Vycj4odXJsOiBzdHJpbmcsIGlucHV0OiBJblR5cGUpOiBQcm9taXNlPE91dFR5cGUgfCBNb2NreUlPRXJyPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxPdXRUeXBlIHwgTW9ja3lJT0Vycj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge3d4LnJlcXVlc3Qoe1xuICAgICAgdXJsOiB1cmwsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICBkYXRhOiBpbnB1dCxcbiAgICAgIGhlYWRlcjoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9LFxuICAgICAgc3VjY2VzcyhyZXM6IHd4LlJlcXVlc3RTdWNjZXNzQ2FsbGJhY2tSZXN1bHQpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGF0dXNDb2RlOlwiK3Jlcy5zdGF0dXNDb2RlICtcIixyZXNEYXRhOlwiKyByZXMuZGF0YSlcbiAgICAgICAgaWYgKHJlcy5zdGF0dXNDb2RlID09IDIwMCkge1xuICAgICAgICAgIChyZXMuZGF0YSBhcyBNb2NreU9iaikua2luZCA9IFwiTW9ja3lPYmpcIlxuICAgICAgICAgIHJlc29sdmUocmVzLmRhdGEgYXMgT3V0VHlwZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzLnN0YXR1c0NvZGUgPT0gNDAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXMuZGF0YSBhcyBNb2NreUlPRXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QocmVzLmRhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHZXRNb2NrT2JqQXN5bmMocGFyYW1zOiBNb2NrVXBSZXEpIHtcbiAgcmV0dXJuIGNhbGxfYXN5bmM8TW9ja1VwUmVxLCBNb2NreU9iaiwgTW9ja3lJT0Vycj4obW9ja3lSZXF1ZXN0VVJMLCBwYXJhbXMpXG59XG5cblxuXG4iXX0=