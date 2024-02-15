<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stadi extends Model
{
    use HasFactory;

    protected $table ="stadi__base";

    public function synonyms()
    {
        return $this->hasMany(StadiSyn::class, "bid", "id");
    }
}