"use strict";
var envVersion = __wxConfig.envVersion;
var baseUrl, cosSignUrl, reportPageUrl;
if (envVersion && (envVersion === 'develop' || envVersion === 'trial')) {
    baseUrl = 'https://test-japi.pinshen.com.cn',
        cosSignUrl = "https://sts.pinshen.com.cn/sts",
        reportPageUrl = 'https://test-jreport.pinshen.com.cn/userdailywebreport';
}
else {
    baseUrl = 'https://japi.pinshen.com.cn',
        cosSignUrl = "https://sts.pinshen.com.cn/sts",
        reportPageUrl = 'https://jreport.pinshen.com.cn/userdailywebreport';
}
module.exports = {
    globalKey_reportId: 'reportId',
    globalKey_token: 'token',
    globalKey_jscode: 'jscode',
    globalkey_hideBanner: 'hideBanner',
    baseUrl: baseUrl,
    cosSignUrl: cosSignUrl,
    reportPageUrl: reportPageUrl
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsRW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdsb2JhbEVudW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLElBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDekMsSUFBSSxPQUFPLEVBQUMsVUFBVSxFQUFDLGFBQWEsQ0FBQztBQUNyQyxJQUFHLFVBQVUsSUFBSSxDQUFDLFVBQVUsS0FBRyxTQUFTLElBQUksVUFBVSxLQUFHLE9BQU8sQ0FBQyxFQUFDO0lBRWhFLE9BQU8sR0FBRyxrQ0FBa0M7UUFDNUMsVUFBVSxHQUFHLGdDQUFnQztRQUM3QyxhQUFhLEdBQUcsd0RBQXdELENBQUE7Q0FDekU7S0FBSTtJQUVILE9BQU8sR0FBRyw2QkFBNkI7UUFFdkMsVUFBVSxHQUFHLGdDQUFnQztRQUM3QyxhQUFhLEdBQUcsbURBQW1ELENBQUE7Q0FDcEU7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2Ysa0JBQWtCLEVBQUUsVUFBVTtJQUM5QixlQUFlLEVBQUUsT0FBTztJQUN4QixnQkFBZ0IsRUFBRSxRQUFRO0lBQzFCLG9CQUFvQixFQUFFLFlBQVk7SUFDbEMsT0FBTyxTQUFBO0lBQ1AsVUFBVSxZQUFBO0lBQ1YsYUFBYSxlQUFBO0NBQ2QsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgZW52VmVyc2lvbiA9IF9fd3hDb25maWcuZW52VmVyc2lvbjtcbmxldCBiYXNlVXJsLGNvc1NpZ25VcmwscmVwb3J0UGFnZVVybDtcbmlmKGVudlZlcnNpb24gJiYgKGVudlZlcnNpb249PT0nZGV2ZWxvcCcgfHwgZW52VmVyc2lvbj09PSd0cmlhbCcpKXsgXG4gIC8vIOaXqemkkOWQg+WlvUphdmHniYjmnKzkvZPpqozniYhhcGlcbiAgYmFzZVVybCA9ICdodHRwczovL3Rlc3QtamFwaS5waW5zaGVuLmNvbS5jbicsICBcbiAgY29zU2lnblVybCA9IFwiaHR0cHM6Ly9zdHMucGluc2hlbi5jb20uY24vc3RzXCIsXG4gIHJlcG9ydFBhZ2VVcmwgPSAnaHR0cHM6Ly90ZXN0LWpyZXBvcnQucGluc2hlbi5jb20uY24vdXNlcmRhaWx5d2VicmVwb3J0J1xufWVsc2V7IFxuICAvLyDml6nppJDlkIPlpb1KYXZh54mI5pys5q2j5byP54mIYXBpXG4gIGJhc2VVcmwgPSAnaHR0cHM6Ly9qYXBpLnBpbnNoZW4uY29tLmNuJywgIFxuICAvLyBjb3NTaWduVXJsID0gXCJodHRwczovL3N0cy1iZi5waW5zaGVuLmNvbS5jbi9zdHNcIiwgXG4gIGNvc1NpZ25VcmwgPSBcImh0dHBzOi8vc3RzLnBpbnNoZW4uY29tLmNuL3N0c1wiLFxuICByZXBvcnRQYWdlVXJsID0gJ2h0dHBzOi8vanJlcG9ydC5waW5zaGVuLmNvbS5jbi91c2VyZGFpbHl3ZWJyZXBvcnQnXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnbG9iYWxLZXlfcmVwb3J0SWQ6ICdyZXBvcnRJZCcsICAgLy8g5a+55aSW5pq06Zyy55qE5Y+Y6YeP5ZCN5Y+rbXlEYXRhUG9zdCzlr7nlupTnnYDlhoXpg6jnmoRkYXRhUG9zdOWvueixoSAgXG4gIGdsb2JhbEtleV90b2tlbjogJ3Rva2VuJyxcbiAgZ2xvYmFsS2V5X2pzY29kZTogJ2pzY29kZScsXG4gIGdsb2JhbGtleV9oaWRlQmFubmVyOiAnaGlkZUJhbm5lcicsXG4gIGJhc2VVcmwsXG4gIGNvc1NpZ25VcmwsXG4gIHJlcG9ydFBhZ2VVcmxcbn0gIFxuIl19