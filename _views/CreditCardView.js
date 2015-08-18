/**
 The Core Application StackView between main modules per application
 @class CreditCardView
 @constructor
 @return {object} instantiated CreditCardView
 **/
define(['jquery', 'backbone', 'StackView', 'creditcard', 'validate', 'stripe'], function ($, Backbone, StackView, creditcard, validate, stripe) {

    var CreditCardView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            self._initFormCC();
            self._onCreditCheck();
        },

        populate: function (i_userData) {
            var self = this;
            $('#cardNumber').val(i_userData.card_number);
            $('#cardExpiry').val(i_userData.expiration_month + '/' + i_userData.expiration_year);
            $('#cardCVC').val(i_userData.security_code);
            $('#statusMessage').text(i_userData.first_name + ' ' + i_userData.last_name);
        },

        _initFormCC: function () {
            var $form = $('#payment-form');
            //$form.on('submit', payWithStripe);

            /* Fancy restrictive input formatting via jQuery.payment library*/
            $('input[name=cardNumber]').payment('formatCardNumber');
            $('input[name=cardCVC]').payment('formatCardCVC');
            $('input[name=cardExpiry').payment('formatCardExpiry');

            /* Form validation using Stripe client-side validation helpers */
            jQuery.validator.addMethod("cardNumber", function (value, element) {
                return this.optional(element) || Stripe.card.validateCardNumber(value);
            }, "Please specify a valid credit card number.");

            jQuery.validator.addMethod("cardExpiry", function (value, element) {
                /* Parsing month/year uses jQuery.payment library */
                value = $.payment.cardExpiryVal(value);
                return this.optional(element) || Stripe.card.validateExpiry(value.month, value.year);
            }, "Invalid expiration date.");

            jQuery.validator.addMethod("cardCVC", function (value, element) {
                return this.optional(element) || Stripe.card.validateCVC(value);
            }, "Invalid CVC.");

            validator = $form.validate({
                rules: {
                    cardNumber: {
                        required: true,
                        cardNumber: true
                    },
                    cardExpiry: {
                        required: true,
                        cardExpiry: true
                    },
                    cardCVC: {
                        required: true,
                        cardCVC: true
                    }
                },
                highlight: function (element) {
                    var self = this;
                    //console.log('err');
                    BB.globs['PASS'] = false;
                    $(element).closest('.form-control').removeClass('success').addClass('error');
                },
                unhighlight: function (element) {
                    //console.log('clear');
                    BB.globs['PASS'] = true;
                    $(element).closest('.form-control').removeClass('error').addClass('success');
                },
                errorPlacement: function (error, element) {
                    $(element).closest('.form-group').append(error);
                }
            });

            var paymentFormReady = function () {
                if ($form.find('[name=cardNumber]').hasClass("success") &&
                    $form.find('[name=cardExpiry]').hasClass("success") &&
                    $form.find('[name=cardCVC]').val().length > 1) {
                    return true;
                } else {
                    return false;
                }
            };

            $form.find('[type=submit]').prop('disabled', true);
            var readyInterval = setInterval(function () {
                if (paymentFormReady()) {
                    $form.find('[type=submit]').prop('disabled', false);
                    clearInterval(readyInterval);
                }
            }, 250);
        },

        /**
         check that credit passed and if so update remote server
         @method _onCreditCheck
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _onCreditCheck: function () {
            var self = this;
            $('button').on('click', function (e) {
                e.preventDefault();
                if ($('#cardExpiry').val().length < 3) {
                    bootbox.alert('please enter a valid expiration date');
                    return false;
                }
                if ($('#cardCVC').val().length < 3) {
                    bootbox.alert('please enter a valid security code');
                    return false;
                }
                if (!BB.globs['PASS']){
                    bootbox.alert('please make sure credit card number is valid');
                    return false;
                }
                var cc = $('#cardNumber').val().replace(/ /ig,'');
                var exp = $('#cardExpiry').val();
                var month = exp.split('/')[0].trim();
                var year = exp.split('/')[1].trim();
                var cvc = $('#cardCVC').val();
                self._saveServer(cc, month, year, cvc)
                return false;
            })
        },

        /**
         Save data to server
         @method _saveServer
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _saveServer: function (cc, month, year, cvc) {
            var self = this;
            var url = 'https://secure.digitalsignage.com:' + BB.CONSTS.SERVER_PORT + '/msbilling' + '/' + BB.CONSTS.PAYER_ID + '/' + cc + '/' + month + '/' + year + '/' + cvc
            $.ajax({
                url: url,
                type: "POST",
                crossDomain: true,
                data: {},
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    if (data.status == 'fail'){
                        bootbox.dialog({
                            message: "Problem: The credit card could not be charged <br/>" + data.message,
                            closeButton: false,
                            buttons: {
                                "success": {
                                    label: "Ok",
                                    className: "btn-danger",
                                    callback: function () {}
                                }
                            }
                        });
                    } else {
                        bootbox.alert("Success, thank you for updating...");
                    }
                },
                error: function (res) {
                    bootbox.alert("something went wrong while loading user data " + res.statusText);
                }
            });
        }
    });

    return CreditCardView;
});