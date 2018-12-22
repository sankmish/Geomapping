var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

d3.json(url, function(data) {
  plotMap(data.features);
});

function plotMap(earthquake) {

  function onEachFeature(feature, layer) {

    layer.bindPopup("<h3>" + feature.properties.mag + " Magnitude Earthquake at " + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    };

  function setColor(mag){
    return  mag > 7.5 ? '#f90401' : 
            mag > 7.0 ? '#eb1c0f' :
            mag > 6.5 ? '#de341e' :
            mag > 6.0 ? '#d14c2d' :
            mag > 5.5 ? '#c4643c' :
            mag > 5.0 ? '#b77c4b' :
            mag > 4.5 ? '#aa945a' :
            mag > 4.0 ? '#9dac69' :
            mag > 3.5 ? '#90c478' :
            mag > 3.0 ? '#83dc87' :
                        '#76f496' ;
    }

  var earthquakeData = L.geoJSON(earthquake, {
    onEachFeature: onEachFeature, 
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng, {
            radius: Math.pow(1.8, feature.properties.mag), 
            fillColor: setColor(feature.properties.mag),
            fillOpacity: 0.8,
            stroke: 0
        });
    }
  });

  createMap(earthquakeData);
}

function createMap(earthquakeData) {

  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  });

  var outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

   var streetsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoors Map": outdoorMap,
    "Street Map": streetsMap,
    "Light Map": lightMap,
    "Dark Map": darkMap
  };

  var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

  var plateLayer = new L.LayerGroup()

  d3.json(tectonicPlatesUrl, function(data) {
    L.geoJSON(data, {
      style: {
        fillOpacity:0
      },
      panes: "lines"
    }).addTo(plateLayer);
  });

  var overlayMaps = {
    "Earthquakes": earthquakeData,
    "Tectonic Plates": plateLayer
  };

  var myMap = L.map("map", {
    center: [
        0, 0
    ],
    zoom: 2,
    layers: [satelliteMap, earthquakeData]
  });

  myMap.on('click', function(event){
            myMap.fitBounds(event.target.getBounds());
        }
);

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [3.0,3.5,4.0,4.5,5.0,5.5,6.0,6.5,7.0,7.5];

    var colors = ['#76f496','#83dc87','#90c478','#9dac69','#aa945a','#b77c4b','#c4643c','#d14c2d','#d9f730','#de341e','#eb1c0f'];
    var labels = [];

    var legendHover = "<h1>Earthquake Magnitude</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendHover;

    limits.forEach(function(index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  legend.addTo(myMap);

}