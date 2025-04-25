import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          title: 'Settings & Preferences',
          accessibility: 'Accessibility',
          highContrast: 'High Contrast Mode',
          fontSize: 'Font Size',
          privacy: 'Privacy & Account',
          enable2FA: 'Enable Two-Factor Authentication',
          notifications: 'Notifications',
          emailNotify: 'In-App Notifications via Email',
          smsNotify: 'In-App Notifications via SMS',
          marketing: 'Allow Marketing Emails',
          dataSharing: 'Data Sharing & Integrations',
          shareWithDVLA: 'Share my records with DVLA / Law Authorities',
          language: 'Language',
          save: 'Save Settings',
        },
      },
      ur: {
        translation: {
          title: 'ترجیحات اور ترتیبات',
          accessibility: 'رسائی',
          highContrast: 'ہائی کنٹراسٹ موڈ',
          fontSize: 'فونٹ سائز',
          privacy: 'رازداری اور اکاؤنٹ',
          enable2FA: 'ٹو فیکٹر توثیق فعال کریں',
          notifications: 'اطلاعات',
          emailNotify: 'ای میل کے ذریعے ایپ کی اطلاعات',
          smsNotify: 'ایس ایم ایس کے ذریعے ایپ کی اطلاعات',
          marketing: 'مارکیٹنگ ای میلز کی اجازت دیں',
          dataSharing: 'ڈیٹا شیئرنگ اور انضمام',
          shareWithDVLA: 'ڈی وی ایل اے / قانون نافذ کرنے والے اداروں کے ساتھ شیئر کریں',
          language: 'زبان',
          save: 'ترتیبات محفوظ کریں',
        },
      },
      // Add French, Arabic etc similarly...
    },
  });

export default i18n;
