/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comdeloitte/stripeui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
