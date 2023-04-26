<template>
	<header>
		<nav>
			<ul>
				<li><a href="/"><img class="logo" src="/Logo-128.png" alt="Logo"></a></li>
			</ul>
			<ul class="nav-links">
				<li>
					<router-link to="/">Home</router-link>
				</li>
				<li>
					<router-link to="/about">About</router-link>
				</li>
			</ul>
		</nav>
	</header>
	<main>
		<router-view v-slot="{ Component }">
			<keep-alive>
				<component :is="Component"/>
			</keep-alive>
		</router-view>
	</main>
	<!-- <footer></footer> -->
</template>

<style lang="scss">
	body label {
		display: flex;
		gap: .5em;
		align-items: center;
		input:not([type="checkbox"], [type="radio"]), select, textarea {
			flex: 1 1 0;
			width: 0;
			margin-bottom: 0
		}
		margin-bottom: var(--spacing);
	}
	.horizontal-fieldset {
		display: flex;
		align-items: center;
		gap: 1em;
		legend {
			display: inline;
			margin: 0;
			float: left; // https://bugzilla.mozilla.org/show_bug.cgi?id=1230207#c17
			margin-right: -.5em;
		}
		label {
			margin: 0;
			input[type="radio"] {
				margin-right: 0;
			}
		}
	}
</style>

<style lang="scss" scoped>
	header {
		margin-bottom: 1rem;
		padding: 0 1rem;
		background-color: rgba(0, 0, 0, .5);

		nav {
			.logo {
				height: 64px;
			}

			.nav-links {
				margin-right: auto;
			}
		}
	}
</style>
