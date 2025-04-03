// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import CustomerData from '../../data/Customer Type.json'

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if(req.method==='GET'){
    const aggregatedData = CustomerData.reduce((acc: any, entry: any) => {
      const { closed_fiscal_quarter, acv, Cust_Type } = entry;
      if (!acc[closed_fiscal_quarter]) {
        acc[closed_fiscal_quarter] = {
          quarter: closed_fiscal_quarter,
          Existing: 0,
          New: 0,
        };
      }
      if (Cust_Type === "Existing Customer") {
        acc[closed_fiscal_quarter].Existing += acv;
      } else {
        acc[closed_fiscal_quarter].New += acv;
      }
      return acc
    }, {});
    return res.status(200).send(aggregatedData);
    
  }
}
