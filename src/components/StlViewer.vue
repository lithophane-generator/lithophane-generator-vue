<template>
	<ModelStl
		:src="stlUri"
		:position="{ x: 0, y: 0, z: 0 }"
		:rotation="{ x: -Math.PI/2, y: 0, z: 0 }"
		:cameraPosition="{ x: 20, y: 20, z: 20}"
		:cameraRotation="{ x: Math.PI/4, y: Math.PI/4, z: Math.PI/4 }"
		backgroundColor="#555555"
	/>
</template>

<style scoped lang="scss">
</style>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ModelStl } from "vue-3d-model";

export default defineComponent({
	"components": {
		ModelStl,
	},
	"props": {
		"stl": { "type": Uint8Array as PropType<Uint8Array>, "required": true },
	},
	data() {
		return {
			"wasm": null as typeof import("lithophane_creator_wasm/lithophane_creator")|null,
		};
	},
	"computed": {
		stlUri(): string|null {
			return URL.createObjectURL(new Blob([this.stl], { "type": "application/sla" }));
		},
	},
});
</script>
