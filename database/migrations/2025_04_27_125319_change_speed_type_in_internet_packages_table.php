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
        // Update existing data to extract numeric value
        DB::table('internet_packages')->update([
            'speed' => DB::raw("CAST(REGEXP_REPLACE(speed, '[^0-9]', '') AS UNSIGNED)")
        ]);

        Schema::table('internet_packages', function (Blueprint $table) {
            $table->integer('speed')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internet_packages', function (Blueprint $table) {
            $table->string('speed')->change();
        });

        // Convert back to string format
        DB::table('internet_packages')->update([
            'speed' => DB::raw("CONCAT(speed, ' Mbps')")
        ]);
    }
};
