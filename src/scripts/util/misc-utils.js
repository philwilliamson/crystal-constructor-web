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