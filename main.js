(() => {

// Renderable caches
let active_renderables = [];
let light_sources = [];
let UIElements = [];
  
let SM = new ShortcutManager(document);
let renderable_list = new RenderableList(
  document.querySelector('.tools'),
  active_renderables,
  SM.forceModifier('ctrl')
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

// Create ShaderProgram for Shadow Mapping
let shadow_buffer = new ShadowBuffer(width/2, height/2);
let shadow_mapping_program;

// Debug canvas for displaying shadowmap
let debug_canvas = new DebugCanvas(width/2, height/2);
debug_canvas.init();

// Create the camera
let camera = new Camera();
camera.createKeyboardShortcuts(SM);

// Create some objects for the scene 
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

// Regiser them with the UI manager
renderable_list.registerRenderable(camera_obj, 'Camera');
renderable_list.registerRenderable(wolf_obj, 'Wolf');

// Create a light for the scene
let light = new Light();
renderable_list.registerRenderable(light, 'Light');
light.createKeyboardShortcuts(SM.forceModifier('ctrl'));
light.addEventListener('shadowProgramReady', () => light_sources.push(light));

main();

function main() {
  
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', width.toString());
  canvas.setAttribute('height', height.toString());
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const gl = canvas.getContext('webgl');
  gl.getExtension('WEBGL_depth_texture');
  
  console.log(`
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ WebGL version: ${gl.getParameter(gl.VERSION).forceLength(38)} ┃
  ┃ WebGL vendor : ${gl.getParameter(gl.VENDOR).forceLength(38)} ┃
  ┃ WebGL supported extensions:                           ┃
  ┠─┮ ${gl.getSupportedExtensions().reduce((acc, val) => {
    return acc + val.forceLength(51) + ' ┃\n  ┃ ┝ ';
  }, '').trimLines()}
  ┗━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  \n`
  );
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  
  createShadowMappingShaderProgram(gl)
  .then(() => {
    light.shadow_shader_program = shadow_mapping_program;
    light_sources.push(light);
  });
  
  
  shadow_buffer.init(gl);
  
  renderable_list.setupGLContext(gl);
  
  camera_obj.init(gl);
  wolf_obj.init(gl);
  light.init(gl);

  // Draw the scene repeatedly  
  function render(now) {
    
    drawScene(gl);
  
    requestAnimationFrame(render);
    
  }
  
  requestAnimationFrame(render);
  
}

async function createShadowMappingShaderProgram (gl) {
  
  let vs_source = await Utils.fetch_txt('shaders/ShadowMapping.vs');
  let fs_source = await Utils.fetch_txt('shaders/ShadowMapping.fs');
  
  let vs = new Shader(vs_source, gl.VERTEX_SHADER);
  let fs = new Shader(fs_source, gl.FRAGMENT_SHADER);
  
  shadow_mapping_program = new ShaderProgram(vs, fs);
  
  vs.init();
  fs.init();
  vs.load(gl);
  fs.load(gl);
  shadow_mapping_program.init(gl);
  
}

//
// Draw the scene.
//
function drawScene (gl) {
  
  gl.viewport(0,0,width,height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  light_sources.forEach(light => {
    
    if (!light) return;
    
    active_renderables.forEach(renderable => {
      if (!renderable) return;
      light.drawShadows(
        gl, shadow_buffer.frame_buffer, shadow_buffer.depth_texture,
        shadow_buffer.color_texture, width/2, height/2, renderable
      );
    });
    
  });
  
  active_renderables.forEach(renderable => {
    
    if (!renderable) return;
    renderable.draw(
      gl, width, height, projection_matrix, camera.view_matrix,
      light, shadow_buffer.depth_texture
    );

  });
  
  // Draw shadow map to 2d canwas
  debug_canvas.drawPixels(shadow_buffer.getPixels(gl), width/2, height/2);
  
}


})();