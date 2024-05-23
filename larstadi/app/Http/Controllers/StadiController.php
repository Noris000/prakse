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
        $searchSynonyms = $request->input('searchSynonyms', false);
        $sortBy = $request->input('sortBy', 'name');
        $sortDirection = $request->input('sortDirection', 'asc');
        $sliderValues = $request->input('sliderValues', []);
        $checkedCheckboxes = $request->input('checkedCheckboxes', []);

        $checkboxData = [
            "Soil" => [
                "pid" => 13,
                "values" => [
                    "Clay" => "2",
                    "Loam" => "3",
                    "Sand" => "4",
                    "Chalk" => "1"
                ]
            ],
            "Water" => [
                "pid" => 14,
                "values" => [
                    "Well–drained" => "1",
                    "Poorly–drained" => "3",
                    "Moist but well–drained" => "2"
                ]
            ],
            "pH" => [
                "pid" => 15,
                "values" => [
                    "Acid 0-6.5" => "1",
                    "Alkaline 7.4+" => "2",
                    "Neutral 6.6–7.3" => "3"
                ]
            ],
            "Sun" => [
                "pid" => 16,
                "values" => [
                    "Full sun" => "1",
                    "Partial shade" => "2",
                    "Full shade" => "3"
                ]
            ]
        ];

        $query = Stadi::query();

        if ($search) {
            $query->where('base_name', 'like', '%' . $search . '%');

            if ($searchSynonyms) {
                $query->orWhereHas('synonyms', function ($query) use ($search) {
                    $query->where('synonym', 'like', '%' . $search . '%');
                });
            }
        }

        if (!empty($sliderValues)) {
            foreach ($sliderValues as $pid => $value) {
                if (!empty($value)) {
                    $query->whereHas('stadiProps', function ($query) use ($pid, $value) {
                        $query->where('pid', $pid)->where('value_num', '<=', $value);
                    });
                }
            }
        }

        foreach ($checkedCheckboxes as $category => $values) {
            if (!empty($values)) {
                $pid = $checkboxData[$category]['pid'];
                $query->whereHas('stadiProps', function ($query) use ($pid, $values) {
                    $query->whereIn('pid', [$pid])->whereIn('value_text', $values);
                });
            }
        }

        if ($sortBy === 'name') {
            $query->orderBy('base_name', $sortDirection);
        } elseif ($sortBy === 'dateAdded') {
            $query->orderBy('date_added', $sortDirection);
        }

        $stadi = $query->whereNotNull('base_name')->where('base_name', '!=', '')->skip($offset)->take($limit)->get();

        $checkboxValues = DB::table('stadi__props')
            ->whereIn('pid', [13, 14, 15, 16])
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get();

        $nameLvLinks = DB::table('stadi__props')
            ->where('pid', 1)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->where('value_text', 'like', '%http%')
            ->get(['bid', 'value_text']);

        $flowers = DB::table('stadi__props')
            ->where('pid', 5)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $crown = DB::table('stadi__props')
            ->where('pid', 8)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $foliage = DB::table('stadi__props')
            ->where('pid', 9)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $rangeSliderValues = DB::table('stadi__props')
            ->whereIn('pid', [3, 4, 6, 7, 25, 26])
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get();

        $descriptions = DB::table('stadi__props')
            ->where('pid', 10)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $purposes = DB::table('stadi__props')
            ->where('pid', 21)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $companions = DB::table('stadi__props')
            ->where('pid', 24)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $soilProperties = DB::table('stadi__props')
            ->where('pid', 13)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $waterProperties = DB::table('stadi__props')
            ->where('pid', 14)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $phProperties = DB::table('stadi__props')
            ->where('pid', 15)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $sunlightProperties = DB::table('stadi__props')
            ->where('pid', 16)
            ->whereIn('bid', $stadi->pluck('id')->all())
            ->get(['bid', 'value_text']);

        $results = $stadi->map(function ($item) use ($checkboxValues, $rangeSliderValues, $nameLvLinks, $flowers, $crown, $foliage, $descriptions, $purposes, $companions, $soilProperties, $waterProperties, $phProperties, $sunlightProperties) {
            $rangeSliders = [];
            $checkboxes = [];
            $additionalProperties = [
                'flowers' => [],
                'crown' => [],
                'foliage'=> [],
                'description' => [],
                'purposes' => [],
                'companions' => [],
                'soil' => [],
                'water' => [],
                'ph' => [],
                'sunlight' => [],
                'height_min' => [],
                'height_max' => [],
                'width_min' => [],
                'width_max' => [],
                'flower_height' => [],
                'leaf_height' => []
            ];

            foreach ($rangeSliderValues as $value) {
                if ($value->bid === $item->id) {
                    if (in_array($value->pid, [3, 4, 6, 7, 25, 26])) {
                        if (!isset($rangeSliders[$value->pid])) {
                            $rangeSliders[$value->pid] = [];
                        }
                        $rangeSliders[$value->pid][] = $value->value_num;
                    }
                    
                    if ($value->pid == 3) {
                        // Convert centimeters to meters and format as decimal if needed
                        $height_min = $value->value_num / 100;
                        if ($height_min < 1) {
                            $height_min = number_format($height_min, 2);
                        }
                        $additionalProperties['height_min'] = [$height_min . ' m'];
                    } elseif ($value->pid == 4) {
                        // Convert centimeters to meters and format as decimal if needed
                        $height_max = $value->value_num / 100;
                        if ($height_max < 1) {
                            $height_max = number_format($height_max, 2);
                        }
                        $additionalProperties['height_max'] = [$height_max . ' m'];
                    } elseif ($value->pid == 6) {
                        // Convert centimeters to meters and format as decimal if needed
                        $width_min = $value->value_num / 100;
                        if ($width_min < 1) {
                            $width_min = number_format($width_min, 2);
                        }
                        $additionalProperties['width_min'] = [$width_min . ' m'];
                    } elseif ($value->pid == 7) {
                        // Convert centimeters to meters and format as decimal if needed
                        $width_max = $value->value_num / 100;
                        if ($width_max < 1) {
                            $width_max = number_format($width_max, 2);
                        }
                        $additionalProperties['width_max'] = [$width_max . ' m'];
                    } elseif ($value->pid == 25) {
                        // Convert centimeters to meters and format as decimal if needed
                        $flower_height = $value->value_num / 100;
                        if ($flower_height < 1) {
                            $flower_height = number_format($flower_height, 2);
                        }
                        $additionalProperties['flower_height'] = [$flower_height . ' m'];
                    } elseif ($value->pid == 26) {
                        // Convert centimeters to meters and format as decimal if needed
                        $leaf_height = $value->value_num / 100;
                        if ($leaf_height < 1) {
                            $leaf_height = number_format($leaf_height, 2);
                        }
                        $additionalProperties['leaf_height'] = [$leaf_height . ' m'];
                    }
                }
            }

            foreach ($checkboxValues as $value) {
                if ($value->bid === $item->id) {
                    $checkboxes[$value->pid][] = $value->value_text;
                }
            }

            $links = [];
            foreach ($nameLvLinks as $link) {
                if ($link->bid === $item->id) {
                    $links[] = $link->value_text;
                }
            }

            foreach ($flowers as $flower) {
                if ($flower->bid === $item->id) {
                    $additionalProperties['flowers'][] = $flower->value_text;
                }
            }

            foreach ($crown as $cr) {
                if ($cr->bid === $item->id) {
                    $additionalProperties['crown'][] = $cr->value_text;
                }
            }

            foreach ($foliage as $foli) {
                if ($foli->bid === $item->id) {
                    $additionalProperties['foliage'][] = $foli->value_text;
                }
            }

            foreach ($descriptions as $desc) {
                if ($desc->bid === $item->id) {
                    $additionalProperties['description'][] = $desc->value_text;
                }
            }

            foreach ($purposes as $pur) {
                if ($pur->bid === $item->id) {
                    $additionalProperties['purposes'][] = $pur->value_text;
                }
            }

            foreach ($companions as $comp) {
                if ($comp->bid === $item->id) {
                    $additionalProperties['companions'][] = $comp->value_text;
                }
            }

            foreach ($soilProperties as $soil) {
                if ($soil->bid === $item->id) {
                    $additionalProperties['soil'][] = $soil->value_text;
                }
            }

            foreach ($waterProperties as $water) {
                if ($water->bid === $item->id) {
                    $additionalProperties['water'][] = $water->value_text;
                }
            }

            foreach ($phProperties as $ph) {
                if ($ph->bid === $item->id) {
                    $additionalProperties['ph'][] = $ph->value_text;
                }
            }

            foreach ($sunlightProperties as $sun) {
                if ($sun->bid === $item->id) {
                    $additionalProperties['sunlight'][] = $sun->value_text;
                }
            }

            $baseDescr = $item->base_descr ?? 'Press Show Info for more';

            foreach ($soilProperties as $soil) {
                if ($soil->bid === $item->id) {
                    // Explode the value_text by comma to handle multiple soil values
                    $soilValues = explode(',', $soil->value_text);
                    foreach ($soilValues as $value) {
                        // Map the value_text to soil text
                        $soilText = '';
                        switch ($value) {
                            case 1:
                                $soilText = 'Chalk';
                                break;
                            case 2:
                                $soilText = 'Clay';
                                break;
                            case 3:
                                $soilText = 'Loam';
                                break;
                            case 4:
                                $soilText = 'Sand';
                                break;
                        }
                        
                        if (!empty($soilText)) {
                            // Check if "soil" array already exists, if not, create it
                            if (!isset($additionalProperties['soil'])) {
                                $additionalProperties['soil'] = [];
                            }
                            // Append the soil text to the "soil" array
                            $additionalProperties['soil'][] = $soilText;
                        }
                    }
                }
            }
            
            foreach ($waterProperties as $water) {
                if ($water->bid === $item->id) {
                    // Explode the value_text by comma to handle multiple water values
                    $waterValues = explode(',', $water->value_text);
                    foreach ($waterValues as $value) {
                        // Map the value_text to water text
                        $waterText = '';
                        switch ($value) {
                            case 1:
                                $waterText = 'Well-drained';
                                break;
                            case 2:
                                $waterText = 'Moist but well-drained';
                                break;
                            case 3:
                                $waterText = 'Poorly-drained';
                                break;
                        }
                        
                        if (!empty($waterText)) {
                            // Check if "water" array already exists
                            if (!isset($additionalProperties['water'])) {
                                $additionalProperties['water'] = [];
                            }
                            // Append the water text to the "water" array
                            $additionalProperties['water'][] = $waterText;
                        }
                    }
                }
            }
                        
            foreach ($phProperties as $ph) {
                if ($ph->bid === $item->id) {
                    // Explode the value_text by comma to handle multiple pH values
                    $phValues = explode(',', $ph->value_text);
                    foreach ($phValues as $value) {
                        // Map the value_text to pH text
                        $phText = '';
                        switch ($value) {
                            case 1:
                                $phText = 'Acid 0-6.5';
                                break;
                            case 2:
                                $phText = 'Alkaline 7.4+';
                                break;
                            case 3:
                                $phText = 'Neutral 6.6–7.3';
                                break;
                        }
            
                        if (!empty($phText)) {
                            // Check if "ph" array already exists, if not, create it
                            if (!isset($additionalProperties['ph'])) {
                                $additionalProperties['ph'] = [];
                            }
                            // Append the pH text to the "ph" array
                            $additionalProperties['ph'][] = $phText;
                        }
                    }
                }
            }

            foreach ($sunlightProperties as $sunlight) {
                if ($sunlight->bid === $item->id) {
                    // Explode the value_text by comma to handle multiple sunlight values
                    $sunlightValues = explode(',', $sunlight->value_text);
                    foreach ($sunlightValues as $value) {
                        // Map the value_text to sunlight text
                        $sunlightText = '';
                        switch ($value) {
                            case 1:
                                $sunlightText = 'Full sun';
                                break;
                            case 2:
                                $sunlightText = 'Partial shade';
                                break;
                            case 3:
                                $sunlightText = 'Full shade';
                                break;
                        }
            
                        if (!empty($sunlightText)) {
                            // Check if "sunlight" array already exists, if not, create it
                            if (!isset($additionalProperties['sunlight'])) {
                                $additionalProperties['sunlight'] = [];
                            }
                            // Append the sunlight text to the "sunlight" array
                            $additionalProperties['sunlight'][] = $sunlightText;
                        }
                    }
                }
            }
            
            foreach ($additionalProperties as $key => $value) {
                if (empty($value)) {
                    $additionalProperties[$key] = ['No Information'];
                }
            }
            
            return [
                'id' => $item->id,
                'base_name' => $item->base_name,
                'date_added' => $item->date_added,
                'base_descr' => $baseDescr,
                'range_sliders' => $rangeSliders,
                'checkboxes' => $checkboxes,
                'synonyms' => $item->synonyms->map(function ($synonym) {
                    return [
                        'type' => $synonym->type,
                        'name' => $synonym->synonym
                    ];
                }),
                'links' => $links,
                'additional_properties' => $additionalProperties
            ];
        });

        $suggestions = Stadi::where('base_name', 'like', '%' . $search . '%')
            ->orWhereHas('synonyms', function ($query) use ($search) {
                $query->where('synonym', 'like', '%' . $search . '%');
            })
            ->limit(5)
            ->get();

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

        $responseData = [
            'stadi' => $results->toArray(),
            'suggestions' => $formattedSuggestions,
        ];

        $pidRangeSliderValues = DB::table('stadi__props')
            ->whereIn('pid', [3, 4, 6, 7, 25, 26])
            ->select('pid', DB::raw('MIN(value_num) as min_value'), DB::raw('MAX(value_num) as max_value'))
            ->groupBy('pid')
            ->get();

        $pidRangeSliderValues->each(function ($pidRangeSlider) use (&$responseData) {
            $pid = 'pid_' . $pidRangeSlider->pid . '_range_slider_values';
            if (in_array($pidRangeSlider->pid, [3, 4, 6, 7, 25, 26])) {
                $responseData[$pid] = [
                    'min' => $pidRangeSlider->min_value,
                    'max' => $pidRangeSlider->max_value
                ];
            }
        });

        return response()->json($responseData, 200);
    }

    public function show($base_name)
    {
        $stadi = Stadi::where('base_name', $base_name)->first();

        if (!$stadi) {
            return response()->json(['error' => 'Plant not found'], 404);
        }

        return view('stadi.show', ['stadi' => $stadi]);
    }
}