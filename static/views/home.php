<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: application/json;charset=utf-8');
$dname = explode('.', $_SERVER['HTTP_HOST'])[1];
$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
$norsk = ($lang == "nb" || $lang == "nn" || $lang == "no" || (isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "no")) && !(isset($_GET['lang']) && substr($_GET['lang'], 0, 2) == "en");
if($norsk){
  $text = json_decode(file_get_contents("../js/objects/no-text.json"));
} else {
  $text = json_decode(file_get_contents("../js/objects/en-text.json"));
}

 ?>

<section ng-hide="master.fail" ng-if="master.lazyModulesLoaded" ng-controller="weatherCtrl as w">
  <h3 ng-if="master.weatherLoaded()"><?= $text->{'showingWFor'} ?> {{master.location}}</h3>
  <ul class="list-group" ng-if="!master.hideFlipDeviceTip">
    <li class="list-group-item list-group-item-info" ng-if="view.width<=515" ng-show="master.weatherLoaded()"><?= $text->{'rotateTip'} ?></li>
  </ul>
  <div ng-if="master.weatherLoaded()" ng-cloak>
    <div class="row semi-row" id="table-header">
      <div><?= $text->{'time'} ?></div>
      <div><?= $text->{'weather'} ?></div>
      <div><?= $text->{'degrees'} ?></div>
      <div ng-if="view.width>413"><?= $text->{'precipitation'} ?></div>
      <div ng-if="view.width>515"><?= $text->{'windSpeed'} ?></div>
    </div>
    <div ng-repeat="(i, day) in master.data">
      <div class="dateshift row semi-row" ng-if="i > 0"><div ng-bind="::day.day"></div></div>
      <div ng-repeat="(j, period) in day.data">
        <div class="summarized row" ng-class="{'show-row':period.currently_summarized}">
          <div ng-class="{'expand-btn': period.data.length > 1}" ng-click="master.toggle(i, j)">
            <span style="margin-bottom:20px;"><? if ($norsk) {?>Kl <?} ?>{{::period.hour}}-{{::period.hourTo}}</span>
            <span ng-if="period.data.length>1" class="glyphicon glyphicon-menu-down"></span>
          </div>
          <div>
            <span>
              <moon ng-if="period.icon.indexOf('mf') > -1" offset="{{::period.offset}}" style="{{'box-shadow: #ffe599 '+period.phase+'px 0px inset;'}}"></moon>
              <img class="weather-icon" ng-src="{{::period.foreground}}" style="{{::'background-image:url('+period.background+');'}}" ng-class="{'background-offset':period.offset}">
            </span>
          </div>
          <div><span ng-bind="::period.degs+'ºC'"></span></div>
          <div ng-if="view.width > 413"><span ng-bind="::period.precipitation+' mm'"></span></div>
          <div ng-if="view.width > 515"><span ng-bind="::period.wind+' m/s'"></span></div>
        </div>
        <div class="row" ng-repeat="hour in period.data track by $index" ng-class="{'summarized':period.summarizeable,'show-row':!period.currently_summarized}">
          <div><span><? if ($norsk) {?>Kl <?} ?>{{::hour.hour}}-{{::hour.hourTo}}</span></div>
          <div>
            <span>
              <moon ng-if="hour.icon.indexOf('mf') > -1" offset="{{::hour.offset}}" style="{{'box-shadow: #ffe599 '+hour.phase+'px 0px inset;'}}" ng-class="{'moon-alone':!hour.showImg}"></moon>
              <img ng-if="hour.showImg" class="weather-icon" ng-src="{{::hour.foreground}}" style="{{::'background-image:url('+hour.background+');'}}" ng-class="{'background-offset':hour.offset}">
            </span>
          </div>
          <div><span ng-bind="::hour.degs+'ºC'"></span></div>
          <div ng-if="view.width>413"><span ng-bind="::hour.precipitation+' mm'"></span></div>
          <div ng-if="view.width>515"><span ng-bind="::hour.wind+' m/s'"></span></div>
        </div>
      </div>
    </div>
  </div>
  <span ng-if="master.weatherLoaded()"><?= $text->{'metCredit'} ?></span>
</section>

<img src="/static/img/loading.svg" class="loader" ng-if="!master.weatherLoaded()" />
<ul class="list-group" ng-if="master.fail" style="margin-bottom: 0px;margin-top: 20px;"><li class="list-group-item list-group-item-danger"><?= $text->{'fetchFail'} ?></li></ul>
