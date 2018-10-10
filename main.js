(() => {
  
let SM = new ShortcutManager(document);
let renderable_list = new RenderableList(document.querySelector('.tools #renderables'));

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
const projection_matrix = mat4.create();

// note: glmatrix.js always has the first argument
// as the destination to receive the result.
mat4.perspective(projection_matrix,
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

// Stuff to render
let stuff_to_render = [];

let then = 0;

let camera = new Renderable(
  './objects/camera.jobj',
  vec3.fromValues(1, 0, 2),
  vec3.fromValues(3, 3, 3)
);
camera.createKeyboardShortcuts(SM.forceModifier('ctrl'));
let wolf = new Renderable(
  './objects/Wolf.jobj',
  vec3.fromValues(-1, 0, 2),
  vec3.fromValues(.01, .01, .01)
);
wolf.createKeyboardShortcuts(SM.forceModifier('ctrl'));

renderable_list.addRenderable(camera, 'Camera');
renderable_list.addRenderable(wolf, 'Wolf');

main();

//
// Start here
//
function main() {
  
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', width.toString());
  canvas.setAttribute('height', height.toString());
  document.body.insertBefore(canvas, document.body.firstChild);
  
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

  stuff_to_render.forEach(renderable => {
    
    if (!renderable) return;
    
    renderable.draw(gl, projection_matrix, view_matrix);

    
  });
  
}


})();