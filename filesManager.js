var fs = require('fs')

const createDir = (dir) => {
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }
  dir = 'output/' + dir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

const saveSalesFile = (path, content, salesHeader) => {
  path = 'output/' + path
  content = salesHeader + '\n' + content
  fs.writeFile(path, content, (err) => {
    if (err) {
      return console.log(err)
    }
  })
}

module.exports = {
  createDir,
  saveSalesFile
}
