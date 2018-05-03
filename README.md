Voice Computer Control

prerekvizity:
1. nainstalovany node aspon 8.0
2. nainstalovany electron v global mode
(ak nejde nainstalovat, skusit `sudo npm install -g electron --unsafe-perm=true --allow-root`)

Automaticke spustenie client appky pri starte:
1. Windows
  a) spustenie consolovej aplikacie pri starte s moznostou zobrazenia consoloveho vypisu
    - start.bat subor pre spustenie client.js
    - pridat register do "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/start.bat"
    - aby sa dal skryt cmd do tray, stiahnut appku RBtray a pridat ju do registrov pri sputeni      "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/RBtray.exe"
   b) spustenie aplikacie s TRAY ikonkou a GUI ovladanim
    - start.bat subor pre spustenie main.js cez electron
    - .vbs file pre spustenie commandline bez zobrazenia pouzivatelovi
    - pridat register do "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/start.vbs"
2. Linux
3. Mac

Zmena adresy server:
Ak sa zmenila adresa servera, je potrebne zmenit ju na troch miestach:
- na servery v subore oauth.json
- na clientovy v subore client.js premennu serverURL
- developer.amazon.com -> app & services -> Login with amazon -> web settings -> Allowed Return URLs (.../connect/amazon/callback)
