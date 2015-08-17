/**
 The Core Application StackView between main modules per application
 @class CreditCardView
 @constructor
 @return {object} instantiated CreditCardView
 **/
define(['jquery', 'backbone', 'StackView', 'creditcard', 'validate'], function ($, Backbone, StackView, creditcard, validate) {

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
            $form.on('submit', payWithStripe);

            /* If you're using Stripe for payments */
            function payWithStripe(e) {
                e.preventDefault();

                /* Visual feedback */
                $form.find('[type=submit]').html('Validating <i class="fa fa-spinner fa-pulse"></i>');

                var PublishableKey = 'pk_test_6pRNASCoBOKtIshFeQd4XMUh'; // Replace with your API publishable key
                Stripe.setPublishableKey(PublishableKey);

                /* Create token */
                var expiry = $form.find('[name=cardExpiry]').payment('cardExpiryVal');
                var ccData = {
                    number: $form.find('[name=cardNumber]').val().replace(/\s/g, ''),
                    cvc: $form.find('[name=cardCVC]').val(),
                    exp_month: expiry.month,
                    exp_year: expiry.year
                };

                Stripe.card.createToken(ccData, function stripeResponseHandler(status, response) {
                    if (response.error) {
                        /* Visual feedback */
                        $form.find('[type=submit]').html('Try again');
                        /* Show Stripe errors on the form */
                        $form.find('.payment-errors').text(response.error.message);
                        $form.find('.payment-errors').closest('.row').show();
                    } else {
                        /* Visual feedback */
                        $form.find('[type=submit]').html('Processing <i class="fa fa-spinner fa-pulse"></i>');
                        /* Hide Stripe errors on the form */
                        $form.find('.payment-errors').closest('.row').hide();
                        $form.find('.payment-errors').text("");
                        // response contains id and card, which contains additional card details
                        console.log(response.id);
                        console.log(response.card);
                        var token = response.id;
                        // AJAX - you would send 'token' to your server here.
                        $.post('/account/stripe_card_token', {
                            token: token
                        })
                            // Assign handlers immediately after making the request,
                            .done(function (data, textStatus, jqXHR) {
                                $form.find('[type=submit]').html('Payment successful <i class="fa fa-check"></i>').prop('disabled', true);
                            })
                            .fail(function (jqXHR, textStatus, errorThrown) {
                                $form.find('[type=submit]').html('There was a problem').removeClass('success').addClass('error');
                                /* Show Stripe errors on the form */
                                $form.find('.payment-errors').text('Try refreshing the page and trying again.');
                                $form.find('.payment-errors').closest('.row').show();
                            });
                    }
                });
            }

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
                    $(element).closest('.form-control').removeClass('success').addClass('error');
                },
                unhighlight: function (element) {
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
                        bootbox.alert("Sorry we could not authenticate user...");
                    } else {
                        self.m_appCreditCard.populate(data);
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