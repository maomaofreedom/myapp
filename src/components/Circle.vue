<template>
  <div id="cons">
  </div>
</template>

<script>
     import {Mat4, Vec4, Vec3, Vec2} from "cuon-matrix-ts"
    // import Matrix4 from "gl-matrix"
    export default {
        name: "Texture",
        data(){
            return {
                width:400,
                height:400,
                scaleFactor:1
            }
        },
        mounted() {
            this.main()
        },
        created() {

        },
        methods: {
            main() {
                /**
                 * 这个解决绘制出来的图形边界模糊的问题,在mac的高分屏下依然不完美
                 */
                const canvas = document.createElement('canvas')
                canvas.width = this.width * this.scaleFactor
                canvas.height = this.height * this.scaleFactor
                canvas.style.width = this.width + 'px'
                canvas.style.height = this.height + 'px'
                var gl=canvas.getContext('webgl',{ alpha:true,antialias: true, depth:true})
                document.getElementById("cons").appendChild(canvas);


                // vertex shader
                var VERTEX_SHADER_SOURCE1 =
                    'attribute vec4 a_Position1;\n' +
                    'uniform mat4 u_ModelMatrix;\n'+
                    'void main() {\n' +
                    '   gl_Position = u_ModelMatrix * a_Position1;\n' +
                    '}\n';

                // fragment shader
                var FRAGMENT_SHADER_SOURCE1 =
                    'void main() {\n' +
                    '   gl_FragColor = vec4(1.0,1.0,1.0,1.0);\n' +
                    '}\n';

                // vertex shader
                var VERTEX_SHADER_SOURCE2 =
                    'attribute vec4 a_Position2;\n' +
                    'uniform mat4 u_ModelMatrix2;\n'+
                    'void main() {\n' +
                    '   gl_Position = u_ModelMatrix2 * a_Position2;\n' +
                    '}\n';

                // fragment shader
                var FRAGMENT_SHADER_SOURCE2 =
                    'void main() {\n' +
                    '   gl_FragColor = vec4(0.2,0.8,1.0,1.0);\n' +
                    '}\n';

                var N = 60;
                var vertexData = [];
                var r1 = 0.5;
                var r2= 0.45
                for (var i = 0; i <= N; i++) {
                    var theta = i * 1.5 * Math.PI / N;
                    var x1 = r1 * Math.sin(theta);
                    var y1 = r1 * Math.cos(theta);
                    var x2 = r2 * Math.sin(theta);
                    var y2= r2 * Math.cos(theta);
                    vertexData.push(x1, y1,0.0,x2,y2,0.0);
                }
                var vertices = new Float32Array(vertexData);

                var vertexLineData = [];
                var NNN = 100;
                var rl = 0.55;
                for (var i = 0; i <= NNN; i++) {
                    var theta = i * 2 * Math.PI / NNN;
                    var xl = rl * Math.sin(theta);
                    var yl = rl * Math.cos(theta);
                    vertexLineData.push(xl, yl,0.0);
                }
                var arra=vertexLineData.slice(60)
                var verticesLine = new Float32Array(arra);

                var vertexAngData = [];
                var NN = 40;
                var ra = 0.4;
                vertexAngData.push(0.0,0.0,0.0)
                for (var i = 20; i <= NN; i++) {
                    var theta = i * 0.5 * Math.PI / NN;
                    var x1 = ra * Math.sin(theta);
                    var y1 = ra * Math.cos(theta);
                    vertexAngData.push(x1, y1,0.0);
                }
                var verticesAng = new Float32Array(vertexAngData);
                
                /**
                 * 绘制虚化的背景
                 */
                var vtBackGround=
                '#version 100\n'+
                'precision highp float;\n'+
                'attribute vec3 position;\n'+
                'void main() {\n'+
                    'gl_Position = vec4(position, 1.0);\n'+
                    'gl_PointSize = 256.0;\n'+
                '}\n';

                var fgBackGround=
                '#version 100\n'+
                'precision mediump float;\n'+
                'void main() {\n'+
                    'vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;\n'+
                    'float distance = length(fragmentPosition);\n'+
                    'float distanceSqrd = distance * distance;\n'+
                    'gl_FragColor = vec4(0.2/distanceSqrd,0.1/distanceSqrd,0.0, 1.0 );\n'+
                '}\n';


                var angle1=0;
                var angle2=360;

                setInterval(()=>{
                    angle2-=1;
                    if(angle2==0){
                        angle2=360;
                    }
                    angle1+=2;
                    if(angle1>360){
                        angle1=0;
                    }
                    var matrix=new Mat4();
                    matrix.setRotate(angle1,0,0,1);

                    var matrix2=new Mat4();
                    matrix2.setRotate(angle2,0,0,1);

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    var programBack=this.initShaderProgram(gl,vtBackGround,fgBackGround);
                    var verticesBack = new Float32Array([0,0,0]);
                    this.initVertexBuffers(gl,verticesBack,programBack,'position');
                    gl.drawArrays(gl.POINTS, 0, 1);

                    var program1=this.initShaderProgram(gl, VERTEX_SHADER_SOURCE1, FRAGMENT_SHADER_SOURCE1);
                    var u_ModelMatrix=gl.getUniformLocation(program1,'u_ModelMatrix');
                    gl.uniformMatrix4fv(u_ModelMatrix,false,matrix.elements);
                    this.initVertexBuffers(gl, vertices,program1,'a_Position1');
                    gl.drawArrays(gl.LINES, 0, vertices.length / 3);

                    this.initVertexBuffers(gl, verticesLine,program1,'a_Position1');
                    gl.drawArrays(gl.LINE_STRIP, 0, verticesLine.length / 3);

                    var program2=this.initShaderProgram(gl, VERTEX_SHADER_SOURCE2, FRAGMENT_SHADER_SOURCE2);
                    var u_ModelMatrix2=gl.getUniformLocation(program2,'u_ModelMatrix2');
                    gl.uniformMatrix4fv(u_ModelMatrix2,false,matrix2.elements);

                    this.initVertexBuffers(gl, verticesAng,program2,'a_Position2');
                    gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesAng.length / 3);
                },30);
            },
            initVertexBuffers(gl,vertices,program,position) {
                var vertexBuffer = gl.createBuffer();
                if (!vertexBuffer) {
                    console.log('Failed to create buffer object');
                    return -1;
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

                var a_Position = gl.getAttribLocation(program, position);

                gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(a_Position);
            },
            //
            // Initialize a shader program, so WebGL knows how to draw our data
            //
            initShaderProgram(gl, vsSource, fsSource) {
                var program = this.createProgram(gl, vsSource, fsSource);
                if (!program) {
                    console.log('Failed to create program');
                    return false;
                }

                gl.useProgram(program);
                gl.program = program;

                return program;
            },

            //
            // creates a shader of the given type, uploads the source and
            // compiles it.
            //
            loadShader(gl, type, source) {
                // create shader object
                var shader = gl.createShader(type);
                if (shader == null) {
                    console.log('unable to create shader');
                    return null;
                }

                // set shader source code
                gl.shaderSource(shader, source);

                // compile the shader
                gl.compileShader(shader);

                // check compile status
                var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
                if (!compiled) {
                    var error = gl.getShaderInfoLog(shader);
                    console.log('Failed to compile shader: ' + error);
                    return null;
                }

                return shader;
            },
            createProgram(gl, vertexShaderSource, fragmentShaderSource) {
                var vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
                var fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
                if (!vertexShader || !fragmentShader) {
                    return null;
                }

                // create a program object
                var program = gl.createProgram();
                if (!program) {
                    console.log('gl.createProgram failed');
                    return null;
                }

                // attach  the shader objects
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);

                // link the program object
                gl.linkProgram(program);

                // check link status
                var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
                if (!linked) {
                    var error = gl.getProgramInfoLog(program);
                    console.log('Failed to link program: ' + error);
                    gl.deleteProgram(program);
                    gl.deleteShader(vertexShader);
                    gl.deleteShader(fragmentShader);
                    return null;
                }

                return program;
            }

        }
    }

</script>

<style scoped>
  .cans {
    width: 500px;
    height: 500px;
  }
</style>
