INSERT INTO menu_items (
    id, name, slug, category, price, description, detail, available, sort_order
) VALUES
    (
        '01975b32-0000-7000-8000-000000000001',
        'Bánh mì đặc biệt',
        'banh-mi-dac-biet',
        'banh_mi',
        32000,
        'Pate, chả, thịt nguội, đồ chua, rau thơm và sốt nhà làm.',
        'Ổ bánh mì đầy đủ nhất của Breadify, cân bằng vị béo của pate, vị mặn của chả/thịt nguội và độ giòn chua nhẹ của đồ chua.',
        TRUE,
        1
    ),
    (
        '01975b32-0000-7000-8000-000000000002',
        'Bánh mì gà xé',
        'banh-mi-ga-xe',
        'banh_mi',
        28000,
        'Gà xé mềm, dưa leo, rau thơm và sốt cay nhẹ.',
        'Gà xé mềm được áo sốt cay nhẹ, hợp cho bữa sáng nhanh nhưng vẫn đủ vị.',
        TRUE,
        2
    ),
    (
        '01975b32-0000-7000-8000-000000000003',
        'Bánh mì chay',
        'banh-mi-chay',
        'banh_mi',
        25000,
        'Nấm áp chảo, đậu hũ, đồ chua, rau giòn và sốt mè.',
        'Phiên bản chay nhẹ bụng với nấm áp chảo và đậu hũ, giữ độ giòn đặc trưng của bánh mì.',
        TRUE,
        3
    ),
    (
        '01975b32-0000-7000-8000-000000000004',
        'Bánh mì trứng',
        'banh-mi-trung',
        'banh_mi',
        24000,
        'Trứng ốp la lòng đào, pate, dưa leo và nước tương.',
        'Trứng ốp la nóng, pate thơm và nước tương vừa miệng cho bữa sáng cổ điển.',
        TRUE,
        4
    ),
    (
        '01975b32-0000-7000-8000-000000000005',
        'Cà phê sữa đá',
        'ca-phe-sua-da',
        'do_uong',
        20000,
        'Cà phê phin, sữa đặc và đá viên.',
        'Ly cà phê sữa đá đậm vị để dùng cùng bánh mì buổi sáng.',
        TRUE,
        1
    ),
    (
        '01975b32-0000-7000-8000-000000000006',
        'Trà tắc',
        'tra-tac',
        'do_uong',
        15000,
        'Trà tắc chua ngọt, dùng lạnh.',
        'Thức uống nhẹ, hợp dùng kèm các món bánh mì nhiều pate.',
        TRUE,
        2
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    detail = EXCLUDED.detail,
    available = EXCLUDED.available,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;
