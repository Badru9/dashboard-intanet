<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'package_id',
        'created_by',
        'amount',
        'status',
        'due_date',
        'note',
        'payment_proof_path',
        'invoice_id',
        'ppn',
        'total_amount',
        'period_month',
        'period_year',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    /**
     * Generate unique invoice ID
     * Format: INV/{tahun}{bulan}/{4 digit increment number}
     * Example: INV/202405/0001
     */
    public static function generateInvoiceId(): string
    {
        $yearMonth = now()->format('Ym');
        $prefix = "INV/{$yearMonth}/";

        $lastInvoice = self::where('invoice_id', 'like', $prefix . '%')
            ->orderBy('invoice_id', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int)substr($lastInvoice->invoice_id, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
