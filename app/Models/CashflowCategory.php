<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashflowCategory extends Model
{
    protected $fillable = [
        'name',
        'is_out',
        'note',
    ];

    public function cashflows(): HasMany
    {
        return $this->hasMany(Cashflow::class);
    }
}
