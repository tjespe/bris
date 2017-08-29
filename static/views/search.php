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

<lazy ng-if="master.lazyModulesLoaded"><lazy ng-controller="lazyStuff"></lazy></lazy>
<div ng-if="master.lazyModulesLoaded">
  <div ng-controller="searchController as s">
    <input type="text" ng-model="s.query" placeholder="<?= $text->{'typeLocation'} ?>" ng-keyup="s.search()">
    <div ng-if="s.matches.length>0" class="matching-locations">
      <a ng-repeat="match in s.matches" class="row location-row" href="{{match[1].replace('/sted', '')}}">
        <div class="place-description">
          {{match[0]}}
          <div>{{match[2]}}</div>
        </div>
        <div>
          <img ng-src="{{'https://fil.nrk.no/contentfile/web/icons/flags/h14/'+match[3]+'.png'}}" alt="" />
        </div>
      </a>
    </div>
    <div ng-if="s.matches.length == 0 && s.query.length > 0">
      <?= $text->{'noMatches'} ?>
    </div>
  </div>
</div>
