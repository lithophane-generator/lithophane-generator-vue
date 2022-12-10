<template>
	<nav class="navbar navbar-dark navbar-expand-md bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/"><img src="/Logo-128.png" alt="Logo" height="64"></a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-nav" aria-controls="navbar-nav" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbar-nav">
				<ul class="navbar-nav">
					<li class="nav-item">
						<router-link to="/" class="nav-link">Home</router-link>
					</li>
					<li class="nav-item">
						<router-link to="/about" class="nav-link">About</router-link>
					</li>
				</ul>
			</div>
		</div>
	</nav>
	<router-view/>
</template>

<style lang="scss">
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}
</style>

<style lang="scss" scoped>
	nav {
		margin-bottom: 1rem;
	}
</style>
