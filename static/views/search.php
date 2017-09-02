<div ng-if="master.lazyModulesLoaded">
  <div ng-controller="searchController as s">
    <input type="text" ng-model="s.query" placeholder="{{master.textData.typeLocation}}" ng-keyup="s.search()">
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
    <div ng-if="s.matches.length == 0 && s.query.length > 0" ng-bind="master.textData.noMatches"></div>
  </div>
</div>
