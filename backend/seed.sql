-- Seed Data for Bakery Production Manager

-- Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password, name, role) VALUES
('admin@sweetrise.com', '$2a$10$8Kq5Y5Kz5Z5Z5Z5Z5Z5Z5eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Admin User', 'admin'),
('baker@sweetrise.com', '$2a$10$8Kq5Y5Kz5Z5Z5Z5Z5Z5Z5eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Head Baker', 'baker');

-- Recipes (20 items)
INSERT INTO recipes (name, category, description, steps, yield_amount, yield_unit, cost_per_unit, prep_time_minutes, bake_time_minutes, bake_temp_f) VALUES
('Classic Sourdough Bread', 'Bread', 'Traditional sourdough with a crispy crust and chewy interior', '1. Mix flour, water, starter. 2. Autolyse 30min. 3. Add salt, fold 4x over 2hrs. 4. Bulk ferment 4hrs. 5. Shape and proof overnight. 6. Bake at 450F with steam.', 2, 'loaves', 3.50, 30, 45, 450),
('French Baguette', 'Bread', 'Crispy French baguettes with an airy crumb', '1. Mix flour, water, yeast, salt. 2. Knead 10min. 3. Bulk ferment 2hrs. 4. Divide and shape. 5. Proof 45min. 6. Score and bake with steam.', 4, 'baguettes', 1.75, 20, 25, 475),
('Chocolate Croissant', 'Pastry', 'Buttery laminated pastry with dark chocolate', '1. Make detrempe. 2. Laminate with butter (3 turns). 3. Roll and cut. 4. Place chocolate batons. 5. Roll up. 6. Proof 2hrs. 7. Egg wash and bake.', 12, 'pieces', 2.25, 180, 18, 400),
('Cinnamon Roll', 'Pastry', 'Soft enriched dough with cinnamon sugar and cream cheese frosting', '1. Mix enriched dough. 2. Rise 1hr. 3. Roll out, spread butter/cinnamon/sugar. 4. Roll and cut. 5. Proof 45min. 6. Bake. 7. Frost with cream cheese icing.', 12, 'pieces', 1.80, 45, 22, 350),
('Blueberry Muffin', 'Muffin', 'Moist muffins loaded with fresh blueberries and streusel topping', '1. Mix dry ingredients. 2. Mix wet ingredients. 3. Fold together gently. 4. Fold in blueberries. 5. Top with streusel. 6. Bake.', 12, 'muffins', 1.20, 15, 25, 375),
('New York Cheesecake', 'Cake', 'Dense and creamy classic cheesecake with graham cracker crust', '1. Make graham crust, pre-bake. 2. Beat cream cheese and sugar. 3. Add eggs one at a time. 4. Add sour cream and vanilla. 5. Pour over crust. 6. Water bath bake.', 12, 'slices', 3.50, 30, 60, 325),
('Red Velvet Cake', 'Cake', 'Three-layer red velvet with cream cheese frosting', '1. Mix dry ingredients. 2. Cream butter and sugar. 3. Add eggs, buttermilk, red coloring. 4. Fold in dry ingredients. 5. Bake in 3 pans. 6. Cool and frost.', 16, 'slices', 3.00, 40, 30, 350),
('Almond Macaron', 'Cookie', 'French macarons with various fillings', '1. Make tant pour tant. 2. Make French meringue. 3. Macaronage. 4. Pipe onto trays. 5. Rest 30min. 6. Bake. 7. Fill and mature.', 24, 'pieces', 1.50, 60, 14, 300),
('Artisan Focaccia', 'Bread', 'Olive oil focaccia with rosemary and sea salt', '1. Mix high-hydration dough. 2. Bulk ferment with folds. 3. Oil pan, stretch dough. 4. Dimple and top. 5. Proof 30min. 6. Bake.', 1, 'sheet', 4.00, 20, 25, 425),
('Danish Pastry', 'Pastry', 'Laminated pastry with fruit and custard', '1. Make enriched detrempe. 2. Laminate (3 turns). 3. Cut shapes. 4. Fill with custard. 5. Top with fruit. 6. Proof and bake. 7. Glaze.', 12, 'pieces', 2.50, 150, 18, 400),
('Banana Bread', 'Quick Bread', 'Moist banana bread with walnuts', '1. Mash bananas. 2. Cream butter/sugar. 3. Add eggs. 4. Fold in flour and bananas. 5. Add walnuts. 6. Bake in loaf pan.', 1, 'loaf', 2.00, 15, 55, 350),
('Chocolate Ganache Tart', 'Tart', 'Rich dark chocolate ganache in a butter crust', '1. Make pâte sucrée. 2. Blind bake shell. 3. Heat cream, pour over chocolate. 4. Pour ganache into shell. 5. Set in fridge 4hrs.', 8, 'slices', 4.00, 45, 15, 375),
('Brioche Loaf', 'Bread', 'Rich buttery brioche bread', '1. Mix flour, eggs, sugar, yeast. 2. Add butter gradually. 3. Ferment overnight. 4. Shape into loaf. 5. Proof 2hrs. 6. Egg wash and bake.', 1, 'loaf', 3.00, 30, 35, 350),
('Lemon Tart', 'Tart', 'Tangy lemon curd in a sweet pastry shell', '1. Make sweet pastry. 2. Blind bake. 3. Make lemon curd (juice, zest, eggs, sugar, butter). 4. Pour into shell. 5. Bake until set. 6. Dust with powdered sugar.', 8, 'slices', 3.25, 40, 25, 325),
('Chocolate Chip Cookie', 'Cookie', 'Classic chewy chocolate chip cookies', '1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in flour, baking soda, salt. 4. Fold in chocolate chips. 5. Scoop and bake.', 24, 'cookies', 0.85, 15, 12, 350),
('Pumpkin Spice Scone', 'Pastry', 'Autumn-spiced scones with pumpkin glaze', '1. Mix dry ingredients with spices. 2. Cut in cold butter. 3. Add pumpkin puree and cream. 4. Pat and cut. 5. Bake. 6. Drizzle with spiced glaze.', 8, 'scones', 1.60, 20, 18, 400),
('Opera Cake', 'Cake', 'French layered cake with coffee and chocolate', '1. Make joconde sponge. 2. Make coffee syrup. 3. Make coffee buttercream. 4. Make chocolate ganache. 5. Layer: sponge, syrup, buttercream, ganache. 6. Glaze top.', 12, 'slices', 4.50, 90, 12, 350),
('Pretzel', 'Bread', 'Bavarian soft pretzels with coarse salt', '1. Mix dough. 2. Rise 1hr. 3. Divide and shape into pretzels. 4. Dip in baking soda bath. 5. Top with coarse salt. 6. Bake until deep brown.', 8, 'pretzels', 1.25, 30, 14, 425),
('Fruit Tart', 'Tart', 'Fresh fruit tart with vanilla pastry cream', '1. Make pâte sucrée. 2. Blind bake. 3. Make vanilla pastry cream. 4. Fill shell with cream. 5. Arrange fresh seasonal fruit. 6. Glaze with apricot jam.', 8, 'slices', 3.75, 50, 15, 375),
('Marble Pound Cake', 'Cake', 'Classic vanilla and chocolate marble pound cake', '1. Cream butter and sugar. 2. Add eggs one at a time. 3. Fold in flour. 4. Divide batter, add cocoa to half. 5. Swirl in loaf pan. 6. Bake low and slow.', 10, 'slices', 2.20, 20, 55, 325);

-- Recipe Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, cost) VALUES
(1, 'Bread Flour', 500, 'g', 0.75), (1, 'Water', 350, 'ml', 0.00), (1, 'Sourdough Starter', 100, 'g', 0.25), (1, 'Salt', 10, 'g', 0.02),
(2, 'Bread Flour', 500, 'g', 0.75), (2, 'Water', 340, 'ml', 0.00), (2, 'Instant Yeast', 5, 'g', 0.10), (2, 'Salt', 10, 'g', 0.02),
(3, 'All-Purpose Flour', 500, 'g', 0.60), (3, 'Butter', 280, 'g', 3.50), (3, 'Dark Chocolate', 120, 'g', 2.00), (3, 'Sugar', 60, 'g', 0.10),
(5, 'All-Purpose Flour', 300, 'g', 0.40), (5, 'Blueberries', 200, 'g', 2.50), (5, 'Sugar', 150, 'g', 0.20), (5, 'Eggs', 2, 'each', 0.60),
(6, 'Cream Cheese', 900, 'g', 6.00), (6, 'Sugar', 200, 'g', 0.30), (6, 'Eggs', 5, 'each', 1.50), (6, 'Graham Crackers', 200, 'g', 1.50);

-- Production Schedules (20 items)
INSERT INTO production_schedules (recipe_id, scheduled_date, shift, batch_count, status, assigned_to, notes) VALUES
(1, CURRENT_DATE, 'Morning', 5, 'in_progress', 'Carlos M.', 'Regular daily sourdough production'),
(2, CURRENT_DATE, 'Morning', 8, 'completed', 'Maria S.', 'French baguettes for lunch rush'),
(3, CURRENT_DATE, 'Early AM', 4, 'completed', 'Pierre L.', 'Chocolate croissants - extra batch for catering'),
(4, CURRENT_DATE, 'Morning', 3, 'in_progress', 'Sarah K.', 'Cinnamon rolls for retail display'),
(5, CURRENT_DATE, 'Morning', 2, 'planned', 'Tom R.', 'Blueberry muffins - fresh berries arrived'),
(15, CURRENT_DATE, 'Afternoon', 6, 'planned', 'Lisa W.', 'Cookie dough prep for tomorrow'),
(6, CURRENT_DATE + 1, 'Morning', 1, 'planned', 'Pierre L.', 'Cheesecake for Riverside Cafe order'),
(7, CURRENT_DATE + 1, 'Morning', 2, 'planned', 'Sarah K.', 'Red velvet cakes - wedding order'),
(8, CURRENT_DATE + 1, 'Afternoon', 3, 'planned', 'Maria S.', 'Macaron production - assorted flavors'),
(9, CURRENT_DATE + 1, 'Morning', 4, 'planned', 'Carlos M.', 'Focaccia for restaurant orders'),
(10, CURRENT_DATE + 2, 'Early AM', 3, 'planned', 'Pierre L.', 'Danish pastries - mixed fruit'),
(11, CURRENT_DATE + 2, 'Morning', 2, 'planned', 'Tom R.', 'Banana bread - use ripe bananas'),
(1, CURRENT_DATE + 2, 'Morning', 5, 'planned', 'Carlos M.', 'Daily sourdough'),
(2, CURRENT_DATE + 2, 'Morning', 6, 'planned', 'Maria S.', 'Baguettes for wholesale'),
(13, CURRENT_DATE + 3, 'Early AM', 2, 'planned', 'Pierre L.', 'Brioche for brunch service'),
(18, CURRENT_DATE + 3, 'Morning', 4, 'planned', 'Tom R.', 'Pretzels for farmers market'),
(16, CURRENT_DATE + 3, 'Morning', 3, 'planned', 'Sarah K.', 'Pumpkin scones - seasonal special'),
(19, CURRENT_DATE + 4, 'Morning', 2, 'planned', 'Maria S.', 'Fruit tarts - Saturday special'),
(17, CURRENT_DATE + 4, 'Afternoon', 1, 'planned', 'Pierre L.', 'Opera cake for special order'),
(20, CURRENT_DATE + 4, 'Morning', 3, 'planned', 'Lisa W.', 'Marble pound cake for cafe');

-- Ingredient Inventory (20 items)
INSERT INTO ingredient_inventory (name, category, current_stock, unit, par_level, cost_per_unit, supplier, last_ordered, expiry_date, storage_location) VALUES
('Bread Flour', 'Flour', 150, 'kg', 100, 1.50, 'Midwest Mills', CURRENT_DATE - 7, CURRENT_DATE + 90, 'Dry Storage A'),
('All-Purpose Flour', 'Flour', 120, 'kg', 80, 1.20, 'Midwest Mills', CURRENT_DATE - 7, CURRENT_DATE + 90, 'Dry Storage A'),
('Pastry Flour', 'Flour', 40, 'kg', 30, 1.80, 'Midwest Mills', CURRENT_DATE - 14, CURRENT_DATE + 90, 'Dry Storage A'),
('Unsalted Butter', 'Dairy', 45, 'kg', 30, 8.50, 'Valley Dairy Co.', CURRENT_DATE - 3, CURRENT_DATE + 30, 'Walk-in Cooler'),
('Heavy Cream', 'Dairy', 20, 'liters', 15, 5.00, 'Valley Dairy Co.', CURRENT_DATE - 2, CURRENT_DATE + 10, 'Walk-in Cooler'),
('Eggs (Large)', 'Dairy', 30, 'dozen', 20, 4.50, 'Happy Hen Farm', CURRENT_DATE - 2, CURRENT_DATE + 21, 'Walk-in Cooler'),
('Granulated Sugar', 'Sugar', 80, 'kg', 50, 1.00, 'Sweet Supplies Inc.', CURRENT_DATE - 10, CURRENT_DATE + 365, 'Dry Storage B'),
('Powdered Sugar', 'Sugar', 25, 'kg', 15, 1.50, 'Sweet Supplies Inc.', CURRENT_DATE - 10, CURRENT_DATE + 365, 'Dry Storage B'),
('Brown Sugar', 'Sugar', 20, 'kg', 15, 1.30, 'Sweet Supplies Inc.', CURRENT_DATE - 10, CURRENT_DATE + 180, 'Dry Storage B'),
('Dark Chocolate (70%)', 'Chocolate', 15, 'kg', 10, 12.00, 'Cacao Direct', CURRENT_DATE - 5, CURRENT_DATE + 180, 'Dry Storage C'),
('Milk Chocolate', 'Chocolate', 10, 'kg', 8, 10.00, 'Cacao Direct', CURRENT_DATE - 5, CURRENT_DATE + 180, 'Dry Storage C'),
('Vanilla Extract', 'Flavoring', 3, 'liters', 2, 25.00, 'Spice Traders', CURRENT_DATE - 30, CURRENT_DATE + 365, 'Dry Storage C'),
('Active Dry Yeast', 'Leavening', 5, 'kg', 3, 8.00, 'Bakers Essentials', CURRENT_DATE - 14, CURRENT_DATE + 120, 'Walk-in Cooler'),
('Baking Powder', 'Leavening', 4, 'kg', 2, 3.50, 'Bakers Essentials', CURRENT_DATE - 30, CURRENT_DATE + 180, 'Dry Storage B'),
('Salt (Fine)', 'Seasoning', 10, 'kg', 5, 0.80, 'Bakers Essentials', CURRENT_DATE - 30, CURRENT_DATE + 730, 'Dry Storage B'),
('Fresh Blueberries', 'Fruit', 8, 'kg', 5, 12.00, 'Berry Good Farms', CURRENT_DATE - 1, CURRENT_DATE + 5, 'Walk-in Cooler'),
('Cream Cheese', 'Dairy', 12, 'kg', 8, 7.50, 'Valley Dairy Co.', CURRENT_DATE - 3, CURRENT_DATE + 21, 'Walk-in Cooler'),
('Almond Flour', 'Flour', 10, 'kg', 8, 15.00, 'Nut House Supply', CURRENT_DATE - 7, CURRENT_DATE + 120, 'Dry Storage A'),
('Sourdough Starter', 'Leavening', 5, 'kg', 2, 0.00, 'House Made', CURRENT_DATE, CURRENT_DATE + 7, 'Fermentation Room'),
('Cocoa Powder', 'Chocolate', 8, 'kg', 5, 9.00, 'Cacao Direct', CURRENT_DATE - 14, CURRENT_DATE + 365, 'Dry Storage C');

-- Batch Tracking (18 items)
INSERT INTO batch_tracking (recipe_id, batch_number, batch_date, quantity, unit, status, started_at, completed_at, temperature, notes) VALUES
(1, 'SD-20260323-001', CURRENT_DATE, 10, 'loaves', 'proofing', NOW() - INTERVAL '3 hours', NULL, 78.0, 'Good oven spring expected'),
(1, 'SD-20260323-002', CURRENT_DATE, 10, 'loaves', 'baking', NOW() - INTERVAL '5 hours', NULL, 78.0, 'Second batch in oven'),
(2, 'BG-20260323-001', CURRENT_DATE, 32, 'baguettes', 'completed', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '4 hours', 75.0, 'Perfect crust color'),
(3, 'CR-20260323-001', CURRENT_DATE, 48, 'croissants', 'completed', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '5 hours', 72.0, 'Excellent lamination'),
(4, 'CN-20260323-001', CURRENT_DATE, 36, 'rolls', 'cooling', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '1 hour', 76.0, 'Ready for frosting'),
(5, 'MF-20260323-001', CURRENT_DATE, 24, 'muffins', 'mixing', NOW() - INTERVAL '30 minutes', NULL, NULL, 'Blueberry batter ready'),
(15, 'CK-20260322-001', CURRENT_DATE - 1, 72, 'cookies', 'completed', NOW() - INTERVAL '28 hours', NOW() - INTERVAL '26 hours', 74.0, 'Chocolate chip - stored in display'),
(6, 'CC-20260322-001', CURRENT_DATE - 1, 12, 'slices', 'completed', NOW() - INTERVAL '30 hours', NOW() - INTERVAL '20 hours', 325.0, 'Perfect set - no cracks'),
(8, 'MC-20260322-001', CURRENT_DATE - 1, 48, 'macarons', 'completed', NOW() - INTERVAL '26 hours', NOW() - INTERVAL '24 hours', 300.0, 'Raspberry and pistachio flavors'),
(9, 'FC-20260322-001', CURRENT_DATE - 1, 4, 'sheets', 'completed', NOW() - INTERVAL '25 hours', NOW() - INTERVAL '23 hours', 425.0, 'Rosemary and olive topped'),
(13, 'BR-20260322-001', CURRENT_DATE - 1, 4, 'loaves', 'completed', NOW() - INTERVAL '32 hours', NOW() - INTERVAL '28 hours', 350.0, 'Rich golden color'),
(1, 'SD-20260322-001', CURRENT_DATE - 1, 10, 'loaves', 'completed', NOW() - INTERVAL '30 hours', NOW() - INTERVAL '27 hours', 78.0, 'Daily sourdough batch'),
(2, 'BG-20260322-001', CURRENT_DATE - 1, 24, 'baguettes', 'completed', NOW() - INTERVAL '29 hours', NOW() - INTERVAL '27 hours', 75.0, 'Morning baguette run'),
(14, 'LT-20260321-001', CURRENT_DATE - 2, 8, 'tarts', 'completed', NOW() - INTERVAL '50 hours', NOW() - INTERVAL '46 hours', 325.0, 'Lemon tarts for cafe'),
(7, 'RV-20260321-001', CURRENT_DATE - 2, 16, 'slices', 'completed', NOW() - INTERVAL '52 hours', NOW() - INTERVAL '48 hours', 350.0, 'Two red velvet cakes'),
(12, 'GT-20260321-001', CURRENT_DATE - 2, 8, 'tarts', 'completed', NOW() - INTERVAL '48 hours', NOW() - INTERVAL '44 hours', 375.0, 'Chocolate ganache tarts'),
(10, 'DN-20260323-001', CURRENT_DATE, 24, 'pastries', 'proofing', NOW() - INTERVAL '2 hours', NULL, 76.0, 'Apple and cherry danish'),
(18, 'PZ-20260323-001', CURRENT_DATE, 32, 'pretzels', 'mixing', NOW() - INTERVAL '1 hour', NULL, NULL, 'Soft pretzels for afternoon');

-- Oven Schedules (18 items)
INSERT INTO oven_schedules (oven_number, recipe_id, batch_id, scheduled_date, start_time, end_time, temperature_f, status, notes) VALUES
(1, 1, 1, CURRENT_DATE, '05:00', '05:45', 450, 'completed', 'Sourdough batch 1'),
(1, 1, 2, CURRENT_DATE, '06:00', '06:45', 450, 'in_progress', 'Sourdough batch 2'),
(2, 2, 3, CURRENT_DATE, '05:00', '05:25', 475, 'completed', 'Morning baguettes'),
(2, 3, 4, CURRENT_DATE, '06:00', '06:18', 400, 'completed', 'Croissant batch'),
(3, 4, 5, CURRENT_DATE, '06:30', '06:52', 350, 'completed', 'Cinnamon rolls'),
(3, 5, 6, CURRENT_DATE, '08:00', '08:25', 375, 'scheduled', 'Blueberry muffins'),
(1, 15, NULL, CURRENT_DATE, '10:00', '10:12', 350, 'scheduled', 'Cookie batch 1'),
(1, 15, NULL, CURRENT_DATE, '10:30', '10:42', 350, 'scheduled', 'Cookie batch 2'),
(2, 10, 17, CURRENT_DATE, '09:00', '09:18', 400, 'scheduled', 'Danish pastries'),
(2, 18, 18, CURRENT_DATE, '11:00', '11:14', 425, 'scheduled', 'Soft pretzels'),
(3, 9, NULL, CURRENT_DATE, '09:30', '09:55', 425, 'scheduled', 'Focaccia'),
(1, 1, NULL, CURRENT_DATE + 1, '05:00', '05:45', 450, 'scheduled', 'Daily sourdough'),
(2, 2, NULL, CURRENT_DATE + 1, '05:00', '05:25', 475, 'scheduled', 'Daily baguettes'),
(3, 7, NULL, CURRENT_DATE + 1, '07:00', '07:30', 350, 'scheduled', 'Red velvet cakes - wedding'),
(1, 6, NULL, CURRENT_DATE + 1, '08:00', '09:00', 325, 'scheduled', 'Cheesecake - water bath'),
(2, 8, NULL, CURRENT_DATE + 1, '09:00', '09:14', 300, 'scheduled', 'Macaron batch'),
(3, 13, NULL, CURRENT_DATE + 1, '06:00', '06:35', 350, 'scheduled', 'Brioche loaves'),
(1, 17, NULL, CURRENT_DATE + 2, '09:00', '09:12', 350, 'scheduled', 'Opera cake sponge layers');

-- Wholesale Orders (16 items)
INSERT INTO wholesale_orders (customer_name, contact_email, contact_phone, order_date, delivery_date, items, total_amount, status, payment_status, notes) VALUES
('Riverside Cafe', 'orders@riversidecafe.com', '555-0101', CURRENT_DATE - 1, CURRENT_DATE, '10x Sourdough, 12x Baguette, 6x Focaccia', 185.00, 'in_progress', 'invoiced', 'Daily standing order - Mon-Sat'),
('The Brunch Spot', 'manager@brunchspot.com', '555-0102', CURRENT_DATE - 1, CURRENT_DATE, '24x Croissant, 12x Danish, 24x Muffin', 210.00, 'delivered', 'paid', 'Weekend brunch rush order'),
('Green Leaf Restaurant', 'chef@greenleaf.com', '555-0103', CURRENT_DATE - 2, CURRENT_DATE + 1, '8x Brioche, 6x Focaccia, 20x Dinner Rolls', 156.00, 'confirmed', 'unpaid', 'Special dinner event'),
('City Market Deli', 'orders@citymarketdeli.com', '555-0104', CURRENT_DATE, CURRENT_DATE + 1, '15x Sourdough, 10x Baguette', 120.00, 'pending', 'unpaid', 'New weekly order starting'),
('Sunset Hotel', 'catering@sunsethotel.com', '555-0105', CURRENT_DATE - 3, CURRENT_DATE, '48x Croissant, 36x Danish, 24x Muffin, 12x Scone', 420.00, 'delivered', 'paid', 'Conference breakfast'),
('Organic Bean Coffee', 'hello@organicbean.com', '555-0106', CURRENT_DATE - 1, CURRENT_DATE, '12x Scone, 24x Cookie, 12x Muffin', 145.00, 'delivered', 'invoiced', 'Daily coffee shop supply'),
('Harbor View Restaurant', 'kitchen@harborview.com', '555-0107', CURRENT_DATE, CURRENT_DATE + 2, '6x Cheesecake, 4x Chocolate Tart', 280.00, 'confirmed', 'deposit', 'Dessert menu restock'),
('Lakeside Inn', 'events@lakesideinn.com', '555-0108', CURRENT_DATE - 5, CURRENT_DATE + 3, '3x Wedding Cake (Red Velvet), 100x Macaron', 850.00, 'in_progress', 'deposit', 'Wedding reception - Smith/Jones'),
('Farm to Table Bistro', 'order@farmtable.com', '555-0109', CURRENT_DATE, CURRENT_DATE + 1, '8x Sourdough, 4x Focaccia', 72.00, 'pending', 'unpaid', 'Bi-weekly order'),
('Morning Glory Cafe', 'info@morningglory.com', '555-0110', CURRENT_DATE - 1, CURRENT_DATE, '36x Cinnamon Roll, 24x Muffin, 12x Scone', 198.00, 'delivered', 'paid', 'Morning pastry delivery'),
('Corporate Catering Co.', 'events@corpcatering.com', '555-0111', CURRENT_DATE - 2, CURRENT_DATE + 5, '200x Assorted Cookies, 100x Mini Muffin', 380.00, 'confirmed', 'paid', 'Corporate event next week'),
('The Artisan Table', 'chef@artisantable.com', '555-0112', CURRENT_DATE, CURRENT_DATE + 1, '4x Sourdough, 6x Baguette, 2x Brioche', 58.00, 'pending', 'unpaid', 'New restaurant partner'),
('Campus Bookstore Cafe', 'cafe@campusbooks.com', '555-0113', CURRENT_DATE - 1, CURRENT_DATE, '48x Cookie, 24x Muffin, 12x Banana Bread', 195.00, 'delivered', 'invoiced', 'University weekly supply'),
('Sweet Celebrations Events', 'plan@sweetcelebrations.com', '555-0114', CURRENT_DATE - 4, CURRENT_DATE + 7, '2x Opera Cake, 48x Macaron, 24x Mini Tart', 520.00, 'confirmed', 'deposit', 'Gala dinner desserts'),
('Mountain View Lodge', 'kitchen@mtviewlodge.com', '555-0115', CURRENT_DATE, CURRENT_DATE + 2, '12x Sourdough, 24x Croissant, 12x Danish', 198.00, 'confirmed', 'unpaid', 'Weekend lodge supply'),
('Fresh Start Juice Bar', 'hello@freshstartjuice.com', '555-0116', CURRENT_DATE - 1, CURRENT_DATE, '18x Muffin, 12x Scone', 92.00, 'delivered', 'paid', 'Health-focused selection');

-- Custom Cake Orders (16 items)
INSERT INTO custom_cake_orders (customer_name, customer_phone, customer_email, cake_size, cake_shape, cake_flavor, filling_flavor, frosting_type, design_description, color_scheme, inscription, delivery_date, delivery_time, delivery_address, price, deposit_paid, status, allergen_notes) VALUES
('Jennifer Smith', '555-1001', 'jen.smith@email.com', '10 inch', 'Round', 'Vanilla', 'Raspberry', 'Buttercream', 'Elegant wedding cake with cascading sugar flowers, 3 tiers', 'White, Blush Pink, Gold', 'Jennifer & Mark - Forever', CURRENT_DATE + 5, '14:00', '123 Wedding Venue Dr', 450.00, 225.00, 'in_progress', 'No nuts'),
('Michael Chen', '555-1002', 'mchen@email.com', '8 inch', 'Round', 'Chocolate', 'Peanut Butter', 'Ganache', 'Birthday cake with baseball theme, fondant baseball and glove', 'Red, White, Blue', 'Happy 30th Michael!', CURRENT_DATE + 2, '10:00', '456 Oak Ave', 125.00, 65.00, 'confirmed', NULL),
('Sarah Williams', '555-1003', 'swilliams@email.com', '12 inch', 'Sheet', 'Red Velvet', 'Cream Cheese', 'Cream Cheese', 'Graduation cake with university logo and cap decoration', 'Navy Blue, Gold', 'Congrats Graduate 2026!', CURRENT_DATE + 8, '11:00', '789 University Blvd', 175.00, 90.00, 'pending', NULL),
('David Park', '555-1004', 'dpark@email.com', '6 inch', 'Round', 'Lemon', 'Lemon Curd', 'Buttercream', 'Simple elegant cake with fresh flowers and gold leaf accents', 'Yellow, White, Gold', 'Happy Anniversary', CURRENT_DATE + 1, '15:00', '321 Rose St', 95.00, 95.00, 'ready', NULL),
('Emily Rodriguez', '555-1005', 'erodriguez@email.com', '10 inch', 'Square', 'Carrot', 'Cream Cheese', 'Cream Cheese', 'Rustic style with caramel drip, pecans, and carrot decorations', 'Orange, Brown, Cream', 'Welcome Baby Olivia!', CURRENT_DATE + 3, '13:00', '654 Maple Ln', 165.00, 85.00, 'in_progress', 'Nut allergy warning for guests'),
('Robert Kim', '555-1006', 'rkim@email.com', '14 inch', 'Round', 'Chocolate', 'Chocolate Mousse', 'Fondant', 'Superhero theme with fondant characters, 2 tiers', 'Red, Blue, Yellow', 'Happy 5th Birthday Ethan!', CURRENT_DATE + 4, '12:00', '987 Pine Ave', 225.00, 115.00, 'in_progress', 'Gluten-free option needed'),
('Lisa Thompson', '555-1007', 'lthompson@email.com', '8 inch', 'Round', 'Vanilla Bean', 'Strawberry', 'Buttercream', 'Floral garden theme with hand-piped flowers', 'Pastel Pink, Lavender, Green', 'Happy Mothers Day!', CURRENT_DATE + 10, '09:00', '147 Garden Way', 135.00, 70.00, 'pending', NULL),
('James Wilson', '555-1008', 'jwilson@email.com', '10 inch', 'Round', 'Marble', 'Bavarian Cream', 'Ganache', 'Elegant tuxedo-style cake for corporate event', 'Black, White, Silver', 'Wilson Corp 25 Years', CURRENT_DATE + 6, '16:00', '258 Business Park Dr', 195.00, 100.00, 'confirmed', NULL),
('Amanda Foster', '555-1009', 'afoster@email.com', '6 inch', 'Heart', 'Strawberry', 'Vanilla Mousse', 'Buttercream', 'Romantic heart cake with roses and pearl details', 'Red, White', 'Be Mine', CURRENT_DATE + 1, '17:00', '369 Love Ln', 85.00, 85.00, 'ready', NULL),
('Chris Martinez', '555-1010', 'cmartinez@email.com', '12 inch', 'Sheet', 'Vanilla', 'Chocolate', 'Buttercream', 'Football field design with team colors', 'Green, White, Yellow', 'Go Eagles! Super Bowl Party', CURRENT_DATE + 7, '11:00', '741 Stadium Rd', 155.00, 80.00, 'pending', 'Dairy-free frosting'),
('Nicole Brown', '555-1011', 'nbrown@email.com', '8 inch', 'Round', 'Coconut', 'Passion Fruit', 'Buttercream', 'Tropical theme with edible flowers and fruit', 'Coral, Turquoise, Green', 'Aloha 40!', CURRENT_DATE + 3, '14:00', '852 Beach Blvd', 145.00, 75.00, 'confirmed', 'Tree nut allergy'),
('Thomas Lee', '555-1012', 'tlee@email.com', '10 inch', 'Round', 'Chocolate', 'Salted Caramel', 'Buttercream', 'Drip cake with caramel, chocolates, and gold accents', 'Brown, Gold, Cream', NULL, CURRENT_DATE + 2, '13:00', '963 Elm St', 165.00, 85.00, 'in_progress', NULL),
('Rachel Green', '555-1013', 'rgreen@email.com', '12 inch', 'Round', 'Funfetti', 'Vanilla', 'Buttercream', 'Colorful sprinkle explosion cake, 2 tiers', 'Rainbow', 'Happy 7th Birthday Zoe!', CURRENT_DATE + 5, '15:00', '159 Rainbow Dr', 195.00, 100.00, 'confirmed', 'No artificial colors'),
('Mark Johnson', '555-1014', 'mjohnson@email.com', '8 inch', 'Round', 'Banana', 'Chocolate', 'Cream Cheese', 'Rustic banana cake with chocolate ganache drip', 'Brown, Cream, Yellow', 'Thank You!', CURRENT_DATE + 1, '10:00', '357 Walnut St', 110.00, 110.00, 'ready', NULL),
('Patricia Davis', '555-1015', 'pdavis@email.com', '14 inch', 'Tiered', 'Almond', 'Raspberry', 'Fondant', '3-tier elegant white wedding cake with sugar roses', 'White, Ivory, Sage Green', 'Patricia & Daniel', CURRENT_DATE + 14, '12:00', '468 Chapel Rd', 650.00, 325.00, 'pending', 'Contains almonds'),
('Kevin Wright', '555-1016', 'kwright@email.com', '10 inch', 'Round', 'Coffee', 'Tiramisu', 'Buttercream', 'Coffee-themed cake with fondant coffee beans and latte art design', 'Brown, Cream, White', 'Espresso Yourself!', CURRENT_DATE + 4, '11:00', '579 Java St', 155.00, 80.00, 'confirmed', NULL);

-- Allergen Tracking (20 items)
INSERT INTO allergen_tracking (recipe_id, allergen_name, severity, notes) VALUES
(1, 'Gluten', 'High', 'Contains wheat flour'),
(2, 'Gluten', 'High', 'Contains wheat flour'),
(3, 'Gluten', 'High', 'Contains wheat flour'),
(3, 'Dairy', 'High', 'Contains butter'),
(3, 'Eggs', 'Medium', 'Egg wash'),
(4, 'Gluten', 'High', 'Contains wheat flour'),
(4, 'Dairy', 'High', 'Contains butter and cream cheese'),
(4, 'Eggs', 'Medium', 'Contains eggs'),
(5, 'Gluten', 'High', 'Contains wheat flour'),
(5, 'Dairy', 'Medium', 'Contains butter and milk'),
(5, 'Eggs', 'Medium', 'Contains eggs'),
(6, 'Dairy', 'High', 'Primary ingredient is cream cheese'),
(6, 'Eggs', 'High', 'Contains multiple eggs'),
(6, 'Gluten', 'Medium', 'Graham cracker crust'),
(8, 'Tree Nuts', 'High', 'Almond flour base'),
(8, 'Eggs', 'High', 'Meringue-based'),
(12, 'Dairy', 'High', 'Contains heavy cream and butter'),
(12, 'Gluten', 'Medium', 'Butter pastry crust'),
(15, 'Gluten', 'High', 'Contains wheat flour'),
(15, 'Dairy', 'Medium', 'Contains butter');

-- Suppliers (16 items)
INSERT INTO suppliers (name, contact_person, email, phone, address, lead_time_days, payment_terms, category, rating, is_active) VALUES
('Midwest Mills', 'John Anderson', 'john@midwestmills.com', '555-2001', '100 Grain Rd, Kansas City, MO', 3, 'Net 30', 'Flour & Grains', 5, true),
('Valley Dairy Co.', 'Susan Miller', 'susan@valleydairy.com', '555-2002', '200 Farm Rd, Green Valley, WI', 1, 'Net 15', 'Dairy', 5, true),
('Happy Hen Farm', 'Tom Baker', 'tom@happyhen.com', '555-2003', '300 Henhouse Ln, Springfield, IL', 1, 'COD', 'Eggs', 4, true),
('Sweet Supplies Inc.', 'Mary Davis', 'mary@sweetsupplies.com', '555-2004', '400 Sugar Blvd, Miami, FL', 5, 'Net 30', 'Sugar & Sweeteners', 4, true),
('Cacao Direct', 'Pierre Laurent', 'pierre@cacaodirect.com', '555-2005', '500 Chocolate Ave, San Francisco, CA', 7, 'Net 45', 'Chocolate', 5, true),
('Spice Traders', 'Raj Patel', 'raj@spicetraders.com', '555-2006', '600 Spice Market Dr, New York, NY', 4, 'Net 30', 'Spices & Flavorings', 4, true),
('Bakers Essentials', 'Linda White', 'linda@bakersessentials.com', '555-2007', '700 Baker St, Portland, OR', 3, 'Net 30', 'Leavening & Basics', 4, true),
('Berry Good Farms', 'Mike Green', 'mike@berrygood.com', '555-2008', '800 Berry Patch Rd, Watsonville, CA', 2, 'COD', 'Fresh Fruit', 5, true),
('Nut House Supply', 'Karen Brown', 'karen@nuthouse.com', '555-2009', '900 Almond Way, Sacramento, CA', 3, 'Net 30', 'Nuts & Seeds', 4, true),
('Pacific Packaging', 'Steve Lee', 'steve@pacpackaging.com', '555-2010', '1000 Box Ct, Los Angeles, CA', 5, 'Net 30', 'Packaging', 3, true),
('Clean Pro Supplies', 'Amy Clark', 'amy@cleanpro.com', '555-2011', '1100 Clean St, Chicago, IL', 3, 'Net 15', 'Cleaning & Sanitation', 4, true),
('Golden Grain Organics', 'Robert Fields', 'robert@goldengrain.com', '555-2012', '1200 Organic Rd, Eugene, OR', 5, 'Net 30', 'Organic Flour', 4, true),
('Fresh Cream Co.', 'Diana Ross', 'diana@freshcream.com', '555-2013', '1300 Dairy Lane, Madison, WI', 2, 'Net 15', 'Specialty Dairy', 5, true),
('Tropical Fruits Direct', 'Carlos Reyes', 'carlos@tropicalfruits.com', '555-2014', '1400 Palm Dr, Honolulu, HI', 4, 'Net 30', 'Tropical Fruits', 3, true),
('Paper & Print Co.', 'Jim Taylor', 'jim@paperprint.com', '555-2015', '1500 Label Ln, Austin, TX', 7, 'Net 45', 'Labels & Printing', 4, true),
('Restaurant Depot', 'Nancy Adams', 'nancy@restdepot.com', '555-2016', '1600 Wholesale Blvd, Denver, CO', 1, 'COD', 'General Supplies', 3, true);

-- Waste Tracking (18 items)
INSERT INTO waste_tracking (item_name, category, quantity, unit, reason, cost_impact, waste_date, recorded_by, notes) VALUES
('Sourdough Bread', 'Overproduction', 3, 'loaves', 'overproduction', 10.50, CURRENT_DATE - 1, 'Carlos M.', 'Slow Monday sales - donated to food bank'),
('Croissants', 'Overproduction', 5, 'pieces', 'overproduction', 11.25, CURRENT_DATE - 1, 'Pierre L.', 'Made extra for catering that cancelled'),
('Heavy Cream', 'Spoilage', 2, 'liters', 'spoilage', 10.00, CURRENT_DATE - 2, 'Sarah K.', 'Past expiry date - missed rotation'),
('Blueberry Muffins', 'Overproduction', 4, 'muffins', 'overproduction', 4.80, CURRENT_DATE - 2, 'Tom R.', 'Afternoon leftovers'),
('Danish Pastry', 'Quality', 6, 'pieces', 'quality_issue', 15.00, CURRENT_DATE - 3, 'Pierre L.', 'Lamination failed - butter too warm'),
('Baguettes', 'Overproduction', 4, 'baguettes', 'overproduction', 7.00, CURRENT_DATE - 3, 'Maria S.', 'End of day surplus'),
('Eggs', 'Spoilage', 1, 'dozen', 'spoilage', 4.50, CURRENT_DATE - 4, 'Lisa W.', 'Cracked during delivery'),
('Chocolate Ganache', 'Quality', 1, 'kg', 'quality_issue', 12.00, CURRENT_DATE - 4, 'Pierre L.', 'Seized during tempering'),
('Banana Bread', 'Overproduction', 1, 'loaf', 'overproduction', 2.00, CURRENT_DATE - 5, 'Tom R.', 'Day-old, donated'),
('Cookie Dough', 'Spoilage', 2, 'kg', 'spoilage', 5.60, CURRENT_DATE - 5, 'Lisa W.', 'Left out overnight accidentally'),
('Buttercream', 'Quality', 1.5, 'kg', 'quality_issue', 4.50, CURRENT_DATE - 6, 'Sarah K.', 'Curdled - temperature issue'),
('Focaccia', 'Overproduction', 2, 'sheets', 'overproduction', 8.00, CURRENT_DATE - 6, 'Carlos M.', 'Restaurant cancelled order'),
('Fresh Strawberries', 'Spoilage', 1.5, 'kg', 'spoilage', 9.00, CURRENT_DATE - 7, 'Tom R.', 'Mold found in container'),
('Cinnamon Rolls', 'Overproduction', 6, 'rolls', 'overproduction', 10.80, CURRENT_DATE, 'Sarah K.', 'End of day surplus'),
('Pretzel Dough', 'Quality', 2, 'kg', 'quality_issue', 3.50, CURRENT_DATE, 'Tom R.', 'Over-proofed batch'),
('Sourdough Starter', 'Maintenance', 1, 'kg', 'discard', 0.00, CURRENT_DATE, 'Carlos M.', 'Regular starter maintenance discard'),
('Puff Pastry Scraps', 'Trimming', 1.5, 'kg', 'trimming', 3.00, CURRENT_DATE - 1, 'Pierre L.', 'Edge trimmings from danish production'),
('Cake Leveling Scraps', 'Trimming', 0.5, 'kg', 'trimming', 1.50, CURRENT_DATE - 2, 'Sarah K.', 'Red velvet cake leveling - used for cake pops');

-- Temperature Logs (20 items)
INSERT INTO temperature_logs (equipment_name, location, temperature_f, acceptable_range, is_in_range, recorded_at, recorded_by, corrective_action) VALUES
('Walk-in Cooler #1', 'Main Kitchen', 36.5, '34-40°F', true, NOW() - INTERVAL '1 hour', 'Carlos M.', NULL),
('Walk-in Cooler #2', 'Prep Area', 37.0, '34-40°F', true, NOW() - INTERVAL '1 hour', 'Carlos M.', NULL),
('Walk-in Freezer', 'Storage', -5.0, '-10 to 0°F', true, NOW() - INTERVAL '1 hour', 'Carlos M.', NULL),
('Reach-in Fridge #1', 'Display Area', 38.0, '34-40°F', true, NOW() - INTERVAL '1 hour', 'Lisa W.', NULL),
('Reach-in Fridge #2', 'Pastry Station', 39.5, '34-40°F', true, NOW() - INTERVAL '1 hour', 'Pierre L.', NULL),
('Deck Oven #1', 'Bake Area', 450.0, '200-500°F', true, NOW() - INTERVAL '2 hours', 'Carlos M.', NULL),
('Deck Oven #2', 'Bake Area', 475.0, '200-500°F', true, NOW() - INTERVAL '2 hours', 'Maria S.', NULL),
('Convection Oven #3', 'Pastry Area', 350.0, '200-500°F', true, NOW() - INTERVAL '2 hours', 'Sarah K.', NULL),
('Proofer Cabinet', 'Bread Station', 78.0, '75-85°F', true, NOW() - INTERVAL '3 hours', 'Carlos M.', NULL),
('Chocolate Temperer', 'Pastry Station', 88.5, '86-90°F', true, NOW() - INTERVAL '3 hours', 'Pierre L.', NULL),
('Walk-in Cooler #1', 'Main Kitchen', 42.0, '34-40°F', false, NOW() - INTERVAL '6 hours', 'Tom R.', 'Adjusted thermostat, door seal checked. Temp returned to normal in 30min.'),
('Walk-in Cooler #2', 'Prep Area', 37.5, '34-40°F', true, NOW() - INTERVAL '6 hours', 'Tom R.', NULL),
('Walk-in Freezer', 'Storage', -4.0, '-10 to 0°F', true, NOW() - INTERVAL '6 hours', 'Tom R.', NULL),
('Dish Sanitizer', 'Wash Area', 180.0, '171+°F', true, NOW() - INTERVAL '4 hours', 'Lisa W.', NULL),
('Hot Holding Cabinet', 'Display', 145.0, '140+°F', true, NOW() - INTERVAL '3 hours', 'Lisa W.', NULL),
('Fermentation Room', 'Bread Area', 68.0, '65-75°F', true, NOW() - INTERVAL '2 hours', 'Carlos M.', NULL),
('Blast Chiller', 'Prep Area', 35.0, '32-38°F', true, NOW() - INTERVAL '5 hours', 'Maria S.', NULL),
('Reach-in Fridge #1', 'Display Area', 37.5, '34-40°F', true, NOW() - INTERVAL '6 hours', 'Lisa W.', NULL),
('Deck Oven #1', 'Bake Area', 425.0, '200-500°F', true, NOW() - INTERVAL '8 hours', 'Carlos M.', NULL),
('Walk-in Cooler #1', 'Main Kitchen', 37.0, '34-40°F', true, NOW() - INTERVAL '12 hours', 'Night Shift', NULL);

-- Staff Schedules (18 items)
INSERT INTO staff_schedules (staff_name, role, shift_date, start_time, end_time, station, status, notes) VALUES
('Carlos Martinez', 'Head Baker', CURRENT_DATE, '04:00', '12:00', 'Bread Station', 'active', 'Lead morning bread production'),
('Maria Santos', 'Baker', CURRENT_DATE, '04:00', '12:00', 'Bread Station', 'active', 'Baguette and roll production'),
('Pierre Laurent', 'Pastry Chef', CURRENT_DATE, '05:00', '13:00', 'Pastry Station', 'active', 'Croissant and danish production'),
('Sarah Kim', 'Baker', CURRENT_DATE, '05:00', '13:00', 'Cake Station', 'active', 'Cake and frosting production'),
('Tom Richardson', 'Baker', CURRENT_DATE, '06:00', '14:00', 'Mixing Station', 'active', 'Muffin and quick bread production'),
('Lisa Wong', 'Front Counter', CURRENT_DATE, '07:00', '15:00', 'Retail Counter', 'active', 'Morning retail shift'),
('David Park', 'Front Counter', CURRENT_DATE, '11:00', '19:00', 'Retail Counter', 'scheduled', 'Afternoon retail shift'),
('Amy Chen', 'Decorator', CURRENT_DATE, '08:00', '16:00', 'Decoration Station', 'active', 'Custom cake decorating'),
('Mike Green', 'Delivery Driver', CURRENT_DATE, '06:00', '14:00', 'Delivery', 'active', 'Morning wholesale deliveries'),
('Carlos Martinez', 'Head Baker', CURRENT_DATE + 1, '04:00', '12:00', 'Bread Station', 'scheduled', 'Daily bread production'),
('Pierre Laurent', 'Pastry Chef', CURRENT_DATE + 1, '05:00', '13:00', 'Pastry Station', 'scheduled', 'Macaron day'),
('Sarah Kim', 'Baker', CURRENT_DATE + 1, '05:00', '13:00', 'Cake Station', 'scheduled', 'Wedding cake prep'),
('Tom Richardson', 'Baker', CURRENT_DATE + 1, '06:00', '14:00', 'Mixing Station', 'scheduled', 'Banana bread and muffins'),
('Lisa Wong', 'Front Counter', CURRENT_DATE + 1, '07:00', '15:00', 'Retail Counter', 'scheduled', 'Morning retail'),
('Maria Santos', 'Baker', CURRENT_DATE + 1, '04:00', '12:00', 'Bread Station', 'scheduled', 'Focaccia production'),
('Amy Chen', 'Decorator', CURRENT_DATE + 1, '08:00', '16:00', 'Decoration Station', 'scheduled', 'Wedding cake decoration'),
('David Park', 'Front Counter', CURRENT_DATE + 1, '11:00', '19:00', 'Retail Counter', 'scheduled', 'Afternoon retail'),
('Mike Green', 'Delivery Driver', CURRENT_DATE + 1, '06:00', '14:00', 'Delivery', 'scheduled', 'Wholesale route');

-- Equipment Maintenance (16 items)
INSERT INTO equipment_maintenance (equipment_name, equipment_type, last_maintenance, next_maintenance, maintenance_type, performed_by, status, cost, notes) VALUES
('Deck Oven #1', 'Oven', CURRENT_DATE - 30, CURRENT_DATE + 60, 'Preventive', 'OvenTech Services', 'operational', 350.00, 'Heating elements inspected, thermostat calibrated'),
('Deck Oven #2', 'Oven', CURRENT_DATE - 30, CURRENT_DATE + 60, 'Preventive', 'OvenTech Services', 'operational', 350.00, 'Steam injection system serviced'),
('Convection Oven #3', 'Oven', CURRENT_DATE - 15, CURRENT_DATE + 75, 'Preventive', 'OvenTech Services', 'operational', 250.00, 'Fan motor lubricated, filters cleaned'),
('Spiral Mixer - 60qt', 'Mixer', CURRENT_DATE - 7, CURRENT_DATE + 83, 'Preventive', 'In-house', 'operational', 0.00, 'Bowl pin checked, hook alignment verified'),
('Planetary Mixer - 20qt', 'Mixer', CURRENT_DATE - 7, CURRENT_DATE + 83, 'Preventive', 'In-house', 'operational', 0.00, 'Whisk and paddle attachments inspected'),
('Sheeter/Laminator', 'Laminating', CURRENT_DATE - 14, CURRENT_DATE + 76, 'Preventive', 'BakeryEquip Co.', 'operational', 200.00, 'Rollers cleaned and calibrated'),
('Walk-in Cooler #1', 'Refrigeration', CURRENT_DATE - 5, CURRENT_DATE + 25, 'Corrective', 'CoolTech HVAC', 'needs_attention', 425.00, 'Compressor making noise - scheduled repair'),
('Walk-in Cooler #2', 'Refrigeration', CURRENT_DATE - 60, CURRENT_DATE + 30, 'Preventive', 'CoolTech HVAC', 'operational', 175.00, 'Coils cleaned, refrigerant topped'),
('Walk-in Freezer', 'Refrigeration', CURRENT_DATE - 60, CURRENT_DATE + 30, 'Preventive', 'CoolTech HVAC', 'operational', 175.00, 'Door gaskets replaced'),
('Proofer Cabinet', 'Proofing', CURRENT_DATE - 20, CURRENT_DATE + 70, 'Preventive', 'In-house', 'operational', 0.00, 'Humidity system flushed and calibrated'),
('Bread Slicer', 'Slicer', CURRENT_DATE - 3, CURRENT_DATE + 27, 'Preventive', 'In-house', 'operational', 25.00, 'Blades sharpened and guard checked'),
('Dish Sanitizer', 'Sanitation', CURRENT_DATE - 45, CURRENT_DATE + 45, 'Preventive', 'EcoClean Services', 'operational', 150.00, 'Chemical dispensers recalibrated'),
('Dough Divider', 'Dividing', CURRENT_DATE - 10, CURRENT_DATE + 80, 'Preventive', 'In-house', 'operational', 0.00, 'Oil changed, cutting plates cleaned'),
('Chocolate Temperer', 'Tempering', CURRENT_DATE - 60, CURRENT_DATE - 10, 'Preventive', 'BakeryEquip Co.', 'overdue', 0.00, 'OVERDUE - temperature control unit needs calibration'),
('Blast Chiller', 'Refrigeration', CURRENT_DATE - 30, CURRENT_DATE + 60, 'Preventive', 'CoolTech HVAC', 'operational', 200.00, 'Compressor and fan serviced'),
('Delivery Van #1', 'Vehicle', CURRENT_DATE - 20, CURRENT_DATE + 10, 'Preventive', 'AutoCare Shop', 'operational', 180.00, 'Oil change, tire rotation, refrigeration unit checked');

-- Daily Reports (15 items)
INSERT INTO daily_reports (report_date, total_items_produced, total_revenue, total_waste_cost, total_orders, custom_orders, wholesale_orders, staff_count, highlights, issues) VALUES
(CURRENT_DATE, 285, 2450.00, 14.30, 42, 3, 6, 9, 'Strong morning sales. Wedding cake consultation completed.', 'Walk-in cooler #1 temp spike - resolved'),
(CURRENT_DATE - 1, 310, 2680.00, 21.75, 48, 2, 7, 9, 'Record croissant sales. New wholesale client signed.', 'Danish lamination issues - butter too warm'),
(CURRENT_DATE - 2, 245, 2100.00, 19.00, 35, 4, 5, 8, 'Slow Monday. Used surplus for food bank donation.', 'Short staffed - Tom called in sick'),
(CURRENT_DATE - 3, 380, 3200.00, 22.00, 55, 3, 8, 10, 'Weekend rush - all products sold out by 2pm', NULL),
(CURRENT_DATE - 4, 350, 2950.00, 9.50, 50, 5, 7, 10, 'Saturday farmers market success. 3 new cake orders taken.', 'Eggs cracked during delivery'),
(CURRENT_DATE - 5, 290, 2500.00, 7.60, 40, 2, 6, 9, 'Steady Friday sales. Prepped weekend doughs.', NULL),
(CURRENT_DATE - 6, 275, 2350.00, 12.50, 38, 1, 5, 8, 'Normal Thursday. Buttercream batch failed - remade.', 'Buttercream curdled - staff retrained on temperature'),
(CURRENT_DATE - 7, 260, 2200.00, 9.00, 36, 2, 5, 8, 'Quiet Wednesday. Deep cleaning completed.', NULL),
(CURRENT_DATE - 8, 280, 2400.00, 8.50, 39, 3, 6, 9, 'Tuesday production on track. New scone recipe tested.', NULL),
(CURRENT_DATE - 9, 295, 2550.00, 11.00, 41, 2, 7, 9, 'Good Monday start. Wholesale orders increasing.', NULL),
(CURRENT_DATE - 10, 370, 3100.00, 15.00, 52, 4, 8, 10, 'Busy Sunday brunch rush. All ovens at capacity.', 'Oven #2 delayed preheat - thermostat issue'),
(CURRENT_DATE - 11, 360, 2900.00, 12.00, 49, 3, 7, 10, 'Saturday market + retail strong performance', NULL),
(CURRENT_DATE - 12, 285, 2450.00, 8.00, 38, 2, 6, 9, 'Friday prep day. Weekend doughs started.', NULL),
(CURRENT_DATE - 13, 270, 2300.00, 7.50, 37, 1, 5, 8, 'Standard Thursday operations.', NULL),
(CURRENT_DATE - 14, 265, 2250.00, 10.00, 35, 2, 5, 8, 'Mid-week steady. New supplier evaluation.', 'Flour delivery delayed by 1 day');

-- Delivery Routes (15 items)
INSERT INTO delivery_routes (route_name, driver_name, vehicle, delivery_date, start_time, estimated_end_time, stops, total_distance_miles, status, notes) VALUES
('Downtown Morning Route', 'Mike Green', 'Van #1', CURRENT_DATE, '06:30', '09:30', 'Riverside Cafe, Organic Bean Coffee, Morning Glory Cafe, The Brunch Spot', 18.5, 'in_progress', 'Regular daily route'),
('University Area Route', 'Mike Green', 'Van #1', CURRENT_DATE, '10:00', '11:30', 'Campus Bookstore Cafe, Fresh Start Juice Bar', 8.2, 'scheduled', 'Late morning delivery'),
('Hotel & Events Route', 'Jake Torres', 'Van #2', CURRENT_DATE, '07:00', '10:00', 'Sunset Hotel, Lakeside Inn, Harbor View Restaurant', 25.0, 'completed', 'Special event deliveries'),
('Restaurant Row Route', 'Mike Green', 'Van #1', CURRENT_DATE + 1, '06:30', '09:00', 'Riverside Cafe, Green Leaf Restaurant, The Artisan Table', 15.0, 'scheduled', 'Daily + new restaurant'),
('Custom Cake Delivery', 'Jake Torres', 'Van #2', CURRENT_DATE + 1, '09:00', '11:00', 'David Park (321 Rose St), Amanda Foster (369 Love Ln), Mark Johnson (357 Walnut St)', 12.5, 'scheduled', 'Three cake deliveries - handle with care'),
('Downtown Morning Route', 'Mike Green', 'Van #1', CURRENT_DATE + 2, '06:30', '09:30', 'Riverside Cafe, Organic Bean Coffee, Morning Glory Cafe', 14.0, 'planned', 'Regular route - minus Brunch Spot'),
('Wholesale Mega Route', 'Mike Green', 'Van #1', CURRENT_DATE + 2, '10:00', '14:00', 'Mountain View Lodge, Farm to Table Bistro, City Market Deli, Harbor View Restaurant', 42.0, 'planned', 'Large delivery day'),
('Cake Delivery - Smith Wedding', 'Jake Torres', 'Van #2', CURRENT_DATE + 5, '11:00', '12:30', 'Jennifer Smith (123 Wedding Venue Dr)', 15.0, 'planned', '3-tier wedding cake - extra careful'),
('Farmers Market Setup', 'Mike Green', 'Van #1', CURRENT_DATE + 4, '05:00', '06:00', 'Greenville Farmers Market - Booth 14', 5.5, 'planned', 'Saturday market - load up Friday night'),
('Corporate Event Delivery', 'Jake Torres', 'Van #2', CURRENT_DATE + 5, '08:00', '09:30', 'Corporate Catering Co. (Business District)', 10.0, 'planned', '200 cookies + 100 mini muffins'),
('Downtown Morning Route', 'Mike Green', 'Van #1', CURRENT_DATE + 3, '06:30', '09:30', 'Riverside Cafe, Organic Bean Coffee, Morning Glory Cafe, The Brunch Spot', 18.5, 'planned', 'Regular daily route'),
('Birthday Cake Rush', 'Jake Torres', 'Van #2', CURRENT_DATE + 2, '09:00', '13:00', 'Michael Chen (456 Oak Ave), Thomas Lee (963 Elm St)', 16.0, 'planned', 'Two birthday cakes'),
('Evening Restaurant Route', 'Mike Green', 'Van #1', CURRENT_DATE + 2, '15:00', '17:00', 'Green Leaf Restaurant, Harbor View Restaurant', 12.0, 'planned', 'Dinner bread delivery'),
('Gala Dessert Delivery', 'Jake Torres', 'Van #2', CURRENT_DATE + 7, '14:00', '16:00', 'Sweet Celebrations Events (Grand Ballroom)', 20.0, 'planned', 'Opera cakes, macarons, mini tarts - fragile'),
('Weekend Lodge Supply', 'Mike Green', 'Van #1', CURRENT_DATE + 2, '06:00', '08:00', 'Mountain View Lodge', 22.0, 'planned', 'Croissants, danish, sourdough');
