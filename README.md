# FLAT 3D Viewer

A Drupal/Islandora module to visualize 3D objects in the browser using the
[three.js](https://threejs.org) library. Supports COLLADA (`.dae`) and FBX
(`.fbx`) models with optional sibling texture images.

## Requirements

- Drupal ^10 || ^11
- `islandora:islandora`
- `drupal:media`

## How it works

On the full view of a node whose `field_model` term is **3D Object**, the module
looks for a supported model file (`.dae` / `.fbx`) on the node's `3d_object`
media (falling back to sibling objects under the same parent) and renders the
viewer. Texture image files attached to sibling objects (media with the
**Original File** use term) are mapped to the model by filename.

A Three.js field formatter (**Three.js 3D Viewer**) is also provided and can be
placed on a media file field if you prefer manual placement.

## Three.js libraries

The Three.js build and its add-on loaders (Collada, FBX, TGA, OrbitControls,
NURBS, fflate) are vendored under `js/vendor/three/` and served locally — the
viewer makes **no CDN requests at runtime**. The bare `three` specifier is
resolved by an import map the module renders automatically; the add-on loaders
are imported by relative path.

To update the bundled libraries to a newer Three.js release, run:

```
drush flat_3d_viewer:download-libraries   # alias: f3dl
```

This re-downloads the files into `js/vendor/three/` (and is the only thing that
contacts a CDN — at maintenance time, not at runtime). If the vendored build is
ever missing, the import map falls back to a CDN URL so the viewer degrades
rather than breaking outright.

## Configuration

No site-wide configuration is required. The field formatter exposes width,
height, and background-colour settings on the *Manage display* page.
