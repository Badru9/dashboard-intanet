<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('address');
            $table->string('npwp')->nullable();
            $table->string('tax_invoice_number')->nullable();
            $table->string('status')->default('active');
            $table->foreignId('package_id')->constrained('internet_packages');
            $table->string('coordinate')->nullable();
            $table->date('join_date');
            $table->date('inactive_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
