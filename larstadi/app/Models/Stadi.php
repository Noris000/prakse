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

    // Define the relationship with StadiProps model
    public function stadiProps()
    {
        return $this->hasMany(StadiProps::class, "bid", "id");
    }
}