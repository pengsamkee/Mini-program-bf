
  const capacity = 15;
  var list = [];

  export function getAllValue() {
    list = [];
    for (let index = 0; index < capacity; index++) {
      let key = "LRU_" + index;
      let jsonString = wx.getStorageSync(key);
      console.log(jsonString);
      //convert jsonSting to an object"LRU_"
      if (jsonString && jsonString !== ""){
        let foodObj = JSON.parse(jsonString);
        list.push(foodObj);
      }
    }
    return list;
  }

  //save all value to cache
  export function saveAllValue() {
    for (let index = 0; index < list.length; index++) {
      let key = "LRU_" + index;
      let foodObj = list[index];
      let jsonString = JSON.stringify(foodObj);
      wx.setStorageSync(key, jsonString);
    }
  }

  //judege the unique item by foodId
  export function setValue(valObj){
    let foodId = valObj.foodId;
    for (let index = 0; index < list.length; index++){
      //remove the obj with same key
      if (foodId === list[index].foodId){
        list.splice(index,1);
      }
    }
    //cache full length case,remove last
    if (list.length === capacity){
      list.pop();
    }
    list.unshift(valObj);
    saveAllValue();
  }

  export function clearAll(){
    for (let index = 0; index < capacity; index++) {
      let key = "LRU_" + index;
      wx.setStorageSync(key, "");
    }
  }