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
        // Step 1: Pastikan kolom nullable
        Schema::table('customers', function (Blueprint $table) {
            $table->date('bill_date')->nullable()->change();
        });

        // Step 2: Update data ke hari
        DB::statement('UPDATE customers SET bill_date = DAY(bill_date)');

        // Step 3: Ubah tipe kolom ke integer
        Schema::table('customers', function (Blueprint $table) {
            $table->integer('bill_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke tipe date (data tanggal asli sudah hilang, hanya set ke tanggal 1 di bulan ini)
        Schema::table('customers', function (Blueprint $table) {
            $table->date('bill_date')->change();
        });
        DB::statement("UPDATE customers SET bill_date = DATE_FORMAT(CONCAT(YEAR(NOW()), '-', MONTH(NOW()), '-', bill_date), '%Y-%m-%d')");
    }
};
