import { Input } from "@mui/material";
import { useState } from "react";
import { Primitive } from "../lib/util";

export function ValidatedInput(props: {initialValue: Primitive, onInputChanged: (val: Primitive)=>void}){
	const [isError, setIsError] = useState(false);
	const [value, setValue] = useState(JSON.stringify(props.initialValue));
	return <Input fullWidth color={isError?"error":"primary"} value={value} onChange={(e)=>{
		setValue(e.target.value);
		try {
			const val = e.target.value==="undefined" ? void 0 : JSON.parse(e.target.value);
			if (typeof val === "object") throw new Error("objects not permitted");
			props.onInputChanged(val)
			setIsError(false);
		} catch (e) {
			setIsError(true);
		}
	}} ref={(parent: HTMLDivElement)=>{
		if (parent) {
			// const input = parent.children[0] as HTMLInputElement;
			// props.onInputChanged(props.initialValue);
		}
	}}/>
}