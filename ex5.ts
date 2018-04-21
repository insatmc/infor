
const holidayCsv = `Friday_End,Holiday,comment,Value
2012-10-26,HALL,Halloween,0.29
2012-11-02,HALL,Halloween,0.71
2012-11-02,HALL1,1 weeks after Halloween,0.29
2012-11-09,BFM2,2 weeks before Black Friday// Thanksgiving,1.0
2012-11-09,HALL1,1 weeks after Halloween,0.71
2012-11-16,BFM1,1 weeks before Black Friday// Thanksgiving,1.0
2012-11-23,BF,Black Friday// Thanksgiving,1.0
2012-11-30,XMASM3,3 weeks before Christmas,0.43
2012-11-30,BF1,1 weeks after Black Friday// Thanksgiving,1.0
`
const categoryHolidayCsv = `Category_ID,Holiday,Value
c01,BF,1
c01,BF1,1
c01,BFM1,1
c01,BFM2,1
c01,BTS,1
c01,BTS1,1
c01,BTSM1,1
c01,BTSM2,1
c01,BTSM3,1
`
const salesCsv = `Store_ID,Item_ID,Friday_End,Units,Sales
1,1,2012-11-02,7,17.2
1,1,2012-11-09,15,36.8
1,1,2012-11-16,17,41.7
1,1,2013-05-17,5,12.3
10,1,2013-05-24,9,22.1
118,177,2013-10-28,30,131.3
118,100,2014-11-04,16,70.4
`
type CsvObject = {
    data: string[][];
    header: string[];
}
const csvToObject = (csv: string): CsvObject => {
    csv = csv.trim()
    const rows = csv.split('\n').map(el => el.split(','))
    return {
        data: rows.slice(1),
        header: rows[0]
    }
} 

const holidayData: string[][] = csvToObject(holidayCsv).data
const salesData: string[][] = csvToObject(salesCsv).data

const createMapOfFridayEndToHoliday = (fridayEnd: string, holidayData: string[][]): string[] => {
    return holidayData.find(row => row[0] === fridayEnd)
}

const createMapOfFridayEndsToHolidays = (fridayEnds: string[], holidayData: string[][]): {} => {
    return fridayEnds.reduce(
        (res, fridayEnd) => ({
            ...res,
            [fridayEnd]: createMapOfFridayEndToHoliday(fridayEnd, holidayData)
        }),
        {}
    )
}

const fridayEnds = holidayData.map(row => row[0])
const mapFridayEndsToHolidays = createMapOfFridayEndsToHolidays(fridayEnds, holidayData)

console.log(mapFridayEndsToHolidays)