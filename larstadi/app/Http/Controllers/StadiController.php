<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stadi;

class StadiController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $offset = $request->input('offset', 0);
        $search = $request->input('search', '');
        
        $query = Stadi::query();
        
        if ($search) {
            $query->where('base_name', 'like', '%' . $search . '%');
        }
        
        $stadi = $query->skip($offset)->take($limit)->get();
    
        $suggestions = Stadi::where('base_name', 'like', '%' . $search . '%')->limit(5)->get(['base_name']);
    
        return response()->json(['stadi' => $stadi, 'suggestions' => $suggestions], 200);
    }
    public function show($base_name)
    {
        $stadi = Stadi::where('base_name', $base_name)->firstOrFail();

        return view('stadi.show', ['stadi' => $stadi]);
    }
}