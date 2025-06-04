// Importiere das THREE.js-Hauptmodul
import * as THREE from "three";

// Importiere die OrbitControls (für Maussteuerung der Kamera)
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Platziert die Kamera so, dass das übergebene Objekt vollständig im Sichtfeld liegt.
 * @param mesh Das 3D-Objekt, das angezeigt werden soll (z.B. ein STL-Mesh)
 * @param camera Die Perspektivkamera, die auf das Objekt ausgerichtet werden soll
 * @param controls OrbitControls zur Navigation, um das Ziel korrekt zu setzen
 */

export function placeCamera(
    mesh: THREE.Object3D,
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls
): void {
    // Berechne die BoundingBox
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // Berechne das Zentrum der Bounding Box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Berechne die Diagonale der Box (Länge der Raumdiagonale)
    const diagonal = size.length();

    // Umrechnen des Field-of-View in Radiant
    const fovRad = camera.fov * (Math.PI / 180);

    // Robuster Abstand zur Kamera – größerer Sicherheitsfaktor
    const distance = (diagonal / 2) / Math.tan(fovRad / 2) * 1.2;

    // Positioniere die Kamera (z. B. von vorne oben)
    camera.position.set(center.x, center.y + size.y * 0.25, center.z + distance);

    // Kamera soll ins Zentrum blicken
    camera.lookAt(center);

    // OrbitControls-Ziel setzen
    controls.target.copy(center);
    // Wende die Änderungen an den Controls an
    controls.update();
}