
class ShaderProgram {
  
  constructor (vertex_shader, fragment_shader) {
    this.fragment_shader = fragment_shader;
    this.vertex_shader = vertex_shader;
  }
  
  init (gl) {
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, this.vertex_shader.gl_shader);
    gl.attachShader(shaderProgram, this.fragment_shader.gl_shader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return;
    }

    this.gl_program = shaderProgram;
    
    this.info = {
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.gl_program, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(this.gl_program, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(this.gl_program, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(this.gl_program, 'aTextureCoord')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(this.gl_program, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(this.gl_program, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(this.gl_program, 'uNormalMatrix'),
        uSampler: gl.getUniformLocation(this.gl_program, 'uSampler')
      },
    };
    
  }

  setupBuffers(gl, vertices, indices, vertex_normals) {

    /**
     * ## Proition buffer
    */
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW);

    /**
     * ## Index buffer
    */
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW);

    /**
     * ## init normals
    */
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertex_normals),
      gl.STATIC_DRAW);

    /**
     * ## Set Colors of the faces
     */
    // Convert the array of colors into a table for all the vertices.
    var colors = [];

    for (var j = 0; j < vertices.length; ++j) {
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(.7, .7, .7, 1);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(colors),
      gl.STATIC_DRAW);

    this.buffers = {
      positions: positionBuffer,
      normal: normalBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };

  }
  
}