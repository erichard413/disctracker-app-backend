CREATE TABLE discs (
    id TEXT PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    plastic TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    join_date TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
    image_url TEXT
);

CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users ON DELETE SET NULL,
    disc_id TEXT REFERENCES discs ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    date TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT,
    note VARCHAR(255)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    holes INTEGER
);