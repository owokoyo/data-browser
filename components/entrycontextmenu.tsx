import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

export function EntryContextMenu(props: {
	delete: () => void;
	edit: () => void;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<IconButton
				aria-label="more"
				id="long-button"
				aria-haspopup="true"
				onClick={handleClick}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				id="long-menu"
				MenuListProps={{
					"aria-labelledby": "long-button",
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				//   PaperProps={{
				// 	style: {
				// 	  maxHeight: ITEM_HEIGHT * 4.5,
				// 	  width: '20ch',
				// 	},
				//   }}
			>
				<MenuItem
					onClick={() => {
						props.edit();
						handleClose();
					}}
				>
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						props.delete();
						handleClose();
					}}
				>
					Delete
				</MenuItem>
			</Menu>
		</>
	);
}
