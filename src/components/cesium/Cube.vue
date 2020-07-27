<template>
  <div id="view">
  </div>
</template>

<script>
    const Cesium = require('cesium/Cesium')
    import widgets from 'cesium/Widgets/widgets.css';
    export default {
        name: "CUBE",
        data(){
            return {
            }
        },
        mounted() {
            this.main()
        },
        created() {

        },
        methods: {
            main() {
            var viewer = new Cesium.Viewer("view",{
              //加载在线谷歌地图
              imageryProvider: new Cesium.UrlTemplateImageryProvider({
                 url:"http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}"
              })
            })
            }
        }
    }

</script>

<style scoped>
  .cans {
    width: 100%;
    height: 100%;
  }
</style>
