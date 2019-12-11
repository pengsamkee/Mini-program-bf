
const mockyRequestURL = "https://www.mocky.io/v2/5c761b1b3200007f17f45ea2"

export interface MockUpReq{
  param: number;
}

export class MockyObj {
  kind:"MockyObj";
  constructor(public id:string, public name:string,public created_time:string) {
    this.kind = "MockyObj"
  };
  // var kind = "MockyObj";
  // kind: "MockyObj";
  // id: string;
  // name: string;
  // created_time: string;
}

export interface MockyIOErr {
  kind:"MockyIOErr";
  msg: string;
}

async function call_async<InType, OutType, MockyIOErr>(url: string, input: InType): Promise<OutType | MockyIOErr> {
  return new Promise<OutType | MockyIOErr>((resolve, reject) => {wx.request({
      url: url,
      method: "GET",
      data: input,
      header: {
        'content-type': 'application/json'
      },
      success(res: wx.RequestSuccessCallbackResult): void {
        console.log("statusCode:"+res.statusCode +",resData:"+ res.data)
        if (res.statusCode == 200) {
          (res.data as MockyObj).kind = "MockyObj"
          resolve(res.data as OutType);
        } else if (res.statusCode == 400) {
          resolve(res.data as MockyIOErr);
        } else {
          reject(res.data);
        }
      }
    })
  });
}

export async function GetMockObjAsync(params: MockUpReq) {
  return call_async<MockUpReq, MockyObj, MockyIOErr>(mockyRequestURL, params)
}



