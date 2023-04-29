<template>
	<div class="stl-viewer">
		<Renderer orbitCtrl resize>
			<Camera :position="{ x: 20, y: 20, z: 20 }"/>
			<Scene background="#000000">
				<PointLight color="#ffffff" :position="{ x: 500000, y: 500000, z: 500000 }" :intensity=".25"/>
				<PointLight color="#ffffff" :position="{ x: 500000, y: -500000, z: 500000 }" :intensity=".25"/>
				<PointLight color="#ffffff" :position="{ x: -500000, y: 500000, z: 500000 }" :intensity=".25"/>
				<PointLight color="#ffffff" :position="{ x: -500000, y: -500000, z: 500000 }" :intensity=".25"/>
				<AmbientLight color="#202020"/>
				<StlMesh
					v-if="stlBuffer !== null"
					:key="[stlBuffer, color, doubleSided]"
					:model="stlBuffer"
					:color="color"
					:doubleSided="doubleSided"
				/>
				<AxesHelper :size="1000000"/>
			</Scene>
		</Renderer>
	</div>
</template>

<style scoped lang="scss">
</style>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Renderer, Camera, Scene, AmbientLight, PointLight } from "troisjs";
import AxesHelper from "./AxesHelper";
import StlMesh from "./StlMesh";
import { ColorRepresentation } from "three";
import { Vector3PropInterface } from "troisjs/src/core/Object3D";

export default defineComponent({
	"components": {
		Renderer,
		Camera,
		Scene,
		AmbientLight,
		PointLight,
		StlMesh,
		AxesHelper,
	},
	"props": {
		"stl": { "type": Object as PropType<Uint8Array|null> },
		"color": { "type": String as PropType<ColorRepresentation>, "default": "#ffffff" },
		"doubleSided": { "type": Boolean as PropType<boolean>, "default": false },
	},
	"computed": {
		stlBuffer(): ArrayBuffer|null {
			console.log(this.stl);
			return (typeof this.stl === "undefined" || this.stl === null)
				? null
				: this.stl.buffer.slice(this.stl.byteOffset, this.stl.byteLength + this.stl.byteOffset);
		},
	},
});
</script>
