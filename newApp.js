const fs = require('fs')
const path = require('path')

const configString = fs.readFileSync(process.argv[2], 'utf8')

const mapConfigToObject = configString => {
    return configString
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
}


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


