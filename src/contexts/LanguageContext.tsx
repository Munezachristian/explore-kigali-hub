import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr' | 'rw' | 'sw';

interface Translations {
  [key: string]: { en: string; fr: string; rw: string; sw: string };
}

const translations: Translations = {
  'nav.home': { en: 'Home', fr: 'Accueil', rw: 'Ahabanza', sw: 'Nyumbani' },
  'nav.packages': { en: 'Packages', fr: 'Forfaits', rw: 'Amasezerano', sw: 'Vifurushi' },
  'nav.blog': { en: 'Blog', fr: 'Blog', rw: 'Ibitekerezo', sw: 'Blogu' },
  'nav.gallery': { en: 'Gallery', fr: 'Galerie', rw: 'Amashusho', sw: 'Matunzio' },
  'nav.internships': { en: 'Internships', fr: 'Stages', rw: 'Amahugurwa', sw: 'Mafunzo' },
  'nav.info': { en: 'Info Center', fr: 'Centre d\'Info', rw: 'Amakuru', sw: 'Habari' },
  'nav.contact': { en: 'Contact', fr: 'Contact', rw: 'Tumanahane', sw: 'Wasiliana' },
  'hero.title': { en: 'Discover Rwanda & Beyond', fr: 'Découvrez le Rwanda et Au-delà', rw: 'Menya u Rwanda n\'Ahandi', sw: 'Gundua Rwanda na Zaidi' },
  'hero.subtitle': { en: 'Premium African Tourism Experiences', fr: 'Expériences Touristiques Africaines Premium', rw: 'Ubutalii bw\'Agaciro mu Afurika', sw: 'Uzoefu wa Utalii wa Hali ya Juu wa Afrika' },
  'hero.cta': { en: 'Explore Packages', fr: 'Explorer les Forfaits', rw: 'Reba Amasezerano', sw: 'Chunguza Vifurushi' },
  'hero.book': { en: 'Book Now', fr: 'Réserver', rw: 'Saba Ubu', sw: 'Weka Nafasi' },
  'packages.title': { en: 'Featured Packages', fr: 'Forfaits en Vedette', rw: 'Amasezerano Yihariye', sw: 'Vifurushi Vilivyoangaziwa' },
  'packages.from': { en: 'From', fr: 'À partir de', rw: 'Uhereye', sw: 'Kutoka' },
  'packages.book': { en: 'Book This Package', fr: 'Réserver ce Forfait', rw: 'Saba Iki Gisezerano', sw: 'Weka Nafasi ya Kifurushi Hiki' },
  'testimonials.title': { en: 'What Our Clients Say', fr: 'Ce que disent nos clients', rw: 'Abagezi Bacu Bavuga Iki', sw: 'Wateja Wetu Wanasema Nini' },
  'blog.title': { en: 'Travel Insights', fr: 'Conseils de Voyage', rw: 'Inama z\'Urugendo', sw: 'Maarifa ya Safari' },
  'gallery.title': { en: 'Our Gallery', fr: 'Notre Galerie', rw: 'Amashusho Yacu', sw: 'Matunzio Yetu' },
  'info.title': { en: 'Travel Information', fr: 'Informations de Voyage', rw: 'Amakuru y\'Urugendo', sw: 'Taarifa za Safari' },
  'footer.newsletter': { en: 'Subscribe to our newsletter', fr: 'Abonnez-vous à notre newsletter', rw: 'Iyandikishe ku makuru yacu', sw: 'Jiandikishe kwa jarida letu' },
  'login': { en: 'Login', fr: 'Connexion', rw: 'Injira', sw: 'Ingia' },
  'register': { en: 'Register', fr: "S'inscrire", rw: 'Iyandikishe', sw: 'Jiandikishe' },
  'dashboard': { en: 'Dashboard', fr: 'Tableau de Bord', rw: 'Ikibaho', sw: 'Dashibodi' },
  'dash.viewSite': { en: 'View Site', fr: 'Voir le site', rw: 'Reba urubuga', sw: 'Angalia Tovuti' },
  'dash.signOut': { en: 'Sign Out', fr: 'Déconnexion', rw: 'Sozamo', sw: 'Ondoka' },
  'dash.packages': { en: 'Packages', fr: 'Forfaits', rw: 'Amasezerano', sw: 'Vifurushi' },
  'dash.bookings': { en: 'Bookings', fr: 'Réservations', rw: 'Gahunda', sw: 'Matumizi' },
  'dash.payments': { en: 'Payments', fr: 'Paiements', rw: 'Amafaranga', sw: 'Malipo' },
  'dash.reports': { en: 'Reports', fr: 'Rapports', rw: 'Raporisi', sw: 'Ripoti' },
  'dash.expenses': { en: 'Expenses', fr: 'Dépenses', rw: 'Amafaranga yasohotse', sw: 'Gharama' },
  'dash.incomes': { en: 'Incomes', fr: 'Revenus', rw: 'Amafaranga yinjira', sw: 'Mapato' },
  'dash.salaries': { en: 'Salaries', fr: 'Salaires', rw: 'Amafaranga y\'abakozi', sw: 'Mishahara' },
  'dash.confirmedBookings': { en: 'Confirmed Bookings', fr: 'Réservations confirmées', rw: 'Gahunda zemewe', sw: 'Matumizi yaliyothibitishwa' },
  'dash.totalRevenue': { en: 'Total Revenue', fr: 'Revenu total', rw: 'Amafaranga yose', sw: 'Mapato yote' },
  'dash.pendingPayments': { en: 'Pending Payments', fr: 'Paiements en attente', rw: 'Gutegereza', sw: 'Malipo yanayosubiri' },
  'dash.recordExpense': { en: 'Record Expense', fr: 'Enregistrer dépense', rw: 'Andika igiceri', sw: 'Rekodi gharama' },
  'dash.recordIncome': { en: 'Record Income', fr: 'Enregistrer revenu', rw: 'Andika amafaranga', sw: 'Rekodi mapato' },
  'dash.paySalary': { en: 'Pay Salary', fr: 'Payer salaire', rw: 'Fata amafaranga', sw: 'Lipa mishahara' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageOptions: { code: Language; label: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languageOptions: [],
});

export const useLanguage = () => useContext(LanguageContext);

const languageOptions = [
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  { code: 'rw' as Language, label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sw' as Language, label: 'Kiswahili', flag: '🇹🇿' },
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};
