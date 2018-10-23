
class DebugCanvas {
  
  constructor (width, height) {
    
    this.width = width;
    this.height = height;
    
  }
  
  init () {
    
    const canvas = document.createElement('canvas');
    canvas.classList += 'debug-canvas';
    canvas.width = this.width;
    canvas.height = this.height;
    document.body.insertBefore(canvas, document.body.firstChild);
    
    this.cxt = canvas.getContext('2d');
    this.canvas = canvas;
    
  }
  
  drawPixels (pixels, width, height) {
    
    let imageData = this.cxt.createImageData(width, height);
    
    imageData.data.set(pixels);
    this.cxt.putImageData(imageData, 0, 0);
    
  }
  
}