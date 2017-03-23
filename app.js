var canvas;
var gl;
var camera;
var rocket;
var stars;

var pp;

var prevTimeStamp;

function start() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.getExtension('OES_standard_derivatives');
  gl.getExtension('WEBGL_depth_texture');

  camera = new Camera();
  camera.setPosition(0.0, 0.0, 10.0);

  pp = new PostProcessingRenderer();

  setFullScreen();

  rocket = new Rocket(0.0);
  stars = new Starfield(400, 1000);

  window.addEventListener('resize', setFullScreen);

  drawScene();
}

function drawScene(timeStamp) {
  requestAnimationFrame(drawScene);

  var frameTime = timeStamp - prevTimeStamp || 0;
  prevTimeStamp = timeStamp;

  rocket.render(frameTime, camera);
  stars.render(camera);

  pp.render();
}

function setFullScreen() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.viewport(0, 0, canvas.width, canvas.height);
  camera.setAspectMatrix(canvas.width/canvas.height);

  pp.resize(canvas.width, canvas.height);
}
