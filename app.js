const filesManager = require('./filesManager.js')

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

const parseFile = (file) => {
  let allRows = require('fs').readFileSync(file).toString().split('\n')
  return {
    header: allRows[0],
    data: allRows.slice(1, -1).map((line) => {
      return line.split(',')
    })
  }
}

const calendar = parseFile('./calendar.csv').data
const products = parseFile('./product.csv')
const productsData = products.data
const sales = parseFile('./sales.csv')
const salesHeader = sales.header
const salesData = sales.data
const locations = parseFile('./location.csv').data

const mapItemsToLevel = (products, levelColumnIndex) => {
  return products.reduce((res, curr) => {
    return Object.assign({}, res, { [curr[PRODUCT_IDS.ITEM_ID]]: curr[levelColumnIndex] })
  }, {})
}

const mapStoreToLevel = (locations, levelColumnIndex) => {
  return locations.reduce((res, curr) => {
    return Object.assign({}, res, { [curr[LOCATION_IDS.STORE_ID]]: curr[levelColumnIndex] })
  }, {})
}

const mapSalesToLevel = (products, levelColumnIndex, sales, storeColumnIndex, locations) => {
  let tree = {}
  const mappedItems = mapItemsToLevel(products, levelColumnIndex)
  const mappedStores = mapStoreToLevel(locations, storeColumnIndex)
  sales.forEach((salesItem) => {
    let categoryId = mappedItems[salesItem[SALES_IDS.ITEM_ID]]
    let storeId = mappedStores[salesItem[SALES_IDS.ITEM_ID]]
    // write to file
    if (categoryId && storeId) {
      if (!tree[categoryId]) {
        tree[categoryId] = {}
      }
      if (!tree[categoryId][storeId]) {
        tree[categoryId][storeId] = []
      }

      tree[categoryId][storeId].push(salesItem)
    }
  })
  return tree
}

const saveTreeTofiles = (tree) => {
  Object.keys(tree).forEach((dirName) => {
    filesManager.createDir(dirName)
    filesManager.saveSalesFile(
      `${dirName}/sales.csv`,
      tree[dirName]
        .map(row => row.join(','))
        .join('\n'),
      salesHeader
    )
  })
}

const productLevelName = process.argv[2]
const locationLevelName = process.argv[3]

let productLevelColumnIndex = PRODUCT_IDS[(productLevelName + '_Id').toUpperCase()]
let locationLevelColumnIndex = LOCATION_IDS[locationLevelName.toUpperCase()]

console.log(mapSalesToLevel(productsData,
  productLevelColumnIndex,
  salesData,
  locationLevelColumnIndex,
  locations))
