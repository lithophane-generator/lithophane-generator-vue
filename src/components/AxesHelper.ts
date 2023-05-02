import { AxesHelper } from "three";
import { Object3D } from "troisjs";
import { defineComponent } from "vue";

export default defineComponent({
	"extends": Object3D,
	"props": {
		"size": { "type": Number },
	},
	mounted() {
		const axesHelper = new AxesHelper(this.size);
		this.initObject3D(axesHelper);
	},
});
