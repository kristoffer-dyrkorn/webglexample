class Renderer {
  constructor(g) {
    this.numObjects = g.indices.length;
    this.primitiveType = g.primitiveType;
    this.textureNumber = g.textureNumber;
    this.texture = g.texture;

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

    this.textureCoordinateAttribute = gl.getAttribLocation(this.shaderProgram, "textureCoordinate");
    gl.enableVertexAttribArray(this.textureCoordinateAttribute);

    this.modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, "modelMatrix");
    this.viewMatrixUniform = gl.getUniformLocation(this.shaderProgram, "viewMatrix");
    this.projectionMatrixUniform = gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
    this.textureUniform = gl.getUniformLocation(this.shaderProgram, "texture");

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.vertices, gl.STATIC_DRAW);

    this.vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.colors, gl.STATIC_DRAW);

    this.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.normals, gl.STATIC_DRAW);

    this.textureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinateBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g.textureCoordinates, gl.STATIC_DRAW);

    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);

  }

  setTexture(textureNumber, texture) {
    this.textureNumber = textureNumber;
    this.texture = texture;
  }

  render(camera, modelMatrix) {
    gl.useProgram(this.shaderProgram);

    if (this.textureNumber > -1) {
      gl.activeTexture(gl.TEXTURE0 + this.textureNumber);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.textureUniform, this.textureNumber);
    }

    gl.uniformMatrix4fv(this.modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(this.viewMatrixUniform, false, camera.getCameraMatrix());
    gl.uniformMatrix4fv(this.projectionMatrixUniform, false, camera.getProjectionMatrix());

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.vertexAttribPointer(this.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinateBuffer);
    gl.vertexAttribPointer(this.textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);

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
