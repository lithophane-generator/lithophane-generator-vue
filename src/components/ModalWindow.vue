<template>
	<teleport :to="teleportTo" :disabled="noTeleport">
		<transition appear name="slide-fade">
			<dialog open>
				<article>
					<header>
						<h3><slot name="title"/></h3>
						<button type="button" class="btn-close-icon" aria-label="Close" @click="$emit('close')"></button>
					</header>
					<main><slot name="body"/></main>
					<footer><slot name="footer"><button type="button" class="btn-close" @click="$emit('close')">Close</button></slot></footer>
				</article>
			</dialog>
		</transition>
	</teleport>
</template>

<style scoped lang="scss">
dialog {
	--spacing: 0.5rem;
}

header button, footer button {
	margin-bottom: 0;
}

header, footer {
	display: flex;
	align-items: center;
}

header > * {
	margin-bottom: 0;
}

.btn-close-icon {
	width: 1em;
	height: 1em;
	margin-left: auto;
	background: no-repeat var(--icon-close) center;
	padding: 0;
	border: none;
}

.btn-close {
	width: unset;
	margin-left: auto;
}

.slide-fade-enter-active, .slide-fade-leave-active {
	transition: opacity .15s linear, transform .3s ease-out;
}
.slide-fade-enter-from, .slide-fade-leave-to {
	transform: translate(0, -25%);
	opacity: 0;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	"props": {
		"teleportTo": { "type": String, "default": "body" },
		"noTeleport": { "type": Boolean, "default": false },
	},
	"emits": [
		"close",
	],
});
</script>
