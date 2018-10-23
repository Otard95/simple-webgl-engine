
class RenderableList {

  constructor(container, active_renderables, shortcut_manager) {
    // Data setup
    this.shortcut_manager = shortcut_manager;
    this.active_renderables = active_renderables;
    this.items = [];
    
    // DOM Setup
    this.container = container;
    this.renderables_container = container.querySelector('#renderables');
    this.cached_container = container.querySelector('#cached-renderables');
    this.select_all_btn = this.renderables_container.querySelector('.selection-tools #unlock-all');
    this.deselect_all_btn = this.renderables_container.querySelector('.selection-tools #lock-all');
    this.select_all_btn.addEventListener('click', this.selectAll.bind(this));
    this.deselect_all_btn.addEventListener('click', this.deselectAll.bind(this));
    
    this.add_renderable_btn = this.cached_container.querySelector('#add-object-btn');
    this.add_renderable_btn.addEventListener('click', this.createNewRenderable.bind(this));
    
  }
  
  setupGLContext(gl) {
    this.gl = gl;
    this.add_renderable_btn.disabled = false;
  }
  
  createNewRenderable () {
    
    let object_url = prompt(
      `What's the url of the object-file?`,
      'http://domain.com/object_name.obj'
    );
    
    let renderable = new Renderable(object_url);
    renderable.createKeyboardShortcuts(this.shortcut_manager);
    this.registerRenderable(renderable, 'Name');
    renderable.init(this.gl);
    
  }
  
  registerRenderable(renderable, name) {
    let item = new RenderableItem(
      renderable,
      name,
      () => this.moveRenderableToScene(item),
      () => this.moveRenderableToCache(item)
    );
    renderable.addEventListener('ready', () => item.ready = true);
    this.cached_container.appendChild(item.cached_root);
    this.items.push(item);
  }
  
  moveRenderableToScene (renderable_item) {
    this.cached_container.removeChild(renderable_item.cached_root);
    this.renderables_container.appendChild(renderable_item.root);
    this.active_renderables.push(renderable_item.renderable);
  }
  
  moveRenderableToCache (renderable_item) {
    this.cached_container.appendChild(renderable_item.cached_root);
    this.renderables_container.removeChild(renderable_item.root);
    this.active_renderables.forEach((renderable, i) => {
      if (renderable_item.renderable === renderable)
        this.active_renderables.splice(i,1);
    });
    renderable_item.deselect();
  }

  selectAll() {
    this.items.forEach(i => {
      i.select();
    });
  }
  
  deselectAll () {
    this.items.forEach(i => {
      i.deselect();
    });
  }
  
}

class RenderableItem {
  
  constructor(renderable, name, move_to_scene_callback, move_to_cache_callback) {
    // Data
    this.renderable = renderable;
    this._ready = false;
    
    // DOM
    let markup =
      `<div class="renderable-item">
        <h4>${name}</h4>
        <input type="checkbox" title="Lock/Unkock this object" id="lock" checked />
        <input type="checkbox" id="enable" checked />
        <button id="move-to-cache"></button>
      </div>`;
    let cache_markup =
      `<div class="renderable-item">
        <h4>${name}</h4>
        <button title="Move to scene" id="move-to-scene" disabled></button>
      </div>`;
    let parser = new DOMParser();
    this.root = parser.parseFromString(markup, "text/html").body.firstChild;
    this.cached_root = parser.parseFromString(cache_markup, "text/html").body.firstChild;
    
    this.lock_check = this.root.querySelector(`#lock`);
    this.enable_check = this.root.querySelector(`#enable`);
    this.move_to_cache_btn = this.root.querySelector("#move-to-cache");
    this.lock_check.addEventListener('change', this.onLockChange.bind(this));
    this.enable_check.addEventListener('change', this.onEnableChange.bind(this));
    this.move_to_cache_btn.addEventListener('click', move_to_cache_callback);
    
    this.move_to_scene_btn = this.cached_root.querySelector('#move-to-scene');
    this.move_to_scene_btn.addEventListener('click', move_to_scene_callback);
    
  }
  
  get ready () { return this._ready; }
  set ready(state) { this._ready = state; this.move_to_scene_btn.disabled = !state; }

  onLockChange(e) {
    this.renderable.locked = e.target.checked;
  }
  
  onEnableChange (e) {
    this.renderable.enabled = e.target.checked;
  }
  
  select () {
    this.renderable.locked = false;
    this.lock_check.checked = false;
  }
  
  deselect () {
    this.renderable.locked = true;
    this.lock_check.checked = true;
  }
  
  enable () {
    this.renderable.enabled = true;
    this.enable_check.checked = true;
  }
  
  disable () {
    this.renderable.enabled = false;
    this.enable_check.checked = false;
  }

}
