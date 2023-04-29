import "@picocss/pico/css/pico.fluid.classless.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Object3D, Vector3 } from "three";

Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

createApp(App).use(router).mount("body");
