<template>
	<fieldset class="horizontal-fieldset">
		<legend>Axis of Rotation:</legend>
		<label>
			<input type="radio" value="x" v-model="axisOfRotation" @change="recalculate">
			X
		</label>
		<label>
			<input type="radio" value="y" v-model="axisOfRotation" @change="recalculate">
			Y
		</label>
		<label>
			<input type="radio" value="z" v-model="axisOfRotation" @change="recalculate">
			Z
		</label>
	</fieldset>

	<label>
		Horizontal Resolution (px/mm):
		<input type="number" v-model="hRes" @change="recalculate">
	</label>
	<label>
		Vertical Resolution (px/mm):
		<input type="number" v-model="vRes" @change="recalculate">
	</label>
	<label>
		Arc (degrees):
		<input type="number" min="0" max="360" v-model="arc" @change="recalculate">
	</label>

	<label>
		Inner Width (mm):
		<input type="number" disabled :value="width">
	</label>
	<label>
		Inner Depth (mm):
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
import { defineComponent, PropType } from "vue";

type Axis = "x"|"y"|"z";

export default defineComponent({
	"props": {
		"imageWidth": { "type": Number as PropType<number> },
		"imageHeight": { "type": Number as PropType<number> },
	},
	data() {
		return {
			"axisOfRotation": "z" as Axis,
			"hRes": 0.1,
			"vRes": 0.1,
			"arc": 120,
		};
	},
	activated(): void {
		this.recalculate();
	},
	"computed": {
		firstAxis(): Axis {
			return ({
				"x": "y",
				"y": "z",
				"z": "x",
			} as const)[this.axisOfRotation];
		},
		secondAxis(): Axis {
			return ({
				"x": "z",
				"y": "x",
				"z": "y",
			} as const)[this.axisOfRotation];
		},
		width(): number|null {
			return this.imageWidth ? (this.imageWidth - 1) * this.hRes : null;
		},
		height(): number|null {
			return this.imageHeight ? (this.imageHeight - 1) * this.vRes : null;
		},
	},
	"methods": {
		recalculate(): void {
			const expr = {
				"x": "",
				"y": "",
				"z": "",
			};
			// 180 degree
			// sin(x/(w-1)*pi)*w/pi/10
			// -cos(x/(w-1)*pi)*w/pi/10
			// (h-y-1)/10
			//
			// 120 degree TODO offset to YZ plane
			// sin(x/(w-1)*pi*2/3 + pi/6)*w/pi/10
			// -cos(x/(w-1)*pi*2/3 + pi/6)*w/pi/10
			// (h-y-1)/10
			expr[this.firstAxis] = `x/${1 / this.hRes}`;
			expr[this.secondAxis] = `x/${1 / this.hRes}`;
			expr[this.axisOfRotation] = `(h-y-1)/${1 / this.vRes}`;
			this.$emit("update:xExpression", expr.x);
			this.$emit("update:yExpression", expr.y);
			this.$emit("update:zExpression", expr.z);
		},
	},
	"emits": [
		"update:xExpression",
		"update:yExpression",
		"update:zExpression",
	],
});
</script>
