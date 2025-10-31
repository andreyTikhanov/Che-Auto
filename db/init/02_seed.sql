BEGIN;

INSERT INTO car_make (name, is_popular) VALUES
 ('Toyota',true), ('Volkswagen',true), ('BMW',true), ('Mercedes-Benz',true), ('Audi',true),
 ('Škoda',true), ('Kia',true), ('Hyundai',true), ('Nissan',true), ('Ford',true),
 ('Renault',true), ('Lada',true), ('Mazda',true), ('Volvo',true), ('Peugeot',true),
 ('Citroën',true), ('Opel',true), ('Honda',true), ('Mitsubishi',true), ('Subaru',true),
 ('Tesla',true), ('Porsche',true), ('Land Rover',true), ('Jeep',true), ('Chevrolet',true),
 ('Suzuki',true), ('Fiat',true), ('Alfa Romeo',true), ('SEAT',true), ('Dacia',true),
 ('Infiniti',true), ('Lexus',true), ('Jaguar',true), ('MINI',true), ('Genesis',true),
 ('Chery',true), ('Haval',true), ('Geely',true), ('BYD',true), ('GWM',true), ('UAZ',true)
ON CONFLICT DO NOTHING;

WITH m AS (SELECT id, name FROM car_make),
data(make, model) AS (
  VALUES
  ('Toyota','Camry'), ('Toyota','Corolla'), ('Toyota','RAV4'), ('Toyota','Highlander'), ('Toyota','Yaris'),
  ('Volkswagen','Golf'), ('Volkswagen','Passat'), ('Volkswagen','Tiguan'), ('Volkswagen','Polo'), ('Volkswagen','T-Roc'),
  ('BMW','1 Series'), ('BMW','3 Series'), ('BMW','5 Series'), ('BMW','X3'), ('BMW','X5'),
  ('Mercedes-Benz','A-Class'), ('Mercedes-Benz','C-Class'), ('Mercedes-Benz','E-Class'), ('Mercedes-Benz','GLC'), ('Mercedes-Benz','GLE'),
  ('Audi','A3'), ('Audi','A4'), ('Audi','A6'), ('Audi','Q3'), ('Audi','Q5'),
  ('Škoda','Octavia'), ('Škoda','Superb'), ('Škoda','Kodiaq'), ('Škoda','Karoq'), ('Škoda','Fabia'),
  ('Kia','Rio'), ('Kia','Ceed'), ('Kia','Sportage'), ('Kia','Sorento'), ('Kia','Cerato'),
  ('Hyundai','Elantra'), ('Hyundai','Tucson'), ('Hyundai','Santa Fe'), ('Hyundai','i30'), ('Hyundai','Solaris'),
  ('Nissan','Qashqai'), ('Nissan','X-Trail'), ('Nissan','Juke'), ('Nissan','Almera'), ('Nissan','Murano'),
  ('Ford','Focus'), ('Ford','Fiesta'), ('Ford','Mondeo'), ('Ford','Kuga'), ('Ford','Explorer'),
  ('Renault','Duster'), ('Renault','Megane'), ('Renault','Clio'), ('Renault','Captur'), ('Renault','Logan'),
  ('Lada','Vesta'), ('Lada','Granta'), ('Lada','XRay'), ('Lada','Largus'), ('Lada','Niva'),
  ('Mazda','3'), ('Mazda','6'), ('Mazda','CX-5'), ('Mazda','CX-30'), ('Mazda','CX-9'),
  ('Volvo','S60'), ('Volvo','XC40'), ('Volvo','XC60'), ('Volvo','XC90'), ('Volvo','V60'),
  ('Peugeot','208'), ('Peugeot','308'), ('Peugeot','3008'), ('Peugeot','508'), ('Peugeot','2008'),
  ('Citroën','C3'), ('Citroën','C4'), ('Citroën','C5 Aircross'), ('Citroën','Berlingo'), ('Citroën','C-Elysée'),
  ('Opel','Astra'), ('Opel','Corsa'), ('Opel','Insignia'), ('Opel','Mokka'), ('Opel','Grandland'),
  ('Honda','Civic'), ('Honda','Accord'), ('Honda','CR-V'), ('Honda','HR-V'), ('Honda','Jazz'),
  ('Mitsubishi','Outlander'), ('Mitsubishi','ASX'), ('Mitsubishi','Lancer'), ('Mitsubishi','Eclipse Cross'), ('Mitsubishi','Pajero'),
  ('Subaru','Forester'), ('Subaru','Outback'), ('Subaru','XV'), ('Subaru','Impreza'), ('Subaru','Legacy'),
  ('Tesla','Model 3'), ('Tesla','Model Y'), ('Tesla','Model S'), ('Tesla','Model X'),
  ('Porsche','911'), ('Porsche','Cayenne'), ('Porsche','Macan'), ('Porsche','Panamera'),
  ('Land Rover','Range Rover'), ('Land Rover','Discovery'), ('Land Rover','Range Rover Evoque'), ('Land Rover','Defender'),
  ('Jeep','Grand Cherokee'), ('Jeep','Cherokee'), ('Jeep','Renegade'), ('Jeep','Wrangler'), ('Jeep','Compass'),
  ('Chevrolet','Cruze'), ('Chevrolet','Spark'), ('Chevrolet','Malibu'), ('Chevrolet','Captiva'), ('Chevrolet','Tahoe'),
  ('Suzuki','Vitara'), ('Suzuki','Swift'), ('Suzuki','SX4'), ('Suzuki','Jimny'), ('Suzuki','Baleno'),
  ('Fiat','500'), ('Fiat','Tipo'), ('Fiat','Panda'), ('Fiat','500X'), ('Fiat','Doblo'),
  ('Alfa Romeo','Giulia'), ('Alfa Romeo','Stelvio'), ('Alfa Romeo','Giulietta'), ('Alfa Romeo','Tonale'),
  ('SEAT','Leon'), ('SEAT','Ibiza'), ('SEAT','Ateca'), ('SEAT','Arona'), ('SEAT','Tarraco'),
  ('Dacia','Duster'), ('Dacia','Sandero'), ('Dacia','Logan'), ('Dacia','Jogger'), ('Dacia','Spring'),
  ('Infiniti','Q50'), ('Infiniti','QX50'), ('Infiniti','QX60'), ('Infiniti','Q30'),
  ('Lexus','RX'), ('Lexus','NX'), ('Lexus','ES'), ('Lexus','IS'), ('Lexus','UX'),
  ('Jaguar','XE'), ('Jaguar','XF'), ('Jaguar','F-Pace'), ('Jaguar','E-Pace'), ('Jaguar','F-Type'),
  ('MINI','Cooper'), ('MINI','Countryman'), ('MINI','Clubman'), ('MINI','Cabrio'),
  ('Genesis','G70'), ('Genesis','G80'), ('Genesis','GV70'), ('Genesis','GV80'),
  ('Chery','Tiggo 4'), ('Chery','Tiggo 7'), ('Chery','Tiggo 8'), ('Chery','Arrizo 7'),
  ('Haval','F7'), ('Haval','H6'), ('Haval','Jolion'), ('Haval','Dargo'),
  ('Geely','Coolray'), ('Geely','Atlas'), ('Geely','Tugella'), ('Geely','Emgrand'),
  ('BYD','Han'), ('BYD','Tang'), ('BYD','Atto 3'), ('BYD','Dolphin'),
  ('GWM','Poer'), ('GWM','Tank 300'),
  ('UAZ','Patriot'), ('UAZ','Hunter')
)
INSERT INTO car_model (make_id, name)
SELECT m.id, d.model
FROM data d
JOIN m ON m.name = d.make
ON CONFLICT (make_id, name) DO NOTHING;

COMMIT;
