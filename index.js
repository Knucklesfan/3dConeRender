var squareRotation = 0.0;
var visibility = 0.0;
var squarepos = 0;
var animation = false;
var model = "suzanne.obj";
var req;
var audio;
const fortunes = ["You will be hit by a bus tomorrow.", "You have no life.", "You will die alone.", "Life is meaningless.",
    "Play Kekcroc World 3.", "Your mom lol", "I am not a fortune teller, stop asking me to help you.", "You will live a happy and bountiful life.",
    "Random Number Generators are not a healthy way to base your life.", "Don't get that new job. It's a waste of time.",
    "Get a life, you're 40 years old and you still live in your mother's basement", "Visit the Pinecone Shrinecone", "WebGL is difficult..."];

const ball8 = [
    "Yes.",
    "Absolutely not.",
    "No lol",
    "You'd be stupid to say yes.",
    "Positively yes.",
    "I have no idea, I'm a pinecone 8ball..",
    "Try again, my pines were hazy.."
]
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var getSourceSynch = function(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};

function rad(number) {
    return number * (Math.PI/180);
}

function isPowerOf2(width) {
    return(width & (width-1)) == 0;
}


function initBuffers(gl, obj) {

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];


    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.position),
        gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
        gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texcoord),
        gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normal),
        gl.STATIC_DRAW);

    console.log(obj.position.length);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        indices: indexBuffer,
        textureCoord: textureCoordBuffer,

    };
}

function drawScene(gl, programInfo, buffers, deltaTime, obj) {
    if(squarepos <= -6.0 && animation) {
        squarepos += 0.185;
    }

    gl.clearColor(0,0,0,visibility);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = rad(45);
    const aspect = 16 / 9;
    const zNear = 0.1;
    const zFar = 1000.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fov,
        aspect,
        zNear,
        zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix,modelViewMatrix,[-0.0,squarepos,-6]);
    mat4.rotate(modelViewMatrix,
        modelViewMatrix,
        squareRotation,
        [0,1,0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);

    const offset = 0;

    const vertexCount = obj.position.length;
    const type = gl.UNSIGNED_SHORT;

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

    squareRotation += deltaTime;

}

function main() {


    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl");

    if(gl == null) {
        alert("IMAGINE NOT HAVING A DEVICE THAT SUPPORTS WEBGL LMAO");
        return;
    }

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.ARRAY_BUFFER);
    const shaderProgram = initShaderProgram(gl, getSourceSynch("vertexshader.shader"), getSourceSynch("fragmentshader.shader"));

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };
    const obj = parseOBJ(getSourceSynch(model));

    const buffers = initBuffers(gl, obj);
    const texture = loadTexture(gl, 'cubetexture.png');
    console.log(obj.vertexCount)
    var then = 0;
    if(req != undefined) {
        cancelAnimationFrame(req);
    }
    // Draw the scene repeatedly
    function render(now) {

        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;
        drawScene(gl, programInfo, buffers, deltaTime, obj);

        req = requestAnimationFrame(render);
    }
    req = requestAnimationFrame(render);

}
window.onload = main;

function suzannebutton() {
    if(audio != undefined) {
        audio.pause();
    }
    audio = new Audio('sins.mp3');
        squarepos = 0;
        audio.play();
        model = "suzanne.obj";
        main();
        document.getElementById("bottom").innerText = fortunes[getRandomInt(fortunes.length)];
        document.getElementById("bottom").hidden = false;
    document.getElementById("top").innerText = "SUZANNE THE FORTUNE TELLER SAYS:";
    document.getElementById("top").hidden = false;
        document.getElementById("canvas").hidden = false;
        document.getElementById("background").style.display = "inline"
}
function pinebutton() {
    if(audio != undefined) {
        audio.pause();
    }
    audio = new Audio('epicmusic.mp3');
    squarepos = -0.75;
    audio.play();
    model = "pineconesimple.obj";
    main();

    document.getElementById("bottom").innerText = ball8[getRandomInt(ball8.length)];
    document.getElementById("bottom").hidden = false;
    document.getElementById("top").innerText = "You shake the magic 8-Pine...";
    document.getElementById("top").hidden = false;
    document.getElementById("canvas").hidden = false;
    document.getElementById("background").style.display = "inline"
}