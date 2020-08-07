<template>
  <div>
    <canvas id="cans" class="cans"></canvas>
  </div>
</template>

<script>
    import {mat4} from "gl-matrix"
    export default {
        name: "Texture",
        data() {
            return {
                gl: null,
                canvas: null,
                pwgl: {
                    ongoingImageLoads: []
                },
                vsShader:
                    `attribute vec3 aVertexPosition;
                    attribute vec2 aTextureCoordinates;
                    uniform mat4 uMVMatrix;
                    uniform mat4 uPMatrix;
                    varying vec2 vTextureCoordinates;
                    void main() {
                        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
                        vTextureCoordinates = aTextureCoordinates;
                    }`,
                fsShader:
                    `precision mediump float;
                    varying vec2 vTextureCoordinates;
                    uniform sampler2D uSampler;
                    void main() {
                        gl_FragColor = texture2D(uSampler, vTextureCoordinates);
                   }`
            }
        },
        mounted() {
            this.startup()
        },
        created() {

        },
        methods: {
            createGLContext(canvas) {
                var names = ["webgl", "experimental-webgl"];
                var context = null;
                for (var i = 0; i < names.length; i++) {
                    try {
                        context = canvas.getContext(names[i]);
                    } catch (e) {
                    }
                    if (context) {
                        break;
                    }
                }
                if (context) {
                    // 添加动态属性记录画布的大小
                    context.viewportWidth = canvas.width;
                    context.viewportHeight = canvas.height;
                } else {
                    alert("Failed to create WebGL context!");
                }
                return context;
            },
            setupShaders() {
                // 从 DOM 上创建对应的着色器
                var vertexShader = this.loadShader(this.vsShader,this.gl.VERTEX_SHADER);
                var fragmentShader = this.loadShader(this.fsShader,this.gl.FRAGMENT_SHADER);

                // 创建程序并连接着色器
                let shaderProgram = this.gl.createProgram();
                this.gl.attachShader(shaderProgram, vertexShader);
                this.gl.attachShader(shaderProgram, fragmentShader);
                this.gl.linkProgram(shaderProgram);

                // 连接失败的检测
                if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
                    alert("Failed to setup shaders");
                }

                // 使用着色器
                this.gl.useProgram(shaderProgram);

                // 获取属性位置
                this.pwgl.vertexPositionAttributeLoc = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
                this.pwgl.vertexTextureAttributeLoc = this.gl.getAttribLocation(shaderProgram, "aTextureCoordinates");
                this.pwgl.uniformMVMatrixLoc = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");
                this.pwgl.uniformProjMatrixLoc = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
                this.pwgl.uniformSamplerLoc = this.gl.getUniformLocation(shaderProgram, "uSampler");

                // 设定为数组类型的变量数据
                this.gl.enableVertexAttribArray(this.pwgl.vertexPositionAttributeLoc);
                this.gl.enableVertexAttribArray(this.pwgl.vertexTextureAttributeLoc);

                // 初始化矩阵
                this.pwgl.modelViewMatrix = mat4;
                this.pwgl.projectionMatrix = mat4;
                this.pwgl.modelViewMatrixStack = [];
            },
            loadShader(shaderSource,type) {
                // 创建着色器
                var shader = this.gl.createShader(type);
                // 编译着色器
                this.gl.shaderSource(shader, shaderSource);
                this.gl.compileShader(shader);

                // 判断编译是否成功
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    alert(this.gl.getShaderInfoLog(shader));
                    return null;
                }
                return shader;
            },
            setupBuffers() {
                this.setupFloorBuffers();
                this.setupCubeBuffers();
            },
            setupFloorBuffers() {
                // 顶点数据
                this.pwgl.floorVertexPositionBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.floorVertexPositionBuffer);
                var floorVertexPosition = [
                    // Plane in y=0
                    5.0, 0.0, 5.0,      //v0
                    5.0, 0.0, -5.0,     //v1
                    -5.0, 0.0, -5.0,    //v2
                    -5.0, 0.0, 5.0];    //v3

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition), this.gl.STATIC_DRAW);

                this.pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE = 3;
                this.pwgl.FLOOR_VERTEX_POS_BUF_NUM_ITEMS = 4;

                // uv 数据
                this.pwgl.floorVertexTextureCoordinateBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.floorVertexTextureCoordinateBuffer);
                var floorVertexTextureCoordinates = [
                    2.0, 0.0,
                    2.0, 2.0,
                    0.0, 2.0,
                    0.0, 0.0
                ];

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(floorVertexTextureCoordinates), this.gl.STATIC_DRAW);

                this.pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
                this.pwgl.FLOOR_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 4;

                // 索引数据
                this.pwgl.floorVertexIndexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.pwgl.floorVertexIndexBuffer);
                var floorVertexIndices = [0, 1, 2, 3];

                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), this.gl.STATIC_DRAW);

                this.pwgl.FLOOR_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
                this.pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS = 4;
            },
            setupCubeBuffers() {
                // 顶点数据
                this.pwgl.cubeVertexPositionBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.cubeVertexPositionBuffer);

                var cubeVertexPosition = [
                    // Front face
                    1.0, 1.0, 1.0,      //v0
                    -1.0, 1.0, 1.0,     //v1
                    -1.0, -1.0, 1.0,    //v2
                    1.0, -1.0, 1.0,     //v3

                    // Back face
                    1.0, 1.0, -1.0,     //v4
                    -1.0, 1.0, -1.0,    //v5
                    -1.0, -1.0, -1.0,   //v6
                    1.0, -1.0, -1.0,    //v7

                    // Left face
                    -1.0, 1.0, 1.0,     //v8
                    -1.0, 1.0, -1.0,    //v9
                    -1.0, -1.0, -1.0,   //v10
                    -1.0, -1.0, 1.0,    //v11

                    // Right face
                    1.0, 1.0, 1.0,      //12
                    1.0, -1.0, 1.0,     //13
                    1.0, -1.0, -1.0,    //14
                    1.0, 1.0, -1.0,     //15

                    // Top face
                    1.0, 1.0, 1.0,      //v16
                    1.0, 1.0, -1.0,     //v17
                    -1.0, 1.0, -1.0,    //v18
                    -1.0, 1.0, 1.0,     //v19

                    // Bottom face
                    1.0, -1.0, 1.0,     //v20
                    1.0, -1.0, -1.0,    //v21
                    -1.0, -1.0, -1.0,   //v22
                    -1.0, -1.0, 1.0,    //v23
                ];

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition), this.gl.STATIC_DRAW);

                this.pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE = 3;
                this.pwgl.CUBE_VERTEX_POS_BUF_NUM_ITEMS = 24;

                // uv 数据
                this.pwgl.cubeVertexTextureCoordinateBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.cubeVertexTextureCoordinateBuffer);

                var textureCoordinates = [
                    //Front face
                    0.0, 0.0, //v0
                    1.0, 0.0, //v1
                    1.0, 1.0, //v2
                    0.0, 1.0, //v3

                    // Back face
                    0.0, 1.0, //v4
                    1.0, 1.0, //v5
                    1.0, 0.0, //v6
                    0.0, 0.0, //v7

                    // Left face
                    0.0, 1.0, //v8
                    1.0, 1.0, //v9
                    1.0, 0.0, //v10
                    0.0, 0.0, //v11

                    // Right face
                    0.0, 1.0, //v12
                    1.0, 1.0, //v13
                    1.0, 0.0, //v14
                    0.0, 0.0, //v15

                    // Top face
                    0.0, 1.0, //v16
                    1.0, 1.0, //v17
                    1.0, 0.0, //v18
                    0.0, 0.0, //v19

                    // Bottom face
                    0.0, 1.0, //v20
                    1.0, 1.0, //v21
                    1.0, 0.0, //v22
                    0.0, 0.0, //v23
                ];

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);

                this.pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
                this.pwgl.CUBE_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 24;

                // 索引数据
                this.pwgl.cubeVertexIndexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.pwgl.cubeVertexIndexBuffer);

                var cubeVertexIndices = [
                    0, 1, 2, 0, 2, 3,       // Front face
                    4, 6, 5, 4, 7, 6,       // Back face
                    8, 9, 10, 8, 10, 11,    // Left face
                    12, 13, 14, 12, 14, 15, // Right face
                    16, 17, 18, 16, 18, 19, // Top face
                    20, 22, 21, 20, 23, 22  // Bottom face
                ];

                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.gl.STATIC_DRAW);

                this.pwgl.CUBE_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
                this.pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS = 36;
            },
            setupTextures() {
                this.pwgl.woodTexture = this.gl.createTexture();
                this.loadImageForTexture("./static/swood_128x128.jpg", this.pwgl.woodTexture);

                this.pwgl.groundTexture = this.gl.createTexture();
                this.loadImageForTexture("./static/wood_floor_256.jpg", this.pwgl.groundTexture);

                this.pwgl.boxTexture = this.gl.createTexture();
                this.loadImageForTexture("./static/wicker_256.jpg", this.pwgl.boxTexture);
            },
            loadImageForTexture(url, texture) {
                var image = new Image();
                let self=this;
                image.onload = function () {
                    self.pwgl.ongoingImageLoads.splice(self.pwgl.ongoingImageLoads.indexOf(image), 1);
                    self.textureFinishedLoading(image, texture);
                };
                this.pwgl.ongoingImageLoads.push(image);
                image.src = url;
            },
            textureFinishedLoading(image, texture) {
                // 指定当前操作的贴图
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                // Y 轴取反
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

                // 创建贴图, 绑定对应的图像并设置数据格式
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

                // 生成 MipMap 映射
                this.gl.generateMipmap(this.gl.TEXTURE_2D);

                // 设定参数, 放大滤镜和缩小滤镜的采样方式
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

                // 设定参数, x 轴和 y 轴为镜面重复绘制
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);

                // 清除当前操作的贴图
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            },
            draw() {
                this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                // 设置为正交矩阵
                // glMatrix.mat4.ortho(pwgl.projectionMatrix, -8, 8, -8, 8, 0.1, 100);
                // 设置为透视矩阵
                mat4.perspective(this.pwgl.projectionMatrix, 60 * Math.PI / 180, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100);
                // 初始化模型视图矩阵
                mat4.identity(this.pwgl.modelViewMatrix);
                mat4.lookAt(this.pwgl.modelViewMatrix, [8, 5, -10], [0, 0, 0], [0, 1, 0]);

                this.uploadModelViewMatrixToShader();
                this.uploadProjectionMatrixToShader();
                this.gl.uniform1i(this.pwgl.uniformSamplerLoc, 0);

                // 绘制地板
                this.drawFloor();

                // 绘制桌子
                this.pushModelViewMatrix();
                mat4.translate(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [0, 1.1, 0]);
                this.uploadModelViewMatrixToShader();
                this.drawTable();
                this.popModelViewMatrix();

                // 绘制桌子上的小盒子
                this.pushModelViewMatrix();
                mat4.translate(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [0, 2.7, 0]);
                mat4.scale(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [0.5, 0.5, 0.5]);
                this.uploadModelViewMatrixToShader();
                this.drawCube(this.pwgl.boxTexture);
                this.popModelViewMatrix();

                // 开启动画帧循环
                this.pwgl.requestId = requestAnimationFrame(this.draw, this.canvas);
            },
            uploadModelViewMatrixToShader() {
                this.gl.uniformMatrix4fv(this.pwgl.uniformMVMatrixLoc, false, this.pwgl.modelViewMatrix);
            },
            uploadProjectionMatrixToShader() {
                this.gl.uniformMatrix4fv(this.pwgl.uniformProjMatrixLoc, false, this.pwgl.projectionMatrix);
            },

            // 将 modelViewMatrix 矩阵压入堆栈
            pushModelViewMatrix() {
                var copyToPush = mat4.clone(this.pwgl.modelViewMatrix);
                this.pwgl.modelViewMatrixStack.push(copyToPush);
            },

            // 从矩阵堆栈中取出矩阵并设定为当前的 modelViewMatrix 矩阵
            popModelViewMatrix() {
                if (this.pwgl.modelViewMatrixStack.length == 0) {
                    throw "Error popModelViewMatrix() - Stack was empty ";
                }
                this.pwgl.modelViewMatrix = this.pwgl.modelViewMatrixStack.pop();
            },

            drawFloor(r, g, b, a) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.floorVertexPositionBuffer);
                this.gl.vertexAttribPointer(this.pwgl.vertexPositionAttributeLoc, this.pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE, this.gl.FLOAT, false, 0, 0);

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.floorVertexTextureCoordinateBuffer);
                this.gl.vertexAttribPointer(this.pwgl.vertexTextureAttributeLoc, this.pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE, this.gl.FLOAT, false, 0, 0);

                // 激活 0 号纹理单元
                this.gl.activeTexture(this.gl.TEXTURE0);
                // 指定当前操作的贴图
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.pwgl.groundTexture);

                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.pwgl.floorVertexIndexBuffer);
                this.gl.drawElements(this.gl.TRIANGLE_FAN, this.pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS, this.gl.UNSIGNED_SHORT, 0);
            },
            drawTable() {
                this.pushModelViewMatrix();
                mat4.translate(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [0.0, 1.0, 0.0]);
                mat4.scale(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [2.0, 0.1, 2.0]);
                this.uploadModelViewMatrixToShader();
                // 绘制桌面
                this.drawCube(this.pwgl.woodTexture);
                this.popModelViewMatrix();

                // 绘制 4 个腿
                for (var i = -1; i <= 1; i += 2) {
                    for (var j = -1; j <= 1; j += 2) {
                        this.pushModelViewMatrix();
                        mat4.translate(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [i * 1.9, -0.1, j * 1.9]);
                        mat4.scale(this.pwgl.modelViewMatrix, this.pwgl.modelViewMatrix, [0.1, 1.0, 0.1]);
                        this.uploadModelViewMatrixToShader();
                        this.drawCube(this.pwgl.woodTexture);
                        this.popModelViewMatrix();
                    }
                }
            },
            drawCube(texture) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.cubeVertexPositionBuffer);
                this.gl.vertexAttribPointer(this.pwgl.vertexPositionAttributeLoc, this.pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE, this.gl.FLOAT, false, 0, 0);

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pwgl.cubeVertexTextureCoordinateBuffer);
                this.gl.vertexAttribPointer(this.pwgl.vertexTextureAttributeLoc, this.pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE, this.gl.FLOAT, false, 0, 0);

                // 激活 0 号纹理单元
                this.gl.activeTexture(this.gl.TEXTURE0);
                // 指定当前操作的贴图
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.pwgl.cubeVertexIndexBuffer);

                this.gl.drawElements(this.gl.TRIANGLES, this.pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS, this.gl.UNSIGNED_SHORT, 0);
            },

            handleContextLost(event) {
                event.preventDefault();

                // 取消动画帧循环
                cancelRequestAnimationFrame(this.pwgl.requestId);

                // 取消所有的加载事件
                for (var i = 0; i < this.pwgl.ongoingImageLoads.length; i++) {
                    this.pwgl.ongoingImageLoads[i].onload = undefined;
                }
                // 清除图片
                this.pwgl.ongoingImageLoads = [];
            },

            handleContextRestored(event) {
                this.setupShaders();
                this.setupBuffers();
                this.setupTextures();
                this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
                this.gl.enable(this.gl.DEPTH_TEST);
                // 开启动画帧循环
                this.pwgl.requestId = requestAnimationFrame(this.draw, this.canvas);
            },
            startup() {
                this.canvas = document.getElementById("cans");
                //this.canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(this.canvas);
                this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
                this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);

                this.gl = this.createGLContext(this.canvas);
                this.setupShaders();
                this.setupBuffers();
                this.setupTextures();
                this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
                this.gl.enable(this.gl.DEPTH_TEST);

                this.draw();
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
