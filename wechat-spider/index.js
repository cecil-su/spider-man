let ut = require('./common')
let async = require('async')
console.log('开始测试')

let public_num = "支付宝"

let task = []
// 根据public_num搜索公众号，最好是微信号或者微信全名
task.push(function (callback) {
  ut.search_wechat(public_num, callback)
})

// 根据url获取公众号获取最后10条图文列表
task.push(function (url, callback) {
  ut.look_wechat_by_url(url, callback)
})

async.waterfall(task, function (err, result) {
  if (err) return console.log(err)
  console.log(result)
})