
class Renderable extends Drawable {
  
  constructor(
    object_file,
    position = vec3.create(),
    scale = vec3.fromValues(1,1,1),
    rotation = quat.create()
  ) {
    
    super(position,scale,rotation);
    
    this.object_file_is_jobj = object_file.endsWith('.jobj');
    this.object_file = object_file;
    
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
    
    // Event handler
    this.events = {};
    
  }
  
  updateMatrices () {
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
    super.position = v;
    this.updateMatrices();
  }
  get position () {
    return super.position;
  }
  
  set scale (s) {
    super.scale = s;
    this.updateMatrices();
  }
  get sacle () {
    return super.sacle;
  }
  
  set rotation (r) {
    super.rotation = r;
    this.updateMatrices();
  }
  get rotation () {
    return super.rotation;
  }
  
  async loadObject () {
    if (this.object_file_is_jobj) {
      this.data = await Utils.fetch_json(this.object_file);
    } else {
      let source = await Utils.fetch_txt(this.object_file)
      this.data = await Object3D.parse(source);
      this.data.Shader = 'Default';
    }
  }
  
  async init (gl) {
    
    await this.loadObject();
    
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
    
    this.invokeEvent('ready');
    
  }
  
  draw (gl, width, height, projection_matrix, view_matrix, light, depth_texture) {
    
    super.draw(gl, projection_matrix, view_matrix, light);
    
    if (!this.enabled) return;
    
    gl.useProgram(this.shader_program.gl_program);
    gl.viewport(0, 0, width, height);
    
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

    // let model_view_matrix = mat4.multiply(
    //   mat4.create(),
    //   view_matrix,
    //   this.model_matrix
    // );
    
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, depth_texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(this.shader_program.info.uniformLocations.uSampler, 0);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.projectionMatrix,
      false,
      projection_matrix
    );
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.viewMatrix,
      false,
      view_matrix
    );
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.modelMatrix,
      false,
      this.model_matrix
    );
    gl.uniformMatrix4fv(
      this.shader_program.info.uniformLocations.normalMatrix,
      false,
      this.normal_matrix
    );
    gl.uniform3fv(
      this.shader_program.info.uniformLocations.lightDirection,
      light.direction,
    )

    {
      const faceCount = this.data.indices.length;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, faceCount, type, offset);
    }
  }
  
  addEventListener (type, handler) {
    if (this.events[type] === undefined) this.events[type] = [];
    this.events[type].push(handler);
  }
  
  invokeEvent (type) {
    if (this.events[type] !== undefined) this.events[type].forEach(handler => handler());
  }
  
  removeEventListener (type, handler) {
    if (this.events[type] !== undefined) 
      this.events[type].forEach((local_handler, i) => {
        if (handler === local_handler) this.events[type].splice(i,1); 
      });
  }
  
}