import {
	m4,
    degToRad,
} from './math-utils.js';

import {
	getElementColor,
} from './misc-utils.js';

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
		crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0], crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1], crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2]
	];

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
};

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