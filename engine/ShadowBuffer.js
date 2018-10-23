
class ShadowBuffer {
  
  constructor (width, height) {
    
    this.width = width;
    this.height = height;
    
  }
  
  init (gl) {
    
    // The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
    // GLuint FramebufferName = 0;
    // glGenFramebuffers(1, & FramebufferName);
    // glBindFramebuffer(GL_FRAMEBUFFER, FramebufferName);

    
    
    this.frame_buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
    
    // // Depth texture. Slower than a depth buffer, but you can sample it later in your shader
    // GLuint depthTexture;
    // glGenTextures(1, & depthTexture);
    // glBindTexture(GL_TEXTURE_2D, depthTexture);
    // glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, 1024, 1024, 0, GL_DEPTH_COMPONENT, GL_FLOAT, 0);
    // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    
    
    this.depth_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depth_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    
    this.color_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.color_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // glFramebufferTexture(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTexture, 0);
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depth_texture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color_texture, 0);

    // glDrawBuffer(GL_NONE); // No color buffer is drawn to.

    // // Always check that our framebuffer is ok
    // if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
    
    status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      console.log("The created frame buffer is invalid: " + status.toString());
    }
    
    
    // let shadowFramebuffer = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

    // let shadowDepthTexture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texImage2D(
    //   gl.TEXTURE_2D, 0, gl.RGBA,
    //   this.width, this.height, 0,
    //   gl.RGBA, gl.UNSIGNED_BYTE, null
    // );

    // let renderBuffer = gl.createRenderbuffer();
    // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    //   this.width, this.height);

    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
    //   gl.TEXTURE_2D, shadowDepthTexture, 0)
    // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    //   gl.RENDERBUFFER, renderBuffer)

    // gl.bindTexture(gl.TEXTURE_2D, null)
    // gl.bindRenderbuffer(gl.RENDERBUFFER, null)

    // // Step 5: Verify that the frame buffer is valid.
    // gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    // status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    // if (status != gl.FRAMEBUFFER_COMPLETE) {
    //   console.log("The created frame buffer is invalid: " + status.toString());
    // }

    // // Unbind these new objects, which makes the default frame buffer the
    // // target for rendering.
    // gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // this.frame_buffer = shadowFramebuffer;
    // this.deapth_texture = shadowDepthTexture;
    // this.render_buffer = renderBuffer;
    
  }
  
  getPixels (gl) {
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
    
    let pixels = new Uint8Array(this.width * this.height * 4);
    
    gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return pixels;
    
  }
  
}