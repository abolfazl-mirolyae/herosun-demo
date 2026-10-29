# Herosun website — portfolio demo

Static snapshot of the redesigned website of **Herosun (هیروسان)**, an auto-parts distributor in
south-east Iran. Live site: **https://herosunco.ir**

**Content dashboard demo:** https://abolfazl-mirolyae.github.io/herosun-demo/cms/ — the real CMS front end in its
built-in preview mode, loaded with this snapshot's public content. Edits are kept only in your browser.

This copy is for my portfolio. It is served by GitHub Pages, so forms are switched off, catalogue
PDFs and old catalogue pages open on the live site, and search engines are asked not to index it.

## What I built

- New purple/gold visual identity across the homepage, spare parts, sport & accessories, about,
  events, careers and blog pages (RTL Persian, responsive, reduced-motion aware)
- Custom content dashboard on Yii2 for blog posts, events, brands and PDF catalogues
- Homepage news carousel driven by the latest published blog posts
- Persian (Jalali) dates without external libraries
- Performance work: the spare parts page went from 4.2 MB of HTML to 26 KB
- Unified header and footer for about 250 legacy catalogue pages
- Security and SEO clean-up: production debug output disabled, fake template price metadata
  removed, new sitemap, 301 redirects for duplicate pages

## Stack

PHP 7.4 · Yii2 Advanced · vanilla JavaScript · CSS · MySQL

The production source code is kept in a private repository.
