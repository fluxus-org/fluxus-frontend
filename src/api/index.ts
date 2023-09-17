import type { AppTable } from "@/types";
import fetalHealth from "../mock-data/fetal-health.json";
import heartFailure from "../mock-data/heart-failure.json";

export const api = {
  getTables(): AppTable[] {
    return [
      {
        name: "Fetal Health Data",
        data: fetalHealth
      },
      {
        name: "Heart Failure Data",
        data: heartFailure
      },
    ];
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
