export function createShader(gl, type, source) {
	//create shader for webgl context
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	};

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

export function createProgram(gl, vertexShader, fragmentShader) {
	//link vertex and fragment shader into program in webgl context
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

export function drawScene(gl, scene_objects, crystal_model) {
	//draw scene based on context scene objects and crystal model
	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);

	// Clear the canvas.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//Draw lattice cell
	gl.useProgram(scene_objects.cell_object.program);
	
	// Turn on the position attribute
	gl.enableVertexAttribArray(scene_objects.cell_object.a_position_location);
	
	// Bind the position buffer.
	gl.bindBuffer(gl.ARRAY_BUFFER, scene_objects.cell_object.position_buffer);

	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 3;          // 3 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(scene_objects.cell_object.a_position_location, size, type, normalize, stride, offset)

	// Turn on the color attribute
	gl.enableVertexAttribArray(scene_objects.cell_object.a_color_location);
	
	// Bind the color buffer.
	gl.bindBuffer(gl.ARRAY_BUFFER, scene_objects.cell_object.color_buffer);

	// Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
	var size = 3;                 // 3 components per iteration
	var type = gl.UNSIGNED_BYTE;             // the data is 8bit unsigned values
	var normalize = false;         // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;               // start at the beginning of the buffer
	gl.vertexAttribPointer(scene_objects.cell_object.a_color_location, size, type, normalize, stride, offset);

	// Bind the index buffer.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene_objects.cell_object.index_buffer);

	// Compute the transformation matrix
	var width = gl.canvas.clientWidth;
	var height = gl.canvas.clientHeight;
	var depth = 100000;

	var projection_matrix = m4.orthographic(width, height, depth);
	var matrix = m4.multiply(projection_matrix, scene_objects.cell_object.transform_matrix);

	// Set the matrix uniform.
	gl.uniformMatrix4fv(scene_objects.cell_object.u_matrix_location, false, matrix);

	// Draw cell
	var primitiveType = gl.LINES;
	var count = 24;
	var type = gl.UNSIGNED_SHORT;
	var offset = 0;
	gl.drawElements(primitiveType, count, type, offset);

	//Draw atoms
	gl.useProgram(scene_objects.atom_object.program);
	
	// Turn on the position attribute
	gl.enableVertexAttribArray(scene_objects.atom_object.a_position_location);
	
	// Bind the position buffer.
	gl.bindBuffer(gl.ARRAY_BUFFER, scene_objects.atom_object.position_buffer);

	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 3;          // 3 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(scene_objects.cell_object.a_position_location, size, type, normalize, stride, offset);

	// Bind the index buffer.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene_objects.atom_object.index_buffer);

	//Loop through atom array to draw each atom
	crystal_model.super_cell.atoms.forEach(function(atom){
		
		//compute translation vector
		var x_hat = [atom.x_atom_pos * crystal_model.super_cell.a_hat[0], atom.x_atom_pos * crystal_model.super_cell.a_hat[1], atom.x_atom_pos * crystal_model.super_cell.a_hat[2]];
		var y_hat = [atom.y_atom_pos * crystal_model.super_cell.b_hat[0], atom.y_atom_pos * crystal_model.super_cell.b_hat[1], atom.y_atom_pos * crystal_model.super_cell.b_hat[2]];
		var z_hat = [atom.z_atom_pos * crystal_model.super_cell.c_hat[0], atom.z_atom_pos * crystal_model.super_cell.c_hat[1], atom.z_atom_pos * crystal_model.super_cell.c_hat[2]];

		var translation_vector = [x_hat[0] + y_hat[0] + z_hat[0], x_hat[1] + y_hat[1] + z_hat[1], x_hat[2] + y_hat[2] + z_hat[2]];

		// Compute the matrix for this atom
		var matrix = m4.translate(scene_objects.atom_object.transform_matrix, translation_vector[0], translation_vector[1], translation_vector[2]);

		var width = gl.canvas.clientWidth;
		var height = gl.canvas.clientHeight;
		var depth = 100000;

		var projection_matrix = m4.orthographic(width, height, depth);
		matrix = m4.multiply(projection_matrix, matrix);
		matrix = m4.scale(matrix, 0.5, 0.5, 0.5);

		// Set the matrix uniform.
		gl.uniformMatrix4fv(scene_objects.atom_object.u_matrix_location, false, matrix);

		//compute lighting rotation matrix
		var lighting_matrix = scene_objects.atom_object.lighting_matrix;

		// Set the lighting rotation matrix.
		gl.uniformMatrix4fv(scene_objects.atom_object.u_lighting_rotation_location, false, lighting_matrix);

		// Set the color.
		gl.uniform4fv(scene_objects.atom_object.u_color_location, getElementColor(atom.element));

		//Draw atom
		var primitiveType = gl.TRIANGLES;
		var count = scene_objects.atom_object.index_count;
		var type = gl.UNSIGNED_SHORT;
		var offset = 0;
		gl.drawElements(primitiveType, count, type, offset);

	});


	//draw text overlay labeling for model origin and vectors
	// look up the divcontainer
	var origin_divContainerElement = document.querySelector("#origin_divcontainer");
	
	//remove all children from containing div
	origin_divContainerElement.querySelectorAll('*').forEach(n => n.remove());

	// make the div
	var origin_div = document.createElement("div");
	
	// assign it a CSS class
	origin_div.className = "floating-div";
	
	// make a text node for its content
	var origin_textNode = document.createTextNode("[0, 0, 0]");
	origin_div.appendChild(origin_textNode);

	origin_div.style.color = "white";

	var origin = [0, 0, 0, 1];
	var clipspace_origin = m4.transformVector(matrix, origin);
	// convert from clipspace to pixels
	var pixelX = (clipspace_origin[0] *  0.5 + 0.5) * gl.canvas.width;
	var pixelY = (clipspace_origin[1] * -0.5 + 0.5) * gl.canvas.height;
	// position the div
	origin_div.style.left = Math.floor(pixelX) + "px";
	origin_div.style.top  = Math.floor(pixelY) + "px";

	// add it to the divcontainer
	origin_divContainerElement.appendChild(origin_div);

	 // look up the divcontainer
	var ahat_divContainerElement = document.querySelector("#ahat_divcontainer");
	
	//remove all children from containing div
	ahat_divContainerElement.querySelectorAll('*').forEach(n => n.remove());

	// make the div
	var ahat_div = document.createElement("div");
	
	// assign it a CSS class
	ahat_div.className = "floating-div";
	
	// make a text node for its content
	var ahat_textNode;
	if (crystal_model.super_cell.a_hat_multiplier > 1.0) {
		ahat_textNode = document.createTextNode(String(crystal_model.super_cell.a_hat_multiplier)+"xâ");
	} else {
		ahat_textNode = document.createTextNode("â");
	}
	ahat_div.appendChild(ahat_textNode);
	ahat_div.style.color = "white";
	var ahat = [crystal_model.super_cell.a_hat[0], crystal_model.super_cell.a_hat[1], crystal_model.super_cell.a_hat[2], 1];
	var clipspace_ahat = m4.transformVector(matrix, ahat);
	// convert from clipspace to pixels
	var pixelX = (clipspace_ahat[0] *  0.5 + 0.5) * gl.canvas.width;
	var pixelY = (clipspace_ahat[1] * -0.5 + 0.5) * gl.canvas.height;
	
	// position the div
	ahat_div.style.left = Math.floor(pixelX) + "px";
	ahat_div.style.top  = Math.floor(pixelY) + "px";

	// add it to the divcontainer
	ahat_divContainerElement.appendChild(ahat_div);

	// look up the divcontainer
	var bhat_divContainerElement = document.querySelector("#bhat_divcontainer");
	
	//remove all children from containing div
	bhat_divContainerElement.querySelectorAll('*').forEach(n => n.remove());

	// make the div
	var bhat_div = document.createElement("div");
	
	// assign it a CSS class
	bhat_div.className = "floating-div";
	
	// make a text node for its content
	var bhat_textNode;
	if (crystal_model.super_cell.b_hat_multiplier > 1.0) {
		bhat_textNode = document.createTextNode(String(crystal_model.super_cell.b_hat_multiplier)+"xb̂");
	} else {
		bhat_textNode = document.createTextNode("b̂");
	}
	bhat_div.appendChild(bhat_textNode);
	bhat_div.style.color = "white";
	var bhat = [crystal_model.super_cell.b_hat[0], crystal_model.super_cell.b_hat[1], crystal_model.super_cell.b_hat[2], 1];
	var clipspace_bhat = m4.transformVector(matrix, bhat);
	// convert from clipspace to pixels
	var pixelX = (clipspace_bhat[0] *  0.5 + 0.5) * gl.canvas.width;
	var pixelY = (clipspace_bhat[1] * -0.5 + 0.5) * gl.canvas.height;
	
	// position the div
	bhat_div.style.left = Math.floor(pixelX) + "px";
	bhat_div.style.top  = Math.floor(pixelY) + "px";

	// add it to the divcontainer
	bhat_divContainerElement.appendChild(bhat_div);

	// look up the divcontainer
	var chat_divContainerElement = document.querySelector("#chat_divcontainer");
	
	//remove all children from containing div
	chat_divContainerElement.querySelectorAll('*').forEach(n => n.remove());

	//make the div
	var chat_div = document.createElement("div");
	
	//assign it a CSS class
	chat_div.className = "floating-div";
	
	//make a text node for its content
	var chat_textNode;
	if (crystal_model.super_cell.c_hat_multiplier > 1.0) {
		chat_textNode = document.createTextNode(String(crystal_model.super_cell.c_hat_multiplier)+"xĉ");
	} else {
		chat_textNode = document.createTextNode("ĉ");
	}
	chat_div.appendChild(chat_textNode);
	chat_div.style.color = "white";
	var chat = [crystal_model.super_cell.c_hat[0], crystal_model.super_cell.c_hat[1], crystal_model.super_cell.c_hat[2], 1];
	var clipspace_chat = m4.transformVector(matrix, chat);
	//convert from clipspace to pixels
	var pixelX = (clipspace_chat[0] *  0.5 + 0.5) * gl.canvas.width;
	var pixelY = (clipspace_chat[1] * -0.5 + 0.5) * gl.canvas.height;
	
	//position the div
	chat_div.style.left = Math.floor(pixelX) + "px";
	chat_div.style.top  = Math.floor(pixelY) + "px";

	//add it to the divcontainer
	chat_divContainerElement.appendChild(chat_div);

}

export function lineMeshPositionVertices(crystal_model){
	//takes crystal model data and generates line mesh position vertices
	var vertices = [
				// left column front
				0,   0,   0,
				crystal_model.super_cell.a_hat[0], crystal_model.super_cell.a_hat[1], crystal_model.super_cell.a_hat[2],
				crystal_model.super_cell.b_hat[0], crystal_model.super_cell.b_hat[1], crystal_model.super_cell.b_hat[2],
				crystal_model.super_cell.c_hat[0], crystal_model.super_cell.c_hat[1], crystal_model.super_cell.c_hat[2],
				crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0], crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1], crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2],
				crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.c_hat[0], crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.c_hat[1], crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.c_hat[2],
				crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0], crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1],crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2],
				crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0], crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1], crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2]];

	return vertices;
}

export function lineMeshColorVertices(){
	//generates line mesh color vertices
	var vertices = [
				// left column front
				0,  0, 0,
				1,  0, 0,
				0,  1, 0,
				0,  0, 1,
				0,  1, 1,
				1,  0, 1,
				1,  1, 0,
				1,  1, 1];

	return vertices;
}

export function lineMeshIndices(){
	//generates line mesh indices
	var indices = [
				// left column front
				0, 1,
				0, 2,
				0, 3,
				1, 5,
				1, 6,
				2, 4,
				2, 6,
				3, 4,
				3, 5,
				4, 7,
				5, 7,
				6, 7];

	return indices;
}

export function triangleMeshPositionVertices(latitude_count, longitude_count){
	//generate position vertices for sphere using parametric surface and number of latitudes and longitudes
	
	var vertices = [0, 0, 1];

	for (var lat_index = 1; lat_index < (latitude_count - 1); lat_index++){
		//generating layers of vertices
		for (var long_index = 0; long_index < longitude_count; long_index++){
			//generating vertices in each layer
			//set vertex points using spherical coordinates
			var phi = degToRad(180.0 * lat_index / (latitude_count-1));
			var theta = degToRad(360.0 * long_index / longitude_count);
			
			//append data array
			vertices.push(Math.sin(phi) * Math.cos(theta));
			vertices.push(Math.sin(phi) * Math.sin(theta));
			vertices.push(Math.cos(phi));

		};
	};  
	
	vertices = vertices.concat([0,0,-1]);

	return vertices;
}

export function triangleMeshIndices(latitude_count, longitude_count){
	//generate vertex indices for triangle mesh of sphere
	//initialize data array with single point at north pole of sphere
		var index_count = 0;
		var vertex_layers = [[index_count]];

		//generate array of arrays with each internal array representing a latitude
		for (var lat_index = 1; lat_index < (latitude_count - 1); lat_index++){
			var current_layer = [];
			for (var long_index = 0; long_index < longitude_count; long_index++){
				index_count += 1;
				current_layer.push((lat_index-1)*longitude_count+long_index+1);
			};
			vertex_layers.push(current_layer);
		};

		var last_index = vertex_layers[vertex_layers.length -1][vertex_layers[vertex_layers.length -1].length - 1] + 1;

		vertex_layers.push([last_index]);

		//setup final index array
		var index_array = [];

		//add indices for triangles including top point
		var layer_count = vertex_layers.length;
		var layer_length = vertex_layers[1].length;

		for (var i = 0; i < layer_length; i++){
			index_array.push(vertex_layers[0][0]);
			index_array.push(vertex_layers[1][i % layer_length]);
			index_array.push(vertex_layers[1][(i + 1) % layer_length]);
		}

		//add indeces for trianlges not including top and bottom points
		for (var i = 1; i < (layer_count - 2); i++){
			for (var j = 0; j < layer_length; j++){
				index_array.push(vertex_layers[i][j % layer_length]);
				index_array.push(vertex_layers[i + 1][j % layer_length]);
				index_array.push(vertex_layers[i + 1][(j + 1) % layer_length]);
				index_array.push(vertex_layers[i][j % layer_length]);
				index_array.push(vertex_layers[i + 1][(j + 1) % layer_length]);
				index_array.push(vertex_layers[i][(j + 1) % layer_length]);
			};
		};

		//add indeces for triangles including bottom point
		for (var i = 0; i < layer_length; i++){
			index_array.push(vertex_layers[layer_count - 2][i % layer_length]);
			index_array.push(vertex_layers[layer_count - 1][0]);
			index_array.push(vertex_layers[layer_count - 2][[i + 1] % layer_length]);
		}

		return index_array;
}

export function generateMeshData(crystal_model){
	//Takes crystal model and returns object of mesh objects containing mesh data
	var meshes = {};

	//generate info for crystal cell
	//generate line mesh position vertices from crystal model
	var line_mesh_position_vertices = lineMeshPositionVertices(crystal_model);

	//generate line mesh color vertices from crystal model
	var line_mesh_color_vertices = lineMeshColorVertices(crystal_model);

	//generate line mesh indices from crystal model
	var line_mesh_indices = lineMeshIndices(crystal_model);

	var cell_object = {type: 'crystal_cell',
						position_vertices: line_mesh_position_vertices,
						color_vertices: line_mesh_color_vertices,
						indices: line_mesh_indices};

	meshes.cell_mesh = cell_object;

	//generate info for atom

	var latitude_count = 10;
	var longitude_count = 10;

	//generate triangle mesh position vertices from crystal
	var triangle_mesh_position_vertices = triangleMeshPositionVertices(latitude_count, longitude_count);
	//generate triangle mesh indices from crystal
	var triangle_mesh_indices = triangleMeshIndices(latitude_count, longitude_count);

	var atom_object = {type: 'atom',
						position_vertices: triangle_mesh_position_vertices,
						indices: triangle_mesh_indices};

	meshes.atom_mesh = atom_object;

	return meshes;
}


export function generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix){
	//Create scene objects with info to draw scene
	var scene_objects = {};

	scene_objects.cell_object = {type: 'crystal_cell',
							position_buffer: mesh_buffers.cell_mesh.position_buffer,
							color_buffer: mesh_buffers.cell_mesh.color_buffer,
							index_buffer: mesh_buffers.cell_mesh.index_buffer,
							program: programs.lineMeshProgram,
							a_position_location: program_locations.line_mesh_program_locations.a_position_location,
							a_color_location: program_locations.line_mesh_program_locations.a_color_location,
							u_matrix_location: program_locations.line_mesh_program_locations.u_matrix_location,
							transform_matrix: cell_transform_matrix};
			
	scene_objects.atom_object = {type: 'atom',
							position_buffer: mesh_buffers.atom_mesh.position_buffer,
							index_buffer: mesh_buffers.atom_mesh.index_buffer,
							index_count: mesh_buffers.atom_mesh.index_count,
							program: programs.triangleMeshProgram,
							a_position_location: program_locations.triangle_mesh_program_locations.a_position_location,
							u_matrix_location: program_locations.triangle_mesh_program_locations.u_matrix_location,
							u_lighting_rotation_location: program_locations.triangle_mesh_program_locations.u_lighting_rotation_location,
							u_color_location: program_locations.triangle_mesh_program_locations.u_color_location,
							transform_matrix: cell_transform_matrix,
							lighting_matrix: atom_lighting_matrix};                  
	
	return scene_objects;
};

export function initializeBuffers(gl, mesh_data){
	//Initialize buffers based on mesh data and return object containing buffer handles
	var meshes = {};
	meshes.cell_mesh = {type: 'crystal_cell',
						position_buffer: gl.createBuffer(),
						color_buffer: gl.createBuffer(),
						index_buffer: gl.createBuffer()};
						
	//send cell mesh object data to buffers 
	gl.bindBuffer(gl.ARRAY_BUFFER, meshes.cell_mesh.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_data.cell_mesh.position_vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, meshes.cell_mesh.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(mesh_data.cell_mesh.color_vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.cell_mesh.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh_data.cell_mesh.indices), gl.STATIC_DRAW);

	meshes.atom_mesh = {type: 'atom',
						position_buffer: gl.createBuffer(),
						index_buffer: gl.createBuffer(),
						index_count: mesh_data.atom_mesh.indices.length};

	//send atom mesh object data to buffers 
	gl.bindBuffer(gl.ARRAY_BUFFER, meshes.atom_mesh.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_data.atom_mesh.position_vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.atom_mesh.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh_data.atom_mesh.indices), gl.STATIC_DRAW);

	return meshes;
};

export function updateBuffers(gl, mesh_data, mesh_buffers){
	//send object data to buffers 
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh_buffers.cell_mesh.position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh_data.cell_mesh.position_vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh_buffers.cell_mesh.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(mesh_data.cell_mesh.color_vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh_buffers.cell_mesh.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh_data.cell_mesh.indices), gl.STATIC_DRAW);
};


export function buildSuperCell(crystal_model){
	//construct supercell model based on unit cell model and supercell multipliers
	//this function could be encapuslated in crytal model object
	crystal_model.super_cell.a_hat = [crystal_model.unit_cell.a_hat[0] * crystal_model.super_cell.a_hat_multiplier,
										crystal_model.unit_cell.a_hat[1] * crystal_model.super_cell.a_hat_multiplier,
										crystal_model.unit_cell.a_hat[2] * crystal_model.super_cell.a_hat_multiplier];
	crystal_model.super_cell.b_hat = [crystal_model.unit_cell.b_hat[0] * crystal_model.super_cell.b_hat_multiplier,
										crystal_model.unit_cell.b_hat[1] * crystal_model.super_cell.b_hat_multiplier,
										crystal_model.unit_cell.b_hat[2] * crystal_model.super_cell.b_hat_multiplier];
	crystal_model.super_cell.c_hat = [crystal_model.unit_cell.c_hat[0] * crystal_model.super_cell.c_hat_multiplier,
										crystal_model.unit_cell.c_hat[1] * crystal_model.super_cell.c_hat_multiplier,
										crystal_model.unit_cell.c_hat[2] * crystal_model.super_cell.c_hat_multiplier];
	
	//create atom list for super cell
	crystal_model.super_cell.atoms = [];

	for (var k = 0; k < crystal_model.super_cell.c_hat_multiplier; k++){
		for (var j = 0; j < crystal_model.super_cell.b_hat_multiplier; j++){
			for (var i = 0; i < crystal_model.super_cell.a_hat_multiplier; i++){
				crystal_model.unit_cell.atoms.forEach(function(atom){
					var super_cell_atom = {element: atom.element,
											x_atom_pos: (atom.x_atom_pos + i) / crystal_model.super_cell.a_hat_multiplier,
											y_atom_pos: (atom.y_atom_pos + j) / crystal_model.super_cell.b_hat_multiplier,
											z_atom_pos: (atom.z_atom_pos + k) / crystal_model.super_cell.c_hat_multiplier}
					crystal_model.super_cell.atoms.push(super_cell_atom);
				});
			}
		}
	}
	return crystal_model;
}

export function getElementColor(element){
	//get element color based on Jmol coloring
	var color = [1, 0, 0, 1];

	switch (element) {
		case 'H':
			color = [1, 1, 1, 1];
			break;
		case 'He':
			color = [217/255, 1, 1, 1];
			break;
		case 'Li':
			color = [204/255, 128/255, 255/255, 1];
			break;
		case 'Be':
			color = [194/255, 255/255, 0/255, 1];
			break;
		case 'B':
			color = [255/255, 181/255, 181/255, 1];
			break;
		case 'C':
			color = [144/255, 144/255, 144/255, 1];
			break;
		case 'N':
			color = [48/255, 80/255, 248/255, 1];
			break;
		case 'O':
			color = [255/255, 13/255, 13/255, 1];
			break;
		case 'F':
			color = [144/255, 224/255, 80/255, 1];
			break;
		case 'Ne':
			color = [179/255, 227/255, 245/255, 1];
			break;
		case 'Na':
			color = [171/255, 92/255, 242/255, 1];
			break;
		case 'Mg':
			color = [138/255, 255/255, 0/255, 1];
			break;
		case 'Al':
			color = [191/255, 166/255, 166/255, 1];
			break;
		case 'Si':
			color = [240/255, 200/255, 160/255, 1];
			break;
		case 'P':
			color = [255/255, 128/255, 0/255, 1];
			break;
		case 'S':
			color = [255/255, 255/255, 48/255, 1];
			break;
		case 'Cl':
			color = [31/255, 240/255, 31/255, 1];
			break;
		case 'Ar':
			color = [128/255, 209/255, 227/255, 1];
			break;
		case 'K':
			color = [143/255, 64/255, 212/255, 1];
			break;
		case 'Ca':
			color = [61/255, 255/255, 0/255, 1];
			break;
		case 'Sc':
			color = [230/255, 230/255, 230/255, 1];
			break;
		case 'Ti':
			color = [191/255, 194/255, 199/255, 1];
			break;
		case 'V':
			color = [166/255, 166/255, 171/255, 1];
			break;
		case 'Cr':
			color = [138/255, 153/255, 199/255, 1];
			break;
		case 'Mn':
			color = [156/255, 122/255, 199/255, 1];
			break;
		case 'Fe':
			color = [224/255, 102/255, 51/255, 1];
			break;
		case 'Co':
			color = [240/255, 144/255, 160/255, 1];
			break;
		case 'Ni':
			color = [80/255, 208/255, 80/255, 1];
			break;
		case 'Cu':
			color = [200/255, 128/255, 51/255, 1];
			break;
		case 'Zn':
			color = [125/255, 128/255, 176/255, 1];
			break;
		case 'Ga':
			color = [194/255, 143/255, 143/255, 1];
			break;
		case 'Ge':
			color = [102/255, 143/255, 143/255, 1];
			break;
		case 'As':
			color = [189/255, 128/255, 227/255, 1];
			break;
		case 'Se':
			color = [255/255, 161/255, 0/255, 1];
			break;
		case 'Br':
			color = [166/255, 41/255, 41/255, 1];
			break;
		case 'Kr':
			color = [92/255, 184/255, 209/255, 1];
			break;
		case 'Rb':
			color = [112/255, 46/255, 176/255, 1];
			break;
		case 'Sr':
			color = [0/255, 255/255, 0/255, 1];
			break;
		case 'Y':
			color = [148/255, 255/255, 255/255, 1];
			break;
		case 'Zr':
			color = [148/255, 224/255, 224/255, 1];
			break;
		case 'Nb':
			color = [115/255, 194/255, 201/255, 1];
			break;
		case 'Mo':
			color = [84/255, 181/255, 181/255, 1];
			break;
		case 'Tc':
			color = [59/255, 158/255, 158/255, 1];
			break;
		case 'Ru':
			color = [36/255,143/255,143/255, 1];
			break;
		case 'Rh':
			color = [10/255,125/255,140/255, 1];
			break;
		case 'Pd':
			color = [0/255,105/255,133/255, 1];
			break;
		case 'Ag':
			color = [192/255,192/255,192/255, 1];
			break;
		case 'Cd':
			color = [255/255,217/255,143/255, 1];
			break;
		case 'In':
			color = [166/255,117/255,115/255, 1];
			break;
		case 'Sn':
			color = [102/255,128/255,128/255, 1];
			break;
		case 'Sb':
			color = [158/255,99/255,181/255, 1];
			break;
		case 'Te':
			color = [212/255,122/255,0/255, 1];
			break;
		case 'I':
			color = [148/255,0/255,148/255, 1];
			break;
		case 'Xe':
			color = [66/255,158/255,176/255, 1];
			break;
		case 'Cs':
			color = [87/255,23/255,143/255, 1];
			break;
		case 'Ba':
			color = [0/255,201/255,0/255, 1];
			break;
		case 'La':
			color = [112/255,212/255,255/255, 1];
			break;
		case 'Ce':
			color = [255/255,255/255,199/255, 1];
			break;
		case 'Pr':
			color = [217/255,255/255,199/255, 1];
			break;
		case 'Nd':
			color = [199/255,255/255,199/255, 1];
			break;
		case 'Pm':
			color = [163/255,255/255,199/255, 1];
			break;
		case 'Sm':
			color = [143/255,255/255,199/255, 1];
			break;
		case 'Eu':
			color = [97/255,255/255,199/255, 1];
			break;
		case 'Gd':
			color = [69/255,255/255,199/255, 1];
			break;
		case 'Tb':
			color = [48/255,255/255,199/255, 1];
			break;
		case 'Dy':
			color = [31/255,255/255,199/255, 1];
			break;
		case 'Ho':
			color = [0/255,255/255,156/255, 1];
			break;
		case 'Er':
			color = [0/255,230/255,117/255, 1];
			break;
		case 'Tm':
			color = [0/255,212/255,82/255, 1];
			break;
		case 'Yb':
			color = [0/255,191/255,56/255, 1];
			break;
		case 'Lu':
			color = [0/255,171/255,36/255, 1];
			break;
		case 'Hf':
			color = [77/255,194/255,255/255, 1];
			break;
		case 'Ta':
			color = [77/255,166/255,255/255, 1];
			break;
		case 'W':
			color = [33/255,148/255,214/255, 1];
			break;
		case 'Re':
			color = [38/255,125/255,171/255, 1];
			break;
		case 'Os':
			color = [38/255,102/255,150/255, 1];
			break;
		case 'Ir':
			color = [23/255,84/255,135/255, 1];
			break;
		case 'Pt':
			color = [208/255,208/255,224/255, 1];
			break;
		case 'Au':
			color = [255/255,209/255,35/255, 1];
			break;
		case 'Hg':
			color = [184/255,184/255,208/255, 1];
			break;
		case 'Tl':
			color = [166/255,84/255,77/255, 1];
			break;
		case 'Pb':
			color = [87/255,89/255,97/255, 1];
			break;
		case 'Bi':
			color = [158/255,79/255,181/255, 1];
			break;
		case 'Po':
			color = [171/255,92/255,0/255, 1];
			break;
		case 'At':
			color = [117/255,79/255,69/255, 1];
			break;
		case 'Rn':
			color = [66/255,130/255,150/255, 1];
			break;
		case 'Fr':
			color = [66/255,0/255,102/255, 1];
			break;
		case 'Ra':
			color = [0/255,125/255,0/255, 1];
			break;
		case 'Ac':
			color = [112/255,171/255,250/255, 1];
			break;
		case 'Th':
			color = [0/255,186/255,255/255, 1];
			break;
		case 'Pa':
			color = [0/255,161/255,255/255, 1];
			break;
		case 'U':
			color = [0/255,143/255,255/255, 1];
			break;
		case 'Np':
			color = [0/255,128/255,255/255, 1];
			break;
		case 'Pu':
			color = [0/255,107/255,255/255, 1];
			break;
		case 'Am':
			color = [84/255,92/255,242/255, 1];
			break;
		case 'Cm':
			color = [120/255,92/255,227/255, 1];
			break;
		case 'Bk':
			color = [138/255,79/255,227/255, 1];
			break;
		case 'Cf':
			color = [161/255,54/255,212/255, 1];
			break;
		case 'Es':
			color = [179/255,31/255,212/255, 1];
			break;
		case 'Fm':
			color = [179/255,31/255,186/255, 1];
			break;
		case 'Md':
			color = [179/255,13/255,166/255, 1];
			break;
		case 'No':
			color = [189/255,13/255,135/255, 1];
			break;
		case 'Lr':
			color = [199/255,0/255,102/255, 1];
			break;
		case 'Rf':
			color = [204/255,0/255,89/255, 1];
			break;
		case 'Db':
			color = [209/255,0/255,79/255, 1];
			break;
		case 'Sg':
			color = [217/255,0/255,69/255, 1];
			break;
		case 'Bh':
			color = [224/255,0/255,56/255, 1];
			break;
		case 'Hs':
			color = [230/255,0/255,46/255, 1];
			break;
		case 'Mt':
			color = [235/255,0/255,38/255, 1];
			break;
		case 'Ds':
			color = [240/255,0/255,28/255, 1];
			break;
		case 'Rg':
			color = [245/255,0/255,18/255, 1];
			break;
		case 'Cn':
			color = [250/255,0/255,8/255, 1];
			break;
		case 'Nh':
			color = [255/255,0/255,0/255, 1];
			break;
	}
	return color;
}

export function updateAtomListDisplay(crystal_model){
	//update atom list element to accurately reflect current model
	var atom_list_display = document.getElementById('unit-cell-atom-list');
	//remove all children from containing div
	atom_list_display.querySelectorAll('*').forEach(n => n.remove());
	var atom_list_length = crystal_model.unit_cell.atoms.length;
	for (var index = 0; index < atom_list_length; index++){
		var new_para = document.createElement("p");
		new_para.style.display = 'block';
		new_para.id = 'atom-' + String(index);
		new_para.classList.add('atom-list-item');
		new_para.innerHTML = crystal_model.unit_cell.atoms[index].element + ' ' 
							+ String(crystal_model.unit_cell.atoms[index].x_atom_pos.toFixed(3)) + ' '
							+ String(crystal_model.unit_cell.atoms[index].y_atom_pos.toFixed(3)) + ' '
							+ String(crystal_model.unit_cell.atoms[index].z_atom_pos.toFixed(3));

		//add event listener so list item can be selected
		new_para.addEventListener('click', function(){
			var previously_selected_list_item = document.querySelector('.selected-item');
			if (previously_selected_list_item){
				previously_selected_list_item.classList.remove('selected-item');
			}
			this.classList.add('selected-item');
		})
		atom_list_display.appendChild(new_para);
	}

}

//helper functions
export function randomInt(range) {
	// Returns a random integer from 0 to range - 1.
	return Math.floor(Math.random() * range);
}

export function radToDeg(r) {
	//convert radians to degrees
	return r * 180 / Math.PI;
}

export function degToRad(d) {
	//convert degrees to radians
	return d * Math.PI / 180.0;
}

export function isNumeric(str) {
	//checks if string is a number or not
	if (/[^-\.\d]/.test(str)) {
		return false;
	} else {
		return true;
	}
}

export function transformMatrix(transform_parameters){
	//generates transformation matrix based on transformation parameters
	var matrix = m4.identity();
	matrix = m4.scale(matrix, transform_parameters.scale[0], transform_parameters.scale[1], transform_parameters.scale[2]);
	matrix = m4.xRotate(matrix, transform_parameters.rotation[0]);
	matrix = m4.yRotate(matrix, transform_parameters.rotation[1]);
	matrix = m4.zRotate(matrix, transform_parameters.rotation[2]);
	matrix = m4.translate(matrix, transform_parameters.translation[0], transform_parameters.translation[1], transform_parameters.translation[2]);
	return matrix;
}


export function lightingMatrix(transform_parameters){
	//generates lighting matrix based on transformation parameters
	var matrix = m4.identity();
	matrix = m4.xRotate(matrix, transform_parameters.rotation[0]);
	matrix = m4.yRotate(matrix, transform_parameters.rotation[1]);
	matrix = m4.zRotate(matrix, transform_parameters.rotation[2]);

	return matrix;
}

export var m4 = {
	//4D matrix methods that serve as transformation matrices 
	identity: function() {
		return [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0,0,0,1,
		];
	},

	orthographic: function(width, height, depth) {
		//orthographic projection
		return [
		1 / width, 0, 0, 0,
		0, 0, 1 / depth, 0,
		0, 1 / height, 0, 0,
	
		0,0,0,1,
		];
	},

	translation: function(tx, ty, tz) {
		//translate along vector [tx, ty, tz]
		return [
		1,  0,  0,  0,
		0,  1,  0,  0,
		0,  0,  1,  0,
		tx, ty, tz, 1,
		];
	},
	
	xRotation: function(angleInRadians) {
		//rotate about x-axis
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
		//rotate about y-axis
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
		//rotate about z-axis
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
		//scale in x, y, and z direction according to sx, sy, sz
		return [
		sx, 0,  0,  0,
		0, sy,  0,  0,
		0,  0, sz,  0,
		0,  0,  0,  1,
		];
	},

	projection: function(width, height, depth) {
		//projection matrix
		// Note: This matrix flips the Y axis so 0 is at the top.
		return [
		2 / width, 0, 0, 0,
		0, -2 / height, 0, 0,
		0, 0, 2 / depth, 0,
		-1, 1, 0, 1,
		];
	},

	//operations that generate a compound transformation matrix by 
	//multiplying a starting matrix m by a given transformation matrix
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
		//apply matrix transformation to a single vector
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
		//multiply two matrices together
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