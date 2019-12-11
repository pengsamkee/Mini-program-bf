/**
* 该文件生成于protoapi
* 文件包含前端调用API的代码，供微信小程序使用
* 文件内代码使用TypeScript
*/
import {
    MiniProgramLoginReq,
    MiniProgramLoginResp,
    MiniProgramRegisterReq,
    MiniProgramRegisterResp,
    
} from './LoginServiceObjs';
import { generateUrl, errorHandling } from './helper';

const promisify = (wx) => {
  return (method) => {
    return (option) => {
      return new Promise ((resolve,reject) => {
        wx[method]({
          ...option,
          success:(res) => { resolve(res) },
          fail: (err) => {reject(err)}
        })
      })
    }
  }
}

const wxPromisify = promisify(wx)
const wxRequest = wxPromisify('request')

var globalEnum = require("../GlobalEnum");
var baseUrl = globalEnum.baseUrl;

export function SetBaseUrl(url: string) {
    baseUrl = url;
}

var authToken = "";

export function SetAuthToken(token: string) {
  authToken = token;
}

export function MiniProgramRegister(params: MiniProgramRegisterReq): Promise<MiniProgramRegisterResp | never> {
  let url: string = generateUrl(baseUrl, "LoginService", "MiniProgramRegister");

  return wxRequest({ url: url, data: params, method:'POST', header:{'Authorization': 'token ' + authToken}}).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MiniProgramRegisterResp)
      } catch (e) {
        return Promise.reject(res.data);
      }
    }
    return Promise.reject(res.data);
  }).catch(err => {
    // handle error response
    return errorHandling(err)
  });
}


export function MiniProgramLogin(params: MiniProgramLoginReq): Promise<MiniProgramLoginResp | never> {
  let url: string = generateUrl(baseUrl, "LoginService", "MiniProgramLogin");

  return wxRequest({ url: url, data: params, method:'POST', header:{'Authorization': 'token ' + authToken}}).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MiniProgramLoginResp)
      } catch (e) {
        return Promise.reject(res.data);
      }
    }
    return Promise.reject(res.data);
  }).catch(err => {
    // handle error response
    return errorHandling(err)
  });
}
