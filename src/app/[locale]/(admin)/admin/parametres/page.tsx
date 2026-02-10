"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Save,
  Loader2,
  Upload,
  X,
  AlertCircle,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SettingsTabs, type SettingsTab } from "@/components/admin/SettingsTabs";
import { ShippingZonesEditor, type ShippingZone } from "@/components/admin/ShippingZonesEditor";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Parametres",
    subtitle: "Configurez votre site web",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistre",
    unsavedChanges: "Vous avez des modifications non enregistrees",
    loading: "Chargement...",
    // General
    general: "Parametres generaux",
    siteName: "Nom du site",
    siteDescription: "Description du site",
    tagline: "Slogan",
    taglinePlaceholder: "Artisanat du bois marocain depuis...",
    yearFounded: "Annee de fondation",
    businessHours: "Horaires d'ouverture",
    logo: "Logo",
    logoHeader: "Logo en-tete",
    logoFooter: "Logo pied de page",
    logoHelp: "Recommande: 200x60 pixels, PNG ou SVG",
    favicon: "Favicon",
    faviconHelp: "Recommande: 32x32 pixels, ICO ou PNG",
    uploadLogo: "Telecharger le logo",
    uploadFavicon: "Telecharger le favicon",
    removeLogo: "Supprimer",
    // Contact
    contact: "Informations de contact",
    phone: "Telephone",
    email: "Email",
    address: "Adresse",
    addressPlaceholder: "123 Rue Example\nCasablanca, Maroc",
    whatsapp: "WhatsApp",
    whatsappHelp: "Numero avec indicatif pays (ex: +212612345678)",
    openingHours: "Horaires d'ouverture",
    openingHoursPlaceholder: "Lun-Ven: 9h-18h\nSam: 10h-14h",
    // Social
    social: "Reseaux sociaux",
    facebook: "Facebook URL",
    instagram: "Instagram URL",
    youtube: "YouTube URL",
    twitter: "Twitter/X URL",
    tiktok: "TikTok URL",
    pinterest: "Pinterest URL",
    linkedin: "LinkedIn URL",
    // Shipping
    shipping: "Parametres de livraison",
    enableShipping: "Activer la livraison",
    shippingEnabled: "La livraison est activee",
    shippingDisabled: "La livraison est desactivee",
    // Payment
    payment: "Parametres de paiement",
    enableStripe: "Activer Stripe",
    stripePublicKey: "Cle publique Stripe",
    stripeSecretKey: "Cle secrete Stripe",
    stripeSecretKeyHelp: "Ne partagez jamais cette cle",
    enableCOD: "Activer le paiement a la livraison",
    codFee: "Frais supplementaires COD (MAD)",
    codFeeHelp: "Frais optionnels pour le paiement a la livraison",
    showKey: "Afficher",
    hideKey: "Masquer",
    // SEO
    seo: "Optimisation SEO",
    defaultMetaTitle: "Titre meta par defaut",
    defaultMetaDescription: "Description meta par defaut",
    robotsTxt: "Contenu robots.txt",
    googleSiteVerification: "Code de verification Google Search Console",
    googleSiteVerificationPlaceholder: "google-site-verification=...",
    googleSiteVerificationHelp: "Copiez le contenu de la balise meta de verification Google",
    // Tracking
    tracking: "Tracking & Pixels",
    trackingDescription: "Configurez vos scripts de tracking et pixels marketing",
    googleAnalyticsId: "Google Analytics 4 ID",
    googleAnalyticsPlaceholder: "G-XXXXXXXXXX",
    enableGoogleAnalytics: "Activer Google Analytics",
    googleTagManagerId: "Google Tag Manager ID",
    googleTagManagerPlaceholder: "GTM-XXXXXXX",
    enableGoogleTagManager: "Activer Google Tag Manager",
    facebookPixelId: "Facebook Pixel ID",
    facebookPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableFacebookPixel: "Activer Facebook Pixel",
    tiktokPixelId: "TikTok Pixel ID",
    tiktokPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableTiktokPixel: "Activer TikTok Pixel",
    pinterestTagId: "Pinterest Tag ID",
    pinterestTagPlaceholder: "XXXXXXXXXXXXXXX",
    enablePinterestTag: "Activer Pinterest Tag",
    testTracking: "Tester les pixels",
    testTrackingHelp: "Ouvrez la console du navigateur pour verifier",
    // Boutique
    boutique: "Parametres boutique",
    boutiqueDescription: "Configurez l'affichage et les fonctionnalites de votre boutique",
    productsPerPage: "Produits par page",
    productsPerPageHelp: "Nombre de produits affiches par page",
    defaultSort: "Tri par defaut",
    sortNewest: "Plus recents",
    sortOldest: "Plus anciens",
    sortPriceLow: "Prix croissant",
    sortPriceHigh: "Prix decroissant",
    sortNameAZ: "Nom A-Z",
    sortNameZA: "Nom Z-A",
    enableReviews: "Activer les avis clients",
    reviewsRequireApproval: "Moderer les avis avant publication",
    enableWishlist: "Activer la liste de souhaits",
    showStock: "Afficher la quantite en stock",
    lowStockThreshold: "Seuil de stock bas",
    lowStockThresholdHelp: "Alerte quand le stock est inferieur a",
    taxRate: "Taux de TVA (%)",
    taxRateHelp: "Taux de TVA applique aux produits",
    taxIncluded: "Prix TTC (taxes incluses)",
    // Notifications
    notifications: "Notifications",
    notificationsDescription: "Configurez les notifications email et WhatsApp",
    emailNotifications: "Notifications par email",
    notifyNewOrder: "Nouvelle commande",
    notifyNewOrderHelp: "Recevoir un email lors d'une nouvelle commande",
    notifyOrderStatus: "Changement de statut",
    notifyOrderStatusHelp: "Recevoir un email lors d'un changement de statut",
    notifyLowStock: "Stock bas",
    notifyLowStockHelp: "Recevoir un email quand un produit est en stock bas",
    notifyNewMessage: "Nouveau message",
    notifyNewMessageHelp: "Recevoir un email lors d'un nouveau message contact",
    notifyNewQuote: "Nouvelle demande de devis",
    notifyNewQuoteHelp: "Recevoir un email lors d'une demande de devis",
    customerNotifications: "Notifications clients",
    notifyCustomerOrderConfirm: "Confirmation de commande",
    notifyCustomerShipping: "Expedition de commande",
    notifyCustomerDelivery: "Livraison effectuee",
    whatsappNotifications: "Notifications WhatsApp",
    enableWhatsappAlerts: "Activer les alertes WhatsApp",
    whatsappAlertNumber: "Numero pour les alertes",
    // Devises
    devises: "Devises",
    devisesDescription: "Configurez les devises et taux de change",
    defaultCurrency: "Devise par defaut",
    enableMultiCurrency: "Activer multi-devises",
    autoUpdateRates: "Mise a jour automatique des taux",
    lastRatesUpdate: "Derniere mise a jour",
    updateRatesNow: "Mettre a jour maintenant",
    exchangeRates: "Taux de change",
    currencyMAD: "Dirham marocain (MAD)",
    currencyEUR: "Euro (EUR)",
    currencyUSD: "Dollar US (USD)",
    currencyGBP: "Livre sterling (GBP)",
    rateHelp: "1 MAD =",
    // Legal
    legal: "Informations legales",
    legalDescription: "Informations legales et fiscales de votre entreprise",
    companyName: "Raison sociale",
    companyIce: "ICE (Identifiant Commun de l'Entreprise)",
    companyIcePlaceholder: "000000000000000",
    companyRc: "RC (Registre du Commerce)",
    companyRcPlaceholder: "123456",
    companyTaxId: "Identifiant Fiscal (IF)",
    companyTaxIdPlaceholder: "12345678",
    companyPatente: "Patente",
    companyPatentePlaceholder: "12345678",
    companyCnss: "CNSS",
    companyCnssPlaceholder: "12345678",
    legalAddress: "Siege social",
    termsLastUpdate: "Derniere mise a jour CGV",
    privacyLastUpdate: "Derniere mise a jour confidentialite",
    editTerms: "Modifier les CGV",
    editPrivacy: "Modifier la politique de confidentialite",
    // Emails
    emails: "Parametres email",
    adminEmail: "Email de notification admin",
    fromEmail: "Email d'envoi",
    fromName: "Nom d'envoi",
    smtpHost: "Serveur SMTP",
    smtpPort: "Port SMTP",
    smtpUser: "Utilisateur SMTP",
    smtpPassword: "Mot de passe SMTP",
    smtpSecure: "Connexion securisee (TLS)",
    testEmail: "Envoyer un email de test",
    testEmailSent: "Email de test envoye",
    testEmailFailed: "Echec de l'envoi",
  },
  en: {
    title: "Settings",
    subtitle: "Configure your website",
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
    unsavedChanges: "You have unsaved changes",
    loading: "Loading...",
    // General
    general: "General Settings",
    siteName: "Site Name",
    siteDescription: "Site Description",
    tagline: "Tagline",
    taglinePlaceholder: "Moroccan woodcraft since...",
    yearFounded: "Year Founded",
    businessHours: "Business Hours",
    logo: "Logo",
    logoHeader: "Header Logo",
    logoFooter: "Footer Logo",
    logoHelp: "Recommended: 200x60 pixels, PNG or SVG",
    favicon: "Favicon",
    faviconHelp: "Recommended: 32x32 pixels, ICO or PNG",
    uploadLogo: "Upload Logo",
    uploadFavicon: "Upload Favicon",
    removeLogo: "Remove",
    // Contact
    contact: "Contact Information",
    phone: "Phone",
    email: "Email",
    address: "Address",
    addressPlaceholder: "123 Example Street\nCasablanca, Morocco",
    whatsapp: "WhatsApp",
    whatsappHelp: "Number with country code (e.g., +212612345678)",
    openingHours: "Opening Hours",
    openingHoursPlaceholder: "Mon-Fri: 9am-6pm\nSat: 10am-2pm",
    // Social
    social: "Social Media",
    facebook: "Facebook URL",
    instagram: "Instagram URL",
    youtube: "YouTube URL",
    twitter: "Twitter/X URL",
    tiktok: "TikTok URL",
    pinterest: "Pinterest URL",
    linkedin: "LinkedIn URL",
    // Shipping
    shipping: "Shipping Settings",
    enableShipping: "Enable Shipping",
    shippingEnabled: "Shipping is enabled",
    shippingDisabled: "Shipping is disabled",
    // Payment
    payment: "Payment Settings",
    enableStripe: "Enable Stripe",
    stripePublicKey: "Stripe Public Key",
    stripeSecretKey: "Stripe Secret Key",
    stripeSecretKeyHelp: "Never share this key",
    enableCOD: "Enable Cash on Delivery",
    codFee: "COD Additional Fee (MAD)",
    codFeeHelp: "Optional fee for cash on delivery",
    showKey: "Show",
    hideKey: "Hide",
    // SEO
    seo: "SEO Optimization",
    defaultMetaTitle: "Default Meta Title",
    defaultMetaDescription: "Default Meta Description",
    robotsTxt: "robots.txt Content",
    googleSiteVerification: "Google Search Console Verification Code",
    googleSiteVerificationPlaceholder: "google-site-verification=...",
    googleSiteVerificationHelp: "Copy the content of the Google verification meta tag",
    // Tracking
    tracking: "Tracking & Pixels",
    trackingDescription: "Configure your tracking scripts and marketing pixels",
    googleAnalyticsId: "Google Analytics 4 ID",
    googleAnalyticsPlaceholder: "G-XXXXXXXXXX",
    enableGoogleAnalytics: "Enable Google Analytics",
    googleTagManagerId: "Google Tag Manager ID",
    googleTagManagerPlaceholder: "GTM-XXXXXXX",
    enableGoogleTagManager: "Enable Google Tag Manager",
    facebookPixelId: "Facebook Pixel ID",
    facebookPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableFacebookPixel: "Enable Facebook Pixel",
    tiktokPixelId: "TikTok Pixel ID",
    tiktokPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableTiktokPixel: "Enable TikTok Pixel",
    pinterestTagId: "Pinterest Tag ID",
    pinterestTagPlaceholder: "XXXXXXXXXXXXXXX",
    enablePinterestTag: "Enable Pinterest Tag",
    testTracking: "Test Pixels",
    testTrackingHelp: "Open browser console to verify",
    // Boutique
    boutique: "Shop Settings",
    boutiqueDescription: "Configure your shop display and features",
    productsPerPage: "Products Per Page",
    productsPerPageHelp: "Number of products displayed per page",
    defaultSort: "Default Sort",
    sortNewest: "Newest First",
    sortOldest: "Oldest First",
    sortPriceLow: "Price: Low to High",
    sortPriceHigh: "Price: High to Low",
    sortNameAZ: "Name A-Z",
    sortNameZA: "Name Z-A",
    enableReviews: "Enable Customer Reviews",
    reviewsRequireApproval: "Moderate reviews before publishing",
    enableWishlist: "Enable Wishlist",
    showStock: "Show Stock Quantity",
    lowStockThreshold: "Low Stock Threshold",
    lowStockThresholdHelp: "Alert when stock is below",
    taxRate: "Tax Rate (%)",
    taxRateHelp: "Tax rate applied to products",
    taxIncluded: "Prices include tax",
    // Notifications
    notifications: "Notifications",
    notificationsDescription: "Configure email and WhatsApp notifications",
    emailNotifications: "Email Notifications",
    notifyNewOrder: "New Order",
    notifyNewOrderHelp: "Receive email on new order",
    notifyOrderStatus: "Status Change",
    notifyOrderStatusHelp: "Receive email on status change",
    notifyLowStock: "Low Stock",
    notifyLowStockHelp: "Receive email when product is low stock",
    notifyNewMessage: "New Message",
    notifyNewMessageHelp: "Receive email on new contact message",
    notifyNewQuote: "New Quote Request",
    notifyNewQuoteHelp: "Receive email on quote request",
    customerNotifications: "Customer Notifications",
    notifyCustomerOrderConfirm: "Order Confirmation",
    notifyCustomerShipping: "Order Shipped",
    notifyCustomerDelivery: "Order Delivered",
    whatsappNotifications: "WhatsApp Notifications",
    enableWhatsappAlerts: "Enable WhatsApp Alerts",
    whatsappAlertNumber: "Alert Number",
    // Devises
    devises: "Currencies",
    devisesDescription: "Configure currencies and exchange rates",
    defaultCurrency: "Default Currency",
    enableMultiCurrency: "Enable Multi-Currency",
    autoUpdateRates: "Auto-update Exchange Rates",
    lastRatesUpdate: "Last Update",
    updateRatesNow: "Update Now",
    exchangeRates: "Exchange Rates",
    currencyMAD: "Moroccan Dirham (MAD)",
    currencyEUR: "Euro (EUR)",
    currencyUSD: "US Dollar (USD)",
    currencyGBP: "British Pound (GBP)",
    rateHelp: "1 MAD =",
    // Legal
    legal: "Legal Information",
    legalDescription: "Legal and tax information for your business",
    companyName: "Company Name",
    companyIce: "ICE (Common Business Identifier)",
    companyIcePlaceholder: "000000000000000",
    companyRc: "RC (Trade Register)",
    companyRcPlaceholder: "123456",
    companyTaxId: "Tax ID (IF)",
    companyTaxIdPlaceholder: "12345678",
    companyPatente: "Business Tax (Patente)",
    companyPatentePlaceholder: "12345678",
    companyCnss: "CNSS",
    companyCnssPlaceholder: "12345678",
    legalAddress: "Registered Address",
    termsLastUpdate: "Terms Last Updated",
    privacyLastUpdate: "Privacy Last Updated",
    editTerms: "Edit Terms & Conditions",
    editPrivacy: "Edit Privacy Policy",
    // Emails
    emails: "Email Settings",
    adminEmail: "Admin Notification Email",
    fromEmail: "From Email",
    fromName: "From Name",
    smtpHost: "SMTP Host",
    smtpPort: "SMTP Port",
    smtpUser: "SMTP User",
    smtpPassword: "SMTP Password",
    smtpSecure: "Secure Connection (TLS)",
    testEmail: "Send Test Email",
    testEmailSent: "Test email sent",
    testEmailFailed: "Failed to send",
  },
  es: {
    title: "Configuracion",
    subtitle: "Configura tu sitio web",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Guardado",
    unsavedChanges: "Tienes cambios sin guardar",
    loading: "Cargando...",
    // General
    general: "Configuracion General",
    siteName: "Nombre del Sitio",
    siteDescription: "Descripcion del Sitio",
    tagline: "Eslogan",
    taglinePlaceholder: "Artesania de madera marroqui desde...",
    yearFounded: "Ano de Fundacion",
    businessHours: "Horario Comercial",
    logo: "Logo",
    logoHeader: "Logo Encabezado",
    logoFooter: "Logo Pie de Pagina",
    logoHelp: "Recomendado: 200x60 pixeles, PNG o SVG",
    favicon: "Favicon",
    faviconHelp: "Recomendado: 32x32 pixeles, ICO o PNG",
    uploadLogo: "Subir Logo",
    uploadFavicon: "Subir Favicon",
    removeLogo: "Eliminar",
    // Contact
    contact: "Informacion de Contacto",
    phone: "Telefono",
    email: "Email",
    address: "Direccion",
    addressPlaceholder: "123 Calle Ejemplo\nCasablanca, Marruecos",
    whatsapp: "WhatsApp",
    whatsappHelp: "Numero con codigo de pais (ej: +212612345678)",
    openingHours: "Horario de Atencion",
    openingHoursPlaceholder: "Lun-Vie: 9am-6pm\nSab: 10am-2pm",
    // Social
    social: "Redes Sociales",
    facebook: "Facebook URL",
    instagram: "Instagram URL",
    youtube: "YouTube URL",
    twitter: "Twitter/X URL",
    tiktok: "TikTok URL",
    pinterest: "Pinterest URL",
    linkedin: "LinkedIn URL",
    // Shipping
    shipping: "Configuracion de Envio",
    enableShipping: "Habilitar Envio",
    shippingEnabled: "El envio esta habilitado",
    shippingDisabled: "El envio esta deshabilitado",
    // Payment
    payment: "Configuracion de Pago",
    enableStripe: "Habilitar Stripe",
    stripePublicKey: "Clave Publica de Stripe",
    stripeSecretKey: "Clave Secreta de Stripe",
    stripeSecretKeyHelp: "Nunca compartas esta clave",
    enableCOD: "Habilitar Pago Contra Entrega",
    codFee: "Tarifa Adicional COD (MAD)",
    codFeeHelp: "Tarifa opcional para pago contra entrega",
    showKey: "Mostrar",
    hideKey: "Ocultar",
    // SEO
    seo: "Optimizacion SEO",
    defaultMetaTitle: "Titulo Meta Predeterminado",
    defaultMetaDescription: "Descripcion Meta Predeterminada",
    robotsTxt: "Contenido robots.txt",
    googleSiteVerification: "Codigo de Verificacion Google Search Console",
    googleSiteVerificationPlaceholder: "google-site-verification=...",
    googleSiteVerificationHelp: "Copia el contenido de la etiqueta meta de verificacion de Google",
    // Tracking
    tracking: "Tracking y Pixeles",
    trackingDescription: "Configura tus scripts de seguimiento y pixeles de marketing",
    googleAnalyticsId: "Google Analytics 4 ID",
    googleAnalyticsPlaceholder: "G-XXXXXXXXXX",
    enableGoogleAnalytics: "Habilitar Google Analytics",
    googleTagManagerId: "Google Tag Manager ID",
    googleTagManagerPlaceholder: "GTM-XXXXXXX",
    enableGoogleTagManager: "Habilitar Google Tag Manager",
    facebookPixelId: "Facebook Pixel ID",
    facebookPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableFacebookPixel: "Habilitar Facebook Pixel",
    tiktokPixelId: "TikTok Pixel ID",
    tiktokPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableTiktokPixel: "Habilitar TikTok Pixel",
    pinterestTagId: "Pinterest Tag ID",
    pinterestTagPlaceholder: "XXXXXXXXXXXXXXX",
    enablePinterestTag: "Habilitar Pinterest Tag",
    testTracking: "Probar Pixeles",
    testTrackingHelp: "Abre la consola del navegador para verificar",
    // Boutique
    boutique: "Configuracion de Tienda",
    boutiqueDescription: "Configura la visualizacion y funciones de tu tienda",
    productsPerPage: "Productos por Pagina",
    productsPerPageHelp: "Numero de productos mostrados por pagina",
    defaultSort: "Ordenamiento Predeterminado",
    sortNewest: "Mas Recientes",
    sortOldest: "Mas Antiguos",
    sortPriceLow: "Precio: Menor a Mayor",
    sortPriceHigh: "Precio: Mayor a Menor",
    sortNameAZ: "Nombre A-Z",
    sortNameZA: "Nombre Z-A",
    enableReviews: "Habilitar Resenas de Clientes",
    reviewsRequireApproval: "Moderar resenas antes de publicar",
    enableWishlist: "Habilitar Lista de Deseos",
    showStock: "Mostrar Cantidad en Stock",
    lowStockThreshold: "Umbral de Stock Bajo",
    lowStockThresholdHelp: "Alertar cuando el stock sea menor a",
    taxRate: "Tasa de Impuesto (%)",
    taxRateHelp: "Tasa de impuesto aplicada a productos",
    taxIncluded: "Precios incluyen impuesto",
    // Notifications
    notifications: "Notificaciones",
    notificationsDescription: "Configura notificaciones por email y WhatsApp",
    emailNotifications: "Notificaciones por Email",
    notifyNewOrder: "Nuevo Pedido",
    notifyNewOrderHelp: "Recibir email en nuevo pedido",
    notifyOrderStatus: "Cambio de Estado",
    notifyOrderStatusHelp: "Recibir email en cambio de estado",
    notifyLowStock: "Stock Bajo",
    notifyLowStockHelp: "Recibir email cuando un producto tiene stock bajo",
    notifyNewMessage: "Nuevo Mensaje",
    notifyNewMessageHelp: "Recibir email en nuevo mensaje de contacto",
    notifyNewQuote: "Nueva Solicitud de Cotizacion",
    notifyNewQuoteHelp: "Recibir email en solicitud de cotizacion",
    customerNotifications: "Notificaciones de Clientes",
    notifyCustomerOrderConfirm: "Confirmacion de Pedido",
    notifyCustomerShipping: "Pedido Enviado",
    notifyCustomerDelivery: "Pedido Entregado",
    whatsappNotifications: "Notificaciones WhatsApp",
    enableWhatsappAlerts: "Habilitar Alertas WhatsApp",
    whatsappAlertNumber: "Numero de Alerta",
    // Devises
    devises: "Monedas",
    devisesDescription: "Configura monedas y tasas de cambio",
    defaultCurrency: "Moneda Predeterminada",
    enableMultiCurrency: "Habilitar Multi-Moneda",
    autoUpdateRates: "Actualizar Tasas Automaticamente",
    lastRatesUpdate: "Ultima Actualizacion",
    updateRatesNow: "Actualizar Ahora",
    exchangeRates: "Tasas de Cambio",
    currencyMAD: "Dirham Marroqui (MAD)",
    currencyEUR: "Euro (EUR)",
    currencyUSD: "Dolar US (USD)",
    currencyGBP: "Libra Esterlina (GBP)",
    rateHelp: "1 MAD =",
    // Legal
    legal: "Informacion Legal",
    legalDescription: "Informacion legal y fiscal de tu empresa",
    companyName: "Razon Social",
    companyIce: "ICE (Identificador Comun de Empresa)",
    companyIcePlaceholder: "000000000000000",
    companyRc: "RC (Registro Comercial)",
    companyRcPlaceholder: "123456",
    companyTaxId: "ID Fiscal (IF)",
    companyTaxIdPlaceholder: "12345678",
    companyPatente: "Patente",
    companyPatentePlaceholder: "12345678",
    companyCnss: "CNSS",
    companyCnssPlaceholder: "12345678",
    legalAddress: "Direccion Legal",
    termsLastUpdate: "Ultima Actualizacion de Terminos",
    privacyLastUpdate: "Ultima Actualizacion de Privacidad",
    editTerms: "Editar Terminos y Condiciones",
    editPrivacy: "Editar Politica de Privacidad",
    // Emails
    emails: "Configuracion de Email",
    adminEmail: "Email de Notificacion Admin",
    fromEmail: "Email de Envio",
    fromName: "Nombre de Envio",
    smtpHost: "Servidor SMTP",
    smtpPort: "Puerto SMTP",
    smtpUser: "Usuario SMTP",
    smtpPassword: "Contrasena SMTP",
    smtpSecure: "Conexion Segura (TLS)",
    testEmail: "Enviar Email de Prueba",
    testEmailSent: "Email de prueba enviado",
    testEmailFailed: "Error al enviar",
  },
  ar: {
    title: "الإعدادات",
    subtitle: "تكوين موقعك الإلكتروني",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ",
    unsavedChanges: "لديك تغييرات غير محفوظة",
    loading: "جاري التحميل...",
    // General
    general: "الإعدادات العامة",
    siteName: "اسم الموقع",
    siteDescription: "وصف الموقع",
    tagline: "الشعار",
    taglinePlaceholder: "حرفة الخشب المغربية منذ...",
    yearFounded: "سنة التأسيس",
    businessHours: "ساعات العمل",
    logo: "الشعار",
    logoHeader: "شعار الرأس",
    logoFooter: "شعار التذييل",
    logoHelp: "موصى به: 200×60 بكسل، PNG أو SVG",
    favicon: "أيقونة الموقع",
    faviconHelp: "موصى به: 32×32 بكسل، ICO أو PNG",
    uploadLogo: "رفع الشعار",
    uploadFavicon: "رفع الأيقونة",
    removeLogo: "إزالة",
    // Contact
    contact: "معلومات الاتصال",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    addressPlaceholder: "123 شارع المثال\nالدار البيضاء، المغرب",
    whatsapp: "واتساب",
    whatsappHelp: "الرقم مع رمز البلد (مثال: +212612345678)",
    openingHours: "ساعات العمل",
    openingHoursPlaceholder: "الإثنين-الجمعة: 9ص-6م\nالسبت: 10ص-2م",
    // Social
    social: "وسائل التواصل الاجتماعي",
    facebook: "رابط فيسبوك",
    instagram: "رابط إنستغرام",
    youtube: "رابط يوتيوب",
    twitter: "رابط تويتر/X",
    tiktok: "رابط تيك توك",
    pinterest: "رابط بنترست",
    linkedin: "رابط لينكد إن",
    // Shipping
    shipping: "إعدادات الشحن",
    enableShipping: "تفعيل الشحن",
    shippingEnabled: "الشحن مفعل",
    shippingDisabled: "الشحن معطل",
    // Payment
    payment: "إعدادات الدفع",
    enableStripe: "تفعيل Stripe",
    stripePublicKey: "مفتاح Stripe العام",
    stripeSecretKey: "مفتاح Stripe السري",
    stripeSecretKeyHelp: "لا تشارك هذا المفتاح أبداً",
    enableCOD: "تفعيل الدفع عند الاستلام",
    codFee: "رسوم إضافية للدفع عند الاستلام (درهم)",
    codFeeHelp: "رسوم اختيارية للدفع عند الاستلام",
    showKey: "إظهار",
    hideKey: "إخفاء",
    // SEO
    seo: "تحسين محركات البحث",
    defaultMetaTitle: "عنوان ميتا الافتراضي",
    defaultMetaDescription: "وصف ميتا الافتراضي",
    robotsTxt: "محتوى robots.txt",
    googleSiteVerification: "رمز التحقق من Google Search Console",
    googleSiteVerificationPlaceholder: "google-site-verification=...",
    googleSiteVerificationHelp: "انسخ محتوى علامة ميتا التحقق من Google",
    // Tracking
    tracking: "التتبع والبكسل",
    trackingDescription: "تكوين نصوص التتبع وبكسلات التسويق",
    googleAnalyticsId: "معرف Google Analytics 4",
    googleAnalyticsPlaceholder: "G-XXXXXXXXXX",
    enableGoogleAnalytics: "تفعيل Google Analytics",
    googleTagManagerId: "معرف Google Tag Manager",
    googleTagManagerPlaceholder: "GTM-XXXXXXX",
    enableGoogleTagManager: "تفعيل Google Tag Manager",
    facebookPixelId: "معرف Facebook Pixel",
    facebookPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableFacebookPixel: "تفعيل Facebook Pixel",
    tiktokPixelId: "معرف TikTok Pixel",
    tiktokPixelPlaceholder: "XXXXXXXXXXXXXXX",
    enableTiktokPixel: "تفعيل TikTok Pixel",
    pinterestTagId: "معرف Pinterest Tag",
    pinterestTagPlaceholder: "XXXXXXXXXXXXXXX",
    enablePinterestTag: "تفعيل Pinterest Tag",
    testTracking: "اختبار البكسلات",
    testTrackingHelp: "افتح وحدة التحكم في المتصفح للتحقق",
    // Boutique
    boutique: "إعدادات المتجر",
    boutiqueDescription: "تكوين عرض المتجر والميزات",
    productsPerPage: "المنتجات لكل صفحة",
    productsPerPageHelp: "عدد المنتجات المعروضة في كل صفحة",
    defaultSort: "الترتيب الافتراضي",
    sortNewest: "الأحدث",
    sortOldest: "الأقدم",
    sortPriceLow: "السعر: من الأقل للأعلى",
    sortPriceHigh: "السعر: من الأعلى للأقل",
    sortNameAZ: "الاسم أ-ي",
    sortNameZA: "الاسم ي-أ",
    enableReviews: "تفعيل آراء العملاء",
    reviewsRequireApproval: "مراجعة التقييمات قبل النشر",
    enableWishlist: "تفعيل قائمة الرغبات",
    showStock: "إظهار كمية المخزون",
    lowStockThreshold: "حد المخزون المنخفض",
    lowStockThresholdHelp: "تنبيه عندما يكون المخزون أقل من",
    taxRate: "معدل الضريبة (%)",
    taxRateHelp: "معدل الضريبة المطبق على المنتجات",
    taxIncluded: "الأسعار شاملة الضريبة",
    // Notifications
    notifications: "الإشعارات",
    notificationsDescription: "تكوين إشعارات البريد الإلكتروني وواتساب",
    emailNotifications: "إشعارات البريد الإلكتروني",
    notifyNewOrder: "طلب جديد",
    notifyNewOrderHelp: "استلام بريد عند طلب جديد",
    notifyOrderStatus: "تغيير الحالة",
    notifyOrderStatusHelp: "استلام بريد عند تغيير الحالة",
    notifyLowStock: "مخزون منخفض",
    notifyLowStockHelp: "استلام بريد عندما يكون المنتج في مخزون منخفض",
    notifyNewMessage: "رسالة جديدة",
    notifyNewMessageHelp: "استلام بريد عند رسالة اتصال جديدة",
    notifyNewQuote: "طلب عرض سعر جديد",
    notifyNewQuoteHelp: "استلام بريد عند طلب عرض سعر",
    customerNotifications: "إشعارات العملاء",
    notifyCustomerOrderConfirm: "تأكيد الطلب",
    notifyCustomerShipping: "شحن الطلب",
    notifyCustomerDelivery: "تسليم الطلب",
    whatsappNotifications: "إشعارات واتساب",
    enableWhatsappAlerts: "تفعيل تنبيهات واتساب",
    whatsappAlertNumber: "رقم التنبيه",
    // Devises
    devises: "العملات",
    devisesDescription: "تكوين العملات وأسعار الصرف",
    defaultCurrency: "العملة الافتراضية",
    enableMultiCurrency: "تفعيل العملات المتعددة",
    autoUpdateRates: "تحديث أسعار الصرف تلقائياً",
    lastRatesUpdate: "آخر تحديث",
    updateRatesNow: "تحديث الآن",
    exchangeRates: "أسعار الصرف",
    currencyMAD: "الدرهم المغربي (MAD)",
    currencyEUR: "اليورو (EUR)",
    currencyUSD: "الدولار الأمريكي (USD)",
    currencyGBP: "الجنيه الإسترليني (GBP)",
    rateHelp: "1 درهم =",
    // Legal
    legal: "المعلومات القانونية",
    legalDescription: "المعلومات القانونية والضريبية لشركتك",
    companyName: "اسم الشركة",
    companyIce: "ICE (المعرف الموحد للمقاولة)",
    companyIcePlaceholder: "000000000000000",
    companyRc: "RC (السجل التجاري)",
    companyRcPlaceholder: "123456",
    companyTaxId: "المعرف الضريبي (IF)",
    companyTaxIdPlaceholder: "12345678",
    companyPatente: "الرسم المهني",
    companyPatentePlaceholder: "12345678",
    companyCnss: "CNSS",
    companyCnssPlaceholder: "12345678",
    legalAddress: "العنوان القانوني",
    termsLastUpdate: "آخر تحديث للشروط",
    privacyLastUpdate: "آخر تحديث للخصوصية",
    editTerms: "تعديل الشروط والأحكام",
    editPrivacy: "تعديل سياسة الخصوصية",
    // Emails
    emails: "إعدادات البريد الإلكتروني",
    adminEmail: "بريد إشعارات المدير",
    fromEmail: "بريد الإرسال",
    fromName: "اسم المرسل",
    smtpHost: "خادم SMTP",
    smtpPort: "منفذ SMTP",
    smtpUser: "مستخدم SMTP",
    smtpPassword: "كلمة مرور SMTP",
    smtpSecure: "اتصال آمن (TLS)",
    testEmail: "إرسال بريد تجريبي",
    testEmailSent: "تم إرسال البريد التجريبي",
    testEmailFailed: "فشل الإرسال",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface SettingsData {
  // General
  siteName: string;
  siteDescription: string;
  tagline: string;
  yearFounded: string;
  logo: string | null;
  logoHeader: string | null;
  logoFooter: string | null;
  favicon: string | null;
  // Contact
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  openingHours: string;
  // Social
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  pinterest: string;
  linkedin: string;
  // Shipping
  shippingEnabled: boolean;
  shippingZones: ShippingZone[];
  // Payment
  stripeEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  codEnabled: boolean;
  codFee: number;
  // SEO
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  robotsTxt: string;
  googleSiteVerification: string;
  // Tracking
  googleAnalyticsId: string;
  googleAnalyticsEnabled: boolean;
  googleTagManagerId: string;
  googleTagManagerEnabled: boolean;
  facebookPixelId: string;
  facebookPixelEnabled: boolean;
  tiktokPixelId: string;
  tiktokPixelEnabled: boolean;
  pinterestTagId: string;
  pinterestTagEnabled: boolean;
  // Boutique
  productsPerPage: number;
  defaultSort: string;
  enableReviews: boolean;
  reviewsRequireApproval: boolean;
  enableWishlist: boolean;
  showStock: boolean;
  lowStockThreshold: number;
  taxRate: number;
  taxIncluded: boolean;
  // Notifications
  notifyNewOrder: boolean;
  notifyOrderStatus: boolean;
  notifyLowStock: boolean;
  notifyNewMessage: boolean;
  notifyNewQuote: boolean;
  notifyCustomerOrderConfirm: boolean;
  notifyCustomerShipping: boolean;
  notifyCustomerDelivery: boolean;
  enableWhatsappAlerts: boolean;
  whatsappAlertNumber: string;
  // Devises
  defaultCurrency: string;
  enableMultiCurrency: boolean;
  autoUpdateRates: boolean;
  lastRatesUpdate: string;
  rateEUR: number;
  rateUSD: number;
  rateGBP: number;
  // Legal
  companyName: string;
  companyIce: string;
  companyRc: string;
  companyTaxId: string;
  companyPatente: string;
  companyCnss: string;
  legalAddress: string;
  // Emails
  adminEmail: string;
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
}

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════

const initialSettings: SettingsData = {
  // General
  siteName: "LE TATCHE BOIS",
  siteDescription: "Artisanat du bois marocain",
  tagline: "L'art du bois marocain depuis 2010",
  yearFounded: "2010",
  logo: null,
  logoHeader: null,
  logoFooter: null,
  favicon: null,
  // Contact
  phone: "+212 5XX-XXXXXX",
  email: "contact@letatche-bois.ma",
  address: "123 Rue de l'Artisanat\nCasablanca, Maroc",
  whatsapp: "+212612345678",
  openingHours: "Lun-Ven: 9h-18h\nSam: 10h-14h",
  // Social
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
  tiktok: "",
  pinterest: "",
  linkedin: "",
  // Shipping
  shippingEnabled: true,
  shippingZones: [
    { id: "zone-1", name: "Casablanca-Settat", price: 30, freeThreshold: 500, estimatedDays: "1-2 jours" },
    { id: "zone-2", name: "Rabat-Sale-Kenitra", price: 40, freeThreshold: 600, estimatedDays: "2-3 jours" },
    { id: "zone-3", name: "Autres regions", price: 60, freeThreshold: 800, estimatedDays: "3-5 jours" },
  ],
  // Payment
  stripeEnabled: false,
  stripePublicKey: "",
  stripeSecretKey: "",
  codEnabled: true,
  codFee: 0,
  // SEO
  defaultMetaTitle: "LE TATCHE BOIS - Artisanat du bois marocain",
  defaultMetaDescription: "Decouvrez notre collection de meubles et objets en bois faits a la main au Maroc.",
  robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: https://letatche-bois.ma/sitemap.xml",
  googleSiteVerification: "",
  // Tracking
  googleAnalyticsId: "",
  googleAnalyticsEnabled: false,
  googleTagManagerId: "",
  googleTagManagerEnabled: false,
  facebookPixelId: "",
  facebookPixelEnabled: false,
  tiktokPixelId: "",
  tiktokPixelEnabled: false,
  pinterestTagId: "",
  pinterestTagEnabled: false,
  // Boutique
  productsPerPage: 12,
  defaultSort: "newest",
  enableReviews: true,
  reviewsRequireApproval: true,
  enableWishlist: true,
  showStock: false,
  lowStockThreshold: 5,
  taxRate: 20,
  taxIncluded: true,
  // Notifications
  notifyNewOrder: true,
  notifyOrderStatus: true,
  notifyLowStock: true,
  notifyNewMessage: true,
  notifyNewQuote: true,
  notifyCustomerOrderConfirm: true,
  notifyCustomerShipping: true,
  notifyCustomerDelivery: true,
  enableWhatsappAlerts: false,
  whatsappAlertNumber: "",
  // Devises
  defaultCurrency: "MAD",
  enableMultiCurrency: true,
  autoUpdateRates: true,
  lastRatesUpdate: new Date().toISOString(),
  rateEUR: 0.091,
  rateUSD: 0.099,
  rateGBP: 0.078,
  // Legal
  companyName: "LE TATCHE BOIS SARL",
  companyIce: "",
  companyRc: "",
  companyTaxId: "",
  companyPatente: "",
  companyCnss: "",
  legalAddress: "",
  // Emails
  adminEmail: "",
  fromEmail: "noreply@letatche-bois.ma",
  fromName: "LE TATCHE BOIS",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  smtpSecure: true,
};

// ═══════════════════════════════════════════════════════════
// Settings Page
// ═══════════════════════════════════════════════════════════

export default function SettingsPage({ params }: PageProps) {
  const locale = params.locale;
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          // API returns { success, data: { settings } } so we need data.data.settings
          const apiSettings = data.data?.settings || data.settings;
          if (apiSettings) {
            // Map API grouped settings to flat settings structure
            const loadedSettings: SettingsData = {
              ...initialSettings,
              // General
              siteName: apiSettings.general?.siteName ?? initialSettings.siteName,
              siteDescription: apiSettings.general?.description ?? initialSettings.siteDescription,
              tagline: apiSettings.general?.tagline ?? initialSettings.tagline,
              yearFounded: apiSettings.general?.yearFounded ?? initialSettings.yearFounded,
              logoHeader: apiSettings.general?.logoHeader ?? initialSettings.logoHeader,
              logoFooter: apiSettings.general?.logoFooter ?? initialSettings.logoFooter,
              favicon: apiSettings.general?.favicon ?? initialSettings.favicon,
              // Contact
              phone: apiSettings.contact?.phone ?? initialSettings.phone,
              email: apiSettings.contact?.email ?? initialSettings.email,
              address: apiSettings.contact?.address ?? initialSettings.address,
              whatsapp: apiSettings.contact?.whatsapp ?? initialSettings.whatsapp,
              openingHours: apiSettings.contact?.businessHours ?? apiSettings.general?.businessHours ?? initialSettings.openingHours,
              // Social
              facebook: apiSettings.social?.facebook ?? initialSettings.facebook,
              instagram: apiSettings.social?.instagram ?? initialSettings.instagram,
              youtube: apiSettings.social?.youtube ?? initialSettings.youtube,
              twitter: apiSettings.social?.twitter ?? initialSettings.twitter,
              tiktok: apiSettings.social?.tiktok ?? initialSettings.tiktok,
              pinterest: apiSettings.social?.pinterest ?? initialSettings.pinterest,
              linkedin: apiSettings.social?.linkedin ?? initialSettings.linkedin,
              // Shipping
              shippingEnabled: apiSettings.shipping?.enabled ?? initialSettings.shippingEnabled,
              shippingZones: apiSettings.shipping?.zones ?? initialSettings.shippingZones,
              // Payment
              stripeEnabled: apiSettings.payment?.stripeEnabled ?? initialSettings.stripeEnabled,
              stripePublicKey: apiSettings.payment?.stripePublicKey ?? initialSettings.stripePublicKey,
              stripeSecretKey: apiSettings.payment?.stripeSecretKey ?? initialSettings.stripeSecretKey,
              codEnabled: apiSettings.payment?.codEnabled ?? initialSettings.codEnabled,
              codFee: apiSettings.payment?.codFee ?? initialSettings.codFee,
              // SEO
              defaultMetaTitle: apiSettings.seo?.defaultMetaTitle ?? initialSettings.defaultMetaTitle,
              defaultMetaDescription: apiSettings.seo?.defaultMetaDescription ?? initialSettings.defaultMetaDescription,
              robotsTxt: apiSettings.seo?.robotsTxt ?? initialSettings.robotsTxt,
              googleSiteVerification: apiSettings.seo?.googleSiteVerification ?? initialSettings.googleSiteVerification,
              // Tracking
              googleAnalyticsId: apiSettings.tracking?.googleAnalyticsId ?? initialSettings.googleAnalyticsId,
              googleAnalyticsEnabled: apiSettings.tracking?.googleAnalyticsEnabled ?? initialSettings.googleAnalyticsEnabled,
              googleTagManagerId: apiSettings.tracking?.googleTagManagerId ?? initialSettings.googleTagManagerId,
              googleTagManagerEnabled: apiSettings.tracking?.googleTagManagerEnabled ?? initialSettings.googleTagManagerEnabled,
              facebookPixelId: apiSettings.tracking?.facebookPixelId ?? initialSettings.facebookPixelId,
              facebookPixelEnabled: apiSettings.tracking?.facebookPixelEnabled ?? initialSettings.facebookPixelEnabled,
              tiktokPixelId: apiSettings.tracking?.tiktokPixelId ?? initialSettings.tiktokPixelId,
              tiktokPixelEnabled: apiSettings.tracking?.tiktokPixelEnabled ?? initialSettings.tiktokPixelEnabled,
              pinterestTagId: apiSettings.tracking?.pinterestTagId ?? initialSettings.pinterestTagId,
              pinterestTagEnabled: apiSettings.tracking?.pinterestTagEnabled ?? initialSettings.pinterestTagEnabled,
              // Boutique
              productsPerPage: apiSettings.boutique?.productsPerPage ?? initialSettings.productsPerPage,
              defaultSort: apiSettings.boutique?.defaultSort ?? initialSettings.defaultSort,
              enableReviews: apiSettings.boutique?.enableReviews ?? initialSettings.enableReviews,
              reviewsRequireApproval: apiSettings.boutique?.reviewsRequireApproval ?? initialSettings.reviewsRequireApproval,
              enableWishlist: apiSettings.boutique?.enableWishlist ?? initialSettings.enableWishlist,
              showStock: apiSettings.boutique?.showStockQuantity ?? initialSettings.showStock,
              lowStockThreshold: apiSettings.boutique?.lowStockThreshold ?? initialSettings.lowStockThreshold,
              taxRate: apiSettings.boutique?.taxRate ?? initialSettings.taxRate,
              taxIncluded: apiSettings.boutique?.showPricesWithTax ?? initialSettings.taxIncluded,
              // Notifications
              notifyNewOrder: apiSettings.notifications?.notifyNewOrder ?? initialSettings.notifyNewOrder,
              notifyOrderStatus: apiSettings.notifications?.notifyOrderStatus ?? initialSettings.notifyOrderStatus,
              notifyLowStock: apiSettings.notifications?.notifyLowStock ?? initialSettings.notifyLowStock,
              notifyNewMessage: apiSettings.notifications?.notifyNewMessage ?? initialSettings.notifyNewMessage,
              notifyNewQuote: apiSettings.notifications?.notifyNewQuote ?? initialSettings.notifyNewQuote,
              notifyCustomerOrderConfirm: apiSettings.notifications?.sendOrderConfirmation ?? initialSettings.notifyCustomerOrderConfirm,
              notifyCustomerShipping: apiSettings.notifications?.sendOrderShipped ?? initialSettings.notifyCustomerShipping,
              notifyCustomerDelivery: initialSettings.notifyCustomerDelivery,
              enableWhatsappAlerts: apiSettings.notifications?.whatsappEnabled ?? initialSettings.enableWhatsappAlerts,
              whatsappAlertNumber: apiSettings.notifications?.whatsappNumber ?? initialSettings.whatsappAlertNumber,
              // Devises
              defaultCurrency: apiSettings.devises?.defaultCurrency ?? initialSettings.defaultCurrency,
              enableMultiCurrency: apiSettings.devises?.showCurrencySwitcher ?? initialSettings.enableMultiCurrency,
              autoUpdateRates: apiSettings.devises?.autoUpdateRates ?? initialSettings.autoUpdateRates,
              lastRatesUpdate: apiSettings.devises?.ratesLastUpdated ?? initialSettings.lastRatesUpdate,
              rateEUR: apiSettings.devises?.eurRate ?? initialSettings.rateEUR,
              rateUSD: apiSettings.devises?.usdRate ?? initialSettings.rateUSD,
              rateGBP: apiSettings.devises?.gbpRate ?? initialSettings.rateGBP,
              // Legal
              companyName: apiSettings.legal?.companyLegalName ?? initialSettings.companyName,
              companyIce: apiSettings.legal?.ice ?? initialSettings.companyIce,
              companyRc: apiSettings.legal?.rc ?? initialSettings.companyRc,
              companyTaxId: apiSettings.legal?.taxId ?? initialSettings.companyTaxId,
              companyPatente: apiSettings.legal?.patente ?? initialSettings.companyPatente,
              companyCnss: apiSettings.legal?.cnss ?? initialSettings.companyCnss,
              legalAddress: apiSettings.legal?.legalAddress ?? initialSettings.legalAddress,
              // Emails
              adminEmail: apiSettings.emails?.adminEmail ?? initialSettings.adminEmail,
              fromEmail: apiSettings.emails?.fromEmail ?? initialSettings.fromEmail,
              fromName: apiSettings.emails?.fromName ?? initialSettings.fromName,
              smtpHost: apiSettings.emails?.smtpHost ?? initialSettings.smtpHost,
              smtpPort: apiSettings.emails?.smtpPort ?? initialSettings.smtpPort,
              smtpUser: apiSettings.emails?.smtpUser ?? initialSettings.smtpUser,
              smtpPassword: apiSettings.emails?.smtpPassword ?? initialSettings.smtpPassword,
              smtpSecure: apiSettings.emails?.smtpSecure ?? initialSettings.smtpSecure,
            };
            setSettings(loadedSettings);
            setOriginalSettings(loadedSettings);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Check for unsaved changes per tab
  const hasUnsavedChanges: Partial<Record<SettingsTab, boolean>> = {
    general:
      settings.siteName !== originalSettings.siteName ||
      settings.siteDescription !== originalSettings.siteDescription ||
      settings.tagline !== originalSettings.tagline ||
      settings.yearFounded !== originalSettings.yearFounded ||
      settings.logo !== originalSettings.logo ||
      settings.logoHeader !== originalSettings.logoHeader ||
      settings.logoFooter !== originalSettings.logoFooter ||
      settings.favicon !== originalSettings.favicon,
    contact:
      settings.phone !== originalSettings.phone ||
      settings.email !== originalSettings.email ||
      settings.address !== originalSettings.address ||
      settings.whatsapp !== originalSettings.whatsapp ||
      settings.openingHours !== originalSettings.openingHours,
    social:
      settings.facebook !== originalSettings.facebook ||
      settings.instagram !== originalSettings.instagram ||
      settings.youtube !== originalSettings.youtube ||
      settings.twitter !== originalSettings.twitter ||
      settings.tiktok !== originalSettings.tiktok ||
      settings.pinterest !== originalSettings.pinterest ||
      settings.linkedin !== originalSettings.linkedin,
    shipping:
      settings.shippingEnabled !== originalSettings.shippingEnabled ||
      JSON.stringify(settings.shippingZones) !== JSON.stringify(originalSettings.shippingZones),
    payment:
      settings.stripeEnabled !== originalSettings.stripeEnabled ||
      settings.stripePublicKey !== originalSettings.stripePublicKey ||
      settings.stripeSecretKey !== originalSettings.stripeSecretKey ||
      settings.codEnabled !== originalSettings.codEnabled ||
      settings.codFee !== originalSettings.codFee,
    seo:
      settings.defaultMetaTitle !== originalSettings.defaultMetaTitle ||
      settings.defaultMetaDescription !== originalSettings.defaultMetaDescription ||
      settings.robotsTxt !== originalSettings.robotsTxt ||
      settings.googleSiteVerification !== originalSettings.googleSiteVerification,
    tracking:
      settings.googleAnalyticsId !== originalSettings.googleAnalyticsId ||
      settings.googleAnalyticsEnabled !== originalSettings.googleAnalyticsEnabled ||
      settings.googleTagManagerId !== originalSettings.googleTagManagerId ||
      settings.googleTagManagerEnabled !== originalSettings.googleTagManagerEnabled ||
      settings.facebookPixelId !== originalSettings.facebookPixelId ||
      settings.facebookPixelEnabled !== originalSettings.facebookPixelEnabled ||
      settings.tiktokPixelId !== originalSettings.tiktokPixelId ||
      settings.tiktokPixelEnabled !== originalSettings.tiktokPixelEnabled ||
      settings.pinterestTagId !== originalSettings.pinterestTagId ||
      settings.pinterestTagEnabled !== originalSettings.pinterestTagEnabled,
    boutique:
      settings.productsPerPage !== originalSettings.productsPerPage ||
      settings.defaultSort !== originalSettings.defaultSort ||
      settings.enableReviews !== originalSettings.enableReviews ||
      settings.reviewsRequireApproval !== originalSettings.reviewsRequireApproval ||
      settings.enableWishlist !== originalSettings.enableWishlist ||
      settings.showStock !== originalSettings.showStock ||
      settings.lowStockThreshold !== originalSettings.lowStockThreshold ||
      settings.taxRate !== originalSettings.taxRate ||
      settings.taxIncluded !== originalSettings.taxIncluded,
    notifications:
      settings.notifyNewOrder !== originalSettings.notifyNewOrder ||
      settings.notifyOrderStatus !== originalSettings.notifyOrderStatus ||
      settings.notifyLowStock !== originalSettings.notifyLowStock ||
      settings.notifyNewMessage !== originalSettings.notifyNewMessage ||
      settings.notifyNewQuote !== originalSettings.notifyNewQuote ||
      settings.notifyCustomerOrderConfirm !== originalSettings.notifyCustomerOrderConfirm ||
      settings.notifyCustomerShipping !== originalSettings.notifyCustomerShipping ||
      settings.notifyCustomerDelivery !== originalSettings.notifyCustomerDelivery ||
      settings.enableWhatsappAlerts !== originalSettings.enableWhatsappAlerts ||
      settings.whatsappAlertNumber !== originalSettings.whatsappAlertNumber,
    devises:
      settings.defaultCurrency !== originalSettings.defaultCurrency ||
      settings.enableMultiCurrency !== originalSettings.enableMultiCurrency ||
      settings.autoUpdateRates !== originalSettings.autoUpdateRates ||
      settings.rateEUR !== originalSettings.rateEUR ||
      settings.rateUSD !== originalSettings.rateUSD ||
      settings.rateGBP !== originalSettings.rateGBP,
    legal:
      settings.companyName !== originalSettings.companyName ||
      settings.companyIce !== originalSettings.companyIce ||
      settings.companyRc !== originalSettings.companyRc ||
      settings.companyTaxId !== originalSettings.companyTaxId ||
      settings.companyPatente !== originalSettings.companyPatente ||
      settings.companyCnss !== originalSettings.companyCnss ||
      settings.legalAddress !== originalSettings.legalAddress,
    emails:
      settings.adminEmail !== originalSettings.adminEmail ||
      settings.fromEmail !== originalSettings.fromEmail ||
      settings.fromName !== originalSettings.fromName ||
      settings.smtpHost !== originalSettings.smtpHost ||
      settings.smtpPort !== originalSettings.smtpPort ||
      settings.smtpUser !== originalSettings.smtpUser ||
      settings.smtpPassword !== originalSettings.smtpPassword ||
      settings.smtpSecure !== originalSettings.smtpSecure,
  };

  const hasAnyUnsavedChanges = Object.values(hasUnsavedChanges).some(Boolean);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // Structure settings into groups for the API
      const settingsPayload = {
        settings: {
          general: {
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            tagline: settings.tagline,
            yearFounded: settings.yearFounded,
            logoHeader: settings.logoHeader,
            logoFooter: settings.logoFooter,
            favicon: settings.favicon,
          },
          contact: {
            phone: settings.phone,
            email: settings.email,
            address: settings.address,
            whatsapp: settings.whatsapp,
            businessHours: settings.openingHours,
          },
          social: {
            facebook: settings.facebook,
            instagram: settings.instagram,
            youtube: settings.youtube,
            twitter: settings.twitter,
            tiktok: settings.tiktok,
            pinterest: settings.pinterest,
            linkedin: settings.linkedin,
          },
          shipping: {
            enabled: settings.shippingEnabled,
            zones: settings.shippingZones,
          },
          payment: {
            stripeEnabled: settings.stripeEnabled,
            stripePublicKey: settings.stripePublicKey,
            stripeSecretKey: settings.stripeSecretKey,
            codEnabled: settings.codEnabled,
            codFee: settings.codFee,
          },
          seo: {
            defaultMetaTitle: settings.defaultMetaTitle,
            defaultMetaDescription: settings.defaultMetaDescription,
            robotsTxt: settings.robotsTxt,
            googleSiteVerification: settings.googleSiteVerification,
          },
          tracking: {
            googleAnalyticsId: settings.googleAnalyticsId,
            googleAnalyticsEnabled: settings.googleAnalyticsEnabled,
            googleTagManagerId: settings.googleTagManagerId,
            googleTagManagerEnabled: settings.googleTagManagerEnabled,
            facebookPixelId: settings.facebookPixelId,
            facebookPixelEnabled: settings.facebookPixelEnabled,
            tiktokPixelId: settings.tiktokPixelId,
            tiktokPixelEnabled: settings.tiktokPixelEnabled,
            pinterestTagId: settings.pinterestTagId,
            pinterestTagEnabled: settings.pinterestTagEnabled,
          },
          boutique: {
            productsPerPage: settings.productsPerPage,
            defaultSort: settings.defaultSort,
            enableReviews: settings.enableReviews,
            reviewsRequireApproval: settings.reviewsRequireApproval,
            enableWishlist: settings.enableWishlist,
            showStockQuantity: settings.showStock,
            lowStockThreshold: settings.lowStockThreshold,
            taxRate: settings.taxRate,
            showPricesWithTax: settings.taxIncluded,
          },
          notifications: {
            notifyNewOrder: settings.notifyNewOrder,
            notifyOrderStatus: settings.notifyOrderStatus,
            notifyLowStock: settings.notifyLowStock,
            notifyNewMessage: settings.notifyNewMessage,
            notifyNewQuote: settings.notifyNewQuote,
            sendOrderConfirmation: settings.notifyCustomerOrderConfirm,
            sendOrderShipped: settings.notifyCustomerShipping,
            whatsappEnabled: settings.enableWhatsappAlerts,
            whatsappNumber: settings.whatsappAlertNumber,
          },
          devises: {
            defaultCurrency: settings.defaultCurrency,
            showCurrencySwitcher: settings.enableMultiCurrency,
            autoUpdateRates: settings.autoUpdateRates,
            eurRate: settings.rateEUR,
            usdRate: settings.rateUSD,
            gbpRate: settings.rateGBP,
            ratesLastUpdated: settings.lastRatesUpdate,
          },
          legal: {
            companyLegalName: settings.companyName,
            ice: settings.companyIce,
            rc: settings.companyRc,
            taxId: settings.companyTaxId,
            patente: settings.companyPatente,
            cnss: settings.companyCnss,
            legalAddress: settings.legalAddress,
          },
          emails: {
            adminEmail: settings.adminEmail,
            fromEmail: settings.fromEmail,
            fromName: settings.fromName,
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUser: settings.smtpUser,
            smtpPassword: settings.smtpPassword,
            smtpSecure: settings.smtpSecure,
          },
        },
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsPayload),
      });

      if (response.ok) {
        setOriginalSettings({ ...settings });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        console.error("Failed to save settings:", errorData);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload - uploads to server and saves permanent URL
  const handleImageUpload = (field: "logo" | "logoHeader" | "logoFooter" | "favicon") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = field === "favicon" ? "image/png,image/x-icon" : "image/png,image/svg+xml,image/jpeg";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Upload to server
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("Upload failed:", error);
            alert(error.error || "Erreur lors du téléchargement");
            return;
          }

          const data = await response.json();
          console.log("✅ Upload success:", data.url);

          // Save the permanent URL (not blob URL)
          setSettings((prev) => ({ ...prev, [field]: data.url }));
        } catch (error) {
          console.error("Upload error:", error);
          alert("Erreur lors du téléchargement du fichier");
        }
      }
    };
    input.click();
  };

  // Render form field
  const renderInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options?: {
      type?: "text" | "email" | "number" | "password" | "textarea";
      placeholder?: string;
      help?: string;
      rows?: number;
      showToggle?: boolean;
      showPassword?: boolean;
      onTogglePassword?: () => void;
    }
  ) => {
    const {
      type = "text",
      placeholder,
      help,
      rows = 3,
      showToggle,
      showPassword,
      onTogglePassword,
    } = options ?? {};

    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        ) : (
          <div className="relative">
            <input
              type={type === "password" && showPassword ? "text" : type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                showToggle && "pe-20"
              )}
            />
            {showToggle && (
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {showPassword ? t.hideKey : t.showKey}
              </button>
            )}
          </div>
        )}
        {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
      </div>
    );
  };

  // Render toggle
  const renderToggle = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
    description?: string
  ) => (
    <div className="flex items-start gap-4">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
          value ? "bg-amber-600" : "bg-gray-300 dark:bg-gray-600"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            value ? (isRTL ? "start-0.5" : "start-5") : (isRTL ? "start-5" : "start-0.5")
          )}
        />
      </button>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );

  // Render select
  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: { value: string; label: string }[],
    help?: string
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );

  // Render image upload section
  const renderImageUpload = (
    label: string,
    value: string | null,
    field: "logo" | "logoHeader" | "logoFooter" | "favicon",
    help: string,
    dimensions: { width: number; height: number }
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <Image
              src={value}
              alt={label}
              width={dimensions.width}
              height={dimensions.height}
              className="rounded-lg border bg-white object-contain p-2"
            />
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, [field]: null }))}
              className="absolute -end-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleImageUpload(field)}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-sm text-gray-600 hover:border-amber-500 hover:text-amber-600 dark:border-gray-600 dark:text-gray-400"
          >
            <Upload className="h-5 w-5" />
            {t.uploadLogo}
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">{help}</p>
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.general}
            </h2>

            {renderInput(t.siteName, settings.siteName, (v) =>
              setSettings((prev) => ({ ...prev, siteName: v }))
            )}

            {renderInput(
              t.siteDescription,
              settings.siteDescription,
              (v) => setSettings((prev) => ({ ...prev, siteDescription: v })),
              { type: "textarea", rows: 2 }
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.tagline,
                settings.tagline,
                (v) => setSettings((prev) => ({ ...prev, tagline: v })),
                { placeholder: t.taglinePlaceholder }
              )}

              {renderInput(
                t.yearFounded,
                settings.yearFounded,
                (v) => setSettings((prev) => ({ ...prev, yearFounded: v })),
                { type: "number" }
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Logo Header */}
            {renderImageUpload(t.logoHeader, settings.logoHeader, "logoHeader", t.logoHelp, { width: 200, height: 60 })}

            {/* Logo Footer */}
            {renderImageUpload(t.logoFooter, settings.logoFooter, "logoFooter", t.logoHelp, { width: 200, height: 60 })}

            {/* Favicon */}
            {renderImageUpload(t.favicon, settings.favicon, "favicon", t.faviconHelp, { width: 32, height: 32 })}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.contact}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(t.phone, settings.phone, (v) =>
                setSettings((prev) => ({ ...prev, phone: v }))
              )}

              {renderInput(
                t.email,
                settings.email,
                (v) => setSettings((prev) => ({ ...prev, email: v })),
                { type: "email" }
              )}
            </div>

            {renderInput(
              t.address,
              settings.address,
              (v) => setSettings((prev) => ({ ...prev, address: v })),
              { type: "textarea", placeholder: t.addressPlaceholder, rows: 3 }
            )}

            {renderInput(
              t.whatsapp,
              settings.whatsapp,
              (v) => setSettings((prev) => ({ ...prev, whatsapp: v })),
              { help: t.whatsappHelp }
            )}

            {renderInput(
              t.openingHours,
              settings.openingHours,
              (v) => setSettings((prev) => ({ ...prev, openingHours: v })),
              { type: "textarea", placeholder: t.openingHoursPlaceholder, rows: 3 }
            )}
          </div>
        );

      case "social":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.social}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.facebook,
                settings.facebook,
                (v) => setSettings((prev) => ({ ...prev, facebook: v })),
                { placeholder: "https://facebook.com/..." }
              )}

              {renderInput(
                t.instagram,
                settings.instagram,
                (v) => setSettings((prev) => ({ ...prev, instagram: v })),
                { placeholder: "https://instagram.com/..." }
              )}

              {renderInput(
                t.youtube,
                settings.youtube,
                (v) => setSettings((prev) => ({ ...prev, youtube: v })),
                { placeholder: "https://youtube.com/..." }
              )}

              {renderInput(
                t.twitter,
                settings.twitter,
                (v) => setSettings((prev) => ({ ...prev, twitter: v })),
                { placeholder: "https://twitter.com/..." }
              )}

              {renderInput(
                t.tiktok,
                settings.tiktok,
                (v) => setSettings((prev) => ({ ...prev, tiktok: v })),
                { placeholder: "https://tiktok.com/@..." }
              )}

              {renderInput(
                t.pinterest,
                settings.pinterest,
                (v) => setSettings((prev) => ({ ...prev, pinterest: v })),
                { placeholder: "https://pinterest.com/..." }
              )}

              {renderInput(
                t.linkedin,
                settings.linkedin,
                (v) => setSettings((prev) => ({ ...prev, linkedin: v })),
                { placeholder: "https://linkedin.com/company/..." }
              )}
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.shipping}
            </h2>

            {renderToggle(
              t.enableShipping,
              settings.shippingEnabled,
              (v) => setSettings((prev) => ({ ...prev, shippingEnabled: v })),
              settings.shippingEnabled ? t.shippingEnabled : t.shippingDisabled
            )}

            {settings.shippingEnabled && (
              <ShippingZonesEditor
                zones={settings.shippingZones}
                onChange={(zones) => setSettings((prev) => ({ ...prev, shippingZones: zones }))}
                locale={locale}
              />
            )}
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.payment}
            </h2>

            {/* Stripe */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              {renderToggle(
                t.enableStripe,
                settings.stripeEnabled,
                (v) => setSettings((prev) => ({ ...prev, stripeEnabled: v }))
              )}

              {settings.stripeEnabled && (
                <div className="mt-6 space-y-4">
                  {renderInput(
                    t.stripePublicKey,
                    settings.stripePublicKey,
                    (v) => setSettings((prev) => ({ ...prev, stripePublicKey: v })),
                    { placeholder: "pk_live_..." }
                  )}

                  {renderInput(
                    t.stripeSecretKey,
                    settings.stripeSecretKey,
                    (v) => setSettings((prev) => ({ ...prev, stripeSecretKey: v })),
                    {
                      type: "password",
                      placeholder: "sk_live_...",
                      help: t.stripeSecretKeyHelp,
                      showToggle: true,
                      showPassword: showStripeSecret,
                      onTogglePassword: () => setShowStripeSecret(!showStripeSecret),
                    }
                  )}
                </div>
              )}
            </div>

            {/* COD */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              {renderToggle(
                t.enableCOD,
                settings.codEnabled,
                (v) => setSettings((prev) => ({ ...prev, codEnabled: v }))
              )}

              {settings.codEnabled && (
                <div className="mt-6">
                  {renderInput(
                    t.codFee,
                    String(settings.codFee),
                    (v) => setSettings((prev) => ({ ...prev, codFee: Number(v) || 0 })),
                    { type: "number", help: t.codFeeHelp }
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.seo}
            </h2>

            {renderInput(t.defaultMetaTitle, settings.defaultMetaTitle, (v) =>
              setSettings((prev) => ({ ...prev, defaultMetaTitle: v }))
            )}

            {renderInput(
              t.defaultMetaDescription,
              settings.defaultMetaDescription,
              (v) => setSettings((prev) => ({ ...prev, defaultMetaDescription: v })),
              { type: "textarea", rows: 3 }
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            {renderInput(
              t.googleSiteVerification,
              settings.googleSiteVerification,
              (v) => setSettings((prev) => ({ ...prev, googleSiteVerification: v })),
              { placeholder: t.googleSiteVerificationPlaceholder, help: t.googleSiteVerificationHelp }
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            {renderInput(
              t.robotsTxt,
              settings.robotsTxt,
              (v) => setSettings((prev) => ({ ...prev, robotsTxt: v })),
              { type: "textarea", rows: 6 }
            )}
          </div>
        );

      case "tracking":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.tracking}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t.trackingDescription}</p>
            </div>

            {/* Google Analytics */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Google Analytics 4</h3>
                    <p className="text-sm text-gray-500">Mesurez le trafic et les conversions</p>
                  </div>
                </div>
                {renderToggle("", settings.googleAnalyticsEnabled, (v) =>
                  setSettings((prev) => ({ ...prev, googleAnalyticsEnabled: v }))
                )}
              </div>
              {settings.googleAnalyticsEnabled && (
                <div className="mt-4">
                  {renderInput(
                    t.googleAnalyticsId,
                    settings.googleAnalyticsId,
                    (v) => setSettings((prev) => ({ ...prev, googleAnalyticsId: v })),
                    { placeholder: t.googleAnalyticsPlaceholder }
                  )}
                </div>
              )}
            </div>

            {/* Google Tag Manager */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Google Tag Manager</h3>
                    <p className="text-sm text-gray-500">Gerez tous vos tags en un seul endroit</p>
                  </div>
                </div>
                {renderToggle("", settings.googleTagManagerEnabled, (v) =>
                  setSettings((prev) => ({ ...prev, googleTagManagerEnabled: v }))
                )}
              </div>
              {settings.googleTagManagerEnabled && (
                <div className="mt-4">
                  {renderInput(
                    t.googleTagManagerId,
                    settings.googleTagManagerId,
                    (v) => setSettings((prev) => ({ ...prev, googleTagManagerId: v })),
                    { placeholder: t.googleTagManagerPlaceholder }
                  )}
                </div>
              )}
            </div>

            {/* Facebook Pixel */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Facebook Pixel</h3>
                    <p className="text-sm text-gray-500">Suivez les conversions Facebook/Instagram</p>
                  </div>
                </div>
                {renderToggle("", settings.facebookPixelEnabled, (v) =>
                  setSettings((prev) => ({ ...prev, facebookPixelEnabled: v }))
                )}
              </div>
              {settings.facebookPixelEnabled && (
                <div className="mt-4">
                  {renderInput(
                    t.facebookPixelId,
                    settings.facebookPixelId,
                    (v) => setSettings((prev) => ({ ...prev, facebookPixelId: v })),
                    { placeholder: t.facebookPixelPlaceholder }
                  )}
                </div>
              )}
            </div>

            {/* TikTok Pixel */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 dark:bg-gray-700">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">TikTok Pixel</h3>
                    <p className="text-sm text-gray-500">Suivez les conversions TikTok</p>
                  </div>
                </div>
                {renderToggle("", settings.tiktokPixelEnabled, (v) =>
                  setSettings((prev) => ({ ...prev, tiktokPixelEnabled: v }))
                )}
              </div>
              {settings.tiktokPixelEnabled && (
                <div className="mt-4">
                  {renderInput(
                    t.tiktokPixelId,
                    settings.tiktokPixelId,
                    (v) => setSettings((prev) => ({ ...prev, tiktokPixelId: v })),
                    { placeholder: t.tiktokPixelPlaceholder }
                  )}
                </div>
              )}
            </div>

            {/* Pinterest Tag */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0a12 12 0 00-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.43-6.08s-.36-.73-.36-1.81c0-1.7.98-2.96 2.2-2.96 1.04 0 1.54.78 1.54 1.71 0 1.04-.66 2.6-1 4.05-.29 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.25 3.78-5.5 0-2.87-2.06-4.88-5-4.88-3.42 0-5.42 2.56-5.42 5.21 0 1.03.4 2.14.89 2.74.1.12.11.23.08.35l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.69-2.43-2.88-2.43-4.64 0-3.77 2.74-7.23 7.9-7.23 4.14 0 7.36 2.95 7.36 6.9 0 4.11-2.6 7.43-6.2 7.43-1.21 0-2.35-.63-2.74-1.37l-.75 2.84c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1012 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Pinterest Tag</h3>
                    <p className="text-sm text-gray-500">Suivez les conversions Pinterest</p>
                  </div>
                </div>
                {renderToggle("", settings.pinterestTagEnabled, (v) =>
                  setSettings((prev) => ({ ...prev, pinterestTagEnabled: v }))
                )}
              </div>
              {settings.pinterestTagEnabled && (
                <div className="mt-4">
                  {renderInput(
                    t.pinterestTagId,
                    settings.pinterestTagId,
                    (v) => setSettings((prev) => ({ ...prev, pinterestTagId: v })),
                    { placeholder: t.pinterestTagPlaceholder }
                  )}
                </div>
              )}
            </div>

            {/* Test Button */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <Info className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.testTrackingHelp}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log("Testing tracking pixels...");
                  if (typeof window !== "undefined") {
                    if (window.gtag) console.log("✓ Google Analytics loaded");
                    if (window.fbq) console.log("✓ Facebook Pixel loaded");
                    if (window.ttq) console.log("✓ TikTok Pixel loaded");
                    if (window.pintrk) console.log("✓ Pinterest Tag loaded");
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <TestTube className="h-4 w-4" />
                {t.testTracking}
              </button>
            </div>
          </div>
        );

      case "boutique":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.boutique}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t.boutiqueDescription}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.productsPerPage,
                String(settings.productsPerPage),
                (v) => setSettings((prev) => ({ ...prev, productsPerPage: Number(v) || 12 })),
                { type: "number", help: t.productsPerPageHelp }
              )}

              {renderSelect(
                t.defaultSort,
                settings.defaultSort,
                (v) => setSettings((prev) => ({ ...prev, defaultSort: v })),
                [
                  { value: "newest", label: t.sortNewest },
                  { value: "oldest", label: t.sortOldest },
                  { value: "price_asc", label: t.sortPriceLow },
                  { value: "price_desc", label: t.sortPriceHigh },
                  { value: "name_asc", label: t.sortNameAZ },
                  { value: "name_desc", label: t.sortNameZA },
                ]
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="space-y-4">
              {renderToggle(
                t.enableReviews,
                settings.enableReviews,
                (v) => setSettings((prev) => ({ ...prev, enableReviews: v }))
              )}

              {settings.enableReviews && (
                <div className="ms-11">
                  {renderToggle(
                    t.reviewsRequireApproval,
                    settings.reviewsRequireApproval,
                    (v) => setSettings((prev) => ({ ...prev, reviewsRequireApproval: v }))
                  )}
                </div>
              )}

              {renderToggle(
                t.enableWishlist,
                settings.enableWishlist,
                (v) => setSettings((prev) => ({ ...prev, enableWishlist: v }))
              )}

              {renderToggle(
                t.showStock,
                settings.showStock,
                (v) => setSettings((prev) => ({ ...prev, showStock: v }))
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.lowStockThreshold,
                String(settings.lowStockThreshold),
                (v) => setSettings((prev) => ({ ...prev, lowStockThreshold: Number(v) || 5 })),
                { type: "number", help: t.lowStockThresholdHelp }
              )}

              {renderInput(
                t.taxRate,
                String(settings.taxRate),
                (v) => setSettings((prev) => ({ ...prev, taxRate: Number(v) || 0 })),
                { type: "number", help: t.taxRateHelp }
              )}
            </div>

            {renderToggle(
              t.taxIncluded,
              settings.taxIncluded,
              (v) => setSettings((prev) => ({ ...prev, taxIncluded: v }))
            )}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.notifications}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t.notificationsDescription}</p>
            </div>

            {/* Admin Email Notifications */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
                {t.emailNotifications}
              </h3>
              <div className="space-y-4">
                {renderToggle(
                  t.notifyNewOrder,
                  settings.notifyNewOrder,
                  (v) => setSettings((prev) => ({ ...prev, notifyNewOrder: v })),
                  t.notifyNewOrderHelp
                )}
                {renderToggle(
                  t.notifyOrderStatus,
                  settings.notifyOrderStatus,
                  (v) => setSettings((prev) => ({ ...prev, notifyOrderStatus: v })),
                  t.notifyOrderStatusHelp
                )}
                {renderToggle(
                  t.notifyLowStock,
                  settings.notifyLowStock,
                  (v) => setSettings((prev) => ({ ...prev, notifyLowStock: v })),
                  t.notifyLowStockHelp
                )}
                {renderToggle(
                  t.notifyNewMessage,
                  settings.notifyNewMessage,
                  (v) => setSettings((prev) => ({ ...prev, notifyNewMessage: v })),
                  t.notifyNewMessageHelp
                )}
                {renderToggle(
                  t.notifyNewQuote,
                  settings.notifyNewQuote,
                  (v) => setSettings((prev) => ({ ...prev, notifyNewQuote: v })),
                  t.notifyNewQuoteHelp
                )}
              </div>
            </div>

            {/* Customer Notifications */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
                {t.customerNotifications}
              </h3>
              <div className="space-y-4">
                {renderToggle(
                  t.notifyCustomerOrderConfirm,
                  settings.notifyCustomerOrderConfirm,
                  (v) => setSettings((prev) => ({ ...prev, notifyCustomerOrderConfirm: v }))
                )}
                {renderToggle(
                  t.notifyCustomerShipping,
                  settings.notifyCustomerShipping,
                  (v) => setSettings((prev) => ({ ...prev, notifyCustomerShipping: v }))
                )}
                {renderToggle(
                  t.notifyCustomerDelivery,
                  settings.notifyCustomerDelivery,
                  (v) => setSettings((prev) => ({ ...prev, notifyCustomerDelivery: v }))
                )}
              </div>
            </div>

            {/* WhatsApp Notifications */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">
                {t.whatsappNotifications}
              </h3>
              <div className="space-y-4">
                {renderToggle(
                  t.enableWhatsappAlerts,
                  settings.enableWhatsappAlerts,
                  (v) => setSettings((prev) => ({ ...prev, enableWhatsappAlerts: v }))
                )}
                {settings.enableWhatsappAlerts && (
                  <div className="mt-4">
                    {renderInput(
                      t.whatsappAlertNumber,
                      settings.whatsappAlertNumber,
                      (v) => setSettings((prev) => ({ ...prev, whatsappAlertNumber: v })),
                      { placeholder: "+212612345678" }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "devises":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.devises}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t.devisesDescription}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {renderSelect(
                t.defaultCurrency,
                settings.defaultCurrency,
                (v) => setSettings((prev) => ({ ...prev, defaultCurrency: v })),
                [
                  { value: "MAD", label: t.currencyMAD },
                  { value: "EUR", label: t.currencyEUR },
                  { value: "USD", label: t.currencyUSD },
                  { value: "GBP", label: t.currencyGBP },
                ]
              )}
            </div>

            <div className="space-y-4">
              {renderToggle(
                t.enableMultiCurrency,
                settings.enableMultiCurrency,
                (v) => setSettings((prev) => ({ ...prev, enableMultiCurrency: v }))
              )}

              {renderToggle(
                t.autoUpdateRates,
                settings.autoUpdateRates,
                (v) => setSettings((prev) => ({ ...prev, autoUpdateRates: v }))
              )}
            </div>

            {settings.enableMultiCurrency && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t.exchangeRates}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {t.lastRatesUpdate}: {new Date(settings.lastRatesUpdate).toLocaleDateString(locale)}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        // In production, fetch real rates from API
                        setSettings((prev) => ({ ...prev, lastRatesUpdate: new Date().toISOString() }));
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t.updateRatesNow}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">EUR</span>
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t.rateHelp}</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={settings.rateEUR}
                        onChange={(e) => setSettings((prev) => ({ ...prev, rateEUR: Number(e.target.value) || 0 }))}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">USD</span>
                      <span className="text-sm text-gray-500">$</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t.rateHelp}</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={settings.rateUSD}
                        onChange={(e) => setSettings((prev) => ({ ...prev, rateUSD: Number(e.target.value) || 0 }))}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">GBP</span>
                      <span className="text-sm text-gray-500">£</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t.rateHelp}</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={settings.rateGBP}
                        onChange={(e) => setSettings((prev) => ({ ...prev, rateGBP: Number(e.target.value) || 0 }))}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "legal":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.legal}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t.legalDescription}</p>
            </div>

            {renderInput(t.companyName, settings.companyName, (v) =>
              setSettings((prev) => ({ ...prev, companyName: v }))
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.companyIce,
                settings.companyIce,
                (v) => setSettings((prev) => ({ ...prev, companyIce: v })),
                { placeholder: t.companyIcePlaceholder }
              )}

              {renderInput(
                t.companyRc,
                settings.companyRc,
                (v) => setSettings((prev) => ({ ...prev, companyRc: v })),
                { placeholder: t.companyRcPlaceholder }
              )}

              {renderInput(
                t.companyTaxId,
                settings.companyTaxId,
                (v) => setSettings((prev) => ({ ...prev, companyTaxId: v })),
                { placeholder: t.companyTaxIdPlaceholder }
              )}

              {renderInput(
                t.companyPatente,
                settings.companyPatente,
                (v) => setSettings((prev) => ({ ...prev, companyPatente: v })),
                { placeholder: t.companyPatentePlaceholder }
              )}

              {renderInput(
                t.companyCnss,
                settings.companyCnss,
                (v) => setSettings((prev) => ({ ...prev, companyCnss: v })),
                { placeholder: t.companyCnssPlaceholder }
              )}
            </div>

            {renderInput(
              t.legalAddress,
              settings.legalAddress,
              (v) => setSettings((prev) => ({ ...prev, legalAddress: v })),
              { type: "textarea", rows: 3 }
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Policy Links */}
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href={`/${locale}/conditions`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <span className="font-medium text-gray-900 dark:text-white">{t.editTerms}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>

              <a
                href={`/${locale}/confidentialite`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <span className="font-medium text-gray-900 dark:text-white">{t.editPrivacy}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>
        );

      case "emails":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.emails}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(
                t.adminEmail,
                settings.adminEmail,
                (v) => setSettings((prev) => ({ ...prev, adminEmail: v })),
                { type: "email" }
              )}

              {renderInput(
                t.fromEmail,
                settings.fromEmail,
                (v) => setSettings((prev) => ({ ...prev, fromEmail: v })),
                { type: "email" }
              )}
            </div>

            {renderInput(t.fromName, settings.fromName, (v) =>
              setSettings((prev) => ({ ...prev, fromName: v }))
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(t.smtpHost, settings.smtpHost, (v) =>
                setSettings((prev) => ({ ...prev, smtpHost: v }))
              )}

              {renderInput(
                t.smtpPort,
                String(settings.smtpPort),
                (v) => setSettings((prev) => ({ ...prev, smtpPort: Number(v) || 587 })),
                { type: "number" }
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {renderInput(t.smtpUser, settings.smtpUser, (v) =>
                setSettings((prev) => ({ ...prev, smtpUser: v }))
              )}

              {renderInput(
                t.smtpPassword,
                settings.smtpPassword,
                (v) => setSettings((prev) => ({ ...prev, smtpPassword: v })),
                {
                  type: "password",
                  showToggle: true,
                  showPassword: showSmtpPassword,
                  onTogglePassword: () => setShowSmtpPassword(!showSmtpPassword),
                }
              )}
            </div>

            {renderToggle(
              t.smtpSecure,
              settings.smtpSecure,
              (v) => setSettings((prev) => ({ ...prev, smtpSecure: v }))
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await fetch("/api/settings/test-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: settings.adminEmail }),
                  });
                  if (response.ok) {
                    alert(t.testEmailSent);
                  } else {
                    alert(t.testEmailFailed);
                  }
                } catch {
                  alert(t.testEmailFailed);
                }
              }}
              disabled={!settings.adminEmail || !settings.smtpHost}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {t.testEmail}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasAnyUnsavedChanges && (
            <span className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              {t.unsavedChanges}
            </span>
          )}

          {saved && (
            <span className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              {t.saved}
            </span>
          )}

          <Button
            onClick={() => void handleSave()}
            disabled={saving || !hasAnyUnsavedChanges}
          >
            {saving ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Tabs */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasUnsavedChanges={hasUnsavedChanges}
            locale={locale}
          />
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
