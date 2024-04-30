/*global QUnit*/

sap.ui.define([
	"comdeloitte/stripeui/controller/Payments.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Payments Controller");

	QUnit.test("I should test the Payments controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
