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
            var self = this;
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            self._listenLogin();
        },

        _listenLogin: function () {
            var self = this;
            $('#loginPayer').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var userName = $('#payerLogin').val();
                var userPass = $('#payerPass').val();
                if (userName.length < 3 || userPass.length < 3) {
                    bootbox.alert('Please enter valid user name and password');
                    return false;
                }
                self._authenticatePayer(userName, userPass);
                return false;
            });
        },

        _authenticatePayer: function (i_user, i_pass) {
            var self = this;
            var url = 'https://secure.digitalsignage.com:' + BB.CONSTS.SERVER_PORT + '/msAuthenticatePayer' + '/' + i_user + '/' + i_pass;
            $.ajax({
                url: url,
                type: "POST",
                crossDomain: true,
                data: {},
                dataType: "json",
                contentType: "application/json",
                success: function (data) {

                    if (data.status == 'fail') {
                        bootbox.dialog({
                            message: "Problem loading account information",
                            closeButton: false,
                            buttons: {
                                "success": {
                                    label: "Ok",
                                    className: "btn-danger",
                                    callback: function () {
                                    }
                                }
                            }
                        });

                    } else {

                        switch (data.payer_id) {
                            case 'UNKNOWN':
                            {
                                bootbox.dialog({
                                    message: "You are currently not setup as a subscriber.",
                                    closeButton: false,
                                    buttons: {
                                        "success": {
                                            label: "Ok",
                                            className: "btn-danger",
                                            callback: function () {
                                            }
                                        }
                                    }
                                });
                                break;
                            }
                            case 'ANNUAL':
                            {
                                bootbox.dialog({
                                    message: "You are currently subscribed as an annual payer, please contact live chat for annual renewals.",
                                    closeButton: false,
                                    buttons: {
                                        "success": {
                                            label: "Ok",
                                            className: "btn-danger",
                                            callback: function () {
                                            }
                                        }
                                    }
                                });
                                break;
                            }
                            default:
                            {
                                var link = 'https://secure.digitalsignage.com/msbilling/index.html?pi=' + data.payer_id;
                                bootbox.alert('Please wait loading billing info. If not redirected <a href="' + link + '">click here</a>');;
                                setTimeout(function(){
                                    window.location.href = link;
                                },1400);
                                break;
                            }
                        }
                    }
                },
                error: function (res) {
                    bootbox.alert("something went wrong while loading user data " + res.statusText);
                }
            });
        }
    });

    return LoginView;
});