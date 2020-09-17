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
    // Define variables for our tile layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": light,
        "Dark Map": dark
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
        layers: [light, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            mag = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>";

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < mag.length; i++) {
            div.innerHTML +=
                '<div class="color-box" style="background-color:' + getcolor(mag[i] + 1) + ';"></div> ' +
                mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);
}

// function for color
function getcolor(magnitude) {
    if (magnitude > 5) {
        return '#FF0000'
    } else if (magnitude > 4) {
        return '#FC4E2A'
    } else if (magnitude > 3) {
        return '#FD8D3C'
    } else if (magnitude > 2) {
        return '#FED976'
    } else if (magnitude > 1) {
        return '#9ACD32'
    } else {
        return '#ADFF2F'
    }
};

// function for radius
function getradius(magnitude) {
    return magnitude * 14500;
};