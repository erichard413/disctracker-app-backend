function doHaversine(lat1, lon1, lat2, lon2, unit="M") {  
    if ((lat1==lat2) && (lon1 == lon2)) {
        // if it's the same coordinate, return 0;
        return 0;
    } else {
        let radlat1 = Math.PI * lat1/180;
        let radlat2 = Math.PI * lat2/180;
        let theta = lon1-lon2;
        let radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}


function doDistancePrep(checkins) {
let result = [];
    for (let each of checkins) {
        result.push({
            lat: +each.latitude,
            lon: +each.longitude
        })
    }
return result;
}

function calcTotal(checkins) {
let arr = doDistancePrep(checkins);
let idx = 0;
let total = 0;
arr.forEach(coords1 => {
    let coords2 = arr[idx+1];
    if (idx < arr.length-1) {
        total += doHaversine(coords1.lat, coords1.lon, coords2.lat, coords2.lon);
    }
    idx++;
})
return total;
}

module.exports = {calcTotal};