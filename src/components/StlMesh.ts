import { MeshStandardMaterial, ColorRepresentation, DoubleSide, FrontSide } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Mesh } from "troisjs";
import { defineComponent, PropType } from "vue";

export default defineComponent({
	"extends": Mesh,
	"props": {
		"model": { "type": ArrayBuffer, "required": true },
		"color": { "type": String as PropType<ColorRepresentation>, "default": "#ffffff" },
		"doubleSided": { "type": Boolean as PropType<boolean>, "default": false },
	},
	setup(props) {
		const loader = new STLLoader();
		const stl = loader.parse(props.model);

		return {
			"geometry": stl,
			"material": new MeshStandardMaterial({ "color": props.color, "side": props.doubleSided ? DoubleSide : FrontSide }),
		};
	},
});
