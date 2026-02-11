# 🌍 Auto-Detection System Documentation

## Overview

The LE TATCHE BOIS website automatically detects visitors' location and language preferences to provide the best possible experience. This system uses **IP geolocation** and **browser language preferences** to automatically set the correct language and currency on first visit.

---

## 🎯 Features

### ✅ Automatic Language Detection
- Detects visitor's country from IP address (via Cloudflare headers)
- Reads browser's Accept-Language header
- Intelligently maps country + browser preference to best language
- Supports: **French (fr)**, **English (en)**, **Spanish (es)**, **Arabic (ar)**

### ✅ Automatic Currency Detection
- Sets currency based on visitor's country
- Supports: **MAD** (Morocco), **EUR** (Europe), **USD** (default), **GBP** (UK)
- All prices stored in MAD, converted in real-time

### ✅ Smart Priority System
1. **Manual user choice** (highest priority - always respected)
2. **Auto-detected preference** (cached for return visits)
3. **Live detection** (only on first visit)
4. **Default fallback** (French + MAD)

### ✅ SEO-Friendly
- Bots/crawlers always see the default French version
- No redirects for search engines
- Proper hreflang tags maintained

---

## 📋 How It Works

### First Visit Flow

```
1. Visitor opens https://letatchebois.com
   ↓
2. Middleware reads Cloudflare CF-IPCountry header (e.g., "MA" for Morocco)
   ↓
3. Middleware reads Accept-Language header (e.g., "ar,fr;q=0.9")
   ↓
4. System detects: Morocco + Arabic preference → Redirect to /ar/
   ↓
5. System detects currency: Morocco → MAD
   ↓
6. Cookies set:
   - auto-detected-locale: ar
   - auto-detected-currency: MAD
   - detected-country: MA
   ↓
7. User sees Arabic site with MAD prices
   ↓
8. Banner shows: "🌍 Detected Morocco. Showing Arabic with Dirham prices"
```

### Return Visit Flow

```
1. Visitor returns to https://letatchebois.com
   ↓
2. Middleware reads auto-detected-locale cookie: "ar"
   ↓
3. Immediately redirects to /ar/ (no re-detection needed)
   ↓
4. No banner shown (already dismissed or visited before)
```

### Manual Override Flow

```
1. User clicks language switcher → Switches to English
   ↓
2. Cookie set: preferred-locale: en
   ↓
3. On next visit, middleware reads preferred-locale
   ↓
4. User ALWAYS sees English, even if IP suggests Morocco
   (Manual choice takes absolute priority)
```

---

## 🗺️ Country → Language Mapping

### Arabic (ar)
**Gulf & Middle East:**
- 🇸🇦 Saudi Arabia, 🇦🇪 UAE, 🇶🇦 Qatar, 🇰🇼 Kuwait, 🇧🇭 Bahrain, 🇴🇲 Oman
- 🇯🇴 Jordan, 🇱🇧 Lebanon, 🇮🇶 Iraq, 🇸🇾 Syria, 🇵🇸 Palestine
- 🇪🇬 Egypt, 🇱🇾 Libya, 🇸🇩 Sudan, 🇾🇪 Yemen

### French (fr)
**Maghreb & Francophone:**
- 🇲🇦 Morocco (special case: fr or ar based on browser)
- 🇫🇷 France, 🇧🇪 Belgium, 🇨🇭 Switzerland
- 🇹🇳 Tunisia, 🇩🇿 Algeria, 🇸🇳 Senegal
- 🇨🇮 Côte d'Ivoire, 🇨🇲 Cameroon, 🇨🇩 DR Congo
- All other French-speaking African countries

### Spanish (es)
**Spain & Latin America:**
- 🇪🇸 Spain, 🇲🇽 Mexico, 🇨🇴 Colombia, 🇦🇷 Argentina
- 🇨🇱 Chile, 🇵🇪 Peru, 🇻🇪 Venezuela, 🇪🇨 Ecuador
- 🇬🇹 Guatemala, 🇨🇷 Costa Rica, 🇺🇾 Uruguay
- All other Spanish-speaking countries

### English (en) - Default
**Rest of the World:**
- 🇬🇧 UK, 🇺🇸 USA, 🇨🇦 Canada (if browser = en)
- 🇦🇺 Australia, 🇩🇪 Germany, 🇳🇱 Netherlands
- 🇮🇹 Italy, 🇵🇹 Portugal, 🇧🇷 Brazil
- 🇯🇵 Japan, 🇨🇳 China, 🇮🇳 India
- **All other countries**

---

## 💰 Country → Currency Mapping

### MAD (Moroccan Dirham)
- 🇲🇦 Morocco only

### EUR (Euro)
- 🇫🇷 France, 🇪🇸 Spain, 🇩🇪 Germany, 🇮🇹 Italy, 🇳🇱 Netherlands
- 🇧🇪 Belgium, 🇵🇹 Portugal, 🇦🇹 Austria, 🇮🇪 Ireland
- All Eurozone countries + French-speaking Africa

### GBP (British Pound)
- 🇬🇧 United Kingdom only

### USD (US Dollar) - Default
- 🇺🇸 USA, 🇨🇦 Canada, 🇦🇺 Australia
- Gulf countries (🇸🇦 🇦🇪 🇶🇦 etc.)
- Latin America (🇲🇽 🇧🇷 etc.)
- Asia (🇯🇵 🇨🇳 🇮🇳 etc.)
- **All other countries**

---

## 🍪 Cookies Used

| Cookie Name | Purpose | Duration | Priority |
|------------|---------|----------|----------|
| `preferred-locale` | User's manual language choice | 1 year | **Highest** |
| `auto-detected-locale` | Auto-detected language on first visit | 1 year | Medium |
| `auto-detected-currency` | Auto-detected currency on first visit | 1 year | Medium |
| `detected-country` | Country code for analytics/debugging | 1 year | Low |
| `geo-banner-dismissed` | User dismissed the geo banner | 1 year | Low |

### localStorage Used

| Key | Purpose | Priority |
|-----|---------|----------|
| `manual-currency-choice` | User's manual currency choice | **Highest** |

---

## 🔧 Technical Implementation

### Files Created/Modified

1. **`src/lib/geo-detection.ts`** (NEW)
   - Country/language/currency mapping functions
   - Browser language parsing
   - Bot detection
   - Cookie helpers

2. **`src/middleware.ts`** (MODIFIED)
   - Added geo-detection logic before intl middleware
   - Reads Cloudflare `CF-IPCountry` header
   - Sets auto-detection cookies on first visit
   - Respects manual preferences

3. **`src/components/providers/CurrencyInitializer.tsx`** (NEW)
   - Client component that sets currency on page load
   - Checks manual choice → auto-detected → default

4. **`src/components/ui/GeoDetectionBanner.tsx`** (NEW)
   - Shows "Detected Morocco. Showing Arabic..." banner
   - Auto-dismisses after 8 seconds
   - Remembers dismissal in cookie

5. **`src/components/layout/Header.tsx`** (MODIFIED)
   - Language switcher saves `preferred-locale` cookie
   - Currency switcher saves `manual-currency-choice` localStorage

6. **`src/app/[locale]/(public)/layout.tsx`** (MODIFIED)
   - Renders `<CurrencyInitializer />` and `<GeoDetectionBanner />`

---

## 🚀 Usage Examples

### Example 1: Visitor from Saudi Arabia
```
IP: 185.12.34.56 (Saudi Arabia)
Browser: Chrome (Accept-Language: ar-SA,ar;q=0.9,en;q=0.8)

Detection:
- Country: SA → Arabic
- Browser: ar-SA confirms Arabic
- Currency: SA → USD

Result: Redirect to /ar/ with USD prices
Banner: "🌍 Detected Saudi Arabia. Showing Arabic with Dollar prices"
```

### Example 2: Visitor from France
```
IP: 80.12.34.56 (France)
Browser: Firefox (Accept-Language: fr-FR,fr;q=0.9)

Detection:
- Country: FR → French
- Browser: fr confirms French
- Currency: FR → EUR

Result: Redirect to /fr/ with EUR prices
Banner: "🌍 Detected France. Showing French with Euro prices"
```

### Example 3: Visitor from USA with Spanish browser
```
IP: 104.12.34.56 (USA)
Browser: Chrome (Accept-Language: es-US,es;q=0.9,en;q=0.8)

Detection:
- Country: US → English (default)
- Browser: es → OVERRIDE to Spanish (user preference clear)
- Currency: US → USD

Result: Redirect to /es/ with USD prices
Banner: "🌍 Detected United States. Showing Spanish with Dollar prices"
```

### Example 4: Visitor manually switches language
```
Initial: Auto-detected Arabic (Morocco)
User Action: Clicks language switcher → Switches to English

Cookies set:
- preferred-locale: en (HIGHEST PRIORITY)

Next visit:
- Middleware reads preferred-locale: en
- User ALWAYS sees English, ignoring IP/browser
- Auto-detection never runs again
```

---

## 🤖 Bot/Crawler Handling

**All bots see the default French version** (for SEO):
- Googlebot → French
- Bingbot → French
- DuckDuckGo → French
- Facebook/Twitter crawlers → French

**Detection:** Checks User-Agent for common bot patterns (googlebot, bingbot, crawler, spider, etc.)

**Why:** Ensures search engines index the primary French version with proper hreflang tags.

---

## 🎨 Geo Detection Banner

### Appearance
- **Position:** Fixed bottom banner
- **Colors:** Amber/orange gradient (matches site theme)
- **Animation:** Slides up from bottom
- **Auto-hide:** After 8 seconds
- **Dismissible:** Close button (X)

### Translations
- **French:** "🌍 Nous avons détecté que vous visitez depuis Maroc..."
- **English:** "🌍 We detected you're visiting from Morocco..."
- **Spanish:** "🌍 Detectamos que estás visitando desde Marruecos..."
- **Arabic:** "🌍 اكتشفنا أنك تزور من المغرب..."

### Links
- "Change language" → Opens language switcher dropdown
- "Change currency" → Opens currency switcher dropdown

---

## ⚙️ Configuration

### Cloudflare Setup (Recommended)
Ensure your domain is behind Cloudflare. The middleware automatically reads the `CF-IPCountry` header.

No API calls needed. No costs. Instant detection.

### Vercel Setup (Alternative)
If deployed on Vercel, the middleware also checks for `x-vercel-ip-country` header.

### Fallback (No Headers)
If neither Cloudflare nor Vercel headers are present:
- Defaults to browser language detection only
- Final fallback: French + MAD

---

## 🧪 Testing

### Test Different Countries
Use a VPN to test different locations:

```bash
# Test from Morocco
VPN → Morocco → Open https://letatchebois.com
Expected: Redirect to /fr/ (or /ar/ if browser is Arabic)

# Test from Saudi Arabia
VPN → Saudi Arabia → Open https://letatchebois.com
Expected: Redirect to /ar/ with USD

# Test from USA
VPN → USA → Open https://letatchebois.com
Expected: Redirect to /en/ with USD

# Test from Spain
VPN → Spain → Open https://letatchebois.com
Expected: Redirect to /es/ with EUR
```

### Test Manual Override
```bash
1. Clear all cookies
2. Open site → Auto-detects based on IP
3. Click language switcher → Choose different language
4. Refresh page → Should keep manual choice
5. Clear cookies again → Re-detects
```

### Test Browser Language
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Settings → Languages → Add language and move to top
3. Reload page → Site should detect new browser language
```

---

## 📊 Analytics

### Track Detection Metrics

You can track geo-detection in Google Analytics:

```javascript
// When detection happens
gtag('event', 'geo_detection', {
  country: detectedCountry,
  language: detectedLocale,
  currency: detectedCurrency,
  source: 'auto' | 'manual'
});
```

The `detected-country` cookie is set for all visits and can be used for analytics.

---

## 🐛 Troubleshooting

### Issue: Wrong language detected
**Solution:** Check browser's Accept-Language setting. Or manually switch language (preference will be saved).

### Issue: Banner doesn't show
**Possible causes:**
1. Cookie `geo-banner-dismissed` is set (user dismissed it before)
2. Not a first visit (cookie `auto-detected-locale` exists)
3. Bot/crawler (banner disabled for bots)

**Solution:** Clear all cookies to test as first-time visitor.

### Issue: Currency not auto-set
**Possible causes:**
1. User has manual currency choice in localStorage
2. Currency initializer not rendering

**Solution:** Clear localStorage and refresh.

### Issue: Cloudflare header missing
**Possible causes:**
1. Site not behind Cloudflare
2. Testing on localhost (Cloudflare headers only in production)

**Solution:** Deploy to production with Cloudflare, or use Vercel headers.

---

## 🔒 Privacy & GDPR

### Data Collected
- **IP Address:** Read by Cloudflare/Vercel, converted to 2-letter country code only
- **Browser Language:** From Accept-Language header (standard HTTP header)
- **Country Code:** Stored in cookie for 1 year

### User Control
- Users can dismiss the banner (preference saved)
- Users can manually override language/currency (highest priority)
- No personal data stored (only country code, not full IP)

### GDPR Compliance
- Geo-detection uses non-personal data (country code)
- Cookies are functional (required for site operation)
- Users can clear cookies anytime
- Privacy policy should mention: "We detect your location to show the site in your language"

---

## 📝 Future Enhancements

Possible improvements for v2:

1. **More Currencies:** Add JPY, CNY, INR, etc.
2. **Regional Variants:** en-US vs en-GB, es-ES vs es-MX
3. **A/B Testing:** Test different detection logic
4. **Analytics Dashboard:** Show detection accuracy
5. **Admin Override:** Let admins customize country mappings
6. **Timezone Detection:** Auto-set timezone for event times

---

## 📚 Related Documentation

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Cloudflare Headers](https://developers.cloudflare.com/fundamentals/get-started/reference/cloudflare-headers/)
- [Zustand Persist](https://github.com/pmndrs/zustand#persist-middleware)
- [Accept-Language Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language)

---

## 💡 Best Practices

1. **Always respect manual choice** - Never override user's explicit preference
2. **Test with real users** - Detection logic improves with feedback
3. **Monitor analytics** - Track which countries/languages are most common
4. **Keep fallbacks** - Always have a default (French + MAD)
5. **Don't redirect bots** - SEO is critical
6. **Cache detection** - Don't re-detect on every page load (use cookies)
7. **Make switching easy** - Prominent language/currency switchers
8. **Inform users** - Banner explains what was detected

---

## ✅ Checklist

Before deploying to production:

- [ ] Site is behind Cloudflare (for CF-IPCountry header)
- [ ] Middleware is correctly detecting and redirecting
- [ ] Language switcher saves `preferred-locale` cookie
- [ ] Currency switcher saves `manual-currency-choice` localStorage
- [ ] Banner shows and auto-hides correctly
- [ ] Banner remembers dismissal
- [ ] Bots see default French version
- [ ] Manual preferences always take priority
- [ ] Tested from multiple countries (VPN)
- [ ] Tested with different browser languages
- [ ] Tested manual override flow
- [ ] Analytics tracking works (optional)
- [ ] Privacy policy updated (mentions geo-detection)

---

**Last Updated:** 2026-02-10
**Version:** 1.0
**Author:** Claude Code

