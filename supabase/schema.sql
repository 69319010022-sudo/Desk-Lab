CREATE TABLE `users` (
  `id` uuid PRIMARY KEY,
  `name` varchar(255),
  `email` varchar(255) UNIQUE NOT NULL,
  `phone` varchar(255),
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `addresses` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` uuid NOT NULL,
  `label` varchar(255) COMMENT 'เช่น บ้าน, ที่ทำงาน',
  `recipient_name` varchar(255),
  `phone` varchar(255),
  `address_line` varchar(255),
  `subdistrict` varchar(255),
  `district` varchar(255),
  `province` varchar(255),
  `postal_code` varchar(255),
  `is_default` boolean DEFAULT false
);

CREATE TABLE `categories` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) UNIQUE,
  `description` text
);

CREATE TABLE `products` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `category_id` integer,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) UNIQUE,
  `description` text,
  `price` decimal,
  `stock_quantity` integer DEFAULT 0,
  `sku` varchar(255) UNIQUE,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `product_images` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `product_id` integer NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `sort_order` integer DEFAULT 0
);

CREATE TABLE `carts` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` uuid NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp
);

CREATE TABLE `cart_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `cart_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL DEFAULT 1
);

CREATE TABLE `orders` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` uuid NOT NULL,
  `address_id` integer NOT NULL,
  `order_status` varchar(255) COMMENT 'pending, paid, shipped, completed, cancelled',
  `total_amount` decimal,
  `created_at` timestamp DEFAULT (now()),
  `cancel_reason` text
);

CREATE TABLE `order_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL,
  `unit_price` decimal NOT NULL
);

CREATE TABLE `payments` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `payment_method` varchar(255) COMMENT 'promptpay, credit_card, cod',
  `payment_status` varchar(255) COMMENT 'pending, success, failed',
  `amount` decimal,
  `transaction_ref` varchar(255),
  `paid_at` timestamp
);

CREATE TABLE `reviews` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `product_id` integer NOT NULL,
  `user_id` uuid NOT NULL,
  `rating` integer COMMENT '1-5',
  `comment` text,
  `created_at` timestamp DEFAULT (now())
);

ALTER TABLE `users` COMMENT = 'ผูกกับ Supabase Auth (auth.users) ผ่าน id เดียวกัน';

ALTER TABLE `addresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `product_images` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `carts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `cart_items` ADD FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`);

ALTER TABLE `cart_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `payments` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
