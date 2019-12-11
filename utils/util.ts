import * as moment from './moment';

export function formatTime(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const epoch = time => {
  let date = moment.unix(time);
  return date.format('LL');
};

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
}

const formatNumber = (n: number) => {
  const str = n.toString()
  return str[1] ? str : '0' + str
}


/**
 * fn {function} API service
 */

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

export default promisify