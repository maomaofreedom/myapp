import Vue from 'vue'
import Router from 'vue-router'
import WebGL from '@/components/WebGL'
import WebGLDraw from '@/components/WebGLDraw'
import Texture from '@/components/Texture'


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
    }
  ]
})
