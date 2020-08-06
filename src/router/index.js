import Vue from 'vue'
import Router from 'vue-router'
import WebGL from '@/components/WebGL'
import WebGLDraw from '@/components/WebGLDraw'
import Texture from '@/components/Texture'
import Circle from "@/components/Circle"
import Cube from "@/components/cesium/Cube"
import Css from "@/components/css/Css"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/web',
      name: 'WebGL',
      component: WebGL
    },{
      path:'/draw',
      name:'WebGLDraw',
      component: WebGLDraw
    },{
      path:'/texture',
      name:'Texture',
      component:Texture
    },{
      path:'/circle',
      name:'Circle',
      component:Circle
    },{
      path:'/cube',
      name:'Cube',
      component:Cube
    },{
      path:'/css',
      name:'Css',
      component:Css
    }
  ]
})
