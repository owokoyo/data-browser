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
import { DataEntry, getComparator, Order, StorageContext } from "../lib/util";
import isUrl from "is-url";
import { Button, Link, TableFooter } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ClearConfirmation } from "./clearConfirmationModal";

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
	rowCount: number;
	cells: HeadCell[];
	onClearPressed: () => void;
}

export function EnhancedTableHead(props: EnhancedTableProps) {
	const {
		// onSelectAllClick,
		order,
		orderBy,
		// numSelected,
		rowCount,
		onRequestSort,
	} = props;
	const createSortHandler =
		(property: string) => (event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				<TableCell>
					<Button
						disabled={rowCount === 0}
						color="error"
						onClick={() => {
							props.onClearPressed();
						}}
					>
						Clear
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
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === "desc"
										? "sorted descending"
										: "sorted ascending"}
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
	const [clearConfirmationOpen, setClearConfirmationOpen] =
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
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const cells = columns.map((e, i) => {
		return {
			id: e,
			label: e,
			disablePadding: i === 0,
			numeric: i === 0 || (rows[0] && typeof rows[0][e] === "number"),
		};
	});

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
								// numSelected={selected.length}
								order={order}
								orderBy={orderBy}
								// onSelectAllClick={handleSelectAllClick}
								onRequestSort={handleRequestSort}
								rowCount={rows.length}
								cells={cells}
								onClearPressed={() => {
									setClearConfirmationOpen(true);
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
												tabIndex={-1}
												key={row.id}
											>
												<TableCell>
													<IconButton>
														<DeleteIcon
															onClick={() => {}}
														/>
													</IconButton>
												</TableCell>
												{columns.map((name, i) => {
													return i === 0 ? (
														<TableCell
															key={i}
															component="th"
															id={labelId}
															scope="row"
															padding="none"
															align="right"
														>
															{row[name]}
														</TableCell>
													) : (
														<TableCell
															key={i}
															align={
																typeof rows[0][
																	name
																] === "number"
																	? "right"
																	: "left"
															}
														>
															{isUrl(
																String(
																	row[name]
																)
															) ? (
																<Link
																	href={
																		row[
																			name
																		] as string
																	}
																>
																	{row[name]}
																</Link>
															) : (
																row[name]
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
					<div style={{display: "flex", justifyContent: "space-between"}}>
						<Button style={{margin: 10}}>Create Entry</Button>
						<TablePagination
							rowsPerPageOptions={[5, 10, 25, 100]}
							component="div"
							count={rows.length}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={handleChangePage}
							onRowsPerPageChange={
								handleChangeRowsPerPage
							}
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
			<ClearConfirmation
				isOpen={clearConfirmationOpen}
				onRequestClose={() => {
					setClearConfirmationOpen(false);
				}}
				submit={(done) => {
					storage.clearTable(tableName, ()=>{
						done();
					}, ()=>{
						// todo: alert error?
						done();
					});
				}}
			/>
		</>
	);
}
