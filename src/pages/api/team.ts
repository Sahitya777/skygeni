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
    const aggregatedData = TeamData.reduce((acc: any, entry: any) => {
      const { closed_fiscal_quarter, acv } = entry;
      const categoryKey =  "Team";
      
      if (!acc[closed_fiscal_quarter]) {
        acc[closed_fiscal_quarter] = { quarter: closed_fiscal_quarter };
      }
      if (!acc[closed_fiscal_quarter][entry[categoryKey]]) {
        acc[closed_fiscal_quarter][entry[categoryKey]] = 0;
      }
      acc[closed_fiscal_quarter][entry[categoryKey]] += acv;
      return acc;
    }, {});
    res.status(200).send((aggregatedData))
  }
}
