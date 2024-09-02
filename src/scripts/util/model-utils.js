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
};