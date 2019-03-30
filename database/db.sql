CREATE TABLE room
(
    room_id     SERIAL PRIMARY KEY,
    room_name   VARCHAR(250) NOT NULL
);

CREATE TABLE host
(
    host_id     SERIAL PRIMARY KEY,
    host_name   VARCHAR(250) NOT NULL,
    room_id     INT REFERENCES room(room_id)
);
