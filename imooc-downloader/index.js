let fs = require('fs')
let path = require('path')
let mkdirp = require('mkdirp')
let config = require('./config')
let fetch = require('./lib/fetch')
let htmlParser = require('./lib/html')


const medisinfoURL = 'http://www.imooc.com/course/ajaxmediainfo/?mid='

function imoocDownloader (opts) {
  opts = opts || {}
  this.course = {}
  this.start = true
  this.courseList = {}
  this.targets = opts.targets || {}
  this.videoDir = opts.videoDir
  let definition
  switch (opts.definition) {
    case 'low' : definition = 0
      break
    case 'mid' : definition = 1
      break
    default : definition = 2
  }
  this.definition = definition
}

imoocDownloader.prototype.getCourses = function (keyword, callback) {
  console.log('get courses')
  let target = `${config.url.search_course_path + keyword}`
  fetch(target, (err, html) => {
    if (err) {
      console.error(err)
    } else {
      let dom = new htmlParser(html)
      let data = {}
      data['keyword'] = keyword
      data['title'] = dom.getTitle()
      data['items'] = dom.getCourseList()
      this.courseList = data
      callback(null, data)
    }
  })
}

imoocDownloader.prototype.getLessons = function () {
  console.log('get lessons')
}

imoocDownloader.prototype.loopList = function (name, options, callback) {
  let c = options.control ? 'c=' + options.control : ''
  let type = options.type ? 'type=' + options.type : ''
  let sort = options.sort ? 'sort=' + options.sort : ''
  let page = options.page ? 'page=' + options.page : ''
  let params = '?' + c + '&' + type + '&' + sort + '&' + page
  if (params.indexOf('?&&&') !== -1) {
    params = ''
  } else if (params.indexOf('&&&') !== -1) {
    params = params.split('&&&')[0]
  } else if (params.indexOf('&&') !== -1) {
    params = params.split('&&')[0]
  }
  fetch(config.url[`${name}_list_path`] + params, (err, html) => {
    if (err) {
      console.error(err)
    } else {
      let dom = new htmlParser(html)
      let data = {}
      data['top'] = dom.courseControl()
      callback(null, data)
    }
  })
}

imoocDownloader.prototype.loopCourse = function () {
  console.log('loop course')
}

imoocDownloader.prototype.loopChapter = function () {
  console.log('loop chapter')
}

imoocDownloader.prototype.download = function () {
  console.log('download')
}

imoocDownloader.prototype.getVideoURL = function () {
  console.log('get video url')
}

imoocDownloader.prototype.setTarget = function () {
  console.log('set target')
}

exports = module.exports = imoocDownloader
