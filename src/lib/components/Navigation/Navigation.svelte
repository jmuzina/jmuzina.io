<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
</script>

<AppBar class="bg-brand-light dark:bg-brand-dark">
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto] justify-between flex">
		<AppBar.Lead>
			<AppBar.Headline>
				<a class="text-fg-brand text-xl flex items-center gap-2" href="/">
					<!--					<HouseIcon class="inline align-baseline" />-->
					<h1>Julie Mužina</h1>
				</a>
			</AppBar.Headline>
		</AppBar.Lead>
		<AppBar.Trail>
			<!--			<Menu>-->
			<!--				&lt;!&ndash;				todo the trigger & really the whole menu is only needed on certain screen sizes otherwise we should find a way to just but the links that will go here right after the lead &ndash;&gt;-->
			<!--				<Menu.Trigger>-->
			<!--					<button class="btn-icon btn-icon-lg hover:preset-tonal" type="button">-->
			<!--						<MenuIcon />-->
			<!--					</button>-->
			<!--				</Menu.Trigger>-->
			<!--				<Portal>-->
			<!--					<Menu.Positioner>-->
			<!--						<Menu.Content>-->
			<!--							<Menu.Item value="about">-->
			<!--								<Menu.ItemText>About</Menu.ItemText>-->
			<!--							</Menu.Item>-->
			<!--							<Menu.Item value="projects">-->
			<!--								<Menu.ItemText>Projects</Menu.ItemText>-->
			<!--							</Menu.Item>-->
			<!--						</Menu.Content>-->
			<!--					</Menu.Positioner>-->
			<!--				</Portal>-->
			<!--			</Menu>-->
			<!--			<button class="btn-icon hover:preset-tonal" type="button">-->
			<!--				&lt;!&ndash;				todo maybe add a cmd+k menu or something similar &ndash;&gt;-->
			<!--				<Search class="size-6" />-->
			<!--			</button>-->
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
