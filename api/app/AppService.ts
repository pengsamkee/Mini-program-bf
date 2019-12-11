/**
* 该文件生成于protoapi
* 文件包含前端调用API的代码，供微信小程序使用
* 文件内代码使用TypeScript
*/
import {
  AddRecipeItemReq,
  ConfirmMealLogReq,
  CreateOrUpdateMealLogReq,
  CreateQuestionReq,
  CreateSurveyAnswerReq,
  CreateTargetWeightReq,
  CreateWeightLogReq,
  DestroyFoodLogReq,
  DestroyMealLogReq,
  DestroyRecipeItemReq,
  Empty,
  MealLogResp,
  RetrieveFoodDiaryReq,
  RetrieveFoodDiaryResp,
  RetrieveFoodPreferenceResp,
  RetrieveHomePageFeedReq,
  RetrieveHomePageFeedResp,
  RetrieveCardListResp,
  RetrieveHomePageInfoReq,
  RetrieveHomePageInfoResp,
  RetrieveMealLogReq,
  RetrieveMealLogShareURLReq,
  RetrieveMealLogShareURLResp,
  RetrieveMedicalProfileResp,
  RetrieveNutritionKnowledgeResp,
  RetrieveOrCreateUserReportReq,
  RetrieveOrCreateUserReportResp,
  RetrieveRecognitionReq,
  RetrieveRecognitionResp,
  RetrieveRecommendedDailyAllowanceResp,
  RetrieveSurveyReq,
  RetrieveSurveyResp,
  RetrieveTextSearchReq,
  RetrieveTextSearchResp,
  RetrieveUserProfileResp,
  RetrieveUserRDAResp,
  RetrieveUserReportsReq,
  RetrieveUserReportsResp,
  RetrieveWeightLogReq,
  RetrieveWeightLogResp,
  UpdateFoodLogReq,
  UpdateFoodPreferenceReq,
  UpdateMedicalProfileReq,
  UpdateRecipeItemReq,
  UpdateUserProfileReq,
  CreateUserEventReq

} from './AppServiceObjs';
import { generateUrl, errorHandling } from './helper';

const promisify = (wx) => {
  return (method) => {
    return (option) => {
      return new Promise((resolve, reject) => {
        wx[method]({
          ...option,
          success: (res) => { resolve(res) },
          fail: (err) => { reject(err) }
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

//var authToken = "bkleuepq8r0evtqn72hg";
var authToken = "token";

export function SetAuthToken(token: string) {
  authToken = token;
  //authToken = "bkleuepq8r0evtqn72hg";
}

export function RetrieveUserProfile(params: Empty): Promise<RetrieveUserProfileResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveUserProfile");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveUserProfileResp)
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


export function UpdateUserProfile(params: UpdateUserProfileReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "UpdateUserProfile");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveFoodPreference(params: Empty): Promise<RetrieveFoodPreferenceResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveFoodPreference");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveFoodPreferenceResp)
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


export function UpdateFoodPreference(params: UpdateFoodPreferenceReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "UpdateFoodPreference");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveMedicalProfile(params: Empty): Promise<RetrieveMedicalProfileResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveMedicalProfile");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveMedicalProfileResp)
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


export function UpdateMedicalProfile(params: UpdateMedicalProfileReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "UpdateMedicalProfile");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveRecommendedDailyAllowance(params: Empty): Promise<RetrieveRecommendedDailyAllowanceResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveRecommendedDailyAllowance");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveRecommendedDailyAllowanceResp)
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


export function RetrieveWeightLog(params: RetrieveWeightLogReq): Promise<RetrieveWeightLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveWeightLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveWeightLogResp)
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


export function CreateWeightLog(params: CreateWeightLogReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateWeightLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function CreateTargetWeight(params: CreateTargetWeightReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateTargetWeight");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveNutritionKnowledge(params: Empty): Promise<RetrieveNutritionKnowledgeResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveNutritionKnowledge");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveNutritionKnowledgeResp)
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


export function RetrieveUserRDA(params: Empty): Promise<RetrieveUserRDAResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveUserRDA");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveUserRDAResp)
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


export function RetrieveUserReports(params: RetrieveUserReportsReq): Promise<RetrieveUserReportsResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveUserReports");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveUserReportsResp)
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


export function RetrieveOrCreateUserReport(params: RetrieveOrCreateUserReportReq): Promise<RetrieveOrCreateUserReportResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveOrCreateUserReport");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveOrCreateUserReportResp)
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


export function RetrieveHomePageInfo(params: RetrieveHomePageInfoReq): Promise<RetrieveHomePageInfoResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveHomePageInfo");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveHomePageInfoResp)
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


export function RetrieveHomePageFeed(params: RetrieveHomePageFeedReq): Promise<RetrieveHomePageFeedResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveHomePageFeed");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveHomePageFeedResp)
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

export function RetrieveCardList(params: Empty): Promise<RetrieveCardListResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveCardList");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveCardListResp)
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


export function CreateQuestion(params: CreateQuestionReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateQuestion");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveSurvey(params: RetrieveSurveyReq): Promise<RetrieveSurveyResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveSurvey");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveSurveyResp)
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


export function CreateSurveyAnswer(params: CreateSurveyAnswerReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateSurveyAnswer");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveFoodDiary(params: RetrieveFoodDiaryReq): Promise<RetrieveFoodDiaryResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveFoodDiary");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveFoodDiaryResp)
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


export function CreateOrUpdateMealLog(params: CreateOrUpdateMealLogReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateOrUpdateMealLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function RetrieveMealLog(params: RetrieveMealLogReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveMealLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function ConfirmMealLog(params: ConfirmMealLogReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "ConfirmMealLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function DestroyMealLog(params: DestroyMealLogReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "DestroyMealLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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


export function RetrieveTextSearch(params: RetrieveTextSearchReq): Promise<RetrieveTextSearchResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveTextSearch");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveTextSearchResp)
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


export function RetrieveRecognition(params: RetrieveRecognitionReq): Promise<RetrieveRecognitionResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveRecognition");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveRecognitionResp)
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


export function UpdateFoodLog(params: UpdateFoodLogReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "UpdateFoodLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function DestroyFoodLog(params: DestroyFoodLogReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "DestroyFoodLog");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function AddRecipeItem(params: AddRecipeItemReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "AddRecipeItem");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function UpdateRecipeItem(params: UpdateRecipeItemReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "UpdateRecipeItem");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function DestroyRecipeItem(params: DestroyRecipeItemReq): Promise<MealLogResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "DestroyRecipeItem");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as MealLogResp)
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


export function RetrieveMealLogShareURL(params: RetrieveMealLogShareURLReq): Promise<RetrieveMealLogShareURLResp | never> {
  let url: string = generateUrl(baseUrl, "AppService", "RetrieveMealLogShareURL");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as RetrieveMealLogShareURLResp)
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


export function CreateUserEvent(params: CreateUserEventReq): Promise<Empty | never> {
  let url: string = generateUrl(baseUrl, "AppService", "CreateUserEvent");

  return wxRequest({ url: url, data: params, method: 'POST', header: { 'Authorization': 'token ' + authToken } }).then(res => {
    if (typeof res.data === 'object' && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        return Promise.resolve(res.data as Empty)
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