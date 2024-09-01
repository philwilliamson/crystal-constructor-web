"use strict";

//import needed functions
import {
	degToRad,
	radToDeg,
	buildSuperCell,
	drawScene,
	createShader,
	createProgram,
	generateMeshData,
	initializeBuffers,
	updateBuffers,
	transformMatrix,
	lightingMatrix,
	generateSceneObjects,
	updateAtomListDisplay} from './util.js';

//set up crystal model object
var crystal_model = {
	unit_cell: {
	a_hat: [1.0, 0.0, 0.0],
	b_hat: [0.0, 1.0, 0.0],
	c_hat: [0.0, 0.0, 1.0],
	atoms: []},
	super_cell: {
	a_hat_multiplier: 1.0,
	b_hat_multiplier: 1.0,
	c_hat_multiplier: 1.0,
	a_hat: [1.0, 0.0, 0.0],
	b_hat: [0.0, 1.0, 0.0],
	c_hat: [0.0, 0.0, 1.0],
	atoms: []}
};

const lineMeshVertexShaderSource = `
        // an attribute will receive data from a buffer
		attribute vec4 a_position;
		attribute vec4 a_color;

		uniform mat4 u_matrix;

		varying vec4 v_color;

		void main() {
		// Multiply the position by the matrix.
		gl_Position = u_matrix * a_position;

		// Pass the color to the fragment shader.
		v_color = a_color;
		}
`;

const lineMeshFragmentShaderSource = `
        // fragment shaders don't have a default precision so we need
		// to pick one. mediump is a good default
		precision mediump float;

		// Passed in from the vertex shader.
		varying vec4 v_color;

		void main() {
		// gl_FragColor is a special variable a fragment shader
		// is responsible for setting
		gl_FragColor = v_color;
		}
`;

const triangleMeshVertexShaderSource = `
    // an attribute will receive data from a buffer
    attribute vec4 a_position;

    uniform mat4 u_matrix;
    uniform mat4 u_lighting_rotation;

    varying vec4 v_color_multiplier;

    void main() {
    // Multiply the position by the matrix.
    gl_Position = u_matrix * a_position;

    //use position to get color multiplier
    vec4 rotated_vertex = u_lighting_rotation * a_position;
    vec3 pos_vector = vec3(rotated_vertex.xyz);
    vec3 light_vector = vec3(-1.0,-1.0,1.0);

    float dot_product = dot(normalize(light_vector),normalize(pos_vector));
    float multiplier = (dot_product + 1.0) / 2.0;
    v_color_multiplier = vec4(vec3(multiplier), 1.0);
    }
`;

const triangleMeshFragmentShaderSource = `
        // fragment shaders don't have a default precision so we need
		// to pick one. mediump is a good default
		precision mediump float;

		uniform vec4 u_color;

		varying vec4 v_color_multiplier;

		void main() {
		// gl_FragColor is a special variable a fragment shader
		// is responsible for setting
		gl_FragColor = u_color * v_color_multiplier;
		}
`;

//setup crystal model inputs
//element selection
var CURRENT_SELECTED_ELEMENT = null;
//add event listeners to periodic table element
[...document.querySelectorAll('.element-symbol')].forEach(function(symbol) {
	symbol.addEventListener('click', function() {
		var previously_selected_element = document.querySelector('.selected-element');
		if (previously_selected_element){
			previously_selected_element.classList.remove('selected-element');
		}
		
		symbol.classList.add('selected-element');
		CURRENT_SELECTED_ELEMENT = String(symbol.innerHTML);
	});
});

//grab button and input elements
var reset_model_button = document.getElementById("reset-button");
var remove_atom_button = document.getElementById('remove-atom-button');
var x_atom_pos_input = document.getElementById('x_atom_pos');
var y_atom_pos_input = document.getElementById('y_atom_pos');
var z_atom_pos_input = document.getElementById('z_atom_pos');
var add_atom_button_input = document.getElementById('add-atom-button');
var basis_radio_input = document.getElementById('basis-radio');
var parameters_radio_input = document.getElementById('parameters-radio');
var a_hat_x_input = document.getElementById('a_hat_x');
var b_hat_x_input = document.getElementById('b_hat_x');
var b_hat_y_input = document.getElementById('b_hat_y');
var c_hat_x_input = document.getElementById('c_hat_x');
var c_hat_y_input = document.getElementById('c_hat_y');
var c_hat_z_input = document.getElementById('c_hat_z');
var a_param_input = document.getElementById('a_parameter');
var b_param_input = document.getElementById('b_parameter');
var c_param_input = document.getElementById('c_parameter');
var alpha_param_input = document.getElementById('alpha_parameter');
var beta_param_input = document.getElementById('beta_parameter');
var gamma_param_input = document.getElementById('gamma_parameter');
var a_hat_multiplier_input = document.getElementById('a_hat_multiplier');
var b_hat_multiplier_input = document.getElementById('b_hat_multiplier');
var c_hat_multiplier_input = document.getElementById('c_hat_multiplier');
var build_button_input = document.getElementById('build-button');

//event listeners for changing basis input mode
basis_radio_input.onclick = function(){
	var basis_section = document.getElementById("lattice-basis-input");
	var parameter_section = document.getElementById("lattice-parameter-input");
	//reveal basis vector input and hide parameter input
	basis_section.classList.remove('hidden-input-section');
	parameter_section.classList.add('hidden-input-section');
}

parameters_radio_input.onclick = function(){
	var basis_section = document.getElementById("lattice-basis-input");
	var parameter_section = document.getElementById("lattice-parameter-input");
	//reveal parameter input and hide basis vector input
	basis_section.classList.add('hidden-input-section');
	parameter_section.classList.remove('hidden-input-section');
}

//event listener for reset model button
reset_model_button.onclick = function(){
	//reset model to orthonormal basis
	crystal_model.unit_cell.a_hat = [1,0,0];
	crystal_model.unit_cell.b_hat = [0,1,0];
	crystal_model.unit_cell.c_hat = [0,0,1];
	//clear atoms
	crystal_model.unit_cell.atoms = [];

	crystal_model.super_cell.a_hat_multiplier = 1.0;
	crystal_model.super_cell.b_hat_multiplier = 1.0;
	crystal_model.super_cell.c_hat_multiplier = 1.0;

	crystal_model = buildSuperCell(crystal_model);
	//reset input field values
	x_atom_pos_input.value = String(0.0.toFixed(3));
	y_atom_pos_input.value = String(0.0.toFixed(3));
	z_atom_pos_input.value = String(0.0.toFixed(3));
	a_hat_x_input.value = String(1.0.toFixed(3)); 
	b_hat_x_input.value = String(0.0.toFixed(3)); 
	b_hat_y_input.value = String(1.0.toFixed(3)); 
	c_hat_x_input.value = String(0.0.toFixed(3)); 
	c_hat_y_input.value = String(0.0.toFixed(3)); 
	c_hat_z_input.value = String(1.0.toFixed(3)); 
	a_param_input.value = String(1.0.toFixed(3)); 
	b_param_input.value = String(1.0.toFixed(3)); 
	c_param_input.value = String(1.0.toFixed(3)); 
	alpha_param_input.value = String(90.0.toFixed(3)); 
	beta_param_input.value = String(90.0.toFixed(3));
	gamma_param_input.value = String(90.0.toFixed(3)); 
	a_hat_multiplier_input.value = String(1.0.toFixed(0)); 
	b_hat_multiplier_input.value = String(1.0.toFixed(0)); 
	c_hat_multiplier_input.value = String(1.0.toFixed(0));
	
	updateAtomListDisplay(crystal_model); 

	//Set information for transformation matrix uniform
	cell_transform_parameters = {translation: [-0.5*(crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0]), 
								-0.5*(crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1]),
								-0.5*(crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2])],
									rotation: [degToRad(30), degToRad(0), degToRad(125)],
									scale: [600, 600, 600]};

	//generate transformation matrix based on parameters
	var cell_transform_matrix = transformMatrix(cell_transform_parameters);
	var atom_lighting_matrix = lightingMatrix(cell_transform_parameters);

	//generate mesh data from crstal model
	mesh_data = generateMeshData(crystal_model);

	//initialize buffers and generate objects with buffer handles
	updateBuffers(gl, mesh_data, mesh_buffers);

	//Generate objects with buffer handles, program locations, and tranformation matrices
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);

	drawScene(gl, scene_objects, crystal_model);

	document.getElementById('lattice-parameters-feedback').querySelectorAll('*').forEach(n => n.remove());
	document.getElementById('atom-position-feedback').querySelectorAll('*').forEach(n => n.remove());
};

//event listener to remove atom
remove_atom_button.onclick = function(){
	var current_selected_item = document.querySelector('.selected-item')

	if (current_selected_item) {
		var atom_index = Number(String(current_selected_item.id).slice(-1));
		crystal_model.unit_cell.atoms.splice(atom_index, 1);
		crystal_model = buildSuperCell(crystal_model);
		drawScene(gl, scene_objects, crystal_model);
		updateAtomListDisplay(crystal_model);
	}
}

//event listener for add atom button
add_atom_button_input.onclick = function(){
	var atom_position_feedback = document.getElementById('atom-position-feedback');
	
	if (CURRENT_SELECTED_ELEMENT){
		var element = CURRENT_SELECTED_ELEMENT;
		var x_atom_pos = parseFloat(x_atom_pos_input.value);
		var y_atom_pos = parseFloat(y_atom_pos_input.value);
		var z_atom_pos = parseFloat(z_atom_pos_input.value);

		//provide feedback if atom position is invalid
		if (isNaN(x_atom_pos)
			|| isNaN(y_atom_pos)
			|| isNaN(z_atom_pos)) {
				atom_position_feedback.querySelectorAll('*').forEach(n => n.remove());

				var new_para = document.createElement("p");
				new_para.innerHTML = 'Input fields must be numeric values.';
				new_para.style.color = 'red';
				atom_position_feedback.appendChild(new_para);
		} else if (!(x_atom_pos >= 0 && x_atom_pos < 1.0) || !(y_atom_pos >= 0 && y_atom_pos < 1.0) || !(z_atom_pos >= 0 && z_atom_pos < 1.0)){
			atom_position_feedback.querySelectorAll('*').forEach(n => n.remove());

			var new_para = document.createElement("p");
			new_para.innerHTML = 'Atom coordinate components must be greater than or equal to 0.0 and less than 1.0.';
			new_para.style.color = 'red';
			atom_position_feedback.appendChild(new_para);
		} else {

			//fix input field values
			x_atom_pos_input.value = x_atom_pos.toFixed(3);
			y_atom_pos_input.value = y_atom_pos.toFixed(3);
			z_atom_pos_input.value = z_atom_pos.toFixed(3);

			atom_position_feedback.querySelectorAll('*').forEach(n => n.remove());

			var new_para = document.createElement("p");
			new_para.innerHTML = 'Valid atom coordinate.';
			new_para.style.color = 'Green';
			atom_position_feedback.appendChild(new_para);

			crystal_model.unit_cell.atoms.push({element, x_atom_pos, y_atom_pos, z_atom_pos});

			crystal_model = buildSuperCell(crystal_model);

			drawScene(gl, scene_objects, crystal_model);

			updateAtomListDisplay(crystal_model);

		}

		

	} else {
		atom_position_feedback.querySelectorAll('*').forEach(n => n.remove());

		var new_para = document.createElement("p");
		new_para.innerHTML = 'Please select an atom.';
		new_para.style.color = 'red';
		atom_position_feedback.appendChild(new_para);
	}
};

//event listener for build button
build_button_input.onclick = function(){

	//check which input mode is active
	if (basis_radio_input.checked) {
		var a_hat_x = parseFloat(a_hat_x_input.value);
		var b_hat_x = parseFloat(b_hat_x_input.value);
		var b_hat_y = parseFloat(b_hat_y_input.value);
		var c_hat_x = parseFloat(c_hat_x_input.value);
		var c_hat_y = parseFloat(c_hat_y_input.value);
		var c_hat_z = parseFloat(c_hat_z_input.value);
		var a_hat_multiplier = parseFloat(a_hat_multiplier_input.value);
		var b_hat_multiplier = parseFloat(b_hat_multiplier_input.value);
		var c_hat_multiplier = parseFloat(c_hat_multiplier_input.value);
		
		//a, b, and c vector magnitudes
		var a_magn = Math.sqrt(Math.pow(a_hat_x,2));
		var b_magn = Math.sqrt(Math.pow(b_hat_x,2) + Math.pow(b_hat_y,2));
		var c_magn = Math.sqrt(Math.pow(c_hat_x,2) + Math.pow(c_hat_y,2) + Math.pow(c_hat_z,2));

		//angles between basis vectors
		var alpha = Math.acos((b_hat_x*c_hat_x + b_hat_y*c_hat_y)/(b_magn*c_magn))
		var beta = Math.acos((c_hat_x*a_hat_x)/(c_magn*a_magn))
		var gamma = Math.acos((a_hat_x*b_hat_x)/(a_magn*b_magn))

		//give feedback on possibly invalid lattice angles
		var lattice_parameter_feedback = document.getElementById('lattice-parameters-feedback');
		
		if (isNaN(a_hat_x)
			|| isNaN(b_hat_x)
			|| isNaN(b_hat_y)
			|| isNaN(c_hat_x)
			|| isNaN(c_hat_y)
			|| isNaN(c_hat_z)
			|| isNaN(a_hat_multiplier)
			|| isNaN(b_hat_multiplier)
			|| isNaN(c_hat_multiplier)) {
				lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove())
				var new_para = document.createElement("p");
				new_para.innerHTML = 'Input fields must be numeric values.';
				new_para.style.color = 'red';
				lattice_parameter_feedback.appendChild(new_para);
		} else if (a_hat_x < 0){
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#226 must lay along x-axis with positive x-component.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (b_hat_y < 0.0) {
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#98&#770 must lay in xy-plane with positive y-component.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (c_hat_z < 0.0) {
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#99&#770 must have positive z-component.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (a_hat_multiplier <= 0 || b_hat_multiplier <= 0 || c_hat_multiplier <=0 || !Number.isInteger(a_hat_multiplier) || !Number.isInteger(b_hat_multiplier) || !Number.isInteger(c_hat_multiplier)){
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#226, &#98&#770, and &#99&#770 multipliers must be non-zero, positive integers.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else {			
			//fix input field values
			a_hat_x_input.value = a_hat_x.toFixed(3);
			b_hat_x_input.value = b_hat_x.toFixed(3);
			b_hat_y_input.value = b_hat_y.toFixed(3);
			c_hat_x_input.value = c_hat_x.toFixed(3);
			c_hat_y_input.value = c_hat_y.toFixed(3);
			c_hat_z_input.value = c_hat_z.toFixed(3);
			a_hat_multiplier_input.value = a_hat_multiplier.toFixed(0);
			b_hat_multiplier_input.value = b_hat_multiplier.toFixed(0);
			c_hat_multiplier_input.value = c_hat_multiplier.toFixed(0);

			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = 'Lattice basis vectors accepted.';
			new_para.style.color = 'green';
			lattice_parameter_feedback.appendChild(new_para);

			//modify crystal model based on input
			crystal_model.unit_cell.a_hat = [a_hat_x, 0.0, 0.0];
			crystal_model.unit_cell.b_hat = [b_hat_x, b_hat_y, 0.0];
			crystal_model.unit_cell.c_hat = [c_hat_x, c_hat_y, c_hat_z];

			crystal_model.super_cell.a_hat_multiplier = a_hat_multiplier;
			crystal_model.super_cell.b_hat_multiplier = b_hat_multiplier;
			crystal_model.super_cell.c_hat_multiplier = c_hat_multiplier;

			crystal_model = buildSuperCell(crystal_model);

			cell_transform_parameters.translation = [-0.5*(crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0]), 
									-0.5*(crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1]),
									-0.5*(crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2])]
			
			//set scale factor based on basis vector magnitudes and supercell size
			var a_super_cell_length = a_magn * a_hat_multiplier;
			var b_super_cell_length = b_magn * b_hat_multiplier;
			var c_super_cell_length = c_magn * c_hat_multiplier;

			//set scale transformation according to longest supercell basis vector
			if (a_super_cell_length >= b_super_cell_length && a_super_cell_length >= c_super_cell_length){
				cell_transform_parameters.scale = [600/a_super_cell_length, 600/a_super_cell_length, 600/a_super_cell_length];
			} else if (b_super_cell_length >= a_super_cell_length && b_super_cell_length >= c_super_cell_length) {
				cell_transform_parameters.scale = [600/b_super_cell_length, 600/b_super_cell_length, 600/b_super_cell_length];
			} else if (c_super_cell_length >= a_super_cell_length && c_super_cell_length >= b_super_cell_length) {
				cell_transform_parameters.scale = [600/c_super_cell_length, 600/c_super_cell_length, 600/c_super_cell_length];
			}

			
			cell_transform_matrix = transformMatrix(cell_transform_parameters);
			atom_lighting_matrix = lightingMatrix(cell_transform_parameters);

			//generate mesh data from crystal model
			mesh_data = generateMeshData(crystal_model);

			//initialize buffers and generate objects with buffer handles
			updateBuffers(gl, mesh_data, mesh_buffers);

			//generate objects with buffer handles, program locations, and tranformation matrices
			scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);

			drawScene(gl, scene_objects, crystal_model);
			
			//update basis params input fields values
			a_param_input.value = String(a_magn.toFixed(3));
			b_param_input.value = String(b_magn.toFixed(3));
			c_param_input.value = String(c_magn.toFixed(3));
			alpha_param_input.value = String(radToDeg(alpha).toFixed(3));
			beta_param_input.value = String(radToDeg(beta).toFixed(3));
			gamma_param_input.value = String(radToDeg(gamma).toFixed(3));
		}

	} else if (parameters_radio_input.checked) {
		var a_latt_param = parseFloat(a_param_input.value);
		var b_latt_param = parseFloat(b_param_input.value);
		var c_latt_param = parseFloat(c_param_input.value);
		var alpha_latt_param = parseFloat(alpha_param_input.value);
		var beta_latt_param = parseFloat(beta_param_input.value);
		var gamma_latt_param = parseFloat(gamma_param_input.value);
		var a_hat_multiplier = parseFloat(a_hat_multiplier_input.value);
		var b_hat_multiplier = parseFloat(b_hat_multiplier_input.value);
		var c_hat_multiplier = parseFloat(c_hat_multiplier_input.value);

		//calculate basis vectors components based on length and angle parameters
		var a1 = a_latt_param;
		var b1 = b_latt_param * Math.cos(degToRad(gamma_latt_param));
		var b2 = b_latt_param * Math.sin(degToRad(gamma_latt_param));
		var c1 = a_latt_param * c_latt_param * Math.cos(degToRad(beta_latt_param)) / a1;
		var c2 = (b_latt_param * c_latt_param * Math.cos(degToRad(alpha_latt_param)) - b1 * c1) / b2;
		var c3 = Math.sqrt(Math.pow(c_latt_param,2) - Math.pow(c1,2) - Math.pow(c2,2));
		


		//give feedback on lattice angles
		var lattice_parameter_feedback = document.getElementById('lattice-parameters-feedback');
		
		var min_alpha = radToDeg(Math.acos(Math.cos(degToRad(beta_latt_param))*Math.cos(degToRad(gamma_latt_param)) + Math.sin(degToRad(beta_latt_param))*Math.sin(degToRad(gamma_latt_param))));
		var max_alpha = radToDeg(Math.acos(Math.cos(degToRad(beta_latt_param))*Math.cos(degToRad(gamma_latt_param)) - Math.sin(degToRad(beta_latt_param))*Math.sin(degToRad(gamma_latt_param))));

		if (isNaN(a_latt_param)
			|| isNaN(b_latt_param)
			|| isNaN(c_latt_param)
			|| isNaN(alpha_latt_param)
			|| isNaN(beta_latt_param)
			|| isNaN(gamma_latt_param)
			|| isNaN(a_hat_multiplier)
			|| isNaN(b_hat_multiplier)
			|| isNaN(c_hat_multiplier)) {
				lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
				var new_para = document.createElement("p");
				new_para.innerHTML = 'Input fields must be numeric values.';
				new_para.style.color = 'red';
				lattice_parameter_feedback.appendChild(new_para);
		} else if (a_latt_param <= 0 || b_latt_param <= 0 || c_latt_param <=0){
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = 'a, b, and c must be non-zero, positive numbers.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (gamma_latt_param <= 0.0 || gamma_latt_param >= 180.0 || beta_latt_param <= 0.0 || beta_latt_param >= 180.0){
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#946 and &#947 must be greater than 0&#176 and less than 180&#176.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (alpha_latt_param <= min_alpha || alpha_latt_param >= max_alpha) {
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#945 must be greater than ' + String(min_alpha.toFixed(3)) + '&#176 and less than ' + String(max_alpha.toFixed(3)) + '&#176 with the given &#946 and &#947 values.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else if (a_hat_multiplier <= 0 || b_hat_multiplier <= 0 || c_hat_multiplier <=0 || !Number.isInteger(a_hat_multiplier) || !Number.isInteger(b_hat_multiplier) || !Number.isInteger(c_hat_multiplier)){
			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());
			var new_para = document.createElement("p");
			new_para.innerHTML = '&#226, &#98&#770, and &#99&#770 multipliers must be non-zero, positive integers.';
			new_para.style.color = 'red';
			lattice_parameter_feedback.appendChild(new_para);
		} else {
			//fix input field values
			a_param_input.value = a_latt_param.toFixed(3);
			b_param_input.value = b_latt_param.toFixed(3);
			c_param_input.value = c_latt_param.toFixed(3);
			alpha_param_input.value = alpha_latt_param.toFixed(3);
			beta_param_input.value = beta_latt_param.toFixed(3);
			gamma_param_input.value = gamma_latt_param.toFixed(3);
			a_hat_multiplier_input.value = a_hat_multiplier.toFixed(0);
			b_hat_multiplier_input.value = b_hat_multiplier.toFixed(0);
			c_hat_multiplier_input.value = c_hat_multiplier.toFixed(0);

			lattice_parameter_feedback.querySelectorAll('*').forEach(n => n.remove());

			var new_para = document.createElement("p");
			new_para.innerHTML = 'Lattice parameters accepted.';
			new_para.style.color = 'green';
			lattice_parameter_feedback.appendChild(new_para);

			crystal_model.unit_cell.a_hat = [a1, 0.0, 0.0];
			crystal_model.unit_cell.b_hat = [b1, b2, 0.0];
			crystal_model.unit_cell.c_hat = [c1, c2, c3];

			crystal_model.super_cell.a_hat_multiplier = a_hat_multiplier;
			crystal_model.super_cell.b_hat_multiplier = b_hat_multiplier;
			crystal_model.super_cell.c_hat_multiplier = c_hat_multiplier;

			crystal_model = buildSuperCell(crystal_model);

			cell_transform_parameters.translation = [-0.5*(crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0]), 
									-0.5*(crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1]),
									-0.5*(crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2])]
			
			// set scale factor based on basis vector magnitudes and supercell size
			var a_super_cell_length = a_latt_param * a_hat_multiplier;
			var b_super_cell_length = b_latt_param * b_hat_multiplier;
			var c_super_cell_length = c_latt_param * c_hat_multiplier;

			if (a_super_cell_length >= b_super_cell_length && a_super_cell_length >= c_super_cell_length){
				cell_transform_parameters.scale = [600/a_super_cell_length, 600/a_super_cell_length, 600/a_super_cell_length];
			} else if (b_super_cell_length >= a_super_cell_length && b_super_cell_length >= c_super_cell_length) {
				cell_transform_parameters.scale = [600/b_super_cell_length, 600/b_super_cell_length, 600/b_super_cell_length];
			} else if (c_super_cell_length >= a_super_cell_length && c_super_cell_length >= b_super_cell_length) {
				cell_transform_parameters.scale = [600/c_super_cell_length, 600/c_super_cell_length, 600/c_super_cell_length];
			}

			cell_transform_matrix = transformMatrix(cell_transform_parameters);
			atom_lighting_matrix = lightingMatrix(cell_transform_parameters);

			//reset buffers and drawscene
			//generate mesh data from crystal model
			mesh_data = generateMeshData(crystal_model);

			//initialize buffers and generate objects with buffer handles
			updateBuffers(gl, mesh_data, mesh_buffers);

			//Generate objects with buffer handles, program locations, and tranformation matrices
			scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);

			drawScene(gl, scene_objects, crystal_model);
			
			//update basis vectors input fields
			a_hat_x_input.value = String(crystal_model.unit_cell.a_hat[0].toFixed(3));
			b_hat_x_input.value = String(crystal_model.unit_cell.b_hat[0].toFixed(3));
			b_hat_y_input.value = String(crystal_model.unit_cell.b_hat[1].toFixed(3));
			c_hat_x_input.value = String(crystal_model.unit_cell.c_hat[0].toFixed(3));
			c_hat_y_input.value = String(crystal_model.unit_cell.c_hat[1].toFixed(3));
			c_hat_z_input.value = String(crystal_model.unit_cell.c_hat[2].toFixed(3));

		}
	}
};


//Set information for transformation matrix uniform
var cell_transform_parameters = {translation: [-0.5*(crystal_model.super_cell.a_hat[0]+crystal_model.super_cell.b_hat[0]+crystal_model.super_cell.c_hat[0]), 
							-0.5*(crystal_model.super_cell.a_hat[1]+crystal_model.super_cell.b_hat[1]+crystal_model.super_cell.c_hat[1]),
							-0.5*(crystal_model.super_cell.a_hat[2]+crystal_model.super_cell.b_hat[2]+crystal_model.super_cell.c_hat[2])],
								rotation: [degToRad(30), degToRad(0), degToRad(125)],
								scale: [600, 600, 600]};

//generate transformation matrix based on parameters
var cell_transform_matrix = transformMatrix(cell_transform_parameters);
var atom_lighting_matrix = lightingMatrix(cell_transform_parameters);

//Set up canvas
var canvas = document.getElementById("main-canvas");
canvas.width = 800;
canvas.height = 600;

//Set up canvas event listeners
var CANVAS_IS_CLICKED = false;

canvas.addEventListener("mousedown", function(){
	CANVAS_IS_CLICKED = true;
});

document.addEventListener("mouseup", function(){
	CANVAS_IS_CLICKED = false;
});

canvas.addEventListener("mousemove", function(e){
	//event listener for rotating model based on mouse movement
	e.preventDefault();
	if (CANVAS_IS_CLICKED){
		cell_transform_parameters.rotation[2] = cell_transform_parameters.rotation[2] += 0.01 * e.movementX;
		cell_transform_parameters.rotation[0] = cell_transform_parameters.rotation[0] += 0.01 * e.movementY;
		
		cell_transform_matrix = transformMatrix(cell_transform_parameters);
		atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
		
		scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
		drawScene(gl, scene_objects, crystal_model);
	}
});

canvas.addEventListener("wheel", function(e){
	//event listener for scaling model based on mouse movement
	e.preventDefault();
	var scale_factor = 0.001;
	var scale_constant = cell_transform_parameters.scale[0];
	scale_constant -= scale_constant*scale_factor * e.deltaY;
	if (scale_constant <= 1.0){
		scale_constant = 1.00;
	} else if (scale_constant >= 1000.0){
		scale_constant = 1000.00;
	};
	
	cell_transform_parameters.scale = [scale_constant, scale_constant, scale_constant];
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix)
	drawScene(gl, scene_objects, crystal_model);

});

//event listeners for transformation buttons
document.getElementById('zoom-in-button').onclick = function(){
	var scale_factor = 0.1;
	var scale_constant = cell_transform_parameters.scale[0];
	scale_constant += scale_constant*scale_factor;
	if (scale_constant <= 1.0){
		scale_constant = 1.00;
	} else if (scale_constant >= 1000.0){
		scale_constant = 1000.00;
	};
	cell_transform_parameters.scale = [scale_constant, scale_constant, scale_constant];
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

document.getElementById('zoom-out-button').onclick = function(){
	var scale_factor = 0.1;
	var scale_constant = cell_transform_parameters.scale[0];
	scale_constant -= scale_constant*scale_factor;
	if (scale_constant <= 1.0){
		scale_constant = 1.00;
	} else if (scale_constant >= 1000.0){
		scale_constant = 1000.00;
	};
	cell_transform_parameters.scale = [scale_constant, scale_constant, scale_constant];
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

document.getElementById('rotate-right-button').onclick = function(){
	cell_transform_parameters.rotation[2] += 0.1;
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

document.getElementById('rotate-left-button').onclick = function(){
	cell_transform_parameters.rotation[2] -= 0.1;
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

document.getElementById('rotate-up-button').onclick = function(){
	cell_transform_parameters.rotation[0] -= 0.1;
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

document.getElementById('rotate-down-button').onclick = function(){
	cell_transform_parameters.rotation[0] += 0.1;
	
	cell_transform_matrix = transformMatrix(cell_transform_parameters);
	atom_lighting_matrix = lightingMatrix(cell_transform_parameters);
	
	scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);
	drawScene(gl, scene_objects, crystal_model);
};

//Setup WebGL context
var gl = canvas.getContext("webgl");

if (!gl) {
	console.log('WebGL Failed')
} else {
	console.log('WebGL Success')
}

// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//create shaders, programs, attribute and uniform locations
//one shader program for super cell (line mesh) and one for spheres (triangle mesh)

// create GLSL shaders, upload the GLSL source, compile the shaders
var lineMeshVertexShader = createShader(gl, gl.VERTEX_SHADER, lineMeshVertexShaderSource);
var lineMeshFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, lineMeshFragmentShaderSource);

var triangleMeshVertexShader = createShader(gl, gl.VERTEX_SHADER, triangleMeshVertexShaderSource);
var triangleMeshFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, triangleMeshFragmentShaderSource);

// Link the two shaders into a program
var programs = {lineMeshProgram: createProgram(gl, lineMeshVertexShader, lineMeshFragmentShader),
				triangleMeshProgram: createProgram(gl, triangleMeshVertexShader, triangleMeshFragmentShader)};

// look up attribute and uniform locations.
var program_locations = {line_mesh_program_locations: {a_position_location: gl.getAttribLocation(programs.lineMeshProgram, "a_position"),
														a_color_location: gl.getAttribLocation(programs.lineMeshProgram, "a_color"),
														u_matrix_location: gl.getUniformLocation(programs.lineMeshProgram, "u_matrix")},
						triangle_mesh_program_locations: {a_position_location: gl.getAttribLocation(programs.triangleMeshProgram, "a_position"),
														u_matrix_location: gl.getUniformLocation(programs.triangleMeshProgram, "u_matrix"),
														u_lighting_rotation_location: gl.getUniformLocation(programs.triangleMeshProgram, "u_lighting_rotation"),
														u_color_location: gl.getUniformLocation(programs.triangleMeshProgram, "u_color")}};



//create buffers and upload vertex data

//generate mesh data from crstal model
var mesh_data = generateMeshData(crystal_model);

//initialize buffers and generate objects with buffer handles
var mesh_buffers = initializeBuffers(gl, mesh_data);

//Generate objects with buffer handles, program locations, and tranformation matrices
var scene_objects = generateSceneObjects(mesh_buffers, programs, program_locations, cell_transform_matrix, atom_lighting_matrix);

drawScene(gl, scene_objects, crystal_model);

//download file button to get poscar file based on model
var poscar_button = document.getElementById('poscar-button');

poscar_button.addEventListener('click', () => {
	//get info from crystal model needed to generate poscar file
	var element_types = [];
	var element_counts = [];
	crystal_model.super_cell.atoms.forEach(function(atom){
		if (!element_types.includes(atom.element)) {
			element_types.push(atom.element);
		}
	});

	element_types.forEach(function(element){
		var current_count = 0;
		crystal_model.super_cell.atoms.forEach(function(atom){
			if (atom.element === element){
				current_count += 1;
			}
		});
		element_counts.push(current_count);
	});

	//generate string for file
	//add basis vectors
	var file_string = 'POSCAR file written by Crystal Constructor\n1.0\n'
	file_string += String(crystal_model.super_cell.a_hat[0])+' '+String(crystal_model.super_cell.a_hat[1])+' '+String(crystal_model.super_cell.a_hat[2])+'\n';
	file_string += String(crystal_model.super_cell.b_hat[0])+' '+String(crystal_model.super_cell.b_hat[1])+' '+String(crystal_model.super_cell.b_hat[2])+'\n';
	file_string += String(crystal_model.super_cell.c_hat[0])+' '+String(crystal_model.super_cell.c_hat[1])+' '+String(crystal_model.super_cell.c_hat[2])+'\n';

	//add atom types
	element_types.forEach(function(element){
		file_string += element + ' ';
	});

	file_string += '\n';

	//add atom types and counts
	element_counts.forEach(function(count){
		file_string += String(count) + ' ';
	});

	file_string += '\n';

	file_string += 'direct\n';

	//add atom positions
	element_types.forEach(function(element){
		crystal_model.super_cell.atoms.forEach(function(atom){
			if (atom.element === element){
				file_string += String(atom.x_atom_pos)+' '+String(atom.y_atom_pos)+' '+String(atom.z_atom_pos)+'\n';
			}
		});
	});

	const a = document.createElement('a');
	const file = new Blob([file_string], {type: 'text/plain'});
	
	a.href= URL.createObjectURL(file);
	a.download = 'crystal_model.POSCAR';
	a.click();

	URL.revokeObjectURL(a.href);
});