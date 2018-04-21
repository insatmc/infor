var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var holidayCsv = "Friday_End,Holiday,comment,Value\n2012-10-26,HALL,Halloween,0.29\n2012-11-02,HALL,Halloween,0.71\n2012-11-02,HALL1,1 weeks after Halloween,0.29\n2012-11-09,BFM2,2 weeks before Black Friday// Thanksgiving,1.0\n2012-11-09,HALL1,1 weeks after Halloween,0.71\n2012-11-16,BFM1,1 weeks before Black Friday// Thanksgiving,1.0\n2012-11-23,BF,Black Friday// Thanksgiving,1.0\n2012-11-30,XMASM3,3 weeks before Christmas,0.43\n2012-11-30,BF1,1 weeks after Black Friday// Thanksgiving,1.0\n";
var salesCsv = "Store_ID,Item_ID,Friday_End,Units,Sales\n1,1,2012-11-02,7,17.2\n1,1,2012-11-09,15,36.8\n1,1,2012-11-16,17,41.7\n1,1,2013-05-17,5,12.3\n10,1,2013-05-24,9,22.1\n118,177,2013-10-28,30,131.3\n118,100,2014-11-04,16,70.4\n";
var csvToObject = function (csv) {
    csv = csv.trim();
    var rows = csv.split('\n').map(function (el) { return el.split(','); });
    return {
        data: rows.slice(1),
        header: rows[0]
    };
};
var holidayData = csvToObject(holidayCsv).data;
var salesData = csvToObject(salesCsv).data;
var createMapOfFridayEndToHoliday = function (fridayEnd, holidayData) {
    return holidayData.find(function (row) { return row[0] === fridayEnd; });
};
var createMapOfFridayEndsToHolidays = function (fridayEnds, holidayData) {
    return fridayEnds.reduce(function (res, fridayEnd) {
        return (__assign({}, res, (_a = {}, _a[fridayEnd] = createMapOfFridayEndToHoliday(fridayEnd, holidayData), _a)));
        var _a;
    }, {});
};
var fridayEnds = holidayData.map(function (row) { return row[0]; });
var mapFridayEndsToHolidays = createMapOfFridayEndsToHolidays(fridayEnds, holidayData);
console.log(mapFridayEndsToHolidays);
