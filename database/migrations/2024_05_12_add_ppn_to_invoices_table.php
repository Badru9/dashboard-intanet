<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('ppn', 5, 2)->default(11.00)->after('amount'); // Default PPN 11%
            $table->decimal('total_amount', 15, 2)->after('ppn'); // Total setelah PPN
        });

        // Update total_amount untuk invoice yang sudah ada
        DB::statement('UPDATE invoices SET total_amount = amount + (amount * ppn / 100)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['ppn', 'total_amount']);
        });
    }
};
