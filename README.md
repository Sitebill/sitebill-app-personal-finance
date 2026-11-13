# Personal Finance — an app for Sitebill

Accounts, income and expenses, categories, monthly budgets and clear reports. The app takes over the whole site
(`shell.mode = "owner"`): its own home page (a landing for guests, the ledger for the owner), admin menu and dashboard.

```bash
curl -fsSL https://sitebillcms.com/install.sh | sh -s -- --profile blank --json   # clean install
docker compose cp lumen.personal-finance-1.0.0.sbapp api:/tmp/app.sbapp
docker compose exec api php artisan apps install /tmp/app.sbapp --shell
```

MIT license.
