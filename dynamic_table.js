// Dynamic table
// =============

// Copyright (c) 2008-2012 David Durman

(function(window, undefined) {
    

// THIS AND ONLY THIS MUST BE SET !!!
var blank_image_src = "images/blank.png";

// all DynamicTable's in document
var dTables = [];

/**
 * Dynamic table object
 *
 * @param obj can be id attribute of a table element or 
 *   a table element itself
 * @param options custom options
 */
function DynamicTable(obj, options){
    this.table = (typeof obj == "string") ? document.getElementById(obj) : obj;
    // prevent of creating more than one DynamicTables on same element 
    for (var i = 0, dtl = dTables.length; i < dtl; i++)
	if (dTables[i].table == this.table)
	    return;
    dTables.push(this);

    this.sortColumn = null;
    this.desc = null;
    this.toolbar = null;
    
    this.maxRowCount = 10;	// maximal number of displayed rows
    this.currentPage = 1;	// default current page
    this.rmRows = [];

    
    // toolbar onclick handler wrapper 
    // allows to use "this"
    var oThis = this;
    this._toolbarClick = function(evt){	oThis.toolbarClick(evt); }
    this._filterRows = function(evt){ oThis.filterRows(evt); }
    this._pagerClick = function(evt){ oThis.pagerClick(evt); };

    // table rows 
    this.rows = [];
    for (var i = 0, brl = this.table.tBodies[0].rows.length; i < brl; i++)
	this.rows.push(this.table.tBodies[0].rows[i]);

    // table columns (without toolbar buttons!)
    this.cols = this.table.rows[0].cells;

    // option parsing
    this.opt = {};
    this.opt.colTypes = [];

    if (options != undefined){
	if (options.filterFunction != undefined){
	    this.filterFunction = options.filterFunction;
	}

	if (options.pager != undefined){
	    this.opt.pager = true;
	    if (options.pager.rowsCount != undefined)
		this.maxRowCount = options.pager.rowsCount;
	    if (options.pager.currentPage != undefined)
		this.currentPage = options.pager.currentPage;
	}
	if (options.colTypes != undefined)
	    this.opt.colTypes = options.colTypes;
	if (options.customTypes != undefined)
	    for (var ct in options.customTypes)
		this.sortFunctions[ct] = options.customTypes[ct];
	this.opt.fadeDestroy = options.fadeDestroy;
	this.opt.fadeCreate = options.fadeCreate;
    }

    // fill the rest of colTypes with default type
    for (var i = this.opt.colTypes.length, cl = this.cols.length; i < cl; i++)
	this.opt.colTypes.push("alpha");

    // toolbar
    this.toolbar = document.createElement("tr");
    this.toolbar.className = "dynamic-table-toolbar";

    this.filters = [];

    // fill the toolbar
    for (var i = 0; i < this.cols.length; i++){
	var colTools = document.createElement("th");
	colTools.className = "tool-" + (i + 1);

	if (this.opt.colTypes[i] != "none"){
	    // input filter
	    var filter = document.createElement("input");
	    filter.type = "text";
	    filter.style.float = "left";
	    filter.className = "dynamic-table-filter";
	    DynamicTableEvent.observe(filter, "keypress", this._filterRows);
	    this.filters.push(filter);

	    // button for sorting
	    var toolBtn = document.createElement("img");
	    toolBtn.src = blank_image_src;
	    toolBtn.className = "dynamic-table-downarrow";
	    DynamicTableEvent.observe(toolBtn, "click", this._toolbarClick);
	    
	    colTools.appendChild(filter);
	    colTools.appendChild(toolBtn);

	} else	// no filter on this column
	    this.filters.push("none");

	this.toolbar.appendChild(colTools);
    }

    // insert to table header at first place (using effects by options)
    if (this.opt.fadeCreate){
	var tb = this.toolbar;
	tb.style.visibility = "hidden";

	if (this.table.tHead)
	    this.table.tHead.insertBefore(tb, this.table.tHead.rows[0]);
	else {
	    var thead = document.createElement("thead");
	    this.table.tBodies[0].parentNode.insertBefore(thead, this.table.tBodies[0]);
	    thead.appendChild(tb);
	}
	//	this.table.rows[0].parentNode.insertBefore(tb, this.table.rows[0]);
	var sensitivity = (this.opt.fadeCreate.sensitivity) ? this.opt.fadeCreate.sensitivity : 1;
	var opacity = (this.opt.fadeCreate.opacity) ? this.opt.fadeCreate.opacity : 10;
	var duration = (this.opt.fadeCreate.duration) ? this.opt.fadeCreate.duration : 20;
	DynamicTable.setOpacity(tb.style, opacity);
	tb.style.visibility = "visible";
	DynamicTable.fadeObject(tb.style, opacity, sensitivity, duration);
    } else {
	if (this.table.tHead)
	    this.table.tHead.insertBefore(this.toolbar, this.table.tHead.rows[0]);
	else {
	    var thead = document.createElement("thead");
	    this.table.tBodies[0].parentNode.insertBefore(thead, this.table.tBodies[0]);
	    thead.appendChild(this.toolbar);
	}
	//	this.table.rows[0].parentNode.insertBefore(this.toolbar, this.table.rows[0]);
    }

    // insert pager navigation as next row in Footage or create new Footage
    if (options && options.pager){
	var t_foot = null;
	if (this.table.tFoot)
	    t_foot = this.table.tFoot;
	else
	    t_foot = this.table.createTFoot();
	this.pagerBar = document.createElement("tr");
	var pbTD = document.createElement("td");
	pbTD.className = "dynamic-table-pagerbar";
	//    pbTD.colspan = "" + this.cols.length;	// is not working
	pbTD.setAttribute("colspan", this.cols.length);
	var a = null;
	for (var i = 0, rl = Math.ceil(this.rows.length / this.maxRowCount); i < rl; ++i){
	    a = document.createElement("a");
	    a.className = "dynamic-table-page-selector";
	    a.appendChild(document.createTextNode(i + 1));
	    a.href = "#dt_page_" + (i + 1);
	    DynamicTableEvent.observe(a, "click", this._pagerClick);
	    pbTD.appendChild(a);
	}

	//!//TODO: element to change number of rows for pager dynamically
	//    var td = document.createElement("input");
	//    td.id = "numberOfRows";
	//    td.value = "10";
	//    pbTD.appendChild(td);

	this.pagerBar.appendChild(pbTD);
	t_foot.appendChild(this.pagerBar);

	this.pager(this.currentPage);
    }
}

DynamicTable.prototype.tableMouseOut = function(evt){
    DynamicTableEvent.preventBubbling(evt);
    var el = evt.target || evt.srcElement;
    if (el.tagName != "TABLE")
	return;
    DynamicTable.destroy(this);	
}

/**
 * Browser recognizer
 */
DynamicTable.Browser = {
    msie: !!(window.attachEvent && !window.opera),
    opera: !!window.opera,
    gecko: navigator.userAgent.indexOf("Gecko") > -1 && navigator.userAgent.indexOf("KHTML") == -1,
    webkit: navigator.userAgent.indexOf("AppleWebKit/") > -1,
    mobilesafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
};

/**
 * @return column index of an element el
 */
DynamicTable.prototype.getColumnIndex = function(el){
    while (el.tagName != "TH")
	el = el.parentNode;

    // column number
    var col = null;
    if (!DynamicTable.Browser.msie)
	col = el.cellIndex;
    else {
	var tds = el.parentNode.childNodes;
	for (col = 0, l = tds.length; tds[col] != el && col < l; col++)
	    ;
    }
    return col;
}

/**
 * Tool button onclick event handler
 */
DynamicTable.prototype.toolbarClick = function(evt){
    var el = evt.target || evt.srcElement;
    this.sort(this.getColumnIndex(el));
}


/**
 * Pager button onclick event handler
 */
DynamicTable.prototype.pagerClick = function(evt){
    var el = evt.target || evt.srcElement;
    this.currentPage = parseInt(el.href.substring(el.href.lastIndexOf("dt_page_") + "dt_page_".length));
    this.pager(this.currentPage);
}

/**
 * @return
 */
DynamicTable.prototype.pager = function(page){
    if (!this.opt.pager)
	return;

    this.currentPage = page;
    var rn = this.rows.length;
    var cp = this.currentPage;
    var mr = this.maxRowCount;

    //    this.pagerBar.style.display = "none";

    var rows = this.table.tBodies[0].rows;

    // show all rows
    for (var i = 0, trl = rows.length; i < trl; i++)
	rows[i].style.display = "";

    var from = cp * mr - mr;
    var to = ((from + mr) > this.rows.length) ? this.rows.length : from + mr;

    //    alert("from: " + from + "  to: " + to);
    //    alert(this.rows.length);

    // hide rows in other pages
    for (var i = 0, rl = rows.length; i < rl; i++){
	if (i < from || i >= to){
	    rows[i].style.display = "none";
	}
    }

    // hide unnecessary page indexes
    var showed_rows_count = this.rows.length - this.rmRows.length;
    var p_count = Math.ceil(this.rows.length / this.maxRowCount);	// pages count
    var p_cur_count = Math.ceil(showed_rows_count / this.maxRowCount);	// current pages count

    for (var i = 0; i < p_count; i++){
	this.pagerBar.childNodes[0].childNodes[i].style.visibility = "visible";
	this.pagerBar.childNodes[0].childNodes[i].className = "dynamic-table-page-selector";	// set old class to all selectors
	if (i >= p_cur_count || p_cur_count == 1)
	    this.pagerBar.childNodes[0].childNodes[i].style.visibility = "hidden";
    }

    // "selected" class for selected selector
    this.pagerBar.childNodes[0].childNodes[this.currentPage - 1].className = "dynamic-table-page-selected";
}

/**
 * Filter rows by substring
 */
DynamicTable.prototype.filterRows = function(evt){
    if (evt.keyCode == 13){
	var tTable = this.table;

//	for (var i = 0; i < this.filters.length; i++){
//	    alert(this.filters[i].value.toLowerCase());
//	}

	var input = evt.target || evt.srcElement;
	var col = this.getColumnIndex(input);
	var tRows = this.rows;

	var newRows = [];
	this.rmRows = [];	// initialize rmRows

	for (var i = 0, trl = tRows.length; i < trl; i++){
	    tRows[i].style.display = "";

	    var bPush = true;
	    for (var j = 0, fl = this.filters.length; j < fl; j++){
		if (this.filters[j] == "none")
		    continue;
		var text = this.rowCells(tRows[i])[j].innerHTML;
		if (this.filterFunction(text, this.filters[j].value) == -1)
		    bPush = false;
	    }
	    if (bPush)
		newRows.push(tRows[i]);		
	    else
		this.rmRows.push(tRows[i]);
	}

	// append not filtered rows to tree
	for (var i = 0, nrl = newRows.length; i < nrl; i++){
	    tTable.tBodies[0].appendChild(newRows[i]);
	}

	// delete filtered rows from the tree
	this.removeRows(this.rmRows);
	this.pager(1);	// goto first page

    }//end (evt.keyCode == 13)
}

/**
 * Get row TD cells using childNodes instead of cells (because of IE)
 * //!//NOTE: IE looses cells collection on disconnected DOM tree
 *  (tRows[i].cells[j])
 */
DynamicTable.prototype.rowCells = function(row){
    var cells = [];
    for (var i = 0, rl = row.childNodes.length; i < rl; i++)
	if (row.childNodes[i].tagName == 'TD' ||
	    row.childNodes[i].tagName == 'TH')
	    cells.push(row.childNodes[i]);
    return cells;
}


/**
 * Sort
 * @param col column number
 */
DynamicTable.prototype.sort = function(col){
    this.desc = (this.sortColumn != col) ? false : !this.desc;
    this.sortColumn = col;
    this.orderRows(this.sortFunctions[this.opt.colTypes[col]]);
    // update sort arrows
    this.toolbar.cells[this.sortColumn].lastChild.className = "dynamic-table-" + ((this.desc) ? "downarrow" : "uparrow");
}

/**
 * Order rows by sort function 
 * NOTE: DOM manipulation is faster on disconnected DOM tree (in Mozilla)
 */
DynamicTable.prototype.orderRows = function(sortFnc){

    // apply sort function
    var _sortColumn = this.sortColumn;
    var _this = this;
    var _sortFnc = function(a, b){
	var x = _this.rowCells(a)[_sortColumn];
	var y = _this.rowCells(b)[_sortColumn];
	return sortFnc(x.innerHTML, y.innerHTML);
    }

    var _rows = this.rows;
    _rows.sort(_sortFnc);

    if (this.desc)
	_rows.reverse();

    for (var i = 0, len = _rows.length; i < len; ++i){
	this.table.tBodies[0].appendChild(_rows[i]);
	_rows[i].display = "";
    }

    this.removeRows(this.rmRows);
    this.pager(1);	// goto first page
}

/**
 * Remove rows 
 */
DynamicTable.prototype.removeRows = function(rows){
    var rmRows = rows;
    for (var i = 0, rowsl = rmRows.length; i < rowsl; i++)
	if (rmRows[i].parentNode)
	    rmRows[i].parentNode.removeChild(rmRows[i]);	
}

/**
 * Removes toolbar from the table (using effects from options)
 */
DynamicTable.prototype._destroy = function(){
    if (this.toolbar){
	var tb = this.toolbar;
	if (this.opt.fadeDestroy){
	    var sensitivity = (this.opt.fadeDestroy.sensitivity) ? this.opt.fadeDestroy.sensitivity : -1;
	    var opacity = (this.opt.fadeDestroy.opacity) ? this.opt.fadeDestroy.opacity : 99;
	    var duration = (this.opt.fadeDestroy.duration) ? this.opt.fadeDestroy.duration : 20;
	    DynamicTable.fadeObject(tb.style, opacity, sensitivity, duration);
	    setTimeout(function(){tb.parentNode.removeChild(tb)}, duration * 100);
	} else
	    tb.parentNode.removeChild(tb);
    }
}

/**
 * Destroys DynamicTable object using table element or table id
 */
DynamicTable.destroy = function(tbl){
    var oTbl = (typeof tbl == "string") ? document.getElementById(tbl) : tbl;
    for (var i = 0, dtl = dTables.length; i < dtl; i++){
	if (dTables[i].table == oTbl){
	    dTables[i]._destroy();
	    var tmp1 = dTables.slice(0, i - 1);
	    var tmp2 = dTables.slice(i + 1, dTables.length);
	    dTables = tmp1.concat(tmp2);
	    return;
	}
    }
}


/**
 * Hides DynamicTable object toolbar using table element or table id
 */
DynamicTable.hide = function(tbl){
    var oTbl = (typeof tbl == "string") ? document.getElementById(tbl) : tbl;    
    for (var i = 0, dtl = dTables.length; i < dtl; i++){
	if (dTables[i].table == oTbl){
	    dTables[i]._hide();
	}
    }
}

/**
 * Hides toolbar of the table (using effects from options)
 */
DynamicTable.prototype._hide = function(){
    if (this.toolbar){
	var tb = this.toolbar;
	if (this.opt.fadeDestroy){
	    var sensitivity = (this.opt.fadeDestroy.sensitivity) ? this.opt.fadeDestroy.sensitivity : -1;
	    var opacity = (this.opt.fadeDestroy.opacity) ? this.opt.fadeDestroy.opacity : 99;
	    var duration = (this.opt.fadeDestroy.duration) ? this.opt.fadeDestroy.duration : 20;
	    DynamicTable.fadeObject(tb.style, opacity, sensitivity, duration);
	    setTimeout(function(){tb.style.display="none"}, duration * 100);
	} else
	    tb.style.display = "none";
    }
}

/**
 * Shows DynamicTable object toolbar using table element or table id
 */
DynamicTable.show = function(tbl){
    var oTbl = (typeof tbl == "string") ? document.getElementById(tbl) : tbl;    
    for (var i = 0, dtl = dTables.length; i < dtl; i++){
	if (dTables[i].table == oTbl){
	    dTables[i]._show();
	}
    }
}

/**
 * Shows toolbar of the table (using effects from options)
 */
DynamicTable.prototype._show = function(){
    if (this.toolbar){
	var tb = this.toolbar;
	if (this.opt.fadeCreate){
	    var sensitivity = (this.opt.fadeCreate.sensitivity) ? this.opt.fadeCreate.sensitivity : -1;
	    var opacity = (this.opt.fadeCreate.opacity) ? this.opt.fadeCreate.opacity : 99;
	    var duration = (this.opt.fadeCreate.duration) ? this.opt.fadeCreate.duration : 20;
	    // IE doesn't know table-row :(
	    if (DynamicTable.Browser.msie)
		tb.style.display = "block";
	    else
		tb.style.display = "table-row";

	    DynamicTable.setOpacity(tb.style, opacity);
	    DynamicTable.fadeObject(tb.style, opacity, sensitivity, duration);
	} else {
	    if (DynamicTable.Browser.msie)
		tb.style.display = "block";
	    else
		tb.style.display = "table-row";
	}
    }
}


/**
 * Event Handling
 */
var DynamicTableEvent = {
    observe: function(el, evt, handler){
	if (el.addEventListener)
	    el.addEventListener(evt, handler, false);
	else
	    el.attachEvent("on" + evt, handler);
    },

    stopObserving: function(el, evt, handler){
	if (el.removeEventListener)
	    el.removeEventListener(evt, handler, false);
	else
	    el.detachEvent("on" + evt, handler);
    },

    preventBubbling: function(evt) {
	if (window.Event) {
	    evt.cancelBubble = true;
	    evt.returnValue = false;
	} else {
	    event.cancelBubble = true;
	    event.returnValue = false;
	}
	return false;
    }

};

/**
 * Set an opacity to the tho style object of an element
 * NOTE: In IE if a DIV was hidden, opacity of value less than 100 
 *       can not be applied to visible this DIV.
 *       + in IE6 no effect will be made for opacity less than 100
 *	 if an element has no layout (size, zoom, position, ...)
 */
DynamicTable.setOpacity = function(style, opacity){

    if (DynamicTable.Browser.msie){
	if (opacity < 100){
	    var visib = (style.visibility != "hidden");
	    style.zoom = "100%";
	    if (!visib)
		style.visibility = "visible";
	    style.filter = "alpha(opacity=" + opacity + ")";
	    // place back old visibility
	    if (!visib)
		style.visibility = "hidden";
	} else
	    style.filter = "";

    } else {
	opacity /= 100.0;

	if (typeof style.KhtmlOpacity != "undefined")
	    style.KhtmlOpacity = opacity;
	else if (typeof style.MozOpacity != "undefined") // older Mozilla and Firefox
	    style.MozOpacity = opacity;	    
	else if (typeof style.KHTMLOpacity != "undefined") // Safary < 1.2, Konqueror
	    style.KHTMLOpacity = opacity;
	else if (typeof style.opacity != "undefined") // Safary > 1.2, newer Firefox, CSS3
	    style.opacity = opacity;
	
    }
}

/**
 * Changes objects css style declaration part 
 * setting opacity changing it by sensitivity 
 * until duration ellpased
 */
DynamicTable.fadeObject = function(style, opacity, sensitivity, duration){
    DynamicTable.setOpacity(style, opacity);
    if (opacity < 100 && opacity > 1){
	opacity += 1 * sensitivity;
	var fof = function(){
	    DynamicTable.fadeObject(style, opacity, sensitivity, duration);
	}
	setTimeout(fof, duration);
	//	setTimeout(function(){
	//	    DynamicTable.fadeObject(style, opacity, sensitivity, duration);
	//	}, duration);
    }
}

/**
 * Pre-defined sort methods
 */
DynamicTable.prototype.sortFunctions = {
    "alpha": function(a, b){
	return a.toLowerCase().localeCompare(b.toLowerCase());
    },
    "number": function(a, b){
	return Number(a) - Number(b);
    },
    "czdate" : function(a, b){
	var _a = a.split(".");
	var _b = b.split(".");
	var d_a = new Date(_a[2], _a[1], _a[0]);
	var d_b = new Date(_b[2], _b[1], _b[0]);
	return d_a.getTime() - d_b.getTime();
    },
    "date": function(a, b){
	var _a = a.split("-");
	var _b = b.split("-");
	var d_a = new Date(_a[0], _a[1], _a[2]);
	var d_b = new Date(_b[0], _b[1], _b[2]);
	return d_a.getTime() - d_b.getTime();
    }
};

// pre-defined function that filter rows
DynamicTable.prototype.filterFunction = function(a, b){
    return a.toLowerCase().search(b.toLowerCase());
}

window.DynamicTable = DynamicTable;
    
}(this))

