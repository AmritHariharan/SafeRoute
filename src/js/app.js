var colors = ["red", "orange", "gold", "green"];

function getColor(sketch_ratio) {
    if (sketch_ratio < 0.4) return colors[3];
    else if (sketch_ratio < 0.6) return colors[2];
    else if (sketch_ratio < 0.8) return colors[1];
    return colors[0];
}

var currentLoc = {
    lat: 42.33,
    lng: -83.05
};
var heatMapData;
var heatmap;
var map;

function initMap() {
    heatMapData = new google.maps.MVCArray();
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById("map"), {
        center: currentLoc,
        zoom: 16
    });
    gm.info.watchPosition(processPosition, true);
    // Create a marker and set its position.
    var marker = new google.maps.Marker({
        map: map,
        position: currentLoc
    });
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData
    });
    heatmap.setMap(map);
    google.maps.event.addListener(map, 'bounds_changed', function() {
        updateHeatMap();
    });
}

function changeBar(sketch_ratio) {
    var c = document.getElementById("sketch_bar");
    var ctx = c.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, c.width, c.height);
    ctx.fillStyle = getColor(sketch_ratio);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0, 0, c.width, c.height * (1 - sketch_ratio));
    ctx.fillStyle = "white";
    ctx.fill();
}

function withinMapBounds(pt1) {
    var lon1 = pt1[0];
    var lat1 = pt1[1];
    if (map.getBounds().contains(new google.maps.LatLng(lat1, lon1))) {
        return true;
    } else {
        return false;
    }
}

function updateSafetyState(sketch_factor, current_location) {
    var sketch_max = 100;
    var sketch_ratio = sketch_factor / sketch_max;
    changeBar(sketch_ratio);
    updateHeatMap(current_location);
}

function updateHeatMap() {
    heatMapData.clear(); //reset heatMapData
    for (var i = 0; i < globalJSON.length; ++i) {
        crime = globalJSON[i];
        //console.log(dist(crime.location.coordinates, current_location));
        if (withinMapBounds(crime.location.coordinates)) {
            infraction_level = category_weights[crime.category];
            if (infraction_level != undefined) {
                // only add for known category names
                //console.log("pushed: "+new google.maps.LatLng(crime.location.coordinates[1], crime.location.coordinates[0]));
                heatMapData.push(new google.maps.LatLng(crime.location.coordinates[1], crime.location.coordinates[0]));
                //console.log(heatMapData.length);
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
