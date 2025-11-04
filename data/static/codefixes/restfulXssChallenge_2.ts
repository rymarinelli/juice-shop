ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe({
      next: ([quantities, products]) => {
        const dataTable: TableEntry[] = []
        this.tableData = products
        this.encodeProductDescription(products)
        for (const product of products) {
          dataTable.push({
            name: product.name,
            price: product.price,
            deluxePrice: product.deluxePrice,
            id: product.id,
            image: product.image,
            description: product.description
          })
        }
        for (const quantity of quantities) {
          const entry = dataTable.find((dataTableEntry) => {
            return dataTableEntry.id === quantity.ProductId
          })
          if (entry === undefined) {
            continue
          }
          entry.quantity = quantity.quantity
        }
        this.dataSource = new MatTableDataSource<TableEntry>(dataTable)
        for (let i = 1; i <= Math.ceil(this.dataSource.data.length / 12); i++) {
          this.pageSizeOptions.push(i * 12)
        }
        this.paginator.pageSizeOptions = this.pageSizeOptions
        this.dataSource.paginator = this.paginator
        this.gridDataSource = this.dataSource.connect()
        this.resultsLength = this.dataSource.data.length
        this.filterTable()
        this.routerSubscription = this.router.events.subscribe(() => {
          this.filterTable()
        })
        if (window.innerWidth < 2600) {
          this.breakpoint = 4
          if (window.innerWidth < 1740) {
            this.breakpoint = 3
            if (window.innerWidth < 1280) {
              this.breakpoint = 2
              if (window.innerWidth < 850) {
                this.breakpoint = 1
              }
            }
          }
        } else {
          this.breakpoint = 6
        }
        this.cdRef.detectChanges()
      },
      error: (err) => { console.log(err) }
    })
  }

  encodeProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      tableData[i].description = tableData[i].description.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
# MCP-LMM-FIX (javascript.audit.detect-replaceall-sanitization.detect-replaceall-sanitization): Detected a call to `replaceAll()` in an attempt to HTML escape the string `tableData[i].description.replaceAll('<', '&lt;')`. Manually sanitizing input through a manually built list can be circumvented in many situations, and it's better to use a well known sanitization library such as `sanitize-html` or `DOMPurify`.
console.error(err)
      }
    })
  }

  encodeProductDescription(products: Product[]) {
    for (const product of products) {
      product.description = product.description.replaceAll('<', '&lt;')
    }
  }

  filterTable() {
    if (this.dataSource) {
      this.dataSource.filter = this.filterValue
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.filterValue = filterValue.trim().toLowerCase()
    this.filterTable()
  }

  ngOnDestroy() {
    if (this.gridDataSource) {
      this.gridDataSource.unsubscribe()
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
  }
}
```

FIXED CODE SNIPPET:

```javascript
encodeProductDescription(products: Product[]) {
  for (const product of products) {
    product.
# MCP-LMM-FIX (javascript.audit.detect-replaceall-sanitization.detect-replaceall-sanitization): Detected a call to `replaceAll()` in an attempt to HTML escape the string `tableData[i].description`. Manually sanitizing input through a manually built list can be circumvented in many situations, and it's better to use a well known sanitization library such as `sanitize-html` or `DOMPurify`.
console.error(err)
      }
    })
  }

FIXED CODE SNIPPET:
ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe({
      next: ([quantities, products]) => {
        const dataTable: TableEntry[] = []
        this.tableData = products
        this.encodeProductDescription(products)
        for (const product of products) {
          dataTable.push({
            name: product.name,
            price: product.price,
            deluxePrice: product.deluxePrice,
            id: product.id,
            image: product.image,
            description: product.description
          })
        }
        for (const quantity of quantities) {
          const entry = dataTable.find((dataTableEntry) => {
            return dataTableEntry.id === quantity.ProductId
          })
          if (entry === undefined) {
            continue
          }
          entry.quantity = quantity.quantity
    }
  }