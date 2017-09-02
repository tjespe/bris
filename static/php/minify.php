<?php

error_reporting( E_ALL );
ini_set('display_errors', 1);

$start = round(microtime(true) * 1000000);

$path = "../../..";
require_once $path . '/minify/src/Minify.php';
require_once $path . '/minify/src/CSS.php';
require_once $path . '/minify/src/JS.php';
require_once $path . '/minify/src/Exception.php';
require_once $path . '/path-converter/src/Converter.php';
use MatthiasMullie\Minify;
$t7 = round(microtime(true) * 1000000) - $start;
$path .= "/public_html/static/js";
$version = (int) file_get_contents($path.'/version') + 1;
echo "<h1>Version $version</h1>";
file_put_contents($path.'/version', $version);
$minifier = new Minify\JS($path.'/app.js');
//$minifier->add($path.'/services/loading-bar.min.js');
//$minifier->add($path.'/scripts/analytics.js');
$minifier->add($path.'/controllers/masterCtrl.js');
//$minifier->add($path.'/directives/embedSrc.js');
//$minifier->add($path.'/directives/scroll.js');
$minifier->add($path.'/directives/para-back.js');
//$minifier->add($path.'/filters/reverse.js');
$t8 = round(microtime(true) * 1000000) - $start;
$js = $minifier->minify();
$js .= ";app.value('version', $version)";

$lmin = new Minify\JS($path.'/controllers/weatherCtrl.js');
//$lmin->add($path.'/services/local-storage.js');
//$lmin->add($path.'/directives/embedSrc.js');
//$lmin->add($path.'/directives/scroll.js');
$lmin->add($path.'/controllers/searchCtrl.js');
$lmin->add($path.'/controllers/cookieCtrl.js');
//$lmin->add($path.'/scripts/cookie-script.js');
$ljs = $lmin->minify();

$cssMin = new Minify\CSS('../css/main.css');
$css = $cssMin->minify();

/*$ngMinifier = new Minify\JS($path.'/public_html/static/js/angular.js');
$ngMin = $ngMinifier->minify();*/

$file = $path.'/initial.min.js';
if (file_put_contents($file, $js)) {
  echo "<h2>The code below was successfully saved to $file</h2>$js<br><br>";
}

$lazyLocation = $path.'/lazyModules.js';
if (file_put_contents($lazyLocation, $ljs)) {
  echo "<h2>The code below was successfully saved to $lazyLocation</h2>$ljs<br><br>";
}

$cssLoc = '../css/main.min.css';
if (file_put_contents($cssLoc, $css)) {
  echo "<h2>The code below was successfully saved to $cssLoc</h2>$css<br><br>";
}

/*if (file_put_contents($path.'/public_html/static/js/angular.min.js', $ngMin)) {
  echo "<h2>The code below was successfully saved to ".$path.'/public_html/static/js/angular.min.js'."</h2>$ngMin<br><br>";
}*/

 ?>
