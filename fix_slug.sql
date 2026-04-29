UPDATE "products"
SET "slug" = CONCAT('product-', id)
WHERE "slug" IS NULL;

