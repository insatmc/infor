const parseFile = (file) => {
  return require('fs').readFileSync(file).toString().split('\n').slice(1, -1).map((line) => {
    return line.split(',')
  })
}

const calendar = parseFile('./calendar.csv')
const products = parseFile('./product.csv')
const sales = parseFile('./sales.csv')
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

const levelName = process.argv[2]
let levelColumnIndex = (levelName === 'category' ? 1 : 2)
console.log(mapSalesToLevel(products, levelColumnIndex, sales))
