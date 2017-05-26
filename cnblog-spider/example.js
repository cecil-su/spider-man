var http = require('http')
var url = require('url')
var superagent = require('superagent')
var cheerio = require('cheerio')
var async = require('async')
var eventproxy = require('eventproxy')

var ep = new eventproxy()
var urls = []
var pages = []
var pageNum = 200

for (var i = 1; i <= 200; i++) {
  pages.push('http://www.cnblogs.com/#p' + i)
}

for (var i = 1; i <= pageNum; i++) {
  pages.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0')
}


function start () {
  function onRequest (req, res) {
    pages.forEach(function (page) {
      superagent.get(page)
      .end(function (err, res) {
        if (err) {
          console.log(err)
        }
        var $ = cheerio.load(res.text)
        var curPageUrls = $('.titlelnk')
        for (var i = 0; i < curPageUrls.length; i++) {
          var articleUrl = curPageUrls[i].attr('href')
          urls.push(articleUrl)
          ep.emit('blogHtml', articleUrl)
        }
      })
    })

    ep.after('blogHtml', pages.length * 20, function (articleUrls) {
      var curCount = 0
      var reptileMove = function (url, callback) {
        var delay = parseInt((Math.random() * 30000000) % 1000, 10)
        curCount++
        console.log('现在的并发数是', curCount, ',正在抓取的是', url, ',耗时' + delay + '毫秒')
        superagent.get(url)
        .end(function (err, res) {
          if (err) {
            console.log(err)
            return
          }
          var $ = cheerio.load(res.text)
          var currentBlogApp = url.split('/p/')[0].split('')[3]
          var requestId = url.split('/p/')[1].split('.')[0]
          var appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp=" + currentBlogApp
          personInfo(appUrl)
        })
        setTimeout(function () {
          curCount--
          callback(null, url + 'call back content')
        }, delay)
      }

      async.mapLimit(articleUrls, 5, function (url, callback) {
        reptileMove(url, callback)
      }, function (err, res) {})
    })
  }

  http.createServer(onRequest).listen(3000)
}

start()