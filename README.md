Voice Computer Control

Automaticke spustenie client appky pri starte:
1. Windows
  - start.bat subor pre spustenie client.js
  - pridat register do "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/start.bat"
  - aby sa dal skryt cmd do tray, stiahnut appku RBtray a pridat ju do registrov pri sputeni "HKLM\Software\Microsoft\Windows\Current controll set\Run\" String key s value "path/to/RBtray.exe"
2. Linux
3. Mac

Zmena adresy server:
Ak sa zmenila adresa servera, je potrebne zmenit ju na troch miestach:
- na servery v subore oauth.json
- na clientovy v subore client.js premennu serverURL
- developer.amazon.com -> app & services -> Login with amazon -> web settings -> Allowed Return URLs (.../connect/amazon/callback)
