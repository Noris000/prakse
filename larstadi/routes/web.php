<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StadiController;

Route::get('/stadi', [StadiController::class, 'index']);
Route::get('/stadi/{base_name}', [StadiController::class, 'show']);

Route::get('/', function () {
    return view('welcome');
});
