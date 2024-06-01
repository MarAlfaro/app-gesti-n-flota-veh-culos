const axios = require("axios");

const getRoute = async (start, end) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${process.env.MAPBOX_TOKEN}`;

  try {
    const response = await axios.get(url);
    const route = response.data.routes[0].geometry;
    return route;
  } catch (error) {
    throw new Error("No se puede conectar el servicio");
  }
};

module.exports = getRoute;
