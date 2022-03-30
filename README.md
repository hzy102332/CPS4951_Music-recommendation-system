# CPS4951_Music-recommendation-system
### Project Description
The core functionality of this system is to implement the precise music
recommendation by interacting with real-time data from users. Firstly, users of
the system will wear the T-Wristband smart bracelet, which measures the user's
heart rate, location and other data in real time through an embedded program. At
the same time, the client on the cell phone forms an information transmission
chain with the bracelet via Bluetooth. This software can generate a music song
list for the client in real time that matches the current environment through a
sophisticated recommendation algorithm, and transmit it back to the client's
bracelet to provide reference information. The formation of efficient and real-time
information communication between the user's bracelet and the software is an
important technical difficulty of this software.

# Module Description

### AppUI
This is our mobile app user interface.

### T-Wirstband-PROJECT
This folder contains the programs installed in the **hardware** (wristband). It contains the module code to obtain the user's heartbeat data and the code to communicate with the phone app through Bluetooth.

### bluetooth—demo
This folder is written in HTML code for bluetooth data communication between mobile phone and wristband. We used **HbuilderX** to package the folder directly to the phone.

### wangyi.py
This is a file based on the music labels selected by users and then crawls NetEase Cloud music

