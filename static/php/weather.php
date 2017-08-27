<?php

$start = round(microtime(true) * 1000000);
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
error_reporting(0);
ini_set('display_errors', 0);
$norsk = ($lang == "nb" || $lang == "nn" || $lang == "no" || (isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "no")) && !(isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "en");
error_reporting(0);
ini_set('display_errors', 0);
$echo = [];
$echo['log'] = '';
$file = "http://www.yr.no/sted/".$_GET['yrstring']."/varsel_time_for_time.xml";
$cd = date("F-d-G");
$lfile = '../js/objects/weather/'.$_GET['yrstring']."/$cd.json";
if (!file_exists($lfile) || (file_exists($lfile) && json_decode($lfile)['fail'])) {
//if (true) {
  if(!$xml = simplexml_load_file($file)){
    $echo['fail'] = true;
  } else {
    $echo['fail'] = false;
  }
  $data = $xml->{'forecast'}->{'tabular'}->{'time'};
  //var_dump(json_decode(json_encode($xml->{'forecast'}->{'tabular'}, JSON_PRETTY_PRINT))->{'time'});
  $forecast = json_decode(json_encode($xml->{'forecast'}->{'tabular'}, JSON_PRETTY_PRINT))->{'time'};
  //echo json_encode($forecast, JSON_PRETTY_PRINT);
  $forecast_mod = [];
  foreach ($forecast as $hour ) {
    //var_dump($hour);
    $data = [];
    $data['degs'] = (int) $hour->{'temperature'}->{'@attributes'}->{'value'};
    $data['day'] = (int) date('w', strtotime($hour->{'@attributes'}->{'from'}));
    $data['date'] = date('d', strtotime($hour->{'@attributes'}->{'from'}));
    $data['hour'] = str_pad(date('H', strtotime($hour->{'@attributes'}->{'from'})), 2, "0", STR_PAD_LEFT);
    $data['hourTo'] = str_pad(date('H', strtotime($hour->{'@attributes'}->{'to'})), 2, "0", STR_PAD_LEFT);
    $data['icon'] = $hour->{'symbol'}->{'@attributes'}->{'var'};
    $data['precipitation'] = $hour->{'precipitation'}->{'@attributes'}->{'value'};
    $data['wind'] = $hour->{'windSpeed'}->{'@attributes'}->{'mps'};
    array_push($forecast_mod, $data);
  }
  $echo['data'] = $forecast_mod;
  $pdirs = explode('/', $_GET['yrstring']);
  for ($i=1; $i < count($pdirs); $i++) {
    $pdirs[$i] = $pdirs[$i-1].'/'.$pdirs[$i];
  }
  foreach ($pdirs as $pdir ) {
    if (!file_exists('../js/objects/weather/'.$pdir)) {
      mkdir('../js/objects/weather/'.$pdir);
    }
  }
  $tot = (round(microtime(true) * 1000000) - $start)/1000;
  $echo['log'] .= "$tot ms";
  file_put_contents($lfile, json_encode($echo, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
}
echo file_get_contents($lfile);

 ?>
