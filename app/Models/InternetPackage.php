<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternetPackage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'speed',
        'price',
        'description',
    ];

    protected $casts = [
        'speed' => 'integer',
        'price' => 'integer',
    ];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'package_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'package_id');
    }
}
