
class ShortcutManager {
  
  constructor (listen_to) {
    
    this.target = listen_to;
    
    this._press_shortcuts = [];
    this._down_shortcuts = [];
    this._up_shortcuts = [];
    
    this._active_handlers = [];
    
    this.target.addEventListener("keydown", this.downEventHendler.bind(this), true);
    this.target.addEventListener("keyup", this.upEventHendler.bind(this), true);
    
    setInterval(this.updateAvctiveHandlers.bind(this), 50);
    
  }
  
  forceModifier (modifier) {
    return new ShortcutManagerForseModDecorator(this, modifier);
  }
  
  onKeyPress (keybind, handler) {
    this.addShortcutTo(keybind, this.addActiveHandler(handler), this._down_shortcuts);
    this.addShortcutTo(keybind, this.removeActiveHandler(handler), this._up_shortcuts);
  }
  
  onKeyDown (keybind, handler) {
    this.addShortcutTo(keybind, handler, this._down_shortcuts);
  }
  
  onKeyUp (keybind, handler) {
    this.addShortcutTo(keybind, handler, this._up_shortcuts);
  }
  
  addShortcutTo(keybind, handler, list) {
    
    let keys = keybind.split('+');
    
    let ctrl_mod = false;
    let shift_mod = false;
    let alt_mod = false;
    let key_identifier = '';
    
    keys.forEach(key => {
      switch (key) {
        case 'ctrl' : ctrl_mod  = true; break;
        case 'shift': shift_mod = true; break;
        case 'alt'  : alt_mod   = true; break;
        default     : key_identifier = key;
      }
    });
    
    list.push(new KBShortcut(key_identifier, ctrl_mod, shift_mod, alt_mod, handler));
      
  }
  
  downEventHendler(event) {
    
    this._down_shortcuts.forEach(shortcut => {
      if (shortcut.match(event)) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler(event);
      }
    });
    
  }
  upEventHendler(event) {
    
    let matches = 0;
    this._up_shortcuts.forEach(shortcut => {
      if (shortcut.match(event)) {
        matches++;
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler(event);
      }
    });
    if (matches == 0) { this._active_handlers = []; }
    
  }
  
  addActiveHandler (handler) {
    return () => {
      if (this._active_handlers.includes(handler)) return;
      this._active_handlers.push(handler);
    }
  }
  removeActiveHandler(handler) {
    return () => {
      this._active_handlers.forEach((active_handler, i) => {
        if (handler == active_handler) this._active_handlers.splice(i,1);
      });
    }
  }
  
  updateAvctiveHandlers() {
    this._active_handlers.forEach(handler => {
      handler();
    });
  }
  
}

class ShortcutManagerForseModDecorator {
  
  constructor(shortcut_manager, forced_mod) {
    this.manager = shortcut_manager;
    this.forced_mod = forced_mod;
  }
  
  onKeyPress(keybind, handler) {
    this.manager.onKeyPress(this.forced_mod + '+' + keybind, handler);
  }

  onKeyDown(keybind, handler) {
    this.manager.onKeyDown(this.forced_mod + '+' + keybind, handler);
  }

  onKeyUp(keybind, handler) {
    this.manager.onKeyUp(this.forced_mod + '+' + keybind, handler);
  }
  
}

class KBShortcut {
  
  constructor (key, ctrl_mod, shift_mod, alt_mod, handler) {
    this.key = key.toLowerCase();
    this.ctrl_mod = ctrl_mod;
    this.shift_mod = shift_mod;
    this.alt_mod = alt_mod;
    this.handler = handler;
  }
  
  match (event) {
    if (
      event.key.toLowerCase() == this.key
      && event.ctrlKey == this.ctrl_mod
      && event.shiftKey == this.shift_mod
      && event.altKey == this.alt_mod
    ) {
      return true;
    }
    return false;
  }
  
}
