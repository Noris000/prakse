<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stadi;
use App\Models\StadiSyn;

class StadiController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $offset = $request->input('offset', 0);
        $search = $request->input('search', '');
        $sortBy = $request->input('sortBy', 'name'); // Default sort by name
        $sortDirection = $request->input('sortDirection', 'asc'); // Default sort direction ascending
        
        $query = Stadi::query();
        
        if ($search) {
            $query->where(function($subquery) use ($search) {
                // Search in base_name column of Stadi table
                $subquery->where('base_name', 'like', '%' . $search . '%')
                ->orWhereHas('synonyms', function ($synonymQuery) use ($search) {
                      // Search in synonym column of StadiSyn table
                    $synonymQuery->where('synonym', 'like', '%' . $search . '%');
                });
            });
        }
        
        // Sorting logic
        if ($sortBy === 'name') {
            $query->orderBy('base_name', $sortDirection);
        } elseif ($sortBy === 'dateAdded') {
            $query->orderBy('date_added', $sortDirection);
        }
        
        $stadi = $query->skip($offset)->take($limit)->get();
    
        // Transform the results to the desired JSON format
        $results = $stadi->map(function ($item) {
            $synonyms = $item->synonyms->map(function ($synonym) {
                return [
                    'type' => $synonym->type,
                    'name' => $synonym->synonym
                ];
            });
            
            return [
                'id' => $item->id,
                'base_name' => $item->base_name,
                'date_added' => $item->date_added,
                'base_descr' => $item->base_descr,
                'synonyms' => $synonyms
            ];
        });
    
        $suggestions = Stadi::where('base_name', 'like', '%' . $search . '%')->limit(5)->get(['base_name']);
    
        return response()->json(['stadi' => $results, 'suggestions' => $suggestions], 200);
    }
    
    public function show($base_name)
    {
        // First try to find in Stadi table
        $stadi = Stadi::where('base_name', $base_name)->first();
        
        return view('stadi.show', ['stadi' => $stadi]);
    }
}