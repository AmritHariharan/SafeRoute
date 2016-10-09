var colors = ["red", "orange", "gold", "green"];

function getColor(sketch_ratio) {
    if(sketch_ratio < 0.4) return colors[3];
    else if(sketch_ratio < 0.6) return colors[2];
    else if(sketch_ratio < 0.8) return colors[1];
    return colors[0];
}

var currentLoc = {lat:42.340473, lng:-83.062516};
var heatMapData = [];
var marker;
var map;

function initMap() {
	// processPosition({
 //  		coords: {
 //    		latitude: lat_arr[i],
 //    		longitude: lng_arr[i]
	// }});
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById("map"), {
        center: currentLoc,
        zoom: 16
    });
    gm.info.watchPosition(processPosition, true);
    // Create a marker and set its position.
    marker = new google.maps.Marker({
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
    //console.log(lat);
    var lng = position.coords.longitude;
    //console.log(lng);

    currentLoc.lat = lat;
    currentLoc.lng = lng;

    marker.setPosition( new google.maps.LatLng(lat_arr[i], lng_arr[i]) );
  	map.panTo( new google.maps.LatLng(lat_arr[i], lng_arr[i]) );

    var flipped = [lng, lat];

    badness_at_point(flipped, updateSafetyState);
}

function resetButton() {

	// processPosition({
 //  		coords: {
 //    		latitude: 42.340473,
 //    		longitude: -83.062516}
 //    }});
    marker.setPosition( new google.maps.LatLng(42.340473, -83.062516) );
  	map.panTo( new google.maps.LatLng(42.340473, -83.062516) );

}

// DEMO JOURNEY CODE


var i = 0;
// Coordinates for points that map the demo journey
var lat_arr = [42.340473, 42.340153, 42.342247, 42.343856, 42.346077, 42.347829, 42.349248, 42.351452, 42.353133, 42.354885, 42.357208, 42.358334, 42.360046, 42.361537, 42.362774, 42.364034, 42.365548, 42.366634, 42.368521, 42.370177, 42.372096, 42.373110, 42.373816, 42.374743, 42.374949, 42.374442, 42.373911, 42.373934, 42.374488];
var lng_arr = [-83.062516, -83.066138, -83.067490, -83.068251, -83.069238, -83.070075, -83.070719, -83.071945, -83.072964, -83.074005, -83.074767, -83.074938, -83.074144, -83.072353, -83.070389, -83.067975, -83.064767, -83.062010, -83.058030, -83.055540, -83.052096, -83.049296, -83.046968, -83.046453, -83.047601, -83.049210, -83.050519, -83.049243, -83.047438];
console.log("arr 1 length: " + lat_arr.length);
console.log("arr 2 length: " + lng_arr.length);

var interval

function buttonPress() {
	interval = setInterval(buttonAction, 1000);
}

function buttonAction() {
  
  processPosition({
  coords: {
    latitude: lat_arr[i],
    longitude: lng_arr[i]
  }});
  i++;
  if (i >= lat_arr.length) {
    clearInterval(interval);
  }
}

