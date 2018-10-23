class Utils {
  
  static async fetch_txt (file_name) {
    
    const res = await fetch(file_name);
    return await res.text();
    
  }
  
  static async fetch_json(file_name) {

    const res = await fetch(file_name);
    return await res.json();

  }
  
  static is_pow_2 (val) {
    return val != 0 && val & (val-1) == 0
  }
  
  static load_img (src) {
    return new Promise((resolve, reject) => {
      let img_out = new Image();
      img_out.onload = () => {
        resolve(img_out);
      };
      img_out.onerror = (err) => {
        reject(`Failed to load image "${src}".`)
      };
      img_out.src = src;
    });
  }
  
  static async parse_obj (obj_file_name) {
    
    let obj_data = await this.fetch_txt(obj_file_name);
    
    let match;
    /**
     * ## Get all vertices
    */
    let vertex_rx = /v ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?) ([-]?\d+(?:\.\d+)?)/g;
    let vertices = [];
    while ((match = vertex_rx.exec(obj_data)) != null) {
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
    while ((match = tex_coord_rx.exec(obj_data)) != null) {
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
    while ((match = vertex_norm_rx.exec(obj_data)) != null) {
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
    while ((match = face_rx.exec(obj_data)) != null) {
      faces.push(
        parseInt(match[1]) - 1,
      );
    }
    
    // console.log(faces.length / 3);
    
    let max = 0;
    faces.forEach(f => {
      if (f > max) max = f;
    });
    
    // console.log(vertices.length / 3 == max, max);

    // console.log(
    //   vertices,
    //   tex_coord,
    //   vertex_norm,
    //   faces
    // );
    
    return {
      positions: vertices,
      indices: faces,
      vertexNormals: vertex_norm,
      textureCoordinates: tex_coord
    }
    
  }
  
  static random_string (len) {
    
    let out = '';
    for (let i = 0; i < Math.ceil(len/11); i++) {
      out += Math.random().toString(36).substring(2, Math.min(15, len - out.length + 2));
    }
    
    return out;
    
  }
  
}

/**
 * ### Extentions Methuds
*/

if (!String.prototype.forceLength)
String.prototype.forceLength = function (len, fill = ' ') {
  
  if (typeof fill !== 'string')
    throw new Error('Parameter `fill` must be of type `string`.');
  if (fill.length == 0)
    throw new Error('Parameter `fill` cannot be length 0.');
  if (typeof len !== 'number')
    throw new Error('Parameter `len` has to be of type `number`')
  
  if (this.length > len)   return this.substr(0, len);
  if (this.length === len) return this;
  let missingLength = (len - this.length);
  let nFill = Math.floor(missingLength / fill.length);
  let lastFill = fill.substr(0, len - (fill.length * nFill + this.length));
  if (String.prototype.repeat)
    return this + fill.repeat(nFill) + lastFill;
  else
    return this + Array().join(fill) + lastFill;
  
};

if (!String.prototype.trimLines)
String.prototype.trimLines = function (nLines = 1) {
  let out = this;
  for (let i = 0; i < nLines; i++) {
    out = out.substr(0, out.lastIndexOf('\n'));
  }
  return out;
}

if (!Math.sqr)
Math.sqr = function (val) {
  return Math.pow(val, 2);
}
