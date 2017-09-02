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

<lazy ng-if="master.lazyModulesLoaded"><lazy ng-controller="weatherCtrl"></lazy></lazy>
<section ng-hide="master.fail">
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
    <div>
      <div ng-repeat="day in master.data track by $index">
        <div ng-if="day.index != 0" class="dateshift row semi-row"><div>{{::day.day}}</div></div>
        <div ng-repeat="period in day.periods track by $index">
          <div ng-if="period.showSummary" class="summarized row" ng-class="{'show-row':!day.showFull[period.group]}">
            <div ng-if="period.data.length>1" class="expand-btn" ng-click="master.toggle(day.index, period.group)">
              <span style="margin-bottom:20px;"><? if ($norsk) {?>Kl <?} ?>{{::period.summary.hour}}-{{::period.summary.hourTo}}</span>
              <span class="glyphicon glyphicon-menu-down"></span>
            </div>
            <div ng-if="period.data.length<=1"><span><? if ($norsk) {?>Kl <?} ?>{{::period.summary.hour}}-{{::period.summary.hourTo}}</span></div>
            <div>
              <span>
                <moon ng-if="period.summary.icon.indexOf('mf') > -1" offset="{{::period.summary.offset}}" style="{{'box-shadow: #ffe599 '+period.summary.phase+'px 0px inset;'}}" ng-class="{'moon-alone':!period.summary.showImg}"></moon>
                <img ng-if="period.summary.showImg" class="weather-icon" ng-src="{{::period.summary.foreground}}" style="{{::'background-image:url('+period.summary.background+');'}}" ng-class="{'background-offset':period.summary.offset}" alt="" />
              </span>
            </div>
            <div><span>{{::period.summary.degs}}ºC</span></div>
            <div ng-if="view.width>413"><span>{{::period.summary.precipitation}} mm</span></div>
            <div ng-if="view.width>515"><span>{{::period.summary.wind}} m/s</span></div>
          </div>
          <div ng-repeat="hour in period.data track by $index" ng-class="{'summarized':hour.summarized,'show-row':day.showFull[hour.group]}" class="row">
            <div><span><? if ($norsk) {?>Kl <?} ?>{{::hour.hour}}-{{::hour.hourTo}}</span></div>
            <div>
              <span>
                <moon ng-if="hour.icon.indexOf('mf') > -1" offset="{{::hour.offset}}" style="{{'box-shadow: #ffe599 '+hour.phase+'px 0px inset;'}}" ng-class="{'moon-alone':!hour.showImg}"></moon>
                <img ng-if="hour.showImg" class="weather-icon" ng-src="{{::hour.foreground}}" style="{{::'background-image:url('+hour.background+');'}}" ng-class="{'background-offset':hour.offset}" alt="" />
              </span>
            </div>
            <div><span>{{::hour.degs}}ºC</span></div>
            <div ng-if="view.width>413"><span>{{::hour.precipitation}} mm</span></div>
            <div ng-if="view.width>515"><span>{{::hour.wind}} m/s</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <span ng-if="master.weatherLoaded()"><?= $text->{'metCredit'} ?></span>
</section>

<img src="/static/img/loading.svg" class="loader" ng-if="!master.weatherLoaded()" />
<ul class="list-group" ng-if="master.fail" style="margin-bottom: 0px;margin-top: 20px;"><li class="list-group-item list-group-item-danger"><?= $text->{'fetchFail'} ?></li></ul>
