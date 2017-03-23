var DEGREES_TO_RADIANS = Math.PI / 180.0;

class Rocket {
  constructor(speed) {
    this.mass = 500;
    this.maxThrust = 100;
    this.thrust = 0;
    this.dragCoeff = 5;

    this.speed = speed;

    this.rotationRate = new Vector(0.0, 0.1, 0.0);
    this.rotationalInertia = new Vector(2.0, 2.0, 2.0);

    this.geometry = new TriangleGeometry();
  }

  render(frameTime, camera) {
    if (this.thrust > this.maxThrust) {
      this.thrust = this.maxThrust;
    }
    var drag = this.speed * this.speed * this.dragCoeff;
    var acc = (this.thrust - drag) / this.mass;
    this.speed += acc * frameTime / 1000;

    this.geometry.moveForward(this.speed * frameTime / 1000);
    this.geometry.rotate(0, 0, this.rotationRate[1] * DEGREES_TO_RADIANS);

    this.geometry.render(camera);
  }
}

class Starfield {
  constructor(r, num) {
    this.geometry = new PointGeometry(1000);
  }

  render(camera) {
    this.geometry.render(camera);
  }
}
