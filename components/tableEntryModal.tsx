import { Modal, Box, Typography, Autocomplete, Chip, TextField, Button, LinearProgress, Stack, Alert, Collapse } from "@mui/material";
import { useRef, useState } from "react";
import { Primitive } from "../lib/util";
import { ValidatedInput } from "./validatedinput";

export function TableEntryModal(props: {isOpen: boolean, columns: string[], onRequestClose: ()=>void, submit: (entry: Record<string, Primitive>, done: ()=>void)=>void}) {
	const [loading, setLoading] = useState(false);
	const refs = useRef<Record<string, Primitive>>(Object.fromEntries(props.columns.map(column=>[column, undefined])));
	const [result, setResult] = useState<any>(null);
	return (
		<Modal
			keepMounted
			open={props.isOpen}
			onClose={()=>{
				if (!loading) {
					props.onRequestClose()
				}
			}}
		>
			<Box
				sx={{
					position: "absolute" as "absolute",
					top: "50%",
					left: "50%",
					maxHeight: "100vh",
					overflow: "scroll",
					transform: "translate(-50%, -50%)",
					width: 400,
					bgcolor: "background.paper",
					boxShadow: 24,
					p: 4,
				}}
			>
				<Typography style={{marginBottom: 10}} variant="h6">Create Entry :P</Typography>
				<Stack spacing={2}>
				{props.columns.map((column)=>{
					return <ValidatedInput label={column} key={column} initialValue={undefined} onInputChanged={(value)=>{
						refs.current[column] = value;
					}}/>
				})}
				<Button variant="outlined" fullWidth disabled={loading} onClick={()=>{
					let valid = true;
					for (const key in refs.current) {
						if (refs.current[key] === undefined) {
							valid = false;
							break;
						}
					}
					if (valid) {
						setResult(null);
						setLoading(true);
						props.submit(refs.current, ()=>{
							setLoading(false);
							props.onRequestClose();
						})
					} else {
						setResult("Not all entries are filled plz try agian")
					}
				}}>Create Table :P</Button>
				</Stack>
				{loading?<LinearProgress/>:<></>}
				<Collapse in={Boolean(result)}>
					<Alert severity="error">{result}</Alert>
				</Collapse>
			</Box>
		</Modal>
	);
}
