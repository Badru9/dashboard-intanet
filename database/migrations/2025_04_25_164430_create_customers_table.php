<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('customers')) {
            Schema::create('customers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->enum('status', ['active', 'inactive', 'paused'])->default('active');
                $table->text('address');
                $table->string('phone');
                $table->string('tax_invoice_number')->nullable();
                $table->foreignId('package_id')->nullable()->constrained('internet_packages')->nullOnDelete();
                $table->string('email')->unique();
                $table->string('coordinate')->nullable();
                $table->date('join_date');
                $table->date('inactive_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
