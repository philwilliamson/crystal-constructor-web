# Crystal Constructor

A web application for constructing atomic crystal models that can run in a browser using JavaScript.

## Installation

Download repository.  
This project uses JavaScript modules, so you will need to open index.html using a local web server.  
e.g. Using Visual Studio Code, open the project directory, right click on index.html from explorer and select "Open with Live Server".

Live version available at https://philipwilliamsonportfolio.com/crystal_constructor/

## Directions

Click and drag on canvas with black background to rotate model. Use scroll wheel to zoom in and out.  
Use input fields to the right to enter model parameters and add atoms. If you try entering something invalid, a feedback message will inform you what's wrong.  
Click "Download POSCAR File" button to download a POSCAR text file of your generated model.  
More information available in Guide section.

## Project Structure

app.js | JavaScript file where global objects and WebGL context are set up for scene rendering and event listeners are programmed for page inputs.  
util.js | JavaScript file with a library of functions for performing a variety of tasks, including matrix calculations, scene object generation, and interaction with the WebGL context.  
index.html | HTML file for defining display and input elements on page.  
styles.css | CSS file for styling page.

## Development Notes

User interface is being further refined.  
Implementing features to allow the generation of crystal defects.

# Guide

Crystals can be thought of as a lattice populated by atoms, composing a periodic structure in all spatial directions.

This lattice is composed of repeating units called unit cells, each of which containing the atomic motif that makes up a crystal's periodic structure.

Each unit cell is defined by a set of basis vectors, â, b̂, and ĉ.

These basis vectors can be defined explicitly or be derived from a set of parameters, called Lattice Parameters, denoting their lengths and the angles between them.

These basis vectors also form a coordinate system for defining the location of each atom within the unit cell.

Once the unit cell geometry and atom positions are defined, we can construct a supercell model of the crystal by repeatedly copying the unit cell along its basis vectors.

This guide will detail the process of utilizing Crystal Constructor to construct such a crystal model.

# How to Use Crystal Constructor

## Defining the Unit Cell

Use the radio buttons to select which input method you prefer when defining the crystal lattice unit cell, Lattice Basis Vectors or Lattice Parameters.

### Lattice Basis Vectors

When using Lattice Basis Vectors, enter the coordinate components of the lattice basis vectors, â, b̂, and ĉ.

â must lay along the positive direction of the x-axis.

b̂ must lay in the xy-plane with a positive y-component.

ĉ must have a positive z-component.

These limitations are required to ensure the lattice basis vectors form a right-handed coordinate system.

### Lattice Parameters

When using Lattice Parameters, enter the lengths of â, b̂, and ĉ, as well as the angles between them, α, β, and γ.

a, b, and c denote the lengths of â, b̂, and ĉ, respectively.

α denotes the angle between b̂ and ĉ, β denotes the angle between ĉ and â, and γ denotes the angle between â and b̂.

Be careful! Not all combinations of α, β, and γ are valid.

β and γ must each be greater than 0° and less than 180°.

The valid range for α will depend on β and γ.
If you are unsure what the range for α should be, simply enter values for β and γ and click "Build Cell". The feedback message will give you a valid range for α.

With the unit cell defined, you can enter multipliers for â, b̂, and ĉ to generate a supercell model.

Click "Build Cell" to generate your cell.

## Adding Atoms

To start adding atoms, select an atom from the periodic table and enter it's direct, fractional coordinates respective to the coordinate system defined by the lattice basis vectors.

These coordinates denote the location of each atom within the unit cell. The coordinate components should each be greater than or equal to 0.0 and less than 1.0 or, in other words, in the range [0.0, 1.0).

Click "Add Atom" to add that atom to the unit cell atom list. The displayed model will be automatically populated.

The model will display all atoms in the super cell while the Unit Cell Atoms list (to the right of the viewport) will show only atoms listed in the unit cell.

To remove an atom, select that atom from the list and click "Remove Atom".

## Future Features

As of now, Crystal Constructor can only be used to make models of perfect crystals.

Tools to add crystal defects are still being developed.
