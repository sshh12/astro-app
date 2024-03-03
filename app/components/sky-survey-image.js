const ENDPOINT = "https://alasky.cds.unistra.fr/hips-image-services/hips2fits";

export default function SkySurveyImage({
  object,
  hips,
  fov = 1.0,
  aspectRatio = 1.0,
}) {
  const width = 1000;
  const height = Math.floor(width / aspectRatio);
  return (
    <img
      style={{ width: "100%" }}
      src={`${ENDPOINT}?hips=${hips}&width=${width}&height=${height}&fov=${fov}&projection=TAN&coordsys=icrs&rotation_angle=0.0&ra=${
        object.ra * 15
      }&dec=${object.dec}&format=jpg`}
      alt="Astro image"
    />
  );
}