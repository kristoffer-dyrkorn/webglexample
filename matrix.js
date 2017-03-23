class Matrix extends Float32Array {
  constructor(m) {
    super(16);
    if (arguments.length === 1) {
      this.set(m);
    } else {
      this[0] = 1.0;
      this[5] = 1.0;
      this[10] = 1.0;
      this[15] = 1.0;
    }
  }

  swap(a, b) {
     var tmp = this[a]; this[a] = this[b]; this[b] = tmp;
  }

  invertCamera() {
    this.swap(1, 4);
    this.swap(2, 8);
    this.swap(3, 12);
    this.swap(6, 9);
    this[12] = -this[12];
    this[13] = -this[13];
    this[14] = -this[14];
  }

  setPosition(x, y, z) {
    this[12] = x;
    this[13] = y;
    this[14] = z;
  }

  moveForward(dist) {
    this[12] += this[4] * dist;
    this[13] += this[5] * dist;
    this[14] += this[6] * dist;
  }

  rotate(rx, ry, rz) {
    var x = new Vector(this[0], this[1], this[2]);
    var y = new Vector(this[4], this[5], this[6]);
    var z = new Vector(this[8], this[9], this[10]);

    if (rz != 0.0) {
      x.rotate(y, z, rz);
    }

    if (ry != 0.0) {
      z.rotate(x, y, ry);
    }

    if (rx != 0.0) {
      y.rotate(z, x, rx);
    }

    this[0] = x[0]; this[1] = x[1]; this[2] = x[2];
    this[4] = y[0]; this[5] = y[1]; this[6] = y[2];
    this[8] = z[0]; this[9] = z[1]; this[10] = z[2];
  }

  setProjection(fovy, aspect, near, far) {
     var f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
     this[0] = f / aspect;
     this[5] = f;
     this[10] = (far + near) * nf;
     this[11] = -1;
     this[14] = (2 * far * near) * nf;
     this[15] = 0;
  }
}

class Vector extends Float32Array {
  constructor(x, y, z) {
    super(3);
    if (arguments.length === 3) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
    }
  }

  rotate(to, perp, angle) {
     this.scale(Math.cos(angle));
     to.scale(Math.sin(angle));
     this.add(to);
     this.normalize();
     to.cross(perp, this);
  }

  cross(a, b) {
     this[0] = a[1] * b[2] - a[2] * b[1];
     this[1] = a[2] * b[0] - a[0] * b[2];
     this[2] = a[0] * b[1] - a[1] * b[0];
  }

  add(v) {
     this[0] += v[0];
     this[1] += v[1];
     this[2] += v[2];
  }

  scale(s) {
     this[0] *= s;
     this[1] *= s;
     this[2] *= s;
  }

  normalize() {
     var len = Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
     this.scale(1.0/len);
  }
}
