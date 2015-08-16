/**
 Application router and layout router responsible for kick starting the application as
 well as management for sizing events
 @class LayoutRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'text', 'bootbox', 'XDate', 'AppEntryFaderView', 'LoginView'],
    function (_, $, Backbone, text, Bootbox, XDate, AppEntryFaderView, LoginView) {

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

                self._initAppFaderComp();
                self._listenSizeChanges();

                $(window).trigger('resize');
                $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom', 'delay': 1000});
            },

            /**
             Router definition to function maps
             @method routes
             **/
            routes: {
                "credit_card": "_routeLoadFirstView"
            },

            /**
             Initiate user credential route authentication
             @method _routeLoadFirstView
             @param {String} i_user
             @param {String} i_pass
             **/
            _routeLoadFirstView: function () {
                var self = this;
                require(['text!_templates/tmpCreditCard.html','text!_templates/tmpLogin.html'], function (tmpCreditCard, tmpLogin) {
                    $(Elements.APP_EVERNODES_CONTENT).append(tmpLogin);
                    $(Elements.APP_CREDITCARD_CONTAINER).append(tmpCreditCard);

                    self.m_appLogin = new LoginView({
                        el: Elements.APP_EVERNODES_CONTENT,
                        duration: 500
                    });

                    self.m_appCreditCard = new AppEntryFaderView({
                        el: Elements.APP_CREDITCARD_CONTAINER,
                        duration: 500
                    });

                    if (window.location.search.match('pi')){
                        self.m_appEntryFaderView.selectView(self.m_appCreditCard);
                    } else {
                        self.m_appEntryFaderView.selectView(self.m_appLogin);
                    }

                    self._updateLayout();
                });
            },

            /**
             Create StackView views for main components
             @method _initAppFaderComp
             **/
            _initAppFaderComp: function () {
                var self = this;
                self.m_appEntryFaderView = new AppEntryFaderView({
                    el: Elements.APP_ENTRY,
                    duration: 500
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