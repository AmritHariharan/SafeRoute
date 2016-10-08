var colors = ["red", "orange", "gold", "green"];

function getColor(sketch_ratio) {
    if(sketch_ratio < 0.4) return colors[3];
    else if(sketch_ratio < 0.6) return colors[2];
    else if(sketch_ratio < 0.8) return colors[1];
    return colors[0];
}

var currentLoc = {lat:42.35, lng:-83.05};

function initMap() {
    //var myLatLng = {lat: 42.3, lng: -83};
    //var myLatLng = {lat: latitude, lng: longitude};
    //console.log(myLatLng.lat, myLatLng.lng);

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById("map"), {
        center: currentLoc,
        zoom: 16
    });

    // Create a marker and set its position.
    var marker = new google.maps.Marker({
        map: map,
        position: currentLoc
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
    ctx.rect(0, 0, c.width, c.height*(1-sketch_ratio));
    ctx.fillStyle = "white";
    ctx.fill();
}

function updateSafetyState(sketch_factor) {
    var sketch_max = 100;
    var sketch_ratio = sketch_factor / sketch_max;

    initMap();
    changeBar(sketch_ratio);
}

gm.info.watchPosition(processPosition, true)

function processPosition(position){
  var lat = position.coords.latitude;
  console.log(position.coords.latitude);
  var lng = position.coords.longitude;
  console.log(lng);

  currentLoc.lat = lat;
  currentLoc.lng = lng;

  var flipped = [lng,lat];

  //initMap();
  badness_at_point(flipped, updateSafetyState);
}

initMap();
changeBar(0);
