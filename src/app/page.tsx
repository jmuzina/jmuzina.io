'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Theme Demo</h1>
          <ThemeToggle />
        </header>

        {/* Theme info */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">Current theme: <strong className="text-foreground">{theme}</strong></p>
        </div>

        {/* Theme demonstration */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Primary colors */}
          <div className="p-6 rounded-lg bg-primary text-primary-foreground">
            <h3 className="text-lg font-semibold mb-2">Primary</h3>
            <p>This uses the primary color scheme</p>
          </div>

          {/* Secondary colors */}
          <div className="p-6 rounded-lg bg-secondary text-secondary-foreground">
            <h3 className="text-lg font-semibold mb-2">Secondary</h3>
            <p>This uses the secondary color scheme</p>
          </div>

          {/* Accent colors */}
          <div className="p-6 rounded-lg bg-accent text-accent-foreground">
            <h3 className="text-lg font-semibold mb-2">Accent</h3>
            <p>This uses the accent color scheme</p>
          </div>

          {/* Muted colors */}
          <div className="p-6 rounded-lg bg-muted text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">Muted</h3>
            <p>This uses the muted color scheme</p>
          </div>

          {/* Border example */}
          <div className="p-6 rounded-lg border-2 border-border bg-background">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Bordered</h3>
            <p className="text-muted-foreground">This shows border colors</p>
          </div>

          {/* Input example */}
          <div className="p-6 rounded-lg bg-input border border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Input Style</h3>
            <input 
              type="text" 
              placeholder="Type something..." 
              className="w-full p-2 rounded bg-background text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Color palette showcase */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Color Palette</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { name: 'Neutral', color: 'var(--neutral)' },
              { name: 'Primary', color: 'var(--primary)' },
              { name: 'Secondary', color: 'var(--secondary)' },
              { name: 'Accent', color: 'var(--accent)' },
              { name: 'Surface', color: 'var(--surface)' }
            ].map((item) => (
              <div key={item.name} className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 border border-border" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-sm text-muted-foreground font-medium">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Extended palette */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Extended Palette</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: 'Warm Gray', color: 'var(--warm-gray)' },
              { name: 'Sage', color: 'var(--sage)' },
              { name: 'Coral', color: 'var(--coral)' },
              { name: 'Soft Blue', color: 'var(--soft-blue)' }
            ].map((item) => (
              <div key={item.name} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg mb-2 border border-border" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <p className="text-sm text-muted-foreground font-medium">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
