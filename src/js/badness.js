// var vinElem = document.getElementById('vin');
// gm.info.getVehicleConfiguration(function(data) {
//     vinElem.innerHTML = "started...";
//     var input = "-83.05,42.4323"; //current position is fixed
//     var loc = JSON.parse("[" + input + "]");
//     badness_at_point(loc, function(badness) {
//         console.log("BADNESS: " + badness);
//     });
// });
var globalJSON;
//Also PARSES the data
function getData(callback) {
    var contents = gm.filesystem.readFile("last_time.txt");
    var d = new Date();
    if (contents !== null) {
        var elapsed = d.getTime() - parseInt(contents);
        console.log("elapsed time since last read: " + elapsed / 1000);
        if (elapsed > 86400000) { //86400000 for one day
            pullData(function(data) {
                globalJSON = JSON.parse(data);
                
                callback(globalJSON);
            });
        } else { //if a day has not elapsed, check the ram then the disk
            if (globalJSON == null) {
                console.log("no data in ram, reading from disk");
                var data = gm.filesystem.readFile("data.json");
                globalJSON = JSON.parse(data);

                callback(globalJSON);
            } else {
                callback(globalJSON);
            }
        }
    } else {
        console.log("no last_time.txt found so creating a new one");
        console.log("last_time contents: " + contents);
        pullData(function(data) {
            callback(data);
        });
    }
}

function pullData(callback) {
    var d = new Date();
    console.log("fetching data online...");
    var lastYear = new Date(d.getTime() - 3.154e10);
    console.log("going to query: " + "https://data.detroitmi.gov/resource/i9ph-uyrp.json?$where=incidentdate > '" + dateString(lastYear) + "'");
    httpGetAsync("https://data.detroitmi.gov/resource/i9ph-uyrp.json?$where=incidentdate > '" + dateString(lastYear) + "'", function(dataString) {
        gm.filesystem.writeFile("data.json", dataString);
        gm.filesystem.writeFile("last_time.txt", "" + d.getTime());
        callback(dataString);
    });
}

function dateString(d) {
    var date = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    return year + "-" + month + "-" + date;
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}
//Lord Colin's code
category_weights = {
    'MISCELLANEOUS': 1,
    'ASSAULT': 3,
    'BURGLARY': 2,
    'TRAFFIC': 1,
    'DAMAGE TO PROPERTY': 2,
    'ROBBERY': 4,
    'FAMILY OFFENSE': 0,
    'LARCENY': 2,
    'FRAUD': 0,
    'AGGRAVATED ASSAULT': 3,
    'STOLEN VEHICLE': 5,
    'OBSTRUCTING JUDICIARY': 0,
    'OBSTRUCTING THE POLICE': 1,
    'WEAPONS OFFENSES': 3,
    'ARSON': 1,
    'GAMBLING': 0,
    'RUNAWAY': 0,
    'DISORDERLY CONDUCT': 1,
    'HOMICIDE': 5,
    'EXTORTION': 0,
    'OTHER BURGLARY': 2,
    'KIDNAPPING': 4,
    'STOLEN PROPERTY': 2,
    'FORGERY': 0,
    'DANGEROUS DRUGS': 1,
    'OUIL': 3,
    'ESCAPE': 0,
    'OTHER': 1,
    'SOLICITATION': 0,
    'NEGLIGENT HOMICIDE': 3,
    'VAGRANCY (OTHER)': 1,
    'LIQUOR': 2,
    'ENVIRONMENT': 0,
    'EMBEZZLEMENT': 0,
    'CIVIL': 1,
    'BRIBERY': 0,
    'OBSCENITY': 1,
    'IMMIGRATION': 0,
    'JUSTIFIABLE HOMICIDE': 2
};

range = 400;

function dist(pt1, pt2) {
    // Note that the database stores values as [longitude, latitude], not the other way around
    // convert to radians
    //console.log(pt1 + " " + pt2);
    var lon1 = pt1[0] * Math.PI / 180;
    var lat1 = pt1[1] * Math.PI / 180;
    var lon2 = pt2[0] * Math.PI / 180;
    var lat2 = pt2[1] * Math.PI / 180;
    var dlon = lon2 - lon1
    var dlat = lat2 - lat1
    var a = (Math.sin(dlat / 2)) ** 2 + Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dlon / 2)) ** 2
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = 6371000 * c // Radius of earth (m)
        //console.log(d);
    return d; // distance in meters
}

function badness_at_point(current_location, callback) {
    // current location [longitude, latitude]
    getData(function(crimes) {
        var sum = 0;
        //console.log(current_location[0] + " " + crimes[0].location.coordinates);
        for (var i = 0; i < crimes.length; i++) { //crimes.length
            crime = crimes[i];
            //console.log(dist(crime.location.coordinates, current_location));
            if (dist(crime.location.coordinates, current_location) < range) {
                infraction_level = category_weights[crime.category];
                if (infraction_level != undefined) {
                    // only add for known category names
                    sum += infraction_level;
                }
            }
        }
        console.log("sum: " + sum);
        sum = (sum / range ** 2) * 8000;
        if (sum > 100) {
            sum = 100;
        }
        callback(sum,current_location);
    });
}
