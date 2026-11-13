<?php

namespace SitebillApps\Lumen\PersonalFinance\GraphQL;

use Carbon\CarbonImmutable;
use Sitebill\AppSdk\Host;
use SitebillApps\Lumen\PersonalFinance\Models\Account;
use SitebillApps\Lumen\PersonalFinance\Models\Category;
use SitebillApps\Lumen\PersonalFinance\Models\Transaction;

/** Admin GraphQL of the app. Permissions are checked by @guard + @can in the schema; tenant scope by AppModel. */
final class FinanceResolver
{
    public function accounts(): array
    {
        return Account::query()->orderBy('sort')->orderBy('id')->get()->map(fn (Account $a) => $this->account($a))->all();
    }

    public function categories(): array
    {
        return Category::query()->orderBy('kind')->orderBy('id')->get()->map(fn (Category $c) => $this->category($c))->all();
    }

    public function transactions(mixed $root, array $args): array
    {
        $q = Transaction::query()->orderByDesc('occurred_on')->orderByDesc('id')
            ->limit(max(1, min(10000, (int) ($args['limit'] ?? 3000))));
        if (! empty($args['from'])) {
            $q->where('occurred_on', '>=', $args['from']);
        }
        if (! empty($args['to'])) {
            $q->where('occurred_on', '<=', $args['to']);
        }

        return $q->get()->map(fn (Transaction $t) => $this->transaction($t))->all();
    }

    public function saveAccount(mixed $root, array $args): array
    {
        $data = [
            'name' => $args['name'],
            'kind' => $args['kind'],
            'opening_balance' => $args['opening_balance'] ?? 0,
            'color' => $args['color'] ?? '#6366f1',
        ];
        $account = ! empty($args['id']) ? Account::query()->findOrFail($args['id']) : new Account();
        $account->fill($data)->save();

        return $this->account($account);
    }

    public function deleteAccount(mixed $root, array $args): bool
    {
        $account = Account::query()->findOrFail($args['id']);
        // The ledger must stay consistent: an account with operations cannot be removed.
        if (Transaction::query()->where('account_id', $account->id)->exists()) {
            throw new \InvalidArgumentException('Account has transactions');
        }
        $account->delete();

        return true;
    }

    public function saveCategory(mixed $root, array $args): array
    {
        $data = [
            'name' => $args['name'],
            'kind' => $args['kind'],
            'icon' => $args['icon'] ?? '🏷️',
            'color' => $args['color'] ?? '#94a3b8',
            'monthly_limit' => $args['kind'] === 'expense' ? ($args['monthly_limit'] ?? null) : null,
        ];
        $category = ! empty($args['id']) ? Category::query()->findOrFail($args['id']) : new Category();
        $category->fill($data)->save();

        return $this->category($category);
    }

    public function deleteCategory(mixed $root, array $args): bool
    {
        $category = Category::query()->findOrFail($args['id']);
        Transaction::query()->where('category_id', $category->id)->update(['category_id' => null]);
        $category->delete();

        return true;
    }

    public function saveTransaction(mixed $root, array $args): array
    {
        // Both references must belong to this site: the tenant scope of the models guarantees that.
        Account::query()->findOrFail($args['account_id']);
        if (! empty($args['category_id'])) {
            Category::query()->findOrFail($args['category_id']);
        }
        $tx = ! empty($args['id']) ? Transaction::query()->findOrFail($args['id']) : new Transaction();
        $tx->fill([
            'account_id' => $args['account_id'],
            'category_id' => $args['category_id'] ?? null,
            'kind' => $args['kind'],
            'amount' => $args['amount'],
            'occurred_on' => $args['occurred_on'],
            'note' => $args['note'] ?? null,
        ])->save();

        return $this->transaction($tx);
    }

    public function deleteTransaction(mixed $root, array $args): bool
    {
        Transaction::query()->findOrFail($args['id'])->delete();

        return true;
    }

    public function seedDemo(mixed $root, array $args): bool
    {
        if (Account::query()->exists() || Transaction::query()->exists()) {
            return false;
        }
        // The browser tells which language the owner reads the site in; fall back to the site's own locale.
        $ru = str_starts_with((string) ($args['locale'] ?? Host::site()->current()?->locale), 'ru');
        $t = fn (string $ruText, string $en) => $ru ? $ruText : $en;

        $accounts = [
            'card' => Account::create(['name' => $t('Дебетовая карта', 'Debit card'), 'kind' => 'card', 'opening_balance' => 84000, 'color' => '#6366f1', 'sort' => 1]),
            'cash' => Account::create(['name' => $t('Наличные', 'Cash'), 'kind' => 'cash', 'opening_balance' => 12000, 'color' => '#10b981', 'sort' => 2]),
            'save' => Account::create(['name' => $t('Накопления', 'Savings'), 'kind' => 'savings', 'opening_balance' => 350000, 'color' => '#f59e0b', 'sort' => 3]),
        ];
        $cats = [];
        $spec = [
            ['salary', 'income', '💼', '#10b981', $t('Зарплата', 'Salary'), null],
            ['side', 'income', '🧩', '#14b8a6', $t('Подработка', 'Side income'), null],
            ['food', 'expense', '🛒', '#f97316', $t('Продукты', 'Groceries'), 30000],
            ['home', 'expense', '🏠', '#6366f1', $t('Жильё', 'Housing'), 35000],
            ['transport', 'expense', '🚌', '#0ea5e9', $t('Транспорт', 'Transport'), 6000],
            ['fun', 'expense', '🎬', '#ec4899', $t('Развлечения', 'Entertainment'), 10000],
            ['health', 'expense', '💊', '#ef4444', $t('Здоровье', 'Health'), 8000],
            ['cafe', 'expense', '☕', '#a16207', $t('Кафе и рестораны', 'Dining out'), 12000],
            ['learn', 'expense', '📚', '#8b5cf6', $t('Обучение', 'Education'), null],
        ];
        foreach ($spec as [$key, $kind, $icon, $color, $name, $limit]) {
            $cats[$key] = Category::create(['name' => $name, 'kind' => $kind, 'icon' => $icon, 'color' => $color, 'monthly_limit' => $limit]);
        }

        $notes = [
            'food' => [$t('Супермаркет', 'Supermarket'), $t('Рынок', 'Market'), $t('Доставка продуктов', 'Grocery delivery')],
            'transport' => [$t('Метро', 'Metro'), $t('Такси', 'Taxi'), $t('Бензин', 'Fuel')],
            'fun' => [$t('Кино', 'Cinema'), $t('Концерт', 'Concert'), $t('Подписка на сериалы', 'Streaming')],
            'health' => [$t('Аптека', 'Pharmacy'), $t('Стоматолог', 'Dentist')],
            'cafe' => [$t('Обед с коллегами', 'Lunch with colleagues'), $t('Кофе', 'Coffee'), $t('Ужин', 'Dinner')],
            'learn' => [$t('Онлайн-курс', 'Online course'), $t('Книги', 'Books')],
        ];
        $ranges = ['food' => [450, 2600], 'transport' => [60, 900], 'cafe' => [250, 1800], 'fun' => [500, 3200], 'health' => [300, 4000], 'learn' => [1500, 7000]];
        mt_srand(42); // the same sample data on every install
        $today = CarbonImmutable::today();
        for ($m = 5; $m >= 0; $m--) {
            $month = $today->subMonthsNoOverflow($m)->startOfMonth();
            $last = $m === 0 ? $today->day : $month->daysInMonth;
            $add = function (string $account, ?string $cat, string $kind, float $amount, int $day, ?string $note) use ($accounts, $cats, $month, $last) {
                Transaction::create([
                    'account_id' => $accounts[$account]->id,
                    'category_id' => $cat ? $cats[$cat]->id : null,
                    'kind' => $kind,
                    'amount' => $amount,
                    'occurred_on' => $month->day(min($day, $last))->toDateString(),
                    'note' => $note,
                ]);
            };
            if ($m > 0 || $today->day >= 5) {
                $add('card', 'salary', 'income', 142000, 5, $t('Аванс и зарплата', 'Paycheck'));
            }
            if ($m > 0 || $today->day >= 12) {
                $add('card', 'side', 'income', mt_rand(8, 24) * 1000, 12, $t('Проект на стороне', 'Freelance project'));
            }
            if ($m > 0 || $today->day >= 2) {
                $add('card', 'home', 'expense', 32500, 2, $t('Аренда и коммунальные', 'Rent and utilities'));
            }
            for ($d = 1; $d <= $last; $d++) {
                foreach (['food' => 38, 'transport' => 30, 'cafe' => 22, 'fun' => 8, 'health' => 6, 'learn' => 3] as $key => $chance) {
                    if (mt_rand(1, 100) > $chance) {
                        continue;
                    }
                    [$lo, $hi] = $ranges[$key];
                    $add(mt_rand(0, 4) === 0 ? 'cash' : 'card', $key, 'expense', round(mt_rand($lo, $hi) / 10) * 10, $d, $notes[$key][array_rand($notes[$key])]);
                }
            }
        }

        return true;
    }

    private function account(Account $a): array
    {
        return ['id' => $a->id, 'name' => $a->name, 'kind' => $a->kind, 'opening_balance' => (float) $a->opening_balance, 'color' => $a->color];
    }

    private function category(Category $c): array
    {
        return [
            'id' => $c->id, 'name' => $c->name, 'kind' => $c->kind, 'icon' => $c->icon, 'color' => $c->color,
            'monthly_limit' => $c->monthly_limit === null ? null : (float) $c->monthly_limit,
        ];
    }

    private function transaction(Transaction $t): array
    {
        return [
            'id' => $t->id,
            'account_id' => (int) $t->account_id,
            'category_id' => $t->category_id ? (int) $t->category_id : null,
            'kind' => $t->kind,
            'amount' => (float) $t->amount,
            'occurred_on' => substr((string) $t->getRawOriginal('occurred_on'), 0, 10),
            'note' => $t->note,
        ];
    }
}
