import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@picocss/pico/css/pico.fluid.classless.css";

createApp(App).use(router).mount("body");
