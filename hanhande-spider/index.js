let fs = require('fs')
let cheerio = require('cheerio')
let async = require('async')
let request = require('superagent')
require('superagent-charset')(request)

const config = {
  startPage: 1,
  endPage: 1,
  downloadImg: false,
  downloadConcurrent: 10,
  currentImgType: 'scy'
}

const allImgType = {
  ecy: 'http://tu.hanhande.com/ecy/ecy_',
  scy: 'http://tu.hanhande.com/scy/scy_',
  cos: 'http://tu.hanhande.com/cos/cos_'
}

let concurrencyCount = 0

var items = []

let fetchUrl = function (url, callback) {
  let delay = parseInt((Math.random() * 10000000) % 2000, 10)
  concurrencyCount++
  console.log('现在的并发数是', concurrencyCount, ',正在抓取的是', url, ',耗时' + delay + '毫秒')
  setTimeout(function () {
    concurrencyCount--
    callback(null, url)
  }, delay)
}

let urls = []
let imageTypeUrl = allImgType[config.currentImgType]
for (let i = config.startPage; i <= config.endPage; i++) {
  urls.push(imageTypeUrl + `${i}.shtml`)
}

function getAlbums (url) {
  return request.get(url).charset('gbk').end(function (err, res) {
    if (err) {
      console.error(err)
    }
    var $ = cheerio.load(res.text)
    $('.picList em a').each(function (idx, element) {
      items.push({
        title: element.children[1].attribs.alt,
        url: element.attribs.href,
        imgList: []
      })
    })
  })
}

async.mapLimit(urls, 5, function (url, callback) {
  fetchUrl(url, callback)
}, function (err, result) {
  console.log('final:' + result)
})
