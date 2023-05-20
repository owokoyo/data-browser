import {
	Alert,
	Button,
	CircularProgress,
	Collapse,
	Input,
	LinearProgress,
	Link,
	Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { initFirebaseStorage } from "cdo-firebase-storage/firebaseStorage";
import { StorageViewer } from "../components/storageviewer";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {FirebaseStorage} from "../lib/util";
import GitHubIcon from '@mui/icons-material/GitHub';
import Card from '@mui/material/Card';

async function loadFirebase(channel: string) {
	// const c = await getCred(channel);
	const url = new URL(location.origin);
	url.pathname = "/api/channelProxy";
	url.searchParams.set("channel", channel);

	const c = await fetch(url.toString()).then((e) => e.json());
	const config = {
		channelId: channel,
		firebaseName: "cdo-v3-prod",
		firebaseAuthToken: c.tokens[0],
		firebaseSharedAuthToken: c.tokens[1],
		firebaseChannelIdSuffix: "",
		showRateLimitAlert: (e: string) => {
			console.log(e);
		},
	};

	const obj = {
		data: c.data,
		storage: initFirebaseStorage(config),
	};

	return obj;
}

const Index: NextPage = () => {
	const [firebaseStorage, setFirebaseStorage] = useState<{
		data: any;
		storage: FirebaseStorage;
	} | null>(null);

	const [disabled, setDisabled] = useState(false);

	const [result, setResult] = useState<any>();

	const ref = useRef<HTMLInputElement>();
	useEffect(()=>{
		async function load(){
			let searchParams = new URLSearchParams(location.search);
			if (searchParams.has("channel")) {
				if (ref.current) {
					ref.current.value = searchParams.get("channel")!;
				}
				setDisabled(true);
				try {
					const storage = await loadFirebase(
						searchParams.get("channel")!
					);
					setFirebaseStorage(storage);
					setDisabled(false);
				} catch (e) {
					setResult(e);
					setDisabled(false);
				}			
			}
		}
		load();
	}, []);
	return (
		<>
			<Head>
				<title>😈😈Prince Browser😈😈</title>
			</Head>
			<div style={{ margin: 20 }}>
				{firebaseStorage ? (
					<>
						<Typography variant="h4">
							{firebaseStorage.data.name}
							<Link style={{marginLeft: 10}} href={`https://studio.code.org${firebaseStorage.data.level}/${firebaseStorage.data.id}`} target="_blank"><OpenInNewIcon/></Link>
						</Typography>
						<StorageViewer storage={firebaseStorage.storage} />
					</>
				) : (
					<>
						<Typography variant="h4">
							Code.org Data Browser and Editor
							<Link style={{marginLeft: 20}} href="https://github.com/jitdummy"><GitHubIcon/></Link>
						</Typography>
						<Typography>
							Type in the code.org app{"'"}s id at the top of a chat and paste the random numbers and letters to start!
						</Typography>
						<Card>
						<Typography>
							No coolguy  and graycat allowed This is Prince Version of Good old Data Browser Thx to wuadmane &gt;:(
						</Typography>
						<Typography style={{fontSize: 20}}>V.2</Typography>
						This is was made  by
						<Link href="https://cdn.discordapp.com/emojis/994668964661710908.gif?size=240&quality=lossless">Prince</Link>
						</Card>
						<Input
							fullWidth
							placeholder="code.org ID"
							disabled={disabled}
							inputRef={ref}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									setDisabled(true);
									try {
										const storage = await loadFirebase(
											ref.current!.value
										);
										setFirebaseStorage(storage);
										setDisabled(false);
									} catch (e) {
										setResult(e);
										setDisabled(false);
									}
								}
							}}
						/>
						{disabled ? <LinearProgress /> : <></>}
						<Collapse in={!!result}>
							<Alert
								onClose={() => {
									setResult("");
								}}
								severity="error"
							>
								{"That's not a code.org projectplz try agian u might of missed letters or code.org deleted it"}
							</Alert>
						</Collapse>
					</>
				)}
			</div>
		</>
	);
};

export default Index;
