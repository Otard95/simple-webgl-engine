
class Shader {

  constructor(shader_source, gl_shader_type) {
    this.source = shader_source;
    this.attribs = 0;
    this.uniforms = 0;
    this.gl_shader = null;
    this.gl_shader_type = gl_shader_type;
  }

  init() {
    this.parseAttributes();
    this.parseUniforms();
  }

  load(gl) {
    const shader = gl.createShader(this.gl_shader_type);

    // Send the source to the shader object
    gl.shaderSource(shader, this.source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return;
    }

    this.gl_shader = shader;
  }

  parseAttributes() {
    
    let match;
    let attrib_rx = /^(?![\/ ]+)attribute [\w]+ (\w+)/gm;
    while ((match = attrib_rx.exec(this.source)) != null) {
      switch (match[1]) {
        case 'aVertexPosition': this.attribs |= Shader.attrib.VERT_POS; break;
        case 'aVertexNormal': this.attribs |= Shader.attrib.VERT_NORM; break;
        case 'aVertexColor': this.attribs |= Shader.attrib.VERT_COL; break;
        case 'aTextureCoord': this.attribs |= Shader.attrib.VERT_TEXC; break;
        default: console.warn('Shader has unknown attribute!');
      }

    }
  }

  parseUniforms() {

    let match;4
    let uniform_rx = /^(?![\/ ]+)uniform [\w]+(?: [\w]+) (\w+)/gm;
    while ((match = uniform_rx.exec(this.source)) != null) {
      switch (match[1]) {
        case 'uNormalMatrix': this.uniforms |= Shader.uniform.NORM_MAT; break;
        case 'uViewMatrix': this.uniforms |= Shader.uniform.VIEW_MAT; break;
        case 'uModelMatrix': this.uniforms |= Shader.uniform.MODEL_MAT; break;
        case 'uProjectionMatrix': this.uniforms |= Shader.uniform.PROJ_MAT; break;
        case 'uSampler': this.uniforms |= Shader.uniform.USAMP; break;
        case 'uLightDirection': this.attribs |= Shader.attrib.LIGHT_DIR; break;
        default: console.warn('Shader has unknown uniform!');
      }
    }

  }

}

Shader.attrib = {
  VERT_POS:  0b00000001,
  VERT_NORM: 0b00000010,
  VERT_COL:  0b00000100,
  VERT_TEXC: 0b00001000,
};

Shader.uniform = {
  NORM_MAT:  0b00000001,
  VIEW_MAT:  0b00000010,
  MODEL_MAT: 0b00000100,
  PROJ_MAT:  0b00001000,
  USAMP:     0b00010000,
  LIGHT_DIR: 0b00100000,
};