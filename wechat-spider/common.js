let request = require('request')
let async = require('async')
let cheerio = require('cheerio')

let ut = {}

ut.search_wechat = function (public_num, callback) {
  const encode_public_num = encodeURIComponent(public_num)
  const url = `http://weixin.sogou.com/weixin?type=1&query=${encode_public_num}&ie=utf8&_sug_=y&_sug_type_=1`
  request(url, function (err, response, html) {
    if (err) return callback(err, null)
    if (html.indexOf('<title>302 Found</title>') != -1) return callback(null, '302') 
    if (html.indexOf('您的访问过于频繁') != -1) return callback('-访问过于频繁')
    const $ = cheerio.load(html)
    let wechat_num = $($('#sogou_vr_11002301_box_0 a')[0]).attr('href') || ''
    setTimeout(function () {
      callback(null, wechat_num.replace(/amp;/g, ''))
    }, 1000 + Math.ceil(Math.random() * 500))
  })
}

ut.look_wechat_by_url = function (url, callback) {
  const task3 = []
  // 发布时间数组
  let article_pub_times = []
  // 标题列表数组
  let article_titles = []
  // 文章临时url列表数组
  let article_urls = []
  request(url, function (err, response, html) {
    if (err) return callback(err, null, null)
    var task4 = []
    if (html.indexOf('为了保护你的网络安全，请输入验证码') != -1) {
      // 验证验证码
      task4.push(function (callback) {
        ut.solve_verifycode(html, url, function (err, result) {
          if (err) return callback(err, null)
          callback(null, result)
        })
      })
    } else {
      task4.push(function (callback) {
        callback(null, html)
      })
    }
    task4.push(function (html, callback) {
      // 文章数组，页面上是没有的，通过正则截取出来
      var msglist = html.match(/var msgList = ({.+}}]});?/)
      if (!msglist) return callback(`-没有搜索${publicNum}的文章，只支持订阅号，服务好不支持！`)
      msglist = msglist[1]
      msglist = msglist.replace(/(&quot;)/g, '\\"').replace(/(&nbsp;)/g, '')
      msglist = JSON.parse(msglist)
      if (msglist.list.length == 0) return callback(`-没有搜索${publicNum}的文章，只支持订阅号，服务好不支持！`)

      msglist.list.forEach(function (msg, index) {
        // 基本信息，主要是发布时间
        let article_info = msg.comm_msg_info
        // 发布时间
        let article_pub_time = ut.fmtDate(new Date(article_info.datetime * 1000)).split("")[0]
        // 第一篇文章
        var article_first = msg.app_msg_ext_info
        article_titles.push(article_first.title)
        article_urls.push('http://mp.weixin.qq.com' + article_first.content_url.replace(/(amp;)|(\\)/g, ''))
        if (article_first.multi_app_msg_item_list.length > 0) {
          var article_others = article_first.multi_app_msg_list
          article_others.forEach(function (article_other, index) {
            article_pub_times.push(article_pub_time)
            article_titles.push(article_other.title)
            article_urls.push('http://mp.weixin.qq.com' + article_other.content_url.replace(/(amp;)|(\\)/g, ''))
          })
        }
      })
      callback(null)
    })
    async.waterfall(task4, function (err, result) {
      if (err) return callback(err)
      setTimeout(function () {
        callback(null, article_titles, article_urls, article_pub_times)
      }, 1000 + Math.ceil(Math.random() * 500))
    })
  })
}

ut.solve_verifycode = function () {}

ut.fmtDate = function (date) {
  // 将数字格式化为两位长度的字符串
  const fmtTwo = function (number) {
    return (number < 10 ? '0' : '') + number
  }
  let yyyy = date.getFullYear()
  let MM = fmtTwo(date.getMonth() + 1)
  let dd = fmtTwo(date.getDate())
  let HH = fmtTwo(date.getHours())
  let mm = fmtTwo(date.getMinutes())
  let ss = fmtTwo(date.getSeconds())
  return '' + yyyy + '-' + MM + '-' + dd + ' ' + HH + ':' + mm + ':' + ss
}

module.exports = ut