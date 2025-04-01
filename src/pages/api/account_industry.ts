// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import IndustryData from '../../data/Account Industry.json'

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if(req.method==='GET'){
    const jsonData=JSON.stringify(IndustryData)
    res.status(200).send(JSON.parse(jsonData))
  }
}
