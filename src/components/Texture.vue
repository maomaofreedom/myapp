<template>
  <div>
    <canvas id="cans" class="cans"></canvas>
  </div>
</template>

<script>
    import {mat4} from "gl-matrix"
    export default {
        name: "Texture",
        mounted() {
            this.main()
        },
        created() {

        },
        methods: {
            main() {
                const canvas = document.getElementById('cans');
                const gl = canvas.getContext('webgl');

                // If we don't have a GL context, give up now
                if (!gl) {
                    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
                    return;
                }
                const vsSource = 
                    'attribute vec4 a_Position;\n' +
                    'attribute vec2 a_TexCoord;\n' +
                    'varying vec2 v_TexCoord;\n' +
                    'void main() {\n' +
                    '  gl_Position = a_Position;\n' +
                    '  v_TexCoord = a_TexCoord;\n' +
                    '}\n';

                // Fragment shader program
                const fsSource = 
                    '#ifdef GL_ES\n' +
                    'precision mediump float;\n' +
                    '#endif\n' +
                    'uniform sampler2D u_Sampler;\n' +
                    'varying vec2 v_TexCoord;\n' +
                    'void main() {\n' +
                    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
                    '}\n';
                const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);
                gl.useProgram(shaderProgram);
                const n = this.initVertexBuffers(gl,shaderProgram);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                this.initTextures(gl,n,shaderProgram);
            },
            initTextures(gl,n,shaderProgram){
                const texture=gl.createTexture();
                var u_Sampler = gl.getUniformLocation(shaderProgram, 'u_Sampler');
                let image=new Image();
                const self=this;
                image.onload=function(){
                    self.loadTexture(gl,n,texture,u_Sampler,image);
                };
                image.src="./static/tile.png";
                return true;

            },
            initVertexBuffers(gl,shaderProgram) {
                let vertexTexCoords=new Float32Array([
                    -0.25,0.5,0.0,1.0,
                    -0.25,-0.5,0.0,0.0,
                    0.25,0.5,1.0,1.0,
                    0.25,-0.5,1.0,0.0
                ]);
                let n=4;
                const vertexTexCoordBuffer=gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer)
                gl.bufferData(gl.ARRAY_BUFFER,vertexTexCoords,gl.STATIC_DRAW);
                const FSIZE=vertexTexCoords.BYTES_PER_ELEMENT;
                const a_Position=gl.getAttribLocation(shaderProgram,'a_Position')
                gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
                gl.enableVertexAttribArray(a_Position);
                const a_TexCoord=gl.getAttribLocation(shaderProgram,'a_TexCoord');
                gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
                gl.enableVertexAttribArray(a_TexCoord);
                return n;
            },
            //
            // Initialize a shader program, so WebGL knows how to draw our data
            //
            initShaderProgram(gl, vsSource, fsSource) {
                const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
                const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

                // Create the shader program

                const shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                // If creating the shader program failed, alert

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                    return null;
                }
                return shaderProgram;
            },

            //
            // creates a shader of the given type, uploads the source and
            // compiles it.
            //
            loadShader(gl, type, source) {
                const shader = gl.createShader(type);

                // Send the source to the shader object
                gl.shaderSource(shader, source);

                // Compile the shader program
                gl.compileShader(shader);

                // See if it compiled successfully
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            },
            loadTexture(gl,n,texture,u_Sampler,image){
                 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
                // Enable texture unit0
                gl.activeTexture(gl.TEXTURE0);
                // Bind the texture object to the target
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // Set the texture parameters
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                // Set the texture image
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                
                // Set the texture unit 0 to the sampler
                gl.uniform1i(u_Sampler, 0);
                
                gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
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
