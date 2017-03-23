class Renderer {
  constructor(g) {
    this.numObjects = g.indices.length;
    this.primitiveType = g.primitiveType;

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, compileShader(g.vs, gl.VERTEX_SHADER));
    gl.attachShader(this.shaderProgram, compileShader(g.fs, gl.FRAGMENT_SHADER));
    gl.linkProgram(this.shaderProgram);

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.shaderProgram));
    }

    this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(this.vertexColorAttribute);

    this.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "vertexNormal");
    gl.enableVertexAttribArray(this.vertexNormalAttribute);

    this.modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, "modelMatrix");
    this.viewMatrixUniform = gl.getUniformLocation(this.shaderProgram, "viewMatrix");
    this.projectionMatrixUniform = gl.getUniformLocation(this.shaderProgram, "projectionMatrix");

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.vertices, gl.STATIC_DRAW);

    this.vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.colors, gl.STATIC_DRAW);

    this.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.normals, gl.STATIC_DRAW);

    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);

  }

  render(camera, modelMatrix) {
    gl.useProgram(this.shaderProgram);

    gl.uniformMatrix4fv(this.modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(this.viewMatrixUniform, false, camera.getCameraMatrix());
    gl.uniformMatrix4fv(this.projectionMatrixUniform, false, camera.getProjectionMatrix());

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.vertexAttribPointer(this.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.drawElements(this.primitiveType, this.numObjects, gl.UNSIGNED_SHORT, 0);
  }
}

function compileShader(src, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
  }

  return shader;
}


class PostProcessingRenderer {
  constructor() {
    this.colorBufferTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.colorBufferTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    this.depthBufferTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depthBufferTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    this.frameBuffer = gl.createFramebuffer(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorBufferTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthBufferTexture, 0);

    var vs = `
      attribute vec3 vertexPosition;

      varying lowp vec2 textureCoordinate;

      precision mediump float;

      void main() {
        gl_Position = vec4(vertexPosition, 1.0);
        textureCoordinate = 0.5 * (vertexPosition.xy + 1.0);
      }
    `;

    var fs = `
      uniform sampler2D colorBuffer;
      uniform sampler2D depthBuffer;

      varying lowp vec2 textureCoordinate;

      precision mediump float;

      void main() {
        vec4 d = texture2D(depthBuffer, textureCoordinate);
        gl_FragColor = texture2D(colorBuffer, textureCoordinate);

//        vec4 d = texture2D(colorBuffer, textureCoordinate);
//        gl_FragColor = texture2D(depthBuffer, textureCoordinate);
      }
    `;

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, compileShader(vs, gl.VERTEX_SHADER));
    gl.attachShader(this.shaderProgram, compileShader(fs, gl.FRAGMENT_SHADER));
    gl.linkProgram(this.shaderProgram);

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.shaderProgram));
    }

    this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.colorBufferUniform = gl.getUniformLocation(this.shaderProgram, "colorBuffer");
    this.depthBufferUniform = gl.getUniformLocation(this.shaderProgram, "depthBuffer");

    var vertices = new Float32Array(3*4);
    var indices = new Uint16Array(6);

    vertices[0] = -1.0; vertices[1] = -1.0; vertices[2] = 0.0;
    vertices[3] = 1.0; vertices[4] = -1.0; vertices[5] = 0.0;
    vertices[6] = 1.0; vertices[7] = 1.0; vertices[8] = 0.0;
    vertices[9] = -1.0; vertices[10] = 1.0; vertices[11] = 0.0;

    indices[0] = 0; indices[1] = 3; indices[2] = 2;
    indices[3] = 0; indices[4] = 2; indices[5] = 1;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  resize(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, this.colorBufferTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindTexture(gl.TEXTURE_2D, this.depthBufferTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
  }

  render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.shaderProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.colorBufferTexture);
    gl.uniform1i(this.colorBufferUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.depthBufferTexture);
    gl.uniform1i(this.depthBufferUniform, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    ///

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
