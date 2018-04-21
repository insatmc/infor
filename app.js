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
const products = parseFile('./product.csv').data
const sales = parseFile('./sales.csv')
const salesHeader = sales.header
const salesData = sales.data
const locations = parseFile('./location.csv')

const mapItemsToLevel = (products, levelColumnIndex) => {
  return products.reduce((res, curr) => {
    return Object.assign({}, res, { [curr[PRODUCT_IDS.ITEM_ID]]: curr[levelColumnIndex] })
  }, {})
}

const mapSalesToLevel = (products, levelColumnIndex, sales) => {
  let tree = {}
  const mappedItems = mapItemsToLevel(products, levelColumnIndex)
  sales.forEach((salesItem) => {
    let categoryId = mappedItems[salesItem[SALES_IDS.ITEM_ID]]
    // write to file
    if (categoryId) {
      if (!tree[categoryId]) {
        tree[categoryId] = []
      }
      tree[categoryId].push(salesItem)
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

const levelName = process.argv[2]
let levelColumnIndex = (levelName === 'category' ? PRODUCT_IDS.CATEGORY_ID : PRODUCT_IDS.DEPARTEMENT_ID)
saveTreeTofiles(mapSalesToLevel(products, levelColumnIndex, salesData))
