# roblox-earrape-detector
 Roblox "ear rape" detector API written in Node.JS

# Disclaimer

*I don't know what the fuck I'm doing.*

# Usage & Installation 

You need Ffmpeg installed & added to PATH to use this. Only tested on Ubuntu 18.04.

Clone this repository somewhere on your computer or server.

Open a terminal and change the directory to the folder you downloaded.

``npm i``

``node app``

If you are running this on a server 24/7, you might want to consider using PM2 to run it(automatically restarts it if it crashes).

# API

GET `/audio/level/:id`

**Successful response example**

```
Status Code: 200

{
    "processingTime": "2s",
    "audioLevel": "-7.3 dB",
    "isEarRape": true
}
```

**Error response example**

```
Status code: 400

{ 
    error: "Failed to process audio!" 
}
```

