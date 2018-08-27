var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_tMatrix;\n' +
  'uniform mat4 u_sMatrix;\n' +
  'uniform mat4 u_rMatrix;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_tMatrix * u_sMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * u_sMatrix * u_tMatrix * a_Normal));\n' +
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
  '  vec4 V_Color = texture2D(u_Sampler, v_TexCoord);\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * V_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * V_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, V_Color.a);\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var sunImage = new Image();
  var skyImage = new Image();
  var planetImage = [];

  for (var i = 0; i <= 12; i++){
    planetImage[i] = new Image();
    planetImage[i].crossOrigin = "anonymous";
  }

  planetImage[0].src = 'http://i.imgur.com/8Le8diu.jpg';
  planetImage[1].src = 'http://i.imgur.com/FEDdd7u.jpg';
  planetImage[2].src = 'http://i.imgur.com/zPq6wim.jpg';
  planetImage[3].src = 'http://i.imgur.com/zPq6wim.jpg'; //The same as the pervious as a workaround
  planetImage[4].src = 'http://i.imgur.com/0gvdQkS.jpg';
  planetImage[5].src = 'http://i.imgur.com/6LkS6Hu.jpg';
  planetImage[6].src = 'http://i.imgur.com/khCT183.jpg';
  planetImage[7].src = 'http://i.imgur.com/vCHTgfc.jpg';
  planetImage[8].src = 'http://i.imgur.com/peHaIsQ.jpg';
  planetImage[9].src = 'http://i.imgur.com/qPqr6Sv.jpg';
  planetImage[10].src = 'http://i.imgur.com/1nxMnnH.jpg';
  planetImage[11].src = 'http://i.imgur.com/m6s3x18.jpg';
  planetImage[12].src = 'http://i.imgur.com/CpjZWHV.jpg';

  sunImage.crossOrigin = "anonymous";
  skyImage.crossOrigin = "anonymous";
  sunImage.src = 'http://i.imgur.com/mmVcsAr.jpg';
  skyImage.src = 'http://i.imgur.com/XcKepoH.jpg';
  skyImage.onload = function(){
    var COUNT = 30;
    var MOONS = 0;
    var RANGE = 100.0;
    var VIEW = 3;
    var TRACK = 0;
    var DIST  = RANGE/2;
    var SPIN  = 1;
    var oList = []; //Orbital distance, how far the planet is from the sun
    var rList = []; //Rotational offset, so that the planets don't start in a line
    var vList = []; //Variance List, a Y offset to add some visual noise
    var sList = []; //Scale of the planets
    var tList = []; //Textures assigned to each planet
    var mList = []; //How many moons each planet has
    var mOList = []; //Below is a list of the same attributes, but for the moons
    var mRList = [];
    var mSList = [];
    var mTList = [];

    for (var i = 0; i < COUNT; i++){
      oList[i] = Math.floor((Math.random()*RANGE) + RANGE/5)
      rList[i] = Math.random()*Math.PI*2
      sList[i] = Math.abs(Math.random()*Math.sin((1 - (oList[i] / RANGE))*Math.PI*2)*RANGE/20)
      vList[i] = (Math.random()*((oList[i] / RANGE)*(RANGE/4))) - ((oList[i] / RANGE)*(RANGE/8))
      tList[i] = Math.floor(Math.random()*13)
      mList[i] = Math.floor(Math.random()*sList[i])
      for (var j = MOONS; i < MOONS+mList[i]; i++){
        mOList[j] = Math.floor((Math.random()*sList[i]*3.0) + sList[i])
        mRList[j] = Math.random()*Math.PI*2
        mSList[j] = Math.abs(Math.random()*Math.sin((1 - (mOList[j] / (sList[i]*4)))*Math.PI*2)*(sList[i]*4)/20)
        mTList[j] = Math.floor(Math.random()*13)
      }
    }

    var gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    var n= initVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    var sunTexture = initTextures(gl, sunImage);
    var skyTexture = initTextures(gl, skyImage);
    var planetTexture = [];

    for (var i = 0; i < 13; i++){
      planetTexture[i] = initTextures(gl, planetImage[i]);
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_tMatrix = gl.getUniformLocation(gl.program, 'u_tMatrix');
    var u_sMatrix = gl.getUniformLocation(gl.program, 'u_sMatrix');
    var u_rMatrix = gl.getUniformLocation(gl.program, 'u_rMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_tMatrix || !u_sMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) {
      console.log('Failed to get the storage location');
      return;
    }

    document.addEventListener('keydown', function(event) {
      if(event.keyCode == 37){
        VIEW += 0.05
      }
      if(event.keyCode == 39){
        VIEW -= 0.05
      }
      if(event.keyCode == 38){
        if(DIST > RANGE/8){
          DIST -= 0.5
        }
      }
      if(event.keyCode == 40){
        if (DIST < (RANGE*1.5)-5){
          DIST += 0.5
        }
      }
      if(event.keyCode == 65){
        if(TRACK == 0){
          TRACK = COUNT-1
        }
        TRACK --;
      }
      if(event.keyCode == 83){
        TRACK ++;
        if(TRACK == COUNT){
          TRACK = 0;
        }
      }
      if(event.keyCode == 32){
        if(SPIN == 1){
          SPIN = 0;
        } else {
          SPIN = 1;
        }
      }
    });

    function draw()
    {
      setTimeout(draw,30)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sunTexture);
      gl.uniform1i(u_Sampler, 0);

      var vpMatrix = new Matrix4();
      var modelMatrix = new Matrix4();
      var mvpMatrix = new Matrix4();
      var normalMatrix = new Matrix4();

      gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
      gl.uniform3f(u_LightPosition, 0.0,0.0,0.0);
      gl.uniform3f(u_AmbientLight, 1.0, 1.0, 1.0);

      vpMatrix.setPerspective(100, canvas.width/canvas.height, 1, RANGE*3);
      vpMatrix.lookAt(Math.cos(VIEW)*DIST + Math.sin(rList[TRACK])*oList[TRACK], vList[TRACK], Math.sin(VIEW)*DIST+Math.cos(rList[TRACK])*oList[TRACK], Math.sin(rList[TRACK])*oList[TRACK], vList[TRACK], Math.cos(rList[TRACK])*oList[TRACK], 0, 1, 0);
      mvpMatrix.set(vpMatrix).multiply(modelMatrix);

      sMat = new Matrix4(new Float32Array([
        RANGE/10.0,0.0,0.0,0.0,
        0.0,RANGE/10.0,0.0,0.0,
        0.0,0.0,RANGE/10.0,0.0,
        0.0,0.0,0.0,1.0
      ]))
      tMat = new Matrix4(new Float32Array([
        1.0,0.0,0.0,0.0,
        0.0,1.0,0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0
      ]))

      modelMatrix.setRotate(90, 0, 1, 0);
      normalMatrix.setInverseOf(modelMatrix);
      normalMatrix.transpose();

      gl.uniformMatrix4fv(u_tMatrix, false, tMat.elements);
      gl.uniformMatrix4fv(u_sMatrix, false, sMat.elements);
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

      sMat = new Matrix4(new Float32Array([
        RANGE*1.5,0.0,0.0,0.0,
        0.0,RANGE*1.5,0.0,0.0,
        0.0,0.0,RANGE*1.5,0.0,
        0.0,0.0,0.0,1.0
      ]))

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, skyTexture);
      gl.uniform1i(u_Sampler, 0);

      modelMatrix.setRotate(50, 0, 1, 0);
      normalMatrix.setInverseOf(modelMatrix);
      normalMatrix.transpose();

      gl.uniformMatrix4fv(u_tMatrix, false, tMat.elements);
      gl.uniformMatrix4fv(u_sMatrix, false, sMat.elements);
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

      gl.uniform3f(u_AmbientLight, 0.1, 0.1, 0.1);

      MOONS = 0;

      for(var i = 0; i < COUNT; i++)
      {
        sMat = new Matrix4(new Float32Array([
          sList[i],0.0,0.0,0.0,
          0.0,sList[i],0.0,0.0,
          0.0,0.0,sList[i],0.0,
          0.0,0.0,0.0,1.0
        ]))
        tMat = new Matrix4(new Float32Array([
          1.0,0.0,0.0,0.0,
          0.0,1.0,0.0,0.0,
          0.0,0.0,1.0,0.0,
          Math.sin(rList[i])*oList[i],vList[i],Math.cos(rList[i])*oList[i],1.0
        ]))

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, planetTexture[tList[i]]);
        gl.uniform1i(u_Sampler, 0);

        modelMatrix.setRotate(75, 0, 1, 0);
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        gl.uniformMatrix4fv(u_tMatrix, false, tMat.elements);
        gl.uniformMatrix4fv(u_sMatrix, false, sMat.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

        /*
        Code to render moons that rotate the planets
        ill advised to run
        entirely dimolishes the graphics card
        probably due a mistake on my part,
        should be fewer matrix multiplications than rendering the planets

        for (var j = MOONS; j < MOONS + mList[i]; j++){
          mTMat = new Matrix4(new Float32Array([
            1.0,0.0,0.0,0.0,
            0.0,1.0,0.0,0.0,
            0.0,0.0,1.0,0.0,
            Math.sin(mRList[j])*mRList[j],0.0,Math.cos(mRList[j])*mOList[j],1.0
          ]))

          tMat.multiply(mTMat);

          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, planetTexture[mTList[j]]);
          gl.uniform1i(u_Sampler, 0);

          modelMatrix.setRotate(75, 0, 1, 0);
          normalMatrix.setInverseOf(modelMatrix);
          normalMatrix.transpose();

          gl.uniformMatrix4fv(u_tMatrix, false, tMat.elements);
          gl.uniformMatrix4fv(u_sMatrix, false, sMat.elements);
          gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
          gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
          gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
          gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

          MOONS ++;
        }
        */
        if (SPIN == 1){
          rList[i] += (1 - (oList[i] / RANGE))*0.01;
        }
      }
    }
    draw();
  }
}

function initVertexBuffers(gl) { // Create a sphere
  var SPHERE_DIV = 24;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var texcoords = [];
  var indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z

      texcoords.push(i/SPHERE_DIV);  // S
      texcoords.push(j/SPHERE_DIV);  // T
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', new Float32Array(texcoords), gl.FLOAT, 2)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
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
