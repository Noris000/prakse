<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stadi;
use Illuminate\Support\Facades\DB;

class StadiController extends Controller
{
    // Method to retrieve Stadi records with filtering, sorting, and pagination
    public function index(Request $request)
    {
        // Retrieving request parameters
        $limit = $request->input('limit', 10);
        $offset = $request->input('offset', 0);
        $search = $request->input('search', '');
        $searchSynonyms = $request->input('searchSynonyms', false);
        $sortBy = $request->input('sortBy', 'name');
        $sortDirection = $request->input('sortDirection', 'asc');
        $sliderValues = $request->input('sliderValues', []);

        // Constructing the initial query
        $query = Stadi::query();

        // Filtering based on search term and synonyms
        if ($search) {
            $query->where('base_name', 'like', '%' . $search . '%');
            if ($searchSynonyms) {
                $query->orWhereHas('synonyms', function ($query) use ($search) {
                    $query->where('synonym', 'like', '%' . $search . '%');
                });
            }
        }

        // Filtering based on slider values
        if (!empty($sliderValues)) {
            foreach ($sliderValues as $pid => $value) {
                if (!empty($value)) {
                    $query->whereHas('stadiProps', function ($query) use ($pid, $value) {
                        $query->where('pid', $pid)->where('value_num', $value);
                    });
                }
            }
        }

        // Sorting logic
        if ($sortBy === 'name') {
            $query->orderBy('base_name', $sortDirection);
        } elseif ($sortBy === 'dateAdded') {
            $query->orderBy('date_added', $sortDirection);
        }

        // Paginated retrieval of Stadi records
        $stadi = $query->skip($offset)->take($limit)->get();

        // Fetching additional data for checkboxes and range sliders
        $checkboxValues = DB::table('stadi__props')
            ->whereIn('pid', [13, 14, 15, 16])
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get();

        $rangeSliderValues = DB::table('stadi__props')
            ->whereIn('pid', [3, 4, 6, 7, 25, 26])
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get();

        // Transformation of retrieved data
        $results = $stadi->map(function ($item) use ($checkboxValues, $rangeSliderValues) {
            // Initializing arrays for range sliders and checkboxes
            $rangeSliders = [];
            $checkboxes = [];

            // Populating range slider values
            foreach ($rangeSliderValues as $value) {
                if ($value->bid === $item->id) {
                    if (!isset($rangeSliders[$value->pid])) {
                        $rangeSliders[$value->pid] = $value->value_num;
                    }
                }
            }

            // Populating checkbox values
            foreach ($checkboxValues as $value) {
                if ($value->bid === $item->id) {
                    $checkboxes[$value->pid][] = $value->value_text;
                }
            }

            return [
                'id' => $item->id,
                'base_name' => $item->base_name,
                'date_added' => $item->date_added,
                'base_descr' => null,
                'range_sliders' => $rangeSliders,
                'checkboxes' => $checkboxes,
                'synonyms' => $item->synonyms->map(function ($synonym) {
                    return [
                        'type' => $synonym->type,
                        'name' => $synonym->synonym
                    ];
                })
            ];
        });

        // Fetching suggestions based on base names and synonyms
        $suggestions = Stadi::where('base_name', 'like', '%' . $search . '%')
            ->orWhereHas('synonyms', function ($query) use ($search) {
                $query->where('synonym', 'like', '%' . $search . '%');
            })
            ->limit(5)
            ->get();

        // Formatting suggestions
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

        // Data for checkboxes
        $checkboxData = [
            "Soil" => [
                "pid" => 13,
                "values" => [
                    "2" => "Clay",
                    "3" => "Loam",
                    "4" => "Sand",
                    "1" => "Chalk"
                ]
            ],
            "Water" => [
                "pid" => 14,
                "values" => [
                    "1" => "Well–drained",
                    "3" => "Poorly–drained",
                    "2" => "Moist but well–drained"
                ]
            ],
            "pH" => [
                "pid" => 15,
                "values" => [
                    "1" => "Acid 0-6.5",
                    "2" => "Alkaline 7.4+",
                    "3" => "Neutral 6.6–7.3"
                ]
            ],
            "Sun" => [
                "pid" => 16,
                "values" => [
                    "1" => "Full sun",
                    "2" => "Partial shade",
                    "3" => "Full shade"
                ]
            ]
        ];

        // Constructing response data
        $responseData = [
            'stadi' => $results->toArray(),
            'suggestions' => $formattedSuggestions,
            'checkboxData' => $checkboxData
        ];

        // Fetching range slider values for PID 3, PID 4, PID 6, PID 7, PID 25, and PID 26
        $pidRangeSliderValues = DB::table('stadi__props')
            ->whereIn('pid', [3, 4, 6, 7, 25, 26])
            ->select('pid', DB::raw('MIN(value_num) as min_value'), DB::raw('MAX(value_num) as max_value'))
            ->groupBy('pid')
            ->get();

        // Adding PID range slider values to the response data
        $pidRangeSliderValues->each(function ($pidRangeSlider) use (&$responseData) {
            $pid = 'pid_' . $pidRangeSlider->pid . '_range_slider_values';
            if (in_array($pidRangeSlider->pid, [3, 4, 6, 7, 25, 26])) {
                $responseData[$pid] = [
                    'min' => $pidRangeSlider->min_value,
                    'max' => $pidRangeSlider->max_value
                ];
            }
        });

        // Returning JSON response
        return response()->json($responseData, 200);
    }

    // Method to show a specific Stadi record
    public function show($base_name)
    {
        // Retrieving Stadi record by base name
        $stadi = Stadi::where('base_name', $base_name)->first();

        // Returning JSON response if not found
        if (!$stadi) {
            return response()->json(['error' => 'Plant not found'], 404);
        }

        // Returning view with Stadi record data
        return view('stadi.show', ['stadi' => $stadi]);
    }
}