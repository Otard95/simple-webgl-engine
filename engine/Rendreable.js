
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
  
}