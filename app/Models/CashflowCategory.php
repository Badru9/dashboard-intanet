<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashflowCategory extends Model
{
    use SoftDeletes;

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
