CREATE TABLE IF NOT EXISTS car_make (
  id          BIGSERIAL PRIMARY KEY,
  ext_id      TEXT,
  name        TEXT NOT NULL UNIQUE,
  is_popular  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS car_model (
  id          BIGSERIAL PRIMARY KEY,
  make_id     BIGINT NOT NULL REFERENCES car_make(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  first_year  INT,
  last_year   INT,
  UNIQUE (make_id, name)
);

CREATE TABLE IF NOT EXISTS app_user (
  id          BIGSERIAL PRIMARY KEY,
  phone       TEXT UNIQUE,
  name        TEXT
);

CREATE TABLE IF NOT EXISTS user_vehicle (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  make_id     BIGINT NOT NULL REFERENCES car_make(id),
  model_id    BIGINT NOT NULL REFERENCES car_model(id),
  year        INT,
  vin         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Уникальность идентичной машины у одного пользователя
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_vehicle_identity
  ON user_vehicle(user_id, make_id, model_id, year, vin) NULLS NOT DISTINCT;
