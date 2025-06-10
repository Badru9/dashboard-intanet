<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CustomersOffline extends Model
{
    use HasFactory;

    protected $table = 'customers_offline';

    protected $fillable = [
        'customer_id',
        'from',
        'to',
    ];

    protected $casts = [
        'from' => 'date',
        'to' => 'date',
    ];

    /**
     * Relationship dengan Customer
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}
