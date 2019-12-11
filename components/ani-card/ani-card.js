// components/AniCards.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    count: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    lock: false,
    position: {
      x: 0,
    },
    foodlist: [{description: "it's a pancake",portion: "piece(s)"},{description: "it's a banana",portion: "whole"}]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad(){
      
    },

    onTapAnimation(e){ //excahnge the position of the card by class
      if (this.data.lock) return;
      const index = e.currentTarget.dataset.index
      const currentPosition = this.data.position  
      this.data.lock = true
      this.triggerEvent('swipeout',{
        direction: 'right',
        item: this.data.list.slice(-1)[0],
        list: this.data.list
      });
      this.translate(currentPosition, {x:100, y:0, z:0}, 200, () =>{
        this.data.lock = false
      });
    },

    translate(fromPosition, toPosition, duration, callback) {
      const startTime = Date.now();
      const run = () => {
        setTimeout(() => {
          const nowTime = Date.now();
          let percent = (nowTime - startTime) / duration;
          if (percent > 1) {
            percent = 1;
          }
          const deltaX = (toPosition.x - fromPosition.x) * percent;
          const nextPosition = (fromPosition.x + deltaX);
          this.setData({
            position: {
              x: nextPosition,
            }
          })
          if (percent < 1) {
            run()
          } else {
            callback && callback()
          }
        }, 1000 / 60);
      }
      run()
    }
  }
})
