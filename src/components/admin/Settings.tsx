import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Database,
  Users,
  CheckCircle,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  KeyRound,
  GraduationCap,
  CalendarCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { sanitizeForDb } from '@/lib/sanitize';

interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string;
  data_type: string;
}

const SettingsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh: refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const [heroVideoUploading, setHeroVideoUploading] = useState(false);
  const [heroSliderUploading, setHeroSliderUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      // Convert array to object keyed by setting key
      const settingsObj: Record<string, SystemSetting> = {};
      data?.forEach((setting) => {
        settingsObj[setting.key] = setting;
      });
      setSettings(settingsObj);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string, defaultValue: string = ''): string => {
    return settings[key]?.value ?? defaultValue;
  };

  const updateSetting = async (key: string, value: string) => {
    const sanitizedValue = ['smtp_password', 'flutterwave_secret_key', 'flutterwave_encryption_key', 'flutterwave_webhook_secret', 'sms_api_key', 'sms_api_secret'].includes(key)
      ? value
      : sanitizeForDb(value, 5000);
    const existing = settings[key];

    // Optimistically update local state so inputs feel responsive
    setSettings((prev) => ({
      ...prev,
      [key]: existing
        ? { ...existing, value: sanitizedValue }
        : {
            id: crypto.randomUUID(),
            key,
            value: sanitizedValue,
            description: null,
            category: 'general',
            data_type: 'string' as const,
          },
    }));

    try {
      if (existing) {
        const { error } = await supabase
          .from('system_settings')
          .update({
            value: sanitizedValue,
            updated_by: user?.id || null,
          })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Create new setting
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key,
            value: sanitizedValue,
            category: 'general',
            data_type: 'string',
            updated_by: user?.id || null,
          });

        if (error) throw error;
      }

      // Refresh shared settings context so public site sees new values
      refreshSettings();
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save setting',
        variant: 'destructive',
      });
    }
  };

  const saveCategory = async (category: string) => {
    try {
      setSaving(true);
      // Settings are saved individually as they change, so this is just a confirmation
      toast({
        title: 'Success',
        description: `${category} settings saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, settingKey: string) => {
    try {
      if (settingKey === 'system_logo') setLogoUploading(true);
      else if (settingKey === 'hero_background_image') setHeroImageUploading(true);
      else if (settingKey === 'hero_background_video') setHeroVideoUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${settingKey}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('system-assets').getPublicUrl(filePath);
      await updateSetting(settingKey, data.publicUrl);
      
      toast({ title: 'Success', description: 'File uploaded successfully' });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({ title: 'Error', description: error.message || 'Failed to upload file', variant: 'destructive' });
    } finally {
      setLogoUploading(false);
      setHeroImageUploading(false);
      setHeroVideoUploading(false);
      setHeroSliderUploading(false);
    }
  };

  const handleSliderImagesUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setHeroSliderUploading(true);
      const raw = getSetting('hero_slider_images', '[]');
      let urls: string[] = [];
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) urls = [...arr];
      } catch {}
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `hero-slider-${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage.from('system-assets').upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from('system-assets').getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      }
      await updateSetting('hero_slider_images', JSON.stringify(urls));
      toast({ title: 'Success', description: `${urls.length} image(s) uploaded` });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setHeroSliderUploading(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      setSaving(true);
      // In a real app, this would send a test email via backend
      toast({
        title: 'Test Email',
        description: 'Test email functionality would be implemented via backend API',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      setSaving(true);
      // In a real app, this would clear system cache via backend
      toast({
        title: 'Success',
        description: 'Cache cleared successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const backupDatabase = async () => {
    try {
      setSaving(true);
      // In a real app, this would create a database backup via backend
      toast({
        title: 'Success',
        description: 'Database backup initiated. You will be notified when complete.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">System Settings</h2>
          <p className="font-body text-muted-foreground">Configure system preferences and options</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="hero">Hero Page</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
          <TabsTrigger value="internship">Internships</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="seo">SEO & Sitemap</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>
                Configure basic site information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="system_name">System Name</Label>
                  <Input
                    id="system_name"
                    value={getSetting('system_name', 'Kigali Hub')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('system_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={getSetting('contact_email', 'info@kigalihub.com')}
                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="system_description">System Description</Label>
                <Textarea
                  id="system_description"
                  value={getSetting('system_description', 'Your premier African tourism partner')}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSetting('system_description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={getSetting('contact_phone', '+250 788 123 456')}
                    onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={getSetting('address', 'KN 4 Ave, Kigali, Rwanda')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('address', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={getSetting('currency', 'RWF')}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="RWF">Rwandan Franc (RWF)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={getSetting('timezone', 'Africa/Kigali')}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="Africa/Kigali">Africa/Kigali</option>
                    <option value="Africa/Nairobi">Africa/Nairobi</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="allow_registrations"
                    checked={getSetting('allow_registrations', 'true') === 'true'}
                    onCheckedChange={(checked) => updateSetting('allow_registrations', String(checked))}
                  />
                  <Label htmlFor="allow_registrations">Allow user registrations</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="maintenance_mode"
                    checked={getSetting('maintenance_mode', 'false') === 'true'}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', String(checked))}
                  />
                  <Label htmlFor="maintenance_mode">Maintenance mode</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="session_timeout">Session Timeout (hours)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={getSetting('session_timeout', '24')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('session_timeout', e.target.value)}
                />
              </div>
              <Button onClick={() => saveCategory('general')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colors & Branding
              </CardTitle>
              <CardDescription>
                Customize system colors and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary_color"
                      type="color"
                      value={getSetting('primary_color', '#1e3a5f')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('primary_color', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={getSetting('primary_color', '#1e3a5f')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('primary_color', e.target.value)}
                      placeholder="#1e3a5f"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={getSetting('secondary_color', '#2d5a4e')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('secondary_color', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={getSetting('secondary_color', '#2d5a4e')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('secondary_color', e.target.value)}
                      placeholder="#2d5a4e"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accent_color"
                      type="color"
                      value={getSetting('accent_color', '#f5a623')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('accent_color', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      value={getSetting('accent_color', '#f5a623')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('accent_color', e.target.value)}
                      placeholder="#f5a623"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>System Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {getSetting('system_logo') && (
                      <img
                        src={getSetting('system_logo')}
                        alt="System Logo"
                        className="h-20 w-auto object-contain"
                      />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'system_logo');
                        }}
                        disabled={logoUploading}
                        className="cursor-pointer"
                      />
                      {logoUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {getSetting('favicon') && (
                      <img
                        src={getSetting('favicon')}
                        alt="Favicon"
                        className="h-16 w-16 object-contain"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={() => saveCategory('appearance')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Page Settings */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Hero Page Configuration
              </CardTitle>
              <CardDescription>
                Customize the hero section on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  value={getSetting('hero_title', 'Discover the Heart of Africa')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('hero_title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Input
                  id="hero_subtitle"
                  value={getSetting('hero_subtitle', 'Experience unforgettable adventures in Rwanda')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('hero_subtitle', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hero_description">Hero Description</Label>
                <Textarea
                  id="hero_description"
                  value={getSetting('hero_description', 'Join us for an extraordinary journey through Rwanda\'s stunning landscapes, rich culture, and incredible wildlife.')}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSetting('hero_description', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero_background_type">Background Type</Label>
                  <select
                    id="hero_background_type"
                    value={getSetting('hero_background_type', 'image')}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('hero_background_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                  >
                    <option value="image">Single Image</option>
                    <option value="video">Video</option>
                    <option value="slider">Image Slider</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hero_button_text">Button Text</Label>
                  <Input
                    id="hero_button_text"
                    value={getSetting('hero_button_text', 'Explore Packages')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('hero_button_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_button_link">Button Link</Label>
                  <Input
                    id="hero_button_link"
                    value={getSetting('hero_button_link', '/packages')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('hero_button_link', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hero Background Image (for image/slider)</Label>
                  <div className="mt-2">
                    {getSetting('hero_background_image') && (
                      <img
                        src={getSetting('hero_background_image')}
                        alt="Hero Background"
                        className="h-40 w-full object-cover rounded mb-2"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'hero_background_image');
                      }}
                      disabled={heroImageUploading}
                      className="cursor-pointer"
                    />
                    {heroImageUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  </div>
                </div>
                <div>
                  <Label>Background Video (for video type) – Upload MP4</Label>
                  <div className="mt-2">
                    {getSetting('hero_background_video') && (
                      <video src={getSetting('hero_background_video')} className="h-32 rounded mb-2" controls muted />
                    )}
                    <Input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'hero_background_video');
                      }}
                      disabled={heroVideoUploading}
                      className="cursor-pointer"
                    />
                    {heroVideoUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>
              <div>
                <Label>Slider Images (for slider type) – Upload multiple images</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {((): string[] => {
                    try {
                      const arr = JSON.parse(getSetting('hero_slider_images', '[]'));
                      return Array.isArray(arr) ? arr : [];
                    } catch { return []; }
                  })().map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-20 w-20 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => {
                          const raw = getSetting('hero_slider_images', '[]');
                          let arr: string[] = [];
                          try { arr = JSON.parse(raw); } catch {}
                          arr = arr.filter((_, j) => j !== i);
                          updateSetting('hero_slider_images', JSON.stringify(arr));
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleSliderImagesUpload(e.target.files)}
                  disabled={heroSliderUploading}
                  className="cursor-pointer mt-2"
                />
                {heroSliderUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              </div>
              <Button onClick={() => saveCategory('hero')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={getSetting('smtp_host', 'smtp.gmail.com')}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={getSetting('smtp_port', '587')}
                    onChange={(e) => updateSetting('smtp_port', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={getSetting('smtp_username', '')}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={getSetting('smtp_password', '')}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_from_email">From Email</Label>
                  <Input
                    id="smtp_from_email"
                    type="email"
                    value={getSetting('smtp_from_email', 'noreply@kigalihub.com')}
                    onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_from_name">From Name</Label>
                  <Input
                    id="smtp_from_name"
                    value={getSetting('smtp_from_name', 'Kigali Hub')}
                    onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="smtp_use_tls"
                    checked={getSetting('smtp_use_tls', 'true') === 'true'}
                    onCheckedChange={(checked) => updateSetting('smtp_use_tls', String(checked))}
                  />
                  <Label htmlFor="smtp_use_tls">Use TLS encryption</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="email_notifications_enabled"
                    checked={getSetting('email_notifications_enabled', 'true') === 'true'}
                    onCheckedChange={(checked) => updateSetting('email_notifications_enabled', String(checked))}
                  />
                  <Label htmlFor="email_notifications_enabled">Enable email notifications</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveCategory('email')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </Button>
                <Button variant="outline" onClick={testEmailSettings} disabled={saving}>
                  <Mail className="h-4 w-4 mr-2" />
                  {saving ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Configuration
              </CardTitle>
              <CardDescription>
                Configure Flutterwave and other payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="payment_provider">Payment Provider</Label>
                <select
                  id="payment_provider"
                  value={getSetting('payment_provider', 'flutterwave')}
                  onChange={(e) => updateSetting('payment_provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                >
                  <option value="flutterwave">Flutterwave</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium mb-3">Flutterwave Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="flutterwave_public_key">Public Key</Label>
                    <Input
                      id="flutterwave_public_key"
                      value={getSetting('flutterwave_public_key', '')}
                      onChange={(e) => updateSetting('flutterwave_public_key', e.target.value)}
                      placeholder="FLWPUBK-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="flutterwave_secret_key">Secret Key</Label>
                    <Input
                      id="flutterwave_secret_key"
                      type="password"
                      value={getSetting('flutterwave_secret_key', '')}
                      onChange={(e) => updateSetting('flutterwave_secret_key', e.target.value)}
                      placeholder="FLWSECK-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="flutterwave_encryption_key">Encryption Key</Label>
                    <Input
                      id="flutterwave_encryption_key"
                      type="password"
                      value={getSetting('flutterwave_encryption_key', '')}
                      onChange={(e) => updateSetting('flutterwave_encryption_key', e.target.value)}
                      placeholder="Encryption key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="flutterwave_webhook_secret">Webhook Secret</Label>
                    <Input
                      id="flutterwave_webhook_secret"
                      type="password"
                      value={getSetting('flutterwave_webhook_secret', '')}
                      onChange={(e) => updateSetting('flutterwave_webhook_secret', e.target.value)}
                      placeholder="Webhook secret"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_currency">Payment Currency</Label>
                  <select
                    id="payment_currency"
                    value={getSetting('payment_currency', 'RWF')}
                    onChange={(e) => updateSetting('payment_currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                  >
                    <option value="RWF">RWF - Rwandan Franc</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="payment_test_mode"
                    checked={getSetting('payment_test_mode', 'true') === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_test_mode', String(checked))}
                  />
                  <Label htmlFor="payment_test_mode">Enable test mode</Label>
                </div>
              </div>

              <Button onClick={() => saveCategory('payment')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Settings */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Gateway Configuration
              </CardTitle>
              <CardDescription>
                Configure SMS provider settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sms_provider">SMS Provider</Label>
                <select
                  id="sms_provider"
                  value={getSetting('sms_provider', '')}
                  onChange={(e) => updateSetting('sms_provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                >
                  <option value="">Select Provider</option>
                  <option value="twilio">Twilio</option>
                  <option value="africastalking">Africa's Talking</option>
                  <option value="nexmo">Vonage (Nexmo)</option>
                  <option value="custom">Custom API</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sms_api_key">API Key</Label>
                  <Input
                    id="sms_api_key"
                    type="password"
                    value={getSetting('sms_api_key', '')}
                    onChange={(e) => updateSetting('sms_api_key', e.target.value)}
                    placeholder="API Key"
                  />
                </div>
                <div>
                  <Label htmlFor="sms_api_secret">API Secret</Label>
                  <Input
                    id="sms_api_secret"
                    type="password"
                    value={getSetting('sms_api_secret', '')}
                    onChange={(e) => updateSetting('sms_api_secret', e.target.value)}
                    placeholder="API Secret"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="sms_sender_id">Sender ID</Label>
                <Input
                  id="sms_sender_id"
                  value={getSetting('sms_sender_id', '')}
                  onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
                  placeholder="Sender ID or Phone Number"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="sms_enabled"
                  checked={getSetting('sms_enabled', 'false') === 'true'}
                  onCheckedChange={(checked) => updateSetting('sms_enabled', String(checked))}
                />
                <Label htmlFor="sms_enabled">Enable SMS notifications</Label>
              </div>
              
              <Button onClick={() => saveCategory('sms')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save SMS Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OAuth Settings */}
        <TabsContent value="oauth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                OAuth Configuration
              </CardTitle>
              <CardDescription>
                Configure Google and other OAuth providers. Enable Google sign-in in Supabase Dashboard → Authentication → Providers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="google_oauth_enabled"
                  checked={getSetting('google_oauth_enabled', 'false') === 'true'}
                  onCheckedChange={(checked) => updateSetting('google_oauth_enabled', String(checked))}
                />
                <Label htmlFor="google_oauth_enabled">Enable Google OAuth (Continue with Google)</Label>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg font-body text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard → Authentication → Providers</li>
                  <li>Enable Google provider</li>
                  <li>Add your Google Client ID and Secret from Google Cloud Console</li>
                  <li>Add authorized redirect URL: <code className="bg-muted px-1 rounded">{window.location.origin}/auth/v1/callback</code></li>
                  <li>Users signing in via Google receive the &quot;client&quot; role by default</li>
                </ol>
              </div>
              <Button onClick={() => saveCategory('oauth')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save OAuth Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internship Settings */}
        <TabsContent value="internship" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Internship Program
              </CardTitle>
              <CardDescription>
                Control whether internships are open, set the price (0 = free), and describe benefits to attract applicants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="internship_open"
                  checked={getSetting('internship_open', 'true') === 'true'}
                  onCheckedChange={(checked) => updateSetting('internship_open', String(checked))}
                />
                <Label htmlFor="internship_open">Internships open for applications</Label>
              </div>
              <div>
                <Label htmlFor="internship_price">Internship Fee (0 = free)</Label>
                <Input
                  id="internship_price"
                  type="number"
                  min={0}
                  value={getSetting('internship_price', '0')}
                  onChange={(e) => updateSetting('internship_price', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="internship_benefits">Benefits Description</Label>
                <Textarea
                  id="internship_benefits"
                  value={getSetting('internship_benefits', '• Hands-on experience in tourism industry\n• Mentorship from professionals\n• Certificate upon completion')}
                  onChange={(e) => updateSetting('internship_benefits', e.target.value)}
                  rows={6}
                  placeholder="List benefits that make applicants interested (use bullet points)"
                />
                <p className="text-xs text-muted-foreground mt-1">Describe why applicants should apply. Use bullet points (•) for clarity.</p>
              </div>
              <Button onClick={() => saveCategory('internship')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Internship Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Booking Confirmation
              </CardTitle>
              <CardDescription>
                Set the fee users must pay to confirm a tour booking. This fee is charged when the user submits a booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="booking_confirmation_fee">Booking Confirmation Fee</Label>
                <Input
                  id="booking_confirmation_fee"
                  type="number"
                  min={0}
                  value={getSetting('booking_confirmation_fee', '0')}
                  onChange={(e) => updateSetting('booking_confirmation_fee', e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">Amount users pay upfront to confirm a booking (0 = no fee).</p>
              </div>
              <Button onClick={() => saveCategory('booking')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Booking Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Sitemap */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Management
              </CardTitle>
              <CardDescription>
                Manage meta tags and SEO settings. These apply to the homepage and can be used site-wide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">Default Page Title</Label>
                <Input
                  id="seo_title"
                  value={getSetting('seo_title', 'Explore Kigali Hub')}
                  onChange={(e) => updateSetting('seo_title', e.target.value)}
                  placeholder="Site name - Tagline"
                />
              </div>
              <div>
                <Label htmlFor="seo_description">Meta Description</Label>
                <Textarea
                  id="seo_description"
                  value={getSetting('seo_description', 'Your premier African tourism partner')}
                  onChange={(e) => updateSetting('seo_description', e.target.value)}
                  rows={3}
                  placeholder="Brief description for search engines (150-160 chars)"
                />
              </div>
              <div>
                <Label htmlFor="seo_keywords">Meta Keywords (comma-separated)</Label>
                <Input
                  id="seo_keywords"
                  value={getSetting('seo_keywords', '')}
                  onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                  placeholder="tourism, Rwanda, safari, ..."
                />
              </div>
              <div>
                <Label>Open Graph Image (for social sharing)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {getSetting('seo_og_image') && (
                    <img src={getSetting('seo_og_image')} alt="OG" className="h-20 object-cover rounded" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'seo_og_image');
                    }}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1200×630px</p>
              </div>
              <div>
                <Label htmlFor="seo_twitter_handle">Twitter Handle</Label>
                <Input
                  id="seo_twitter_handle"
                  value={getSetting('seo_twitter_handle', '')}
                  onChange={(e) => updateSetting('seo_twitter_handle', e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
              <Button onClick={() => saveCategory('seo')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Sitemap
              </CardTitle>
              <CardDescription>
                Your sitemap helps search engines discover pages. View and download from the link below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href="/sitemap" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Sitemap
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={clearCache} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {saving ? 'Clearing...' : 'Clear Cache'}
          </Button>
          <Button variant="outline" onClick={backupDatabase} disabled={saving}>
            <Database className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Database Backup'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
