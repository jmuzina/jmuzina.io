import type { Config } from "tailwindcss";

const COLOR_SEMANTICS = {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: {
        DEFAULT: 'var(--primary)',
        foreground: 'var(--primary-foreground)',
    },
    secondary: {
        DEFAULT: 'var(--secondary)',
        foreground: 'var(--secondary-foreground)',
    },
    muted: {
        DEFAULT: 'var(--muted)',
        foreground: 'var(--muted-foreground)',
    },
    accent: {
        DEFAULT: 'var(--accent)',
        foreground: 'var(--accent-foreground)',
    },
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    neutral: 'var(--neutral)',
    surface: 'var(--surface)',
    'warm-gray': 'var(--warm-gray)',
    sage: 'var(--sage)',
    coral: 'var(--coral)',
    'soft-blue': 'var(--soft-blue)',
}

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: COLOR_SEMANTICS
        },
    },
    plugins: [],
} satisfies Config;