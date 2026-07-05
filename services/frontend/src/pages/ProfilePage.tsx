import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Clock, Target, Upload, Award,
  Activity, Edit3, Calendar, MapPin,
  Mail, Shield,
  CheckCircle, Star, Trophy, Zap, Crown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/dialog';
import { cn, getInitials, timeAgo } from '../lib/utils';

const weeklyData = [
  { day: 'Mon', score: 85 }, { day: 'Tue', score: 92 }, { day: 'Wed', score: 78 },
  { day: 'Thu', score: 95 }, { day: 'Fri', score: 88 }, { day: 'Sat', score: 90 },
  { day: 'Sun', score: 82 },
];

const achievements = [
  { title: '100 Days Safe', description: 'Maintained zero incidents for 100 consecutive days', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10', unlocked: true },
  { title: 'Perfect Inspection Record', description: 'Completed 50 inspections without a single miss', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10', unlocked: true },
  { title: 'Safety Streak', description: 'Maintained a 30-day safety streak', icon: Crown, color: 'text-blue-500', bg: 'bg-blue-500/10', unlocked: true },
  { title: 'Rapid Responder', description: 'Responded to 10 emergency alerts within 2 minutes', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', unlocked: true },
  { title: 'Compliance Champion', description: 'Passed all compliance audits for 6 months', icon: Award, color: 'text-pink-500', bg: 'bg-pink-500/10', unlocked: false },
  { title: 'Trainer Elite', description: 'Conducted 20 safety training sessions', icon: Shield, color: 'text-cyan-500', bg: 'bg-cyan-500/10', unlocked: false },
  { title: 'Night Watch', description: 'Completed night shift safety rounds for 14 days', icon: Star, color: 'text-indigo-500', bg: 'bg-indigo-500/10', unlocked: false },
  { title: 'Zero Harm', description: 'Achieved zero harm across all zones for a quarter', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10', unlocked: false },
];

const recentActivity = [
  { type: 'resolve', text: 'Resolved gas leak in Zone A', time: new Date(Date.now() - 1800000).toISOString(), icon: Shield },
  { type: 'achieve', text: 'Unlocked "100 Days Safe" achievement', time: new Date(Date.now() - 7200000).toISOString(), icon: Trophy },
  { type: 'inspection', text: 'Completed safety inspection at Plant 2', time: new Date(Date.now() - 14400000).toISOString(), icon: CheckCircle },
  { type: 'drill', text: 'Participated in emergency evacuation drill', time: new Date(Date.now() - 28800000).toISOString(), icon: Activity },
  { type: 'report', text: 'Filed incident report for minor equipment malfunction', time: new Date(Date.now() - 57600000).toISOString(), icon: Upload },
  { type: 'training', text: 'Completed HAZMAT refresher certification', time: new Date(Date.now() - 115200000).toISOString(), icon: CheckCircle },
];

export function ProfilePage() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@guardianai.com',
    institution: 'Plant Operations - Zone A',
    bio: 'Senior Safety Officer with 8 years of experience in industrial safety management. Certified in HAZMAT handling, fire safety, and emergency response.',
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const saveProfile = () => {
    setProfile({ ...editForm });
    setShowEditDialog(false);
  };

  const statsCards = [
    { title: 'Total Hours On Duty', value: '1,420', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Safety Score', value: '96', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Incidents Resolved', value: '48', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Inspections Completed', value: '123', icon: Upload, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="h-36 sm:h-48 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 mb-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                  <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-2 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{profile.institution}</span>
                    </div>
                  </div>
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location / Zone</label>
                          <Input value={editForm.institution} onChange={e => setEditForm(prev => ({ ...prev, institution: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bio</label>
                          <Textarea value={editForm.bio} onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))} rows={4} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                        <Button onClick={saveProfile}>Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{profile.bio}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary" className="gap-1">
                    <Mail className="h-3 w-3" /> {profile.email}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" /> Joined Jan 2025
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="p-4 text-center">
                <div className={cn('p-2 rounded-lg inline-flex mb-2', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                This Week&apos;s Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {achievements.map((ach, i) => (
                  <motion.div
                    key={ach.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    className={cn(
                      'p-3 rounded-lg text-center transition-all',
                      ach.unlocked ? ach.bg : 'bg-muted/50'
                    )}
                  >
                    <ach.icon className={cn(
                      'h-6 w-6 mx-auto mb-1',
                      ach.unlocked ? ach.color : 'text-muted-foreground/40'
                    )} />
                    <p className={cn(
                      'text-[10px] font-medium leading-tight',
                      ach.unlocked ? '' : 'text-muted-foreground/60'
                    )}>
                      {ach.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.03 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    'p-1.5 rounded-md',
                    act.type === 'achieve' ? 'bg-amber-500/10' :
                    act.type === 'resolve' ? 'bg-blue-500/10' :
                    act.type === 'inspection' ? 'bg-emerald-500/10' :
                    act.type === 'report' ? 'bg-purple-500/10' :
                    'bg-muted'
                  )}>
                    <act.icon className={cn(
                      'h-4 w-4',
                      act.type === 'achieve' ? 'text-amber-500' :
                      act.type === 'resolve' ? 'text-blue-500' :
                      act.type === 'inspection' ? 'text-emerald-500' :
                      act.type === 'report' ? 'text-purple-500' :
                      'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{act.text}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(act.time)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
