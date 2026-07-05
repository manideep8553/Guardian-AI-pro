import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Palette, Bell, Shield, Key, Eye, EyeOff,
  Moon, Sun, Monitor, Save, AlertTriangle,
  Smartphone, Mail, Check,
  X, Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogTrigger, DialogFooter
} from '../components/ui/dialog';
import { cn } from '../lib/utils';
import { useToast } from '../components/ui/toast';

const settingsTabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account', icon: Key },
];

export function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const [general, setGeneral] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@guardianai.com',
    institution: 'Plant Operations - Zone A',
    bio: 'Senior Safety Officer responsible for industrial safety operations.',
  });

  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    fontSize: 16,
    reducedMotion: false,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    inApp: true,
    safetyAlerts: true,
    drillNotifications: true,
    achievementAlerts: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
    showOnlineStatus: true,
    shareSafetyStatus: true,
    showSafetyStats: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const showToast = (message: string) => {
    toast({ title: message, description: 'Your changes have been saved successfully.' });
  };

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <TabsList className="w-full sm:w-auto h-auto flex-wrap gap-1 bg-transparent p-0 mb-6">
            {settingsTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'gap-2 px-4 py-2 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border',
                  'transition-all'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        <TabsContent value="general" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Profile Information" description="Update your personal details" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={general.name} onChange={e => setGeneral(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={general.email} onChange={e => setGeneral(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Location / Zone</Label>
                  <Input id="institution" value={general.institution} onChange={e => setGeneral(prev => ({ ...prev, institution: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={general.bio} onChange={e => setGeneral(prev => ({ ...prev, bio: e.target.value }))} rows={3} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => { showToast('Profile updated'); }} className="gap-1.5">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Theme" description="Customize how the app looks" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {(['light', 'dark', 'system'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setAppearance(prev => ({ ...prev, theme }))}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all flex-1',
                        appearance.theme === theme
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      {theme === 'light' ? <Sun className="h-5 w-5" /> :
                       theme === 'dark' ? <Moon className="h-5 w-5" /> :
                       <Monitor className="h-5 w-5" />}
                      <div className="text-left">
                        <p className="text-sm font-medium capitalize">{theme}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {theme === 'light' ? 'Always light' : theme === 'dark' ? 'Always dark' : 'Follows system'}
                        </p>
                      </div>
                      {appearance.theme === theme && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Display" description="Adjust visual preferences" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Font Size: {appearance.fontSize}px</Label>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={24}
                    value={appearance.fontSize}
                    onChange={e => setAppearance(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                    className="w-full h-1.5 accent-primary rounded-full appearance-none bg-muted cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Aa</span>
                    <span>Aa</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    checked={appearance.reducedMotion}
                    onCheckedChange={v => setAppearance(prev => ({ ...prev, reducedMotion: v }))}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => showToast('Appearance saved')} className="gap-1.5">
                    <Save className="h-4 w-4" /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Notification Preferences" description="Control how you receive notifications" />
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                  { id: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device', icon: Smartphone },
                  { id: 'inApp', label: 'In-App Notifications', description: 'Show notifications within the app', icon: Bell },
                  { id: 'safetyAlerts', label: 'Safety Alerts', description: 'Get alerted about safety incidents and hazards', icon: Volume2 },
                  { id: 'drillNotifications', label: 'Drill Notifications', description: 'Notify when emergency drills are scheduled', icon: User },
                  { id: 'achievementAlerts', label: 'Achievement Alerts', description: 'Celebrate when you unlock safety badges', icon: Check },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-md bg-muted mt-0.5">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm">{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.id as keyof typeof notifications]}
                      onCheckedChange={v => setNotifications(prev => ({ ...prev, [item.id]: v }))}
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-3">
                  <Button onClick={() => showToast('Notification preferences saved')} className="gap-1.5">
                    <Save className="h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Profile Visibility" description="Control who can see your profile" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {(['public', 'friends', 'private'] as const).map(vis => (
                    <button
                      key={vis}
                      onClick={() => setPrivacy(prev => ({ ...prev, profileVisibility: vis }))}
                      className={cn(
                        'flex-1 p-3 rounded-lg border-2 text-center transition-all',
                        privacy.profileVisibility === vis
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <p className="text-sm font-medium capitalize">{vis}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {vis === 'public' ? 'Everyone' : vis === 'friends' ? 'Team Members' : 'Only you'}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Activity & Status" description="Manage your online presence" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-xs text-muted-foreground">Let others see when you&apos;re online</p>
                  </div>
                  <Switch checked={privacy.showOnlineStatus} onCheckedChange={v => setPrivacy(prev => ({ ...prev, showOnlineStatus: v }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Safety Status</Label>
                    <p className="text-xs text-muted-foreground">Share your safety status on your profile</p>
                  </div>
                  <Switch checked={privacy.shareSafetyStatus} onCheckedChange={v => setPrivacy(prev => ({ ...prev, shareSafetyStatus: v }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Safety Stats</Label>
                    <p className="text-xs text-muted-foreground">Display your badges and safety metrics</p>
                  </div>
                  <Switch checked={privacy.showSafetyStats} onCheckedChange={v => setPrivacy(prev => ({ ...prev, showSafetyStats: v }))} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => showToast('Privacy settings saved')} className="gap-1.5">
                    <Save className="h-4 w-4" /> Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="account" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader title="Change Password" description="Update your account password" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (!passwordForm.current || !passwordForm.newPassword || !passwordForm.confirm) {
                        toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
                        return;
                      }
                      if (passwordForm.newPassword !== passwordForm.confirm) {
                        toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
                        return;
                      }
                      showToast('Password updated successfully');
                      setPasswordForm({ current: '', newPassword: '', confirm: '' });
                    }}
                    className="gap-1.5"
                  >
                    <Save className="h-4 w-4" /> Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/30">
              <CardHeader className="pb-3">
                <SectionHeader title="Danger Zone" description="Irreversible account actions" />
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-500">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Once you delete your account, all your data, safety logs, and incident reports will be permanently removed. This action cannot be undone.
                    </p>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="mt-3 gap-1.5">
                          <X className="h-4 w-4" /> Delete My Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account
                          </DialogTitle>
                          <DialogDescription>
                            This action is permanent and cannot be undone. All your data will be lost.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Are you absolutely sure you want to delete your account? Type <strong>DELETE</strong> to confirm.
                          </p>
                          <Input placeholder="Type DELETE to confirm" />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                          <Button variant="destructive">Delete Account</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
