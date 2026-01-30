/**
 * Default UI strings for common interface elements.
 * These provide localized fallbacks so components don't need hardcoded English text.
 * Config can override any of these via uiStrings props.
 */
export const defaultStrings: Record<string, Record<string, string>> = {
  fr: {
    "ui.today": "Aujourd'hui",
    "ui.closed": "Fermé",
    "ui.open": "Ouvert",
    "ui.paymentMethods": "Moyens de paiement",
    "ui.loadMore": "Voir plus",
    "ui.navigation": "Navigation",
    "ui.close": "Fermer",
    "ui.previous": "Précédent",
    "ui.next": "Suivant",
    "ui.call": "Appeler",
    "ui.phone": "Téléphone",
    "ui.email": "Email",
    "ui.address": "Adresse",
    "ui.disclaimer.title": "Aperçu",
    "ui.disclaimer.message": "Ce site est un brouillon et est uniquement destiné à la prévisualisation.",
    "ui.disclaimer.notIndexed": "Ce site n'est pas indexé par les moteurs de recherche",
    "ui.disclaimer.mayContainErrors": "Le contenu peut contenir des erreurs ou des inexactitudes",
    "ui.disclaimer.button": "Compris",
  },
  en: {
    "ui.today": "Today",
    "ui.closed": "Closed",
    "ui.open": "Open",
    "ui.paymentMethods": "Payment methods",
    "ui.loadMore": "Load more",
    "ui.navigation": "Navigation",
    "ui.close": "Close",
    "ui.previous": "Previous",
    "ui.next": "Next",
    "ui.call": "Call",
    "ui.phone": "Phone",
    "ui.email": "Email",
    "ui.address": "Address",
    "ui.disclaimer.title": "Preview Draft",
    "ui.disclaimer.message": "This website is a draft and for preview only.",
    "ui.disclaimer.notIndexed": "This site is not indexed by search engines",
    "ui.disclaimer.mayContainErrors": "Content may contain errors or inaccuracies",
    "ui.disclaimer.button": "Understood",
  },
  de: {
    "ui.today": "Heute",
    "ui.closed": "Geschlossen",
    "ui.open": "Geöffnet",
    "ui.paymentMethods": "Zahlungsmethoden",
    "ui.loadMore": "Mehr laden",
    "ui.navigation": "Navigation",
    "ui.close": "Schließen",
    "ui.previous": "Zurück",
    "ui.next": "Weiter",
    "ui.call": "Anrufen",
    "ui.phone": "Telefon",
    "ui.email": "E-Mail",
    "ui.address": "Adresse",
    "ui.disclaimer.title": "Vorschau",
    "ui.disclaimer.message": "Diese Website ist ein Entwurf und dient nur zur Vorschau.",
    "ui.disclaimer.notIndexed": "Diese Website wird nicht von Suchmaschinen indexiert",
    "ui.disclaimer.mayContainErrors": "Der Inhalt kann Fehler oder Ungenauigkeiten enthalten",
    "ui.disclaimer.button": "Verstanden",
  },
  it: {
    "ui.today": "Oggi",
    "ui.closed": "Chiuso",
    "ui.open": "Aperto",
    "ui.paymentMethods": "Metodi di pagamento",
    "ui.loadMore": "Carica altro",
    "ui.navigation": "Navigazione",
    "ui.close": "Chiudi",
    "ui.previous": "Precedente",
    "ui.next": "Successivo",
    "ui.call": "Chiama",
    "ui.phone": "Telefono",
    "ui.email": "Email",
    "ui.address": "Indirizzo",
    "ui.disclaimer.title": "Anteprima",
    "ui.disclaimer.message": "Questo sito web è una bozza e serve solo per l'anteprima.",
    "ui.disclaimer.notIndexed": "Questo sito non è indicizzato dai motori di ricerca",
    "ui.disclaimer.mayContainErrors": "Il contenuto può contenere errori o imprecisioni",
    "ui.disclaimer.button": "Capito",
  },
};

/**
 * Get a UI string with fallback chain:
 * 1. Current language
 * 2. English (as universal fallback)
 * 3. The key itself (for debugging missing strings)
 */
export function getDefaultString(key: string, language: string): string {
  // Try current language
  if (defaultStrings[language]?.[key]) {
    return defaultStrings[language][key];
  }
  // Fallback to English
  if (defaultStrings.en?.[key]) {
    return defaultStrings.en[key];
  }
  // Return key for debugging
  return key;
}
