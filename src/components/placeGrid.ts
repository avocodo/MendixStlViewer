import * as THREE from "three";

/**
 * Platziert das Grid direkt unterhalb eines Meshes, auch wenn das Mesh rotiert ist.
 * @param mesh Das Mesh, unter dem das Grid erscheinen soll.
 * @param grid Die GridHelper-Instanz, die korrekt positioniert werden soll.
 * @param offset Ein kleiner Abstand (z. B. 0.5), damit das Objekt nicht im Grid "steckt".
 */
export function placeGrid(mesh: THREE.Mesh, grid: THREE.GridHelper, offset = 0.5): void {
    // Berechne oder aktualisiere die BoundingBox des Meshes
    mesh.geometry.computeBoundingBox();

    // Hole die BoundingBox
    const boundingBox = mesh.geometry.boundingBox!;
    const min = boundingBox.min.clone();
    const max = boundingBox.max.clone();

    // Erzeuge die 8 Ecken der BoundingBox in lokalen Koordinaten
    const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z),
    ];

    // Wandle alle Eckpunkte in Weltkoordinaten um (berücksichtigt Position + Rotation + Skalierung)
    const worldCorners = corners.map(corner =>
        corner.applyMatrix4(mesh.matrixWorld)
    );

    // Finde den tiefsten Y-Wert der transformierten Punkte (Unterkante im Weltkoordinatensystem)
    const lowestY = worldCorners.reduce((minY, vec) =>
        Math.min(minY, vec.y), Infinity
    );

    // Stelle sicher, dass das Grid flach in der XZ-Ebene liegt
    grid.rotation.set(0, 0, 0);

    // Positioniere das Grid leicht unterhalb des tiefsten Punkts des Objekts
    grid.position.set(0, lowestY - offset, 0);
}
