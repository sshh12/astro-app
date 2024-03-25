const ENDPOINT = "https://alasky.cds.unistra.fr/hips-image-services/hips2fits";

export default function SkySurveyImage({
  object,
  hips,
  width,
  height,
  fov = 1.0,
  style = {},
}) {
  return (
    <img
      style={{ width: "100%", ...style }}
      src={`${ENDPOINT}?hips=${hips}&width=${width}&height=${height}&fov=${fov}&projection=TAN&coordsys=icrs&rotation_angle=0.0&ra=${
        object.ra * 15
      }&dec=${object.dec}&format=jpg`}
      alt="Astro image"
      crossorigin="anonymous"
    />
  );
}
