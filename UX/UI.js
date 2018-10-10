
class RenderableList {

  constructor(container) {
    this.container = container;
    this.select_all_btn = container.querySelector('.selection-tools #unlock-all');
    this.deselect_all_btn = container.querySelector('.selection-tools #lock-all');
    this.select_all_btn.addEventListener('click', this.selectAll.bind(this));
    this.deselect_all_btn.addEventListener('click', this.deselectAll.bind(this));
    this.items = [];
  }

  addRenderable(renderable, name) {

    let item = new RenderableItem(renderable, name);
    this.container.appendChild(item.root);
    this.items.push(item);
    
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
  
  constructor(renderable, name) {
    
    let markup =
      `<div class="renderable-item">
        <h4>${name}</h4>
        <input type="checkbox" id="lock" checked />
        <input type="checkbox" id="enable" checked />
      </div>`;
    let parser = new DOMParser();
    this.root = parser.parseFromString(markup, "text/html").body.firstChild;
    
    this.renderable = renderable;
    this.lock_check = this.root.querySelector(`#lock`);
    this.enable_check = this.root.querySelector(`#enable`);
    this.lock_check.addEventListener('change', this.onLockChange.bind(this));
    this.enable_check.addEventListener('change', this.onEnableChange.bind(this));
  }

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
