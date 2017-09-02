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
$path .= "/public_html/src/js";
$minifier = new Minify\JS($path.'/app.js');
$minifier->add($path.'/controllers/masterCtrl.js');
$minifier->add($path.'/directives/para-back.js');
$t8 = round(microtime(true) * 1000000) - $start;
$js = $minifier->minify();
$version = (int) file_get_contents($path.'/../../min/version') + 1;
$js .= ";app.value('version', $version)";

$lmin = new Minify\JS($path.'/controllers/weatherCtrl.js');
$lmin->add($path.'/controllers/searchCtrl.js');
$lmin->add($path.'/controllers/cookieCtrl.js');
$ljs = $lmin->minify();

$cssMin = new Minify\CSS('../css/main.css');
$css = $cssMin->minify();

$path = "../../min";
echo "<h1>Version $version</h1>";
file_put_contents($path.'/version', $version);

$file = $path.'/initial.min.js';
if (file_put_contents($file, $js)) {
  echo "<h2>The code below was successfully saved to $file</h2>$js<br><br>";
}

$lazyLocation = $path.'/lazyModules.js';
if (file_put_contents($lazyLocation, $ljs)) {
  echo "<h2>The code below was successfully saved to $lazyLocation</h2>$ljs<br><br>";
}

$cssLoc = $path.'/main.min.css';
if (file_put_contents($cssLoc, $css)) {
  echo "<h2>The code below was successfully saved to $cssLoc</h2>$css<br><br>";
}

 ?>
