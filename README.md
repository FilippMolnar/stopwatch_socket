# Connect4 - TU Delft edition
Connect four is a simple web browser 2-player online game built for the web assignment of CSE1500 at TU Delft

## Run the app on localhost
```sh
npm install
npm start
```

## Run the app on internal ip
- all computers connected to the same WiFi network can access the game
1. For running on the machine only, specify nothing -> localhost
2. For exposing the server on the local network -> 0.0.0.0
3. Get the internal ip of the PC it's running on

```bat
(WINDOWS) ipconfig
OUTPUT: Wireless LAN adapter Wi-Fi: 
                IPv4 address: <internal_ip>
                ...
```
```sh
(UNIX) hostname -I
```
4. Open the browser and type in "http://<internal_ip>:<port>"

## Assets
Got the inspiration from [https://avatars.dicebear.com/]