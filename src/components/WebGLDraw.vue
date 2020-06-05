<template>
    <div>
        <canvas id="cans" class="cans"></canvas>
    </div>
</template>
<script>
export default {
    name:'WebGLDraw',
    data(){
        return {
            a_Point:[],
            g_Color:[]
        }
    },
    created(){
        
    },
    mounted(){
        this.drawTriangle()
    },
    methods:{
        init(){
            const canvas= document.getElementById('cans')
            const gl=canvas.getContext('experimental-webgl')

            const VSHADER_SOURCE=
                'attribute vec4 a_Position;\n' +
                'void main(){\n' +
                    'gl_Position=a_Position;\n'+
                    'gl_PointSize=5.0;\n'+
                '}'

            const FSHADER_SOURCE=
                'precision mediump float;\n'+
                'uniform vec4 u_FragColor;\n'+
                'void main(){\n'+
                    'gl_FragColor=u_FragColor;\n'+
                '}\n'

            const vShader=this.loaderShader(gl,gl.VERTEX_SHADER,VSHADER_SOURCE)
            const fShader=this.loaderShader(gl,gl.FRAGMENT_SHADER,FSHADER_SOURCE)

            const shaderProgram=gl.createProgram()
            gl.attachShader(shaderProgram,vShader)
            gl.attachShader(shaderProgram,fShader)
            gl.linkProgram(shaderProgram)
            gl.useProgram(shaderProgram)
            const a_Position=gl.getAttribLocation(shaderProgram,'a_Position')
            const u_FragColor=gl.getUniformLocation(shaderProgram,'u_FragColor')
            const self=this
            canvas.onmousedown=function(ev){
                self.clickFunction(ev,gl,canvas,a_Position,u_FragColor)
            }

        },
        loaderShader(gl,type,source){
            const shader =gl.createShader(type)
            gl.shaderSource(shader,source)
            gl.compileShader(shader)
            if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
                gl.deleteShader(shader)
                return null
            }
            return shader
        },

        clickFunction(ev,gl,canvas,a_Position,u_FragColor){
            this.g_Color.push([Math.random(),Math.random(),Math.random(),1.0])
            let x=ev.clientX
            let y=ev.clientY
            x=(x-canvas.clientWidth/2)/(canvas.clientWidth/2)
            y=(canvas.clientHeight/2-y)/(canvas.clientHeight/2)
            this.a_Point.push([x,y])
            gl.clear(gl.COLOR_BUFFER_BIT)
            let length=this.a_Point.length
            for(let i=0;i<length;i++){
                const rgba=this.g_Color[i]
                const point=this.a_Point[i]
                gl.vertexAttrib3f(a_Position,point[0],point[1],0.0)
                gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3])
                gl.drawArrays(gl.POINTS,0,1)
            }
        },
        //绘制三角形
        drawTriangle(){
            const canvas= document.getElementById('cans')
            const gl=canvas.getContext('experimental-webgl')

            const VSHADER_SOURCE=
                'attribute vec4 a_Position;\n' +
                'void main(){\n' +
                    'gl_Position=a_Position;\n'+
                    'gl_PointSize=5.0;\n'+
                '}'

            const FSHADER_SOURCE=
                'void main(){\n'+
                    'gl_FragColor=vec4(1.0,0.0,0.0,1.0);\n'+
                '}\n'

            const vShader=this.loaderShader(gl,gl.VERTEX_SHADER,VSHADER_SOURCE)
            const fShader=this.loaderShader(gl,gl.FRAGMENT_SHADER,FSHADER_SOURCE)

            const shaderProgram=gl.createProgram()
            gl.attachShader(shaderProgram,vShader)
            gl.attachShader(shaderProgram,fShader)
            gl.linkProgram(shaderProgram)
            gl.useProgram(shaderProgram)
            const a_Position=gl.getAttribLocation(shaderProgram,'a_Position')
            const u_FragColor=gl.getUniformLocation(shaderProgram,'u_FragColor')
            this.initVertexBuffer(gl,a_Position)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.drawArrays(gl.LINE_STRIP,0,3)

        },
        initVertexBuffer(gl,a_Position){
            const vertex=new Float32Array([0.0,0.5,-0.5,-0.5,0.5,-0.5])
            const buffer=gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
            gl.bufferData(gl.ARRAY_BUFFER,vertex,gl.STATIC_DRAW)
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0)
            gl.enableVertexAttribArray(a_Position)
        }
    }
}
</script>
<style>
.cans{
    width: 100%;
    height: 100%;
}
</style>