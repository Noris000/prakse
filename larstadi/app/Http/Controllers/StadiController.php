<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stadi;
use Illuminate\Support\Facades\DB;

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

        // Fetching the data with pagination
        $stadi = $query->skip($offset)->take($limit)->get();

        // Fetching data from stadi__props table for checkboxes
        $checkboxValues = DB::table('stadi__props')
            ->whereIn('pid', [13, 14, 15, 16])
            ->whereIn('bid', $stadi->pluck('id')->all()) // Filter by Stadi IDs
            ->get();

        // Transforming the results
        $results = $stadi->map(function ($item) use ($checkboxValues) {
            return [
                'id' => $item->id,
                'base_name' => $item->base_name,
                'date_added' => $item->date_added,
                'base_descr' => null,
                'range_sliders' => $this->getRangeSliders($item),
                'checkboxes' => $this->getCheckboxes($item),
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
        $responseData = [
            'stadi' => $results->toArray(),
            'suggestions' => $formattedSuggestions // Include suggestions in the response
        ];

        return response()->json($responseData, 200);
    }

    public function show($base_name)
    {
        // First try to find in Stadi table
        $stadi = Stadi::where('base_name', $base_name)->first();

        return view('stadi.show', ['stadi' => $stadi]);
    }

    private function getRangeSliders($item)
    {
        // Fetching range slider values from database for the given item
        $rangeSliderValues = DB::table('stadi__props')
            ->whereIn('pid', [3, 4, 6, 7, 25, 26])
            ->where('bid', $item->id)
            ->get();

        // Initialize arrays to hold min and max values for each slider
        $minValues = [];
        $maxValues = [];

        // Populate min and max values for each slider
        foreach ($rangeSliderValues as $value) {
            // Initialize min and max values if not set
            if (!isset($minValues[$value->value_num])) {
                $minValues[$value->value_num] = $value->value_num;
                $maxValues[$value->value_num] = $value->value_num;
            } else {
                // Update min and max values if current value is smaller or larger
                $minValues[$value->value_num] = min($minValues[$value->value_num], $value->value_num);
                $maxValues[$value->value_num] = max($maxValues[$value->value_num], $value->value_num);
            }
        }

        // Initialize an array to hold range sliders
        $rangeSliders = [];

        // Populate range slider values with default min and max values
        foreach ($minValues as $valueNum => $minValue) {
            $rangeSliders[$valueNum] = [
                'min' => $minValue,
                'max' => $maxValues[$valueNum],
            ];
        }

        return $rangeSliders;
    }

    private function getCheckboxes($item)
    {
        // Fetching data from stadi__props table for checkboxes for the given item
        $checkboxValues = DB::table('stadi__props')
            ->whereIn('pid', [13, 14, 15, 16])
            ->where('bid', $item->id)
            ->get();

        // Initialize an array to hold checkboxes
        $checkboxes = [];

        // Populate checkbox values
        foreach ($checkboxValues as $value) {
            $checkboxes[$value->pid][] = $value->value_text;
        }

        return $checkboxes;
    }
}