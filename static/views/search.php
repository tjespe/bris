<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
$norsk = ($lang == "nb" || $lang == "nn" || $lang == "no" || (isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "no")) && !(isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "en");
if($norsk){
  $text = json_decode(file_get_contents("../js/objects/no-text.json"));
} else {
  $text = json_decode(file_get_contents("../js/objects/en-text.json"));
}

 ?>

<div ng-if="master.lazyModulesLoaded">
  <div ng-controller="searchController as s">
    <input type="text" ng-model="s.query" placeholder="<?= $text->{'typeLocation'} ?>" ng-keyup="s.search()">
    <div ng-if="s.matches.length>0" class="matching-locations">
      <a ng-repeat="match in s.matches" class="row location-row" href="{{'/'+match.description}}">
        <div class="place-description">
          <span ng-bind="match.structured_formatting.main_text"></span>
          <div ng-bind="match.structured_formatting.secondary_text"></div>
        </div>
        <div>
          <img ng-src="{{'https://restcountries.eu/data/'+match.country+'.svg'}}" alt="" />
        </div>
      </a>
    </div>
    <div ng-if="s.matches.length == 0 && s.query.length > 0">
      <?= $text->{'noMatches'} ?>
    </div>
  </div>
</div>
