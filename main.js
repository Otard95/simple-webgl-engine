(() => {
  
document.addEventListener('keypress', (event) => {
  const keyName = event.key;

  console.log('keypress event\n\n' + 'key: ' + keyName, `ctrl: ${event.ctrlKey}`);
});
  
const height = 600;
const width = 800;

// Create a perspective matrix, a special matrix that is
// used to simulate the distortion of perspective in a camera.
// Our field of view is 45 degrees, with a width/height
// ratio that matches the display size of the canvas
// and we only want to see objects between 0.1 units
// and 100 units away from the camera.

const fieldOfView = 45 * Math.PI / 180;   // in radians
const aspect = width / height;
const zNear = 0.1;
const zFar = 600.0;
const projectionMatrix = mat4.create();

// note: glmatrix.js always has the first argument
// as the destination to receive the result.
mat4.perspective(projectionMatrix,
  fieldOfView,
  aspect,
  zNear,
  zFar
);

// setup view matrix
let view_matrix = mat4.create();
mat4.translate(
  view_matrix,
  view_matrix,
  [0,-1,-7]
);
  
// Rotation
let cuboRotation = 0.0;
let then = 0;

// Stuff to render
let stuff_to_render = [];

let camera = new Renderable(
  './objects/camera.jobj',
  vec3.fromValues(1, 0, 2),
  vec3.fromValues(3, 3, 3)
);
let wolf = new Renderable(
  './objects/Wolf.jobj',
  vec3.fromValues(-1, 0, 2),
  vec3.fromValues(.01, .01, .01)
);

main();

//
// Start here
//
function main() {
  
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', width.toString());
  canvas.setAttribute('height', height.toString());
  document.body.appendChild(canvas);
  
  const gl = canvas.getContext('webgl');
  
  camera.init(gl)
  .then(() => {
    stuff_to_render.push(camera);
  });
  wolf.init(gl)
  .then(() => {
    stuff_to_render.push(wolf);
  });

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Draw the scene repeatedly
  
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
  
    drawScene(gl, deltaTime);
  
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
  
}

//
// Draw the scene.
//
function drawScene(gl, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // // Set the drawing position to the "identity" point, which is
  // // the center of the scene.
  // const modelViewMatrix = mat4.create();

  // // Now move the drawing position a bit to where we want to
  // // start drawing the square.

  // mat4.translate(
  //   modelViewMatrix,     // destination matrix
  //   modelViewMatrix,     // matrix to translate
  //   [-0.0, 0, -2.0],   // amount to translate
  // );

  // mat4.rotate(
  //   modelViewMatrix,  // destination matrix
  //   modelViewMatrix,  // matrix to rotate
  //   cuboRotation,   // amount to rotate in radians
  //   [0, 0, 1],        // axis to rotate around
  // );
  
  // mat4.rotate(
  //   modelViewMatrix,  // destination matrix
  //   modelViewMatrix,  // matrix to rotate
  //   cuboRotation * .7,   // amount to rotate in radians
  //   [0, 1, 0],        // axis to rotate around
  // );

  stuff_to_render.forEach(renderable => {
    
    if (!renderable) return;
    
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, renderable.shader_program.buffers.positions);
      gl.vertexAttribPointer(
        renderable.shader_program.info.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        renderable.shader_program.info.attribLocations.vertexPosition);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderable.shader_program.buffers.indices);

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, renderable.shader_program.buffers.normal);
      gl.vertexAttribPointer(
        renderable.shader_program.info.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        renderable.shader_program.info.attribLocations.vertexNormal);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, renderable.shader_program.buffers.color);
      gl.vertexAttribPointer(
        renderable.shader_program.info.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        renderable.shader_program.info.attribLocations.vertexColor);
    }
    
    gl.useProgram(renderable.shader_program.gl_program);
    
    let model_view_matrix = mat4.multiply(
      mat4.create(),
      view_matrix,
      renderable.model_matrix
    );

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      renderable.shader_program.info.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      renderable.shader_program.info.uniformLocations.modelViewMatrix,
      false,
      model_view_matrix);
    gl.uniformMatrix4fv(
      renderable.shader_program.info.uniformLocations.normalMatrix,
      false,
      renderable.normal_matrix);

    {
      const faceCount = renderable.data.indices.length;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, faceCount, type, offset);
    }

    
  });

  cuboRotation += deltaTime;
  
}


})();