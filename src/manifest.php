<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: text/cache-manifest');
$v = file_get_contents('js/version');
$wicons = [];
foreach (array_diff(scandir('img/modern-icons'), array('.', '..')) as $value) {
  if (is_file('img/modern-icons/'.$value)) {
    array_push($wicons, $value);
  }
}
 ?>
CACHE MANIFEST

# Offline Cache version <?= $v + 13 ?>


CACHE:
/
/src/manifest.php
index.html
https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js
/src/js/initial.min.js
/src/js/initialJSON.php
/src/img/background.jpg
/src/views/search.html
/src/views/home.html
/src/html/cookie-box.html
/src/img/loading.svg
<?php foreach ($wicons as $wicon ) { ?>
/src/img/modern-icons/<?= $wicon ?>

<?php } ?>
https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css
/fonts/glyphicons-halflings-regular.woff2

NETWORK:
*
http://*
https://*

FALLBACK:
