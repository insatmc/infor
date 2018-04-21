
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

module.exports = {
    mapConfigToObject
}