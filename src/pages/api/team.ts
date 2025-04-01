// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import TeamData from '../../data/Team.json'

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if(req.method==='GET'){
    const jsonData=JSON.stringify(TeamData)
    res.status(200).send(JSON.parse(jsonData))
  }
}
