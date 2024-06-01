document.addEventListener("DOMContentLoaded", function () {
  fetch("/config")
    .then((response) => response.json())
    .then((data) => {
      mapboxgl.accessToken = data.mapboxToken;
      var mapa = new mapboxgl.Map({
        container: "mapa",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-88.89653, 13.794185], // Coordenadas del centro de El Salvador
        zoom: 9,
      });

      window.registrarEnvio = function () {
        var codigo = document.getElementById("codigo-envio").value;
        var direccionA = document.getElementById("direccion-a").value;
        var direccionB = document.getElementById("direccion-b").value;

        axios
          .post("/register", {
            code: codigo,
            pointAAddress: direccionA,
            pointBAddress: direccionB,
          })
          .then(function (respuesta) {
            var envio = respuesta.data.delivery;
            document.getElementById("resultado").innerHTML = `
              <p>Envío registrado con código: ${envio.code}</p>
              <p>Desde: ${envio.pointAAddress}</p>
              <p>Hasta: ${envio.pointBAddress}</p>
            `;

            var coords = envio.route.coordinates;
            var bounds = coords.reduce(function (bounds, coord) {
              return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coords[0], coords[0]));

            mapa.fitBounds(bounds, {
              padding: 20,
            });

            mapa.addLayer({
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: coords,
                  },
                },
              },
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#888",
                "line-width": 6,
              },
            });

            new mapboxgl.Marker()
              .setLngLat([envio.pointA.longitude, envio.pointA.latitude])
              .addTo(mapa);

            new mapboxgl.Marker()
              .setLngLat([envio.pointB.longitude, envio.pointB.latitude])
              .addTo(mapa);
          })
          .catch(function (error) {
            console.error("Error en el registro del envío", error);
          });
      };
    })
    .catch((error) => {
      console.error("Error al obtener el token de Mapbox:", error);
    });
});
