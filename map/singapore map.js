L.Icon.Default.imagePath = "./images";
var map = L.map('map').setView([1.3553, 103.7968], 12);
var boundsSW = L.latLng(1.201023, 103.597500),
    boundsNE = L.latLng(1.490837, 104.067218),
    bounds = L.latLngBounds(boundsSW, boundsNE);
map.setMaxBounds(bounds);


var baseOsm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        subdomain: ['a', 'b', 'c'],
        maxZoom: 17,
        minZoom: 12
    });

var baseLight = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    maxZoom: 17,
    minZoom: 12
});


var iconPri = L.AwesomeMarkers.icon({
    icon: 'fa-graduation-cap',
    markerColor: 'green',
    prefix: 'fa'
});

var iconSec = L.AwesomeMarkers.icon({
    icon: 'fa-graduation-cap',
    markerColor: 'orange',
    prefix: 'fa'
});

var iconJc = L.AwesomeMarkers.icon({
    icon: 'fa-graduation-cap',
    markerColor: 'red',
    prefix: 'fa'
});

var iconOther = L.AwesomeMarkers.icon({
    icon: 'fa-graduation-cap',
    markerColor: 'blue',
    prefix: 'fa'
});


var schAll = L.layerGroup().addTo(map);
$.getJSON("./data/schools.geojson", function (data) {
    var pointArr = data.features;
    for (var i = 0; i < pointArr.length; i++) {
        var prop = pointArr[i].properties;
        var temp = L.marker([prop.lat, prop.lng]).bindPopup(
            prop.all_schools_2015 + "<br>" + prop.address
            + "<br>" + prop.postal);
        if (prop.school_type.indexOf("Primary") > -1) {
            temp.setIcon(iconPri);
            
        } else if (prop.school_type.indexOf("Secondary") > -1) {
            temp.setIcon(iconSec);
            
        } else if (prop.school_type.indexOf("Junior") > -1) {
            temp.setIcon(iconJc);
            
        } else {
            temp.setIcon(iconOther);
            
        }
        schAll.addLayer(temp);
    }
});


//Prepare people aged 5 to 19 (potential students) density layer
function getStudentColour(d, colorbrewer) {
    var color;
    switch (colorbrewer) {
        case 'YlGn':
            color = ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"];
            break;
        case 'PuRd':
            color = ["#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"];
            break;
        case 'Spectral':
            color = ["#d7191c", "#fdae61", "#ffffbf", "#abdda4", "#2b83ba"].reverse();
            break;
        case 'Pastel':
            color = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6"].reverse();
            break;
        default:
            color = ['#800026', '#E31A1C', '#FD8D3C', '#FED976', '#FFEDA0'].reverse();
            break;
    }
    return d > 13800 ? color[4] :
        d > 6950 ? color[3] :
            d > 3390 ? color[2] :
                d > 1100 ? color[1] : color[0];
}

function studentStyle(feature, colorbrewer) {
    if(colorbrewer) {
        colorbrewer = map.colorbrewer;
    }
    return {
        fillColor: getStudentColour(feature.properties.total_students, colorbrewer),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


var schLayer = L.layerGroup().addTo(map);
$.getJSON("./data/students.geojson", function (data) {
    schLayer.addLayer(L.geoJson(data, {
        style: studentStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.description + "<br>" +
                "Youth: " + feature.properties.total_students);
        }
    }).addTo(map));

});

function schPropStyle(size) {
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

var schPropLayer = L.layerGroup();
$.getJSON("./data/studentProp.geojson", function (data) {

    schPropLayer.addLayer(L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, schPropStyle(feature.properties.total_stu));
        }
    }));

});

var mrtLayer = L.layerGroup();
$.getJSON("./data/mrt.geojson", function (data) {

    mrtLayer.addLayer(L.geoJson(data));

});


//need add one base map at init
baseOsm.addTo(map);

var baseMaps = {
    "Detailed": baseOsm,
    "Light": baseLight
}

var overlayMaps = {
    
    "Schools": schAll,
    "Youth (Age: 5 - 19)": schLayer,
    "Youth Proportion": schPropLayer,
    "MRT Line": mrtLayer

};


var layerControl = L.control.layers(baseMaps, overlayMaps,
    {
        collapsed: false
    }).addTo(map);

L.control.scale().addTo(map);

new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    showMarker: true,
    retainZoomLevel: true
}).addTo(map);

L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
var fileControl = L.Control.fileLayerLoad({
    // See http://leafletjs.com/reference.html#geojson-options
    layerOptions: {style: {color: 'red'}},
    // Add to map after loading (default: true) 
    addToMap: true,
    // File size limit in kb (default: 1024) 
    fileSizeLimit: 1024,
    // Restrict accepted file formats (default: .geojson, .kml, and .gpx) 
    formats: [
        '.geojson',
        '.kml',
        '.gpx'
    ]
}).addTo(map);
fileControl.loader.on('data:loaded', function (e) {
    layerControl.addOverlay(e.layer, e.filename);
});

var legendStu = L.control({position: 'bottomright'});

legendStu.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        population = [0, 1100, 3390, 6950, 13800],
        labels = [];
    div.innerHTML += '<b>No. of Youth (age 5-19)</b><br>';

   
    for (var i = 0; i < population.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getStudentColour(population[i] + 1, map.colorbrewer) + '"></i> ' +
            population[i] + (population[i + 1] ? '&ndash;' + population[i + 1] + '<br>' : '+');
    }

    return div;
};

legendStu.addTo(map);

var legendSch = L.control({position: 'bottomright'});

legendSch.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML += '<b>School Legend</b><br>' +
        '<i style="background:#669933;"></i>Primary<br>' +
        '<i style="background:#ff9933;"></i>Secondary<br>' +
        '<i style="background:#cc3333;"></i>Junior College<br>' +
        '<i style="background:#3399cc;"></i>Mixed Levels';
    return div;
};

legendSch.addTo(map);

//dynamic legend
map.on('overlayremove', function (e) {
    if (e.name == "Youth (Age: 5 - 19)") {
        this.removeControl(legendStu);
    } else if (e.name == "Schools") {
        this.removeControl(legendSch);
    }
});
map.on('overlayadd', function (e) {
    if (e.name == "Youth (Age: 5 - 19)") {
        this.addControl(legendStu);
    } else if (e.name == "Schools") {
        this.addControl(legendSch);
    }
});

//change color
function changeStyle(colorbrewer) {

    map.colorbrewer = colorbrewer;
    schLayer.getLayers()[0].eachLayer(function (layer) {
        layer.setStyle(studentStyle(layer.feature, colorbrewer));
    });
    try {
        map.removeControl(legendStu);
        map.addControl(legendStu);
    } catch (DOMException){}
}

var colorChanger = L.control({position: 'topright'});

colorChanger.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML += '<b>Colour palette selection</b><br>' +
        '<select id="selectedCol" onchange="changeStyle(this.value)">' +
        '<option value="default">default</option>' +
        '<option value="YlGn">YlGn</option>' +
        '<option value="Pastel">Pastel</option>' +
        '<option value="Spectral">Spectral</option>' +
        '<option value="PuRd">PuRd</option>' +
        '</select>';
    return div;
};

colorChanger.addTo(map);
