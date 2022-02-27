import { CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { initFirebaseStorage } from "cdo-firebase-storage/firebaseStorage";
import {
	getPathRef,
	getProjectDatabase,
} from "cdo-firebase-storage/firebaseUtils";
import { useEffect, useState } from "react";
import TableView, { DataEntry } from "./tableview";

export type FirebaseStorage = ReturnType<typeof initFirebaseStorage>;

export function StorageViewer({ storage }: { storage: FirebaseStorage }) {
	const [tables, setTables] = useState<string[]>([]);
	const [currentTable, setCurrentTable] = useState<string>("");
	const [tablesLoaded, setTablesLoaded] = useState(false);
	const [recordsForTable, setRecordsForTable] = useState<DataEntry[] | null>(
		null
	);
	const [columnsForTable, setColumnsForTable] = useState<string[]>(
		[]
	);
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
		async function load(){
			const columns = await storage.getColumnsForTable(currentTable, undefined);
			setColumnsForTable(columns);
			storage.readRecords(
				currentTable,
				{},
				(yes) => {
					setRecordsForTable(yes)
				},
				() => {}
			);
		}
		load()
	}, [currentTable, storage]);

	return (
		<>
			{tablesLoaded ? (
				<>
					<Tabs value={currentTable}>
						{tables.map((t) => {
							return (
								<Tab
									onClick={() => {
										setCurrentTable(t);
									}}
									key={t}
									value={t}
									label={t}
								/>
							);
						})}
					</Tabs>
					{recordsForTable!==null?<>
						<TableView rows={recordsForTable} columns={columnsForTable}/>
					</>:<CircularProgress/>}
				</>
			) : (
				<>Loading Tables</>
			)}
		</>
	);
}
