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
        $searchSynonyms = $request->input('searchSynonyms', false); // New parameter to enable searching by synonyms
        $sortBy = $request->input('sortBy', 'name'); // Default sort by name
        $sortDirection = $request->input('sortDirection', 'asc'); // Default sort direction ascending
    
        // Constructing the query
        $query = Stadi::query();
    
        // If search term is provided, filter based on base name directly
        if ($search) {
            $query->where('base_name', 'like', '%' . $search . '%');
            
            // Add logic to search by synonyms if enabled
            if ($searchSynonyms) {
                // Include synonyms in search
                $query->orWhereHas('synonyms', function ($query) use ($search) {
                    $query->where('synonym', 'like', '%' . $search . '%');
                });
            }
        }
    
        // Sorting logic
        if ($sortBy === 'name') {
            $query->orderBy('base_name', $sortDirection); // Order by base_name
        } elseif ($sortBy === 'dateAdded') {
            $query->orderBy('date_added', $sortDirection);
        }
    
        // Fetching the data
        $stadi = $query->skip($offset)->take($limit)->get();
    
        // Transforming the results
        $results = $stadi->map(function ($item) {
            return [
                'id' => $item->id,
                'base_name' => $item->base_name,
                'date_added' => $item->date_added,
                'base_descr' => null,
                'synonyms' => $item->synonyms->map(function ($synonym) {
                    return [
                        'type' => $synonym->type,
                        'name' => $synonym->synonym
                    ];
                })
            ];
        });
    
        // Fetching suggestions directly based on base names and synonyms
        $suggestions = Stadi::where('base_name', 'like', '%' . $search . '%')
            ->orWhereHas('synonyms', function ($query) use ($search) {
                $query->where('synonym', 'like', '%' . $search . '%');
            })
            ->limit(5)
            ->get();
    
        // Transforming suggestions
        $formattedSuggestions = $suggestions->map(function ($suggestion) {
            return [
                'base_name' => $suggestion->base_name,
                'synonyms' => $suggestion->synonyms->map(function ($synonym) {
                    return [
                        'type' => $synonym->type,
                        'name' => $synonym->synonym
                    ];
                })
            ];
        });
    
        // Constructing response data
        $responseData = ['stadi' => $results, 'suggestions' => $formattedSuggestions];
    
        return response()->json($responseData, 200);
    }

    public function show($base_name)
    {
        // First try to find in Stadi table
        $stadi = Stadi::where('base_name', $base_name)->first();

        return view('stadi.show', ['stadi' => $stadi]);
    }
}
