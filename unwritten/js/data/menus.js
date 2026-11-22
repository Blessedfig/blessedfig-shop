"use strict";
// Real menus, copied as plain facts (each dish's name and price, nothing else) from the place's own published menu.
// Spelling is tidied; dishes named for a trademark are given a plain name. Prices change: each menu says when it was read.
// [id, name, price in cents]. Christian (Nov 13): "copy their new menu and offer it for money, later on those will give temp buffs".
const MENUS = {};
// Dixie Lunch, 716 Fifth Ave: the menu on its online ordering page (Toast), read Nov 13-14, 2026, after the 2026 change of owners.
// Sections the page did not show with prices (appetizers, wings, soup/salad/chili, melts, the Friday fish fry) are left out.
MENUS.dixie = {
  'Morning classics': [['dx_earlybird', 'The Early Bird', 1200], ['dx_halfstack', 'Half Stack (pancakes)', 700], ['dx_combostack', 'Combo Half Stack', 1100], ['dx_texastoast', 'Texas French Toast', 700],
    ['dx_combotoast', 'Combo Texas French Toast', 1100], ['dx_oatmeal', 'Oatmeal', 600], ['dx_biscuitbarn', 'Biscuit Barn', 1100], ['dx_steaksunrise', 'Steak & Sunrise', 1600],
    ['dx_cfs_am', 'Country Fried Steak', 1400], ['dx_benedict', 'Eggs Benedict', 1400], ['dx_chopsteak', 'Chopped Steak', 1300], ['dx_polish2', 'Polish Sausage & 2 Eggs', 1400], ['dx_julian', 'Julian Benedict', 1400],
    ['dx_hammy', 'The Hammy', 1300], ['dx_meatmarket', 'Meat Market', 1400]],
  'Three-egg omelettes': [['dx_omhc', 'Ham & Cheese Omelette', 1100], ['dx_omdenver', 'Denver Omelette', 1200], ['dx_ommeat', 'Meat Lover\'s Omelette', 1300], ['dx_omspin', 'Spinach Mushroom Omelette', 1200],
    ['dx_omveg', 'Veggie Garden Omelette', 1300], ['dx_omwest', 'Western Omelette', 1200], ['dx_omcheese', 'Cheese Omelette', 900]],
  'Breakfast sandwiches & sides': [['dx_eggsand', 'Dixie\'s Egg Sandwich', 1200], ['dx_burrito', 'Breakfast Burrito', 1300], ['dx_monte', 'Monte Cristo', 1400],
    ['dx_hash', 'Side of Hash Browns', 400], ['dx_pancake', 'Side Pancake', 400], ['dx_frtoast', 'Side French Toast', 400], ['dx_bacon', 'Side of Bacon', 400], ['dx_links', 'Side of Sausage Links', 400],
    ['dx_patties', 'Side of Sausage Patties', 400], ['dx_ham', 'Side of Ham', 400], ['dx_fruit', 'Side of Fruit', 400], ['dx_cbhash', 'Side of Corned Beef Hash', 400], ['dx_eggs2', 'Two Eggs', 200],
    ['dx_toast', 'Toast', 200], ['dx_gravy', 'Country Gravy', 200], ['dx_holl', 'Hollandaise', 200]],
  'Diner classics': [['dx_broast14', 'Broasted Chicken (quarter)', 1300], ['dx_broast12', 'Broasted Chicken (half)', 1700], ['dx_baked14', 'Baked Chicken (quarter)', 1300], ['dx_baked12', 'Baked Chicken (half)', 1300],
    ['dx_meatloaf', 'Meatloaf', 1400], ['dx_turkeydin', 'Roast Turkey Dinner', 1400], ['dx_cfs', 'Country Fried Steak', 1400], ['dx_liver', 'Liver & Onions', 1500], ['dx_cornbeef', 'Corned Beef', 1500]],
  'Sandwiches & wraps': [['dx_chicksand', 'Chicken Sandwich', 1200], ['dx_club', 'BLT Turkey Club', 1300], ['dx_blt', 'BLT Classic', 1100], ['dx_steaksand', 'Steak Sandwich', 1600],
    ['dx_walleye', 'Walleye Sandwich', 1400], ['dx_hothamb', 'Hot Hamburger', 1300], ['dx_hotturkey', 'Hot Turkey Sandwich', 1300], ['dx_mlsand', 'Meatloaf Sandwich', 1300],
    ['dx_caesarwrap', 'Chicken Caesar Wrap', 1400], ['dx_buffwrap', 'Buffalo Chicken Wrap', 1400], ['dx_tbwrap', 'Turkey Bacon Wrap', 1400], ['dx_cbrwrap', 'Chicken Bacon Ranch Wrap', 1400]],
  'Burgers': [['dx_plainjane', 'Plain Jane', 1200], ['dx_deluxe', 'Dixie Deluxe', 1400], ['dx_bluesmoke', 'Blue Smoke', 1400], ['dx_mushburger', 'Mushroom Burger', 1300],
    ['dx_wrangler', 'BBQ Wrangler', 1400], ['dx_bfburger', 'Breakfast Burger', 1400], ['dx_veggieburger', 'Veggie Burger', 1200], ['dx_hpbacon', 'Hot Pepper Bacon Burger', 1400]],
  'Pasta & stir fry': [['dx_spaghetti', 'Spaghetti', 1300], ['dx_alfredo', 'Alfredo', 1200], ['dx_sfchicken', 'Chicken Stir Fry', 1400], ['dx_sfshrimp', 'Shrimp Stir Fry', 1500],
    ['dx_sfsteak', 'Steak Stir Fry', 1500], ['dx_sfveg', 'Veggie Stir Fry', 1200]],
  'Seniors & kids': [['dx_srbg', 'Senior Biscuits & Gravy', 700], ['dx_srhc', 'Senior Ham & Cheese Omelette', 800], ['dx_srsc', 'Senior Sausage & Cheese Omelette', 800], ['dx_srbc', 'Senior Bacon & Cheese Omelette', 800],
    ['dx_srcheese', 'Senior Cheese Omelette', 700], ['dx_srbreak', 'Senior Breakfast', 800], ['dx_srspag', 'Senior Spaghetti', 1100], ['dx_srbroast', 'Senior Broasted Chicken', 1200], ['dx_srbaked', 'Senior Baked Chicken', 1200],
    ['dx_kpancake', 'Kids Pancakes', 800], ['dx_kfrtoast', 'Kids French Toast', 800], ['dx_kbreak', 'Kids Breakfast Plate', 800], ['dx_ktenders', 'Kids Chicken Tenders', 800],
    ['dx_kburger', 'Kids Cheeseburger', 800], ['dx_kgrilled', 'Kids Grilled Cheese', 800], ['dx_kspag', 'Kids Spaghetti', 800], ['dx_kmac', 'Kids Mac & Cheese', 800]],
  'Features & specials': [['dx_avotoast', 'Avocado Toast', 1000], ['dx_rasppan', 'Raspberry Cheesecake Pancakes', 1300], ['dx_cwbenny', 'Chicken & Waffle Benedict', 1400], ['dx_polskillet', 'Polish Skillet', 1300],
    ['dx_parfait', 'Fruit and Yogurt Parfait', 600], ['dx_philly', 'Philly Cheesesteak', 1300], ['dx_cranchick', 'Cranberry Almond Chicken Salad', 1100], ['dx_avodilla', 'Chicken & Bacon Avocado Quesadilla', 1300],
    ['dx_liege', 'Liège Waffle Trio', 1300], ['dx_rangoon', 'Crab Rangoons', 900], ['dx_mozz', 'Mozzarella Planks', 1000], ['dx_peachpud', 'Peach Bread Pudding', 800],
    ['dx_morelom', 'Morel Omelet', 1500], ['dx_morelburg', 'Morel Burger', 1500], ['dx_openroast', 'Open-Face Roast Beef Sandwich', 1400], ['dx_cabbage', 'Cabbage Rolls', 1400], ['dx_polmac', 'Polish Mac and Cheese', 1300]],
  'Pie & dessert': [['dx_pie', 'Slice of Pie', 475], ['dx_pieala', 'Pie à la Mode', 675], ['dx_kolache', 'Kolache', 250], ['dx_cake', 'Cake or Torte', 425], ['dx_cookie', 'Jumbo Cookie', 225],
    ['dx_rolls', 'Sunday Rolls', 300], ['dx_icecream', 'Dish of Ice Cream', 350], ['dx_wholepie', 'Whole Pie', 1850], ['dx_kolache12', 'A Dozen Kolaches', 2500]],
  'Drinks & shakes': [['dx_coffee', 'Coffee', 300], ['dx_decaf', 'Decaf Coffee', 300], ['dx_tea', 'Hot Tea', 300], ['dx_cocoa', 'Hot Chocolate', 350], ['dx_milk', 'Milk', 250], ['dx_chocmilk', 'Chocolate Milk', 300],
    ['dx_capp', 'Cappuccino', 400], ['dx_fvcapp', 'French Vanilla Cappuccino', 400], ['dx_toffee', 'English Toffee Cappuccino', 400], ['dx_icedtea', 'Unsweetened Iced Tea', 350], ['dx_lemonade', 'Lemonade', 350],
    ['dx_halfhalf', 'Half Iced Tea, Half Lemonade', 400], ['dx_oj', 'Orange Juice', 400], ['dx_apple', 'Apple Juice', 400], ['dx_cran', 'Cranberry Juice', 400], ['dx_tomato', 'Tomato Juice', 400],
    ['dx_vshake', 'Vanilla Shake', 650], ['dx_cshake', 'Chocolate Shake', 650], ['dx_sshake', 'Strawberry Shake', 650], ['dx_bshake', 'Blueberry Shake', 650], ['dx_ccshake', 'Cookies & Cream Shake', 700], ['dx_pbbshake', 'Peanut Butter Banana Shake', 700]],
};
MENUS.dixieNote = 'Prices as listed on Dixie Lunch\'s online menu, Nov 2026. Specials change.';
