DynamicTable
============

Make your HTML table dynamic with paging, filters and sorting.

DEMO
----

Demo is available here: [http://www.daviddurman.com/dynamic-table-javascript-library.html](http://www.daviddurman.com/dynamic-table-javascript-library.html).

USAGE
-----

        // Pass HTML table element string ID
        new DynamicTable('myTableId')

        // or pass HTML table element directly.
        new DynamicTable(document.getElementById('myTableId'))

        // or directly in HTML - no need to be worry about duplicate instantiation for the same table element,
        // DynamicTable takes care of it.
        <table onmouseover="new DynamicTable(this)">...</table>

        // First column alphanumerically sorted, second column sorted by numbers.
        new DynamicTable('myTableId', {
            colTypes: ['alpha', 'number']
        })

        // Custom sort function.
        // Predefined sort functions are: 

        // - 'alpha': alphanumeric using current locale
        // - 'number': by numbers
        // - 'czdate': czech date format (dd.mm.yyyy)
        // - 'date': english date format (yyyy-mm-dd)

        new DynamicTable('myTableId', {
            colTypes: ['myLastChar'],
            customTypes: {
                myLastChar: function(a, b) {
                    return a.charCodeAt(a.length - 1) - b.charCodeAt(b.length - 1)
                }
            }
        })

        // Custom filter function - case-agnostic instead of the default case-sensitive.
        // Filter function must return -1 when not found, something else otherwise.
        new DynamicTable('myTableId', {
            filterFunction: function(a, b) {
                return a.search(b);
            }
        })

        // Paging.
        new DynamicTable('myTableId', {
            pager: {
                rowsCount: 10,
                currentPage: 3
            }
        })

        // Visual effects.
        new DynamicTable('myTableId', {
            fadeDestroy: {
                opacity: 90,    // %
                sensitivity: -1,
                duration: 10    // 1 second
            },
            fadeCreate: {
                opacity: 10,    // % of the opacity when the effect starts
                sensitivity: .5,
                duration: 30    // 3 seconds
            }
        })

        // Destroying DynamicTable
        DynamicTable.destroy('myTableId')
        DynamicTable.destroy(document.getElementById('myTableId'))

        // Hide/show toolbar
        DynamicTable.hide('myTableId')
        DynamicTable.hide(document.getElementById('myTableId'))
        DynamicTable.show('myTableId')
        DynamicTable.show(document.getElementById('myTableId'))


CSS Classes used in the stylesheet
----------------------------------

        .dynamic-table-toolbar                  (TR element)
        .dynamic-table-filter                   (INPUT element)
        .tool-1, .tool-2, ...., tool-n          (TH element)
        .dynamic-table-downarrow                (IMG element)
        .dynamic-table-uparrow                  (IMG element)
        .dynamic-table-pagerbar                 (TD element)
        .dynamic-table-page-selector            (A element)
        .dynamic-table-page-selected            (A element)

Example style for third filter in order:

        #myTableId .dynamic-table-toolbar .tool-3 .dynamic-table-filter {
            width: 50px;
        }


Browser compatibility
---------------------

- Mozilla/5.0 Gecko/20080311 Iceweasel/2.0.0.13+
- IE6+
- Opera/9.27+
- Google Chrome


LICENSE
-------

MIT license.

