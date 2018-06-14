Voice Computer Control

prerekvizity:
1. nainstalovany node aspon 8.0
2. nainstalovany electron v global mode
(ak nejde nainstalovat, skusit `sudo npm install -g electron --unsafe-perm=true --allow-root`)
3. ubuntu pre zobrazenie TRAY ICON: `sudo apt-get install libappindicator1` 

Automaticke spustenie client appky pri starte:
1. Windows
  - spustenie consolovej aplikacie pri starte s moznostou zobrazenia consoloveho vypisu
    - start.bat subor pre spustenie client.js
    - pridat register do "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/start.bat"
    - aby sa dal skryt cmd do tray, stiahnut appku RBtray a pridat ju do registrov pri sputeni      "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/RBtray.exe"
  - spustenie aplikacie s TRAY ikonkou a GUI ovladanim
    - start.bat subor pre spustenie main.js cez electron
    - .vbs file pre spustenie commandline bez zobrazenia pouzivatelovi
    - pridat register do "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/start.vbs"
2. Linux
3. Mac

Prihlasovanie:
 1. desktop aplikacia: 
   - pri prvom spusteni je pouzivatel vyzvany k zadaniu emailovej adresi k Amazon uctu
   - otvori sa mu webstranka so zadanim prihlasovacich udajov Amazonu / alebo si ju otvori manualne (konzola mu vypise adresu)
 2. Amazon zariadenie
   - pri prvom pouziti Alexa skillu Computer Control je pouzivatelovi oznamene, ze sa pouziva Account Linking a musi sa prihlasit na webstranke alexa.amazon.sk (na tejto stranke je zoznam pouzitych hlasovych prikazov, najdem prikaz s nazvom Computer Control a v nom zvolim `Link Account` -> zadam prihlasovacie udaje do Amazon uctu)

Zmena adresy server:
Ak sa zmenila adresa servera, je potrebne zmenit ju na troch miestach:
- na serveri v subore oauth.json
- na clientovi v subore client.js premennu serverURL
- developer.amazon.com -> app & services -> Login with amazon -> web settings -> Allowed Return URLs (.../connect/amazon/callback)
