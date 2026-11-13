<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_lumen_personal_finance_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name', 80);
            $table->string('kind', 20)->default('card');
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->string('color', 20)->default('#6366f1');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('app_lumen_personal_finance_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('name', 80);
            $table->string('kind', 10)->default('expense');
            $table->string('icon', 8)->default('🏷️');
            $table->string('color', 20)->default('#94a3b8');
            $table->decimal('monthly_limit', 14, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('app_lumen_personal_finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('account_id')->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('kind', 10);
            $table->decimal('amount', 14, 2);
            $table->date('occurred_on')->index();
            $table->string('note', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_lumen_personal_finance_transactions');
        Schema::dropIfExists('app_lumen_personal_finance_categories');
        Schema::dropIfExists('app_lumen_personal_finance_accounts');
    }
};
