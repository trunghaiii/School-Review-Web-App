
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: schooll.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});



new mapboxgl.Marker()
.setLngLat(schooll.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
          .setHTML(`<h5>${schooll.name}</h5><p>${schooll.location}</p>`)
       
)
.addTo(map);
