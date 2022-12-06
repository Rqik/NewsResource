CREATE TABLE users (
	user_id serial PRIMARY KEY,
	first_name varchar(128),
	last_name varchar(128),
	avatar varchar(128),
	login varchar(128) NOT NULL,
	password text NOT NULL,
	create_at date,
	admin boolean
);

CREATE TABLE authors (
	authors_id serial PRIMARY KEY,
	fk_user_id  varchar(128),
	descripton varchar(512)
);

CREATE TABLE categories (
	categorie_id serial PRIMARY KEY,
	descripton varchar(512)
);

CREATE TABLE tags (
	tag_id serial PRIMARY KEY,
	title varchar(512)
);

CREATE TABLE news (
	news_id serial PRIMARY KEY,
	title varchar(512),
	create_at varchar(512),
	fk_author_id varchar(512),
	fk_category_id varchar(512),
	tags array,
	body text,
	main_img text,
	other_imgs array
	title varchar(512)
);

CREATE TABLE news_comments (
	comment_id serial PRIMARY KEY,
	title varchar(512),
	create_at varchar(512),
	fk_user_id varchar(512),
	body text,
);

CREATE TABLE drafts (
	draft_id serial PRIMARY KEY,
	create_at date,
	updated_at date,
	fk_user_id varchar(512),
	body text,
);
