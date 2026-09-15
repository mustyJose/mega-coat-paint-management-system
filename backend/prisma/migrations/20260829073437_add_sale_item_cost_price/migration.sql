PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_SaleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "costPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_SaleItem" (
    "id",
    "productId",
    "quantity",
    "saleId",
    "subtotal",
    "unitPrice",
    "costPrice"
)
SELECT
    "SaleItem"."id",
    "SaleItem"."productId",
    "SaleItem"."quantity",
    "SaleItem"."saleId",
    "SaleItem"."subtotal",
    "SaleItem"."unitPrice",
    "Product"."costPrice"
FROM "SaleItem"
INNER JOIN "Product"
    ON "SaleItem"."productId" = "Product"."id";

DROP TABLE "SaleItem";

ALTER TABLE "new_SaleItem" RENAME TO "SaleItem";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;