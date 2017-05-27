var http = require('http')
var cheerio = require('cheerio')
var superagent = require('superagent')
var eventproxy = require('eventproxy')

var url = 'http://www.jianshu.com/'


var notes = []

function start () {
  superagent.get(url)
  .end(function (err, res) {
    if (err) {
      console.log(err)
    }
    var $ = cheerio.load(res.text)
    var titles = $('.note-list .title')
    for (var i = 0; i < titles.length; i++) {
      notes.push({
        title: $(titles).eq(i).text(),
        url:  $(titles).eq(i).attr('href')
      })
    }
    console.log(notes)
  })
  function onRequest (req, response) {
    notes.forEach(function (note) {
      superagent.get(note.url)
      .end(function (err, response) {
        console.log('fetch ' + note.url + ' successful')
      })
    })
    response.write('123')
  }

  http.createServer(onRequest).listen(3000)  
}

start()