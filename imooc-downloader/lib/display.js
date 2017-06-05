let colors = require('colors')

const WIDTH = process.stdout.columns

exports.showCourses = function (source) {
  console.log(colors.magenta(`搜索关于${source.keyword}的课程列表`))
  source.items.forEach((ele, index) => {
    fullScreen('-')
    for (let prop in ele) {
      if (prop === 'id') {
        console.log(colors.green(`${prop}: `), colors.bgRed(` ${ele[prop] + (ele.type == 1 ? ' (实战-付费课程)' : '')} `))
      } else if (prop != 'type') {
        console.log(colors.green(`${prop}: `), colors.grey(`${ele[prop].substring(0, 60)}${prop === 'description' ? '...' : ''}`))
      }
    }
  })
}

exports.showCoursesControl = function (source) {
  source.forEach((ele, index) => {
    process.stdout.write(colors.green(ele.text))
    ele.items.forEach((item, i) => {
      if (item.text === '全部') {
        item.c = ''
      }
      let c = item.c !== '' ? ('['+item.c+'] ') : ' '
      process.stdout.write(item.on === true ? colors.bgRed(item.text) : ' ' + item.text + c)
    })
    process.stdout.write('\n')
    fullScreen('-')
  })
}

exports.showLessons = function () {}

exports.downloadDetail = function () {}

exports.br = function () {}

exports.download = function () {}

exports.finish = function (opts) {
  console.log(`[[ 下载完成，总共耗时`.green, colors.red(`${opts.time}`),`ms ]]`.green)
}

function fullScreen (char) {
  for (let i = 0; i < WIDTH; i++) {
    process.stdout.write(char.grey)
  }
  // process.stdout.write('\n')
}

function scaleChar () {}