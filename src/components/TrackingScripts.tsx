"use client";

import Script from "next/script";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface TrackingScriptsProps {
  googleAnalyticsId?: string;
  googleAnalyticsEnabled?: boolean;
  googleTagManagerId?: string;
  googleTagManagerEnabled?: boolean;
  facebookPixelId?: string;
  facebookPixelEnabled?: boolean;
  tiktokPixelId?: string;
  tiktokPixelEnabled?: boolean;
  pinterestTagId?: string;
  pinterestTagEnabled?: boolean;
}

// ═══════════════════════════════════════════════════════════
// TrackingScripts Component
// ═══════════════════════════════════════════════════════════

export function TrackingScripts({
  googleAnalyticsId,
  googleAnalyticsEnabled = true,
  googleTagManagerId,
  googleTagManagerEnabled = true,
  facebookPixelId,
  facebookPixelEnabled = true,
  tiktokPixelId,
  tiktokPixelEnabled = true,
  pinterestTagId,
  pinterestTagEnabled = true,
}: TrackingScriptsProps) {
  return (
    <>
      {/* Google Analytics 4 */}
      {googleAnalyticsId && googleAnalyticsEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {googleTagManagerId && googleTagManagerEnabled && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManagerId}');
            `}
          </Script>
          {/* GTM NoScript fallback - placed in body via noscript */}
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && facebookPixelEnabled && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && tiktokPixelEnabled && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* Pinterest Tag */}
      {pinterestTagId && pinterestTagEnabled && (
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pinterestTagId}');
            pintrk('page');
          `}
        </Script>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// GTM NoScript Component (for body)
// ═══════════════════════════════════════════════════════════

export function GTMNoScript({ gtmId }: { gtmId?: string }) {
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

// ═══════════════════════════════════════════════════════════
// Tracking Event Helpers
// ═══════════════════════════════════════════════════════════

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
    };
    pintrk?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Google Analytics events
export function trackGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Facebook Pixel events
export function trackFBEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

// TikTok Pixel events
export function trackTikTokEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(eventName, params);
  }
}

// Pinterest Tag events
export function trackPinterestEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.pintrk) {
    window.pintrk("track", eventName, params);
  }
}

// Track purchase event across all platforms
export function trackPurchase(data: {
  orderId: string;
  value: number;
  currency: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  // Google Analytics
  trackGAEvent("purchase", "ecommerce", data.orderId, data.value);

  // Facebook Pixel
  trackFBEvent("Purchase", {
    value: data.value,
    currency: data.currency,
    content_ids: data.items?.map((item) => item.id),
    content_type: "product",
  });

  // TikTok Pixel
  trackTikTokEvent("CompletePayment", {
    value: data.value,
    currency: data.currency,
    contents: data.items?.map((item) => ({
      content_id: item.id,
      content_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

// Track add to cart event
export function trackAddToCart(data: {
  productId: string;
  productName: string;
  value: number;
  currency: string;
  quantity: number;
}) {
  // Google Analytics
  trackGAEvent("add_to_cart", "ecommerce", data.productName, data.value);

  // Facebook Pixel
  trackFBEvent("AddToCart", {
    value: data.value,
    currency: data.currency,
    content_ids: [data.productId],
    content_name: data.productName,
    content_type: "product",
  });

  // TikTok Pixel
  trackTikTokEvent("AddToCart", {
    value: data.value,
    currency: data.currency,
    content_id: data.productId,
    content_name: data.productName,
    quantity: data.quantity,
  });
}

// Track page view (for SPA navigation)
export function trackPageView(url: string, title?: string) {
  // Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "GA_MEASUREMENT_ID", {
      page_path: url,
      page_title: title,
    });
  }

  // Facebook Pixel
  trackFBEvent("PageView");

  // TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.page();
  }

  // Pinterest
  if (typeof window !== "undefined" && window.pintrk) {
    window.pintrk("page");
  }
}
