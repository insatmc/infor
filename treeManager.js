var fs = require('fs')

const filesManager = require('./filesManager.js')

const pushInObject = (object, path, value) => {
  let pathIndex = 0
  let currentObject = object
  let insertDone = false
  while (!insertDone) {
    let currentKey = path[pathIndex]
    if (pathIndex === path.length - 1) {
      if (!currentObject[currentKey]) {
        currentObject[currentKey] = []
      }
      currentObject[currentKey].push(value)
      insertDone = true
      break
    }
    if (!currentObject[currentKey]) {
      currentObject[currentKey] = {}
    }
    currentObject = currentObject[currentKey]
    pathIndex++
  }
}

const saveTreeToFiles = (tree, path, header) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }

  if (!Array.isArray(tree)) {
    Object.keys(tree).forEach((dirName) => {
      filesManager.createDir(path + '/' + dirName, () => {
        saveTreeToFiles(tree[dirName], path + '/' + dirName, header)
      })
    })
  } else {
    filesManager.saveSalesFile(
      `${path}/sales.csv`,
      tree
        .map(row => row.join(','))
        .join('\n'),
      header
    )
  }
}

module.exports = {
  pushInObject,
  saveTreeToFiles
}
