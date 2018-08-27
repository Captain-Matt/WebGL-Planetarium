var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';


var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, color.a);\n' +
  '}\n';

function main()
{
  var sphereImage = new Image();
  sphereImage.crossOrigin = "anonymous";

  sphereImage.onload = function()
  {
    render(sphereImage);
  }

  sphereImage.src = 'http://i.imgur.com/DmHHCxr.jpg?1';
}

function render(sphereImage)
{

  var canvas = document.getElementById('webgl',{alpha: false});
  var gl = getWebGLContext(canvas);
  if (!gl)
  {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
  {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0)
  {
    console.log('Failed to set the vertex information');
    return;
  }

  var sphereTexture = initTextures(gl, sphereImage);

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight)
  {
    console.log('Failed to get the storage location');
    return;
  }

  var vpMatrix = new Matrix4();
  vpMatrix.setPerspective(60, canvas.width/canvas.height, 1, 190);
  vpMatrix.lookAt(0, 0, 14, 0, 0, 0, 0, 1, 0);

  gl.uniform3f(u_LightColor, 1.2, 1.2, 1.2);
  gl.uniform3f(u_LightPosition, 6.0, 8.0, 7.0);
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
  gl.uniform1i(u_Sampler, 0);

  var currentAngle = 0.0;
  var modelMatrix = new Matrix4();
  var mvpMatrix = new Matrix4();
  var normalMatrix = new Matrix4();

  var tick = function()
  {
    currentAngle = animate(currentAngle);
    modelMatrix.setRotate(currentAngle, 0, 1, 0);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl)
{
  var SPHERE_DIV = 32;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var texcoords = [];
  var indices = [];

  for (j = 0; j <= SPHERE_DIV; j++)
  {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++)
    {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj + 2);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj + 1);  // Z

      texcoords.push(i/SPHERE_DIV);  // S
      texcoords.push(j/SPHERE_DIV);  // T
    }
  }

  for (j = 0; j < SPHERE_DIV; j++)
  {
    for (i = 0; i < SPHERE_DIV; i++)
    {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3))
    return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', new Float32Array(texcoords), gl.FLOAT, 2))
    return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))
    return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer)
  {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num)
{
  var buffer = gl.createBuffer();
  if (!buffer)
  {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0)
  {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

var ANGLE_STEP = 30.0;
var g_last = Date.now();
function animate(angle)
{
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function initTextures(gl, image)
{
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}
