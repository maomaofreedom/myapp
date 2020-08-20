/**
 * 绘制二维与三维的扇形效果
 * 二维在xy组成的平面旋转
 * 三维绕y轴，在xz轴平面旋转
 * 线
 */
import {Mat4} from "cuon-matrix-ts"

export default class DrawFan {
  constructor(option) {
    if (option == null) {
      option = {};
    }
    this.width = option.width || 100;
    this.height = option.height || 100;
    this.scaleFactor = option.scaleFactor || 1;
    // 线的颜色 0-1 范围内的颜色值
    this.lineColor = option.lineColor || [0.0, 0.0, 1.0, 0.5];
    // 背景颜色，建议加上透明度
    this.backColor = option.backColor || [0.0, 0.0, 0.0, 0.0];
    // 扇形的张开角度
    this.angle = option.angle || 45;
    //方向角，默认是0
    this.direction = option.direction || 0;
    this.count = option.count || 60;
    this.length = option.length || 1.0;
  }

  draw2D() {
    //准备数据
    let vertexAngData = [];
    vertexAngData.push(0.0, 0.0, 0.0)
    let delat = this.angle / this.count;
    let start = this.direction - this.angle / 2;
    for (let i = 0; i < this.count; i++) {
      let theta = (delat * i + start) * Math.PI / 180;
      let x1 = this.length * Math.sin(theta);
      let y1 = this.length * Math.cos(theta);
      vertexAngData.push(x1, y1, 0.0);
    }
    let verticesAng = new Float32Array(vertexAngData);
    let matrix=new Mat4();
    matrix.setRotate(0,0,0,1);
    let canvas=this.createCanvas();
    let gl=this.getGL(canvas);
    gl.clearColor(this.backColor[0],this.backColor[1],this.backColor[2],this.backColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let program=this.initShaderProgram(gl, this.vertexShader2D(), this.fragmentShader2D());
    let u_ModelMatrix=gl.getUniformLocation(program,'u_ModelMatrix');
    gl.uniformMatrix4fv(u_ModelMatrix,false,matrix.elements);

    let a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttrib4f(a_Color, this.lineColor[0], this.lineColor[1],this.lineColor[2],this.lineColor[3]);
    this.initVertexBuffers(gl, verticesAng,program,'a_Position');
    gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesAng.length / 3);
    return canvas;
  }

  draw3D() {

  }

  /**
   * 创建canvas
   * @returns {HTMLCanvasElement}
   */
  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width * this.scaleFactor;
    canvas.height = this.height * this.scaleFactor;
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';
    return canvas;
  }

  /**
   * 获取gl
   * @param canvas
   * @returns {CanvasRenderingContext2D|*|OffscreenRenderingContext|CanvasRenderingContext2D|WebGLRenderingContext}
   */
  getGL(canvas) {
    let gl = canvas.getContext('webgl', {alpha: true, antialias: true, depth: true});
    return gl;
  }

  initVertexBuffers(gl,vertices,program,position) {
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    let a_Position = gl.getAttribLocation(program, position);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
  }

  /**
   * 2D的顶点着色器
   * @returns {string}
   */
  vertexShader2D() {
    return  'attribute vec4 a_Position;\n' +
            'uniform mat4 u_ModelMatrix;\n'+
            'attribute vec4 a_Color;\n'+
            'varying vec4 v_color;\n'+
            'void main() {\n' +
            '   gl_Position = u_ModelMatrix * a_Position;\n' +
            '   v_color = a_Color;\n'+
            '}\n';
  }

  /**
   * 2D的片元着色器
   * @returns {string}
   */
  fragmentShader2D() {
    return  '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            "varying vec4 v_color;\n"+
            "void main() {\n"+
                "gl_FragColor = v_color;\n"+
            "}\n";
  }

  /**
   * 3D的顶点着色器
   * @returns {string}
   */
  vertexShader3D() {
    return ``;
  }

  /**
   * 3D的片元着色器
   * @returns {string}
   */
  fragmentShader3D() {
    return ``;
  }

  /**
   * 初始化shader程序
   * @param gl
   * @param vsSource
   * @param fsSource
   * @returns {*}
   */
  initShaderProgram(gl, vsSource, fsSource) {
    let program = this.createProgram(gl, vsSource, fsSource);
    if (!program) {
      console.log('Failed to create program');
      return false;
    }
    gl.useProgram(program);
    gl.program = program;
    return program;
  }

  /**
   * load shader
   * @param gl  webgl
   * @param type shader类型
   * @param source shader字符串
   * @returns {*}
   */
  loadShader(gl, type, source) {
    // create shader object
    let shader = gl.createShader(type);
    if (shader == null) {
      console.log('unable to create shader');
      return null;
    }
    // set shader source code
    gl.shaderSource(shader, source);
    // compile the shader
    gl.compileShader(shader);
    // check compile status
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      let error = gl.getShaderInfoLog(shader);
      console.log('Failed to compile shader: ' + error);
      return null;
    }
    return shader;
  }

  /**
   * 创建program
   * @param gl
   * @param vertexShaderSource
   * @param fragmentShaderSource
   * @returns {*}
   */
  createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    let vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
      return null;
    }
    // create a program object
    let program = gl.createProgram();
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
    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      let error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    return program;
  }

  setWidth(width) {
    this.width = width;
  }

  setHeight(height) {
    this.height = height;
  }

  setScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor;
  }

  setLineColor(lineColor) {
    this.lineColor = lineColor;
  }

  setBackColor(backColor) {
    this.backColor = backColor;
  }

  setAngle(angle) {
    this.angle = angle;
  }

  setCount(count) {
    this.count = count;
  }

  setLength(length) {
    this.length = length;
  }

  setDirection(direction) {
    this.direction = direction;
  }
}
