<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StadiController;

Route::get('/stadi', [StadiController::class, 'index']);
Route::get('/stadi/{base_name}', [StadiController::class, 'show']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
