<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'status',
        'address',
        'phone',
        'npwp',
        'tax_invoice_number',
        'package_id',
        'email',
        'coordinate',
        'join_date',
        'inactive_at',
    ];

    protected $casts = [
        'join_date' => 'date',
        'inactive_at' => 'date',
    ];

    protected $attributes = [
        'email' => null,
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class, 'package_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
