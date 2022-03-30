## STLViewer
Used to display STL file documents in Mendix. This widget displays basic information like length, width and height. The approximate volume of a 3D STL model can be extracted and stored in a variable if needed.

## Features
Display of 3D STL model, calculate and store volume, display dimensions

![rotating model](/images/rotation.gif=250x250)
![dimensions of model](/images/dimensions.gif=250x250)
## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

Sources used:
 * [basic react stl viewer](https://github.com/yatheeshraju/react-stl-file-viewer)
 * [2D dimension Lines](https://stackoverflow.com/questions/25432540/draw-dimension-lines-along-with-3d-cube-using-three-js)

Licence: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)