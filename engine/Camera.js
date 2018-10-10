
class Camera {
  
  constructor (
    position = vec3.fromValues(0, -1, -7),
    rotation = quat.create(),
    move_speed = 0.1,
    rot_speed = 0.02
  ) {
    
    this._position = position;
    this._rotation = rotation;
    this._move_speed = move_speed;
    this._rot_speed = rot_speed;
    
    this.view_matrix = mat4.create();
    this.updateViewMatrix();
    
    // this.view_matrix = mat4.fromRotationTranslation(
    //   mat4.create(),
    //   this._rotation,
    //   this._position
    // );
    
  }
  
  updateViewMatrix() {
    mat4.fromQuat(
      this.view_matrix,
      this.rotation
    )
    mat4.translate(
      this.view_matrix,
      this.view_matrix,
      this.position
    );
  }
  
  get position() {
    return this._position;
  }
  set position(v) {
    this._position = v;
    this.updateViewMatrix();
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(q) {
    this._rotation = q;
    this.updateViewMatrix();
  }
  get forward() {
    let out_vec = vec3.fromValues(0, 0, 1);
    out_vec = vec3.transformQuat(
      out_vec,
      out_vec,
      quat.conjugate(quat.clone(this._rotation), this._rotation)
    );
    return out_vec;
  }
  get up() {
    let out_vec = vec3.fromValues(0, 1, 0);
    out_vec = vec3.transformQuat(
      out_vec,
      out_vec,
      quat.conjugate(quat.clone(this._rotation), this._rotation)
    );
    return out_vec;
  }
  get right() {
    let out_vec = vec3.fromValues(1, 0, 0);
    out_vec = vec3.transformQuat(
      out_vec,
      out_vec,
      quat.conjugate(quat.clone(this._rotation), this._rotation)
    );
    return out_vec;
  }
  
  createKeyboardShortcuts (KBSM) {
    
    /**
     * ### Movement
    */
    {
    KBSM.onKeyPress('ArrowUp', () => {
      let move_dir = this.forward;
      vec3.scale(move_dir, move_dir, this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    KBSM.onKeyPress('ArrowDown', () => {
      let move_dir = this.forward;
      vec3.scale(move_dir, move_dir, -this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    KBSM.onKeyPress('ArrowRight', () => {
      let move_dir = this.right;
      vec3.scale(move_dir, move_dir, -this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    KBSM.onKeyPress('ArrowLeft', () => {
      let move_dir = this.right;
      vec3.scale(move_dir, move_dir, this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    KBSM.onKeyPress('x', () => {
      let move_dir = this.up;
      vec3.scale(move_dir, move_dir, -this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    KBSM.onKeyPress('z', () => {
      let move_dir = this.up;
      vec3.scale(move_dir, move_dir, this._move_speed);
      this.position = vec3.add(
        this.position,
        this.position,
        move_dir
      )
    });
    }
    /**
     * ### Rotation
    */
    {
    KBSM.onKeyPress('shift+ArrowUp', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.right, this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    KBSM.onKeyPress('shift+ArrowDown', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.right, -this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    KBSM.onKeyPress('shift+ArrowRight', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.up, this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    KBSM.onKeyPress('shift+ArrowLeft', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.up, -this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    KBSM.onKeyPress('shift+x', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.forward, this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    KBSM.onKeyPress('shift+z', () => {
      let rotation = quat.create();
      quat.setAxisAngle(rotation, this.forward, -this._rot_speed);
      this.rotation = quat.mul(
        this.rotation,
        this.rotation,
        rotation
      )
    });
    }
  }
  
}