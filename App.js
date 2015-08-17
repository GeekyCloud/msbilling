/**
  MediaSignage Inc (c) billing app
 @class App
 @constructor
 @return {Object} instantiated App
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'backbone.controller', 'ComBroker', 'Lib'], function (_, $, Backbone, Bootstrap, backbonecontroller, ComBroker, Lib) {
    var App = Backbone.Controller.extend({

        // app init
        initialize: function () {

            window.BB = Backbone;
            BB.globs = {};
            BB.SERVICES = {};
            BB.EVENTS = {};
            BB.LOADING = {};
            BB.CONSTS = {};
            BB.CONSTS.PAYER_ID = -1;
            BB.CONSTS.SERVER_PORT = 442;
            BB.globs['UNIQUE_COUNTER'] = 0;
            BB.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            BB.lib = new Lib();
            BB.lib.addBackboneViewOptions();
            BB.lib.addBackboneCollectionSave();
            BB.comBroker = new ComBroker();
            BB.comBroker.name = 'AppBroker';
            window.log = BB.lib.log;
            $.support.cors = true;
            $.ajaxSetup({cache: false});
            $.ajaxSetup({
                headers: {'Authorization': 'somePasswordHere'}
            });

            // define applications
            BB.CONSTS.MAILWASP = 'mailWasp';
            BB.CONSTS.EVERNODES = 'everNodes';

            // internationalization
            require(['localizer'], function () {
                var lang = "en";
                var opts = { language: lang, pathPrefix: "./_lang" };
                $("[data-localize]").localize("local", opts);
            });

            // router init
            require(['LayoutRouter'], function (LayoutRouter) {
                var LayoutRouter = new LayoutRouter();
                BB.history.start();
                BB.comBroker.setService(BB.SERVICES['LAYOUT_ROUTER'], LayoutRouter);
                LayoutRouter.navigate('credit_card', {trigger: true});
            })
        }
    });
    return App;
});