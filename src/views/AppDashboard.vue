<template>
  <div id="dashboard">
    <div id="tables-view">
      <h1 style="padding: 1rem">Data Sources</h1>

      <p v-if="loadingTables" style="padding: 1rem;">Loading tables...</p>

      <Panel v-for="table in tables" :key="table.name" :header="table.name" class="table-panel animate__animated animate__zoomIn" :data-table-name="table.name">
        <template #icons>
          <AppButton class="p-panel-header-icon p-link mr-2" @click="showSchemaModal(table.name)">
            <span class="pi pi-info-circle"></span>
          </AppButton>
          <AppButton class="p-panel-header-icon p-link mr-2" @click="trainTable(table.name)">
            Train
          </AppButton>
          <!-- <Menu ref="menu" id="config_menu" :model="items" popup /> -->
        </template>
        <DataTable
          :value="table.data"
          tableStyle="max-width: 100%"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column v-for="col in columns[table.name]" :key="col" :field="col" :header="col"></Column>
        </DataTable>
      </Panel>
    </div>
    <div id="right-view">
      <div id="graph-container"></div>
      <Card id="add-table">
        <template #title>
          Add a new table
        </template>
        <template #content>
          <div class="prompt-suggestions-container">
            <div v-for="promptSuggestion in promptSuggestions" :key="promptSuggestion" @click="addTableWithPrompt(promptSuggestion)" class="prompt-suggestion">
              {{ promptSuggestion }}
            </div>
          </div>
          <AppTextarea rows="3" v-model="newTablePrompt" style="width: 100%" />
          <div style="text-align: right; margin-top: 0.5rem">
            <AppButton @click="addTable" :loading="addingTable" :disabled="newTablePrompt.length == 0">Add</AppButton>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <AppDialog v-model:visible="schemaModalVisible" modal header="Schema" :style="{ width: '50vw' }">
    <div v-if="selectedSchema == null">Loading schema details...</div>
    <div v-else>
      <JsonViewer :value="selectedSchema" />
      <!-- <div class="sql-code" v-if="selectedSchema.sql_code">{{ selectedSchema.sql_code }}</div> -->
    </div>
  </AppDialog>

  <AppDialog v-model:visible="trainModalVisible" modal header="Train" :style="{ width: '50vw' }">
    Select the field to train on using IntegratedML
    <Dropdown v-model="selectedColumn" :options="columns[selectedTable]" />

    <div style="text-align: center; padding-top: 1rem">
      <AppButton>Train</AppButton>
    </div>
  </AppDialog>

</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted, nextTick, watch } from "vue";
import { api, mockApi } from "../api";
import { firestoreApi } from "../api/firebase";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import Card from 'primevue/card';
import AppTextarea from 'primevue/textarea';
import AppButton from "primevue/button";
import AppDialog from 'primevue/dialog';
import Dropdown from "primevue/dropdown";
import { JsonViewer } from "vue3-json-viewer";
import type { AppTable } from "@/types";
import * as vis from "vis-network/standalone";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default defineComponent({
  name: "AppDashboard",

  components: {
    DataTable,
    Column,
    Panel,
    Card,
    AppTextarea,
    AppButton,
    AppDialog,
    Dropdown,
    JsonViewer
  },

  setup() {
    const tables = ref<AppTable[]>([]);

    const loadingTables = ref(false);
    const loadTables = async () => {
      loadingTables.value = true;
      // const tableData = await api.getTables();
      const tableData = await mockApi.getTables();
      loadingTables.value = false;

      tables.value.splice(0);
      tables.value.push(...tableData);
      tableNodeUpdater();
    };
    loadTables();
  
    const columns = computed(() => {
      const cols = {} as any;
      for (const table of tables.value) {
        cols[table.name] = Object.keys(table.data[0]);
      }
      return cols;
    });

    const nodes = new vis.DataSet<vis.Node>([]);

    const tableNodeUpdater = () => {
      for (const table of tables.value) {
        if (nodes.get(table.name) == null) {
          nodes.add(({ id: table.name, label: table.name }));
        }
      }
    };
    // watch(() => tables.value, () => {
    //   console.log("in watch");
    //   tableNodeUpdater();
    // });

    const edges = new vis.DataSet<vis.Edge>([]);

    const edgeUpdater = async () => {
      // const newEdges = await api.getDataFlow();
      // edges.add(newEdges);
    };
    edgeUpdater();

    const graphData = {
      nodes: nodes,
      edges: edges,
    };

    var options: vis.Options = {
      edges: {
        // smooth: {
        //   enabled: true,
        //   type: "cubicBezier",
        //   forceDirection: "horizontal",
        //   roundness: 0.4,
        // },
        arrows: {
          to: true
        }
      },
      nodes: {
        shape: "box",
      },
      // layout: {
      //   hierarchical: {
      //     direction: "LR",
      //   },
      // },
      autoResize: false,
      width: "100%",
      height: "400px",
      // physics: true,
    };

    const scrollToTable = (tableName: string) => {
      const elem = document.querySelector(`[data-table-name="${tableName}"]`);
      const container = document.getElementById("tables-view");
      container?.scroll({
        top: elem?.getBoundingClientRect().y,
        behavior: "smooth"
      });
    }

    onMounted(() => {      
      const container = document.getElementById("graph-container");
      if (container == null) throw new Error("container is null");
      const network = new vis.Network(container, graphData as any, options);

      network.on("click", (data) => {
        if (data.nodes.length) {
          const node: string = data.nodes[0];

          scrollToTable(node);
        }
      });
    });

    const promptSuggestions = ref([
      "Create a table named patient_test_1 with patients that are between 20 and 30 years old based on demographics and have a BMI between 20 and 25. It should contain SEQN, age, BMI, height and weight.",
      "Create a table named patient_test_2 with patients that are male and have a BMI between 20 and 25. The table should include any sports related survey answers. The table should have the following columns: SEQN, patient age, patient BMI and all sport survey answers."
    ]);

    const newTablePrompt = ref("");

    const addingTable = ref(false);

    const addTableWithPrompt = async (prompt: string) => {
      addingTable.value = true;
      // const addTableResp = await api.addNewTable(prompt);
      const tableData = mockApi.getNewTable();
      addingTable.value = false;

      // const tableData = await api.getTable(addTableResp.tableName);
      tables.value.push(tableData);
      tableNodeUpdater();

      edges.add([{ from: "Fetal Health Data", to: "Association Table"}, { from: "Heart Failure Data", to: "Association Table"}]);
      
      nextTick(() => scrollToTable(tableData.name));
    }

    const addTable = async () => {
      // addingTable.value = true;
      // await sleep(1000);
      // const table = api.getNewTable();
      // addingTable.value = false;

      // tables.value.push(table);
      // nodes.add({ id: table.name, label: table.name });
      
      // edges.add([
      //   { from: "P_UM", to: "P_PAQ"},
      //   { from: "P_UM", to: "P_MCQ"}
      // ] as vis.Edge[]);

      await addTableWithPrompt(newTablePrompt.value);
    };

    const schemaModalVisible = ref(false);
    const selectedSchema = ref<any>(null);
    const showSchemaModal = async (tableName: string) => {
      schemaModalVisible.value = true;
      selectedSchema.value = null;
      selectedSchema.value = await firestoreApi.getSchema(tableName);
    }

    const trainModalVisible = ref(false);
    const selectedTable = ref(""); 
    const selectedColumn = ref<any>(null);
    const trainTable = (table: string) => {
      trainModalVisible.value = true;
      selectedTable.value = table;
    };

    return {
      tables,
      loadingTables,
      columns,
      promptSuggestions,
      newTablePrompt,
      addTable,
      addingTable,
      schemaModalVisible,
      showSchemaModal,
      selectedSchema,
      addTableWithPrompt,
      trainModalVisible,
      selectedColumn,
      trainTable,
      selectedTable,
    };
  }
});
</script>

<style>
#dashboard {
  width: 100%;
  height: 100vh;

  display: flex;
  flex-direction: row;
}

#tables-view {
  width: 50%;
  overflow-y: scroll;
}

.table-panel {
  margin: 1rem;
}

#right-view {
  overflow-y: scroll;
  margin: 1rem;
  flex: 1;
}

#graph-container {
  background: var(--surface-0);
  border-radius: var(--border-radius);
}

#right-view .p-card .p-card-body {
  padding-bottom: 0.5rem;
}

#add-table {
  margin-top: 1rem;
}

.prompt-suggestions-container {
  margin-bottom: 0.5rem;
}

.prompt-suggestion {
  cursor: pointer;
  display: inline-block;
  background: var(--surface-100);
  border-radius: 10px;
  padding: 0.5rem;
  margin: 0.5rem;
}

.sql-code {
  font-family: monospace;
  padding: 1rem;
  margin: 1rem;
}
</style>
