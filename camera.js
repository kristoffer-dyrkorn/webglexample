var DEGREES_TO_RADIANS = Math.PI / 180.0;
var FIELD_OF_VIEW = 60.0 * DEGREES_TO_RADIANS;
var NEAR_CLIP = 1;
var FAR_CLIP = 500;

class Camera {
  constructor() {
    this.projectionMatrix = new Matrix();
    this.viewMatrix = new Matrix();
    this.cameraMatrix = new Matrix();
  }

  setPosition(x, y, z) {
    this.viewMatrix.setPosition(x, y, z);
    this.recalcCameraMatrix();
  }

  rotateZ(angle) {
    this.viewMatrix.rotate(0, 0, angle * DEGREES_TO_RADIANS);
    this.recalcCameraMatrix();
  }

  recalcCameraMatrix() {
    this.cameraMatrix = new Matrix(this.viewMatrix);
    this.cameraMatrix.invertCamera();
  }

  setAspectMatrix(aspect) {
    this.projectionMatrix.setProjection(FIELD_OF_VIEW, aspect, NEAR_CLIP, FAR_CLIP);
  }

  getCameraMatrix() {
    return this.cameraMatrix;
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }
}
