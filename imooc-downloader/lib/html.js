let cheerio = require('cheerio')
let config = require('../config')

function HtmlParser (html) {
  this.$ = cheerio.load(html)
  this._ = this.dom = this.$('html')
}

HtmlParser.prototype.getTitle = function () {
  return this.dom.find('title').text().trim()
}

HtmlParser.prototype.getCourseList = function () {
  let $ = this.$
  let _ = this._
  let list = []
  let items = _.find('.course-item')

  items.each((index, ele) => {
    let item = {}
    let match = $(ele).find('.course-item-right a').attr('href').match(/\/([^\/]+)\/(\d+)(.html)?$/)
    // console.log(match)
    if (match) {
      let id = match[2], type = match[1]
      item['type'] = type == 'class' ? 1 : 0
      item['id'] = id
      item['title'] = $(ele).find('.course-item-right a').text().trim()
      item['description'] = $(ele).find('.course-item-right .content').text().replace(/\s/g, '')
      item['url'] = `${type == 'class' ? config.url.class_path + id + '.html' : config.url.course_path + id}`
      item['image'] = $(ele).find('.course-item-left img').attr('src')
      list.push(item)
    }
  })

  return list
}

HtmlParser.prototype.getCourseDetail = function () {
}
// course list
HtmlParser.prototype.courseControl = function () {
  let $ = this.$
  let _ = this._
  let top = []
  let courseNav = _.find('.course-nav-row')
  courseNav.each((index, ele) => {
    let hd = $(ele).find('.hd').text().trim()
    top.push({
      text: hd,
      items: []
    })
    $(ele).find('.course-nav-item').each((i, item) => {
      let href = 'http://www.imooc.com' + $(item).find('a').attr('href')
      let c = href.split('?')[1] ? href.split('?')[1] : ''
      if (index === 1 && c.indexOf('&') !== -1) {
        c = c.split('&')[0]
      }
      if (index === 2 && c.indexOf('&') !== -1) {
        c = c.split('&')[1]
      }
      top[index].items.push({
        index: i,
        on: $(item).hasClass('on'),
        text: $(item).find('a').text(),
        url: href,
        c: c
      })
    })
  })
  return top
}

HtmlParser.prototype.courseList = function () {}

module.exports = HtmlParser