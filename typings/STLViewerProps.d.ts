/**
 * This file was generated from stlviewer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, FileValue } from "mendix";

export interface stlviewerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    file?: DynamicValue<FileValue>;
    volume?: EditableValue<string>;
    width: number;
    height: number;
    onClickAction?: ActionValue;
}

export interface stlviewerPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    file: string;
    volume: string;
    width: number | null;
    height: number | null;
    onClickAction: {} | null;
}
