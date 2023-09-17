import type { AppTable } from "@/types";
import * as vis from "vis-network";
import { Parser } from "node-sql-parser";
// import fetalHealth from "../mock-data/fetal-health.json";
// import heartFailure from "../mock-data/heart-failure.json";

const apiUrl = "https://quiet-gopher-generally.ngrok-free.app/api";

const fetchTimeout = (url: string, ms: number, { signal, ...options } = {}) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

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

  async getTable(tableName: string) {
    const tableData = await fetch(apiUrl + "/tables/data/" + tableName, {
      headers: new Headers({
        "ngrok-skip-browser-warning": "620",
      }),
    }).then(d => d.json());
    return tableData;
  },

  async getTables(): Promise<AppTable[]> {
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
          "ngrok-skip-browser-warning": "620",
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

  async getDataFlow(): Promise<vis.Edge[]> {
    const depsResp = await fetch(apiUrl + "/deps/list/", {
      headers: new Headers({
        "ngrok-skip-browser-warning": "6920",
      }),
    });
    const deps = await depsResp.json() as [string, string[]];

    const formatted = [] as vis.Edge[];

    for (const [target, depsList] of Object.entries(deps)) {
      if (depsList.length > 0) {
        for (const dep of depsList) formatted.push({ from: dep, to: target });
      }
    }

    return formatted;
  },

  async addNewTable(prompt: string) {
    const controller = new AbortController();

    const promptResp = await fetchTimeout(apiUrl + "/table/add", 60000, {
      signal: controller.signal,
      method: "POST",
      // mode: "cors",
      headers: new Headers({
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "6920",
      }),
      body: JSON.stringify({ prompt }),
    });
    const resp = await promptResp.json() as { query: string, tableName: string };

    console.log(resp);

    const parser = new Parser();
    const { tableList, columnList, ast }  = parser.parse(resp.query);

    const edges = [];
    for (let tableStr of tableList) {
      if (tableStr == resp.tableName) continue;
      tableStr = tableStr.split("::")[tableStr.split("::").length - 1];
      edges.push({ from: tableStr, to: resp.tableName });
    }

    return { edges, tableName: resp.tableName };
  },

  // Testing
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
