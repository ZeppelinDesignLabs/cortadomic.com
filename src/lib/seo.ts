import siteData from '../content/site.json';

export function youtubeWatchUrl(embedId: string, startAt?: number) {
  const url = new URL(`https://www.youtube.com/watch`);
  url.searchParams.set('v', embedId);
  if (startAt) url.searchParams.set('t', String(startAt));
  return url.toString();
}

export function youtubeThumbnail(embedId: string) {
  return `https://i.ytimg.com/vi/${embedId}/maxresdefault.jpg`;
}

export function buildVideoObjectJsonLd(
  video: { title: string; embedId: string; startAt?: number },
  pageUrl: string,
) {
  if (!video.embedId) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.title,
    thumbnailUrl: youtubeThumbnail(video.embedId),
    uploadDate: '2021-01-01',
    contentUrl: youtubeWatchUrl(video.embedId, video.startAt),
    embedUrl: `https://www.youtube.com/embed/${video.embedId}`,
    publisher: {
      '@type': 'Organization',
      name: siteData.companyName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteData.siteUrl}/images/logos/zeppelin-logo.png`,
      },
    },
  };
}

export function buildVideoListJsonLd(
  videos: Array<{ title: string; embedId: string; startAt?: number }>,
  pageUrl: string,
) {
  return videos
    .filter((v) => v.embedId)
    .map((v) => buildVideoObjectJsonLd(v, pageUrl));
}

export function buildFaqJsonLd(faq: Array<{ question: string; answer: string }>) {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function productMerchantExtras() {
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);
  return {
    priceValidUntil: validUntil.toISOString().split('T')[0],
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      merchantReturnDays: 0,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'USD',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 3,
          maxValue: 10,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 3,
          maxValue: 14,
          unitCode: 'DAY',
        },
      },
    },
  };
}
