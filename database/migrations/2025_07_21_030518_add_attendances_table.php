    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('attendances', function (Blueprint $table) {
                // Define the primary key as string as per your Prisma schema
                $table->id();

                // All other columns should also be defined here initially
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->date('date');
                $table->timestamp('check_in_time')->nullable();
                $table->timestamp('check_out_time')->nullable();
                $table->timestamp('break_start_time')->nullable();
                $table->timestamp('break_end_time')->nullable();
                $table->enum('status', ['PRESENT', 'ABSENT', 'LATE', 'SICK', 'LEAVE', 'HALF_DAY'])->default('PRESENT');
                $table->text('notes')->nullable();
                $table->text('location_check_in')->nullable();
                $table->text('location_check_out')->nullable();
                $table->text('photo_check_in')->nullable();
                $table->text('photo_check_out')->nullable();
                $table->timestamps();
                $table->softDeletes(); // This creates the 'deleted_at' column


                $table->unique(['user_id', 'date']);
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('attendances');
        }
    };
