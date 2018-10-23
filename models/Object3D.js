class Object3D {
  
  constructor(vertices, vertex_normals, texture_coordinates, indices) {
    this.vertices = vertices.length == 0 ? undefined : vertices;
    this.vertex_normals = vertex_normals.length == 0 ? undefined : vertex_normals;
    this.texture_coordinates = texture_coordinates.length == 0 ? undefined : texture_coordinates;
    this.indices = indices.length == 0 ? undefined : indices;
  }
  
  set Shader (shader_name) {
    this.shader = shader_name;
  }

  concat(obj) {
    this.indices = this.indices.concat(obj.indices.map(i => i + this.vertices.length / 3));
    this.vertices = this.vertices.concat(obj.vertices);
    this.vertex_normals = this.vertex_normals.concat(obj.vertex_normals);
    if (this.texture_coordinates)
      this.texture_coordinates = this.texture_coordinates.concat(obj.texture_coordinates);
  }
  
  static parse(source) {

    let match;
    /**
     * ## Get all vertices
    */
    let vertex_rx = /v ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?)/g;
    let vertices = [];
    while ((match = vertex_rx.exec(source)) != null) {
      vertices.push(
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3])
      );
    }

    /**
     * Get all texture coordinates
     */
    let tex_coord_rx = /vt ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?)/g;
    let tex_coord = [];
    while ((match = tex_coord_rx.exec(source)) != null) {
      tex_coord.push(
        parseFloat(match[1]),
        parseFloat(match[2])
      );
    }

    /**
     * ## Get all vertex normals
    */
    let vertex_norm_rx = /vn ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?)/g;
    let vertex_norm = [];
    while ((match = vertex_norm_rx.exec(source)) != null) {
      vertex_norm.push(
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3])
      );
    }

    /**
     * ## Get all faces
    */
    let face_rx = /((?<= )\d+(?=\/))/g;
    let faces = [];
    while ((match = face_rx.exec(source)) != null) {
      faces.push(
        parseInt(match[1]) - 1,
      );
    }

    return new Object3D(vertices, vertex_norm, tex_coord, faces);

  }

  static concat (obj1, obj2) {
    obj1.concat(obj2);
    return obj1;
  }
  
  static primitiveEllipsoid(resolution, center, radius_x, radius_y, radius_z) {
    
    if (!radius_y || !radius_z) {
      radius_y = radius_x;
      radius_z = radius_x;
    }
    
    if (!center) center = vec3.create();
    
    let vertices = [];
    let vertex_norm = [];
    let indices = [];
    
    let directions = [
      vec3.fromValues(1,  0,  0),
      vec3.fromValues(0,  0,  1),
      vec3.fromValues(-1, 0,  0),
      vec3.fromValues(0,  0, -1),
      vec3.fromValues(0,  1,  0),
      vec3.fromValues(0, -1,  0),
    ]
    
    for (let i = 0; i < 6; i++) { // all faces [frnt, right, back, left, top, bottom]
      for (let c = 0; c < resolution; c++) { // each column in face
        for (let r = 0; r < resolution; r++) { // each row in face
          
          let face_index = resolution * resolution * i;
          
          let dir = directions[i];
          let x = vec3.fromValues(dir[1], dir[2], dir[0]);
          let y = vec3.cross(vec3.create(), dir, x);
          
          let x_mul = (3 / resolution) * c - 1;
          let y_mul = (3 / resolution) * r - 1;
          
          let vertex = vec3.add( // add current direction with scaled xy vector
            vec3.create(),
            dir,
            vec3.add( // add scaled x and y
              vec3.create(),
              vec3.scale( // Scale current x
                vec3.create(),
                x,
                x_mul,
              ),
              vec3.scale( // Scale current y
                vec3.create(),
                y,
                y_mul,
              ),
            )
          );
          vec3.normalize(vertex, vertex);
          
          vertex_norm.push(vertex);
          // let radius = Math.cos(Math.abs(vec3.dot(vertex, directions[0]))) * radius_x +
          //   Math.cos(Math.abs(vec3.dot(vertex, directions[1]))) * radius_z +
          //   Math.cos(Math.abs(vec3.dot(vertex, directions[5]))) * radius_y;
          // θ = atan2(vz, √vx² + vy²)
          let theta = Math.atan2(
            vertex[2],
            Math.sqrt(Math.sqr(vertex[0]) + Math.sqr(vertex[1]))
          )
          // φ = atan2(vy, vx)
          let phi = Math.atan2(vertex[1], vertex[0]);
          //vec3.scale(vertex, vertex, radius);
          //                  cosθ·cosφ
          // v{ x, y, z }	=	 	cosθ·sinφ
          //                  sinθ
          vertex = vec3.fromValues(
            radius_x * Math.cos(theta) * Math.cos(phi),
            radius_y * Math.cos(theta) * Math.sin(phi),
            radius_z * Math.sin(theta),
          );
          vec3.add(
            vertex,
            vertex,
            center
          );
          vertices.push(vertex);
          
          if (c + 1 < resolution && r + 1 < resolution) {
            indices.push(face_index + ((c    ) * resolution + r    ));
            indices.push(face_index + ((c    ) * resolution + r + 1));
            indices.push(face_index + ((c + 1) * resolution + r + 1));
            indices.push(face_index + ((c    ) * resolution + r    ));
            indices.push(face_index + ((c + 1) * resolution + r + 1));
            indices.push(face_index + ((c + 1) * resolution + r    ));
          }
          
        }
      }
    }
    
    vertices = vertices.reduce((acc, val) => {
      acc.push(val[0], val[1], val[2]);
      return acc;
    }, []);
    vertex_norm = vertex_norm.reduce((acc, val) => {
      acc.push(val[0], val[1], val[2]);
      return acc;
    }, []);
    
    return new Object3D(vertices, vertex_norm, [], indices);
    
  }
  
  static primitivePlane (resolution, x_size, y_size, x_dir, y_dir) {
    
    let vertices = [];
    let vertex_norm = [];
    let indices = [];
    
    for (let x = 0; x <= resolution; x++) { // each column in face
      for (let y = 0; y <= resolution; y++) { // each row in face
        
        let face_index = x * resolution + y;

        let vertex = vec3.add( // add scaled x and y
          vec3.create(),
          vec3.scale( // Scale current x
            vec3.create(),
            x_dir,
            x / resolution * x_size,
          ),
          vec3.scale( // Scale current y
            vec3.create(),
            y_dir,
            y / resolution * y_size,
          ),
        );

        vertices.push(vertex);
        let normal = vec3.cross(
          vec3.create(),
          x_dir,
          y_dir
        );
        vertex_norm.push(normal);

        if (x + 1 <= resolution && y + 1 <= resolution) {
          indices.push(face_index + ((x    ) * resolution + y    ));
          indices.push(face_index + ((x    ) * resolution + y + 1));
          indices.push(face_index + ((x + 1) * resolution + y + 1));
          indices.push(face_index + ((x    ) * resolution + y    ));
          indices.push(face_index + ((x + 1) * resolution + y + 1));
          indices.push(face_index + ((x + 1) * resolution + y    ));
        }

      }
    }

    vertices = vertices.reduce((acc, val) => {
      acc.push(val[0], val[1], val[2]);
      return acc;
    }, []);
    vertex_norm = vertex_norm.reduce((acc, val) => {
      acc.push(val[0], val[1], val[2]);
      return acc;
    }, []);
    
    return new Object3D(vertices, vertex_norm, [], indices);

  }
  
}
