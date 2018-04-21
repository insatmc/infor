var fs = require('fs')

const createDir = (dir, callback) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  callback()
}

const saveSalesFile = (path, content, salesHeader) => {
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
