import 'vitest/browser';

// Custom commands registered in vitest.config.client.ts
declare module 'vitest/browser' {
	interface BrowserCommands {
		emulateColorScheme: (colorScheme: 'light' | 'dark') => Promise<void>;
	}
}
