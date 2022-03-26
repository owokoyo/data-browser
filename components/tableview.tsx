import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import { DataEntry, getComparator, Order, Primitive, StorageContext } from "../lib/util";
import isUrl from "is-url";
import { Alert, Button, Input, Link, Snackbar, TableFooter } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClearConfirmation } from "./clearConfirmationModal";
import { EntryContextMenu } from "./entrycontextmenu";
import SaveIcon from "@mui/icons-material/Save";
import { ValidatedInput } from "./validatedinput";
import { TableEntryModal } from "./tableEntryModal";

interface HeadCell {
	disablePadding: boolean;
	id: string;
	label: string;
	numeric: boolean;
}

interface EnhancedTableProps {
	// numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
	// onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	// rowCount: number;
	cells: HeadCell[];
	onCreatePressed: () => void;
}

export function EnhancedTableHead(props: EnhancedTableProps) {
	const {
		// onSelectAllClick,
		order,
		orderBy,
		// numSelected,
		// rowCount,
		onRequestSort,
	} = props;
	const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell>
					<Button
						onClick={() => {
							props.onCreatePressed();
						}}
					>
						Create Entry
					</Button>
				</TableCell>
				{props.cells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? "right" : "left"}
						padding={headCell.disablePadding ? "none" : "normal"}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : "asc"}
							onClick={createSortHandler(headCell.id)}
						>
							<strong>{headCell.label}</strong>
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === "desc" ? "sorted descending" : "sorted ascending"}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

export default function TableView({
	rows,
	columns,
	tableName,
}: {
	columns: string[];
	rows: DataEntry[];
	tableName: string;
}) {
	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<string>("calories");
	const [selected, setSelected] = React.useState<readonly number[]>([]);
	const [page, setPage] = React.useState(0);
	const [dense, setDense] = React.useState(false);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [clearConfirmationOpen, setClearConfirmationOpen] = React.useState(false);
	const [tableEntryModalOpen, setTableEntryModalOpen] = React.useState(false);
	const storage = React.useContext(StorageContext);
	const [snackbarStatus, setSnackbarStatus] = React.useState<any>(null);
	const snackbarOpen = Boolean(snackbarStatus);

	const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDense(event.target.checked);
	};

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const cells = columns.map((e, i) => {
		return {
			id: e,
			label: e,
			disablePadding: i === 0,
			numeric: i === 0 || (rows[0] && typeof rows[0][e] === "number"),
		};
	});

	const [isEditing, setIsEditing] = React.useState<number | null>(null);

	const refs = React.useRef<Record<string, Primitive>>({});

	const editableColumns = columns.slice(1);

	React.useEffect(() => {
		refs.current = {};
	}, [columns]);

	return (
		<>
			<Box sx={{ width: "100%" }}>
				<Paper sx={{ width: "100%", mb: 2 }}>
					<TableContainer>
						<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? "small" : "medium"}>
							<EnhancedTableHead
								// numSelected={selected.length}
								order={order}
								orderBy={orderBy}
								// onSelectAllClick={handleSelectAllClick}
								onRequestSort={handleRequestSort}
								cells={cells}
								onCreatePressed={() => {
									setTableEntryModalOpen(true);
								}}
							/>
							<TableBody>
								{rows
									.slice()
									.sort(getComparator(order, orderBy))
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((row, index) => {
										// const isItemSelected = isSelected(row.id);
										const labelId = `enhanced-table-checkbox-${index}`;

										return (
											<TableRow hover tabIndex={-1} key={row.id}>
												<TableCell>
													{isEditing === row.id ? (
														<IconButton
															onClick={() => {
																const obj = {...row, ...Object.fromEntries(
																	Object.keys(refs.current).map((column) => {
																		return [
																			column,
																			refs.current[column],
																		];
																	})
																)};
																storage.updateRecord(tableName, obj, ()=>{
																	
																},(err: any)=>{
																	setSnackbarStatus(`Failed to update record: ${err.msg}`);
																});
																setIsEditing(null);
															}}
														>
															<SaveIcon />
														</IconButton>
													) : (
														<EntryContextMenu
															delete={() => {
																storage.deleteRecord(tableName, {id:row.id}, (yes)=>{
																	if (yes){
																		// yay
																	} else {
																		setSnackbarStatus(`Failed to delete record (omae wa mou shindeiru)`);
																	}
																}, (err: any)=>{
																	setSnackbarStatus(`Failed to delete record: ${err.msg}`);
																})
															}}
															edit={() => {
																setIsEditing(row.id);
															}}
														/>
													)}
												</TableCell>
												{columns.map((column, i) => {
													return i === 0 ? (
														<TableCell
															key={i}
															component="th"
															id={labelId}
															scope="row"
															padding="none"
															align="right"
														>
															{row[column]}
														</TableCell>
													) : (
														<TableCell
															key={i}
															align={
																typeof rows[0][column] === "number" ? "right" : "left"
															}
														>
															{isEditing === row.id ? (
																<ValidatedInput onInputChanged={(value)=>{
																	refs.current[column] = value;
																}} initialValue={row[column]} />
															) : isUrl(String(row[column])) ? (
																<Link href={row[column] as string}>{row[column]}</Link>
															) : (
																row[column]
															)}
														</TableCell>
													);
												})}
											</TableRow>
										);
									})}
								{emptyRows > 0 && (
									<TableRow
										style={{
											height: (dense ? 33 : 53) * emptyRows,
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
								setClearConfirmationOpen(true);
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
					control={<Switch checked={dense} onChange={handleChangeDense} />}
					label="Dense padding"
				/>
			</Box>
			<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={()=>{
				setSnackbarStatus(null);
			}}>
				<Alert severity="error">{snackbarStatus}</Alert>
			</Snackbar>
			<TableEntryModal columns={editableColumns} isOpen={tableEntryModalOpen} onRequestClose={()=>{
				setTableEntryModalOpen(false)
			}} submit={(entry, done)=>{
				storage.createRecord(tableName, entry, ()=>{
					done();
				}, ()=>{
					// handle error
					done();
				});
			}}/>
			<ClearConfirmation
				isOpen={clearConfirmationOpen}
				onRequestClose={() => {
					setClearConfirmationOpen(false);
				}}
				submit={(done) => {
					storage.clearTable(
						tableName,
						() => {
							done();
						},
						() => {
							// todo: alert error?
							done();
						}
					);
				}}
			/>
		</>
	);
}
