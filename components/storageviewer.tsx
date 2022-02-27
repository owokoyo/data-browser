import {
	Alert,
	IconButton,
	LinearProgress,
	Snackbar,
	Tab,
	Tabs,
} from "@mui/material";
import { initFirebaseStorage } from "cdo-firebase-storage/firebaseStorage";
import {
	getPathRef,
	getProjectDatabase,
	unescapeFirebaseKey,
} from "cdo-firebase-storage/firebaseUtils";
import { createContext, useEffect, useState } from "react";
import { DataEntry, FirebaseStorage, Primitive, StorageContext } from "../lib/util";
import TableView from "./tableview";
import AddIcon from "@mui/icons-material/Add";
import { CreateTableModal } from "./createTableModal";
import KeysView from "./keysview";
import Delete from "@mui/icons-material/Delete";
import { DeleteTableConfirmation } from "./deleteTableConfirmation";

const keyValueSymbol = Symbol("Key Value Symbol");

export function StorageViewer({ storage }: { storage: FirebaseStorage }) {
	const [tables, setTables] = useState<string[]>([]);
	const [currentTable, setCurrentTable] = useState<string | typeof keyValueSymbol>("");
	const [tablesLoaded, setTablesLoaded] = useState(false);
	const [recordsForTable, setRecordsForTable] = useState<DataEntry[] | null>(
		null
	);
	const [columnsForTable, setColumnsForTable] = useState<string[]>([]);

	const [createTableOpen, setCreateTableOpen] = useState(false);

	const [deleteTableConfirmationOpen, setDeleteTableConfirmationOpen] = useState<string | null>(null);
	const [snackbarStatus, setSnackbarStatus] = useState<any>(null);
	const snackbarOpen = Boolean(snackbarStatus);
	
	useEffect(() => {
		const a = getPathRef(getProjectDatabase(), "counters/tables");
		a.on("value", (snapshot: any)=>{
			const value = Object.keys(snapshot.val() || {});
			// tables are already seen as "loaded" prior to this.
			// neither setTables or setCurrentTable can be called before the other
			// tables loaded must be set to false before the 2 updates
			setTablesLoaded(false)
			setTables(value);
			if (!currentTable || value.indexOf(currentTable as string)===-1) {
				setCurrentTable(value[0] || keyValueSymbol);
			}
			setTablesLoaded(true);
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage]);

	useEffect(() => {
		if (!currentTable) return;
		async function load() {
			if (currentTable === keyValueSymbol) {
				const a = getPathRef(getProjectDatabase(), "storage/keys");
				a.once("value", (snapshot: any)=>{
					const value = Object.entries(snapshot.val() || {}).map(([k,v])=>{return {id:k as unknown as number, value:v as Primitive}});
					setRecordsForTable(value);
				})
			} else {
				const columns = await storage.getColumnsForTable(
					currentTable,
					undefined
				);
				setColumnsForTable(columns);
				storage.readRecords(
					currentTable,
					{},
					(yes) => {
						setRecordsForTable(yes);
					},
					() => {}
				);
			}
		}
		load();
	}, [currentTable, storage]);

	return (
		<StorageContext.Provider value={storage}>
			{tablesLoaded ? (
				<>
					<Tabs value={currentTable} variant="scrollable">
						{[
							...tables.map((t) => {
								return [
									<Tab
									
										style={{
											display:"flex",
											flexDirection:"row"
										}}
										
										onClick={() => {
											if (currentTable!==t){
												setCurrentTable(t);
												setRecordsForTable(null);
											}
										}}
										key={"_"+t}
										value={t}
										label={<>
										{t}
										<IconButton style={{marginLeft: 3}} onClick={(event)=>{
											setDeleteTableConfirmationOpen(t);
											event.stopPropagation();
										}} onMouseDown={(event)=>{
											event.stopPropagation();
										}}><Delete fontSize="small"/></IconButton>
										</>}
									/>
								]
							}),
							<Tab
								key="keyValue"
								value={keyValueSymbol}
								label="Key Values"
								onClick={() => {
									setCurrentTable(keyValueSymbol);
									setRecordsForTable(null);
								}}
							/>,
							<Tab
								key="newTable"
								value={null}
								icon={<AddIcon />}
								onClick={() => {
									setCreateTableOpen(true);
								}}
							/>,

						]}
					</Tabs>
					{recordsForTable !== null ? (
						currentTable === keyValueSymbol ? <KeysView rows={recordsForTable as unknown as {id: string, value: string}[]}/>: <>
							<TableView
								tableName={currentTable}
								rows={recordsForTable}
								columns={columnsForTable}
							/>
						</>
					) : (
						<LinearProgress />
					)}
				</>
			) : (
				<>Loading Tables</>
			)}
			<CreateTableModal isOpen={createTableOpen} onRequestClose={()=>{setCreateTableOpen(false)}} submit={(name, options, done)=>{
				storage.createTable(name, ()=>{
					Promise.all(options.map(option=>new Promise((res, rej)=>storage.addColumn(name, option, res, rej)))).then(e=>{
						done();
					})
				}, (e: any)=>{
					setSnackbarStatus(`Failed to create table: ${e.msg}`)
					done();
				})
			}}/>
			<DeleteTableConfirmation isOpen={Boolean(deleteTableConfirmationOpen)} submit={(done)=>{
				storage.deleteTable(deleteTableConfirmationOpen!, undefined as any, ()=>{
					done()
				}, (e: any)=>{
					setSnackbarStatus(`Failed to delete table: ${e.msg}`)
					done();
				});
			}} onRequestClose={()=>{
				setDeleteTableConfirmationOpen(null);
			}}/>
			<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={()=>{
				setSnackbarStatus(null);
			}}>
				<Alert severity="error">{snackbarStatus}</Alert>
			</Snackbar>
		</StorageContext.Provider>
	);
}
