// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from "node-fetch";
import {initFirebaseStorage} from "cdo-firebase-storage/firebaseStorage";

type Data = {
	data: any,
	tokens: [string, string]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
	try {
		const result = await getCred(String(req.query.channel));
		res.send(result);
	} catch (e) {
		res.status(500).end();
	}
}

const cache: Record<string, Data> = {};
const map = {"0":"V","1":"d","2":"4","3":"y","4":"u","5":"J","6":"c","7":"q","8":"f","9":"8","U":"j","J":"N","V":"L","p":"K","i":"h","e":"H","B":"W","L":"z","Z":"S","s":"o","o":"O","Y":"p","q":"b","m":"G","a":"i","g":"s","W":"C","x":"U","h":"D","A":"w","M":"T","l":"Z","j":"1","X":"t","O":"0","R":"I","F":"e","-":"-","P":"l","t":"B","f":"Q","K":"P","v":"3","k":"g","w":"A","y":"v","N":"7","r":"M","I":"a","n":"E","C":"F","_":"_","H":"k","b":"6","S":"X","u":"x","D":"r","d":"Y","T":"5","z":"9","E":"2","c":"n","G":"m","Q":"R"}
function decrypt(encryptedid: string){
	//@ts-ignore
	return encryptedid.split("").map(char=>map[char]).join("")
}

function lookByChannelId(project: string){
	return new Promise<Data>((res, rej)=>{
		fetch(`https://studio.code.org/v3/channels/${project}`).then(r=>r.json()).then(data=>{
			fetch(`https://studio.code.org${(data as any).level}/${project}`).then(r=>r.text()).then(response=>{
				const r = response.match(/"firebaseAuthToken":"(.+)","firebaseSharedAuthToken":"(.+?)"/)!
				cache[project] = {data, tokens: [r[1], r[2]]};
				res(cache[project]);
			})
		})
	})
}

function getCred(project: string): Promise<Data> {
	if (cache[project]) {
	  return Promise.resolve(cache[project]);
	} else {
		const first = lookByChannelId(project);
		return first.catch(()=>{
			return lookByChannelId(decrypt(project))
		})
	}
}