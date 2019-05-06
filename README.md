# islandora_solution_pack_3D
Islandora solution pack for 3D objects

Assumes a compound object with at least a COLLADA (DAE) file as a child and any texture image files as children. 

Uses the [three.js](https://threejs.org) javascript library.

## Instructions

1. Create a compound object to represent your 3D object.
2. Create an object with the 3D Object content model, and make it a child of your compound.
3. For every texture packaged with your 3D object, create a Basic Image. The Basic Image title/label must be identical to the filename (e.g. texture1.jpg).
4. Make all of the textures children of the original Compound Object.

## Configuration

Configure the module under Islandora -> Solution Pack Configuration. A background colour must be set before the viewer will work.
