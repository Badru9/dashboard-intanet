<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cashflow extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cashflow_category_id',
        'created_id',
        'amount',
        'note',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(CashflowCategory::class, 'cashflow_category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }
}
