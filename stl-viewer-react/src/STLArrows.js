import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let camera;
let scene;
let renderer;
let controls;
let id = null;

class RayysLinearDimension {
    constructor(domRoot, renderer, camera) {
        this.domRoot = domRoot;
        this.renderer = renderer;
        this.camera = camera;
        this.cb = {
            onChange: []
        };
        this.config = {
            headLength: 5,
            headWidth: 0.5,
            units: "cm",
            unitsConverter(v) {
                return v;
            }
        };
    }
    create(p0, p1, extrude) {
        this.from = p0;
        this.to = p1;
        this.extrude = extrude;
        this.node = new THREE.Object3D();
        this.hidden = undefined;
        const el = document.createElement("div");
        el.style.cssText =
            "position: absolute;font-family: monospace;font-size: 12px;width: 60px;height: 16px;text-align: center;border: none;background: white; color:DodgerBlue;border-radius: 2px;padding: 1px 2px;font-size: 12px;font-family:Arial ";
        el.id = this.node.id;
        el.classList.add("dim");
        el.innerHTML = "";
        this.domRoot.appendChild(el);
        this.domElement = el;
        this.update(this.camera);
        return this.node;
    }
    update(camera) {
        this.camera = camera;
        if (!this.node) {
            return;
        }
        this.node.children.length = 0;
        const p0 = this.from;
        const p1 = this.to;
        const extrude = this.extrude;
        let pmin;
        let pmax;
        if (extrude.x >= 0 && extrude.y >= 0 && extrude.z >= 0) {
            pmax = new THREE.Vector3(
                extrude.x + Math.max(p0.x, p1.x),
                extrude.y + Math.max(p0.y, p1.y),
                extrude.z + Math.max(p0.z, p1.z)
            );
            pmin = new THREE.Vector3(
                extrude.x < 1e-16 ? extrude.x + Math.min(p0.x, p1.x) : pmax.x,
                extrude.y < 1e-16 ? extrude.y + Math.min(p0.y, p1.y) : pmax.y,
                extrude.z < 1e-16 ? extrude.z + Math.min(p0.z, p1.z) : pmax.z
            );
        } else if (extrude.x <= 0 && extrude.y <= 0 && extrude.z <= 0) {
            pmax = new THREE.Vector3(
                extrude.x + Math.min(p0.x, p1.x),
                extrude.y + Math.min(p0.y, p1.y),
                extrude.z + Math.min(p0.z, p1.z)
            );
            pmin = new THREE.Vector3(
                extrude.x > -1e-16 ? extrude.x + Math.max(p0.x, p1.x) : pmax.x,
                extrude.y > -1e-16 ? extrude.y + Math.max(p0.y, p1.y) : pmax.y,
                extrude.z > -1e-16 ? extrude.z + Math.max(p0.z, p1.z) : pmax.z
            );
        }
        const origin = pmax.clone().add(pmin).multiplyScalar(0.5);
        const dir = pmax.clone().sub(pmin);
        dir.normalize();
        const length = pmax.distanceTo(pmin) / 2;
        const hex = 0x0;
        const arrowHelper0 = new THREE.ArrowHelper(
            dir,
            origin,
            length,
            hex,
            this.config.headLength,
            this.config.headWidth
        );
        this.node.add(arrowHelper0);
        dir.negate();
        const arrowHelper1 = new THREE.ArrowHelper(
            dir,
            origin,
            length,
            hex,
            this.config.headLength,
            this.config.headWidth
        );
        this.node.add(arrowHelper1);
        if (this.domElement !== undefined) {
            const axis = new THREE.Vector3(1, 0, 0);
            const angle = -Math.PI / 2;
            origin.applyAxisAngle(axis, angle);
            const textPos = origin.project(this.camera);
            const clientX =
                (this.renderer.domElement.offsetWidth * (textPos.x + 1)) / 2 -
                this.config.headLength +
                this.renderer.domElement.offsetLeft;
            const clientY =
                (-this.renderer.domElement.offsetHeight * (textPos.y - 1)) / 2 -
                this.config.headLength +
                this.renderer.domElement.offsetTop;
            const dimWidth = this.domElement.offsetWidth;
            const dimHeight = this.domElement.offsetHeight;
            this.domElement.style.left = `${clientX - dimWidth / 2}px`;
            this.domElement.style.top = `${clientY - dimHeight / 2}px`;
            this.domElement.innerHTML = `${(this.config.unitsConverter(pmin.distanceTo(pmax) / 10).toFixed(2))}${this.config.units
                }`;
        }
    }
    detach() {
        if (this.node && this.node.parent) {
            this.node.parent.remove(this.node);
        }
        if (this.domElement !== undefined) {
            this.domRoot.removeChild(this.domElement);
            this.domElement = undefined;
        }
    }
}
class RayysFacingCamera {
    constructor() {
        this.dirVector = new THREE.Vector3();
        this.dirs = [
            new THREE.Vector3(+1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, +1, 0),
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, +1),
            new THREE.Vector3(0, 0, -1)
        ];
        this.facingDirs = [];
        this.bestFacingDir = undefined;
        this.cb = {
            facingDirChange: []
        };
    }
    check(camera) {
        camera.getWorldDirection(this.dirVector);
        this.dirVector.negate();
        let maxk = 0;
        let maxdot = -1e19;
        const oldFacingDirs = this.facingDirs;
        let facingDirsChanged = false;
        this.facingDirs = [];
        for (let k = 0; k < this.dirs.length; k++) {
            const dot = this.dirs[k].dot(this.dirVector);
            const angle = Math.acos(dot);
            if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
                this.facingDirs.push(k);
                if (oldFacingDirs.indexOf(k) === -1) {
                    facingDirsChanged = true;
                }
                if (Math.abs(dot) > maxdot) {
                    maxdot = dot;
                    maxk = k;
                }
            }
        }
        if (maxk !== this.bestFacingDir || facingDirsChanged) {
            const prevDir = this.bestFacingDir;
            this.bestFacingDir = maxk;
            for (let i = 0; i < this.cb.facingDirChange.length; i++) {
                this.cb.facingDirChange[i](
                    {
                        before: { facing: oldFacingDirs, best: prevDir },
                        current: { facing: this.facingDirs, best: this.bestFacingDir }
                    },
                    this
                );
            }
        }
    }
}

export default function Stl(width, height, file, objectColor, primaryColor, volume, objHeight, objWidth, objDepth, b64Screenshot) {
    let rotateModel = false;
    let showGrid = false;
    let repositioned = new Boolean(false);
    document.getElementById("errorView").style.display = "none";
    if (id !== null) {
        cancelAnimationFrame(id);
    }
    scene = null;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(255, 255, 255);
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(200, 100, 200);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    document.getElementById("stlviewer").innerHTML = "";
    document.getElementById("stlviewer").appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = rotateModel;
    controls.autoRotateSpeed = 0.75;
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.target.set(0, 0, 0);
    controls.update();
    const grid = new THREE.GridHelper(2000, 20, primaryColor, primaryColor);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    if (showGrid) {
        scene.add(grid);
    }
    const rotationBtn = document.getElementById("rotate");
    rotationBtn.addEventListener("click", () => {
        rotateModel = !rotateModel;
        controls.autoRotate = rotateModel;
    });
    const gridBtn = document.getElementById("grid");
    gridBtn.addEventListener("click", () => {
        showGrid = !showGrid;
        if (!showGrid) {
            scene.remove(grid);
        } else {
            scene.add(grid);
        }
    });
    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight("rgb(255, 255, 255)");
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 180;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.left = -120;
    directionalLight.shadow.camera.right = 120;
    scene.add(directionalLight);
    let loadedModel = null;
    const facingCamera = new RayysFacingCamera();
    const material = new THREE.MeshPhongMaterial({
        color: objectColor,
        specular: 0x111111,
        shininess: 150,
        vertexColors: false
    });
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    const loader = new STLLoader();
    loader.load(
        file?.uri,
        geometry => {
            loadedModel = null;
            loadedModel = new THREE.Mesh(geometry, material);
            loadedModel.position.set(0, 0, 0);
            loadedModel.scale.set(1, 1, 1);
            loadedModel.rotation.set(-Math.PI / 2, 0, 0);
            loadedModel.castShadow = true;
            loadedModel.receiveShadow = true;
            loadedModel.geometry.computeBoundingBox();
            loadedModel.geometry.center()
            scene.add(loadedModel);
            let position = loadedModel.geometry.attributes.position;
            let faces = position.count / 3;
            let sum = 0;
            let p1 = new THREE.Vector3(),
                p2 = new THREE.Vector3(),
                p3 = new THREE.Vector3();
            for (let i = 0; i < faces; i++) {
                p1.fromBufferAttribute(position, i * 3 + 0);
                p2.fromBufferAttribute(position, i * 3 + 1);
                p3.fromBufferAttribute(position, i * 3 + 2);
                sum += signedVolumeOfTriangle(p1, p2, p3);
            }
            sum = sum / 1000 //convert to cubic centimeters
            volume(sum)

        },
        xhr => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        error => {
            if (
                // catch error with local rest service
                error != undefined &&
                error.message != undefined &&
                (error.message.includes("invalid array length") || error.message.includes("Invalid typed array"))
            ) {
            } else {
                console.log(error);
                document.getElementById("errorView").style.display = "flex";
            }
        },
    );

    const signedVolumeOfTriangle = (p1, p2, p3) => {
        return p1.dot(p2.cross(p3)) / 6.0;
    };
    const fitCameraToCenteredObject = (camera, object, offset, orbitControls ) => {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject( object );
        var size = new THREE.Vector3();
        boundingBox.getSize(size);
    
        // figure out how to fit the box in the view:
        // 1. figure out horizontal FOV (on non-1.0 aspects)
        // 2. figure out distance from the object in X and Y planes
        // 3. select the max distance (to fit both sides in)
        //
        // The reason is as follows:
        //
        // Imagine a bounding box (BB) is centered at (0,0,0).
        // Camera has vertical FOV (camera.fov) and horizontal FOV
        // (camera.fov scaled by aspect, see fovh below)
        //
        // Therefore if you want to put the entire object into the field of view,
        // you have to compute the distance as: z/2 (half of Z size of the BB
        // protruding towards us) plus for both X and Y size of BB you have to
        // figure out the distance created by the appropriate FOV.
        //
        // The FOV is always a triangle:
        //
        //  (size/2)
        // +--------+
        // |       /
        // |      /
        // |     /
        // | FÂ° /
        // |   /
        // |  /
        // | /
        // |/
        //
        // FÂ° is half of respective FOV, so to compute the distance (the length
        // of the straight line) one has to: `size/2 / Math.tan(F)`.
        //
        // FTR, from https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
        // the camera.fov is the vertical FOV.
    
        const fov = camera.fov * ( Math.PI / 180 );
        const fovh = 2*Math.atan(Math.tan(fov/2) * camera.aspect);
        let dx = size.z / 2 + Math.abs( size.x / 2 / Math.tan( fovh / 2 ) );
        let dy = size.z / 2 + Math.abs( size.y / 2 / Math.tan( fov / 2 ) );
        let cameraZ = Math.max(dx, dy);
    
        // offset the camera, if desired (to avoid filling the whole canvas)
        if( offset !== undefined && offset !== 0 ) cameraZ *= offset;
    
        camera.position.set( 0, 0, cameraZ );
    
        // set the far plane of the camera so that it easily encompasses the whole object
        const minZ = boundingBox.min.z;
        const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
    
        camera.far = cameraToFarEdge * 3;
        camera.updateProjectionMatrix();
    
        if ( orbitControls !== undefined ) {
            // set camera to rotate around the center
            orbitControls.target = new THREE.Vector3(0, 0, 0);
    
            // prevent camera from zooming out far enough to create far plane cutoff
            orbitControls.maxDistance = cameraToFarEdge * 2;
        }
        };
    const dim0 = new RayysLinearDimension(document.getElementById("stlviewer"), renderer, camera);
    const dim1 = new RayysLinearDimension(document.getElementById("stlviewer"), renderer, camera);


    function onDocumentMouseDown(event) {

        event.preventDefault();
        repositioned = true;
    }

    facingCamera.cb.facingDirChange.push(event => {
        const facingDir = facingCamera.dirs[event.current.best];

        if (dim0.node !== undefined) {
            dim0.detach();
        }
        if (dim1.node !== undefined) {
            dim1.detach();
        }

        const bbox = loadedModel.geometry.boundingBox;
        let dimVector = new THREE.Vector3();
        bbox.getSize(dimVector);
        objHeight(dimVector.x);
        objWidth(dimVector.y);
        objDepth(dimVector.z);
        if (Math.abs(facingDir.x) === 1) {
            let from = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
            let to = new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z);
            const newDimension = dim0.create(from, to, facingDir);
            loadedModel.add(newDimension);
            const newArray = event.current.facing.slice();
            const bestIdx = newArray.indexOf(event.current.best);
            newArray.splice(bestIdx, 1);
            const facingDir0 = facingCamera.dirs[newArray[1]];
            from = new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z);
            to = new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z);
            const newDimension0 = dim1.create(from, to, facingDir0);
            loadedModel.add(newDimension0);
        }
        if (Math.abs(facingDir.z) === 1) {
            let from = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
            let to = new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z);
            const newDimension = dim0.create(from, to, facingDir);
            loadedModel.add(newDimension);
            const newArray = event.current.facing.slice();
            const bestIdx = newArray.indexOf(event.current.best);
            newArray.splice(bestIdx, 1);
            const facingDir0 = facingCamera.dirs[newArray[0]];
            from = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
            to = new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z);
            const newDimension0 = dim1.create(from, to, facingDir0);
            loadedModel.add(newDimension0);
        }
        if (Math.abs(facingDir.y) === 1) {
            const newArray = event.current.facing.slice();
            const bestIdx = newArray.indexOf(event.current.best);
            newArray.splice(bestIdx, 1);
            const facingDir0 = facingCamera.dirs[newArray[0]];
            const facingDir1 = facingCamera.dirs[newArray[1]];
            const from = new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z);
            const to = new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z);
            const newDimension0 = dim0.create(from, to, facingDir0);
            const newDimension1 = dim1.create(from, to, facingDir1);
            loadedModel.add(newDimension0);
            loadedModel.add(newDimension1);
        }
    });
    const animate = () => {
        id = requestAnimationFrame(animate);
        if (loadedModel != null) {
            facingCamera.check(camera);
            b64Screenshot(renderer.domElement.toDataURL("image/jpeg"));
            if (repositioned == false) {
                fitCameraToCenteredObject(camera, loadedModel, 2, controls);
            }
        }
        dim0.update(camera);
        dim1.update(camera);
        controls.update();
        renderer.render(scene, camera);

    };
    animate();
}
