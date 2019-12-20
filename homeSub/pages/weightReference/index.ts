
import request from '../../../api/app/interface';

class WeightReference {

  public data = {
    mock:[
        {
            name:'a',
            id:1,
            data:[
                { text:'荤菜100克' },
                { text:'荤菜200克' },
                { text:'荤菜300克' }
            ]
        },
        {
            name:'b',
            id:2,
            data:[
                { text:'荤菜1100克' },
                { text:'荤菜2100克' },
                { text:'荤菜3100克' }
            ]
        },
        {
            name:'ac',
            id:3,
            data:[
                { text:'荤菜11100克' },
                { text:'荤菜21100克' },
                { text:'荤菜31100克' }
            ]
        },
    ],
    choosedIndex:0,
  }

  public onLoad(options:any) {
    console.log(999)
  }
  public handleChooseCategory(e:any){
    const choosedIndex = e.currentTarget.dataset.index;
    (this as any).setData({choosedIndex:choosedIndex})
  }
  
}

Page(new WeightReference())
