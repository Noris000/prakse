<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StadiSyn extends Model
{
    use HasFactory;

    protected $table = "stadi__synonyms";

    public function stadi()
    {
        return $this->belongsTo(Stadi::class, "bid");
    }
}
