import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteData from '../content/site.json';

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: `${siteData.siteName} Blog`,
    description: 'Articles about Cortado contact microphones and professional vibration capture.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
