const filesManager = require('./filesManager.js')

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
    return Object.assign({}, res, { [curr[0]]: curr[levelColumnIndex] })
  }, {})
}

const mapSalesToLevel = (products, levelColumnIndex, sales) => {
  let tree = {}
  const mappedItems = mapItemsToLevel(products, levelColumnIndex)
  sales.forEach((salesItem) => {
    let categoryId = mappedItems[salesItem[1]]
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
let levelColumnIndex = (levelName === 'category' ? 1 : 2)
saveTreeTofiles(mapSalesToLevel(products, levelColumnIndex, salesData))
