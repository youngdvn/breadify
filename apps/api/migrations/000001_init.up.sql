CREATE TYPE category AS ENUM ('banh_mi', 'do_uong');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'done', 'cancelled');
CREATE TYPE fulfillment_type AS ENUM ('pickup', 'delivery');
CREATE TYPE payment_method AS ENUM ('cash', 'momo', 'vietqr');
CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');

CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category category NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    description TEXT,
    detail TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX menu_items_category_available_sort_order_idx
    ON menu_items (category, available, sort_order);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    status order_status NOT NULL DEFAULT 'pending',
    fulfillment_type fulfillment_type NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    note TEXT,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX orders_status_created_at_idx ON orders (status, created_at);
CREATE INDEX orders_payment_method_payment_status_idx ON orders (payment_method, payment_status);
CREATE INDEX orders_fulfillment_type_created_at_idx ON orders (fulfillment_type, created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items (id) ON DELETE RESTRICT,
    name_snapshot TEXT NOT NULL,
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    note TEXT,
    line_total INTEGER NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX order_items_menu_item_id_idx ON order_items (menu_item_id);
