<?php

// Save start time as a variable
$start = round(microtime(true) * 1000000);
// Set the right HTTP headers
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json;charset=utf-8');
// Check if norwegian language is preferred
$norsk = ($lang == "nb" || $lang == "nn" || $lang == "no" || (isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "no")) && !(isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "en");
// Initialize a variable for everything that will be printed
$echodata = [];
$echodata['log'] = '';
// Use Google API to set correct timezone
date_default_timezone_set(json_decode(file_get_contents("https://maps.googleapis.com/maps/api/timezone/json?location=".$_GET['lat'].",".$_GET['long']."&key=AIzaSyD90U93HV6FcbMQLREq5MoiiO_jWV_xz-U&timestamp=".time()))->{"timeZoneId"});
// Make request to API
$file = "http://api.met.no/weatherapi/locationforecast/1.9/?lat=".$_GET['lat'].";lon=".$_GET['long'];
$echodata['fail'] = !$xml = simplexml_load_file($file);
// Encode and decode xml as JSON, to make accessing variables easier (this was kind of a hack, a better solution should probably be implemented)
$rawdata = json_decode(json_encode($xml));
// Check if the location is in Norway
$norge = false;
for ($i=0; $i < 6; $i++) {
  $obj = $rawdata->{'product'}->{'time'}[$i];
  if (strtotime($obj->{'@attributes'}->{'to'})-strtotime($obj->{'@attributes'}->{'from'}) == 60*60) {
    $norge = true;
  }
}

/*
 * Loop through the data and group it correctly
 * (the API gives some data for moments and some for periods,
 * this foreach loop puts all the data sorted in periods)
*/
$data_sorted_in_periods = [];
foreach ($rawdata->{'product'}->{'time'} as $obj ) {
  $duration = strtotime($obj->{'@attributes'}->{'to'})-strtotime($obj->{'@attributes'}->{'from'});
  $id = date('d H', strtotime($obj->{'@attributes'}->{'from'}));
  $hour_object = $data_sorted_in_periods[$id];
  if ($duration==0) {
    $time = strtotime($obj->{'@attributes'}->{'from'});
    $hour_object['hour'] = date('H', $time);
    $hour_object['day'] = date('w', $time);
    $hour_object['date'] = date('d', $time);
    $hour_object['unix'] = $time;
    $hour_object['degs'] = (int) $obj->{'location'}->{'temperature'}->{'@attributes'}->{'value'};
    $hour_object['wind'] = (int) $obj->{'location'}->{'windSpeed'}->{'@attributes'}->{'mps'};
    $sunrise = date_sunrise($time, SUNFUNCS_RET_DOUBLE, $_GET['lat'], $_GET['long']);
    $sunset = date_sunset($time, SUNFUNCS_RET_DOUBLE, $_GET['lat'], $_GET['long']);
    $hour_of_day = (int) date('G', $time);
    // The meta data is used to create an icon URL
    $hour_object['meta'] = [
      "daytime" => $hour_of_day > $sunrise && $hour_of_day < $sunset || $sunrise == false,
      "lunarPhase" => lunar_phase($time)
    ];
    $data_sorted_in_periods[$id] = $hour_object;
  } else {
    $less_than_66_hours_until = strtotime($obj->{'@attributes'}->{'to'})<time()+60*60*66;
    if ($less_than_66_hours_until && $duration == 60*60 || (!$norge && $duration == 60*60*3) || !$less_than_66_hours_until && $duration == 60*60*6) {
      $hour_object['precipitation'] = $obj->{'location'}->{'precipitation'}->{'@attributes'}->{'value'};
      $hour_object['meta']['symbol'] = $obj->{'location'}->{'symbol'}->{'@attributes'}->{'number'};
      $hour_object['hourTo'] = str_pad(((int) $hour_object['hour']) + $duration/(60*60), 2, "0", STR_PAD_LEFT);
      if ($hour_object['hourTo']>23) {
        $hour_object['hourTo'] = str_pad($hour_object['hourTo']-24, 2, "0", STR_PAD_LEFT);
      }
      $hour_object['iconAlt'] = str_replace("LightCloud","Light Clouds",str_replace("PartlyCloud", "Partly Cloudy", $obj->{'location'}->{'symbol'}->{'@attributes'}->{'id'}));
      $data_sorted_in_periods[$id] = $hour_object;
    }
  }
}

/*
 * Loop through the data and create the completely processed data object.
 * This second for loop is needed because the icon URL can not be determined
 * without information from the moment-sorted and periodically sorted API data.
*/
$echodata['data'] = [];
foreach ($data_sorted_in_periods as $entry) {
  // Get symbol code and turn it into an icon url
  $symbol = $entry['meta']['symbol'];
  if ($symbol == 1 || $symbol == 2 || $symbol == 3 || $symbol == 5 || $symbol == 6 || $symbol == 7 || $symbol == 8 || $symbol == 24 || $symbol == 40 || $symbol == 41) {
    if ($entry['meta']['daytime']) {
      $entry['icon'] = str_pad($symbol, 2, "0", STR_PAD_LEFT)."d";
    } else {
      $entry['icon'] = "mf/".str_pad($symbol, 2, "0", STR_PAD_LEFT)."n.".str_pad($entry['meta']['lunarPhase'], 2, "0", STR_PAD_LEFT);
    }
  } else {
    $entry['icon'] = str_pad($symbol, 2, "0", STR_PAD_LEFT);
  }
  // It is not necessary to send the meta data to the client
  unset($entry["meta"]);
  // Push to echodata if everything is correct
  if (isset($entry['hour']) && isset($entry['hourTo'])) {
    array_push($echodata['data'], $entry);
  }
}

// Encode and print the data
echo json_encode($echodata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);


// Calculate lunar phase (this function works for years 1900-2199)
function lunar_phase($timestamp)
{
  $year = date('Y', $timestamp);
  $month = date('n', $timestamp);
  $day = date('j', $timestamp);
  if ($month < 4) {$year = $year - 1; $month = $month + 12;}
  $days_y = 365.25 * $year;
  $days_m = 30.42 * $month;
  $julian = $days_y + $days_m + $day - 694039.09;
  $julian = $julian / 29.53;
  $phase = intval($julian);
  $julian = $julian - $phase;
  $phase = round($julian * 100 + 0.5);
  if ($phase == 100) {$phase = 0;}
  return $phase;
}

 ?>
