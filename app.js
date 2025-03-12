App({
  globalData: {
    userInfo: null,
    gameScore: 0
  },
  onLaunch() {
    // 小程序启动时执行
    console.log('App Launch')
  },
  onShow() {
    // 小程序显示时执行
    console.log('App Show')
  },
  onHide() {
    // 小程序隐藏时执行
    console.log('App Hide')
  }
}) 