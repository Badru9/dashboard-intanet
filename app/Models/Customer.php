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
        'bill_date',
    ];

    protected $casts = [
        'join_date' => 'date',
        'inactive_at' => 'date',
        'bill_date' => 'date',
    ];

    protected $attributes = [
        'email' => null,
        'coordinate' => null,
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
