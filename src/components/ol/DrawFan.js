/**
 * 绘制二维与三维的扇形效果
 * 二维在xy组成的平面旋转
 * 三维绕y轴，在xz轴平面旋转
 * 线
 */
export default class DrawFan {
  constructor(option) {
    this.width = option.width || 100
    this.height = option.height || 100
    this.scaleFactor = option.scaleFactor || 1
  }

  draw2D() {

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
  getGL(canvas){
    let gl = canvas.getContext('webgl', {alpha: true, antialias: true, depth: true});
    return gl;
  }

  /**
   * 2D的顶点着色器
   * @returns {string}
   */
  vertexShader2D(){
    return ``;
  }

  /**
   * 2D的片元着色器
   * @returns {string}
   */
  fragmentShader2D(){
    return ``;
  }

  /**
   * 3D的顶点着色器
   * @returns {string}
   */
  vertexShader3D(){
    return ``;
  }

  /**
   * 3D的片元着色器
   * @returns {string}
   */
  fragmentShader3D(){
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
    var program = this.createProgram(gl, vsSource, fsSource);
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
}
