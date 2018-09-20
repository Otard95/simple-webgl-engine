(() => {

// Shader sources
let vsSource;
let fsSource;

// Cube object info
let positions;
let indices;
let faceColors;
let vertexNormals;

// texture
let texture;
let texture_image;
let textureCoordinates;

// Rotation
let cuboRotation = 0.0;
let then = 0;

// ## INITILIZE ASYNC RESOURCES
Promise.all([
  Utils.fetch_txt('shaders/vertex.vs'),
  Utils.fetch_txt('shaders/fragment.fs'),
  Utils.fetch_json('objects/cube.json'),
  Utils.load_img('textures/black_tile.jpg'),
  Utils.parse_obj('objects/camera.obj')
]) // load the shader sources before we run main()
.then(res => { 
  let vs_res = res.shift();
  vsSource = vs_res;
  return res;
})
.then(res => {
  let fs_res = res.shift();
  fsSource = fs_res;
  return res;
})
.then(res => {
  let obj_res = res.shift();
  positions = obj_res.positions;
  indices = obj_res.indices;
  faceColors = obj_res.faceColors;
  textureCoordinates = obj_res.textureCoordinates;
  vertexNormals = obj_res.vertexNormals;
  return res;
})
.then(res => {
  let img_res = res.shift();
  texture_image = img_res;
  return res;
})
.then(res => {
  let obj_res = res.shift();
  positions = obj_res.positions;
  indices = obj_res.indices;
  vertexNormals = obj_res.vertexNormals;
  return res;
})
.then(main)
.catch(console.log);

//
// Start here
//
function main() {
  
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', '800');
  canvas.setAttribute('height', '600');
  document.body.appendChild(canvas);
  
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shader_program = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const program_info = {
    program: shader_program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shader_program, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shader_program, 'aVertexColor'),
      vertexNormal: gl.getAttribLocation(shader_program, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shader_program, 'aTextureCoord')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shader_program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shader_program, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shader_program, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shader_program, 'uSampler')
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  // Draw the scene
  // drawScene(gl, programInfo, buffers);

  // Draw the scene repeatedly
  
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
  
    drawScene(gl, program_info, buffers, deltaTime);
  
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
  
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {

  /**
   * ## Proition buffer
  */
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);
    
  /**
   * ## Index buffer
  */
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);
    
  /**
   * ## init normals
  */
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
    gl.STATIC_DRAW);
  
  /**
   * ## Set Colors of the faces
  */
  // Convert the array of colors into a table for all the vertices.
  var colors = [];

  for (var j = 0; j < positions.length; ++j) {
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(1, 1, 1, 1);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
  /**
   * ## Texture
  */
  let textureCoordBuffer;
  {
    texture = gl.createTexture();
    
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      srcFormat, srcType, texture_image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the texture_image is a
    // power of 2 in both dimensions.
    if (Utils.is_pow_2(texture_image.width) && is_pow_2(Utils.texture_image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn of mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    
    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
      gl.STATIC_DRAW);
    
  }
  
  return {
    position: positionBuffer,
    normal: normalBuffer,
    color: colorBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 600.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(
    modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [-0.0, 0, -2.0],   // amount to translate
  );
                
  mat4.rotate(
    modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cuboRotation,   // amount to rotate in radians
    [0, 0, 1],        // axis to rotate around
  );
  
  mat4.rotate(
    modelViewMatrix,  // destination matrix
    modelViewMatrix,  // matrix to rotate
    cuboRotation * .7,   // amount to rotate in radians
    [0, 1, 0],        // axis to rotate around
  );

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  
  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
  }
  
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
  
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexColor);
  }
  
  // // tell webgl how to pull out the texture coordinates from buffer
  // {
  //   const num = 2; // every coordinate composed of 2 values
  //   const type = gl.FLOAT; // the data in the buffer is 32 bit float
  //   const normalize = false; // don't normalize
  //   const stride = 0; // how many bytes to get from one set to the next
  //   const offset = 0; // how many bytes inside the buffer to start from
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  //   gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
  //   gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  // }
  
  // // Tell WebGL we want to affect texture unit 0
  // gl.activeTexture(gl.TEXTURE0);

  // // Bind the texture to texture unit 0
  // gl.bindTexture(gl.TEXTURE_2D, texture);

  // // Tell the shader we bound the texture to texture unit 0
  // gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix);

  // {
  //   const offset = 0;
  //   const vertexCount = 4;
  //   gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  // }
  
  {
    const faceCount = indices.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, faceCount, type, offset);
  }
  
  cuboRotation += deltaTime;
  
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


})();