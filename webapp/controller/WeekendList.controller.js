sap.ui.define([
	"sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel",
	'sap/ui/core/format/DateFormat'
], function (Controller, JSONModel, DateFormat) {
	"use strict";

	return Controller.extend("ifmo.itmo_clendar_2020_lvv.controller.WeekendList", {
		onInit: function () {
    	},
    	onDelete: function(oEvent) {
    		var oTable = this.getView().byId("WeekendsList"); // получили ссылку на List
			var oItem = oEvent.getSource(); // взяли выбранный элемент
			var row = oEvent.getSource().getParent().getBindingContext("holiday").getPath();
            var idx = parseInt(row.substring(row.lastIndexOf("/") +1), 10);
            var model = this.getView().getModel("holiday");
            var data = model.getProperty("/holiday/list");
            var removed = data.splice(idx, 1)[0];
            model.setProperty("/holiday/list", data);
            this._updateSumProperties(removed.duration, removed.working, removed.counted);	
			console.log("sum length of holiday without ph is " + model.getProperty("/holiday/duration"));
			
            //console.log(idx, data, removed);
            this._removeClassChecked(new Date(removed.from), new Date(removed.to));
    	},
    	_removeClassChecked: function(from, to) {
			var dateFormat = DateFormat.getInstance({pattern: "yyyyMMdd"});
			for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
				var data = dateFormat.format(d);
    			var dateElement = document.querySelector(`[data-sap-day="${data}"]`)
    			//console.log(data, `[data-sap-day="${data}"]`);
    			dateElement.classList.remove("mycheckedclass");
			}	
    	},
    	_updateSumProperties: function(duration, working, counted) {
			var oModel = this.getView().getModel("holiday");
			oModel.setProperty("/holiday/duration", Number(oModel.getProperty("/holiday/duration")) - duration);
			oModel.setProperty("/holiday/working", Number(oModel.getProperty("/holiday/working")) - working);
			oModel.setProperty("/holiday/counted", Number(oModel.getProperty("/holiday/counted")) - counted);
		}
	});
});