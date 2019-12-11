"use strict";
var introductionPage = (function () {
    function introductionPage() {
        this.data = {};
    }
    introductionPage.prototype.intro_profile_tutorial = function () {
        wx.navigateTo({
            url: 'profileIntro/index'
        });
    };
    introductionPage.prototype.intro_logging_tutorial = function () {
        wx.navigateTo({
            url: 'loggingIntro/index'
        });
    };
    introductionPage.prototype.intro_report_tutorial = function () {
        wx.navigateTo({
            url: 'reportIntro/index'
        });
    };
    return introductionPage;
}());
Page(new introductionPage());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7SUFBQTtRQUNTLFNBQUksR0FBRyxFQUViLENBQUE7SUFtQkgsQ0FBQztJQWpCUSxpREFBc0IsR0FBN0I7UUFDRSxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osR0FBRyxFQUFFLG9CQUFvQjtTQUMxQixDQUFDLENBQUE7SUFDSixDQUFDO0lBRU0saURBQXNCLEdBQTdCO1FBQ0UsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSxvQkFBb0I7U0FDMUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLGdEQUFxQixHQUE1QjtRQUNFLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDWixHQUFHLEVBQUUsbUJBQW1CO1NBQ3pCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDSCx1QkFBQztBQUFELENBQUMsQUF0QkQsSUFzQkM7QUFHRCxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBpbnRyb2R1Y3Rpb25QYWdle1xuICBwdWJsaWMgZGF0YSA9IHtcblxuICB9XG5cbiAgcHVibGljIGludHJvX3Byb2ZpbGVfdHV0b3JpYWwoKTogdm9pZCB7XG4gICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICB1cmw6ICdwcm9maWxlSW50cm8vaW5kZXgnXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBpbnRyb19sb2dnaW5nX3R1dG9yaWFsKCk6IHZvaWQge1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAnbG9nZ2luZ0ludHJvL2luZGV4J1xuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgaW50cm9fcmVwb3J0X3R1dG9yaWFsKCk6IHZvaWQge1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiAncmVwb3J0SW50cm8vaW5kZXgnXG4gICAgfSlcbiAgfVxufVxuXG5cblBhZ2UobmV3IGludHJvZHVjdGlvblBhZ2UoKSk7Il19