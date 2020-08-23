var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");

// 顶点着色器
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_ModelMatrix * a_Position;\n" +
  "}\n";

//  片元着色器
var FSHADER_SOURCE =
  "void main() {\n" + "  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" + "}\n";

var ANGLE_STEP = 45.0;

function createShader(gl, sourceCode, type) {
  // 关联创建当前上下文的着色器
  var shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var info = gl.getShaderInfoLog(shader);
    throw "Could not compile WebGL program. \n\n" + info;
  }
  return shader;
}

var vertexShader = createShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
var fragmentShader = createShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
//创建程序
var program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);
gl.program = program;

// 顶点注入
var n = initVertexBuffers(gl);

// 清除canvasColor
gl.clearColor(0, 0, 0, 1);

// 得到模型矩阵
var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
if (!u_ModelMatrix) {
  console.log("Failed to get the storage location of u_ModelMatrix");
} else {
  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var g_last = Date.now();

  var tick = function () {
    currentAngle = animate(currentAngle); // 更新旋转角度
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); //绘制
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  //创建缓存区，注入数据
  var vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  var n = 3; // 顶点数

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //以attribute形式注入顶点
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 需要启用对其的赋值
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // Set the rotation matrix
  modelMatrix.setRotate(currentAngle, 1, 0, 0);
  // modelMatrix.translate(0.35, 0, 0);

  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Last time that this function was callez

function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return (newAngle %= 360);
}
