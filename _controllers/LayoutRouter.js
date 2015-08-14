/**
 Application router and layout router responsible for kick starting the application as
 well as management for sizing events
 @class LayoutRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'text', 'bootbox', 'XDate', 'AppContentFaderView', 'AppEntryFaderView'],
    function (_, $, Backbone, text, Bootbox, XDate, AppContentFaderView, AppEntryFaderView) {

        BB.SERVICES.LAYOUT_ROUTER = 'LayoutRouter';
        BB.SERVICES.APP_CONTENT_MAILWASP_FADER_VIEW = 'AppContentMailWaspFaderView';
        BB.SERVICES.APP_CONTENT_EVERNODES_FADER_VIEW = 'AppContentEverNodesFaderView';

        /**
         Event fired when app re-sized
         @event APP_SIZED
         @static
         @final
         **/
        BB.EVENTS.APP_SIZED = 'APP_SIZED';

        var LayoutRouter = BB.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                var self = this;
                BB.comBroker.setService(BB.SERVICES['LAYOUT_ROUTER'], self);
                BB.comBroker.setService('XDATE', new XDate());

                self._initLoginPage();
                self._listenSizeChanges();

                $(window).trigger('resize');
                $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom', 'delay': 1000});

                return;
            },

            /**
             Router definition to function maps
             @method routes
             **/
            routes: {
                "credit_card": "_routeCreditCard"
            },

            /**
             Initiate user credential route authentication
             @method authenticate
             @param {String} i_user
             @param {String} i_pass
             **/
            _routeCreditCard: function (i_user, i_pass) {
                var self = this;
                require(['text!_templates/_templateMailWasp.html'], function (template) {
                    $(Elements.APP_MAILWASP_CONTENT).append(template);
                    self.m_appEntryFaderView.selectView(self.m_appContentMailWaspFaderView);
                    self._updateLayout();
                });
            },

            /**
             Create two StackView views: AppEntryFaderView and AppContentFaderView
             AppEntryFaderView allows for page selection between login page and main app content page
             AppContentFaderView serves as dual purpose view. On one hand it serves as simple show/hide div for  main login page / content page,
             on the other hand it itself is a StackView.Fader that allows for show/hide between main content sections including campaigns,
             stations, resources, settings etc
             @method _initLoginPage
             **/
            _initLoginPage: function () {
                var self = this;

                self.m_appEntryFaderView = new AppEntryFaderView({
                    el: Elements.APP_ENTRY,
                    duration: 500
                });

                self.m_appContentMailWaspFaderView = new AppContentFaderView({
                    el: Elements.APP_MAILWASP_CONTENT,
                    duration: 650
                });
            },

            /**
             Listen to application size changes and lazy update when so
             @method _listenSizeChanges
             **/
            _listenSizeChanges: function () {
                var self = this;
                var lazyLayout = _.debounce(self._updateLayout, 150);
                $(window).resize(lazyLayout);
            },

            /**
             Update key element height changes on size change and notify event subscribers
             @method _updateLayout
             **/
            _updateLayout: function () {
                return;
                var self = BB.comBroker.getService(BB.SERVICES['LAYOUT_ROUTER']);
                var b = $('body');
                self._appHeight = parseInt(b.css('height').replace('px', ''));
                self._appWidth = parseInt(b.css('width').replace('px', ''));
                var h = self._appHeight - 115; // reduce footer

                $(Elements.CLASS_APP_HEIGHT).height(h);
                $(Elements.PROP_PANEL_WRAP).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
                $(Elements.APP_NAVIGATOR_WASP).height(h);
                $(Elements.APP_NAVIGATOR_EVER).height(h);
                $(Elements.RESOURCE_LIB_LIST_WRAP).height(h);
                $(Elements.PRICING_TABLE_WRAP).height(h - 200);

                BB.comBroker.fire(BB.EVENTS.APP_SIZED, this, null, {width: self._appWidth, height: self._appHeight});
            },

            /**
             Disable browser back button
             @method disableBack
             **/
            _disableBack: function () {
                var self = this;
                window.location.hash = "start_";
                window.location.hash = "Again-start_";//for google chrome
                window.onhashchange = function () {
                    window.location.hash = "start_";
                }
            },

            /**
             Get latest registered app width
             @return {Number} width
             **/
            getAppWidth: function () {
                return this._appWidth;
            },

            /**
             Get latest registered app height
             @return {Number} height
             **/
            getAppHeight: function () {
                return this._appHeight;
            }
        });

        return LayoutRouter;
    });