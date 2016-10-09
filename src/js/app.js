var colors = ["red", "orange", "gold", "green"];

function getColor(sketch_ratio) {
    if (sketch_ratio < 0.4) return colors[3];
    else if (sketch_ratio < 0.6) return colors[2];
    else if (sketch_ratio < 0.8) return colors[1];
    return colors[0];
}
var currentLoc = {
    lat: 42.340473,
    lng: -83.062516
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
    marker = new google.maps.Marker({
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
    //console.log(lat);
    var lng = position.coords.longitude;
    //console.log(lng);

    currentLoc.lat = lat;
    currentLoc.lng = lng;

    marker.setPosition(new google.maps.LatLng(lat_arr[i], lng_arr[i]));
    map.panTo(new google.maps.LatLng(lat_arr[i], lng_arr[i]));

    var flipped = [lng, lat];

    badness_at_point(flipped, updateSafetyState);
}


// MONITORING CODE

var vdata = gm.info.watchVehicleData(
	processData,
	function(){},
	// Fuel
	['EV_max_range',
	'fuel_level',
	// Tire Pressure
	'tire_right_front_pressure',
	'tire_left_front_pressure',
	'tire_right_rear_pressure',
	'tire_left_rear_pressure',
	// Lights
	'bulb_center_fail',
	'bulb_frontright_turn_fail',
	'bulb_frontleft_turn_fail'],
	1000);

var EV_max_range;
var fuel_level;
var tire_right_front_pressure;
var tire_left_front_pressure;
var tire_right_rear_pressure;
var tire_left_rear_pressure;
var bulb_center_fail;
var bulb_frontright_turn_fail;
var bulb_frontleft_turn_fail;


function processData(data) {

	// Setting variables
	EV_max_range = data.EV_max_range;
	fuel_level = data.fuel_level;
	tire_right_front_pressure = data.tire_right_front_pressure;
	tire_left_front_pressure = data.tire_left_front_pressure;
	tire_right_rear_pressure = data.tire_right_rear_pressure;
	tire_left_rear_pressure = data.tire_left_rear_pressure;
	bulb_center_fail = data.bulb_center_fail;
	bulb_frontright_turn_fail = data.bulb_frontright_turn_fail;
	bulb_frontleft_turn_fail = data.bulb_frontleft_turn_fail;


	console.log(EV_max_range);
	// Fuel
	if ((EV_max_range < 10 && EV_max_range != null) || (fuel_level < 10 && EV_max_range != null)) { // km
		var element = document.getElementById('alertBoxFuel');
		element.style.opacity = "1";
	} else {
		var element = document.getElementById('alertBoxFuel');
		element.style.opacity = "0";
	}

console.log(tire_right_front_pressure);
	// Tires
	if (tire_right_front_pressure < 138 || tire_left_front_pressure < 138 || tire_right_rear_pressure < 138 || tire_left_rear_pressure < 138) { // kPaG
		var element = document.getElementById('alertBoxTires');
		element.style.opacity = "1";
	} else {
		var element = document.getElementById('alertBoxTires');
		element.style.opacity = "0";
	}

	console.log(bulb_center_fail);
	// Lights
	if (bulb_center_fail == 1 || bulb_frontright_turn_fail == 1 || bulb_frontleft_turn_fail == 1) { // 1/0
		var element = document.getElementById('alertBoxLights');
		element.style.opacity = "1";
	} else {
		var element = document.getElementById('alertBoxLights');
		element.style.opacity = "0";
	}
}

// GO BACK TO THE MASONIC TEMPLE THEATRE

function resetButton() {
    marker.setPosition(new google.maps.LatLng(42.340473, -83.062516));
    map.panTo(new google.maps.LatLng(42.340473, -83.062516));
}

// DEMO JOURNEY CODE
var i = 0;
var interval;

function buttonPress() {
    interval = setInterval(buttonAction, 1000);
}

function buttonAction() {
    processPosition({
        coords: {
            latitude: lat_arr[i],
            longitude: lng_arr[i]
        }
    });
    i++;
    if (i >= lat_arr.length) {
        clearInterval(interval);
    }
}
// Coordinates for points that map the demo journey
var lng_arr = [-83.0604557, -83.06115, -83.0611493, -83.06079, -83.0607892, -83.06157, -83.06206, -83.06235, -83.06272, -83.06283, -83.06306, -83.06355, -83.06397, -83.06435, -83.06471, -83.06481, -83.06504, -83.06538, -83.06563, -83.0656303, -83.06566, -83.06568, -83.06571, -83.06575, -83.06578, -83.0658, -83.06586, -83.0659, -83.06601, -83.06616, -83.0661609, -83.06619, -83.06621, -83.06624, -83.06627, -83.06641, -83.06664, -83.06692, -83.06715, -83.06722, -83.06724, -83.06726, -83.06727, -83.06728, -83.0673, -83.06736, -83.06746, -83.06777, -83.06802, -83.06821, -83.06855, -83.0689, -83.06908, -83.06917, -83.06937, -83.06948, -83.07054, -83.07076, -83.07088, -83.07088, -83.07091, -83.07141, -83.07193, -83.07201, -83.07202, -83.07208, -83.07213, -83.07213, -83.07249, -83.07325, -83.07335, -83.07344, -83.07379, -83.07401, -83.07413, -83.07424, -83.0742416, -83.0742, -83.0742, -83.0742, -83.0742, -83.07424, -83.07425, -83.07436, -83.07445, -83.07458, -83.07469, -83.07479, -83.07488, -83.0749, -83.07491, -83.07492, -83.07493, -83.07494, -83.07494, -83.07494, -83.07491, -83.07488, -83.07484, -83.07479, -83.07474, -83.07468, -83.0746, -83.0745, -83.07439, -83.07422, -83.0742, -83.07419, -83.074, -83.07391, -83.0738, -83.07364, -83.07334, -83.07325, -83.07325, -83.07324, -83.07324, -83.07324, -83.07324, -83.07326, -83.07308, -83.07265, -83.07241, -83.07223, -83.07193, -83.07048, -83.07031, -83.07014, -83.06982, -83.06951, -83.06912, -83.06884, -83.06882, -83.06856, -83.06778, -83.06677, -83.06676, -83.06528, -83.06447, -83.06446, -83.06359, -83.06326, -83.06325, -83.06308, -83.06264, -83.06251, -83.06236, -83.06208, -83.06145, -83.06027, -83.06008, -83.05963, -83.05897, -83.0587, -83.05843, -83.05821, -83.05813, -83.05794, -83.0579, -83.05775, -83.05767, -83.05745, -83.05725, -83.05624, -83.05606, -83.05606, -83.056, -83.05591, -83.0553, -83.05487, -83.05433, -83.05423, -83.05415, -83.05379, -83.05363, -83.05303, -83.05277, -83.05261, -83.05237, -83.0523745, -83.05215, -83.05206, -83.05198, -83.05187, -83.05178, -83.0514, -83.05108, -83.05079, -83.05029, -83.05009, -83.04996, -83.04975, -83.04962, -83.04865, -83.04824, -83.04781, -83.04761, -83.0476059, -83.04695, -83.04658, -83.04629, -83.0462949, -83.04632, -83.04636, -83.04636, -83.0464, -83.0464, -83.04647, -83.04655, -83.04662, -83.04669, -83.04678, -83.04787, -83.0478653, -83.04647, -83.04645, -83.0464536];
var lat_arr = [42.3419599, 42.34173, 42.3417296, 42.34109, 42.3410896, 42.34085, 42.34069, 42.3406, 42.34048, 42.34045, 42.34044, 42.34029, 42.34015, 42.34004, 42.33992, 42.33989, 42.33982, 42.3397, 42.33962, 42.339623, 42.33962, 42.33961, 42.33961, 42.33962, 42.33962, 42.33963, 42.33965, 42.3397, 42.33991, 42.34017, 42.3401688, 42.34018, 42.3402, 42.34023, 42.34027, 42.34048, 42.34084, 42.34129, 42.34167, 42.3418, 42.34184, 42.34186, 42.34187, 42.34187, 42.34188, 42.3419, 42.34212, 42.34282, 42.34337, 42.34378, 42.34452, 42.3453, 42.34569, 42.34589, 42.34634, 42.34657, 42.34892, 42.34935, 42.34957, 42.34958, 42.34963, 42.35047, 42.35138, 42.35152, 42.35153, 42.35163, 42.35172, 42.35173, 42.35235, 42.35362, 42.35379, 42.35394, 42.35451, 42.35488, 42.35511, 42.35534, 42.3553383, 42.35546, 42.35547, 42.35548, 42.35549, 42.3556, 42.35561, 42.35588, 42.35613, 42.35656, 42.35692, 42.35729, 42.35764, 42.35771, 42.35779, 42.35785, 42.35792, 42.35801, 42.35816, 42.35826, 42.35849, 42.35869, 42.35885, 42.35899, 42.35913, 42.35925, 42.35943, 42.35959, 42.35975, 42.35998, 42.36, 42.36001, 42.36021, 42.36029, 42.36039, 42.36052, 42.36076, 42.36084, 42.36085, 42.36085, 42.36086, 42.36087, 42.36088, 42.36092, 42.36103, 42.36133, 42.36148, 42.36159, 42.36179, 42.3627, 42.36282, 42.36292, 42.36311, 42.36328, 42.36348, 42.36363, 42.36364, 42.36376, 42.36413, 42.36461, 42.36462, 42.36531, 42.36566, 42.36566, 42.36601, 42.36614, 42.36614, 42.3662, 42.36636, 42.36642, 42.36648, 42.36659, 42.36684, 42.3673, 42.36739, 42.36759, 42.36793, 42.36807, 42.36824, 42.36837, 42.36843, 42.36855, 42.36858, 42.36868, 42.36873, 42.36887, 42.36898, 42.36964, 42.36978, 42.36979, 42.36983, 42.36989, 42.37029, 42.37057, 42.37092, 42.37097, 42.37098, 42.37121, 42.3713, 42.37165, 42.37179, 42.37187, 42.372, 42.3719974, 42.37205, 42.37208, 42.37212, 42.37217, 42.37221, 42.37239, 42.37252, 42.37263, 42.37281, 42.37287, 42.37291, 42.37297, 42.37301, 42.37327, 42.37338, 42.37351, 42.37357, 42.373573, 42.37381, 42.37394, 42.37404, 42.374035, 42.37414, 42.37431, 42.37432, 42.37446, 42.37447, 42.37489, 42.37523, 42.3754, 42.37553, 42.37568, 42.37736, 42.3773596, 42.37789, 42.37789, 42.3778917];
