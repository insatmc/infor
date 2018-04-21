const fs = require('fs')
const path = require('path')

const configString = fs.readFileSync(process.argv[2], 'utf8')

const mapConfigToObject = configString =>
    configString
        .split('\n')
        .filter(el => el)
        .map(el => el.trim())
        .reduce((res, cur) => {
            if(cur[0] === '[') {
                currentKey = cur.slice(1, -1)
                return {...res, [currentKey]: {}}
            }
            const [key, value] = cur.split('=')
            return {...res, [currentKey]: {...res[currentKey], [key]: value}}

        } , {})

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

const updateSalesFile = (path, content, salesHeader) => {
  const oldContent = fs.readFileSync(path, 'utf8')
  const newContent = salesHeader + '\n' + content
  if(oldContent === newContent) {
    return
  }
  fs.writeFile(path, newContent, (err) => {
    if (err) {
      return console.log(err)
    }
  })
}
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
      createDir(path + '/' + dirName, () => {
        saveTreeToFiles(tree[dirName], path + '/' + dirName, header)
      })
    })
  } else {
    const saveOrUpdate = config.meta.update === "true" ? updateSalesFile : saveSalesFile
    saveOrUpdate(
      `${path}/sales.csv`,
      tree
        .map(row => row.join(','))
        .join('\n'),
      header
    )
  }
}

const config = mapConfigToObject(configString)

const SALES_IDS = {
  STORE_ID: 0,
  ITEM_ID: 1,
  FRIDAY_END: 2,
  UNITES: 3,
  SALES: 4
}

const parseFile = (file) => {
  let allRows = require('fs').readFileSync(file).toString().split('\n')
  return {
    header: allRows[0],
    data: allRows.slice(1, -1).map((line) => {
      return line.split(',')
    })
  }
}

const dataPath = config.meta['data-path']

const salesPath = path.join(dataPath, config['fact-data'].sales)

const sales = parseFile(salesPath)
const salesHeader = sales.header
const salesData = sales.data

const mapDataToLevel = (data, dataID, levelColumnIndex) => {
  return data.reduce((res, curr) => {
    return Object.assign({}, res, { [curr[dataID]]: curr[levelColumnIndex] })
  }, {})
}

const mapSalesToLevel = (sales, dataItems, dataIDs, levels, salesKeys) => {
  let tree = {}
  const mapped = []
  for (var i = 0; i < dataItems.length; i++) {
    if (levels[i]) {
      mapped.push(mapDataToLevel(dataItems[i], dataIDs[i], levels[i]))
    }
  }
  sales.forEach((salesItem) => {
    let levelsItems = salesKeys.map((key, i) => {
      if (levels[i]) {
        return mapped[i][salesItem[SALES_IDS[key]]]
      }
      return -1
    }).filter(e => e && e !== -1)
    if (levelsItems.length > 0 && levelsItems.every(e => e)) {
      pushInObject(tree, levelsItems, salesItem)
    }
  })
  return tree
}

const data = {}

Object.keys(config['hierarchy-data']).map((fileName) => {
  const parsedFile = parseFile(path.join(dataPath, config['hierarchy-data'][fileName]))
  const header = parsedFile.header.toUpperCase().split(',')
  let levelIndex
  if (config['partitioning-keys'][fileName]) {
    let level = config['partitioning-keys'][fileName].toUpperCase()
    if (fileName === 'product' && level.indexOf('_ID') === -1) {
      level += '_ID'
    }
    levelIndex = header.indexOf(level)
  }
  data[fileName] = {
    data: parsedFile.data,
    levelIndex,
    primaryKey: header[0]
  }
})

let dataItems = []
let dataIDs = []
let levels = []
let salesKeys = []

Object.keys(data).forEach(key => {
  dataItems.push(data[key].data)
  dataIDs.push(0)
  levels.push(data[key].levelIndex)
  salesKeys.push(data[key].primaryKey)
})


saveTreeToFiles(mapSalesToLevel(salesData,
  dataItems,
  dataIDs,
  levels,
  salesKeys
), './output', salesHeader)
