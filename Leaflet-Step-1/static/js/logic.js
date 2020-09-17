var queryurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryurl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

    // Give each feature a popup describing the place and time of the earthquake
    function oneachfeature(feature, layer) {
        layer.bindPopup("<h3>"+feature.properties.place+
        "</h3><hr><p>Magnitude: "+feature.properties.mag+"</p><p>"+
        new Date(feature.properties.time) + "</p>");
    }

    function pointtolayer(feature, latlng) {
        return new L.circle(latlng,
            {
            radius: getradius(feature.properties.mag),
            fillColor: getcolor(feature.properties.mag),
            fillOpacity: 0.9,
            color: "black",
            weight: 1
        })
    }

  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: oneachfeature,
    pointToLayer: pointtolayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);

    // create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(map);
}

// function for color
function getcolor(magnitude) {
    if (magnitude > 5) {
        return '#E31A1C'
    } else if (magnitude > 4) {
        return '#FC4E2A'
    } else if (magnitude > 3) {
        return '#FD8D3C'
    } else if (magnitude > 2) {
        return '#FED976'
    } else if (magnitude > 1) {
        return 'lightgreen'
    } else {
        return 'green'
    }
};

// function for radius
function getradius(magnitude) {
    return magnitude * 14500;
};

