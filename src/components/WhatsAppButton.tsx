import { useSettings } from '@/contexts/SettingsContext';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  
  // Get whatsapp number from contact_phone setting, strip non-digits
  const rawPhone = settings.contact_phone || '';
  const phone = rawPhone.replace(/[^0-9]/g, '');
  
  if (!phone) return null;

  const whatsappUrl = `https://wa.me/${phone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.13 6.742 3.046 9.376L1.054 31.29l6.164-1.96A15.903 15.903 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.606c-.39 1.1-1.932 2.014-3.182 2.28-.856.18-1.974.324-5.738-1.234-4.818-1.994-7.918-6.882-8.16-7.204-.232-.322-1.952-2.6-1.952-4.96s1.234-3.52 1.672-4.002c.438-.482.958-.602 1.278-.602.318 0 .638.004.916.016.294.014.688-.112 1.078.822.39.936 1.332 3.236 1.45 3.47.116.234.194.506.038.828-.156.322-.234.522-.468.806-.234.284-.49.632-.7.848-.234.234-.478.49-.206.962.272.472 1.214 2.002 2.606 3.244 1.79 1.596 3.298 2.09 3.77 2.324.472.234.748.194 1.024-.116.274-.312 1.18-1.376 1.496-1.848.314-.472.632-.39 1.068-.234.438.156 2.736 1.292 3.208 1.526.472.234.786.35.902.546.116.194.116 1.136-.274 2.236v-.002z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;
