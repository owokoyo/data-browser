import { Modal, Box, Typography, Autocomplete, Chip, TextField, Button, LinearProgress } from "@mui/material";
import { useState } from "react";

export function KeysClearConfirmation(props: {isOpen: boolean, onRequestClose: ()=>void, submit: (done: ()=>void)=>void}) {
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
				<Typography style={{marginBottom: 10}} variant="h6">Are you sure?</Typography>
				<Typography style={{marginBottom: 10}}>Deleting all the keys of the project could erase a lot of data and could also make the creator really sad.</Typography>
				<Button variant="outlined" color="error" fullWidth disabled={loading} onClick={()=>{
					setLoading(true);
					props.submit(()=>{
						setLoading(false);
						props.onRequestClose();
					})
				}}>Clear All Keys</Button>
				{loading?<LinearProgress/>:<></>}
			</Box>
		</Modal>
	);
}
