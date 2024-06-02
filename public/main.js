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
      getFlotas();

      function getFlotas() {
        axios
          .get("/flotas")
          .then(function (respuesta) {
            const flotas = respuesta.data;

            flotas.forEach((flota) => {
              const el = document.createElement("div");
              el.className = "marker";
              const popupContent = `
                <p>Id: <strong>${flota.id}</strong></p>
                <p>Porcentaje de gasolina: <strong>${
                  flota.gasoline_level_parcentage
                }%</strong></p>
                <p>Velocidad promedio: <strong>${
                  flota.speedKm_average
                }km/h</strong></p>
                <p>Estado: <strong>${flota.state}</strong></p>
                <p>Total kilometraje: <strong>${flota.totalKm}km</strong></p>
                <p>Fecha: <strong>${new Date(
                  flota.date
                ).toLocaleDateString()}</strong></p>
              `;

              new mapboxgl.Marker(el)
                .setLngLat([flota.longitude, flota.latitude])
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent)
                )
                .addTo(mapa);
            });
          })
          .catch(function (error) {
            console.error("Error en el registro del envío", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error al obtener el token de Mapbox:", error);
    });
});
