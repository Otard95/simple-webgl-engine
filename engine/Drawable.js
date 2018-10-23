
class Drawable extends Transform {
  
  constructor(
    position = vec3.create(),
    scale = vec3.fromValues(1, 1, 1),
    rotation = quat.create()
  ) {
    super(position,scale,rotation);
  }
  
  draw (gl, projection_matrix, view_matrix, light) {
    if (gl === undefined || gl === null ||
        projection_matrix === undefined || projection_matrix === null ||
        view_matrix === undefined || view_matrix === null ||
        (!light instanceof Light)
       ) throw new Error('Uninitilized or invalid paramater!');
  }
  
}