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
}
