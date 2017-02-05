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


var schoolsLayer = L.layerGroup().addTo(map);
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
var walkingLayer = L.layerGroup();
$.getJSON("./data/footpath-geojson.geojson", function (data) {

    walkingLayer.addLayer(L.geoJson(data));

});

//ploygen data
var buildingsLayer = L.layerGroup();
$.getJSON("./data/buildings-geojson.geojson", function (data) {

    buildingsLayer.addLayer(L.geoJson(data));

});

//need add one base map at init
baseOsm.addTo(map);


var baseMaps = {
    "Detailed": baseOsm,
    "Light": baseLight
}

var overlayMaps = {
    "Schools": schoolsLayer,
    "MRT Station": mrtLayer,
    "Walking Path": walkingLayer,
    "HDB Buildings": buildingsLayer

};

var layerControl = L.control.layers(baseMaps, overlayMaps,
    {
        collapsed: false
    }).addTo(map);

L.control.scale().addTo(map);


