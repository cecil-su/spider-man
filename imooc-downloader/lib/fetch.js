let request = require('request')

function Fetch (url, options, callback) {
  if (!url) {
    console.error('缺少参数url')
  }
  if (Object.prototype.toString.call(url) !== '[object String]') {
    console.error('参数url必须为String')
  }

  if (Object.prototype.toString.call(options) === '[object Function]') {
    callback = options
    options = {}
  }

  request(url, function (err, res, html) {
    console.log(`正在抓取页面${url}`)
    console.time('抓取耗时')
    if (err) {
      callback && callback(err, null)
    } else {
      callback && callback(null, html)
    }
    console.timeEnd('抓取耗时')
  })
}

exports = module.exports =  Fetch