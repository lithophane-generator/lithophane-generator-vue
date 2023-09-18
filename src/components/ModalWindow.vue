<template>
	<teleport :to="teleportTo" :disabled="noTeleport">
		<transition appear name="modal-slide-fade">
			<dialog open v-if="show">
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

.modal-slide-fade-enter-active, .modal-slide-fade-leave-active {
	transition: opacity .3s linear, transform .3s ease-out;
	article {
		transition: inherit;
	}
}
.modal-slide-fade-enter-from, .modal-slide-fade-leave-to {
	opacity: 0;
	article {
		transform: translate(0, -25%);
	}
}
</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	"props": {
		"teleportTo": { "type": String, "default": "body" },
		"noTeleport": { "type": Boolean, "default": false },
		"show": { "type": Boolean, "default": false },
	},
	"emits": [
		"close",
	],
});
</script>
