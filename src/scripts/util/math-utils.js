export var m4 = {
	// 4D matrix methods that serve as transformation matrices 
	identity: function() {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0,0,0,1,
		];
	},

	orthographic: function(width, height, depth) {
		// orthographic projection
		return [
			1 / width, 0, 0, 0,
			0, 0, 1 / depth, 0,
			0, 1 / height, 0, 0,
			0,0,0,1,
		];
	},

	translation: function(tx, ty, tz) {
		// translate along vector [tx, ty, tz]
		return [
			1,  0,  0,  0,
			0,  1,  0,  0,
			0,  0,  1,  0,
			tx, ty, tz, 1,
		];
	},
	
	xRotation: function(angleInRadians) {
		// rotate about x-axis
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
	
		return [
			1, 0, 0, 0,
			0, c, s, 0,
			0, -s, c, 0,
			0, 0, 0, 1,
		];
	},
	
	yRotation: function(angleInRadians) {
		// rotate about y-axis
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
	
		return [
			c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1,
		];
	},
	
	zRotation: function(angleInRadians) {
		// rotate about z-axis
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
	
		return [
			c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		];
	},
	
	scaling: function(sx, sy, sz) {
		// scale in x, y, and z direction according to sx, sy, sz
		return [
			sx, 0,  0,  0,
			0, sy,  0,  0,
			0,  0, sz,  0,
			0,  0,  0,  1,
		];
	},

	projection: function(width, height, depth) {
		// projection matrix
		// Note: This matrix flips the Y axis so 0 is at the top.
		return [
			2 / width, 0, 0, 0,
			0, -2 / height, 0, 0,
			0, 0, 2 / depth, 0,
			-1, 1, 0, 1,
		];
	},

	// operations that generate a compound transformation matrix by 
	// multiplying a starting matrix m by a given transformation matrix
	translate: function(m, tx, ty, tz) {
		return m4.multiply(m, m4.translation(tx, ty, tz));
	},
	
	xRotate: function(m, angleInRadians) {
		return m4.multiply(m, m4.xRotation(angleInRadians));
	},
	
	yRotate: function(m, angleInRadians) {
		return m4.multiply(m, m4.yRotation(angleInRadians));
	},
	
	zRotate: function(m, angleInRadians) {
		return m4.multiply(m, m4.zRotation(angleInRadians));
	},
	
	scale: function(m, sx, sy, sz) {
		return m4.multiply(m, m4.scaling(sx, sy, sz));
	},

	transformVector: function(matrix, point){
		// apply matrix transformation to a single vector
		var m00 = matrix[0 * 4 + 0];
		var m01 = matrix[0 * 4 + 1];
		var m02 = matrix[0 * 4 + 2];
		var m03 = matrix[0 * 4 + 3];
		var m10 = matrix[1 * 4 + 0];
		var m11 = matrix[1 * 4 + 1];
		var m12 = matrix[1 * 4 + 2];
		var m13 = matrix[1 * 4 + 3];
		var m20 = matrix[2 * 4 + 0];
		var m21 = matrix[2 * 4 + 1];
		var m22 = matrix[2 * 4 + 2];
		var m23 = matrix[2 * 4 + 3];
		var m30 = matrix[3 * 4 + 0];
		var m31 = matrix[3 * 4 + 1];
		var m32 = matrix[3 * 4 + 2];
		var m33 = matrix[3 * 4 + 3];
		var p0 = point[0];
		var p1 = point[1];
		var p2 = point[2];
		var p3 = point[3];

		return [
			p0 * m00 + p1 * m10 + p2 * m20 + p3 * m30,
			p0 * m01 + p1 * m11 + p2 * m21 + p3 * m31,
			p0 * m02 + p1 * m12 + p2 * m22 + p3 * m32,
			p0 * m03 + p1 * m13 + p2 * m23 + p3 * m33
		];

	},

	multiply: function(a, b) {
		// multiply two matrices together
		var b00 = b[0 * 4 + 0];
		var b01 = b[0 * 4 + 1];
		var b02 = b[0 * 4 + 2];
		var b03 = b[0 * 4 + 3];
		var b10 = b[1 * 4 + 0];
		var b11 = b[1 * 4 + 1];
		var b12 = b[1 * 4 + 2];
		var b13 = b[1 * 4 + 3];
		var b20 = b[2 * 4 + 0];
		var b21 = b[2 * 4 + 1];
		var b22 = b[2 * 4 + 2];
		var b23 = b[2 * 4 + 3];
		var b30 = b[3 * 4 + 0];
		var b31 = b[3 * 4 + 1];
		var b32 = b[3 * 4 + 2];
		var b33 = b[3 * 4 + 3];
		var a00 = a[0 * 4 + 0];
		var a01 = a[0 * 4 + 1];
		var a02 = a[0 * 4 + 2];
		var a03 = a[0 * 4 + 3];
		var a10 = a[1 * 4 + 0];
		var a11 = a[1 * 4 + 1];
		var a12 = a[1 * 4 + 2];
		var a13 = a[1 * 4 + 3];
		var a20 = a[2 * 4 + 0];
		var a21 = a[2 * 4 + 1];
		var a22 = a[2 * 4 + 2];
		var a23 = a[2 * 4 + 3];
		var a30 = a[3 * 4 + 0];
		var a31 = a[3 * 4 + 1];
		var a32 = a[3 * 4 + 2];
		var a33 = a[3 * 4 + 3];
	
		return [
			b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
			b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
			b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
			b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
			b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
			b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
			b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
			b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
			b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
			b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
			b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
			b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
			b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
			b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
			b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
			b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
		];
	}
};

export function transformMatrix(transform_parameters){
	// generates transformation matrix based on transformation parameters
	var matrix = m4.identity();
	matrix = m4.scale(matrix, transform_parameters.scale[0], transform_parameters.scale[1], transform_parameters.scale[2]);
	matrix = m4.xRotate(matrix, transform_parameters.rotation[0]);
	matrix = m4.yRotate(matrix, transform_parameters.rotation[1]);
	matrix = m4.zRotate(matrix, transform_parameters.rotation[2]);
	matrix = m4.translate(matrix, transform_parameters.translation[0], transform_parameters.translation[1], transform_parameters.translation[2]);
	return matrix;
};

export function lightingMatrix(transform_parameters){
	// generates lighting matrix based on transformation parameters
	var matrix = m4.identity();
	matrix = m4.xRotate(matrix, transform_parameters.rotation[0]);
	matrix = m4.yRotate(matrix, transform_parameters.rotation[1]);
	matrix = m4.zRotate(matrix, transform_parameters.rotation[2]);
	return matrix;
};

export function radToDeg(r) {
	// convert radians to degrees
	return r * 180 / Math.PI;
};

export function degToRad(d) {
	// convert degrees to radians
	return d * Math.PI / 180.0;
};