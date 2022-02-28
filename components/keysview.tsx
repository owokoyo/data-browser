import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableFooter from "@mui/material/TableFooter";
import Button from "@mui/material/Button";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Order, Primitive, StorageContext } from "../lib/util";
import { EnhancedTableHead } from "./tableview";
import { KeysClearConfirmation } from "./keysClearConfirmation";
import {
	getPathRef,
	getProjectDatabase,
} from "cdo-firebase-storage/firebaseUtils";
import { EntryContextMenu } from "./entrycontextmenu";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key
): (a: { [key in Key]: Primitive }, b: { [key in Key]: Primitive }) => number {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(
	array: readonly T[],
	comparator: (a: T, b: T) => number
) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
	disablePadding: boolean;
	id: string;
	label: string;
	numeric: boolean;
}

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
	cells: HeadCell[];
}

export default function KeysView({
	rows,
}: {
	rows: { id: string; value: Primitive }[];
}) {
	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<string>("calories");
	const [page, setPage] = React.useState(0);
	const [dense, setDense] = React.useState(false);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [keysClearConfirmationOpen, setKeysClearConfirmationOpen] =
		React.useState(false);
	const storage = React.useContext(StorageContext);

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: string
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDense(event.target.checked);
	};

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0
			? Math.max(0, (1 + page) * rowsPerPage - Object.keys(rows).length)
			: 0;

	const cells = [
		{ id: "id", label: "Key", numeric: false, disablePadding: true },
		{ id: "value", label: "Value", numeric: false, disablePadding: false },
	];

	return (
		<>
			<Box sx={{ width: "100%" }}>
				<Paper sx={{ width: "100%", mb: 2 }}>
					<TableContainer>
						<Table
							sx={{ minWidth: 750 }}
							aria-labelledby="tableTitle"
							size={dense ? "small" : "medium"}
						>
							<EnhancedTableHead
								order={order}
								orderBy={orderBy}
								onRequestSort={handleRequestSort}
								cells={cells}
								onCreatePressed={() => {
									
								}}
							/>
							<TableBody>
								{rows
									.slice()
									.sort(getComparator(order, orderBy))
									.slice(
										page * rowsPerPage,
										page * rowsPerPage + rowsPerPage
									)
									.map((row, index) => {
										// const isItemSelected = isSelected(row.id);
										const labelId = `enhanced-table-checkbox-${index}`;

										return (
											<TableRow
												hover
												// role="checkbox"
												// aria-checked={isItemSelected}
												tabIndex={-1}
												key={row.id}
												// selected={isItemSelected}
											>
												<TableCell>
												<EntryContextMenu edit={()=>{

												}} delete={()=>{

												}}/>
												</TableCell>
												<TableCell
													component="th"
													id={labelId}
													scope="row"
													padding="none"
												>
													{row.id}
												</TableCell>
												<TableCell>
													{row.value}
												</TableCell>
											</TableRow>
										);
									})}
								{emptyRows > 0 && (
									<TableRow
										style={{
											height:
												(dense ? 33 : 53) * emptyRows,
										}}
									>
										<TableCell colSpan={6} />
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Button
							style={{ margin: 10 }}
							color="error"
							disabled={rows.length === 0}
							onClick={() => {
								setKeysClearConfirmationOpen(true);
							}}
						>
							Clear
						</Button>
						<TablePagination
							rowsPerPageOptions={[5, 10, 25, 100, 500]}
							component="div"
							count={rows.length}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={handleChangePage}
							onRowsPerPageChange={handleChangeRowsPerPage}
						/>
					</div>
				</Paper>
				<FormControlLabel
					control={
						<Switch checked={dense} onChange={handleChangeDense} />
					}
					label="Dense padding"
				/>
			</Box>
			<KeysClearConfirmation
				isOpen={keysClearConfirmationOpen}
				onRequestClose={() => {
					setKeysClearConfirmationOpen(false);
				}}
				submit={(done) => {
					const a = getPathRef(getProjectDatabase(), "storage/keys");
					a.set(null);
					done();
				}}
			/>
		</>
	);
}
