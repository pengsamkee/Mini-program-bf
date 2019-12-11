import promisify from "../utils/util"

const wxPromisify = promisify(wx)

export const setStorage = wxPromisify('setStorage')
export const chooseImage = wxPromisify('chooseImage')