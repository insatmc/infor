const treeManager = require('./treeManager.js')
const configManager = require('./configManager.js')
const fs = require('fs')
const path = require('path')
const configString = fs.readFileSync(process.argv[2], 'utf8')

const config = configManager.mapConfigToObject(configString)

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
    mapped.push(mapDataToLevel(dataItems[i], dataIDs[i], levels[i]))
  }
  sales.forEach((salesItem) => {
    let levels = salesKeys.map((key, i) => {
      return mapped[i][salesItem[SALES_IDS[key]]]
    })
    if (levels.every(e => e)) {
      treeManager.pushInObject(tree, levels, salesItem)
    }
  })
  return tree
}

const data = {}

Object.keys(config['hierarchy-data']).map((fileName) => {
  const parsedFile = parseFile(path.join(dataPath, config['hierarchy-data'][fileName]))
  data[fileName] = {
    data: parsedFile.data,
    levelIndex: parsedFile.header.toUpperCase().split(',').indexOf(config['partitioning-keys'][fileName].toUpperCase()),
    primaryKey: parsedFile.header.toUpperCase().split(',')[0]
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

treeManager.saveTreeToFiles(mapSalesToLevel(salesData,
  dataItems,
  dataIDs,
  levels,
  salesKeys
), './output', salesHeader)
