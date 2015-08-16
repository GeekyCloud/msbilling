/**
 The Core Application StackView between main modules per application
 @class LoginView
 @constructor
 @return {object} instantiated LoginView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var LoginView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });

    return LoginView;
});