var colors = ["red", "orange", "gold", "green"];

function getColor(sketch_ratio) {
    if(sketch_ratio < 0.4) return colors[3];
    else if(sketch_ratio < 0.6) return colors[2];
    else if(sketch_ratio < 0.8) return colors[1];
    return colors[0];
}

var currentLoc = {lat:42.35, lng:-83.05};
var heatMapData = [];

function initMap() {
    //TEMPORARY TEST
    processPosition({
        coords: {
            latitude: 42.33,
            longitude: -83.05
        }
    });
    //END TEMPORARY TEST
    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById("map"), {
        center: currentLoc,
        zoom: 16
    });
    gm.info.watchPosition(processPosition, true);
    // Create a marker and set its position.
    var marker = new google.maps.Marker({
        map: map,
        position: currentLoc
    });
    var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData
    });
    heatmap.setMap(map);
}

function changeBar(sketch_ratio) {
  var c = document.getElementById("sketch_bar");
  var ctx = c.getContext("2d");

  ctx.beginPath();
  ctx.rect(0, 0, c.width, c.height);
  ctx.fillStyle = getColor(sketch_ratio);
  ctx.fill();

  ctx.beginPath();
  ctx.rect(0, 0, c.width, c.height*(1-sketch_ratio));
  ctx.fillStyle = "white";
  ctx.fill();
}

function withinMapBounds(pt1, pt2) {
    var lon1 = pt1[0];
    var lat1 = pt1[1];
    var lon2 = pt2[0];
    var lat2 = pt2[1];
    if (Math.abs(lon1 - lon2) < 0.01 && Math.abs(lat1 - lat2) < 0.01) { //if within bounds of lat/long
        //console.log("crime lat,lon: " + lat1 + ", " + lon1);
        return true;
    } else {
        return false;
    }
}

function updateSafetyState(sketch_factor, current_location) {
    var sketch_max = 100;
    var sketch_ratio = sketch_factor / sketch_max;
    changeBar(sketch_ratio);
    //heat map stuff
    heatMapData = []; //reset heatMapData
    for (var i = 0; i < globalJSON.length; ++i) {
        crime = globalJSON[i];
        //console.log(dist(crime.location.coordinates, current_location));
        if (withinMapBounds(crime.location.coordinates, current_location)) {
            infraction_level = category_weights[crime.category];
            if (infraction_level != undefined) {
                // only add for known category names
                heatMapData.push({
                    location: new google.maps.LatLng(crime.location.coordinates[1], crime.location.coordinates[0]),
                    weight: infraction_level
                });
            }
        }
    }
}

function processPosition(position) {
    var lat = position.coords.latitude;
    console.log(position.coords.latitude);
    var lng = position.coords.longitude;
    console.log(lng);

    currentLoc.lat = lat;
    currentLoc.lng = lng;

    var flipped = [lng, lat];

    //initMap();
    badness_at_point(flipped, updateSafetyState);
}
