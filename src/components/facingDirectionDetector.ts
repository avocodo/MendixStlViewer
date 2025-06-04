// Drei.js importieren
import * as THREE from "three";

// Mögliche Blickrichtungen entlang der Koordinatenachsen
export type AxisDirection = "posX" | "negX" | "posY" | "negY" | "posZ" | "negZ";

// Struktur für das Ergebnis: stärkste Blickrichtung + alle sichtbaren Achsen
export interface FacingState {
    best: AxisDirection;              // Richtung, die der Kamera am nächsten liegt
    visible: AxisDirection[];         // Alle Richtungen, die sichtbar (nach vorne gerichtet) sind
}

// Klasse zur Erkennung der Kameraausrichtung im 3D-Raum
export class FacingDirectionDetector {
    private camera: THREE.Camera;     // Die beobachtete Kamera
    private currentState: FacingState | null = null;  // Letzter Zustand (für Vergleich)

    // Definierte Richtungsvektoren für alle 6 Hauptachsen
    private directionVectors: { [key in AxisDirection]: THREE.Vector3 } = {
        posX: new THREE.Vector3(+1, 0, 0),
        negX: new THREE.Vector3(-1, 0, 0),
        posY: new THREE.Vector3(0, +1, 0),
        negY: new THREE.Vector3(0, -1, 0),
        posZ: new THREE.Vector3(0, 0, +1),
        negZ: new THREE.Vector3(0, 0, -1)
    };

    // Callback-Funktionen, die bei Veränderung des Blickwinkels aufgerufen werden
    public onChange: ((state: FacingState) => void)[] = [];

    // Konstruktor: erhält die Kamera, deren Blickrichtung beobachtet wird
    constructor(camera: THREE.Camera) {
        this.camera = camera;
    }

    // Hauptfunktion zur Blickrichtungs-Erkennung
    check(): void {
        const camDir = new THREE.Vector3();

        // Blickrichtung der Kamera holen (und umdrehen, da Blick „hinaus“ geht)
        this.camera.getWorldDirection(camDir).negate();

        let bestDir: AxisDirection = "posZ"; // Fallback-Wert
        let maxDot = -Infinity;              // Dot-Produkt für beste Übereinstimmung
        const visible: AxisDirection[] = []; // Alle aktuell sichtbaren Richtungen

        // Alle Richtungen durchgehen
        for (const key in this.directionVectors) {
            const dir = this.directionVectors[key as AxisDirection];
            const dot = dir.dot(camDir); // Abgleich mit Blickrichtung (per Dot-Produkt)

            if (dot > 0) {
                visible.push(key as AxisDirection); // Richtung ist im Sichtbereich
                if (dot > maxDot) {
                    maxDot = dot;
                    bestDir = key as AxisDirection; // Richtung mit größter Übereinstimmung
                }
            }
        }

        // Ergebnis-Objekt erstellen
        const newState: FacingState = { best: bestDir, visible };

        // Prüfen, ob sich der Zustand geändert hat (um unnötige Updates zu vermeiden)
        if (
            !this.currentState ||
            this.currentState.best !== newState.best ||
            this.currentState.visible.join() !== newState.visible.join()
        ) {
            this.currentState = newState;
            this.onChange.forEach(cb => cb(newState)); // Alle registrierten Listener benachrichtigen
        }
    }

    // Optional: Alle Listener entfernen (z. B. beim Cleanup)
    dispose(): void {
        this.onChange = [];
    }
}
