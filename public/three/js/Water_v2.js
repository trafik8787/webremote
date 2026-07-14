
THREE.Water = function ( geometry, options ) {

	THREE.Mesh.call( this, geometry );

	var scope = this;

	options = options || {};

	var textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
	var textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

	var clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
	var alpha = options.alpha !== undefined ? options.alpha : 1.0;
	var time = options.time !== undefined ? options.time : 0.0;
	var normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
	var sunDirection = options.sunDirection !== undefined ? options.sunDirection : new THREE.Vector3( 0.70707, 0.70707, 0.0 );
	var sunColor = new THREE.Color( options.sunColor !== undefined ? options.sunColor : 0xffffff );
	var waterColor = new THREE.Color( options.waterColor !== undefined ? options.waterColor : 0x7F7F7F );
	var eye = options.eye !== undefined ? options.eye : new THREE.Vector3( 0, 0, 0 );
	var distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;

	var waveAmplitude = options.waveAmplitude !== undefined ? options.waveAmplitude : 1.0;
	var waveSpeed = options.waveSpeed !== undefined ? options.waveSpeed : 1.0;
	var waveScale = options.waveScale !== undefined ? options.waveScale : 1.0;
	var foamColor = new THREE.Color( options.foamColor !== undefined ? options.foamColor : 0xdbe9f4 );
	var foamStrength = options.foamStrength !== undefined ? options.foamStrength : 0.18;
	var foamThreshold = options.foamThreshold !== undefined ? options.foamThreshold : 0.62;

	var side = options.side !== undefined ? options.side : THREE.FrontSide;
	var fog = options.fog !== undefined ? options.fog : false;

	//

	var mirrorPlane = new THREE.Plane();
	var normal = new THREE.Vector3();
	var mirrorWorldPosition = new THREE.Vector3();
	var cameraWorldPosition = new THREE.Vector3();
	var rotationMatrix = new THREE.Matrix4();
	var lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
	var clipPlane = new THREE.Vector4();

	var view = new THREE.Vector3();
	var target = new THREE.Vector3();
	var q = new THREE.Vector4();

	var textureMatrix = new THREE.Matrix4();

	var mirrorCamera = new THREE.PerspectiveCamera();

	var parameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	};

	var renderTarget = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

	if ( ! THREE.Math.isPowerOfTwo( textureWidth ) || ! THREE.Math.isPowerOfTwo( textureHeight ) ) {

		renderTarget.texture.generateMipmaps = false;

	}

	var mirrorShader = {

		uniforms: THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ 'fog' ],
			THREE.UniformsLib[ 'lights' ],
			{
				"normalSampler": { value: null },
				"mirrorSampler": { value: null },
				"alpha": { value: 1.0 },
				"time": { value: 0.0 },
				"size": { value: 1.0 },
				"distortionScale": { value: 20.0 },
				"waveAmplitude": { value: 1.0 },
				"waveSpeed": { value: 1.0 },
				"waveScale": { value: 1.0 },
				"foamColor": { value: new THREE.Color( 0xdbe9f4 ) },
				"foamStrength": { value: 0.18 },
				"foamThreshold": { value: 0.62 },
				"textureMatrix": { value: new THREE.Matrix4() },
				"sunColor": { value: new THREE.Color( 0x7F7F7F ) },
				"sunDirection": { value: new THREE.Vector3( 0.70707, 0.70707, 0 ) },
				"eye": { value: new THREE.Vector3() },
				"waterColor": { value: new THREE.Color( 0x555555 ) }
			}
		] ),

		vertexShader: [
			'uniform mat4 textureMatrix;',
			'uniform float time;',
			'uniform float waveAmplitude;',
			'uniform float waveSpeed;',
			'uniform float waveScale;',

			'varying vec4 mirrorCoord;',
			'varying vec4 worldPosition;',
			'varying vec3 geometricNormal;',
			'varying float waveHeight;',
			'varying float waveSlope;',

			THREE.ShaderChunk[ 'fog_pars_vertex' ],
			THREE.ShaderChunk[ 'shadowmap_pars_vertex' ],

			'float getWaveHeight( vec2 p ) {',
			'	float t = time * waveSpeed;',
			'	float h = 0.0;',
			'	h += sin( p.x * 0.025 * waveScale + p.y * 0.014 * waveScale + t * 0.72 ) * 0.16;',
			'	h += sin( p.x * -0.018 * waveScale + p.y * 0.038 * waveScale + t * 0.94 + 1.7 ) * 0.05;',
			'	h += sin( p.x * 0.065 * waveScale + p.y * -0.025 * waveScale + t * 1.35 + 3.1 ) * 0.05;',
			'	h += sin( p.x * 0.010 * waveScale + p.y * 0.012 * waveScale + t * 0.38 + 0.8 ) * 0.12;',
			'	return h * waveAmplitude;',
			'}',

			'void main() {',
			'	vec3 displacedPosition = position;',
			'	float h = getWaveHeight( position.xy );',
			'	displacedPosition.z += h;',
			'	float epsilon = 0.75;',
			'	float hX = getWaveHeight( position.xy + vec2( epsilon, 0.0 ) );',
			'	float hY = getWaveHeight( position.xy + vec2( 0.0, epsilon ) );',
			'	vec3 tangentX = normalize( vec3( epsilon, 0.0, hX - h ) );',
			'	vec3 tangentY = normalize( vec3( 0.0, epsilon, hY - h ) );',
			'	vec3 localNormal = normalize( cross( tangentX, tangentY ) );',
			'	mirrorCoord = modelMatrix * vec4( displacedPosition, 1.0 );',
			'	worldPosition = mirrorCoord;',
			'	mirrorCoord = textureMatrix * mirrorCoord;',
			'	geometricNormal = normalize( mat3( modelMatrix ) * localNormal );',
			'	waveHeight = h;',
			'	waveSlope = clamp( length( vec2( hX - h, hY - h ) ) * 4.0, 0.0, 1.0 );',
			'	vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );',
			'	gl_Position = projectionMatrix * mvPosition;',

			THREE.ShaderChunk[ 'fog_vertex' ],
			THREE.ShaderChunk[ 'shadowmap_vertex' ],
			'}'
		].join('\n'),

		fragmentShader: [
			'uniform sampler2D mirrorSampler;',
			'uniform float alpha;',
			'uniform float time;',
			'uniform float size;',
			'uniform float distortionScale;',
			'uniform sampler2D normalSampler;',
			'uniform vec3 sunColor;',
			'uniform vec3 sunDirection;',
			'uniform vec3 eye;',
			'uniform vec3 waterColor;',
			'uniform vec3 foamColor;',
			'uniform float foamStrength;',
			'uniform float foamThreshold;',

			'varying vec4 mirrorCoord;',
			'varying vec4 worldPosition;',
			'varying vec3 geometricNormal;',
			'varying float waveHeight;',
			'varying float waveSlope;',

			'vec4 getNoise( vec2 uv ) {',
			'	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
			'	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
			'	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
			'	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
			'	vec4 noise = texture2D( normalSampler, uv0 ) +',
			'		texture2D( normalSampler, uv1 ) +',
			'		texture2D( normalSampler, uv2 ) +',
			'		texture2D( normalSampler, uv3 );',
			'	return noise * 0.5 - 1.0;',
			'}',

			'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {',
			'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
			'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
			'	specularColor += pow( direction, shiny ) * sunColor * spec;',
			'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
			'}',

			THREE.ShaderChunk[ 'common' ],
			THREE.ShaderChunk[ 'packing' ],
			THREE.ShaderChunk[ 'bsdfs' ],
			THREE.ShaderChunk[ 'fog_pars_fragment' ],
			THREE.ShaderChunk[ 'lights_pars_begin' ],
			THREE.ShaderChunk[ 'shadowmap_pars_fragment' ],
			THREE.ShaderChunk[ 'shadowmask_pars_fragment' ],

			'void main() {',
			'	vec4 noise = getNoise( worldPosition.xz * size );',
			'	vec3 detailNormal = normalize( noise.xzy * vec3( 0.75, 0.45, 0.75 ) );',
			'	vec3 surfaceNormal = normalize( geometricNormal + detailNormal * 0.34 );',

			'	vec3 diffuseLight = vec3(0.0);',
			'	vec3 specularLight = vec3(0.0);',

			'	vec3 worldToEye = eye-worldPosition.xyz;',
			'	vec3 eyeDirection = normalize( worldToEye );',
			'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

			'	float distance = length(worldToEye);',

			'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
			'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',

			'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
			'	float rf0 = 0.3;',
			'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
			'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
			'	vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);',
			'	float crest = smoothstep( foamThreshold, foamThreshold + 0.22, waveSlope + max( waveHeight, 0.0 ) * 0.8 );',
			'	float foamNoise = clamp( noise.r * 0.5 + noise.g * 0.5, 0.0, 1.0 );',
			'	float foam = crest * foamNoise * foamStrength;',
			'	vec3 outgoingLight = mix( albedo, foamColor, foam );',
			'	gl_FragColor = vec4( outgoingLight, alpha );',

			THREE.ShaderChunk[ 'tonemapping_fragment' ],
			THREE.ShaderChunk[ 'fog_fragment' ],

			'}'
		].join( '\n' )

	};

	var material = new THREE.ShaderMaterial( {
		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: THREE.UniformsUtils.clone( mirrorShader.uniforms ),
		transparent: true,
		lights: true,
		side: side,
		fog: fog
	} );

	material.uniforms[ "mirrorSampler" ].value = renderTarget.texture;
	material.uniforms[ "textureMatrix" ].value = textureMatrix;
	material.uniforms[ "alpha" ].value = alpha;
	material.uniforms[ "time" ].value = time;
	material.uniforms[ "normalSampler" ].value = normalSampler;
	material.uniforms[ "sunColor" ].value = sunColor;
	material.uniforms[ "waterColor" ].value = waterColor;
	material.uniforms[ "sunDirection" ].value = sunDirection;
	material.uniforms[ "distortionScale" ].value = distortionScale;
	material.uniforms[ "waveAmplitude" ].value = waveAmplitude;
	material.uniforms[ "waveSpeed" ].value = waveSpeed;
	material.uniforms[ "waveScale" ].value = waveScale;
	material.uniforms[ "foamColor" ].value = foamColor;
	material.uniforms[ "foamStrength" ].value = foamStrength;
	material.uniforms[ "foamThreshold" ].value = foamThreshold;

	material.uniforms[ "eye" ].value = eye;

	scope.material = material;

	scope.onBeforeRender = function ( renderer, scene, camera ) {

		mirrorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
		cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		rotationMatrix.extractRotation( scope.matrixWorld );

		normal.set( 0, 0, 1 );
		normal.applyMatrix4( rotationMatrix );

		view.subVectors( mirrorWorldPosition, cameraWorldPosition );

		// Avoid rendering when mirror is facing away

		if ( view.dot( normal ) > 0 ) return;

		view.reflect( normal ).negate();
		view.add( mirrorWorldPosition );

		rotationMatrix.extractRotation( camera.matrixWorld );

		lookAtPosition.set( 0, 0, - 1 );
		lookAtPosition.applyMatrix4( rotationMatrix );
		lookAtPosition.add( cameraWorldPosition );

		target.subVectors( mirrorWorldPosition, lookAtPosition );
		target.reflect( normal ).negate();
		target.add( mirrorWorldPosition );

		mirrorCamera.position.copy( view );
		mirrorCamera.up.set( 0, 1, 0 );
		mirrorCamera.up.applyMatrix4( rotationMatrix );
		mirrorCamera.up.reflect( normal );
		mirrorCamera.lookAt( target );

		mirrorCamera.far = camera.far; // Used in WebGLBackground

		mirrorCamera.updateMatrixWorld();
		mirrorCamera.projectionMatrix.copy( camera.projectionMatrix );

		// Update the texture matrix
		textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);
		textureMatrix.multiply( mirrorCamera.projectionMatrix );
		textureMatrix.multiply( mirrorCamera.matrixWorldInverse );

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		mirrorPlane.setFromNormalAndCoplanarPoint( normal, mirrorWorldPosition );
		mirrorPlane.applyMatrix4( mirrorCamera.matrixWorldInverse );

		clipPlane.set( mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant );

		var projectionMatrix = mirrorCamera.projectionMatrix;

		q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		q.z = - 1.0;
		q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = clipPlane.x;
		projectionMatrix.elements[ 6 ] = clipPlane.y;
		projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
		projectionMatrix.elements[ 14 ] = clipPlane.w;

		eye.setFromMatrixPosition( camera.matrixWorld );

		//

		var currentRenderTarget = renderer.getRenderTarget();

		var currentVrEnabled = renderer.vr.enabled;
		var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

		scope.visible = false;

		renderer.vr.enabled = false; // Avoid camera modification and recursion
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

		renderer.render( scene, mirrorCamera, renderTarget, true );

		scope.visible = true;

		renderer.vr.enabled = currentVrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		renderer.setRenderTarget( currentRenderTarget );

	};

};

THREE.Water.prototype = Object.create( THREE.Mesh.prototype );
THREE.Water.prototype.constructor = THREE.Water;
