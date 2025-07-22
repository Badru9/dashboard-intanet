<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Tambahkan ini untuk soft deletes

class Attendance extends Model
{
    use HasFactory, SoftDeletes; // Gunakan trait SoftDeletes

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'attendances'; // Pastikan nama tabel sesuai

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id'; // Default Laravel adalah 'id', tapi penting untuk memastikan
    // karena Anda menggunakan UUID/string sebagai primary key

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false; // Penting: Set false karena ID adalah UUID/string, bukan auto-increment

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    // App\Models\User.php
    protected $keyType = 'string'; // Penting: Set type key menjadi string

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id', // Pastikan 'id' bisa diisi jika Anda menggenerasinya secara manual (e.g., Str::uuid())
        'user_id',
        'date',
        'check_in_time',
        'check_out_time',
        'break_start_time',
        'break_end_time',
        'status',
        'notes',
        'location_check_in',
        'location_check_out',
        'photo_check_in',
        'photo_check_out',
        // 'created_at' dan 'updated_at' otomatis dihandle oleh timestamps()
        // 'deleted_at' otomatis dihandle oleh SoftDeletes
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date', // Cast 'date' menjadi objek Carbon Date
        'check_in_time' => 'datetime', // Cast waktu menjadi objek Carbon DateTime
        'check_out_time' => 'datetime',
        'break_start_time' => 'datetime',
        'break_end_time' => 'datetime',
        'status' => \App\Enums\AttendanceStatus::class, // Jika Anda menggunakan Enum Laravel
        'deleted_at' => 'datetime', // Otomatis dihandle oleh SoftDeletes, tapi bisa juga didefinisikan di sini
    ];

    // Jika Anda ingin mengizinkan pengisian massal untuk semua atribut
    // protected $guarded = []; // Hati-hati menggunakan ini di produksi

    /**
     * Get the user that owns the attendance.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
