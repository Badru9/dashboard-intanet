<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->unsignedTinyInteger('period_month')->nullable()->after('due_date');
            $table->unsignedSmallInteger('period_year')->nullable()->after('period_month');
        });

        // Migrasi data dari period ke period_month dan period_year
        $invoices = DB::table('invoices')->select('id', 'period')->get();
        foreach ($invoices as $invoice) {
            if ($invoice->period) {
                $date = date_create($invoice->period);
                DB::table('invoices')->where('id', $invoice->id)->update([
                    'period_month' => (int)date_format($date, 'm'),
                    'period_year' => (int)date_format($date, 'Y'),
                ]);
            }
        }

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('period');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->date('period')->nullable()->after('due_date');
        });

        // Migrasi data balik dari period_month dan period_year ke period
        $invoices = DB::table('invoices')->select('id', 'period_month', 'period_year')->get();
        foreach ($invoices as $invoice) {
            if ($invoice->period_month && $invoice->period_year) {
                $period = sprintf('%04d-%02d-01', $invoice->period_year, $invoice->period_month);
                DB::table('invoices')->where('id', $invoice->id)->update([
                    'period' => $period,
                ]);
            }
        }

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['period_month', 'period_year']);
        });
    }
};
