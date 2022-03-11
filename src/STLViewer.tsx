import { createElement, useEffect, useState } from "react";
import { stlviewerContainerProps } from "../typings/STLViewerProps";
import { SpinnerDotted } from "spinners-react";
import "./STLViewer.scss";
import { StlViewer } from "../stl-viewer-react/dist";
function STLViewer(props: stlviewerContainerProps) {
    const [loading, setLoading] = useState(true);
    const [volume, setVolume] = useState(0);
    useEffect(() => {
        if (props.file?.status !== "loading") {
            const root = document.documentElement;
            root?.style.setProperty("--height", props.height ? props.height.toString() + "px" : "750px");
            root?.style.setProperty("--width", props.width ? props.width.toString() + "px" : "750px");
            props.volume?.setValue(volume.toFixed(2).toString());
            setLoading(false);
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
    const height = props.height || 50;
    const width = props.width || 50;
    // const test = props.onClickAction;
    return (
        <div>
            <StlViewer width={width} height={height} file={dataSource} volume={setVolume}></StlViewer>
            <div className="volumeWrapperDiv">
                <div className="volumeDiv">
                    {`Volume: ${volume.toFixed(2)}`}mm<sup>3</sup>
                </div>
            </div>
        </div>
    );
    // <STLViewerWidget dataSource={dataSource} height={Number(height)} width={Number(width)} onChange={onChange} />
    // );
}
export default STLViewer;
