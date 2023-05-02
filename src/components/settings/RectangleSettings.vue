<template>
	<fieldset class="horizontal-fieldset">
		<legend>Plane:</legend>
		<label>
			<input type="radio" value="xy" v-model="plane" @input="recalculate" @focusout="$emit('updatePreview')">
			XY
		</label>
		<label>
			<input type="radio" value="xz" v-model="plane" @input="recalculate" @focusout="$emit('updatePreview')">
			XZ
		</label>
		<label>
			<input type="radio" value="yz" v-model="plane" @input="recalculate" @focusout="$emit('updatePreview')">
			YZ
		</label>
	</fieldset>

	<label>
		Horizontal Resolution (mm/px):
		<input type="number" v-model="hRes" @input="recalculate">
	</label>
	<label>
		Vertical Resolution (mm/px):
		<input type="number" v-model="vRes" @input="recalculate">
	</label>

	<label>
		Width (mm):
		<input type="number" disabled :value="width">
	</label>
	<label>
		Height (mm):
		<input type="number" disabled :value="height">
	</label>
</template>

<style scoped lang="scss">
</style>

<script lang="ts">
import { round } from "@/util";
import { defineComponent, PropType } from "vue";

type Axis = "x"|"y"|"z";
type Plane = "xy"|"xz"|"yz";

export default defineComponent({
	"props": {
		"imageWidth": { "type": Number as PropType<number> },
		"imageHeight": { "type": Number as PropType<number> },
	},
	data() {
		return {
			"plane": "yz" as Plane,
			"hRes": 0.1,
			"vRes": 0.1,
		};
	},
	activated(): void {
		this.recalculate();
	},
	"computed": {
		imgXAxis(): Axis {
			return ({
				"xy": "x",
				"xz": "x",
				"yz": "y",
			} as const)[this.plane];
		},
		imgYAxis(): Axis {
			return ({
				"xy": "y",
				"xz": "z",
				"yz": "z",
			} as const)[this.plane];
		},
		imgDepthAxis(): Axis {
			return ({
				"xy": "z",
				"xz": "y",
				"yz": "x",
			} as const)[this.plane];
		},
		width(): number|null {
			return this.imageWidth ? round((this.imageWidth - 1) * this.hRes, 4) : null;
		},
		height(): number|null {
			return this.imageHeight ? round((this.imageHeight - 1) * this.vRes, 4) : null;
		},
	},
	"methods": {
		recalculate(): void {
			const expr = {
				"x": "",
				"y": "",
				"z": "",
			};
			expr[this.imgDepthAxis] = "0";
			expr[this.imgXAxis] = `x/${1 / this.hRes}`;
			expr[this.imgYAxis] = `(h-y-1)/${1 / this.vRes}`;
			this.$emit("update:xExpression", expr.x);
			this.$emit("update:yExpression", expr.y);
			this.$emit("update:zExpression", expr.z);
		},
	},
	"emits": [
		"update:xExpression",
		"update:yExpression",
		"update:zExpression",
		"updatePreview",
	],
});
</script>
