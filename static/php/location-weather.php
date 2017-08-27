<?php

$start = round(microtime(true) * 1000000);
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
//error_reporting(0);
//ini_set('display_errors', 0);
$norsk = ($lang == "nb" || $lang == "nn" || $lang == "no" || (isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "no")) && !(isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "en");
//error_reporting(0);
//ini_set('display_errors', 0);
$echo = [];
$echo['log'] = '';
$gmt = (int) $_GET['gmt'];
$file = "http://api.met.no/weatherapi/locationforecast/1.9/?lat=".$_GET['lat'].";lon=".$_GET['long'];
if(!$xml = simplexml_load_file($file)){
  $echo['fail'] = true;
} else {
  $echo['fail'] = false;
}
//var_dump($xml->{'product'}->{'time'});
//echo json_encode($xml, JSON_PRETTY_PRINT);
//echo date_sunrise(time(), SUNFUNCS_RET_STRING, $_GET['lat'], $_GET['long'], ini_get("date.sunrise_zenith"), $gmt);
$forecast = [];
//var_dump($xml->{'product'}->{'time'}[0])
$data = json_decode(json_encode($xml));
$norge = false;
for ($i=0; $i < 6; $i++) {
  $obj = $data->{'product'}->{'time'}[$i];
  if (strtotime($obj->{'@attributes'}->{'to'})-strtotime($obj->{'@attributes'}->{'from'}) == 60*60) {
    $norge = true;
  }
}
//echo "Norge = ".json_encode($norge)."\n";
foreach ($data->{'product'}->{'time'} as $obj ) {
  //echo json_encode($obj, JSON_PRETTY_PRINT);
  $data = [];
  //$push = false;
  $diff = strtotime($obj->{'@attributes'}->{'to'})-strtotime($obj->{'@attributes'}->{'from'});
  //var_dump($obj->{'@attributes'});
  if ($diff==0) {
    $id = date('d H', strtotime($obj->{'@attributes'}->{'from'}));
    $forecast[$id] = [];
    //echo json_encode($obj, JSON_PRETTY_PRINT);
    //array_push($forecast, $obj);
    $time = strtotime($obj->{'@attributes'}->{'from'});
    $sunrise = strtotime(date('d F Y ', $time).date_sunrise($time, SUNFUNCS_RET_STRING, $_GET['lat'], $_GET['long'], ini_get("date.sunrise_zenith"), $gmt)) - (60*60*$gmt);
    $sunset = strtotime(date('d F Y ', $time).date_sunset($time, SUNFUNCS_RET_STRING, $_GET['lat'], $_GET['long'], ini_get("date.sunset_zenith"), $gmt)) - (60*60*$gmt);
    $forecast[$id]['hour'] = date('H', $time + (60*60*$gmt));
    $forecast[$id]['day'] = date('w', $time + (60*60*$gmt));
    $forecast[$id]['date'] = date('d', $time + (60*60*$gmt));
    $forecast[$id]['degs'] = ((int) $obj->{'location'}->{'temperature'}->{'@attributes'}->{'value'});
    $forecast[$id]['meta'] = array(
      "daytime" => $time > $sunrise && $time < $sunset || date_sunrise($time, SUNFUNCS_RET_STRING, $_GET['lat'], $_GET['long'], ini_get("date.sunrise_zenith"), $gmt) == false,
      "lunarPhase" => lunar_phase($time)
    );
    $forecast[$id]['wind'] = ((int) $obj->{'location'}->{'windSpeed'}->{'@attributes'}->{'mps'});
    $forecast[$id]['humidity'] = ((int) $obj->{'location'}->{'humidity'}->{'@attributes'}->{'value'}).'%';
    $forecast[$id]['pressure'] = ((int) $obj->{'location'}->{'pressure'}->{'@attributes'}->{'value'}).' hPa';
    $forecast[$id]['cloudiness'] = ((int) $obj->{'location'}->{'cloudiness'}->{'@attributes'}->{'percent'}).'%';
    $forecast[$id]['fog'] = ((int) $obj->{'location'}->{'fog'}->{'@attributes'}->{'percent'}).'%';
    $forecast[$id]['windDir'] = array(
      "deg" => ((int) $obj->{'location'}->{'windDirection'}->{'@attributes'}->{'deg'}),
      "name" => $obj->{'location'}->{'windDirection'}->{'@attributes'}->{'name'}
    );
  } else {
    $push = false;
    if (strtotime($obj->{'@attributes'}->{'to'})<time()+60*60*24*2+60*60*18) {
      //echo "From ".$obj->{'@attributes'}->{'from'}." to ".$obj->{'@attributes'}->{'to'}." Diff: $diff\n";
      if ($diff == 60*60) {
        //echo "PUSHING: From ".date('D H', strtotime($obj->{'@attributes'}->{'from'}))." to ".date('H', strtotime($obj->{'@attributes'}->{'to'}))."\n";
        $push = true;
      } elseif (!$norge && $diff == 60*60*3) {
        //echo "PUSHING: From ".date('D H', strtotime($obj->{'@attributes'}->{'from'}))." to ".date('H', strtotime($obj->{'@attributes'}->{'to'}))."\n";
        $push = true;
      }
    } else {
      //echo "From ".$obj->{'@attributes'}->{'from'}." to ".$obj->{'@attributes'}->{'to'}." Diff: $diff\n";
      if ($diff == 60*60*6) {
        $push = true;
        //echo "PUSHING: From ".date('D H', strtotime($obj->{'@attributes'}->{'from'}))." to ".date('H', strtotime($obj->{'@attributes'}->{'to'}))."\n";
      }
    }
    if ($push) {
      $id = date('d H', strtotime($obj->{'@attributes'}->{'from'}));
      $forecast[$id]['precipitation'] = $obj->{'location'}->{'precipitation'}->{'@attributes'}->{'value'};
      $forecast[$id]['meta']['symbol'] = $obj->{'location'}->{'symbol'}->{'@attributes'}->{'number'};
      $forecast[$id]['hourTo'] = str_pad(((int) $forecast[$id]['hour']) + $diff/(60*60), 2, "0", STR_PAD_LEFT);
      if ($forecast[$id]['hourTo']>23) {
        $forecast[$id]['hourTo'] = str_pad($forecast[$id]['hourTo']-24, 2, "0", STR_PAD_LEFT);
      }
      //var_dump($obj->{'location'}->{'symbol'}->{'@attributes'});
      $forecast[$id]['iconAlt'] = str_replace("LightCloud","Light Clouds",str_replace("PartlyCloud", "Partly Cloudy", $obj->{'location'}->{'symbol'}->{'@attributes'}->{'id'}));
    }
  }
}
$report = [];
foreach ($forecast as $key => &$entry) {
  if (!isset($entry['hour'])) {
    unset($forecast[$key]);
  }
  $s = $entry['meta']['symbol'];
  if ($s == 1 || $s == 2 || $s == 3 || $s == 5 || $s == 6 || $s == 7 || $s == 8 || $s == 24 || $s == 40 || $s == 41) {
    if ($entry['meta']['daytime']) {
      $entry['icon'] = str_pad($s, 2, "0", STR_PAD_LEFT)."d";
    } else {
      $entry['icon'] = "mf/".str_pad($s, 2, "0", STR_PAD_LEFT)."n.".str_pad($entry['meta']['lunarPhase'], 2, "0", STR_PAD_LEFT);
    }
  } else {
    $entry['icon'] = str_pad($s, 2, "0", STR_PAD_LEFT);
  }
  unset($entry["meta"]);
  if (isset($entry['hour']) && isset($entry['hourTo'])) {
    array_push($report, $entry);
  }
}
$echo['data'] = $report;
echo json_encode($echo, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

function lunar_phase($timestamp)
{
  // calculate lunar phase (1900 - 2199)
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
  //$phase_array = array('new', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'last quarter', 'waning crescent');
  //$lunar_phase = $phase_array[$phase];
  return $phase;
}

 ?>
