/**
 * This file was generated from Stlviewer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, FileValue } from "mendix";

export type SizeUnitEnum = "px" | "percentage";

export interface StlviewerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    file?: DynamicValue<FileValue>;
    volume?: EditableValue<string>;
    objHeight?: EditableValue<string>;
    objWidth?: EditableValue<string>;
    objDepth?: EditableValue<string>;
    b64Screenshot?: EditableValue<string>;
    sizeUnit: SizeUnitEnum;
    width: number;
    height: number;
    stlColor: string;
    onClickAction?: ActionValue;
}

export interface StlviewerPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    file: string;
    volume: string;
    objHeight: string;
    objWidth: string;
    objDepth: string;
    b64Screenshot: string;
    sizeUnit: SizeUnitEnum;
    width: number | null;
    height: number | null;
    stlColor: string;
    onClickAction: {} | null;
}
