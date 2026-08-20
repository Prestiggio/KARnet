import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin';
import { routing } from './i18n/routing'

// Combine the app-local .env with the monorepo root .env (shared DB/service
// credentials). dotenv.config() never overrides an already-set var, so the
// local file loaded first takes precedence over the root one.
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  allowedDevOrigins: ["localhost", "127.0.0.1", process.env.BETTER_AUTH_URL as string],
  async redirects() {
    return [
      ...routing.locales
        .filter((locale) => locale !== routing.defaultLocale)
        .map((locale) => ({
          source: '/',
          has: [{ type: 'cookie' as const, key: 'lang', value: locale }],
          destination: `/${locale}`,
          permanent: false,
        })),
      {
        source: '/',
        destination: `/${routing.defaultLocale}`,
        permanent: false,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      ['remark-mdx-frontmatter', {name: 'matter'}],
      'remark-gfm',
      'remark-mdx-toc-default'
    ],
    rehypePlugins: [
      'rehype-slug'
    ]
  }
})

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
