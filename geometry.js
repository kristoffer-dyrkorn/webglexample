class Geometry {

  constructor(num) {
    this.vertices = new Float32Array(3*num);
    this.colors = new Float32Array(4*num);
    this.normals = new Float32Array(3*num);
    this.indices = new Uint16Array(num);    // TODO - justere
    this.modelMatrix = new Matrix();
  }

  render(camera) {
    this.renderer.render(camera, this.modelMatrix);
  }

  moveForward(dist) {
    this.modelMatrix.moveForward(dist);
  }

  rotate(x, y, z) {
    this.modelMatrix.rotate(x, y, z);
  }
}


class TriangleGeometry extends Geometry {
  constructor() {
    super(3);
    this.primitiveType = gl.TRIANGLES;

    this.vertices[0] = 0.0; this.vertices[1] = 1.0; this.vertices[2] = 0.0;
    this.vertices[3] = 0.5; this.vertices[4] = -0.5; this.vertices[5] = 0.0;
    this.vertices[6] = -0.5; this.vertices[7] = -0.5; this.vertices[8] = 0.0;

    this.indices[0] = 0; this.indices[1] = 1; this.indices[2] = 2;

    this.normals[0] = 0.0; this.normals[1] = 0.0; this.normals[2] = 1.0;
    this.normals[3] = 0.0; this.normals[4] = 0.0; this.normals[5] = 1.0;
    this.normals[6] = 0.0; this.normals[7] = 0.0; this.normals[8] = 1.0;

    this.colors[0] = 1.0; this.colors[1] = 1.0; this.colors[2] = 1.0; this.colors[3] = 1.0;
    this.colors[4] = 1.0; this.colors[5] = 0.0; this.colors[6] = 0.0; this.colors[7] = 1.0;
    this.colors[8] = 0.0; this.colors[9] = 1.0; this.colors[10] = 0.0; this.colors[11] = 1.0;

    this.vs = `
      attribute vec3 vertexPosition;
      attribute vec4 vertexColor;
      attribute vec3 vertexNormal;

      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;

      varying lowp vec4 vColor;

      void main(void) {

        vec3 lightDirection = vec3(0.7, 0.0, 0.7);
        vec3 vNormal = vec3(viewMatrix * modelMatrix * vec4(vertexNormal, 0.0));
        float dir = max(dot(vNormal, lightDirection), 0.0);

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
        vColor = vertexColor * dir;
      }
    `;

    this.fs = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `;

    this.renderer = new Renderer(this);
  }
}

class PointGeometry extends Geometry {
  constructor(num) {
    super(num);
    this.primitiveType = gl.POINTS;

    var r = 400;

    // https://www.jasondavies.com/maps/random-points/
    for (var i=0; i<num; i++) {
      var z = s();
      var a = Math.PI * s();
      var p = Math.sqrt(1-z*z);
      
      this.indices[i] = i;
      this.vertices[3*i+0] = r * p * Math.cos(a);
      this.vertices[3*i+1] = r * p * Math.sin(a);
      this.vertices[3*i+2] = r * z;

      this.colors[4*i+0] = 0.7;
      this.colors[4*i+1] = 0.7;
      this.colors[4*i+2] = 0.7;
      this.colors[4*i+3] = 1.0;
    }

    this.vs = `
      attribute vec3 vertexPosition;
      attribute vec4 vertexColor;
      attribute vec3 vertexNormal;

      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;

      varying lowp vec4 vColor;

      void main() {
        // http://stackoverflow.com/a/17314320 "you do not use ... in your vertex program, so the GLSL-Compiler optimizes it by removing it"
        vec3 vNormal = vertexNormal;
        gl_PointSize = 2.5;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
        vColor = vertexColor;
      }
    `;

// https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
    this.fs = `
      #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
      #endif

      precision mediump float;

      varying lowp vec4 vColor;

      void main() {
        float alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
      #ifdef GL_OES_standard_derivatives
        float delta = fwidth(r);
        alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
      #endif

        gl_FragColor = vColor * alpha;
      }
    `;

    this.renderer = new Renderer(this);
  }
}

function s() {
  return 2.0 * Math.random() - 1.0;
}
