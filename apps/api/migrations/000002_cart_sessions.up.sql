ALTER TABLE orders
    ALTER COLUMN customer_name DROP NOT NULL,
    ALTER COLUMN phone DROP NOT NULL;

CREATE TABLE cart_sessions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY,
    cart_session_id UUID NOT NULL REFERENCES cart_sessions (id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items (id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_session_id, menu_item_id)
);

CREATE INDEX cart_sessions_expires_at_idx ON cart_sessions (expires_at);
CREATE INDEX cart_items_cart_session_id_idx ON cart_items (cart_session_id);
CREATE INDEX cart_items_menu_item_id_idx ON cart_items (menu_item_id);
