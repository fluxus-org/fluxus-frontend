import "./assets/main.css";
import "animate.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import 'primeicons/primeicons.css';

import JsonViewer from "vue3-json-viewer";
// if you used v1.0.5 or latster ,you should add import "vue3-json-viewer/dist/index.css"
import "vue3-json-viewer/dist/index.css";

const app = createApp(App);

app.use(router);
app.use(PrimeVue);
app.use(JsonViewer);

app.mount("#app");
