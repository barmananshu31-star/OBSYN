-- =================================================================
-- OBSYN LUXURY APPAREL - COMPLETE DATABASE SCHEMA WITH STRICT RLS
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    fabric_options TEXT[] NOT NULL DEFAULT '{}',
    size_options TEXT[] NOT NULL DEFAULT '{}',
    pattern_options TEXT[] NOT NULL DEFAULT '{}',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COUPONS TABLE (Validated strictly server-side)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_value >= 0),
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SALES CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    scope TEXT NOT NULL DEFAULT 'all', -- 'all' or category name
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORDERS TABLE (Server-side managed via Clerk + Service Role)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'tailoring', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    shipping_address JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CUSTOM DESIGNS TABLE (Uploaded via Server API with Service Role)
CREATE TABLE IF NOT EXISTS public.custom_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    fabric TEXT NOT NULL,
    size TEXT NOT NULL,
    pattern TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ACTIVITY LOGS TABLE (Append-only audit & analytics stream)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ADMINS TABLE (For runtime admin expansion beyond env allowlist)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Products: Public can view, write restricted to service_role
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role has full access to products" ON public.products;
CREATE POLICY "Service role has full access to products" ON public.products
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sales: Public can view active sales, write restricted to service_role
DROP POLICY IF EXISTS "Public can view sales" ON public.sales;
CREATE POLICY "Public can view sales" ON public.sales
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role has full access to sales" ON public.sales;
CREATE POLICY "Service role has full access to sales" ON public.sales
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Coupons: No public read of table. Service role only.
DROP POLICY IF EXISTS "Service role has full access to coupons" ON public.coupons;
CREATE POLICY "Service role has full access to coupons" ON public.coupons
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Orders: No public/anon access. Service role only.
DROP POLICY IF EXISTS "Service role has full access to orders" ON public.orders;
CREATE POLICY "Service role has full access to orders" ON public.orders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Custom Designs: No public/anon access. Service role only.
DROP POLICY IF EXISTS "Service role has full access to custom_designs" ON public.custom_designs;
CREATE POLICY "Service role has full access to custom_designs" ON public.custom_designs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Activity Logs: No public access. Service role only.
DROP POLICY IF EXISTS "Service role has full access to activity_logs" ON public.activity_logs;
CREATE POLICY "Service role has full access to activity_logs" ON public.activity_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admins: No public access. Service role only.
DROP POLICY IF EXISTS "Service role has full access to admins" ON public.admins;
CREATE POLICY "Service role has full access to admins" ON public.admins
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =================================================================
-- ATOMIC ORDER PLACEMENT STORED PROCEDURE
-- =================================================================

CREATE OR REPLACE FUNCTION public.place_order(
    p_user_id TEXT,
    p_user_email TEXT,
    p_items JSONB,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_total NUMERIC,
    p_coupon_code TEXT,
    p_shipping_address JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
    v_product_name TEXT;
    v_order_number TEXT;
    v_new_order RECORD;
BEGIN
    -- 1. Verify stock and atomically decrement for each catalog product
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Check if it's a catalog product (not a custom design line item without product_id)
        IF (v_item->>'product_id') IS NOT NULL AND (v_item->>'product_id') != '' THEN
            v_product_id := (v_item->>'product_id')::UUID;
            v_quantity := (v_item->>'quantity')::INTEGER;

            -- Lock the product row FOR UPDATE to prevent race conditions
            SELECT stock, name INTO v_current_stock, v_product_name
            FROM public.products
            WHERE id = v_product_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'ERR_PRODUCT_NOT_FOUND: Product % does not exist', v_product_id;
            END IF;

            IF v_current_stock < v_quantity THEN
                RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Item "%" is out of stock (Requested: %, Available: %)',
                    v_product_name, v_quantity, v_current_stock;
            END IF;

            -- Decrement the stock
            UPDATE public.products
            SET stock = stock - v_quantity
            WHERE id = v_product_id;
        END IF;
    END LOOP;

    -- 2. Generate a bespoke luxury order number
    v_order_number := 'OBS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- 3. Insert the order
    INSERT INTO public.orders (
        order_number,
        user_id,
        user_email,
        items,
        subtotal,
        discount,
        total,
        coupon_code,
        status,
        payment_status,
        shipping_address
    ) VALUES (
        v_order_number,
        p_user_id,
        p_user_email,
        p_items,
        p_subtotal,
        p_discount,
        p_total,
        p_coupon_code,
        'processing',
        'paid',
        p_shipping_address
    )
    RETURNING * INTO v_new_order;

    -- 4. Record the order in activity_logs
    INSERT INTO public.activity_logs (
        user_id,
        user_email,
        action,
        metadata
    ) VALUES (
        p_user_id,
        p_user_email,
        'order_placed',
        jsonb_build_object(
            'order_id', v_new_order.id,
            'order_number', v_order_number,
            'total', p_total,
            'item_count', jsonb_array_length(p_items)
        )
    );

    -- Return the created order as JSON
    RETURN to_jsonb(v_new_order);
END;
$$;

-- =================================================================
-- TABLE PRIVILEGES & ROLE GRANTS (Required for PostgREST / Supabase API)
-- =================================================================

-- 1. Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Service role has full permissions across all tables, sequences, and routines
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 3. Public / Anon / Authenticated roles can read products and active sales
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.sales TO anon, authenticated;

-- 4. Grant execute on stored procedure to service_role
GRANT EXECUTE ON FUNCTION public.place_order TO service_role;

-- 5. Ensure future tables and functions automatically inherit these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- =================================================================
-- STORAGE BUCKETS SETUP (Run in Supabase dashboard or storage API)
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-designs', 'custom-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for product images
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Public read for custom designs
DROP POLICY IF EXISTS "Public Read Custom Designs" ON storage.objects;
CREATE POLICY "Public Read Custom Designs" ON storage.objects
    FOR SELECT USING (bucket_id = 'custom-designs');

-- Service role full control of storage
DROP POLICY IF EXISTS "Service Role Full Storage" ON storage.objects;
CREATE POLICY "Service Role Full Storage" ON storage.objects
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =================================================================
-- SEED DATA: FLAGSHIP OBSIDIAN COLLECTION
-- =================================================================

INSERT INTO public.products (name, slug, description, price, category, images, fabric_options, size_options, pattern_options, featured, stock)
VALUES
(
    'Oversized Heavyweight Hoodie (01)',
    'oversized-heavyweight-hoodie-01',
    'Engineered from 500 GSM loopback French terry. Dropped shoulders, double-layered hood without drawstrings, concealed kangaroo seam pockets. Finished with raw matte black hardware.',
    185.00,
    'Hoodies',
    ARRAY[
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578768079052-aa76e520028b?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['500 GSM French Terry', '450 GSM Heavy Cotton', 'Cashmere Fleece Blend'],
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Solid Obsidian', 'Distressed Mineral', 'Acid Wash'],
    TRUE,
    45
),
(
    'Modular Technical Trench',
    'modular-technical-trench',
    'Triple-layer bonded waterproof membrane with taped seam architecture. Removable magnetic modular storm flap, articulated storm collar, and tonal matte webbing straps.',
    420.00,
    'Outerwear',
    ARRAY[
        'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['3-Layer Waterproof Ripstop', 'Technical Bonded Nylon'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Deep Charcoal', 'Pitch Black'],
    TRUE,
    18
),
(
    'Boxy Heavyweight Tee',
    'boxy-heavyweight-tee',
    'Constructed from 280 GSM combed organic cotton. Features a 1.25" bound collar, wide boxy silhouette, and subtle blind-stitched hem.',
    95.00,
    'T-Shirts',
    ARRAY[
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['280 GSM Organic Cotton', 'Vintage Washed Cotton'],
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Solid Obsidian', 'Faded Smoke', 'Raw Mineral'],
    TRUE,
    80
),
(
    'Articulated Cargo Trouser',
    'articulated-cargo-trouser',
    'Pleated ergonomic knee gussets with 8-pocket ergonomic utility. Magnetic fidlock pocket flaps and adjustable drawcord cuff closures in heavy tactical twill.',
    240.00,
    'Bottoms',
    ARRAY[
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['Heavy Tactical Twill', 'Ripstop Cordura'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Matte Black', 'Obsidian Shadow'],
    TRUE,
    25
),
(
    'Cropped MA-1 Bomber',
    'cropped-ma1-bomber',
    'High-density Japanese flight nylon with PrimaLoft gold thermal insulation. Reversible emergency orange lining, heavy two-way matte zipper, and ribbed wool trims.',
    380.00,
    'Outerwear',
    ARRAY[
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['Japanese Flight Nylon', 'Water-Resistant Satin'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Pitch Black', 'Oil Slick Sheen'],
    FALSE,
    14
),
(
    'Tailored Pleated Sweatpant',
    'tailored-pleated-sweatpant',
    'Hybrid between formal tailoring and luxury lounge. Front sharp stitched pleat, concealed zip pockets, heavy ribbing, and custom metal aglets.',
    160.00,
    'Bottoms',
    ARRAY[
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1200&auto=format&fit=crop'
    ],
    ARRAY['450 GSM French Terry', 'Cashmere Terry Blend'],
    ARRAY['XS', 'S', 'M', 'L', 'XL'],
    ARRAY['Solid Obsidian', 'Dark Heather'],
    FALSE,
    30
)
ON CONFLICT (slug) DO NOTHING;

-- SEED COUPONS
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, active)
VALUES
('OBSYN10', 'percent', 10.00, 100.00, TRUE),
('WELCOME20', 'percent', 20.00, 150.00, TRUE),
('VIP50', 'fixed', 50.00, 250.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- SEED SALES CAMPAIGN
INSERT INTO public.sales (name, discount_percent, scope, starts_at, ends_at, active)
VALUES
('GENESIS DROP 01 LAUNCH', 15.00, 'all', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE);
