<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
// the message
if (isset($_GET['ip'])) {
  $ip = $_GET['ip'];
} else {
  $ip = get_client_ip();
}
$msg = "Denne IP-addressen virker ikke: $ip\nYr-stringen ble ".$_GET['yrstring'];
$dname = explode('.', $_SERVER['HTTP_HOST'])[1];

$log = "";
// send email
if (mail("tordjohanespe@gmail.com","Feil på $dname",$msg)) {
  $log = "Feilen ble rapportert med ip $ip og yrstring ".$_GET['yrstring'];
} else {
  if (mail("tordjohanespe@gmail.com","Feil på $dname",$msg)) {
    $log = "Feilen ble rapportert med ip $ip og yrstring ".$_GET['yrstring'];
  } else {
    $log = "Feilen ble IKKE rapportert med ip $ip og yrstring ".$_GET['yrstring'];
  }
}
echo json_encode($log);

function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

 ?>
