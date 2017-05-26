let http = require('http')
let chalk = require('chalk')
let fs = require('fs')
let iconv = require('iconv-lite')
let cheerio = require('cheerio')

let url = 'http://www.ygdy8.net/html/gndy/dyzz/list_23_'
var index = 1
var count = 0
var titles = []
var btLinks = []

function getTitles (url, i) {
  console.log('正在获取第' + i + '页的内容')
  http.get(url + i + '.html', function (res) {
    var chunks = []
    res.on('data', function (chunk) {
      chunks.push(chunk)
    })
    res.on('end', function () {
      var html = iconv.decode(Buffer.concat(chunks), 'gb2312')
      var $ = cheerio.load(html, {decodeEntities: false})
      $('.co_content8 .ulink').each(function (idx, element) {
        titles.push({
          title: $(element).text(),
          url: $(element).attr('href')
        })
      })
      if (i < 2) {
        getTitles(url, ++index)
      } else {
        console.log('获取完毕！')
        getBtLinks(titles, count)
      }
    })
  })
}

function getBtLinks (urls, n) {
  console.log('正在获取第' + n + '个url的内容')
  http.get('http://www.ygdy8.net' + urls[n].url, function (res) {
    var chunks = []
    res.on('data', function (chunk) {
      chunks.push(chunk)
    })

    res.on('end', function () {
      var html = iconv.decode(Buffer.concat(chunks), 'gb2312')
      var $ = cheerio.load(html, {decodeEntities: false})
      $('#Zoom td').children('a').each(function (idex, element) {
        btLinks.push({
          bt: $(element).attr('href')
        })
      })
      if (n < urls.length - 1) {
        getBtLinks(urls, ++count)
      } else {
        console.log('btlink获取完毕！')
        console.log(btLinks)
        save()
      }
    })
  })
}

function save () {
  let folder = `json`
  fs.mkdirSync(folder)
  let filePath = `./${folder}/bt.json`
  fs.writeFileSync(filePath, JSON.stringify(btLinks))
}

function start () {
  console.log('开始爬取')
  getTitles(url, index)
}

start()