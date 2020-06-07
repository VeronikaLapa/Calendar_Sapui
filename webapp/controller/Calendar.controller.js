sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/unified/CalendarLegendItem',
	'sap/ui/unified/DateTypeRange',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library',
	"sap/m/MessageBox"
], function (Controller, CalendarLegendItem, DateTypeRange, DateFormat, coreLibrary, MessageBox) {
	"use strict";
	var publicHolidays = [];
	var extraHolidays = [];
	function _markSpecialDays(oCal, oLeg, doc) {
			var holidayNames = $(doc).find("holidays")[0].children;
			var holidayDates = $(doc).find("days")[0].children;
			var YEAR = $(doc).find("calendar")[0].getAttribute("year");
			//console.log(holidayNames.namedItem("2").getAttribute("title"));
			//console.log(YEAR);
			for (var date of holidayDates) {
				var formattedDate = new Date(date.getAttribute("d") + "." + YEAR);
				var type = ""; 
				var placeholder = "";
				if (date.getAttribute("t") == 2) {
					type = "Type01";
					placeholder = "{i18n>shortDay}";
				} else if (date.hasAttribute("h")) {
					type = "Type03";
					placeholder = holidayNames.namedItem(date.getAttribute("h")).getAttribute("title");
					//console.log(date.getAttribute("h"), holidayNames.namedItem("1"));
					publicHolidays.push(formattedDate);
				} else {
					type = "Type05";
					placeholder = "{i18n>extraWeekend}";
					extraHolidays.push(formattedDate);
				}
				//console.log(date.getAttribute("d") + YEAR, formattedDate);
				var dateRange = new DateTypeRange({
						startDate : new Date(date.getAttribute("d") + "." + YEAR),
						type : type,
						tooltip : placeholder
				});
				oCal.addSpecialDate(dateRange);
			}
			oLeg.addItem(new CalendarLegendItem({
					text : "{i18n>shortDay}",
					type : "Type01"
				}));
			oLeg.addItem(new CalendarLegendItem({
					text : "{i18n>event}",
					type : "Type03"
				}));
			oLeg.addItem(new CalendarLegendItem({
					text : "{i18n>extraWeekend}",
					type : "Type05"
				}));
	}
	function _inInterval(x, from, to) {
			return (x >= from && x <= to);
        }
	return Controller.extend("ifmo.itmo_clendar_2020_lvv.controller.Calendar", {
		oFormatYyyymmdd: null,
		onInit: function () {
			var oCal = this.byId("calendar");
			_markSpecialDays(oCal, this.byId("legend"), this.getOwnerComponent().getModel("weekends").getData());
			oCal.displayDate(new Date("01.01.2020"));
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd"});
			//console.log(publicHolidays);
		},
		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
			this._updateButtonStatus(oCalendar.getSelectedDates()[0]);
		},
		onPress: function() {
			var oSelectedDateFrom = this.byId("selectedDateFrom"),
			oSelectedDateTo = this.byId("selectedDateTo"),
			oHolidayModel = this.getView().getModel("holiday");
			var notValid = this._assertCanAdd(oHolidayModel, oSelectedDateFrom.getText(), oSelectedDateTo.getText(), Number(this.byId("counted").getText()));
			if (notValid) {
				MessageBox.error(notValid);
			} else {
				var duration = Number(this.byId("duration").getText()),
					working = Number(this.byId("working").getText()),
					counted = Number(this.byId("counted").getText());
				var newInterval = {
					"from": oSelectedDateFrom.getText(),
					"to": oSelectedDateTo.getText(),
					"duration": duration,
					"counted": counted,
					"working": working
				}
				oHolidayModel.setProperty("/holiday/list", oHolidayModel.getProperty("/holiday/list").concat(newInterval));
				this._updateSumProperties(duration, working, counted);
				//oHolidayModel.setProperty("/holiday/duration", Number(oHolidayModel.getProperty("/holiday/duration")) + Number(this.byId("counted").getText()));
				console.log("sum length of holiday without ph is " + oHolidayModel.getProperty("/holiday/duration"));
				this._addClassChecked(new Date(oSelectedDateFrom.getText()), new Date(oSelectedDateTo.getText()));
			}
		},
		_updateSumProperties: function(duration, working, counted) {
			var oModel = this.getView().getModel("holiday");
			oModel.setProperty("/holiday/duration", Number(oModel.getProperty("/holiday/duration")) + duration);
			oModel.setProperty("/holiday/working", Number(oModel.getProperty("/holiday/working")) + working);
			oModel.setProperty("/holiday/counted", Number(oModel.getProperty("/holiday/counted")) + counted);
		},
		_assertCanAdd: function(oModel, from, to, counted) {
			var model = this.getView().getModel("i18n");
			if (Number(oModel.getProperty("/holiday/counted"))+ counted > 28) {
				return model.getProperty("totalLengthRule");
			} else if (oModel.getProperty("/holiday/list").length === 4) {
				return  model.getProperty("totalNumberRule");
			} else if (
				counted < 14 && 
				oModel.getProperty("/holiday/list").length === 3 &&
				oModel.getProperty("/holiday/list").filter(x => x.counted >= 14).length === 0
				) {
				return  model.getProperty("maxLengthRule");
			} else if (
				oModel.getProperty("/holiday/list").filter(
					x => _inInterval(new Date(x.from), new Date(from), new Date(to)) ||
						 _inInterval(new Date(x.to), new Date(from), new Date(to))
						 ).length > 0
				) {
				return  model.getProperty("sameDates");
			} else {
				return null; 
			}
		},
		_addClassChecked: function(from, to) {
			var dateFormat = DateFormat.getInstance({pattern: "yyyyMMdd"});
			for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
				var data = dateFormat.format(d);
    			var dateElement = document.querySelector(`[data-sap-day="${data}"]`)
    			//.log(data, `[data-sap-day="${data}"]`);
    			dateElement.classList.add("mycheckedclass");
			}	
		},
		_updateText: function(oSelectedDates) {
			var oSelectedDateFrom = this.byId("selectedDateFrom"),
				oSelectedDateTo = this.byId("selectedDateTo"),
				oCounted = this.byId("counted"),
				oDuration = this.byId("duration"),
				oWorking = this.byId("working");
				oSelectedDateFrom.setText("No Date Selected");
				oSelectedDateTo.setText("No Date Selected");
				oDuration.setText("-");
				oCounted.setText("-");
				oWorking.setText("-");
			if (oSelectedDates) {
				var oFromDate = oSelectedDates.getStartDate();
				if (oFromDate) {
					oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oFromDate));
				}
				var oToDate = oSelectedDates.getEndDate();
				if (oToDate) {
					oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oToDate));
					var duration = this._countDuration(oFromDate, oToDate);
					oDuration.setText(duration);
					var countedDuration = this._countCountedDays(oFromDate, oToDate);
					oCounted.setText(countedDuration);
					oWorking.setText(this._countWorkingDays(oFromDate, oToDate));
				}
			}
		},
		_countDuration: function(from, to) {
			return ((to.getTime() - from.getTime())/(1000 * 3600 * 24) + 1);
		},
		_countCountedDays: function(from, to) {
			var duration = this._countDuration(from, to);
			return (duration - publicHolidays.filter(x => x >= from && x <= to).length);
		}, 
		_countWorkingDays: function(from, to) {
			var cnt = 0;
			for (var d = from; d <= to; d.setDate(d.getDate() + 1)) {
				if (d.getDay() !== 0 && d.getDay() != 6 && 
					!publicHolidays.find(item => {return item.getTime() == d.getTime()}) &&
					!extraHolidays.find(item => {return item.getTime() == d.getTime()})) {
						cnt++;
					}
					//console.log(d.getDay() !== 0, d.getDay() !== 6, !publicHolidays.find(item => {return item.getTime() == d.getTime()}), !extraHolidays.find(item => {return item.getTime() == d.getTime()}));
			}
			return cnt;
		},
		_updateButtonStatus: function(oSelectedDates) {
			var oAddButton = this.byId("addButton"),
				oHolidayModel = this.getView().getModel("holiday");
			oAddButton.setEnabled(false);
			if (oSelectedDates && oSelectedDates.getStartDate() && oSelectedDates.getEndDate()) {
				oAddButton.setEnabled(true);
			}
		}
	});
});