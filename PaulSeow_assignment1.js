//map
var map = L.map('map').setView([1.3553, 103.7968], 12);
var boundsSW = L.latLng(1.201023, 103.597500),
    boundsNE = L.latLng(1.490837, 104.067218),
    bounds = L.latLngBounds(boundsSW, boundsNE);
map.setMaxBounds(bounds);

var baseOsm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: 'Map data Â© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        subdomain: ['a', 'b', 'c'],
        maxZoom: 20,
        minZoom: 10
    });

var baseLight = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    maxZoom: 20,
    minZoom: 10
});

//point data
var priicon = L.MakiMarkers.icon({icon: "college", color: "#0a0", size: "s"});

var secicon = L.MakiMarkers.icon({icon: "college", color: "#b0b", size: "s"});

var collegeicon = L.MakiMarkers.icon({icon: "college", color: "#12a", size: "s"});

var othericon = L.MakiMarkers.icon({icon: "college", color: "#ff8c00", size: "s"});


var schoolsLayer = L.layerGroup();
$.getJSON("./data/schools-geojson.geojson", function (data) {
    var features = data.features;
    for (var i = 0; i < features.length; i++) {
        var properties = features[i].properties;
        var temp = L.marker([properties.LATITUDE, properties.LONGTITUDE]).bindPopup(
            properties.ALL_SCHOOLS + "<br>" + properties.ADDRESS
            + "<br>" + properties.POSTALCODE);
        if (properties.Level_of_education_level_of_education.indexOf("Primary Schools (Excluding Mixed Level Schools)") > -1) {
            temp.setIcon(priicon);
        } else if (properties.Level_of_education_level_of_education.indexOf("Secondary Schools (Excluding Mixed Level Schools)") > -1) {
            temp.setIcon(secicon);
        } else if (properties.Level_of_education_level_of_education.indexOf("Junior Colleges/Centralised Institute (Excluding Mixed Level Schools)") > -1) {
            temp.setIcon(collegeicon);
        } else {
            temp.setIcon(othericon);
        }
        schoolsLayer.addLayer(temp);
    }
});

var legendSch = L.control({position: 'bottomright'});

legendSch.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML += 
        '<b>School Legend</b><br>' +
        '<img src="0a0.png">' +" "+ "Primary" +'</br>' +
        '<img src="b0b.png">' +" "+ "Seconday" + '</br>' +
        '<img src="12a.png">' +" "+ "Colleges" +'</br>'+
        '<img src="ff8c00.png">' +" "+ "Mixed Levels" +'</br>'

    div.style.backgroundColor = "#FAFAFA";
    div.style.padding = 5;
    div.style.opacity = 0.8;

    return div;
};


var mrticon = L.MakiMarkers.icon({icon: "rail", color: "#424242", size: "m"});

var mrtLayer = L.layerGroup().addTo(map);
$.getJSON("./data/mrt-geojson.geojson", function (data) {
    var features = data.features;
    for (var i = 0; i < features.length; i++) {
        var properties = features[i].properties;
        var temp = L.marker([properties.LATITUDE, properties.LONGTITUDE]).bindPopup(properties.STN_NAM);
        temp.setIcon(mrticon);
        mrtLayer.addLayer(temp);
    }

});


//line data
var mrtLayer = L.layerGroup().addTo(map);
$.getJSON("data/mrt-routes-geojson.geojson", function (data) {

    mrtLayer.addLayer(L.geoJson(data,
        {
            style: function(features){
                switch(features.properties.name){
                    case 'North South Line (NS)': return {color: "#DF0101"};
                    case 'MRT East West Line (EW)': return {color: "#04B431"}
                    case 'North East Line (NE)': return {color: "#6A0888"}
                    case 'Circle Line MRT': return {color: "#FF8000"}
                    case 'Circle Line Extension': return {color: "#FF8000"}
                    case 'Downtown Line MRT': return {color: "#0000FF"}
                }
            }
        }
    ));
});

var legendMrt = L.control({position: 'bottomright'});

legendMrt.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML += 
        '<b>Mrt Legend</b><br>' +
        '<img src="red.png">' +" "+ "North South Line (NS)" +'</br>' +
        '<img src="green.png">' +" "+ "East West Line (EW)" + '</br>' +
        '<img src="purple.png">' +" "+ "North East Line (NE)" +'</br>'+
        '<img src="orange.png">' +" "+ "Circle Line (CC)" +'</br>' +
        '<img src="blue.png">' +" "+ "Downtown Line (DT)" +'</br>'
    div.style.backgroundColor = "#FAFAFA";
    div.style.padding = 5;
    div.style.opacity = 0.8;

    return div;
};

legendMrt.addTo(map);

/*var walkingLayer = L.layerGroup().addTo(map);
$.getJSON("./data/walking-path-4326-geojson.geojson", function (data) {

    walkingLayer.addLayer(L.geoJson(data));

});*/

//density map
//Prepare HDB Resale Price density layer
function getHdbColour(d, colorbrewer) {
    var color = ['#800026', '#E31A1C', '#FD8D3C', '#FED976', '#FFEDA0'].reverse();
    return d > 533901.5833 ? color[4] :
        d > 471951.1176 ? color[3] :
            d > 397408.4706 ? color[2] :
                d > 0 ? color[1] : color[0];
}

function hdbStyle(features, colorbrewer) {
    if(colorbrewer) {
        colorbrewer = map.colorbrewer;
    }
    return {
        fillColor: getHdbColour(features.properties.resale_flat_AVERAGE_PRICE, colorbrewer),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
    };
}

var hdbLayer = L.layerGroup().addTo(map);
$.getJSON("./data/resale-flat-map.geojson", function (data) {
    hdbLayer.addLayer(L.geoJson(data, {
        style: hdbStyle,
        onEachFeature: function (features, layer) {
            layer.bindPopup("Area: " + features.properties.DGPZ_NAME + "<br>" +
                "2-Room Flat Average Price: $" + features.properties.resale_flat_2_ROOM + "<br>" +
                "3-Room Flat Average Price: $" + features.properties.resale_flat_3_ROOM + "<br>" +
                "4-Room Flat Average Price: $" + features.properties.resale_flat_4_ROOM + "<br>" +
                "5-Room Flat Average Price: $" + features.properties.resale_flat_5_ROOM + "<br>" +
                "Private Houses Average Price: $" + features.properties.resale_flat_PRIVATE + "<br>" +
                "Average Price: $" + features.properties.resale_flat_AVERAGE_PRICE);
        }
    }).addTo(map));

});


function hdbPropStyle(size) {
    var radius = size / 1000;
    return {
        radius: radius,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    }
}

var flatsOccuipedLayer = L.layerGroup();
$.getJSON("./data/hdb-occupied-prop.geojson", function (data) {

    flatsOccuipedLayer.addLayer(L.geoJson(data,{
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng, hdbPropStyle(features.properties.Proportion));
        }
        

    }));

});



var legendHdb = L.control({position: 'bottomright'});

legendHdb.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    prices = [0, 397408,  471951, 533901],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < prices.length; i++) {
      div.innerHTML =
        "<b>HDB Flats Prices"+'</b></br>'+
        '<img src="FFEDA0.png">' +" "+ "No Data" +'</br>' +
        '<img src="FED976.png">' +" "+"$0 - $397,408" + '</br>' +
        '<img src="FD8D3C.png">' +" "+ "$397,408 - $471,951" +'</br>'+
        '<img src="E31A1C.png">' +" "+ "$471,951 - $533,901" +'</br>'+
        '<img src="800026.png">' +" "+ "$533,901 & Above" +'</br>' 
    }
    div.style.backgroundColor = "#FAFAFA";
    div.style.padding = 5;
    div.style.opacity = 0.8;
    return div;
};

legendHdb.addTo(map);

//need add one base map at init
baseOsm.addTo(map);

var baseMaps = {
    "Detailed": baseOsm,
    "Light": baseLight
}

var overlayMaps = {
    "HDB": hdbLayer,
    "MRT Station": mrtLayer,
    "Schools": schoolsLayer,
    "Flats Occuiped": flatsOccuipedLayer

};


var layerControl = L.control.layers(baseMaps, overlayMaps,
    {
        collapsed: false
    }).addTo(map);

L.control.scale().addTo(map);


//dynamic legend
map.on('overlayremove', function (e) {
    if (e.name == "HDB") {
        this.removeControl(legendHdb);
    } else if (e.name == "Schools") {
        this.removeControl(legendSch);
    }else if (e.name == "MRT Station") {
        this.removeControl(legendMrt);
    }
});
map.on('overlayadd', function (e) {
    if (e.name == "HDB") {
        this.addControl(legendHdb);
    } else if (e.name == "Schools") {
        this.addControl(legendSch);
    }else if (e.name == "MRT Station") {
        this.addControl(legendMrt);
    }
});