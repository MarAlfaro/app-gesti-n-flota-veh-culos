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
      getFlotas(mapa);
    })
    .catch((error) => {
      console.error("Error al obtener el token de Mapbox:", error);
    });

  document.getElementById("flotaForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("flotaId").value;
    const state = document.getElementById("state").value;
    const location = document.getElementById("location").value;
    const gasoline_level_parcentage = document.getElementById("gasoline_level_parcentage").value;
    const speedKm_average = document.getElementById("speedKm_average").value;
    const totalKm = document.getElementById("totalKm").value;

    const flotaData = {
      state,
      location,
      gasoline_level_parcentage,
      speedKm_average,
      totalKm,
    };

    if (id) {
      // Actualizar flota
      axios.put(`/update/${id}`, flotaData)
        .then(response => {
          alert("Flota actualizada con éxito");
          location.reload();
        })
        .catch(error => {
          console.error("Error actualizando la flota:", error);
        });
    } else {
      // Registrar nueva flota
      axios.post("/register", flotaData)
        .then(response => {
          alert("Flota registrada con éxito");
          location.reload();
        })
        .catch(error => {
          console.error("Error registrando la flota:", error);
        });
    }
  });
});

function getFlotas(mapa) {
  axios.get("/flotas")
    .then(function (respuesta) {
      const flotas = respuesta.data;

      flotas.forEach((flota) => {
        const el = document.createElement("div");
        el.className = "marker";
        const popupContent = `
          <div class="location">
            <p>Ubicación</p>
            <p><strong>${flota.location}</strong></p>
          </div>
          <div class="performance">
            <p>Rendimiento</p>
            <p>Id:<strong>${flota.id}</strong></p>
            <p>Estado:<strong>${flota.state}</strong></p>
            <p>Porcentaje de gasolina:<strong>${flota.gasoline_level_parcentage}%</strong></p>
            <p>Velocidad promedio:<strong>${flota.speedKm_average}km/h</strong></p>
            <p>Total kilometraje:<strong>${flota.totalKm}km</strong></p>
            <p>Fecha:<strong>${new Date(flota.date).toLocaleDateString()}</strong></p>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([flota.longitude, flota.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(mapa);

        marker.getElement().addEventListener('click', function () {
          document.getElementById("flotaId").value = flota.id;
          document.getElementById("state").value = flota.state;
          document.getElementById("location").value = flota.location;
          document.getElementById("gasoline_level_parcentage").value = flota.gasoline_level_parcentage;
          document.getElementById("speedKm_average").value = flota.speedKm_average;
          document.getElementById("totalKm").value = flota.totalKm;
        });
      });
    })
    .catch(function (error) {
      console.error("Error obteniendo las flotas", error);
    });
}
