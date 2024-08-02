// qmatom.js (C) 2021 by Paul Falstad

// Thanks to the authors of gl-matrix.js. Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
//Thanks to Nathan Cahill for Split.js. Copyright (c) 2019 Nathan Cahill

import Split from './split.js';

var buffers, projectionMatrix, viewMatrix;

var atomProgramInfo;
var colorPlainProgramInfo;
var glCanvas;
var dragging, dragStop;
var animating = false;
var zoom3d = .23
var sqrt12 = Math.sqrt(.5)
var nChooser, mChooser, lChooser, viewChooser;
var sampleCount;
var selectText;

var sliceChooser;
const SLICE_NONE = 0;
const SLICE_X = 1;
const SLICE_Y = 2;
const SLICE_Z = 3;
var sliceval = 0;
var sliceFaces = [];
var selectedSlice;

const qatomController = getById('qatomcontroller');
const speedController = getById("speed");
const optionsHeading = document.getElementsByClassName("choose-option");
const breakinglines = document.getElementsByClassName("breaker-line");
const selecters = document.getElementsByClassName("selecter");
const brightnessText = getById("brightnessText");
const simulationText = getById("simulationText");

const realBrightnessText = brightnessText.innerHTML;
const realSimulationText = simulationText.innerHTML;

var setDisplayNone;

var gl;
var phaseTexture;
var compiledStates;
var compiledSliced;
const pi = Math.PI;
const pi2 = pi * 2;
const root2 = 1.41421356237309504880;    // sqrt(2)
const root2inv = .70710678118654752440;  // 1/sqrt(2)
const root6by4 = .61237243569579452454;  // sqrt(6)/4

var deltaTimeWithoutSpeed
var zoomRate = 0
var autoZooming;

var rotationMatrix = mat4.create()
var inverseRotationMatrix = mat4.create();

var states;
var stateCount;
var realBasis, n2l1xBasis, n2l1yBasis, n3l1xBasis, n3l1yBasis, n3l2xBasis, n3l2yBasis,
  n4l1xBasis, n4l1yBasis, n4l2xBasis, n4l2yBasis,
  n4l3xBasis, n4l3yBasis, n4l3CubicBasis,
  spHybridBasis, sp2HybridBasis, sp3HybridBasis;
var basisList;
var basisCount;
var selectedState;
var manualScale;
var changingDerivedStates;
var bestBrightness;
var userBrightMult = .0005;
var brightnessBar;
var brightnessValue;
var sliceSlider;

var refresh;
var time = 0

var mouseDown = 0, mouseX, mouseY;

function getById(x) {
  return document.getElementById(x);
}

function addMouseEvents(canvas) {
  canvas.onmousedown = function (event) {
    mouseDown = 1;
    mouseX = event.clientX
    mouseY = event.clientY
  }

  canvas.onmouseup = function () {
    mouseDown = 0;
  }
  canvas.onmousemove = function (event) {
    appearingControls();
    selectedSlice = false;
    if (mouseDown) {
      var dx = event.clientX - mouseX
      var dy = event.clientY - mouseY
      mouseX = event.clientX
      mouseY = event.clientY

      // rotate view matrix
      var mtemp = mat4.create()
      mat4.rotate(mtemp, mtemp, dx * .01, [0, 1, 0]);
      mat4.rotate(mtemp, mtemp, dy * .01, [1, 0, 0]);
      mat4.multiply(rotationMatrix, mtemp, rotationMatrix);
    }
    refresh();
  }

  canvas.addEventListener("wheel", function (event) {
    zoom3d *= Math.exp(-event.deltaY * .001)
    zoom3d = Math.min(Math.max(zoom3d, .005), 500)
    manualScale = true;
    refresh()
  })

  convertTouchEvents(canvas);
}

function convertTouchEvents(canvas) {
  var lastTap;

  // convert touch events to mouse events
  canvas.addEventListener("touchstart", function (e) {
    var touch = e.touches[0];
    var etype = "mousedown";
    lastTap = e.timeStamp;

    var mouseEvent = new MouseEvent(etype, {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    e.preventDefault();
    canvas.dispatchEvent(mouseEvent);
  }, false);

  canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    e.preventDefault();
    canvas.dispatchEvent(mouseEvent);
  }, false);

  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    e.preventDefault();
    canvas.dispatchEvent(mouseEvent);
  }, false);

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  }


}

// add handlers for buttons so they work on both desktop and mobile
function handleButtonEvents(id, func, func0) {
  var button = document.getElementById(id)
  button.addEventListener("mousedown", func, false)
  button.addEventListener("touchstart", func, false)

  button.addEventListener("mouseup", func0, false)
  button.addEventListener("mouseleave", func0, false)
  button.addEventListener("touchend", func0, false)
}

// radial contribution to normalization factor
function radialNorm(n, l) {
  var a0 = factorial(n + l);
  return Math.sqrt(4. * factorial(n + l) / (n * n * n * n * factorial(n - l - 1))) / factorial(2 * l + 1);
}

// spherical contribution to normalization factor
function sphericalNorm(l, m) {
  var q = Math.sqrt((2 * l + 1) * factorial(l - m) / (4 * pi * factorial(l + m)));
  return q;
}

function factorial(f) {
  var res = 1;
  while (f > 1)
    res *= f--;
  return res;
}

function confluentHypergeometricFunction(a, c, z) {
  var fac = 1;
  var result = 1;
  for (var n = 1; n <= 1000; n++) {
    fac *= a * z / (n * c);
    if (fac == 0)
      return result;
    result += fac;
    a++;
    c++;
  }
}

function confluentHypergeometricFunctionExp(a, c) {
  var fac = 1;
  var result = "1.0";
  var fac = "1.0";
  for (var n = 1; n <= 1000; n++) {
    if (a == 0)
      return result;
    var m = makeFloatStr(a / (n * c));
    fac += "*" + m + "*rho";
    result += " + " + fac;
    a++;
    c++;
  }
}

function confluentHypergeometricFunctionExpForNL(n, l) {
  return confluentHypergeometricFunctionExp(l + 1 - n, 2 * l + 2);
}

// generalized binomial coefficient
function binomial(n, k) {
  var result = 1;
  var i;
  for (i = 0; i != k; i++) {
    result *= n;
    n -= 1;
  }
  return result / factorial(k);
}

// coefficients of chebyshev polynomials of the first kind
function chebyCoef(n) {
  if (n == 0)
    return [1];
  if (n == 1)
    return [0, 1];
  var t1 = chebyCoef(n - 1);
  var t2 = chebyCoef(n - 2);
  var tn = [];
  var i;
  for (i = 0; i <= n; i++) {
    var q = (i >= t2.length) ? 0 : -t2[i];
    if (i > 0)
      q += 2 * t1[i - 1];
    tn[i] = q;
  }
  return tn;
}

// coefficients of chebyshev polynomials of the second kind
function cheby2Coef(n) {
  var odd = (n % 2) == 1;
  var t = chebyCoef(n);
  n -= 2;
  while (n >= 0) {
    var t2 = chebyCoef(n);
    var i;
    for (i = 0; i != t2.length; i++)
      t[i] += t2[i];
    n -= 2;
  }
  for (i = 0; i != t.length; i++)
    t[i] *= 2;
  if (!odd)
    t[0] -= 1;
  return t;
}

// convert array of coefficients to an expression to evaluate polynomial
function getPoly(coefs, x) {
  var i;
  var res = makeFloatStr(coefs[0]);
  var parens = "";
  for (i = 1; i < coefs.length; i++) {
    if (coefs[i] == 0)
      continue;
    res += ((i == 1) ? "+" + x + "*(" : "+" + x + "*" + x + "*(") + makeFloatStr(coefs[i]);
    parens += ")";
  }
  return res + parens;
}

function makeFloatStr(x) {
  var m = x.toString();
  if (m.indexOf(".") < 0)
    m += ".0";
  return m;
}

function associatedLegendrePolynomial(l, m) {
  var k;
  var result = Math.pow(2, l) + ".0*" + evenOddPowExpr("sinth", m) + "*(0.0";
  for (k = m; k <= l; k++) {
    var c = factorial(k) / factorial(k - m);
    c *= binomial(l, k) * binomial((l + k - 1) / 2, l);
    if (c != 0)
      result += "+ " + makeFloatStr(c) + "*" + evenOddPowExpr("costh", k - m);
  }
  return result + ")";
}

function powExpr(x, n) {
  if (n == 0)
    return "(1.0)";
  if (n == 1)
    return "(" + x + ")";
  if (n == 2)
    return "(" + x + ")*(" + x + ")";
  return "pow(" + x + ", " + n + ".0)";
}

// same as powExpr but works if first argument is negative
function evenOddPowExpr(x, k) {
  if (k < 3)
    return powExpr(x, k);
  var pw = (k % 2 == 0) ? "evenpow" : "oddpow";
  return pw + "(" + x + ", " + k + ".0)";
}

// create texture used to convert complex numbers to phase colors
function createPhaseTexture() {
  phaseTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, phaseTexture);

  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.FLOAT;
  const level = 0;
  const width = 512;
  const height = width;
  var cols = [];
  var i, j;
  for (j = 0; j != height; j++)
    for (i = 0; i != width; i++) {
      var x = i - width / 2;
      var y = j - height / 2;
      var r = Math.hypot(x, y);
      var ang = Math.atan2(y, x);
      // convert to 0 .. 6
      ang *= 3 / pi;
      if (ang < 0)
        ang += 6;
      var hsec = Math.floor(ang);
      var a2 = ang % 1;
      var a3 = 1. - a2;
      var val = Math.hypot(x, y) / r;
      switch (hsec) {
        case 6:
        case 0: cols.push(val, val * a2, 0, 0); break;
        case 1: cols.push(val * a3, val, 0, 0); break;
        case 2: cols.push(0, val, val * a2, 0); break;
        case -3: case 3: cols.push(0, val * a3, val, 0); break;
        case 4: cols.push(val * a2, 0, val, 0); break;
        case 5: cols.push(val, 0, val * a3, 0); break;
        default: console.log("bad hsec " + hsec);
      }
    }
  const pixel = new Float32Array(cols);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, 0, srcFormat, srcType, pixel);
}

// create shader to display current set of basis states.
// the states we're drawing are hard-coded in the shader, with coefficients passed in as uniforms.
// So we create a new one when the states change.
function createAtomProgram(states) {
  // Vertex shader program for non-sliced
  const vsSourceNorm = `
    attribute vec4 aVertexPosition;
    varying highp vec3 vPosition;

    void main(void) {
      gl_Position = aVertexPosition;
      vPosition = aVertexPosition.xyz;
    }
  `;

  // vertex shader program for sliced
  const vsSourceSliced = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying highp vec3 vPosition;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vPosition = vec3(aVertexPosition.xy, aVertexPosition.z/aVertexPosition.w);
    }
  `;

  // start of fragment shader (sliced or non-sliced)
  var fsSourceStart = `
    varying highp vec3 vPosition;
    uniform highp float uZoom;
    uniform highp float uBrightness;
    uniform sampler2D uPhaseTexture;
    uniform highp vec2 uPhases[PHASECOUNT];

    highp float oddpow(highp float a, highp float b) {
      return (a < 0.) ? -pow(-a, b) : pow(a, b);
    }

    highp float evenpow(highp float a, highp float b) {
      return pow(abs(a), b);
    }
  `;

  // middle of fragment shader (sliced or non-sliced)
  var fsSourceMiddle = `
        highp float r = length(v.xyz);
        highp float xylen = length(vec2(v.x, v.y));
        highp float cosph = v.x/xylen;
        highp float sinph = v.y/xylen;
        highp float sinth = xylen/r;
        highp float costh = v.z/r;
        highp vec2 val = vec2(0., 0.);
        highp float rho = 0.0;
        // code to calculate orbital(s) is inserted here
CALCVAL
        highp float valr = length(val.st);
        col += vec4(texture2D(uPhaseTexture, vec2(.5, .5)+.4*val/valr).rgb, 1.0)*valr*valr;
  `;

  // end of fragment shader (sliced or non-sliced)
  var fsSourceEnd = `
      col *= uBrightness;
      col /= max(1.0, max(col.r, max(col.g, col.b)));
      gl_FragColor = col;
    }
  `;

  // fragment shader sliced
  var fsSourceSliced = fsSourceStart + `

    void main(void) {
      highp vec4 col = vec4(0., 0., 0., 0.);
      highp vec3 v = vPosition;
    ` + fsSourceMiddle + fsSourceEnd;

  // fragment shader non-sliced
  var fsSourceNorm = `
    uniform highp mat4 uRotationMatrix;
    uniform highp mat4 uAspectMatrix;
  ` + fsSourceStart + `

    void main(void) {
      highp vec4 col = vec4(0., 0., 0., 1.);
      highp vec4 pos = uAspectMatrix * vec4(vPosition, 1.);
      for (highp float z = -1.0; z < 1.0; z += 2./SAMPLECOUNT.) {
        highp vec4 v = uRotationMatrix * vec4(pos.xy, z, 1.);
   ` + fsSourceMiddle + '}' + fsSourceEnd;

  var i;
  var calcVal = "";
  // calculate wave function from basis functions
  var lastN = -1;
  for (i = 0; i != states.length; i++) {
    var state = states[i];
    var n = state.n;
    var l = state.l;
    // m is always positive here
    var m = state.m;
    // generate code to calculate this basis function
    calcVal += "// " + n + "," + l + ",+/-" + m + "\n";
    if (n != lastN) {
      calcVal += "rho = r*uZoom*" + makeFloatStr(1 / n) + ";\n";
      lastN = n;
    }
    calcVal += "val += " + radialNorm(n, l) * sphericalNorm(l, m) + "*" + powExpr("rho", l) + "*(";
    calcVal += confluentHypergeometricFunctionExpForNL(n, l) + ")*exp(-rho/2.)*(";
    calcVal += associatedLegendrePolynomial(l, Math.abs(m)) + ")*(";

    // calculate exprs for sin(m ph), cos(m phi) from sin/cos(phi) using chebyshev polynomials,
    // to avoid doing trig in the shader
    var cb = getPoly(chebyCoef(m), "cosph");
    var sb = m == 0 ? "0.0" : "sinph*(" + getPoly(cheby2Coef(m - 1), "cosph") + ")";

    // we don't use exp(+-i m phi) as basis functions, instead we use cos(phi) and sin(phi) so we only have to deal with real numbers
    calcVal += "(" + cb + ")*uPhases[" + (i * 2) + "] + (" + sb + ")*uPhases[" + (i * 2 + 1) + "]);\n";
  }
  var sliced = (sliceChooser.selectedIndex > SLICE_NONE);
  var fsSource = (sliced) ? fsSourceSliced : fsSourceNorm;
  var ss = 64;
  if (ss > 0)
    sampleCount = ss;
  fsSource = fsSource.replace("CALCVAL", calcVal);
  fsSource = fsSource.replace("PHASECOUNT", states.length * 2);
  fsSource = fsSource.replace("SAMPLECOUNT", sampleCount);
  // console.log(fsSource);
  // console.log(calcVal);
  const shaderProgram = initShaderProgram(gl, sliced ? vsSourceSliced : vsSourceNorm, fsSource);

  atomProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      rotationMatrix: gl.getUniformLocation(shaderProgram, 'uRotationMatrix'),
      aspectMatrix: gl.getUniformLocation(shaderProgram, 'uAspectMatrix'),
      zoom: gl.getUniformLocation(shaderProgram, 'uZoom'),
      brightness: gl.getUniformLocation(shaderProgram, 'uBrightness'),
      phaseTexture: gl.getUniformLocation(shaderProgram, 'uPhaseTexture'),
      phases: gl.getUniformLocation(shaderProgram, 'uPhases'),
    },
  };
}

// create normal shaders
function createShaders() {
  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  const fsColorNoLightingSource = `
    uniform highp vec4 uColor;

    void main(void) {
      gl_FragColor = uColor;
    }
  `;

  const colorPlainShaderProgram = initShaderProgram(gl, vsSource, fsColorNoLightingSource);

  colorPlainProgramInfo = {
    program: colorPlainShaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(colorPlainShaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(colorPlainShaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(colorPlainShaderProgram, 'uModelViewMatrix'),
      color: gl.getUniformLocation(colorPlainShaderProgram, 'uColor'),
    },
  };
}

var restarting = false;

function main() {
  refresh = function () { }  // to avoid errors until we set it for real
  const canvas = glCanvas = document.querySelector('#atomCanvas');
  gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  var float_texture_ext = gl.getExtension('OES_texture_float');

  createShaders();
  addMouseEvents(canvas)

  nChooser = document.getElementById("nChooser");
  lChooser = document.getElementById("lChooser");
  mChooser = document.getElementById("mChooser");
  sliceChooser = document.getElementById("sliceChooser");
  viewChooser = document.getElementById("viewChooser");
  nChooser.onchange = nChooserChanged;
  lChooser.onchange = lChooserChanged;
  mChooser.onchange = orbitalChanged;
  sliceChooser.onchange = createOrbitals;
  createPhaseTexture();
  brightnessBar = getById("brightness");
  brightnessBar.oninput = brightnessChanged;

  sliceSlider = getById("sliceSlider");
  sliceSlider.oninput = function () {
    if (sliceChooser.selectedIndex > SLICE_NONE) {
      selectedSlice = true;
      sliceval = sliceSlider.value;
      if (sliceval < -.99)
        sliceval = -.99;
      if (sliceval > .99)
        sliceval = .99;
      refresh();
    }
    // gsap.to(".canvas-overlay", { top: `${150}%`, left: `${150}%` })
  }

  sliceSlider.onblur = (() => {
    selectedSlice = false;
  })


  // initial rotation with z axis up
  mat4.rotate(rotationMatrix, rotationMatrix, -pi / 2, [1, 0, 0]);

  setupStates();
  createOrbitals();

  nChooser.selectedIndex = 3;
  nChooserChanged();
  lChooser.selectedIndex = 3;
  lChooserChanged();

  buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene
  function render(now) {
    now *= 0.001;  // convert to seconds
    var deltaTime = (then) ? now - then : 0;
    then = now;
    // check if Chrome messed everything up when back button pressed
    if (mChooser.selectedIndex < 0 && !restarting) {
      window.location.reload();
      // only do it once; if we do it again it will cancel the earlier request and
      // it will never get done
      restarting = true;
    }

    // avoid large jumps when switching tabs
    deltaTime = Math.min(deltaTime, .03)

    deltaTimeWithoutSpeed = deltaTime
    var speed = document.getElementById("speed").value;
    speed = Math.exp(speed / 10 - 5)
    deltaTime *= speed

    gl.viewport(0, 0, canvas.width, canvas.height);
    var norms = runPhysics(deltaTime)
    drawAtomScene(gl, buffers, deltaTime, norms);
    selectText = null;
    // if (!selectedState)
    //   getById("selectText").innerHTML = selectText ? selectText : "";

    animating = (!dragStop) || zoomRate != 0 || autoZooming;
    if (!animating)
      then = 0
    else
      requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  animating = true;
  refresh = function () {
    if (!animating)
      requestAnimationFrame(render);
  }


  // add button event handlers
  var func = function (event) {
    event.preventDefault();
    zoom(1);
    return false;
  }
  var func0 = function (event) { event.preventDefault(); zoom(0); return false; }
  handleButtonEvents("zoomin", func, func0)

  func = function (event) { event.preventDefault(); zoom(-1); return false; }
  handleButtonEvents("zoomout", func, func0)
}

function brightnessChanged() {
  disappearingControls();
  disappearingControls2("brightness");
  changeInnerHTMLAsPercentage("brightness", "brightnessText");

  var mult = Math.exp(brightnessBar.value / 100.);
  userBrightMult = mult / bestBrightness;
  refresh();
}

function initBuffers(gl) {

  const extraBuffer = gl.createBuffer();
  return { extra: extraBuffer };
}

function getN() { return nChooser.selectedIndex + 1; }
function getL() { return lChooser.selectedIndex; }

// clear states
function doClear() {
  var x;
  for (x = 0; x != stateCount; x++)
    states[x].set(0);
}

function setLValue() {
  var l = getL();
  var i;
  mChooser.options.length = 0;
  if (l == 0)
    mChooser.add(new Option(getN() + "s"));
  else if (l == 1) {
    for (i = 0; i != 3; i++)
      mChooser.add(new Option(getN() + l1RealText[i]));
  } else if (l == 2) {
    for (i = 0; i != 5; i++)
      mChooser.add(new Option(getN() + l2RealText[i]));
  } else if (l == 3) {
    for (i = 0; i != 7; i++)
      mChooser.add(new Option(getN() + l3RealText[i]));
  } else {
    mChooser.add(new Option("m = 0"));
    for (i = 1; i <= l; i++) {
      mChooser.add(new Option("m = +-" + i + " (+)"));
      mChooser.add(new Option("m = +-" + i + " (-)"));
    }
  }
}

const codeLetter = ["s", "p", "d", "f", "g", "h"];

function nChooserChanged() {
  var i;
  var n = nChooser.selectedIndex + 1;
  var l = lChooser.selectedIndex;
  lChooser.options.length = 0;
  for (i = 0; i < n; i++)
    lChooser.add(new Option("l = " + i + ((i < 6) ? " (" + codeLetter[i] + ")" : "")));
  if (l < n && l >= 0)
    lChooser.selectedIndex = (l);
  setLValue();
  orbitalChanged();
}

function lChooserChanged() {
  setLValue();
  orbitalChanged();
}

// this is when we are in single-orbital mode, and the user selects a different one
function orbitalChanged() {
  refresh();
  doClear();
  var m = mChooser.selectedIndex;
  if (m == 0)
    getState(getN(), getL(), 0).set(1, 0);
  else if (getL() == 3) {
    var i;
    for (i = 0; i != 7; i++) {
      var ar = m * 14 + i * 2;
      getState(getN(), 3, i - 3).set(l3CubicArray[ar], l3CubicArray[ar + 1]);
    }
  } else {
    m--;
    var realm = Math.floor(m / 2) + 1;
    var mphase = Math.pow(-1, realm);
    if ((m & 1) == 0) {
      getState(getN(), getL(), realm).set(mphase * root2inv);
      getState(getN(), getL(), -realm).set(root2inv);
    } else {
      getState(getN(), getL(), realm).set(0, -mphase * root2inv);
      getState(getN(), getL(), -realm).set(0, root2inv);
    }
  }
  createOrbitals();
  manualScale = false;
}

// check if shader needs to be updated to display current states
function createOrbitals() {
  var i;
  var newOrbitals = false;
  var newStates = [];
  for (i = 0; i != stateCount; i++) {
    var st = states[i];
    if (st.m == 0) {
      if (st.mag != 0) {
        newStates.push(st);
        if (!st.compiled)
          newOrbitals = true;
      }
    } else if (st.m > 0) {
      if (st.mag != 0 || getState(st.n, st.l, -st.m).mag != 0) {
        newStates.push(st);
        if (!st.compiled)
          newOrbitals = true;
      }
    }
  }
  if (newStates.length == 0)
    newStates = [getState(1, 0, 0)];
  var sliced = sliceChooser.selectedIndex > SLICE_NONE;

  if (sliced) {
    getById("slicerDiv").classList.add("working");
  } else {
    getById("slicerDiv").classList.remove("working");
  }

  if (sliceChooser.selectedIndex == 1) { getById("slicer-svg").style.setProperty('--svgrot', '90deg'); };
  if (sliceChooser.selectedIndex == 2) { getById("slicer-svg").style.setProperty('--svgrot', '0deg'); }
  if (sliceChooser.selectedIndex == 3) { getById("slicer-svg").style.setProperty('--svgrot', '45deg'); }

  if (!newOrbitals && compiledStates != undefined && compiledSliced == sliced)
    return;
  createAtomProgram(newStates);
  compiledStates = newStates;
  compiledSliced = sliced;
  for (i = 0; i != stateCount; i++)
    states[i].compiled = false;
  for (i = 0; i != newStates.length; i++)
    compiledStates[i].compiled = true;
}

// get standard basis state
function getState(n, l, m) {
  if (!Number.isInteger(n) || !Number.isInteger(l) || !Number.isInteger(m))
    console.log("bad arguments to getState: " + n + " " + l + " " + m);
  var pre_n = n - 1;
  var pre_n_add = pre_n * (pre_n + 1) * (2 * pre_n + 1) / 6;
  var pre_l_add = l * l;
  return states[pre_n_add + pre_l_add + l + m];
}

function setupStates() {
  // set up standard basis (complex, physics) used by the drawing code.
  // we convert into this basis before drawing anything
  var maxn = 16;
  stateCount = maxn * (maxn + 1) * (2 * maxn + 1) / 6;
  var i;
  states = [];
  var n = 1;
  var l = 0;
  var m = 0;
  for (i = 0; i != stateCount; i++) {
    var bs = states[i] = new BasisState();
    bs.elevel = -1 / (2. * n * n);
    bs.n = n;
    bs.l = l;
    bs.m = m;
    if (m < l)
      m++;
    else {
      l++;
      if (l < n)
        m = -l;
      else {
        n++;
        l = m = 0;
      }
    }
  }

  basisList = [];
  basisCount = 0;
}


// Lx and Ly eigenvectors for various values of l, expressed in
// terms of Lz eigenvectors
const l1xArray = [.5, 0, -root2inv, 0, .5, 0, root2inv, 0, 0, 0, -root2inv, 0, .5, 0, root2inv, 0, .5, 0];
const l1yArray = [.5, 0, 0, -root2inv, -.5, 0, 0, -root2inv, 0, 0, 0, -root2inv, .5, 0, 0, root2inv, -.5, 0];
const l2xArray = [
  1 / 4., 0, -1 / 2., 0, root6by4, 0, -1 / 2., 0, 1 / 4., 0,
  -.5, 0, .5, 0, 0, 0, -.5, 0, .5, 0,
  root6by4, 0, 0, 0, -.5, 0, 0, 0, root6by4, 0,
  -.5, 0, -.5, 0, 0, 0, .5, 0, .5, 0,
  1 / 4., 0, 1 / 2., 0, root6by4, 0, 1 / 2., 0, 1 / 4., 0
];
const l2yArray = [
  1 / 4., 0, 0, -1 / 2., -root6by4, 0, 0, 1 / 2., 1 / 4., 0,
  -.5, 0, 0, .5, 0, 0, 0, .5, .5, 0,
  -root6by4, 0, 0, 0, -.5, 0, 0, 0, -root6by4, 0,
  -.5, 0, 0, -.5, 0, 0, 0, -.5, .5, 0,
  1 / 4., 0, 0, 1 / 2., -root6by4, 0, 0, -1 / 2., 1 / 4., 0
];
const l3xArray = [
  0.125, 0, -0.306186, 0, 0.484123, 0, -0.559017, 0, 0.484123, 0, -0.306186, 0, 0.125, 0,
  -0.306186, 0, 0.5, 0, -0.395285, 0, 0., 0, 0.395285, 0, -0.5, 0, 0.306186, 0,
  0.484123, 0, -0.395285, 0, -0.125, 0, 0.433013, 0, -0.125, 0, -0.395285, 0, 0.4841230, 0,
  0.559017, 0, 0., 0, -0.433013, 0, 0., 0, 0.433013, 0, 0., 0, -0.559017, 0,
  0.484123, 0, 0.395285, 0, -0.125, 0, -0.433013, 0, -0.125, 0, 0.395285, 0, 0.484123, 0,
  -0.306186, 0, -0.5, 0, -0.395285, 0, 0., 0, 0.395285, 0, 0.5, 0, 0.306186, 0,
  0.125, 0, 0.306186, 0, 0.484123, 0, 0.559017, 0, 0.484123, 0, 0.306186, 0, 0.125, 0
];
const l3yArray = [
  -0.125, 0, 0, 0.306186, 0.484123, 0, 0, -0.559017,
  -0.484123, 0, 0, 0.306186, 0.125, 0,
  0.306186, 0, 0, -0.5, -0.395285, 0, 0., 0,
  -0.395285, 0, 0, 0.5, 0.306186, 0,
  -0.484123, 0, 0, 0.395285, -0.125, 0, 0, 0.433013,
  0.125, 0, 0, 0.395285, 0.484123, 0,
  0, 0.559017, 0., 0, 0, 0.433013, 0., 0,
  0, 0.433013, 0., 0, 0, 0.559017,
  -0.484123, 0, 0, -0.395285, -0.125, 0, 0, -0.433013,
  0.125, 0, 0, -0.395285, 0.484123, 0,
  0.306186, 0, 0, +0.5, -0.395285, 0, 0., 0, -0.395285, 0,
  0, -0.5, 0.306186, 0,
  -0.125, 0, 0, -0.306186, 0.484123, 0, 0, +0.559017,
  -0.484123, 0, 0, -0.306186, 0.125, 0
];
const l3CubicArray = [
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  .559017, 0, 0, 0, -.433013, 0, 0, 0, .433013, 0, 0, 0, -.559017, 0,
  0, .559017, 0, 0, 0, .433013, 0, 0, 0, .433013, 0, 0, 0, .559017,
  0, 0, root2inv, 0, 0, 0, 0, 0, 0, 0, root2inv, 0, 0, 0,
  0, 0, 0, -root2inv, 0, 0, 0, 0, 0, 0, 0, root2inv, 0, 0,
  .433013, 0, 0, 0, .559017, 0, 0, 0, -.559017, 0, 0, 0, -.433013, 0,
  0, .433013, 0, 0, 0, -.559017, 0, 0, 0, -.559017, 0, 0, 0, .433013
];

const spHybridArray = [
  -root2inv, 0, 0, 0, -root2inv, 0, 0, 0,
  -root2inv, 0, 0, 0, root2inv, 0, 0, 0,
  0, 0, root2inv, 0, 0, 0, -root2inv, 0,
  0, 0, 0, -root2inv, 0, 0, 0, -root2inv,
];
const sp2HybridArray = [
  -.57735, 0, .57735, 0, 0, 0, -.57735, 0,
  -.57735, 0, -.288675, -.5, 0, 0, .288675, -.5,
  -.57735, 0, -.288675, .5, 0, 0, .288675, .5,
  0, 0, 0, 0, 1, 0, 0, 0
];
const sp3HybridArray = [
  -.5, 0, -root2inv / 2, root2inv / 2, -.5, 0, root2inv / 2, root2inv / 2,
  -.5, 0, root2inv / 2, -root2inv / 2, -.5, 0, -root2inv / 2, -root2inv / 2,
  -.5, 0, root2inv / 2, root2inv / 2, .5, 0, -root2inv / 2, root2inv / 2,
  -.5, 0, -root2inv / 2, -root2inv / 2, .5, 0, root2inv / 2, -root2inv / 2,
];
const spHybridText = ["2sp (1)", "2sp (2)", "2px", "2py"];
const sp2HybridText = ["2sp2 (1)", "2sp2 (2)", "2sp2 (3)", "2pz"];
const sp3HybridText = ["2sp3 (1)", "2sp3 (2)", "2sp3 (3)", "2sp3 (4)"];
const l1RealText = ["pz", "px", "py"];
const l2RealText = ["dz2", "dxz", "dyz", "d(x2-y2)", "dxy"];
const l3RealText = ["fz3", "fxz2", "fyz2", "fz(x2-y2)", "fxyz", "fx(x2-3y2)", "fy(3x2-y2)"];
const l3CubicRealText = ["fz3", "fx3", "fy3", "fz(x2-y2)", "fxyz", "fx(z2-y2)", "fy(z2-x2)"];

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

// run physics simulation for current frame
function runPhysics(deltaTime) {
  time += deltaTime
  zoom3d *= Math.exp(deltaTimeWithoutSpeed * zoomRate)
  var i;
  var norm = 0;
  var base = 0;
  for (i = 0; i != stateCount; i++) {
    var st = states[i];
    if (st.mag < 1e-4) {
      st.set(0);
      continue;
    }
    if (deltaTime > 0)
      st.rotate(-(st.elevel + base) * deltaTime);
    norm += st.magSquared();
  }

  var normmult2 = 1 / norm;
  if (norm == 0)
    normmult2 = 0;
  var normmult = Math.sqrt(normmult2);

  return { norm: norm, normmult: normmult, normmult2: normmult2 };
}

const minDeltaTime = .000001

function drawAtomScene(gl, buffers, deltaTime, norms) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque

  gl.clear(gl.COLOR_BUFFER_BIT);
  projectionMatrix = mat4.create();

  // if window is more tall than wide, adjust fov to zoom out or the earth will be cut off on the sides
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var fov = Math.atan(aspect > 1 ? 1 : 1 / aspect);
  mat4.perspective(projectionMatrix, fov, aspect, 0.1, 100);

  setScale();
  setBrightness(norms.normmult2);

  viewMatrix = mat4.create();
  mat4.translate(viewMatrix, viewMatrix, [0, 0, -6]);
  mat4.multiply(viewMatrix, viewMatrix, rotationMatrix);
  const sliceScale = 1.5;
  mat4.scale(viewMatrix, viewMatrix, [sliceScale, sliceScale, sliceScale]);
  mat4.invert(inverseRotationMatrix, rotationMatrix);
  if (sliceChooser.selectedIndex != SLICE_NONE)
    drawCube(gl, buffers, projectionMatrix, viewMatrix, true);
  drawFullAtom(norms.normmult);
  if (sliceChooser.selectedIndex != SLICE_NONE)
    drawCube(gl, buffers, projectionMatrix, viewMatrix, false);
  // if (getById("axesCheck").checked)
  // drawAxes(gl, buffers, viewMatrix);
  // else
  //   hideAxes();
}

function setScale() {
  autoZooming = false;
  if (manualScale)
    return;
  var i;

  // find max radius
  var outer = 0;
  for (i = 0; i != compiledStates.length; i++) {
    var st = compiledStates[i];
    var r = st.getScaleRadius();
    if (r > outer)
      outer = r;
  }

  // find goal
  var goal = 7.35 / outer;
  zoom3d = goal;

  // gradually change zoom until we reach goal
  var diff = goal - zoom3d;
  var mult = Math.exp(deltaTimeWithoutSpeed * 3);
  var newZoom = (diff > 0) ? zoom3d * mult : zoom3d / mult;
  if (Math.sign(diff) != Math.sign(goal - newZoom))
    zoom3d = goal;
  else {
    zoom3d = newZoom;
    autoZooming = true;
  }
}

function setBrightness(normmult) {
  var i;
  var avg = 0;
  var totn = 0;
  var minavg = 1e30;
  for (i = 0; i != compiledStates.length; i++) {
    var st = compiledStates[i];
    var as = st.getBrightness();
    if (as < minavg)
      minavg = as;
    var n = st.magSquared() * normmult;
    if (st.m != 0)
      n += getState(st.n, st.l, -st.m).magSquared() * normmult;
    totn += n;
    avg += n * as;
  }
  bestBrightness = 113.9 / (Math.sqrt(minavg) * totn);
  var mult = bestBrightness * userBrightMult;
  var bvalue = Math.round(Math.log(mult) * 100.);
  brightnessBar.value = bvalue;
}

function drawAxes(gl, buffers, viewMatrix) {
  gl.viewport(gl.canvas.width - 100, gl.canvas.height - 100, 100, 100);
  const projectionMatrix = mat4.create();
  var aspect = 1;
  var fov = Math.atan(aspect);
  mat4.perspective(projectionMatrix, fov, aspect, 0.1, 100);

  const scaledViewMatrix = mat4.create();

  var scale = 1.1;
  mat4.scale(scaledViewMatrix, viewMatrix, [scale, scale, scale, 1]);

  // hack to save and restore zoom level since drawArrow looks at it
  var saveZoom = zoom3d;
  zoom3d = .4;

  drawArrow(gl, buffers, projectionMatrix, scaledViewMatrix, [0, 0, 0], [1, 0, 0], [1, 1, 1], false);
  drawArrow(gl, buffers, projectionMatrix, scaledViewMatrix, [0, 0, 0], [0, 1, 0], [1, 1, 1], false);
  drawArrow(gl, buffers, projectionMatrix, scaledViewMatrix, [0, 0, 0], [0, 0, 1], [1, 1, 1], false);
  zoom3d = saveZoom;

  var i;
  for (i = 0; i != 3; i++) {
    var vec = vec4.create();
    vec[i] = 1.3; vec[3] = 1;
    vec4.transformMat4(vec, vec, scaledViewMatrix);
    vec4.transformMat4(vec, vec, projectionMatrix);
    var div = document.getElementById("xyz".substring(i, i + 1) + "Label");
    div.style.left = (gl.canvas.width - 100 + Math.floor(50 - 5 + 50 * (vec[0] / vec[3]))) + "px";
    div.style.top = Math.floor(50 - 5 - 50 * (vec[1] / vec[3])) + "px";
  }
}

function hideAxes() {
  var i;
  for (i = 0; i != 3; i++) {
    var div = document.getElementById("xyz".substring(i, i + 1) + "Label");
    div.style.left = "-50px";
  }
}

function drawArrow(gl, buffers, projectionMatrix, viewMatrix, pos, arrowVec, col, rotational) {
  gl.useProgram(colorPlainProgramInfo.program);
  const modelViewMatrix = mat4.create();
  mat4.copy(modelViewMatrix, viewMatrix);

  pos = Array.from(pos)  // make sure it's an array
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.extra);

  var vecLen = Math.sqrt(vec3.dot(arrowVec, arrowVec))

  var arrowLen = 1
  var arrowHeadSize = .20 / vecLen * (.4 / zoom3d);
  if (arrowHeadSize > .5)
    arrowHeadSize = .5
  var verts = []
  var arrowTip = []
  var crossVec = vec3.create()
  var zVec = vec3.create()

  // find a vector perpendicular to arrow vector and eye vector, so the arrowhead can be seen
  vec3.transformMat4(zVec, [0, 0, 1], inverseRotationMatrix)
  vec3.cross(crossVec, arrowVec, zVec)
  vec3.normalize(crossVec, crossVec);

  var cross2Vec = vec3.create();
  vec3.cross(cross2Vec, crossVec, arrowVec);
  vec3.normalize(cross2Vec, cross2Vec);

  const shaftWidth = .02 * (.4 / zoom3d);
  const headWidth = .08 * (.4 / zoom3d);
  var shaftStart1 = [], shaftStart2 = [], shaftEnd1 = [], shaftEnd2 = [], head1 = [], head2 = [];
  var shaftLen = 1 - arrowHeadSize;
  var i;

  // calculate arrow points
  for (i = 0; i != 3; i++) {
    // points on either side of shaft at start
    shaftStart1.push(pos[i] + crossVec[i] * shaftWidth);
    shaftStart2.push(pos[i] - crossVec[i] * shaftWidth);

    // points on either side of shaft at end
    shaftEnd1.push(pos[i] + crossVec[i] * shaftWidth + arrowVec[i] * shaftLen);
    shaftEnd2.push(pos[i] - crossVec[i] * shaftWidth + arrowVec[i] * shaftLen);

    // points on either side of head
    head1.push(pos[i] + crossVec[i] * headWidth + arrowVec[i] * shaftLen);
    head2.push(pos[i] - crossVec[i] * headWidth + arrowVec[i] * shaftLen);

    // tip of arrow
    arrowTip.push(pos[i] + arrowVec[i] * arrowLen);
  }

  verts = verts.concat(shaftStart1, shaftEnd1, shaftStart2, shaftEnd1, shaftStart2, shaftEnd2, head1, head2, arrowTip);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(colorPlainProgramInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorPlainProgramInfo.attribLocations.vertexPosition);

  gl.uniformMatrix4fv(colorPlainProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(colorPlainProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  gl.uniform4f(colorPlainProgramInfo.uniformLocations.color, col[0], col[1], col[2], 1);
  gl.drawArrays(gl.TRIANGLES, 0, 9);
  gl.disableVertexAttribArray(colorPlainProgramInfo.attribLocations.vertexPosition);
}

function drawFullAtom(normmult) {
  var phases = [];
  var i;
  // calculate phases
  for (i = 0; i != compiledStates.length; i++) {
    var st = compiledStates[i];
    if (st.m == 0)
      phases.push(st.re, st.im, 0, 0);
    else {
      // get phases for m != 0
      // convert exp(i m phi), e(-i m phi) basis to cos(m phi), sin(m phi) basis
      // also need a negative sign for odd m
      var mphase = Math.pow(-1, st.m);
      var s2 = getState(st.n, st.l, -st.m);
      phases.push(st.re * mphase + s2.re, st.im * mphase + s2.im, -st.im * mphase + s2.im, st.re * mphase - s2.re);
    }
  }
  for (i = 0; i != phases.length; i++)
    phases[i] *= normmult;
  drawAtom(phases);
}

function drawAtom(phases, pos) {
  var program = atomProgramInfo;
  gl.useProgram(program.program);

  var verts = [-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0];
  var slice = sliceChooser.selectedIndex;
  if (slice > SLICE_NONE) {
    var coord1 = (slice == SLICE_X) ? 1 : 0;
    var coord2 = (slice == SLICE_Z) ? 1 : 2;
    var i;
    for (i = 0; i != 4; i++) {
      verts[i * 3 + coord1] = (i > 1) ? 1 : -1;
      verts[i * 3 + coord2] = (i & 1) ? 1 : -1;
      verts[i * 3 + slice - SLICE_X] = sliceval;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.extra);

  const aspectMatrix = mat4.create();
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  if (pos != undefined) {
    aspect = 1;
    gl.viewport(pos * 100, 0, 100, 100);
  }
  mat4.scale(aspectMatrix, aspectMatrix, [Math.max(1, aspect), Math.max(1, 1 / aspect), 1]);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(program.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
  gl.uniformMatrix4fv(program.uniformLocations.rotationMatrix, false, inverseRotationMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.aspectMatrix, false, aspectMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, viewMatrix);
  gl.uniform1f(program.uniformLocations.zoom, 20 / zoom3d);
  var bright = brightnessBar.value;
  if (slice > SLICE_NONE) {
    bright *= 1.5;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  gl.uniform1f(program.uniformLocations.brightness, Math.exp(bright / 100));
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, phaseTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.uniform1i(program.uniformLocations.phaseTexture, 0);
  gl.uniform2fv(program.uniformLocations.phases, phases);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(program.attribLocations.vertexPosition);
  gl.disable(gl.BLEND);
}

function projectCoords(vec) {
  var pvec = vec4.create();
  vec3.copy(pvec, vec);
  pvec[3] = 1;
  vec4.transformMat4(pvec, pvec, viewMatrix);
  vec4.transformMat4(pvec, pvec, projectionMatrix);
  return [glCanvas.width * (.5 + .5 * pvec[0] / pvec[3]),
  glCanvas.height * (.5 - .5 * pvec[1] / pvec[3])];
}

function isFrontFacing(nx, ny, nz) {
  var vec = [0, 0, 6, 0];
  vec4.transformMat4(vec, vec, inverseRotationMatrix);
  return (nx - vec[0]) * nx + (ny - vec[1]) * ny + (nz - vec[2]) * nz < 0;
}

// draw edges of a cube (drawBack determines if we draw the edges in back or the ones in front)
function drawCube(gl, buffers, projectionMatrix, viewMatrix, drawBack) {
  gl.useProgram(colorPlainProgramInfo.program);
  const modelViewMatrix = mat4.create();
  mat4.copy(modelViewMatrix, viewMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.extra);

  var slice = sliceChooser.selectedIndex;
  var sliceIndex = 0;
  for (var i = 0; i != 6; i++) {
    var verts = []
    var pts = [0, 0, 0];
    for (var n = 0; n != 4; n++) {
      computeFace(i, n, pts);
      verts = verts.concat(pts);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorPlainProgramInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorPlainProgramInfo.attribLocations.vertexPosition);

    gl.uniformMatrix4fv(colorPlainProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(colorPlainProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniform4f(colorPlainProgramInfo.uniformLocations.color, 1, 1, 1, 1);
    var nx = (i == 0) ? -1 : (i == 1) ? 1 : 0;
    var ny = (i == 2) ? -1 : (i == 3) ? 1 : 0;
    var nz = (i == 4) ? -1 : (i == 5) ? 1 : 0;
    if (isFrontFacing(nx, ny, nz) != drawBack)
      gl.drawArrays(gl.LINE_LOOP, 0, verts.length / 3);
    if (!drawBack)
      continue;

    // draw edges of slice
    if (slice != SLICE_NONE && Math.floor(i / 2) != slice - SLICE_X) {
      if (selectedSlice)
        gl.uniform4f(colorPlainProgramInfo.uniformLocations.color, 1, 1, 0, 1);
      var coord1 = (slice == SLICE_X) ? 1 : 0;
      var coord2 = (slice == SLICE_Z) ? 1 : 2;
      computeFace(i, 0, pts);
      pts[slice - SLICE_X] = sliceval;
      verts = [].concat(pts);
      var proj1 = projectCoords(pts);
      computeFace(i, 2, pts);
      pts[slice - SLICE_X] = sliceval;
      var proj2 = projectCoords(pts);
      verts = verts.concat(pts);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      gl.drawArrays(gl.LINES, 0, 2);
      sliceFaces[sliceIndex++] = { edgeVerts: proj1.concat(proj2), normal: [nx, ny, nz] };
    }
  }
}

// generate the nth vertex of the bth cube face
function computeFace(b, n, pts) {
  // One of the 3 coordinates (determined by a) is constant.
  // When b=0, x=-1; b=1, x=+1; b=2, y=-1; b=3, y=+1; etc
  var a = b >> 1;
  pts[a] = ((b & 1) == 0) ? -1 : 1;

  // fill in the other 2 coordinates with one of the following
  // (depending on n): -1,-1; +1,-1; +1,+1; -1,+1
  var i;
  for (i = 0; i != 3; i++) {
    if (i == a) continue;
    pts[i] = (((n >> 1) ^ (n & 1)) == 0) ? -1 : 1;
    n >>= 1;
  }
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and
// compiles it
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function zoom(x) {
  zoomRate = x
  if (x != 0)
    manualScale = true;
  refresh();
}


//functions to disappear qatomcontroller, optionsHeadings, breakinglines and Selectors
function disappearingControls() {
  qatomController.classList.add('changing');
  Array.prototype.forEach.call(optionsHeading, ((option) => {
    option.classList.add("changing");
  }));
  Array.prototype.forEach.call(breakinglines, ((breakingline) => {
    breakingline.classList.add("changing");
  }));
  Array.prototype.forEach.call(selecters, ((selecter) => {
    selecter.classList.add("changing");
  }));
}

//functions to disappear Zbtns and Sliders
function disappearingControls2(ThisID) {
  const idsOfElements = ["zoomin", "zoomout", "speed", "brightness"];
  const condition = (ThisID == "zbtn") ? true : false;
  for (let id of idsOfElements) {
    if (condition) {
      if (id == "zoomin" || id == "zoomout") {
        continue;
      } else {
        getById(id).classList.add("changing");
      }
    } else if (id != ThisID) {
      getById(id).classList.add("changing");
    }

  }
};

//functions to reappear the disappeared elements
function appearingControls() {
  const changingElements = document.getElementsByClassName("changing");
  Array.prototype.forEach.call(changingElements, ((changingElement) => {
    changingElement.classList.remove("changing");
  }));
  setTimeout(() => {
    brightnessText.innerHTML = realBrightnessText;
    simulationText.innerHTML = realSimulationText;
  }, 5000);
}

function changeInnerHTMLAsPercentage(sourceID, targetID) {
  const source = getById(sourceID);
  const target = getById(targetID);

  var sourceValue = source.value;
  var minSourceValue = parseInt(source.getAttribute("min"));
  var maxSourceValue = parseInt(source.getAttribute("max")) + Math.abs(minSourceValue);
  var usableSourceValue = Math.abs(minSourceValue) + parseInt(sourceValue);
  var sourcePercentage = ((usableSourceValue * 100) / maxSourceValue).toFixed(1);
  target.innerHTML = `${sourcePercentage}%`;
}

//Adding EventListeners to zbtns to disappear others
getById("zoomin").addEventListener("click", (() => {
  disappearingControls();
  disappearingControls2('zbtn');
}));
getById("zoomout").addEventListener("click", (() => {
  disappearingControls();
  disappearingControls2('zbtn');
}))

// standard basis state (complex physics orbitals, Lz eigenstates, n,l,m)
class BasisState {
  constructor(r, i) {
    if (r == undefined)
      this.re = this.im = this.mag = this.phase = 0;
    else {
      this.set(r, i);
    }
  }
  magSquared() { return this.mag * this.mag; }

  // takes (re, im) or (re) or (complex obj) as arguments
  set(aa, bb) {
    if (bb == undefined) {
      if (!isNaN(aa)) {
        this.re = aa; this.im = 0;
        this.updateMagPhase();
      } else {
        this.re = aa.re;
        this.im = aa.im;
        this.mag = aa.mag;
        this.phase = aa.phase;
      }
    } else {
      this.re = aa; this.im = bb;
      this.updateMagPhase();
    }
  }
  updateMagPhase() {
    this.mag = Math.sqrt(this.re * this.re + this.im * this.im);
    this.phase = Math.atan2(this.im, this.re);
  }
  setMagPhase(m, ph) {
    this.mag = m;
    this.phase = ph;
    this.re = m * Math.cos(ph);
    this.im = m * Math.sin(ph);
  }

  // advance phase by a
  rotate(a) {
    this.setMagPhase(this.mag, (this.phase + a) % (2 * pi));
  }
  getScaleRadius() {
    // set scale by solving equation Veff(r) = E, assuming m=0
    // Veff(r) = -1/r + l(l+1)/2, E = 1/2n^2
    const n = this.n;
    const l = this.l;
    const b0 = -n * n * 2;
    const c0 = l * (l + 1) * n * n;
    const r0 = .5 * (-b0 + Math.sqrt(b0 * b0 - 4 * c0));
    return r0;
  }

  getBrightness() {
    if (this.brightnessCache != 0 && this.brightnessCacheZoom == zoom3d)
      return this.brightnessCache;
    var avgsq = 0;
    var vol = 0;
    var i;
    var norm = radialNorm(this.n, this.l);
    const dataSize = 200;
    const resadj = (20 / zoom3d) / dataSize;
    const n = this.n;
    const l = this.l;
    for (i = 0; i != dataSize; i++) {
      var r = i * resadj;
      var rho = 2 * r / n;
      var rhol = Math.pow(rho, l) * norm;
      var val = confluentHypergeometricFunction(l + 1 - n, 2 * l + 2, rho) * rhol * Math.exp(-rho / 2);
      val *= val;
      avgsq += val * val * i * i;
      vol += i * i;
    }
    this.brightnessCache = avgsq / vol;
    this.brightnessCacheZoom = zoom3d;
    return this.brightnessCache;
  }
}




qatomController.onmousemove = appearingControls;

const addControl = document.querySelector(".add-qcontrols");
var addFlag = 0

function changedControllerPostion() {
  const line1 = addControl.querySelector("#line1");
  const line2 = addControl.querySelector("#line2");
  const line3 = addControl.querySelector("#line3");
  const groups = addControl.querySelectorAll("circle")
  const span = addControl.querySelector("span");
  const qController = document.querySelector("#qatomcontroller");
  if (addFlag % 2 == 0) {
    gsap.to(line1, {
      attr: { x1: `${23}`, y1: `${23}`, x2: `${77}`, y2: `${77}` },
    });
    gsap.to(line2, {
      opacity: 0
    });
    gsap.to(line3, {
      attr: { x1: `${23}`, y1: `${77}`, x2: `${77}`, y2: `${23}` },
    });
    gsap.to(groups, {
      opacity: 0
    });
    gsap.to(span, {
      duration: 2,
      text: "Close",
      duration: 0.5
    });
    gsap.to(qController, {
      left: `${82}%`
    })

  } else {
    gsap.to(line1, {
      attr: { x1: `${11.9}`, y1: `${27.3}`, x2: `${88.1}`, y2: `${27.3}` },
    });
    gsap.to(line2, {
      opacity: 1
    });
    gsap.to(line3, {
      attr: { x1: `${11.9}`, y1: `${72.7}`, x2: `${88.1}`, y2: `${72.7}` },
    });
    gsap.to(groups, {
      opacity: 1
    });
    gsap.to(span, {
      duration: 2,
      text: "Options",
      duration: 0.5
    });
    gsap.to(qController, {
      left: `${150}%`
    })

  }
}

function onClickAnimations() {
  const qbtn = document.querySelector("#qbtn");
  const backButton = document.querySelector(".backbtn");

  qbtn.addEventListener('click', () => {
    var tl = gsap.timeline();
    tl.to(window, { scrollTo: "#main", onStart: ()=> {
      lenis.stop();
    } }, "start")
      .to(".nav-600", { yPercent: -100, duration: 0.3 })
      .to(".testtube-container", { filter: `blur(${60}px)`, opacity: 0, duration: 0.5 }, "-=0.6")
      .to(".panel *", { filter: `blur(${60}px)`, opacity: 0, yPercent: -100, stagger: 0.1 })
      .to("#hero-svg", { filter: `blur(${60}px)`, opacity: 0, scale: 0.8, duration: 0.5 }, "-=4.5")
      .to(".heropage", { filter: `blur(${40}px)`, opacity: 0, duration: 0.5}, "-=3.5")
      .to("#atomCanvas", {
        top: `${0}%`,
        left: `${0}%`,
        width: `${100}vw`,
        height: `${100}vh`,
        transform: `scale(${1})`,
        pointerEvents: "all",
        duration: 0.7,
        onComplete: () => {
          gsap.set("#main", { display: "none" })
          gsap.set(".split", { overflow: "hidden", height: "100vh"});
        }
      }, "-=3")
      .to(".qatom", {height: "100vh"})
      .to(".backbtn", { opacity: 1, filter: `blur(${0}px)` }, "=-3")
      .to(".add-qcontrols", { opacity: 1, filter: `blur(${0}px)` }, "=-3")
  })

  addControl.addEventListener("click", () => {
    changedControllerPostion();
    addFlag++;
  })

  backButton.addEventListener('click', () => {
    addFlag = 1;
    changedControllerPostion();
    var reverseTl = gsap.timeline();
    reverseTl.to(".backbtn", { opacity: 0, filter: `blur(${10}px)`, duration: 0.5 })
      .to(".add-qcontrols", { opacity: 0, filter: `blur(${10}px)`, duration: 0.5 }, "=-0.2")
      .to(".split", {height: "220vw", duration: 0.1})
      .to(".qatom", {height: "180vw", duration: 0.1})
      .to("#atomCanvas", {
        top: "0vh",
        left: "30vw",
        width: "100%",
        height: "100%",
        transform: `scale(${2})`,
        pointerEvents: "none",
        duration: 0.7,
        onComplete: () => {
          gsap.set("#main", { display: "block" });
          gsap.set(".split", { overflow: "visible"});
          lenis.start()
        }
      })
      .to(".testtube-container", { filter: `blur(${0}px)`, opacity: 1, duration: 0.5 }, "-=0.6")
      .to(".nav-600", { yPercent: 0, duration: 0.3 })
      .to(".heropage", { filter: `blur(${0}px)`, opacity: 1 }, "-=3")
      .to("#hero-svg", { filter: `blur(${0}px)`, opacity: 1, scale: 1, duration: 0.5 })
      .to(".panel *", { filter: `blur(${0}px)`, opacity: 1, yPercent: 0, stagger: 0.1,}, "-=0.5")





    sliceSlider.value = 0;
    sliceChooser.selectedIndex = 0;
    createOrbitals();
    refresh();

    clearTimeout(setDisplayNone);

    if (brightnessBar.value > Math.round(Math.log(bestBrightness) * 100.)) {
      brightnessBar.value = Math.round(Math.log(bestBrightness) * 100.) / 1.8;
      brightnessChanged();
      refresh();
    };

    if (speedController.value > 80) {
      speedController.value = 80;
      refresh();
    };

    if (zoom3d > 0.5) {
      zoom3d = 0.23;
    }

  });
}

speedController.oninput = function () {
  changeInnerHTMLAsPercentage("speed", "simulationText");
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

window.onload = ()=>{
  var deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!isMobile()) {
    main();
    onClickAnimations();
  }
};