-- all users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin, is_super_admin, image_url)
VALUES ('erik',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Erik',
        'Richard',
        'erichard413@yahoo.com',
        CURRENT_TIMESTAMP,
        FALSE,
        FALSE,
        null),
       ('erikadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Erik',
        'Richard',
        'erichard413@outlook.com',
        CURRENT_TIMESTAMP,
        TRUE,
        FALSE,
        null),
       ('eriksuperadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Erik',
        'Richard',
        'erichard413@gmail.com',
        CURRENT_TIMESTAMP,
        TRUE,
        TRUE,
        null)
