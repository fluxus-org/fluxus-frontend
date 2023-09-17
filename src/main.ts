import "./assets/main.css";
import "animate.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";

const app = createApp(App);

app.use(PrimeVue);

app.use(router);

app.mount("#app");
