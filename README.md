# Crystal Constructor Web

A browser-based application for constructing atomic crystal models.

Built using JavaScript and WebGL on top of the [Astro](https://astro.build/) framework.

A live version is available [here](https://philcodes.com/projects/crystal-constructor/).

## Table of Contents
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [User Guide](#user-guide)
    - [Defining the Unit Cell](#defining-the-unit-cell)
        - [Lattice Basis Vectors](#lattice-basis-vectors)
        - [Lattice Parameters](#lattice-parameters)
    - [Building a Super Cell](#building-a-super-cell)
    - [Adding and Removing Atoms](#adding-and-removing-atoms)
    - [POSCAR File Download](#poscar-file-download)
    - [Viewport Navigation](#viewport-navigation)

## Running Locally

You will need to have [Node.js and npm](https://nodejs.org/) installed in order to run this project locally.

Clone this repository and cd into the project directory:

```bash
git clone https://github.com/philwilliamson/crystal-constructor.git ./crystal-constructor
cd ./crystal-constructor
```
Install the necessary dependencies with npm:

```bash
npm install
```
Once the dependencies are installed, start the project dev server with:

```bash
npm run dev
```

Navigate to `localhost:4321` in your browser to see the running local site.

## Project Structure
```
.
├── astro.config.mjs
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── env.d.ts
│   ├── pages
│   │   └── index.astro // generates index page
│   ├── scripts
│   │   ├── app.js  // main script for initializing interactive elements
│   │   └── util 
│   │       ├── dom-utils.js    // functions for updating DOM elements
│   │       ├── math-utils.js   // functions for matrix and other math operations
│   │       ├── model-utils.js  // functions for updating crystal model
│   │       └── webgl-utils.js  // functions for working with WebGL
│   └── styles
│       └── styles.css // styling for index page
└── tsconfig.json
```

## User Guide

### Defining the Unit Cell

Use the radio buttons to select which input method you prefer when defining the crystal lattice unit cell: Lattice Basis Vectors or Lattice Parameters.

### Lattice Basis Vectors

When using Lattice Basis Vectors, enter the coordinate components of the lattice basis vectors, `â`, `b̂`, and `ĉ`.

Limitations are enforced to ensure the crystal's unit cell consists of a right-handed coordinate system.

`â` must lay along the positive direction of the x-axis.

`b̂` must lay in the xy-plane with a positive y-component.

`ĉ` must have a positive z-component.

### Lattice Parameters

When using Lattice Parameters, enter the lengths of `â`, `b̂`, and `ĉ`, as well as the angles between them, `α`, `β`, and `γ`.

`a`, `b`, and `c` denote the lengths of `â`, `b̂`, and `ĉ`, respectively.

`α` denotes the angle between `b̂` and `ĉ`, `β` denotes the angle between `ĉ` and `â`, and `γ` denotes the angle between `â` and `b̂`.

Limitations are enforced to ensure the crystal's unit cell consists of a right-handed coordinate system.

`β` and `γ` must each be greater than `0°` and less than `180°`.

The valid range for `α` will depend on `β` and `γ`. If an invalid value for `α` is entered, an error message will display the acceptable range of values.

### Building a Super Cell

With the unit cell defined, you can enter multipliers for `â`, `b̂`, and `ĉ` to generate a super cell model. These are set to `1` by default.

When you are satisfied with the cell settings, click `Build Cell` to generate your model's crystal cell.

### Adding and Removing Atoms

To start adding atoms, select an atom from the periodic table and enter it's direct, fractional coordinates respective to the coordinate system defined by the lattice basis vectors or lattice parameters.

These coordinates denote the location of each atom within the unit cell. The coordinate components should each be greater than or equal to `0.0` and less than `1.0` or, in other words, in the range `[0.0, 1.0)`.

Click `Add Atom` to add that atom to the unit cell atom list. The displayed model will be automatically populated.

The model will display all atoms in the super cell while the Unit Cell Atoms list (to the right of the viewport) will show only atoms listed in the unit cell.

To remove an atom, select that atom from the list and click `Remove Atom`.

### POSCAR File Download

Click the `Download POSCAR File` button to download a POSCAR file of your model's super cell.

### Viewport Navigation

Click and drag on the canvas to the left to rotate the model. Use your mouse's scroll wheel to zoom in and out.

If a mouse input is unavailable, you may use the buttons below the canvas to change the view of the model.