DynamicTable
============

Make your HTML table dynamic with paging, filters and sorting.

USAGE
-----

        // Pass HTML table element string ID.
        new DynamicTable('myTableId')

        // Pass HTML table element directly.
        new DynamicTable(document.getElementById('myTableId'))

        // First column alphanumerically sorted, second column sorted by numbers.
        new DynamicTable('myTableId', {
            colTypes: ['alpha', 'number']
        })

        // Custom sort function.
        new DynamicTable('myTableId', {
            colTypes: ['myLastChar'],
            customTypes: {
                myLastChar: function(a, b) {
                    return a.charCodeAt(a.length - 1) - b.charCodeAt(b.length - 1)
                }
            }
        })

        // Custom filter function - case-agnostic instead of the default case-sensitive.
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


CSS Classes used in the stylesheet
----------------------------------

        .dynamic-table-toolbar
        .dynamic-table-filter
        .tool-1, .tool-2, ...., tool-n
        .dynamic-table-downarrow
        .dynamic-table-uparrow
        .dynamic-table-pagerbar
        .dynamic-table-page-selector
        .dynamic-table-page-selected

Example style for third filter in order:

        #myTableId .dynamic-table-toolbar .tool-3 .dynamic-table-filter {
            width: 50px;
        }



LICENSE
-------

MIT license.

