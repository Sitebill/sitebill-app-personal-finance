# Personal Finance — a full-site app for Sitebill

**EN** · A personal finance tracker built as an installable app for [Sitebill](https://sitebillcms.com/) (Community Edition): accounts, income and expenses, categories, monthly budgets and clear reports. It is also the reference example of an app that **owns the whole site** (`shell.mode = "owner"`): its own home page, admin menu and dashboard — no real-estate pages at all. Written end to end by an AI agent that followed only the public instructions at [sitebillcms.com/llms.txt](https://sitebillcms.com/llms.txt).

**RU** · Учёт личных финансов как устанавливаемое приложение для [Sitebill](https://www.sitebill.ru/) (Community Edition): счета, доходы и расходы, категории, месячные бюджеты и наглядные отчёты. Заодно эталонный пример приложения, которое **целиком владеет сайтом** (`shell.mode = "owner"`): своя главная, своё меню админки и дашборд, без страниц недвижимости. Целиком написано ИИ-агентом по открытым инструкциям с [sitebillcms.com/llms.txt](https://sitebillcms.com/llms.txt).

| | |
|---|---|
| 🌍 International | https://sitebillcms.com/ |
| 🇷🇺 Россия и СНГ | https://www.sitebill.ru/ |
| 🧰 App SDK | https://github.com/Sitebill/sitebill-app-sdk |
| 🚀 Starter | https://github.com/Sitebill/sitebill-app-starter |
| 📞 Another example | https://github.com/Sitebill/sitebill-app-callback |

## What you get / Что внутри

- **Home page** — a landing for guests; for the owner (admin) the ledger itself: total balance, income / expenses / net for the month with the savings rate, a spending donut by category, a 6-month income-vs-expense chart, budget bars (green → amber → red when you go over), latest transactions. Month switcher included.
- **Transactions** — add / edit / delete, filter by month, category and text, income vs. expense.
- **Categories & budgets** — emoji icon, colour and an optional monthly limit per expense category.
- **Accounts** — cash, card, savings; each has an opening balance and a live balance.
- **One-click sample data** — six months of realistic transactions, in the language of the interface.
- **Admin panel** — the platform's menu is *replaced* by the app's menu (`adminMenu: replace`), plus a dashboard widget.
- **4 languages** — ru, en, sr, tg (74 identical keys each); the currency follows the language (₽ / $ / RSD / TJS).
- **Light and dark theme** — the CSS is built on the host's theme variables.
- **Privacy by design** — all reads and writes are admin-only (`@guard` + `@can(admin, Tenant)`); every row carries `tenant_id` and is scoped to the site.

Screens (all under the site root): `/` home · `/admin` dashboard · `/admin/x/lumen.personal-finance/transactions` · `…/categories` · `…/accounts`.

## Install / Установка

### 1. A clean instance with Docker (recommended)

`--profile blank` installs the platform **without the real-estate demo**, so the app is the only thing on the site:

```bash
curl -fsSL https://sitebillcms.com/install.sh | sh -s -- --profile blank --json
```

The script prints the site URL and the admin login/password. Then, from the platform directory:

```bash
# build the package (see "Build" below) or download lumen.personal-finance-1.0.0.sbapp from Releases
docker compose cp lumen.personal-finance-1.0.0.sbapp api:/tmp/app.sbapp
docker compose exec api php artisan apps install /tmp/app.sbapp --shell
```

`--shell` lets the app take over the home page and menus (it is the only app that may do that on a site).
Open the site, sign in as the admin and press **“Load sample data”** — done.

> Unsigned packages need `APPS_ALLOW_UNSIGNED=true` in the platform `.env` (the default of Community installs made by `install.sh`).
> Windows + Git Bash: do **not** export `MSYS_NO_PATHCONV=1` globally — set it on a single command if you need it.

### 2. Admin panel

**Apps → Installed apps → Upload your own package** → choose the `.sbapp` (or a zip of this repository).

### 3. Update / remove

```bash
docker compose exec api php artisan apps install /tmp/app.sbapp --force      # same or newer version
docker compose exec api php artisan apps remove lumen.personal-finance --with-data   # drops the tables too
```

Browsers cache the app's ES modules by version: when you iterate on the same version number, hard-reload or bump `version`.

## Build / Сборка

No bundler, no `npm install` — the web part is plain ESM that uses the Vue of the host.

```bash
npm i -g @sitebill/app-sdk          # or: npx @sitebill/app-sdk
sitebill-app check                  # validates manifest, PHP syntax, GraphQL guards, locales, widgets
sitebill-app pack                   # → lumen.personal-finance-1.0.0.sbapp
```

`check` mirrors the platform's installer rules, so whatever it passes will install.

## How it is built / Как устроено

```
manifest.json                         id, shell (owner), admin menu & pages, widgets, publicNav, profiles
composer.json                         PSR-4 SitebillApps\Lumen\PersonalFinance\ → api/src
api/
  src/PersonalFinanceServiceProvider  registers GraphQL schema + migrations through the SDK
  src/Models/{Account,Category,Transaction}   AppModel: tenant scope is applied automatically
  src/GraphQL/FinanceResolver         CRUD + sample-data seeder (ru/en names by locale)
  graphql/schema.graphql              queries/mutations, all under @guard @can(admin, Tenant)
  database/migrations/                tables app_lumen_personal_finance_{accounts,categories,transactions}
web/
  shared.mjs                          the whole UI: ledger composable, charts (inline SVG), pages, modal
  admin.mjs                           admin pages + dashboard widget  (pages: "", transactions, categories, accounts)
  site.mjs                            site home (FinanceHome): landing for guests, dashboard for the owner
locales/{ru,en,sr,tg}.json            UI strings, used as host.t('key')
test/smoke.mjs                        jsdom smoke test mounting every page against a fake host
```

### Data model

| Table | Columns |
|---|---|
| `…_accounts` | `tenant_id`, `name`, `kind` (cash / card / savings), `opening_balance`, `color`, `sort` |
| `…_categories` | `tenant_id`, `name`, `kind` (income / expense), `icon` (emoji), `color`, `monthly_limit` (nullable) |
| `…_transactions` | `tenant_id`, `account_id`, `category_id` (nullable), `kind`, `amount` (> 0), `occurred_on`, `note` |

The account balance is `opening_balance + Σ income − Σ expense`; it is computed in the browser from the ledger, so there is nothing to keep in sync. An account that has transactions cannot be deleted; deleting a category leaves its transactions “uncategorised”.

### GraphQL API (admin only)

| Operation | Purpose |
|---|---|
| `financeAccounts`, `financeCategories` | lists |
| `financeTransactions(from, to, limit)` | ledger, optionally for a date range |
| `financeSaveAccount / Category / Transaction` | create (no `id`) or update (with `id`) |
| `financeDelete…` | delete by `id` |
| `financeSeedDemo(locale)` | fills an **empty** ledger with six months of sample data |

### The Host API the app relies on

`host.gql(query, vars)`, `host.t(key)`, `host.locale` (a Vue **ref**, not a string — read `.value`), `host.user`, `host.localePath(path)`, `host.toast(title, color)`. Nothing else from the platform is touched: no `App\…` classes, no direct DB access outside the app's own tables.

### Things worth copying into your own app

- **Owning the site** — `manifest.shell` with `mode: owner`, `home`, `adminDashboard`, `adminMenu`/`accountMenu: replace`, `publicNav`; `profiles: ["blank"]` marks the app as meant for the blank profile.
- **Zero-build UI** — render functions (`h`) instead of templates; own CSS injected once and built on the host's CSS variables so light/dark just work.
- **Locale-aware money and sample data** — see `loc(host)` and `money()` in `web/shared.mjs`.
- **Safe-by-default GraphQL** — every mutation has `@guard` **and** `@can`; a bare `@guard` would let any registered visitor in. The SDK checker warns about it.
- **A browser-free test** — `test/smoke.mjs` mounts all pages with a fake host.

### Test

```bash
mkdir /tmp/nm && cd /tmp/nm && npm i vue jsdom
node test/smoke.mjs /tmp/nm          # prints “ok …” for every page and the modal
```

## Ideas for the next version / Что можно добавить

Recurring transactions · transfers between accounts · CSV import of bank statements · multi-currency · tags · goals (“save 200 000 by June”) · a public read-only report link · a REST endpoint for a mobile client. Pull requests are welcome.

---

# По-русски

## Что это

Приложение ставится поверх платформы Sitebill и **заменяет весь сайт**: гость видит красивую главную, администратор — свой личный дашборд с балансом, расходами по категориям, динамикой за 6 месяцев и бюджетами. Разделы: «Операции», «Категории и бюджеты», «Счета». Интерфейс на русском, английском, сербском и таджикском, валюта по языку.

## Быстрый старт

```bash
curl -fsSL https://sitebillcms.com/install.sh | sh -s -- --profile blank --json
docker compose cp lumen.personal-finance-1.0.0.sbapp api:/tmp/app.sbapp
docker compose exec api php artisan apps install /tmp/app.sbapp --shell
```

1. Первая команда ставит платформу **без демо-недвижимости** (`--profile blank`) и печатает адрес сайта, логин и пароль администратора.
2. Вторая и третья устанавливают приложение; `--shell` отдаёт ему главную страницу и меню.
3. Зайдите на сайт администратором и нажмите «Загрузить пример данных» — появятся полгода реалистичных операций.

Пакет `.sbapp` собирается командой `sitebill-app pack` (сначала `sitebill-app check` — проверка манифеста, PHP, прав в GraphQL и переводов). Сборщика (webpack/vite) нет: веб-часть — обычные ES-модули на Vue платформы.

## Как это устроено

- **Бэкенд** — три таблицы с префиксом `app_lumen_personal_finance_` и колонкой `tenant_id` (изоляция сайтов), GraphQL-схема расширяет платформенную; все операции закрыты `@guard` + `@can(admin)`.
- **Фронтенд** — `web/shared.mjs` содержит весь интерфейс (графики — SVG, без библиотек), `admin.mjs` — страницы админки и виджет, `site.mjs` — главная сайта.
- **Баланс счёта** = начальный остаток + доходы − расходы; считается на клиенте.
- **Грабли, на которых это уже споткнулось:** `host.locale` — это ref (читать `.value`); не включайте `MSYS_NO_PATHCONV` глобально в Git Bash; при переустановке той же версии браузер может держать старый модуль — сделайте жёсткую перезагрузку или поднимите версию.

## Лицензия

MIT — см. [LICENSE](LICENSE). © Sitebill — [sitebillcms.com](https://sitebillcms.com/) · [sitebill.ru](https://www.sitebill.ru/)
