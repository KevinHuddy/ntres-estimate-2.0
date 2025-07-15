[ ] Code d'activités
[ ] Créer soumission
[ ] Créer 

1. Heavy work happening in every row
• SupplierName component
Each visible row mounts its own useSuppliers() hook. Even though React-Query caches the request, the hook still subscribes every row to the query state and executes its own useMemo.
That means dozens / hundreds of React components and effects are created, destroyed and reconciled on every scroll movement.
✔ Fix: Fetch suppliers once (e.g. at <takeoff/page.tsx> or inside Category) and build a const supplierNameMap = useMemo(() => Object.fromEntries([...]) , []).
Pass the map to the table or enrich the line items before they reach DataTable, so each cell is just a static string.
Icon components
Every row renders 3-4 SVG icons (@vibe/icons). SVGs are relatively expensive DOM nodes.
✔ Fix: Cache them with React.memo, inline them as background-images, or hide them until the row is hovered.
2. React-Table + react-virtuoso setup
DataTable
already virtualises rows, but you leave several costly defaults on:
a) Overscan
TableVirtuoso defaults to ~200 px overscan in both directions. On fast scrolls it can still render 30-50 rows per frame.
✔ Add overscan={10} (or whatever feels smooth) to cut DOM work roughly in half.
b) Variable row widths
Each cell sets both minWidth and maxWidth on the fly. These inline styles force the browser to recalc layout more often.
✔ Move widths to a CSS class or a columnDefinition style created once with useMemo.
c) No memoisation of row function
TableRowComponent(rows) closes over the whole rows array. Every state change in DataTable creates a brand new function, forcing Virtuoso to throw away its row cache.
✔ Wrap the result in useMemo(() => TableRowComponent(rows), [rows]).


6. Measure!
Turn on Chrome DevTools “Performance” > “Flamechart”.
If you still see © SupplierName or ⧗ Icon renders in every frame, fix #1.
If commit phases show hundreds of TableRow mounts per scroll, tweak Virtuoso overscan.
If the JS thread is idle but FPS is low, inline-styles / flex layouts are thrashing; move widths to CSS.


Cheat-sheet of low-effort, high-impact changes

Fetch suppliers once ➜ map id→name, drop SupplierName hook per row.
Wrap createColumns(...) & TableRowComponent in useMemo.
Add overscan={10}, useMemo for column widths, and constant row height to TableVirtuoso.
Debounce search input (100-150 ms).
Replace SVG icons with memoised components or show them only on hover.
Implementing the above usually brings large-dataset tables from “janky” to 60 fps. Let me know if you’d like code snippets or deeper profiling on any of these points