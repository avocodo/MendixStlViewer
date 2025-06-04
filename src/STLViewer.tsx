// React-Hooks für Referenzen, Lifecycle, State
import React, { useRef, useEffect, useState } from "react";
// THREE.js Kernbibliothek
import * as THREE from "three";
// STL-Dateien laden
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
// Maussteuerung (Orbit)
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// Hilfsfunktionen: Maßlinien mit Label
import { createDimension } from "./components/createDimension";
// Kamera-Richtungserkennung
import { FacingDirectionDetector, FacingState } from "./components/facingDirectionDetector";
// Volumenberechnung für STL
import { computeMeshVolume } from "./components/computeMeshVolume";
// Grid unter Objekt platzieren (untere Kante bestimmen)
import { placeGrid } from "./components/placeGrid";
// Kamera auf Objekt ausrichten (Zoom, Ausrichtung)
import { placeCamera } from "./components/placeCamera";
// CSS Importieren
import "./ui/Stlviewer.css";


const STLViewer = (props: any): React.ReactElement => {

    // Referenz auf das DOM-Element für die Szene
    const containerRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    // States für UI-Buttons
    const [rotationEnabled, setRotationEnabled] = useState(true);
    const [gridVisible, setGridVisible] = useState(true);

    // Aktuelle Abmessungsinfos
    const [info, setInfo] = useState({ volume: 0, width: 0, height: 0, depth: 0 });

    // Referenz auf GridHelper & OrbitControls
    const gridRef = useRef<THREE.GridHelper | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    // For Screenshot
    let screenshotTaken = false;

    // Zum Beenden
    let animationFrameId: number;

    // Kamera überwachen
    const detectorRef = useRef<FacingDirectionDetector | null>(null);

    // useEffect startet bei Änderung von Datei, Rotation, Grid-Sichtbarkeit
    useEffect(() => {

        // STL-Datei aus Mendix-FileProp holen
        const fileUrl = props.file?.value?.uri;

        if (!containerRef.current || !fileUrl || initializedRef.current) return;

        initializedRef.current = true;

        // Szene & Hintergrundfarbe definieren
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#ffffff");

        // Kamera & Renderer vorbereiten
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 5000); // Aspect später setzen
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(1, 1); // Platzhalter, wird später korrekt gesetzt

        // Szene-Container leeren und neuen Renderer einfügen
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(renderer.domElement);

        // OrbitControls (Maussteuerung)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableRotate = true; // manuelle Rotation erlaubt
        controls.autoRotate = rotationEnabled; // automatische Rotation über Button
        controls.autoRotateSpeed = 0.75;
        controlsRef.current = controls;

        // Licht hinzufügen
        const light = new THREE.HemisphereLight(0xffffff, 0x444444);
        light.position.set(0, 200, 0);
        scene.add(light);

        // Color
        const colorValue = props.stlColor || "#ff6600"; // Fallback-Farbe
        let processedColor = new THREE.Color(colorValue);

        // Array für dynamisch erzeugte Maßlinien
        let dimensions: ReturnType<typeof createDimension>[] = [];

        // STL laden
        const loader = new STLLoader();
        loader.load(fileUrl, geometry => {

            // Mesh um -90° auf X-Achse drehen → Korrekte Ausrichtung für alle Berechnungen
            geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

            // BoundingBox und Mittelpunkt berechnen
            geometry.computeBoundingBox();
            const box = geometry.boundingBox!;
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Objekt zentrieren, auf Grid stellen
            geometry.translate(-center.x, -box.min.y, -center.z);

            // Mesh mit Material erstellen, um -90° drehen (X/Y tauschen)
            const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xFF6600 }));  //  processedColor
            scene.add(mesh);

            mesh.material.color.set(processedColor);

            // Grid erzeugen
            // Berechne größtes Maß (X oder Z)
            const maxExtent = Math.max(size.x, size.z);

            // Definiere Grid-Größe (z.B. 20% größer als Objekt, gerundet)
            const gridSize = Math.ceil(maxExtent * 1.2 / 10) * 10;

            // Adaptive Divisionen (z.B. maximal 100, minimal 10)
            const divisions = Math.max(10, Math.min(100, Math.round(gridSize / 20)));


            const grid = new THREE.GridHelper(gridSize, divisions, 0x007acc, 0xdddddd);

            (grid.material as THREE.Material).transparent = true;
            (grid.material as THREE.Material).opacity = 0.25;
            gridRef.current = grid;

            // Grid korrekt unter das Objekt platzieren
            placeGrid(mesh, grid);
            grid.visible = gridVisible;
            scene.add(grid);

            // Kamera automatisch auf Objekt ausrichten
            placeCamera(mesh, camera, controls);

            // Maße berechnen (mm → cm), Volumen
            const width = String(((box.max.x - box.min.x) / 10).toFixed(2));
            const height = String(((box.max.z - box.min.z) / 10).toFixed(2));
            const depth = String(((box.max.y - box.min.y) / 10).toFixed(2));
            const volume = String(computeMeshVolume(geometry));


            // Werte in Mendix-Attribute setzen
            props.volume?.setValue(volume);
            props.objWidth?.setValue(width);
            props.objHeight?.setValue(height);
            props.objDepth?.setValue(depth);

            // Im Component-State speichern
            setInfo({ volume: Number(volume), width: Number(width), height: Number(height), depth: Number(depth) });

            // Kamera-Richtung überwachen
            detectorRef.current = new FacingDirectionDetector(camera);
            const detector = detectorRef.current;

            // Bei Richtungswechsel: Maßlinien aktualisieren
            detector.onChange.push((state: FacingState) => {
                // Entferne alle alten Labels aus dem DOM (zur Sicherheit)
                if (!containerRef.current) return;
                dimensions.forEach(dim => dim.remove());
                dimensions = [];

                const domRoot = containerRef.current;

                // Seitenabhängige Linien einblenden (x/y/z)
                if (state.best === "posX" || state.best === "negX") {
                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.max.x, box.min.y, box.min.z), "#000"));

                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.max.x, box.max.y, box.min.z), "#000"));
                }

                if (state.best === "posZ" || state.best === "negZ") {
                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.max.x, box.min.y, box.min.z), "#000"));

                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.min.x, box.max.y, box.min.z), "#000"));
                }

                if (state.best === "posY" || state.best === "negY") {
                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.max.x, box.min.y, box.min.z), "#000"));

                    dimensions.push(createDimension(domRoot, scene, camera, renderer,
                        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
                        new THREE.Vector3(box.min.x, box.min.y, box.max.z), "#000"));
                }
            });

            // Resize-Handler
            const handleResize = () => {
                if (!containerRef.current) return;
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            };
            window.addEventListener("resize", handleResize);
            handleResize(); // direkt einmal aufrufen

            // Animationsloop
            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                detector.check();                        // Richtung prüfen
                dimensions.forEach(dim => dim.update()); // Labels aktualisieren
                controls.update();                       // OrbitControls
                renderer.render(scene, camera);          // Szene zeichnen

                if (!screenshotTaken) {
                    const screenshot = renderer.domElement.toDataURL("image/png");
                    props.b64Screenshot?.setValue(screenshot);
                    screenshotTaken = true;
                }
            };
            animate();
            // Cleanup
            return () => {
                cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                dimensions.forEach(dim => dim.remove());
                detectorRef.current?.dispose();
                detectorRef.current = null;
                window.removeEventListener("resize", handleResize);
            };
        });
    }, [props.file?.value?.uri])

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = rotationEnabled;
        }
    }, [rotationEnabled]) // rotationEnabled, gridVisible
    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.visible = gridVisible;
        }
    }, [gridVisible]);


    return (
        <div>
            <div ref={containerRef} style={{ width: "100%", height: "500px" }} />
            <div className="info-box">
                <p>Volume: {info.volume.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} cm³ <br />
                    x: {info.width.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} cm<br />
                    y: {info.height.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} cm<br />
                    z: {info.depth.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} cm</p>
            </div>
            <button className={"btn mx-button btn-primary spacing-outer-left"} onClick={() => setRotationEnabled(!rotationEnabled)}>
                {rotationEnabled ? "Rotation disable" : "Rotation enable"}
            </button>
            <button className={"btn mx-button btn-primary spacing-outer-left"} onClick={() => setGridVisible(!gridVisible)}>
                {gridVisible ? "Grid disable" : "Grid enable"}
            </button>
        </div>
    );
};

export default STLViewer;


