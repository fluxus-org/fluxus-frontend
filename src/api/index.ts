import type { AppTable } from "@/types";
// import fetalHealth from "../mock-data/fetal-health.json";
// import heartFailure from "../mock-data/heart-failure.json";

const apiUrl = "https://quiet-gopher-generally.ngrok-free.app/api";

export const api = {
  processTableData(data: any[][]) {
    const out = [] as any[];
    const headers = data[0];

    for (const row of data.slice(1)) {
      const newRow = {} as any;
      for (let i = 0; i < headers.length; i++) {
        newRow[headers[i]] = row[i];
      }
      out.push(newRow);
    }

    return out;
  },

  async getTables(): AppTable[] {
    const tables = [] as AppTable[];

    const tablesResp = await fetch(apiUrl + "/tables/list", {
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
    });
    const tablesList = await tablesResp.json();

    const requests = [] as Promise<void>[];
    for (const tableName of tablesList) {
      const p = await fetch(apiUrl + "/tables/data/" + tableName, {
        headers: new Headers({
          "ngrok-skip-browser-warning": "69420",
        }),
      }).then(d => d.json()).then(tablesData => {
        tables.push({ name: tableName, data: this.processTableData(tablesData) })
      });

      // requests.push(p);
    }

    await Promise.all(requests);

    console.log(tables);
    return tables;
  },

  getNewTable(): AppTable {
    return {
      name: "Association Table",
      data: [
        {
          baselineValue: 134,
          platelets: 265000
        },
        {
          baselineValue: 124,
          platelets: 235000
        },
        {
          baselineValue: 34,
          platelets: 63000
        },
        {
          baselineValue: 234,
          platelets: 269000
        },
        {
          baselineValue: 14,
          platelets: 45000
        }
      ]
    };
  }
};
