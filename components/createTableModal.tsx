import { Modal, Box, Typography, Autocomplete, Chip, TextField, Button, LinearProgress } from "@mui/material";
import { useState } from "react";

export function CreateTableModal(props: {isOpen: boolean, onRequestClose: ()=>void, submit: (tableName: string, columns: string[], done: ()=>void)=>void}) {
	const [options, setOptions] = useState<string[]>([]);
	const [tableName, setTableName] = useState("");
	const [loading, setLoading] = useState(false);
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
					transform: "translate(-50%, -50%)",
					width: 400,
					bgcolor: "background.paper",
					boxShadow: 24,
					p: 4,
				}}
			>
				<Typography style={{marginBottom: 10}} variant="h6">Create New Table</Typography>
				<TextField disabled={loading} onChange={(event)=>{setTableName(event.target.value)}} style={{marginBottom: 10}} fullWidth label="Table Name" placeholder="Name" variant="filled"/>
				<Autocomplete
					disabled={loading}
					style={{marginBottom: 10}}
					multiple
					id="tags-filled"
					options={[]}
					freeSolo
					onChange={(_, val) => {
						setOptions(val);
					}}
					renderTags={(value: string[], getTagProps) =>
						value.map((option: string, index: number) => (
							// eslint-disable-next-line react/jsx-key
							<Chip
								variant="outlined"
								{...getTagProps({ index })}
								label={option}
							/>
						))
					}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="filled"
							label="Columns"
							placeholder="Column"
						/>
					)}
				/>
				<Button variant="outlined" fullWidth disabled={loading} onClick={()=>{
					setLoading(true);
					props.submit(tableName, options, ()=>{
						setLoading(false);
						props.onRequestClose();
					})
				}}>Create Table</Button>
				{loading?<LinearProgress/>:<></>}
			</Box>
		</Modal>
	);
}
