const filesManager = require('./filesManager.js')
var fs = require('fs')

const SALES_IDS = {
  STORE_ID: 0,
  ITEM_ID: 1,
  FRIDAY_END: 2,
  UNITES: 3,
  SALES: 4
}

const PRODUCT_IDS = {
  ITEM_ID: 0,
  CATEGORY_ID: 1,
  DEPARTEMENT_ID: 2
}

const LOCATION_IDS = {
  STORE_ID: 0,
  ZIPCODE: 1,
  LATITUTE: 2,
  LONGITUDE: 3,
  COUNTY: 4,
  CITY: 5,
  STATE: 6,
  TYPE: 7
}

const CALENDAR_IDS = {
  FRIDAY_END: 0,
  QUARTER: 1,
  MONTH: 2,
  YEAR: 3
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

const calendar = parseFile('./calendar.csv').data
const products = parseFile('./product.csv')
const productsData = products.data
const sales = parseFile('./sales.csv')
const salesHeader = sales.header
const salesData = sales.data
const locations = parseFile('./location.csv').data

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
      pushInObject(tree, levels, salesItem)
    }
  })
  return tree
}

const saveTreeToFiles = (tree, path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }

  if (!Array.isArray(tree)) {
    Object.keys(tree).forEach((dirName) => {
      filesManager.createDir(path + '/' + dirName, () => {
        saveTreeToFiles(tree[dirName], path + '/' + dirName)
      })
    })
  } else {
    filesManager.saveSalesFile(
      `${path}/sales.csv`,
      tree
        .map(row => row.join(','))
        .join('\n'),
      salesHeader
    )
  }
}

const productLevelName = process.argv[2]
const locationLevelName = process.argv[3]
const calendarLevelName = process.argv[4]

let productLevelColumnIndex = PRODUCT_IDS[(productLevelName + '_Id').toUpperCase()]
let locationLevelColumnIndex = LOCATION_IDS[locationLevelName.toUpperCase()]
let calendarLevelColumnIndex = CALENDAR_IDS[calendarLevelName.toUpperCase()]

saveTreeToFiles(mapSalesToLevel(salesData,
  [productsData, locations, calendar],
  [PRODUCT_IDS.ITEM_ID, LOCATION_IDS.STORE_ID, CALENDAR_IDS.FRIDAY_END],
  [productLevelColumnIndex, locationLevelColumnIndex, calendarLevelColumnIndex],
  ['ITEM_ID', 'STORE_ID', 'FRIDAY_END']
), './output')
