var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')
var colors = require('colors')
var Multiprogress = require('multi-progress')
multi = new Multiprogress(process.stderr)

website = 'http://www.imooc.com'

var readVideoList = function (url, callback) {
  console.log(colors.gray(`Read video list: ${url}`))
  request(url, function (err, res) {
    if (err) {
      return callback(err)
    }

    if (res && res.statusCode === 200) {
      var $ = cheerio.load(res.body)
      var videos = []
      $('.video li').each(function () {
        videos.push({
          id: $(this).attr('data-media-id'),
          name: $(this).find('a')[0].children[2].data.replace(/(\n)+|(\r\n)+/g, "").replace(/\s/g, ""),
          url: website + $(this).find('a').attr('href')
        })
      })
      return callback(null, videos)
    } else {
      return callback(res.statusCode)
    }
  })
}

var readVideoDetailAndDownload = function (video, callback) {
  console.log(video)
  var api, filename, url 
  api = website + '/course/ajaxmediainfo/?mode=false&mid='
  url = api + video.id
  filename = video.name.replace(/\(\d.+$/, '').trim() + '.mp4';
  console.log(colors.gray('Download course: ' + filename + ', url: ' + url))
  request.get(url, function (err, res) {
    if (err) {
      return callback(err)
    }
    if (res && res.statusCode === 200) {
      var body = JSON.parse(res.body)
      if (body.result === 0) {
        filename = filename.replace(/([\\\/\*\:\?\"\<\>\|])/g, '_')
        console.log(filename)
        request.get(body.data.result.mpath[0]).on('response', function (res) {
          var len, progressBar
          len = parseInt(res.headers['content-length'], 10)
          progressBar = multi.newBar('Downloading ' + filename + ' [:bar] :percent :etas', {
            width: 50,
            total: len
          })
          return res.on('data', function (chunk) {
            return progressBar.tick(chunk.length)
          })
        }).pipe(fs.createWriteStream(filename))
      } else {
        return callback(body.msg)
      }
    }
  })
}

var readCourseList = function (url, callback) {
  console.log(colors.gray(`Read course list: ${url}`))
  request(url, function (err, res) {
    if (err) {
      return callback(err)
    }
    if (res && res.statusCode === 200) {
      var $ = cheerio.load(res.body)
      var courses = []
      var courseItem = $('.course-item')
      courseItem.each(function () {
        return courses.push({
          title: $(this).find('.course-item-title .type').text().trim() + '-' + $(this).find('.course-item-title a').text().trim(),
          persons: $(this).find('.tag strong').text().trim(),
          description: $(this).find('.content').text().replace(/(\n)+|(\r\n)+/g, "").replace(/\s/g, ""),
          url: website + $(this).find('a').attr('href')
        })
      })

      var nextPage = $('.page').find('.active').next().attr('href')
      if (!nextPage) {
        return callback(null, courses)
      }
      nextPageURL = website + nextPage
      readCourseList(nextPageURL, function (err, courses2) {
        if (err) {
          return callback(err)
        }
        return callback(null, courses.concat(courses2))
      })
    }
  })
}

var searchCourse = function (words, callback) {
  var url 
  url = website + '/search/course?words=' + words + '&page=1'
  request(url, function (err, res) {
    if (err) {
      return callback(err)
    }
    if (res && res.statusCode === 200) {
      var $ = cheerio.load(res.body)
      var courseItem = $('.course-item')
      if (!courseItem.length) {
        return callback('There is no result on ' + words + '.')
      }
      readCourseList(url, callback)
    }
  })
}


var doWork = function (action, value, callback) {
  var url
  switch (action) {
    case '--search':
      if (!value) {
        return callback('Please input keywords')
      }
      return searchCourse(value, callback)
    case '--list':
      if (!value) {
        return callback('Please input course URL or ID')
      }
      url = isNaN(value) ? value : website + '/learn/' + value
      return  readVideoList(url, callback)
    case '--download':
      if (!value) {
        return callback('Please input course URL or ID')
      }
      url = isNaN(value) ? value : website + '/learn/' + value
      readVideoList(url, function (err, videos) {
        var j, len, video
        if (err) {
          return callback(err)
        }
        for (j = 0; j < videos.length; j++) {
          video = videos[j]
          readVideoDetailAndDownload(video, callback)
        }
      })
      break
    default:
      return callback('Unknow action')
  }
}

argv = process.argv.slice(2)

if (!argv[0]) {
  console.log('Usage: spider.js[Options]')
  console.log(' --search\t Seach for the specified keywords.')
  console.log(' --list\t List the video under the specified course ID or URL.')
  console.log(' --download\t Download the video list under the specified course ID or URL')
  return
}

for (arg in argv) {
  if (arg % 2 !== 0) {
    continue
  }
  action = argv[arg]
  value = argv[Number(arg) + 1]
  console.log('value:' + value)
  doWork(action, value, function(err, res) {
    var arr, i, j, key, len1, line, val;
    if (err) {
      return console.error(colors.red(err));
    }
    line = '';
    i = 0;
    while (i++ < 30) {
      line += '-';
    }
    for (j = 0, len1 = res.length; j < len1; j++) {
      arr = res[j];
      console.log(line);
      for (key in arr) {
        val = arr[key];
        console.log((colors.green(key)) + ": " + val);
      }
    }
  });
}