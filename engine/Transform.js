
class Transform {
  
  constructor (
    position = vec3.create(),
    scale = vec3.fromValues(1, 1, 1),
    rotation = quat.create()
  ) {

    this._position = position;
    this._scale = scale;
    this._rotation = rotation;

  }

  set position(v) {
    this._position = v;
  }
  get position() {
    return this._position;
  }

  set scale(s) {
    this._scale = s;
  }
  get sacle() {
    return this._sacle;
  }

  set rotation(r) {
    this._rotation = r;
  }
  get rotation() {
    return this._rotation;
  }
  
  createKeyboardShortcuts(KBSM) {

    /**
     * ### Moving
    */
    {
      KBSM.onKeyPress('ArrowLeft', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(-.1, 0, 0));
      });
      KBSM.onKeyPress('ArrowRight', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(.1, 0, 0));
      });
      KBSM.onKeyPress('ArrowUp', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(0, 0, .1));
      });
      KBSM.onKeyPress('ArrowDown', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(0, 0, -.1));
      });
      KBSM.onKeyPress('x', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(0, .1, 0));
      });
      KBSM.onKeyPress('z', () => {
        if (this.locked) return;
        this.position = vec3.add(this.position, this.position, vec3.fromValues(0, -.1, 0));
      });
    }
    /**
     * ### Rotating
    */
    {
      KBSM.onKeyPress('shift+ArrowUp', () => {
        if (this.locked) return;
        this.rotation = quat.rotateX(
          this.rotation,
          this.rotation,
          -.02
        )
      });
      KBSM.onKeyPress('shift+ArrowDown', () => {
        if (this.locked) return;
        this.rotation = quat.rotateX(
          this.rotation,
          this.rotation,
          .02
        )
      });
      KBSM.onKeyPress('shift+ArrowLeft', () => {
        if (this.locked) return;
        this.rotation = quat.rotateY(
          this.rotation,
          this.rotation,
          .02
        )
      });
      KBSM.onKeyPress('shift+ArrowRight', () => {
        if (this.locked) return;
        this.rotation = quat.rotateY(
          this.rotation,
          this.rotation,
          -.02
        )
      });
      KBSM.onKeyPress('shift+z', () => {
        if (this.locked) return;
        this.rotation = quat.rotateZ(
          this.rotation,
          this.rotation,
          .02
        )
      });
      KBSM.onKeyPress('shift+x', () => {
        if (this.locked) return;
        this.rotation = quat.rotateZ(
          this.rotation,
          this.rotation,
          -.02
        )
      });
    }
  }
  
}