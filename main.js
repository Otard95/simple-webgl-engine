(() => {

// Renderable cashes
let active_renderables = [];
let cashed_renderables = [];
  
let SM = new ShortcutManager(document);
let renderable_list = new RenderableList(
  document.querySelector('.tools #renderables'),
  active_renderables,
  cashed_renderables
);

const height = 600;
const width = 800;

// Projection Matrix
const projection_matrix = mat4.create();
{ // Setup Projection Matrix
const fieldOfView = 45 * Math.PI / 180;   // in radians
const aspect = width / height;
const zNear = 0.1;
const zFar = 600.0;

// note: glmatrix.js always has the first argument
// as the destination to receive the result.
mat4.perspective(projection_matrix,
  fieldOfView,
  aspect,
  zNear,
  zFar
);
}

// Create the camera
let camera = new Camera();
camera.createKeyboardShortcuts(SM);

let camera_obj = new Renderable(
  './objects/camera.jobj',
  vec3.fromValues(1, 0, 2),
  vec3.fromValues(3, 3, 3)
);
camera_obj.createKeyboardShortcuts(SM.forceModifier('ctrl'));
let wolf_obj = new Renderable(
  './objects/Wolf.jobj',
  vec3.fromValues(-1, 0, 2),
  vec3.fromValues(.01, .01, .01)
);
wolf_obj.createKeyboardShortcuts(SM.forceModifier('ctrl'));

renderable_list.addRenderable(camera_obj, 'Camera');
renderable_list.addRenderable(wolf_obj, 'Wolf');

main();

function main() {
  
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', width.toString());
  canvas.setAttribute('height', height.toString());
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const gl = canvas.getContext('webgl');
  
  camera_obj.init(gl)
  .then(() => {
    active_renderables.push(camera_obj);
  });
  wolf_obj.init(gl)
  .then(() => {
    active_renderables.push(wolf_obj);
  });

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Draw the scene repeatedly
  
  function render(now) {
    
    drawScene(gl);
  
    requestAnimationFrame(render);
    
  }
  
  requestAnimationFrame(render);
  
}

//
// Draw the scene.
//
function drawScene(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  active_renderables.forEach(renderable => {
    
    if (!renderable) return;
    renderable.draw(gl, projection_matrix, camera.view_matrix);

  });
  
}


})();