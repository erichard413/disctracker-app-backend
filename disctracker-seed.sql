-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin, image_url)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'erik@erikrichard.com',
        CURRENT_TIMESTAMP,
        FALSE,
        null),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'erik@erikrichard.com',
        CURRENT_TIMESTAMP,
        TRUE,
        null);
