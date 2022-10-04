import { createElement, useEffect, useState } from "react";
import { stlviewerContainerProps } from "../typings/STLViewerProps";
import { SpinnerDotted } from "spinners-react";
import "./STLViewer.scss";
import { StlViewer } from "../stl-viewer-react/dist";
function STLViewer(props: stlviewerContainerProps) {
    const [loading, setLoading] = useState(true);
    const [volume, setVolume] = useState(0);
    const [objHeight, setObjHeight] = useState(0);
    const [objWidth, setObjWidth] = useState(0);
    const [objDepth, setObjDepth] = useState(0);
    const [b64Screenshot, setb64Screenshot] = useState("");
    useEffect(() => {
        if (props.file?.status !== "loading") {
            const root = document.documentElement;
            if(props.sizeUnit = 'px'){
                root?.style.setProperty("--height", props.height ? props.height.toString() + "px" : "750px");
                root?.style.setProperty("--width", props.width ? props.width.toString() + "px" : "750px");
            } else {
                root?.style.setProperty("--height", props.height ? ((window.innerHeight/100) * props.height) + "px" : "750px");
                root?.style.setProperty("--width", props.width ?  ((window.innerWidth/100) * props.width) + "px" : "750px");
            }
            setLoading(false);
            props.volume?.setValue((volume).toFixed(2).toString());   
            props.objHeight?.setValue((objHeight /10).toFixed(2).toString()); 
            props.objWidth?.setValue((objWidth /10).toFixed(2).toString()); 
            props.objDepth?.setValue((objDepth /10).toFixed(2).toString());    
            props.b64Screenshot?.setValue(b64Screenshot);
                }
    }, [props.file, props.height, props.width]);
    if (loading) {
        return (
            <div className="loadingDiv">
                <SpinnerDotted size={57} thickness={152} speed={100} color="rgba(30,	144, 255, 1)" />
            </div>
        );
    }
    const dataSource = props.file?.value;
    let height = props.height;
    let width = props.width;
    if(props.sizeUnit != 'px'){
        height = props.height ? ((window.innerHeight/100) * props.height)  : 750;
        width =  props.width ?  ((window.innerWidth/100) * props.width) : 750;
    }
    props.volume?.setValue((volume).toFixed(2).toString());   
    props.objHeight?.setValue((objHeight /10).toFixed(2).toString()); 
    props.objWidth?.setValue((objWidth /10).toFixed(2).toString()); 
    props.objDepth?.setValue((objDepth /10).toFixed(2).toString());   
    props.b64Screenshot?.setValue(b64Screenshot);
    return (
        <div className="wrapperDiv">
            <StlViewer width={width} height={height} file={dataSource} volume={setVolume} objHeight={setObjHeight}  objWidth={setObjWidth}  objDepth={setObjDepth} b64Screenshot={setb64Screenshot}></StlViewer>
            <div className="volumeWrapperDiv">
                <div className="volumeDiv">
                <div> {`Volume: ${volume.toFixed(2)}`}cm<sup>3</sup> </div>
                   <div> {`x: ${(objHeight / 10).toFixed(2)}`}cm </div>
                   <div> {`y: ${(objWidth / 10).toFixed(2)}`}cm </div>
                   <div>  {`z: ${(objDepth / 10).toFixed(2)}`}cm </div>
                </div>
            </div>
        </div>
    );
   
}
export default STLViewer;
