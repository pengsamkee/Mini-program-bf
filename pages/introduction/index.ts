class introductionPage{
  public data = {

  }

  public intro_profile_tutorial(): void {
    wx.navigateTo({
      url: 'profileIntro/index'
    })
  }

  public intro_logging_tutorial(): void {
    wx.navigateTo({
      url: 'loggingIntro/index'
    })
  }

  public intro_report_tutorial(): void {
    wx.navigateTo({
      url: 'reportIntro/index'
    })
  }
}


Page(new introductionPage());