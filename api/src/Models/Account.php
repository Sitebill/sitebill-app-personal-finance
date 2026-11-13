<?php

namespace SitebillApps\Lumen\PersonalFinance\Models;

use Sitebill\AppSdk\AppModel;

class Account extends AppModel
{
    protected $table = 'app_rumantic_personal_finance_accounts';

    protected $fillable = ['name', 'kind', 'opening_balance', 'color', 'sort'];
}
