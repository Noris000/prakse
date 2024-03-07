<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StadiPropsInfo extends Model
{
    use HasFactory;

    protected $table = "stadi__props_info";

    public function stadiProps()
    {
        return $this->belongsTo(StadiProps::class, "pid");
    }
}
