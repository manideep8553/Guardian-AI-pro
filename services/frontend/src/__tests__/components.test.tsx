import { describe, it, expect } from 'vitest';

describe('UI Component Exports', () => {
  it('Button component should export correctly', async () => {
    const mod = await import('../components/ui/button');
    expect(mod.Button).toBeDefined();
    expect(mod.buttonVariants).toBeDefined();
  });

  it('Button should have all expected variants', async () => {
    const { buttonVariants } = await import('../components/ui/button');
    const variants = buttonVariants({ variant: 'default' });
    expect(variants).toContain('inline-flex');
    expect(variants).toContain('items-center');

    const variants_list = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    for (const v of variants_list) {
      const result = buttonVariants({ variant: v });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    }
  });

  it('Button should support all size variants', async () => {
    const { buttonVariants } = await import('../components/ui/button');
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    for (const size of sizes) {
      const result = buttonVariants({ size });
      expect(result).toBeTruthy();
    }
  });

  it('Badge component should export correctly', async () => {
    const mod = await import('../components/ui/badge');
    expect(mod.Badge).toBeDefined();
    expect(mod.badgeVariants).toBeDefined();
  });

  it('Badge should support all variant types', async () => {
    const { badgeVariants } = await import('../components/ui/badge');
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const;
    for (const v of variants) {
      const result = badgeVariants({ variant: v });
      expect(result).toBeTruthy();
    }
  });

  it('Card components should export correctly', async () => {
    const mod = await import('../components/ui/card');
    expect(mod.Card).toBeDefined();
    expect(mod.CardHeader).toBeDefined();
    expect(mod.CardTitle).toBeDefined();
    expect(mod.CardDescription).toBeDefined();
    expect(mod.CardContent).toBeDefined();
    expect(mod.CardFooter).toBeDefined();
  });

  it('Input should export correctly', async () => {
    const mod = await import('../components/ui/input');
    expect(mod.Input).toBeDefined();
  });

  it('Textarea should export correctly', async () => {
    const mod = await import('../components/ui/textarea');
    expect(mod.Textarea).toBeDefined();
  });

  it('Label should export correctly', async () => {
    const mod = await import('../components/ui/label');
    expect(mod.Label).toBeDefined();
  });

  it('Select components should export correctly', async () => {
    const mod = await import('../components/ui/select');
    expect(mod.Select).toBeDefined();
    expect(mod.SelectTrigger).toBeDefined();
    expect(mod.SelectValue).toBeDefined();
    expect(mod.SelectContent).toBeDefined();
    expect(mod.SelectItem).toBeDefined();
  });

  it('Tabs components should export correctly', async () => {
    const mod = await import('../components/ui/tabs');
    expect(mod.Tabs).toBeDefined();
    expect(mod.TabsList).toBeDefined();
    expect(mod.TabsTrigger).toBeDefined();
    expect(mod.TabsContent).toBeDefined();
  });

  it('Dialog components should export correctly', async () => {
    const mod = await import('../components/ui/dialog');
    expect(mod.Dialog).toBeDefined();
    expect(mod.DialogTrigger).toBeDefined();
    expect(mod.DialogContent).toBeDefined();
    expect(mod.DialogHeader).toBeDefined();
    expect(mod.DialogTitle).toBeDefined();
    expect(mod.DialogDescription).toBeDefined();
  });

  it('Toast should export correctly', async () => {
    const mod = await import('../components/ui/toast');
    expect(mod.Toast).toBeDefined();
    expect(mod.ToastProvider).toBeDefined();
  });

  it('Avatar should export correctly', async () => {
    const mod = await import('../components/ui/avatar');
    expect(mod.Avatar).toBeDefined();
    expect(mod.AvatarImage).toBeDefined();
    expect(mod.AvatarFallback).toBeDefined();
  });

  it('Skeleton should export correctly', async () => {
    const mod = await import('../components/ui/skeleton');
    expect(mod.Skeleton).toBeDefined();
  });

  it('Separator should export correctly', async () => {
    const mod = await import('../components/ui/separator');
    expect(mod.Separator).toBeDefined();
  });

  it('Switch should export correctly', async () => {
    const mod = await import('../components/ui/switch');
    expect(mod.Switch).toBeDefined();
  });

  it('Progress should export correctly', async () => {
    const mod = await import('../components/ui/progress');
    expect(mod.Progress).toBeDefined();
  });
});
