<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StadiProps extends Model
{
    use HasFactory;

    protected $table = "stadi__props";

    public function stadi()
    {
        return $this->belongsTo(Stadi::class, "bid");
    }

    public function propsInfo()
    {
        return $this->hasMany(StadiPropsInfo::class, "pid");
    }
}