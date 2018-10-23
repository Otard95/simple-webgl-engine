
class Light extends Renderable {
  
  constructor (
    object_file = '',
    position = vec3.create(),
    scale = vec3.fromValues(1, 1, 1),
    rotation = quat.create(),
    is_directional = true
  ) {
    super(object_file,position,scale,rotation);
    this.is_directional = is_directional;
  }
  
  get direction () {
    let out_vec = vec3.fromValues(0, 0, 1);
    out_vec = vec3.transformQuat(
      out_vec,
      out_vec,
      super.rotation
    );
    return out_vec;
  }
  
  set shadow_shader_program (ssp) {
    this._shadow_shader_program = ssp;
    
    this.initShadowRendering();
    
    if (this.events.shadowProgramReady)
      this.events.shadowProgramReady.forEach(handler => {
        handler();
      });
  }
  
  get rotation() { return super.rotation; }
  set rotation (q) {
    super.rotation = q;
    this.updateShadowViwMatrix();
  }
  
  drawShadows(gl, frame_buffer, depth_texture, color_texture, width, height, renderable, view_matrix) {
    gl.useProgram(this._shadow_shader_program.gl_program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.bindTexture(gl.TEXTURE_2D, depth_texture);
    gl.bindTexture(gl.TEXTURE_2D, color_texture);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Bind renderable vertecies
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, renderable.shader_program.buffers.positions);
      gl.vertexAttribPointer(
        renderable.shader_program.info.attribLocations.vertexPosition,
        numComponents, type, normalize,
        stride, offset
      );
    }
    
    // Bind renderable indecies
    {
      gl.bindBuffer(
        gl.ELEMENT_ARRAY_BUFFER,
        renderable.shader_program.buffers.indices
      );
    }
    
    // let model_view_matrix = mat4.multiply(
    //   mat4.create(),
    //   view_matrix || this.shadow_view_matrix,
    //   renderable.model_matrix
    // );
    
    gl.uniformMatrix4fv(
      this._shadow_shader_program.info.uniformLocations.projectionMatrix,
      false,
      this.shadow_projection_matrix
    );
    gl.uniformMatrix4fv(
      this._shadow_shader_program.info.uniformLocations.viewMatrix,
      false,
      view_matrix || this.shadow_view_matrix
    );
    gl.uniformMatrix4fv(
      this._shadow_shader_program.info.uniformLocations.ModelMatrix,
      false,
      this.model_matrix
    );

    gl.drawElements(gl.TRIANGLES, renderable.data.indices.length,
      gl.UNSIGNED_SHORT, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
  updateShadowViwMatrix () {
    // lookAt(out, eye, center, up) 
    this.shadow_view_matrix = mat4.lookAt(
      mat4.create(),
      vec3.scale(
        vec3.create(),
        this.direction,
        -5
      ),
      vec3.create(),
      vec3.fromValues(0, 1, 0)
    );
  }
  
  initShadowRendering() {
    // ortho(out, left, right, bottom, top, near, far)
    this.shadow_projection_matrix = mat4.ortho(
      mat4.create(),
      10, 10, 10, 10, 0.1, 10
    );
    this.updateShadowViwMatrix();
  }
  
  async loadObject () {
    if (this.object_file != '') { super.loadObject(); return; }
    
    let cneter = Object3D.primitiveEllipsoid(10, null, 0.2);
    let arrow = Object3D.primitiveEllipsoid(
      10,
      vec3.fromValues(0, 0, -0.5),
      0.05, 0.05, 0.2
    );
    this.data = Object3D.concat(cneter, arrow);
    this.data.Shader = 'Default';
    
  }
  
}