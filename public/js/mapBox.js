
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic25qdjkiLCJhIjoiY2xyenlhaW9sMXhmODJqbmF1ODhueHNmcyJ9.vkbu_5sN427rkial-_uv-Q';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/snjv9/clrzzmeq800eb01phherz2waq',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach(loc => {
        //Create Marker
        const el = document.createElement('div')
        el.className = 'marker'
        //Add the Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map)

        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)

        //Extend the bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100

        }
    })
}
