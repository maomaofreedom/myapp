<template>
  <div>
    <div id="map" class="map">
    </div>
  </div>
</template>

<script>
    import 'ol/ol.css';
    import Feature from 'ol/Feature';
    import Map from 'ol/Map';
    import Point from 'ol/geom/Point';
    import OSM from 'ol/source/OSM';
    import VectorSource from 'ol/source/Vector';
    import View from 'ol/View';
    import {Icon, Style} from 'ol/style';
    import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
    export default {
        name: "Fan",
        data(){
            return{

            }
        },
        created() {
        },
        mounted() {
            this.init()
        },
        methods:{
            init(){
                let iconFeature = new Feature({
                    geometry: new Point([0, 0]),
                    name: 'Null Island',
                    population: 4000,
                    rainfall: 500,
                });

                let iconStyle = new Style({
                    image: new Icon({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://openlayers.org/en/latest/examples/data/icon.png',
                    }),
                });

                iconFeature.setStyle(iconStyle);

                let vectorSource = new VectorSource({
                    features: [iconFeature],
                });

                let vectorLayer = new VectorLayer({
                    source: vectorSource,
                });

                let rasterLayer = new TileLayer({
                    source: new OSM()
                });

                let map = new Map({
                    layers: [rasterLayer, vectorLayer],
                    target: document.getElementById('map'),
                    view: new View({
                        center: [0, 0],
                        zoom: 3,
                    }),
                });
            }
        }
    }
</script>

<style scoped>
  .map {
    width: 100%;
    height: 800px;
  }
</style>
