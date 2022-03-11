import React, { useEffect } from "react";
import Stl from "./STLArrows";

export const StlViewer = ({ width, height, file, objectColor, primaryColor, volume }) => {
    useEffect(() => {
        Stl(
            width,
            height,
            file,
            objectColor ? objectColor : "#ff6600",
            primaryColor ? primaryColor : "#1e90ff",
            volume
        );
    }, [file]);
    const buttonStyle = {
        backgroundColor: "DodgerBlue",
        border: 0,
        color: "white",
        padding: "8px 12px",
        fontSize: "12px",
        margin: "5px"
    };
    const buttonGridStyle = {
        textAlign: "center",
        display: "inline-block",
        position: "absolute",
        right: "2vh",
        bottom: "1vh"
    };
    const errorDivStyle = {
        display: "none",
        background: "#872317",
        zIndex: "3",
        color: "white",
        height: "100%",
        width: "100%",
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        right: "0",
        top: "0",
        fontFamily: "Arial"
    };

    return (
        <div>
            <div style={{ width, height, position: "relative" }}>
                <div style={errorDivStyle} id="errorView">
                    Could not load Model!
                </div>
                <div style={buttonGridStyle}>
                    <button style={buttonStyle} id="rotate">
                        rotation
                    </button>
                    <button style={buttonStyle} id="grid">
                        grid
                    </button>
                </div>
                <div id="stlviewer"></div>
            </div>
        </div>
    );
};
