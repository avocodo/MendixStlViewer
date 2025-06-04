import * as THREE from "three";

// Erstellt Maßlinien (Doppelpfeil) mit Label für eine bestimmte Strecke im 3D-Raum
export function createDimension(
    domRoot: HTMLElement,                    // DOM-Container für das Label
    scene: THREE.Scene,                      // Drei.js Szene
    camera: THREE.Camera,                    // Kamera zur Projektion der Labelposition
    renderer: THREE.WebGLRenderer,           // Renderer zum Berechnen der Bildschirmkoordinaten
    from: THREE.Vector3,                     // Startpunkt der Strecke
    to: THREE.Vector3,                       // Endpunkt der Strecke
    color: string | number = 0x000000,       // Pfeilfarbe
    unit = "cm"                              // Einheit für das Label
) {
    // Label-DOM-Element erzeugen und stylen
    const label = document.createElement("div");
    label.className = "dimension-label";
    label.style.position = "absolute";
    label.style.background = "white";
    label.style.color = "black";
    label.style.fontSize = "12px";
    label.style.fontFamily = "Arial";
    label.style.padding = "2px 4px";
    label.style.borderRadius = "4px";
    label.style.pointerEvents = "none"; // Mausereignisse blockieren
    label.style.boxShadow = "0 0 2px rgba(0,0,0,0.3)";
    domRoot.appendChild(label); // Label in den DOM einfügen

    // Richtung & Mittelpunkt der Strecke berechnen
    const dir = to.clone().sub(from).normalize();
    const length = from.distanceTo(to) / 2;
    const center = from.clone().add(to).multiplyScalar(0.5);

    // Zwei Pfeile in beide Richtungen (dünn mit kurzer Spitze)
    const arrow1 = new THREE.ArrowHelper(dir, center, length, color, 5, 0.5);
    const arrow2 = new THREE.ArrowHelper(dir.clone().negate(), center, length, color, 5, 0.5);

    // Objektknoten für die Maßlinie
    const node = new THREE.Object3D();
    node.add(arrow1);
    node.add(arrow2);
    scene.add(node); // In Szene einfügen

    // Label aktualisieren (Position & Text)
    const update = () => {
        const screen = center.clone().project(camera); // Projektion auf Bildschirm
        const x = (screen.x + 1) / 2 * renderer.domElement.clientWidth;
        const y = (-screen.y + 1) / 2 * renderer.domElement.clientHeight;
        // console.info('x', x);
        // console.info('y', y);
        if(x > 0 || y > 0) {
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;

            // Entfernung in cm anzeigen
            const distance = from.distanceTo(to) / 10; // mm → cm
            label.innerText = `${distance.toFixed(2)} ${unit}`;
        }
    };

    // Maßlinie und Label entfernen
    const remove = () => {
        scene.remove(node);
        try {
            label.remove(); // Entfernt das Label aus dem DOM, egal wo es hängt
        } catch (e) {
            console.warn("Fehler beim Entfernen des Labels:", e);
        }
        document.querySelectorAll(".dimension-label").forEach(el => el.remove());
    };


    // Rückgabe des Maßobjekts
    return { node, label, update, remove };
}
