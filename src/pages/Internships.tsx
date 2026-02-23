import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Internships = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', university: '', type: '', cover_letter: '' });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) { toast({ title: 'Please select internship type', variant: 'destructive' }); return; }
    setSubmitting(true);

    let cv_url = '';
    if (cvFile && user) {
      const ext = cvFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('cv-uploads').upload(path, cvFile);
      if (uploadErr) { toast({ title: 'CV upload failed', description: uploadErr.message, variant: 'destructive' }); setSubmitting(false); return; }
      cv_url = path;
    }

    const { error } = await supabase.from('internships').insert({
      ...form,
      cv_url,
      applicant_id: user?.id || null,
    });

    setSubmitting(false);
    if (error) { toast({ title: 'Submission failed', description: error.message, variant: 'destructive' }); }
    else { setSubmitted(true); toast({ title: 'Application submitted!', description: 'We will review your application and get back to you.' }); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="section-padding">
          <div className="container-max mx-auto text-center max-w-lg">
            <div className="w-20 h-20 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Application Received!</h2>
            <p className="font-body text-muted-foreground mb-6">Thank you for applying. Our team will review your application and contact you within 5 business days.</p>
            <Button onClick={() => { setSubmitted(false); setForm({ full_name: '', email: '', phone: '', university: '', type: '', cover_letter: '' }); setCvFile(null); }} variant="outline" className="font-body">Submit Another Application</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-navy py-20 px-4">
        <div className="container-max mx-auto text-center">
          <div className="gold-divider mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Internship Program</h1>
          <p className="font-body text-white/60 max-w-xl mx-auto">Join ESA Tours and gain hands-on experience in the tourism industry</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max mx-auto">
          {!settings.internship_open ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Internships Currently Closed</h2>
              <p className="font-body text-muted-foreground max-w-md mx-auto">We are not accepting internship applications at this time. Please check back later for updates.</p>
              <Button asChild variant="outline" className="mt-6 font-body">
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info cards - Benefits from admin settings */}
            <div className="space-y-4">
              {[
                { title: 'Student Internship', desc: 'For university students seeking practical experience in tourism management, operations, and hospitality.', icon: '🎓' },
                { title: 'Professional Internship', desc: 'For professionals looking to transition into the tourism sector or deepen their industry expertise.', icon: '💼' },
              ].map(item => (
                <div key={item.title} className="bg-card rounded-2xl p-6 shadow-card">
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
              {settings.internship_price > 0 && (
                <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
                  <h4 className="font-display text-base font-semibold text-foreground mb-2">Program Fee</h4>
                  <p className="font-body text-lg font-bold text-accent">${settings.internship_price} <span className="text-sm font-normal text-muted-foreground">one-time</span></p>
                </div>
              )}
              {settings.internship_price === 0 && (
                <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">
                  <h4 className="font-display text-base font-semibold text-foreground mb-2">Program Fee</h4>
                  <p className="font-body text-lg font-bold text-emerald-600">Free</p>
                  <p className="font-body text-sm text-muted-foreground mt-1">No cost to apply</p>
                </div>
              )}
              <div className="bg-muted/50 rounded-2xl p-6">
                <h4 className="font-display text-base font-semibold text-foreground mb-3">Why Apply? Benefits</h4>
                <div className="font-body text-sm text-muted-foreground whitespace-pre-line">
                  {settings.internship_benefits || '• Hands-on experience in tourism industry\n• Mentorship from industry professionals\n• Certificate upon completion\n• Networking opportunities'}
                </div>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6">
                <h4 className="font-display text-base font-semibold text-foreground mb-3">Application Process</h4>
                {['Submit your application', 'Team reviews within 5 days', 'Interview invitation', 'Offer & onboarding'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center shrink-0"><span className="text-navy text-xs font-bold">{i + 1}</span></div>
                    <span className="font-body text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Apply Now</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-sm">Full Name *</Label>
                      <Input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="font-body mt-1" maxLength={100} />
                    </div>
                    <div>
                      <Label className="font-body text-sm">Email *</Label>
                      <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="font-body mt-1" maxLength={255} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-sm">Phone</Label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="font-body mt-1" maxLength={20} />
                    </div>
                    <div>
                      <Label className="font-body text-sm">University/Institution</Label>
                      <Input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="font-body mt-1" maxLength={150} />
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-sm">Internship Type *</Label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student" className="font-body">Student Internship</SelectItem>
                        <SelectItem value="professional" className="font-body">Professional Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body text-sm">Cover Letter</Label>
                    <Textarea value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} placeholder="Tell us about yourself and why you want to join ESA Tours..." className="font-body mt-1 min-h-[120px]" maxLength={2000} />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Upload CV (PDF, max 5MB)</Label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('cv-input')?.click()}>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="font-body text-sm text-muted-foreground">{cvFile ? cvFile.name : 'Click to upload your CV'}</p>
                      <input id="cv-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 5 * 1024 * 1024) setCvFile(f); else if (f) toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' }); }} />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body h-12">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  {!user && <p className="font-body text-xs text-muted-foreground text-center">You can apply without an account. Create one to track your application status.</p>}
                </form>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Internships;
