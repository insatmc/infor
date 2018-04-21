const treeManager = require('./treeManager.js')
const configManager = require('./configManager.js')
const fs = require('fs')

const configString = fs.readFileSync(process.argv[2] , 'utf8')

const config = configManager.mapConfigToObject(configString)

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

const dataPath = config.meta['data-path']

const calendarsPath = path.join(dataPath, config['hierarchy-data'].calendar)
const productsPath = path.join(dataPath, config['hierarchy-data'].product)
const locationsPath = path.join(dataPath, config['hierarchy-data'].location)


const salesPath = path.join(dataPath, config['fact-data'].sales)

const calendar = parseFile(calendarsPath).data
const products = parseFile(productsPath)
const productsData = products.data
const sales = parseFile(salesPath)
const salesHeader = sales.header
const salesData = sales.data
const locations = parseFile(locationsPath).data

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

console.log(config)

const productLevelName = config['partitioning-keys'].product
const locationLevelName = config['partitioning-keys'].location
const calendarLevelName = config['partitioning-keys'].calendar

let productLevelColumnIndex = PRODUCT_IDS[(productLevelName + '_Id').toUpperCase()]
let locationLevelColumnIndex = LOCATION_IDS[locationLevelName.toUpperCase()]
let calendarLevelColumnIndex = CALENDAR_IDS[calendarLevelName.toUpperCase()]

treeManager.saveTreeToFiles(mapSalesToLevel(salesData,
  [productsData, locations, calendar],
  [PRODUCT_IDS.ITEM_ID, LOCATION_IDS.STORE_ID, CALENDAR_IDS.FRIDAY_END],
  [productLevelColumnIndex, locationLevelColumnIndex, calendarLevelColumnIndex],
  ['ITEM_ID', 'STORE_ID', 'FRIDAY_END']
), './output', salesHeader)
