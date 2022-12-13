DROP TABLE IF EXISTS news_comments;
DROP TABLE IF EXISTS news_tags;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS drafts;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;

CREATE TABLE users (
	user_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	first_name varchar(128) NOT NULL,
	last_name varchar(128),
	avatar varchar(128),
	login varchar(128) NOT NULL UNIQUE,
	password text NOT NULL,
	create_at timestamp with time zone DEFAULT NOW(),
	admin boolean NOT NULL DEFAULT false,

	CONSTRAINT PK_users_user_id PRIMARY KEY(user_id)
);

CREATE TABLE authors (
	author_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	fk_user_id int NOT NULL,
	description varchar(512),

	CONSTRAINT PK_authors_author_id PRIMARY KEY(author_id),
	CONSTRAINT FK_authors_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE categories (
	category_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	description varchar(512) NOT NULL,
	fk_category_id int,

	CONSTRAINT PK_categories_category_id PRIMARY KEY(category_id),
	CONSTRAINT FK_categories_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
);

CREATE TABLE tags (
	tag_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),

	CONSTRAINT PK_tags_tag_id PRIMARY KEY(tag_id)
);

CREATE TABLE drafts (
	draft_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	create_at timestamp with time zone DEFAULT NOW(),
	updated_at timestamp with time zone,
	fk_user_id int,
	body text,

	CONSTRAINT PK_drafts_draft_id PRIMARY KEY(draft_id),
	CONSTRAINT FK_drafts_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE news (
	news_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),
	create_at timestamp with time zone DEFAULT NOW(),
	fk_author_id int NOT NULL,
	fk_category_id int,
	tags varchar(256)[],
	body text,
	main_img text,
	other_imgs text[],
	comments text[],
	fk_draft_id int,

	CONSTRAINT PK_news_news_id PRIMARY KEY(news_id),
	CONSTRAINT FK_news_author_id FOREIGN KEY(fk_author_id) REFERENCES authors(author_id),
	CONSTRAINT FK_news_category_id FOREIGN KEY(fk_category_id) REFERENCES categories(category_id),
	CONSTRAINT FK_news_draft_id FOREIGN KEY(fk_draft_id) REFERENCES drafts(draft_id)
);

CREATE TABLE comments (
	comment_id int GENERATED ALWAYS AS IDENTITY NOT NULL,
	title varchar(512),
	create_at timestamp with time zone DEFAULT NOW(),
	fk_user_id int,
	body text,

	CONSTRAINT PK_comments_comment_id PRIMARY KEY(comment_id),
	CONSTRAINT FK_comments_user_id FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE news_tags (
	fk_news_id int,
	fk_tag_id int,

	CONSTRAINT PK_news_tags_id PRIMARY KEY(fk_news_id, fk_tag_id),
	CONSTRAINT FK_news_tags_news_id FOREIGN KEY(fk_news_id) REFERENCES news(news_id),
	CONSTRAINT FK_news_tags_tag_id FOREIGN KEY(fk_tag_id) REFERENCES tags(tag_id)
);

CREATE TABLE news_comments (
	fk_comment_id int,
	fk_news_id int,

	CONSTRAINT PK_news_comments_id PRIMARY KEY(fk_comment_id, fk_news_id),
	CONSTRAINT FK_news_comments_comment_id FOREIGN KEY(fk_comment_id) REFERENCES comments(comment_id),
	CONSTRAINT FK_news_comments_news_id FOREIGN KEY(fk_news_id) REFERENCES news(news_id)
);
