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
};