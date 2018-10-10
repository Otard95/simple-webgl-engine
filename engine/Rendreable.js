
class Renderable {
  
  constructor(
    object_file,
    position = vec3.create(),
    scale = vec3.fromValues(1,1,1),
    rotation = quat.create()
  ) {
    
    this.object_file = object_file;
    
    this._position = position;
    this._scale = scale;
    this._rotation = rotation;
    
    this.locked = true;
    this.enabled = true;
    
    this.model_matrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      this._rotation,
      this._position,
      this._scale,
      vec3.create()
    );

    this.normal_matrix = mat4.create();
    mat4.invert(this.normal_matrix, this.model_matrix);
    mat4.transpose(this.normal_matrix, this.normal_matrix);
    
  }
  
  set position (v) {
    
    this._position = v;
    this.model_matrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      this._rotation,
      this._position,
      this._scale,
      vec3.create()
    );
    
  }
  
  get position () {
    return this._position;
  }
  
  set scale (s) {
    
    this._scale = s;
    this.model_matrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      this._rotation,
      this._position,
      this._scale,
      vec3.create()
    );
    
  }
  
  get sacle () {
    return this._sacle;
  }
  
  set rotation (r) {
    
    this._rotation = r;
    this.model_matrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      this._rotation,
      this._position,
      this._scale,
      vec3.create()
    );
    
  }
  
  get rotation () {
    return this._rotation;
  }
  
  async init(gl) {
    
    // Get the jobj
    this.data = await Utils.fetch_json(this.object_file);
    
    // Get shader source
    let vs_source = await Utils.fetch_txt('./shaders/' + this.data.shader + '.vs');
    let fs_source = await Utils.fetch_txt('./shaders/' + this.data.shader + '.fs');
    
    // Instantiate shaders
    let vertex_shader = new Shader(vs_source, gl.VERTEX_SHADER);
    let fragment_shader = new Shader(fs_source, gl.FRAGMENT_SHADER);
    
    // Initilize and load shaders
    vertex_shader.init();
    fragment_shader.init();
    vertex_shader.load(gl);
    fragment_shader.load(gl);
    
    // Create a shader program
    this.shader_program = new ShaderProgram(vertex_shader, fragment_shader);
    // and initilize it
    this.shader_program.init(gl);
    
    this.shader_program.setupBuffers(
      gl,
      this.data.vertices,
      this.data.indices,
      this.data.vertex_normals
    )
    
  }
  
  draw (gl, projection_matrix, view_matrix) {
    
    if (!this.enabled) return;
    
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shader_program.buffers.positions);
      gl.vertexAttribPointer(
        this.shader_program.info.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        this.shader_program.info.attribLocations.vertexPosition);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shader_program.buffers.indices);

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shader_program.buffers.normal);
      gl.vertexAttribPointer(
        this.shader_program.info.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        this.shader_program.info.attribLocations.vertexNormal);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shader_program.buffers.color);
      gl.vertexAttribPointer(
        this.shader_program.info.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        this.shader_program.info.attribLocations.vertexColor);
    }

    gl.useProgram(this.shader_program.gl_program);

    let model_view_matrix = mat4.multiply(
      mat4.create(),
      view_matrix,
      this.model_matrix
    );

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.projectionMatrix,
      false,
      projection_matrix);
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.modelViewMatrix,
      false,
      model_view_matrix);
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.normalMatrix,
      false,
      this.normal_matrix);

    {
      const faceCount = this.data.indices.length;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, faceCount, type, offset);
    }
  }
  
  createKeyboardShortcuts (KBSM) {
    
    /**
     * ### Moving
    */
    {
    KBSM.onKeyPress('ArrowLeft', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(-.1, 0, 0));
    });
    KBSM.onKeyPress('ArrowRight', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(.1, 0, 0));
    });
    KBSM.onKeyPress('ArrowUp', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(0, 0, .1));
    });
    KBSM.onKeyPress('ArrowDown', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(0, 0, -.1));
    });
    KBSM.onKeyPress('x', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(0, .1, 0));
    });
    KBSM.onKeyPress('z', () => {
      if (this.locked) return;
      this.position = vec3.add(this.position, this.position, vec3.fromValues(0, -.1, 0));
    });
    }
    /**
     * ### Rotating
    */
    {
    KBSM.onKeyPress('shift+ArrowUp', () => {
      if (this.locked) return;
      this.rotation = quat.rotateX(
        this.rotation,
        this.rotation,
        -.02
      )
    });
    KBSM.onKeyPress('shift+ArrowDown', () => {
      if (this.locked) return;
      this.rotation = quat.rotateX(
        this.rotation,
        this.rotation,
        .02
      )
    });
    KBSM.onKeyPress('shift+ArrowLeft', () => {
      if (this.locked) return;
      this.rotation = quat.rotateY(
        this.rotation,
        this.rotation,
        .02
      )
    });
    KBSM.onKeyPress('shift+ArrowRight', () => {
      if (this.locked) return;
      this.rotation = quat.rotateY(
        this.rotation,
        this.rotation,
        -.02
      )
    });
    KBSM.onKeyPress('shift+z', () => {
      if (this.locked) return;
      this.rotation = quat.rotateZ(
        this.rotation,
        this.rotation,
        .02
      )
    });
    KBSM.onKeyPress('shift+x', () => {
      if (this.locked) return;
      this.rotation = quat.rotateZ(
        this.rotation,
        this.rotation,
        -.02
      )
    });
    }
  }
  
}