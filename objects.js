var DEGREES_TO_RADIANS = Math.PI / 180.0;

class Rocket {
  constructor(speed) {
    this.speed = speed;
    this.rotationRate = new Vector(0.0, 7.0, 0.0);

    this.geometry = new TriangleGeometry();
    this.geometry.setTexture('textures/chess.jpg');
  }

  render(time, camera) {
    this.geometry.moveForward(this.speed * time);
    this.geometry.rotate(0, 0, this.rotationRate[1] * DEGREES_TO_RADIANS * time);

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
