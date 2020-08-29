var canvas = document.getElementById('myCanvas')//获取canvas
var gl = canvas.getContext('webgl')//获取webGL上下文

var program = gl.createProgram()//创建程序

var VSHADER_SOURCE, FSHADER_SOURCE
//定义顶点着色器、片元着色器源码
VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +//视图投影矩阵
    //定义漫反射顶点着色器传值
    'varying vec4 v_Color;\n' +
    'varying vec4 v_Normal;\n' +
    'varying vec4 v_Position;\n'+
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +//计算位置
    //设置漫反射顶点着色器传值片元着色器
    '  v_Color = a_Color;\n' +
    '  v_Normal = a_Normal;\n' +
    '  v_Position = a_Position;\n'+
    '}\n';

FSHADER_SOURCE =
    //fragmentShader精度设置
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    //漫反射传值定义
    'uniform vec3 u_LightColor;\n' +
    //'uniform vec3 u_LightDir;\n' +//方向光
    'uniform vec3 u_LightColorAmbient;\n' +//环境光
    'uniform vec3 u_LightPosition;\n' +//点光源位置
    'uniform vec3 u_ViewDir;\n' +//高光设置
    'varying vec4 v_Color;\n' +
    'varying vec4 v_Normal;\n' +//法线
    'varying vec4 v_Position;\n'+
    'void main() {\n' +
    //漫反射计算公式
    '  vec3 normal = normalize(vec3(v_Normal));\n' +//法线归一化
    '  vec3 lightDirection = normalize(u_LightPosition - vec3(v_Position));\n' +//点光源
    '  float cos = max(dot(lightDirection, normal), 0.0);\n' +//角度
    //'  float cos = max(dot(u_LightDir, normal), 0.0);\n' +//角度
    '  vec3 diffuse = u_LightColor * v_Color.rgb * cos;\n' +
    '  vec3 ambient = u_LightColorAmbient * v_Color.rgb;\n' +
    //设置高光公式
    '  vec3 nDotLight = normal * dot(normal, lightDirection);\n' +
    '  vec3 r = lightDirection - nDotLight - nDotLight;\n' +
    '  float nDotView = max(dot(r, u_ViewDir), 0.0);\n' +
    '  float shininess = 3.0;\n' +//高光强度
    '  float k = 1.0;\n' +
    '  vec3 specular = k * pow(nDotView, shininess) * v_Color.rgb;\n' + 
    //效果相加
    '  vec4 r_Color = vec4(diffuse + ambient + specular, v_Color.a);\n' +
    //颜色渲染
    '  gl_FragColor = r_Color;\n' +
    '}\n';

var vertexShader, fragmentShader
//创建着色器（gl上下文、着色器源码,着色器类型）
function createShader (gl, sourceCode,type) {
  // create shader
  var shader = gl.createShader(type)
  gl.shaderSource(shader, sourceCode)
  gl.compileShader(shader)
  return shader
}

// define vertex shader
vertexShader = createShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER)
// define frament shader
fragmentShader = createShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER)

// attach shader to program
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)

// link program to context
gl.linkProgram(program)
gl.useProgram(program)
gl.program = program

var tick = function () {
  draw()
  requestAnimationFrame(tick)//循环tick
}

function initVertexBuffers (gl) {//加载顶点数据
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var vertices = new Float32Array([   // Vertex coordinates（点坐标）
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    // 每个顶点的法向量
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);

    var colors = new Float32Array([     // Colors
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v1-v2-v3 front(white)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v3-v4-v5 right(white)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v5-v6-v1 up(white)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v1-v6-v7-v2 left(white)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v7-v4-v3-v2 down(white)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0   // v4-v7-v6-v5 back(white)
    ]);

    var indices = new Uint8Array([       // Indices of the vertices,三角面绘制规则
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    // Create a buffer object
    var indexBuffer = gl.createBuffer();
    
    initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')
    initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')
    initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;//返回点数
}
//(gl上下文，ArrayBuffer数据，以几组数据为一点，数据类型，着色器中对应变量名)
function initArrayBuffer(gl, data, num, type, attribute) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  　// Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    //将当前绑定到gl.ARRAY_BUFFER的缓冲区到顶点缓存区
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);//许可缓冲区分配变量
  
    gl.bindBuffer(gl.ARRAY_BUFFER, null);//清空bindBuffer中的gl.ARRAY_BUFFER缓存区
  
    return true;
}

function normalizeVector (vector) {//标准化向量
    var len = Math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2)
    return [vector[0] / len, vector[1] / len, vector[2] / len]
}
  

// write the positions of vertices to a vertex shader
var n = initVertexBuffers(gl)//加载顶点

gl.clearColor(0, 0, 0, 1)//背景色

gl.enable(gl.DEPTH_TEST);//深度检测

//摄像机视图
// Get the storage location of u_MvpMatrix
var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
// Set the eye point and the viewing volume
var mvpMatrix = new Matrix4();
mvpMatrix.setPerspective(30, 1, 1, 100);
mvpMatrix.lookAt(4, 3, 7, 0, 0, 0, 0, 1,0);
//关联gl设置视图
gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

//方向光设置
var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);//光颜色
// var dir = normalizeVector([0.5, 3.0, 4.0]);//方向设置（标准化向量）
// var u_LightDir = gl.getUniformLocation(gl.program, 'u_LightDir');//获取着色器中的变量
// gl.uniform3f(u_LightDir, dir[0], dir[1], dir[2]);
var u_LightColorAmbient = gl.getUniformLocation(gl.program, 'u_LightColorAmbient');
gl.uniform3f(u_LightColorAmbient, 0.2, 0.2, 0.2);//环境光强度设置
//点光源
var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
gl.uniform3f(u_LightPosition, 1.15, 2.0, 1.75);
//高光
var viewDir = normalizeVector([1.15, 2.0, 1.75]);
var u_ViewDir = gl.getUniformLocation(gl.program, 'u_ViewDir');
gl.uniform3f(u_ViewDir, viewDir[0], viewDir[1], viewDir[2]);

function draw () {
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube索引方式绘制（三角面，绘制点数，前面的数据类型,偏移）
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}

tick()