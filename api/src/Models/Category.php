<?php

namespace SitebillApps\Lumen\PersonalFinance\Models;

use Sitebill\AppSdk\AppModel;

class Category extends AppModel
{
    protected $table = 'app_rumantic_personal_finance_categories';

    protected $fillable = ['name', 'kind', 'icon', 'color', 'monthly_limit'];
}
