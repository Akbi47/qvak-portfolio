# WordPress Content Inventory — Initial Pass

Source site: `https://quachvoanhkhoa.feaon.com`

This file is an initial migration checklist, not a complete crawl.

## Observed homepage content

Legacy homepage currently contains:

- navigation including Home, Case Studies, Resume, Blog
- intro beginning “Hi There! I am Khoa...”
- Case Studies section
- ATM Seeking sample project
- Blog previews
- About FEAON content
- footer/contact/social destinations

The new IA intentionally differs from the legacy site.

## Migration decisions

### Keep/migrate into MVP

- profile/intro copy as editable source material
- selected project content
- selected resume content
- useful contact/social links
- required images/media

### Not in MVP by default

- legacy Blog UI/content
- old WordPress theme/plugins
- old page-builder markup/styles
- generic About FEAON block unless Khoa explicitly wants it in the personal portfolio

## Critical pre-cutover tasks

- export/backup WordPress database/content
- archive `wp-content/uploads` or at least all portfolio media needed later
- list currently indexed URLs from sitemap/Search Console if available
- decide redirect behavior for `/resume/`
- decide whether legacy blog URLs remain hosted, migrate later, or redirect
- preserve canonical domain behavior

## Redirect worksheet

| Legacy URL | New destination | Status |
|---|---|---|
| `/` | `/` | planned |
| `/resume/` | `/#resume` or dedicated route | decision required |
| `/blog/` | keep/migrate/redirect | decision required |
| case-study URLs | project section/detail/GitHub | inventory required |

## Content still needed from owner before production

- final logo asset
- final GitHub profile URL
- LinkedIn/other social URLs
- public contact fields
- final English/Vietnamese profile copy
- final skill list and icon mapping
- featured project list, screenshots, Live Demo URLs, Code URLs
- complete resume entries and certificate/media images
- downloadable CV file if applicable
- newsletter behavior/provider decision
- Privacy/Terms/Cookies page content or destinations
