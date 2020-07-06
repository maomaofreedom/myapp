<template>
  <div id="cons">
  </div>
</template>

<script>
    export default {
        name: "Texture",
        data(){
            return {
                width:500,
                height:500,
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
                 * 这个解决绘制出来的图形边界模糊的问题
                 */
                const canvas = document.createElement('canvas')
                canvas.width = this.width * this.scaleFactor
                canvas.height = this.height * this.scaleFactor
                canvas.style.width = this.width + 'px'
                canvas.style.height = this.height + 'px'
                var gl=canvas.getContext('webgl',{ alpha:true,antialias: true, depth:true})
                document.getElementById("cons").appendChild(canvas);

                // vertex shader
                var VERTEX_SHADER_SOURCE =
                    'attribute vec4 a_Position;\n' +
                    'void main() {\n' +
                    '   gl_Position = a_Position;\n' +
                    '}\n';

                // fragment shader
                var FRAGMENT_SHADER_SOURCE =
                    'void main() {\n' +
                    '   gl_FragColor = vec4(0.2,1.0,1.0,1.0);\n' +
                    '}\n';
                if (!this.initShaderProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)) {
                    alert('Failed to init shaders');
                }


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

                    vertexData.push(x1, y1,x2,y2);
                }

                var vertices = new Float32Array(vertexData);
                this.initVertexBuffers(gl, vertices);

                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.LINES, 0, vertices.length / 2);


            },
            initVertexBuffers(gl,vertices) {
                var vertexBuffer = gl.createBuffer();
                if (!vertexBuffer) {
                    console.log('Failed to create buffer object');
                    return -1;
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

                var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

                gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
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

                return true;
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
