import React from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";

const ReportDashboard = () => {
  return (
    <div className="flex flex-col p-6">
      <h1 className="text-2xl font-semibold mb-4">Power BI Report</h1>

      <PowerBIEmbed
        embedConfig={{
          type: "report",
          id: "2562bac4-9dfa-43dd-a844-78043d5e78d3", // Your actual report ID
          embedUrl: "https://app.powerbi.com/reportEmbed?reportId=2562bac4-9dfa-43dd-a844-78043d5e78d3",
          accessToken: "YOUR_ACCESS_TOKEN", // Replace with actual token via MSAL or API call
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: true },
            },
          },
        }}
        cssClassName="h-[600px] w-full"
        getEmbeddedComponent={(report) => {
          console.log("Report is loaded:", report);
        }}
      />
    </div>
  );
};

export default ReportDashboard;