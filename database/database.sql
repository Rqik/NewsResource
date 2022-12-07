DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS news_comments;
DROP TABLE IF EXISTS drafts;

CREATE TABLE users (
	user_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	first_name varchar(128) NOT NULL,
	last_name varchar(128),
	avatar text,
	login varchar(128) NOT NULL,
	password text NOT NULL,
	create_at timestamp with time zone DEFAULT NOW(),
	admin boolean NOT NULL DEFAULT false,

	CONSTRAINT PK_users_user_id PRIMARY KEY(user_id)
);

CREATE TABLE authors (
	author_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	fk_user_id int,
	descripton varchar(512),

	CONSTRAINT PK_authors_author_id PRIMARY KEY(author_id),
	CONSTRAINT FK_authors_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE categories (
	category_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	descripton varchar(512),
	fk_category_id int,

	CONSTRAINT PK_categories_category_id PRIMARY KEY(category_id),
	CONSTRAINT FK_categories_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
);

CREATE TABLE tags (
	tag_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),

	CONSTRAINT PK_tags_tag_id PRIMARY KEY(tag_id)
);

CREATE TABLE news (
	news_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),
	create_at varchar(512),
	fk_author_id int,
	fk_category_id int,
	tags int[],
	body text,
	main_img text,
	other_imgs text[],

	CONSTRAINT PK_news_news_id PRIMARY KEY(news_id),
	CONSTRAINT FK_news_author_id FOREIGN KEY(fk_author_id) REFERENCES authors(author_id) NOT NULL,
	CONSTRAINT FK_news_category_id FOREIGN KEY(fk_category_id) REFERENCES catagories(catagory_id),
	CONSTRAINT FK_news_comments FOREIGN KEY(fk_comments) REFERENCES news_comments(author_id) NOT NULL
);

CREATE TABLE news_comments (
	comment_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),
	create_at varchar(512),
	fk_user_id varchar(512),
	body text,

	CONSTRAINT PK_news_comments_comment_id PRIMARY KEY(comment_id),
	CONSTRAINT FK_news_comments_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE drafts (
	draft_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	create_at Ttimestamp with time zone DEFAULT NOW(),
	updated_at timestamp with time zone,
	fk_user_id varchar(512),
	body text,

	CONSTRAINT PK_drafts_draft_id PRIMARY KEY(draft_id)
);
