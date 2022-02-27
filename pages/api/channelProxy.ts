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

function getCred(project: string): Promise<Data> {
	if (cache[project]) {
	  return Promise.resolve(cache[project]);
	} else {
		return new Promise((res, rej)=>{
			fetch(`https://studio.code.org/v3/channels/${project}`).then(r=>r.json()).then(data=>{
				fetch(`https://studio.code.org${(data as any).level}/${project}`).then(r=>r.text()).then(response=>{
					const r = response.match(/"firebaseAuthToken":"(.+)","firebaseSharedAuthToken":"(.+?)"/)!
					cache[project] = {data, tokens: [r[1], r[2]]};
					res(cache[project]);
				})
			})
		})
	}
}