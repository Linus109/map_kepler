import KeplerGl from "@kepler.gl/components";

const KeplerMap = (props) => (
  <KeplerGl
    mapboxApiAccessToken="not-needed-for-maptiler"
    mapStyles={props.mapStyles}
    mapStylesReplaceDefault={true}
    id="map"
    width={props.width}
    height={props.height}
  />
);

export default KeplerMap;
