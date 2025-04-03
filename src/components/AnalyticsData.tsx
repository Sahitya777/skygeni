import numberFormatter from '@/functions/numberFormatter';
import React, { useState, useEffect } from 'react';

const AnalyticsTable = ({data,chartType}:any) => {

  // Function to get sorted quarters
  const getSortedQuarters = () => {
    return [...data].sort((a, b) => {
      // Split quarter into year and quarter
      const [aYear, aQuarter] = a.quarter.split('-');
      const [bYear, bQuarter] = b.quarter.split('-');
      
      // Compare year first
      if (aYear !== bYear) {
        return aYear.localeCompare(bYear);
      }
      
      // Then quarter
      return aQuarter.localeCompare(bQuarter);
    });
  };

  // Get all unique industries across all quarters
  const getAllIndustries = () => {
    const industries = new Set();
    data.forEach((quarter: {}) => {
      Object.keys(quarter).forEach(key => {
        if (key !== 'quarter') {
          industries.add(key);
        }
      });
    });
    return [...industries];
  };
  
  // Calculate total ACV (Annual Contract Value) for each industry
  const calculateTotals = () => {
    const sortedData = getSortedQuarters();
    const industries = getAllIndustries();
    const industryTotals:any = {};
    let grandTotal = 0;
    
    industries.forEach((industry:any) => {
      industryTotals[industry] = 0;
      sortedData.forEach(quarter => {
        if (quarter[industry]) {
          industryTotals[industry] += quarter[industry];
        }
      });
      grandTotal += industryTotals[industry];
    });
    
    return { industryTotals, grandTotal };
  };
  
  // Function to mock the number of opportunities per industry
  const getIndustryOpps = (industry: string) => {
    const mockOpps:any = {
      "Manufacturing": 102,
      "Transportation": 47,
      "Wholesalers": 24,
      "Financial Svcs": 18,
      "Tecnology Svcs": 31,
      "Retail": 22,
      "Education": 3,
      "Others": 9
    };
    
    return mockOpps[industry] || 0;
  };
  
  // Function to calculate percentage of total value
  const calculatePercentage = (value: number, total: number) => {
    return total ? Math.round((value / total) * 100) : 0;
  };
  
  const sortedQuarters = getSortedQuarters();
  const industries:any = getAllIndustries();
  const { industryTotals, grandTotal } = calculateTotals();

  return (
    <div className="p-4  mt-[-7rem] shadow-sm text-black mb-[2rem]">
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="bg-white text-black border p-2 text-left">Closed Fiscal Quarter</th>
                {sortedQuarters.map(quarter => (
                  <th key={quarter.quarter} className="border p-2 text-center" colSpan={2}>{quarter.quarter}</th>
                ))}
                <th className="border p-2 text-center bg-blue-600" colSpan={2}>Total</th>
              </tr>
              <tr className="text-black">
                <th className="border p-2 text-left">{chartType}</th>
                {sortedQuarters.map(() => (
                  <>
                    <th className="border p-2 text-center">ACV</th>
                    <th className="border p-2 text-center">% of Total</th>
                  </>
                ))}
                <th className="border p-2 text-center ">ACV</th>
                <th className="border p-2 text-center ">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {industries
                .sort((a:any, b:any) => industryTotals[b] - industryTotals[a])
                .map((industry:any,index:number) => {
                  let totalOpps = 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2 font-medium">{industry}</td>
                      {sortedQuarters.map(quarter => {
                        const value = quarter[industry] || 0;
                        const quarterTotal = Object.keys(quarter)
                          .filter(key => key !== 'quarter')
                          .reduce((sum, key) => sum + quarter[key], 0);
                        
                        // Mock number of opportunities for this industry in this quarter
                        const opps = Math.round(getIndustryOpps(industry) / 4);
                        totalOpps += opps;
                        
                        return (
                          <>
                            <td className="border p-2 text-right">{value ? numberFormatter(value) : '$0'}</td>
                            <td className="border p-2 text-center">{calculatePercentage(value, quarterTotal)}%</td>
                          </>
                        );
                      })}
                      <td className="border p-2 text-right font-medium">{numberFormatter(industryTotals[industry])}</td>
                      <td className="border p-2 text-center font-medium">{calculatePercentage(industryTotals[industry], grandTotal)}%</td>
                    </tr>
                  );
                })}
              <tr className="bg-gray-200 font-bold">
                <td className="border p-2">Total</td>
                {sortedQuarters.map(quarter => {
                  const quarterTotal = Object.keys(quarter)
                    .filter(key => key !== 'quarter')
                    .reduce((sum, key) => sum + quarter[key], 0);
                  
                  // Sum of all opportunities in this quarter
                  const totalQuarterOpps:any = industries.reduce((sum:any, industry:any) => {
                    return sum + Math.round(getIndustryOpps(industry) / 4);
                  }, 0);
                  
                  return (
                    <>
                      <td className="border p-2 text-right">{numberFormatter(quarterTotal)}</td>
                      <td className="border p-2 text-center">100%</td>
                    </>
                  );
                })}
                <td className="border p-2 text-right">{numberFormatter(grandTotal)}</td>
                <td className="border p-2 text-center">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTable;
