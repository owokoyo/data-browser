import {
	LinearProgress,
	Tab,
	Tabs,
} from "@mui/material";
import { initFirebaseStorage } from "cdo-firebase-storage/firebaseStorage";
import {
	getPathRef,
	getProjectDatabase,
} from "cdo-firebase-storage/firebaseUtils";
import { useEffect, useState } from "react";
import { DataEntry } from "../lib/util";
import TableView from "./tableview";
import AddIcon from "@mui/icons-material/Add";
import { CreateTableModal } from "./createTableModal";

export type FirebaseStorage = ReturnType<typeof initFirebaseStorage>;

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
	
	useEffect(() => {
		const a = getPathRef(getProjectDatabase(), "counters/tables");
		a.once("value", (snapshot: any) => {
			const val = Object.keys(snapshot.val());
			setCurrentTable(val[0]);
			setTables(val);
			setTablesLoaded(true);
		});
	}, [storage]);

	useEffect(() => {
		if (!currentTable) return;
		async function load() {
			if (currentTable === keyValueSymbol) {
				
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
		<>
			{tablesLoaded ? (
				<>
					<Tabs value={currentTable} variant="scrollable">
						{[
							...tables.map((t) => {
								return (
									<Tab
										onClick={() => {
											if (currentTable!==t){
												setCurrentTable(t);
												setRecordsForTable(null);
											}
										}}
										key={"_"+t}
										value={t}
										label={t}
									/>
								);
							}),
							<Tab
								key="keyValue"
								value={keyValueSymbol}
								label="Key Values"
								onClick={() => {
									setCurrentTable(keyValueSymbol);
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
						<>
							<TableView
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
				}, ()=>{

				})
			}}/>
		</>
	);
}
