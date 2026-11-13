<?php

namespace SitebillApps\Lumen\PersonalFinance\Models;

use Sitebill\AppSdk\AppModel;

class Transaction extends AppModel
{
    protected $table = 'app_rumantic_personal_finance_transactions';

    protected $fillable = ['account_id', 'category_id', 'kind', 'amount', 'occurred_on', 'note'];
}
