DROP TABLE IF EXISTS `category`, `goods`;

CREATE TABLE `category` (
	`id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL UNIQUE,
    `description` text,
    `image` varchar(500) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
);

CREATE TABLE `goods` (
	`id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL UNIQUE,
    `description` text,
    `cost` int NOT NULL,
    `image` varchar(500) NOT NULL UNIQUE,
    `category_id` int NOT NULL,
    PRIMARY KEY (`id`)
)