import * as THREE from "three";

// Berechnet das Volumen eines Meshes basierend auf seinem Dreiecksnetz
export function computeMeshVolume(geometry: THREE.BufferGeometry): number {
    let volume = 0;

    // Zugriff auf die Positionen aller Eckpunkte des Meshes
    const pos = geometry.attributes.position;

    // Iteration über alle Dreiecke (je 3 Punkte pro Dreieck)
    for (let i = 0; i < pos.count; i += 3) {
        // Dreieckspunkte aus dem Buffer lesen
        const p1 = new THREE.Vector3().fromBufferAttribute(pos, i);
        const p2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
        const p3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

        // Volumen des Tetraeders mit Ursprung und Dreieck berechnen
        volume += p1.dot(p2.cross(p3)) / 6.0;
    }

    // Umrechnung von mm³ in cm³ und Rundung
    volume = Number((volume / 1000).toFixed(2));

    // Nur den absoluten Wert zurückgeben (negative Werte bei invertierten Normalen)
    return Math.abs(volume);
}
