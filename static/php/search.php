<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
echo file_get_contents('http://www.yr.no/_/websvc/jsonforslagsboks.aspx?s='.urlencode($_GET['q']));

 ?>
